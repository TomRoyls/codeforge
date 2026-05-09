import type { BinaryIndexedTree2DOptions, Dimensions } from "./types.js"

export class BinaryIndexedTree2D {
  private readonly _rows: number
  private readonly _cols: number
  private readonly _tree: number[][]
  private readonly _original: number[][]

  constructor(options: BinaryIndexedTree2DOptions) {
    this._rows = options.rows
    this._cols = options.cols
    const defaultVal = options.defaultValue ?? 0

    this._tree = []
    this._original = []

    for (let i = 0; i <= this._rows; i++) {
      const treeRow: number[] = []
      const origRow: number[] = []
      for (let j = 0; j <= this._cols; j++) {
        treeRow.push(0)
        if (i > 0 && j > 0) {
          origRow.push(defaultVal)
        }
      }
      this._tree.push(treeRow)
      if (i > 0) {
        this._original.push(origRow)
      }
    }

    if (defaultVal !== 0) {
      for (let r = 0; r < this._rows; r++) {
        for (let c = 0; c < this._cols; c++) {
          this._updateInternal(r + 1, c + 1, defaultVal)
        }
      }
    }
  }

  private _updateInternal(row: number, col: number, delta: number): void {
    for (let i = row; i <= this._rows; i += i & -i) {
      const treeRow = this._tree[i]
      if (treeRow === undefined) continue
      for (let j = col; j <= this._cols; j += j & -j) {
        treeRow[j] = (treeRow[j] ?? 0) + delta
      }
    }
  }

  update(row: number, col: number, delta: number): void {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new RangeError(`Index out of bounds: (${row}, ${col}) for grid of size (${this._rows}, ${this._cols})`)
    }
    const origRow = this._original[row]
    if (origRow !== undefined) {
      origRow[col] = (origRow[col] ?? 0) + delta
    }
    this._updateInternal(row + 1, col + 1, delta)
  }

  query(row: number, col: number): number {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new RangeError(`Index out of bounds: (${row}, ${col}) for grid of size (${this._rows}, ${this._cols})`)
    }
    let sum = 0
    for (let i = row + 1; i > 0; i -= i & -i) {
      const treeRow = this._tree[i]
      if (treeRow === undefined) continue
      for (let j = col + 1; j > 0; j -= j & -j) {
        sum += treeRow[j] ?? 0
      }
    }
    return sum
  }

  rangeQuery(r1: number, c1: number, r2: number, c2: number): number {
    if (r1 < 0 || r1 >= this._rows || c1 < 0 || c1 >= this._cols) {
      throw new RangeError(`Range start out of bounds: (${r1}, ${c1})`)
    }
    if (r2 < 0 || r2 >= this._rows || c2 < 0 || c2 >= this._cols) {
      throw new RangeError(`Range end out of bounds: (${r2}, ${c2})`)
    }
    if (r1 > r2 || c1 > c2) {
      throw new RangeError(`Invalid range: (${r1}, ${c1}) to (${r2}, ${c2})`)
    }

    let result = 0
    for (let i = r2 + 1; i > 0; i -= i & -i) {
      const treeRow = this._tree[i]
      if (treeRow === undefined) continue
      for (let j = c2 + 1; j > 0; j -= j & -j) {
        result += treeRow[j] ?? 0
      }
    }

    if (r1 > 0) {
      for (let i = r1; i > 0; i -= i & -i) {
        const treeRow = this._tree[i]
        if (treeRow === undefined) continue
        for (let j = c2 + 1; j > 0; j -= j & -j) {
          result -= treeRow[j] ?? 0
        }
      }
    }

    if (c1 > 0) {
      for (let i = r2 + 1; i > 0; i -= i & -i) {
        const treeRow = this._tree[i]
        if (treeRow === undefined) continue
        for (let j = c1; j > 0; j -= j & -j) {
          result -= treeRow[j] ?? 0
        }
      }
    }

    if (r1 > 0 && c1 > 0) {
      for (let i = r1; i > 0; i -= i & -i) {
        const treeRow = this._tree[i]
        if (treeRow === undefined) continue
        for (let j = c1; j > 0; j -= j & -j) {
          result += treeRow[j] ?? 0
        }
      }
    }

    return result
  }

  set(row: number, col: number, value: number): void {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new RangeError(`Index out of bounds: (${row}, ${col}) for grid of size (${this._rows}, ${this._cols})`)
    }
    const origRow = this._original[row]
    const current = origRow?.[col] ?? 0
    const delta = value - current
    if (delta !== 0) {
      if (origRow !== undefined) {
        origRow[col] = value
      }
      this._updateInternal(row + 1, col + 1, delta)
    }
  }

  get(row: number, col: number): number {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new RangeError(`Index out of bounds: (${row}, ${col}) for grid of size (${this._rows}, ${this._cols})`)
    }
    return this._original[row]?.[col] ?? 0
  }

  dimensions(): Dimensions {
    return { rows: this._rows, cols: this._cols }
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = []
      const origRow = this._original[i]
      for (let j = 0; j < this._cols; j++) {
        row.push(origRow?.[j] ?? 0)
      }
      result.push(row)
    }
    return result
  }

  clear(): void {
    for (let i = 0; i < this._rows; i++) {
      const origRow = this._original[i]
      if (origRow === undefined) continue
      for (let j = 0; j < this._cols; j++) {
        origRow[j] = 0
      }
    }
    for (let i = 0; i <= this._rows; i++) {
      const treeRow = this._tree[i]
      if (treeRow === undefined) continue
      for (let j = 0; j <= this._cols; j++) {
        treeRow[j] = 0
      }
    }
  }
}
