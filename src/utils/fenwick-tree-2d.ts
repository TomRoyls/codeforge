export class FenwickTree2D {
  private tree: number[][]
  private rows: number
  private cols: number

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.tree = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
  }

  update(row: number, col: number, delta: number): void {
    for (let i = row + 1; i <= this.rows; i += i & -i) {
      for (let j = col + 1; j <= this.cols; j += j & -j) {
        this.tree[i]![j]! += delta
      }
    }
  }

  query(row: number, col: number): number {
    let sum = 0
    for (let i = row + 1; i > 0; i -= i & -i) {
      for (let j = col + 1; j > 0; j -= j & -j) {
        sum += this.tree[i]![j]!
      }
    }
    return sum
  }

  queryRange(r1: number, c1: number, r2: number, c2: number): number {
    return this.query(r2, c2) - this.query(r1 - 1, c2) - this.query(r2, c1 - 1) + this.query(r1 - 1, c1 - 1)
  }

  get dimensions(): [number, number] { return [this.rows, this.cols] }
  get isEmpty(): boolean { return this.rows === 0 || this.cols === 0 }

  clear(): void {
    this.tree = Array.from({ length: this.rows + 1 }, () => new Array(this.cols + 1).fill(0))
  }

  toArray(): number[][] {
    return this.tree.slice(1).map((row) => row.slice(1))
  }

  toString(): string { return JSON.stringify({ rows: this.rows, cols: this.cols }) }
  toJSON(): Record<string, number> { return { rows: this.rows, cols: this.cols } }

  clone(): FenwickTree2D {
    const c = new FenwickTree2D(this.rows, this.cols)
    c.tree = this.tree.map((row) => [...row])
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FenwickTree2D)) return false
    return this.rows === other.rows && this.cols === other.cols
  }
}
