import {KnightTower} from './knight';
import {SitterTower} from './sitter';
import {Tower, TowerBaseStats} from './tower';
import {TowerType} from './tower-type';

export const TOWER_DATA: Record<TowerType, {stats: TowerBaseStats, build: (x: number, y: number) => Tower;}> = {
    [TowerType.Sitter]: {
        stats: SitterTower.getBaseStats(),
        build: (x, y) => new SitterTower(x, y),
    },
    [TowerType.Knight]: {
        stats: KnightTower.getBaseStats(),
        build: (x, y) => new KnightTower(x, y),
    }
};
