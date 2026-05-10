import type { TwoStackQueueOptions, TwoStackQueueStatistics } from './types.js'
import { DEFAULT_TWO_STACK_QUEUE_OPTIONS } from './types.js'

export class TwoStackQueue<T = unknown> {
  private enqueueStack: T[] = []
  private dequeueStack: T[] = []
  private _size: number = 0
  private options: TwoStackQueueOptions
  private stats: TwoStackQueueStatistics

  constructor(options?: Partial<TwoStackQueueOptions>) {
    this.options = { ...DEFAULT_TWO_STACK_QUEUE_OPTIONS, ...options }
    this.stats = {
      enqueues: 0,
      dequeues: 0,
      transfers: 0,
      maxEnqueueStackSize: 0,
      maxDequeueStackSize: 0,
      totalTransferCount: 0,
    }
  }

  private transfer(): void {
    while (this.enqueueStack.length > 0) {
      this.dequeueStack.push(this.enqueueStack.pop()!)
    }
    if (this.options.trackStatistics) {
      this.stats.transfers++
      this.stats.totalTransferCount += this.dequeueStack.length
      this.updateMaxSizes()
    }
  }

  private updateMaxSizes(): void {
    if (this.options.trackStatistics) {
      if (this.enqueueStack.length > this.stats.maxEnqueueStackSize) {
        this.stats.maxEnqueueStackSize = this.enqueueStack.length
      }
      if (this.dequeueStack.length > this.stats.maxDequeueStackSize) {
        this.stats.maxDequeueStackSize = this.dequeueStack.length
      }
    }
  }

  enqueue(value: T): void {
    this.enqueueStack.push(value)
    this._size++
    if (this.options.trackStatistics) {
      this.stats.enqueues++
      this.updateMaxSizes()
    }
  }

  dequeue(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    if (this.dequeueStack.length === 0) {
      this.transfer()
    }
    const value = this.dequeueStack.pop()!
    this._size--
    if (this.options.trackStatistics) {
      this.stats.dequeues++
      this.updateMaxSizes()
    }
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    if (this.dequeueStack.length === 0) {
      this.transfer()
    }
    return this.dequeueStack[this.dequeueStack.length - 1]
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.enqueueStack = []
    this.dequeueStack = []
    this._size = 0
  }

  toArray(): T[] {
    return [...this.dequeueStack].reverse().concat(this.enqueueStack)
  }

  forEach(callback: (value: T, index: number) => void): void {
    const all = this.toArray()
    for (let i = 0; i < all.length; i++) {
      callback(all[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    const copy = this.toArray()
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

  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    if (this.enqueueStack.length > 0) {
      return this.enqueueStack[this.enqueueStack.length - 1]
    }
    return this.dequeueStack[0]
  }

  enqueueStackSize(): number {
    return this.enqueueStack.length
  }

  dequeueStackSize(): number {
    return this.dequeueStack.length
  }

  transferCount(): number {
    return this.stats.transfers
  }

  getStatistics(): TwoStackQueueStatistics {
    return { ...this.stats }
  }
}

export { DEFAULT_TWO_STACK_QUEUE_OPTIONS } from './types.js'
export type { TwoStackQueueOptions, TwoStackQueueStatistics } from './types.js'
