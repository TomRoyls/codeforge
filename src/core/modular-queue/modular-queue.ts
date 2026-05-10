import type { ModularQueueOptions, ModularQueueStats } from './types.js'

export class ModularQueue<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private _size: number = 0
  private readonly _capacity: number
  private readonly _overwrite: boolean

  constructor(options: ModularQueueOptions) {
    this._capacity = Math.max(1, Math.floor(options.capacity))
    this._overwrite = options.overwrite ?? false
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  enqueue(item: T): boolean {
    if (this._size === this._capacity) {
      if (!this._overwrite) {
        return false
      }
      this.buffer[this.head] = item
      this.head = (this.head + 1) % this._capacity
      return true
    }
    const tail = (this.head + this._size) % this._capacity
    this.buffer[tail] = item
    this._size++
    return true
  }

  dequeue(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const value = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]!
  }

  peekLast(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const lastIndex = (this.head + this._size - 1) % this._capacity
    return this.buffer[lastIndex]!
  }

  size(): number {
    return this._size
  }

  capacity(): number {
    return this._capacity
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buffer[i] = undefined
    }
    this.head = 0
    this._size = 0
  }

  clone(): ModularQueue<T> {
    const result = new ModularQueue<T>({ capacity: this._capacity, overwrite: this._overwrite })
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this._capacity
      const tail = (result.head + i) % result._capacity
      result.buffer[tail] = this.buffer[idx]!
    }
    result._size = this._size
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) % this._capacity]!, i)
    }
  }

  static from<T>(items: Iterable<T>, options: ModularQueueOptions): ModularQueue<T> {
    const arr = Array.from(items)
    const queue = new ModularQueue<T>(options)
    for (const item of arr) {
      queue.enqueue(item)
    }
    return queue
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === item) {
        return i
      }
    }
    return -1
  }

  contains(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  stats(): ModularQueueStats {
    return {
      capacity: this._capacity,
      size: this._size,
      isEmpty: this._size === 0,
      isFull: this._size === this._capacity,
      utilization: this._size / this._capacity,
      overwriteEnabled: this._overwrite,
    }
  }
}

export type { ModularQueueOptions, ModularQueueStats } from './types.js'
