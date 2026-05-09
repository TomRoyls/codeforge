import type { RadixBucket, RadixHeapEntry, RadixHeapOptions } from './types.js'
import { DEFAULT_RADIX_HEAP_OPTIONS } from './types.js'

export class RadixHeap {
  private buckets: RadixBucket[]
  private bucketRanges: { min: number; max: number }[]
  private _size: number = 0
  private lastPoppedKey: number = 0
  private keyMap: Map<number, number>
  private options: RadixHeapOptions

  constructor() {
    this.options = { ...DEFAULT_RADIX_HEAP_OPTIONS }
    const numBuckets = this.computeBucketCount()
    this.buckets = []
    this.bucketRanges = []
    for (let i = 0; i < numBuckets; i++) {
      this.buckets.push({ entries: [] })
    }
    this.initializeBucketRanges(0)
    this.keyMap = new Map()
  }

  push(key: number, value: number): void {
    if (key < this.lastPoppedKey) {
      throw new Error(`Key ${key} is less than last popped key ${this.lastPoppedKey}`)
    }
    if (!Number.isInteger(key)) {
      throw new Error('Key must be an integer')
    }
    if (key < 0) {
      throw new Error('Key must be non-negative')
    }
    const bucketIndex = this.findBucket(key)
    this.buckets[bucketIndex]!.entries.push({ key, value })
    this.keyMap.set(key, value)
    this._size++
  }

  pop(): RadixHeapEntry | undefined {
    if (this._size === 0) {
      return undefined
    }
    const bucketIndex = this.findFirstNonEmptyBucket()
    if (bucketIndex === -1) {
      return undefined
    }
    if (bucketIndex === 0) {
      const entry = this.buckets[0]!.entries.pop()!
      this.keyMap.delete(entry.key)
      this.lastPoppedKey = entry.key
      this._size--
      return entry
    }
    const entries = this.buckets[bucketIndex]!.entries
    let minIdx = 0
    for (let i = 1; i < entries.length; i++) {
      if (entries[i]!.key < entries[minIdx]!.key) {
        minIdx = i
      }
    }
    const minEntry = entries[minIdx]!
    entries[minIdx]! = entries[entries.length - 1]!
    entries.pop()
    this.keyMap.delete(minEntry.key)
    this.lastPoppedKey = minEntry.key
    this._size--
    if (entries.length === 0) {
      this.redistribute(bucketIndex)
    } else {
      this.redistribute(bucketIndex)
    }
    return minEntry
  }

  peek(): RadixHeapEntry | undefined {
    if (this._size === 0) {
      return undefined
    }
    const savedLastKey = this.lastPoppedKey
    const savedSize = this._size
    const savedKeyMap = new Map(this.keyMap)
    const savedBuckets = this.buckets.map((b) => ({
      entries: b.entries.map((e) => ({ ...e })),
    }))
    const result = this.pop()
    this.lastPoppedKey = savedLastKey
    this._size = savedSize
    this.keyMap = savedKeyMap
    this.buckets = savedBuckets
    return result
  }

  update(key: number, value: number): void {
    if (!this.keyMap.has(key)) {
      return
    }
    this.keyMap.set(key, value)
    for (let i = 0; i < this.buckets.length; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        if (this.buckets[i]!.entries[j]!.key === key) {
          this.buckets[i]!.entries[j]!.value = value
          return
        }
      }
    }
  }

  has(key: number): boolean {
    return this.keyMap.has(key)
  }

  get(key: number): number | undefined {
    return this.keyMap.get(key)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this.buckets.length; i++) {
      this.buckets[i]!.entries = []
    }
    this._size = 0
    this.lastPoppedKey = 0
    this.keyMap.clear()
    this.initializeBucketRanges(0)
  }

  keys(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        result.push(this.buckets[i]!.entries[j]!.key)
      }
    }
    return result
  }

  values(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        result.push(this.buckets[i]!.entries[j]!.value)
      }
    }
    return result
  }

  entries(): [number, number][] {
    const result: [number, number][] = []
    for (let i = 0; i < this.buckets.length; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        const entry = this.buckets[i]!.entries[j]!
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  toArray(): RadixHeapEntry[] {
    const result: RadixHeapEntry[] = []
    const savedLastKey = this.lastPoppedKey
    const savedSize = this._size
    const savedKeyMap = new Map(this.keyMap)
    const savedBuckets = this.buckets.map((b) => ({
      entries: b.entries.map((e) => ({ ...e })),
    }))
    while (this._size > 0) {
      const entry = this.pop()
      if (entry) {
        result.push(entry)
      }
    }
    this.lastPoppedKey = savedLastKey
    this._size = savedSize
    this.keyMap = savedKeyMap
    this.buckets = savedBuckets
    return result
  }

  clone(): RadixHeap {
    const cloned = new RadixHeap()
    cloned._size = this._size
    cloned.lastPoppedKey = this.lastPoppedKey
    cloned.keyMap = new Map(this.keyMap)
    cloned.buckets = this.buckets.map((b) => ({
      entries: b.entries.map((e) => ({ ...e })),
    }))
    cloned.bucketRanges = this.bucketRanges.map((r) => ({ ...r }))
    return cloned
  }

  minKey(): number | undefined {
    if (this._size === 0) {
      return undefined
    }
    let min: number | undefined
    for (let i = 0; i < this.buckets.length; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        const key = this.buckets[i]!.entries[j]!.key
        if (min === undefined || key < min) {
          min = key
        }
      }
    }
    return min
  }

  maxKey(): number | undefined {
    if (this._size === 0) {
      return undefined
    }
    let max: number | undefined
    for (let i = 0; i < this.buckets.length; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        const key = this.buckets[i]!.entries[j]!.key
        if (max === undefined || key > max) {
          max = key
        }
      }
    }
    return max
  }

  drain(): RadixHeapEntry[] {
    const result: RadixHeapEntry[] = []
    while (this._size > 0) {
      const entry = this.pop()
      if (entry) {
        result.push(entry)
      }
    }
    return result
  }

  static fromEntries(entries: [number, number][]): RadixHeap {
    const heap = new RadixHeap()
    for (let i = 0; i < entries.length; i++) {
      heap.push(entries[i]![0], entries[i]![1])
    }
    return heap
  }

  private computeBucketCount(): number {
    return 33
  }

  private initializeBucketRanges(lastKey: number): void {
    this.bucketRanges = []
    let low = lastKey
    for (let i = 0; i < this.buckets.length; i++) {
      let high: number
      if (i === 0) {
        high = lastKey
      } else if (i === this.buckets.length - 1) {
        high = this.options.maxKey
      } else {
        const range = Math.pow(2, i - 1)
        high = lastKey + range - 1
        if (high < low) {
          high = this.options.maxKey
        }
      }
      this.bucketRanges.push({ min: low, max: high })
      low = high + 1
    }
  }

  private findBucket(key: number): number {
    const lastKey = this.lastPoppedKey
    if (key === lastKey) {
      return 0
    }
    const diff = key - lastKey
    const bucketIndex = 32 - Math.clz32(diff)
    if (bucketIndex >= this.buckets.length) {
      return this.buckets.length - 1
    }
    return bucketIndex
  }

  private findFirstNonEmptyBucket(): number {
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i]!.entries.length > 0) {
        return i
      }
    }
    return -1
  }

  private redistribute(bucketIndex: number): void {
    if (bucketIndex === 0) {
      return
    }
    const entries: RadixHeapEntry[] = []
    for (let i = 0; i <= bucketIndex; i++) {
      for (let j = 0; j < this.buckets[i]!.entries.length; j++) {
        entries.push(this.buckets[i]!.entries[j]!)
      }
      this.buckets[i]!.entries = []
    }
    const newLastKey = this.lastPoppedKey
    this.initializeBucketRanges(newLastKey)
    for (let i = 0; i < entries.length; i++) {
      const idx = this.findBucket(entries[i]!.key)
      this.buckets[idx]!.entries.push(entries[i]!)
    }
  }
}

export { DEFAULT_RADIX_HEAP_OPTIONS } from './types.js'
export type { RadixBucket, RadixHeapEntry, RadixHeapOptions } from './types.js'
