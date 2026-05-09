export class CircularBuffer<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private _capacity: number

  constructor(capacity: number) {
    this._capacity = Math.max(1, capacity)
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private toPhysicalIndex(logicalIndex: number): number {
    return (this.head + logicalIndex) % this._capacity
  }

  push(item: T): T | undefined {
    let evicted: T | undefined
    if (this._size === this._capacity) {
      evicted = this.buffer[this.head]!
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
      this._size--
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this._capacity
    this._size++
    return evicted
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const item = this.buffer[this.tail]!
    this.buffer[this.tail] = undefined
    this._size--
    return item
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return item
  }

  unshift(item: T): T | undefined {
    let evicted: T | undefined
    if (this._size === this._capacity) {
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      evicted = this.buffer[this.tail]!
      this.buffer[this.tail] = undefined
      this._size--
    }
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = item
    this._size++
    return evicted
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.buffer[this.toPhysicalIndex(index)]
  }

  set(index: number, item: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds for buffer of size ${this._size}`)
    }
    this.buffer[this.toPhysicalIndex(index)] = item
  }

  peekFront(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  peekBack(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  available(): number {
    return this._capacity - this._size
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

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[this.toPhysicalIndex(i)] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        callback(item, i)
      }
    }
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[this.toPhysicalIndex(i)] === item) {
        return i
      }
    }
    return -1
  }

  contains(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  rotate(n: number): void {
    if (this._size === 0) return
    const normalized = ((n % this._size) + this._size) % this._size
    if (normalized === 0) return
    const items = this.toArray()
    const rotated = [...items.slice(normalized), ...items.slice(0, normalized)]
    this.clear()
    for (const item of rotated) {
      this.push(item)
    }
  }

  clone(): CircularBuffer<T> {
    const result = new CircularBuffer<T>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[this.toPhysicalIndex(i)]
      if (item !== undefined) {
        result.push(item)
      }
    }
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

  static fromArray<T>(arr: T[], capacity?: number): CircularBuffer<T> {
    const cap = capacity ?? arr.length
    const result = new CircularBuffer<T>(cap)
    for (const item of arr) {
      result.push(item)
    }
    return result
  }
}

export { DEFAULT_CIRCULAR_BUFFER_CAPACITY } from './types.js'
