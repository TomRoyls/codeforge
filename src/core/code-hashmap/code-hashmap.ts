import type { HashMapOptions, HashMapStats, HashMapEntry } from './types.js'
import { DEFAULT_HASHMAP_OPTIONS } from './types.js'

type Bucket<V> = HashMapEntry<V>[]

export class CodeHashMap<V = unknown> {
  private buckets: Bucket<V>[]
  private _size: number = 0
  private options: HashMapOptions
  private _collisions: number = 0
  private _resizeCount: number = 0

  constructor(options?: Partial<HashMapOptions>) {
    this.options = { ...DEFAULT_HASHMAP_OPTIONS, ...options }
    this.buckets = this.createBuckets(this.options.capacity)
  }

  set(key: string, value: V): void {
    const hash = this.options.hashFunction(key)
    const index = this.getIndex(hash)
    const bucket = this.buckets[index]

    if (bucket === undefined) {
      return
    }

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]
      if (entry !== undefined && entry.key === key) {
        entry.value = value
        entry.hash = hash
        entry.timestamp = Date.now()
        return
      }
    }

    if (bucket.length > 0) {
      this._collisions++
    }

    bucket.push({ key, value, hash, timestamp: Date.now() })
    this._size++

    if (this._size / this.options.capacity > this.options.loadFactor) {
      this.resize(this.options.capacity * 2)
    }
  }

  get(key: string): V | undefined {
    const hash = this.options.hashFunction(key)
    const index = this.getIndex(hash)
    const bucket = this.buckets[index]

    if (bucket === undefined) {
      return undefined
    }

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]
      if (entry !== undefined && entry.key === key) {
        return entry.value
      }
    }

    return undefined
  }

  has(key: string): boolean {
    const hash = this.options.hashFunction(key)
    const index = this.getIndex(hash)
    const bucket = this.buckets[index]

    if (bucket === undefined) {
      return false
    }

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]
      if (entry !== undefined && entry.key === key) {
        return true
      }
    }

    return false
  }

  delete(key: string): boolean {
    const hash = this.options.hashFunction(key)
    const index = this.getIndex(hash)
    const bucket = this.buckets[index]

    if (bucket === undefined) {
      return false
    }

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]
      if (entry !== undefined && entry.key === key) {
        bucket.splice(i, 1)
        this._size--
        return true
      }
    }

    return false
  }

  clear(): void {
    this.buckets = this.createBuckets(this.options.capacity)
    this._size = 0
    this._collisions = 0
  }

  entries(): HashMapEntry<V>[] {
    const result: HashMapEntry<V>[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          const entry = bucket[j]
          if (entry !== undefined) {
            result.push(entry)
          }
        }
      }
    }
    return result
  }

  keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          const entry = bucket[j]
          if (entry !== undefined) {
            result.push(entry.key)
          }
        }
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          const entry = bucket[j]
          if (entry !== undefined) {
            result.push(entry.value)
          }
        }
      }
    }
    return result
  }

  forEach(callback: (value: V, key: string, entry: HashMapEntry<V>) => void): void {
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          const entry = bucket[j]
          if (entry !== undefined) {
            callback(entry.value, entry.key, entry)
          }
        }
      }
    }
  }

  getSize(): number {
    return this._size
  }

  getCapacity(): number {
    return this.options.capacity
  }

  getStats(): HashMapStats {
    return {
      size: this._size,
      capacity: this.options.capacity,
      loadFactor: this._size / this.options.capacity,
      collisions: this._collisions,
      resizeCount: this._resizeCount,
    }
  }

  resize(newCapacity: number): void {
    const oldBuckets = this.buckets
    this.options = { ...this.options, capacity: newCapacity }
    this.buckets = this.createBuckets(newCapacity)
    this._size = 0
    this._collisions = 0
    this._resizeCount++

    for (let i = 0; i < oldBuckets.length; i++) {
      const bucket = oldBuckets[i]
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          const entry = bucket[j]
          if (entry !== undefined) {
            const newIndex = this.getIndex(entry.hash)
            const newBucket = this.buckets[newIndex]
            if (newBucket !== undefined) {
              if (newBucket.length > 0) {
                this._collisions++
              }
              newBucket.push(entry)
              this._size++
            }
          }
        }
      }
    }
  }

  getCollisions(): number {
    return this._collisions
  }

  private getIndex(hash: number): number {
    return ((hash % this.options.capacity) + this.options.capacity) % this.options.capacity
  }

  private createBuckets(count: number): Bucket<V>[] {
    const buckets: Bucket<V>[] = []
    for (let i = 0; i < count; i++) {
      buckets.push([])
    }
    return buckets
  }
}

export { DEFAULT_HASHMAP_OPTIONS } from './types.js'
export type { HashMapEntry, HashMapOptions, HashMapStats } from './types.js'
