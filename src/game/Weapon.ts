import * as THREE from 'three';
import {
	FIRE_RATE,
	WEAPON_DAMAGE,
	WEAPON_RANGE,
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
	sceneObjects: THREE.Object3D[] = [];

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

	private fire(player: Player, cubes: Cube[]): void {
		const forward = player.forward;
		const camPos = player.camera.position;

		// Raycast from camera center to find what the crosshair is pointing at
		this.raycaster.set(camPos, forward);

		// Collect raycast targets: alive cubes + scene objects (platform, etc.)
		const targets: THREE.Object3D[] = [
			...cubes.filter((c) => c.isAlive).map((c) => c.mesh),
			...this.sceneObjects,
		];
		const hits = this.raycaster.intersectObjects(targets, true);

		// Determine aim point: hit location, or far point if aiming at sky
		let aimTarget: THREE.Vector3;
		if (hits.length > 0) {
			aimTarget = hits[0].point;
		} else {
			aimTarget = camPos.clone().add(forward.clone().multiplyScalar(this.range));
		}

		// Spawn projectile from the gun barrel tip
		let origin: THREE.Vector3;
		if (this.gunModel) {
			player.camera.updateWorldMatrix(true, true);
			origin = this.gunModel.getBarrelTipWorld();
			this.gunModel.fireRecoil();
		} else {
			origin = camPos.clone().add(forward.clone().multiplyScalar(1.0));
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
