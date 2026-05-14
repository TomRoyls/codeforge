const BLOCK_SIZE = 64;

export class SuccinctBitvector2 {
  private blocks: bigint[];
  private rankCache: number[];
  private _length: number;
  private _totalOnes: number;

  constructor(bits: boolean[]) {
    this._length = bits.length;
    const numBlocks = Math.ceil(this._length / BLOCK_SIZE);
    this.blocks = new Array(numBlocks).fill(0n);
    this.rankCache = new Array(numBlocks + 1).fill(0);

    let totalOnes = 0;
    for (let i = 0; i < this._length; i++) {
      if (bits[i]) {
        const blockIndex = Math.floor(i / BLOCK_SIZE);
        const bitIndex = i % BLOCK_SIZE;
        this.blocks[blockIndex]! |= (1n << BigInt(bitIndex));
        totalOnes++;
      }
    }

    this._totalOnes = totalOnes;

    let cumulative = 0;
    for (let i = 0; i < numBlocks; i++) {
      this.rankCache[i]! = cumulative;
      cumulative += this.popcount(this.blocks[i]!);
    }
    this.rankCache[numBlocks]! = cumulative;
  }

  get(index: number): boolean {
    if (index < 0 || index >= this._length) {
      throw new Error(`Index out of bounds: ${index}`);
    }
    const blockIndex = Math.floor(index / BLOCK_SIZE);
    const bitIndex = index % BLOCK_SIZE;
    return (this.blocks[blockIndex]! & (1n << BigInt(bitIndex))) !== 0n;
  }

  rank1(index: number): number {
    if (index < 0) {
      return 0;
    }
    if (index > this._length) {
      return this._totalOnes;
    }
    const blockIndex = Math.floor(index / BLOCK_SIZE);
    const bitIndex = index % BLOCK_SIZE;
    const block = this.blocks[blockIndex]!;
    const mask = (1n << BigInt(bitIndex)) - 1n;
    const partialCount = this.popcount(block & mask);
    return this.rankCache[blockIndex]! + partialCount;
  }

  rank0(index: number): number {
    if (index >= this._length) {
      return this.countZeros();
    }
    return index - this.rank1(index);
  }

  select1(k: number): number {
    if (k < 0 || k >= this._totalOnes) {
      return -1;
    }

    let low = 0;
    let high = this.blocks.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.rankCache[mid]! <= k) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    const blockIndex = low - 1;
    const targetCount = k - this.rankCache[blockIndex]!;
    const block = this.blocks[blockIndex]!;

    let count = 0;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      if ((block & (1n << BigInt(i))) !== 0n) {
        if (count === targetCount) {
          const pos = blockIndex * BLOCK_SIZE + i;
          return pos < this._length ? pos : -1;
        }
        count++;
      }
    }

    return -1;
  }

  select0(k: number): number {
    const totalZeros = this._length - this._totalOnes;
    if (k < 0 || k >= totalZeros) {
      return -1;
    }

    let count = 0;
    for (let i = 0; i < this._length; i++) {
      if (!this.get(i)) {
        if (count === k) {
          return i;
        }
        count++;
      }
    }

    return -1;
  }

  get length(): number {
    return this._length;
  }

  countOnes(): number {
    return this._totalOnes;
  }

  countZeros(): number {
    return this._length - this._totalOnes;
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  toArray(): boolean[] {
    const result: boolean[] = new Array(this._length);
    for (let i = 0; i < this._length; i++) {
      result[i] = this.get(i);
    }
    return result;
  }

  private popcount(x: bigint): number {
    let count = 0;
    while (x !== 0n) {
      count += Number(x & 1n);
      x >>= 1n;
    }
    return count;
  }
}
