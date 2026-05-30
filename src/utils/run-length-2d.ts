export class RunLength2D {
  static encode(grid: (string | number)[][]): { value: string | number; count: number }[][] {
    return grid.map(row => {
      const runs: { value: string | number; count: number }[] = []
      if (row.length === 0) return runs
      let current = row[0]!
      let count = 1
      for (let i = 1; i < row.length; i++) {
        if (row[i] === current) {
          count++
        } else {
          runs.push({ value: current, count })
          current = row[i]!
          count = 1
        }
      }
      runs.push({ value: current, count })
      return runs
    })
  }

  static decode(runs: { value: string | number; count: number }[][]): (string | number)[][] {
    return runs.map(row =>
      row.flatMap(run => Array.from({ length: run.count }, () => run.value))
    )
  }

  static compressRatio(grid: (string | number)[][]): number {
    const totalCells = grid.reduce((sum, row) => sum + row.length, 0)
    if (totalCells === 0) return 0
    const encoded = RunLength2D.encode(grid)
    const runCount = encoded.reduce((sum, row) => sum + row.length, 0)
    return runCount / totalCells
  }

  static fill(rows: number, cols: number, value: string | number): (string | number)[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(value))
  }
}
