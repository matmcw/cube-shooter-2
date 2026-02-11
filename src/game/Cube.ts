import * as THREE from 'three';
import {
	CUBE_SIZE,
	CUBE_BASE_SPEED,
	CUBE_BASE_HEALTH,
	CUBE_CONTACT_DAMAGE,
	GROUND_LEVEL,
	PLATFORM_WIDTH,
	PLATFORM_DEPTH,
	COLOR_CUBE_BASE,
	COLOR_CUBE_JUMPER,
	COLOR_CUBE_ZIGZAG,
	COLOR_CUBE_TELEPORTER,
	COLOR_CUBE_TANK,
	COLOR_CUBE_CHARGER,
	COLOR_CUBE_HIT,
} from '../utils/constants';

export type CubeType = 'normal' | 'jumper' | 'zigzag' | 'teleporter' | 'tank' | 'charger';

interface TypeConfig {
	color: number;
	healthMult: number;
	speedMult: number;
	size: number;
}

const TYPE_CONFIGS: Record<CubeType, TypeConfig> = {
	normal:     { color: COLOR_CUBE_BASE,       healthMult: 1,   speedMult: 1,   size: 1 },
	jumper:     { color: COLOR_CUBE_JUMPER,      healthMult: 0.8, speedMult: 1,   size: 1 },
	zigzag:     { color: COLOR_CUBE_ZIGZAG,      healthMult: 0.7, speedMult: 1.3, size: 1 },
	teleporter: { color: COLOR_CUBE_TELEPORTER,  healthMult: 0.6, speedMult: 0.8, size: 1 },
	tank:       { color: COLOR_CUBE_TANK,        healthMult: 5,   speedMult: 0.5, size: 1.4 },
	charger:    { color: COLOR_CUBE_CHARGER,     healthMult: 1,   speedMult: 1,   size: 1 },
};

export class Cube {
	mesh: THREE.Mesh;
	type: CubeType;
	isAlive: boolean = true;
	health: number;
	maxHealth: number;
	speed: number;
	contactDamage: number;
	coinValue: number;

	private hitFlashTimer: number = 0;
	private originalColor: THREE.Color;
	private material: THREE.MeshStandardMaterial;
	private cubeSize: number;

	// Jumper state
	private jumpPhase: number = Math.random() * Math.PI * 2;

	// Zigzag state
	private zigzagAngle: number = Math.random() * Math.PI * 2;

	// Charger state
	private chargeTimer: number = 3 + Math.random();
	private isCharging: boolean = false;
	private chargeDirection: THREE.Vector3 = new THREE.Vector3();
	private chargeDistance: number = 0;

	constructor(
		scene: THREE.Scene,
		position: THREE.Vector3,
		healthMult: number = 1,
		speedMult: number = 1,
		type: CubeType = 'normal',
	) {
		this.type = type;
		const config = TYPE_CONFIGS[type];

		this.health = CUBE_BASE_HEALTH * healthMult * config.healthMult;
		this.maxHealth = this.health;
		this.speed = CUBE_BASE_SPEED * speedMult * config.speedMult;
		this.contactDamage = CUBE_CONTACT_DAMAGE;
		this.coinValue = Math.round(10 * healthMult * config.healthMult);
		this.cubeSize = CUBE_SIZE * config.size;

		const geo = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
		this.material = new THREE.MeshStandardMaterial({
			color: config.color,
			roughness: 0.4,
			metalness: 0.6,
			emissive: config.color,
			emissiveIntensity: 0.2,
		});
		this.originalColor = new THREE.Color(config.color);

		this.mesh = new THREE.Mesh(geo, this.material);
		this.mesh.position.copy(position);
		this.mesh.castShadow = true;
		scene.add(this.mesh);
	}

	takeDamage(amount: number): void {
		if (!this.isAlive) return;
		this.health -= amount;
		this.hitFlashTimer = 0.1;
		this.material.color.set(COLOR_CUBE_HIT);
		this.material.emissive.set(COLOR_CUBE_HIT);
		this.material.emissiveIntensity = 1.0;

		if (this.health <= 0) {
			this.health = 0;
			this.isAlive = false;
			return;
		}

		// Teleporter: blink to random nearby position when hit
		if (this.type === 'teleporter') {
			const angle = Math.random() * Math.PI * 2;
			const dist = 8 + Math.random() * 4;
			const newX = this.mesh.position.x + Math.cos(angle) * dist;
			const newZ = this.mesh.position.z + Math.sin(angle) * dist;
			const halfW = PLATFORM_WIDTH / 2 - 1;
			const halfD = PLATFORM_DEPTH / 2 - 1;
			this.mesh.position.x = Math.max(-halfW, Math.min(halfW, newX));
			this.mesh.position.z = Math.max(-halfD, Math.min(halfD, newZ));
		}
	}

	update(dt: number, playerPosition: THREE.Vector3): void {
		if (!this.isAlive) return;

		// Hit flash fade
		if (this.hitFlashTimer > 0) {
			this.hitFlashTimer -= dt;
			if (this.hitFlashTimer <= 0) {
				this.material.color.copy(this.originalColor);
				this.material.emissive.copy(this.originalColor);
				this.material.emissiveIntensity = 0.2;
			}
		}

		switch (this.type) {
			case 'normal':
			case 'teleporter':
			case 'tank':
				this.moveTowardPlayer(dt, playerPosition);
				break;
			case 'jumper':
				this.updateJumper(dt, playerPosition);
				break;
			case 'zigzag':
				this.updateZigzag(dt, playerPosition);
				break;
			case 'charger':
				this.updateCharger(dt, playerPosition);
				break;
		}
	}

	private moveTowardPlayer(dt: number, playerPosition: THREE.Vector3): void {
		const target = new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z);
		const direction = target.clone().sub(this.mesh.position).normalize();
		this.mesh.position.add(direction.multiplyScalar(this.speed * dt));

		this.mesh.position.y = GROUND_LEVEL + this.cubeSize / 2;
		this.mesh.lookAt(target);
		this.mesh.rotation.x += dt * 1.5;
		this.mesh.rotation.z += dt * 0.8;
	}

	private updateJumper(dt: number, playerPosition: THREE.Vector3): void {
		const target = new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z);
		const direction = target.clone().sub(this.mesh.position).normalize();
		this.mesh.position.add(direction.multiplyScalar(this.speed * dt));

		this.jumpPhase += dt * 6;
		const bounce = Math.abs(Math.sin(this.jumpPhase)) * 3;
		this.mesh.position.y = GROUND_LEVEL + this.cubeSize / 2 + bounce;

		this.mesh.lookAt(new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z));
		this.mesh.rotation.x += dt * 3;
	}

	private updateZigzag(dt: number, playerPosition: THREE.Vector3): void {
		const toPlayer = new THREE.Vector3(
			playerPosition.x - this.mesh.position.x,
			0,
			playerPosition.z - this.mesh.position.z,
		);
		const dist = toPlayer.length();
		if (dist < 0.1) return;
		const forward = toPlayer.clone().normalize();

		// Perpendicular strafe direction
		const strafe = new THREE.Vector3(-forward.z, 0, forward.x);

		this.zigzagAngle += dt * 8;
		const strafeAmount = Math.sin(this.zigzagAngle) * 2.5;
		const approachSpeed = this.speed * 0.6;

		const move = forward.multiplyScalar(approachSpeed * dt)
			.add(strafe.multiplyScalar(strafeAmount * dt * this.speed));
		this.mesh.position.add(move);

		this.mesh.position.y = GROUND_LEVEL + this.cubeSize / 2;
		this.mesh.lookAt(new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z));
		this.mesh.rotation.z += dt * 4;
	}

	private updateCharger(dt: number, playerPosition: THREE.Vector3): void {
		if (!this.isCharging) {
			// Aiming phase: sit still, face player, count down
			this.chargeTimer -= dt;
			const target = new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z);
			this.mesh.lookAt(target);
			this.mesh.position.y = GROUND_LEVEL + this.cubeSize / 2;

			if (this.chargeTimer <= 0) {
				this.isCharging = true;
				this.chargeDistance = 0;
				this.chargeDirection.set(
					playerPosition.x - this.mesh.position.x,
					0,
					playerPosition.z - this.mesh.position.z,
				).normalize();
			}
		} else {
			// Charging phase: dash in locked direction
			const chargeSpeed = CUBE_BASE_SPEED * 5;
			const step = this.chargeDirection.clone().multiplyScalar(chargeSpeed * dt);
			this.mesh.position.add(step);
			this.mesh.position.y = GROUND_LEVEL + this.cubeSize / 2;
			this.chargeDistance += step.length();

			this.mesh.rotation.x += dt * 10;

			// Stop after traveling far enough and re-aim
			if (this.chargeDistance >= 30) {
				this.isCharging = false;
				this.chargeTimer = 2 + Math.random();
				this.chargeDistance = 0;
			}
		}
	}

	distanceTo(position: THREE.Vector3): number {
		return this.mesh.position.distanceTo(position);
	}

	dispose(scene: THREE.Scene): void {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.material.dispose();
	}
}
