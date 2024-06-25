import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class SitterTower extends Tower {
    constructor(tileX: number, tileY: number) {
        const stats = SitterTower.getBaseStats();
        
        super(
            TowerType.Sitter,
            tileX,
            tileY,
            stats.dmg,
            stats.atkCooldown,
            stats.range,
            stats.baseCost,
        );
        
        this.img.src = './pepegSit.jpg';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return enemies;
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
