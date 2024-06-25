import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class SitterTower extends Tower {
    constructor(tileX: number, tileY: number, cost: number) {
        const stats = SitterTower.getBaseStats();

        super(
            TowerType.Sitter,
            tileX,
            tileY,
            stats.dmg,
            stats.atkCooldown,
            stats.range,
            cost,
        );

        this.img.src = './pepegSit.jpg';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return enemies;
    }

    setIdle(idle: boolean): void {
        if (idle) {
            this.img.src = './pepegSitInVent.png';
        }
        else {
            this.img.src = './pepegSit.jpg';
        }
    }

    static getBaseStats(): TowerBaseStats {
        return {
            dmg: 1,
            atkCooldown: 5,
            range: 3,
            baseCost: 50,
        };
    }
}
