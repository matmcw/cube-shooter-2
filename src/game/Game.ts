import * as THREE from 'three';
import { Player } from './Player';
import { Platform } from './Platform';
import { Weapon } from './Weapon';
import { Coin } from './Coin';
import { WaveManager } from './WaveManager';
import { HUD } from '../ui/HUD';
import { Shop, type Upgrade } from '../ui/Shop';
import { Menu } from '../ui/Menu';
import { PauseMenu } from '../ui/PauseMenu';
import {
	COLOR_SKY,
	PLAYER_MAX_HEALTH,
	FIRE_RATE,
	WEAPON_DAMAGE,
	PLAYER_SPEED,
	PLAYER_JUMP_FORCE,
	COIN_MAGNET_RADIUS,
	CUBE_CONTACT_DAMAGE,
} from '../utils/constants';

type GameState = 'title' | 'playing' | 'coin_collect' | 'shop' | 'dead' | 'paused';

export class Game {
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private player: Player;
	private platform: Platform;
	private weapon: Weapon;
	private waveManager: WaveManager;
	private hud: HUD;
	private shop: Shop;
	private menu: Menu;
	private pauseMenu: PauseMenu;
	private coins: Coin[] = [];
	private state: GameState = 'title';
	private clock: THREE.Clock;
	private appEl: HTMLElement;

	// Stat modifiers from upgrades
	private magnetRadius: number = COIN_MAGNET_RADIUS;
	private playerSpeedMult: number = 1;
	private playerJumpMult: number = 1;
	private totalCoinsEarned: number = 0;

	constructor(appEl: HTMLElement) {
		this.appEl = appEl;
		this.clock = new THREE.Clock();

		// Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setClearColor(COLOR_SKY);
		appEl.appendChild(this.renderer.domElement);

		// Scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(COLOR_SKY, 0.012);

		// Lighting
		this.setupLighting();

		// Platform
		this.platform = new Platform(this.scene);

		// Player
		this.player = new Player();
		this.player.setupPointerLock(this.renderer.domElement);
		this.scene.add(this.player.camera);

		// Weapon
		this.weapon = new Weapon(this.scene);
		this.weapon.attachGun(this.player.camera);
		this.weapon.onHit = () => {
			this.hud.showHitMarker();
		};

		// Wave Manager
		this.waveManager = new WaveManager(this.scene);
		this.waveManager.onWaveClear = () => {
			this.hud.updateWaveText(`Wave ${this.waveManager.waveNumber} Complete!`);
		};
		this.waveManager.onShopOpen = () => {
			this.openShop();
		};

		// UI
		this.hud = new HUD();
		this.hud.mount(appEl);
		this.hud.hide();

		this.shop = new Shop();
		this.shop.mount(appEl);
		this.shop.onPurchase = (upgrade) => this.handleUpgrade(upgrade);
		this.shop.onHeal = () => this.handleHeal();
		this.shop.onClose = () => this.closeShop();

		this.menu = new Menu();
		this.menu.mount(appEl);
		this.menu.onStart = () => this.startGame();
		this.menu.onRestart = () => this.restartGame();
		this.menu.showTitle();

		this.pauseMenu = new PauseMenu();
		this.pauseMenu.mount(appEl);
		this.pauseMenu.onResume = () => this.resumeGame();
		this.pauseMenu.onQuit = () => this.quitToMenu();

		// Escape key for pause
		document.addEventListener('keydown', (e) => {
			if (e.code === 'Escape') {
				if (this.state === 'playing') {
					this.pauseGame();
				} else if (this.state === 'paused') {
					this.resumeGame();
				}
			}
		});

		// Resize handler
		window.addEventListener('resize', () => this.handleResize());

		// Start loop
		this.animate();
	}

	private setupLighting(): void {
		// Ambient light for base visibility
		const ambient = new THREE.AmbientLight(0x404060, 0.6);
		this.scene.add(ambient);

		// Hemisphere light for sky/ground coloring
		const hemi = new THREE.HemisphereLight(0x4466aa, 0x223344, 0.5);
		this.scene.add(hemi);

		// Main directional light (sun-like)
		const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
		dirLight.position.set(20, 30, 10);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.near = 0.5;
		dirLight.shadow.camera.far = 100;
		dirLight.shadow.camera.left = -40;
		dirLight.shadow.camera.right = 40;
		dirLight.shadow.camera.top = 40;
		dirLight.shadow.camera.bottom = -40;
		this.scene.add(dirLight);

		// Accent point light under the platform for sci-fi glow
		const underGlow = new THREE.PointLight(0x4ecca3, 0.8, 50);
		underGlow.position.set(0, -5, 0);
		this.scene.add(underGlow);
	}

	private startGame(): void {
		this.menu.hideTitle();
		this.hud.show();
		this.player.reset();
		this.waveManager.reset();
		this.shop.reset();
		this.weapon.reset();
		this.clearCoins();
		this.resetUpgradeStats();
		this.totalCoinsEarned = 0;
		this.state = 'playing';
		this.waveManager.startNextWave();
		this.menu.announceWave(1);
	}

	private restartGame(): void {
		this.menu.hideDeath();
		this.startGame();
	}

	private openShop(): void {
		this.state = 'shop';
		this.shop.show(this.player.coins, this.player.health, this.player.maxHealth);
		document.exitPointerLock();
	}

	private closeShop(): void {
		this.shop.hide();
		this.state = 'playing';
		this.waveManager.closeShop();
		this.menu.announceWave(this.waveManager.waveNumber);
	}

	private pauseGame(): void {
		this.state = 'paused';
		this.pauseMenu.show();
		this.hud.hide();
		document.exitPointerLock();
		this.clock.stop();
	}

	private resumeGame(): void {
		this.pauseMenu.hide();
		this.hud.show();
		this.state = 'playing';
		this.clock.start();
	}

	private quitToMenu(): void {
		this.pauseMenu.hide();
		this.hud.hide();
		this.waveManager.reset();
		this.weapon.reset();
		this.clearCoins();
		this.state = 'title';
		this.menu.showTitle();
		this.clock.start();
	}

	private handleUpgrade(upgrade: Upgrade): void {
		const cost = this.shop.getUpgradeCost({
			...upgrade,
			currentLevel: upgrade.currentLevel - 1,
		});

		if (this.player.coins < cost) {
			upgrade.currentLevel--;
			return;
		}

		this.player.coins -= cost;

		switch (upgrade.id) {
			case 'fire_rate':
				this.weapon.fireRate = FIRE_RATE * Math.pow(0.88, upgrade.currentLevel);
				break;
			case 'damage':
				this.weapon.damage = WEAPON_DAMAGE * (1 + upgrade.currentLevel * 0.25);
				break;
			case 'max_health':
				const oldMax = this.player.maxHealth;
				this.player.maxHealth = PLAYER_MAX_HEALTH + upgrade.currentLevel * 20;
				this.player.health += this.player.maxHealth - oldMax;
				break;
			case 'magnet':
				this.magnetRadius = COIN_MAGNET_RADIUS * (1 + upgrade.currentLevel * 0.3);
				break;
			case 'move_speed':
				this.playerSpeedMult = 1 + upgrade.currentLevel * 0.12;
				break;
			case 'jump_force':
				this.playerJumpMult = 1 + upgrade.currentLevel * 0.15;
				break;
		}

		// Re-render shop with updated coins/health
		this.shop.show(this.player.coins, this.player.health, this.player.maxHealth);
	}

	private handleHeal(): void {
		const cost = this.shop.getHealCost();
		if (this.player.coins < cost || this.player.health >= this.player.maxHealth) return;

		this.player.coins -= cost;
		this.player.health = this.player.maxHealth;
		this.shop.show(this.player.coins, this.player.health, this.player.maxHealth);
	}

	private resetUpgradeStats(): void {
		this.magnetRadius = COIN_MAGNET_RADIUS;
		this.playerSpeedMult = 1;
		this.playerJumpMult = 1;
		this.weapon.damage = WEAPON_DAMAGE;
		this.weapon.fireRate = FIRE_RATE;
		this.player.maxHealth = PLAYER_MAX_HEALTH;
	}

	private clearCoins(): void {
		for (const coin of this.coins) {
			coin.dispose(this.scene);
		}
		this.coins = [];
	}

	private handleResize(): void {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.player.handleResize();
	}

	private animate = (): void => {
		requestAnimationFrame(this.animate);

		const dt = Math.min(this.clock.getDelta(), 0.05); // Cap delta to avoid physics explosions

		switch (this.state) {
			case 'title':
				break;

			case 'playing':
				this.updatePlaying(dt);
				break;

			case 'shop':
				// Scene still renders but nothing moves
				break;

			case 'coin_collect':
				this.updateCoinCollect(dt);
				break;

			case 'dead':
				break;

			case 'paused':
				break;
		}

		this.menu.update(dt);
		this.hud.update(dt);
		this.renderer.render(this.scene, this.player.camera);
	};

	private updatePlaying(dt: number): void {
		// Update player
		this.player.update(dt, this.platform);

		// Check player death
		if (!this.player.isAlive) {
			this.state = 'dead';
			this.menu.showDeath(
				this.player.getDeathReason(),
				this.waveManager.waveNumber,
				this.totalCoinsEarned,
			);
			this.hud.hide();
			document.exitPointerLock();
			return;
		}

		// Update wave manager
		this.waveManager.update(dt, this.player.position);

		// Update weapon (auto-fire)
		this.weapon.update(dt, this.player, this.waveManager.cubes);

		// Check cube-player collisions
		for (const cube of this.waveManager.cubes) {
			if (!cube.isAlive) continue;
			const dist = cube.distanceTo(this.player.position);
			if (dist < 1.2) {
				this.player.takeDamage(cube.contactDamage);
				cube.isAlive = false;
			}
		}

		// Process dead cubes -> spawn coins
		const deadCubes = this.waveManager.cleanupDeadCubes();
		for (const cube of deadCubes) {
			const coin = new Coin(this.scene, cube.mesh.position.clone(), cube.coinValue);
			this.coins.push(coin);
			cube.dispose(this.scene);
		}

		// Update coins
		const activeMagnetRadius = this.magnetRadius;
		this.coins = this.coins.filter((coin) => {
			// Temporarily override the magnet check by adjusting position check
			const playerPos = this.player.position;
			const dist = coin.mesh.position.distanceTo(playerPos);

			// Use our upgraded magnet radius
			if (dist < activeMagnetRadius) {
				const direction = playerPos.clone().sub(coin.mesh.position).normalize();
				const pullSpeed = 12 * (1 - dist / activeMagnetRadius);
				coin.mesh.position.add(direction.multiplyScalar(pullSpeed * dt));

				if (dist < 1.0) {
					this.player.addCoins(coin.value);
					this.totalCoinsEarned += coin.value;
					coin.dispose(this.scene);
					return false;
				}
			}

			// Still run the coin's own update for spinning/bobbing/lifetime
			const collected = coin.update(dt, new THREE.Vector3(0, -9999, 0)); // pass fake pos to avoid double magnet
			if (coin.isCollected) {
				if (collected) {
					this.player.addCoins(coin.value);
					this.totalCoinsEarned += coin.value;
				}
				coin.dispose(this.scene);
				return false;
			}
			return true;
		});

		// Update HUD
		this.hud.updateHealth(this.player.health, this.player.maxHealth);
		this.hud.updateCoins(this.player.coins);

		const state = this.waveManager.state;
		if (state === 'pre_wave') {
			this.hud.updateWaveText(`Wave ${this.waveManager.waveNumber} incoming...`);
		} else if (state === 'spawning' || state === 'active') {
			this.hud.updateWave(
				this.waveManager.waveNumber,
				this.waveManager.getRemainingCount(),
				this.waveManager.getTotalForWave(),
			);
		} else if (state === 'wave_clear') {
			this.hud.updateWaveText(`Wave ${this.waveManager.waveNumber} Complete!`);
		} else if (state === 'coin_collect') {
			this.state = 'coin_collect';
		}
	}

	private updateCoinCollect(dt: number): void {
		const playerPos = this.player.position;
		const collectSpeed = 40;

		this.coins = this.coins.filter((coin) => {
			const direction = playerPos.clone().sub(coin.mesh.position).normalize();
			coin.mesh.position.add(direction.multiplyScalar(collectSpeed * dt));
			coin.mesh.rotation.y += dt * 10;

			const dist = coin.mesh.position.distanceTo(playerPos);
			if (dist < 1.5) {
				this.player.addCoins(coin.value);
				this.totalCoinsEarned += coin.value;
				coin.dispose(this.scene);
				return false;
			}
			return true;
		});

		this.hud.updateCoins(this.player.coins);

		if (this.coins.length === 0) {
			this.waveManager.finishCoinCollect();
		}
	}
}
