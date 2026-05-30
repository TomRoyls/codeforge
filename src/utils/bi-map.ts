export class BiMap<K, V> {
  private readonly forward = new Map<K, V>()
  private readonly reverse = new Map<V, K>()

  set(key: K, value: V): void {
    const existingValue = this.forward.get(key)
    if (existingValue !== undefined) {
      this.reverse.delete(existingValue)
    }
    const existingKey = this.reverse.get(value)
    if (existingKey !== undefined) {
      this.forward.delete(existingKey)
    }
    this.forward.set(key, value)
    this.reverse.set(value, key)
  }

  get(key: K): V | undefined {
    return this.forward.get(key)
  }

  getKey(value: V): K | undefined {
    return this.reverse.get(value)
  }

  hasKey(key: K): boolean {
    return this.forward.has(key)
  }

  hasValue(value: V): boolean {
    return this.reverse.has(value)
  }

  deleteKey(key: K): boolean {
    const value = this.forward.get(key)
    if (value === undefined) return false
    this.forward.delete(key)
    this.reverse.delete(value)
    return true
  }

  deleteValue(value: V): boolean {
    const key = this.reverse.get(value)
    if (key === undefined) return false
    this.forward.delete(key)
    this.reverse.delete(value)
    return true
  }

  get size(): number {
    return this.forward.size
  }

  get isEmpty(): boolean {
    return this.forward.size === 0
  }

  clear(): void {
    this.forward.clear()
    this.reverse.clear()
  }

  *keys(): Generator<K> {
    for (const key of this.forward.keys()) {
      yield key
    }
  }

  *values(): Generator<V> {
    for (const value of this.reverse.keys()) {
      yield value
    }
  }

  *entries(): Generator<[K, V]> {
    for (const entry of this.forward.entries()) {
      yield entry
    }
  }

  clone(): BiMap<K, V> {
    const copy = new BiMap<K, V>()
    for (const [k, v] of this.forward) {
      copy.forward.set(k, v)
      copy.reverse.set(v, k)
    }
    return copy
  }

  forEach(callback: (key: K, value: V, map: BiMap<K, V>) => void): void {
    for (const [key, value] of this.forward) {
      callback(key, value, this)
    }
  }
}
