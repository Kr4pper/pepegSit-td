import {Biome, TowerDefense, convertToTiles, map1, defaultWaves, TowerType, TOWER_DATA, map2, TowerData, AttackModifiers} from './game';

const MAPS = {map1, map2};

let canvas = document.querySelector('canvas#td')! as HTMLCanvasElement;
let ctx = canvas.getContext('2d')!;
let TILE_SIZE: number;
let game: TowerDefense;
let map = map1;

const checkForTowerBuilding = ({key}: KeyboardEvent) => {
    const [x, y] = selectedTile;
    if (!game.isBiome(Biome.Buildable, x, y)) return;

    const towerToBuild = Object.entries(TOWER_DISPLAY).find(([_, [_key]]) => _key === key);
    if (!towerToBuild) return;

    const towerBuilt = game.buildTowerAt(towerToBuild[0] as TowerType, x, y);
    if (!towerBuilt) return;

    renderTowerBuildingData();
    updateGold(game.playerGold);
    clearSelectedTile();
};

const checkForTowerSelling = ({key}: KeyboardEvent) => {
    if (key.toUpperCase() !== 'X') return;

    const [x, y] = selectedTile;
    if (!game.isBiome(Biome.Tower, x, y)) return;

    const towerSold = game.sellTowerAt(x, y);
    if (!towerSold) return;

    renderTowerBuildingData();
    updateGold(game.playerGold);
    clearSelectedTile();
};

const UPGRADE_KEYS: Record<string, keyof AttackModifiers> = {
    Q: 'dmg',
    W: 'attackCooldown',
    E: 'range',
};
const checkForTowerUpgrades = ({key}: KeyboardEvent) => {
    const upgrade = UPGRADE_KEYS[key.toUpperCase()];
    if (!upgrade) return;

    const [x, y] = selectedTile;
    const tower = game.getTowerAt(x, y);
    if (!tower) return;

    game.buyUpgrade(tower.type, upgrade);
    renderTowerBuildingData();
    updateGold(game.playerGold);
};

const fastForwardIconDisplay = document.getElementById('fast-forward-icon')!;
let gameSpeed = 1;
let fastForward = false;
const checkForFastForward = (event: KeyboardEvent) => {
    if (event.key !== ' ') return;
    event.preventDefault();

    fastForward = !fastForward;
    gameSpeed = fastForward ? 3 : 1;
    fastForwardIconDisplay.style.visibility = fastForward ? 'visible' : 'hidden';
};

window.addEventListener('keydown', event => [
    checkForTowerBuilding,
    checkForTowerSelling,
    checkForTowerUpgrades,
    checkForFastForward,
].map(listener => listener(event)));

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

const TOWER_DISPLAY: Record<TowerType, [key: string, description: string]> = {
    [TowerType.Sitter]: ['1', '3 targets'],
    [TowerType.Knight]: ['2', '1 target'],
    [TowerType.Sniper]: ['3', '1 elite target'],
    [TowerType.Ice]: ['4', 'aoe slow'],
};
const TOWER_STAT_ICONS: Partial<Record<keyof TowerData, string>> = {
    dmg: '<img src="sword.png" width="20px" height="20px" style="position: relative; top: 3px; padding-left: 5px;">',
    attackCooldown: '<img src="clock.png" width="20px" height="20px" style="position: relative; top: 3px; padding-left: 5px;">',
    range: '<img src="bow.png" width="20px" height="20px" style="position: relative; top: 3px; padding-left: 5px;">',
    baseCost: '<img src="coin.png" width="20px" height="20px" style="position: relative; top: 3px; padding-left: 5px;">',
};

const towerBuildingDataDisplay = document.querySelector('span#tower-building-data')!;
const renderTowerBuildingData = () => {
    towerBuildingDataDisplay.innerHTML = (Object.entries(TOWER_DATA) as [TowerType, TowerData][]).map(
        ([type, {dmg, attackCooldown, range}]) => `
            <div id="tower-${type}">
                <div>
                    [${TOWER_DISPLAY[type][0]}] ${type}, ${TOWER_DISPLAY[type][1]}, 
                    <span id="stat-cost">${TOWER_STAT_ICONS['baseCost']} ${game.getTowerCost(type)}</span>
                </div>
                <div style="margin-left: 20px;">
                    ${(Object.keys({dmg, attackCooldown, range}) as (keyof AttackModifiers)[]).map(k => `<span id="modifier-${k}">${TOWER_STAT_ICONS[k]} ${game.getTowerStats(type)[k]}</span>`).join('')}
                </div>
            </div>
        `
    ).join('');
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
    game.allTowersAttack(gameSpeed).forEach(t => {
        ctx.strokeStyle = 'white';
        ctx.strokeRect(t.tileX * TILE_SIZE, t.tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });

    game.towers.forEach(t => {
        ctx.drawImage(
            t.image,
            (t.tileX + 0.1) * TILE_SIZE,
            (t.tileY + 0.1) * TILE_SIZE,
            0.8 * TILE_SIZE,
            0.8 * TILE_SIZE,
        );
    });
};

const processEnemies = () => {
    for (let i = game.enemies.length - 1; i >= 0; i--) { // TODO sort by progress instead?
        const e = game.enemies[i];
        if (e.move(gameSpeed)) {
            const [x, y] = e.getPosition();
            ctx.drawImage(
                e.img,
                (x + 0.1) * TILE_SIZE,
                (y + 0.1) * TILE_SIZE,
                0.8 * TILE_SIZE,
                0.8 * TILE_SIZE,
            );

            // hp bar
            ctx.fillStyle = 'red';
            ctx.fillRect(
                (x + 0.1) * TILE_SIZE,
                (y + 0.1) * TILE_SIZE,
                e.hp / e.maxHp * 0.7 * TILE_SIZE,
                5,
            );

            /*
            NORMALIZED SMALL
            ctx.drawImage(
                e.img,
                x * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.width),
                y * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.height),
                0.8 * TILE_SIZE,
                0.8 * TILE_SIZE,
            );

            ctx.fillRect(
                x * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.width),
                y * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.height),
                e.hp / e.maxHp * 0.8 * TILE_SIZE,
                5,
            );
            */
        }
    }
};

const processSelectedTile = () => {
    const [x, y] = selectedTile;
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
};

const UPGRADE_KEYS_LOOKUP = Object.entries(UPGRADE_KEYS).reduce((acc, [k, v]) => ({...acc, [v]: k}), {}) as Record<keyof AttackModifiers, string>;
const selectedTowerStatsDisplay = document.querySelector('span#selected-tower')!;
const printSelectedTowerStats = () => {
    const [x, y] = selectedTile;
    const tower = game.getTowerAt(x, y);
    if (!tower) {
        selectedTowerStatsDisplay.innerHTML = `<span>&lt;no tower selected&gt;</span>`;
        return;
    }

    selectedTowerStatsDisplay.innerHTML = `
    <div>
        <span>${tower.type} at (${x + 1} | ${y + 1}) damage stats:</span><br>
        <span style="margin-left: 20px;">Total: ${tower.getDmgDealtTotal()}</span><br>
        ${Object.entries(tower.getDmgDealtByType())
            .filter(([_, v]) => v > 0)
            .reduce((acc, [k, v]) => acc + `<span style="margin-left: 20px;">vs ${k}: ${Math.floor(v)}</span><br>`, '')}
    </div>

    <div style="margin-top: 20px">
        <span>Available Upgrades:</span><br>
        ${(['dmg', 'attackCooldown', 'range'] as (keyof AttackModifiers)[])
            .map(k => `<span id="modifier-${k}" style="margin-left: 20px;">
                    [${UPGRADE_KEYS_LOOKUP[k]}] ${TOWER_STAT_ICONS[k]} ${game.getUpgradeCost(tower.type, k)} ${TOWER_STAT_ICONS['baseCost']}
                </span><br>`)
            .join('')}
    </div>`;

    ctx.beginPath();
    ctx.arc((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE, game.getTowerStats(tower.type).range * TILE_SIZE, 0, 2 * Math.PI, false);
    ctx.closePath();

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
};

const restartGame = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    game = new TowerDefense(convertToTiles(map), 100, 100, defaultWaves);
    TILE_SIZE = Math.min(canvas.width, canvas.height) / Math.max(game.dimX, game.dimY);
    game.start();
    gameLoop();
};
const restartButton = document.querySelector('button#restart')!;
restartButton.addEventListener('click', restartGame);

const mapSelection = document.querySelector('select#map-selection')! as HTMLSelectElement;
mapSelection.innerHTML = Object.keys(MAPS).reduce((acc, k) => acc + `<option value="${k}">${k === 'map2' ? 'try aoe abusing this one, radvo :smirk:' : k}</option>`, '');
const loadMap = () => {
    map = MAPS[mapSelection.value as keyof typeof MAPS];
    restartGame();
};
const pickMapButton = document.querySelector('button#load-map')!;
pickMapButton.addEventListener('click', loadMap);

function gameLoop() {
    processTiles();
    processTowers();
    processEnemies();
    processSelectedTile();
    printSelectedTowerStats();

    updateGold(game.playerGold);
    updateWave(game.waveIdx + 1);
    updateHp(game.playerHp);

    if (game.playerHp === 0) {
        restartGame();
    }

    window.requestAnimationFrame(gameLoop);
}

restartGame();
renderTowerBuildingData();

gameLoop();
