export class Array2D<T> {
  private data: (T | undefined)[]
  private cols: number
  private rows: number

  constructor(cols: number, rows: number, fill?: T) {
    this.cols = cols
    this.rows = rows
    this.data = new Array(cols * rows).fill(fill)
  }

  set(x: number, y: number, value: T): void {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return
    this.data[y * this.cols + x] = value
  }

  get(x: number, y: number): T | undefined {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return undefined
    return this.data[y * this.cols + x]
  }

  fill(value: T): void { this.data.fill(value) }

  getRow(y: number): (T | undefined)[] {
    if (y < 0 || y >= this.rows) return []
    const result: (T | undefined)[] = []
    for (let x = 0; x < this.cols; x++) result.push(this.data[y * this.cols + x])
    return result
  }

  getCol(x: number): (T | undefined)[] {
    if (x < 0 || x >= this.cols) return []
    const result: (T | undefined)[] = []
    for (let y = 0; y < this.rows; y++) result.push(this.data[y * this.cols + x])
    return result
  }

  get width(): number { return this.cols }
  get height(): number { return this.rows }
  get cellCount(): number { return this.cols * this.rows }
  get isEmpty(): boolean { return this.cols === 0 || this.rows === 0 }

  clear(fill?: T): void { this.data.fill(fill) }

  toArray(): (T | undefined)[][] {
    const result: (T | undefined)[][] = []
    for (let y = 0; y < this.rows; y++) result.push(this.getRow(y))
    return result
  }

  toString(): string { return JSON.stringify({ cols: this.cols, rows: this.rows }) }
  toJSON(): Record<string, number> { return { cols: this.cols, rows: this.rows } }

  clone(): Array2D<T> {
    const c = new Array2D<T>(this.cols, this.rows)
    c.data = [...this.data]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Array2D)) return false
    return this.cols === other.cols && this.rows === other.rows
  }
}
