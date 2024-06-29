import {ENEMY_SPAWNER, Enemy, EnemyType} from '../enemies';
import {AttackModifiers, TOWER_DATA, TowerData} from './tower-data';
import {TowerType} from './tower-type';

export class Tower {
    private dmg: TowerData['dmg'];
    private attackCooldown: TowerData['attackCooldown'];
    private range: TowerData['range'];
    private attackEffects: TowerData['attackEffects'];
    private pickTargets: TowerData['pickTargets'];

    public image = new Image();
    private activeImage = new Image();
    private idleImage = new Image();
    private lastAttacked = Number.NEGATIVE_INFINITY;
    private currentlyIdle = false;

    private dmgDealtTotal = 0;
    private dmgDealtByType: Record<EnemyType, number> = Object.keys(ENEMY_SPAWNER).reduce((acc, k) => ({...acc, [k]: 0}), {}) as any;

    constructor(
        public type: TowerType,
        public tileX: number,
        public tileY: number,
        private cost: number,
    ) {
        const {dmg, attackCooldown: atkCooldown, range, attackEffects, pickTargets, imageSrc} = TOWER_DATA[type];
        this.dmg = dmg;
        this.attackCooldown = atkCooldown;
        this.range = range;
        this.attackEffects = attackEffects;
        this.pickTargets = pickTargets;

        this.activeImage.src = imageSrc.active;
        this.idleImage.src = imageSrc.idle ? imageSrc.idle : imageSrc.active;
        this.image = this.activeImage;
    }

    /**
     * @returns true iff an attack was made
     */
    attack(enemies: Enemy[], timeMultiplier: number, modifiers?: Partial<AttackModifiers>): boolean {
        const inRange = enemies.filter(e => {
            const [x, y] = e.getPosition();
            const distance = Math.sqrt(Math.pow(this.tileX - x, 2) + Math.pow(this.tileY - y, 2));
            return distance <= (this.range + (modifiers?.range || 0));
        });
        if (!inRange.length) {
            this.setIdle(true);
            return false;
        }
        this.setIdle(false);

        const now = Date.now();
        const elapsed = (now - this.lastAttacked) * timeMultiplier;
        const mayAttack = elapsed * (modifiers?.attackCooldown || 1) > this.attackCooldown * 1000;
        if (!mayAttack) return false;

        for (const e of this.pickTargets(inRange)) {
            const dmg = e.takeDamage(this.dmg + (modifiers?.dmg || 0));
            this.dmgDealtByType[e.type] += dmg;
            this.dmgDealtTotal += dmg;

            if (this.attackEffects?.slow) {
                e.applySlow(this.attackEffects.slow.effect, this.attackEffects.slow.durationSeconds);
            }
        }
        this.lastAttacked = now;
        return true;
    }

    setIdle(idle: boolean): void {
        if (idle !== this.currentlyIdle) {
            this.image = idle ? this.idleImage : this.activeImage;
        }

        this.currentlyIdle = idle;
    };

    getCost() {
        return this.cost;
    }

    getRange() {
        return this.range;
    }

    getDmgDealtTotal() {
        return Math.round(this.dmgDealtTotal);
    }

    getDmgDealtByType() {
        return this.dmgDealtByType;
    }
}
