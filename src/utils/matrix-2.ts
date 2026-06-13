export class Matrix2 {
  private data: number[][]
  readonly rows: number
  readonly cols: number

  constructor(rows: number, cols: number, fill = 0) {
    this.rows = rows
    this.cols = cols
    this.data = Array.from({ length: rows }, () => new Array(cols).fill(fill))
  }

  static fromArray(arr: number[][]): Matrix2 {
    const m = new Matrix2(arr.length, arr[0]?.length ?? 0)
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) m.data[i][j] = arr[i][j]
    }
    return m
  }

  static identity(n: number): Matrix2 {
    const m = new Matrix2(n, n)
    for (let i = 0; i < n; i++) m.data[i][i] = 1
    return m
  }

  get(r: number, c: number): number { return this.data[r][c] }
  set(r: number, c: number, v: number): void { this.data[r][c] = v }

  add(other: Matrix2): Matrix2 {
    const result = new Matrix2(this.rows, this.cols)
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        result.data[i][j] = this.data[i][j] + other.data[i][j]
    return result
  }

  multiply(other: Matrix2): Matrix2 {
    const result = new Matrix2(this.rows, other.cols)
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < other.cols; j++)
        for (let k = 0; k < this.cols; k++)
          result.data[i][j] += this.data[i][k] * other.data[k][j]
    return result
  }

  transpose(): Matrix2 {
    const result = new Matrix2(this.cols, this.rows)
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        result.data[j][i] = this.data[i][j]
    return result
  }

  scale(s: number): Matrix2 {
    const result = new Matrix2(this.rows, this.cols)
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        result.data[i][j] = this.data[i][j] * s
    return result
  }

  trace(): number {
    let sum = 0
    for (let i = 0; i < Math.min(this.rows, this.cols); i++) sum += this.data[i][i]
    return sum
  }

  get isEmpty(): boolean { return this.rows === 0 || this.cols === 0 }

  clear(): void { for (const row of this.data) row.fill(0) }

  toArray(): number[][] { return this.data.map(r => [...r]) }
  toString(): string { return JSON.stringify({ rows: this.rows, cols: this.cols }) }
  toJSON(): Record<string, number> { return { rows: this.rows, cols: this.cols } }

  clone(): Matrix2 { return Matrix2.fromArray(this.toArray()) }

  equals(other: unknown): boolean {
    if (!(other instanceof Matrix2)) return false
    return this.rows === other.rows && this.cols === other.cols
  }
}
