export class Grid2D<T> {
  private data: (T | undefined)[][]
  private _rows: number
  private _cols: number

  constructor(rows: number, cols: number, fill?: T) {
    this._rows = rows
    this._cols = cols
    this.data = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => fill)
    )
  }

  get(row: number, col: number): T | undefined {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) return undefined
    return this.data[row]![col]
  }

  set(row: number, col: number, value: T): boolean {
    if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) return false
    this.data[row]![col] = value
    return true
  }

  get rows(): number { return this._rows }
  get cols(): number { return this._cols }

  fill(value: T): void {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        this.data[r]![c] = value
      }
    }
  }

  row(index: number): (T | undefined)[] {
    if (index < 0 || index >= this._rows) return []
    return [...this.data[index]!]
  }

  column(index: number): (T | undefined)[] {
    if (index < 0 || index >= this._cols) return []
    return this.data.map((r) => r[index])
  }

  neighbors4(row: number, col: number): Array<[number, number, T | undefined]> {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    return dirs
      .map(([dr, dc]) => [row + dr!, col + dc!])
      .filter(([r, c]) => r >= 0 && r < this._rows && c >= 0 && c < this._cols)
      .map(([r, c]) => [r, c, this.data[r]![c]])
  }

  neighbors8(row: number, col: number): Array<[number, number, T | undefined]> {
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    return dirs
      .map(([dr, dc]) => [row + dr!, col + dc!])
      .filter(([r, c]) => r >= 0 && r < this._rows && c >= 0 && c < this._cols)
      .map(([r, c]) => [r, c, this.data[r]![c]])
  }

  countCells(predicate: (value: T | undefined) => boolean): number {
    let count = 0
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (predicate(this.data[r]![c])) count++
      }
    }
    return count
  }

  clear(): void {
    this.data = Array.from({ length: this._rows }, () =>
      Array.from({ length: this._cols }, () => undefined)
    )
  }

  toArray(): (T | undefined)[][] {
    return this.data.map((r) => [...r])
  }

  toString(): string {
    return this.data.map((r) => r.map((c) => String(c ?? '.')).join(' ')).join('\n')
  }

  toJSON(): (T | undefined)[][] {
    return this.toArray()
  }

  clone(): Grid2D<T> {
    const copy = new Grid2D<T>(this._rows, this._cols)
    copy.data = this.data.map((r) => [...r])
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Grid2D)) return false
    if (this._rows !== other._rows || this._cols !== other._cols) return false
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (this.data[r]![c] !== other.data[r]![c]) return false
      }
    }
    return true
  }
}
