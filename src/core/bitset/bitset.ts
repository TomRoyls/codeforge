import { BITS_PER_WORD } from './types.js'
import type { BitsetData } from './types.js'

function popcount32(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  return ((x + (x >>> 4) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

function countTrailingZeros(x: number): number {
  if (x === 0) return 32
  let n = 0
  if ((x & 0x0000ffff) === 0) { n += 16; x >>>= 16 }
  if ((x & 0x000000ff) === 0) { n += 8; x >>>= 8 }
  if ((x & 0x0000000f) === 0) { n += 4; x >>>= 4 }
  if ((x & 0x00000003) === 0) { n += 2; x >>>= 2 }
  if ((x & 0x00000001) === 0) { n += 1 }
  return n
}

export class Bitset {
  private data: BitsetData

  constructor(size: number) {
    if (size < 0) {
      throw new RangeError(`Bitset size must be non-negative, got ${size}`)
    }
    const numWords = Math.ceil(size / BITS_PER_WORD) || 0
    this.data = {
      words: new Uint32Array(numWords),
      length: size,
    }
  }

  static fromString(bits: string): Bitset {
    const bs = new Bitset(bits.length)
    for (let i = 0; i < bits.length; i++) {
      const ch = bits.charCodeAt(i)
      if (ch === 49) {
        bs.set(i)
      } else if (ch !== 48) {
        throw new Error(`Invalid character in bit string at position ${i}: "${bits[i]}"`)
      }
    }
    return bs
  }

  static fromArray(bits: number[]): Bitset {
    const bs = new Bitset(bits.length)
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === 1) {
        bs.set(i)
      } else if (bits[i] !== 0) {
        throw new Error(`Invalid bit value at index ${i}: ${bits[i]}`)
      }
    }
    return bs
  }

  static fromNumber(n: number, size?: number): Bitset {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('Input must be a non-negative integer')
    }
    if (size !== undefined && size < 0) {
      throw new RangeError('Size must be non-negative')
    }
    const bitLength = size ?? 32
    const bs = new Bitset(bitLength)
    for (let i = 0; i < bitLength && i < 32; i++) {
      if ((n >>> i) & 1) {
        bs.set(i)
      }
    }
    return bs
  }

  private wordIndex(index: number): number {
    return index >>> 5
  }

  private bitMask(index: number): number {
    return 1 << (index & 31)
  }

  set(index: number): void {
    this.validateIndex(index)
    const wi = this.wordIndex(index)
    this.data.words[wi] = this.data.words[wi]! | this.bitMask(index)
  }

  clear(index: number): void {
    this.validateIndex(index)
    const wi = this.wordIndex(index)
    this.data.words[wi] = this.data.words[wi]! & ~this.bitMask(index)
  }

  flip(index: number): void {
    this.validateIndex(index)
    const wi = this.wordIndex(index)
    this.data.words[wi] = this.data.words[wi]! ^ this.bitMask(index)
  }

  get(index: number): number {
    this.validateIndex(index)
    const wi = this.wordIndex(index)
    return (this.data.words[wi]! & this.bitMask(index)) !== 0 ? 1 : 0
  }

  setRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    const firstWord = this.wordIndex(start)
    const lastWord = this.wordIndex(end - 1)

    if (firstWord === lastWord) {
      const mask = this.rangeMask(start, end)
      this.data.words[firstWord] = this.data.words[firstWord]! | mask
      return
    }

    const firstBit = start & 31
    if (firstBit !== 0) {
      this.data.words[firstWord] = this.data.words[firstWord]! | (~0 << firstBit)
    }

    for (let w = firstWord + (firstBit !== 0 ? 1 : 0); w < lastWord; w++) {
      this.data.words[w] = 0xffffffff
    }

    const lastBit = end & 31
    if (lastBit !== 0) {
      this.data.words[lastWord] = this.data.words[lastWord]! | ((1 << lastBit) - 1)
    } else if (lastWord < this.data.words.length) {
      this.data.words[lastWord] = 0xffffffff
    }
  }

  clearRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    const firstWord = this.wordIndex(start)
    const lastWord = this.wordIndex(end - 1)

    if (firstWord === lastWord) {
      const mask = this.rangeMask(start, end)
      this.data.words[firstWord] = this.data.words[firstWord]! & ~mask
      return
    }

    const firstBit = start & 31
    if (firstBit !== 0) {
      this.data.words[firstWord] = this.data.words[firstWord]! & ((1 << firstBit) - 1)
    }

    for (let w = firstWord + (firstBit !== 0 ? 1 : 0); w < lastWord; w++) {
      this.data.words[w] = 0
    }

    const lastBit = end & 31
    if (lastBit !== 0) {
      this.data.words[lastWord] = this.data.words[lastWord]! & (~0 << lastBit)
    } else if (lastWord < this.data.words.length) {
      this.data.words[lastWord] = 0
    }
  }

  flipRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    const firstWord = this.wordIndex(start)
    const lastWord = this.wordIndex(end - 1)

    if (firstWord === lastWord) {
      const mask = this.rangeMask(start, end)
      this.data.words[firstWord] = this.data.words[firstWord]! ^ mask
      return
    }

    const firstBit = start & 31
    if (firstBit !== 0) {
      this.data.words[firstWord] = this.data.words[firstWord]! ^ (~0 << firstBit)
    }

    for (let w = firstWord + (firstBit !== 0 ? 1 : 0); w < lastWord; w++) {
      this.data.words[w] = this.data.words[w]! ^ 0xffffffff
    }

    const lastBit = end & 31
    if (lastBit !== 0) {
      this.data.words[lastWord] = this.data.words[lastWord]! ^ ((1 << lastBit) - 1)
    } else if (lastWord < this.data.words.length) {
      this.data.words[lastWord] = this.data.words[lastWord]! ^ 0xffffffff
    }
  }

  private rangeMask(start: number, end: number): number {
    const s = start & 31
    const e = (end - 1) & 31
    if (s === 0 && e === 31) return 0xffffffff
    const mask = (~0 << s) & (((1 << (e + 1)) - 1) | (e === 31 ? ~0 : 0))
    return mask >>> 0
  }

  count(): number {
    let c = 0
    const numWords = this.data.words.length
    for (let i = 0; i < numWords; i++) {
      c += popcount32(this.data.words[i]!)
    }
    return c
  }

  size(): number {
    return this.data.length
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.data.words.length; i++) {
      if (this.data.words[i]! !== 0) return false
    }
    return true
  }

  isFull(): boolean {
    const numWords = this.data.words.length
    if (numWords === 0) return true
    for (let i = 0; i < numWords - 1; i++) {
      if (this.data.words[i]! !== 0xffffffff) return false
    }
    const lastBits = this.data.length & 31
    if (lastBits === 0) {
      return this.data.words[numWords - 1]! === 0xffffffff
    }
    const mask = (1 << lastBits) - 1
    return this.data.words[numWords - 1]! === mask
  }

  and(other: Bitset): Bitset {
    const result = new Bitset(Math.max(this.data.length, other.data.length))
    const minWords = Math.min(this.data.words.length, other.data.words.length)
    for (let i = 0; i < minWords; i++) {
      result.data.words[i] = this.data.words[i]! & other.data.words[i]!
    }
    return result
  }

  or(other: Bitset): Bitset {
    const result = new Bitset(Math.max(this.data.length, other.data.length))
    const minWords = Math.min(this.data.words.length, other.data.words.length)
    for (let i = 0; i < minWords; i++) {
      result.data.words[i] = this.data.words[i]! | other.data.words[i]!
    }
    for (let i = minWords; i < this.data.words.length; i++) {
      result.data.words[i] = this.data.words[i]!
    }
    for (let i = minWords; i < other.data.words.length; i++) {
      result.data.words[i] = other.data.words[i]!
    }
    return result
  }

  xor(other: Bitset): Bitset {
    const result = new Bitset(Math.max(this.data.length, other.data.length))
    const minWords = Math.min(this.data.words.length, other.data.words.length)
    for (let i = 0; i < minWords; i++) {
      result.data.words[i] = this.data.words[i]! ^ other.data.words[i]!
    }
    for (let i = minWords; i < this.data.words.length; i++) {
      result.data.words[i] = this.data.words[i]!
    }
    for (let i = minWords; i < other.data.words.length; i++) {
      result.data.words[i] = other.data.words[i]!
    }
    return result
  }

  not(): Bitset {
    const result = new Bitset(this.data.length)
    for (let i = 0; i < this.data.words.length; i++) {
      result.data.words[i] = (~this.data.words[i]!) >>> 0
    }
    return result
  }

  rank(index: number): number {
    if (index <= 0) return 0
    const pos = Math.min(index, this.data.length)
    const fullWords = pos >>> 5
    let count = 0
    for (let i = 0; i < fullWords; i++) {
      count += popcount32(this.data.words[i]!)
    }
    const remaining = pos & 31
    if (remaining > 0 && fullWords < this.data.words.length) {
      const mask = (1 << remaining) - 1
      count += popcount32(this.data.words[fullWords]! & mask)
    }
    return count
  }

  select(k: number): number {
    if (k < 0) return -1
    let remaining = k + 1
    for (let w = 0; w < this.data.words.length; w++) {
      const pc = popcount32(this.data.words[w]!)
      if (remaining <= pc) {
        let word = this.data.words[w]!
        while (remaining > 1) {
          word &= word - 1
          remaining--
        }
        return (w << 5) + countTrailingZeros(word)
      }
      remaining -= pc
    }
    return -1
  }

  nextSet(index: number): number {
    if (index >= this.data.length) return -1
    let startIdx = index < 0 ? 0 : index
    let w = this.wordIndex(startIdx)
    const bit = startIdx & 31
    let word = this.data.words[w]! & (~0 << bit)
    while (true) {
      if (word !== 0) {
        const pos = (w << 5) + countTrailingZeros(word)
        return pos < this.data.length ? pos : -1
      }
      w++
      if (w >= this.data.words.length) return -1
      word = this.data.words[w]!
    }
  }

  prevSet(index: number): number {
    if (index < 0 || this.data.length === 0) return -1
    let startIdx = index >= this.data.length ? this.data.length - 1 : index
    let w = this.wordIndex(startIdx)
    const bit = startIdx & 31
    let word: number
    if (bit === 31) {
      word = this.data.words[w]!
    } else {
      word = this.data.words[w]! & ((1 << (bit + 1)) - 1)
    }
    while (true) {
      if (word !== 0) {
        const highestBit = 31 - Math.clz32(word)
        return (w << 5) + highestBit
      }
      w--
      if (w < 0) return -1
      word = this.data.words[w]!
    }
  }

  toString(): string {
    let result = ''
    for (let i = 0; i < this.data.length; i++) {
      result += this.get(i)
    }
    return result
  }

  toArray(): number[] {
    const result: number[] = new Array(this.data.length)
    for (let i = 0; i < this.data.words.length; i++) {
      const word = this.data.words[i]!
      const base = i << 5
      const end = Math.min(base + 32, this.data.length)
      for (let j = base; j < end; j++) {
        result[j] = (word & (1 << (j & 31))) !== 0 ? 1 : 0
      }
    }
    return result
  }

  toNumber(): number {
    let result = 0
    for (let i = Math.min(31, this.data.length - 1); i >= 0; i--) {
      result = (result << 1) | this.get(i)
    }
    return result >>> 0
  }

  clone(): Bitset {
    const result = new Bitset(this.data.length)
    for (let i = 0; i < this.data.words.length; i++) {
      result.data.words[i] = this.data.words[i]!
    }
    return result
  }

  equals(other: Bitset): boolean {
    if (this.data.length !== other.data.length) return false
    for (let i = 0; i < this.data.words.length; i++) {
      if (this.data.words[i] !== other.data.words[i]) return false
    }
    return true
  }

  resize(newSize: number): void {
    if (newSize < 0) {
      throw new RangeError(`Bitset size must be non-negative, got ${newSize}`)
    }
    const newNumWords = Math.ceil(newSize / BITS_PER_WORD) || 0
    const newWords = new Uint32Array(newNumWords)
    const copyWords = Math.min(this.data.words.length, newNumWords)
    for (let i = 0; i < copyWords; i++) {
      newWords[i] = this.data.words[i]!
    }
    this.data.words = newWords
    this.data.length = newSize
    if (newSize > 0 && (newSize & 31) !== 0 && newNumWords > 0) {
      const mask = (1 << (newSize & 31)) - 1
      newWords[newNumWords - 1] = newWords[newNumWords - 1]! & mask
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this.data.length; i++) {
      yield this.get(i)
    }
  }

  private validateIndex(index: number): void {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of range [0, ${this.data.length})`)
    }
  }

  private validateRange(start: number, end: number): void {
    if (start < 0 || end < start || end > this.data.length) {
      throw new RangeError(`Invalid range [${start}, ${end}) for bitset of size ${this.data.length}`)
    }
  }
}

export { BITS_PER_WORD } from './types.js'
export type { BitsetData } from './types.js'
