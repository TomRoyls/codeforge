import type { FenwickTree2DOptions } from './types.js'
import { DEFAULT_FENWICK_TREE_2D_OPTIONS } from './types.js'

export class FenwickTree2D {
  private tree: number[][]
  private _rows: number
  private _cols: number
  private defaultValue: number

  constructor(rows: number, cols: number, options?: Partial<FenwickTree2DOptions>) {
    const opts: FenwickTree2DOptions = { ...DEFAULT_FENWICK_TREE_2D_OPTIONS, ...options }
    this.defaultValue = opts.defaultValue
    this._rows = rows
    this._cols = cols
    this.tree = this.createTree(rows, cols)
  }

  private createTree(rows: number, cols: number): number[][] {
    const t: number[][] = []
    for (let i = 0; i <= rows; i++) {
      t[i] = new Array<number>(cols + 1).fill(0)
    }
    return t
  }

  update(row: number, col: number, delta: number): void {
    this.validateRow(row)
    this.validateCol(col)
    let i = row + 1
    while (i <= this._rows) {
      let j = col + 1
      while (j <= this._cols) {
        this.tree[i]![j] = (this.tree[i]![j] ?? 0) + delta
        j += this.lsb(j)
      }
      i += this.lsb(i)
    }
  }

  query(row: number, col: number): number {
    if (this._rows === 0 || this._cols === 0) {
      return this.defaultValue
    }
    if (row < 0 || col < 0) {
      return this.defaultValue
    }
    const clampedRow = Math.min(row, this._rows - 1)
    const clampedCol = Math.min(col, this._cols - 1)
    let sum = 0
    let i = clampedRow + 1
    while (i > 0) {
      let j = clampedCol + 1
      while (j > 0) {
        sum += this.tree[i]![j] ?? 0
        j -= this.lsb(j)
      }
      i -= this.lsb(i)
    }
    return sum
  }

  rangeQuery(r1: number, c1: number, r2: number, c2: number): number {
    if (r1 > r2 || c1 > c2) {
      return this.defaultValue
    }
    if (r1 <= 0 && c1 <= 0) {
      return this.query(r2, c2)
    }
    if (r1 <= 0) {
      return this.query(r2, c2) - this.query(r2, c1 - 1)
    }
    if (c1 <= 0) {
      return this.query(r2, c2) - this.query(r1 - 1, c2)
    }
    return (
      this.query(r2, c2) -
      this.query(r1 - 1, c2) -
      this.query(r2, c1 - 1) +
      this.query(r1 - 1, c1 - 1)
    )
  }

  get(row: number, col: number): number {
    this.validateRow(row)
    this.validateCol(col)
    if (row === 0 && col === 0) {
      return this.query(0, 0)
    }
    if (row === 0) {
      return this.query(0, col) - this.query(0, col - 1)
    }
    if (col === 0) {
      return this.query(row, 0) - this.query(row - 1, 0)
    }
    return (
      this.query(row, col) -
      this.query(row - 1, col) -
      this.query(row, col - 1) +
      this.query(row - 1, col - 1)
    )
  }

  set(row: number, col: number, value: number): void {
    const current = this.get(row, col)
    const delta = value - current
    this.update(row, col, delta)
  }

  getRows(): number {
    return this._rows
  }

  getCols(): number {
    return this._cols
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = []
      for (let j = 0; j < this._cols; j++) {
        row.push(this.get(i, j))
      }
      result.push(row)
    }
    return result
  }

  static fromMatrix(data: number[][]): FenwickTree2D {
    const rows = data.length
    const cols = rows > 0 ? data[0]!.length : 0
    const ft = new FenwickTree2D(rows, cols)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ft.update(i, j, data[i]![j] ?? 0)
      }
    }
    return ft
  }

  clone(): FenwickTree2D {
    const copy = new FenwickTree2D(this._rows, this._cols, {
      defaultValue: this.defaultValue,
    })
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        copy.set(i, j, this.get(i, j))
      }
    }
    return copy
  }

  reset(): void {
    this.tree = this.createTree(this._rows, this._cols)
  }

  private lsb(i: number): number {
    return i & -i
  }

  private validateRow(row: number): void {
    if (row < 0 || row >= this._rows) {
      throw new RangeError(`Row ${row} out of bounds [0, ${this._rows - 1}]`)
    }
  }

  private validateCol(col: number): void {
    if (col < 0 || col >= this._cols) {
      throw new RangeError(`Col ${col} out of bounds [0, ${this._cols - 1}]`)
    }
  }
}

export { DEFAULT_FENWICK_TREE_2D_OPTIONS } from './types.js'
export type { FenwickTree2DOptions } from './types.js'
