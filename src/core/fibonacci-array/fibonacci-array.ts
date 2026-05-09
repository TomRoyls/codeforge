import type { FibonacciArrayOptions, FibonacciArrayStats } from './types.js'
import { DEFAULT_FIBONACCI_ARRAY_OPTIONS } from './types.js'

const FIBONACCI_SIZES = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597]

function getFibSize(index: number): number {
  if (index < FIBONACCI_SIZES.length) return FIBONACCI_SIZES[index]!
  let a = FIBONACCI_SIZES[FIBONACCI_SIZES.length - 2]!
  let b = FIBONACCI_SIZES[FIBONACCI_SIZES.length - 1]!
  for (let i = FIBONACCI_SIZES.length; i <= index; i++) {
    const next = a + b
    a = b
    b = next
  }
  return b
}

export class FibonacciArray<T = unknown> {
  private buckets: T[][]
  private _length: number = 0
  private options: FibonacciArrayOptions

  constructor(options?: Partial<FibonacciArrayOptions>) {
    this.options = { ...DEFAULT_FIBONACCI_ARRAY_OPTIONS, ...options }
    const bucketCount = Math.max(1, Math.ceil(Math.log2(this.options.initialCapacity + 1)))
    this.buckets = []
    let remaining = this.options.initialCapacity
    for (let i = 0; i < bucketCount && remaining > 0; i++) {
      const size = Math.min(getFibSize(i), remaining)
      this.buckets.push(new Array<T>(size))
      remaining -= size
    }
    if (this.buckets.length === 0) {
      this.buckets.push(new Array<T>(getFibSize(0)))
    }
  }

  private get capacity(): number {
    let total = 0
    for (const bucket of this.buckets) {
      total += bucket.length
    }
    return total
  }

  private locateIndex(index: number): { bucketIdx: number; offset: number } {
    let remaining = index
    for (let i = 0; i < this.buckets.length; i++) {
      const bucketSize = this.buckets[i]!.length
      if (remaining < bucketSize) {
        return { bucketIdx: i, offset: remaining }
      }
      remaining -= bucketSize
    }
    return { bucketIdx: -1, offset: -1 }
  }

  private grow(): void {
    const nextIdx = this.buckets.length
    this.buckets.push(new Array<T>(getFibSize(nextIdx)))
  }

  private growUntilFit(): void {
    while (this._length >= this.capacity) {
      this.grow()
    }
  }

  push(value: T): void {
    this.growUntilFit()
    const { bucketIdx, offset } = this.locateIndex(this._length)
    if (bucketIdx >= 0) {
      this.buckets[bucketIdx]![offset] = value
    }
    this._length++
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined
    this._length--
    const { bucketIdx, offset } = this.locateIndex(this._length)
    if (bucketIdx < 0) return undefined
    const value = this.buckets[bucketIdx]![offset]
    this.buckets[bucketIdx]![offset] = undefined as T
    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const { bucketIdx, offset } = this.locateIndex(index)
    if (bucketIdx < 0) return undefined
    return this.buckets[bucketIdx]![offset]
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds for length ${this._length}`)
    }
    const { bucketIdx, offset } = this.locateIndex(index)
    if (bucketIdx >= 0) {
      this.buckets[bucketIdx]![offset] = value
    }
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError(`Index ${index} out of bounds for length ${this._length}`)
    }
    this.growUntilFit()
    for (let i = this._length; i > index; i--) {
      const { bucketIdx: toB, offset: toO } = this.locateIndex(i)
      const { bucketIdx: fromB, offset: fromO } = this.locateIndex(i - 1)
      if (toB >= 0 && fromB >= 0) {
        this.buckets[toB]![toO] = this.buckets[fromB]![fromO]!
      }
    }
    const { bucketIdx, offset } = this.locateIndex(index)
    if (bucketIdx >= 0) {
      this.buckets[bucketIdx]![offset] = value
    }
    this._length++
  }

  remove(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const { bucketIdx, offset } = this.locateIndex(index)
    if (bucketIdx < 0) return undefined
    const value = this.buckets[bucketIdx]![offset]
    for (let i = index; i < this._length - 1; i++) {
      const { bucketIdx: toB, offset: toO } = this.locateIndex(i)
      const { bucketIdx: fromB, offset: fromO } = this.locateIndex(i + 1)
      if (toB >= 0 && fromB >= 0) {
        this.buckets[toB]![toO] = this.buckets[fromB]![fromO]!
      }
    }
    this._length--
    const last = this.locateIndex(this._length)
    if (last.bucketIdx >= 0) {
      this.buckets[last.bucketIdx]![last.offset] = undefined as T
    }
    return value
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._length; i++) {
      if (this.get(i) === value) return i
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  get length(): number {
    return this._length
  }

  get isEmpty(): boolean {
    return this._length === 0
  }

  get isFull(): boolean {
    return this._length >= this.capacity
  }

  clear(): void {
    for (const bucket of this.buckets) {
      for (let i = 0; i < bucket.length; i++) {
        bucket[i] = undefined as T
      }
    }
    this._length = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined) result.push(v)
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined) callback(v, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): FibonacciArray<U> {
    const result = new FibonacciArray<U>({ initialCapacity: Math.max(this._length, 1) })
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined) result.push(callback(v, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): FibonacciArray<T> {
    const result = new FibonacciArray<T>({ initialCapacity: Math.max(this._length, 1) })
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined && predicate(v, i)) result.push(v)
    }
    return result
  }

  reduce<U>(callback: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined) acc = callback(acc, v, i)
    }
    return acc
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined) yield v
    }
  }

  clone(): FibonacciArray<T> {
    const result = new FibonacciArray<T>({ initialCapacity: Math.max(this._length, 1) })
    for (let i = 0; i < this._length; i++) {
      const v = this.get(i)
      if (v !== undefined) result.push(v)
    }
    return result
  }

  static from<T>(array: T[]): FibonacciArray<T> {
    const result = new FibonacciArray<T>({ initialCapacity: Math.max(array.length, 1) })
    for (const item of array) {
      result.push(item)
    }
    return result
  }

  getStats(): FibonacciArrayStats {
    return {
      length: this._length,
      capacity: this.capacity,
      bucketCount: this.buckets.length,
      utilizationRatio: this.capacity > 0 ? this._length / this.capacity : 0,
    }
  }
}

export { DEFAULT_FIBONACCI_ARRAY_OPTIONS } from './types.js'
export type { FibonacciArrayOptions, FibonacciArrayStats } from './types.js'
