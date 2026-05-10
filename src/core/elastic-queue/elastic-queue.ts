import type { ElasticQueueOptions } from './types.js'
import { DEFAULT_ELASTIC_QUEUE_OPTIONS } from './types.js'

export class ElasticQueue<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private _capacity: number
  private _initialCapacity: number
  private _growthFactor: number

  constructor(options?: Partial<ElasticQueueOptions>) {
    const resolved = { ...DEFAULT_ELASTIC_QUEUE_OPTIONS, ...options }
    this._initialCapacity = Math.max(4, Math.floor(resolved.initialCapacity))
    this._growthFactor = Math.max(1.5, resolved.growthFactor)
    this._capacity = this._initialCapacity
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  enqueue(item: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    this.tryShrink()
    return item
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  size(): number {
    return this._size
  }

  capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this._capacity]
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  static fromArray<T>(items: T[], options?: Partial<ElasticQueueOptions>): ElasticQueue<T> {
    const queue = new ElasticQueue<T>(options)
    for (const item of items) {
      queue.enqueue(item)
    }
    return queue
  }

  enqueueMany(items: T[]): number {
    for (const item of items) {
      this.enqueue(item)
    }
    return items.length
  }

  dequeueMany(count: number): T[] {
    const result: T[] = []
    const toDequeue = Math.min(count, this._size)
    for (let i = 0; i < toDequeue; i++) {
      const item = this.dequeue()
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  resize(newCapacity: number): void {
    const clamped = Math.max(this._initialCapacity, Math.floor(newCapacity))
    if (clamped === this._capacity) return
    if (clamped < this._size) {
      const excess = this._size - clamped
      for (let i = 0; i < excess; i++) {
        this.buffer[(this.head + i) % this._capacity] = undefined
      }
      this.head = (this.head + excess) % this._capacity
      this._size = clamped
    }
    const items = this.toArray()
    this._capacity = clamped
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    for (const item of items) {
      this.buffer[this.tail] = item
      this.tail = (this.tail + 1) % this._capacity
    }
  }

  contains(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === item) {
        return true
      }
    }
    return false
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === item) {
        return i
      }
    }
    return -1
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this._capacity]
      if (item !== undefined) {
        callback(item, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this._capacity]
      if (item !== undefined) {
        yield item
      }
    }
  }

  drain(count?: number): T[] {
    if (count === undefined) {
      return this.dequeueMany(this._size)
    }
    return this.dequeueMany(count)
  }

  compact(): void {
    this.resize(this._size < this._initialCapacity ? this._initialCapacity : this._size)
  }

  get growthFactor(): number {
    return this._growthFactor
  }

  private grow(): void {
    const newCapacity = Math.max(this._capacity + 1, Math.floor(this._capacity * this._growthFactor))
    this.resize(newCapacity)
  }

  private tryShrink(): void {
    if (this._capacity <= this._initialCapacity) return
    if (this._size < this._capacity / 4) {
      const newCapacity = Math.max(this._initialCapacity, Math.floor(this._capacity / 2))
      this.resize(newCapacity)
    }
  }
}

export { DEFAULT_ELASTIC_QUEUE_OPTIONS } from './types.js'
export type { ElasticQueueOptions } from './types.js'
