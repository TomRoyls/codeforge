import type { ConcurrentQueueOptions } from './types.js'

type Resolver<T> = (value: T) => void

export class ConcurrentQueue<T = unknown> {
  private items: T[]
  private _capacity: number | undefined
  private waitingConsumers: Array<Resolver<T>>
  private waitingProducers: Array<Resolver<void>>
  private closed: boolean

  constructor(options?: ConcurrentQueueOptions) {
    this.items = []
    this._capacity = options?.capacity
    this.waitingConsumers = []
    this.waitingProducers = []
    this.closed = false
  }

  private signalConsumer(): void {
    if (this.waitingConsumers.length > 0 && this.items.length > 0) {
      const resolver = this.waitingConsumers.shift()
      if (resolver) {
        const item = this.items.shift()!
        resolver(item)
        this.signalProducer()
      }
    }
  }

  private signalProducer(): void {
    if (this.waitingProducers.length > 0) {
      const isFull = this._capacity !== undefined && this.items.length >= this._capacity
      if (!isFull) {
        const resolver = this.waitingProducers.shift()
        if (resolver) {
          resolver()
        }
      }
    }
  }

  enqueue(value: T): void {
    if (this.closed) {
      throw new Error('Queue is closed')
    }
    if (this._capacity !== undefined && this.items.length >= this._capacity) {
      throw new Error('Queue is full')
    }
    this.items.push(value)
    this.signalConsumer()
  }

  dequeue(): T {
    if (this.items.length === 0) {
      throw new Error('Queue is empty')
    }
    const item = this.items.shift()!
    this.signalProducer()
    return item
  }

  peek(): T | undefined {
    if (this.items.length === 0) return undefined
    return this.items[0]
  }

  get size(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  get capacity(): number | undefined {
    return this._capacity
  }

  clear(): void {
    this.items.length = 0
    const producers = this.waitingProducers.splice(0)
    for (const resolver of producers) {
      resolver()
    }
  }

  toArray(): T[] {
    return [...this.items]
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      callback(this.items[i]!, i)
    }
  }

  drain(count?: number): T[] {
    if (count === undefined) {
      const result = this.items.splice(0)
      const producers = this.waitingProducers.splice(0)
      for (const resolver of producers) {
        resolver()
      }
      return result
    }
    const actualCount = Math.min(count, this.items.length)
    const result = this.items.splice(0, actualCount)
    for (let i = 0; i < actualCount && this.waitingProducers.length > 0; i++) {
      const resolver = this.waitingProducers.shift()
      if (resolver) resolver()
    }
    return result
  }

  offer(value: T): boolean {
    if (this.closed) return false
    if (this._capacity !== undefined && this.items.length >= this._capacity) {
      return false
    }
    this.items.push(value)
    this.signalConsumer()
    return true
  }

  poll(): T | undefined {
    if (this.items.length === 0) return undefined
    const item = this.items.shift()!
    this.signalProducer()
    return item
  }

  put(value: T): Promise<void> {
    if (this.closed) {
      return Promise.reject(new Error('Queue is closed'))
    }
    if (this._capacity === undefined || this.items.length < this._capacity) {
      this.items.push(value)
      this.signalConsumer()
      return Promise.resolve()
    }
    return new Promise<void>((resolve) => {
      this.waitingProducers.push(() => {
        this.items.push(value)
        this.signalConsumer()
        resolve()
      })
    })
  }

  take(): Promise<T> {
    if (this.items.length > 0) {
      const item = this.items.shift()!
      this.signalProducer()
      return Promise.resolve(item)
    }
    return new Promise<T>((resolve) => {
      this.waitingConsumers.push(resolve)
    })
  }

  close(): void {
    this.closed = true
    const consumers = this.waitingConsumers.splice(0)
    for (const resolver of consumers) {
      resolver(undefined as T)
    }
    const producers = this.waitingProducers.splice(0)
    for (const resolver of producers) {
      resolver()
    }
  }

  get isClosed(): boolean {
    return this.closed
  }

  get isFull(): boolean {
    if (this._capacity === undefined) return false
    return this.items.length >= this._capacity
  }

  get remainingCapacity(): number | undefined {
    if (this._capacity === undefined) return undefined
    return this._capacity - this.items.length
  }

  contains(value: T): boolean {
    return this.items.includes(value)
  }

  remove(value: T): boolean {
    const index = this.items.indexOf(value)
    if (index === -1) return false
    this.items.splice(index, 1)
    this.signalProducer()
    return true
  }

  static fromArray<U>(arr: U[], options?: ConcurrentQueueOptions): ConcurrentQueue<U> {
    const queue = new ConcurrentQueue<U>(options)
    for (const item of arr) {
      queue.enqueue(item)
    }
    return queue
  }
}

export type { ConcurrentQueueOptions } from './types.js'
