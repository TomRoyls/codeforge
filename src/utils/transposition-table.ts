export class TranspositionTable {
  private table = new Map<string, { value: number; depth: number; flag: string }>()

  store(key: string, value: number, depth: number, flag: string): void {
    this.table.set(key, { value, depth, flag })
  }

  probe(key: string): { value: number; depth: number; flag: string } | undefined {
    return this.table.get(key)
  }

  has(key: string): boolean { return this.table.has(key) }

  get size(): number { return this.table.size }
  get isEmpty(): boolean { return this.table.size === 0 }

  clear(): void { this.table.clear() }

  toArray(): string[] { return Array.from(this.table.keys()) }
  toString(): string { return JSON.stringify({ entries: this.table.size }) }
  toJSON(): Record<string, number> { return { entries: this.table.size } }

  clone(): TranspositionTable {
    const c = new TranspositionTable()
    for (const [k, v] of this.table) c.table.set(k, { ...v })
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TranspositionTable)) return false
    return this.size === other.size
  }
}
