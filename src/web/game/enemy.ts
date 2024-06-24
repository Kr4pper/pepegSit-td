import {Cardinal} from './cardinal';
import {TowerDefense} from './tower-defense';

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

    constructor(
        private game: TowerDefense,
        public readonly secondsPerTile: number,
        public readonly dmg: number,
        public readonly goldValue: number,
        public readonly maxHp: number,
        private hp: number = maxHp,
    ) {
        this.img.src = './wippa.png';
    }

    move() {
        const now = Date.now();
        const elapsed = now - this.lastMoved;

        this.progress += elapsed / this.secondsPerTile / 1000;
        this.lastMoved = now;
    }

    takeDamage(incoming: number) {
        this.hp -= incoming;
        console.log(`Remaining HP: ${this.hp} / ${this.maxHp}`);
    }

    isDead() {
        return this.hp <= 0;
    }

    private trackIdx() {
        return Math.floor(this.progress);
    }

    reachedEndOfTrack() {
        return this.trackIdx() >= this.game.track.length;
    }

    getPosition() {
        const tile = this.game.track[this.trackIdx()];
        const partial = this.progress % 1;
        const [dx, dy] = CARDINAL_TO_DELTA[partial < 0.5 ? tile.from : tile.to];
        const scaled = partial < 0.5 ? (0.5 - partial) : (partial - 0.5);

        return [
            tile.x + scaled * dx,
            tile.y + scaled * dy,
        ];
    }
}
