export class SparseMatrix {
  private readonly data: Map<string, number>
  private readonly _rows: number
  private readonly _cols: number

  constructor(rows: number, cols: number) {
    if (rows <= 0 || cols <= 0) {
      throw new Error('Rows and cols must be positive integers')
    }
    this._rows = rows
    this._cols = cols
    this.data = new Map()
  }

  private static key(row: number, col: number): string {
    return `${row},${col}`
  }

  private parseKey(key: string): [number, number] {
    const parts = key.split(',')
    return [Number(parts[0]), Number(parts[1])]
  }

  static fromDense(data: number[][]): SparseMatrix {
    const rows = data.length
    if (rows === 0) throw new Error('Data must have at least one row')
    const cols = data[0]!.length
    if (cols === 0) throw new Error('Data must have at least one column')

    const matrix = new SparseMatrix(rows, cols)
    for (let i = 0; i < rows; i++) {
      const row = data[i]
      if (!row || row.length !== cols) {
        throw new Error('All rows must have the same length')
      }
      for (let j = 0; j < cols; j++) {
        const val = row[j]!
        if (val !== 0) {
          matrix.data.set(SparseMatrix.key(i, j), val)
        }
      }
    }
    return matrix
  }

  static fromEntries(
    rows: number,
    cols: number,
    entries: [number, number, number][],
  ): SparseMatrix {
    const matrix = new SparseMatrix(rows, cols)
    for (const [row, col, val] of entries) {
      if (val !== 0) {
        matrix.data.set(SparseMatrix.key(row, col), val)
      }
    }
    return matrix
  }

  set(row: number, col: number, value: number): void {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new Error(`Index out of bounds: row=${row}, col=${col}, dimensions=${this._rows}x${this._cols}`)
    }
    const key = SparseMatrix.key(row, col)
    if (value === 0) {
      this.data.delete(key)
    } else {
      this.data.set(key, value)
    }
  }

  get(row: number, col: number): number {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new Error(`Index out of bounds: row=${row}, col=${col}, dimensions=${this._rows}x${this._cols}`)
    }
    return this.data.get(SparseMatrix.key(row, col)) ?? 0
  }

  get rows(): number {
    return this._rows
  }

  get cols(): number {
    return this._cols
  }

  get nnz(): number {
    return this.data.size
  }

  get density(): number {
    const total = this._rows * this._cols
    return total === 0 ? 0 : this.data.size / total
  }

  add(other: SparseMatrix): SparseMatrix {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error('Matrix dimensions must match for addition')
    }
    const result = new SparseMatrix(this._rows, this._cols)
    const keys = new Set<string>()
    this.data.forEach((_v, k) => keys.add(k))
    other.data.forEach((_v, k) => keys.add(k))
    keys.forEach((key) => {
      const sum = (this.data.get(key) ?? 0) + (other.data.get(key) ?? 0)
      if (sum !== 0) {
        result.data.set(key, sum)
      }
    })
    return result
  }

  multiply(other: SparseMatrix): SparseMatrix {
    if (this._cols !== other._rows) {
      throw new Error(
        'Matrix dimensions incompatible for multiplication',
      )
    }
    const result = new SparseMatrix(this._rows, other._cols)

    const otherByCol = new Map<number, Map<number, number>>()
    other.data.forEach((val, key) => {
      const [r, c] = other.parseKey(key)
      let colMap = otherByCol.get(r)
      if (!colMap) {
        colMap = new Map()
        otherByCol.set(r, colMap)
      }
      colMap.set(c, val)
    })

    const thisByRow = new Map<number, Map<number, number>>()
    this.data.forEach((val, key) => {
      const [r, c] = this.parseKey(key)
      let rowMap = thisByRow.get(r)
      if (!rowMap) {
        rowMap = new Map()
        thisByRow.set(r, rowMap)
      }
      rowMap.set(c, val)
    })

    thisByRow.forEach((rowEntries, i) => {
      rowEntries.forEach((aVal, k) => {
        const otherRow = otherByCol.get(k)
        if (!otherRow) return
        otherRow.forEach((bVal, j) => {
          const key = SparseMatrix.key(i, j)
          const current = result.data.get(key) ?? 0
          const newVal = current + aVal * bVal
          if (newVal !== 0) {
            result.data.set(key, newVal)
          } else {
            result.data.delete(key)
          }
        })
      })
    })

    return result
  }

  scale(scalar: number): SparseMatrix {
    if (scalar === 0) {
      return new SparseMatrix(this._rows, this._cols)
    }
    const result = new SparseMatrix(this._rows, this._cols)
    this.data.forEach((val, key) => {
      result.data.set(key, val * scalar)
    })
    return result
  }

  transpose(): SparseMatrix {
    const result = new SparseMatrix(this._cols, this._rows)
    this.data.forEach((val, key) => {
      const [row, col] = this.parseKey(key)
      result.data.set(SparseMatrix.key(col, row), val)
    })
    return result
  }

  toDense(): number[][] {
    const result: number[][] = []
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = new Array(this._cols).fill(0)
      result.push(row)
    }
    this.data.forEach((val, key) => {
      const [r, c] = this.parseKey(key)
      result[r]![c] = val
    })
    return result
  }

  forEachNonZero(callback: (row: number, col: number, val: number) => void): void {
    this.data.forEach((val, key) => {
      const [row, col] = this.parseKey(key)
      callback(row, col, val)
    })
  }
}
