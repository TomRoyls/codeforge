import type { SlidingWindowMaxOptions } from './types.js'
import { defaultComparator } from './types.js'

interface DequeEntry<T> {
  value: T
  index: number
}

export class SlidingWindowMax<T = number> {
  private _windowSize: number
  private window: T[] = []
  private windowHead = 0
  private maxDeque: DequeEntry<T>[] = []
  private maxDequeHead = 0
  private minDeque: DequeEntry<T>[] = []
  private minDequeHead = 0
  private compare: (a: T, b: T) => number
  private _pushIndex: number = 0
  private history: T[] = []

  constructor(options?: SlidingWindowMaxOptions<T>) {
    this._windowSize = options?.windowSize ?? Infinity
    if (this._windowSize < 1 || !Number.isFinite(this._windowSize)) {
      if (options?.windowSize !== undefined && options.windowSize < 1) {
        throw new RangeError('windowSize must be >= 1')
      }
    }
    this.compare = options?.comparator ?? (defaultComparator as (a: T, b: T) => number)
  }

  private get windowLength(): number {
    return this.window.length - this.windowHead
  }

  push(value: T): void {
    const idx = this._pushIndex++
    this.history.push(value)

    while (
      this.maxDeque.length > this.maxDequeHead &&
      this.compare(this.maxDeque[this.maxDeque.length - 1]!.value, value) <= 0
    ) {
      this.maxDeque.pop()
    }
    this.maxDeque.push({ value, index: idx })

    while (
      this.minDeque.length > this.minDequeHead &&
      this.compare(this.minDeque[this.minDeque.length - 1]!.value, value) >= 0
    ) {
      this.minDeque.pop()
    }
    this.minDeque.push({ value, index: idx })

    this.window.push(value)

    if (this.windowLength > this._windowSize) {
      const evictIndex = idx - this._windowSize
      this.windowHead++
      while (
        this.maxDeque.length > this.maxDequeHead &&
        this.maxDeque[this.maxDequeHead]!.index <= evictIndex
      ) {
        this.maxDequeHead++
      }
      while (
        this.minDeque.length > this.minDequeHead &&
        this.minDeque[this.minDequeHead]!.index <= evictIndex
      ) {
        this.minDequeHead++
      }
    }
  }

  max(): T | undefined {
    if (this.maxDeque.length === this.maxDequeHead) return undefined
    return this.maxDeque[this.maxDequeHead]!.value
  }

  min(): T | undefined {
    if (this.minDeque.length === this.minDequeHead) return undefined
    return this.minDeque[this.minDequeHead]!.value
  }

  top(): T | undefined {
    return this.max()
  }

  get size(): number {
    return this.windowLength
  }

  get windowSize(): number {
    return this._windowSize
  }

  get isEmpty(): boolean {
    return this.windowLength === 0
  }

  clear(): void {
    this.window = []
    this.windowHead = 0
    this.maxDeque = []
    this.maxDequeHead = 0
    this.minDeque = []
    this.minDequeHead = 0
  }

  reset(): void {
    this.clear()
    this._pushIndex = 0
    this.history = []
  }

  toArray(): T[] {
    return this.window.slice(this.windowHead)
  }

  clone(): SlidingWindowMax<T> {
    const copy = new SlidingWindowMax<T>({
      windowSize: this._windowSize,
      comparator: this.compare,
    })
    copy.window = this.window.slice(this.windowHead)
    copy.maxDeque = this.maxDeque.slice(this.maxDequeHead).map((e) => ({ ...e }))
    copy.minDeque = this.minDeque.slice(this.minDequeHead).map((e) => ({ ...e }))
    copy._pushIndex = this._pushIndex
    copy.history = [...this.history]
    return copy
  }

  static fromArray<U>(arr: U[], options?: SlidingWindowMaxOptions<U>): SlidingWindowMax<U> {
    const sw = new SlidingWindowMax<U>(options)
    for (const val of arr) {
      sw.push(val)
    }
    return sw
  }

  allMaxima(): T[] {
    if (!Number.isFinite(this._windowSize)) return []
    return this.computeAllMaxima(this.history, this._windowSize)
  }

  private computeAllMaxima(arr: T[], k: number): T[] {
    if (arr.length === 0 || k <= 0) return []
    const result: T[] = []
    const deque: number[] = []
    let dequeHead = 0
    const effectiveK = Math.min(k, arr.length)

    for (let i = 0; i < arr.length; i++) {
      while (deque.length > dequeHead && this.compare(arr[deque[deque.length - 1]!]!, arr[i]!) <= 0) {
        deque.pop()
      }
      deque.push(i)
      while (deque.length > dequeHead && deque[dequeHead]! <= i - effectiveK) {
        dequeHead++
      }
      if (i >= effectiveK - 1) {
        result.push(arr[deque[dequeHead]!]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = this.windowHead; i < this.window.length; i++) {
      callback(this.window[i]!, i - this.windowHead)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = this.windowHead; i < this.window.length; i++) {
      yield this.window[i]!
    }
  }

  first(): T | undefined {
    return this.windowLength > 0 ? this.window[this.windowHead] : undefined
  }

  last(): T | undefined {
    return this.windowLength > 0 ? this.window[this.window.length - 1] : undefined
  }

  pushAll(values: Iterable<T>): void {
    for (const val of values) {
      this.push(val)
    }
  }

  toString(): string {
    return `SlidingWindowMax({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SlidingWindowMax', size: this.size, items: this.toArray() }
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

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
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

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }
}

export { defaultComparator } from './types.js'
export type { SlidingWindowMaxOptions } from './types.js'
