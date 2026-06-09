import type { ArrayDequeOptions } from './types.js'

export class ArrayDeque<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number
  private tail: number
  private _size: number
  private _capacity: number

  constructor(options?: ArrayDequeOptions) {
    this._capacity = Math.max(1, options?.initialCapacity ?? 16)
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  private grow(): void {
    const newCapacity = this._capacity * 2
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  pushFront(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = value
    this._size++
  }

  pushBack(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  enqueue(value: T): void {
    this.pushBack(value)
  }

  popFront(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot popFront from empty deque')
    }
    const value = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value as T
  }

  dequeue(): T {
    return this.popFront()
  }

  popBack(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot popBack from empty deque')
    }
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return value as T
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  peek(): T | undefined {
    return this.front()
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.buffer[(this.head + index) % this._capacity] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.buffer[(this.head + index) % this._capacity] = value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get capacity(): number {
    return this._capacity
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      result[i] = this.buffer[(this.head + i) % this._capacity] as T
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) % this._capacity] as T, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.buffer[(this.head + i) % this._capacity] as T
    }
  }

  static fromArray<U>(arr: U[]): ArrayDeque<U> {
    const deque = new ArrayDeque<U>({ initialCapacity: Math.max(16, arr.length) })
    for (const item of arr) {
      deque.pushBack(item)
    }
    return deque
  }

toString(): string {
    return `${ArrayDeque}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ArrayDeque', size: this.size, items: this.toArray() }
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
}

export type { ArrayDequeOptions

} from './types.js'
