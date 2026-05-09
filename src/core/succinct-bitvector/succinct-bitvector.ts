import type { BitvectorData, RankIndex } from './types.js'

const BLOCK_SIZE = 64
const SUPER_BLOCK_FACTOR = 4
const SELECT_SAMPLE_INTERVAL = 64

function popcount32(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  return ((x + (x >>> 4) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

function popcount64(lo: number, hi: number): number {
  return popcount32(lo) + popcount32(hi)
}

export class SuccinctBitvector {
  private data: BitvectorData
  private index: RankIndex
  private totalOnes: number
  private totalZeros: number

  constructor(bits: number[] | string | Uint8Array) {
    this.data = SuccinctBitvector.parseInput(bits)
    this.totalOnes = 0
    this.totalZeros = 0
    for (let i = 0; i < this.data.size; i++) {
      if (this.data.bits[i]! === 1) {
        this.totalOnes++
      } else {
        this.totalZeros++
      }
    }
    this.index = this.buildIndex()
  }

  private static parseInput(bits: number[] | string | Uint8Array): BitvectorData {
    let arr: number[]
    if (typeof bits === 'string') {
      arr = []
      for (let i = 0; i < bits.length; i++) {
        const ch = bits.charCodeAt(i)
        if (ch === 48) {
          arr.push(0)
        } else if (ch === 49) {
          arr.push(1)
        } else {
          throw new Error(`Invalid character in bit string at position ${i}: "${bits[i]}"`)
        }
      }
    } else if (bits instanceof Uint8Array) {
      arr = []
      for (let i = 0; i < bits.length; i++) {
        const v = bits[i]
        if (v !== 0 && v !== 1) {
          throw new Error(`Invalid bit value at index ${i}: ${v}`)
        }
        arr.push(v)
      }
    } else {
      arr = []
      for (let i = 0; i < bits.length; i++) {
        const v = bits[i]
        if (v !== undefined && v !== 0 && v !== 1) {
          throw new Error(`Invalid bit value at index ${i}: ${v}`)
        }
        arr.push(v ?? 0)
      }
    }
    const size = arr.length
    const packed = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      packed[i]! = arr[i]!
    }
    return { bits: packed, size }
  }

  private buildIndex(): RankIndex {
    const n = this.data.size
    const numBlocks = Math.ceil(n / BLOCK_SIZE)
    const numSuperBlocks = Math.ceil(numBlocks / SUPER_BLOCK_FACTOR)

    const blockRanks = new Uint32Array(numBlocks)
    const superBlockRanks = new Uint32Array(numSuperBlocks)

    let runningRank = 0
    let blockCount = 0
    let blockIdx = 0
    let superIdx = 0

    for (let i = 0; i < n; i++) {
      if (this.data.bits[i]! === 1) {
        blockCount++
      }
      if ((i + 1) % BLOCK_SIZE === 0 || i === n - 1) {
        blockRanks[blockIdx] = runningRank
        if (blockIdx % SUPER_BLOCK_FACTOR === 0) {
          superBlockRanks[superIdx] = runningRank
          superIdx++
        }
        runningRank += blockCount
        blockCount = 0
        blockIdx++
      }
    }

    const maxSelect1 = Math.ceil(this.totalOnes / SELECT_SAMPLE_INTERVAL) + 1
    const maxSelect0 = Math.ceil(this.totalZeros / SELECT_SAMPLE_INTERVAL) + 1
    const select1Samples = new Int32Array(maxSelect1).fill(-1)
    const select0Samples = new Int32Array(maxSelect0).fill(-1)

    let onesSeen = 0
    let zerosSeen = 0
    for (let i = 0; i < n; i++) {
      if (this.data.bits[i]! === 1) {
        onesSeen++
        if (onesSeen % SELECT_SAMPLE_INTERVAL === 0) {
          const sampleIdx = Math.floor(onesSeen / SELECT_SAMPLE_INTERVAL)
          if (sampleIdx < maxSelect1) {
            select1Samples[sampleIdx] = i
          }
        }
      } else {
        zerosSeen++
        if (zerosSeen % SELECT_SAMPLE_INTERVAL === 0) {
          const sampleIdx = Math.floor(zerosSeen / SELECT_SAMPLE_INTERVAL)
          if (sampleIdx < maxSelect0) {
            select0Samples[sampleIdx] = i
          }
        }
      }
    }

    return { blockRanks, superBlockRanks, select1Samples, select0Samples }
  }

  static fromString(s: string): SuccinctBitvector {
    return new SuccinctBitvector(s)
  }

  static fromNumber(n: number, length: number): SuccinctBitvector {
    if (length < 0) {
      throw new Error('Length must be non-negative')
    }
    if (!Number.isInteger(n)) {
      throw new Error('Number must be an integer')
    }
    const bits: number[] = []
    for (let i = 0; i < length; i++) {
      bits.push((n >>> i) & 1)
    }
    return new SuccinctBitvector(bits)
  }

  access(index: number): number {
    if (index < 0 || index >= this.data.size) {
      throw new RangeError(`Index ${index} out of range [0, ${this.data.size})`)
    }
    return this.data.bits[index]!
  }

  rank1(index: number): number {
    if (index <= 0) return 0
    if (index > this.data.size) index = this.data.size

    const blockIdx = Math.floor((index - 1) / BLOCK_SIZE)
    const superIdx = Math.floor(blockIdx / SUPER_BLOCK_FACTOR)

    let rank = this.index.superBlockRanks[superIdx]!

    const startBlock = superIdx * SUPER_BLOCK_FACTOR
    for (let b = startBlock; b < blockIdx; b++) {
      const blockStart = b * BLOCK_SIZE
      const blockEnd = Math.min(blockStart + BLOCK_SIZE, this.data.size)
      const loEnd = Math.min(blockEnd, blockStart + 32)
      let lo = 0
      let hi = 0
      for (let i = blockStart; i < loEnd; i++) {
        lo |= (this.data.bits[i]! << (i - blockStart))
      }
      for (let i = loEnd; i < blockEnd; i++) {
        hi |= (this.data.bits[i]! << (i - loEnd))
      }
      rank += popcount64(lo, hi)
    }

    const blockStart = blockIdx * BLOCK_SIZE
    const blockEnd = Math.min(blockStart + BLOCK_SIZE, this.data.size)
    const scanEnd = Math.min(index, blockEnd)
    for (let i = blockStart; i < scanEnd; i++) {
      if (this.data.bits[i]! === 1) {
        rank++
      }
    }

    return rank
  }

  rank0(index: number): number {
    return index - this.rank1(index)
  }

  select1(k: number): number {
    if (k < 1 || k > this.totalOnes) return -1

    const sampleIdx = Math.floor(k / SELECT_SAMPLE_INTERVAL)
    let start: number
    if (sampleIdx > 0 && this.index.select1Samples[sampleIdx] !== -1) {
      start = this.index.select1Samples[sampleIdx]!
    } else {
      const approxBlock = Math.floor((k - 1) / BLOCK_SIZE)
      const superIdx = Math.floor(approxBlock / SUPER_BLOCK_FACTOR)
      let lo = superIdx * SUPER_BLOCK_FACTOR
      let hi = Math.ceil(this.data.size / BLOCK_SIZE)
      while (lo < hi) {
        const mid = (lo + hi) >>> 1
        const midRank = mid * BLOCK_SIZE <= this.data.size
          ? this.index.blockRanks[mid]!
          : this.rank1(this.data.size)
        if (midRank < k) {
          lo = mid + 1
        } else {
          hi = mid
        }
      }
      start = Math.max(0, (lo - 1) * BLOCK_SIZE)
    }

    let count = this.rank1(start)
    for (let i = start; i < this.data.size; i++) {
      if (this.data.bits[i]! === 1) {
        count++
        if (count === k) return i
      }
    }
    return -1
  }

  select0(k: number): number {
    if (k < 1 || k > this.totalZeros) return -1

    const sampleIdx = Math.floor(k / SELECT_SAMPLE_INTERVAL)
    let start: number
    if (sampleIdx > 0 && this.index.select0Samples[sampleIdx]! !== -1) {
      start = this.index.select0Samples[sampleIdx]!
    } else {
      const superIdx = 0
      let lo = superIdx * SUPER_BLOCK_FACTOR
      let hi = Math.ceil(this.data.size / BLOCK_SIZE)
      while (lo < hi) {
        const mid = (lo + hi) >>> 1
        const midZeros = mid * BLOCK_SIZE <= this.data.size
          ? mid * BLOCK_SIZE - this.index.blockRanks[mid]!
          : this.data.size - this.totalOnes
        if (midZeros < k) {
          lo = mid + 1
        } else {
          hi = mid
        }
      }
      start = Math.max(0, (lo - 1) * BLOCK_SIZE)
    }

    let count = this.rank0(start)
    for (let i = start; i < this.data.size; i++) {
      if (this.data.bits[i]! === 0) {
        count++
        if (count === k) return i
      }
    }
    return -1
  }

  length(): number {
    return this.data.size
  }

  countOnes(): number {
    return this.totalOnes
  }

  countZeros(): number {
    return this.totalZeros
  }

  isEmpty(): boolean {
    return this.data.size === 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.data.size; i++) {
      result.push(this.data.bits[i]!)
    }
    return result
  }

  toString(): string {
    let result = ''
    for (let i = 0; i < this.data.size; i++) {
      result += this.data.bits[i]!
    }
    return result
  }

  equals(other: SuccinctBitvector): boolean {
    if (this.data.size !== other.data.size) return false
    for (let i = 0; i < this.data.size; i++) {
      if (this.data.bits[i]! !== other.data.bits[i]!) return false
    }
    return true
  }

  clone(): SuccinctBitvector {
    return new SuccinctBitvector(this.toArray())
  }

  slice(start: number, end: number): SuccinctBitvector {
    if (start < 0) start = 0
    if (end > this.data.size) end = this.data.size
    if (start >= end) return new SuccinctBitvector([])
    const bits: number[] = []
    for (let i = start; i < end; i++) {
      bits.push(this.data.bits[i]!)
    }
    return new SuccinctBitvector(bits)
  }
}
