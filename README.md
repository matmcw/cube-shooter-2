# Cube Shooter 2.0

A 3D first-person wave-based shooter built with Three.js and TypeScript. Survive waves of cube enemies, collect coins, and buy upgrades between rounds.

**Play it here:** [https://matmcw.github.io/cube-shooter-2/](https://matmcw.github.io/cube-shooter-2/)

## Gameplay

- Defend yourself on a floating platform against waves of cube enemies
- Enemies scale in health and speed each wave; new types unlock as you progress
- Collect coins from defeated cubes and spend them in the shop between waves
- Survive as long as you can -- falling off the platform or losing all health ends the run

### Enemy Types

| Type | Wave | Behavior |
|------|------|----------|
| Normal | 1+ | Walks directly toward the player |
| Jumper | 3+ | Bounces while approaching |
| Zigzag | 4+ | Strafes side-to-side while closing in |
| Charger | 5+ | Pauses to aim, then dashes in a straight line |
| Teleporter | 7+ | Blinks to a random nearby position when hit |
| Tank | 8+ | Slow, large, very high health |

### Shop Upgrades

Fire Rate, Damage, Max Health, Magnet Range, Move Speed, Jump Height, and a heal-to-full option.

## Controls

| Input | Action |
|-------|--------|
| WASD | Move |
| Mouse | Look |
| Left Click (hold) | Fire |
| Space | Jump |
| Shift / Ctrl | Sprint |
| Escape | Pause |

Desktop only -- mobile devices are blocked at startup.

## Development

```bash
npm install
npm run dev       # start Vite dev server
npm run build     # type-check + production build (outputs to dist/)
npm run preview   # preview the production build locally
```

Requires Node 20+.

## Deployment (GitHub Pages)

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys to GitHub Pages on every push to `main`.

To set it up for a new repo:

1. Create a GitHub repository named `cube-shooter-2`
2. Push the code to the `main` branch
3. In the repo, go to **Settings > Pages** and set the source to **GitHub Actions**

The Vite config sets `base: '/cube-shooter-2/'` so asset paths resolve correctly on Pages.

## Tech Stack

- **Three.js** -- 3D rendering, lighting, shadows
- **TypeScript** -- strict mode
- **Vite** -- dev server and bundler
