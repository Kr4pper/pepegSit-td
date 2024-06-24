import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';

export class SitterTower extends Tower {
    constructor(tileX: number, tileY: number) {
        const stats = SitterTower.getBaseStats();
        super(tileX, tileY, stats.dmg, stats.atkCooldown, stats.range);

        this.img.src = './pepegSit.jpg';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return enemies;
    }

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 1,
            atkCooldown: 1,
            range: 4,
            cost: 100,
        };
    }
}
