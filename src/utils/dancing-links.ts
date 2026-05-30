export class DancingLinks {
  private header: DLXNode
  private solutions: number[][] = []
  private current: number[] = []
  private _solutionCount: number = 0

  constructor(
    private cols: number,
    private maxSolutions: number = 100,
  ) {
    this.header = { left: null!, right: null!, up: null!, down: null!, column: null!, row: -1, count: 0 }
    this.header.left = this.header
    this.header.right = this.header
    this.header.up = this.header
    this.header.down = this.header
    this.buildColumns()
  }

  addRow(rowId: number, columns: number[]): void {
    if (columns.length === 0) return
    const nodes: DLXNode[] = []
    let col = this.header.right
    let colIdx = 0
    for (const targetCol of columns.sort((a, b) => a - b)) {
      while (col !== this.header && colIdx < targetCol) {
        col = col.right
        colIdx++
      }
      if (col === this.header || colIdx !== targetCol) return
      const node: DLXNode = {
        left: null!, right: null!, up: null!, down: null!, column: col, row: rowId, count: 0,
      }
      node.up = col.up
      node.down = col
      col.up.down = node
      col.up = node
      col.count++
      nodes.push(node)
      col = col.right
      colIdx++
    }
    for (let i = 0; i < nodes.length; i++) {
      nodes[i]!.left = nodes[(i - 1 + nodes.length) % nodes.length]!
      nodes[i]!.right = nodes[(i + 1) % nodes.length]!
    }
  }

  solve(): number[][] {
    this.solutions = []
    this.current = []
    this._solutionCount = 0
    this.search()
    return this.solutions
  }

  get solutionCount(): number {
    return this._solutionCount
  }

  private buildColumns(): void {
    let prev = this.header
    for (let i = 0; i < this.cols; i++) {
      const col: DLXNode = {
        left: prev, right: this.header, up: null!, down: null!, column: null!, row: -1, count: 0,
      }
      col.up = col
      col.down = col
      col.column = col
      prev.right = col
      this.header.left = col
      prev = col
    }
  }

  private cover(col: DLXNode): void {
    col.right.left = col.left
    col.left.right = col.right
    let row = col.down
    while (row !== col) {
      let node = row.right
      while (node !== row) {
        node.down.up = node.up
        node.up.down = node.down
        node.column.count--
        node = node.right
      }
      row = row.down
    }
  }

  private uncover(col: DLXNode): void {
    let row = col.up
    while (row !== col) {
      let node = row.left
      while (node !== row) {
        node.column.count++
        node.down.up = node
        node.up.down = node
        node = node.left
      }
      row = row.up
    }
    col.right.left = col
    col.left.right = col
  }

  private search(): boolean {
    if (this.header.right === this.header) {
      this.solutions.push([...this.current])
      this._solutionCount++
      return this._solutionCount >= this.maxSolutions
    }
    let col = this.header.right
    let minCol = col
    let minCount = col.count
    while (col !== this.header) {
      if (col.count < minCount) {
        minCount = col.count
        minCol = col
      }
      col = col.right
    }
    if (minCount === 0) return false
    this.cover(minCol)
    let row = minCol.down
    while (row !== minCol) {
      this.current.push(row.row)
      let node = row.right
      while (node !== row) {
        this.cover(node.column)
        node = node.right
      }
      if (this.search()) return true
      node = row.left
      while (node !== row) {
        this.uncover(node.column)
        node = node.left
      }
      this.current.pop()
      row = row.down
    }
    this.uncover(minCol)
    return false
  }
}

interface DLXNode {
  left: DLXNode
  right: DLXNode
  up: DLXNode
  down: DLXNode
  column: DLXNode
  row: number
  count: number
}
