import {Biome, Enemy, Wippa, TowerDefense, convertToTiles, map1, SitterTower, KnightTower, Tower} from './game';

const TILE_SIZE = 50;

let canvas = document.querySelector('canvas')!;
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

const game = new TowerDefense(convertToTiles(map1), 100, 100);
updateGold(game.playerGold);
updateHp(game.playerHp);

const TOWER_BUILD_KEYS: Record<string, [string, number, (x: number, y: number) => Tower]> = {
    '1': ['Sitter (aoe, low damage, medium range)', SitterTower.getCost(), (x, y) => new SitterTower(x, y)],
    '2': ['Knight (single target, medium damage, low range)', KnightTower.getCost(), (x, y) => new KnightTower(x, y)],
};

const renderTutorial = () => {
    const tutorialDiv = document.querySelector('div#tutorial')!;
    const towersDiv = tutorialDiv.querySelector('div#towers')!;
    Object.entries(TOWER_BUILD_KEYS).forEach(([key, [description, cost]]) => {
        towersDiv.innerHTML += `
        <div>
            <span>Key: ${key}, Tower: ${description}, Cost: ${cost}</span>
        </div>
    `;
    });
};

const processKeyPresses = () => {
    const [x, y] = selectedTile;
    if (x === -1 || y === -1) return; // move down later maybe

    if (!game.isBiome(Biome.Buildable, x, y)) return;

    const towerToBuild: keyof typeof TOWER_BUILD_KEYS = Object.keys(TOWER_BUILD_KEYS).find(k => keyPresses[k]) as any;
    if (!towerToBuild) return;

    const [_, towerCost, towerBuilder] = TOWER_BUILD_KEYS[towerToBuild];
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

const processTiles = (game: TowerDefense) => {
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

const processTowers = (game: TowerDefense) => {
    game.towers.forEach(t => {
        ctx.drawImage(t.img, (t.tileX + 0.1) * TILE_SIZE, (t.tileY + 0.1) * TILE_SIZE, 0.8 * TILE_SIZE, 0.8 * TILE_SIZE);

        if (t.attack(game.enemies)) {
            ctx.strokeStyle = 'white';
            ctx.strokeRect(t.tileX * TILE_SIZE, t.tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    });
};

const processEnemies = (game: TowerDefense) => {
    game.enemies.forEach(e => {
        if (e.isDead()) {
            game.playerGold += e.goldValue;
            updateGold(game.playerGold);

            game.removeEnemy(e);
            game.addEnemy(new Enemy(e.secondsPerTile, e.dmg, Math.ceil(e.goldValue * 1.1), Math.ceil(e.maxHp * 1.1))); // TODO
            return;
        }

        e.move();

        if (e.reachedEndOfTrack()) {
            game.playerHp -= e.dmg;
            updateHp(game.playerHp);

            game.removeEnemy(e);
            game.addEnemy(new Enemy(e.secondsPerTile, e.dmg, Math.floor(e.maxHp * 0.9), Math.floor(e.goldValue * 0.9))); // TODO
        }
        else {
            const [x, y] = e.getPosition();
            ctx.drawImage(
                e.img,
                x * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.width),
                y * TILE_SIZE + 0.5 * (TILE_SIZE - e.img.height),
            );
        }
    });
};

function gameLoop() {
    processKeyPresses();
    processTiles(game);
    processSelectedTile();
    processTowers(game);
    processEnemies(game);

    window.requestAnimationFrame(gameLoop);
}

renderTutorial();

game.addEnemy(Wippa.withStats(10, 20)); // TODO spawn wave 1 instead
gameLoop();
