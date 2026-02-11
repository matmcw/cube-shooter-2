export interface Upgrade {
	id: string;
	name: string;
	description: string;
	cost: number;
	maxLevel: number;
	currentLevel: number;
}

export class Shop {
	private container: HTMLDivElement;
	private upgradeList: HTMLDivElement;
	private coinDisplay: HTMLDivElement;
	private startButton: HTMLButtonElement;

	upgrades: Upgrade[] = [
		{ id: 'fire_rate', name: 'Fire Rate', description: 'Shoot faster', cost: 50, maxLevel: 10, currentLevel: 0 },
		{ id: 'damage', name: 'Damage', description: 'Deal more damage', cost: 60, maxLevel: 10, currentLevel: 0 },
		{ id: 'max_health', name: 'Max Health', description: 'Increase health pool', cost: 40, maxLevel: 10, currentLevel: 0 },
		{ id: 'magnet', name: 'Magnet Range', description: 'Pick up coins from further', cost: 30, maxLevel: 8, currentLevel: 0 },
		{ id: 'move_speed', name: 'Move Speed', description: 'Move faster', cost: 45, maxLevel: 8, currentLevel: 0 },
		{ id: 'jump_force', name: 'Jump Height', description: 'Jump higher', cost: 35, maxLevel: 5, currentLevel: 0 },
	];

	onPurchase: ((upgrade: Upgrade) => void) | null = null;
	onHeal: (() => void) | null = null;
	onClose: (() => void) | null = null;

	private playerHealth: number = 100;
	private playerMaxHealth: number = 100;

	constructor() {
		this.container = document.createElement('div');
		this.container.id = 'shop';
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.85);
			display: none;
			z-index: 100;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			font-family: 'Segoe UI', system-ui, sans-serif;
		`;

		const panel = document.createElement('div');
		panel.style.cssText = `
			background: rgba(26, 26, 46, 0.95);
			border: 2px solid rgba(78, 204, 163, 0.4);
			border-radius: 12px;
			padding: 30px 40px;
			max-width: 500px;
			width: 90%;
		`;

		const title = document.createElement('h2');
		title.textContent = 'SHOP';
		title.style.cssText = `
			text-align: center;
			color: #4ecca3;
			font-size: 28px;
			margin: 0 0 5px 0;
			letter-spacing: 4px;
		`;
		panel.appendChild(title);

		this.coinDisplay = document.createElement('div');
		this.coinDisplay.style.cssText = `
			text-align: center;
			color: #ffd700;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 20px;
		`;
		panel.appendChild(this.coinDisplay);

		this.upgradeList = document.createElement('div');
		this.upgradeList.style.cssText = `
			display: flex;
			flex-direction: column;
			gap: 8px;
			margin-bottom: 20px;
			max-height: 350px;
			overflow-y: auto;
		`;
		panel.appendChild(this.upgradeList);

		this.startButton = document.createElement('button');
		this.startButton.textContent = 'START NEXT WAVE';
		this.startButton.style.cssText = `
			display: block;
			width: 100%;
			padding: 14px;
			background: linear-gradient(135deg, #4ecca3, #45b393);
			border: none;
			border-radius: 8px;
			color: white;
			font-size: 18px;
			font-weight: bold;
			cursor: pointer;
			letter-spacing: 2px;
			transition: transform 0.1s, box-shadow 0.1s;
			pointer-events: auto;
		`;
		this.startButton.addEventListener('mouseenter', () => {
			this.startButton.style.transform = 'scale(1.02)';
			this.startButton.style.boxShadow = '0 4px 20px rgba(78, 204, 163, 0.4)';
		});
		this.startButton.addEventListener('mouseleave', () => {
			this.startButton.style.transform = 'scale(1)';
			this.startButton.style.boxShadow = 'none';
		});
		this.startButton.addEventListener('click', () => {
			if (this.onClose) this.onClose();
		});
		panel.appendChild(this.startButton);

		this.container.appendChild(panel);
	}

	mount(parent: HTMLElement): void {
		parent.appendChild(this.container);
	}

	show(coins: number, health?: number, maxHealth?: number): void {
		if (health !== undefined) this.playerHealth = health;
		if (maxHealth !== undefined) this.playerMaxHealth = maxHealth;
		this.coinDisplay.textContent = `${coins}`;
		this.renderUpgrades(coins);
		this.container.style.display = 'flex';
	}

	hide(): void {
		this.container.style.display = 'none';
	}

	private renderUpgrades(coins: number): void {
		this.upgradeList.innerHTML = '';

		// Heal option
		const healCost = this.getHealCost();
		const needsHeal = this.playerHealth < this.playerMaxHealth;
		const canHeal = needsHeal && coins >= healCost;
		{
			const row = document.createElement('div');
			row.style.cssText = `
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10px 14px;
				background: rgba(78, 204, 163, 0.08);
				border: 1px solid rgba(78, 204, 163, 0.25);
				border-radius: 6px;
				margin-bottom: 4px;
			`;

			const info = document.createElement('div');
			const healthPct = Math.round((this.playerHealth / this.playerMaxHealth) * 100);
			info.innerHTML = `
				<div style="color: #4ecca3; font-weight: bold; font-size: 14px;">Refill Health</div>
				<div style="color: rgba(255,255,255,0.5); font-size: 12px;">Restore to full (${healthPct}% → 100%)</div>
			`;

			const buyBtn = document.createElement('button');
			buyBtn.textContent = !needsHeal ? 'FULL' : `${healCost}`;
			buyBtn.style.cssText = `
				padding: 6px 16px;
				border: none;
				border-radius: 4px;
				font-weight: bold;
				font-size: 13px;
				cursor: ${canHeal ? 'pointer' : 'default'};
				background: ${!needsHeal ? 'rgba(78, 204, 163, 0.3)' : canHeal ? '#4ecca3' : 'rgba(100,100,100,0.3)'};
				color: ${!needsHeal ? 'rgba(255,255,255,0.3)' : canHeal ? '#1a1a2e' : 'rgba(255,255,255,0.3)'};
				pointer-events: auto;
				min-width: 60px;
				transition: transform 0.1s;
			`;

			if (canHeal) {
				buyBtn.addEventListener('click', () => {
					if (this.onHeal) this.onHeal();
				});
				buyBtn.addEventListener('mouseenter', () => {
					buyBtn.style.transform = 'scale(1.05)';
				});
				buyBtn.addEventListener('mouseleave', () => {
					buyBtn.style.transform = 'scale(1)';
				});
			}

			row.appendChild(info);
			row.appendChild(buyBtn);
			this.upgradeList.appendChild(row);
		}

		for (const upgrade of this.upgrades) {
			const row = document.createElement('div');
			const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
			const cost = this.getUpgradeCost(upgrade);
			const canAfford = coins >= cost && !isMaxed;

			row.style.cssText = `
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10px 14px;
				background: rgba(255, 255, 255, 0.05);
				border: 1px solid rgba(255, 255, 255, 0.1);
				border-radius: 6px;
				transition: background 0.15s;
			`;

			const info = document.createElement('div');
			info.innerHTML = `
				<div style="color: white; font-weight: bold; font-size: 14px;">${upgrade.name} <span style="color: rgba(255,255,255,0.4); font-size: 12px;">Lv.${upgrade.currentLevel}/${upgrade.maxLevel}</span></div>
				<div style="color: rgba(255,255,255,0.5); font-size: 12px;">${upgrade.description}</div>
			`;

			const buyBtn = document.createElement('button');
			buyBtn.textContent = isMaxed ? 'MAX' : `${cost}`;
			buyBtn.style.cssText = `
				padding: 6px 16px;
				border: none;
				border-radius: 4px;
				font-weight: bold;
				font-size: 13px;
				cursor: ${canAfford ? 'pointer' : 'default'};
				background: ${isMaxed ? 'rgba(100,100,100,0.4)' : canAfford ? '#ffd700' : 'rgba(100,100,100,0.3)'};
				color: ${isMaxed ? 'rgba(255,255,255,0.3)' : canAfford ? '#1a1a2e' : 'rgba(255,255,255,0.3)'};
				pointer-events: auto;
				min-width: 60px;
				transition: transform 0.1s;
			`;

			if (canAfford) {
				buyBtn.addEventListener('click', () => {
					upgrade.currentLevel++;
					if (this.onPurchase) this.onPurchase(upgrade);
				});
				buyBtn.addEventListener('mouseenter', () => {
					buyBtn.style.transform = 'scale(1.05)';
				});
				buyBtn.addEventListener('mouseleave', () => {
					buyBtn.style.transform = 'scale(1)';
				});
			}

			row.appendChild(info);
			row.appendChild(buyBtn);
			this.upgradeList.appendChild(row);
		}
	}

	getUpgradeCost(upgrade: Upgrade): number {
		return Math.round(upgrade.cost * (1 + upgrade.currentLevel * 0.5));
	}

	getHealCost(): number {
		const missing = this.playerMaxHealth - this.playerHealth;
		return Math.round(missing * 0.5);
	}

	reset(): void {
		for (const upgrade of this.upgrades) {
			upgrade.currentLevel = 0;
		}
	}
}
