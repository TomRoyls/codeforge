export class TwoSAT {
  private n: number
  private adj: number[][] = []
  private radj: number[][] = []

  constructor(n: number) {
    this.n = n
    const sz = 2 * n
    for (let i = 0; i < sz; i++) {
      this.adj.push([])
      this.radj.push([])
    }
  }

  private neg(x: number): number {
    return x < this.n ? x + this.n : x - this.n
  }

  addClause(a: number, negA: boolean, b: number, negB: boolean): void {
    const u = negA ? a + this.n : a
    const v = negB ? b + this.n : b
    this.adj[this.neg(u)].push(v)
    this.adj[this.neg(v)].push(u)
    this.radj[v].push(this.neg(u))
    this.radj[u].push(this.neg(v))
  }

  solve(): boolean[] | null {
    const sz = 2 * this.n
    const order: number[] = []
    const visited = new Array(sz).fill(false)
    const dfs1 = (u: number): void => {
      visited[u] = true
      for (const v of this.adj[u]!) {
        if (!visited[v]) dfs1(v)
      }
      order.push(u)
    }
    for (let i = 0; i < sz; i++) {
      if (!visited[i]) dfs1(i)
    }
    const comp = new Array(sz).fill(-1)
    let cid = 0
    const dfs2 = (u: number): void => {
      comp[u] = cid
      for (const v of this.radj[u]!) {
        if (comp[v] === -1) dfs2(v)
      }
    }
    for (let i = order.length - 1; i >= 0; i--) {
      if (comp[order[i]!] === -1) {
        dfs2(order[i]!)
        cid++
      }
    }
    const assignment: boolean[] = new Array(this.n).fill(false)
    for (let i = 0; i < this.n; i++) {
      if (comp[i] === comp[i + this.n]) return null
      assignment[i] = comp[i]! > comp[i + this.n]!
    }
    return assignment
  }
}
