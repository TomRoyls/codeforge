import type {
  SlidingAggregateOptions,
  SlidingAggregateStatistics,
} from './types.js'
import { DEFAULT_SLIDING_AGGREGATE_OPTIONS } from './types.js'

export class SlidingAggregate<T extends number = number> {
  private _windowSize: number
  private _aggregateFn: NonNullable<SlidingAggregateOptions['aggregateFn']>
  private buffer: T[] = []
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
  }

  push(value: T): void {
    this.buffer.push(value)
    this._valuesAdded++
    if (this.buffer.length > this._windowSize) {
      this.buffer.shift()
      this._valuesEvicted++
    }
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
    if (this.buffer.length === 0) return 0
    let sum = 0
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i]!
    }
    return sum
  }

  getAvg(): number | undefined {
    if (this.buffer.length === 0) return undefined
    return this.getSum() / this.buffer.length
  }

  getMin(): T | undefined {
    if (this.buffer.length === 0) return undefined
    let min = this.buffer[0]!
    for (let i = 1; i < this.buffer.length; i++) {
      const v = this.buffer[i]!
      if (v < min) min = v
    }
    return min
  }

  getMax(): T | undefined {
    if (this.buffer.length === 0) return undefined
    let max = this.buffer[0]!
    for (let i = 1; i < this.buffer.length; i++) {
      const v = this.buffer[i]!
      if (v > max) max = v
    }
    return max
  }

  getCount(): number {
    return this.buffer.length
  }

  getWindow(): T[] {
    return [...this.buffer]
  }

  get size(): number {
    return this.buffer.length
  }

  get windowSize(): number {
    return this._windowSize
  }

  get isEmpty(): boolean {
    return this.buffer.length === 0
  }

  clear(): void {
    this.buffer = []
    this._valuesAdded = 0
    this._valuesEvicted = 0
  }

  toArray(): T[] {
    return [...this.buffer]
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.buffer.length; i++) {
      callback(this.buffer[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const buf = this.buffer
    return {
      next(): IteratorResult<T> {
        if (index < buf.length) {
          return { value: buf[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  setWindowSize(n: number): void {
    if (!Number.isInteger(n) || n < 1) {
      throw new RangeError('windowSize must be a positive integer')
    }
    this._windowSize = n
    while (this.buffer.length > this._windowSize) {
      this.buffer.shift()
    }
  }

  reset(): void {
    this.buffer = []
    this._valuesAdded = 0
    this._valuesEvicted = 0
  }

  getStatistics(): SlidingAggregateStatistics {
    return {
      valuesAdded: this._valuesAdded,
      valuesEvicted: this._valuesEvicted,
      windowSize: this._windowSize,
      currentSize: this.buffer.length,
    }
  }
}

export type { SlidingAggregateOptions, SlidingAggregateStatistics } from './types.js'
