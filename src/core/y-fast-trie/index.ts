import type { YFastTrieOptions, YFastTrieStats } from './types.js'
import { DEFAULT_UNIVERSE_SIZE } from './types.js'

class Bucket {
  elements: number[] = []

  private bisect(value: number): number {
    let lo = 0
    let hi = this.elements.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.elements[mid]! < value) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  insert(value: number): boolean {
    const pos = this.bisect(value)
    if (pos < this.elements.length && this.elements[pos] === value) return false
    this.elements.splice(pos, 0, value)
    return true
  }

  delete(value: number): boolean {
    const pos = this.bisect(value)
    if (pos >= this.elements.length || this.elements[pos] !== value) return false
    this.elements.splice(pos, 1)
    return true
  }

  has(value: number): boolean {
    const pos = this.bisect(value)
    return pos < this.elements.length && this.elements[pos] === value
  }

  successor(value: number): number | undefined {
    const pos = this.bisect(value)
    let idx = pos
    if (idx < this.elements.length && this.elements[idx] === value) idx++
    return idx < this.elements.length ? this.elements[idx]! : undefined
  }

  predecessor(value: number): number | undefined {
    const pos = this.bisect(value)
    if (pos === 0) return undefined
    return this.elements[pos - 1]!
  }

  rank(value: number): number {
    return this.bisect(value)
  }

  select(index: number): number | undefined {
    if (index < 0 || index >= this.elements.length) return undefined
    return this.elements[index]!
  }

  get min(): number | undefined {
    return this.elements.length > 0 ? this.elements[0] : undefined
  }

  get max(): number | undefined {
    return this.elements.length > 0 ? this.elements[this.elements.length - 1] : undefined
  }

  get length(): number {
    return this.elements.length
  }
}

export class YFastTrie {
  private buckets: Map<number, Bucket>
  private activeBuckets: number[]
  private _size: number
  private _min: number | undefined
  private _max: number | undefined
  private readonly universeSize: number
  private readonly bucketSize: number

  constructor(options?: Partial<YFastTrieOptions>) {
    const size = options?.universeSize ?? DEFAULT_UNIVERSE_SIZE
    if (size < 2) {
      throw new RangeError('Universe size must be at least 2')
    }
    this.universeSize = size
    this.bucketSize = Math.max(1, Math.ceil(Math.log2(size)))
    this.buckets = new Map()
    this.activeBuckets = []
    this._size = 0
    this._min = undefined
    this._max = undefined
  }

  private getBucketIndex(value: number): number {
    return Math.floor(value / this.bucketSize)
  }

  private findActiveBucket(target: number): number {
    let lo = 0
    let hi = this.activeBuckets.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.activeBuckets[mid]! < target) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private getOrCreateBucket(bi: number): Bucket {
    let bucket = this.buckets.get(bi)
    if (!bucket) {
      bucket = new Bucket()
      this.buckets.set(bi, bucket)
      const idx = this.findActiveBucket(bi)
      this.activeBuckets.splice(idx, 0, bi)
    }
    return bucket
  }

  private removeBucketIfEmpty(bi: number): void {
    const bucket = this.buckets.get(bi)
    if (bucket && bucket.length === 0) {
      this.buckets.delete(bi)
      const idx = this.findActiveBucket(bi)
      if (idx < this.activeBuckets.length && this.activeBuckets[idx] === bi) {
        this.activeBuckets.splice(idx, 1)
      }
    }
  }

  private computeMin(): number | undefined {
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (bucket && bucket.length > 0) return bucket.min
    }
    return undefined
  }

  private computeMax(): number | undefined {
    for (let i = this.activeBuckets.length - 1; i >= 0; i--) {
      const bi = this.activeBuckets[i]!
      const bucket = this.buckets.get(bi)
      if (bucket && bucket.length > 0) return bucket.max
    }
    return undefined
  }

  insert(value: number): void {
    if (value < 0 || value >= this.universeSize) {
      throw new RangeError(
        `Value ${value} out of range [0, ${this.universeSize})`,
      )
    }
    if (this.has(value)) return

    const bi = this.getBucketIndex(value)
    const bucket = this.getOrCreateBucket(bi)
    bucket.insert(value)
    this._size++

    if (this._min === undefined || value < this._min) this._min = value
    if (this._max === undefined || value > this._max) this._max = value
  }

  delete(value: number): boolean {
    if (value < 0 || value >= this.universeSize) return false

    const bi = this.getBucketIndex(value)
    const bucket = this.buckets.get(bi)
    if (!bucket) return false

    if (!bucket.delete(value)) return false
    this._size--

    this.removeBucketIfEmpty(bi)

    if (this._size === 0) {
      this._min = undefined
      this._max = undefined
    } else {
      if (value === this._min) this._min = this.computeMin()
      if (value === this._max) this._max = this.computeMax()
    }

    return true
  }

  has(value: number): boolean {
    if (value < 0 || value >= this.universeSize) return false
    const bi = this.getBucketIndex(value)
    const bucket = this.buckets.get(bi)
    if (!bucket) return false
    return bucket.has(value)
  }

  contains(value: number): boolean {
    return this.has(value)
  }

  successor(value: number): number | undefined {
    if (this._size === 0) return undefined

    const bi = this.getBucketIndex(value)
    const bucket = this.buckets.get(bi)

    if (bucket && bucket.length > 0) {
      const s = bucket.successor(value)
      if (s !== undefined) return s
    }

    const nextIdx = this.findActiveBucket(bi + 1)
    if (nextIdx < this.activeBuckets.length) {
      const nextBucket = this.buckets.get(this.activeBuckets[nextIdx]!)
      if (nextBucket && nextBucket.length > 0) return nextBucket.min
    }

    return undefined
  }

  predecessor(value: number): number | undefined {
    if (this._size === 0) return undefined

    const bi = this.getBucketIndex(value)
    const bucket = this.buckets.get(bi)

    if (bucket && bucket.length > 0) {
      const p = bucket.predecessor(value)
      if (p !== undefined) return p
    }

    const idx = this.findActiveBucket(bi)
    const prevIdx = idx > 0 ? idx - 1 : -1

    if (prevIdx >= 0 && prevIdx < this.activeBuckets.length) {
      const prevBucket = this.buckets.get(this.activeBuckets[prevIdx]!)
      if (prevBucket && prevBucket.length > 0) return prevBucket.max
    }

    return undefined
  }

  min(): number | undefined {
    return this._min
  }

  max(): number | undefined {
    return this._max
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.buckets.clear()
    this.activeBuckets.length = 0
    this._size = 0
    this._min = undefined
    this._max = undefined
  }

  range(lo: number, hi: number): number[] {
    const result: number[] = []
    if (this._size === 0 || lo > hi) return result

    const startBi = this.getBucketIndex(lo)
    let idx = this.findActiveBucket(startBi)

    while (idx < this.activeBuckets.length) {
      const bi = this.activeBuckets[idx]!
      const bucket = this.buckets.get(bi)
      if (!bucket) { idx++; continue }

      if (bucket.min !== undefined && bucket.min > hi) break

      for (const el of bucket.elements) {
        if (el > hi) return result
        if (el >= lo) result.push(el)
      }
      idx++
    }

    return result
  }

  keys(): number[] {
    return this.toArray()
  }

  values(): number[] {
    return this.toArray()
  }

  forEach(callback: (value: number, index: number) => void): void {
    let index = 0
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (!bucket) continue
      for (const el of bucket.elements) {
        callback(el, index)
        index++
      }
    }
  }

  toArray(): number[] {
    const result: number[] = []
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (bucket) {
        for (const val of bucket.elements) {
          result.push(val)
        }
      }
    }
    return result
  }

  *[Symbol.iterator](): Iterator<number> {
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (bucket) {
        for (const el of bucket.elements) {
          yield el
        }
      }
    }
  }

  rank(value: number): number {
    if (value <= 0) return 0
    if (this._size === 0) return 0

    let count = 0
    const bi = this.getBucketIndex(value)

    for (const abi of this.activeBuckets) {
      if (abi >= bi) break
      const bucket = this.buckets.get(abi)
      if (bucket) count += bucket.length
    }

    const bucket = this.buckets.get(bi)
    if (bucket) {
      count += bucket.rank(value)
    } else if (this.activeBuckets.length > 0) {
      const lastActive = this.activeBuckets[this.activeBuckets.length - 1]!
      if (lastActive < bi) {
        count = this._size
      }
    }

    return count
  }

  select(index: number): number | undefined {
    if (index < 0 || index >= this._size) return undefined

    let count = 0
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (!bucket) continue
      if (count + bucket.length > index) {
        return bucket.select(index - count)
      }
      count += bucket.length
    }

    return undefined
  }

  clone(): YFastTrie {
    const cloned = new YFastTrie({ universeSize: this.universeSize })
    cloned._size = this._size
    cloned._min = this._min
    cloned._max = this._max
    cloned.activeBuckets = [...this.activeBuckets]
    for (const [key, bucket] of this.buckets) {
      const newBucket = new Bucket()
      newBucket.elements = [...bucket.elements]
      cloned.buckets.set(key, newBucket)
    }
    return cloned
  }

  static from(numbers: number[], universeSize: number): YFastTrie {
    const trie = new YFastTrie({ universeSize })
    for (const n of numbers) {
      if (n >= 0 && n < universeSize) {
        trie.insert(n)
      }
    }
    return trie
  }

  stats(): YFastTrieStats {
    let minBucketSize = Infinity
    let maxBucketSize = 0
    for (const [, bucket] of this.buckets) {
      if (bucket.length < minBucketSize) minBucketSize = bucket.length
      if (bucket.length > maxBucketSize) maxBucketSize = bucket.length
    }
    return {
      size: this._size,
      bucketCount: this.buckets.size,
      minBucketSize: this.buckets.size > 0 ? minBucketSize : 0,
      maxBucketSize: this.buckets.size > 0 ? maxBucketSize : 0,
    }
  }

  toJSON() {
    return { type: 'YFastTrie', items: this.toArray() }
  }

  toString(): string {
    return `YFastTrie({ size: ${this._size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'YFastTrie'
  }
}

export { DEFAULT_UNIVERSE_SIZE } from './types.js'
export type { YFastTrieOptions, YFastTrieStats } from './types.js'
