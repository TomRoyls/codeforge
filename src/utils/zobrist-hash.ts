export class ZobristHash {
  private table: bigint[][]
  private hash: bigint = 0n

  constructor(maxItems: number, maxPositions: number) {
    this.table = []
    for (let i = 0; i < maxItems; i++) {
      const row: bigint[] = []
      for (let j = 0; j < maxPositions; j++) {
        let h = 0n
        for (let k = 0; k < 4; k++) h = (h << 16n) | BigInt(Math.floor(Math.random() * 65536))
        row.push(h)
      }
      this.table.push(row)
    }
  }

  toggle(item: number, position: number): void {
    this.hash ^= this.table[item]![position]!
  }

  set(item: number, position: number): void { this.toggle(item, position) }
  unset(item: number, position: number): void { this.toggle(item, position) }

  get current(): bigint { return this.hash }
  get isEmpty(): boolean { return this.hash === 0n }

  reset(): void { this.hash = 0n }

  toArray(): bigint[] { return [this.hash] }
  toString(): string { return JSON.stringify({ hash: this.hash.toString() }) }
  toJSON(): Record<string, string> { return { hash: this.hash.toString() } }

  clone(): ZobristHash {
    const c = new ZobristHash(this.table.length, this.table[0]?.length ?? 0)
    c.hash = this.hash
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ZobristHash)) return false
    return this.hash === other.hash
  }
}
