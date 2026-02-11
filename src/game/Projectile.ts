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
	16,
);
projectileGeo.rotateX(Math.PI / 2);

const projectileMat = new THREE.MeshBasicMaterial({
	color: COLOR_PROJECTILE,
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
	private raycaster: THREE.Raycaster = new THREE.Raycaster();

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

		const prevPos = this.mesh.position.clone();
		const step = this.direction.clone().multiplyScalar(this.speed * dt);
		const stepLen = step.length();

		this.mesh.position.add(step);
		this.light.position.copy(this.mesh.position);
		this.distanceTraveled += stepLen;

		// Check max distance
		if (this.distanceTraveled >= this.maxDistance) {
			this.alive = false;
			return null;
		}

		// Swept ray collision: raycast from previous position along travel path
		const aliveCubes = cubes.filter((c) => c.isAlive);
		const cubeMeshes = aliveCubes.map((c) => c.mesh);

		this.raycaster.set(prevPos, this.direction);
		this.raycaster.near = 0;
		this.raycaster.far = stepLen;
		const hits = this.raycaster.intersectObjects(cubeMeshes, false);

		if (hits.length > 0) {
			const hitMesh = hits[0].object;
			const hitCube = aliveCubes.find((c) => c.mesh === hitMesh);
			if (hitCube) {
				hitCube.takeDamage(this.damage);
				this.alive = false;
				return hitCube;
			}
		}

		// Fallback: distance check for cases where projectile spawns inside a cube
		for (const cube of aliveCubes) {
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
