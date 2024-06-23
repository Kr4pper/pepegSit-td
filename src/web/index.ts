import {Biome, Sitter, TowerDefense, convertToTiles, map1} from './game';

let canvas = document.querySelector('canvas')!;
let ctx = canvas.getContext('2d')!;
let keyPresses: Record<string, boolean> = {};

const TILE_SIZE = 50;
let lastMoved = 0;

const game = new TowerDefense(10, 10, convertToTiles(map1));
const tower1 = Sitter.at(2, 2);
const tower2 = Sitter.at(4, 2);
game.addTower(tower1);
game.addTower(tower2);

game.spawnEnemy(10);

window.addEventListener('keydown', keyDownListener);
function keyDownListener(event: KeyboardEvent) {
    keyPresses[event.key] = true;
}

window.addEventListener('keyup', keyUpListener);
function keyUpListener(event: KeyboardEvent) {
    keyPresses[event.key] = false;
}

const biomeToStyle = {
    [Biome.Track]: 'rgb(0, 0, 0)',
    [Biome.Buildable]: 'rgb(255, 127, 80)',
    [Biome.Occupied]: 'rgb(255, 127, 80)',
    [Biome.Blocked]: 'rgb(255, 255, 255)',
};

function drawGameFrame(game: TowerDefense) {
    game.tiles.forEach(({x, y, biome}) => {
        ctx.fillStyle = biomeToStyle[biome];
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, (x + 1) * TILE_SIZE, (y + 1) * TILE_SIZE);
    });
    game.enemies.forEach(e => {
        e.move();
        if (e.isDead() || e.trackIdx >= game.track.length) {
            game.spawnEnemy(1000);
            game.enemies.splice(0, 1);
        }
        console.log(e)

        ctx.drawImage(e.img, e.tileX * TILE_SIZE, e.tileY * TILE_SIZE);
    });
    game.towers.forEach(t => {
        t.attack(game.enemies);
        ctx.drawImage(t.img, t.tileX * TILE_SIZE, t.tileY * TILE_SIZE);
    });
}

function gameLoop() {
    /*
    if (keyPresses.w) moveCharacter(0, -1);
    else if (keyPresses.s) moveCharacter(0, 1);

    if (keyPresses.a) moveCharacter(-1, 0);
    else if (keyPresses.d) moveCharacter(1, 0);
    */

    drawGameFrame(game);
    window.requestAnimationFrame(gameLoop);
}

/*
function moveCharacter(deltaX, deltaY) {
    if (Date.now() - lastMoved < 300) return;

    console.log(game.enemies[0], deltaX, deltaY);

    if (deltaX !== 0 && game.enemies[0].tileX + deltaX >= 0 && (game.enemies[0].tileX + deltaX) * TILE_SIZE < canvas.width) {
        game.enemies[0].tileX += deltaX;
        lastMoved = Date.now();
        return;
    }
    if (deltaY !== 0 && game.enemies[0].tileY + deltaY >= 0 && (game.enemies[0].tileY + deltaY) * TILE_SIZE < canvas.height) {
        game.enemies[0].tileY += deltaY;
        lastMoved = Date.now();
        return;
    }
}
*/

gameLoop();
