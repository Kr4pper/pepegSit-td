import {Biome} from './biome';
import {Cardinal} from './cardinal';
import {Enemy} from './enemy';
import {Tower} from './towers';

export class TowerDefense {
    public readonly enemies: Enemy[] = [];
    public readonly towers: Tower[] = [];
    public readonly tiles: {x: number, y: number, biome: Biome;}[] = [];
    public readonly track: {x: number, y: number; to: Cardinal; from: Cardinal;}[] = [];

    constructor(
        private map: Biome[][],
        public playerHp: number,
        public playerGold: number,
    ) {
        for (let x = 0; x < map[0].length; x++) {
            for (let y = 0; y < map.length; y++) {
                this.tiles.push({x, y, biome: map[y][x]});
            }
        }

        this.traceTrack();
    }

    addEnemy(e: Enemy) {
        this.enemies.push(e);
    }

    spawnEnemy(dmg: number, hp: number, goldValue: number, secondsPerTile: number) {
        this.addEnemy(new Enemy(this, secondsPerTile, dmg, goldValue, hp));
    }

    removeEnemy(e: Enemy) {
        const eIdx = this.enemies.findIndex(_e => _e === e);
        this.enemies.splice(eIdx, 1);
    }

    addTower(t: Tower) {
        this.towers.push(t);
    }

    biomeAt(x: number, y: number) {
        return this.map.at(y)?.at(x);
    }

    isBiome(biome: Biome, x: number, y: number) {
        return this.biomeAt(x, y) === biome;
    }

    setBiome(biome: Biome, x: number, y: number) {
        this.map[y][x] = biome;
    }

    private traceTrack() {
        this.track.push({x: 0, y: 0, to: Cardinal.North, from: Cardinal.North}); // placeholder cardinals, replace after track extended once
        const visited = new Set<string>(['0,0']);
        let x = 0;
        let y = 0;
        let from: Cardinal;
        while (true) {
            const directions = [
                [x + 1, y, Cardinal.West],
                [x - 1, y, Cardinal.East],
                [x, y + 1, Cardinal.North],
                [x, y - 1, Cardinal.South],
            ];
            const onTrack = directions.filter(([x, y]) => this.isBiome(Biome.Track, x, y));
            const candidates = onTrack.filter(([x, y]) => !visited.has(`${x},${y}`));

            if (candidates.length === 0) {
                console.log(this.track);
                return;
            }

            if (candidates.length > 1) {
                console.warn(`Previously visited: ${[...visited]}`);
                throw new Error(`Unexpected amount of potential track extensions, expected 1 but got "${candidates}"`);
            }

            [x, y, from] = candidates[0];

            if (this.track.length === 1) {
                this.track[0].from = from; // fix cardinals of entry tile
            }

            this.track[this.track.length - 1].to = (from + 2) % 4; // the previous tile goes to our tile
            this.track.push({x, y, from, to: (from + 2) % 4}); // default init to for last tile
            visited.add(`${x},${y}`);
        }
    }
}
