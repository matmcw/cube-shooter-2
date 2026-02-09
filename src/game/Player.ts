import * as THREE from 'three';
import {
	PLAYER_HEIGHT,
	PLAYER_SPEED,
	PLAYER_JUMP_FORCE,
	PLAYER_MAX_HEALTH,
	PLAYER_START_Y,
	GRAVITY,
	GROUND_LEVEL,
} from '../utils/constants';
import { clamp } from '../utils/helpers';
import type { Platform } from './Platform';

export class Player {
	camera: THREE.PerspectiveCamera;
	health: number;
	maxHealth: number;
	coins: number;
	isAlive: boolean;

	private velocity: THREE.Vector3 = new THREE.Vector3();
	private onGround: boolean = false;
	private keys: Record<string, boolean> = {};
	private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
	private isLocked: boolean = false;
	private deathReason: string = '';

	constructor() {
		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.health = PLAYER_MAX_HEALTH;
		this.maxHealth = PLAYER_MAX_HEALTH;
		this.coins = 0;
		this.isAlive = true;

		this.resetPosition();
		this.setupInput();
	}

	resetPosition(): void {
		this.camera.position.set(0, PLAYER_START_Y, 0);
		this.velocity.set(0, 0, 0);
		this.euler.set(0, 0, 0);
		this.camera.rotation.set(0, 0, 0);
	}

	reset(): void {
		this.health = PLAYER_MAX_HEALTH;
		this.coins = 0;
		this.isAlive = true;
		this.deathReason = '';
		this.resetPosition();
	}

	get position(): THREE.Vector3 {
		return this.camera.position;
	}

	get forward(): THREE.Vector3 {
		const dir = new THREE.Vector3();
		this.camera.getWorldDirection(dir);
		return dir;
	}

	getDeathReason(): string {
		return this.deathReason;
	}

	setupPointerLock(canvas: HTMLCanvasElement): void {
		canvas.addEventListener('click', () => {
			if (!this.isLocked) {
				canvas.requestPointerLock();
			}
		});

		document.addEventListener('pointerlockchange', () => {
			this.isLocked = document.pointerLockElement === canvas;
		});

		document.addEventListener('mousemove', (e) => {
			if (!this.isLocked || !this.isAlive) return;

			const sensitivity = 0.002;
			this.euler.setFromQuaternion(this.camera.quaternion);
			this.euler.y -= e.movementX * sensitivity;
			this.euler.x -= e.movementY * sensitivity;
			this.euler.x = clamp(this.euler.x, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
			this.camera.quaternion.setFromEuler(this.euler);
		});
	}

	private setupInput(): void {
		document.addEventListener('keydown', (e) => {
			this.keys[e.code] = true;
		});
		document.addEventListener('keyup', (e) => {
			this.keys[e.code] = false;
		});
	}

	takeDamage(amount: number): void {
		if (!this.isAlive) return;
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.isAlive = false;
			this.deathReason = 'killed';
		}
	}

	addCoins(amount: number): void {
		this.coins += amount;
	}

	update(dt: number, platform: Platform): void {
		if (!this.isAlive) return;

		// Movement direction from WASD
		const moveDir = new THREE.Vector3();
		const forward = new THREE.Vector3();
		const right = new THREE.Vector3();

		this.camera.getWorldDirection(forward);
		forward.y = 0;
		forward.normalize();
		right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

		if (this.keys['KeyW']) moveDir.add(forward);
		if (this.keys['KeyS']) moveDir.sub(forward);
		if (this.keys['KeyD']) moveDir.add(right);
		if (this.keys['KeyA']) moveDir.sub(right);

		if (moveDir.lengthSq() > 0) {
			moveDir.normalize();
		}

		// Horizontal movement
		const speed = PLAYER_SPEED;
		this.velocity.x = moveDir.x * speed;
		this.velocity.z = moveDir.z * speed;

		// Jump
		if ((this.keys['Space']) && this.onGround) {
			this.velocity.y = PLAYER_JUMP_FORCE;
			this.onGround = false;
		}

		// Apply gravity
		this.velocity.y += GRAVITY * dt;

		// Update position
		const pos = this.camera.position;
		pos.x += this.velocity.x * dt;
		pos.y += this.velocity.y * dt;
		pos.z += this.velocity.z * dt;

		// Ground collision
		const feetY = pos.y - PLAYER_HEIGHT / 2;
		if (feetY <= GROUND_LEVEL && platform.isOnPlatform(pos.x, pos.z)) {
			pos.y = GROUND_LEVEL + PLAYER_HEIGHT / 2;
			this.velocity.y = 0;
			this.onGround = true;
		}

		// Fall off platform check
		if (pos.y < -30) {
			this.isAlive = false;
			this.deathReason = 'fell';
		}
	}

	handleResize(): void {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}
}
