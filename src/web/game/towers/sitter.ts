import {Enemy} from '../enemies';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export class SitterTower extends Tower {
    private activeImage = new Image();
    private idleImage = new Image();
    private currentlyIdle = false;

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

        this.activeImage.src = './pepegSit.jpg';
        this.idleImage.src = './pepegSitInVent.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return enemies;
    }

    setIdle(idle: boolean): void {
        if (idle !== this.currentlyIdle) {
            this.img = idle ? this.idleImage : this.activeImage;
        }

        this.currentlyIdle = idle;
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
