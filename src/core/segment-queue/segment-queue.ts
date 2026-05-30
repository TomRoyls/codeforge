import type { SegmentQueueOptions, SegmentQueueStatistics } from './types.js'
import { DEFAULT_SEGMENT_QUEUE_OPTIONS } from './types.js'

export class SegmentQueue<T = unknown> {
  private _segmentSize: number
  private _segments: T[][] = []
  private _segmentOffsets: number[] = []
  private _frontSegIdx: number = 0
  private _enqueued = 0
  private _dequeued = 0
  private _segmentsCreated = 0
  private _segmentsCompleted = 0

  constructor(options?: SegmentQueueOptions) {
    const resolved = { ...DEFAULT_SEGMENT_QUEUE_OPTIONS, ...options }
    this._segmentSize = Math.max(1, resolved.segmentSize)
  }

  private _maybeCompact(): void {
    if (this._frontSegIdx > 16 && this._frontSegIdx > (this._segments.length >> 1)) {
      this._segments = this._segments.slice(this._frontSegIdx)
      this._segmentOffsets = this._segmentOffsets.slice(this._frontSegIdx)
      this._frontSegIdx = 0
    }
  }

  enqueue(value: T): void {
    if (this._segments.length === 0 || this._segments[this._segments.length - 1]!.length >= this._segmentSize) {
      this._segments.push([])
      this._segmentOffsets.push(0)
      this._segmentsCreated++
    }
    this._segments[this._segments.length - 1]!.push(value)
    this._enqueued++
  }

  dequeue(): T | undefined {
    if (this._segments.length - this._frontSegIdx === 0) return undefined
    const fi = this._frontSegIdx
    const first = this._segments[fi]!
    const offset = this._segmentOffsets[fi] ?? 0
    const value = first[offset]!
    this._segmentOffsets[fi] = offset + 1
    this._dequeued++
    if (offset + 1 >= first.length) {
      this._frontSegIdx++
      this._segmentsCompleted++
      this._maybeCompact()
    }
    return value
  }

  dequeueSegment(): T[] {
    if (this._segments.length - this._frontSegIdx === 0) return []
    const fi = this._frontSegIdx
    const segment = this._segments[fi]!
    const offset = this._segmentOffsets[fi] ?? 0
    const remaining = segment.slice(offset)
    this._frontSegIdx++
    this._dequeued += remaining.length
    this._segmentsCompleted++
    this._maybeCompact()
    return remaining
  }

  peek(): T | undefined {
    if (this._segments.length - this._frontSegIdx === 0) return undefined
    const fi = this._frontSegIdx
    const first = this._segments[fi]!
    const offset = this._segmentOffsets[fi] ?? 0
    if (offset >= first.length) return undefined
    return first[offset]
  }

  peekSegment(): T[] {
    if (this._segments.length - this._frontSegIdx === 0) return []
    const fi = this._frontSegIdx
    const first = this._segments[fi]!
    const offset = this._segmentOffsets[fi] ?? 0
    return first.slice(offset)
  }

  currentSegmentSize(): number {
    if (this._segments.length === 0) return 0
    return this._segments[this._segments.length - 1]!.length
  }

  segmentCount(): number {
    return this._segments.length - this._frontSegIdx
  }

  get size(): number {
    return this._enqueued - this._dequeued
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this._segments = []
    this._segmentOffsets = []
    this._frontSegIdx = 0
    this._enqueued = 0
    this._dequeued = 0
    this._segmentsCreated = 0
    this._segmentsCompleted = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let s = this._frontSegIdx; s < this._segments.length; s++) {
      const segment = this._segments[s]!
      const offset = this._segmentOffsets[s] ?? 0
      for (let i = offset; i < segment.length; i++) {
        result.push(segment[i]!)
      }
    }
    return result
  }

  toSegments(): T[][] {
    const result: T[][] = []
    for (let s = this._frontSegIdx; s < this._segments.length; s++) {
      const segment = this._segments[s]!
      const offset = this._segmentOffsets[s] ?? 0
      result.push(segment.slice(offset))
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let s = this._frontSegIdx; s < this._segments.length; s++) {
      const segment = this._segments[s]!
      const offset = this._segmentOffsets[s] ?? 0
      for (let i = offset; i < segment.length; i++) {
        callback(segment[i]!, idx)
        idx++
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let s = this._frontSegIdx; s < this._segments.length; s++) {
      const segment = this._segments[s]!
      const offset = this._segmentOffsets[s] ?? 0
      for (let i = offset; i < segment.length; i++) {
        yield segment[i]!
      }
    }
  }

  flushSegment(): T[] {
    if (this._segments.length === 0) return []
    const segment = this._segments.pop()!
    if (this._segments.length < this._frontSegIdx) {
      this._frontSegIdx = this._segments.length
    }
    this._dequeued += segment.length
    this._segmentsCompleted++
    return [...segment]
  }

  getStatistics(): SegmentQueueStatistics {
    return {
      enqueued: this._enqueued,
      dequeued: this._dequeued,
      segmentsCreated: this._segmentsCreated,
      segmentsCompleted: this._segmentsCompleted,
    }
  }
}

export { DEFAULT_SEGMENT_QUEUE_OPTIONS } from './types.js'
export type { SegmentQueueOptions, SegmentQueueStatistics } from './types.js'
