import type {
  SlidingAggregateOptions,
  SlidingAggregateStatistics,
} from './types.js'
import { DEFAULT_SLIDING_AGGREGATE_OPTIONS } from './types.js'

export class SlidingAggregate<T extends number = number> {
  private _windowSize: number
  private _aggregateFn: NonNullable<SlidingAggregateOptions['aggregateFn']>
  private buf: T[] = []
  private head = 0
  private tail = 0
  private count_ = 0
  private _valuesAdded: number = 0
  private _valuesEvicted: number = 0

  constructor(options: Partial<SlidingAggregateOptions> = {}) {
    const merged: SlidingAggregateOptions = {
      ...DEFAULT_SLIDING_AGGREGATE_OPTIONS,
      ...options,
    }
    if (
      !Number.isInteger(merged.windowSize) ||
      merged.windowSize < 1
    ) {
      throw new RangeError('windowSize must be a positive integer')
    }
    this._windowSize = merged.windowSize
    this._aggregateFn = merged.aggregateFn ?? 'sum'
    this.buf = new Array<T>(this._windowSize)
  }

  private circIndex(i: number): number {
    return ((i % this._windowSize) + this._windowSize) % this._windowSize
  }

  push(value: T): void {
    this._valuesAdded++
    if (this.count_ >= this._windowSize) {
      this.head = this.circIndex(this.head + 1)
      this.count_--
      this._valuesEvicted++
    }
    this.buf[this.circIndex(this.tail)] = value
    this.tail = this.circIndex(this.tail + 1)
    this.count_++
  }

  getAggregate(): T | number | undefined {
    switch (this._aggregateFn) {
      case 'sum':
        return this.getSum()
      case 'avg':
        return this.getAvg()
      case 'min':
        return this.getMin()
      case 'max':
        return this.getMax()
      case 'count':
        return this.getCount()
    }
  }

  getSum(): number {
    if (this.count_ === 0) return 0
    let sum = 0
    for (let i = 0; i < this.count_; i++) {
      sum += this.buf[this.circIndex(this.head + i)]!
    }
    return sum
  }

  getAvg(): number | undefined {
    if (this.count_ === 0) return undefined
    return this.getSum() / this.count_
  }

  getMin(): T | undefined {
    if (this.count_ === 0) return undefined
    let min = this.buf[this.circIndex(this.head)]!
    for (let i = 1; i < this.count_; i++) {
      const v = this.buf[this.circIndex(this.head + i)]!
      if (v < min) min = v
    }
    return min
  }

  getMax(): T | undefined {
    if (this.count_ === 0) return undefined
    let max = this.buf[this.circIndex(this.head)]!
    for (let i = 1; i < this.count_; i++) {
      const v = this.buf[this.circIndex(this.head + i)]!
      if (v > max) max = v
    }
    return max
  }

  getCount(): number {
    return this.count_
  }

  getWindow(): T[] {
    return this.toArray()
  }

  get size(): number {
    return this.count_
  }

  get windowSize(): number {
    return this._windowSize
  }

  get isEmpty(): boolean {
    return this.count_ === 0
  }

  clear(): void {
    this.buf = new Array<T>(this._windowSize)
    this.head = 0
    this.tail = 0
    this.count_ = 0
    this._valuesAdded = 0
    this._valuesEvicted = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count_; i++) {
      result.push(this.buf[this.circIndex(this.head + i)]!)
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.count_; i++) {
      callback(this.buf[this.circIndex(this.head + i)]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const count = this.count_
    const head = this.head
    const buf = this.buf
    const ws = this._windowSize
    return {
      next(): IteratorResult<T> {
        if (index < count) {
          const idx = ((head + index) % ws + ws) % ws
          index++
          return { value: buf[idx]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  setWindowSize(n: number): void {
    if (!Number.isInteger(n) || n < 1) {
      throw new RangeError('windowSize must be a positive integer')
    }
    const oldData = this.toArray()
    this._windowSize = n
    this.buf = new Array<T>(n)
    this.head = 0
    this.tail = 0
    this.count_ = 0
    const start = oldData.length > n ? oldData.length - n : 0
    for (let i = start; i < oldData.length; i++) {
      this.buf[this.tail] = oldData[i]!
      this.tail = this.circIndex(this.tail + 1)
      this.count_++
    }
  }

  reset(): void {
    this.buf = new Array<T>(this._windowSize)
    this.head = 0
    this.tail = 0
    this.count_ = 0
    this._valuesAdded = 0
    this._valuesEvicted = 0
  }

  getStatistics(): SlidingAggregateStatistics {
    return {
      valuesAdded: this._valuesAdded,
      valuesEvicted: this._valuesEvicted,
      windowSize: this._windowSize,
      currentSize: this.count_,
    }
  }
}

export type { SlidingAggregateOptions, SlidingAggregateStatistics } from './types.js'
