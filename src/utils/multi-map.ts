export class MultiMap<K, V> {
  private map = new Map<K, Set<V>>()
  private _size = 0

  set(key: K, value: V): void {
    let set = this.map.get(key)
    if (set === undefined) {
      set = new Set()
      this.map.set(key, set)
    }
    if (!set.has(value)) {
      set.add(value)
      this._size++
    }
  }

  add(key: K, ...values: V[]): void {
    for (const value of values) {
      this.set(key, value)
    }
  }

  get(key: K): ReadonlySet<V> {
    const set = this.map.get(key)
    if (set === undefined) {
      return new Set()
    }
    return set
  }

  getValues(key: K): V[] {
    const set = this.map.get(key)
    if (set === undefined) return []
    return Array.from(set)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  hasEntry(key: K, value: V): boolean {
    const set = this.map.get(key)
    return set?.has(value) ?? false
  }

  delete(key: K): boolean {
    const set = this.map.get(key)
    if (set === undefined) return false
    this._size -= set.size
    this.map.delete(key)
    return true
  }

  deleteEntry(key: K, value: V): boolean {
    const set = this.map.get(key)
    if (set === undefined) return false
    if (!set.delete(value)) return false
    this._size--
    if (set.size === 0) {
      this.map.delete(key)
    }
    return true
  }

  clear(): void {
    this.map.clear()
    this._size = 0
  }

  get keyCount(): number {
    return this.map.size
  }

  get entryCount(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this.map.size === 0
  }

  keys(): K[] {
    return Array.from(this.map.keys())
  }

  values(): V[] {
    const result: V[] = []
    for (const set of this.map.values()) {
      for (const value of set) {
        result.push(value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const [key, set] of this.map) {
      for (const value of set) {
        result.push([key, value])
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K, map: MultiMap<K, V>) => void): void {
    for (const [key, set] of this.map) {
      for (const value of set) {
        callback(value, key, this)
      }
    }
  }

  keyIterator(): IterableIterator<K> {
    return this.map.keys()
  }

  *[Symbol.iterator](): Iterator<[K, Set<V>]> {
    for (const entry of this.map) {
      yield entry
    }
  }

  clone(): MultiMap<K, V> {
    const copy = new MultiMap<K, V>()
    for (const [key, set] of this.map) {
      const newSet = new Set(set)
      copy.map.set(key, newSet)
    }
    copy._size = this._size
    return copy
  }

  invert(): MultiMap<V, K> {
    const result = new MultiMap<V, K>()
    for (const [key, set] of this.map) {
      for (const value of set) {
        result.set(value, key)
      }
    }
    return result
  }

  merge(other: MultiMap<K, V>): void {
    for (const [key, set] of other.map) {
      for (const value of set) {
        this.set(key, value)
      }
    }
  }

  equals(other: MultiMap<K, V>): boolean {
    if (this._size !== other._size) return false
    if (this.map.size !== other.map.size) return false
    for (const [key, set] of this.map) {
      const otherSet = other.map.get(key)
      if (otherSet === undefined) return false
      if (set.size !== otherSet.size) return false
      for (const value of set) {
        if (!otherSet.has(value)) return false
      }
    }
    return true
  }

  filterKeys(predicate: (key: K) => boolean): MultiMap<K, V> {
    const result = new MultiMap<K, V>()
    for (const [key, set] of this.map) {
      if (predicate(key)) {
        result.map.set(key, new Set(set))
        result._size += set.size
      }
    }
    return result
  }

  filterValues(predicate: (value: V) => boolean): MultiMap<K, V> {
    const result = new MultiMap<K, V>()
    for (const [key, set] of this.map) {
      const filtered = new Set<V>()
      for (const value of set) {
        if (predicate(value)) filtered.add(value)
      }
      if (filtered.size > 0) {
        result.map.set(key, filtered)
        result._size += filtered.size
      }
    }
    return result
  }

  static fromEntries<K, V>(entries: Array<[K, V]>): MultiMap<K, V> {
    const map = new MultiMap<K, V>()
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  static fromGroups<K, V>(groups: Array<[K, V[]]>): MultiMap<K, V> {
    const map = new MultiMap<K, V>()
    for (const [key, values] of groups) {
      map.add(key, ...values)
    }
    return map
  }
}
