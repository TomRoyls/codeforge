import type { SegmentQueueOptions, SegmentQueueStatistics } from './types.js'
import { DEFAULT_SEGMENT_QUEUE_OPTIONS } from './types.js'

export class SegmentQueue<T = unknown> {
  private _segmentSize: number
  private _segments: T[][] = []
  private _enqueued = 0
  private _dequeued = 0
  private _segmentsCreated = 0
  private _segmentsCompleted = 0

  constructor(options?: SegmentQueueOptions) {
    const resolved = { ...DEFAULT_SEGMENT_QUEUE_OPTIONS, ...options }
    this._segmentSize = Math.max(1, resolved.segmentSize)
  }

  enqueue(value: T): void {
    if (this._segments.length === 0 || this._segments[this._segments.length - 1]!.length >= this._segmentSize) {
      this._segments.push([])
      this._segmentsCreated++
    }
    this._segments[this._segments.length - 1]!.push(value)
    this._enqueued++
  }

  dequeue(): T | undefined {
    if (this._segments.length === 0) return undefined
    const first = this._segments[0]!
    const value = first.shift()!
    this._dequeued++
    if (first.length === 0) {
      this._segments.shift()!
      this._segmentsCompleted++
    }
    return value
  }

  dequeueSegment(): T[] {
    if (this._segments.length === 0) return []
    const segment = this._segments.shift()!
    this._dequeued += segment.length
    this._segmentsCompleted++
    return segment
  }

  peek(): T | undefined {
    if (this._segments.length === 0) return undefined
    const first = this._segments[0]!
    if (first.length === 0) return undefined
    return first[0]
  }

  peekSegment(): T[] {
    if (this._segments.length === 0) return []
    return [...this._segments[0]!]
  }

  currentSegmentSize(): number {
    if (this._segments.length === 0) return 0
    return this._segments[this._segments.length - 1]!.length
  }

  segmentCount(): number {
    return this._segments.length
  }

  get size(): number {
    return this._enqueued - this._dequeued
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this._segments = []
    this._enqueued = 0
    this._dequeued = 0
    this._segmentsCreated = 0
    this._segmentsCompleted = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (const segment of this._segments) {
      for (const item of segment) {
        result.push(item)
      }
    }
    return result
  }

  toSegments(): T[][] {
    return this._segments.map(s => [...s])
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (const segment of this._segments) {
      for (const item of segment) {
        callback(item, idx)
        idx++
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const segment of this._segments) {
      for (const item of segment) {
        yield item
      }
    }
  }

  flushSegment(): T[] {
    if (this._segments.length === 0) return []
    const segment = this._segments.pop()!
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
