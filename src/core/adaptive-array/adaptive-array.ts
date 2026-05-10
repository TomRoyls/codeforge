import type { AdaptiveArrayOptions, AdaptiveArrayStatistics, GrowthStrategy } from './types.js'
import { DEFAULT_ADAPTIVE_ARRAY_OPTIONS } from './types.js'

export class AdaptiveArray<T = unknown> {
  private data: (T | undefined)[]
  private _size = 0
  private options: AdaptiveArrayOptions
  private stats = {
    resizeCount: 0,
    copyCount: 0,
    totalElementsMoved: 0,
    growthCount: 0,
    shrinkCount: 0,
  }
  private fibPrev = 1
  private fibCurr = 1

  constructor(options?: Partial<AdaptiveArrayOptions>) {
    this.options = { ...DEFAULT_ADAPTIVE_ARRAY_OPTIONS, ...options }
    this.data = new Array(this.options.initialCapacity)
  }

  push(value: T): void {
    if (this._size >= this.data.length) {
      this.grow()
    }
    this.data[this._size] = value
    this._size++
  }

  pop(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this._size--
    const value = this.data[this._size]!
    this.data[this._size] = undefined
    this.maybeShrink()
    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this.data[index]!
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this._size) {
      return false
    }
    this.data[index] = value
    return true
  }

  insert(index: number, value: T): boolean {
    if (index < 0 || index > this._size) {
      return false
    }
    if (this._size >= this.data.length) {
      this.grow()
    }
    for (let i = this._size; i > index; i--) {
      this.data[i] = this.data[i - 1]!
    }
    this.data[index] = value
    this._size++
    return true
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    const value = this.data[index]!
    for (let i = index; i < this._size - 1; i++) {
      this.data[i] = this.data[i + 1]!
    }
    this._size--
    this.data[this._size] = undefined
    this.maybeShrink()
    return value
  }

  size(): number {
    return this._size
  }

  capacity(): number {
    return this.data.length
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.data[i] = undefined
    }
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[i]!)
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.data[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.data[i]!
    }
  }

  map<U>(callback: (value: T, index: number) => U): AdaptiveArray<U> {
    const result = new AdaptiveArray<U>({ initialCapacity: this._size, strategy: this.options.strategy, growthFactor: this.options.growthFactor, shrinkThreshold: this.options.shrinkThreshold })
    for (let i = 0; i < this._size; i++) {
      result.push(callback(this.data[i]!, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): AdaptiveArray<T> {
    const result = new AdaptiveArray<T>({ initialCapacity: this._size, strategy: this.options.strategy, growthFactor: this.options.growthFactor, shrinkThreshold: this.options.shrinkThreshold })
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.data[i]!, i)) {
        result.push(this.data[i]!)
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      acc = callback(acc, this.data[i]!, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.data[i]!, i)) {
        return this.data[i]!
      }
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.data[i]!, i)) {
        return i
      }
    }
    return -1
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.data[i] === value) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  lastIndexOf(value: T): number {
    for (let i = this._size - 1; i >= 0; i--) {
      if (this.data[i] === value) {
        return i
      }
    }
    return -1
  }

  slice(start?: number, end?: number): AdaptiveArray<T> {
    const s = start ?? 0
    const e = end ?? this._size
    const normalizedStart = s < 0 ? Math.max(0, this._size + s) : Math.min(s, this._size)
    const normalizedEnd = e < 0 ? Math.max(0, this._size + e) : Math.min(e, this._size)
    const result = new AdaptiveArray<T>({ initialCapacity: Math.max(1, normalizedEnd - normalizedStart), strategy: this.options.strategy, growthFactor: this.options.growthFactor, shrinkThreshold: this.options.shrinkThreshold })
    for (let i = normalizedStart; i < normalizedEnd; i++) {
      result.push(this.data[i]!)
    }
    return result
  }

  concat(...others: AdaptiveArray<T>[]): AdaptiveArray<T> {
    let totalSize = this._size
    for (const other of others) {
      totalSize += other.size()
    }
    const result = new AdaptiveArray<T>({ initialCapacity: Math.max(1, totalSize), strategy: this.options.strategy, growthFactor: this.options.growthFactor, shrinkThreshold: this.options.shrinkThreshold })
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[i]!)
    }
    for (const other of others) {
      for (let i = 0; i < other.size(); i++) {
        result.push(other.get(i)!)
      }
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): AdaptiveArray<T> {
    const normalizedStart = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const dc = deleteCount ?? (this._size - normalizedStart)
    const actualDeleteCount = Math.min(dc, this._size - normalizedStart)

    const removed = new AdaptiveArray<T>({ initialCapacity: Math.max(1, actualDeleteCount), strategy: this.options.strategy, growthFactor: this.options.growthFactor, shrinkThreshold: this.options.shrinkThreshold })
    for (let i = normalizedStart; i < normalizedStart + actualDeleteCount; i++) {
      removed.push(this.data[i]!)
    }

    const tailSize = this._size - normalizedStart - actualDeleteCount
    const newSize = normalizedStart + items.length + tailSize

    while (newSize > this.data.length) {
      this.grow()
    }

    if (tailSize > 0) {
      const srcStart = normalizedStart + actualDeleteCount
      const shift = items.length - actualDeleteCount
      if (shift >= 0) {
        for (let i = srcStart + tailSize - 1; i >= srcStart; i--) {
          this.data[i + shift] = this.data[i]!
        }
      } else {
        for (let i = srcStart; i < srcStart + tailSize; i++) {
          this.data[i + shift] = this.data[i]!
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      this.data[normalizedStart + i] = items[i]!
    }

    this._size = newSize
    for (let i = this._size; i < this.data.length; i++) {
      this.data[i] = undefined
    }

    this.maybeShrink()
    return removed
  }

  reverse(): AdaptiveArray<T> {
    let left = 0
    let right = this._size - 1
    while (left < right) {
      const tmp = this.data[left]!
      this.data[left] = this.data[right]!
      this.data[right] = tmp
      left++
      right--
    }
    return this
  }

  sort(compareFn?: (a: T, b: T) => number): AdaptiveArray<T> {
    const arr = this.toArray()
    arr.sort(compareFn)
    for (let i = 0; i < arr.length; i++) {
      this.data[i] = arr[i]!
    }
    return this
  }

  compact(): void {
    if (this._size < this.data.length) {
      const newData = new Array<T | undefined>(this._size)
      for (let i = 0; i < this._size; i++) {
        newData[i] = this.data[i]!
      }
      this.data = newData
      this.stats.resizeCount++
      this.stats.copyCount++
      this.stats.totalElementsMoved += this._size
    }
  }

  shrinkToFit(): void {
    if (this._size < this.data.length) {
      const newData = new Array<T | undefined>(Math.max(1, this._size))
      for (let i = 0; i < this._size; i++) {
        newData[i] = this.data[i]!
      }
      this.data = newData
      this.stats.resizeCount++
      this.stats.copyCount++
      this.stats.totalElementsMoved += this._size
    }
  }

  reserve(n: number): void {
    if (n > this.data.length) {
      const newData = new Array<T | undefined>(n)
      for (let i = 0; i < this._size; i++) {
        newData[i] = this.data[i]!
      }
      this.data = newData
      this.stats.resizeCount++
      this.stats.copyCount++
      this.stats.totalElementsMoved += this._size
    }
  }

  resize(n: number): void {
    if (n < 0) {
      return
    }
    if (n > this.data.length) {
      this.reserve(n)
    }
    if (n < this._size) {
      for (let i = n; i < this._size; i++) {
        this.data[i] = undefined
      }
      this._size = n
      this.maybeShrink()
    } else if (n > this._size) {
      this._size = n
    }
  }

  getStatistics(): AdaptiveArrayStatistics {
    return {
      resizeCount: this.stats.resizeCount,
      copyCount: this.stats.copyCount,
      totalElementsMoved: this.stats.totalElementsMoved,
      currentCapacity: this.data.length,
      currentSize: this._size,
      strategy: this.options.strategy,
      growthCount: this.stats.growthCount,
      shrinkCount: this.stats.shrinkCount,
    }
  }

  setStrategy(strategy: GrowthStrategy): void {
    this.options.strategy = strategy
    this.fibPrev = 1
    this.fibCurr = 1
  }

  getStrategy(): GrowthStrategy {
    return this.options.strategy
  }

  private grow(): void {
    let newCapacity: number
    switch (this.options.strategy) {
      case 'exponential':
        newCapacity = Math.max(1, Math.floor(this.data.length * this.options.growthFactor))
        if (newCapacity <= this.data.length) {
          newCapacity = this.data.length + 1
        }
        break
      case 'linear':
        newCapacity = this.data.length + Math.max(1, Math.floor(this.options.growthFactor))
        break
      case 'fibonacci': {
        const next = this.fibPrev + this.fibCurr
        this.fibPrev = this.fibCurr
        this.fibCurr = next
        newCapacity = Math.max(this.data.length + 1, this.fibCurr)
        break
      }
      case 'fixed':
        newCapacity = this.data.length + Math.max(1, Math.floor(this.options.growthFactor))
        break
      default:
        newCapacity = Math.max(1, Math.floor(this.data.length * this.options.growthFactor))
    }

    const newData = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newData[i] = this.data[i]!
    }
    this.data = newData
    this.stats.resizeCount++
    this.stats.copyCount++
    this.stats.growthCount++
    this.stats.totalElementsMoved += this._size
  }

  private maybeShrink(): void {
    const threshold = this.data.length * this.options.shrinkThreshold
    if (this._size < threshold && this.data.length > 1) {
      let newCapacity = Math.max(1, Math.floor(this.data.length / this.options.growthFactor))
      if (newCapacity < this._size) {
        newCapacity = this._size
      }
      if (newCapacity < this.data.length) {
        const newData = new Array<T | undefined>(newCapacity)
        for (let i = 0; i < this._size; i++) {
          newData[i] = this.data[i]!
        }
        this.data = newData
        this.stats.resizeCount++
        this.stats.copyCount++
        this.stats.shrinkCount++
        this.stats.totalElementsMoved += this._size
      }
    }
  }
}

export { DEFAULT_ADAPTIVE_ARRAY_OPTIONS } from './types.js'
export type { AdaptiveArrayOptions, AdaptiveArrayStatistics, GrowthStrategy } from './types.js'
