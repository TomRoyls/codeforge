import type { DequeArrayOptions } from './types.js'
import { DEFAULT_DEQUE_CAPACITY } from './types.js'

const GROWTH_FACTOR = 2

export class DequeArray<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private _capacity: number

  constructor(initialCapacity?: number)
  constructor(options?: Partial<DequeArrayOptions>)
  constructor(initialCapacityOrOptions?: number | Partial<DequeArrayOptions>) {
    if (typeof initialCapacityOrOptions === 'number') {
      this._capacity = Math.max(1, initialCapacityOrOptions)
    } else if (initialCapacityOrOptions && typeof initialCapacityOrOptions === 'object') {
      this._capacity = Math.max(1, initialCapacityOrOptions.initialCapacity ?? DEFAULT_DEQUE_CAPACITY)
    } else {
      this._capacity = DEFAULT_DEQUE_CAPACITY
    }
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private grow(): void {
    const newCapacity = this._capacity * GROWTH_FACTOR
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  pushFront(item: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = item
    this._size++
  }

  pushBack(item: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return item
  }

  popBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const item = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return item
  }

  peekFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]
  }

  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  private toPhysicalIndex(logicalIndex: number): number {
    return (this.head + logicalIndex) % this._capacity
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this.buffer[this.toPhysicalIndex(index)]
  }

  set(index: number, item: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds for deque of size ${this._size}`)
    }
    this.buffer[this.toPhysicalIndex(index)] = item
  }

  insert(index: number, item: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds for insert on deque of size ${this._size}`)
    }
    if (index === 0) {
      this.pushFront(item)
      return
    }
    if (index === this._size) {
      this.pushBack(item)
      return
    }
    if (this._size === this._capacity) {
      this.grow()
    }
    if (index < this._size / 2) {
      this.head = (this.head - 1 + this._capacity) % this._capacity
      for (let i = 0; i < index; i++) {
        this.buffer[(this.head + i) % this._capacity] = this.buffer[(this.head + i + 1) % this._capacity]
      }
      this.buffer[this.toPhysicalIndex(index)] = item
    } else {
      for (let i = this._size; i > index; i--) {
        this.buffer[this.toPhysicalIndex(i)] = this.buffer[this.toPhysicalIndex(i - 1)]
      }
      this.buffer[this.toPhysicalIndex(index)] = item
      this.tail = (this.tail + 1) % this._capacity
    }
    this._size++
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    if (index === 0) {
      return this.popFront()
    }
    if (index === this._size - 1) {
      return this.popBack()
    }
    const item = this.buffer[this.toPhysicalIndex(index)]
    if (index < this._size / 2) {
      for (let i = index; i > 0; i--) {
        this.buffer[this.toPhysicalIndex(i)] = this.buffer[this.toPhysicalIndex(i - 1)]
      }
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
    } else {
      for (let i = index; i < this._size - 1; i++) {
        this.buffer[this.toPhysicalIndex(i)] = this.buffer[this.toPhysicalIndex(i + 1)]
      }
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      this.buffer[this.tail] = undefined
    }
    this._size--
    return item
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[this.toPhysicalIndex(i)] === item) {
        return i
      }
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[this.toPhysicalIndex(i)] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        callback(item, i)
      }
    }
  }

  map<U>(callback: (item: T, index: number) => U): DequeArray<U> {
    const result = new DequeArray<U>(this._size)
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        result.pushBack(callback(item, i))
      }
    }
    return result
  }

  filter(predicate: (item: T, index: number) => boolean): DequeArray<T> {
    const result = new DequeArray<T>(this._size)
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined && predicate(item, i)) {
        result.pushBack(item)
      }
    }
    return result
  }

  reverse(): void {
    for (let i = 0; i < Math.floor(this._size / 2); i++) {
      const left = this.toPhysicalIndex(i)
      const right = this.toPhysicalIndex(this._size - 1 - i)
      const temp = this.buffer[left]
      this.buffer[left] = this.buffer[right]
      this.buffer[right] = temp
    }
  }

  slice(start?: number, end?: number): T[] {
    const s = start ?? 0
    const e = end ?? this._size
    const clampedStart = Math.max(0, s < 0 ? this._size + s : s)
    const clampedEnd = Math.min(this._size, e < 0 ? this._size + e : e)
    const result: T[] = []
    for (let i = clampedStart; i < clampedEnd; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  concat(other: DequeArray<T>): DequeArray<T> {
    const result = new DequeArray<T>(this._size + other.size())
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        result.pushBack(item)
      }
    }
    other.forEach((item) => {
      result.pushBack(item)
    })
    return result
  }

  clone(): DequeArray<T> {
    const result = new DequeArray<T>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        result.pushBack(item)
      }
    }
    return result
  }

  capacity(): number {
    return this._capacity
  }

  drain(): T[] {
    const result = this.toArray()
    this.clear()
    return result
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        yield item
      }
    }
  }

  static fromArray<T>(items: T[]): DequeArray<T> {
    const deque = new DequeArray<T>(items.length || DEFAULT_DEQUE_CAPACITY)
    for (const item of items) {
      deque.pushBack(item)
    }
    return deque
  }
}

export { DEFAULT_DEQUE_CAPACITY } from './types.js'
export type { DequeArrayOptions } from './types.js'
