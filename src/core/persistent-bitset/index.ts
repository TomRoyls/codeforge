import type { PersistentBitsetOptions } from './types.js'

const WORD_SIZE = 32

function wordIndex(bit: number): number {
  return bit >>> 5
}

function bitMask(bit: number): number {
  return 1 << (bit & 31)
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  x = (x + (x >>> 4)) & 0x0f0f0f0f
  x = x + (x >>> 8)
  x = x + (x >>> 16)
  return x & 0x7f
}

function trailingZeros(x: number): number {
  if (x === 0) return WORD_SIZE
  let n = 0
  if ((x & 0x0000ffff) === 0) { n += 16; x >>>= 16 }
  if ((x & 0x000000ff) === 0) { n += 8; x >>>= 8 }
  if ((x & 0x0000000f) === 0) { n += 4; x >>>= 4 }
  if ((x & 0x00000003) === 0) { n += 2; x >>>= 2 }
  if ((x & 0x00000001) === 0) { n += 1 }
  return n
}

function copyWords(words: Uint32Array): Uint32Array {
  const copy = new Uint32Array(words.length)
  copy.set(words)
  return copy
}

function ensureCapacity(words: Uint32Array, minWords: number): Uint32Array {
  if (words.length >= minWords) return words
  const grown = new Uint32Array(minWords)
  grown.set(words)
  return grown
}

export class PersistentBitset {
  private readonly _words: Uint32Array
  private readonly _size: number

  private constructor(words: Uint32Array, size: number) {
    if (size < 1) throw new RangeError('size must be >= 1')

    this._words = words
    this._size = size
  }

  static create(options?: PersistentBitsetOptions): PersistentBitset {
    const bits = options?.bits
    const size = options?.size ?? 0
    if (bits && bits.length > 0) {
      let maxBit = size > 0 ? size - 1 : 0
      for (let i = 0; i < bits.length; i++) {
        const b = bits[i]!
        if (b < 0 || !Number.isInteger(b)) {
          throw new RangeError(`Invalid bit index: ${b}`)
        }
        if (b > maxBit) maxBit = b
      }
      const numWords = wordIndex(maxBit) + 1
      const words = new Uint32Array(numWords)
      for (let i = 0; i < bits.length; i++) {
        const b = bits[i]!
        words[wordIndex(b)]! |= bitMask(b)
      }
      return new PersistentBitset(words, size > 0 ? Math.max(size, maxBit + 1) : maxBit + 1)
    }
    if (size > 0) {
      const numWords = Math.ceil(size / WORD_SIZE)
      return new PersistentBitset(new Uint32Array(numWords), size)
    }
    return new PersistentBitset(new Uint32Array(0), 0)
  }

  static empty(): PersistentBitset {
    return new PersistentBitset(new Uint32Array(0), 0)
  }

  get(bit: number): boolean {
    if (bit < 0 || !Number.isInteger(bit)) {
      throw new RangeError(`Invalid bit index: ${bit}`)
    }
    const wi = wordIndex(bit)
    if (wi >= this._words.length) return false
    return (this._words[wi]! & bitMask(bit)) !== 0
  }

  has(bit: number): boolean {
    return this.get(bit)
  }

  set(bit: number): PersistentBitset {
    if (bit < 0 || !Number.isInteger(bit)) {
      throw new RangeError(`Invalid bit index: ${bit}`)
    }
    const wi = wordIndex(bit)
    const newWords = ensureCapacity(copyWords(this._words), wi + 1)
    newWords[wi]! |= bitMask(bit)
    const newSize = Math.max(this._size, bit + 1)
    return new PersistentBitset(newWords, newSize)
  }

  clear(bit: number): PersistentBitset {
    if (bit < 0 || !Number.isInteger(bit)) {
      throw new RangeError(`Invalid bit index: ${bit}`)
    }
    const wi = wordIndex(bit)
    if (wi >= this._words.length) return this
    const newWords = copyWords(this._words)
    newWords[wi]! &= ~bitMask(bit)
    return new PersistentBitset(newWords, this._size)
  }

  toggle(bit: number): PersistentBitset {
    if (bit < 0 || !Number.isInteger(bit)) {
      throw new RangeError(`Invalid bit index: ${bit}`)
    }
    return this.get(bit) ? this.clear(bit) : this.set(bit)
  }

  get size(): number {
    return this._size
  }

  get count(): number {
    let c = 0
    for (let i = 0; i < this._words.length; i++) {
      c += popcount(this._words[i]!)
    }
    return c
  }

  get isEmpty(): boolean {
    for (let i = 0; i < this._words.length; i++) {
      if (this._words[i]! !== 0) return false
    }
    return true
  }

  and(other: PersistentBitset): PersistentBitset {
    const len = Math.min(this._words.length, other._words.length)
    const newWords = new Uint32Array(len)
    for (let i = 0; i < len; i++) {
      newWords[i] = this._words[i]! & other._words[i]!
    }
    return new PersistentBitset(newWords, Math.max(this._size, other._size))
  }

  or(other: PersistentBitset): PersistentBitset {
    const len = Math.max(this._words.length, other._words.length)
    const newWords = new Uint32Array(len)
    const minLen = Math.min(this._words.length, other._words.length)
    for (let i = 0; i < minLen; i++) {
      newWords[i] = this._words[i]! | other._words[i]!
    }
    if (this._words.length > other._words.length) {
      for (let i = other._words.length; i < this._words.length; i++) {
        newWords[i] = this._words[i]!
      }
    } else if (other._words.length > this._words.length) {
      for (let i = this._words.length; i < other._words.length; i++) {
        newWords[i] = other._words[i]!
      }
    }
    return new PersistentBitset(newWords, Math.max(this._size, other._size))
  }

  xor(other: PersistentBitset): PersistentBitset {
    const len = Math.max(this._words.length, other._words.length)
    const newWords = new Uint32Array(len)
    const minLen = Math.min(this._words.length, other._words.length)
    for (let i = 0; i < minLen; i++) {
      newWords[i] = this._words[i]! ^ other._words[i]!
    }
    if (this._words.length > other._words.length) {
      for (let i = other._words.length; i < this._words.length; i++) {
        newWords[i] = this._words[i]!
      }
    } else if (other._words.length > this._words.length) {
      for (let i = this._words.length; i < other._words.length; i++) {
        newWords[i] = other._words[i]!
      }
    }
    return new PersistentBitset(newWords, Math.max(this._size, other._size))
  }

  not(): PersistentBitset {
    const len = Math.max(this._words.length, Math.ceil(this._size / WORD_SIZE))
    const newWords = new Uint32Array(len)
    for (let i = 0; i < len; i++) {
      newWords[i] = i < this._words.length ? ~this._words[i]! : 0xffffffff >>> 0
    }
    if (this._size > 0 && this._size % WORD_SIZE !== 0) {
      const lastWordIdx = this._words.length - 1
      if (lastWordIdx >= 0) {
        const validBits = this._size % WORD_SIZE
        const mask = (1 << validBits) - 1
        newWords[lastWordIdx]! &= mask
      }
    }
    return new PersistentBitset(newWords, this._size)
  }

  equals(other: PersistentBitset): boolean {
    const maxLen = Math.max(this._words.length, other._words.length)
    for (let i = 0; i < maxLen; i++) {
      const a = i < this._words.length ? this._words[i]! : 0
      const b = i < other._words.length ? other._words[i]! : 0
      if (a !== b) return false
    }
    return true
  }

  intersects(other: PersistentBitset): boolean {
    const minLen = Math.min(this._words.length, other._words.length)
    for (let i = 0; i < minLen; i++) {
      if ((this._words[i]! & other._words[i]!) !== 0) return true
    }
    return false
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._words.length; i++) {
      let word = this._words[i]!
      while (word !== 0) {
        const bit = i * WORD_SIZE + trailingZeros(word)
        result.push(bit)
        word &= word - 1
      }
    }
    return result
  }

  toString(): string {
    if (this._size === 0) return ''
    let s = ''
    for (let i = 0; i < this._size; i++) {
      s += this.get(i) ? '1' : '0'
    }
    return s
  }

  clone(): PersistentBitset {
    return new PersistentBitset(copyWords(this._words), this._size)
  }

  [Symbol.iterator](): Iterator<number> {
    let wordIdx = 0
    let currentWord = this._words.length > 0 ? this._words[0]! : 0

    return {
      next: () => {
        while (wordIdx < this._words.length) {
          if (currentWord !== 0) {
            const bit = wordIdx * WORD_SIZE + trailingZeros(currentWord)
            currentWord &= currentWord - 1
            return { value: bit, done: false }
          }
          wordIdx++
          if (wordIdx < this._words.length) {
            currentWord = this._words[wordIdx]!
          }
        }
        return { value: undefined, done: true }
      },
    }
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'PersistentBitset', size: this.size, items: this.toArray() }
  }
}
