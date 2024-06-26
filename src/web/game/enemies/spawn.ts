import {Enemy} from './enemy';
import {EnemyType} from './enemy-type';
import {PeepoRun} from './peeporun';
import {Weirdge} from './weirdge';
import {Wippa} from './wippa';

export const ENEMY_SPAWNER: Record<EnemyType, (hpMultiplier?: number) => Enemy> = {
    [EnemyType.Wippa]: (hpMultiplier = 1) => new Wippa(hpMultiplier),
    [EnemyType.Weirdge]: (hpMultiplier = 1) => new Weirdge(hpMultiplier),
    [EnemyType.PeepoRun]: (hpMultiplier = 1) => new PeepoRun(hpMultiplier),
};
