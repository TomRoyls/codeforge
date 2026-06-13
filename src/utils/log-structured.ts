export class LogStructured {
  private entries: Array<{ key: string; value: unknown; timestamp: number }> = []
  private index = new Map<string, number>()

  put(key: string, value: unknown): void {
    const timestamp = Date.now()
    this.entries.push({ key, value, timestamp })
    this.index.set(key, this.entries.length - 1)
  }

  get(key: string): unknown | undefined {
    const idx = this.index.get(key)
    return idx !== undefined ? this.entries[idx]?.value : undefined
  }

  has(key: string): boolean { return this.index.has(key) }

  delete(key: string): boolean {
    if (!this.index.has(key)) return false
    this.index.delete(key)
    return true
  }

  compact(): void {
    const newEntries: Array<{ key: string; value: unknown; timestamp: number }> = []
    const newIndex = new Map<string, number>()
    for (const [key, oldIdx] of this.index) {
      newIndex.set(key, newEntries.length)
      newEntries.push(this.entries[oldIdx]!)
    }
    this.entries = newEntries
    this.index = newIndex
  }

  get size(): number { return this.index.size }
  get entryCount(): number { return this.entries.length }
  get isEmpty(): boolean { return this.index.size === 0 }
  get needsCompaction(): boolean { return this.entries.length > this.index.size * 1.5 }

  clear(): void { this.entries = []; this.index.clear() }

  toArray(): Array<{ key: string; value: unknown }> {
    return this.entries.filter((e) => this.index.has(e.key)).map(({ key, value }) => ({ key, value }))
  }

  toString(): string { return JSON.stringify({ entries: this.entries.length, keys: this.index.size }) }
  toJSON(): Record<string, number> { return { entries: this.entries.length, keys: this.index.size } }

  clone(): LogStructured {
    const c = new LogStructured()
    for (const e of this.entries) c.put(e.key, e.value)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LogStructured)) return false
    return this.size === other.size
  }
}
