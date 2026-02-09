import * as THREE from 'three';
import {
	FIRE_RATE,
	WEAPON_DAMAGE,
	WEAPON_RANGE,
} from '../utils/constants';
import type { Player } from './Player';
import type { Cube } from './Cube';
import { Projectile } from './Projectile';

export interface HitResult {
	cube: Cube;
	point: THREE.Vector3;
}

export class Weapon {
	damage: number = WEAPON_DAMAGE;
	fireRate: number = FIRE_RATE;
	range: number = WEAPON_RANGE;
	projectiles: Projectile[] = [];

	private timeSinceLastShot: number = 0;
	private scene: THREE.Scene;

	onHit: ((result: HitResult) => void) | null = null;

	constructor(scene: THREE.Scene) {
		this.scene = scene;
	}

	update(dt: number, player: Player, cubes: Cube[]): void {
		this.timeSinceLastShot += dt;

		// Fire when mouse is held and fire rate allows
		if (player.isAlive && player.mouseDown && this.timeSinceLastShot >= this.fireRate) {
			this.timeSinceLastShot = 0;
			this.fire(player);
		}

		// Update all active projectiles
		this.projectiles = this.projectiles.filter((proj) => {
			const hitCube = proj.update(dt, cubes);
			if (hitCube && this.onHit) {
				this.onHit({ cube: hitCube, point: proj.mesh.position.clone() });
			}
			if (!proj.alive) {
				proj.dispose(this.scene);
				return false;
			}
			return true;
		});
	}

	private fire(player: Player): void {
		// Offset origin slightly forward so the bolt doesn't clip the camera
		const origin = player.camera.position.clone()
			.add(player.forward.clone().multiplyScalar(0.5));

		const proj = new Projectile(
			this.scene,
			origin,
			player.forward,
			this.damage,
			this.range,
		);
		this.projectiles.push(proj);
	}

	reset(): void {
		this.timeSinceLastShot = 0;
		for (const proj of this.projectiles) {
			proj.dispose(this.scene);
		}
		this.projectiles = [];
	}
}
