import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';
import {Weirdge} from './weirdge';
import {Wippa} from './wippa';

export const ENEMY_SPAWN: Record<EnemyType, () => Enemy> = {
    [EnemyType.Wippa]: () => new Wippa(),
    [EnemyType.Weirdge]: () => new Weirdge(),
};
