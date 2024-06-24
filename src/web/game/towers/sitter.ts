import {Enemy} from '../enemies';
import {Tower} from './tower';

export class SitterTower extends Tower {
    constructor(tileX: number, tileY: number) {
        super(tileX, tileY, 1, 1, 4);

        this.img.src = './pepegSit.jpg';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        return enemies;
    }

    static getCost() {
        return 100;
    }
}
