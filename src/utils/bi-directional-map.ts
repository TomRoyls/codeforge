export class BiDirectionalMap<K, V> {
  private forward = new Map<K, V>()
  private reverse = new Map<V, K>()

  set(key: K, value: V): void {
    if (this.forward.has(key)) {
      const oldVal = this.forward.get(key)!
      this.reverse.delete(oldVal)
    }
    if (this.reverse.has(value)) {
      const oldKey = this.reverse.get(value)!
      this.forward.delete(oldKey)
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
    const val = this.forward.get(key)
    if (val === undefined) return false
    this.forward.delete(key)
    this.reverse.delete(val)
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

  toArray(): Array<[K, V]> {
    return Array.from(this.forward.entries())
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[K, V]> {
    return this.toArray()
  }

  clone(): BiDirectionalMap<K, V> {
    const copy = new BiDirectionalMap<K, V>()
    for (const [k, v] of this.forward) {
      copy.forward.set(k, v)
      copy.reverse.set(v, k)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BiDirectionalMap)) return false
    if (this.size !== other.size) return false
    for (const [k, v] of this.forward) {
      if (other.forward.get(k) !== v) return false
    }
    return true
  }
}
