import {Enemy} from '../enemies';
import {Tower, TowerAttackEffects, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class KnightTower extends Tower {
    constructor(tileX: number, tileY: number, cost: number) {
        const stats = KnightTower.getBaseStats();

        super(
            TowerType.Knight,
            tileX,
            tileY,
            stats.dmg,
            stats.atkCooldown,
            stats.range,
            cost,
        );

        this.img.src = './knight.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return [enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress())[0]];
    }

    attackEffects(): TowerAttackEffects {
        return {};
    }

    setIdle(idle: boolean): void {}

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 2,
            atkCooldown: 1,
            range: 1.5,
            baseCost: 50,
        };
    }
}
