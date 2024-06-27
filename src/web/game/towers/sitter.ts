import {Enemy} from '../enemies';
import {Tower, TowerAttackEffects, TowerBaseStats} from './tower';
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

        this.img = this.activeImage;
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        const mostProgressed = enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress());
        return [mostProgressed[0], mostProgressed[1], mostProgressed[2]].filter(v => v);
    }

    attackEffects(): TowerAttackEffects {
        return {};
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
            atkCooldown: 2,
            range: 3,
            baseCost: 50,
        };
    }
}
