import {Biome, TowerDefense, convertToTiles, map1, defaultWaves, TowerBaseStats, TowerType, TOWER_DATA, TowerStats} from './game';

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
const clearSelectedTile = () => selectedTile = [-1, -1];
canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

    if (selectedTile[0] === x && selectedTile[1] === y) {
        clearSelectedTile();
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

const TOWER_KEY_BINDINGS: Record<TowerType, string> = {
    [TowerType.Sitter]: '1',
    [TowerType.Knight]: '2',
};
const TOWER_STAT_UI_MAP: Record<keyof TowerStats, string> = {
    dmg: 'Damage',
    atkCooldown: 'Cooldown',
    range: 'Range',
};
const towerBuildingDataDisplay = document.querySelector('span#tower-building-data')!;
const renderTowerBuildingData = () => {
    towerBuildingDataDisplay.innerHTML = Object.entries(TOWER_DATA).reduce(
        (acc, [type, {stats}]) =>
            acc + `<div id="tower-${type}">
            <div>${type} [Key: ${TOWER_KEY_BINDINGS[type as TowerType]}]</div>
            <div style="margin-left: 20px;">Cost: <span id="stat-cost">${game.getTowerCost(type as TowerType)}</span></div>
            ${Object.entries(stats).filter(([k]) => (k as keyof TowerBaseStats) !== 'baseCost').reduce((acc, [k, v]) => acc +
                `<div style="margin-left: 20px;">${TOWER_STAT_UI_MAP[k as keyof TowerStats]}: <span id="stat-${k}">${v}</span></div>`,
                '')}
        </div><br>`,
        '');
};

const checkForTowerBuilding = () => {
    const [x, y] = selectedTile;
    if (!game.isBiome(Biome.Buildable, x, y)) return;

    const towerToBuild = Object.entries(TOWER_KEY_BINDINGS).find(([_, key]) => keyPresses[key]);
    if (!towerToBuild) return;

    const towerBuilt = game.buildTowerAt(towerToBuild[0] as TowerType, x, y);
    if (!towerBuilt) return;

    renderTowerBuildingData();
    updateGold(game.playerGold);
    clearSelectedTile();
};

const checkForTowerSelling = () => {
    const [x, y] = selectedTile;
    if (!game.isBiome(Biome.Tower, x, y)) return;
    if (!keyPresses['x']) return;

    const towerSold = game.sellTowerAt(x, y);
    if (!towerSold) return;

    renderTowerBuildingData();
    updateGold(game.playerGold);
    clearSelectedTile();
};

const selectedTowerStatsDisplay = document.querySelector('span#selected-tower')!;
const printSelectedTowerStats = () => {
    const [x, y] = selectedTile;
    const tower = game.getTowerAt(x, y);
    if (!tower) {
        selectedTowerStatsDisplay.innerHTML = `<span>&lt;no tower selected&gt;</span>`;
        return;
    }

    selectedTowerStatsDisplay.innerHTML = `
        <span>${tower.type} at (${x + 1} | ${y + 1}) damage stats:</span><br>
        <span style="margin-left: 20px;">Total: ${tower.getDmgDealtTotal()}</span><br>
        ${Object.entries(tower.getDmgDealtByType())
            .filter(([_, v]) => v > 0)
            .reduce((acc, [k, v]) => acc + `<span style="margin-left: 20px;">vs ${k}: ${v}</span><br>`, '')}
    `;
};

const processKeyPresses = () => {
    checkForTowerBuilding();
    checkForTowerSelling();
    printSelectedTowerStats();
};

const biomeStyles = {
    [Biome.Track]: 'rgb(0, 0, 0)',
    [Biome.Buildable]: 'rgb(255, 127, 80)',
    [Biome.Tower]: 'rgb(255, 127, 80)',
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

        if (t.attack(game.enemies, {dmg: 0})) { // TODO implement multipliers
            ctx.strokeStyle = 'white';
            ctx.strokeRect(t.tileX * TILE_SIZE, t.tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    });
};

const processEnemies = () => {
    for (let i = game.enemies.length - 1; i >= 0; i--) { // TODO sort by progress instead?
        const e = game.enemies[i];
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
    }
};

function gameLoop() {
    processKeyPresses();
    processTiles();
    processTowers();
    processEnemies();
    processSelectedTile();

    updateGold(game.playerGold);
    updateWave(game.waveIdx + 1);
    updateHp(game.playerHp);

    window.requestAnimationFrame(gameLoop);
}

renderTowerBuildingData();

game.sendWave();
gameLoop();
