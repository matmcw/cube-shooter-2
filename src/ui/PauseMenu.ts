export class PauseMenu {
	private container: HTMLDivElement;

	onResume: (() => void) | null = null;
	onQuit: (() => void) | null = null;

	constructor() {
		this.container = document.createElement('div');
		this.container.id = 'pause-menu';
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.75);
			display: none;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			z-index: 90;
			font-family: 'Segoe UI', system-ui, sans-serif;
		`;

		const panel = document.createElement('div');
		panel.style.cssText = `
			background: rgba(26, 26, 46, 0.95);
			border: 2px solid rgba(78, 204, 163, 0.4);
			border-radius: 12px;
			padding: 40px 50px;
			text-align: center;
			min-width: 280px;
		`;

		const title = document.createElement('h2');
		title.textContent = 'PAUSED';
		title.style.cssText = `
			color: #4ecca3;
			font-size: 36px;
			letter-spacing: 6px;
			margin: 0 0 30px 0;
		`;
		panel.appendChild(title);

		const resumeBtn = this.createButton('RESUME', '#4ecca3', '#45b393');
		resumeBtn.addEventListener('click', () => {
			if (this.onResume) this.onResume();
		});
		panel.appendChild(resumeBtn);

		const quitBtn = this.createButton('QUIT TO MENU', '#e94560', '#c73650');
		quitBtn.style.marginTop = '12px';
		quitBtn.addEventListener('click', () => {
			if (this.onQuit) this.onQuit();
		});
		panel.appendChild(quitBtn);

		this.container.appendChild(panel);
	}

	private createButton(text: string, color1: string, color2: string): HTMLButtonElement {
		const btn = document.createElement('button');
		btn.textContent = text;
		btn.style.cssText = `
			display: block;
			width: 100%;
			padding: 14px 30px;
			background: linear-gradient(135deg, ${color1}, ${color2});
			border: none;
			border-radius: 8px;
			color: white;
			font-size: 16px;
			font-weight: bold;
			cursor: pointer;
			letter-spacing: 2px;
			transition: transform 0.1s, box-shadow 0.1s;
			pointer-events: auto;
		`;
		btn.addEventListener('mouseenter', () => {
			btn.style.transform = 'scale(1.02)';
			btn.style.boxShadow = `0 4px 20px ${color1}66`;
		});
		btn.addEventListener('mouseleave', () => {
			btn.style.transform = 'scale(1)';
			btn.style.boxShadow = 'none';
		});
		return btn;
	}

	mount(parent: HTMLElement): void {
		parent.appendChild(this.container);
	}

	show(): void {
		this.container.style.display = 'flex';
	}

	hide(): void {
		this.container.style.display = 'none';
	}

	get isVisible(): boolean {
		return this.container.style.display === 'flex';
	}
}
