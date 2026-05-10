import type { PocketQueueOptions } from './types.js'

export class PocketQueue<T = unknown> {
  private _capacity: number
  private _autoFlush: boolean
  private _onFlush: ((items: T[]) => void) | undefined
  private _size: number = 0
  private _head: number = 0
  private _tail: number = 0
  private _batchSize: number = 0
  private _totalFlushed: number = 0
  private buffer: (T | undefined)[]

  constructor(capacity: number, autoFlush?: boolean, onFlush?: (items: T[]) => void)
  constructor(options: PocketQueueOptions<T>)
  constructor(capacityOrOptions: number | PocketQueueOptions<T>, autoFlush?: boolean, onFlush?: (items: T[]) => void) {
    if (typeof capacityOrOptions === 'object') {
      this._capacity = Math.max(1, Math.floor(capacityOrOptions.capacity))
      this._autoFlush = capacityOrOptions.autoFlush ?? false
      this._onFlush = capacityOrOptions.onFlush
    } else {
      this._capacity = Math.max(1, Math.floor(capacityOrOptions))
      this._autoFlush = autoFlush ?? false
      this._onFlush = onFlush
    }
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  enqueue(item: T): void {
    if (this._size === this._capacity) {
      const items = this.flush()
      this._onFlush?.(items)
    }
    this.buffer[this._tail] = item
    this._tail = (this._tail + 1) % this._capacity
    this._size++

    if (this._autoFlush && this._size === this._capacity) {
      const items = this.flush()
      this._onFlush?.(items)
    }
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this._head]
    this.buffer[this._head] = undefined
    this._head = (this._head + 1) % this._capacity
    this._size--
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this._head]
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  get isFull(): boolean {
    return this._size === this._capacity
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  flush(): T[] {
    const items = this.toArray()
    this.reset()
    if (items.length > 0) {
      this._batchSize++
      this._totalFlushed += items.length
    }
    return items
  }

  pocket(): T[] {
    return this.flush()
  }

  reset(): void {
    this.buffer = new Array<T | undefined>(this._capacity)
    this._head = 0
    this._tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this._head + i) % this._capacity]
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this._head + i) % this._capacity]
      if (item !== undefined) {
        callback(item, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this._head + i) % this._capacity]
      if (item !== undefined) {
        yield item
      }
    }
  }

  enqueueMany(items: Iterable<T>): void {
    for (const item of items) {
      this.enqueue(item)
    }
  }

  dequeueMany(count: number): T[] {
    const result: T[] = []
    const actual = Math.min(count, this._size)
    for (let i = 0; i < actual; i++) {
      const item = this.dequeue()
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  get remaining(): number {
    return this._capacity - this._size
  }

  get batchSize(): number {
    return this._batchSize
  }

  get totalFlushed(): number {
    return this._totalFlushed
  }
}

export type { PocketQueueOptions } from './types.js'
