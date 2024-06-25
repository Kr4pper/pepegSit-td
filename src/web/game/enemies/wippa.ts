import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';

export class Wippa extends Enemy {
    constructor() {
        super(EnemyType.Wippa, 1.5, 1, 10, 10);

        this.img.src = './wippa.png';
    }
}
