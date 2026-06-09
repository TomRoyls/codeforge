import type { Deque2Options } from './types.js'

export class Deque2<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number
  private tail: number
  private _size: number
  private _capacity: number

  constructor(options?: Deque2Options) {
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

  unshift(value: T): void {
    this.pushFront(value)
  }

  pushBack(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  push(value: T): void {
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

  shift(): T {
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

  pop(): T {
    return this.popBack()
  }

  peekFront(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  front(): T | undefined {
    return this.peekFront()
  }

  peekBack(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  back(): T | undefined {
    return this.peekBack()
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

  clone(): Deque2<T> {
    const copy = new Deque2<T>({ initialCapacity: this._capacity })
    for (let i = 0; i < this._size; i++) {
      copy.pushBack(this.buffer[(this.head + i) % this._capacity] as T)
    }
    return copy
  }

  static fromArray<U>(arr: U[]): Deque2<U> {
    const deque = new Deque2<U>({ initialCapacity: Math.max(16, arr.length) })
    for (const item of arr) {
      deque.pushBack(item)
    }
    return deque
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

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === value) return i
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`)
    }
    if (index === 0) {
      this.pushFront(value)
      return
    }
    if (index === this._size) {
      this.pushBack(value)
      return
    }
    if (this._size === this._capacity) this.grow()
    if (index <= this._size / 2) {
      this.head = (this.head - 1 + this._capacity) % this._capacity
      for (let i = 0; i < index; i++) {
        const from = (this.head + i + 1) % this._capacity
        const to = (this.head + i) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
    } else {
      for (let i = this._size; i > index; i--) {
        const from = (this.head + i - 1) % this._capacity
        const to = (this.head + i) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
      this.tail = (this.tail + 1) % this._capacity
    }
    this.buffer[(this.head + index) % this._capacity] = value
    this._size++
  }

  removeAt(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const value = this.buffer[(this.head + index) % this._capacity] as T
    if (index === 0) {
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
    } else if (index === this._size - 1) {
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      this.buffer[this.tail] = undefined
    } else if (index < this._size / 2) {
      for (let i = index; i > 0; i--) {
        const to = (this.head + i) % this._capacity
        const from = (this.head + i - 1) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
    } else {
      for (let i = index; i < this._size - 1; i++) {
        const to = (this.head + i) % this._capacity
        const from = (this.head + i + 1) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      this.buffer[this.tail] = undefined
    }
    this._size--
    return value
  }

  rotate(n: number): void {
    if (this._size <= 1) return
    const effective = ((n % this._size) + this._size) % this._size
    if (effective === 0) return
    this.reverseRange(0, effective - 1)
    this.reverseRange(effective, this._size - 1)
    this.reverseRange(0, this._size - 1)
  }

  private reverseRange(lo: number, hi: number): void {
    while (lo < hi) {
      const a = (this.head + lo) % this._capacity
      const b = (this.head + hi) % this._capacity
      const tmp = this.buffer[a]
      this.buffer[a] = this.buffer[b]
      this.buffer[b] = tmp
      lo++
      hi--
    }
  }

  reverse(): void {
    if (this._size <= 1) return
    for (let i = 0; i < Math.floor(this._size / 2); i++) {
      const left = (this.head + i) % this._capacity
      const right = (this.head + this._size - 1 - i) % this._capacity
      const temp = this.buffer[left]
      this.buffer[left] = this.buffer[right]
      this.buffer[right] = temp
    }
  }

  slice(start: number = 0, end?: number): Deque2<T> {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const e = end === undefined ? this._size : (end < 0 ? Math.max(0, this._size + end) : Math.min(end, this._size))
    const result = new Deque2<T>({ initialCapacity: Math.max(16, e - s) })
    for (let i = s; i < e; i++) {
      result.pushBack(this.buffer[(this.head + i) % this._capacity] as T)
    }
    return result
  }

  concat(other: Deque2<T>): Deque2<T> {
    const result = new Deque2<T>({ initialCapacity: Math.max(16, this._size + other.size) })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(this.buffer[(this.head + i) % this._capacity] as T)
    }
    for (let i = 0; i < other.size; i++) {
      result.pushBack(other.get(i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): Deque2<T> {
    const result = new Deque2<T>()
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity] as T
      if (predicate(val, i)) {
        result.pushBack(val)
      }
    }
    return result
  }

  map<U>(fn: (value: T, index: number) => U): Deque2<U> {
    const result = new Deque2<U>({ initialCapacity: this._capacity })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(fn(this.buffer[(this.head + i) % this._capacity] as T, i))
    }
    return result
  }

  reduce<U>(fn: (accumulator: U, value: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._size; i++) {
      acc = fn(acc, this.buffer[(this.head + i) % this._capacity] as T, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity] as T
      if (predicate(val, i)) return val
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity] as T
      if (predicate(val, i)) return i
    }
    return -1
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      if (!predicate(this.buffer[(this.head + i) % this._capacity] as T, i)) return false
    }
    return true
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[(this.head + i) % this._capacity] as T, i)) return true
    }
    return false
  }

  join(separator: string = ','): string {
    if (this._size === 0) return ''
    let result = String(this.buffer[this.head])
    for (let i = 1; i < this._size; i++) {
      result += separator + String(this.buffer[(this.head + i) % this._capacity])
    }
    return result
  }

  toString(): string {
    return `${Deque2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'Deque2', size: this.size, items: this.toArray() }
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }
}

export type { Deque2Options } from './types.js'
