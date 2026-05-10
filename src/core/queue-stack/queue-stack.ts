import type { QueueStackOptions, QueueStackStatistics } from './types.js'
import { DEFAULT_QUEUE_STACK_OPTIONS } from './types.js'

export class QueueStack<T = unknown> {
  private data: (T | undefined)[]
  private head = 0
  private tail = 0
  private count = 0
  private stats: QueueStackStatistics = {
    queuePushes: 0,
    stackPushes: 0,
    pops: 0,
    queuePops: 0,
    stackPops: 0,
  }

  constructor(options?: QueueStackOptions) {
    const capacity = options?.initialCapacity ?? DEFAULT_QUEUE_STACK_OPTIONS.initialCapacity
    this.data = new Array<T | undefined>(capacity)
  }

  private ensureCapacity(): void {
    if (this.count < this.data.length) return
    const newData = new Array<T | undefined>(this.data.length * 2)
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.data.length
      newData[i] = this.data[idx]
    }
    this.data = newData
    this.head = 0
    this.tail = this.count
  }

  enqueue(value: T): void {
    this.ensureCapacity()
    this.data[this.tail] = value
    this.tail = (this.tail + 1) % this.data.length
    this.count++
    this.stats.queuePushes++
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined
    const value = this.data[this.head]
    this.data[this.head] = undefined
    this.head = (this.head + 1) % this.data.length
    this.count--
    this.stats.pops++
    this.stats.queuePops++
    return value
  }

  push(value: T): void {
    this.ensureCapacity()
    this.data[this.tail] = value
    this.tail = (this.tail + 1) % this.data.length
    this.count++
    this.stats.stackPushes++
  }

  pop(): T | undefined {
    if (this.count === 0) return undefined
    this.tail = (this.tail - 1 + this.data.length) % this.data.length
    const value = this.data[this.tail]
    this.data[this.tail] = undefined
    this.count--
    this.stats.pops++
    this.stats.stackPops++
    return value
  }

  peekFront(): T | undefined {
    if (this.count === 0) return undefined
    return this.data[this.head]
  }

  peekBack(): T | undefined {
    if (this.count === 0) return undefined
    const idx = (this.tail - 1 + this.data.length) % this.data.length
    return this.data[idx]
  }

  get size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = undefined
    }
    this.head = 0
    this.tail = 0
    this.count = 0
    this.stats = {
      queuePushes: 0,
      stackPushes: 0,
      pops: 0,
      queuePops: 0,
      stackPops: 0,
    }
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.data.length
      const val = this.data[idx]
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.data.length
      const val = this.data[idx]
      if (val !== undefined) {
        callback(val, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.data.length
      const val = this.data[idx]
      if (val !== undefined) {
        yield val
      }
    }
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.data.length
      const val = this.data[idx]
      if (val === value) return i
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  reverse(): void {
    if (this.count <= 1) return
    const arr = this.toArray()
    arr.reverse()
    for (let i = 0; i < this.count; i++) {
      this.data[(this.head + i) % this.data.length] = arr[i]
    }
  }

  enqueueMany(...values: T[]): void {
    for (const v of values) {
      this.enqueue(v)
    }
  }

  pushMany(...values: T[]): void {
    for (const v of values) {
      this.push(v)
    }
  }

  getStatistics(): QueueStackStatistics {
    return { ...this.stats }
  }
}
