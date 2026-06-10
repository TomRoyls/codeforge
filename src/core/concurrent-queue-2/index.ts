import type { ConcurrentQueueOptions } from './types.js'

type Resolver<T> = (value: T) => void

export class ConcurrentQueue<T = unknown> {
  private items: T[]
  private _head: number
  private _capacity: number | undefined
  private waitingConsumers: Array<Resolver<T>>
  private _consumerHead: number
  private waitingProducers: Array<Resolver<void>>
  private _producerHead: number
  private closed: boolean

  constructor(options?: ConcurrentQueueOptions) {
    this.items = []
    this._head = 0
    this._capacity = options?.capacity
    this.waitingConsumers = []
    this._consumerHead = 0
    this.waitingProducers = []
    this._producerHead = 0
    this.closed = false
  }

  private _maybeCompact(): void {
    if (this._head > this.items.length / 2) {
      this.items = this.items.slice(this._head)
      this._head = 0
    }
  }

  private _maybeCompactProducers(): void {
    if (this._producerHead > this.waitingProducers.length / 2) {
      this.waitingProducers = this.waitingProducers.slice(this._producerHead)
      this._producerHead = 0
    }
  }

  private signalConsumer(): void {
    if (this.waitingConsumers.length - this._consumerHead > 0 && this.items.length - this._head > 0) {
      const resolver = this.waitingConsumers[this._consumerHead++]
      if (resolver) {
        const item = this.items[this._head++]!
        resolver(item)
        this._maybeCompact()
        this.signalProducer()
      }
    }
  }

  private signalProducer(): void {
    if (this.waitingProducers.length - this._producerHead > 0) {
      const isFull = this._capacity !== undefined && this.items.length - this._head >= this._capacity
      if (!isFull) {
        const resolver = this.waitingProducers[this._producerHead++]
        if (resolver) {
          this._maybeCompactProducers()
          resolver()
        }
      }
    }
  }

  enqueue(value: T): void {
    if (this.closed) {
      throw new Error('Queue is closed')
    }
    if (this._capacity !== undefined && this.items.length - this._head >= this._capacity) {
      throw new Error('Queue is full')
    }
    this.items.push(value)
    this.signalConsumer()
  }

  dequeue(): T {
    if (this.items.length - this._head === 0) {
      throw new Error('Queue is empty')
    }
    const item = this.items[this._head++]!
    this._maybeCompact()
    this.signalProducer()
    return item
  }

  peek(): T | undefined {
    if (this.items.length - this._head === 0) return undefined
    return this.items[this._head]
  }

  get size(): number {
    return this.items.length - this._head
  }

  get isEmpty(): boolean {
    return this.items.length - this._head === 0
  }

  get capacity(): number | undefined {
    return this._capacity
  }

  clear(): void {
    this.items.length = 0
    this._head = 0
    const producers = this.waitingProducers.splice(0)
    for (const resolver of producers) {
      resolver()
    }
  }

  toArray(): T[] {
    return [...this.items.slice(this._head)]
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = this._head; i < this.items.length; i++) {
      callback(this.items[i]!, i - this._head)
    }
  }

  drain(count?: number): T[] {
    if (count === undefined) {
      const result = this.items.slice(this._head)
      this.items.length = 0
      this._head = 0
      const producers = this.waitingProducers.splice(0)
      for (const resolver of producers) {
        resolver()
      }
      return result
    }
    const actualCount = Math.min(count, this.items.length - this._head)
    const result = []
    for (let i = 0; i < actualCount; i++) {
      result.push(this.items[this._head + i]!)
    }
    this._head += actualCount
    this._maybeCompact()
    for (let i = 0; i < actualCount && this.waitingProducers.length - this._producerHead > 0; i++) {
      const resolver = this.waitingProducers[this._producerHead++]
      if (resolver) resolver()
    }
    return result
  }

  offer(value: T): boolean {
    if (this.closed) return false
    if (this._capacity !== undefined && this.items.length - this._head >= this._capacity) {
      return false
    }
    this.items.push(value)
    this.signalConsumer()
    return true
  }

  poll(): T | undefined {
    if (this.items.length - this._head === 0) return undefined
    const item = this.items[this._head++]!
    this._maybeCompact()
    this.signalProducer()
    return item
  }

  put(value: T): Promise<void> {
    if (this.closed) {
      return Promise.reject(new Error('Queue is closed'))
    }
    if (this._capacity === undefined || this.items.length - this._head < this._capacity) {
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
    if (this.items.length - this._head > 0) {
      const item = this.items[this._head++]!
      this._maybeCompact()
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
    this._consumerHead = 0
    const producers = this.waitingProducers.splice(0)
    for (const resolver of producers) {
      resolver()
    }
    this._producerHead = 0
  }

  get isClosed(): boolean {
    return this.closed
  }

  get isFull(): boolean {
    if (this._capacity === undefined) return false
    return this.items.length - this._head >= this._capacity
  }

  get remainingCapacity(): number | undefined {
    if (this._capacity === undefined) return undefined
    return this._capacity - (this.items.length - this._head)
  }

  contains(value: T): boolean {
    for (let i = this._head; i < this.items.length; i++) {
      if (this.items[i] === value) return true
    }
    return false
  }

  remove(value: T): boolean {
    for (let i = this._head; i < this.items.length; i++) {
      if (this.items[i] === value) {
        this.items.splice(i, 1)
        if (i <= this._head) {
          this._head = Math.max(0, this._head - 1)
        }
        this.signalProducer()
        return true
      }
    }
    return false
  }

  static fromArray<U>(arr: U[], options?: ConcurrentQueueOptions): ConcurrentQueue<U> {
    const queue = new ConcurrentQueue<U>(options)
    for (const item of arr) {
      queue.enqueue(item)
    }
    return queue
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${ConcurrentQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }


  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'ConcurrentQueue', size: this.size, items: this.toArray() }
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

  reverse(): T[] {
    return this.toArray().reverse()
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

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }


  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }
}

export type { ConcurrentQueueOptions } from './types.js'
