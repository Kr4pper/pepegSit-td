import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';

export class PeepoRun extends Enemy {
    constructor(hpMultiplier = 1) {
        super(EnemyType.PeepoRun, 0.5, 2, 10, 15 * hpMultiplier);

        this.img.src = './peepoRun.png';
    }
}
