import type { BoundedQueueOptions, BoundedQueueStats } from './types.js'
import { DEFAULT_BOUNDED_QUEUE_OPTIONS } from './types.js'

interface LruEntry<T> {
  value: T
  accessTime: number
}

export class BoundedQueue<T = unknown> {
  private _capacity: number
  private _policy: NonNullable<BoundedQueueOptions['policy']>
  private _size: number = 0
  private _totalEnqueued: number = 0
  private _totalDequeued: number = 0
  private _totalEvicted: number = 0
  private _accessCounter: number = 0

  private buffer: (T | undefined)[] = []
  private head: number = 0
  private tail: number = 0

  private lruItems: LruEntry<T>[] = []
  private lruHead = 0

  private randomItems: T[] = []
  private randomHead = 0

  constructor(options?: Partial<BoundedQueueOptions>) {
    const resolved = { ...DEFAULT_BOUNDED_QUEUE_OPTIONS, ...options }
    this._capacity = Math.max(1, resolved.capacity)
    this._policy = resolved.policy

    if (this._policy === 'fifo') {
      this.buffer = new Array<T | undefined>(this._capacity)
    }
  }

  enqueue(value: T): T | undefined {
    let evicted: T | undefined
    if (this._size === this._capacity) {
      evicted = this.evictOne()
    }
    this.insertOne(value)
    this._totalEnqueued++
    return evicted
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.removeFront()
    this._totalDequeued++
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    if (this._policy === 'fifo') {
      return this.buffer[this.head]
    }
    if (this._policy === 'lru') {
      this.lruItems[0]!.accessTime = ++this._accessCounter
      return this.lruItems[0]!.value
    }
    return this.randomItems[0]
  }

  peekBack(): T | undefined {
    if (this._size === 0) return undefined
    if (this._policy === 'fifo') {
      return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
    }
    if (this._policy === 'lru') {
      return this.lruItems[this._size - 1]!.value
    }
    return this.randomItems[this._size - 1]!
  }

  get isFull(): boolean {
    return this._size === this._capacity
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._size = 0
    if (this._policy === 'fifo') {
      this.buffer = new Array<T | undefined>(this._capacity)
      this.head = 0
      this.tail = 0
    } else if (this._policy === 'lru') {
      this.lruItems = []
      this.lruHead = 0
    } else {
      this.randomItems = []
      this.randomHead = 0
    }
  }

  clone(): BoundedQueue<T> {
    const result = new BoundedQueue<T>({ capacity: this._capacity, policy: this._policy })
    const items = this.toArray()
    for (const item of items) {
      result.enqueue(item)
    }
    return result
  }

  toArray(): T[] {
    if (this._policy === 'fifo') {
      const result: T[] = []
      for (let i = 0; i < this._size; i++) {
        const item = this.buffer[(this.head + i) % this._capacity]
        if (item !== undefined) {
          result.push(item)
        }
      }
      return result
    }
    if (this._policy === 'lru') {
      const result: T[] = []
      for (let i = this.lruHead; i < this.lruItems.length; i++) {
        result.push(this.lruItems[i]!.value)
      }
      return result
    }
    const result: T[] = []
    for (let i = this.randomHead; i < this.randomItems.length; i++) {
      result.push(this.randomItems[i]!)
    }
    return result
  }

  static from<T>(items: Iterable<T>, options?: Partial<BoundedQueueOptions>): BoundedQueue<T> {
    const resolved = { ...DEFAULT_BOUNDED_QUEUE_OPTIONS, ...options }
    const queue = new BoundedQueue<T>({ capacity: resolved.capacity, policy: resolved.policy })
    for (const item of items) {
      queue.enqueue(item)
    }
    return queue
  }

  contains(value: T): boolean {
    if (this._policy === 'fifo') {
      for (let i = 0; i < this._size; i++) {
        if (this.buffer[(this.head + i) % this._capacity] === value) {
          return true
        }
      }
      return false
    }
    if (this._policy === 'lru') {
      let found = false
      for (const entry of this.lruItems) {
        if (entry.value === value) {
          entry.accessTime = ++this._accessCounter
          found = true
        }
      }
      return found
    }
    return this.randomItems.includes(value)
  }

  stats(): BoundedQueueStats {
    return {
      capacity: this._capacity,
      size: this._size,
      isEmpty: this._size === 0,
      isFull: this._size === this._capacity,
      policy: this._policy,
      totalEnqueued: this._totalEnqueued,
      totalDequeued: this._totalDequeued,
      totalEvicted: this._totalEvicted,
    }
  }

  private evictOne(): T | undefined {
    this._totalEvicted++
    if (this._policy === 'fifo') {
      const value = this.buffer[this.head]!
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
      this._size--
      return value
    }
    if (this._policy === 'lru') {
      let minIdx = this.lruHead
      let minTime = this.lruItems[this.lruHead]!.accessTime
      for (let i = this.lruHead + 1; i < this.lruItems.length; i++) {
        if (this.lruItems[i]!.accessTime < minTime) {
          minTime = this.lruItems[i]!.accessTime
          minIdx = i
        }
      }
      const evicted = this.lruItems[minIdx]!.value
      this.lruItems.splice(minIdx, 1)
      this._size--
      return evicted
    }
    const logicalLen = this.randomItems.length - this.randomHead
    const idx = this.randomHead + Math.floor(Math.random() * logicalLen)
    const value = this.randomItems[idx]!
    this.randomItems[idx] = this.randomItems[this.randomItems.length - 1]!
    this.randomItems.pop()
    this._size--
    return value
  }

  private insertOne(value: T): void {
    if (this._policy === 'fifo') {
      this.buffer[this.tail] = value
      this.tail = (this.tail + 1) % this._capacity
      this._size++
    } else if (this._policy === 'lru') {
      this.lruItems.push({ value, accessTime: ++this._accessCounter })
      this._size++
    } else {
      this.randomItems.push(value)
      this._size++
    }
  }

  private removeFront(): T | undefined {
    if (this._policy === 'fifo') {
      const value = this.buffer[this.head]!
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
      this._size--
      return value
    }
    if (this._policy === 'lru') {
      const entry = this.lruItems[this.lruHead]!
      this.lruHead++
      this._size--
      if (this.lruHead >= this.lruItems.length) {
        this.lruItems = []
        this.lruHead = 0
      }
      return entry.value
    }
    const value = this.randomItems[this.randomHead]!
    this.randomHead++
    this._size--
    if (this.randomHead >= this.randomItems.length) {
      this.randomItems = []
      this.randomHead = 0
    }
    return value
  }
}

export { DEFAULT_BOUNDED_QUEUE_OPTIONS } from './types.js'
export type { BoundedQueueOptions, BoundedQueueStats, EvictionPolicy } from './types.js'
