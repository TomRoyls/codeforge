import type { ChunkedQueueOptions, ChunkedQueueStatistics } from './types.js'
import { DEFAULT_CHUNKED_QUEUE_OPTIONS } from './types.js'

export class ChunkedQueue<T = unknown> {
  private chunks: T[][] = []
  private headChunkIndex: number = 0
  private headIndex: number = 0
  private tailChunkIndex: number = -1
  private tailIndex: number = -1
  private _size: number = 0
  private readonly chunkSize: number
  private stats: ChunkedQueueStatistics = {
    enqueues: 0,
    dequeues: 0,
    chunksCreated: 0,
    chunksReleased: 0,
    compactions: 0,
  }

  constructor(options?: Partial<ChunkedQueueOptions>) {
    const resolved = { ...DEFAULT_CHUNKED_QUEUE_OPTIONS, ...options }
    this.chunkSize = Math.max(1, Math.floor(resolved.chunkSize!))
  }

  enqueue(value: T): void {
    if (this.chunks.length === 0) {
      const chunk: T[] = new Array(this.chunkSize)
      chunk[0] = value
      this.chunks.push(chunk)
      this.tailChunkIndex = 0
      this.tailIndex = 0
      this.headChunkIndex = 0
      this.headIndex = 0
      this.stats.chunksCreated++
    } else {
      const nextIndex = this.tailIndex + 1
      if (nextIndex < this.chunkSize) {
        this.chunks[this.tailChunkIndex]![nextIndex] = value
        this.tailIndex = nextIndex
      } else {
        const chunk: T[] = new Array(this.chunkSize)
        chunk[0] = value
        this.chunks.push(chunk)
        this.tailChunkIndex++
        this.tailIndex = 0
        this.stats.chunksCreated++
      }
    }
    this._size++
    this.stats.enqueues++
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined
    const chunk = this.chunks[this.headChunkIndex]!
    const value = chunk[this.headIndex]!
    chunk[this.headIndex] = undefined as T
    this._size--
    this.stats.dequeues++
    if (this._size === 0) {
      this.headChunkIndex = 0
      this.headIndex = 0
      this.tailChunkIndex = -1
      this.tailIndex = -1
      this.chunks.length = 0
      this.stats.chunksReleased++
    } else {
      const nextHeadIndex = this.headIndex + 1
      if (nextHeadIndex < this.chunkSize) {
        this.headIndex = nextHeadIndex
      } else {
        this.chunks.splice(this.headChunkIndex, 1)
        this.stats.chunksReleased++
        this.tailChunkIndex--
        this.headIndex = 0
      }
    }
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.chunks[this.headChunkIndex]![this.headIndex]
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.chunks.length = 0
    this.headChunkIndex = 0
    this.headIndex = 0
    this.tailChunkIndex = -1
    this.tailIndex = -1
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    let idx = 0
    for (let ci = this.headChunkIndex; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      const start = ci === this.headChunkIndex ? this.headIndex : 0
      const end = ci === this.chunks.length - 1 ? this.tailIndex : this.chunkSize - 1
      for (let ei = start; ei <= end; ei++) {
        result[idx++] = chunk[ei]!
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let ci = this.headChunkIndex; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      const start = ci === this.headChunkIndex ? this.headIndex : 0
      const end = ci === this.chunks.length - 1 ? this.tailIndex : this.chunkSize - 1
      for (let ei = start; ei <= end; ei++) {
        callback(chunk[ei]!, idx)
        idx++
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let ci = this.headChunkIndex; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      const start = ci === this.headChunkIndex ? this.headIndex : 0
      const end = ci === this.chunks.length - 1 ? this.tailIndex : this.chunkSize - 1
      for (let ei = start; ei <= end; ei++) {
        yield chunk[ei]!
      }
    }
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    let remaining = index
    for (let ci = this.headChunkIndex; ci < this.chunks.length; ci++) {
      const start = ci === this.headChunkIndex ? this.headIndex : 0
      const end = ci === this.chunks.length - 1 ? this.tailIndex : this.chunkSize - 1
      const chunkLen = end - start + 1
      if (remaining < chunkLen) {
        return this.chunks[ci]![start + remaining]!
      }
      remaining -= chunkLen
    }
    return undefined
  }

  chunkCount(): number {
    if (this._size === 0) return 0
    return this.chunks.length - this.headChunkIndex
  }

  capacity(): number {
    if (this._size === 0) return 0
    return this.chunkCount() * this.chunkSize
  }

  compact(): void {
    if (this.headChunkIndex === 0 && this.headIndex === 0) return
    const newArr = this.toArray()
    this.chunks.length = 0
    this._size = 0
    this.tailChunkIndex = -1
    this.tailIndex = -1
    this.headChunkIndex = 0
    this.headIndex = 0
    for (let i = 0; i < newArr.length; i++) {
      this.enqueue(newArr[i]!)
    }
    this.stats.compactions++
  }

  getStatistics(): ChunkedQueueStatistics {
    return { ...this.stats }
  }
}

export { DEFAULT_CHUNKED_QUEUE_OPTIONS } from './types.js'
export type { ChunkedQueueOptions, ChunkedQueueStatistics } from './types.js'
