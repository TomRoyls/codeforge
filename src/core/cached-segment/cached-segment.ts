import { DEFAULT_CACHED_SEGMENT_OPTIONS } from './types.js'
import type { CachedSegmentOptions, CachedSegmentStatistics } from './types.js'

export class CachedSegment<T = unknown> {
  private segments: Map<number, T[]> = new Map()
  private cache: Map<number, T[]> = new Map()
  private _size: number = 0
  private segmentSize: number
  private cacheCapacity: number
  private stats: CachedSegmentStatistics = {
    reads: 0,
    writes: 0,
    cacheHits: 0,
    cacheMisses: 0,
    evictions: 0,
    flushes: 0,
    segmentsLoaded: 0,
  }

  constructor(options?: CachedSegmentOptions) {
    this.segmentSize = options?.segmentSize ?? DEFAULT_CACHED_SEGMENT_OPTIONS.segmentSize
    this.cacheCapacity = options?.cacheCapacity ?? DEFAULT_CACHED_SEGMENT_OPTIONS.cacheCapacity
    if (this.segmentSize < 1) {
      throw new RangeError('segmentSize must be at least 1')
    }
    if (this.cacheCapacity < 1) {
      throw new RangeError('cacheCapacity must be at least 1')
    }
  }

  private segmentIndex(logicalIndex: number): number {
    return Math.floor(logicalIndex / this.segmentSize)
  }

  private indexInSegment(logicalIndex: number): number {
    return logicalIndex % this.segmentSize
  }

  private loadSegment(segIdx: number): T[] {
    const cached = this.cache.get(segIdx)
    if (cached !== undefined) {
      this.cache.delete(segIdx)
      this.cache.set(segIdx, cached)
      this.stats.cacheHits++
      this.stats.reads++
      return cached
    }

    this.stats.cacheMisses++
    this.stats.reads++
    this.stats.segmentsLoaded++

    const segment = this.segments.get(segIdx)
    if (segment === undefined) {
      throw new RangeError(`Segment ${segIdx} does not exist`)
    }

    if (this.cache.size >= this.cacheCapacity) {
      const lruKey = this.cache.keys().next().value
      if (lruKey !== undefined) {
        this.cache.delete(lruKey)
        this.stats.evictions++
      }
    }

    this.cache.set(segIdx, segment)
    return segment
  }

  private ensureSegment(segIdx: number): T[] {
    let segment = this.segments.get(segIdx)
    if (segment === undefined) {
      segment = []
      this.segments.set(segIdx, segment)
    }
    return segment
  }

  private touchSegment(segIdx: number): void {
    const cached = this.cache.get(segIdx)
    if (cached !== undefined) {
      this.cache.delete(segIdx)
      this.cache.set(segIdx, cached)
    } else {
      const segment = this.segments.get(segIdx)
      if (segment !== undefined) {
        if (this.cache.size >= this.cacheCapacity) {
          const lruKey = this.cache.keys().next().value
          if (lruKey !== undefined) {
            this.cache.delete(lruKey)
            this.stats.evictions++
          }
        }
        this.cache.set(segIdx, segment)
        this.stats.segmentsLoaded++
      }
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const segIdx = this.segmentIndex(index)
    const segment = this.loadSegment(segIdx)
    return segment[this.indexInSegment(index)]!
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const segIdx = this.segmentIndex(index)
    this.touchSegment(segIdx)
    this.stats.writes++
    const segment = this.segments.get(segIdx)!
    segment[this.indexInSegment(index)] = value
  }

  push(value: T): number {
    const segIdx = this.segmentIndex(this._size)
    const segment = this.ensureSegment(segIdx)
    segment.push(value)
    this._size++
    this.touchSegment(segIdx)
    this.stats.writes++
    return this._size
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this._size--
    const segIdx = this.segmentIndex(this._size)
    const segment = this.loadSegment(segIdx)
    const value = segment.pop()!
    if (segment.length === 0) {
      this.segments.delete(segIdx)
      this.cache.delete(segIdx)
    }
    return value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.segments.clear()
    this.cache.clear()
    this._size = 0
    this.stats = {
      reads: 0,
      writes: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictions: 0,
      flushes: 0,
      segmentsLoaded: 0,
    }
  }

  flush(): void {
    this.cache.clear()
    this.stats.flushes++
  }

  cacheSize(): number {
    return this.cache.size
  }

  cacheHitRate(): number {
    const total = this.stats.cacheHits + this.stats.cacheMisses
    if (total === 0) return 0
    return this.stats.cacheHits / total
  }

  cacheMisses(): number {
    return this.stats.cacheMisses
  }

  cacheHits(): number {
    return this.stats.cacheHits
  }

  segmentCount(): number {
    return this.segments.size
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const segIdx = this.segmentIndex(i)
      const segment = this.segments.get(segIdx)
      if (segment !== undefined) {
        result.push(segment[this.indexInSegment(i)]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const segIdx = this.segmentIndex(i)
      const segment = this.segments.get(segIdx)
      if (segment !== undefined) {
        callback(segment[this.indexInSegment(i)]!, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const segIdx = this.segmentIndex(i)
      const segment = this.segments.get(segIdx)
      if (segment !== undefined) {
        yield segment[this.indexInSegment(i)]!
      }
    }
  }

  getStatistics(): CachedSegmentStatistics {
    return { ...this.stats }
  }
}

export type { CachedSegmentOptions, CachedSegmentStatistics } from './types.js'
export { DEFAULT_CACHED_SEGMENT_OPTIONS } from './types.js'
