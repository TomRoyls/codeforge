import type {
  Bucket,
  ExtendibleHashingOptions,
  ExtendibleHashingStats,
  HashFunction,
} from './types.js'

function defaultHash(key: unknown): number {
  const str = String(key)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return hash >>> 0
}

export class ExtendibleHashTable<K, V> {
  private directory: (Bucket<K, V> | null)[]
  private globalDepth: number
  private bucketCapacity: number
  private _size: number
  private hashFn: HashFunction<K>

  constructor(options?: ExtendibleHashingOptions<K>) {
    this.globalDepth = 0
    this.bucketCapacity = options?.bucketSize ?? 4
    this.hashFn = options?.hashFunction ?? defaultHash as HashFunction<K>
    this._size = 0
    const initialBucket: Bucket<K, V> = { localDepth: 0, entries: [] }
    this.directory = [initialBucket]
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  put(key: K, value: V): void {
    const hash = this.hashFn(key)
    const dirIndex = hash & ((1 << this.globalDepth) - 1)
    let bucket = this.directory[dirIndex]!

    const existingIndex = bucket.entries.findIndex((e) => e.key === key)
    if (existingIndex !== -1) {
      bucket.entries[existingIndex]!.value = value
      return
    }

    let prevEntryCount = bucket.entries.length
    while (bucket.entries.length >= this.bucketCapacity) {
      if (bucket.localDepth === this.globalDepth) {
        this.growDirectory()
      }
      this.splitBucket(dirIndex)
      const newIndex = hash & ((1 << this.globalDepth) - 1)
      bucket = this.directory[newIndex]!
      if (bucket.entries.length === prevEntryCount) break
      prevEntryCount = bucket.entries.length
    }

    bucket.entries.push({ key, value })
    this._size++
  }

  get(key: K): V | undefined {
    const bucket = this.findBucket(key)
    if (!bucket) return undefined
    const entry = bucket.entries.find((e) => e.key === key)
    return entry ? entry.value : undefined
  }

  delete(key: K): boolean {
    const dirIndex = this.getDirIndex(key)
    const bucket = this.directory[dirIndex]!
    const entryIndex = bucket.entries.findIndex((e) => e.key === key)
    if (entryIndex === -1) return false

    bucket.entries.splice(entryIndex, 1)
    this._size--

    this.tryMerge(dirIndex)
    return true
  }

  has(key: K): boolean {
    const bucket = this.findBucket(key)
    if (!bucket) return false
    return bucket.entries.some((e) => e.key === key)
  }

  clear(): void {
    this.globalDepth = 0
    this._size = 0
    const initialBucket: Bucket<K, V> = { localDepth: 0, entries: [] }
    this.directory = [initialBucket]
  }

  *entries(): IterableIterator<[K, V]> {
    const seen = new Set<Bucket<K, V>>()
    for (let i = 0; i < this.directory.length; i++) {
      const bucket = this.directory[i]!
      if (!bucket || seen.has(bucket)) continue
      seen.add(bucket)
      for (const entry of bucket.entries) {
        yield [entry.key, entry.value]
      }
    }
  }

  *keys(): IterableIterator<K> {
    for (const [k] of this.entries()) {
      yield k
    }
  }

  *values(): IterableIterator<V> {
    for (const [, v] of this.entries()) {
      yield v
    }
  }

  forEach(callback: (value: V, key: K, table: ExtendibleHashTable<K, V>) => void): void {
    for (const [k, v] of this.entries()) {
      callback(v, k, this)
    }
  }

  getStats(): ExtendibleHashingStats {
    const seen = new Set<Bucket<K, V>>()
    let bucketCount = 0
    let totalEntries = 0
    for (let i = 0; i < this.directory.length; i++) {
      const bucket = this.directory[i]!
      if (!bucket || seen.has(bucket)) continue
      seen.add(bucket)
      bucketCount++
      totalEntries += bucket.entries.length
    }
    return {
      globalDepth: this.globalDepth,
      bucketCount,
      totalEntries,
      directorySize: this.directory.length,
    }
  }

  private getDirIndex(key: K): number {
    const hash = this.hashFn(key)
    return hash & ((1 << this.globalDepth) - 1)
  }

  private findBucket(key: K): Bucket<K, V> | null {
    const dirIndex = this.getDirIndex(key)
    return this.directory[dirIndex] ?? null
  }

  private growDirectory(): void {
    const oldLen = this.directory.length
    this.globalDepth++
    const newDir: (Bucket<K, V> | null)[] = []
    for (let i = 0; i < oldLen * 2; i++) {
      newDir.push(null)
    }
    for (let i = 0; i < oldLen; i++) {
      const b = this.directory[i]!
      newDir[i] = b
      newDir[i + oldLen] = b
    }
    this.directory = newDir
  }

  private splitBucket(dirIndex: number): void {
    const oldBucket = this.directory[dirIndex]!
    const newDepth = oldBucket.localDepth + 1

    const bucket0: Bucket<K, V> = { localDepth: newDepth, entries: [] }
    const bucket1: Bucket<K, V> = { localDepth: newDepth, entries: [] }

    for (const entry of oldBucket.entries) {
      const h = this.hashFn(entry.key)
      const bit = (h >> (newDepth - 1)) & 1
      if (bit === 0) {
        bucket0.entries.push(entry)
      } else {
        bucket1.entries.push(entry)
      }
    }

    const lowPrefix = dirIndex & ((1 << (newDepth - 1)) - 1)
    for (let i = 0; i < (1 << (this.globalDepth - newDepth)); i++) {
      const idx0 = (i << newDepth) | lowPrefix
      const idx1 = (i << newDepth) | (1 << (newDepth - 1)) | lowPrefix
      if (idx0 < this.directory.length) this.directory[idx0] = bucket0
      if (idx1 < this.directory.length) this.directory[idx1] = bucket1
    }
  }

  private tryMerge(dirIndex: number): void {
    if (this.globalDepth === 0) return

    const bucket = this.directory[dirIndex]!
    if (bucket.entries.length > 0) return
    if (bucket.localDepth === 0) return

    const buddyBit = 1 << (bucket.localDepth - 1)
    const buddyIndex = dirIndex ^ buddyBit
    const buddyBucket = this.directory[buddyIndex]!
    if (!buddyBucket || buddyBucket.localDepth !== bucket.localDepth) return

    if (buddyBucket.entries.length + 0 > this.bucketCapacity) return

    const mergedDepth = bucket.localDepth - 1
    const mergedBucket: Bucket<K, V> = {
      localDepth: mergedDepth,
      entries: [...buddyBucket.entries],
    }

    for (let i = 0; i < this.directory.length; i++) {
      if (this.directory[i] === bucket || this.directory[i] === buddyBucket) {
        this.directory[i] = mergedBucket
      }
    }

    let canShrink = true
    for (let i = 0; i < this.directory.length; i++) {
      const b = this.directory[i]!
      if (b.localDepth >= this.globalDepth) {
        canShrink = false
        break
      }
    }

    while (canShrink && this.globalDepth > 0) {
      let allMatch = true
      const fullLen = this.directory.length
      const halfLen = fullLen >> 1
      for (let i = 0; i < halfLen; i++) {
        if (this.directory[i] !== this.directory[i + halfLen]) {
          allMatch = false
          break
        }
      }
      if (!allMatch) break

      this.globalDepth--
      const newDir: (Bucket<K, V> | null)[] = []
      for (let i = 0; i < halfLen; i++) {
        newDir.push(this.directory[i]!)
      }
      this.directory = newDir

      canShrink = true
      for (let i = 0; i < this.directory.length; i++) {
        const b = this.directory[i]!
        if (b.localDepth >= this.globalDepth) {
          canShrink = false
          break
        }
      }
    }
  }
  [Symbol.iterator]() {
    return this.entries()
  }

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `${ExtendibleHashTable}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ExtendibleHashTable', size: this.size, items: this.toArray() }
  }

  static empty<K, V>(): ExtendibleHashTable<K, V> {
    return new ExtendibleHashTable<K, V>()
  }

  get [Symbol.toStringTag](): string {
    return 'ExtendibleHashTable'
  }
}
