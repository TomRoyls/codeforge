export class RectangularGrid<T> {
  private _rows: number
  private _cols: number
  private data: (T | undefined)[]

  constructor(rows: number, cols: number, initialValue?: T) {
    this._rows = rows
    this._cols = cols
    if (arguments.length >= 3) {
      this.data = new Array(rows * cols).fill(initialValue) as (T | undefined)[]
    } else {
      this.data = new Array(rows * cols).fill(undefined)
    }
  }

  private index(row: number, col: number): number {
    return row * this._cols + col
  }

  get(row: number, col: number): T {
    return this.data[this.index(row, col)] as T
  }

  set(row: number, col: number, value: T): void {
    this.data[this.index(row, col)] = value
  }

  getRow(row: number): T[] {
    const start = row * this._cols
    const result: T[] = []
    for (let c = 0; c < this._cols; c++) {
      result.push(this.data[start + c] as T)
    }
    return result
  }

  getCol(col: number): T[] {
    const result: T[] = []
    for (let r = 0; r < this._rows; r++) {
      result.push(this.data[r * this._cols + col] as T)
    }
    return result
  }

  setRow(row: number, values: T[]): void {
    const start = row * this._cols
    for (let c = 0; c < this._cols; c++) {
      this.data[start + c] = values[c]
    }
  }

  setCol(col: number, values: T[]): void {
    for (let r = 0; r < this._rows; r++) {
      this.data[r * this._cols + col] = values[r]
    }
  }

  fill(value: T): void {
    this.data.fill(value)
  }

  subgrid(startRow: number, startCol: number, endRow: number, endCol: number): T[][] {
    const result: T[][] = []
    for (let r = startRow; r <= endRow; r++) {
      const row: T[] = []
      for (let c = startCol; c <= endCol; c++) {
        row.push(this.data[r * this._cols + c] as T)
      }
      result.push(row)
    }
    return result
  }

  flatten(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.data.length; i++) {
      result.push(this.data[i] as T)
    }
    return result
  }

  flattenColMajor(): T[] {
    const result: T[] = []
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        result.push(this.data[r * this._cols + c] as T)
      }
    }
    return result
  }

  get rows(): number {
    return this._rows
  }

  get cols(): number {
    return this._cols
  }

  get cellCount(): number {
    return this._rows * this._cols
  }

  has(row: number, col: number): boolean {
    return row >= 0 && row < this._rows && col >= 0 && col < this._cols
  }

  indexOf(value: T): [number, number] | undefined {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        const v = this.data[r * this._cols + c]
        if (v === value) return [r, c]
      }
    }
    return undefined
  }

  indicesOf(value: T): Array<[number, number]> {
    const result: Array<[number, number]> = []
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        const v = this.data[r * this._cols + c]
        if (v === value) result.push([r, c])
      }
    }
    return result
  }

  count(value: T): number {
    let n = 0
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === value) n++
    }
    return n
  }

  forEach(callback: (value: T, row: number, col: number) => void): void {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        callback(this.data[r * this._cols + c] as T, r, c)
      }
    }
  }

  map<U>(fn: (value: T, row: number, col: number) => U): RectangularGrid<U> {
    const result = new RectangularGrid<U>(this._rows, this._cols)
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        result.data[r * this._cols + c] = fn(this.data[r * this._cols + c] as T, r, c)
      }
    }
    return result
  }

  clone(): RectangularGrid<T> {
    const result = new RectangularGrid<T>(this._rows, this._cols)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i]
    }
    return result
  }

  toArray(): T[][] {
    const result: T[][] = []
    for (let r = 0; r < this._rows; r++) {
      const row: T[] = []
      for (let c = 0; c < this._cols; c++) {
        row.push(this.data[r * this._cols + c] as T)
      }
      result.push(row)
    }
    return result
  }

  transpose(): RectangularGrid<T> {
    const result = new RectangularGrid<T>(this._cols, this._rows)
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        result.data[c * this._rows + r] = this.data[r * this._cols + c]
      }
    }
    return result
  }

  rotate90(): RectangularGrid<T> {
    const result = new RectangularGrid<T>(this._cols, this._rows)
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        result.data[c * this._rows + (this._rows - 1 - r)] = this.data[r * this._cols + c]
      }
    }
    return result
  }

  mirrorHorizontal(): RectangularGrid<T> {
    const result = new RectangularGrid<T>(this._rows, this._cols)
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        result.data[r * this._cols + (this._cols - 1 - c)] = this.data[r * this._cols + c]
      }
    }
    return result
  }

  mirrorVertical(): RectangularGrid<T> {
    const result = new RectangularGrid<T>(this._rows, this._cols)
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        result.data[(this._rows - 1 - r) * this._cols + c] = this.data[r * this._cols + c]
      }
    }
    return result
  }
}
