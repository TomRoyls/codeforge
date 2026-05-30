import type { SlidingWindowOptions, SlidingWindowStatistics } from './types.js'
import { DEFAULT_SLIDING_WINDOW_OPTIONS } from './types.js'

export class SlidingWindow<T = number> {
  private buf: T[] = []
  private head = 0
  private tail = 0
  private count_ = 0
  private _maxSize: number
  private sumValue = 0
  private currentMin: T | undefined
  private currentMax: T | undefined

  constructor(options?: Partial<SlidingWindowOptions>) {
    const opts: SlidingWindowOptions = { ...DEFAULT_SLIDING_WINDOW_OPTIONS, ...options }
    this._maxSize = opts.maxSize
    this.buf = new Array<T>(this._maxSize)
  }

  private circIndex(i: number): number {
    return ((i % this._maxSize) + this._maxSize) % this._maxSize
  }

  push(value: T): T | undefined {
    let evicted: T | undefined
    if (this.count_ >= this._maxSize) {
      evicted = this.buf[this.head]
      this.head = this.circIndex(this.head + 1)
      this.count_--
    }
    this.buf[this.circIndex(this.tail)] = value
    this.tail = this.circIndex(this.tail + 1)
    this.count_++
    this.updateStatsPush(value, evicted)
    return evicted
  }

  peek(): T | undefined {
    return this.count_ > 0 ? this.buf[this.head] : undefined
  }

  peekBack(): T | undefined {
    return this.count_ > 0 ? this.buf[this.circIndex(this.tail - 1)] : undefined
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count_) return undefined
    return this.buf[this.circIndex(this.head + index)]
  }

  size(): number {
    return this.count_
  }

  get maxSize(): number {
    return this._maxSize
  }

  isEmpty(): boolean {
    return this.count_ === 0
  }

  isFull(): boolean {
    return this.count_ >= this._maxSize
  }

  clear(): void {
    this.head = 0
    this.tail = 0
    this.count_ = 0
    this.sumValue = 0
    this.currentMin = undefined
    this.currentMax = undefined
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

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.count_; i++) {
      yield this.buf[this.circIndex(this.head + i)]!
    }
  }

  filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count_; i++) {
      const v = this.buf[this.circIndex(this.head + i)]!
      if (predicate(v, i)) {
        result.push(v)
      }
    }
    return result
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = []
    for (let i = 0; i < this.count_; i++) {
      result.push(callback(this.buf[this.circIndex(this.head + i)]!, i))
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this.count_; i++) {
      acc = callback(acc, this.buf[this.circIndex(this.head + i)]!, i)
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
    if (this.count_ === 0) return undefined
    return this.sumValue / this.count_
  }

  getStatistics(): SlidingWindowStatistics {
    return {
      size: this.count_,
      sum: this.sumValue,
      min: this.currentMin as number | undefined,
      max: this.currentMax as number | undefined,
      avg: this.avg,
    }
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.count_; i++) {
      if (this.buf[this.circIndex(this.head + i)] === value) return true
    }
    return false
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.count_; i++) {
      if (this.buf[this.circIndex(this.head + i)] === value) return i
    }
    return -1
  }

  lastIndexOf(value: T): number {
    for (let i = this.count_ - 1; i >= 0; i--) {
      if (this.buf[this.circIndex(this.head + i)] === value) return i
    }
    return -1
  }

  count(value: T): number {
    let c = 0
    for (let i = 0; i < this.count_; i++) {
      if (this.buf[this.circIndex(this.head + i)] === value) c++
    }
    return c
  }

  resize(newMaxSize: number): void {
    const oldData = this.toArray()
    this._maxSize = newMaxSize
    this.buf = new Array<T>(newMaxSize)
    this.head = 0
    this.tail = 0
    this.count_ = 0
    const start = oldData.length > newMaxSize ? oldData.length - newMaxSize : 0
    for (let i = start; i < oldData.length; i++) {
      const val = oldData[i]!
      this.buf[this.tail] = val
      this.tail = this.circIndex(this.tail + 1)
      this.count_++
    }
    this.currentMin = undefined
    this.currentMax = undefined
    this.sumValue = 0
    for (let i = 0; i < this.count_; i++) {
      const v = this.buf[this.circIndex(this.head + i)]!
      if (typeof v === 'number') this.sumValue += v
      if (this.currentMin === undefined || this.compare(v, this.currentMin) < 0) {
        this.currentMin = v
      }
      if (this.currentMax === undefined || this.compare(v, this.currentMax) > 0) {
        this.currentMax = v
      }
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

  private recomputeMinMax(): void {
    this.currentMin = undefined
    this.currentMax = undefined
    for (let i = 0; i < this.count_; i++) {
      const v = this.buf[this.circIndex(this.head + i)]!
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
