import {Biome, TowerDefense, convertToTiles, map1, defaultWaves, TowerBaseStats, TowerType, TOWER_DATA, TowerStats} from './game';

const TILE_SIZE = 50;
const game = new TowerDefense(convertToTiles(map1), 100, 100, defaultWaves);

let canvas = document.querySelector('canvas#td')! as HTMLCanvasElement;
let ctx = canvas.getContext('2d')!;

const checkForTowerBuilding = (key: string) => {
    const [x, y] = selectedTile;
    if (!game.isBiome(Biome.Buildable, x, y)) return;

    const towerToBuild = Object.entries(TOWER_KEY_BINDINGS).find(([_, _key]) => _key === key);
    if (!towerToBuild) return;

    const towerBuilt = game.buildTowerAt(towerToBuild[0] as TowerType, x, y);
    if (!towerBuilt) return;

    renderTowerBuildingData();
    updateGold(game.playerGold);
    clearSelectedTile();
};

const checkForTowerSelling = (key: string) => {
    if (key !== 'x') return;

    const [x, y] = selectedTile;
    if (!game.isBiome(Biome.Tower, x, y)) return;

    const towerSold = game.sellTowerAt(x, y);
    if (!towerSold) return;

    renderTowerBuildingData();
    updateGold(game.playerGold);
    clearSelectedTile();
};

const ffIconDisplay = document.getElementById('ff-icon')!;
let fastForward = false;
const checkForFastForward = (key: string) => {
    if (key !== ' ') return;

    fastForward = !fastForward;
    ffIconDisplay.style.visibility = fastForward ? 'visible' : 'hidden';
};

window.addEventListener('keydown', event => [
    checkForTowerBuilding,
    checkForTowerSelling,
    checkForFastForward,
].map(listener => listener(event.key)));

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
    [TowerType.Sniper]: '3',
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
const processTowers = () => {
    game.towers.forEach(t => {
        ctx.drawImage(t.img, (t.tileX + 0.1) * TILE_SIZE, (t.tileY + 0.1) * TILE_SIZE, 0.8 * TILE_SIZE, 0.8 * TILE_SIZE);

        if (t.attack(game.enemies, fastForward ? 3 : 1, {dmg: 0})) { // TODO implement multipliers
            ctx.strokeStyle = 'white';
            ctx.strokeRect(t.tileX * TILE_SIZE, t.tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    });
};

const processEnemies = () => {
    for (let i = game.enemies.length - 1; i >= 0; i--) { // TODO sort by progress instead?
        const e = game.enemies[i];
        if (e.move(fastForward ? 3 : 1)) {
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

const processSelectedTile = () => {
    const [x, y] = selectedTile;
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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
            .reduce((acc, [k, v]) => acc + `<span style="margin-left: 20px;">vs ${k}: ${Math.floor(v)}</span><br>`, '')}
    `;
};

function gameLoop() {
    processTiles();
    processTowers();
    processEnemies();
    processSelectedTile();
    printSelectedTowerStats();

    updateGold(game.playerGold);
    updateWave(game.waveIdx + 1);
    updateHp(game.playerHp);

    window.requestAnimationFrame(gameLoop);
}

renderTowerBuildingData();

game.start();
gameLoop();
