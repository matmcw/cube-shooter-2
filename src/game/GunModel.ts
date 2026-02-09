import * as THREE from 'three';

const DARK_METAL = new THREE.MeshStandardMaterial({
	color: 0x2a2a2a,
	roughness: 0.4,
	metalness: 0.8,
});
const LIGHT_METAL = new THREE.MeshStandardMaterial({
	color: 0x444444,
	roughness: 0.3,
	metalness: 0.9,
});
const BARREL_INTERIOR = new THREE.MeshBasicMaterial({
	color: 0x110000,
});
const ACCENT = new THREE.MeshStandardMaterial({
	color: 0xff2020,
	emissive: 0xff0000,
	emissiveIntensity: 0.6,
	roughness: 0.2,
	metalness: 0.7,
});

export class GunModel {
	group: THREE.Group;
	barrelTip: THREE.Object3D;
	private recoilAmount: number = 0;
	private basePosition: THREE.Vector3;

	constructor(camera: THREE.PerspectiveCamera) {
		this.group = new THREE.Group();

		// Main body (rectangular block)
		const body = new THREE.Mesh(
			new THREE.BoxGeometry(0.08, 0.1, 0.35),
			DARK_METAL,
		);
		body.position.set(0, 0, -0.05);
		this.group.add(body);

		// Top rail
		const rail = new THREE.Mesh(
			new THREE.BoxGeometry(0.04, 0.02, 0.3),
			LIGHT_METAL,
		);
		rail.position.set(0, 0.06, -0.05);
		this.group.add(rail);

		// Barrel (cylinder extending forward)
		const barrel = new THREE.Mesh(
			new THREE.CylinderGeometry(0.025, 0.03, 0.3, 12),
			LIGHT_METAL,
		);
		barrel.rotation.x = Math.PI / 2;
		barrel.position.set(0, 0.02, -0.35);
		this.group.add(barrel);

		// Barrel interior (dark hole at the tip)
		const barrelHole = new THREE.Mesh(
			new THREE.CircleGeometry(0.02, 12),
			BARREL_INTERIOR,
		);
		barrelHole.position.set(0, 0.02, -0.501);
		this.group.add(barrelHole);

		// Barrel shroud / heat vents (accent lines)
		for (let i = 0; i < 3; i++) {
			const vent = new THREE.Mesh(
				new THREE.BoxGeometry(0.09, 0.005, 0.015),
				ACCENT,
			);
			vent.position.set(0, 0.005, -0.25 - i * 0.06);
			this.group.add(vent);
		}

		// Grip (angled down)
		const grip = new THREE.Mesh(
			new THREE.BoxGeometry(0.06, 0.14, 0.06),
			DARK_METAL,
		);
		grip.position.set(0, -0.1, 0.06);
		grip.rotation.x = 0.2;
		this.group.add(grip);

		// Trigger guard
		const guardShape = new THREE.TorusGeometry(0.03, 0.005, 6, 8, Math.PI);
		const guard = new THREE.Mesh(guardShape, LIGHT_METAL);
		guard.position.set(0, -0.05, 0.01);
		guard.rotation.y = Math.PI / 2;
		guard.rotation.z = Math.PI;
		this.group.add(guard);

		// Red accent stripe along the side
		const stripe = new THREE.Mesh(
			new THREE.BoxGeometry(0.085, 0.015, 0.2),
			ACCENT,
		);
		stripe.position.set(0, -0.03, -0.08);
		this.group.add(stripe);

		// Barrel tip marker (invisible, used for projectile spawn point)
		this.barrelTip = new THREE.Object3D();
		this.barrelTip.position.set(0, 0.02, -0.5);
		this.group.add(this.barrelTip);

		// Position the gun in the lower-right of the viewport
		this.basePosition = new THREE.Vector3(0.35, -0.3, -0.55);
		this.group.position.copy(this.basePosition);
		this.group.rotation.set(0, 0, 0);

		camera.add(this.group);
	}

	fireRecoil(): void {
		this.recoilAmount = 1.0;
	}

	update(dt: number): void {
		if (this.recoilAmount > 0) {
			this.recoilAmount -= dt * 8;
			if (this.recoilAmount < 0) this.recoilAmount = 0;
		}

		// Apply recoil as a slight kick-back
		const recoilZ = this.recoilAmount * 0.06;
		const recoilRotX = this.recoilAmount * 0.04;
		this.group.position.set(
			this.basePosition.x,
			this.basePosition.y,
			this.basePosition.z + recoilZ,
		);
		this.group.rotation.x = -recoilRotX;
	}

	getBarrelTipWorld(): THREE.Vector3 {
		const pos = new THREE.Vector3();
		this.barrelTip.getWorldPosition(pos);
		return pos;
	}
}
