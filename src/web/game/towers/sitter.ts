import {Tower} from './tower';

export class Sitter extends Tower {
    static at(tileX: number, tileY: number) {
        return new Tower(tileX, tileY, 1, 1, 3);
    }
}
