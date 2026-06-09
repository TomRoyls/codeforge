export class RankSelectBitvector2 {
  private bits: Uint32Array;
  private prefixSums: Uint32Array;
  private _length: number;
  private blockBits: number = 32;
  private totalOnes: number = 0;

  constructor(input: number | boolean[]) {
    if (typeof input === 'number') {
      this._length = input;
      this.bits = new Uint32Array(Math.ceil(input / this.blockBits));
      this.prefixSums = new Uint32Array(this.bits.length + 1);
    } else {
      this._length = input.length;
      this.bits = new Uint32Array(Math.ceil(input.length / this.blockBits));
      this.prefixSums = new Uint32Array(this.bits.length + 1);
      for (let i = 0; i < input.length; i++) {
        if (input[i]) {
          this.set(i);
        }
      }
    }
  }

  set(index: number): void {
    const blockIndex = Math.floor(index / this.blockBits);
    const bitIndex = index % this.blockBits;
    const mask = 1 << bitIndex;
    if ((this.bits[blockIndex]! & mask) === 0) {
      this.bits[blockIndex]! |= mask;
      this.totalOnes++;
    }
    this.rebuildPrefixSums();
  }

  unset(index: number): void {
    const blockIndex = Math.floor(index / this.blockBits);
    const bitIndex = index % this.blockBits;
    const mask = 1 << bitIndex;
    if ((this.bits[blockIndex]! & mask) !== 0) {
      this.bits[blockIndex]! &= ~mask;
      this.totalOnes--;
    }
    this.rebuildPrefixSums();
  }

  flip(index: number): void {
    const blockIndex = Math.floor(index / this.blockBits);
    const bitIndex = index % this.blockBits;
    const mask = 1 << bitIndex;
    if ((this.bits[blockIndex]! & mask) !== 0) {
      this.bits[blockIndex]! &= ~mask;
      this.totalOnes--;
    } else {
      this.bits[blockIndex]! |= mask;
      this.totalOnes++;
    }
    this.rebuildPrefixSums();
  }

  get(index: number): boolean {
    const blockIndex = Math.floor(index / this.blockBits);
    const bitIndex = index % this.blockBits;
    return (this.bits[blockIndex]! & (1 << bitIndex)) !== 0;
  }

  rank1(index: number): number {
    if (index === 0) return 0;
    const blockIndex = Math.floor(index / this.blockBits);
    const bitIndex = index % this.blockBits;
    const blockValue = this.bits[blockIndex]!;
    const partialMask = (1 << bitIndex) - 1;
    const partialCount = popcount(blockValue & partialMask);
    return this.prefixSums[blockIndex]! + partialCount;
  }

  rank0(index: number): number {
    return index - this.rank1(index);
  }

  select1(k: number): number {
    if (k < 0 || k >= this.totalOnes) return -1;
    let left = 0;
    let right = this.prefixSums.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.prefixSums[mid]! <= k) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    const blockIndex = left - 1;
    let target = k - this.prefixSums[blockIndex]!;
    const blockValue = this.bits[blockIndex]!;
    for (let i = 0; i < this.blockBits; i++) {
      if ((blockValue & (1 << i)) !== 0) {
        if (target === 0) {
          return blockIndex * this.blockBits + i;
        }
        target--;
      }
    }
    return -1;
  }

  select0(k: number): number {
    if (k < 0 || k >= (this._length - this.totalOnes)) return -1;
    let left = 0;
    let right = this.prefixSums.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const zerosInBlock = mid * this.blockBits - this.prefixSums[mid]!;
      if (zerosInBlock <= k) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    const blockIndex = left - 1;
    let target = k - (blockIndex * this.blockBits - this.prefixSums[blockIndex]!);
    const blockValue = this.bits[blockIndex]!;
    for (let i = 0; i < this.blockBits; i++) {
      if ((blockValue & (1 << i)) === 0) {
        if (target === 0) {
          const pos = blockIndex * this.blockBits + i;
          if (pos >= this._length) return -1;
          return pos;
        }
        target--;
      }
    }
    return -1;
  }

  get length(): number {
    return this._length;
  }

  countOnes(): number {
    return this.totalOnes;
  }

  countZeros(): number {
    return this._length - this.totalOnes;
  }

  isEmpty(): boolean {
    return this.totalOnes === 0;
  }

  toArray(): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < this._length; i++) {
      result.push(this.get(i));
    }
    return result;
  }

  private rebuildPrefixSums(): void {
    let sum = 0;
    for (let i = 0; i < this.bits.length; i++) {
      this.prefixSums[i] = sum;
      sum += popcount(this.bits[i]!);
    }
    this.prefixSums[this.bits.length] = sum;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `RankSelectBitvector2()`
  }
}

function popcount(n: number): number {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}
