import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class SniperTower extends Tower {
    constructor(tileX: number, tileY: number) {
        const stats = SniperTower.getBaseStats();

        super(
            TowerType.Sniper,
            tileX,
            tileY,
            stats.dmg,
            stats.atkCooldown,
            stats.range,
            stats.baseCost,
        );

        this.img.src = './sniper.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return [enemies.sort((e1, e2) => e2.maxHp - e1.maxHp)[0]];
    }

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 3,
            atkCooldown: 3,
            range: Number.POSITIVE_INFINITY,
            baseCost: 100,
        };
    }
}
