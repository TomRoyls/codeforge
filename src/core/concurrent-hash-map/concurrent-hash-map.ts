import type { ConcurrentHashMapOptions, ConcurrentHashMapStatistics } from './types.js'
import { DEFAULT_CONCURRENT_HASH_MAP_OPTIONS } from './types.js'

interface BucketEntry<K, V> {
  key: K
  value: V
  next: BucketEntry<K, V> | null
}

interface Segment<K, V> {
  buckets: Array<BucketEntry<K, V> | null>
  locked: boolean
}

export class ConcurrentHashMap<K = unknown, V = unknown> {
  private segments: Segment<K, V>[]
  private _concurrencyLevel: number
  private _loadFactor: number
  private _hashFn: (key: K) => number
  private _size: number = 0
  private stats: ConcurrentHashMapStatistics = {
    gets: 0,
    sets: 0,
    deletes: 0,
    hits: 0,
    misses: 0,
    resizes: 0,
    putIfAbsentCalls: 0,
    computeIfAbsentCalls: 0,
    segmentLockContentions: 0,
  }

  constructor(options?: Partial<ConcurrentHashMapOptions<K>>) {
    const merged = { ...DEFAULT_CONCURRENT_HASH_MAP_OPTIONS, ...options } as ConcurrentHashMapOptions<K>
    this._concurrencyLevel = merged.concurrencyLevel
    this._loadFactor = merged.loadFactor
    this._hashFn = merged.hashFn
    const bucketsPerSegment = Math.max(1, Math.ceil(merged.initialCapacity / this._concurrencyLevel))
    this.segments = []
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.segments.push({
        buckets: new Array<BucketEntry<K, V> | null>(bucketsPerSegment).fill(null),
        locked: false,
      })
    }
  }

  private getSegmentIndex(key: K): number {
    return this._hashFn(key) % this._concurrencyLevel
  }

  private getBucketIndex(key: K, segment: Segment<K, V>): number {
    return this._hashFn(key) % segment.buckets.length
  }

  private acquireLock(segmentIndex: number): void {
    const segment = this.segments[segmentIndex]!
    if (segment.locked) {
      this.stats.segmentLockContentions++
    }
    segment.locked = true
  }

  private releaseLock(segmentIndex: number): void {
    this.segments[segmentIndex]!.locked = false
  }

  private findEntry(key: K, segment: Segment<K, V>): BucketEntry<K, V> | null {
    const bucketIndex = this.getBucketIndex(key, segment)
    let current = segment.buckets[bucketIndex]!
    while (current !== null) {
      if (current.key === key) {
        return current
      }
      current = current.next!
    }
    return null
  }

  private checkResize(segmentIndex: number): void {
    const segment = this.segments[segmentIndex]!
    let count = 0
    for (let i = 0; i < segment.buckets.length; i++) {
      let current = segment.buckets[i]!
      while (current !== null) {
        count++
        current = current.next!
      }
    }
    if (count / segment.buckets.length >= this._loadFactor) {
      this.resizeSegment(segmentIndex, segment.buckets.length * 2)
    }
  }

  private resizeSegment(segmentIndex: number, newCapacity: number): void {
    const segment = this.segments[segmentIndex]!
    const oldBuckets = segment.buckets
    segment.buckets = new Array<BucketEntry<K, V> | null>(newCapacity).fill(null)
    for (let i = 0; i < oldBuckets.length; i++) {
      let current = oldBuckets[i]!
      while (current !== null) {
        const next = current.next
        const newBucketIndex = this._hashFn(current.key) % newCapacity
        current.next = segment.buckets[newBucketIndex]!
        segment.buckets[newBucketIndex] = current
        current = next!
      }
    }
    this.stats.resizes++
  }

  get(key: K): V | undefined {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      this.stats.gets++
      const entry = this.findEntry(key, this.segments[segIdx]!)
      if (entry !== null) {
        this.stats.hits++
        return entry.value
      }
      this.stats.misses++
      return undefined
    } finally {
      this.releaseLock(segIdx)
    }
  }

  set(key: K, value: V): void {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      const segment = this.segments[segIdx]!
      const existing = this.findEntry(key, segment)
      if (existing !== null) {
        existing.value = value
      } else {
        const bucketIndex = this.getBucketIndex(key, segment)
        segment.buckets[bucketIndex] = { key, value, next: segment.buckets[bucketIndex]! }
        this._size++
      }
      this.stats.sets++
      this.checkResize(segIdx)
    } finally {
      this.releaseLock(segIdx)
    }
  }

  delete(key: K): boolean {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      const segment = this.segments[segIdx]!
      const bucketIndex = this.getBucketIndex(key, segment)
      const head = segment.buckets[bucketIndex]!
      if (head === null) {
        this.stats.deletes++
        return false
      }
      if (head.key === key) {
        segment.buckets[bucketIndex] = head.next
        this._size--
        this.stats.deletes++
        return true
      }
      let prev: BucketEntry<K, V> = head
      let current: BucketEntry<K, V> | null = head.next
      while (current !== null) {
        if (current.key === key) {
          prev.next = current.next
          this._size--
          this.stats.deletes++
          return true
        }
        prev = current
        current = current.next!
      }
      this.stats.deletes++
      return false
    } finally {
      this.releaseLock(segIdx)
    }
  }

  has(key: K): boolean {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      return this.findEntry(key, this.segments[segIdx]!) !== null
    } finally {
      this.releaseLock(segIdx)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        const segment = this.segments[i]!
        const bucketsPerSegment = Math.max(1, Math.ceil(64 / this._concurrencyLevel))
        segment.buckets = new Array<BucketEntry<K, V> | null>(bucketsPerSegment).fill(null)
      } finally {
        this.releaseLock(i)
      }
    }
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        const segment = this.segments[i]!
        for (let j = 0; j < segment.buckets.length; j++) {
          let current = segment.buckets[j]!
          while (current !== null) {
            result.push(current.key)
            current = current.next!
          }
        }
      } finally {
        this.releaseLock(i)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        const segment = this.segments[i]!
        for (let j = 0; j < segment.buckets.length; j++) {
          let current = segment.buckets[j]!
          while (current !== null) {
            result.push(current.value)
            current = current.next!
          }
        }
      } finally {
        this.releaseLock(i)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        const segment = this.segments[i]!
        for (let j = 0; j < segment.buckets.length; j++) {
          let current = segment.buckets[j]!
          while (current !== null) {
            result.push([current.key, current.value])
            current = current.next!
          }
        }
      } finally {
        this.releaseLock(i)
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K, map: ConcurrentHashMap<K, V>) => void): void {
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        const segment = this.segments[i]!
        for (let j = 0; j < segment.buckets.length; j++) {
          let current = segment.buckets[j]!
          while (current !== null) {
            callback(current.value, current.key, this)
            current = current.next!
          }
        }
      } finally {
        this.releaseLock(i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        const segment = this.segments[i]!
        for (let j = 0; j < segment.buckets.length; j++) {
          let current = segment.buckets[j]!
          while (current !== null) {
            yield [current.key, current.value]
            current = current.next!
          }
        }
      } finally {
        this.releaseLock(i)
      }
    }
  }

  computeIfAbsent(key: K, fn: () => V): V {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      this.stats.computeIfAbsentCalls++
      const existing = this.findEntry(key, this.segments[segIdx]!)
      if (existing !== null) {
        return existing.value
      }
      const value = fn()
      const segment = this.segments[segIdx]!
      const bucketIndex = this.getBucketIndex(key, segment)
      segment.buckets[bucketIndex] = { key, value, next: segment.buckets[bucketIndex]! }
      this._size++
      this.stats.sets++
      return value
    } finally {
      this.releaseLock(segIdx)
    }
  }

  computeIfPresent(key: K, fn: (value: V) => V): V | undefined {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      const existing = this.findEntry(key, this.segments[segIdx]!)
      if (existing === null) {
        return undefined
      }
      existing.value = fn(existing.value)
      return existing.value
    } finally {
      this.releaseLock(segIdx)
    }
  }

  putIfAbsent(key: K, value: V): V | undefined {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      this.stats.putIfAbsentCalls++
      const existing = this.findEntry(key, this.segments[segIdx]!)
      if (existing !== null) {
        return existing.value
      }
      const segment = this.segments[segIdx]!
      const bucketIndex = this.getBucketIndex(key, segment)
      segment.buckets[bucketIndex] = { key, value, next: segment.buckets[bucketIndex]! }
      this._size++
      this.stats.sets++
      return undefined
    } finally {
      this.releaseLock(segIdx)
    }
  }

  replace(key: K, oldValue: V, newValue: V): boolean {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      const existing = this.findEntry(key, this.segments[segIdx]!)
      if (existing === null || existing.value !== oldValue) {
        return false
      }
      existing.value = newValue
      this.stats.sets++
      return true
    } finally {
      this.releaseLock(segIdx)
    }
  }

  getOrDefault(key: K, defaultValue: V): V {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      this.stats.gets++
      const entry = this.findEntry(key, this.segments[segIdx]!)
      if (entry !== null) {
        this.stats.hits++
        return entry.value
      }
      this.stats.misses++
      return defaultValue
    } finally {
      this.releaseLock(segIdx)
    }
  }

  merge(key: K, value: V, remappingFn: (oldValue: V, newValue: V) => V): V | undefined {
    const segIdx = this.getSegmentIndex(key)
    this.acquireLock(segIdx)
    try {
      const segment = this.segments[segIdx]!
      const existing = this.findEntry(key, segment)
      if (existing === null) {
        const bucketIndex = this.getBucketIndex(key, segment)
        segment.buckets[bucketIndex] = { key, value, next: segment.buckets[bucketIndex]! }
        this._size++
        this.stats.sets++
        return value
      }
      existing.value = remappingFn(existing.value, value)
      this.stats.sets++
      return existing.value
    } finally {
      this.releaseLock(segIdx)
    }
  }

  resize(newCapacity: number): void {
    const bucketsPerSegment = Math.max(1, Math.ceil(newCapacity / this._concurrencyLevel))
    for (let i = 0; i < this._concurrencyLevel; i++) {
      this.acquireLock(i)
      try {
        this.resizeSegment(i, bucketsPerSegment)
      } finally {
        this.releaseLock(i)
      }
    }
  }

  getStatistics(): ConcurrentHashMapStatistics {
    return { ...this.stats }
  }

  concurrencyLevel(): number {
    return this._concurrencyLevel
  }

  toJSON(): object {
    return {
      entries: this.entries(),
    }
  }

  static fromJSON<K, V>(data: { entries: Array<[K, V]> }): ConcurrentHashMap<K, V> {
    const map = new ConcurrentHashMap<K, V>()
    for (const entry of data.entries) {
      map.set(entry[0], entry[1])
    }
    return map
  }
}

export { DEFAULT_CONCURRENT_HASH_MAP_OPTIONS } from './types.js'
export type { ConcurrentHashMapOptions, ConcurrentHashMapStatistics } from './types.js'
