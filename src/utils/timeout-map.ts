export class TimeoutMap<T> {
  private data: Map<string, { value: T; expires: number }> = new Map()
  private defaultTtl: number

  constructor(defaultTtl = 60000) {
    this.defaultTtl = defaultTtl
  }

  set(key: string, value: T, ttl?: number): void {
    this.data.set(key, { value, expires: Date.now() + (ttl ?? this.defaultTtl) })
  }

  get(key: string): T | undefined {
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

  get isEmpty(): boolean { return this.size === 0 }

  private evict(): void {
    const now = Date.now()
    for (const [key, entry] of this.data) {
      if (now > entry.expires) this.data.delete(key)
    }
  }

  clear(): void { this.data.clear() }

  toArray(): Array<{ key: string; value: T }> {
    this.evict()
    return Array.from(this.data.entries()).map(([k, v]) => ({ key: k, value: v.value }))
  }

  toString(): string { return JSON.stringify({ size: this.data.size }) }
  toJSON(): Record<string, number> { return { size: this.data.size } }

  clone(): TimeoutMap<T> {
    const c = new TimeoutMap<T>(this.defaultTtl)
    c.data = new Map(this.data)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TimeoutMap)) return false
    return this.data.size === other.data.size
  }
}
