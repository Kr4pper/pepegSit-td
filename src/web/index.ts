import {Biome, TowerDefense, convertToTiles, map1, SitterTower, KnightTower, Tower, defaultWaves} from './game';

const TILE_SIZE = 50;

let canvas = document.querySelector('canvas#td')! as HTMLCanvasElement;
let ctx = canvas.getContext('2d')!;
let keyPresses: Record<string, boolean> = {};

// TODO: swap to direct event handler?
window.addEventListener('keydown', keyDownListener);
function keyDownListener(event: KeyboardEvent) {
    keyPresses[event.key] = true;
}

window.addEventListener('keyup', keyUpListener);
function keyUpListener(event: KeyboardEvent) {
    keyPresses[event.key] = false;
}

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

const goldDisplay = document.querySelector('span#gold')!;
const updateGold = (gold: number) => {
    goldDisplay.innerHTML = gold.toString();
};

const hpDisplay = document.querySelector('span#hp')!;
const updateHp = (hp: number) => {
    hpDisplay.innerHTML = hp.toString();
};

const game = new TowerDefense(convertToTiles(map1), 100, 100, defaultWaves);
updateGold(game.playerGold);
updateHp(game.playerHp);

const TOWER_BUILD_KEYS: Record<string, [name: string, stats: string, cost: number, (x: number, y: number) => Tower]> = {
    '1': ['Sitter', '(aoe, low damage, medium range)', SitterTower.getCost(), (x, y) => new SitterTower(x, y)],
    '2': ['Knight', '(single target, medium damage, low range)', KnightTower.getCost(), (x, y) => new KnightTower(x, y)],
};

const renderTowerInfo = () => {
    const towersDiv = document.querySelector('div#towers')!;
    Object.entries(TOWER_BUILD_KEYS).forEach(([key, [name, stats, cost]]) => {
        towersDiv.innerHTML += `
        <div>
            <span>${name} [${key}]: ${stats}</span><br>
            <span>Cost: ${cost}</span>
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

    const [_, __, towerCost, towerBuilder] = TOWER_BUILD_KEYS[towerToBuild];
    if (game.playerGold < towerCost) return;

    game.playerGold -= towerCost;
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

        if (t.attack(game.enemies)) {
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
    updateHp(game.playerHp);

    window.requestAnimationFrame(gameLoop);
}

renderTowerInfo();

game.sendWave();
gameLoop();
