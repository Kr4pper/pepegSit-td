import {Enemy} from '../enemy';

export class Tower {
    public img = new Image();
    private lastAttacked = Date.now();

    constructor(
        public tileX: number,
        public tileY: number,
        private dmg: number,
        private atkCooldown: number,
        private range: number,
    ) {
        this.img.src = './pepegSit.jpg';
    }

    attack(enemies: Enemy[]) {
        const now = Date.now();
        const mayAttack = (now - this.lastAttacked) > this.atkCooldown * 1000;
        if (!mayAttack) return;

        // attacks all enemies in range for now, maybe only attack first later on depending on tower type?
        enemies
            .filter(e => {
                const [x, y] = e.getPosition();
                const distance = Math.sqrt(Math.pow(this.tileX + 0.5 - x, 2) + Math.pow(this.tileY + 0.5 - y, 2));
                return distance <= this.range;
            })
            .forEach(e => e.takeDamage(this.dmg));

        this.lastAttacked = now;
    }
}
