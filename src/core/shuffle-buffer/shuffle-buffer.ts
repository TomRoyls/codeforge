import type { ShuffleBufferOptions, ShuffleBufferStatistics } from './types.js'
import { DEFAULT_SHUFFLE_BUFFER_OPTIONS } from './types.js'

export class ShuffleBuffer<T = unknown> {
  private readonly _capacity: number
  private readonly _buffer: (T | undefined)[]
  private _size = 0
  private stats: { pushes: number; pops: number; shuffles: number; samples: number; swaps: number; reverses: number }

  constructor(options?: Partial<ShuffleBufferOptions>) {
    const resolved = { ...DEFAULT_SHUFFLE_BUFFER_OPTIONS, ...options }
    if (resolved.capacity < 1) {
      throw new Error(`Capacity must be at least 1, got ${resolved.capacity}`)
    }
    if (!Number.isInteger(resolved.capacity)) {
      throw new Error(`Capacity must be an integer, got ${resolved.capacity}`)
    }
    this._capacity = resolved.capacity
    this._buffer = new Array<T | undefined>(this._capacity)
    this.stats = { pushes: 0, pops: 0, shuffles: 0, samples: 0, swaps: 0, reverses: 0 }
  }

  push(item: T): boolean {
    if (this._size >= this._capacity) {
      return false
    }
    this._buffer[this._size] = item
    this._size++
    this.stats.pushes++
    return true
  }

  shuffle(): void {
    for (let i = this._size - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = this._buffer[i]!
      this._buffer[i] = this._buffer[j]!
      this._buffer[j] = tmp
    }
    this.stats.shuffles++
  }

  sample(n: number): T[] {
    if (n < 0) {
      throw new Error(`Sample size must be non-negative, got ${n}`)
    }
    if (!Number.isInteger(n)) {
      throw new Error(`Sample size must be an integer, got ${n}`)
    }
    this.stats.samples++
    if (n === 0 || this._size === 0) {
      return []
    }
    const count = Math.min(n, this._size)
    const copy: T[] = []
    for (let i = 0; i < this._size; i++) {
      copy.push(this._buffer[i]!)
    }
    for (let i = copy.length - 1; i > copy.length - 1 - count; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = copy[i]!
      copy[i] = copy[j]!
      copy[j] = tmp
    }
    return copy.slice(copy.length - count)
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this._buffer[i]!)
    }
    return result
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this._buffer[i] = undefined
    }
    this._size = 0
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this._buffer[this._size - 1]
  }

  pop(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this._size--
    const item = this._buffer[this._size]!
    this._buffer[this._size] = undefined
    this.stats.pops++
    return item
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this._buffer[index]!
  }

  swap(i: number, j: number): boolean {
    if (i < 0 || i >= this._size || j < 0 || j >= this._size) {
      return false
    }
    const tmp = this._buffer[i]!
    this._buffer[i] = this._buffer[j]!
    this._buffer[j] = tmp
    this.stats.swaps++
    return true
  }

  reverse(): void {
    let left = 0
    let right = this._size - 1
    while (left < right) {
      const tmp = this._buffer[left]!
      this._buffer[left] = this._buffer[right]!
      this._buffer[right] = tmp
      left++
      right--
    }
    this.stats.reverses++
  }

  sort(comparator?: (a: T, b: T) => number): void {
    const slice = this.toArray()
    slice.sort(comparator)
    for (let i = 0; i < slice.length; i++) {
      this._buffer[i] = slice[i]
    }
  }

  get capacity(): number {
    return this._capacity
  }

  remaining(): number {
    return this._capacity - this._size
  }

  get isFull(): boolean {
    return this._size >= this._capacity
  }

  reset(): void {
    for (let i = 0; i < this._size; i++) {
      this._buffer[i] = undefined
    }
    this._size = 0
    this.stats = { pushes: 0, pops: 0, shuffles: 0, samples: 0, swaps: 0, reverses: 0 }
  }

  contains(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this._buffer[i] === item) {
        return true
      }
    }
    return false
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this._buffer[i] === item) {
        return i
      }
    }
    return -1
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this._buffer[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this._buffer[i]!
    }
  }

  getStatistics(): ShuffleBufferStatistics {
    return { ...this.stats }
  }
}

export type { ShuffleBufferOptions, ShuffleBufferStatistics } from './types.js'
export { DEFAULT_SHUFFLE_BUFFER_OPTIONS } from './types.js'
