export class EdmondsBlossom {
  private n: number
  private g: Set<number>[] = []

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.g.push(new Set())
  }

  addEdge(u: number, v: number): void {
    this.g[u]!.add(v)
    this.g[v]!.add(u)
  }

  maxMatchingSize(): number {
    const match = new Array(this.n).fill(-1)
    const used = new Array(this.n).fill(false)
    let changed = true
    while (changed) {
      changed = false
      used.fill(false)
      for (let v = 0; v < this.n; v++) {
        if (match[v] === -1 && !used[v]) {
          if (this.dfs(v, match, used)) {
            changed = true
          }
        }
      }
    }
    let count = 0
    for (let i = 0; i < this.n; i++) {
      if (match[i] !== -1) count++
    }
    return count / 2
  }

  private dfs(v: number, match: number[], used: boolean[]): boolean {
    if (used[v]) return false
    used[v] = true
    for (const to of this.g[v]!) {
      if (match[to] === -1 || this.dfs(match[to]!, match, used)) {
        match[to] = v
        match[v] = to
        return true
      }
    }
    return false
  }
}
