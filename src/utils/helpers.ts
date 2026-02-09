import * as THREE from 'three';

export function isMobile(): boolean {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function randomOnPlatformEdge(
	platformWidth: number,
	platformDepth: number,
	spawnDistance: number,
): THREE.Vector3 {
	const angle = Math.random() * Math.PI * 2;
	const x = Math.cos(angle) * spawnDistance;
	const z = Math.sin(angle) * spawnDistance;
	const clampedX = clamp(x, -platformWidth / 2 + 1, platformWidth / 2 - 1);
	const clampedZ = clamp(z, -platformDepth / 2 + 1, platformDepth / 2 - 1);
	return new THREE.Vector3(clampedX, 1.5, clampedZ);
}

export function disposeObject(obj: THREE.Object3D): void {
	obj.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			child.geometry.dispose();
			if (Array.isArray(child.material)) {
				child.material.forEach((m) => m.dispose());
			} else {
				child.material.dispose();
			}
		}
	});
}
