export class Menu {
	private container: HTMLDivElement;
	private titleScreen: HTMLDivElement;
	private deathScreen: HTMLDivElement;
	private waveAnnounce: HTMLDivElement;
	private waveAnnounceTimer: number = 0;

	onStart: (() => void) | null = null;
	onRestart: (() => void) | null = null;

	constructor() {
		this.container = document.createElement('div');
		this.container.id = 'menu';
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			pointer-events: none;
			z-index: 50;
			font-family: 'Segoe UI', system-ui, sans-serif;
		`;

		this.titleScreen = this.createTitleScreen();
		this.deathScreen = this.createDeathScreen();
		this.waveAnnounce = this.createWaveAnnounce();

		this.container.appendChild(this.titleScreen);
		this.container.appendChild(this.deathScreen);
		this.container.appendChild(this.waveAnnounce);
	}

	private createTitleScreen(): HTMLDivElement {
		const el = document.createElement('div');
		el.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background: rgba(10, 10, 26, 0.95);
			pointer-events: auto;
		`;

		el.innerHTML = `
			<h1 style="
				color: #4ecca3;
				font-size: 56px;
				font-weight: bold;
				letter-spacing: 6px;
				margin: 0 0 8px 0;
				text-shadow: 0 0 30px rgba(78, 204, 163, 0.5);
			">CUBE SHOOTER</h1>
			<p style="
				color: rgba(255,255,255,0.4);
				font-size: 14px;
				letter-spacing: 3px;
				margin: 0 0 50px 0;
			">SURVIVE THE CUBES</p>
			<div style="
				color: rgba(255,255,255,0.6);
				font-size: 16px;
				text-align: center;
				line-height: 2;
				margin-bottom: 30px;
			">
				<div><b>WASD</b> - Move</div>
				<div><b>SPACE</b> - Jump</div>
				<div><b>MOUSE</b> - Aim (auto-fire)</div>
			</div>
			<button id="start-btn" style="
				padding: 16px 50px;
				background: linear-gradient(135deg, #4ecca3, #45b393);
				border: none;
				border-radius: 8px;
				color: white;
				font-size: 20px;
				font-weight: bold;
				cursor: pointer;
				letter-spacing: 3px;
				transition: transform 0.15s, box-shadow 0.15s;
			">PLAY</button>
		`;

		const btn = el.querySelector('#start-btn') as HTMLButtonElement;
		btn.addEventListener('mouseenter', () => {
			btn.style.transform = 'scale(1.05)';
			btn.style.boxShadow = '0 4px 30px rgba(78, 204, 163, 0.5)';
		});
		btn.addEventListener('mouseleave', () => {
			btn.style.transform = 'scale(1)';
			btn.style.boxShadow = 'none';
		});
		btn.addEventListener('click', () => {
			if (this.onStart) this.onStart();
		});

		return el;
	}

	private createDeathScreen(): HTMLDivElement {
		const el = document.createElement('div');
		el.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: none;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background: rgba(10, 10, 26, 0.9);
			pointer-events: auto;
		`;

		el.innerHTML = `
			<h2 id="death-title" style="
				color: #e94560;
				font-size: 48px;
				font-weight: bold;
				letter-spacing: 4px;
				margin: 0 0 10px 0;
			">YOU DIED</h2>
			<p id="death-subtitle" style="
				color: rgba(255,255,255,0.5);
				font-size: 16px;
				margin: 0 0 10px 0;
			"></p>
			<p id="death-stats" style="
				color: rgba(255,255,255,0.6);
				font-size: 18px;
				margin: 0 0 40px 0;
			"></p>
			<button id="restart-btn" style="
				padding: 16px 50px;
				background: linear-gradient(135deg, #e94560, #c73650);
				border: none;
				border-radius: 8px;
				color: white;
				font-size: 20px;
				font-weight: bold;
				cursor: pointer;
				letter-spacing: 3px;
				transition: transform 0.15s, box-shadow 0.15s;
			">RESTART</button>
		`;

		const btn = el.querySelector('#restart-btn') as HTMLButtonElement;
		btn.addEventListener('mouseenter', () => {
			btn.style.transform = 'scale(1.05)';
			btn.style.boxShadow = '0 4px 30px rgba(233, 69, 96, 0.5)';
		});
		btn.addEventListener('mouseleave', () => {
			btn.style.transform = 'scale(1)';
			btn.style.boxShadow = 'none';
		});
		btn.addEventListener('click', () => {
			if (this.onRestart) this.onRestart();
		});

		return el;
	}

	private createWaveAnnounce(): HTMLDivElement {
		const el = document.createElement('div');
		el.style.cssText = `
			position: absolute;
			top: 25%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
			opacity: 0;
			transition: opacity 0.3s;
			pointer-events: none;
		`;
		el.innerHTML = `
			<div id="wave-announce-text" style="
				color: white;
				font-size: 42px;
				font-weight: bold;
				letter-spacing: 4px;
				text-shadow: 0 0 20px rgba(255,255,255,0.3);
			"></div>
		`;
		return el;
	}

	mount(parent: HTMLElement): void {
		parent.appendChild(this.container);
	}

	showTitle(): void {
		this.titleScreen.style.display = 'flex';
		this.deathScreen.style.display = 'none';
	}

	hideTitle(): void {
		this.titleScreen.style.display = 'none';
	}

	showDeath(reason: string, wave: number, coins: number): void {
		const title = this.deathScreen.querySelector('#death-title') as HTMLElement;
		const subtitle = this.deathScreen.querySelector('#death-subtitle') as HTMLElement;
		const stats = this.deathScreen.querySelector('#death-stats') as HTMLElement;

		title.textContent = reason === 'fell' ? 'YOU FELL' : 'YOU DIED';
		subtitle.textContent = reason === 'fell'
			? 'You fell off the platform!'
			: 'The cubes overwhelmed you.';
		stats.textContent = `Wave ${wave}  |  ${coins} earned`;

		this.deathScreen.style.display = 'flex';
	}

	hideDeath(): void {
		this.deathScreen.style.display = 'none';
	}

	announceWave(waveNumber: number): void {
		const text = this.waveAnnounce.querySelector('#wave-announce-text') as HTMLElement;
		text.textContent = `WAVE ${waveNumber}`;
		this.waveAnnounce.style.opacity = '1';
		this.waveAnnounceTimer = 2;
	}

	update(dt: number): void {
		if (this.waveAnnounceTimer > 0) {
			this.waveAnnounceTimer -= dt;
			if (this.waveAnnounceTimer <= 0) {
				this.waveAnnounce.style.opacity = '0';
			}
		}
	}
}
