export class DynamicBitset {
  private words: number[]
  private _length: number

  constructor(length: number = 0) {
    this._length = length
    this.words = new Array(Math.ceil(length / 32)).fill(0)
  }

  static fromString(bits: string): DynamicBitset {
    const bs = new DynamicBitset(bits.length)
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === '1') bs.set(i)
    }
    return bs
  }

  set(index: number): void {
    this.ensureCapacity(index + 1)
    this.words[index >>> 5]! |= (1 << (index & 31))
    if (index >= this._length) this._length = index + 1
  }

  clear(index: number): void {
    if (index < this._length) {
      this.words[index >>> 5]! &= ~(1 << (index & 31))
    }
  }

  flip(index: number): void {
    this.ensureCapacity(index + 1)
    this.words[index >>> 5]! ^= (1 << (index & 31))
    if (index >= this._length) this._length = index + 1
  }

  get(index: number): boolean {
    if (index >= this._length) return false
    return ((this.words[index >>> 5]! >>> (index & 31)) & 1) === 1
  }

  count(): number {
    let c = 0
    for (const w of this.words) {
      c += this.popcount(w)
    }
    return c
  }

  and(other: DynamicBitset): DynamicBitset {
    const len = Math.min(this._length, other._length)
    const result = new DynamicBitset(len)
    for (let i = 0; i < result.words.length; i++) {
      const a = this.words[i] ?? 0
      const b = other.words[i] ?? 0
      result.words[i] = a & b
    }
    return result
  }

  or(other: DynamicBitset): DynamicBitset {
    const len = Math.max(this._length, other._length)
    const result = new DynamicBitset(len)
    for (let i = 0; i < result.words.length; i++) {
      result.words[i] = (this.words[i] ?? 0) | (other.words[i] ?? 0)
    }
    return result
  }

  xor(other: DynamicBitset): DynamicBitset {
    const len = Math.max(this._length, other._length)
    const result = new DynamicBitset(len)
    for (let i = 0; i < result.words.length; i++) {
      result.words[i] = (this.words[i] ?? 0) ^ (other.words[i] ?? 0)
    }
    return result
  }

  not(): DynamicBitset {
    const result = new DynamicBitset(this._length)
    for (let i = 0; i < this.words.length; i++) {
      result.words[i] = ~this.words[i]!
    }
    return result
  }

  toString(): string {
    let s = ''
    for (let i = 0; i < this._length; i++) {
      s += this.get(i) ? '1' : '0'
    }
    return s
  }

  get length(): number {
    return this._length
  }

  private ensureCapacity(minLen: number): void {
    const needed = Math.ceil(minLen / 32)
    while (this.words.length < needed) {
      this.words.push(0)
    }
  }

  private popcount(n: number): number {
    n = n - ((n >>> 1) & 0x55555555)
    n = (n & 0x33333333) + ((n >>> 2) & 0x33333333)
    return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
  }
}
