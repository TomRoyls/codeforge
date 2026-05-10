import type { CircularDequeOptions, CircularDequeStats } from './types.js'
import { DEFAULT_CIRCULAR_DEQUE_OPTIONS } from './types.js'

export class CircularDeque<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private _capacity: number

  constructor(options?: Partial<CircularDequeOptions>) {
    const opts = { ...DEFAULT_CIRCULAR_DEQUE_OPTIONS, ...options }
    this._capacity = Math.max(1, opts.initialCapacity)
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private grow(): void {
    const newCapacity = this._capacity * 2
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]!
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  pushFront(value: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = value
    this._size++
  }

  pushBack(value: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const value = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value
  }

  popBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]!
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  peekFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]!
  }

  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const index = (this.tail - 1 + this._capacity) % this._capacity
    return this.buffer[index]!
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this.buffer[(this.head + index) % this._capacity]!
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this._size) {
      return false
    }
    this.buffer[(this.head + index) % this._capacity] = value
    return true
  }

  insertAt(index: number, value: T): void {
    if (index <= 0) {
      this.pushFront(value)
      return
    }
    if (index >= this._size) {
      this.pushBack(value)
      return
    }
    if (this._size === this._capacity) {
      this.grow()
    }
    const insertIdx = (this.head + index) % this._capacity
    if (index <= this._size / 2) {
      const newHead = (this.head - 1 + this._capacity) % this._capacity
      for (let i = 0; i < index; i++) {
        const from = (this.head + i) % this._capacity
        const to = (from - 1 + this._capacity) % this._capacity
        this.buffer[to] = this.buffer[from]!
      }
      const writePos = (this.head + index - 1 + this._capacity) % this._capacity
      this.buffer[writePos] = value
      this.head = newHead
    } else {
      for (let i = this._size; i > index; i--) {
        const from = (this.head + i - 1) % this._capacity
        const to = (this.head + i) % this._capacity
        this.buffer[to] = this.buffer[from]!
      }
      this.buffer[insertIdx] = value
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
    const removeIdx = (this.head + index) % this._capacity
    const value = this.buffer[removeIdx]!
    if (index <= this._size / 2) {
      for (let i = index; i > 0; i--) {
        const to = (this.head + i) % this._capacity
        const from = (this.head + i - 1) % this._capacity
        this.buffer[to] = this.buffer[from]!
      }
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
    } else {
      for (let i = index; i < this._size - 1; i++) {
        const to = (this.head + i) % this._capacity
        const from = (this.head + i + 1) % this._capacity
        this.buffer[to] = this.buffer[from]!
      }
      const lastIdx = (this.head + this._size - 1) % this._capacity
      this.buffer[lastIdx] = undefined
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
    }
    this._size--
    return value
  }

  size(): number {
    return this._size
  }

  capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  clone(): CircularDeque<T> {
    const result = new CircularDeque<T>({ initialCapacity: this._capacity })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  static from<T>(items: Iterable<T>): CircularDeque<T> {
    const arr = Array.from(items)
    const deque = new CircularDeque<T>({ initialCapacity: Math.max(1, arr.length) })
    for (const item of arr) {
      deque.pushBack(item)
    }
    return deque
  }

  contains(value: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === value) {
        return true
      }
    }
    return false
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === value) {
        return i
      }
    }
    return -1
  }

  lastIndexOf(value: T): number {
    for (let i = this._size - 1; i >= 0; i--) {
      if (this.buffer[(this.head + i) % this._capacity] === value) {
        return i
      }
    }
    return -1
  }

  rotate(n: number): void {
    if (this._size <= 1) {
      return
    }
    const normalized = ((n % this._size) + this._size) % this._size
    if (normalized === 0) {
      return
    }
    const temp: T[] = []
    for (let i = 0; i < normalized; i++) {
      temp.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    for (let i = normalized; i < this._size; i++) {
      this.buffer[(this.head + i - normalized) % this._capacity] = this.buffer[(this.head + i) % this._capacity]!
    }
    for (let i = 0; i < normalized; i++) {
      this.buffer[(this.head + this._size - normalized + i) % this._capacity] = temp[i]!
    }
  }

  stats(): CircularDequeStats {
    return {
      capacity: this._capacity,
      size: this._size,
      isEmpty: this._size === 0,
      isFull: this._size === this._capacity,
      utilization: this._size / this._capacity,
    }
  }
}

export { DEFAULT_CIRCULAR_DEQUE_OPTIONS } from './types.js'
export type { CircularDequeOptions, CircularDequeStats } from './types.js'
