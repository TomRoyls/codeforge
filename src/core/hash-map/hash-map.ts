import type { HashMapEntry, HashMapOptions } from './types.js'
import { DEFAULT_HASHMAP_OPTIONS } from './types.js'

export class HashMap<K, V> {
  private buckets: Array<HashMapEntry<K, V> | null>
  private _size: number = 0
  private options: HashMapOptions
  private isResizing: boolean = false

  constructor(options?: Partial<HashMapOptions>) {
    this.options = { ...DEFAULT_HASHMAP_OPTIONS, ...options }
    this.buckets = new Array<HashMapEntry<K, V> | null>(this.options.initialCapacity).fill(null)
  }

  set(key: K, value: V): void {
    const index = this.getIndex(key)
    const bucket = this.buckets[index] ?? null
    if (bucket === null) {
      this.buckets[index] = { key, value, next: null }
      this._size++
      this.checkResize()
      return
    }
    let current: HashMapEntry<K, V> | null = bucket
    while (current !== null) {
      if (current.key === key) {
        current.value = value
        return
      }
      if (current.next === null) {
        current.next = { key, value, next: null }
        this._size++
        this.checkResize()
        return
      }
      current = current.next
    }
  }

  get(key: K): V | undefined {
    const index = this.getIndex(key)
    let current = this.buckets[index] ?? null
    while (current !== null) {
      if (current.key === key) {
        return current.value
      }
      current = current.next
    }
    return undefined
  }

  delete(key: K): boolean {
    const index = this.getIndex(key)
    const bucket = this.buckets[index] ?? null
    if (bucket === null) {
      return false
    }
    if (bucket.key === key) {
      this.buckets[index] = bucket.next
      this._size--
      return true
    }
    let prev: HashMapEntry<K, V> = bucket
    let current: HashMapEntry<K, V> | null = bucket.next
    while (current !== null) {
      if (current.key === key) {
        prev.next = current.next
        this._size--
        return true
      }
      prev = current
      current = current.next
    }
    return false
  }

  has(key: K): boolean {
    const index = this.getIndex(key)
    let current = this.buckets[index] ?? null
    while (current !== null) {
      if (current.key === key) {
        return true
      }
      current = current.next
    }
    return false
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this.buckets.length; i++) {
      this.buckets[i] = null
    }
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i] ?? null
      while (current !== null) {
        result.push(current.key)
        current = current.next
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i] ?? null
      while (current !== null) {
        result.push(current.value)
        current = current.next
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i] ?? null
      while (current !== null) {
        result.push([current.key, current.value])
        current = current.next
      }
    }
    return result
  }

  forEach(callback: (key: K, value: V) => void): void {
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i] ?? null
      while (current !== null) {
        callback(current.key, current.value)
        current = current.next
      }
    }
  }

  resize(newCapacity: number): void {
    this.isResizing = true
    const oldBuckets = this.buckets
    this.buckets = new Array<HashMapEntry<K, V> | null>(newCapacity).fill(null)
    this._size = 0
    for (let i = 0; i < oldBuckets.length; i++) {
      let current = oldBuckets[i] ?? null
      while (current !== null) {
        this.set(current.key, current.value)
        current = current.next
      }
    }
    this.isResizing = false
  }

  load(): number {
    return this._size / this.buckets.length
  }

  capacity(): number {
    return this.buckets.length
  }

  private hash(key: K): number {
    const str = String(key)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash + char) | 0
    }
    return hash >>> 0
  }

  private getIndex(key: K): number {
    return this.hash(key) % this.buckets.length
  }

  private checkResize(): void {
    if (!this.isResizing && this.load() >= this.options.loadFactor) {
      this.resize(this.buckets.length * 2)
    }
  }
}

export { DEFAULT_HASHMAP_OPTIONS } from './types.js'
export type { HashMapEntry, HashMapOptions } from './types.js'
