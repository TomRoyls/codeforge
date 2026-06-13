export class SparseMatrix2 {
  private rows = new Map<number, Map<number, number>>()
  readonly nRows: number
  readonly nCols: number

  constructor(nRows: number, nCols: number) {
    this.nRows = nRows
    this.nCols = nCols
  }

  set(row: number, col: number, value: number): void {
    if (value === 0) { this.delete(row, col); return }
    if (!this.rows.has(row)) this.rows.set(row, new Map())
    this.rows.get(row)!.set(col, value)
  }

  get(row: number, col: number): number {
    return this.rows.get(row)?.get(col) ?? 0
  }

  delete(row: number, col: number): boolean {
    const rowMap = this.rows.get(row)
    if (rowMap?.delete(col)) {
      if (rowMap.size === 0) this.rows.delete(row)
      return true
    }
    return false
  }

  has(row: number, col: number): boolean {
    return this.rows.get(row)?.has(col) ?? false
  }

  nonZeroCount(): number {
    let count = 0
    for (const rowMap of this.rows.values()) count += rowMap.size
    return count
  }

  multiply(other: SparseMatrix2): SparseMatrix2 {
    const result = new SparseMatrix2(this.nRows, other.nCols)
    for (const [i, rowMap] of this.rows) {
      for (const [k, v1] of rowMap) {
        const otherRow = other.rows.get(k)
        if (!otherRow) continue
        for (const [j, v2] of otherRow) {
          result.set(i, j, result.get(i, j) + v1 * v2)
        }
      }
    }
    return result
  }

  get isEmpty(): boolean { return this.rows.size === 0 }

  clear(): void { this.rows.clear() }

  toArray(): Array<[number, number, number]> {
    const result: Array<[number, number, number]> = []
    for (const [row, rowMap] of this.rows) {
      for (const [col, val] of rowMap) {
        result.push([row, col, val])
      }
    }
    return result
  }

  toString(): string { return JSON.stringify({ rows: this.nRows, cols: this.nCols, nonZeros: this.nonZeroCount() }) }
  toJSON(): Record<string, number> { return { rows: this.nRows, cols: this.nCols, nonZeros: this.nonZeroCount() } }

  clone(): SparseMatrix2 {
    const c = new SparseMatrix2(this.nRows, this.nCols)
    for (const [row, rowMap] of this.rows) {
      for (const [col, val] of rowMap) c.set(row, col, val)
    }
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SparseMatrix2)) return false
    return this.nonZeroCount() === other.nonZeroCount()
  }
}
