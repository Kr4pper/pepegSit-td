import {Biome} from './biome';
import {Enemy} from './enemy';
import {Tower} from './towers';

export class TowerDefense {
    public readonly enemies: Enemy[] = [];
    public readonly towers: Tower[] = [];
    public readonly tiles: {x: number, y: number, biome: Biome;}[] = [];
    public readonly track: {x: number, y: number;}[] = [];

    constructor(
        private dimX: number,
        private dimY: number,
        private map: Biome[][],
    ) {
        if (map.length !== dimY) throw `Map Y dimension mismatch, expected ${dimY} but got ${map.length}`;

        if (map[0]?.length !== dimX) throw `Map X dimension mismatch, expected ${dimX} but got ${map[0]?.length}`;

        for (let x = 0; x < dimX; x++) {
            for (let y = 0; y < dimY; y++) {
                this.tiles.push({x, y, biome: map[y][x]});
            }
        }

        this.traceTrack();
    }

    addEnemy(e: Enemy) {
        this.enemies.push(e);
    }

    spawnEnemy(hp: number) {
        this.addEnemy(new Enemy(this, 2000, hp));
    }

    addTower(t: Tower) {
        this.towers.push(t);
    }

    private traceTrack() {
        this.track.push({x: 0, y: 0});
        const visited = new Set<string>(['0,0']);
        let x = 0;
        let y = 0;
        while (true) {
            const directions = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
            const onTrack = directions.filter(([x, y]) => this.tileAt(x, y) === Biome.Track);
            const candidates = onTrack.filter(([x, y]) => !visited.has(`${x},${y}`));

            if (candidates.length === 0) {
                console.log(`Done building track: ${this.track.reduce((res, {x, y}) => res + `[${x},${y}] `, '')}`);
                console.log(this.track)
                return;
            }
            if (candidates.length > 1) {
                console.log([...visited]);
                throw new Error(`Unexpected amount of potential track extensions, expected 1 but got "${candidates}"`);
            }

            const [newX, newY] = candidates[0];
            x = newX;
            y = newY;
            this.track.push({x, y});
            console.log('adding to track', x, y);
            visited.add(`${x},${y}`);
        }
    }

    private tileAt(x: number, y: number) {
        return this.map.at(x)?.at(y);
    }
}
