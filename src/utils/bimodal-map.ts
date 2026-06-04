export class BimodalMap<K, V> {
  private frozen: Map<K, V> | null = null
  private mutable: Map<K, V> = new Map()
  private readonly deleted: Set<K> = new Set()

  freeze(): void {
    if (this.frozen !== null) {
      for (const [k, v] of this.mutable) {
        this.frozen.set(k, v)
      }
    } else {
      this.frozen = new Map(this.mutable)
    }
    this.mutable = new Map()
    this.deleted.clear()
  }

  set(key: K, value: V): void {
    this.deleted.delete(key)
    this.mutable.set(key, value)
  }

  get(key: K): V | undefined {
    if (this.deleted.has(key)) return undefined
    const m = this.mutable.get(key)
    if (m !== undefined) return m
    return this.frozen?.get(key)
  }

  has(key: K): boolean {
    if (this.deleted.has(key)) return false
    return this.mutable.has(key) || (this.frozen?.has(key) ?? false)
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.deleted.add(key)
    this.mutable.delete(key)
    return true
  }

  get size(): number {
    let count = 0
    for (const _key of this.keys()) count++
    return count
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  *keys(): Generator<K> {
    const seen = new Set<K>()
    for (const [k] of this.mutable) {
      if (!this.deleted.has(k)) {
        seen.add(k)
        yield k
      }
    }
    if (this.frozen) {
      for (const [k] of this.frozen) {
        if (!seen.has(k) && !this.deleted.has(k)) yield k
      }
    }
  }

  *entries(): Generator<[K, V]> {
    for (const key of this.keys()) {
      const val = this.get(key)
      if (val !== undefined) yield [key, val]
    }
  }

  clear(): void {
    this.frozen = null
    this.mutable = new Map()
    this.deleted.clear()
  }
}
