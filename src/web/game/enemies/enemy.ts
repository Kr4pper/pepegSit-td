import {Cardinal} from '../cardinal';
import {TowerDefense} from '../tower-defense';
import {EnemyType} from './enemy-type';

const CARDINAL_TO_DELTA = {
    [Cardinal.North]: [0, -1],
    [Cardinal.East]: [1, 0],
    [Cardinal.South]: [0, 1],
    [Cardinal.West]: [-1, 0],
};

export class Enemy {
    public readonly img = new Image();
    private progress = 0;
    private lastMoved = Date.now();
    private game: TowerDefense;
    private slowPercent = 0;
    private slowRemainingSeconds = 0;

    constructor(
        public type: EnemyType,
        public readonly secondsPerTile: number,
        public readonly dmg: number,
        public readonly goldValue: number,
        public readonly maxHp: number,
        public hp: number = maxHp,
    ) {}

    setGame(game: TowerDefense) {
        this.game = game;
    }

    move(timeMultiplier: number) {
        const now = Date.now();
        const elapsed = (now - this.lastMoved) * timeMultiplier;

        this.slowRemainingSeconds -= elapsed;
        if (this.slowPercent && this.slowRemainingSeconds <= 0) {
            this.slowPercent = 0;
        }

        this.progress += (elapsed / this.secondsPerTile / 1000) * (1 - this.slowPercent);
        this.lastMoved = now;

        if (!this.leakAtEndOfTrack()) return true;
    }

    /**
     * @returns damage dealt to the enemy
     */
    takeDamage(incoming: number): number {
        this.hp -= incoming;

        if (this.hp <= 0) this.game.killEnemy(this);

        return incoming + (this.hp < 0 ? this.hp : 0); // do not count overkill as dmg taken
    }

    applySlow(slowPercent: number, durationSec: number) {
        if (this.slowPercent > slowPercent) {
            return; // do not overwrite a stronger slow effect
        }

        this.slowPercent = slowPercent;
        this.slowRemainingSeconds = durationSec * 1000;
    }

    private leakAtEndOfTrack() {
        const reachedEnd = this.progress >= this.game.track.length;
        if (reachedEnd) this.game.leakEnemy(this);

        return reachedEnd;
    }

    getProgress() {
        return this.progress;
    }

    getPosition() {
        const tile = this.game.track[Math.floor(this.progress)];
        const partial = this.progress % 1;
        const [dx, dy] = CARDINAL_TO_DELTA[partial < 0.5 ? tile.from : tile.to];
        const scaled = partial < 0.5 ? (0.5 - partial) : (partial - 0.5);

        return [
            tile.x + scaled * dx,
            tile.y + scaled * dy,
        ];
    }
}
