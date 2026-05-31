export class Hungarian {
  static solve(costMatrix: number[][]): { assignment: number[]; totalCost: number } {
    const n = costMatrix.length
    const m = costMatrix[0]!.length
    const size = Math.max(n, m)
    const cost: number[][] = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => (i < n && j < m ? costMatrix[i]![j]! : 0))
    )
    const u = new Array<number>(size + 1).fill(0)
    const v = new Array<number>(size + 1).fill(0)
    const p = new Array<number>(size + 1).fill(0)
    const way = new Array<number>(size + 1).fill(0)
    for (let i = 1; i <= size; i++) {
      p[0] = i
      let j0 = 0
      const minv = new Array<number>(size + 1).fill(Infinity)
      const used = new Array<boolean>(size + 1).fill(false)
      do {
        used[j0] = true
        const i0 = p[j0]!
        let delta = Infinity
        let j1 = 0
        for (let j = 1; j <= size; j++) {
          if (!used[j]) {
            const cur = cost[i0 - 1]![j - 1]! - u[i0]! - v[j]!
            if (cur < minv[j]!) {
              minv[j] = cur
              way[j] = j0
            }
            if (minv[j]! < delta) {
              delta = minv[j]!
              j1 = j
            }
          }
        }
        for (let j = 0; j <= size; j++) {
          if (used[j]) {
            u[p[j]!]! += delta
            v[j]! -= delta
          } else {
            minv[j]! -= delta
          }
        }
        j0 = j1
      } while (p[j0] !== 0)
      do {
        const j1 = way[j0]!
        p[j0] = p[j1]!
        j0 = j1
      } while (j0 !== 0)
    }
    const assignment = new Array<number>(n).fill(-1)
    let totalCost = 0
    for (let j = 1; j <= size; j++) {
      if (p[j]! <= n && j <= m) {
        assignment[p[j]! - 1] = j - 1
        totalCost += costMatrix[p[j]! - 1]![j - 1]!
      }
    }
    return { assignment, totalCost }
  }
}
