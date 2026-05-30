export class BinaryIndexedTree2D {
  private readonly tree: number[][]
  private readonly rows: number
  private readonly cols: number

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.tree = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
  }

  update(row: number, col: number, delta: number): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return
    for (let i = row + 1; i <= this.rows; i += i & -i) {
      for (let j = col + 1; j <= this.cols; j += j & -j) {
        const treeRow = this.tree[i]!
        treeRow[j]! += delta
      }
    }
  }

  query(row: number, col: number): number {
    if (row < 0 || col < 0) return 0
    const r = Math.min(row, this.rows - 1)
    const c = Math.min(col, this.cols - 1)
    let sum = 0
    for (let i = r + 1; i > 0; i -= i & -i) {
      for (let j = c + 1; j > 0; j -= j & -j) {
        sum += this.tree[i]![j]!
      }
    }
    return sum
  }

  rangeQuery(r1: number, c1: number, r2: number, c2: number): number {
    if (r1 > r2 || c1 > c2) return 0
    if (r1 === 0 && c1 === 0) return this.query(r2, c2)
    return (
      this.query(r2, c2)
      - this.query(r1 - 1, c2)
      - this.query(r2, c1 - 1)
      + this.query(r1 - 1, c1 - 1)
    )
  }

  static fromGrid(grid: number[][]): BinaryIndexedTree2D {
    const rows = grid.length
    if (rows === 0) return new BinaryIndexedTree2D(0, 0)
    const cols = grid[0]!.length
    const bit = new BinaryIndexedTree2D(rows, cols)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        bit.update(i, j, grid[i]![j]!)
      }
    }
    return bit
  }

  get rowCount(): number {
    return this.rows
  }

  get colCount(): number {
    return this.cols
  }
}
