import type { AmortizedQueueOptions } from './types.js'
import { DEFAULT_AMORTIZED_QUEUE_OPTIONS } from './types.js'

export class AmortizedQueue<T = unknown> {
  private front: T[] = []
  private rear: T[] = []
  private _size: number = 0
  private options: AmortizedQueueOptions
  private frozen: boolean = false

  constructor(options?: Partial<AmortizedQueueOptions>) {
    this.options = { ...DEFAULT_AMORTIZED_QUEUE_OPTIONS, ...options }
  }

  private ensureInvariant(): void {
    if (this.front.length === 0 && this.rear.length > 0) {
      this.front = this.rear
      this.rear = []
    }
  }

  private checkMutable(): void {
    if (this.frozen) {
      throw new Error('Cannot modify a frozen queue')
    }
  }

  private enforceMaxSize(): void {
    if (this.options.maxSize > 0 && this._size > this.options.maxSize) {
      this.ensureInvariant()
      this.front.shift()
      this._size--
    }
  }

  enqueue(item: T): void {
    this.checkMutable()
    this.rear.push(item)
    this._size++
    this.enforceMaxSize()
  }

  dequeue(): T | undefined {
    this.checkMutable()
    if (this._size === 0) {
      return undefined
    }
    this.ensureInvariant()
    const value = this.front.shift()!
    this._size--
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    if (this.front.length > 0) {
      return this.front[0]
    }
    return this.rear[0]
  }

  front_(): T | undefined {
    return this.peek()
  }

  back(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    if (this.rear.length > 0) {
      return this.rear[this.rear.length - 1]
    }
    return this.front[this.front.length - 1]
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.checkMutable()
    this.front = []
    this.rear = []
    this._size = 0
  }

  toArray(): T[] {
    return [...this.front, ...this.rear]
  }

  fromArray(items: T[]): void {
    this.checkMutable()
    for (const item of items) {
      this.enqueue(item)
    }
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.front.length; i++) {
      callback(this.front[i]!, i)
    }
    for (let i = 0; i < this.rear.length; i++) {
      callback(this.rear[i]!, this.front.length + i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    const copy = [...this.front, ...this.rear]
    let index = 0
    return {
      next(): IteratorResult<T> {
        if (index < copy.length) {
          return { value: copy[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  enqueueMany(items: T[]): void {
    this.checkMutable()
    for (const item of items) {
      this.rear.push(item)
      this._size++
      this.enforceMaxSize()
    }
  }

  dequeueMany(count: number): T[] {
    this.checkMutable()
    const result: T[] = []
    const actualCount = Math.min(count, this._size)
    for (let i = 0; i < actualCount; i++) {
      this.ensureInvariant()
      result.push(this.front.shift()!)
      this._size--
    }
    return result
  }

  reverse(): AmortizedQueue<T> {
    const queue = new AmortizedQueue<T>({ maxSize: this.options.maxSize })
    const all = [...this.front, ...this.rear]
    queue.front = all.reverse()
    queue._size = this._size
    return queue
  }

  map<U>(fn: (value: T, index: number) => U): AmortizedQueue<U> {
    const queue = new AmortizedQueue<U>({ maxSize: this.options.maxSize })
    const all = [...this.front, ...this.rear]
    queue.front = all.map((val, idx) => fn(val, idx))
    queue._size = this._size
    return queue
  }

  filter(fn: (value: T, index: number) => boolean): AmortizedQueue<T> {
    const queue = new AmortizedQueue<T>({ maxSize: this.options.maxSize })
    const all = [...this.front, ...this.rear]
    const filtered = all.filter((val, idx) => fn(val, idx))
    queue.front = filtered
    queue._size = filtered.length
    return queue
  }

  clone(): AmortizedQueue<T> {
    const queue = new AmortizedQueue<T>({ maxSize: this.options.maxSize })
    queue.front = [...this.front]
    queue.rear = [...this.rear]
    queue._size = this._size
    return queue
  }

  persist(): AmortizedQueue<T> {
    const snapshot = new AmortizedQueue<T>({ maxSize: this.options.maxSize })
    snapshot.front = [...this.front]
    snapshot.rear = [...this.rear]
    snapshot._size = this._size
    snapshot.frozen = true
    return snapshot
  }

  isFrozen(): boolean {
    return this.frozen
  }
}

export { DEFAULT_AMORTIZED_QUEUE_OPTIONS } from './types.js'
export type { AmortizedQueueOptions } from './types.js'
