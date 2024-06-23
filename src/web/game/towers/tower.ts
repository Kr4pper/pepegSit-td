import {Enemy} from '../enemy';

export class Tower {
    public img = new Image();
    private lastAttacked = Date.now();

    constructor(
        public tileX: number,
        public tileY: number,
        private dmg: number,
        private atkInterval: number,
        private range: number,
    ) {
        this.img.src = './pepegSit.jpg';
    }

    attack(enemies: Enemy[]) {
        const now = Date.now();
        const mayAttack = now - this.lastAttacked > this.atkInterval * 1000;
        if (mayAttack) return;

        // attacks all enemies in range for now
        enemies
            .filter(e => Math.abs(e.tileX - this.tileX) + Math.abs(e.tileY - this.tileY) <= this.range)
            .forEach(e => e.takeDamage(this.dmg));

        this.lastAttacked = now;
    }
}
