import {Biome, TowerDefense, convertToTiles, map1, SitterTower, KnightTower, Tower, defaultWaves, TowerBaseStats} from './game';

const TILE_SIZE = 50;
const game = new TowerDefense(convertToTiles(map1), 100, 100, defaultWaves);

let canvas = document.querySelector('canvas#td')! as HTMLCanvasElement;
let ctx = canvas.getContext('2d')!;
let keyPresses: Record<string, boolean> = {};

// TODO: swap to direct event handler?
const keyDownListener = (event: KeyboardEvent) => keyPresses[event.key] = true;
window.addEventListener('keydown', keyDownListener);

const keyUpListener = (event: KeyboardEvent) => keyPresses[event.key] = false;
window.addEventListener('keyup', keyUpListener);

let selectedTile: [number, number] = [-1, -1];
canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

    if (selectedTile[0] === x && selectedTile[1] === y) {
        selectedTile = [-1, -1]; // clear selection
        return;
    }

    if (!game.isBiome(Biome.Buildable, x, y)) {
        selectedTile = [-1, -1];
        return;
    }

    selectedTile = [x, y];
});

const statsDisplay = document.querySelector('div#stats')!;
const goldDisplay = statsDisplay.querySelector('span#gold')!;
const updateGold = (gold: number) => goldDisplay.innerHTML = gold.toString();

const hpDisplay = statsDisplay.querySelector('span#hp')!;
const updateHp = (hp: number) => hpDisplay.innerHTML = hp.toString();

const waveDisplay = statsDisplay.querySelector('span#wave')!;
const updateWave = (wave: number) => waveDisplay.innerHTML = wave.toString();

const TOWER_BUILD_KEYS: Record<string, [name: string, type: string, stats: TowerBaseStats, (x: number, y: number) => Tower]> = {
    '1': ['Sitter', 'AOE', SitterTower.getBaseStats(), (x, y) => new SitterTower(x, y)],
    '2': ['Knight', 'Single Target', KnightTower.getBaseStats(), (x, y) => new KnightTower(x, y)],
};
const TOWER_STAT_UI_MAP: Record<keyof TowerBaseStats, string> = {
    dmg: 'Damage',
    atkCooldown: 'Cooldown',
    range: 'Range',
    cost: 'Cost',
};
const renderTowerInfo = () => {
    const towersDiv = document.querySelector('div#towers')!;
    Object.entries(TOWER_BUILD_KEYS).forEach(([key, [name, type, stats]]) => {
        towersDiv.innerHTML += `
        <div id="tower-${name}">
            <div>${name} [${key}]:</div>
            <div style="margin-left: 20px;"><span>Type: ${type}</span></div>
            ${Object.entries(stats).reduce((acc, [k, v]) => acc +
            `<div style="margin-left: 20px;">${TOWER_STAT_UI_MAP[k as keyof TowerBaseStats]}: <span id="stat-${k}">${v}</span></div>`,
            '')}
        </div>
        <br>
        `;
    });
};

const processKeyPresses = () => {
    const [x, y] = selectedTile;
    if (x === -1 || y === -1) return; // move down later maybe

    if (!game.isBiome(Biome.Buildable, x, y)) return;

    const towerToBuild: keyof typeof TOWER_BUILD_KEYS = Object.keys(TOWER_BUILD_KEYS).find(k => keyPresses[k]) as any;
    if (!towerToBuild) return;

    const [_, __, towerStats, towerBuilder] = TOWER_BUILD_KEYS[towerToBuild];
    if (game.playerGold < towerStats.cost) return;

    game.playerGold -= towerStats.cost;
    updateGold(game.playerGold);
    game.addTower(towerBuilder(x, y));
    game.setBiome(Biome.Occupied, x, y);
    selectedTile = [-1, -1];
};

const biomeStyles = {
    [Biome.Track]: 'rgb(0, 0, 0)',
    [Biome.Buildable]: 'rgb(255, 127, 80)',
    [Biome.Occupied]: 'rgb(255, 127, 80)',
    [Biome.Blocked]: 'rgb(255, 255, 255)',
};

const processTiles = () => {
    game.tiles.forEach(({x, y, biome}) => {
        ctx.fillStyle = biomeStyles[biome];
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, (x + 1) * TILE_SIZE, (y + 1) * TILE_SIZE);
    });
};

const processSelectedTile = () => {
    const [x, y] = selectedTile;
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
};

const processTowers = () => {
    game.towers.forEach(t => {
        ctx.drawImage(t.img, (t.tileX + 0.1) * TILE_SIZE, (t.tileY + 0.1) * TILE_SIZE, 0.8 * TILE_SIZE, 0.8 * TILE_SIZE);

        if (t.attack(game.enemies, {dmg: 1})) {
            ctx.strokeStyle = 'white';
            ctx.strokeRect(t.tileX * TILE_SIZE, t.tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    });
};

const processEnemies = () => {
    game.enemies.forEach(e => {
        if (e.move()) {
            const [x, y] = e.getPosition();
            ctx.drawImage(
                e.img,
                x * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.width),
                y * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.height),
            );

            // hp bar
            ctx.fillStyle = 'red';
            ctx.fillRect(
                x * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.width),
                y * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.height),
                e.hp / e.maxHp * 0.8 * TILE_SIZE,
                5,
            );
        }
    });
};

function gameLoop() {
    processKeyPresses();
    processTiles();
    processSelectedTile();
    processTowers();
    processEnemies();

    updateGold(game.playerGold);
    updateWave(game.currentWave().id);
    updateHp(game.playerHp);

    window.requestAnimationFrame(gameLoop);
}

renderTowerInfo();

game.sendWave();
gameLoop();
