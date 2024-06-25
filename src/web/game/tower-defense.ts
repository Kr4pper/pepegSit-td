import {Biome} from './biome';
import {Cardinal} from './cardinal';
import {ENEMY_SPAWN, Enemy} from './enemies';
import {TOWER_DATA, Tower, TowerType} from './towers';
import {Wave} from './waves';

const TOWER_COST_SCALING = 1.2;
const TOWER_SALE_GOLD_RECOVERY = 0.7;
const BASE_GOLD_REWARD_PER_WAVE = 25;
const SCALING_GOLD_REWARD_PER_WAVE = 5;

export class TowerDefense {
    public readonly enemies: Enemy[] = [];
    public readonly towers: Tower[] = [];
    public readonly tiles: {x: number, y: number, biome: Biome;}[] = [];
    public readonly track: {x: number, y: number; to: Cardinal; from: Cardinal;}[] = [];
    public waveIdx = 0;
    private towerCount: Record<TowerType, number> = {[TowerType.Sitter]: 0, [TowerType.Knight]: 0};

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

    private addEnemy(enemy: Enemy) {
        enemy.setGame(this);
        this.enemies.push(enemy);
    }

    private removeEnemy(e: Enemy) {
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

        if (this.playerHp <= 0) {
            alert('You lost + L + bozo');
        }

        this.removeEnemy(e);
        this.checkRemainingEnemies();
    }

    private checkRemainingEnemies() {
        if (!this.enemies.length) {
            if (this.waveIdx === this.waves.length - 1) {
                alert('You have defeated the final wave, endless mode coming soon™');
                return;
            }

            this.playerGold += BASE_GOLD_REWARD_PER_WAVE + this.waveIdx * SCALING_GOLD_REWARD_PER_WAVE; // TODO: modify wave gold reward here
            this.waveIdx++;
            this.sendWave();
        }
    }

    sendWave() {
        const wave = this.waves[this.waveIdx];

        let enemyIdx = 0;
        const spawner = setInterval(() => {
            this.addEnemy(ENEMY_SPAWN[wave[enemyIdx++]]());

            if (enemyIdx > wave.length - 1) {
                clearInterval(spawner);
            }
        }, (5000 + wave.length * 50) / wave.length); // TODO: modify wave spawn delay here
    }

    currentWave() {
        return this.waves[this.waveIdx];
    }

    getTowerCost(t: TowerType) {
        return Math.round(TOWER_DATA[t].stats.baseCost * Math.pow(TOWER_COST_SCALING, this.towerCount[t]));
    }

    /**
     * @returns true iff a tower has been successfuly bought
     */
    buildTowerAt(t: TowerType, x: number, y: number): boolean {
        if (!this.isBiome(Biome.Buildable, x, y)) return false;

        const cost = this.getTowerCost(t);
        if (cost > this.playerGold) return false;

        this.playerGold -= cost;
        this.addTower(TOWER_DATA[t].build(x, y));

        return true;
    }

    private addTower(t: Tower) {
        this.setBiome(Biome.Tower, t.tileX, t.tileY);
        this.towerCount[t.type]++;
        this.towers.push(t);
    }

    getTowerAt(x: number, y: number) {
        return this.towers.find(t => t.tileX === x && t.tileY === y);
    }

    /**
     * @returns true iff a tower has been sold
     */
    sellTowerAt(x: number, y: number): boolean {
        const toSell = this.getTowerAt(x, y);
        if (!toSell) return false;

        this.playerGold += TOWER_DATA[toSell.type].stats.baseCost * TOWER_SALE_GOLD_RECOVERY;
        this.removeTower(toSell);

        return true;
    }

    private removeTower(t: Tower) {
        this.setBiome(Biome.Buildable, t.tileX, t.tileY);
        this.towerCount[t.type]--;
        const tIdx = this.towers.findIndex(_t => _t === t);
        this.towers.splice(tIdx, 1);
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
}
