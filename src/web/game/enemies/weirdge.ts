import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';

export class Weirdge extends Enemy {
    constructor(hpMultiplier = 1) {
        super(EnemyType.Weirdge, 2, 10, 20, 50 * hpMultiplier);

        this.img.src = './weirdge.png';
    }
}
