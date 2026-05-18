export class Matrix {
  private readonly data: Float64Array
  private readonly _rows: number
  private readonly _cols: number

  constructor(rows: number, cols: number, fill: number = 0) {
    if (rows <= 0 || cols <= 0) {
      throw new RangeError('Matrix dimensions must be positive integers')
    }
    this._rows = rows
    this._cols = cols
    this.data = new Float64Array(rows * cols).fill(fill)
  }

  static from2DArray(data: number[][]): Matrix {
    if (data.length === 0 || data[0].length === 0) {
      throw new RangeError('Cannot create matrix from empty array')
    }
    const rows = data.length
    const cols = data[0].length
    for (let i = 1; i < rows; i++) {
      if (data[i].length !== cols) {
        throw new RangeError('All rows must have the same length')
      }
    }
    const m = new Matrix(rows, cols)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        m.data[i * cols + j] = data[i][j]
      }
    }
    return m
  }

  static identity(n: number): Matrix {
    const m = new Matrix(n, n)
    for (let i = 0; i < n; i++) {
      m.data[i * n + i] = 1
    }
    return m
  }

  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols, 0)
  }

  static ones(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols, 1)
  }

  get rows(): number {
    return this._rows
  }

  get cols(): number {
    return this._cols
  }

  get(row: number, col: number): number {
    this.checkBounds(row, col)
    return this.data[row * this._cols + col]
  }

  set(row: number, col: number, value: number): void {
    this.checkBounds(row, col)
    this.data[row * this._cols + col] = value
  }

  add(other: Matrix): Matrix {
    this.checkDimensions(other)
    const result = new Matrix(this._rows, this._cols)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] + other.data[i]
    }
    return result
  }

  subtract(other: Matrix): Matrix {
    this.checkDimensions(other)
    const result = new Matrix(this._rows, this._cols)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] - other.data[i]
    }
    return result
  }

  multiply(other: Matrix): Matrix {
    if (this._cols !== other._rows) {
      throw new RangeError(
        `Cannot multiply ${this._rows}x${this._cols} by ${other._rows}x${other._cols}`
      )
    }
    const result = new Matrix(this._rows, other._cols)
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < other._cols; j++) {
        let sum = 0
        for (let k = 0; k < this._cols; k++) {
          sum += this.data[i * this._cols + k] * other.data[k * other._cols + j]
        }
        result.data[i * other._cols + j] = sum
      }
    }
    return result
  }

  scale(scalar: number): Matrix {
    const result = new Matrix(this._rows, this._cols)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] * scalar
    }
    return result
  }

  transpose(): Matrix {
    const result = new Matrix(this._cols, this._rows)
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        result.data[j * this._rows + i] = this.data[i * this._cols + j]
      }
    }
    return result
  }

  determinant(): number {
    if (!this.isSquare()) {
      throw new RangeError('Determinant is only defined for square matrices')
    }
    const n = this._rows
    if (n === 1) return this.data[0]
    if (n === 2) {
      return this.data[0] * this.data[3] - this.data[1] * this.data[2]
    }
    if (n <= 4) return this.cofactorDet()
    return this.luDet()
  }

  trace(): number {
    if (!this.isSquare()) {
      throw new RangeError('Trace is only defined for square matrices')
    }
    let sum = 0
    for (let i = 0; i < this._rows; i++) {
      sum += this.data[i * this._cols + i]
    }
    return sum
  }

  isSquare(): boolean {
    return this._rows === this._cols
  }

  equals(other: Matrix): boolean {
    if (this._rows !== other._rows || this._cols !== other._cols) return false
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== other.data[i]) return false
    }
    return true
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = []
      for (let j = 0; j < this._cols; j++) {
        row.push(this.data[i * this._cols + j])
      }
      result.push(row)
    }
    return result
  }

  clone(): Matrix {
    const m = new Matrix(this._rows, this._cols)
    m.data.set(this.data)
    return m
  }

  map(fn: (val: number, row: number, col: number) => number): Matrix {
    const result = new Matrix(this._rows, this._cols)
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        result.data[i * this._cols + j] = fn(this.data[i * this._cols + j], i, j)
      }
    }
    return result
  }

  private checkBounds(row: number, col: number): void {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
      throw new RangeError(
        `Index (${row}, ${col}) out of bounds for ${this._rows}x${this._cols} matrix`
      )
    }
  }

  private checkDimensions(other: Matrix): void {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new RangeError(
        `Dimension mismatch: ${this._rows}x${this._cols} vs ${other._rows}x${other._cols}`
      )
    }
  }

  private cofactorDet(): number {
    const n = this._rows
    if (n === 1) return this.data[0]
    if (n === 2) {
      return this.data[0] * this.data[3] - this.data[1] * this.data[2]
    }
    let det = 0
    for (let j = 0; j < n; j++) {
      const minor = this.minor(0, j)
      det += (j % 2 === 0 ? 1 : -1) * this.data[j] * minor.cofactorDet()
    }
    return det
  }

  private minor(skipRow: number, skipCol: number): Matrix {
    const m = new Matrix(this._rows - 1, this._cols - 1)
    let idx = 0
    for (let i = 0; i < this._rows; i++) {
      if (i === skipRow) continue
      for (let j = 0; j < this._cols; j++) {
        if (j === skipCol) continue
        m.data[idx++] = this.data[i * this._cols + j]
      }
    }
    return m
  }

  private luDet(): number {
    const n = this._rows
    const lu = new Float64Array(this.data)
    let det = 1
    let swaps = 0

    for (let k = 0; k < n; k++) {
      let maxVal = Math.abs(lu[k * n + k])
      let maxRow = k
      for (let i = k + 1; i < n; i++) {
        const val = Math.abs(lu[i * n + k])
        if (val > maxVal) {
          maxVal = val
          maxRow = i
        }
      }
      if (maxVal === 0) return 0

      if (maxRow !== k) {
        for (let j = 0; j < n; j++) {
          const tmp = lu[k * n + j]
          lu[k * n + j] = lu[maxRow * n + j]
          lu[maxRow * n + j] = tmp
        }
        swaps++
      }

      for (let i = k + 1; i < n; i++) {
        lu[i * n + k] /= lu[k * n + k]
        for (let j = k + 1; j < n; j++) {
          lu[i * n + j] -= lu[i * n + k] * lu[k * n + j]
        }
      }
    }

    for (let i = 0; i < n; i++) {
      det *= lu[i * n + i]
    }

    return swaps % 2 === 0 ? det : -det
  }
}
