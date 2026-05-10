import type { Run, SparseBitmapOptions, SparseBitmapStats, SparseBitmapData } from './types.js'

export class SparseBitmap {
  private runs: Run[]

  constructor(_options?: SparseBitmapOptions) {
    this.runs = []
  }

  set(bit: number): void {
    if (bit < 0) {
      throw new RangeError(`Bit index must be non-negative, got ${bit}`)
    }
    const idx = this.findRunIndex(bit)
    if (idx < this.runs.length && this.bitInRange(bit, this.runs[idx]!)) {
      return
    }
    const prevIdx = idx - 1
    const adjacentPrev = prevIdx >= 0 && this.runs[prevIdx]!.start + this.runs[prevIdx]!.length === bit
    const adjacentNext = idx < this.runs.length && this.runs[idx]!.start === bit + 1
    if (adjacentPrev && adjacentNext) {
      this.runs[prevIdx] = {
        start: this.runs[prevIdx]!.start,
        length: this.runs[prevIdx]!.length + 1 + this.runs[idx]!.length,
      }
      this.runs.splice(idx, 1)
    } else if (adjacentPrev) {
      this.runs[prevIdx] = {
        start: this.runs[prevIdx]!.start,
        length: this.runs[prevIdx]!.length + 1,
      }
    } else if (adjacentNext) {
      this.runs[idx] = {
        start: bit,
        length: this.runs[idx]!.length + 1,
      }
    } else {
      this.runs.splice(idx, 0, { start: bit, length: 1 })
    }
  }

  clear(bit?: number): void {
    if (bit === undefined) {
      this.runs = []
      return
    }
    if (bit < 0) {
      throw new RangeError(`Bit index must be non-negative, got ${bit}`)
    }
    const idx = this.findRunIndex(bit)
    if (idx >= this.runs.length || !this.bitInRange(bit, this.runs[idx]!)) {
      return
    }
    const run = this.runs[idx]!
    const runEnd = run.start + run.length
    if (run.length === 1) {
      this.runs.splice(idx, 1)
    } else if (bit === run.start) {
      this.runs[idx] = { start: run.start + 1, length: run.length - 1 }
    } else if (bit === runEnd - 1) {
      this.runs[idx] = { start: run.start, length: run.length - 1 }
    } else {
      const leftLength = bit - run.start
      const rightLength = runEnd - bit - 1
      this.runs.splice(idx, 1, { start: run.start, length: leftLength }, { start: bit + 1, length: rightLength })
    }
  }

  get(bit: number): number {
    if (bit < 0) {
      throw new RangeError(`Bit index must be non-negative, got ${bit}`)
    }
    const idx = this.findRunIndex(bit)
    if (idx < this.runs.length && this.bitInRange(bit, this.runs[idx]!)) {
      return 1
    }
    return 0
  }

  flip(bit: number): void {
    if (bit < 0) {
      throw new RangeError(`Bit index must be non-negative, got ${bit}`)
    }
    if (this.get(bit) === 1) {
      this.clear(bit)
    } else {
      this.set(bit)
    }
  }

  setRange(start: number, end: number): void {
    this.validateRange(start, end)
    for (let bit = start; bit < end; bit++) {
      this.set(bit)
    }
  }

  clearRange(start: number, end: number): void {
    this.validateRange(start, end)
    for (let bit = start; bit < end; bit++) {
      this.clear(bit)
    }
  }

  getRange(start: number, end: number): SparseBitmap {
    this.validateRange(start, end)
    const result = new SparseBitmap()
    for (let bit = start; bit < end; bit++) {
      if (this.get(bit) === 1) {
        result.set(bit)
      }
    }
    return result
  }

  countSetBits(): number {
    let count = 0
    for (let i = 0; i < this.runs.length; i++) {
      count += this.runs[i]!.length
    }
    return count
  }

  findFirstSet(): number {
    if (this.runs.length === 0) {
      return -1
    }
    return this.runs[0]!.start
  }

  findFirstClear(): number {
    if (this.runs.length === 0) {
      return 0
    }
    if (this.runs[0]!.start > 0) {
      return 0
    }
    return this.runs[0]!.start + this.runs[0]!.length
  }

  get isEmpty(): boolean {
    return this.runs.length === 0
  }

  union(other: SparseBitmap): SparseBitmap {
    const result = this.clone()
    for (let i = 0; i < other.runs.length; i++) {
      const run = other.runs[i]!
      for (let bit = run.start; bit < run.start + run.length; bit++) {
        result.set(bit)
      }
    }
    return result
  }

  intersection(other: SparseBitmap): SparseBitmap {
    const result = new SparseBitmap()
    let i = 0
    let j = 0
    while (i < this.runs.length && j < other.runs.length) {
      const a = this.runs[i]!
      const b = other.runs[j]!
      const aEnd = a.start + a.length
      const bEnd = b.start + b.length
      const overlapStart = Math.max(a.start, b.start)
      const overlapEnd = Math.min(aEnd, bEnd)
      if (overlapStart < overlapEnd) {
        for (let bit = overlapStart; bit < overlapEnd; bit++) {
          result.set(bit)
        }
      }
      if (aEnd <= bEnd) {
        i++
      } else {
        j++
      }
    }
    return result
  }

  difference(other: SparseBitmap): SparseBitmap {
    const result = this.clone()
    for (let i = 0; i < other.runs.length; i++) {
      const run = other.runs[i]!
      for (let bit = run.start; bit < run.start + run.length; bit++) {
        result.clear(bit)
      }
    }
    return result
  }

  symmetricDifference(other: SparseBitmap): SparseBitmap {
    const result = this.clone()
    for (let i = 0; i < other.runs.length; i++) {
      const run = other.runs[i]!
      for (let bit = run.start; bit < run.start + run.length; bit++) {
        result.flip(bit)
      }
    }
    return result
  }

  clone(): SparseBitmap {
    const result = new SparseBitmap()
    result.runs = this.runs.map(r => ({ start: r.start, length: r.length }))
    return result
  }

  static from(bits: Iterable<number>): SparseBitmap {
    const bitmap = new SparseBitmap()
    for (const bit of bits) {
      bitmap.set(bit)
    }
    return bitmap
  }

  toSet(): Set<number> {
    const result = new Set<number>()
    for (let i = 0; i < this.runs.length; i++) {
      const run = this.runs[i]!
      for (let bit = run.start; bit < run.start + run.length; bit++) {
        result.add(bit)
      }
    }
    return result
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.runs.length; i++) {
      const run = this.runs[i]!
      for (let bit = run.start; bit < run.start + run.length; bit++) {
        result.push(bit)
      }
    }
    return result
  }

  forEach(callback: (bit: number) => void): void {
    for (let i = 0; i < this.runs.length; i++) {
      const run = this.runs[i]!
      for (let bit = run.start; bit < run.start + run.length; bit++) {
        callback(bit)
      }
    }
  }

  stats(): SparseBitmapStats {
    const setBitCount = this.countSetBits()
    let minBit: number | null = null
    let maxBit: number | null = null
    if (this.runs.length > 0) {
      minBit = this.runs[0]!.start
      const lastRun = this.runs[this.runs.length - 1]!
      maxBit = lastRun.start + lastRun.length - 1
    }
    const memoryUsageBytes = this.runs.length * 2 * 8
    const rawBitmapBits = maxBit !== null ? maxBit + 1 : 0
    const rawBitmapBytes = Math.ceil(rawBitmapBits / 8)
    const compressionRatio = rawBitmapBytes > 0 ? memoryUsageBytes / rawBitmapBytes : 0
    return {
      runCount: this.runs.length,
      setBitCount,
      memoryUsageBytes,
      compressionRatio,
      isEmpty: this.runs.length === 0,
      minBit,
      maxBit,
    }
  }

  toData(): SparseBitmapData {
    return { runs: this.runs.map(r => ({ start: r.start, length: r.length })) }
  }

  private findRunIndex(bit: number): number {
    let lo = 0
    let hi = this.runs.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      const run = this.runs[mid]!
      if (bit < run.start) {
        hi = mid
      } else if (bit >= run.start + run.length) {
        lo = mid + 1
      } else {
        return mid
      }
    }
    return lo
  }

  private bitInRange(bit: number, run: Run): boolean {
    return bit >= run.start && bit < run.start + run.length
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

export type { Run, SparseBitmapOptions, SparseBitmapStats, SparseBitmapData } from './types.js'
