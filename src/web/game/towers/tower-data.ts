import {Enemy} from '../enemies';
import {TowerType} from './tower-type';

type SlowEffect = {
    effect: number;
    durationSeconds: number;
};

type TowerAttackEffects = {
    slow?: SlowEffect;
};

export type AttackModifiers = {
    dmg: number;
    attackCooldown: number;
    range: number;
    attackEffects?: TowerAttackEffects;
};

export type TowerData = AttackModifiers & {
    baseCost: number;
    pickTargets: (enemies: Enemy[]) => Enemy[],
    imageSrc: {
        active: string,
        idle?: string,
    };
};

export const TOWER_DATA: Record<TowerType, TowerData> = {
    [TowerType.Sitter]: {
        dmg: 1,
        attackCooldown: 2,
        range: 3,
        baseCost: 50,
        pickTargets: enemies => {
            const mostProgressed = enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress());
            return [mostProgressed[0], mostProgressed[1], mostProgressed[2]].filter(v => v);
        },
        imageSrc: {
            active: './pepegSit.jpg',
            idle: './pepegSitInVent.png',
        }
    },
    [TowerType.Knight]: {
        dmg: 2,
        attackCooldown: 1,
        range: 1.5,
        baseCost: 50,
        pickTargets: enemies => [enemies.sort((e1, e2) => e2.getProgress() - e1.getProgress())[0]],
        imageSrc: {
            active: './knight.png',
        }
    },
    [TowerType.Sniper]: {
        dmg: 3,
        attackCooldown: 3,
        range: Number.POSITIVE_INFINITY,
        baseCost: 100,
        pickTargets: enemies => [enemies.sort((e1, e2) => e2.maxHp - e1.maxHp)[0]],
        imageSrc: {
            active: './sniper.png',
        },
    },
    [TowerType.Ice]: {
        dmg: 0,
        attackCooldown: 0.5,
        range: 2,
        baseCost: 50,
        attackEffects: {
            slow: {
                effect: 0.3,
                durationSeconds: 1,
            },
        },
        pickTargets: enemies => enemies,
        imageSrc: {
            active: './ice.png',
        },
    }
};
