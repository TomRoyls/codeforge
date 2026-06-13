export class CountMinSketch {
  private table: number[][]
  private width: number
  private depth: number

  constructor(width = 1000, depth = 5) {
    this.width = width
    this.depth = depth
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0))
  }

  add(item: string, count = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const hash = this.hash(item, i)
      this.table[i]![hash] += count
    }
  }

  count(item: string): number {
    let min = Infinity
    for (let i = 0; i < this.depth; i++) {
      const hash = this.hash(item, i)
      min = Math.min(min, this.table[i]![hash]!)
    }
    return min
  }

  get isEmpty(): boolean {
    for (const row of this.table) {
      for (const cell of row) {
        if (cell > 0) return false
      }
    }
    return true
  }

  clear(): void {
    for (const row of this.table) row.fill(0)
  }

  get tableSize(): number {
    return this.width * this.depth
  }

  toArray(): number[][] {
    return this.table.map((row) => [...row])
  }

  toString(): string {
    return JSON.stringify({ width: this.width, depth: this.depth })
  }

  toJSON(): Record<string, number> {
    return { width: this.width, depth: this.depth, tableSize: this.tableSize }
  }

  clone(): CountMinSketch {
    const copy = new CountMinSketch(this.width, this.depth)
    copy.table = this.table.map((row) => [...row])
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CountMinSketch)) return false
    return this.width === other.width && this.depth === other.depth
  }

  private hash(item: string, seed: number): number {
    let hash = (5381 + seed * 31) | 0
    for (let i = 0; i < item.length; i++) {
      hash = ((hash << 5) + hash + item.charCodeAt(i)) | 0
    }
    return Math.abs(hash) % this.width
  }
}
