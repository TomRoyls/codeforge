export class TimedCache<V> {
  private data = new Map<string, { value: V; expires: number }>()

  constructor(private defaultTtlMs: number = 60000) {}

  set(key: string, value: V, ttlMs?: number): void {
    this.data.set(key, { value, expires: Date.now() + (ttlMs ?? this.defaultTtlMs) })
  }

  get(key: string): V | undefined {
    const entry = this.data.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expires) {
      this.data.delete(key)
      return undefined
    }
    return entry.value
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    return this.data.delete(key)
  }

  get size(): number {
    this.evict()
    return this.data.size
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  private evict(): void {
    const now = Date.now()
    for (const [key, entry] of this.data) {
      if (now > entry.expires) this.data.delete(key)
    }
  }

  clear(): void {
    this.data.clear()
  }

  toArray(): Array<[string, V]> {
    this.evict()
    return Array.from(this.data.entries()).map(([k, v]) => [k, v.value])
  }

  toString(): string {
    return JSON.stringify({ size: this.size, defaultTtlMs: this.defaultTtlMs })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size, defaultTtlMs: this.defaultTtlMs }
  }

  clone(): TimedCache<V> {
    const copy = new TimedCache<V>(this.defaultTtlMs)
    for (const [key, entry] of this.data) {
      copy.data.set(key, { ...entry })
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TimedCache)) return false
    return this.size === other.size && this.defaultTtlMs === other.defaultTtlMs
  }
}
