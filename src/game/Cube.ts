import * as THREE from 'three';
import {
	CUBE_SIZE,
	CUBE_BASE_SPEED,
	CUBE_BASE_HEALTH,
	CUBE_CONTACT_DAMAGE,
	GROUND_LEVEL,
	COLOR_CUBE_BASE,
	COLOR_CUBE_HIT,
} from '../utils/constants';

export class Cube {
	mesh: THREE.Mesh;
	isAlive: boolean = true;
	health: number;
	maxHealth: number;
	speed: number;
	contactDamage: number;
	coinValue: number;

	private hitFlashTimer: number = 0;
	private originalColor: THREE.Color;
	private material: THREE.MeshStandardMaterial;

	constructor(
		scene: THREE.Scene,
		position: THREE.Vector3,
		healthMult: number = 1,
		speedMult: number = 1,
	) {
		this.health = CUBE_BASE_HEALTH * healthMult;
		this.maxHealth = this.health;
		this.speed = CUBE_BASE_SPEED * speedMult;
		this.contactDamage = CUBE_CONTACT_DAMAGE;
		this.coinValue = Math.round(10 * healthMult);

		const geo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
		this.material = new THREE.MeshStandardMaterial({
			color: COLOR_CUBE_BASE,
			roughness: 0.4,
			metalness: 0.6,
			emissive: COLOR_CUBE_BASE,
			emissiveIntensity: 0.2,
		});
		this.originalColor = new THREE.Color(COLOR_CUBE_BASE);

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

		// Move toward player (XZ plane)
		const target = new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z);
		const direction = target.clone().sub(this.mesh.position).normalize();
		this.mesh.position.add(direction.multiplyScalar(this.speed * dt));

		// Keep at ground level
		this.mesh.position.y = GROUND_LEVEL + CUBE_SIZE / 2;

		// Rotate to face player
		this.mesh.lookAt(target);

		// Gentle bobbing rotation for visual flair
		this.mesh.rotation.x += dt * 1.5;
		this.mesh.rotation.z += dt * 0.8;
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
