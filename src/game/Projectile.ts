import * as THREE from 'three';
import {
	PROJECTILE_SPEED,
	PROJECTILE_LENGTH,
	PROJECTILE_RADIUS,
	COLOR_PROJECTILE,
	COLOR_PROJECTILE_EMISSIVE,
} from '../utils/constants';
import type { Cube } from './Cube';

const projectileGeo = new THREE.CylinderGeometry(
	PROJECTILE_RADIUS,
	PROJECTILE_RADIUS,
	PROJECTILE_LENGTH,
	6,
);
projectileGeo.rotateX(Math.PI / 2);

const projectileMat = new THREE.MeshStandardMaterial({
	color: COLOR_PROJECTILE,
	emissive: COLOR_PROJECTILE_EMISSIVE,
	emissiveIntensity: 2.0,
	roughness: 0.1,
	metalness: 0.5,
});

export class Projectile {
	mesh: THREE.Mesh;
	direction: THREE.Vector3;
	speed: number = PROJECTILE_SPEED;
	damage: number;
	alive: boolean = true;
	distanceTraveled: number = 0;
	maxDistance: number;

	private light: THREE.PointLight;

	constructor(
		scene: THREE.Scene,
		origin: THREE.Vector3,
		direction: THREE.Vector3,
		damage: number,
		maxDistance: number,
	) {
		this.direction = direction.clone().normalize();
		this.damage = damage;
		this.maxDistance = maxDistance;

		this.mesh = new THREE.Mesh(projectileGeo, projectileMat);
		this.mesh.position.copy(origin);
		this.mesh.lookAt(origin.clone().add(this.direction));
		scene.add(this.mesh);

		// Small red glow around the projectile
		this.light = new THREE.PointLight(0xff2020, 1.5, 8);
		this.light.position.copy(origin);
		scene.add(this.light);
	}

	update(dt: number, cubes: Cube[]): Cube | null {
		if (!this.alive) return null;

		const step = this.direction.clone().multiplyScalar(this.speed * dt);
		this.mesh.position.add(step);
		this.light.position.copy(this.mesh.position);
		this.distanceTraveled += step.length();

		// Check max distance
		if (this.distanceTraveled >= this.maxDistance) {
			this.alive = false;
			return null;
		}

		// Check collision with cubes
		for (const cube of cubes) {
			if (!cube.isAlive) continue;
			const dist = this.mesh.position.distanceTo(cube.mesh.position);
			if (dist < 0.8) {
				cube.takeDamage(this.damage);
				this.alive = false;
				return cube;
			}
		}

		return null;
	}

	dispose(scene: THREE.Scene): void {
		scene.remove(this.mesh);
		scene.remove(this.light);
	}
}
