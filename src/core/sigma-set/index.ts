import type { SigmaSetOptions, ForEachCallback } from './types.js'

export class SigmaSet {
  private bits: Uint32Array
  private _universeSize: number
  private _size: number

  constructor(options: SigmaSetOptions) {
    if (
      options.universeSize < 0 ||
      !Number.isInteger(options.universeSize)
    ) {
      throw new RangeError('universeSize must be a non-negative integer')
    }
    this._universeSize = options.universeSize
    const wordCount = Math.ceil(this._universeSize / 32)
    this.bits = new Uint32Array(wordCount)
    this._size = 0
  }

  private validateValue(value: number): void {
    if (value < 0 || value >= this._universeSize || !Number.isInteger(value)) {
      throw new RangeError(
        `Value must be an integer in [0, ${this._universeSize})`
      )
    }
  }

  add(value: number): boolean {
    this.validateValue(value)
    const wordIndex = value >>> 5
    const mask = 1 << (value & 31)
    if ((this.bits[wordIndex]! & mask) !== 0) {
      return false
    }
    this.bits[wordIndex]! |= mask
    this._size++
    return true
  }

  delete(value: number): boolean {
    this.validateValue(value)
    const wordIndex = value >>> 5
    const mask = 1 << (value & 31)
    if ((this.bits[wordIndex]! & mask) === 0) {
      return false
    }
    this.bits[wordIndex]! &= ~mask
    this._size--
    return true
  }

  has(value: number): boolean {
    if (value < 0 || value >= this._universeSize || !Number.isInteger(value)) {
      return false
    }
    const wordIndex = value >>> 5
    const mask = 1 << (value & 31)
    return (this.bits[wordIndex]! & mask) !== 0
  }

  contains(value: number): boolean {
    return this.has(value)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.bits.fill(0)
    this._size = 0
  }

  toArray(): number[] {
    const result: number[] = []
    this.forEach((v) => result.push(v))
    return result
  }

  clone(): SigmaSet {
    const copy = new SigmaSet({ universeSize: this._universeSize })
    copy.bits = new Uint32Array(this.bits)
    copy._size = this._size
    return copy
  }

  static fromArray(
    arr: number[],
    options: SigmaSetOptions
  ): SigmaSet {
    const set = new SigmaSet(options)
    for (const v of arr) {
      set.add(v)
    }
    return set
  }

  forEach(callback: ForEachCallback): void {
    for (let i = 0; i < this._universeSize; i++) {
      if (this.has(i)) {
        callback(i)
      }
    }
  }

  *[Symbol.iterator](): Generator<number> {
    for (let i = 0; i < this._universeSize; i++) {
      if (this.has(i)) {
        yield i
      }
    }
  }

  min(): number {
    if (this._size === 0) {
      throw new RangeError('SigmaSet is empty')
    }
    for (let i = 0; i < this._universeSize; i++) {
      if (this.has(i)) {
        return i
      }
    }
    throw new RangeError('SigmaSet is empty')
  }

  max(): number {
    if (this._size === 0) {
      throw new RangeError('SigmaSet is empty')
    }
    for (let i = this._universeSize - 1; i >= 0; i--) {
      if (this.has(i)) {
        return i
      }
    }
    throw new RangeError('SigmaSet is empty')
  }

  next(value: number): number {
    if (value < 0 || !Number.isInteger(value)) {
      throw new RangeError('Value must be a non-negative integer')
    }
    for (let i = value; i < this._universeSize; i++) {
      if (this.has(i)) {
        return i
      }
    }
    return -1
  }

  prev(value: number): number {
    if (value < 0 || !Number.isInteger(value)) {
      throw new RangeError('Value must be a non-negative integer')
    }
    const upper = Math.min(value, this._universeSize - 1)
    for (let i = upper; i >= 0; i--) {
      if (this.has(i)) {
        return i
      }
    }
    return -1
  }

  countRange(lo: number, hi: number): number {
    if (
      lo < 0 || hi < 0 ||
      !Number.isInteger(lo) || !Number.isInteger(hi) ||
      lo > hi
    ) {
      throw new RangeError('Invalid range')
    }
    let count = 0
    const upper = Math.min(hi, this._universeSize - 1)
    for (let i = lo; i <= upper; i++) {
      if (this.has(i)) {
        count++
      }
    }
    return count
  }

  range(lo: number, hi: number): number[] {
    if (
      lo < 0 || hi < 0 ||
      !Number.isInteger(lo) || !Number.isInteger(hi) ||
      lo > hi
    ) {
      throw new RangeError('Invalid range')
    }
    const result: number[] = []
    const upper = Math.min(hi, this._universeSize - 1)
    for (let i = lo; i <= upper; i++) {
      if (this.has(i)) {
        result.push(i)
      }
    }
    return result
  }

  union(other: SigmaSet): SigmaSet {
    if (other._universeSize !== this._universeSize) {
      throw new RangeError('Universe sizes must match')
    }
    const result = new SigmaSet({ universeSize: this._universeSize })
    const wordCount = this.bits.length
    let size = 0
    for (let w = 0; w < wordCount; w++) {
      result.bits[w] = this.bits[w]! | other.bits[w]!
      size += popcount(result.bits[w]!)
    }
    result._size = size
    return result
  }

  intersection(other: SigmaSet): SigmaSet {
    if (other._universeSize !== this._universeSize) {
      throw new RangeError('Universe sizes must match')
    }
    const result = new SigmaSet({ universeSize: this._universeSize })
    const wordCount = this.bits.length
    let size = 0
    for (let w = 0; w < wordCount; w++) {
      result.bits[w] = this.bits[w]! & other.bits[w]!
      size += popcount(result.bits[w]!)
    }
    result._size = size
    return result
  }

  difference(other: SigmaSet): SigmaSet {
    if (other._universeSize !== this._universeSize) {
      throw new RangeError('Universe sizes must match')
    }
    const result = new SigmaSet({ universeSize: this._universeSize })
    const wordCount = this.bits.length
    let size = 0
    for (let w = 0; w < wordCount; w++) {
      result.bits[w] = this.bits[w]! & ~other.bits[w]!
      size += popcount(result.bits[w]!)
    }
    result._size = size
    return result
  }

  complement(): SigmaSet {
    const result = new SigmaSet({ universeSize: this._universeSize })
    const wordCount = this.bits.length
    let size = 0
    for (let w = 0; w < wordCount; w++) {
      result.bits[w] = ~this.bits[w]!
      size += popcount(result.bits[w]!)
    }
    const totalBits = wordCount * 32
    const excess = totalBits - this._universeSize
    if (excess > 0) {
      const lastWordBits = 32 - excess
      const lastWord = result.bits[wordCount - 1]!
      const mask = (1 << lastWordBits) - 1
      size -= popcount(lastWord & ~mask)
      result.bits[wordCount - 1] = lastWord & mask
    }
    result._size = size
    return result
  }

  isSubsetOf(other: SigmaSet): boolean {
    if (other._universeSize !== this._universeSize) {
      throw new RangeError('Universe sizes must match')
    }
    const wordCount = this.bits.length
    for (let w = 0; w < wordCount; w++) {
      if ((this.bits[w]! & ~other.bits[w]!) !== 0) {
        return false
      }
    }
    return true
  }

  isSupersetOf(other: SigmaSet): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: SigmaSet): boolean {
    if (other._universeSize !== this._universeSize) {
      return false
    }
    const wordCount = this.bits.length
    for (let w = 0; w < wordCount; w++) {
      if (this.bits[w] !== other.bits[w]) {
        return false
      }
    }
    return true
  }

  intersects(other: SigmaSet): boolean {
    if (other._universeSize !== this._universeSize) {
      throw new RangeError('Universe sizes must match')
    }
    const wordCount = this.bits.length
    for (let w = 0; w < wordCount; w++) {
      if ((this.bits[w]! & other.bits[w]!) !== 0) {
        return true
      }
    }
    return false
  }

  fill(): void {
    const wordCount = this.bits.length
    for (let w = 0; w < wordCount; w++) {
      this.bits[w] = 0xFFFFFFFF
    }
    const totalBits = wordCount * 32
    const excess = totalBits - this._universeSize
    if (excess > 0) {
      const lastWordBits = 32 - excess
      this.bits[wordCount - 1]! = (1 << lastWordBits) - 1
    }
    this._size = this._universeSize
  }

  get universeSize(): number {
    return this._universeSize
  }

  density(): number {
    if (this._universeSize === 0) return 0
    return this._size / this._universeSize
  }

  toString(): string {
    let result = ''
    for (let i = 0; i < this._universeSize; i++) {
      result += this.has(i) ? '1' : '0'
    }
    return result
  }

  toJSON() {
    return { type: 'SigmaSet', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'SigmaSet'
  }
}

function popcount(value: number): number {
  let v = value >>> 0
  v = v - ((v >> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333)
  v = (v + (v >> 4)) & 0x0F0F0F0F
  v = (v * 0x01010101) >>> 24
  return v
}
