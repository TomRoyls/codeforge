import type { ResizableArrayOptions } from './types.js'

export class ResizableArray<T> {
  private buffer: (T | undefined)[]
  private _length: number = 0
  private _capacity: number
  private growthFactor: number
  private shrinkThreshold: number

  constructor(initialCapacity: number = 8, options?: ResizableArrayOptions) {
    this._capacity = Math.max(1, Math.floor(initialCapacity))
    this.growthFactor = options?.growthFactor ?? 2
    this.shrinkThreshold = options?.shrinkThreshold ?? 0.25
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private grow(): void {
    const newCapacity = Math.max(this._capacity + 1, Math.floor(this._capacity * this.growthFactor))
    this.resizeBuffer(newCapacity)
  }

  private shrink(): void {
    const newCapacity = Math.max(1, Math.floor(this._capacity / this.growthFactor))
    if (newCapacity < this._capacity) {
      this.resizeBuffer(newCapacity)
    }
  }

  private resizeBuffer(newCapacity: number): void {
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._length; i++) {
      newBuffer[i] = this.buffer[i]
    }
    this.buffer = newBuffer
    this._capacity = newCapacity
  }

  private checkShrink(): void {
    if (this._capacity > 1 && this._length / this._capacity < this.shrinkThreshold) {
      this.shrink()
    }
  }

  push(item: T): void {
    if (this._length >= this._capacity) {
      this.grow()
    }
    this.buffer[this._length] = item
    this._length++
  }

  pop(): T {
    if (this._length === 0) {
      throw new RangeError('Cannot pop from empty array')
    }
    this._length--
    const value = this.buffer[this._length]
    this.buffer[this._length] = undefined
    this.checkShrink()
    return value as T
  }

  get(index: number): T {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
    return this.buffer[index] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
    this.buffer[index] = value
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length}]`)
    }
    if (this._length >= this._capacity) {
      this.grow()
    }
    for (let i = this._length; i > index; i--) {
      this.buffer[i] = this.buffer[i - 1]
    }
    this.buffer[index] = value
    this._length++
  }

  removeAt(index: number): T {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
    const value = this.buffer[index] as T
    for (let i = index; i < this._length - 1; i++) {
      this.buffer[i] = this.buffer[i + 1]
    }
    this._length--
    this.buffer[this._length] = undefined
    this.checkShrink()
    return value
  }

  first(): T {
    if (this._length === 0) {
      throw new RangeError('Array is empty')
    }
    return this.buffer[0] as T
  }

  last(): T {
    if (this._length === 0) {
      throw new RangeError('Array is empty')
    }
    return this.buffer[this._length - 1] as T
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._length; i++) {
      if (this.buffer[i] === item) return i
    }
    return -1
  }

  lastIndexOf(item: T): number {
    for (let i = this._length - 1; i >= 0; i--) {
      if (this.buffer[i] === item) return i
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  slice(start?: number, end?: number): ResizableArray<T> {
    const len = this._length
    let s = start ?? 0
    let e = end ?? len
    if (s < 0) s = Math.max(0, len + s)
    if (e < 0) e = Math.max(0, len + e)
    s = Math.min(s, len)
    e = Math.min(e, len)
    const result = new ResizableArray<T>(Math.max(1, e - s), {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = s; i < e; i++) {
      result.push(this.buffer[i] as T)
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const len = this._length
    let s = start
    if (s < 0) s = Math.max(0, len + s)
    s = Math.min(s, len)
    const dc = deleteCount ?? (len - s)
    const actualDelete = Math.min(dc, len - s)
    const removed: T[] = []
    for (let i = 0; i < actualDelete; i++) {
      removed.push(this.buffer[s + i] as T)
    }
    const tailLen = len - s - actualDelete
    const newLen = len - actualDelete + items.length
    while (newLen > this._capacity) {
      this.grow()
    }
    if (items.length !== actualDelete) {
      const diff = items.length - actualDelete
      if (diff > 0) {
        for (let i = tailLen - 1; i >= 0; i--) {
          this.buffer[s + items.length + i] = this.buffer[s + actualDelete + i]
        }
      } else {
        for (let i = 0; i < tailLen; i++) {
          this.buffer[s + items.length + i] = this.buffer[s + actualDelete + i]
        }
      }
    }
    for (let i = 0; i < items.length; i++) {
      this.buffer[s + i] = items[i]
    }
    this._length = newLen
    if (this._length < len) {
      for (let i = this._length; i < len; i++) {
        this.buffer[i] = undefined
      }
      this.checkShrink()
    }
    return removed
  }

  reverse(): void {
    let left = 0
    let right = this._length - 1
    while (left < right) {
      const tmp = this.buffer[left]
      this.buffer[left] = this.buffer[right]
      this.buffer[right] = tmp
      left++
      right--
    }
  }

  sort(comparator?: (a: T, b: T) => number): void {
    const arr = this.toArray()
    arr.sort(comparator)
    for (let i = 0; i < arr.length; i++) {
      this.buffer[i] = arr[i]
    }
  }

  fill(value: T, start?: number, end?: number): void {
    const len = this._length
    let s = start ?? 0
    let e = end ?? len
    if (s < 0) s = Math.max(0, len + s)
    if (e < 0) e = Math.max(0, len + e)
    s = Math.min(s, len)
    e = Math.min(e, len)
    for (let i = s; i < e; i++) {
      this.buffer[i] = value
    }
  }

  map<U>(fn: (item: T, index: number) => U): ResizableArray<U> {
    const result = new ResizableArray<U>(Math.max(1, this._length))
    for (let i = 0; i < this._length; i++) {
      result.push(fn(this.buffer[i] as T, i))
    }
    return result
  }

  filter(fn: (item: T, index: number) => boolean): ResizableArray<T> {
    const result = new ResizableArray<T>(Math.max(1, this._length), {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) {
        result.push(this.buffer[i] as T)
      }
    }
    return result
  }

  reduce<U>(fn: (acc: U, item: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._length; i++) {
      acc = fn(acc, this.buffer[i] as T, i)
    }
    return acc
  }

  forEach(fn: (item: T, index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      fn(this.buffer[i] as T, i)
    }
  }

  find(fn: (item: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) {
        return this.buffer[i] as T
      }
    }
    return undefined
  }

  findIndex(fn: (item: T, index: number) => boolean): number {
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) {
        return i
      }
    }
    return -1
  }

  every(fn: (item: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._length; i++) {
      if (!fn(this.buffer[i] as T, i)) return false
    }
    return true
  }

  some(fn: (item: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) return true
    }
    return false
  }

  join(separator: string = ','): string {
    if (this._length === 0) return ''
    let result = String(this.buffer[0])
    for (let i = 1; i < this._length; i++) {
      result += separator + String(this.buffer[i])
    }
    return result
  }

  concat(...arrays: ResizableArray<T>[]): ResizableArray<T> {
    let totalLen = this._length
    for (const arr of arrays) {
      totalLen += arr.length
    }
    const result = new ResizableArray<T>(Math.max(1, totalLen), {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = 0; i < this._length; i++) {
      result.push(this.buffer[i] as T)
    }
    for (const arr of arrays) {
      for (let i = 0; i < arr.length; i++) {
        result.push(arr.get(i))
      }
    }
    return result
  }

  toArray(): T[] {
    const result: T[] = new Array<T>(this._length)
    for (let i = 0; i < this._length; i++) {
      result[i] = this.buffer[i] as T
    }
    return result
  }

  static fromArray<U>(arr: U[]): ResizableArray<U> {
    const result = new ResizableArray<U>(Math.max(1, arr.length))
    for (const item of arr) {
      result.push(item)
    }
    return result
  }

  get length(): number {
    return this._length
  }

  get capacity(): number {
    return this._capacity
  }

  get utilization(): number {
    return this._capacity === 0 ? 0 : this._length / this._capacity
  }

  trimToSize(): void {
    if (this._length === 0) {
      this.resizeBuffer(1)
    } else if (this._length < this._capacity) {
      this.resizeBuffer(this._length)
    }
  }

  ensureCapacity(min: number): void {
    if (min > this._capacity) {
      this.resizeBuffer(min)
    }
  }

  clear(): void {
    for (let i = 0; i < this._length; i++) {
      this.buffer[i] = undefined
    }
    this._length = 0
  }

  isEmpty(): boolean {
    return this._length === 0
  }

  clone(): ResizableArray<T> {
    const result = new ResizableArray<T>(this._capacity, {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = 0; i < this._length; i++) {
      result.push(this.buffer[i] as T)
    }
    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const length = this._length
    const buffer = this.buffer
    return {
      next(): IteratorResult<T> {
        if (index < length) {
          return { value: buffer[index++] as T, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  toString(): string {
    return `ResizableArray()`
  }

  toJSON() {
    return { type: 'ResizableArray', items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }
}
