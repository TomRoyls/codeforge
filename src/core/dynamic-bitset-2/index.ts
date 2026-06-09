const BITS_PER_WORD = 32;

export class DynamicBitset2 {
  private _data: Uint32Array;
  private _size: number;

  constructor(initialCapacity?: number) {
    const bits = initialCapacity ?? 0;
    const wordCount = Math.ceil(bits / BITS_PER_WORD) || 1;
    this._data = new Uint32Array(wordCount);
    this._size = 0;
  }

  private ensureCapacity(bitIndex: number): void {
    const neededWord = (bitIndex >> 5) + 1;
    if (neededWord <= this._data.length) return;
    let newSize = this._data.length;
    while (newSize < neededWord) {
      newSize <<= 1;
    }
    if (newSize < neededWord) {
      newSize = neededWord;
    }
    const newData = new Uint32Array(newSize);
    newData.set(this._data);
    this._data = newData;
  }

  set(index: number): void {
    if (index < 0) throw new RangeError(`Index ${index} is negative`);
    this.ensureCapacity(index);
    if (index >= this._size) {
      this._size = index + 1;
    }
    this._data[index >> 5]! |= (1 << (index & 31));
  }

  unset(index: number): void {
    if (index < 0) throw new RangeError(`Index ${index} is negative`);
    if (index >= this._data.length * BITS_PER_WORD) return;
    this._data[index >> 5]! &= ~(1 << (index & 31));
  }

  get(index: number): boolean {
    if (index < 0) throw new RangeError(`Index ${index} is negative`);
    if (index >= this._data.length * BITS_PER_WORD) return false;
    return (this._data[index >> 5]! & (1 << (index & 31))) !== 0;
  }

  toggle(index: number): boolean {
    if (index < 0) throw new RangeError(`Index ${index} is negative`);
    this.ensureCapacity(index);
    if (index >= this._size) {
      this._size = index + 1;
    }
    const wordIndex = index >> 5;
    const mask = 1 << (index & 31);
    this._data[wordIndex]! ^= mask;
    return (this._data[wordIndex]! & mask) !== 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  get capacity(): number {
    return this._data.length * BITS_PER_WORD;
  }

  setRange(start: number, end: number): void {
    if (start < 0) throw new RangeError(`Start ${start} is negative`);
    if (end < start) throw new RangeError(`End ${end} is less than start ${start}`);
    if (end === start) return;
    this.ensureCapacity(end - 1);
    if (end > this._size) {
      this._size = end;
    }
    for (let i = start; i < end; i++) {
      this._data[i >> 5]! |= (1 << (i & 31));
    }
  }

  unsetRange(start: number, end: number): void {
    if (start < 0) throw new RangeError(`Start ${start} is negative`);
    if (end < start) throw new RangeError(`End ${end} is less than start ${start}`);
    if (end === start) return;
    const maxBit = this._data.length * BITS_PER_WORD;
    const actualEnd = Math.min(end, maxBit);
    for (let i = start; i < actualEnd; i++) {
      this._data[i >> 5]! &= ~(1 << (i & 31));
    }
  }

  flipRange(start: number, end: number): void {
    if (start < 0) throw new RangeError(`Start ${start} is negative`);
    if (end < start) throw new RangeError(`End ${end} is less than start ${start}`);
    if (end === start) return;
    this.ensureCapacity(end - 1);
    if (end > this._size) {
      this._size = end;
    }
    for (let i = start; i < end; i++) {
      this._data[i >> 5]! ^= (1 << (i & 31));
    }
  }

  countOnes(): number {
    let count = 0;
    for (let i = 0; i < this._data.length; i++) {
      let word = this._data[i]!;
      while (word !== 0) {
        word &= word - 1;
        count++;
      }
    }
    return count;
  }

  countZeros(): number {
    return this._size - this.countOnes();
  }

  and(other: DynamicBitset2): DynamicBitset2 {
    const maxSize = Math.max(this._size, other._size);
    const result = new DynamicBitset2(maxSize);
    result._size = maxSize;
    const minLen = Math.min(this._data.length, other._data.length);
    for (let i = 0; i < minLen; i++) {
      result.ensureCapacity(i * BITS_PER_WORD);
      result._data[i] = this._data[i]! & other._data[i]!;
    }
    return result;
  }

  or(other: DynamicBitset2): DynamicBitset2 {
    const maxSize = Math.max(this._size, other._size);
    const result = new DynamicBitset2(maxSize);
    result._size = maxSize;
    const minLen = Math.min(this._data.length, other._data.length);
    for (let i = 0; i < minLen; i++) {
      result._data[i] = this._data[i]! | other._data[i]!;
    }
    if (this._data.length > other._data.length) {
      for (let i = minLen; i < this._data.length; i++) {
        result._data[i] = this._data[i]!;
      }
    } else if (other._data.length > this._data.length) {
      for (let i = minLen; i < other._data.length; i++) {
        result.ensureCapacity(i * BITS_PER_WORD);
        result._data[i] = other._data[i]!;
      }
    }
    return result;
  }

  xor(other: DynamicBitset2): DynamicBitset2 {
    const maxSize = Math.max(this._size, other._size);
    const result = new DynamicBitset2(maxSize);
    result._size = maxSize;
    const minLen = Math.min(this._data.length, other._data.length);
    for (let i = 0; i < minLen; i++) {
      result._data[i] = this._data[i]! ^ other._data[i]!;
    }
    if (this._data.length > other._data.length) {
      for (let i = minLen; i < this._data.length; i++) {
        result._data[i] = this._data[i]!;
      }
    } else if (other._data.length > this._data.length) {
      for (let i = minLen; i < other._data.length; i++) {
        result.ensureCapacity(i * BITS_PER_WORD);
        result._data[i] = other._data[i]!;
      }
    }
    return result;
  }

  not(): DynamicBitset2 {
    const result = new DynamicBitset2(this._size);
    result._size = this._size;
    for (let i = 0; i < this._data.length; i++) {
      result._data[i] = ~this._data[i]! >>> 0;
    }
    return result;
  }

  equals(other: DynamicBitset2): boolean {
    if (this._size !== other._size) return false;
    const minLen = Math.min(this._data.length, other._data.length);
    for (let i = 0; i < minLen; i++) {
      if (this._data[i] !== other._data[i]) return false;
    }
    if (this._data.length > minLen) {
      for (let i = minLen; i < this._data.length; i++) {
        if (this._data[i] !== 0) return false;
      }
    }
    if (other._data.length > minLen) {
      for (let i = minLen; i < other._data.length; i++) {
        if (other._data[i] !== 0) return false;
      }
    }
    return true;
  }

  clone(): DynamicBitset2 {
    const result = new DynamicBitset2(this._size);
    result._size = this._size;
    result._data = new Uint32Array(this._data);
    return result;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this._size; i++) {
      const wordIndex = i >> 5;
      if (wordIndex >= this._data.length) break;
      if ((this._data[wordIndex]! & (1 << (i & 31))) !== 0) {
        result.push(i);
      }
    }
    return result;
  }

  toString(): string {
    if (this._size === 0) return '';
    let result = '';
    for (let i = 0; i < this._size; i++) {
      result += this.get(i) ? '1' : '0';
    }
    return result;
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
