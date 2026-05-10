import type { YFastTrieStats } from './types.js'

export class YFastTrie {
  private universeSize: number
  private logU: number
  private chunkSize: number
  private buckets: Map<number, number[]>
  private activeBuckets: number[]
  private _size: number
  private _min: number | undefined
  private _max: number | undefined

  constructor(universeSize: number) {
    this.universeSize = universeSize
    this.logU = Math.max(1, Math.ceil(Math.log2(universeSize)))
    this.chunkSize = this.logU
    this.buckets = new Map()
    this.activeBuckets = []
    this._size = 0
    this._min = undefined
    this._max = undefined
  }

  private getBucketIndex(x: number): number {
    return Math.floor(x / this.chunkSize)
  }

  private binarySearch(arr: number[], target: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (arr[mid]! < target) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private lowerBound(arr: number[], target: number): number {
    let lo = 0
    let hi = arr.length - 1
    let result = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (arr[mid]! >= target) {
        result = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  insert(x: number): void {
    if (x < 0 || x >= this.universeSize) return
    if (this.has(x)) return

    const bi = this.getBucketIndex(x)
    let bucket = this.buckets.get(bi)
    if (!bucket) {
      bucket = []
      this.buckets.set(bi, bucket)
      const idx = this.binarySearch(this.activeBuckets, bi)
      this.activeBuckets.splice(idx, 0, bi)
    }

    const pos = this.binarySearch(bucket, x)
    bucket.splice(pos, 0, x)

    this._size++
    if (this._min === undefined || x < this._min) this._min = x
    if (this._max === undefined || x > this._max) this._max = x
  }

  delete(x: number): boolean {
    if (x < 0 || x >= this.universeSize) return false

    const bi = this.getBucketIndex(x)
    const bucket = this.buckets.get(bi)
    if (!bucket) return false

    const pos = this.binarySearch(bucket, x)
    if (pos >= bucket.length || bucket[pos] !== x) return false

    bucket.splice(pos, 1)
    this._size--

    if (bucket.length === 0) {
      this.buckets.delete(bi)
      const abIdx = this.binarySearch(this.activeBuckets, bi)
      if (abIdx < this.activeBuckets.length && this.activeBuckets[abIdx] === bi) {
        this.activeBuckets.splice(abIdx, 1)
      }
    }

    if (this._size === 0) {
      this._min = undefined
      this._max = undefined
    } else {
      if (x === this._min) this._min = this.computeMin()
      if (x === this._max) this._max = this.computeMax()
    }

    return true
  }

  private computeMin(): number | undefined {
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (bucket && bucket.length > 0) return bucket[0]!
    }
    return undefined
  }

  private computeMax(): number | undefined {
    for (let i = this.activeBuckets.length - 1; i >= 0; i--) {
      const bi = this.activeBuckets[i]!
      const bucket = this.buckets.get(bi)
      if (bucket && bucket.length > 0) return bucket[bucket.length - 1]!
    }
    return undefined
  }

  has(x: number): boolean {
    if (x < 0 || x >= this.universeSize) return false
    const bi = this.getBucketIndex(x)
    const bucket = this.buckets.get(bi)
    if (!bucket) return false
    const pos = this.binarySearch(bucket, x)
    return pos < bucket.length && bucket[pos] === x
  }

  successor(x: number): number | undefined {
    if (this._size === 0) return undefined

    const bi = this.getBucketIndex(x)
    const bucket = this.buckets.get(bi)

    if (bucket && bucket.length > 0) {
      const pos = this.binarySearch(bucket, x)
      let succPos = pos
      if (succPos < bucket.length && bucket[succPos] === x) succPos++
      if (succPos < bucket.length) return bucket[succPos]!
    }

    const nextBiIdx = this.lowerBound(this.activeBuckets, bi + 1)
    if (nextBiIdx !== -1 && nextBiIdx < this.activeBuckets.length) {
      const nextBucket = this.buckets.get(this.activeBuckets[nextBiIdx]!)
      if (nextBucket && nextBucket.length > 0) return nextBucket[0]!
    }

    return undefined
  }

  predecessor(x: number): number | undefined {
    if (this._size === 0) return undefined

    const bi = this.getBucketIndex(x)
    const bucket = this.buckets.get(bi)

    if (bucket && bucket.length > 0) {
      const pos = this.binarySearch(bucket, x)
      if (pos > 0) return bucket[pos - 1]!
    }

    const idx = this.lowerBound(this.activeBuckets, bi)
    let prevIdx: number
    if (idx > 0) {
      prevIdx = idx - 1
    } else if (idx === -1) {
      prevIdx = this.activeBuckets.length - 1
    } else {
      prevIdx = -1
    }

    if (prevIdx >= 0 && prevIdx < this.activeBuckets.length) {
      const prevBucket = this.buckets.get(this.activeBuckets[prevIdx]!)
      if (prevBucket && prevBucket.length > 0) return prevBucket[prevBucket.length - 1]!
    }

    return undefined
  }

  get min(): number | undefined {
    return this._min
  }

  get max(): number | undefined {
    return this._max
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (const bi of this.activeBuckets) {
      const bucket = this.buckets.get(bi)
      if (bucket) {
        for (const val of bucket) {
          result.push(val)
        }
      }
    }
    return result
  }

  clear(): void {
    this.buckets.clear()
    this.activeBuckets.length = 0
    this._size = 0
    this._min = undefined
    this._max = undefined
  }

  clone(): YFastTrie {
    const cloned = new YFastTrie(this.universeSize)
    cloned._size = this._size
    cloned._min = this._min
    cloned._max = this._max
    cloned.activeBuckets = [...this.activeBuckets]
    for (const [key, value] of this.buckets) {
      cloned.buckets.set(key, [...value])
    }
    return cloned
  }

  static from(numbers: number[], universeSize: number): YFastTrie {
    const trie = new YFastTrie(universeSize)
    for (const n of numbers) {
      trie.insert(n)
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
}

export type { YFastTrieStats } from './types.js'
