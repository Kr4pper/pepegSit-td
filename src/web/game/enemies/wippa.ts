import {Enemy} from './enemy';

export class Wippa {
    static withStats(maxHp = 10, goldValue = 20) {
        return new Enemy(2, 1, goldValue, maxHp);
    }
}
