import type { BitVectorData, WaveletMatrixLevel } from './types.js'

class BitVector {
  private bits: Uint32Array
  private blocks: Uint32Array
  readonly length: number

  constructor(length: number) {
    this.length = length
    const blockCount = Math.ceil(length / 32)
    this.bits = new Uint32Array(blockCount)
    this.blocks = new Uint32Array(blockCount + 1)
  }

  set(index: number, value: number): void {
    const blockIndex = index >>> 5
    const bitOffset = index & 31
    if (value) {
      this.bits[blockIndex]! |= (1 << bitOffset)
    } else {
      this.bits[blockIndex]! &= ~(1 << bitOffset)
    }
  }

  get(index: number): number {
    const blockIndex = index >>> 5
    const bitOffset = index & 31
    return (this.bits[blockIndex]! >>> bitOffset) & 1
  }

  buildRank(): void {
    this.blocks[0] = 0
    for (let i = 0; i < this.bits.length; i++) {
      this.blocks[i + 1]! = this.blocks[i]! + popcount(this.bits[i]!)
    }
  }

  rank1(end: number): number {
    if (end <= 0) return 0
    if (end > this.length) end = this.length
    const blockIndex = end >>> 5
    const bitOffset = end & 31
    let result = this.blocks[blockIndex]!
    if (bitOffset > 0 && blockIndex < this.bits.length) {
      const mask = (1 << bitOffset) - 1
      result += popcount(this.bits[blockIndex]! & mask)
    }
    return result
  }

  rank0(end: number): number {
    return end - this.rank1(end)
  }

  select1(k: number): number {
    if (k < 0) return -1
    let count = 0
    for (let i = 0; i < this.bits.length; i++) {
      const c = popcount(this.bits[i]!)
      if (count + c > k) {
        const remaining = k - count
        const bits = this.bits[i]!
        let pos = 0
        let found = 0
        while (found <= remaining) {
          if ((bits >>> pos) & 1) {
            if (found === remaining) {
              return i * 32 + pos
            }
            found++
          }
          pos++
        }
      }
      count += c
    }
    return -1
  }

  select0(k: number): number {
    if (k < 0) return -1
    let count = 0
    for (let i = 0; i < this.bits.length; i++) {
      const bitsInThisBlock = Math.min(32, this.length - i * 32)
      const mask = bitsInThisBlock === 32 ? 0xFFFFFFFF : ((1 << bitsInThisBlock) - 1)
      const zerosInThisBlock = bitsInThisBlock - popcount(this.bits[i]! & mask)
      if (count + zerosInThisBlock > k) {
        const remaining = k - count
        const bits = this.bits[i]!
        let pos = 0
        let found = 0
        while (pos < bitsInThisBlock) {
          if (!((bits >>> pos) & 1)) {
            if (found === remaining) {
              return i * 32 + pos
            }
            found++
          }
          pos++
        }
      }
      count += zerosInThisBlock
    }
    return -1
  }

  toData(): BitVectorData {
    return {
      bits: new Uint32Array(this.bits),
      blocks: new Uint32Array(this.blocks),
      length: this.length,
    }
  }
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  x = (x + (x >>> 4)) & 0x0F0F0F0F
  x = x + (x >>> 8)
  x = x + (x >>> 16)
  return x & 0x7F
}

export class WaveletMatrix {
  private levels: WaveletMatrixLevel[]
  private readonly _size: number
  private readonly _maxVal: number
  private readonly _bitWidth: number

  constructor(values: number[], maxValue?: number) {
    this._size = values.length

    if (this._size === 0) {
      this._maxVal = 0
      this._bitWidth = 0
      this.levels = []
      return
    }

    if (maxValue !== undefined) {
      this._maxVal = maxValue
    } else {
      this._maxVal = 0
      for (let i = 0; i < values.length; i++) {
        if (values[i]! > this._maxVal) {
          this._maxVal = values[i]!
        }
      }
    }

    this._bitWidth = this._maxVal === 0 ? 1 : Math.floor(Math.log2(this._maxVal)) + 1
    if (this._bitWidth === 0) this._bitWidth = 1

    this.levels = []
    this.build(values)
  }

  private build(values: number[]): void {
    let current = values.slice()

    for (let level = 0; level < this._bitWidth; level++) {
      const bitPos = this._bitWidth - 1 - level
      const bv = new BitVector(current.length)
      const zeros: number[] = []
      const ones: number[] = []

      for (let i = 0; i < current.length; i++) {
        const val = current[i]!
        const bit = (val >>> bitPos) & 1
        bv.set(i, bit)
        if (bit === 0) {
          zeros.push(val)
        } else {
          ones.push(val)
        }
      }

      bv.buildRank()

      this.levels.push({
        bitVector: bv.toData(),
        zeroCount: zeros.length,
      })

      current = [...zeros, ...ones]
    }
  }

  private rank1AtLevel(level: number, end: number): number {
    const bv = this.levels[level]!.bitVector
    if (end <= 0) return 0
    if (end > bv.length) end = bv.length
    const blockIndex = end >>> 5
    const bitOffset = end & 31
    let result = bv.blocks[blockIndex]!
    if (bitOffset > 0 && blockIndex < bv.bits.length) {
      const mask = (1 << bitOffset) - 1
      result += popcount(bv.bits[blockIndex]! & mask)
    }
    return result
  }

  private rank0AtLevel(level: number, end: number): number {
    return end - this.rank1AtLevel(level, end)
  }

  access(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }

    let value = 0
    let pos = index

    for (let level = 0; level < this._bitWidth; level++) {
      const bit = this.getBit(level, pos)
      value = (value << 1) | bit
      if (bit === 0) {
        pos = this.rank0AtLevel(level, pos)
      } else {
        const zc = this.levels[level]!.zeroCount
        pos = zc + this.rank1AtLevel(level, pos)
      }
    }

    return value
  }

  private getBit(level: number, index: number): number {
    const bv = this.levels[level]!.bitVector
    const blockIndex = index >>> 5
    const bitOffset = index & 31
    return (bv.bits[blockIndex]! >>> bitOffset) & 1
  }

  rank(value: number, end: number): number {
    if (end <= 0 || this._size === 0) return 0
    if (end > this._size) end = this._size
    if (value < 0 || value > this._maxVal) return 0

    let s = 0
    let e = end

    for (let level = 0; level < this._bitWidth; level++) {
      const bit = (value >>> (this._bitWidth - 1 - level)) & 1
      if (bit === 0) {
        s = this.rank0AtLevel(level, s)
        e = this.rank0AtLevel(level, e)
      } else {
        const zc = this.levels[level]!.zeroCount
        s = zc + this.rank1AtLevel(level, s)
        e = zc + this.rank1AtLevel(level, e)
      }
    }

    return e - s
  }

  rankRange(value: number, start: number, end: number): number {
    if (start < 0) start = 0
    if (end > this._size) end = this._size
    if (start >= end) return 0
    return this.rank(value, end) - this.rank(value, start)
  }

  select(value: number, k: number): number {
    if (this._size === 0 || k < 0) return -1
    if (value < 0 || value > this._maxVal) return -1

    let s = 0
    let e = this._size

    for (let level = 0; level < this._bitWidth; level++) {
      const bit = (value >>> (this._bitWidth - 1 - level)) & 1
      if (bit === 0) {
        s = this.rank0AtLevel(level, s)
        e = this.rank0AtLevel(level, e)
      } else {
        const zc = this.levels[level]!.zeroCount
        s = zc + this.rank1AtLevel(level, s)
        e = zc + this.rank1AtLevel(level, e)
      }
    }

    if (k >= e - s) return -1

    let pos = s + k

    for (let level = this._bitWidth - 1; level >= 0; level--) {
      const zc = this.levels[level]!.zeroCount
      if (pos < zc) {
        pos = this.select0AtLevel(level, pos)
      } else {
        pos = this.select1AtLevel(level, pos - zc)
      }
    }

    return pos
  }

  private select0AtLevel(level: number, k: number): number {
    const bv = this.levels[level]!.bitVector
    let count = 0
    for (let i = 0; i < bv.bits.length; i++) {
      const bitsInThisBlock = Math.min(32, bv.length - i * 32)
      const mask = bitsInThisBlock === 32 ? 0xFFFFFFFF : ((1 << bitsInThisBlock) - 1)
      const blockBits = bv.bits[i]!
      const zerosInBlock = bitsInThisBlock - popcount(blockBits & mask)
      if (count + zerosInBlock > k) {
        const remaining = k - count
        let pos = 0
        let found = 0
        while (pos < bitsInThisBlock) {
          if (!((blockBits >>> pos) & 1)) {
            if (found === remaining) return i * 32 + pos
            found++
          }
          pos++
        }
      }
      count += zerosInBlock
    }
    return -1
  }

  private select1AtLevel(level: number, k: number): number {
    const bv = this.levels[level]!.bitVector
    let count = 0
    for (let i = 0; i < bv.bits.length; i++) {
      const blockBits = bv.bits[i]!
      const c = popcount(blockBits)
      if (count + c > k) {
        const remaining = k - count
        let pos = 0
        let found = 0
        while (found <= remaining && pos < 32) {
          if ((blockBits >>> pos) & 1) {
            if (found === remaining) return i * 32 + pos
            found++
          }
          pos++
        }
      }
      count += c
    }
    return -1
  }

  quantile(start: number, end: number, k: number): number {
    if (start < 0) start = 0
    if (end > this._size) end = this._size
    if (start >= end || k < 0 || k >= end - start) {
      throw new RangeError(`Invalid quantile query: [${start}, ${end}), k=${k}`)
    }

    let value = 0
    let s = start
    let e = end

    for (let level = 0; level < this._bitWidth; level++) {
      const zerosInRange = this.rank0AtLevel(level, e) - this.rank0AtLevel(level, s)
      if (k < zerosInRange) {
        value = (value << 1) | 0
        s = this.rank0AtLevel(level, s)
        e = this.rank0AtLevel(level, e)
      } else {
        value = (value << 1) | 1
        k -= zerosInRange
        const zc = this.levels[level]!.zeroCount
        s = zc + this.rank1AtLevel(level, s)
        e = zc + this.rank1AtLevel(level, e)
      }
    }

    return value
  }

  kthSmallest(start: number, end: number, k: number): number {
    return this.quantile(start, end, k)
  }

  kthLargest(start: number, end: number, k: number): number {
    return this.quantile(start, end, (end - start) - 1 - k)
  }

  rangeCount(start: number, end: number, minValue: number, maxValue: number): number {
    if (start < 0) start = 0
    if (end > this._size) end = this._size
    if (start >= end) return 0

    const clampedMin = Math.max(0, minValue)
    const clampedMax = Math.min(this._maxVal, maxValue)
    if (clampedMin > clampedMax) return 0

    const lessThanMin = this._countLessThan(start, end, clampedMin)
    const lessOrEqualMax = this._countLessThanOrEqual(start, end, clampedMax)

    return lessOrEqualMax - lessThanMin
  }

  private _countLessThan(start: number, end: number, value: number): number {
    let count = 0
    let s = start
    let e = end

    for (let level = 0; level < this._bitWidth && s < e; level++) {
      const bit = (value >>> (this._bitWidth - 1 - level)) & 1
      const zerosInS = this.rank0AtLevel(level, s)
      const zerosInE = this.rank0AtLevel(level, e)
      const onesInS = s - zerosInS
      const onesInE = e - zerosInE

      if (bit === 1) {
        count += zerosInE - zerosInS
        const zc = this.levels[level]!.zeroCount
        s = zc + onesInS
        e = zc + onesInE
      } else {
        s = zerosInS
        e = zerosInE
      }
    }

    return count
  }

  private _countLessThanOrEqual(start: number, end: number, value: number): number {
    let count = 0
    let s = start
    let e = end

    for (let level = 0; level < this._bitWidth && s < e; level++) {
      const bit = (value >>> (this._bitWidth - 1 - level)) & 1
      const zerosInS = this.rank0AtLevel(level, s)
      const zerosInE = this.rank0AtLevel(level, e)
      const onesInS = s - zerosInS
      const onesInE = e - zerosInE

      if (bit === 1) {
        count += zerosInE - zerosInS
        const zc = this.levels[level]!.zeroCount
        s = zc + onesInS
        e = zc + onesInE
      } else {
        s = zerosInS
        e = zerosInE
      }
    }

    count += e - s

    return count
  }

  rangeList(start: number, end: number, minValue: number, maxValue: number): number[] {
    if (start < 0) start = 0
    if (end > this._size) end = this._size
    if (start >= end) return []

    const clampedMin = Math.max(0, minValue)
    const clampedMax = Math.min(this._maxVal, maxValue)
    if (clampedMin > clampedMax) return []

    const result: number[] = []
    this._rangeListRecursive(start, end, clampedMin, clampedMax, 0, 0, result)
    return result
  }

  private _rangeListRecursive(
    start: number,
    end: number,
    minValue: number,
    maxValue: number,
    level: number,
    prefix: number,
    result: number[],
  ): void {
    if (start >= end || level >= this._bitWidth) {
      if (start < end && prefix >= minValue && prefix <= maxValue) {
        const count = end - start
        for (let i = 0; i < count; i++) {
          result.push(prefix)
        }
      }
      return
    }

    const currentMinPrefix = prefix << (this._bitWidth - level)
    const currentMaxPrefix = ((prefix + 1) << (this._bitWidth - level)) - 1

    if (currentMaxPrefix < minValue || currentMinPrefix > maxValue) {
      return
    }

    const zerosStart = this.rank0AtLevel(level, start)
    const zerosEnd = this.rank0AtLevel(level, end)
    const onesStart = start - zerosStart
    const onesEnd = end - zerosEnd
    const zc = this.levels[level]!.zeroCount

    this._rangeListRecursive(zerosStart, zerosEnd, minValue, maxValue, level + 1, prefix << 1, result)

    const newPrefix = (prefix << 1) | 1
    this._rangeListRecursive(zc + onesStart, zc + onesEnd, minValue, maxValue, level + 1, newPrefix, result)
  }

  size(): number {
    return this._size
  }

  maxValue(): number {
    return this._maxVal
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.access(i))
    }
    return result
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toJSON() {
    return { type: 'WaveletMatrix', items: this.toArray() }
  }
}
