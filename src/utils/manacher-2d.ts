export class Manacher2D {
  static longestPalindromicSubgrid(grid: string[][]): { len: number; r: number; c: number } {
    let best = { len: 0, r: 0, c: 0 }
    const rows = grid.length
    if (rows === 0) return best
    const cols = grid[0]!.length
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let maxR = Math.min(r, rows - 1 - r, c, cols - 1 - c)
        for (let k = 0; k <= maxR; k++) {
          if (!Manacher2D.checkSquare(grid, r, c, k)) break
          const size = 2 * k + 1
          if (size > best.len) best = { len: size, r, c }
        }
      }
    }
    return best
  }

  private static checkSquare(grid: string[][], cr: number, cc: number, k: number): boolean {
    if (k === 0) return true
    const n = 2 * k + 1
    for (let i = 0; i < n; i++) {
      const r1 = cr - k + i
      const c1 = cc - k
      const r2 = cr + k - i
      const c2 = cc + k
      if (grid[r1]![c1]! !== grid[r2]![c2]!) return false
      const r3 = cr - k
      const c3 = cc - k + i
      const r4 = cr + k
      const c4 = cc + k - i
      if (grid[r3]![c3]! !== grid[r4]![c4]!) return false
    }
    return true
  }
}
