import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';

export class Weirdge extends Enemy {
    constructor() {
        super(EnemyType.Weirdge, 2, 5, 40, 50);

        this.img.src = './weirdge.png';
    }
}
