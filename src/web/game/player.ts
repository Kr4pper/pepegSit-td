export class Player {
    constructor(
        private name: string,
        private maxHp: number,
        private hp = maxHp,
    ) {}
}
