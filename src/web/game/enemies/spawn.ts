import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';
import {Weirdge} from './weirdge';
import {Wippa} from './wippa';

export const ENEMY_SPAWN: Record<EnemyType, (hpMultiplier?: number) => Enemy> = {
    [EnemyType.Wippa]: (hpMultiplier = 1) => new Wippa(hpMultiplier),
    [EnemyType.Weirdge]: (hpMultiplier = 1) => new Weirdge(hpMultiplier),
};
