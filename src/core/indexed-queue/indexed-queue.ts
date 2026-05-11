import type { IndexedQueueOptions } from './types.js'
import { DEFAULT_INDEXED_QUEUE_OPTIONS } from './types.js'

export class IndexedQueue<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private count: number = 0
  private opts: IndexedQueueOptions

  constructor(initialItems?: T[]) {
    this.opts = { ...DEFAULT_INDEXED_QUEUE_OPTIONS }
    const items = initialItems ?? []
    let cap = this.opts.initialCapacity
    while (cap < items.length) {
      cap *= this.opts.growthFactor
    }
    this.buffer = new Array<T | undefined>(cap)
    for (let i = 0; i < items.length; i++) {
      this.buffer[i] = items[i]
    }
    this.count = items.length
    this.tail = items.length % cap
  }

  private capacity(): number {
    return this.buffer.length
  }

  private physicalIndex(logicalIndex: number): number {
    return (this.head + logicalIndex) % this.capacity()
  }

  private grow(): void {
    const newCap = this.buffer.length * this.opts.growthFactor
    const newBuffer = new Array<T | undefined>(newCap)
    for (let i = 0; i < this.count; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this.count
  }

  private ensureCapacity(): void {
    if (this.count === this.buffer.length) {
      this.grow()
    }
  }

  pushBack(item: T): void {
    this.ensureCapacity()
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.capacity()
    this.count++
  }

  pushFront(item: T): void {
    this.ensureCapacity()
    this.head = (this.head - 1 + this.capacity()) % this.capacity()
    this.buffer[this.head] = item
    this.count++
  }

  popBack(): T {
    if (this.count === 0) {
      throw new Error('IndexedQueue is empty')
    }
    this.tail = (this.tail - 1 + this.capacity()) % this.capacity()
    const item = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this.count--
    return item as T
  }

  popFront(): T {
    if (this.count === 0) {
      throw new Error('IndexedQueue is empty')
    }
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.capacity()
    this.count--
    return item as T
  }

  peekFront(): T {
    if (this.count === 0) {
      throw new Error('IndexedQueue is empty')
    }
    return this.buffer[this.head] as T
  }

  peekBack(): T {
    if (this.count === 0) {
      throw new Error('IndexedQueue is empty')
    }
    const idx = (this.tail - 1 + this.capacity()) % this.capacity()
    return this.buffer[idx] as T
  }

  get(index: number): T {
    if (index < 0 || index >= this.count) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.count})`)
    }
    return this.buffer[this.physicalIndex(index)] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this.count) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.count})`)
    }
    this.buffer[this.physicalIndex(index)] = value
  }

  indexOf(item: T): number {
    for (let i = 0; i < this.count; i++) {
      if (this.buffer[this.physicalIndex(i)] === item) {
        return i
      }
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  slice(start?: number, end?: number): T[] {
    const s = start ?? 0
    const e = end ?? this.count
    const clampedStart = Math.max(0, s < 0 ? this.count + s : s)
    const clampedEnd = Math.min(this.count, e < 0 ? this.count + e : e)
    const result: T[] = []
    for (let i = clampedStart; i < clampedEnd; i++) {
      result.push(this.buffer[this.physicalIndex(i)] as T)
    }
    return result
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this.opts.initialCapacity)
    this.head = 0
    this.tail = 0
    this.count = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[this.physicalIndex(i)] as T)
    }
    return result
  }

  clone(): IndexedQueue<T> {
    const q = new IndexedQueue<T>()
    q.buffer = [...this.buffer]
    q.head = this.head
    q.tail = this.tail
    q.count = this.count
    q.opts = { ...this.opts }
    return q
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      callback(this.buffer[this.physicalIndex(i)] as T, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.count; i++) {
      yield this.buffer[this.physicalIndex(i)] as T
    }
  }

  static fromArray<U>(items: U[]): IndexedQueue<U> {
    return new IndexedQueue<U>(items)
  }
}

export { DEFAULT_INDEXED_QUEUE_OPTIONS } from './types.js'
export type { IndexedQueueOptions } from './types.js'
