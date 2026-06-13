export class SlidingPuzzle {
  private board: number[][]
  private size: number
  private blankRow: number
  private blankCol: number

  constructor(size: number) {
    this.size = size
    this.board = []
    for (let r = 0; r < size; r++) {
      const row: number[] = []
      for (let c = 0; c < size; c++) row.push(r * size + c + 1)
      this.board.push(row)
    }
    this.board[size - 1]![size - 1] = 0
    this.blankRow = size - 1
    this.blankCol = size - 1
  }

  shuffle(): void {
    for (let i = 0; i < this.size * this.size * 10; i++) {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      const [dr, dc] = dirs[Math.floor(Math.random() * 4)]!
      this.move(this.blankRow + dr, this.blankCol + dc)
    }
  }

  move(row: number, col: number): boolean {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return false
    const dr = Math.abs(row - this.blankRow)
    const dc = Math.abs(col - this.blankCol)
    if (dr + dc !== 1) return false
    this.board[this.blankRow]![this.blankCol] = this.board[row]![col]!
    this.board[row]![col] = 0
    this.blankRow = row
    this.blankCol = col
    return true
  }

  isSolved(): boolean {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const expected = r * this.size + c + 1
        if (r === this.size - 1 && c === this.size - 1) {
          if (this.board[r]![c] !== 0) return false
        } else {
          if (this.board[r]![c] !== expected) return false
        }
      }
    }
    return true
  }

  get dimension(): number { return this.size }
  get isSolvedState(): boolean { return this.isSolved() }

  toArray(): number[][] { return this.board.map((row) => [...row]) }
  toString(): string { return JSON.stringify({ size: this.size, solved: this.isSolved() }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): SlidingPuzzle {
    const c = new SlidingPuzzle(this.size)
    c.board = this.board.map((row) => [...row])
    c.blankRow = this.blankRow
    c.blankCol = this.blankCol
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SlidingPuzzle)) return false
    return this.size === other.size
  }

  clear(): void {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) this.board[r]![c] = r * this.size + c + 1
    }
    this.board[this.size - 1]![this.size - 1] = 0
    this.blankRow = this.size - 1
    this.blankCol = this.size - 1
  }
}
