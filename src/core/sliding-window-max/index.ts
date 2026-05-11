import type { SlidingWindowMaxOptions } from './types.js'
import { defaultComparator } from './types.js'

interface DequeEntry<T> {
  value: T
  index: number
}

export class SlidingWindowMax<T = number> {
  private _windowSize: number
  private window: T[] = []
  private maxDeque: DequeEntry<T>[] = []
  private minDeque: DequeEntry<T>[] = []
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

  push(value: T): void {
    const idx = this._pushIndex++
    this.history.push(value)

    while (
      this.maxDeque.length > 0 &&
      this.compare(this.maxDeque[this.maxDeque.length - 1]!.value, value) <= 0
    ) {
      this.maxDeque.pop()
    }
    this.maxDeque.push({ value, index: idx })

    while (
      this.minDeque.length > 0 &&
      this.compare(this.minDeque[this.minDeque.length - 1]!.value, value) >= 0
    ) {
      this.minDeque.pop()
    }
    this.minDeque.push({ value, index: idx })

    this.window.push(value)

    if (this.window.length > this._windowSize) {
      const evictIndex = idx - this._windowSize
      this.window.shift()
      while (
        this.maxDeque.length > 0 &&
        this.maxDeque[0]!.index <= evictIndex
      ) {
        this.maxDeque.shift()
      }
      while (
        this.minDeque.length > 0 &&
        this.minDeque[0]!.index <= evictIndex
      ) {
        this.minDeque.shift()
      }
    }
  }

  max(): T | undefined {
    if (this.maxDeque.length === 0) return undefined
    return this.maxDeque[0]!.value
  }

  min(): T | undefined {
    if (this.minDeque.length === 0) return undefined
    return this.minDeque[0]!.value
  }

  top(): T | undefined {
    return this.max()
  }

  get size(): number {
    return this.window.length
  }

  get windowSize(): number {
    return this._windowSize
  }

  get isEmpty(): boolean {
    return this.window.length === 0
  }

  clear(): void {
    this.window = []
    this.maxDeque = []
    this.minDeque = []
  }

  reset(): void {
    this.clear()
    this._pushIndex = 0
    this.history = []
  }

  toArray(): T[] {
    return [...this.window]
  }

  clone(): SlidingWindowMax<T> {
    const copy = new SlidingWindowMax<T>({
      windowSize: this._windowSize,
      comparator: this.compare,
    })
    copy.window = [...this.window]
    copy.maxDeque = this.maxDeque.map((e) => ({ ...e }))
    copy.minDeque = this.minDeque.map((e) => ({ ...e }))
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
    const effectiveK = Math.min(k, arr.length)

    for (let i = 0; i < arr.length; i++) {
      while (deque.length > 0 && this.compare(arr[deque[deque.length - 1]!]!, arr[i]!) <= 0) {
        deque.pop()
      }
      deque.push(i)
      while (deque.length > 0 && deque[0]! <= i - effectiveK) {
        deque.shift()
      }
      if (i >= effectiveK - 1) {
        result.push(arr[deque[0]!]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.window.length; i++) {
      callback(this.window[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const item of this.window) {
      yield item
    }
  }

  first(): T | undefined {
    return this.window[0]
  }

  last(): T | undefined {
    return this.window[this.window.length - 1]
  }

  pushAll(values: Iterable<T>): void {
    for (const val of values) {
      this.push(val)
    }
  }
}

export { defaultComparator } from './types.js'
export type { SlidingWindowMaxOptions } from './types.js'
