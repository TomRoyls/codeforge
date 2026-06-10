export class Bitmap2 {
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

  setAll(): void {
    this.bits.fill(0xFFFFFFFF);
    const lastWordIndex = this.bits.length - 1;
    const extraBits = this.size % 32;
    if (extraBits !== 0) {
      const mask = (1 << extraBits) - 1;
      this.bits[lastWordIndex]! &= mask;
    }
  }

  clearAll(): void {
    this.bits.fill(0);
  }

  setRange(start: number, end: number): void {
    if (start < 0 || end > this.size || start > end) {
      throw new Error(`Invalid range: start=${start}, end=${end}, size=${this.size}`);
    }
    for (let i = start; i < end; i++) {
      this.set(i);
    }
  }

  clearRange(start: number, end: number): void {
    if (start < 0 || end > this.size || start > end) {
      throw new Error(`Invalid range: start=${start}, end=${end}, size=${this.size}`);
    }
    for (let i = start; i < end; i++) {
      this.clear(i);
    }
  }

  countOnes(): number {
    let count = 0;
    const wordCount = Math.ceil(this.size / 32);
    for (let i = 0; i < wordCount; i++) {
      let word = this.bits[i]!;
      while (word !== 0) {
        word &= (word - 1);
        count++;
      }
    }
    return count;
  }

  countZeros(): number {
    return this.size - this.countOnes();
  }

  and(other: Bitmap2): Bitmap2 {
    if (this.size !== other.size) {
      throw new Error('Bitmaps must have the same size');
    }
    const result = new Bitmap2(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = this.bits[i]! & other.bits[i]!;
    }
    return result;
  }

  or(other: Bitmap2): Bitmap2 {
    if (this.size !== other.size) {
      throw new Error('Bitmaps must have the same size');
    }
    const result = new Bitmap2(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = this.bits[i]! | other.bits[i]!;
    }
    return result;
  }

  xor(other: Bitmap2): Bitmap2 {
    if (this.size !== other.size) {
      throw new Error('Bitmaps must have the same size');
    }
    const result = new Bitmap2(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i]! = this.bits[i]! ^ other.bits[i]!;
    }
    return result;
  }

  not(): Bitmap2 {
    const result = new Bitmap2(this.size);
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

  toString(): string {
    let result = '';
    for (let i = 0; i < this.size; i++) {
      result += this.get(i) ? '1' : '0';
    }
    return result;
  }

  clone(): Bitmap2 {
    const result = new Bitmap2(this.size);
    result.bits.set(this.bits);
    return result;
  }

  equals(other: Bitmap2): boolean {
    if (this.size !== other.size) {
      return false;
    }
    for (let i = 0; i < this.bits.length; i++) {
      if (this.bits[i]! !== other.bits[i]!) {
        return false;
      }
    }
    return true;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  get [Symbol.toStringTag](): string {
    return 'Bitmap2'
  }
}
