import type { SortedSegmentOptions, SortedSegmentStatistics } from './types.js'
import { DEFAULT_SORTED_SEGMENT_OPTIONS } from './types.js'

export class SortedSegment {
  private segments: number[][] = []
  private totalCount = 0
  private capacity: number
  private cmp: (a: number, b: number) => number
  private stats: SortedSegmentStatistics = {
    inserts: 0,
    merges: 0,
    segments: 0,
    rebalances: 0,
  }

  constructor(options?: SortedSegmentOptions) {
    const opts: SortedSegmentOptions = {
      ...DEFAULT_SORTED_SEGMENT_OPTIONS,
      ...options,
    }
    this.capacity = opts.segmentCapacity ?? 64
    this.cmp = opts.comparator ?? ((a: number, b: number) => a - b)
  }

  private findSegmentIndex(val: number): number {
    let lo = 0
    let hi = this.segments.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      const seg = this.segments[mid]!
      if (seg.length === 0) {
        lo = mid + 1
        continue
      }
      if (this.cmp(val, seg[0]!) < 0) {
        hi = mid
      } else if (
        mid + 1 < this.segments.length &&
        this.segments[mid + 1]!.length > 0 &&
        this.cmp(val, this.segments[mid + 1]![0]!) >= 0
      ) {
        lo = mid + 1
      } else {
        return mid
      }
    }
    return Math.max(0, lo - 1)
  }

  private binarySearchInSegment(
    seg: number[],
    val: number,
  ): { found: boolean; index: number } {
    let lo = 0
    let hi = seg.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      const c = this.cmp(seg[mid]!, val)
      if (c === 0) {
        return { found: true, index: mid }
      }
      if (c < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return { found: false, index: lo }
  }

  private insertIntoSegment(segIdx: number, val: number): void {
    const seg = this.segments[segIdx]!
    const { index } = this.binarySearchInSegment(seg, val)
    seg.splice(index, 0, val)
    this.totalCount++
    this.stats.inserts++
    if (seg.length > this.capacity) {
      this.splitSegment(segIdx)
    }
  }

  private splitSegment(segIdx: number): void {
    const seg = this.segments[segIdx]!
    const mid = seg.length >>> 1
    const left = seg.slice(0, mid)
    const right = seg.slice(mid)
    this.segments[segIdx] = left
    this.segments.splice(segIdx + 1, 0, right)
    this.stats.segments++
  }

  private mergeWithNeighbor(segIdx: number): void {
    if (this.segments.length <= 1) return
    const seg = this.segments[segIdx]!
    const threshold = this.capacity >>> 1
    if (seg.length >= threshold) return
    if (segIdx > 0) {
      const neighbor = this.segments[segIdx - 1]!
      if (neighbor.length + seg.length <= this.capacity) {
        const merged = this.mergeTwoSorted(neighbor, seg)
        this.segments.splice(segIdx - 1, 2, merged)
        this.stats.merges++
        this.stats.rebalances++
        return
      }
    }
    if (segIdx < this.segments.length - 1) {
      const neighbor = this.segments[segIdx + 1]!
      if (neighbor.length + seg.length <= this.capacity) {
        const merged = this.mergeTwoSorted(seg, neighbor)
        this.segments.splice(segIdx, 2, merged)
        this.stats.merges++
        this.stats.rebalances++
      }
    }
  }

  private mergeTwoSorted(a: number[], b: number[]): number[] {
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < a.length && j < b.length) {
      if (this.cmp(a[i]!, b[j]!) <= 0) {
        result.push(a[i]!)
        i++
      } else {
        result.push(b[j]!)
        j++
      }
    }
    while (i < a.length) {
      result.push(a[i]!)
      i++
    }
    while (j < b.length) {
      result.push(b[j]!)
      j++
    }
    return result
  }

  insert(val: number): void {
    if (this.segments.length === 0) {
      this.segments.push([val])
      this.totalCount = 1
      this.stats.inserts = 1
      this.stats.segments = 1
      return
    }
    const idx = this.findSegmentIndex(val)
    this.insertIntoSegment(idx, val)
    if (
      this.segments.length > 1 &&
      idx < this.segments.length - 1 &&
      this.segments[idx]!.length === 1
    ) {
      const next = this.segments[idx + 1]!
      if (next.length > 0 && this.cmp(this.segments[idx]![0]!, next[0]!) > 0) {
        const wrong = this.segments.splice(idx, 1)[0]!
        let placed = false
        for (let k = idx; k < this.segments.length; k++) {
          const seg = this.segments[k]!
          if (seg.length > 0 && this.cmp(wrong[0]!, seg[0]!) <= 0) {
            this.segments.splice(k, 0, wrong)
            placed = true
            break
          }
        }
        if (!placed) {
          this.segments.push(wrong)
        }
      }
    }
  }

  delete(val: number): boolean {
    if (this.segments.length === 0) return false
    const idx = this.findSegmentIndex(val)
    const seg = this.segments[idx]!
    const { found, index } = this.binarySearchInSegment(seg, val)
    if (!found) {
      for (let i = 0; i < this.segments.length; i++) {
        if (i === idx) continue
        const s = this.segments[i]!
        if (s.length === 0) continue
        const r = this.binarySearchInSegment(s, val)
        if (r.found) {
          s.splice(r.index, 1)
          this.totalCount--
          if (s.length === 0 && this.segments.length > 1) {
            this.segments.splice(i, 1)
          } else {
            this.mergeWithNeighbor(i)
          }
          return true
        }
      }
      return false
    }
    seg.splice(index, 1)
    this.totalCount--
    if (seg.length === 0 && this.segments.length > 1) {
      this.segments.splice(idx, 1)
    } else {
      this.mergeWithNeighbor(idx)
    }
    return true
  }

  has(val: number): boolean {
    if (this.segments.length === 0) return false
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      if (seg.length === 0) continue
      if (this.cmp(val, seg[0]!) < 0) break
      const { found } = this.binarySearchInSegment(seg, val)
      if (found) return true
    }
    return false
  }

  findMin(): number | undefined {
    let min: number | undefined
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      if (seg.length === 0) continue
      for (let j = 0; j < seg.length; j++) {
        if (min === undefined || this.cmp(seg[j]!, min) < 0) {
          min = seg[j]!
        }
      }
    }
    return min
  }

  findMax(): number | undefined {
    let max: number | undefined
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      if (seg.length === 0) continue
      for (let j = 0; j < seg.length; j++) {
        if (max === undefined || this.cmp(seg[j]!, max) > 0) {
          max = seg[j]!
        }
      }
    }
    return max
  }

  rangeQuery(min: number, max: number): number[] {
    const result: number[] = []
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      if (seg.length === 0) continue
      if (this.cmp(seg[0]!, max) > 0) break
      if (this.cmp(seg[seg.length - 1]!, min) < 0) continue
      for (let j = 0; j < seg.length; j++) {
        const v = seg[j]!
        if (this.cmp(v, min) >= 0 && this.cmp(v, max) <= 0) {
          result.push(v)
        }
      }
    }
    return result
  }

  get size(): number {
    return this.totalCount
  }

  get segmentCount(): number {
    return this.segments.length
  }

  get isEmpty(): boolean {
    return this.totalCount === 0
  }

  clear(): void {
    this.segments = []
    this.totalCount = 0
    this.stats = { inserts: 0, merges: 0, segments: 0, rebalances: 0 }
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      for (let j = 0; j < seg.length; j++) {
        result.push(seg[j]!)
      }
    }
    return result
  }

  forEach(callback: (value: number, index: number) => void): void {
    let idx = 0
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      for (let j = 0; j < seg.length; j++) {
        callback(seg[j]!, idx)
        idx++
      }
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      for (let j = 0; j < seg.length; j++) {
        yield seg[j]!
      }
    }
  }

  mergeAll(): number[] {
    if (this.segments.length === 0) return []
    let result = this.segments[0]!
    for (let i = 1; i < this.segments.length; i++) {
      result = this.mergeTwoSorted(result, this.segments[i]!)
      this.stats.merges++
    }
    this.segments = [result]
    return [...result]
  }

  getStatistics(): SortedSegmentStatistics {
    return {
      inserts: this.stats.inserts,
      merges: this.stats.merges,
      segments: this.segments.length,
      rebalances: this.stats.rebalances,
    }
  }
}
