import type { RingBufferOptions, RingBufferStats } from './types.js'
import { DEFAULT_RING_BUFFER_OPTIONS } from './types.js'

export class RingBuffer<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private options: RingBufferOptions
  private _totalWritten: number = 0
  private _totalRead: number = 0
  private _overwriteCount: number = 0

  constructor(options?: Partial<RingBufferOptions>) {
    this.options = { ...DEFAULT_RING_BUFFER_OPTIONS, ...options }
    this.buffer = new Array<T | undefined>(this.options.capacity)
  }

  write(item: T): boolean {
    if (this._size === this.options.capacity) {
      if (!this.options.overwrite) {
        return false
      }
      this.head = (this.head + 1) % this.options.capacity
      this._size--
      this._overwriteCount++
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.options.capacity
    this._size++
    this._totalWritten++
    return true
  }

  read(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.options.capacity
    this._size--
    this._totalRead++
    return item
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]
  }

  peekAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this.buffer[(this.head + index) % this.options.capacity]
  }

  writeMany(items: T[]): number {
    let written = 0
    for (const item of items) {
      if (this.write(item)) {
        written++
      }
    }
    return written
  }

  readMany(count: number): T[] {
    const result: T[] = []
    const toRead = Math.min(count, this._size)
    for (let i = 0; i < toRead; i++) {
      const item = this.read()
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this.options.capacity
  }

  capacity(): number {
    return this.options.capacity
  }

  available(): number {
    return this.options.capacity - this._size
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this.options.capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this.options.capacity]
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  getStats(): RingBufferStats {
    return {
      capacity: this.options.capacity,
      size: this._size,
      isEmpty: this._size === 0,
      isFull: this._size === this.options.capacity,
      totalWritten: this._totalWritten,
      totalRead: this._totalRead,
      overwriteCount: this._overwriteCount,
    }
  }
}

export { DEFAULT_RING_BUFFER_OPTIONS } from './types.js'
export type { RingBufferOptions, RingBufferStats } from './types.js'
