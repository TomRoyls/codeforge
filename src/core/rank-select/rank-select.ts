import type { RankSelectData, RankSelectIndex } from './types.js'

const BITS_PER_WORD = 32
const BLOCK_SIZE = 512
const WORDS_PER_BLOCK = BLOCK_SIZE / BITS_PER_WORD
const SELECT_SAMPLE = 64

function popcount32(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  return ((x + (x >>> 4) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

function ctz32(x: number): number {
  if (x === 0) return 32
  let n = 0
  if ((x & 0x0000ffff) === 0) { n += 16; x >>>= 16 }
  if ((x & 0x000000ff) === 0) { n += 8; x >>>= 8 }
  if ((x & 0x0000000f) === 0) { n += 4; x >>>= 4 }
  if ((x & 0x00000003) === 0) { n += 2; x >>>= 2 }
  if ((x & 0x00000001) === 0) { n += 1 }
  return n
}

function highestBitSet(x: number): number {
  if (x === 0) return -1
  return 31 - Math.clz32(x)
}

export class RankSelect {
  private data: RankSelectData
  private index: RankSelectIndex
  private totalOnes: number
  private totalZeros: number

  constructor(bits: string | number[] | Uint32Array, length?: number) {
    this.data = RankSelect.parseInput(bits, length)
    this.totalOnes = 0
    this.totalZeros = 0
    const numWords = Math.ceil(this.data.length / BITS_PER_WORD)
    for (let w = 0; w < numWords; w++) {
      this.totalOnes += popcount32(this.data.bits[w]!)
    }
    this.totalZeros = this.data.length - this.totalOnes
    this.index = this.buildIndex()
  }

  private static parseInput(bits: string | number[] | Uint32Array, length?: number): RankSelectData {
    if (typeof bits === 'string') {
      const len = length ?? bits.length
      const numWords = Math.ceil(len / BITS_PER_WORD) || 0
      const words = new Uint32Array(numWords)
      for (let i = 0; i < bits.length; i++) {
        const ch = bits.charCodeAt(i)
        if (ch === 49) {
          const wi = i >>> 5
          words[wi] = words[wi]! | (1 << (i & 31))
        } else if (ch !== 48) {
          throw new Error(`Invalid character in bit string at position ${i}: "${bits[i]}"`)
        }
      }
      return { bits: words, length: len }
    }

    if (bits instanceof Uint32Array) {
      const len = length ?? (bits.length * BITS_PER_WORD)
      return { bits: new Uint32Array(bits), length: len }
    }

    const arr = bits
    const len = length ?? arr.length
    const numWords = Math.ceil(len / BITS_PER_WORD) || 0
    const words = new Uint32Array(numWords)
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i]
      if (v === 1) {
        const wi = i >>> 5
        words[wi] = words[wi]! | (1 << (i & 31))
      } else if (v !== 0 && v !== undefined) {
        throw new Error(`Invalid bit value at index ${i}: ${v}`)
      }
    }
    return { bits: words, length: len }
  }

  private buildIndex(): RankSelectIndex {
    const n = this.data.length
    const numWords = Math.ceil(n / BITS_PER_WORD) || 0
    const numBlocks = Math.ceil(n / BLOCK_SIZE) || 0

    const blocks = new Uint32Array(numBlocks + 1)

    let cumOnes = 0
    for (let b = 0; b < numBlocks; b++) {
      blocks[b] = cumOnes
      const wStart = b * WORDS_PER_BLOCK
      const wEnd = Math.min(wStart + WORDS_PER_BLOCK, numWords)
      for (let w = wStart; w < wEnd; w++) {
        cumOnes += popcount32(this.data.bits[w]!)
      }
    }
    blocks[numBlocks] = cumOnes

    const select1Samples = new Int32Array(Math.ceil(this.totalOnes / SELECT_SAMPLE) + 1).fill(-1)
    const select0Samples = new Int32Array(Math.ceil(this.totalZeros / SELECT_SAMPLE) + 1).fill(-1)

    let onesSeen = 0
    let zerosSeen = 0
    for (let i = 0; i < n; i++) {
      const wi = i >>> 5
      const bit = (this.data.bits[wi]! >>> (i & 31)) & 1
      if (bit === 1) {
        onesSeen++
        if (onesSeen % SELECT_SAMPLE === 0) {
          const si = Math.floor(onesSeen / SELECT_SAMPLE)
          if (si < select1Samples.length) {
            select1Samples[si] = i
          }
        }
      } else {
        zerosSeen++
        if (zerosSeen % SELECT_SAMPLE === 0) {
          const si = Math.floor(zerosSeen / SELECT_SAMPLE)
          if (si < select0Samples.length) {
            select0Samples[si] = i
          }
        }
      }
    }

    return { blocks, select1Samples, select0Samples }
  }

  static fromString(bits: string): RankSelect {
    return new RankSelect(bits)
  }

  static fromArray(bits: number[]): RankSelect {
    return new RankSelect(bits)
  }

  access(index: number): number {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of range [0, ${this.data.length})`)
    }
    const wi = index >>> 5
    return (this.data.bits[wi]! >>> (index & 31)) & 1
  }

  rank1(index: number): number {
    if (index <= 0) return 0
    if (index > this.data.length) index = this.data.length

    const bIdx = Math.floor((index - 1) / BLOCK_SIZE)
    let rank = this.index.blocks[bIdx]!

    const wordStart = bIdx * WORDS_PER_BLOCK
    const lastPos = index - 1
    const lastWord = lastPos >>> 5

    for (let w = wordStart; w < lastWord; w++) {
      rank += popcount32(this.data.bits[w]!)
    }

    if (lastWord < this.data.bits.length && lastWord >= wordStart) {
      const bitsInLastWord = (lastPos & 31) + 1
      const mask = bitsInLastWord === BITS_PER_WORD ? ~0 : (1 << bitsInLastWord) - 1
      rank += popcount32(this.data.bits[lastWord]! & mask)
    }

    return rank
  }

  rank0(index: number): number {
    return index - this.rank1(index)
  }

  select1(k: number): number {
    if (k < 0 || k >= this.totalOnes) return -1

    const target = k + 1

    let lo = 0
    const sampleIdx = Math.floor(target / SELECT_SAMPLE)
    if (sampleIdx > 0 && sampleIdx < this.index.select1Samples.length && this.index.select1Samples[sampleIdx]! !== -1) {
      lo = this.index.select1Samples[sampleIdx]!
    }

    let count = this.rank1(lo)
    const startWord = lo >>> 5
    const startBit = lo & 31

    if (startBit > 0 && startWord < Math.ceil(this.data.length / BITS_PER_WORD)) {
      const word = this.data.bits[startWord]!
      const masked = word >>> startBit
      const bitsInMask = Math.min(BITS_PER_WORD - startBit, this.data.length - lo)
      const onesInRest = popcount32(bitsInMask < BITS_PER_WORD - startBit ? masked & ((1 << bitsInMask) - 1) : masked)
      if (count + onesInRest >= target) {
        let remaining = target - count
        let bits = masked
        const limit = Math.min(BITS_PER_WORD - startBit, this.data.length - lo)
        const mask = limit < BITS_PER_WORD - startBit ? (1 << limit) - 1 : ~0
        bits &= mask
        while (remaining > 1) {
          bits &= bits - 1
          remaining--
        }
        if (bits !== 0) return lo + ctz32(bits)
      }
      count += onesInRest
    }

    const numWords = Math.ceil(this.data.length / BITS_PER_WORD)
    for (let w = startWord + (startBit > 0 ? 1 : 0); w < numWords; w++) {
      const word = this.data.bits[w]!
      const wordOnes = popcount32(word)
      if (count + wordOnes >= target) {
        let remaining = target - count
        let bits = word
        while (remaining > 1) {
          bits &= bits - 1
          remaining--
        }
        return (w << 5) + ctz32(bits)
      }
      count += wordOnes
    }
    return -1
  }

  select0(k: number): number {
    if (k < 0 || k >= this.totalZeros) return -1

    const target = k + 1

    let lo = 0
    const sampleIdx = Math.floor(target / SELECT_SAMPLE)
    if (sampleIdx > 0 && sampleIdx < this.index.select0Samples.length && this.index.select0Samples[sampleIdx]! !== -1) {
      lo = this.index.select0Samples[sampleIdx]!
    }

    let count = this.rank0(lo)
    const startWord = lo >>> 5
    const startBit = lo & 31
    const numWords = Math.ceil(this.data.length / BITS_PER_WORD)

    if (startBit > 0 && startWord < numWords) {
      const word = this.data.bits[startWord]!
      const masked = word >>> startBit
      const bitsInRest = Math.min(BITS_PER_WORD - startBit, this.data.length - lo)
      const limit = bitsInRest < BITS_PER_WORD - startBit ? bitsInRest : BITS_PER_WORD - startBit
      const zerosInRest = limit - popcount32(limit < BITS_PER_WORD - startBit ? masked & ((1 << limit) - 1) : masked)
      if (count + zerosInRest >= target) {
        let remaining = target - count
        for (let b = 0; b < bitsInRest; b++) {
          if ((masked & (1 << b)) === 0) {
            remaining--
            if (remaining === 0) return lo + b
          }
        }
      }
      count += zerosInRest
    }

    for (let w = startWord + (startBit > 0 ? 1 : 0); w < numWords; w++) {
      const word = this.data.bits[w]!
      const bitsAvail = Math.min(BITS_PER_WORD, this.data.length - (w << 5))
      const wordOnes = popcount32(bitsAvail === BITS_PER_WORD ? word : word & ((1 << bitsAvail) - 1))
      const wordZeros = bitsAvail - wordOnes
      if (count + wordZeros >= target) {
        let remaining = target - count
        for (let b = 0; b < bitsAvail; b++) {
          if ((word & (1 << b)) === 0) {
            remaining--
            if (remaining === 0) return (w << 5) + b
          }
        }
      }
      count += wordZeros
    }
    return -1
  }

  size(): number {
    return this.data.length
  }

  count1(): number {
    return this.totalOnes
  }

  count0(): number {
    return this.totalZeros
  }

  next1(index: number): number {
    if (index < 0) index = 0
    if (index >= this.data.length) return -1
    const numWords = Math.ceil(this.data.length / BITS_PER_WORD)
    let w = index >>> 5
    const bit = index & 31
    let word = this.data.bits[w]! & (~0 << bit)
    while (true) {
      const bitsAvail = Math.min(BITS_PER_WORD, this.data.length - (w << 5))
      const masked = bitsAvail < BITS_PER_WORD ? word & ((1 << bitsAvail) - 1) : word
      if (masked !== 0) {
        const pos = (w << 5) + ctz32(masked)
        return pos < this.data.length ? pos : -1
      }
      w++
      if (w >= numWords) return -1
      word = this.data.bits[w]!
    }
  }

  prev1(index: number): number {
    if (this.data.length === 0) return -1
    if (index < 0) return -1
    if (index >= this.data.length) index = this.data.length - 1
    let w = index >>> 5
    const bit = index & 31
    const bitsAvail = Math.min(BITS_PER_WORD, this.data.length - (w << 5))
    const mask = bit === 31 ? ~0 : ((1 << (bit + 1)) - 1)
    let word = this.data.bits[w]! & mask
    if (bitsAvail < BITS_PER_WORD && bit >= bitsAvail) {
      word = this.data.bits[w]! & ((1 << bitsAvail) - 1)
    }
    while (true) {
      if (word !== 0) {
        const pos = (w << 5) + highestBitSet(word)
        return pos < this.data.length ? pos : -1
      }
      w--
      if (w < 0) return -1
      word = this.data.bits[w]!
    }
  }

  next0(index: number): number {
    if (index < 0) index = 0
    if (index >= this.data.length) return -1
    const numWords = Math.ceil(this.data.length / BITS_PER_WORD)
    let w = index >>> 5
    const bit = index & 31
    let word = (~this.data.bits[w]!) & (~0 << bit)
    const bitsAvail = Math.min(BITS_PER_WORD, this.data.length - (w << 5))
    if (bitsAvail < BITS_PER_WORD) {
      word &= (1 << bitsAvail) - 1
    }
    while (true) {
      if (word !== 0) {
        const pos = (w << 5) + ctz32(word)
        return pos < this.data.length ? pos : -1
      }
      w++
      if (w >= numWords) return -1
      word = ~this.data.bits[w]!
      const ba = Math.min(BITS_PER_WORD, this.data.length - (w << 5))
      if (ba < BITS_PER_WORD) {
        word &= (1 << ba) - 1
      }
    }
  }

  prev0(index: number): number {
    if (this.data.length === 0) return -1
    if (index < 0) return -1
    if (index >= this.data.length) index = this.data.length - 1
    let w = index >>> 5
    const bit = index & 31
    const bitsAvail = Math.min(BITS_PER_WORD, this.data.length - (w << 5))
    const mask = bit === 31 ? ~0 : ((1 << (bit + 1)) - 1)
    let word = (~this.data.bits[w]!) & mask
    if (bitsAvail < BITS_PER_WORD && bit >= bitsAvail) {
      word = (~this.data.bits[w]!) & ((1 << bitsAvail) - 1)
    }
    while (true) {
      if (word !== 0) {
        const pos = (w << 5) + highestBitSet(word)
        return pos < this.data.length ? pos : -1
      }
      w--
      if (w < 0) return -1
      word = ~this.data.bits[w]!
    }
  }

  toString(): string {
    let result = ''
    for (let i = 0; i < this.data.length; i++) {
      result += this.access(i)
    }
    return result
  }

  toArray(): number[] {
    const result: number[] = new Array(this.data.length)
    for (let i = 0; i < this.data.length; i++) {
      result[i] = this.access(i)
    }
    return result
  }

  clone(): RankSelect {
    const arr = this.toArray()
    return new RankSelect(arr)
  }
}

export type { RankSelectData, RankSelectIndex } from './types.js'
