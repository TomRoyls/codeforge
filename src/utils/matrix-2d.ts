export class Matrix2D {
  private data: number[]
  readonly rows: number
  readonly cols: number

  constructor(rows: number, cols: number, fill = 0) {
    if (rows < 1 || cols < 1) throw new RangeError('dimensions must be >= 1')
    this.rows = rows
    this.cols = cols
    this.data = new Array(rows * cols).fill(fill)
  }

  get(row: number, col: number): number {
    this.validate(row, col)
    return this.data[row * this.cols + col]!
  }

  set(row: number, col: number, value: number): void {
    this.validate(row, col)
    this.data[row * this.cols + col] = value
  }

  fill(value: number): void {
    this.data.fill(value)
  }

  transpose(): Matrix2D {
    const result = new Matrix2D(this.cols, this.rows)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        result.set(c, r, this.get(r, c))
      }
    }
    return result
  }

  add(other: Matrix2D): Matrix2D {
    this.validateSameSize(other)
    const result = new Matrix2D(this.rows, this.cols)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i]! + other.data[i]!
    }
    return result
  }

  multiply(other: Matrix2D): Matrix2D {
    if (this.cols !== other.rows) throw new Error('incompatible dimensions')
    const result = new Matrix2D(this.rows, other.cols)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < other.cols; c++) {
        let sum = 0
        for (let k = 0; k < this.cols; k++) {
          sum += this.get(r, k) * other.get(k, c)
        }
        result.set(r, c, sum)
      }
    }
    return result
  }

  scale(factor: number): Matrix2D {
    const result = new Matrix2D(this.rows, this.cols)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i]! * factor
    }
    return result
  }

  getRow(index: number): number[] {
    this.validateRow(index)
    return this.data.slice(index * this.cols, (index + 1) * this.cols)
  }

  getColumn(index: number): number[] {
    this.validateCol(index)
    const result: number[] = []
    for (let r = 0; r < this.rows; r++) {
      result.push(this.get(r, index))
    }
    return result
  }

  get size(): number {
    return this.rows * this.cols
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let r = 0; r < this.rows; r++) {
      result.push(this.data.slice(r * this.cols, (r + 1) * this.cols))
    }
    return result
  }

  flatten(): number[] {
    return [...this.data]
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): number[][] {
    return this.toArray()
  }

  clone(): Matrix2D {
    const copy = new Matrix2D(this.rows, this.cols)
    copy.data = [...this.data]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Matrix2D)) return false
    if (this.rows !== other.rows || this.cols !== other.cols) return false
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== other.data[i]) return false
    }
    return true
  }

  static identity(size: number): Matrix2D {
    const m = new Matrix2D(size, size)
    for (let i = 0; i < size; i++) m.set(i, i, 1)
    return m
  }

  static fromArray(data: number[][]): Matrix2D {
    const rows = data.length
    const cols = data[0]?.length ?? 0
    const m = new Matrix2D(rows, cols)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.set(r, c, data[r]![c] ?? 0)
      }
    }
    return m
  }

  private validate(row: number, col: number): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new RangeError(`(${row}, ${col}) out of bounds`)
    }
  }

  private validateRow(index: number): void {
    if (index < 0 || index >= this.rows) throw new RangeError(`row ${index} out of bounds`)
  }

  private validateCol(index: number): void {
    if (index < 0 || index >= this.cols) throw new RangeError(`col ${index} out of bounds`)
  }

  private validateSameSize(other: Matrix2D): void {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('matrix dimensions must match')
    }
  }
}
