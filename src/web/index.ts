import {Biome, Sitter, TowerDefense, convertToTiles, map1} from './game';

let canvas = document.querySelector('canvas')!;
let ctx = canvas.getContext('2d')!;
let keyPresses: Record<string, boolean> = {};

window.addEventListener('keydown', keyDownListener);
function keyDownListener(event: KeyboardEvent) {
    keyPresses[event.key] = true;
}

window.addEventListener('keyup', keyUpListener);
function keyUpListener(event: KeyboardEvent) {
    keyPresses[event.key] = false;
}

canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    console.log({x, y, biome: game.biomeAt(x, y), gold: game.playerGold});
    if (game.playerGold < TOWER_COST) return;
    if (!game.isBiome(Biome.Buildable, x, y)) return;

    game.playerGold -= TOWER_COST;
    updateGold(game.playerGold);
    game.addTower(Sitter.at(x, y));
    game.setBiome(Biome.Occupied, x, y);
});

const TILE_SIZE = 50;
const TOWER_COST = 100;

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

game.spawnEnemy(1, 10, 20, 2);

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

const processTowers = (game: TowerDefense) => {
    game.towers.forEach(t => {
        t.attack(game.enemies);
        ctx.drawImage(t.img, t.tileX * TILE_SIZE, t.tileY * TILE_SIZE);
    });
};

const processEnemies = (game: TowerDefense) => {
    game.enemies.forEach(e => {
        if (e.isDead()) {
            game.playerGold += e.goldValue;
            updateGold(game.playerGold);

            game.removeEnemy(e);
            game.spawnEnemy(1, Math.ceil(e.maxHp * 1.1), Math.ceil(e.goldValue * 1.1), e.secondsPerTile); // TODO
            return;
        }

        e.move();

        if (e.reachedEndOfTrack()) {
            game.playerHp -= e.dmg;
            updateHp(game.playerHp);

            game.removeEnemy(e);
            game.spawnEnemy(1, Math.floor(e.maxHp * 0.9), Math.floor(e.goldValue * 0.9), e.secondsPerTile); // TODO
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
    processTiles(game);
    processTowers(game);
    processEnemies(game);

    window.requestAnimationFrame(gameLoop);
}

gameLoop();
