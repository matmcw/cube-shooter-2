import * as THREE from 'three';
import {
	PLATFORM_WIDTH,
	PLATFORM_DEPTH,
	PLATFORM_THICKNESS,
	PLATFORM_Y,
	COLOR_PLATFORM,
	COLOR_PLATFORM_EDGE,
	COLOR_GRID,
} from '../utils/constants';

export class Platform {
	group: THREE.Group;

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group();

		// Main platform slab
		const geo = new THREE.BoxGeometry(PLATFORM_WIDTH, PLATFORM_THICKNESS, PLATFORM_DEPTH);
		const mat = new THREE.MeshStandardMaterial({
			color: COLOR_PLATFORM,
			roughness: 0.7,
			metalness: 0.3,
		});
		const mesh = new THREE.Mesh(geo, mat);
		mesh.position.y = PLATFORM_Y;
		mesh.receiveShadow = true;
		this.group.add(mesh);

		// Edge glow strips
		this.addEdgeStrips();

		// Grid lines on top surface
		this.addGridLines();

		scene.add(this.group);
	}

	private addEdgeStrips(): void {
		const edgeMat = new THREE.MeshStandardMaterial({
			color: COLOR_PLATFORM_EDGE,
			emissive: COLOR_PLATFORM_EDGE,
			emissiveIntensity: 0.5,
			roughness: 0.3,
			metalness: 0.8,
		});

		const stripHeight = PLATFORM_THICKNESS;
		const stripThickness = 0.15;
		const topY = PLATFORM_Y;

		// Four edge strips
		const edges = [
			{ w: PLATFORM_WIDTH + stripThickness * 2, d: stripThickness, x: 0, z: PLATFORM_DEPTH / 2 },
			{ w: PLATFORM_WIDTH + stripThickness * 2, d: stripThickness, x: 0, z: -PLATFORM_DEPTH / 2 },
			{ w: stripThickness, d: PLATFORM_DEPTH, x: PLATFORM_WIDTH / 2, z: 0 },
			{ w: stripThickness, d: PLATFORM_DEPTH, x: -PLATFORM_WIDTH / 2, z: 0 },
		];

		for (const e of edges) {
			const geo = new THREE.BoxGeometry(e.w, stripHeight, e.d);
			const mesh = new THREE.Mesh(geo, edgeMat);
			mesh.position.set(e.x, topY, e.z);
			this.group.add(mesh);
		}
	}

	private addGridLines(): void {
		const gridMat = new THREE.LineBasicMaterial({
			color: COLOR_GRID,
			transparent: true,
			opacity: 0.3,
		});

		const topY = PLATFORM_Y + PLATFORM_THICKNESS / 2 + 0.01;
		const halfW = PLATFORM_WIDTH / 2;
		const halfD = PLATFORM_DEPTH / 2;
		const spacing = 4;

		const points: THREE.Vector3[] = [];

		for (let x = -halfW; x <= halfW; x += spacing) {
			points.push(new THREE.Vector3(x, topY, -halfD));
			points.push(new THREE.Vector3(x, topY, halfD));
		}
		for (let z = -halfD; z <= halfD; z += spacing) {
			points.push(new THREE.Vector3(-halfW, topY, z));
			points.push(new THREE.Vector3(halfW, topY, z));
		}

		const geo = new THREE.BufferGeometry().setFromPoints(points);
		const lines = new THREE.LineSegments(geo, gridMat);
		this.group.add(lines);
	}

	isOnPlatform(x: number, z: number): boolean {
		const halfW = PLATFORM_WIDTH / 2;
		const halfD = PLATFORM_DEPTH / 2;
		return x >= -halfW && x <= halfW && z >= -halfD && z <= halfD;
	}
}
