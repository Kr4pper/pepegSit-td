import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';

export class Wippa extends Enemy {
    constructor(hpMultiplier = 1) {
        super(EnemyType.Wippa, 1.5, 1, 5, 10 * hpMultiplier);

        this.img.src = './wippa.png';
    }
}
