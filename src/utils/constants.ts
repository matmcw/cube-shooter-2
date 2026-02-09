/* ───────────────────── Platform ───────────────────── */
export const PLATFORM_WIDTH = 60;
export const PLATFORM_DEPTH = 60;
export const PLATFORM_THICKNESS = 2;
export const PLATFORM_Y = 0;

/* ───────────────────── Player ───────────────────── */
export const PLAYER_HEIGHT = 2.4;
export const PLAYER_RADIUS = 0.4;
export const PLAYER_SPEED = 10;
export const PLAYER_SPRINT_MULT = 1.5;
export const PLAYER_JUMP_FORCE = 12;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_START_Y = PLATFORM_Y + PLATFORM_THICKNESS / 2 + PLAYER_HEIGHT / 2;

/* ───────────────────── Physics ───────────────────── */
export const GRAVITY = -20;
export const GROUND_LEVEL = PLATFORM_Y + PLATFORM_THICKNESS / 2;

/* ───────────────────── Weapon ───────────────────── */
export const FIRE_RATE = 0.15; // seconds between shots
export const WEAPON_DAMAGE = 25;
export const WEAPON_RANGE = 200;

/* ───────────────────── Projectile ───────────────────── */
export const PROJECTILE_SPEED = 120;
export const PROJECTILE_LENGTH = 1.5;
export const PROJECTILE_RADIUS = 0.06;
export const COLOR_PROJECTILE = 0xff2020;
export const COLOR_PROJECTILE_EMISSIVE = 0xff0000;

/* ───────────────────── Cubes (enemies) ───────────────────── */
export const CUBE_SIZE = 1.0;
export const CUBE_BASE_SPEED = 4;
export const CUBE_BASE_HEALTH = 50;
export const CUBE_CONTACT_DAMAGE = 15;
export const CUBE_SPAWN_DISTANCE = 28; // distance from center they spawn at

/* ───────────────────── Coins ───────────────────── */
export const COIN_SIZE = 0.3;
export const COIN_VALUE = 10;
export const COIN_MAGNET_RADIUS = 6;
export const COIN_MAGNET_SPEED = 12;
export const COIN_FLOAT_HEIGHT = 0.8;
export const COIN_LIFETIME = 15; // seconds before despawning

/* ───────────────────── Waves ───────────────────── */
export const WAVE_BASE_COUNT = 5;
export const WAVE_COUNT_INCREASE = 3;
export const WAVE_SPAWN_INTERVAL = 1.2; // seconds between cube spawns
export const WAVE_BREAK_DURATION = 5; // seconds between waves (shop time)

/* ───────────────────── Colors ───────────────────── */
export const COLOR_PLATFORM = 0x1a1a2e;
export const COLOR_PLATFORM_EDGE = 0x16213e;
export const COLOR_GRID = 0x0f3460;
export const COLOR_SKY = 0x0a0a1a;
export const COLOR_CUBE_BASE = 0xe94560;
export const COLOR_CUBE_HIT = 0xffffff;
export const COLOR_COIN = 0xffd700;
export const COLOR_CROSSHAIR = 0xffffff;
export const COLOR_HEALTH_BAR = 0x4ecca3;
export const COLOR_HEALTH_BAR_BG = 0x333333;
export const COLOR_MUZZLE_FLASH = 0xffaa00;
