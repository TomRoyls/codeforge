import type { AdaptiveSetOptions } from './types.js'

type AdaptiveMode = 'array' | 'sorted' | 'hashed'

export class AdaptiveSet<T> {
  private data: T[]
  private hashedSet: Set<T> | null
  private sortedData: T[] | null
  private currentMode: AdaptiveMode
  private readonly sortedThreshold: number
  private readonly hashedThreshold: number
  private readonly compare: (a: T, b: T) => number

  constructor(thresholds?: { sorted?: number; hashed?: number }, options?: AdaptiveSetOptions)
  constructor(thresholds?: { sorted?: number; hashed?: number })
  constructor(thresholds?: { sorted?: number; hashed?: number }, options?: AdaptiveSetOptions) {
    const sorted = thresholds?.sorted ?? options?.threshold?.sorted ?? 16
    const hashed = thresholds?.hashed ?? options?.threshold?.hashed ?? 256
    this.sortedThreshold = sorted
    this.hashedThreshold = hashed
    this.data = []
    this.hashedSet = null
    this.sortedData = null
    this.currentMode = 'array'
    this.compare = (a: T, b: T): number => {
      if (typeof a === 'number' && typeof b === 'number') {
        if (Number.isNaN(a) && Number.isNaN(b)) return 0
        if (Number.isNaN(a)) return 1
        if (Number.isNaN(b)) return -1
        if (a < b) return -1
        if (a > b) return 1
        return 0
      }
      const sa = String(a)
      const sb = String(b)
      if (sa < sb) return -1
      if (sa > sb) return 1
      return 0
    }
  }

  get mode(): AdaptiveMode {
    return this.currentMode
  }

  add(value: T): this {
    if (this.currentMode === 'hashed') {
      if (!this.hashedSet!.has(value)) {
        this.hashedSet!.add(value)
      }
      return this
    }

    if (this.currentMode === 'sorted') {
      const idx = this.binarySearch(this.sortedData!, value)
      if (idx >= 0) return this
      const insertIdx = ~idx
      this.sortedData!.splice(insertIdx, 0, value)
      this.maybeUpgrade()
      return this
    }

    for (let i = 0; i < this.data.length; i++) {
      if (this.compare(this.data[i]!, value) === 0 && this.valuesEqual(this.data[i]!, value)) return this
    }
    this.data.push(value)
    this.maybeUpgrade()
    return this
  }

  delete(value: T): boolean {
    if (this.currentMode === 'hashed') {
      return this.hashedSet!.delete(value)
    }

    if (this.currentMode === 'sorted') {
      const idx = this.binarySearch(this.sortedData!, value)
      if (idx < 0) return false
      if (!this.valuesEqual(this.sortedData![idx]!, value)) return false
      this.sortedData!.splice(idx, 1)
      this.maybeDowngrade()
      return true
    }

    for (let i = 0; i < this.data.length; i++) {
      if (this.valuesEqual(this.data[i]!, value)) {
        this.data.splice(i, 1)
        return true
      }
    }
    return false
  }

  has(value: T): boolean {
    if (this.currentMode === 'hashed') {
      return this.hashedSet!.has(value)
    }

    if (this.currentMode === 'sorted') {
      const idx = this.binarySearch(this.sortedData!, value)
      if (idx < 0) return false
      return this.valuesEqual(this.sortedData![idx]!, value)
    }

    for (let i = 0; i < this.data.length; i++) {
      if (this.valuesEqual(this.data[i]!, value)) return true
    }
    return false
  }

  get size(): number {
    if (this.currentMode === 'hashed') return this.hashedSet!.size
    if (this.currentMode === 'sorted') return this.sortedData!.length
    return this.data.length
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.data = []
    this.sortedData = null
    this.hashedSet = null
    this.currentMode = 'array'
  }

  toArray(): T[] {
    if (this.currentMode === 'hashed') return Array.from(this.hashedSet!)
    if (this.currentMode === 'sorted') return [...this.sortedData!]
    return [...this.data]
  }

  values(): T[] {
    return this.toArray()
  }

  forEach(callback: (value: T, value2: T, set: AdaptiveSet<T>) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, arr[i]!, this)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      yield arr[i]!
    }
  }

  union(other: AdaptiveSet<T>): AdaptiveSet<T> {
    const result = new AdaptiveSet<T>({ sorted: this.sortedThreshold, hashed: this.hashedThreshold })
    this.forEach((v) => result.add(v))
    other.forEach((v) => result.add(v))
    return result
  }

  intersection(other: AdaptiveSet<T>): AdaptiveSet<T> {
    const result = new AdaptiveSet<T>({ sorted: this.sortedThreshold, hashed: this.hashedThreshold })
    const [smaller, larger] = this.size <= other.size ? [this, other] : [other, this]
    smaller.forEach((v) => {
      if (larger.has(v)) result.add(v)
    })
    return result
  }

  difference(other: AdaptiveSet<T>): AdaptiveSet<T> {
    const result = new AdaptiveSet<T>({ sorted: this.sortedThreshold, hashed: this.hashedThreshold })
    this.forEach((v) => {
      if (!other.has(v)) result.add(v)
    })
    return result
  }

  isSubsetOf(other: AdaptiveSet<T>): boolean {
    if (this.size > other.size) return false
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      if (!other.has(arr[i]!)) return false
    }
    return true
  }

  isSupersetOf(other: AdaptiveSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: AdaptiveSet<T>): boolean {
    if (this.size !== other.size) return false
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      if (!other.has(arr[i]!)) return false
    }
    return true
  }

  map<U>(fn: (value: T) => U): AdaptiveSet<U> {
    const result = new AdaptiveSet<U>({ sorted: this.sortedThreshold, hashed: this.hashedThreshold })
    this.forEach((v) => result.add(fn(v)))
    return result
  }

  filter(fn: (value: T) => boolean): AdaptiveSet<T> {
    const result = new AdaptiveSet<T>({ sorted: this.sortedThreshold, hashed: this.hashedThreshold })
    this.forEach((v) => {
      if (fn(v)) result.add(v)
    })
    return result
  }

  some(fn: (value: T) => boolean): boolean {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      if (fn(arr[i]!)) return true
    }
    return false
  }

  every(fn: (value: T) => boolean): boolean {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      if (!fn(arr[i]!)) return false
    }
    return true
  }

  get min(): T | undefined {
    if (this.size === 0) return undefined
    const arr = this.toArray()
    let min = arr[0]!
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i]!, min) < 0) min = arr[i]!
    }
    return min
  }

  get max(): T | undefined {
    if (this.size === 0) return undefined
    const arr = this.toArray()
    let max = arr[0]!
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i]!, max) > 0) max = arr[i]!
    }
    return max
  }

  private valuesEqual(a: T, b: T): boolean {
    if (typeof a === 'number' && typeof b === 'number') {
      return Number.isNaN(a) && Number.isNaN(b) || a === b
    }
    return a === b
  }

  private binarySearch(arr: T[], target: T): number {
    let lo = 0
    let hi = arr.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this.compare(arr[mid]!, target)
      if (cmp === 0) return mid
      if (cmp < 0) lo = mid + 1
      else hi = mid - 1
    }
    return ~lo
  }

  private maybeUpgrade(): void {
    const sz = this.currentMode === 'sorted' ? this.sortedData!.length : this.data.length
    if (this.currentMode === 'array' && sz >= this.sortedThreshold) {
      if (sz >= this.hashedThreshold) {
        this.upgradeToHashed(this.data)
      } else {
        this.upgradeToSorted(this.data)
      }
    } else if (this.currentMode === 'sorted' && sz >= this.hashedThreshold) {
      this.upgradeToHashedFromSorted()
    }
  }

  private maybeDowngrade(): void {
    if (this.currentMode === 'sorted' && this.sortedData!.length < this.sortedThreshold) {
      this.downgradeToArray()
    }
  }

  private upgradeToSorted(data: T[]): void {
    this.sortedData = [...data].sort(this.compare)
    this.data = []
    this.currentMode = 'sorted'
  }

  private upgradeToHashed(data: T[]): void {
    this.hashedSet = new Set(data)
    this.data = []
    this.currentMode = 'hashed'
  }

  private upgradeToHashedFromSorted(): void {
    this.hashedSet = new Set(this.sortedData!)
    this.sortedData = null
    this.currentMode = 'hashed'
  }

  private downgradeToArray(): void {
    this.data = [...this.sortedData!]
    this.sortedData = null
    this.currentMode = 'array'
  }
}

export type { AdaptiveSetOptions } from './types.js'
