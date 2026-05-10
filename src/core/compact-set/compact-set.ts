import type { CompactSetOptions } from './types.js'

export class CompactSet {
  private readonly bits: Uint32Array
  private readonly maxValue: number
  private _size: number

  constructor(maxValueOrOptions: number | CompactSetOptions) {
    const maxVal = typeof maxValueOrOptions === 'number'
      ? maxValueOrOptions
      : maxValueOrOptions.maxValue

    if (!Number.isInteger(maxVal) || maxVal < 0) {
      throw new RangeError('maxValue must be a non-negative integer')
    }

    this.maxValue = maxVal
    this._size = 0
    const wordCount = Math.ceil((maxVal + 1) / 32)
    this.bits = new Uint32Array(wordCount)
  }

  private validate(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > this.maxValue) {
      throw new RangeError(
        `Value must be an integer in range [0, ${this.maxValue}]`
      )
    }
  }

  private static bitIndex(value: number): [number, number] {
    const word = value >>> 5
    const bit = value & 31
    return [word, bit]
  }

  add(value: number): boolean {
    this.validate(value)
    const [word, bit] = CompactSet.bitIndex(value)
    const mask = 1 << bit
    if ((this.bits[word]! & mask) !== 0) {
      return false
    }
    this.bits[word]! |= mask
    this._size++
    return true
  }

  delete(value: number): boolean {
    this.validate(value)
    const [word, bit] = CompactSet.bitIndex(value)
    const mask = 1 << bit
    if ((this.bits[word]! & mask) === 0) {
      return false
    }
    this.bits[word]! &= ~mask
    this._size--
    return true
  }

  has(value: number): boolean {
    if (!Number.isInteger(value) || value < 0 || value > this.maxValue) {
      return false
    }
    const [word, bit] = CompactSet.bitIndex(value)
    return (this.bits[word]! & (1 << bit)) !== 0
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this.bits.fill(0)
    this._size = 0
  }

  addAll(values: Iterable<number>): void {
    for (const v of values) {
      this.add(v)
    }
  }

  deleteAll(values: Iterable<number>): void {
    for (const v of values) {
      this.delete(v)
    }
  }

  toArray(): number[] {
    const result: number[] = []
    for (let word = 0; word < this.bits.length; word++) {
      let w = this.bits[word]!
      if (w === 0) continue
      const base = word << 5
      while (w !== 0) {
        const bit = 31 - Math.clz32(w & -w)
        const value = base + bit
        if (value <= this.maxValue) {
          result.push(value)
        }
        w &= w - 1
      }
    }
    return result
  }

  forEach(callback: (value: number) => void): void {
    for (const value of this) {
      callback(value)
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let word = 0; word < this.bits.length; word++) {
      let w = this.bits[word]!
      if (w === 0) continue
      const base = word << 5
      while (w !== 0) {
        const bit = 31 - Math.clz32(w & -w)
        const value = base + bit
        if (value > this.maxValue) return
        yield value
        w &= w - 1
      }
    }
  }

  first(): number | undefined {
    for (const value of this) {
      return value
    }
    return undefined
  }

  last(): number | undefined {
    for (let word = this.bits.length - 1; word >= 0; word--) {
      let w = this.bits[word]!
      if (w === 0) continue
      const bit = 31 - Math.clz32(w)
      const value = (word << 5) + bit
      if (value <= this.maxValue) {
        return value
      }
    }
    return undefined
  }

  next(value: number): number | undefined {
    if (value < 0) return this.first()
    const start = value + 1
    if (start > this.maxValue) return undefined
    const [startWord] = CompactSet.bitIndex(start)
    for (let word = startWord; word < this.bits.length; word++) {
      let w = this.bits[word]!
      if (w === 0) continue
      const base = word << 5
      if (word === startWord) {
        const startBit = start & 31
        w &= ~((1 << startBit) - 1)
        if (w === 0) continue
      }
      const bit = 31 - Math.clz32(w & -w)
      const result = base + bit
      if (result > this.maxValue) return undefined
      return result
    }
    return undefined
  }

  previous(value: number): number | undefined {
    if (value > this.maxValue) return this.last()
    if (value <= 0) return undefined
    const end = value - 1
    const [endWord] = CompactSet.bitIndex(end)
    for (let word = endWord; word >= 0; word--) {
      let w = this.bits[word]!
      if (w === 0) continue
      const base = word << 5
      if (word === endWord) {
        const endBit = end & 31
        const mask = (1 << (endBit + 1)) - 1
        w &= mask
        if (w === 0) continue
      }
      const bit = 31 - Math.clz32(w)
      return base + bit
    }
    return undefined
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this.maxValue + 1
  }

  complement(): CompactSet {
    const result = new CompactSet(this.maxValue)
    for (let word = 0; word < this.bits.length; word++) {
      result.bits[word] = ~this.bits[word]!
    }
    if (this.maxValue + 1 < this.bits.length * 32) {
      const lastWord = this.bits.length - 1
      const validBits = (this.maxValue + 1) & 31
      if (validBits !== 0) {
        const mask = (1 << validBits) - 1
        result.bits[lastWord]! &= mask
      }
    }
    result._size = this.maxValue + 1 - this._size
    return result
  }

  union(other: CompactSet): CompactSet {
    const maxVal = Math.max(this.maxValue, other.maxValue)
    const result = new CompactSet(maxVal)
    const minLen = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < minLen; i++) {
      result.bits[i] = this.bits[i]! | other.bits[i]!
    }
    for (let i = minLen; i < this.bits.length; i++) {
      result.bits[i] = this.bits[i]!
    }
    for (let i = minLen; i < other.bits.length; i++) {
      result.bits[i] = other.bits[i]!
    }
    result._size = result.countBits()
    return result
  }

  intersect(other: CompactSet): CompactSet {
    const maxVal = Math.max(this.maxValue, other.maxValue)
    const result = new CompactSet(maxVal)
    const minLen = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < minLen; i++) {
      result.bits[i] = this.bits[i]! & other.bits[i]!
    }
    result._size = result.countBits()
    return result
  }

  difference(other: CompactSet): CompactSet {
    const maxVal = Math.max(this.maxValue, other.maxValue)
    const result = new CompactSet(maxVal)
    const minLen = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i] = this.bits[i]!
    }
    for (let i = 0; i < minLen; i++) {
      result.bits[i]! &= ~other.bits[i]!
    }
    result._size = result.countBits()
    return result
  }

  equals(other: CompactSet): boolean {
    if (this._size !== other._size) return false
    const minLen = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < minLen; i++) {
      if (this.bits[i]! !== other.bits[i]) return false
    }
    for (let i = minLen; i < this.bits.length; i++) {
      if (this.bits[i]! !== 0) return false
    }
    for (let i = minLen; i < other.bits.length; i++) {
      if (other.bits[i] !== 0) return false
    }
    return true
  }

  isSubsetOf(other: CompactSet): boolean {
    const minLen = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < minLen; i++) {
      if ((this.bits[i]! & other.bits[i]!) !== this.bits[i]!) return false
    }
    for (let i = minLen; i < this.bits.length; i++) {
      if (this.bits[i]! !== 0) return false
    }
    return true
  }

  clone(): CompactSet {
    const result = new CompactSet(this.maxValue)
    result.bits.set(this.bits)
    result._size = this._size
    return result
  }

  private countBits(): number {
    let count = 0
    for (let i = 0; i < this.bits.length; i++) {
      let w = this.bits[i]!
      while (w !== 0) {
        w &= w - 1
        count++
      }
    }
    return count
  }
}
