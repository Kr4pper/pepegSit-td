import {TowerDefense} from './tower-defense';

export class Enemy {
    public readonly img = new Image();
    public trackIdx = 0;
    private lastMoved = Date.now();

    constructor(
        private game: TowerDefense,
        private movementDelay: number,
        private maxHp: number,
        private hp: number = maxHp,
    ) {
        this.img.src = './enemy.png';
    }

    get tileX() {
        return this.game.track[this.trackIdx].x;
    }

    get tileY() {
        return this.game.track[this.trackIdx].y;
    }

    move() {
        const now = Date.now();
        const mayMove = now - this.lastMoved > this.movementDelay * 1000;
        if (mayMove) return;

        this.trackIdx++;
        this.lastMoved = now;
    }

    takeDamage(incoming: number) {
        this.hp -= incoming;
        console.log(`Remaining HP: ${this.hp} / ${this.maxHp}`);
    }

    isDead() {
        return this.hp <= 0;
    }
}
