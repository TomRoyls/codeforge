export class BitVector2 {
  private data: Uint32Array;
  private _size: number;
  private readonly BITS_PER_WORD: number = 32;

  constructor(size: number = 0) {
    if (size < 1) throw new RangeError('size must be >= 1')

    this._size = size;
    const wordCount = Math.ceil(size / this.BITS_PER_WORD);
    this.data = new Uint32Array(wordCount);
  }

  set(index: number, value: boolean): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`);
    }
    const wordIndex = Math.floor(index / this.BITS_PER_WORD);
    const bitIndex = index % this.BITS_PER_WORD;
    if (value) {
      this.data[wordIndex]! |= 1 << bitIndex;
    } else {
      this.data[wordIndex]! &= ~(1 << bitIndex);
    }
  }

  get(index: number): boolean {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`);
    }
    const wordIndex = Math.floor(index / this.BITS_PER_WORD);
    const bitIndex = index % this.BITS_PER_WORD;
    return (this.data[wordIndex]! & (1 << bitIndex)) !== 0;
  }

  flip(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`);
    }
    const wordIndex = Math.floor(index / this.BITS_PER_WORD);
    const bitIndex = index % this.BITS_PER_WORD;
    this.data[wordIndex]! ^= 1 << bitIndex;
  }

  get size(): number {
    return this._size;
  }

  countOnes(): number {
    let count = 0;
    for (let i = 0; i < this.data.length; i++) {
      count += this.popcount32(this.data[i]!);
    }
    return count;
  }

  popcount(): number {
    return this.countOnes();
  }

  countZeros(): number {
    return this._size - this.countOnes();
  }

  rank1(index: number): number {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`);
    }
    if (index === 0) {
      return 0;
    }
    const wordIndex = Math.floor((index - 1) / this.BITS_PER_WORD);
    let count = 0;
    for (let i = 0; i < wordIndex; i++) {
      count += this.popcount32(this.data[i]!);
    }
    const bitsToCount = index - (wordIndex * this.BITS_PER_WORD);
    const mask = (1 << bitsToCount) - 1;
    count += this.popcount32(this.data[wordIndex]! & mask);
    return count;
  }

  rank0(index: number): number {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`);
    }
    return index - this.rank1(index);
  }

  select1(k: number): number {
    if (k < 0 || k >= this.countOnes()) {
      throw new RangeError(`k ${k} out of bounds [0, ${this.countOnes()})`);
    }
    let count = 0;
    for (let i = 0; i < this.data.length; i++) {
      const wordOnes = this.popcount32(this.data[i]!);
      if (count + wordOnes > k) {
        let remaining = k - count;
        let word = this.data[i]!;
        let bitPos = 0;
        while (bitPos < this.BITS_PER_WORD) {
          if ((word & 1) === 1) {
            if (remaining === 0) {
              return i * this.BITS_PER_WORD + bitPos;
            }
            remaining--;
          }
          bitPos++;
          word >>>= 1;
        }
      }
      count += wordOnes;
    }
    throw new Error('Unreachable');
  }

  select0(k: number): number {
    if (k < 0 || k >= this.countZeros()) {
      throw new RangeError(`k ${k} out of bounds [0, ${this.countZeros()})`);
    }
    let count = 0;
    for (let i = 0; i < this.data.length; i++) {
      const wordZeros = this.BITS_PER_WORD - this.popcount32(this.data[i]!);
      if (i === this.data.length - 1 && this._size % this.BITS_PER_WORD !== 0) {
        const actualBits = this._size % this.BITS_PER_WORD;
        const lastWordOnes = this.popcount32(this.data[i]! & ((1 << actualBits) - 1));
        const actualZeros = actualBits - lastWordOnes;
        if (count + actualZeros > k) {
          let remaining = k - count;
          let word = this.data[i]!;
          let bitPos = 0;
          const limit = actualBits;
          while (bitPos < limit) {
            if ((word & 1) === 0) {
              if (remaining === 0) {
                return i * this.BITS_PER_WORD + bitPos;
              }
              remaining--;
            }
            bitPos++;
            word >>>= 1;
          }
        }
        count += actualZeros;
      } else {
        if (count + wordZeros > k) {
          let remaining = k - count;
          let word = this.data[i]!;
          let bitPos = 0;
          while (bitPos < this.BITS_PER_WORD) {
            if ((word & 1) === 0) {
              if (remaining === 0) {
                return i * this.BITS_PER_WORD + bitPos;
              }
              remaining--;
            }
            bitPos++;
            word >>>= 1;
          }
        }
        count += wordZeros;
      }
    }
    throw new Error('Unreachable');
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  clear(): void {
    this.data.fill(0);
  }

  resize(newSize: number): void {
    const oldWordCount = this.data.length;
    const newWordCount = Math.ceil(newSize / this.BITS_PER_WORD);
    const newData = new Uint32Array(newWordCount);
    const copyCount = Math.min(oldWordCount, newWordCount);
    for (let i = 0; i < copyCount; i++) {
      newData[i] = this.data[i]!;
    }
    this.data = newData;
    this._size = newSize;
  }

  toArray(): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.get(i));
    }
    return result;
  }

  fromString(s: string): void {
    const size = s.length;
    this.resize(size);
    for (let i = 0; i < size; i++) {
      const index = size - 1 - i;
      if (s[i] === '1') {
        this.set(index, true);
      } else if (s[i] === '0') {
        this.set(index, false);
      }
    }
  }

  toString(): string {
    if (this._size === 0) {
      return '';
    }
    let result = '';
    for (let i = this._size - 1; i >= 0; i--) {
      result += this.get(i) ? '1' : '0';
    }
    return result;
  }

  private popcount32(n: number): number {
    n = n - ((n >>> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
    n = ((n + (n >>> 4)) & 0x0F0F0F0F);
    n = n + (n >>> 8);
    n = n + (n >>> 16);
    return n & 0x3F;
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
}
