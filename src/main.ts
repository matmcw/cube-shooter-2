import './style.css';
import { MobileBlock } from './ui/MobileBlock';
import { Game } from './game/Game';

const app = document.getElementById('app')!;

// Block mobile users
const mobileBlock = new MobileBlock();
if (!mobileBlock.check(app)) {
	new Game(app);
}
