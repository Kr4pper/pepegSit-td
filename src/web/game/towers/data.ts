import {IceTower} from './ice';
import {KnightTower} from './knight';
import {SitterTower} from './sitter';
import {SniperTower} from './sniper';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export const TOWER_DATA: Record<TowerType, {stats: TowerBaseStats, build: (x: number, y: number, cost: number) => Tower;}> = {
    [TowerType.Sitter]: {
        stats: SitterTower.getBaseStats(),
        build: (x, y, cost) => new SitterTower(x, y, cost),
    },
    [TowerType.Knight]: {
        stats: KnightTower.getBaseStats(),
        build: (x, y, cost) => new KnightTower(x, y, cost),
    },
    [TowerType.Sniper]: {
        stats: SniperTower.getBaseStats(),
        build: (x, y, cost) => new SniperTower(x, y, cost),
    },
    [TowerType.Ice]: {
        stats: IceTower.getBaseStats(),
        build: (x, y, cost) => new IceTower(x, y, cost),
    }
};
