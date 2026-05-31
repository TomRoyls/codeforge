export class StrongConnectivityContraction {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
  }

  contract(): { dag: number[][], componentCount: number, component: number[] } {
    const index = new Array(this.n).fill(-1)
    const low = new Array(this.n).fill(0)
    const onStack = new Array(this.n).fill(false)
    const stack: number[] = []
    let idx = 0
    const comp = new Array(this.n).fill(-1)
    let compCount = 0

    const dfs = (u: number): void => {
      index[u] = low[u] = idx++
      stack.push(u)
      onStack[u] = true
      for (const v of this.adj[u]!) {
        if (index[v] === -1) {
          dfs(v)
          low[u] = Math.min(low[u]!, low[v]!)
        } else if (onStack[v]) {
          low[u] = Math.min(low[u]!, index[v]!)
        }
      }
      if (low[u] === index[u]) {
        while (true) {
          const v = stack.pop()!
          onStack[v] = false
          comp[v] = compCount
          if (v === u) break
        }
        compCount++
      }
    }

    for (let i = 0; i < this.n; i++) {
      if (index[i] === -1) dfs(i)
    }

    const dag: Set<number>[] = Array.from({ length: compCount }, () => new Set())
    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        if (comp[u] !== comp[v]) {
          dag[comp[u]!]!.add(comp[v]!)
        }
      }
    }

    return {
      dag: dag.map(s => [...s]),
      componentCount: compCount,
      component: comp
    }
  }

  hasCycle(): boolean {
    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        if (u === v) return true
      }
    }
    const { componentCount } = this.contract()
    return componentCount < this.n
  }
}
