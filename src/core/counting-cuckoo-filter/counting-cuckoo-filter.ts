import type { CountingCuckooFilterOptions, CountingCuckooFilterStatistics } from './types.js'
import { DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS } from './types.js'

interface BucketEntry {
  fingerprint: number
  count: number
}

export class CountingCuckooFilter<T = string> {
  private buckets: BucketEntry[][]
  private _bucketCount: number
  private _bucketSize: number
  private _maxKicks: number
  private _fingerprintSize: number
  private _capacity: number
  private _size: number = 0
  private _stats: CountingCuckooFilterStatistics

  constructor(options?: Partial<CountingCuckooFilterOptions>) {
    const opts: CountingCuckooFilterOptions = {
      ...DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS,
      ...options,
    }
    this._capacity = opts.capacity
    this._bucketSize = opts.bucketSize
    this._maxKicks = opts.maxKicks
    this._fingerprintSize = opts.fingerprintSize
    this._bucketCount = Math.ceil(opts.capacity / opts.bucketSize)
    this.buckets = []
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets.push([])
    }
    this._stats = {
      inserts: 0,
      deletes: 0,
      lookups: 0,
      relocations: 0,
      maxRelocations: 0,
      countQueries: 0,
      falsePositives: 0,
    }
  }

  insert(item: T): boolean {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)

    const existing1 = this.findEntry(i1, fp)
    if (existing1 !== null) {
      const entry = this.buckets[i1]![existing1]!
      entry.count++
      this._size++
      this._stats.inserts++
      return true
    }

    const existing2 = this.findEntry(i2, fp)
    if (existing2 !== null) {
      const entry = this.buckets[i2]![existing2]!
      entry.count++
      this._size++
      this._stats.inserts++
      return true
    }

    if (this.buckets[i1]!.length < this._bucketSize) {
      this.buckets[i1]!.push({ fingerprint: fp, count: 1 })
      this._size++
      this._stats.inserts++
      return true
    }
    if (this.buckets[i2]!.length < this._bucketSize) {
      this.buckets[i2]!.push({ fingerprint: fp, count: 1 })
      this._size++
      this._stats.inserts++
      return true
    }

    let currentIndex = i1
    let relocationCount = 0
    const displaced: BucketEntry = { fingerprint: fp, count: 1 }

    for (let n = 0; n < this._maxKicks; n++) {
      const bucket = this.buckets[currentIndex]!
      const slotIndex = n % bucket.length
      const evicted = bucket[slotIndex]!
      bucket[slotIndex] = { fingerprint: displaced.fingerprint, count: displaced.count }
      relocationCount++

      displaced.fingerprint = evicted.fingerprint
      displaced.count = evicted.count

      currentIndex = this.altIndex(currentIndex, displaced.fingerprint)

      const existingAlt = this.findEntry(currentIndex, displaced.fingerprint)
      if (existingAlt !== null) {
        const entry = this.buckets[currentIndex]![existingAlt]!
        entry.count += displaced.count
        this._size++
        this._stats.relocations += relocationCount
        if (relocationCount > this._stats.maxRelocations) {
          this._stats.maxRelocations = relocationCount
        }
        this._stats.inserts++
        return true
      }

      if (this.buckets[currentIndex]!.length < this._bucketSize) {
        this.buckets[currentIndex]!.push({ fingerprint: displaced.fingerprint, count: displaced.count })
        this._size++
        this._stats.relocations += relocationCount
        if (relocationCount > this._stats.maxRelocations) {
          this._stats.maxRelocations = relocationCount
        }
        this._stats.inserts++
        return true
      }
    }

    return false
  }

  delete(item: T): boolean {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)

    const idx1 = this.findEntry(i1, fp)
    if (idx1 !== null) {
      const entry = this.buckets[i1]![idx1]!
      entry.count--
      this._size--
      this._stats.deletes++
      if (entry.count <= 0) {
        this.buckets[i1]!.splice(idx1, 1)
      }
      return true
    }

    const idx2 = this.findEntry(i2, fp)
    if (idx2 !== null) {
      const entry = this.buckets[i2]![idx2]!
      entry.count--
      this._size--
      this._stats.deletes++
      if (entry.count <= 0) {
        this.buckets[i2]!.splice(idx2, 1)
      }
      return true
    }

    return false
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)
    this._stats.lookups++
    return this.findEntry(i1, fp) !== null || this.findEntry(i2, fp) !== null
  }

  count(item: T): number {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)
    this._stats.countQueries++

    const idx1 = this.findEntry(i1, fp)
    if (idx1 !== null) {
      return this.buckets[i1]![idx1]!.count
    }

    const idx2 = this.findEntry(i2, fp)
    if (idx2 !== null) {
      return this.buckets[i2]![idx2]!.count
    }

    return 0
  }

  clear(): void {
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets[i] = []
    }
    this._size = 0
    this._stats = {
      inserts: 0,
      deletes: 0,
      lookups: 0,
      relocations: 0,
      maxRelocations: 0,
      countQueries: 0,
      falsePositives: 0,
    }
  }

  capacity(): number {
    return this._capacity
  }

  loadFactor(): number {
    const totalSlots = this._bucketCount * this._bucketSize
    let usedSlots = 0
    for (let i = 0; i < this._bucketCount; i++) {
      usedSlots += this.buckets[i]!.length
    }
    return totalSlots > 0 ? usedSlots / totalSlots : 0
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  expectedFalsePositiveRate(): number {
    if (this._size === 0) return 0
    const f = this._fingerprintSize
    const b = this._bucketSize
    return 1 - Math.pow(1 - Math.pow(2, -f), b)
  }

  resize(newCapacity: number): boolean {
    const allEntries: BucketEntry[] = []
    for (let i = 0; i < this._bucketCount; i++) {
      for (const entry of this.buckets[i]!) {
        allEntries.push({ fingerprint: entry.fingerprint, count: entry.count })
      }
    }

    this._capacity = newCapacity
    this._bucketCount = Math.ceil(newCapacity / this._bucketSize)
    this.buckets = []
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets.push([])
    }
    this._size = 0

    for (const entry of allEntries) {
      for (let c = 0; c < entry.count; c++) {
        const i1 = Math.floor(Math.random() * this._bucketCount)
        if (this.buckets[i1]!.length < this._bucketSize) {
          const existing = this.findEntry(i1, entry.fingerprint)
          if (existing !== null) {
            this.buckets[i1]![existing]!.count++
          } else {
            this.buckets[i1]!.push({ fingerprint: entry.fingerprint, count: 1 })
          }
          this._size++
        } else {
          return false
        }
      }
    }

    return true
  }

  toJSON(): object {
    const serializedBuckets: { fingerprint: number; count: number }[][] = []
    for (let i = 0; i < this._bucketCount; i++) {
      const bucket: { fingerprint: number; count: number }[] = []
      for (const entry of this.buckets[i]!) {
        bucket.push({ fingerprint: entry.fingerprint, count: entry.count })
      }
      serializedBuckets.push(bucket)
    }

    return {
      capacity: this._capacity,
      bucketSize: this._bucketSize,
      fingerprintSize: this._fingerprintSize,
      maxKicks: this._maxKicks,
      size: this._size,
      stats: { ...this._stats },
      buckets: serializedBuckets,
    }
  }

  static fromJSON<T = string>(json: object): CountingCuckooFilter<T> {
    const data = json as Record<string, unknown>
    const opts: Partial<CountingCuckooFilterOptions> = {
      capacity: data.capacity as number,
      bucketSize: data.bucketSize as number,
      fingerprintSize: data.fingerprintSize as number,
      maxKicks: data.maxKicks as number,
    }
    const filter = new CountingCuckooFilter<T>(opts)
    filter._size = data.size as number
    filter._stats = { ...(data.stats as CountingCuckooFilterStatistics) }
    const buckets = data.buckets as { fingerprint: number; count: number }[][]
    for (let i = 0; i < buckets.length; i++) {
      filter.buckets[i] = buckets[i]!.map((e) => ({ fingerprint: e.fingerprint, count: e.count }))
    }
    return filter
  }

  merge(other: CountingCuckooFilter<T>): boolean {
    if (
      other._fingerprintSize !== this._fingerprintSize ||
      other._bucketSize !== this._bucketSize
    ) {
      return false
    }

    for (let i = 0; i < other._bucketCount; i++) {
      for (const entry of other.buckets[i]!) {
        for (let c = 0; c < entry.count; c++) {
          const reinserted = this.reinsertEntry(entry.fingerprint)
          if (!reinserted) {
            return false
          }
        }
      }
    }

    this._stats.inserts += other._stats.inserts
    this._stats.relocations += other._stats.relocations
    return true
  }

  getStatistics(): CountingCuckooFilterStatistics {
    return { ...this._stats }
  }

  *[Symbol.iterator](): Iterator<T> {
    return undefined as never
  }

  private reinsertEntry(fp: number): boolean {
    for (let i = 0; i < this._bucketCount; i++) {
      const existing = this.findEntry(i, fp)
      if (existing !== null) {
        this.buckets[i]![existing]!.count++
        this._size++
        return true
      }
    }

    for (let i = 0; i < this._bucketCount; i++) {
      if (this.buckets[i]!.length < this._bucketSize) {
        this.buckets[i]!.push({ fingerprint: fp, count: 1 })
        this._size++
        return true
      }
    }

    return false
  }

  private findEntry(bucketIndex: number, fp: number): number | null {
    const bucket = this.buckets[bucketIndex]!
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]!.fingerprint === fp) {
        return i
      }
    }
    return null
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }

  private fingerprint(key: string): number {
    const hash = this.hash(key, 0)
    const mask = (1 << this._fingerprintSize) - 1
    const fp = (hash & mask) | 1
    return fp
  }

  private hashIndex(key: string): number {
    const hash = this.hash(key, 0x9e3779b9)
    return hash % this._bucketCount
  }

  private altIndex(index: number, fp: number): number {
    const fpHash = this.hashFP(fp)
    return ((index ^ fpHash) >>> 0) % this._bucketCount
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }

  private hashFP(fp: number): number {
    let h = fp
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = (h >> 16) ^ h
    return h >>> 0
  }
}

export { DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS } from './types.js'
export type { CountingCuckooFilterOptions, CountingCuckooFilterStatistics } from './types.js'
