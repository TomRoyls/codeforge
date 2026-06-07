export class DifferenceArray2D {
  private readonly diff: Float64Array
  private readonly rows: number
  private readonly cols: number

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.diff = new Float64Array((rows + 1) * (cols + 1))
  }

  add(r1: number, c1: number, r2: number, c2: number, value: number): void {
    if (r1 < 0 || c1 < 0 || r2 >= this.rows || c2 >= this.cols || r1 > r2 || c1 > c2) return
    const w = this.cols + 1
    this.diff[r1 * w + c1]! += value
    this.diff[r1 * w + (c2 + 1)]! -= value
    this.diff[(r2 + 1) * w + c1]! -= value
    this.diff[(r2 + 1) * w + (c2 + 1)]! += value
  }

  addPoint(r: number, c: number, value: number): void {
    this.add(r, c, r, c, value)
  }

  build(): Float64Array {
    const result = new Float64Array(this.rows * this.cols)
    const w = this.cols + 1
    const prefix = new Float64Array((this.rows + 1) * (this.cols + 1))

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        prefix[i * w + j]! = this.diff[i * w + j]!
          + (i > 0 ? prefix[(i - 1) * w + j]! : 0)
          + (j > 0 ? prefix[i * w + (j - 1)]! : 0)
          - (i > 0 && j > 0 ? prefix[(i - 1) * w + (j - 1)]! : 0)
        result[i * this.cols + j] = prefix[i * w + j]!
      }
    }

    return result
  }

  buildGrid(): number[][] {
    const flat = this.build()
    const grid: number[][] = []
    for (let i = 0; i < this.rows; i++) {
      const row: number[] = []
      for (let j = 0; j < this.cols; j++) {
        row.push(flat[i * this.cols + j]!)
      }
      grid.push(row)
    }
    return grid
  }

  get rowCount(): number {
    return this.rows
  }

  get colCount(): number {
    return this.cols
  }

  toString(): string {
    return `DifferenceArray2D(${this.rows}x${this.cols})`
  }

  toJSON(): { rows: number; cols: number; diff: number[] } {
    return { rows: this.rows, cols: this.cols, diff: Array.from(this.diff) }
  }

  clone(): DifferenceArray2D {
    const copy = new DifferenceArray2D(this.rows, this.cols)
    copy.diff.set(this.diff)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DifferenceArray2D)) return false
    if (this.rows !== other.rows || this.cols !== other.cols) return false
    for (let i = 0; i < this.diff.length; i++) {
      if (this.diff[i] !== other.diff[i]) return false
    }
    return true
  }
}
