import {Enemy} from '../enemies';

export abstract class Tower {
    public img = new Image();
    private lastAttacked = Date.now();

    constructor(
        public tileX: number,
        public tileY: number,
        private dmg: number,
        private atkCooldown: number,
        private range: number,
    ) {}

    attack(enemies: Enemy[]) {
        const now = Date.now();
        const mayAttack = (now - this.lastAttacked) > this.atkCooldown * 1000;
        if (!mayAttack) return false;

        const inRange = enemies.filter(e => {
            const [x, y] = e.getPosition();
            const distance = Math.sqrt(Math.pow(this.tileX - x, 2) + Math.pow(this.tileY - y, 2));
            return distance <= this.range;
        });
        if (!inRange.length) return false;

        this.pickTargets(inRange).forEach(e => e.takeDamage(this.dmg));
        this.lastAttacked = now;
        return true;
    }

    abstract pickTargets(enemies: Enemy[]): Enemy[];
}
