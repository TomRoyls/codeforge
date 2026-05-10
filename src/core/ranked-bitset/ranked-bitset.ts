const BITS_PER_WORD = 32
const SUPERBLOCK_SIZE = 512
const BLOCKS_PER_SUPERBLOCK = SUPERBLOCK_SIZE / BITS_PER_WORD

function popcount32(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  x = (x + (x >>> 4)) & 0x0f0f0f0f
  x = x + (x >>> 8)
  x = x + (x >>> 16)
  return x & 0x7f
}

export class RankedBitset {
  private _data: Uint32Array
  private _size: number
  private _superblocks: Uint32Array
  private _blocks: Uint16Array
  private _isBuilt: boolean

  constructor(initialCapacity?: number) {
    const bits = initialCapacity ?? 0
    const wordCount = Math.ceil(bits / BITS_PER_WORD) || 1
    this._data = new Uint32Array(wordCount)
    this._size = 0
    this._superblocks = new Uint32Array(0)
    this._blocks = new Uint16Array(0)
    this._isBuilt = false
  }

  private _ensureCapacity(bitIndex: number): void {
    const neededWord = (bitIndex >> 5) + 1
    if (neededWord <= this._data.length) return
    let newSize = this._data.length
    while (newSize < neededWord) {
      newSize <<= 1
    }
    if (newSize < neededWord) {
      newSize = neededWord
    }
    const newData = new Uint32Array(newSize)
    newData.set(this._data)
    this._data = newData
  }

  set(index: number): void {
    if (index < 0) throw new RangeError(`Index ${index} is negative`)
    this._ensureCapacity(index)
    if (index >= this._size) {
      this._size = index + 1
    }
    this._data[index >> 5]! |= (1 << (index & 31))
    this._isBuilt = false
  }

  clear(index: number): void {
    if (index < 0) throw new RangeError(`Index ${index} is negative`)
    if (index >= this._data.length * BITS_PER_WORD) return
    this._data[index >> 5]! &= ~(1 << (index & 31))
    this._isBuilt = false
  }

  get(index: number): boolean {
    if (index < 0) throw new RangeError(`Index ${index} is negative`)
    if (index >= this._data.length * BITS_PER_WORD) return false
    return (this._data[index >> 5]! & (1 << (index & 31))) !== 0
  }

  rank(index: number): number {
    if (index <= 0) return 0
    if (index > this._size) {
      index = this._size
    }
    const superblockIdx = (index - 1) >> 9
    const blockIdx = (index - 1) >> 5
    const blockInSuper = blockIdx & (BLOCKS_PER_SUPERBLOCK - 1)
    let result = this._superblocks[superblockIdx]!
    if (blockInSuper > 0) {
      result += this._blocks[blockIdx]!
    }
    const wordStart = blockIdx << 5
    const bitOffset = index - wordStart
    if (bitOffset > 0) {
      const word = this._data[blockIdx]!
      const mask = bitOffset >= BITS_PER_WORD ? ~0 >>> 0 : ((1 << bitOffset) - 1) >>> 0
      result += popcount32(word & mask)
    }
    return result
  }

  rank1(index: number): number {
    return this.rank(index)
  }

  rank0(index: number): number {
    return index - this.rank(index)
  }

  build(): void {
    if (this._size === 0) {
      this._superblocks = new Uint32Array(1)
      this._blocks = new Uint16Array(1)
      this._isBuilt = true
      return
    }

    const numWords = Math.ceil(this._size / BITS_PER_WORD)
    const numSuperblocks = Math.ceil(this._size / SUPERBLOCK_SIZE)

    this._superblocks = new Uint32Array(numSuperblocks)
    this._blocks = new Uint16Array(numWords)

    let cumulative = 0
    for (let s = 0; s < numSuperblocks; s++) {
      this._superblocks[s] = cumulative
      const startWord = s * BLOCKS_PER_SUPERBLOCK
      const endWord = Math.min(startWord + BLOCKS_PER_SUPERBLOCK, numWords)
      for (let b = startWord; b < endWord; b++) {
        this._blocks[b] = cumulative - this._superblocks[s]!
        if (b < this._data.length) {
          cumulative += popcount32(this._data[b]!)
        }
      }
    }

    this._isBuilt = true
  }

  select1(k: number): number {
    if (k < 0) return -1
    const numSuperblocks = this._superblocks.length
    let s = 0
    while (s + 1 < numSuperblocks && this._superblocks[s + 1]! <= k) {
      s++
    }

    let remaining = k - this._superblocks[s]!
    const numWords = Math.ceil(this._size / BITS_PER_WORD) || 1
    const startWord = s * BLOCKS_PER_SUPERBLOCK
    const endWord = Math.min(startWord + BLOCKS_PER_SUPERBLOCK, numWords, this._data.length)

    for (let w = startWord; w < endWord; w++) {
      const word = this._data[w]!
      const pc = popcount32(word)
      if (remaining < pc) {
        for (let bit = 0; bit < BITS_PER_WORD; bit++) {
          if ((word & (1 << bit)) !== 0) {
            if (remaining === 0) {
              return (w << 5) + bit
            }
            remaining--
          }
        }
        return -1
      }
      remaining -= pc
    }
    return -1
  }

  select0(k: number): number {
    if (k < 0) return -1

    const numWords = Math.ceil(this._size / BITS_PER_WORD) || 1
    let remaining = k

    for (let w = 0; w < numWords && w < this._data.length; w++) {
      const word = this._data[w]!
      const bitsInWord = Math.min(BITS_PER_WORD, this._size - (w << 5))
      const onesInWord = bitsInWord >= BITS_PER_WORD ? popcount32(word) : popcount32(word & ((1 << bitsInWord) - 1))
      const zerosInWord = bitsInWord - onesInWord
      if (remaining < zerosInWord) {
        for (let bit = 0; bit < bitsInWord; bit++) {
          if ((word & (1 << bit)) === 0) {
            if (remaining === 0) {
              return (w << 5) + bit
            }
            remaining--
          }
        }
        return -1
      }
      remaining -= zerosInWord
    }
    return -1
  }

  countOnes(): number {
    let count = 0
    const numWords = Math.ceil(this._size / BITS_PER_WORD) || 0
    for (let i = 0; i < numWords && i < this._data.length; i++) {
      count += popcount32(this._data[i]!)
    }
    return count
  }

  countZeros(): number {
    return this._size - this.countOnes()
  }

  setRange(start: number, end: number): void {
    if (start < 0) throw new RangeError(`Start ${start} is negative`)
    if (end < start) throw new RangeError(`End ${end} is less than start ${start}`)
    if (end === start) return
    this._ensureCapacity(end - 1)
    if (end > this._size) {
      this._size = end
    }
    for (let i = start; i < end; i++) {
      this._data[i >> 5]! |= (1 << (i & 31))
    }
    this._isBuilt = false
  }

  clearRange(start: number, end: number): void {
    if (start < 0) throw new RangeError(`Start ${start} is negative`)
    if (end < start) throw new RangeError(`End ${end} is less than start ${start}`)
    if (end === start) return
    const maxBit = this._data.length * BITS_PER_WORD
    const actualEnd = Math.min(end, maxBit)
    for (let i = start; i < actualEnd; i++) {
      this._data[i >> 5]! &= ~(1 << (i & 31))
    }
    this._isBuilt = false
  }

  toggle(index: number): boolean {
    if (index < 0) throw new RangeError(`Index ${index} is negative`)
    this._ensureCapacity(index)
    if (index >= this._size) {
      this._size = index + 1
    }
    const wordIndex = index >> 5
    const mask = 1 << (index & 31)
    this._data[wordIndex]! ^= mask
    this._isBuilt = false
    return (this._data[wordIndex]! & mask) !== 0
  }

  toString(): string {
    if (this._size === 0) return ''
    let result = ''
    for (let i = 0; i < this._size; i++) {
      result += this.get(i) ? '1' : '0'
    }
    return result
  }

  get size(): number {
    return this._size
  }

  get isBuilt(): boolean {
    return this._isBuilt
  }
}

export type { RankedBitsetOptions } from './types.js'
