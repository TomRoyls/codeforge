export class TreeMap2<K = string> {
  private entries: Array<{ key: K; value: unknown }> = []

  set(key: K, value: unknown): void {
    const idx = this.entries.findIndex(e => e.key === key)
    if (idx !== -1) {
      this.entries[idx].value = value
    } else {
      this.entries.push({ key, value })
    }
  }

  get(key: K): unknown | undefined {
    return this.entries.find(e => e.key === key)?.value
  }

  has(key: K): boolean {
    return this.entries.some(e => e.key === key)
  }

  delete(key: K): boolean {
    const idx = this.entries.findIndex(e => e.key === key)
    if (idx !== -1) { this.entries.splice(idx, 1); return true }
    return false
  }

  firstKey(): K | undefined { return this.entries[0]?.key }
  lastKey(): K | undefined { return this.entries[this.entries.length - 1]?.key }

  keys(): K[] { return this.entries.map(e => e.key) }
  values(): unknown[] { return this.entries.map(e => e.value) }

  get size(): number { return this.entries.length }
  get isEmpty(): boolean { return this.entries.length === 0 }

  clear(): void { this.entries = [] }

  toArray(): Array<{ key: K; value: unknown }> { return [...this.entries] }
  toString(): string { return JSON.stringify({ size: this.entries.length }) }
  toJSON(): Record<string, number> { return { size: this.entries.length } }

  clone(): TreeMap2<K> {
    const c = new TreeMap2<K>()
    c.entries = this.entries.map(e => ({ ...e }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TreeMap2)) return false
    return this.size === other.size
  }
}
