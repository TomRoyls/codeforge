import type { BlockQueueOptions } from './types.js'

export class BlockQueue<T> {
  private queue: T[] = []
  private blockSize: number
  private capacity: number | undefined

  constructor(blockSize: number, options?: BlockQueueOptions) {
    if (blockSize < 1) {
      throw new RangeError('blockSize must be at least 1')
    }
    if (options?.capacity !== undefined && options.capacity < 1) {
      throw new RangeError('capacity must be at least 1')
    }
    this.blockSize = blockSize
    this.capacity = options?.capacity
  }

  get size(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  isFull(): boolean {
    if (this.capacity === undefined) return false
    return this.queue.length >= this.capacity
  }

  enqueue(element: T): void {
    if (this.capacity !== undefined && this.queue.length >= this.capacity) {
      throw new RangeError('queue is full')
    }
    this.queue.push(element)
  }

  dequeueBlock(): T[] {
    if (this.queue.length === 0) return []
    const count = Math.min(this.blockSize, this.queue.length)
    return this.queue.splice(0, count)
  }

  peek(): T | undefined {
    if (this.queue.length === 0) return undefined
    return this.queue[0]
  }

  peekBlock(): T[] {
    const count = Math.min(this.blockSize, this.queue.length)
    return this.queue.slice(0, count)
  }

  clear(): void {
    this.queue.length = 0
  }

  toArray(): T[] {
    return [...this.queue]
  }

  blockCount(): number {
    if (this.queue.length === 0) return 0
    return Math.ceil(this.queue.length / this.blockSize)
  }

  currentBlockSize(): number {
    if (this.queue.length === 0) return 0
    const fullBlocks = Math.floor(this.queue.length / this.blockSize)
    const remainder = this.queue.length % this.blockSize
    if (remainder === 0 && fullBlocks > 0) {
      return this.blockSize
    }
    return remainder
  }

  remainingCapacity(): number {
    if (this.capacity === undefined) return Infinity
    return Math.max(0, this.capacity - this.queue.length)
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.queue.length; i++) {
      yield this.queue[i]!
    }
  }

  static from<T>(arr: T[], blockSize: number, options?: BlockQueueOptions): BlockQueue<T> {
    const q = new BlockQueue<T>(blockSize, options)
    for (const item of arr) {
      q.enqueue(item)
    }
    return q
  }

  toString(): string {
    return `${BlockQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }


  toJSON() {
    return { type: 'BlockQueue', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }
}
