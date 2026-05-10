import type { SegmentMapEntry, SegmentMapOptions, SegmentMapStats } from './types.js'

export class SegmentMap<V> {
  private segments: SegmentMapEntry<V>[] = []

  constructor(_options?: SegmentMapOptions) {}

  set(start: number, end: number, value: V): void {
    if (start > end) {
      throw new Error(`Invalid segment: start (${start}) > end (${end})`)
    }
    this.segments.push({ start, end, value })
  }

  get(point: number): V[] {
    const results: V[] = []
    for (const seg of this.segments) {
      if (point >= seg.start && point < seg.end) {
        results.push(seg.value)
      }
    }
    return results
  }

  getRange(start: number, end: number): SegmentMapEntry<V>[] {
    if (start > end) {
      throw new Error(`Invalid range: start (${start}) > end (${end})`)
    }
    const results: SegmentMapEntry<V>[] = []
    for (const seg of this.segments) {
      if (start < seg.end && end > seg.start) {
        results.push({ start: seg.start, end: seg.end, value: seg.value })
      }
    }
    return results
  }

  delete(start: number, end: number): boolean {
    for (let i = this.segments.length - 1; i >= 0; i--) {
      const seg = this.segments[i]!
      if (seg.start === start && seg.end === end) {
        this.segments.splice(i, 1)
        return true
      }
    }
    return false
  }

  has(point: number): boolean {
    for (const seg of this.segments) {
      if (point >= seg.start && point < seg.end) {
        return true
      }
    }
    return false
  }

  hasRange(start: number, end: number): boolean {
    if (start > end) return false
    if (start === end) return this.has(start)
    const covering = this.getCoveringSorted(start, end)
    if (covering.length === 0) return false
    if (covering[0]!.start > start) return false
    let current = covering[0]!.end
    for (let i = 1; i < covering.length; i++) {
      const seg = covering[i]!
      if (seg.start > current) return false
      if (seg.end > current) {
        current = seg.end
      }
    }
    return current >= end
  }

  private getCoveringSorted(start: number, end: number): SegmentMapEntry<V>[] {
    const relevant: SegmentMapEntry<V>[] = []
    for (const seg of this.segments) {
      if (seg.end > start && seg.start < end) {
        relevant.push({ start: seg.start, end: seg.end, value: seg.value })
      }
    }
    relevant.sort((a, b) => a.start - b.start || a.end - b.end)
    return relevant
  }

  get size(): number {
    return this.segments.length
  }

  forEach(callback: (entry: SegmentMapEntry<V>, index: number) => void): void {
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i]!
      callback({ start: seg.start, end: seg.end, value: seg.value }, i)
    }
  }

  toArray(): SegmentMapEntry<V>[] {
    return this.segments.map((seg) => ({ start: seg.start, end: seg.end, value: seg.value }))
  }

  isEmpty(): boolean {
    return this.segments.length === 0
  }

  clear(): void {
    this.segments = []
  }

  clone(): SegmentMap<V> {
    const result = new SegmentMap<V>()
    for (const seg of this.segments) {
      result.segments.push({ start: seg.start, end: seg.end, value: seg.value })
    }
    return result
  }

  static from<V>(entries: Iterable<SegmentMapEntry<V>>): SegmentMap<V> {
    const map = new SegmentMap<V>()
    for (const entry of entries) {
      map.set(entry.start, entry.end, entry.value)
    }
    return map
  }

  covering(point: number): SegmentMapEntry<V>[] {
    const results: SegmentMapEntry<V>[] = []
    for (const seg of this.segments) {
      if (point >= seg.start && point < seg.end) {
        results.push({ start: seg.start, end: seg.end, value: seg.value })
      }
    }
    return results
  }

  overlaps(start: number, end: number): boolean {
    if (start > end) {
      throw new Error(`Invalid range: start (${start}) > end (${end})`)
    }
    for (const seg of this.segments) {
      if (start < seg.end && end > seg.start) {
        return true
      }
    }
    return false
  }

  stats(): SegmentMapStats {
    const count = this.segments.length
    if (count === 0) {
      return {
        segmentCount: 0,
        totalCovered: 0,
        minStart: undefined,
        maxEnd: undefined,
        averageSpan: 0,
        overlapCount: 0,
      }
    }
    let minStart = this.segments[0]!.start
    let maxEnd = this.segments[0]!.end
    let totalSpan = 0
    for (const seg of this.segments) {
      if (seg.start < minStart) minStart = seg.start
      if (seg.end > maxEnd) maxEnd = seg.end
      totalSpan += seg.end - seg.start
    }
    const sorted = [...this.segments].sort((a, b) => a.start - b.start || a.end - b.end)
    let overlapCount = 0
    let sweepEnd = sorted[0]!.end
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.start < sweepEnd) {
        overlapCount++
      }
      if (sorted[i]!.end > sweepEnd) {
        sweepEnd = sorted[i]!.end
      }
    }
    const endpoints = new Set<number>()
    for (const seg of this.segments) {
      endpoints.add(seg.start)
      endpoints.add(seg.end)
    }
    const sortedEndpoints = [...endpoints].sort((a, b) => a - b)
    let totalCovered = 0
    for (let i = 0; i < sortedEndpoints.length - 1; i++) {
      const lo = sortedEndpoints[i]!
      const hi = sortedEndpoints[i + 1]!
      for (const seg of this.segments) {
        if (seg.start <= lo && seg.end >= hi) {
          totalCovered += hi - lo
          break
        }
      }
    }
    return {
      segmentCount: count,
      totalCovered,
      minStart,
      maxEnd,
      averageSpan: totalSpan / count,
      overlapCount,
    }
  }

  [Symbol.iterator](): Iterator<SegmentMapEntry<V>> {
    let index = 0
    const segments = this.segments
    return {
      next(): IteratorResult<SegmentMapEntry<V>> {
        if (index >= segments.length) {
          return { done: true, value: undefined }
        }
        const seg = segments[index]!
        index++
        return { done: false, value: { start: seg.start, end: seg.end, value: seg.value } }
      },
    }
  }
}

export type { SegmentMapEntry, SegmentMapOptions, SegmentMapStats } from './types.js'
