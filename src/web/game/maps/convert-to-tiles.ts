import {Biome} from '../biome';

export const convertToTiles = (map: string) => {
    return map
        .trim()
        .split('\n')
        .map(line => line
            .split('')
            .map(tile => {
                switch (+tile) {
                    case Biome.Track: return Biome.Track;
                    case Biome.Buildable: return Biome.Buildable;
                    case Biome.Occupied: return Biome.Occupied;
                    case Biome.Blocked: return Biome.Blocked;
                    default: throw new Error(`Invalid tile type: "${tile}"`);
                }
            }));
};
