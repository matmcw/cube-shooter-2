import * as THREE from 'three';
import {
	FIRE_RATE,
	WEAPON_DAMAGE,
	WEAPON_RANGE,
	COLOR_MUZZLE_FLASH,
} from '../utils/constants';
import type { Player } from './Player';
import type { Cube } from './Cube';

export interface HitResult {
	cube: Cube;
	point: THREE.Vector3;
}

export class Weapon {
	damage: number = WEAPON_DAMAGE;
	fireRate: number = FIRE_RATE;
	range: number = WEAPON_RANGE;

	private timeSinceLastShot: number = 0;
	private raycaster: THREE.Raycaster = new THREE.Raycaster();
	private muzzleFlashLine: THREE.Line | null = null;
	private flashTimer: number = 0;

	onHit: ((result: HitResult) => void) | null = null;
	onMiss: (() => void) | null = null;

	constructor(private scene: THREE.Scene) {}

	update(dt: number, player: Player, cubes: Cube[]): void {
		this.timeSinceLastShot += dt;

		// Auto-fire
		if (player.isAlive && this.timeSinceLastShot >= this.fireRate) {
			this.timeSinceLastShot = 0;
			this.fire(player, cubes);
		}

		// Flash fade
		if (this.muzzleFlashLine) {
			this.flashTimer -= dt;
			if (this.flashTimer <= 0) {
				this.scene.remove(this.muzzleFlashLine);
				this.muzzleFlashLine.geometry.dispose();
				(this.muzzleFlashLine.material as THREE.Material).dispose();
				this.muzzleFlashLine = null;
			}
		}
	}

	private fire(player: Player, cubes: Cube[]): void {
		const origin = player.camera.position.clone();
		const direction = player.forward;

		this.raycaster.set(origin, direction);
		this.raycaster.far = this.range;

		// Collect all cube meshes
		const cubeMeshes = cubes
			.filter((c) => c.isAlive)
			.map((c) => c.mesh);

		const intersects = this.raycaster.intersectObjects(cubeMeshes, false);

		if (intersects.length > 0) {
			const hit = intersects[0];
			const hitCube = cubes.find((c) => c.mesh === hit.object);
			if (hitCube) {
				this.showTracer(origin, hit.point);
				if (this.onHit) {
					this.onHit({ cube: hitCube, point: hit.point });
				}
				hitCube.takeDamage(this.damage);
			}
		} else {
			// Show tracer to max range
			const endPoint = origin.clone().add(direction.clone().multiplyScalar(this.range));
			this.showTracer(origin, endPoint);
			if (this.onMiss) {
				this.onMiss();
			}
		}
	}

	private showTracer(start: THREE.Vector3, end: THREE.Vector3): void {
		if (this.muzzleFlashLine) {
			this.scene.remove(this.muzzleFlashLine);
			this.muzzleFlashLine.geometry.dispose();
			(this.muzzleFlashLine.material as THREE.Material).dispose();
		}

		const points = [start, end];
		const geo = new THREE.BufferGeometry().setFromPoints(points);
		const mat = new THREE.LineBasicMaterial({
			color: COLOR_MUZZLE_FLASH,
			transparent: true,
			opacity: 0.6,
		});
		this.muzzleFlashLine = new THREE.Line(geo, mat);
		this.scene.add(this.muzzleFlashLine);
		this.flashTimer = 0.05;
	}

	reset(): void {
		this.timeSinceLastShot = 0;
		if (this.muzzleFlashLine) {
			this.scene.remove(this.muzzleFlashLine);
			this.muzzleFlashLine.geometry.dispose();
			(this.muzzleFlashLine.material as THREE.Material).dispose();
			this.muzzleFlashLine = null;
		}
	}
}
