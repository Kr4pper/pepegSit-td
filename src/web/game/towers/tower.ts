import {Enemy, EnemyType} from '../enemies';
import {TowerType} from './tower-type';

export type TowerStats = {
    dmg?: number;
    atkCooldown?: number;
    range?: number;
};

export type TowerBaseStats = Required<TowerStats> & {
    cost: number;
};

export abstract class Tower {
    public img = new Image();
    private dmgDealtTotal = 0;
    private dmgDealtByType: Record<EnemyType, number> = {[EnemyType.Wippa]: 0, [EnemyType.Weirdge]: 0};
    private lastAttacked = Date.now();

    constructor(
        public type: TowerType,
        public tileX: number,
        public tileY: number,
        private dmg: number,
        private atkCooldown: number,
        private range: number,
        private cost: number,
    ) {}

    /**
     * @returns true iff an attack was made
     */
    attack(enemies: Enemy[], modifiers?: TowerStats): boolean {
        const now = Date.now();
        const mayAttack = (now - this.lastAttacked * (modifiers?.atkCooldown || 1)) > this.atkCooldown * 1000;
        if (!mayAttack) return false;

        const inRange = enemies.filter(e => {
            const [x, y] = e.getPosition();
            const distance = Math.sqrt(Math.pow(this.tileX - x, 2) + Math.pow(this.tileY - y, 2));
            return distance <= (this.range + (modifiers?.range || 0));
        });
        if (!inRange.length) return false;

        for (const e of this.pickTargets(inRange)) {
            const dmg = e.takeDamage(this.dmg + (modifiers?.dmg || 0));
            this.dmgDealtTotal += dmg;
            this.dmgDealtByType[e.type] += dmg;
        }
        this.lastAttacked = now;
        return true;
    }

    value() {
        return this.cost;
    }

    getDmgDealtTotal() {
        return this.dmgDealtTotal;
    }

    getDmgDealtByType() {
        return this.dmgDealtByType;
    }

    /**
     * Delegates target selection to tower implementation
     * @param enemies available targets in range of the tower
     */
    abstract pickTargets(enemies: Enemy[]): Enemy[];
}
