import {Enemy} from './enemy';

export class Wippa extends Enemy {
    constructor() {
        super(1.5, 1, 20, 10);

        this.img.src = './wippa.png';
    }
}
