import type { RingBufferOptions } from './types.js'

export class RingBuffer<T = unknown> {
  private buffer: (T | undefined)[]
  private _head: number
  private _tail: number
  private _size: number
  private _capacity: number

  constructor(optionsOrCapacity: number | RingBufferOptions) {
    const cap =
      typeof optionsOrCapacity === 'number'
        ? optionsOrCapacity
        : optionsOrCapacity.capacity
    if (!Number.isInteger(cap) || cap < 1) {
      throw new RangeError('Capacity must be a positive integer')
    }
    this._capacity = cap
    this.buffer = new Array<T | undefined>(this._capacity)
    this._head = 0
    this._tail = 0
    this._size = 0
  }

  get capacity(): number {
    return this._capacity
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get isFull(): boolean {
    return this._size === this._capacity
  }

  push(value: T): void {
    this.buffer[this._tail] = value
    this._tail = (this._tail + 1) % this._capacity
    if (this._size === this._capacity) {
      this._head = (this._head + 1) % this._capacity
    } else {
      this._size++
    }
  }

  pop(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot pop from empty buffer')
    }
    this._tail = (this._tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this._tail]
    this.buffer[this._tail] = undefined
    this._size--
    return value as T
  }

  shift(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot shift from empty buffer')
    }
    const value = this.buffer[this._head]
    this.buffer[this._head] = undefined
    this._head = (this._head + 1) % this._capacity
    this._size--
    return value as T
  }

  unshift(value: T): void {
    this._head = (this._head - 1 + this._capacity) % this._capacity
    this.buffer[this._head] = value
    if (this._size === this._capacity) {
      this._tail = (this._tail - 1 + this._capacity) % this._capacity
    } else {
      this._size++
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.buffer[(this._head + index) % this._capacity] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.buffer[(this._head + index) % this._capacity] = value
  }

  peek(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot peek from empty buffer')
    }
    return this.buffer[this._head] as T
  }

  peekBack(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot peekBack from empty buffer')
    }
    const idx = (this._tail - 1 + this._capacity) % this._capacity
    return this.buffer[idx] as T
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buffer[i] = undefined
    }
    this._head = 0
    this._tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this._head + i) % this._capacity] as T)
    }
    return result
  }

  forEach(callback: (value: T, index: number, buffer: RingBuffer<T>) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this._head + i) % this._capacity] as T, i, this)
    }
  }

  map<U>(callback: (value: T, index: number, buffer: RingBuffer<T>) => U): U[] {
    const result: U[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(
        callback(this.buffer[(this._head + i) % this._capacity] as T, i, this)
      )
    }
    return result
  }

  filter(predicate: (value: T, index: number, buffer: RingBuffer<T>) => boolean): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this._head + i) % this._capacity] as T
      if (predicate(val, i, this)) {
        result.push(val)
      }
    }
    return result
  }

  reduce<U>(
    callback: (accumulator: U, value: T, index: number, buffer: RingBuffer<T>) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      acc = callback(
        acc,
        this.buffer[(this._head + i) % this._capacity] as T,
        i,
        this
      )
    }
    return acc
  }

  resize(newCapacity: number): void {
    if (!Number.isInteger(newCapacity) || newCapacity < 1) {
      throw new RangeError('New capacity must be a positive integer')
    }
    const oldData = this.toArray()
    this._capacity = newCapacity
    this.buffer = new Array<T | undefined>(this._capacity)
    this._head = 0
    this._size = 0
    this._tail = 0
    const start = Math.max(0, oldData.length - newCapacity)
    for (let i = start; i < oldData.length; i++) {
      this.buffer[this._tail] = oldData[i]
      this._tail = (this._tail + 1) % this._capacity
      this._size++
    }
  }

  write(values: T[]): number {
    let written = 0
    for (const v of values) {
      this.push(v)
      written++
    }
    return written
  }

  read(count: number): T[] {
    if (count < 0) {
      throw new RangeError('Count must be non-negative')
    }
    const result: T[] = []
    const toRead = Math.min(count, this._size)
    for (let i = 0; i < toRead; i++) {
      result.push(this.shift())
    }
    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const buf = this
    return {
      next(): IteratorResult<T> {
        if (index >= buf._size) {
          return { done: true, value: undefined }
        }
        const value = buf.buffer[(buf._head + index) % buf._capacity] as T
        index++
        return { done: false, value }
      },
    }
  }

  toString(): string {
    return `RingBuffer({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RingBuffer', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }
}
