import * as THREE from 'three';
import {
	WAVE_BASE_COUNT,
	WAVE_COUNT_INCREASE,
	WAVE_SPAWN_INTERVAL,
	WAVE_BREAK_DURATION,
	CUBE_SPAWN_DISTANCE,
	PLATFORM_WIDTH,
	PLATFORM_DEPTH,
} from '../utils/constants';
import { randomOnPlatformEdge } from '../utils/helpers';
import { Cube, type CubeType } from './Cube';

export type WaveState = 'pre_wave' | 'spawning' | 'active' | 'wave_clear' | 'coin_collect' | 'shop';

export class WaveManager {
	waveNumber: number = 0;
	state: WaveState = 'pre_wave';
	cubes: Cube[] = [];

	private scene: THREE.Scene;
	private cubesToSpawn: number = 0;
	private spawnTimer: number = 0;
	private breakTimer: number = 0;
	private preWaveTimer: number = 0;

	onWaveClear: (() => void) | null = null;
	onShopOpen: (() => void) | null = null;
	onShopClose: (() => void) | null = null;

	constructor(scene: THREE.Scene) {
		this.scene = scene;
	}

	startNextWave(): void {
		this.waveNumber++;
		this.cubesToSpawn = WAVE_BASE_COUNT + (this.waveNumber - 1) * WAVE_COUNT_INCREASE;
		this.spawnTimer = 0;
		this.state = 'pre_wave';
		this.preWaveTimer = 2; // 2 second countdown before wave starts
	}

	getCubeCount(): number {
		return this.cubes.filter((c) => c.isAlive).length;
	}

	getRemainingCount(): number {
		return this.cubes.filter((c) => c.isAlive).length + this.cubesToSpawn;
	}

	getTotalForWave(): number {
		return WAVE_BASE_COUNT + (this.waveNumber - 1) * WAVE_COUNT_INCREASE;
	}

	update(dt: number, playerPosition: THREE.Vector3): void {
		switch (this.state) {
			case 'pre_wave':
				this.preWaveTimer -= dt;
				if (this.preWaveTimer <= 0) {
					this.state = 'spawning';
				}
				break;

			case 'spawning':
				this.spawnTimer -= dt;
				if (this.spawnTimer <= 0 && this.cubesToSpawn > 0) {
					this.spawnCube();
					this.cubesToSpawn--;
					this.spawnTimer = WAVE_SPAWN_INTERVAL;
				}

				if (this.cubesToSpawn <= 0) {
					this.state = 'active';
				}

				this.updateCubes(dt, playerPosition);
				break;

			case 'active':
				this.updateCubes(dt, playerPosition);

				if (this.getCubeCount() <= 0) {
					this.state = 'wave_clear';
					this.breakTimer = WAVE_BREAK_DURATION;
					if (this.onWaveClear) this.onWaveClear();
				}
				break;

			case 'wave_clear':
				this.breakTimer -= dt;
				if (this.breakTimer <= 0) {
					this.state = 'coin_collect';
				}
				break;

			case 'coin_collect':
				// Game.ts drives coin collection and calls finishCoinCollect() when done
				break;

			case 'shop':
				// Waiting for player to close shop
				break;
		}
	}

	private spawnCube(): void {
		const healthMult = 1 + (this.waveNumber - 1) * 0.15;
		const speedMult = 1 + (this.waveNumber - 1) * 0.08;
		const type = this.pickCubeType();

		const position = randomOnPlatformEdge(
			PLATFORM_WIDTH,
			PLATFORM_DEPTH,
			CUBE_SPAWN_DISTANCE,
		);

		const cube = new Cube(this.scene, position, healthMult, speedMult, type);
		this.cubes.push(cube);
	}

	private pickCubeType(): CubeType {
		const pool: CubeType[] = [];
		const w = this.waveNumber;

		// Normal cubes always in the pool, weighted heavier early on
		const normalWeight = w < 5 ? 4 : w < 8 ? 3 : 2;
		for (let i = 0; i < normalWeight; i++) pool.push('normal');

		if (w >= 3) pool.push('jumper');
		if (w >= 4) pool.push('zigzag');
		if (w >= 5) pool.push('charger');
		if (w >= 7) pool.push('teleporter');
		if (w >= 8) pool.push('tank');

		return pool[Math.floor(Math.random() * pool.length)];
	}

	private updateCubes(dt: number, playerPosition: THREE.Vector3): void {
		for (const cube of this.cubes) {
			if (cube.isAlive) {
				cube.update(dt, playerPosition);
			}
		}
	}

	cleanupDeadCubes(): Cube[] {
		const dead = this.cubes.filter((c) => !c.isAlive);
		this.cubes = this.cubes.filter((c) => c.isAlive);
		return dead;
	}

	reset(): void {
		for (const cube of this.cubes) {
			cube.dispose(this.scene);
		}
		this.cubes = [];
		this.waveNumber = 0;
		this.state = 'pre_wave';
		this.cubesToSpawn = 0;
	}

	finishCoinCollect(): void {
		if (this.state === 'coin_collect') {
			this.state = 'shop';
			if (this.onShopOpen) this.onShopOpen();
		}
	}

	closeShop(): void {
		if (this.state === 'shop') {
			if (this.onShopClose) this.onShopClose();
			this.startNextWave();
		}
	}
}
