import * as THREE from 'three';
import {
	COIN_SIZE,
	COIN_VALUE,
	COIN_MAGNET_RADIUS,
	COIN_MAGNET_SPEED,
	COIN_FLOAT_HEIGHT,
	COIN_LIFETIME,
	GROUND_LEVEL,
	COLOR_COIN,
} from '../utils/constants';

export class Coin {
	mesh: THREE.Mesh;
	isCollected: boolean = false;
	value: number;
	private lifetime: number = COIN_LIFETIME;
	private material: THREE.MeshStandardMaterial;

	constructor(scene: THREE.Scene, position: THREE.Vector3, value: number = COIN_VALUE) {
		this.value = value;

		const geo = new THREE.OctahedronGeometry(COIN_SIZE, 0);
		this.material = new THREE.MeshStandardMaterial({
			color: COLOR_COIN,
			emissive: COLOR_COIN,
			emissiveIntensity: 0.4,
			roughness: 0.2,
			metalness: 0.9,
		});

		this.mesh = new THREE.Mesh(geo, this.material);
		this.mesh.position.copy(position);
		this.mesh.position.y = GROUND_LEVEL + COIN_FLOAT_HEIGHT;
		scene.add(this.mesh);
	}

	update(dt: number, playerPosition: THREE.Vector3): boolean {
		if (this.isCollected) return false;

		this.lifetime -= dt;
		if (this.lifetime <= 0) {
			this.isCollected = true;
			return false;
		}

		// Spinning animation
		this.mesh.rotation.y += dt * 3;
		// Bobbing animation
		this.mesh.position.y = GROUND_LEVEL + COIN_FLOAT_HEIGHT + Math.sin(Date.now() * 0.003) * 0.15;

		// Magnet effect
		const dist = this.mesh.position.distanceTo(playerPosition);
		if (dist < COIN_MAGNET_RADIUS) {
			const direction = playerPosition.clone().sub(this.mesh.position).normalize();
			const pullSpeed = COIN_MAGNET_SPEED * (1 - dist / COIN_MAGNET_RADIUS);
			this.mesh.position.add(direction.multiplyScalar(pullSpeed * dt));

			// Pick up if close enough
			if (dist < 1.0) {
				this.isCollected = true;
				return true; // signal: collected
			}
		}

		// Fade when about to despawn
		if (this.lifetime < 3) {
			this.material.opacity = this.lifetime / 3;
			this.material.transparent = true;
		}

		return false;
	}

	dispose(scene: THREE.Scene): void {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.material.dispose();
	}
}
