export class SlidingWindowMap<K, V> {
  private data = new Map<K, { value: V; timestamp: number }>()
  private windowMs: number

  constructor(windowMs = 60000) {
    this.windowMs = windowMs
  }

  set(key: K, value: V): void {
    this.evict()
    this.data.set(key, { value, timestamp: Date.now() })
  }

  get(key: K): V | undefined {
    this.evict()
    const entry = this.data.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.timestamp > this.windowMs) {
      this.data.delete(key)
      return undefined
    }
    return entry.value
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    return this.data.delete(key)
  }

  private evict(): void {
    const now = Date.now()
    for (const [key, entry] of this.data) {
      if (now - entry.timestamp > this.windowMs) {
        this.data.delete(key)
      }
    }
  }

  get size(): number {
    this.evict()
    return this.data.size
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.data.clear()
  }

  toArray(): Array<[K, V]> {
    this.evict()
    return Array.from(this.data.entries()).map(([k, v]) => [k, v.value])
  }

  toString(): string {
    return JSON.stringify({ size: this.size, windowMs: this.windowMs })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size, windowMs: this.windowMs }
  }

  clone(): SlidingWindowMap<K, V> {
    const copy = new SlidingWindowMap<K, V>(this.windowMs)
    for (const [key, entry] of this.data) {
      copy.data.set(key, { ...entry })
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SlidingWindowMap)) return false
    return this.size === other.size && this.windowMs === other.windowMs
  }
}
