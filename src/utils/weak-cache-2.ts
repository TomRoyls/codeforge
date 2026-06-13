export class WeakCache2<K extends object, V> {
  private cache = new WeakMap<K, V>()
  private keys = new Set<WeakRef<K>>()
  private registry = new FinalizationRegistry<WeakRef<K>>((ref) => {
    this.keys.delete(ref)
  })

  set(key: K, value: V): void {
    this.cache.set(key, value)
    const ref = new WeakRef(key)
    this.keys.add(ref)
    this.registry.register(key, ref, key)
  }

  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    const existed = this.cache.delete(key)
    if (existed) {
      for (const ref of this.keys) {
        const k = ref.deref()
        if (k === key || k === undefined) this.keys.delete(ref)
      }
    }
    return existed
  }

  get liveCount(): number {
    let count = 0
    for (const ref of this.keys) {
      if (ref.deref() !== undefined) count++
    }
    return count
  }

  clear(): void {
    this.cache = new WeakMap()
    this.keys.clear()
  }

  toArray(): K[] {
    const result: K[] = []
    for (const ref of this.keys) {
      const k = ref.deref()
      if (k) result.push(k)
    }
    return result
  }

  toString(): string { return JSON.stringify({ liveKeys: this.liveCount }) }
  toJSON(): Record<string, number> { return { liveKeys: this.liveCount } }
  clone(): WeakCache2<K, V> { return new WeakCache2<K, V>() }
  equals(other: unknown): boolean { return other instanceof WeakCache2 }
}
