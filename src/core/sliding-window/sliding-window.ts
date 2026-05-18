import type { SlidingWindowOptions, SlidingWindowStatistics } from './types.js'
import { DEFAULT_SLIDING_WINDOW_OPTIONS } from './types.js'

export class SlidingWindow<T = number> {
  private buffer: T[] = []
  private _maxSize: number
  private sumValue = 0
  private currentMin: T | undefined
  private currentMax: T | undefined

  constructor(options?: Partial<SlidingWindowOptions>) {
    const opts: SlidingWindowOptions = { ...DEFAULT_SLIDING_WINDOW_OPTIONS, ...options }
    this._maxSize = opts.maxSize
  }

  push(value: T): T | undefined {
    let evicted: T | undefined
    if (this.buffer.length >= this._maxSize) {
      evicted = this.buffer.shift()
    }
    this.buffer.push(value)
    this.updateStatsPush(value, evicted)
    return evicted
  }

  peek(): T | undefined {
    return this.buffer.length > 0 ? this.buffer[0] : undefined
  }

  peekBack(): T | undefined {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : undefined
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.buffer.length) return undefined
    return this.buffer[index]
  }

  size(): number {
    return this.buffer.length
  }

  get maxSize(): number {
    return this._maxSize
  }

  isEmpty(): boolean {
    return this.buffer.length === 0
  }

  isFull(): boolean {
    return this.buffer.length >= this._maxSize
  }

  clear(): void {
    this.buffer = []
    this.sumValue = 0
    this.currentMin = undefined
    this.currentMax = undefined
  }

  toArray(): T[] {
    return [...this.buffer]
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.buffer.length; i++) {
      callback(this.buffer[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.buffer.length; i++) {
      yield this.buffer[i]!
    }
  }

  filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = []
    for (let i = 0; i < this.buffer.length; i++) {
      if (predicate(this.buffer[i]!, i)) {
        result.push(this.buffer[i]!)
      }
    }
    return result
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = []
    for (let i = 0; i < this.buffer.length; i++) {
      result.push(callback(this.buffer[i]!, i))
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this.buffer.length; i++) {
      acc = callback(acc, this.buffer[i]!, i)
    }
    return acc
  }

  get sum(): number {
    return this.sumValue
  }

  get min(): T | undefined {
    return this.currentMin
  }

  get max(): T | undefined {
    return this.currentMax
  }

  get avg(): number | undefined {
    if (this.buffer.length === 0) return undefined
    return this.sumValue / this.buffer.length
  }

  getStatistics(): SlidingWindowStatistics {
    return {
      size: this.buffer.length,
      sum: this.sumValue,
      min: this.currentMin as number | undefined,
      max: this.currentMax as number | undefined,
      avg: this.avg,
    }
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === value) return true
    }
    return false
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === value) return i
    }
    return -1
  }

  lastIndexOf(value: T): number {
    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i] === value) return i
    }
    return -1
  }

  count(value: T): number {
    let c = 0
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === value) c++
    }
    return c
  }

  resize(newMaxSize: number): void {
    this._maxSize = newMaxSize
    while (this.buffer.length > this._maxSize) {
      const evicted = this.buffer.shift()!
      this.updateStatsEvict(evicted)
    }
  }

  private updateStatsPush(value: T, evicted: T | undefined): void {
    if (typeof value === 'number') {
      this.sumValue += value
      if (evicted !== undefined && typeof evicted === 'number') {
        this.sumValue -= evicted
      }
    }
    if (this.currentMin === undefined || this.compare(value, this.currentMin) < 0) {
      this.currentMin = value
    }
    if (this.currentMax === undefined || this.compare(value, this.currentMax) > 0) {
      this.currentMax = value
    }
    if (evicted !== undefined && (evicted === this.currentMin || evicted === this.currentMax)) {
      this.recomputeMinMax()
    }
  }

  private updateStatsEvict(evicted: T): void {
    if (typeof evicted === 'number') {
      this.sumValue -= evicted
    }
    if (evicted === this.currentMin || evicted === this.currentMax) {
      this.recomputeMinMax()
    }
  }

  private recomputeMinMax(): void {
    this.currentMin = undefined
    this.currentMax = undefined
    for (let i = 0; i < this.buffer.length; i++) {
      const v = this.buffer[i]!
      if (this.currentMin === undefined || this.compare(v, this.currentMin) < 0) {
        this.currentMin = v
      }
      if (this.currentMax === undefined || this.compare(v, this.currentMax) > 0) {
        this.currentMax = v
      }
    }
  }

  private compare(a: T, b: T): number {
    if (typeof a === 'number' && typeof b === 'number') return a - b
    const sa = String(a)
    const sb = String(b)
    return sa < sb ? -1 : sa > sb ? 1 : 0
  }
}

export { DEFAULT_SLIDING_WINDOW_OPTIONS } from './types.js'
export type { SlidingWindowOptions, SlidingWindowStatistics } from './types.js'
