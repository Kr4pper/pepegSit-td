import {Enemy} from '../enemies';
import {Tower} from './tower';

export class KnightTower extends Tower {
    constructor(tileX: number, tileY: number) {
        super(tileX, tileY, 3, 1, 2);

        this.img.src = './knight.png';
    }

    pickTargets(enemies: Enemy[]): Enemy[] {
        if (!enemies.length) return [];

        return [enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress())[0]];
    }

    static getCost() {
        return 50;
    }
}
