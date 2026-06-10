import type { BitSetOptions } from './types.js'
import { DEFAULT_BITSET_OPTIONS } from './types.js'

const BITS_PER_WORD = 32

export class BitSet2 {
  private _words: Uint32Array
  private _size: number
  private readonly growable: boolean

  constructor(size?: number)
  constructor(options: BitSetOptions)
  constructor(arg?: number | BitSetOptions) {
    if (arg === undefined) {
      this._size = DEFAULT_BITSET_OPTIONS.size
      this.growable = DEFAULT_BITSET_OPTIONS.growable ?? true
    } else if (typeof arg === 'number') {
      if (arg < 0) {
        throw new Error(`Size must be non-negative, got ${arg}`)
      }
      if (!Number.isInteger(arg)) {
        throw new Error(`Size must be an integer, got ${arg}`)
      }
      this._size = arg
      this.growable = true
    } else {
      const size = arg.size ?? DEFAULT_BITSET_OPTIONS.size
      if (size < 0) {
        throw new Error(`Size must be non-negative, got ${size}`)
      }
      if (!Number.isInteger(size)) {
        throw new Error(`Size must be an integer, got ${size}`)
      }
      this._size = size
      this.growable = arg.growable ?? DEFAULT_BITSET_OPTIONS.growable ?? true
    }
    const wordCount = Math.ceil(this._size / BITS_PER_WORD) || 1
    this._words = new Uint32Array(wordCount)
  }

  private ensureCapacity(bitIndex: number): void {
    if (bitIndex < 0 || !Number.isInteger(bitIndex)) {
      throw new Error(`Index must be a non-negative integer, got ${bitIndex}`)
    }
    if (bitIndex < this._size) return
    if (!this.growable) {
      throw new Error(`Index ${bitIndex} out of bounds (size: ${this._size})`)
    }
    this._size = bitIndex + 1
    const neededWords = Math.ceil(this._size / BITS_PER_WORD)
    if (neededWords > this._words.length) {
      const newWords = new Uint32Array(neededWords)
      newWords.set(this._words)
      this._words = newWords
    }
  }

  private wordIndex(bit: number): number {
    return bit >>> 5
  }

  private bitMask(bit: number): number {
    return 1 << (bit & 31)
  }

  set(index: number): this {
    this.ensureCapacity(index)
    const wi = this.wordIndex(index)
    this._words[wi] = this._words[wi]! | this.bitMask(index)
    return this
  }

  clear(index: number): this {
    if (index >= 0 && index < this._size && Number.isInteger(index)) {
      const wi = this.wordIndex(index)
      this._words[wi] = this._words[wi]! & ~this.bitMask(index)
    }
    return this
  }

  toggle(index: number): this {
    this.ensureCapacity(index)
    const wi = this.wordIndex(index)
    this._words[wi] = this._words[wi]! ^ this.bitMask(index)
    return this
  }

  get(index: number): boolean {
    if (index < 0 || index >= this._size || !Number.isInteger(index)) {
      return false
    }
    const wi = this.wordIndex(index)
    return (this._words[wi]! & this.bitMask(index)) !== 0
  }

  flip(): this {
    for (let i = 0; i < this._words.length; i++) {
      this._words[i] = ~this._words[i]!
    }
    const usedBits = this._size & 31
    if (usedBits > 0 && this._words.length > 0) {
      const lastWord = this._words.length - 1
      const mask = (1 << usedBits) - 1
      this._words[lastWord] = this._words[lastWord]! & mask
    }
    return this
  }

  and(other: BitSet2): this {
    const minWords = Math.min(this._words.length, other._words.length)
    for (let i = 0; i < minWords; i++) {
      this._words[i] = this._words[i]! & other._words[i]!
    }
    for (let i = minWords; i < this._words.length; i++) {
      this._words[i] = 0
    }
    return this
  }

  or(other: BitSet2): this {
    const maxWords = Math.max(this._words.length, other._words.length)
    if (maxWords > this._words.length) {
      const newWords = new Uint32Array(maxWords)
      newWords.set(this._words)
      this._words = newWords
    }
    for (let i = 0; i < other._words.length; i++) {
      this._words[i] = this._words[i]! | other._words[i]!
    }
    const newSize = Math.max(this._size, other._size)
    if (newSize > this._size) {
      this._size = newSize
    }
    return this
  }

  xor(other: BitSet2): this {
    const maxWords = Math.max(this._words.length, other._words.length)
    if (maxWords > this._words.length) {
      const newWords = new Uint32Array(maxWords)
      newWords.set(this._words)
      this._words = newWords
    }
    for (let i = 0; i < other._words.length; i++) {
      this._words[i] = this._words[i]! ^ other._words[i]!
    }
    const newSize = Math.max(this._size, other._size)
    if (newSize > this._size) {
      this._size = newSize
    }
    return this
  }

  not(): BitSet2 {
    const result = this.clone()
    result.flip()
    return result
  }

  nand(other: BitSet2): this {
    this.and(other)
    this.flip()
    return this
  }

  nor(other: BitSet2): this {
    this.or(other)
    this.flip()
    return this
  }

  get size(): number {
    return this._size
  }

  get count(): number {
    let c = 0
    for (let i = 0; i < this._words.length; i++) {
      let w = this._words[i]!
      w = w - ((w >>> 1) & 0x55555555)
      w = (w & 0x33333333) + ((w >>> 2) & 0x33333333)
      w = (w + (w >>> 4)) & 0x0f0f0f0f
      c += (w * 0x01010101) >>> 24
    }
    return c
  }

  get isEmpty(): boolean {
    for (let i = 0; i < this._words.length; i++) {
      if (this._words[i]! !== 0) return false
    }
    return true
  }

  setAll(): this {
    for (let i = 0; i < this._words.length; i++) {
      this._words[i] = 0xffffffff
    }
    const usedBits = this._size & 31
    if (usedBits > 0 && this._words.length > 0) {
      const lastWord = this._words.length - 1
      const mask = (1 << usedBits) - 1
      this._words[lastWord] = mask
    }
    return this
  }

  clearAll(): this {
    for (let i = 0; i < this._words.length; i++) {
      this._words[i] = 0
    }
    return this
  }

  clone(): BitSet2 {
    const copy = new BitSet2({ size: this._size, growable: this.growable })
    copy._words = new Uint32Array(this._words)
    return copy
  }

  equals(other: BitSet2): boolean {
    if (this._size !== other._size) return false
    const maxWords = Math.max(this._words.length, other._words.length)
    for (let i = 0; i < maxWords; i++) {
      const a = i < this._words.length ? this._words[i]! : 0
      const b = i < other._words.length ? other._words[i]! : 0
      if (a !== b) return false
    }
    return true
  }

  intersects(other: BitSet2): boolean {
    const minWords = Math.min(this._words.length, other._words.length)
    for (let i = 0; i < minWords; i++) {
      if ((this._words[i]! & other._words[i]!) !== 0) return true
    }
    return false
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      const wi = this.wordIndex(i)
      if ((this._words[wi]! & this.bitMask(i)) !== 0) {
        result.push(i)
      }
    }
    return result
  }

  toString(): string {
    let result = ''
    for (let i = this._size - 1; i >= 0; i--) {
      const wi = this.wordIndex(i)
      result += (this._words[wi]! & this.bitMask(i)) !== 0 ? '1' : '0'
    }
    return result
  }

  forEach(callback: (index: number, value: boolean) => void): void {
    for (let i = 0; i < this._size; i++) {
      const wi = this.wordIndex(i)
      callback(i, (this._words[wi]! & this.bitMask(i)) !== 0)
    }
  }

  [Symbol.iterator](): Iterator<number> {
    let index = 0
    const words = this._words
    const size = this._size
    return {
      next(): IteratorResult<number> {
        while (index < size) {
          const wi = index >>> 5
          const mask = 1 << (index & 31)
          const current = index
          index++
          if ((words[wi]! & mask) !== 0) {
            return { value: current, done: false }
          }
        }
        return { value: undefined, done: true }
      },
    }
  }

  range(start: number, end: number): BitSet2 {
    if (start < 0 || end < start || !Number.isInteger(start) || !Number.isInteger(end)) {
      return new BitSet2({ size: 0, growable: this.growable })
    }
    const actualEnd = Math.min(end, this._size)
    const result = new BitSet2({
      size: actualEnd - start,
      growable: this.growable,
    })
    for (let i = start; i < actualEnd; i++) {
      const wi = this.wordIndex(i)
      if ((this._words[wi]! & this.bitMask(i)) !== 0) {
        result.set(i - start)
      }
    }
    return result
  }

  nextSet(from: number): number {
    if (from < 0) from = 0
    for (let i = from; i < this._size; i++) {
      const wi = this.wordIndex(i)
      if ((this._words[wi]! & this.bitMask(i)) !== 0) return i
    }
    return -1
  }

  nextClear(from: number): number {
    if (from < 0) from = 0
    for (let i = from; i < this._size; i++) {
      const wi = this.wordIndex(i)
      if ((this._words[wi]! & this.bitMask(i)) === 0) return i
    }
    return -1
  }

  previousSet(from: number): number {
    if (from >= this._size) from = this._size - 1
    for (let i = from; i >= 0; i--) {
      const wi = this.wordIndex(i)
      if ((this._words[wi]! & this.bitMask(i)) !== 0) return i
    }
    return -1
  }

  previousClear(from: number): number {
    if (from >= this._size) from = this._size - 1
    for (let i = from; i >= 0; i--) {
      const wi = this.wordIndex(i)
      if ((this._words[wi]! & this.bitMask(i)) === 0) return i
    }
    return -1
  }

  static fromArray(indices: number[], options?: BitSetOptions): BitSet2 {
    let maxSize = 0
    for (let i = 0; i < indices.length; i++) {
      if (indices[i]! > maxSize) maxSize = indices[i]!
    }
    const size = options
      ? options.size
      : maxSize + 1
    const growable = options?.growable ?? true
    const bs = new BitSet2({ size, growable })
    for (let i = 0; i < indices.length; i++) {
      bs.set(indices[i]!)
    }
    return bs
  }

  get words(): Uint32Array {
    return this._words
  }

  toJSON() {
    return { type: 'BitSet2', size: this.size, items: this.toArray() }
  }

  static empty(): BitSet2 {
    return new BitSet2()
  }

  get [Symbol.toStringTag](): string {
    return 'BitSet2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty
  }
}

export type { BitSetOptions } from './types.js'
export { DEFAULT_BITSET_OPTIONS } from './types.js'
