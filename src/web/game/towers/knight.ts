import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';

export class KnightTower extends Tower {
    constructor(tileX: number, tileY: number) {
        const stats = KnightTower.getBaseStats();
        super(tileX, tileY, stats.dmg, stats.atkCooldown, stats.range);

        this.img.src = './knight.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        if (!enemies.length) return [];

        return [enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress())[0]];
    }

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 3,
            atkCooldown: 0.75,
            range: 2,
            cost: 50,
        };
    }
}
