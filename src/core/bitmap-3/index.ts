export class Bitmap3 {
  private bits: Uint32Array;
  public readonly size: number;

  constructor(size: number) {
    if (size < 0) throw new Error('Size must be non-negative');
    this.size = size;
    const numWords = Math.ceil(size / 32);
    this.bits = new Uint32Array(numWords);
  }

  private getWordIndex(bitIndex: number): number {
    if (bitIndex < 0 || bitIndex >= this.size) {
      throw new Error(`Index out of bounds: index=${bitIndex}, size=${this.size}`);
    }
    return Math.floor(bitIndex / 32);
  }

  private getBitOffset(bitIndex: number): number {
    return bitIndex % 32;
  }

  set(index: number): void {
    const wordIndex = this.getWordIndex(index);
    const bitOffset = this.getBitOffset(index);
    this.bits[wordIndex]! |= (1 << bitOffset);
  }

  clear(index: number): void {
    const wordIndex = this.getWordIndex(index);
    const bitOffset = this.getBitOffset(index);
    this.bits[wordIndex]! &= ~(1 << bitOffset);
  }

  get(index: number): boolean {
    const wordIndex = this.getWordIndex(index);
    const bitOffset = this.getBitOffset(index);
    return (this.bits[wordIndex]! & (1 << bitOffset)) !== 0;
  }

  toggle(index: number): boolean {
    const wordIndex = this.getWordIndex(index);
    const bitOffset = this.getBitOffset(index);
    const mask = 1 << bitOffset;
    this.bits[wordIndex]! ^= mask;
    return (this.bits[wordIndex]! & mask) !== 0;
  }

  clearAll(): void {
    this.bits.fill(0);
  }

  get isEmpty(): boolean {
    for (let i = 0; i < this.bits.length; i++) {
      if (this.bits[i]! !== 0) {
        return false;
      }
    }
    return true;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.get(i)) {
        result.push(i);
      }
    }
    return result;
  }

  getTimeComplexity(): Record<string, string> {
    return {
      set: 'O(1)',
      clear: 'O(1)',
      get: 'O(1)',
      toggle: 'O(1)',
      clearAll: 'O(n/32)',
      isEmpty: 'O(n/32)',
      toArray: 'O(n)',
      and: 'O(n/32)',
      or: 'O(n/32)',
      xor: 'O(n/32)',
      not: 'O(n/32)',
      countLeadingZeros: 'O(n/32)',
      countTrailingZeros: 'O(1)',
      findFirstSet: 'O(n/32)',
      findLastSet: 'O(n/32)',
      forEach: 'O(n)',
    };
  }

  and(other: Bitmap3): Bitmap3 {
    if (this.size !== other.size) {
      throw new Error('Bitmaps must have same size');
    }
    const result = new Bitmap3(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = this.bits[i]! & other.bits[i]!;
    }
    return result;
  }

  or(other: Bitmap3): Bitmap3 {
    if (this.size !== other.size) {
      throw new Error('Bitmaps must have same size');
    }
    const result = new Bitmap3(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = this.bits[i]! | other.bits[i]!;
    }
    return result;
  }

  xor(other: Bitmap3): Bitmap3 {
    if (this.size !== other.size) {
      throw new Error('Bitmaps must have same size');
    }
    const result = new Bitmap3(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = this.bits[i]! ^ other.bits[i]!;
    }
    return result;
  }

  not(): Bitmap3 {
    const result = new Bitmap3(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = ~this.bits[i]!;
    }
    const lastWordIndex = this.bits.length - 1;
    const extraBits = this.size % 32;
    if (extraBits !== 0) {
      const mask = (1 << extraBits) - 1;
      result.bits[lastWordIndex]! &= mask;
    }
    return result;
  }

  countLeadingZeros(): number {
    for (let i = 0; i < this.size; i++) {
      if (this.get(i)) {
        return i;
      }
    }
    return this.size;
  }

  countTrailingZeros(): number {
    for (let i = this.size - 1; i >= 0; i--) {
      if (this.get(i)) {
        return this.size - 1 - i;
      }
    }
    return this.size;
  }

  findFirstSet(): number {
    for (let i = 0; i < this.size; i++) {
      if (this.get(i)) {
        return i;
      }
    }
    return -1;
  }

  findLastSet(): number {
    for (let i = this.size - 1; i >= 0; i--) {
      if (this.get(i)) {
        return i;
      }
    }
    return -1;
  }

  forEach(callback: (index: number, value: boolean) => void): void {
    for (let i = 0; i < this.size; i++) {
      callback(i, this.get(i));
    }
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
