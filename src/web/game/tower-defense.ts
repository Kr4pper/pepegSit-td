import {Biome} from './biome';
import {Cardinal} from './cardinal';
import {ENEMY_SPAWNER, Enemy, EnemyType} from './enemies';
import {AttackModifiers, TOWER_DATA, Tower, TowerData, TowerType} from './towers';
import {Wave} from './waves';

const generateEndlessSpawnTable = () => {
    const sorted = Object.entries(ENDLESS_SPAWN_TICKETS).sort(([_, w1], [__, w2]) => w1 - w2);
    const normalization = 1 / sorted.reduce((sum, [_, v]) => sum + v, 0);
    const cutoffs = sorted.map(([k, v]) => [k, v * normalization] as const);
    const spawnChunks: [EnemyType, number][] = [];
    let sum = 0;
    for (const [k, v] of cutoffs) {
        sum += v;
        spawnChunks.push([k as EnemyType, sum]);
    }
    return spawnChunks;
};

const TOWER_COST_SCALING = 1.2;
const TOWER_SALE_GOLD_RECOVERY = 0.7;

const UPGRADE_BASE_COST = 50;
const UPGRADE_COST_SCALING = 1.5;
const UPGRADE_EFFECT_SCALING: Record<keyof AttackModifiers, number> = {
    dmg: 1.1,
    range: 1.1,
    attackCooldown: 0.9,
};

const BASE_GOLD_REWARD_PER_WAVE = 25;
const SCALING_GOLD_REWARD_PER_WAVE = 5;

const ENDLESS_HP_SCALING_PER_WAVE = 1.1;
const ENDLESS_WEIGHT_SCALING_PER_WAVE = 1.2;
const ENDLESS_SPAWN_TICKETS: Record<EnemyType, number> = {
    [EnemyType.Wippa]: 5,
    [EnemyType.Weirdge]: 1,
    [EnemyType.PeepoRun]: 2,
};
const ENDLESS_SPAWN_WEIGHTS: Record<EnemyType, number> = {
    [EnemyType.Wippa]: 1,
    [EnemyType.Weirdge]: 5,
    [EnemyType.PeepoRun]: 2,
};
const ENDLESS_SPAWN_CHUNKS = generateEndlessSpawnTable();

export class TowerDefense {
    public readonly dimX: number;
    public readonly dimY: number;
    public readonly enemies: Enemy[] = [];
    public readonly towers: Tower[] = [];
    public readonly tiles: {x: number, y: number, biome: Biome;}[] = [];
    public readonly track: {x: number, y: number; to: Cardinal; from: Cardinal;}[] = [];
    public waveIdx = 0;
    private towerCount: Record<TowerType, number> = Object.keys(TOWER_DATA).reduce((acc, k) => ({...acc, [k]: 0}), {}) as any;
    private activeEnemies = 0;
    private upgrades: Record<TowerType, Record<keyof AttackModifiers, number>> = Object.keys(TOWER_DATA).reduce((acc, k) => ({
        ...acc,
        [k]: {dmg: 1, attackCooldown: 1, range: 1},
    }), {} as Record<keyof AttackModifiers, number>) as any;
    private upgradeLevels: Record<TowerType, Record<keyof AttackModifiers, number>> = Object.keys(TOWER_DATA).reduce((acc, k) => ({
        ...acc,
        [k]: {dmg: 0, attackCooldown: 0, range: 0},
    }), {} as Record<keyof AttackModifiers, number>) as any;

    constructor(
        private map: Biome[][],
        public playerHp: number,
        public playerGold: number,
        private waves: Wave[],
    ) {
        this.dimX = map[0].length;
        this.dimY = map.length;

        for (let x = 0; x < this.dimX; x++) {
            for (let y = 0; y < this.dimY; y++) {
                this.tiles.push({x, y, biome: map[y][x]});
            }
        }

        this.traceTrack();
    }

    start() {
        this.sendPredeterminedWave();
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
        this.activeEnemies--;
        const eIdx = this.enemies.findIndex(_e => _e === e);
        this.enemies.splice(eIdx, 1);
        this.checkRemainingEnemies();
    }

    killEnemy(e: Enemy) {
        this.playerGold += e.goldValue;
        this.removeEnemy(e);
    }

    leakEnemy(e: Enemy) {
        this.playerHp -= e.dmg;

        if (this.playerHp <= 0) {
            alert('You lost + L + bozo');
        }

        this.removeEnemy(e);
    }

    private checkRemainingEnemies() {
        if (this.activeEnemies > 0) {
            return;
        }

        this.playerGold += BASE_GOLD_REWARD_PER_WAVE + this.waveIdx * SCALING_GOLD_REWARD_PER_WAVE; // TODO: modify wave gold reward here
        this.waveIdx++;

        if (this.waveIdx < this.waves.length) {
            this.sendPredeterminedWave();
            return;
        }

        if (this.waveIdx === this.waves.length) {
            alert('You have defeated the final wave and entered endless mode');
        }

        this.sendEndlessWave(Math.round(10 * Math.pow(ENDLESS_WEIGHT_SCALING_PER_WAVE, this.waveIdx)));
    }

    private sendEndlessWave(spawnWeightSum: number) {
        const wave: Wave = [];
        let rng: number;
        while (true) {
            rng = Math.random();
            const next = ENDLESS_SPAWN_CHUNKS.find(([_, v]) => rng < v)![0];
            spawnWeightSum -= ENDLESS_SPAWN_WEIGHTS[next];
            if (spawnWeightSum < 0) {
                const hpMultiplier = Math.pow(ENDLESS_HP_SCALING_PER_WAVE, this.waveIdx - this.waves.length);
                this.spawnWave(wave, hpMultiplier);
                return;
            }
            wave.push(next);
        }
    }

    private sendPredeterminedWave() {
        this.spawnWave(this.waves[this.waveIdx]);
    }

    private spawnWave(wave: Wave, hpMultiplier = 1) {
        this.activeEnemies += wave.length;

        let enemyIdx = 0;
        const spawner = setInterval(() => {
            this.addEnemy(ENEMY_SPAWNER[wave[enemyIdx++]](hpMultiplier));

            if (enemyIdx > wave.length - 1) {
                clearInterval(spawner);
            }
        }, (1000 + wave.length * 150) / wave.length);
    }

    getTowerCost(t: TowerType) {
        return Math.round(TOWER_DATA[t].baseCost * Math.pow(TOWER_COST_SCALING, this.towerCount[t]));
    }

    getTowerStats(t: TowerType): AttackModifiers {
        return (Object.entries(this.upgrades[t]) as [keyof AttackModifiers, number][])
            .reduce((acc, [k, v]) => ({...acc, [k]: Math.round(100 * TOWER_DATA[t][k] * v) / 100}), {} as AttackModifiers);
    }

    getUpgradeCost(t: TowerType, stat: keyof AttackModifiers) {
        return Math.round(UPGRADE_BASE_COST * Math.pow(UPGRADE_COST_SCALING, this.upgradeLevels[t][stat]));
    }

    buyUpgrade(t: TowerType, stat: keyof AttackModifiers) {
        const cost = this.getUpgradeCost(t, stat);
        if (this.playerGold < cost) return;

        this.upgradeLevels[t][stat]++;
        this.upgrades[t][stat] *= UPGRADE_EFFECT_SCALING[stat];

        this.playerGold -= cost;
    }

    /**
     * @returns true iff a tower has been successfuly bought
     */
    buildTowerAt(t: TowerType, x: number, y: number): boolean {
        if (!this.isBiome(Biome.Buildable, x, y)) return false;

        const cost = this.getTowerCost(t);
        if (cost > this.playerGold) return false;

        this.playerGold -= cost;
        this.addTower(new Tower(t, x, y, cost));

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

        this.playerGold += Math.round(toSell.getCost() * TOWER_SALE_GOLD_RECOVERY);
        this.removeTower(toSell);

        return true;
    }

    private removeTower(t: Tower) {
        this.setBiome(Biome.Buildable, t.tileX, t.tileY);
        this.towerCount[t.type]--;
        const tIdx = this.towers.findIndex(_t => _t === t);
        this.towers.splice(tIdx, 1);
    }

    public allTowersAttack(gameSpeed: number) {
        return this.towers.filter(t => t.attack(this.enemies, gameSpeed, this.upgrades[t.type]));
    }

    biomeAt(x: number, y: number) {
        return this.map[y]?.[x];
    }

    isBiome(biome: Biome, x: number, y: number) {
        return this.biomeAt(x, y) === biome;
    }

    setBiome(biome: Biome, x: number, y: number) {
        this.map[y][x] = biome;
    }
}
