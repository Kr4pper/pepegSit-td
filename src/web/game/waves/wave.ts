import {Enemy, Weirdge, Wippa} from '../enemies';

export type Wave = {
    id: number;
    spawnDelay: number;
    goldReward: number;
    enemies: Enemy[];
};

export const defaultWaves: Wave[] = [
    {
        id: 1,
        spawnDelay: 2,
        goldReward: 25,
        enemies: [
            new Wippa(),
            new Wippa(),
            new Wippa(),
        ]
    },
    {
        id: 2,
        spawnDelay: 1,
        goldReward: 50,
        enemies: [
            new Weirdge(),
            new Wippa(),
            new Wippa(),
            new Wippa(),
            new Wippa(),
            new Wippa(),
        ]
    }
];
