type Gem = {
  x: number,
  y: number,
  name: string
}

export class Board {
  gemsPositions: (string | undefined)[]
  gemsFallHeight: number[]
  gems: string[]
  width: number
  height: number

  constructor(width: number, height: number, gems: string[]) {
    this.width = width;
    this.height = height;
    this.gems = gems;
    this.gemsPositions = [];
    this.gemsFallHeight = [];
  }
  getGem(x: number, y: number) : string | undefined {
    return this.gemsPositions[y * this.width + x];
  }
  getGemFallHeight(x: number, y: number) : number {
    return this.gemsFallHeight[y * this.width + x] || 0;
  }
  setGem(x: number, y: number, gem: string | undefined) : void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }
    this.gemsPositions[y * this.width + x] = gem;
  }
  makeZeroMatches() : void {
    this.recalculatePositions();

    while (this.getMatches().length > 0 || !this.getPossibleMatch()) {
      this.clearBoard();
      this.recalculatePositions();
    }

    this.gemsPositions.forEach((_, index) => {
      this.gemsPositions[index + this.width * this.height] = this.gemsPositions[index]
      this.gemsPositions[index] = undefined
    })
    this.recalculatePositions(true)
  }
  recalculatePositions(precalculated?: boolean) : void {
    if (!precalculated) {
      for(let i = 0; i < this.width * this.height; i++) {
        const gem = this.gems[Math.floor(Math.random() * this.gems.length)];
        this.gemsPositions[this.width * this.height + i] = gem;
      }
    }
    this.gemsFallHeight = [];

    for(let x = 0; x < this.width; x++) {
      let lyingGems:number = 0;
      for(let y = 0; y < this.height; y++) {
        if (this.getGem(x, y)) {
          lyingGems += 1;
        } else {
          break;
        }
      }
      if (this.height === lyingGems) { continue; }

      let counter: number = 1;
      while(this.height > lyingGems) {
        const fallingGem = this.getGem(x, lyingGems + counter)
        if (fallingGem) {
          this.setGem(x, lyingGems, fallingGem)
          this.gemsFallHeight[lyingGems * this.width + x] = counter;
          lyingGems += 1;
        } else {
          counter += 1;
        }
      }
    }
    this.gemsPositions = this.gemsPositions.slice(0, this.width * this.height);
  }
  clearBoard() : void {
    this.gemsPositions = []
  }
  sliceMatches() : number[][] {
    const matches: number[][] = this.getMatches();
    matches.forEach((match) => { this.setGem(match[0], match[1], undefined) })
    return matches
  }
  getPossibleMatch(): Gem[] | undefined {
    const indexes = Array.from({ length: this.width * this.height }, (_, i) => i).sort(() => Math.random() - 0.5);

    const checkSwaps = (direction: string) => {
        let offset: number = 1
        if (direction === 'x') { offset = 1 }
        else if (direction === 'y') { offset = this.width }
        else { return }

        for (const index of indexes) {
            if (direction === 'x' && index % this.width == this.width - 1) { continue }
            if (direction === 'y' && index >= indexes.length - this.width) { continue }

            const gemsPositions = Array.from(this.gemsPositions);
            const swapIndex = index + offset;
            [gemsPositions[index], gemsPositions[swapIndex]] = [gemsPositions[swapIndex], gemsPositions[index]];

            const matches = this.getMatches(gemsPositions)
            if (matches.length > 0) {
                const name: string = gemsPositions[matches[0][1] * this.width + matches[0][0]]!
                if (this.gemsPositions[index] == name) {
                  return [index, index + offset];
                } else {
                  return [index + offset, index];
                }
            }
        }
        return undefined;
    };

    const directions = Math.round(Math.random()) === 0 ? ['x', 'y'] : ['y', 'x'] // 1 for horizontal, width for vertical

    for (const direction of directions) {
      const resultIndexes = checkSwaps(direction);
      if (resultIndexes) {
        return resultIndexes.map((index) => {
          const x = index % this.width;
          const y = Math.floor(index / this.width);
          const name: string = this.getGem(x, y)!
          return { x, y, name }
        })
      }
    }

    return undefined;
  }

  getMatches(gemsPositions: (string | undefined)[] = this.gemsPositions) : number[][] {
    const checkForMatches = (indexes: number[]) => {
      let gemCount: number = 1;
      let gemName: string | undefined = gemsPositions[indexes[0]];
      if (gemName === undefined) { throw new Error('Проверка на совпадения с незаполненными гемами') }

      for(let i = 1; i <= indexes.length; i++) {
        if (gemName == gemsPositions[indexes[i]] && i != indexes.length) {
          gemCount++;
        } else {
          if (gemCount >= 3) {
            for(let j = 1; j <= gemCount; j++) {
              matchesPositions[indexes[i - j]] = gemName;
            }
          };
          gemCount = 1;
          gemName = gemsPositions[indexes[i]]!;
        }
      }
    }

    const matchesPositions: string[] = []
    const horizontalIndexes: Array<number>[] = []
    const verticalIndexes: Array<number>[] = []

    for(let y = 0; y < this.height; y++) {
      horizontalIndexes[y] = [];
      for(let x = 0; x < this.height; x++) {
        if (y === 0) { verticalIndexes[x] = []; };
        horizontalIndexes[y][x] = y * this.width + x;
        verticalIndexes[x][y] = y * this.width + x;
      }
    }
    horizontalIndexes.forEach((indexes) => { checkForMatches(indexes); })
    verticalIndexes.forEach((indexes) => { checkForMatches(indexes); })
    const matches: number[][] = []
    matchesPositions.forEach((_match, index) => {
      matches.push([index % this.width, Math.floor(index / this.width)]);
    })
    return  matches
  }
}

