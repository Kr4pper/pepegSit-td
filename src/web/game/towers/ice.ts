import {Enemy} from '../enemies';
import {Tower, TowerAttackEffects, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class IceTower extends Tower {
    constructor(tileX: number, tileY: number, cost: number) {
        const stats = IceTower.getBaseStats();

        super(
            TowerType.Ice,
            tileX,
            tileY,
            stats.dmg,
            stats.atkCooldown,
            stats.range,
            cost,
        );

        this.img.src = './ice.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return enemies;
    }

    setIdle(idle: boolean): void {}

    attackEffects(): TowerAttackEffects {
        return {
            slow: {
                effect: 0.3,
                durationSeconds: 1,
            }
        };
    }

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 0,
            atkCooldown: 0.5,
            range: 2,
            baseCost: 50,
        };
    }
}
