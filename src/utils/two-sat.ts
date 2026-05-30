export class TwoSAT {
  private readonly n: number
  private readonly adj: number[][] = []
  private readonly radj: number[][] = []

  constructor(n: number) {
    this.n = n
    const total = 2 * n
    for (let i = 0; i < total; i++) {
      this.adj.push([])
      this.radj.push([])
    }
  }

  addClause(a: number, aNeg: boolean, b: number, bNeg: boolean): void {
    const na = this.neg(a, aNeg)
    const pa = this.pos(a, aNeg)
    const nb = this.neg(b, bNeg)
    const pb = this.pos(b, bNeg)
    this.adj[na].push(pb)
    this.adj[nb].push(pa)
    this.radj[pb].push(na)
    this.radj[pa].push(nb)
  }

  solve(): boolean[] | null {
    const order = this.topoSort()
    const component = new Array(2 * this.n).fill(-1)
    let compId = 0
    for (let i = order.length - 1; i >= 0; i--) {
      const v = order[i]!
      if (component[v] === -1) {
        this.dfsReverse(v, component, compId)
        compId++
      }
    }
    const assignment: boolean[] = new Array(this.n).fill(false)
    for (let i = 0; i < this.n; i++) {
      if (component[i] === component[i + this.n]) return null
      assignment[i] = component[i] > component[i + this.n]
    }
    return assignment
  }

  private pos(v: number, neg: boolean): number {
    return neg ? v + this.n : v
  }

  private neg(v: number, neg: boolean): number {
    return neg ? v : v + this.n
  }

  private topoSort(): number[] {
    const visited = new Array(2 * this.n).fill(false)
    const order: number[] = []
    const dfs = (v: number): void => {
      visited[v] = true
      for (const u of this.adj[v]!) {
        if (!visited[u]) dfs(u)
      }
      order.push(v)
    }
    for (let i = 0; i < 2 * this.n; i++) {
      if (!visited[i]) dfs(i)
    }
    return order
  }

  private dfsReverse(v: number, component: number[], compId: number): void {
    component[v] = compId
    for (const u of this.radj[v]!) {
      if (component[u] === -1) this.dfsReverse(u, component, compId)
    }
  }
}
