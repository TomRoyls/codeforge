import type { BlockingQueueOptions } from './types.js'
import { DEFAULT_BLOCKING_QUEUE_CAPACITY } from './types.js'

export class BlockingQueue<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private _capacity: number

  constructor(capacity?: number)
  constructor(options?: Partial<BlockingQueueOptions>)
  constructor(capacityOrOptions?: number | Partial<BlockingQueueOptions>) {
    if (typeof capacityOrOptions === 'number') {
      this._capacity = Math.max(1, capacityOrOptions)
    } else if (capacityOrOptions && typeof capacityOrOptions === 'object') {
      this._capacity = Math.max(1, capacityOrOptions.capacity ?? DEFAULT_BLOCKING_QUEUE_CAPACITY)
    } else {
      this._capacity = DEFAULT_BLOCKING_QUEUE_CAPACITY
    }
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  enqueue(item: T): boolean {
    if (this._size >= this._capacity) {
      return false
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this._capacity
    this._size++
    return true
  }

  dequeue(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return item
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]
  }

  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  isFull(): boolean {
    return this._size >= this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  remainingCapacity(): number {
    return this._capacity - this._size
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

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[(this.head + i) % this._capacity] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  contains(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === item) {
        return true
      }
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this._capacity
      if (this.buffer[idx] === item) {
        for (let j = i; j < this._size - 1; j++) {
          const from = (this.head + j + 1) % this._capacity
          const to = (this.head + j) % this._capacity
          this.buffer[to] = this.buffer[from]
        }
        this.tail = (this.tail - 1 + this._capacity) % this._capacity
        this.buffer[this.tail] = undefined
        this._size--
        return true
      }
    }
    return false
  }

  drain(): T[] {
    const result = this.toArray()
    this.clear()
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this._capacity]
      if (item !== undefined) {
        callback(item, i)
      }
    }
  }

  clone(): BlockingQueue<T> {
    const result = new BlockingQueue<T>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this._capacity]
      if (item !== undefined) {
        result.enqueue(item)
      }
    }
    return result
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this._capacity]
      if (item !== undefined) {
        yield item
      }
    }
  }

  enqueueMany(items: T[]): number {
    let count = 0
    for (const item of items) {
      if (this.enqueue(item)) {
        count++
      }
    }
    return count
  }

  dequeueMany(count: number): T[] {
    const toDequeue = Math.min(count, this._size)
    const result: T[] = []
    for (let i = 0; i < toDequeue; i++) {
      const item = this.dequeue()
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }
}

export { DEFAULT_BLOCKING_QUEUE_CAPACITY } from './types.js'
export type { BlockingQueueOptions } from './types.js'
