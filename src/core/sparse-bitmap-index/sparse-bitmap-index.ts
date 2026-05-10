import {
  BITS_PER_WORD,
  WORD_SHIFT,
  WORD_MASK,
  ALL_ONES,
  DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS,
} from './types.js'
import type {
  SparseBitmapIndexOptions,
  SparseBitmapIndexStatistics,
  WordRun,
} from './types.js'

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

export class SparseBitmapIndex {
  private words: Map<number, number>
  private _size: number
  private _bitCount: number
  private stats: SparseBitmapIndexStatistics
  private options: Required<SparseBitmapIndexOptions>

  constructor(options?: SparseBitmapIndexOptions) {
    this.options = { ...DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS, ...options }
    this.words = new Map()
    this._size = 0
    this._bitCount = 0
    this.stats = { sets: 0, clears: 0, toggles: 0, rangeOperations: 0, compressions: 0, lookups: 0 }
  }

  set(index: number): void {
    if (index < 0) {
      throw new RangeError(`Index must be non-negative, got ${index}`)
    }
    const wi = index >>> WORD_SHIFT
    const mask = 1 << (index & WORD_MASK)
    const current = this.words.get(wi) ?? 0
    if ((current & mask) === 0) {
      this.words.set(wi, (current | mask) >>> 0)
      this._bitCount++
      this.updateSize(index)
    }
    this.stats.sets++
  }

  clear(index?: number): void {
    if (index === undefined) {
      this.words.clear()
      this._size = 0
      this._bitCount = 0
      return
    }
    if (index < 0) {
      throw new RangeError(`Index must be non-negative, got ${index}`)
    }
    const wi = index >>> WORD_SHIFT
    const mask = 1 << (index & WORD_MASK)
    const current = this.words.get(wi)
    if (current !== undefined && (current & mask) !== 0) {
      const newVal = (current & ~mask) >>> 0
      if (newVal === 0) {
        this.words.delete(wi)
      } else {
        this.words.set(wi, newVal)
      }
      this._bitCount--
    }
    this.stats.clears++
  }

  get(index: number): number {
    if (index < 0) {
      throw new RangeError(`Index must be non-negative, got ${index}`)
    }
    this.stats.lookups++
    const wi = index >>> WORD_SHIFT
    const word = this.words.get(wi)
    if (word === undefined) return 0
    return (word & (1 << (index & WORD_MASK))) !== 0 ? 1 : 0
  }

  toggle(index: number): void {
    if (index < 0) {
      throw new RangeError(`Index must be non-negative, got ${index}`)
    }
    const wi = index >>> WORD_SHIFT
    const mask = 1 << (index & WORD_MASK)
    const current = this.words.get(wi) ?? 0
    if ((current & mask) !== 0) {
      const newVal = (current & ~mask) >>> 0
      if (newVal === 0) {
        this.words.delete(wi)
      } else {
        this.words.set(wi, newVal)
      }
      this._bitCount--
    } else {
      this.words.set(wi, (current | mask) >>> 0)
      this._bitCount++
      this.updateSize(index)
    }
    this.stats.toggles++
  }

  setRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    const firstWord = start >>> WORD_SHIFT
    const lastWord = (end - 1) >>> WORD_SHIFT

    if (firstWord === lastWord) {
      const mask = this.rangeMask(start, end)
      const current = this.words.get(firstWord) ?? 0
      const before = popcount32(current)
      const newVal = (current | mask) >>> 0
      this.words.set(firstWord, newVal)
      this._bitCount += popcount32(newVal) - before
      this.updateSize(end - 1)
    } else {
      const firstBit = start & WORD_MASK
      if (firstBit !== 0) {
        const current = this.words.get(firstWord) ?? 0
        const before = popcount32(current)
        const newVal = (current | (~0 << firstBit)) >>> 0
        this.words.set(firstWord, newVal)
        this._bitCount += popcount32(newVal) - before
      } else {
        const before = popcount32(this.words.get(firstWord) ?? 0)
        this.words.set(firstWord, ALL_ONES)
        this._bitCount += BITS_PER_WORD - before
      }

      for (let w = firstWord + (firstBit !== 0 ? 1 : 0); w < lastWord; w++) {
        const before = popcount32(this.words.get(w) ?? 0)
        this.words.set(w, ALL_ONES)
        this._bitCount += BITS_PER_WORD - before
      }

      const lastBit = end & WORD_MASK
      if (lastBit !== 0) {
        const current = this.words.get(lastWord) ?? 0
        const before = popcount32(current)
        const newVal = (current | ((1 << lastBit) - 1)) >>> 0
        this.words.set(lastWord, newVal)
        this._bitCount += popcount32(newVal) - before
      } else {
        const before = popcount32(this.words.get(lastWord) ?? 0)
        this.words.set(lastWord, ALL_ONES)
        this._bitCount += BITS_PER_WORD - before
      }
      this.updateSize(end - 1)
    }
    this.stats.rangeOperations++
    if (this.options.autoCompress) this.maybeCompress()
  }

  clearRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    const firstWord = start >>> WORD_SHIFT
    const lastWord = (end - 1) >>> WORD_SHIFT

    if (firstWord === lastWord) {
      const mask = this.rangeMask(start, end)
      const current = this.words.get(firstWord)
      if (current !== undefined) {
        const before = popcount32(current)
        const newVal = (current & ~mask) >>> 0
        if (newVal === 0) {
          this.words.delete(firstWord)
        } else {
          this.words.set(firstWord, newVal)
        }
        this._bitCount -= before - popcount32(newVal)
      }
    } else {
      const firstBit = start & WORD_MASK
      if (firstBit !== 0) {
        const current = this.words.get(firstWord)
        if (current !== undefined) {
          const before = popcount32(current)
          const newVal = (current & ((1 << firstBit) - 1)) >>> 0
          if (newVal === 0) {
            this.words.delete(firstWord)
          } else {
            this.words.set(firstWord, newVal)
          }
          this._bitCount -= before - popcount32(newVal)
        }
      } else {
        const before = popcount32(this.words.get(firstWord) ?? 0)
        this.words.delete(firstWord)
        this._bitCount -= before
      }

      for (let w = firstWord + (firstBit !== 0 ? 1 : 0); w < lastWord; w++) {
        const before = popcount32(this.words.get(w) ?? 0)
        this.words.delete(w)
        this._bitCount -= before
      }

      const lastBit = end & WORD_MASK
      if (lastBit !== 0) {
        const current = this.words.get(lastWord)
        if (current !== undefined) {
          const before = popcount32(current)
          const newVal = (current & (~0 << lastBit)) >>> 0
          if (newVal === 0) {
            this.words.delete(lastWord)
          } else {
            this.words.set(lastWord, newVal)
          }
          this._bitCount -= before - popcount32(newVal)
        }
      } else {
        const before = popcount32(this.words.get(lastWord) ?? 0)
        this.words.delete(lastWord)
        this._bitCount -= before
      }
    }
    this.stats.rangeOperations++
    this.recomputeSize()
  }

  countOnes(): number {
    return this._bitCount
  }

  countZeros(): number {
    if (this._size === 0) return 0
    return this._size - this._bitCount
  }

  findFirst(): number {
    if (this.words.size === 0) return -1
    let minWord = Infinity
    for (const [wi] of this.words) {
      if (wi < minWord) minWord = wi
    }
    const word = this.words.get(minWord!)!
    return (minWord! << WORD_SHIFT) + countTrailingZeros(word)
  }

  findLast(): number {
    if (this.words.size === 0) return -1
    let maxWord = -1
    for (const [wi] of this.words) {
      if (wi > maxWord) maxWord = wi
    }
    const word = this.words.get(maxWord!)!
    return (maxWord! << WORD_SHIFT) + (31 - Math.clz32(word))
  }

  findNext(fromIndex: number): number {
    if (fromIndex < 0) {
      return this.findFirst()
    }
    const startWi = fromIndex >>> WORD_SHIFT
    const bit = fromIndex & WORD_MASK
    const currentWord = this.words.get(startWi)
    if (currentWord !== undefined) {
      const masked = (currentWord >>> bit) << bit
      if (masked !== 0) {
        return (startWi << WORD_SHIFT) + countTrailingZeros(masked)
      }
    }
    let wi = startWi + 1
    while (wi <= (this._size >>> WORD_SHIFT) + 1) {
      const word = this.words.get(wi)
      if (word !== undefined && word !== 0) {
        return (wi << WORD_SHIFT) + countTrailingZeros(word)
      }
      wi++
    }
    return -1
  }

  rank(index: number): number {
    if (index < 0) return 0
    const wi = index >>> WORD_SHIFT
    const bit = index & WORD_MASK
    let count = 0
    for (const [wordIdx, word] of this.words) {
      if (wordIdx < wi) {
        count += popcount32(word)
      } else if (wordIdx === wi) {
        const mask = (1 << bit) - 1
        count += popcount32(word & mask)
        break
      }
    }
    return count
  }

  select(n: number): number {
    if (n < 0 || n >= this._bitCount) return -1
    let remaining = n + 1
    const sorted = this.getSortedWordEntries()
    for (let i = 0; i < sorted.length; i++) {
      const { wordIndex, value } = sorted[i]!
      const pc = popcount32(value)
      if (remaining <= pc) {
        let word = value
        while (remaining > 1) {
          word &= word - 1
          remaining--
        }
        return (wordIndex << WORD_SHIFT) + countTrailingZeros(word)
      }
      remaining -= pc
    }
    return -1
  }

  and(other: SparseBitmapIndex): SparseBitmapIndex {
    const result = new SparseBitmapIndex()
    for (const [wi, word] of this.words) {
      const otherWord = other.words.get(wi) ?? 0
      const newVal = (word & otherWord) >>> 0
      if (newVal !== 0) {
        result.words.set(wi, newVal)
        result._bitCount += popcount32(newVal)
      }
    }
    result._size = Math.max(this._size, other._size)
    return result
  }

  or(other: SparseBitmapIndex): SparseBitmapIndex {
    const result = new SparseBitmapIndex()
    const allKeys = new Set([...this.words.keys(), ...other.words.keys()])
    for (const wi of allKeys) {
      const a = this.words.get(wi) ?? 0
      const b = other.words.get(wi) ?? 0
      const newVal = (a | b) >>> 0
      if (newVal !== 0) {
        result.words.set(wi, newVal)
        result._bitCount += popcount32(newVal)
      }
    }
    result._size = Math.max(this._size, other._size)
    return result
  }

  xor(other: SparseBitmapIndex): SparseBitmapIndex {
    const result = new SparseBitmapIndex()
    const allKeys = new Set([...this.words.keys(), ...other.words.keys()])
    for (const wi of allKeys) {
      const a = this.words.get(wi) ?? 0
      const b = other.words.get(wi) ?? 0
      const newVal = (a ^ b) >>> 0
      if (newVal !== 0) {
        result.words.set(wi, newVal)
        result._bitCount += popcount32(newVal)
      }
    }
    result._size = Math.max(this._size, other._size)
    return result
  }

  not(): SparseBitmapIndex {
    const result = new SparseBitmapIndex()
    if (this._size === 0) return result
    const numWords = Math.ceil(this._size / BITS_PER_WORD)
    for (let wi = 0; wi < numWords; wi++) {
      const current = this.words.get(wi) ?? 0
      let newVal = (~current) >>> 0
      if (wi === numWords - 1 && (this._size & WORD_MASK) !== 0) {
        const mask = (1 << (this._size & WORD_MASK)) - 1
        newVal = (newVal & mask) >>> 0
      }
      if (newVal !== 0) {
        result.words.set(wi, newVal)
        result._bitCount += popcount32(newVal)
      }
    }
    result._size = this._size
    return result
  }

  equals(other: SparseBitmapIndex): boolean {
    if (this._bitCount !== other._bitCount) return false
    const allKeys = new Set([...this.words.keys(), ...other.words.keys()])
    for (const wi of allKeys) {
      const a = this.words.get(wi) ?? 0
      const b = other.words.get(wi) ?? 0
      if (a !== b) return false
    }
    return true
  }

  get isEmpty(): boolean {
    return this._bitCount === 0
  }

  get size(): number {
    return this._size
  }

  get bitCount(): number {
    return this._bitCount
  }

  toArray(): number[] {
    if (this._size === 0) return []
    const result = new Array(this._size).fill(0)
    for (const [wi, word] of this.words) {
      const base = wi << WORD_SHIFT
      for (let b = 0; b < BITS_PER_WORD; b++) {
        const idx = base + b
        if (idx >= this._size) break
        if ((word & (1 << b)) !== 0) {
          result[idx] = 1
        }
      }
    }
    return result
  }

  forEach(callback: (index: number, value: number) => void): void {
    const sorted = this.getSortedWordEntries()
    for (let i = 0; i < sorted.length; i++) {
      const { wordIndex, value } = sorted[i]!
      const base = wordIndex << WORD_SHIFT
      let word = value
      while (word !== 0) {
        const bit = countTrailingZeros(word)
        const idx = base + bit
        callback(idx, 1)
        word &= word - 1
      }
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    const sorted = this.getSortedWordEntries()
    for (let i = 0; i < sorted.length; i++) {
      const { wordIndex, value } = sorted[i]!
      const base = wordIndex << WORD_SHIFT
      let word = value
      while (word !== 0) {
        const bit = countTrailingZeros(word)
        yield base + bit
        word &= word - 1
      }
    }
  }

  getStatistics(): SparseBitmapIndexStatistics {
    return { ...this.stats }
  }

  compress(): void {
    for (const [wi, word] of this.words) {
      if (word === 0) {
        this.words.delete(wi)
      }
    }
    this.stats.compressions++
  }

  private maybeCompress(): void {
    const totalWords = this._size === 0 ? 1 : Math.ceil(this._size / BITS_PER_WORD)
    const density = this.words.size / totalWords
    if (density > this.options.compressionThreshold && this.words.size > 16) {
      this.compress()
    }
  }

  private updateSize(index: number): void {
    if (index >= this._size) {
      this._size = index + 1
    }
  }

  private recomputeSize(): void {
    this._size = 0
    for (const [wi, word] of this.words) {
      if (word !== 0) {
        const lastBit = 31 - Math.clz32(word)
        const candidate = (wi << WORD_SHIFT) + lastBit + 1
        if (candidate > this._size) {
          this._size = candidate
        }
      }
    }
  }

  private getSortedWordEntries(): WordRun[] {
    const entries: WordRun[] = []
    for (const [wordIndex, value] of this.words) {
      entries.push({ wordIndex, value })
    }
    entries.sort((a, b) => a.wordIndex - b.wordIndex)
    return entries
  }

  private rangeMask(start: number, end: number): number {
    const s = start & WORD_MASK
    const e = (end - 1) & WORD_MASK
    if (s === 0 && e === 31) return ALL_ONES
    const mask = (~0 << s) & (((1 << (e + 1)) - 1) | (e === 31 ? ~0 : 0))
    return mask >>> 0
  }

  private validateRange(start: number, end: number): void {
    if (start < 0) {
      throw new RangeError(`Range start must be non-negative, got ${start}`)
    }
    if (end < start) {
      throw new RangeError(`Range end (${end}) must be >= start (${start})`)
    }
  }
}

export {
  BITS_PER_WORD,
  WORD_SHIFT,
  WORD_MASK,
  ALL_ONES,
  DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS,
} from './types.js'
export type {
  SparseBitmapIndexOptions,
  SparseBitmapIndexStatistics,
  WordRun,
} from './types.js'
