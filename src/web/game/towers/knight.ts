import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class KnightTower extends Tower {
    constructor(tileX: number, tileY: number) {
        const stats = KnightTower.getBaseStats();

        super(
            TowerType.Knight,
            tileX,
            tileY,
            stats.dmg,
            stats.atkCooldown,
            stats.range,
            stats.baseCost,
        );

        this.img.src = './knight.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        if (!enemies.length) return [];

        return [enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress())[0]]; // attack furthest enemy
    }

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 2,
            atkCooldown: 1,
            range: 2,
            baseCost: 50,
        };
    }
}
