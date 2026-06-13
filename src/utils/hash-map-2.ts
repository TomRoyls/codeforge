export class HashMap2<K, V> {
  private entries = new Map<K, V>()

  set(key: K, value: V): void { this.entries.set(key, value) }
  get(key: K): V | undefined { return this.entries.get(key) }
  has(key: K): boolean { return this.entries.has(key) }
  delete(key: K): boolean { return this.entries.delete(key) }

  keys(): IterableIterator<K> { return this.entries.keys() }
  values(): IterableIterator<V> { return this.entries.values() }

  get size(): number { return this.entries.size }
  get isEmpty(): boolean { return this.entries.size === 0 }

  clear(): void { this.entries.clear() }

  toArray(): Array<[K, V]> { return Array.from(this.entries.entries()) }
  toString(): string { return JSON.stringify({ size: this.entries.size }) }
  toJSON(): Record<string, number> { return { size: this.entries.size } }

  clone(): HashMap2<K, V> {
    const c = new HashMap2<K, V>()
    for (const [k, v] of this.entries) c.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HashMap2)) return false
    return this.size === other.size
  }

  forEach(fn: (value: V, key: K) => void): void {
    this.entries.forEach((v, k) => fn(v, k))
  }
}
