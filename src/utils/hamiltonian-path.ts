export class HamiltonianPath {
  private adj: boolean[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) {
      this.adj.push(new Array(n).fill(false))
    }
  }

  addEdge(u: number, v: number): void {
    this.adj[u]![v] = true
    this.adj[v]![u] = true
  }

  existsPath(): boolean {
    const dp: boolean[][] = []
    for (let i = 0; i < this.n; i++) {
      dp.push(new Array(1 << this.n).fill(false))
      dp[i]![1 << i] = true
    }
    for (let mask = 0; mask < (1 << this.n); mask++) {
      for (let u = 0; u < this.n; u++) {
        if (!dp[u]![mask]) continue
        for (let v = 0; v < this.n; v++) {
          if (this.adj[u]![v] && !(mask & (1 << v))) {
            dp[v]![mask | (1 << v)] = true
          }
        }
      }
    }
    for (let u = 0; u < this.n; u++) {
      if (dp[u]![(1 << this.n) - 1]) return true
    }
    return false
  }

  existsCycle(): boolean {
    if (this.n <= 1) return false
    if (this.n === 2) return this.adj[0]![1]!
    for (let start = 0; start < this.n; start++) {
      const dp: boolean[][] = []
      for (let i = 0; i < this.n; i++) {
        dp.push(new Array(1 << this.n).fill(false))
      }
      dp[start]![1 << start] = true
      for (let mask = 0; mask < (1 << this.n); mask++) {
        for (let u = 0; u < this.n; u++) {
          if (!dp[u]![mask]) continue
          for (let v = 0; v < this.n; v++) {
            if (this.adj[u]![v] && !(mask & (1 << v))) {
              dp[v]![mask | (1 << v)] = true
            }
          }
        }
      }
      const full = (1 << this.n) - 1
      for (let u = 0; u < this.n; u++) {
        if (u !== start && dp[u]![full] && this.adj[u]![start]) return true
      }
    }
    return false
  }
}
