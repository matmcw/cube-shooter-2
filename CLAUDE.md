# Cube Shooter 2.0

Medium-sized project. 3D first-person wave shooter using Vite + TypeScript + Three.js.

## Project Structure

```
src/
  main.ts            Entry point; blocks mobile, instantiates Game
  style.css           Global reset styles
  game/
    Game.ts           Core loop, state machine (title/playing/coin_collect/shop/dead/paused)
    Player.ts         FPS camera, WASD+sprint+jump, pointer lock, health/coins
    Weapon.ts         Auto-fire on mouse hold, raycast aiming, spawns Projectiles
    Projectile.ts     Cylinder mesh projectile with swept-ray collision detection
    GunModel.ts       First-person gun mesh attached to camera
    Cube.ts           Enemy base class with 6 types: normal, jumper, zigzag, teleporter, tank, charger
    WaveManager.ts    Wave spawning, state flow: pre_wave -> spawning -> active -> wave_clear -> coin_collect -> shop
    Coin.ts           Coin pickup with magnet pull
    Platform.ts       Floating platform geometry
  ui/
    HUD.ts            In-game health bar, coin counter, wave info, hit marker
    Menu.ts           Title screen, death screen, wave announcements
    PauseMenu.ts      Escape-key pause overlay
    Shop.ts           Between-wave upgrade shop (fire rate, damage, max health, magnet, move speed, jump height, heal)
    MobileBlock.ts    Blocks mobile/touch devices from playing
  utils/
    constants.ts      All tuning values (speeds, sizes, colors, etc.)
    helpers.ts        Math helpers (clamp, randomOnPlatformEdge, etc.)
```

## Key Technical Details

- **Projectile collision** uses swept raycasting per frame (ray from previous position along travel direction, far = step length) plus a fallback distance check.
- **Weapon aiming** raycasts from camera center to find crosshair target (cube mesh > ground plane > far point), then fires projectile from gun barrel tip toward that target.
- **Enemy wave scaling**: health multiplier `1 + (wave-1) * 0.15`, speed multiplier `1 + (wave-1) * 0.08`. New enemy types unlock at specific wave thresholds (see `pickCubeType` in WaveManager.ts).
- **Upgrade costs** scale with level: `baseCost * (1 + currentLevel * 0.5)`.

## Build & Run

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc + vite build -> dist/
npm run preview    # preview production build
```

## Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml` auto-deploys to GitHub Pages on push to `main`. Vite base path is `/cube-shooter-2/`.

## Notes

- Desktop only; MobileBlock.ts prevents touch-device access.
- Indent with tabs (project convention).
- Three.js version: 0.182.x.
