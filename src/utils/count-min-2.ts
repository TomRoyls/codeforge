export class CountMin2 {
  private table: number[][]
  readonly width: number
  readonly depth: number

  constructor(width: number, depth: number) {
    this.width = width
    this.depth = depth
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0))
  }

  private hashes(item: string): number[] {
    const result: number[] = []
    for (let d = 0; d < this.depth; d++) {
      let h = d
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) - h + item.charCodeAt(i) * (d + 1)) | 0
      }
      result.push(Math.abs(h) % this.width)
    }
    return result
  }

  increment(item: string, count = 1): void {
    const indices = this.hashes(item)
    for (let d = 0; d < this.depth; d++) {
      this.table[d][indices[d]] += count
    }
  }

  estimate(item: string): number {
    const indices = this.hashes(item)
    let min = Infinity
    for (let d = 0; d < this.depth; d++) {
      const val = this.table[d][indices[d]]
      if (val < min) min = val
    }
    return min
  }

  get isEmpty(): boolean { return this.table.every(row => row.every(v => v === 0)) }

  clear(): void { for (const row of this.table) row.fill(0) }

  toArray(): number[][] { return this.table.map(r => [...r]) }
  toString(): string { return JSON.stringify({ width: this.width, depth: this.depth }) }
  toJSON(): Record<string, number> { return { width: this.width, depth: this.depth } }

  clone(): CountMin2 {
    const c = new CountMin2(this.width, this.depth)
    c.table = this.table.map(r => [...r])
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CountMin2)) return false
    return this.width === other.width && this.depth === other.depth
  }
}
