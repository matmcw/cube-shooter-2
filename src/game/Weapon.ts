import * as THREE from 'three';
import {
	FIRE_RATE,
	WEAPON_DAMAGE,
	WEAPON_RANGE,
	GROUND_LEVEL,
} from '../utils/constants';
import type { Player } from './Player';
import type { Cube } from './Cube';
import { Projectile } from './Projectile';
import { GunModel } from './GunModel';

export interface HitResult {
	cube: Cube;
	point: THREE.Vector3;
}

export class Weapon {
	damage: number = WEAPON_DAMAGE;
	fireRate: number = FIRE_RATE;
	range: number = WEAPON_RANGE;
	projectiles: Projectile[] = [];
	gunModel: GunModel | null = null;

	private timeSinceLastShot: number = 0;
	private scene: THREE.Scene;
	private raycaster: THREE.Raycaster = new THREE.Raycaster();

	onHit: ((result: HitResult) => void) | null = null;

	constructor(scene: THREE.Scene) {
		this.scene = scene;
		this.raycaster.far = WEAPON_RANGE;
	}

	attachGun(camera: THREE.PerspectiveCamera): void {
		this.gunModel = new GunModel(camera);
	}

	update(dt: number, player: Player, cubes: Cube[]): void {
		this.timeSinceLastShot += dt;

		// Fire when mouse is held and fire rate allows
		if (player.isAlive && player.mouseDown && this.timeSinceLastShot >= this.fireRate) {
			this.timeSinceLastShot = 0;
			this.fire(player, cubes);
		}

		if (this.gunModel) {
			this.gunModel.update(dt);
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

	private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_LEVEL);

	private fire(player: Player, cubes: Cube[]): void {
		// Raycast from camera center to find what the crosshair is pointing at
		this.raycaster.setFromCamera(new THREE.Vector2(0, 0), player.camera);

		// Check cubes first
		const cubeTargets = cubes.filter((c) => c.isAlive).map((c) => c.mesh);
		const hits = this.raycaster.intersectObjects(cubeTargets, false);

		let aimTarget: THREE.Vector3;
		if (hits.length > 0) {
			aimTarget = hits[0].point;
		} else {
			// Check intersection with ground plane
			const groundHit = new THREE.Vector3();
			if (this.raycaster.ray.intersectPlane(this.groundPlane, groundHit)) {
				aimTarget = groundHit;
			} else {
				// Aiming at sky — use far point along camera direction
				const forward = player.forward;
				aimTarget = player.camera.position.clone().add(forward.multiplyScalar(this.range));
			}
		}

		// Spawn projectile from the gun barrel tip
		let origin: THREE.Vector3;
		if (this.gunModel) {
			player.camera.updateWorldMatrix(true, true);
			origin = this.gunModel.getBarrelTipWorld();
			this.gunModel.fireRecoil();
		} else {
			origin = player.camera.position.clone().add(player.forward.multiplyScalar(1.0));
		}

		const aimDir = aimTarget.clone().sub(origin).normalize();

		const proj = new Projectile(
			this.scene,
			origin,
			aimDir,
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
