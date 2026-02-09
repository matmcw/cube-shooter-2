import { isMobile } from '../utils/helpers';

export class MobileBlock {
	private container: HTMLDivElement;

	constructor() {
		this.container = document.createElement('div');
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: #0a0a1a;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			z-index: 9999;
			font-family: 'Segoe UI', system-ui, sans-serif;
			text-align: center;
			padding: 20px;
			box-sizing: border-box;
		`;

		this.container.innerHTML = `
			<h1 style="
				color: #4ecca3;
				font-size: 32px;
				letter-spacing: 4px;
				margin: 0 0 20px 0;
			">CUBE SHOOTER</h1>
			<p style="
				color: rgba(255,255,255,0.6);
				font-size: 16px;
				line-height: 1.6;
				max-width: 300px;
			">This game requires a keyboard and mouse to play.<br><br>Please visit on a desktop computer.</p>
		`;
	}

	check(parent: HTMLElement): boolean {
		if (isMobile()) {
			parent.appendChild(this.container);
			return true;
		}
		return false;
	}
}
