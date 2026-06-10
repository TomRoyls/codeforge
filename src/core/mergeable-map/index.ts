import type {
  ConflictResolver,
  MapDifference,
  MergeResult,
  MergeableMapEntry,
} from './types.js'

export class MergeableMap<K, V> {
  private store: Map<K, V> = new Map()

  constructor(entries?: Iterable<readonly [K, V]>) {
    if (entries !== undefined) {
      for (const [key, value] of entries) {
        this.store.set(key, value)
      }
    }
  }

  set(key: K, value: V): void {
    this.store.set(key, value)
  }

  get(key: K): V | undefined {
    return this.store.get(key)
  }

  delete(key: K): boolean {
    return this.store.delete(key)
  }

  has(key: K): boolean {
    return this.store.has(key)
  }

  get size(): number {
    return this.store.size
  }

  get isEmpty(): boolean {
    return this.store.size === 0
  }

  clear(): void {
    this.store.clear()
  }

  merge(
    other: MergeableMap<K, V>,
    conflictResolver?: ConflictResolver<K, V>,
  ): MergeResult {
    let added = 0
    let updated = 0
    let unchanged = 0

    for (const [key, otherValue] of other.store) {
      if (this.store.has(key)) {
        const currentValue = this.store.get(key)!
        if (currentValue === otherValue) {
          unchanged++
        } else {
          const resolved = conflictResolver
            ? conflictResolver(key, currentValue, otherValue)
            : otherValue
          this.store.set(key, resolved)
          updated++
        }
      } else {
        this.store.set(key, otherValue)
        added++
      }
    }

    return { added, updated, removed: 0, unchanged }
  }

  keys(): IterableIterator<K> {
    return this.store.keys()
  }

  values(): IterableIterator<V> {
    return this.store.values()
  }

  entries(): IterableIterator<[K, V]> {
    return this.store.entries()
  }

  toArray(): Array<[K, V]> {
    return Array.from(this.store.entries())
  }

  forEach(callback: (value: V, key: K, map: MergeableMap<K, V>) => void): void {
    for (const [key, value] of this.store) {
      callback(value, key, this)
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.store.entries()
  }

  clone(): MergeableMap<K, V> {
    return new MergeableMap<K, V>(this.store.entries())
  }

  difference(other: MergeableMap<K, V>): MergeableMap<K, V> {
    const result = new MergeableMap<K, V>()
    for (const [key, value] of this.store) {
      if (!other.has(key)) {
        result.set(key, value)
      }
    }
    return result
  }

  intersection(other: MergeableMap<K, V>): MergeableMap<K, V> {
    const result = new MergeableMap<K, V>()
    for (const [key, value] of this.store) {
      if (other.has(key)) {
        result.set(key, value)
      }
    }
    return result
  }

  union(other: MergeableMap<K, V>): MergeableMap<K, V> {
    const result = this.clone()
    result.merge(other)
    return result
  }

  detailedDifference(other: MergeableMap<K, V>): MapDifference<K, V> {
    const leftOnly: Array<MergeableMapEntry<K, V>> = []
    const rightOnly: Array<MergeableMapEntry<K, V>> = []
    const common: Array<MergeableMapEntry<K, V>> = []
    const changed: Array<{ key: K; leftValue: V; rightValue: V }> = []

    for (const [key, value] of this.store) {
      if (!other.has(key)) {
        leftOnly.push({ key, value })
      } else {
        const otherValue = other.get(key)!
        if (otherValue === value) {
          common.push({ key, value })
        } else {
          changed.push({ key, leftValue: value, rightValue: otherValue })
        }
      }
    }

    for (const [key, value] of other.store) {
      if (!this.store.has(key)) {
        rightOnly.push({ key, value })
      }
    }

    return { leftOnly, rightOnly, common, changed }
  }

  equals(other: MergeableMap<K, V>): boolean {
    if (this.store.size !== other.size) return false
    for (const [key, value] of this.store) {
      const otherValue = other.get(key)
      if (otherValue === undefined || otherValue !== value) return false
    }
    return true
  }

  filter(predicate: (value: V, key: K) => boolean): MergeableMap<K, V> {
    const result = new MergeableMap<K, V>()
    for (const [key, value] of this.store) {
      if (predicate(value, key)) {
        result.set(key, value)
      }
    }
    return result
  }

  mapValues<T>(mapper: (value: V, key: K) => T): MergeableMap<K, T> {
    const result = new MergeableMap<K, T>()
    for (const [key, value] of this.store) {
      result.set(key, mapper(value, key))
    }
    return result
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.store) {
      if (predicate(value, key)) return true
    }
    return false
  }

  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.store) {
      if (!predicate(value, key)) return false
    }
    return true
  }

  find(predicate: (value: V, key: K) => boolean): V | undefined {
    for (const [key, value] of this.store) {
      if (predicate(value, key)) return value
    }
    return undefined
  }

  reduce<T>(
    reducer: (accumulator: T, value: V, key: K) => T,
    initialValue: T,
  ): T {
    let acc = initialValue
    for (const [key, value] of this.store) {
      acc = reducer(acc, value, key)
    }
    return acc
  }

  static fromObject<V>(obj: Record<string, V>): MergeableMap<string, V> {
    return new MergeableMap<string, V>(Object.entries(obj))
  }

  toObject(): Record<string, V> {
    const obj: Record<string, V> = {}
    for (const [key, value] of this.store) {
      if (typeof key === 'string') {
        obj[key] = value
      }
    }
    return obj
  }

  toString(): string {
    return `MergeableMap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'MergeableMap', size: this.size, items: this.toArray() }
  }


  get [Symbol.toStringTag](): string {
    return 'MergeableMap'
  }

  nonEmpty(): boolean {
    return !this.isEmpty
  }
}
