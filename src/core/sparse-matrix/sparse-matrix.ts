import type { MatrixEntry, MatrixDimensions, SparseMatrixOptions, MatrixStats } from './types.js'
import { DEFAULT_SPARSE_MATRIX_OPTIONS } from './types.js'

export class SparseMatrix {
  private data: Map<string, number>
  private rowCount: number
  private colCount: number
  private defaultValue: number

  constructor(options?: Partial<SparseMatrixOptions>) {
    const opts: SparseMatrixOptions = { ...DEFAULT_SPARSE_MATRIX_OPTIONS, ...options }
    this.rowCount = opts.rows
    this.colCount = opts.cols
    this.defaultValue = opts.defaultValue
    this.data = new Map()
  }

  private validateBounds(row: number, col: number): void {
    if (row < 0 || row >= this.rowCount) {
      throw new RangeError(`Row index ${row} out of bounds [0, ${this.rowCount})`)
    }
    if (col < 0 || col >= this.colCount) {
      throw new RangeError(`Column index ${col} out of bounds [0, ${this.colCount})`)
    }
  }

  private key(row: number, col: number): string {
    return `${row},${col}`
  }

  set(row: number, col: number, value: number): void {
    this.validateBounds(row, col)
    const k = this.key(row, col)
    if (value === this.defaultValue) {
      this.data.delete(k)
    } else {
      this.data.set(k, value)
    }
  }

  get(row: number, col: number): number {
    this.validateBounds(row, col)
    const k = this.key(row, col)
    const val = this.data.get(k)
    return val !== undefined ? val : this.defaultValue
  }

  has(row: number, col: number): boolean {
    this.validateBounds(row, col)
    return this.data.has(this.key(row, col))
  }

  remove(row: number, col: number): boolean {
    this.validateBounds(row, col)
    return this.data.delete(this.key(row, col))
  }

  getRow(row: number): MatrixEntry[] {
    if (row < 0 || row >= this.rowCount) {
      throw new RangeError(`Row index ${row} out of bounds [0, ${this.rowCount})`)
    }
    const entries: MatrixEntry[] = []
    for (const [k, value] of this.data) {
      const commaIdx = k.indexOf(',')
      const r = Number(k.substring(0, commaIdx))
      const c = Number(k.substring(commaIdx + 1))
      if (r === row) {
        entries.push({ row: r, col: c, value })
      }
    }
    entries.sort((a, b) => a.col - b.col)
    return entries
  }

  getColumn(col: number): MatrixEntry[] {
    if (col < 0 || col >= this.colCount) {
      throw new RangeError(`Column index ${col} out of bounds [0, ${this.colCount})`)
    }
    const entries: MatrixEntry[] = []
    for (const [k, value] of this.data) {
      const commaIdx = k.indexOf(',')
      const r = Number(k.substring(0, commaIdx))
      const c = Number(k.substring(commaIdx + 1))
      if (c === col) {
        entries.push({ row: r, col: c, value })
      }
    }
    entries.sort((a, b) => a.row - b.row)
    return entries
  }

  getDimensions(): MatrixDimensions {
    return { rows: this.rowCount, cols: this.colCount }
  }

  getNonZeroCount(): number {
    return this.data.size
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let r = 0; r < this.rowCount; r++) {
      const row: number[] = []
      for (let c = 0; c < this.colCount; c++) {
        const val = this.data.get(this.key(r, c))
        row.push(val !== undefined ? val : this.defaultValue)
      }
      result.push(row)
    }
    return result
  }

  add(other: SparseMatrix): SparseMatrix {
    if (this.rowCount !== other.rowCount || this.colCount !== other.colCount) {
      throw new Error('Matrix dimensions must match for addition')
    }
    const result = new SparseMatrix({
      rows: this.rowCount,
      cols: this.colCount,
      defaultValue: this.defaultValue,
    })
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.colCount; c++) {
        const sum = this.get(r, c) + other.get(r, c)
        result.set(r, c, sum)
      }
    }
    return result
  }

  scale(factor: number): SparseMatrix {
    const result = new SparseMatrix({
      rows: this.rowCount,
      cols: this.colCount,
      defaultValue: this.defaultValue * factor,
    })
    for (const [k, value] of this.data) {
      const commaIdx = k.indexOf(',')
      const r = Number(k.substring(0, commaIdx))
      const c = Number(k.substring(commaIdx + 1))
      result.set(r, c, value * factor)
    }
    return result
  }

  transpose(): SparseMatrix {
    const result = new SparseMatrix({
      rows: this.colCount,
      cols: this.rowCount,
      defaultValue: this.defaultValue,
    })
    for (const [k, value] of this.data) {
      const commaIdx = k.indexOf(',')
      const r = Number(k.substring(0, commaIdx))
      const c = Number(k.substring(commaIdx + 1))
      result.set(c, r, value)
    }
    return result
  }

  getStats(): MatrixStats {
    const totalCells = this.rowCount * this.colCount
    const nonZeroCount = this.data.size
    const density = totalCells > 0 ? nonZeroCount / totalCells : 0
    const fillFactor = totalCells > 0 ? nonZeroCount / totalCells : 0
    return {
      rows: this.rowCount,
      cols: this.colCount,
      nonZeroCount,
      density,
      fillFactor,
    }
  }

  clear(): void {
    this.data.clear()
  }

  forEach(callback: (entry: MatrixEntry) => void): void {
    for (const [k, value] of this.data) {
      const commaIdx = k.indexOf(',')
      const r = Number(k.substring(0, commaIdx))
      const c = Number(k.substring(commaIdx + 1))
      callback({ row: r, col: c, value })
    }
  }
}

export { DEFAULT_SPARSE_MATRIX_OPTIONS } from './types.js'
export type { MatrixEntry, MatrixDimensions, SparseMatrixOptions, MatrixStats } from './types.js'
