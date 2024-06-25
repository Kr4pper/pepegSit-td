import {Biome} from './biome';
import {Cardinal} from './cardinal';
import {Enemy} from './enemies';
import {TOWER_DATA, Tower} from './towers';
import {Wave} from './waves';

export class TowerDefense {
    public readonly enemies: Enemy[] = [];
    public readonly towers: Tower[] = [];
    public readonly tiles: {x: number, y: number, biome: Biome;}[] = [];
    public readonly track: {x: number, y: number; to: Cardinal; from: Cardinal;}[] = [];
    private waveIdx = 0;

    constructor(
        private map: Biome[][],
        public playerHp: number,
        public playerGold: number,
        private waves: Wave[],
    ) {
        for (let x = 0; x < map[0].length; x++) {
            for (let y = 0; y < map.length; y++) {
                this.tiles.push({x, y, biome: map[y][x]});
            }
        }

        this.traceTrack();
    }

    addEnemy(enemy: Enemy) {
        enemy.setGame(this);
        this.enemies.push(enemy);
    }

    removeEnemy(e: Enemy) {
        const eIdx = this.enemies.findIndex(_e => _e === e);
        this.enemies.splice(eIdx, 1);
    }

    killEnemy(e: Enemy) {
        this.playerGold += e.goldValue;
        this.removeEnemy(e);
        this.checkRemainingEnemies();
    }

    leakEnemy(e: Enemy) {
        this.playerHp -= e.dmg;
        this.removeEnemy(e);
        this.checkRemainingEnemies();
    }

    private checkRemainingEnemies() {
        if (!this.enemies.length) {
            if (this.waveIdx === this.waves.length - 1) {
                console.log('last wave has been defeated, endless mode coming soonTM');
                return;
            }

            this.playerGold += this.waves[this.waveIdx].goldReward;
            this.waveIdx++;
            this.sendWave();
        }
    }

    addTower(t: Tower) {
        this.towers.push(t);
    }

    sellTowerAt(x: number, y: number) {
        const toSell = this.towers.find(t => t.tileX === x && t.tileY === y);
        if (!toSell) {
            return;
        }

        this.playerGold += TOWER_DATA[toSell.type].stats.cost * 0.7;
        const tIdx = this.towers.findIndex(_t => _t === toSell);
        this.towers.splice(tIdx, 1);
        this.setBiome(Biome.Buildable, x, y);
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
                return;
            }

            if (candidates.length > 1) {
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

    sendWave() {
        const wave = this.waves[this.waveIdx];

        let enemyIdx = 0;
        const spawner = setInterval(() => {
            this.addEnemy(wave.enemies[enemyIdx++]);

            if (enemyIdx > wave.enemies.length - 1) {
                clearInterval(spawner);
            }
        }, wave.spawnDelay * 1000);
    }

    currentWave() {
        return this.waves[this.waveIdx];
    }
}
