import {EnemyType} from '../enemies';

export type Wave = EnemyType[];

const createMany = (type: EnemyType, amount: number) => Array.from({length: amount}, () => type);

export const defaultWaves: Wave[] = [
    createMany(EnemyType.Wippa, 1),
    createMany(EnemyType.Wippa, 2),
    createMany(EnemyType.Wippa, 3),
    createMany(EnemyType.Wippa, 5),
    [
        ...createMany(EnemyType.Wippa, 8),
        ...createMany(EnemyType.PeepoRun, 1),
    ],
    [
        ...createMany(EnemyType.Weirdge, 1),
        ...createMany(EnemyType.Wippa, 13),
    ],
    createMany(EnemyType.PeepoRun, 5),
    createMany(EnemyType.Wippa, 21),
    createMany(EnemyType.Wippa, 34),
    [
        ...createMany(EnemyType.Wippa, 10),
        ...createMany(EnemyType.Weirdge, 1),
        ...createMany(EnemyType.PeepoRun, 1),
        ...createMany(EnemyType.Wippa, 10),
        ...createMany(EnemyType.Weirdge, 3),
        ...createMany(EnemyType.PeepoRun, 3),
        ...createMany(EnemyType.Wippa, 10),
        ...createMany(EnemyType.Weirdge, 5),
        ...createMany(EnemyType.Wippa, 20),
        ...createMany(EnemyType.PeepoRun, 5),
    ]
];
