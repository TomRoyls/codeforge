export class StaticBitset {
  private readonly words: Uint32Array
  private readonly _length: number

  constructor(length: number) {
    if (length < 0) throw new RangeError('Length must be non-negative')
    this._length = length
    this.words = new Uint32Array(Math.ceil(length / 32))
  }

  static from(indices: Iterable<number>, length?: number): StaticBitset {
    const arr = [...indices]
    const len = length ?? (arr.length > 0 ? Math.max(...arr) + 1 : 0)
    const bs = new StaticBitset(len)
    for (const i of arr) bs.set(i)
    return bs
  }

  static fromRange(start: number, end: number): StaticBitset {
    const bs = new StaticBitset(end + 1)
    bs.setRange(start, end)
    return bs
  }

  static union(a: StaticBitset, b: StaticBitset): StaticBitset {
    const len = Math.max(a._length, b._length)
    const result = new StaticBitset(len)
    const words = Math.min(a.words.length, b.words.length)
    for (let i = 0; i < words; i++) {
      result.words[i] = a.words[i]! | b.words[i]!
    }
    for (let i = words; i < a.words.length; i++) result.words[i] = a.words[i]!
    for (let i = words; i < b.words.length; i++) result.words[i] = b.words[i]!
    return result
  }

  static intersection(a: StaticBitset, b: StaticBitset): StaticBitset {
    const len = Math.max(a._length, b._length)
    const result = new StaticBitset(len)
    const words = Math.min(a.words.length, b.words.length)
    for (let i = 0; i < words; i++) {
      result.words[i] = a.words[i]! & b.words[i]!
    }
    return result
  }

  static difference(a: StaticBitset, b: StaticBitset): StaticBitset {
    const result = new StaticBitset(a._length)
    const words = Math.min(a.words.length, b.words.length)
    for (let i = 0; i < words; i++) {
      result.words[i] = a.words[i]! & ~b.words[i]!
    }
    for (let i = words; i < a.words.length; i++) result.words[i] = a.words[i]!
    return result
  }

  set(index: number): void {
    if (index < 0 || index >= this._length) throw new RangeError(`Index ${index} out of range [0, ${this._length})`)
    const wordIdx = index >>> 5
    this.words[wordIdx] = this.words[wordIdx]! | (1 << (index & 31))
  }

  clear(index: number): void {
    if (index < 0 || index >= this._length) throw new RangeError(`Index ${index} out of range`)
    const wordIdx = index >>> 5
    this.words[wordIdx] = this.words[wordIdx]! & ~(1 << (index & 31))
  }

  flip(index: number): void {
    if (index < 0 || index >= this._length) throw new RangeError(`Index ${index} out of range`)
    const wordIdx = index >>> 5
    this.words[wordIdx] = this.words[wordIdx]! ^ (1 << (index & 31))
  }

  get(index: number): boolean {
    if (index < 0 || index >= this._length) return false
    return (this.words[index >>> 5]! & (1 << (index & 31))) !== 0
  }

  setRange(start: number, end: number): void {
    for (let i = start; i <= end && i < this._length; i++) this.set(i)
  }

  clearRange(start: number, end: number): void {
    for (let i = start; i <= end && i < this._length; i++) this.clear(i)
  }

  get length(): number {
    return this._length
  }

  get popcount(): number {
    let count = 0
    for (const word of this.words) {
      count += popcount32(word)
    }
    return count
  }

  get isEmpty(): boolean {
    for (const word of this.words) {
      if (word) return false
    }
    return true
  }

  get isFull(): boolean {
    for (let i = 0; i < this.words.length - 1; i++) {
      if (this.words[i]! !== 0xFFFFFFFF) return false
    }
    const lastBits = this._length & 31
    if (lastBits === 0) return this.words[this.words.length - 1] === 0xFFFFFFFF
    const mask = (1 << lastBits) - 1
    return (this.words[this.words.length - 1]! & mask) === mask
  }

  nextSet(from: number): number {
    for (let i = from; i < this._length; i++) {
      if (this.get(i)) return i
    }
    return -1
  }

  nextClear(from: number): number {
    for (let i = from; i < this._length; i++) {
      if (!this.get(i)) return i
    }
    return -1
  }

  forEach(callback: (index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      if (this.get(i)) callback(i)
    }
  }

  toArray(): number[] {
    const result: number[] = []
    this.forEach((i) => result.push(i))
    return result
  }

  clone(): StaticBitset {
    const copy = new StaticBitset(this._length)
    copy.words.set(this.words)
    return copy
  }

  reset(): void {
    this.words.fill(0)
  }
}

function popcount32(n: number): number {
  n = n - ((n >>> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333)
  return ((n + (n >>> 4) & 0x0F0F0F0F) * 0x01010101) >>> 24
}
