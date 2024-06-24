import {Enemy} from './enemy';

export class Weirdge extends Enemy {
    constructor() {
        super(2, 5, 40, 50);

        this.img.src = './weirdge.png';
    }
}
