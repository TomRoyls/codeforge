export class ConcurrentMap2<K, V> {
  private map: Map<K, V> = new Map()
  private locks: Map<K, Promise<void>> = new Map()

  async withLock<R>(key: K, fn: () => Promise<R>): Promise<R> {
    while (this.locks.has(key)) {
      await this.locks.get(key)
    }

    let resolve: () => void
    const lock = new Promise<void>(r => { resolve = r })
    this.locks.set(key, lock)

    try {
      return await fn()
    } finally {
      this.locks.delete(key)
      resolve!()
    }
  }

  get(key: K): V | undefined {
    return this.map.get(key)
  }

  set(key: K, value: V): this {
    this.map.set(key, value)
    return this
  }

  async computeIfAbsent(key: K, supplier: () => Promise<V>): Promise<V> {
    const existing = this.map.get(key)
    if (existing !== undefined) return existing

    return this.withLock(key, async () => {
      const again = this.map.get(key)
      if (again !== undefined) return again
      const value = await supplier()
      this.map.set(key, value)
      return value
    })
  }

  async compute(key: K, remapper: (key: K, value: V | undefined) => Promise<V>): Promise<V> {
    return this.withLock(key, async () => {
      const current = this.map.get(key)
      const newValue = await remapper(key, current)
      this.map.set(key, newValue)
      return newValue
    })
  }

  async update(key: K, updater: (value: V) => V, defaultValue: V): Promise<V> {
    return this.compute(key, async (_, current) => updater(current ?? defaultValue))
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  delete(key: K): boolean {
    return this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
    this.locks.clear()
  }

  size(): number {
    return this.map.size
  }

  keys(): K[] {
    return Array.from(this.map.keys())
  }

  values(): V[] {
    return Array.from(this.map.values())
  }

  entries(): [K, V][] {
    return Array.from(this.map.entries())
  }

  forEach(fn: (value: V, key: K) => void): void {
    this.map.forEach((v, k) => fn(v, k))
  }

  count(): number { return this.map.size }

  toArray(): [K, V][] { return this.entries() }
  toString(): string { return JSON.stringify({ size: this.size() }) }
  toJSON(): Record<string, unknown> { return { size: this.size(), keys: this.keys() } }
  clone(): ConcurrentMap2<K, V> {
    const cm = new ConcurrentMap2<K, V>()
    this.map.forEach((v, k) => cm.set(k, v))
    return cm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConcurrentMap2)) return false
    return this.size() === other.size()
  }
}
