export class ClockCache<K, V> {
  private entries = new Map<K, { value: V; referenced: boolean }>()
  private keys: K[] = []
  private hand = 0
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    entry.referenced = true
    return entry.value
  }

  set(key: K, value: V): void {
    if (this.entries.has(key)) {
      const entry = this.entries.get(key)!
      entry.value = value
      entry.referenced = true
      return
    }
    if (this.entries.size >= this.maxSize) {
      this.evict()
    }
    this.entries.set(key, { value, referenced: true })
    this.keys.push(key)
  }

  has(key: K): boolean {
    return this.entries.has(key)
  }

  delete(key: K): boolean {
    if (!this.entries.delete(key)) return false
    const idx = this.keys.indexOf(key)
    if (idx >= 0) this.keys.splice(idx, 1)
    return true
  }

  private evict(): void {
    while (this.keys.length > 0) {
      const key = this.keys[this.hand % this.keys.length]!
      const entry = this.entries.get(key)
      if (entry && entry.referenced) {
        entry.referenced = false
        this.hand = (this.hand + 1) % this.keys.length
      } else {
        this.delete(key)
        this.hand = this.hand % Math.max(1, this.keys.length)
        return
      }
    }
  }

  get size(): number {
    return this.entries.size
  }

  get isEmpty(): boolean {
    return this.entries.size === 0
  }

  get capacity(): number {
    return this.maxSize
  }

  clear(): void {
    this.entries.clear()
    this.keys = []
    this.hand = 0
  }

  toArray(): Array<[K, V]> {
    return Array.from(this.entries.entries()).map(([k, v]) => [k, v.value])
  }

  toString(): string {
    return JSON.stringify({ size: this.size, capacity: this.maxSize })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size, capacity: this.maxSize }
  }

  clone(): ClockCache<K, V> {
    const copy = new ClockCache<K, V>(this.maxSize)
    for (const [key, entry] of this.entries) {
      copy.entries.set(key, { ...entry })
    }
    copy.keys = [...this.keys]
    copy.hand = this.hand
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ClockCache)) return false
    return this.size === other.size && this.maxSize === other.maxSize
  }
}
