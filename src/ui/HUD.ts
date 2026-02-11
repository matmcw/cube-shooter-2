export class HUD {
	private container: HTMLDivElement;
	private healthBar: HTMLDivElement;
	private healthFill: HTMLDivElement;
	private healthText: HTMLSpanElement;
	private coinDisplay: HTMLDivElement;
	private waveDisplay: HTMLDivElement;
	private crosshair: HTMLDivElement;
	private hitMarker: HTMLDivElement;
	private hitMarkerTimer: number = 0;

	constructor() {
		this.container = document.createElement('div');
		this.container.id = 'hud';
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			pointer-events: none;
			z-index: 10;
			font-family: 'Segoe UI', system-ui, sans-serif;
		`;

		// Health bar
		this.healthBar = document.createElement('div');
		this.healthBar.style.cssText = `
			position: absolute;
			bottom: 40px;
			left: 50%;
			transform: translateX(-50%);
			width: 300px;
			height: 16px;
			background: rgba(50, 50, 50, 0.8);
			border: 2px solid rgba(255, 255, 255, 0.2);
			border-radius: 8px;
			overflow: hidden;
		`;

		this.healthFill = document.createElement('div');
		this.healthFill.style.cssText = `
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, #4ecca3, #45b393);
			transition: width 0.2s ease;
			border-radius: 6px;
		`;
		this.healthBar.appendChild(this.healthFill);

		this.healthText = document.createElement('span');
		this.healthText.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 10px;
			font-weight: bold;
			color: white;
			text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
		`;
		this.healthBar.appendChild(this.healthText);

		// Coin display
		this.coinDisplay = document.createElement('div');
		this.coinDisplay.style.cssText = `
			position: absolute;
			top: 20px;
			right: 30px;
			font-size: 22px;
			font-weight: bold;
			color: #ffd700;
			text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
		`;

		// Wave display
		this.waveDisplay = document.createElement('div');
		this.waveDisplay.style.cssText = `
			position: absolute;
			top: 20px;
			left: 30px;
			font-size: 18px;
			font-weight: bold;
			color: rgba(255, 255, 255, 0.8);
			text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
		`;

		// Crosshair
		this.crosshair = document.createElement('div');
		this.crosshair.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 24px;
			height: 24px;
		`;
		this.crosshair.innerHTML = `
			<svg width="24" height="24" viewBox="0 0 24 24">
				<circle cx="12" cy="12" r="2" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
				<line x1="12" y1="2" x2="12" y2="8" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
				<line x1="12" y1="16" x2="12" y2="22" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
				<line x1="2" y1="12" x2="8" y2="12" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
				<line x1="16" y1="12" x2="22" y2="12" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
			</svg>
		`;

		// Hit marker
		this.hitMarker = document.createElement('div');
		this.hitMarker.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			opacity: 0;
			transition: opacity 0.05s;
		`;
		this.hitMarker.innerHTML = `
			<svg width="20" height="20" viewBox="0 0 20 20">
				<line x1="3" y1="3" x2="8" y2="8" stroke="white" stroke-width="2"/>
				<line x1="17" y1="3" x2="12" y2="8" stroke="white" stroke-width="2"/>
				<line x1="3" y1="17" x2="8" y2="12" stroke="white" stroke-width="2"/>
				<line x1="17" y1="17" x2="12" y2="12" stroke="white" stroke-width="2"/>
			</svg>
		`;

		this.container.appendChild(this.healthBar);
		this.container.appendChild(this.coinDisplay);
		this.container.appendChild(this.waveDisplay);
		this.container.appendChild(this.crosshair);
		this.container.appendChild(this.hitMarker);
	}

	mount(parent: HTMLElement): void {
		parent.appendChild(this.container);
	}

	show(): void {
		this.container.style.display = 'block';
	}

	hide(): void {
		this.container.style.display = 'none';
	}

	showHitMarker(): void {
		this.hitMarker.style.opacity = '1';
		this.hitMarkerTimer = 0.12;
	}

	updateHealth(current: number, max: number): void {
		const pct = Math.max(0, current / max) * 100;
		this.healthFill.style.width = `${pct}%`;
		this.healthText.textContent = `${Math.ceil(current)} / ${max}`;

		if (pct < 25) {
			this.healthFill.style.background = 'linear-gradient(90deg, #e94560, #c73650)';
		} else if (pct < 50) {
			this.healthFill.style.background = 'linear-gradient(90deg, #f0a500, #d69400)';
		} else {
			this.healthFill.style.background = 'linear-gradient(90deg, #4ecca3, #45b393)';
		}
	}

	updateCoins(coins: number): void {
		this.coinDisplay.textContent = `${coins}`;
	}

	updateWave(wave: number, remaining: number, total: number): void {
		this.waveDisplay.textContent = `Wave ${wave}  |  ${remaining} / ${total}`;
	}

	updateWaveText(text: string): void {
		this.waveDisplay.textContent = text;
	}

	update(dt: number): void {
		if (this.hitMarkerTimer > 0) {
			this.hitMarkerTimer -= dt;
			if (this.hitMarkerTimer <= 0) {
				this.hitMarker.style.opacity = '0';
			}
		}
	}
}
