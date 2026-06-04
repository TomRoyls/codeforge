export class TarjanSCC {
  private index = 0
  private readonly stack: number[] = []
  private readonly onStack: boolean[]
  private readonly indices: number[]
  private readonly lowLinks: number[]
  private readonly sccs: number[][] = []
  private readonly adj: ReadonlyArray<readonly number[]>

  constructor(adj: ReadonlyArray<readonly number[]>) {
    this.adj = adj
    const n = adj.length
    this.onStack = new Array(n).fill(false)
    this.indices = new Array(n).fill(-1)
    this.lowLinks = new Array(n).fill(-1)
  }

  solve(): number[][] {
    for (let v = 0; v < this.adj.length; v++) {
      if (this.indices[v] === -1) {
        this.strongConnect(v)
      }
    }
    return this.sccs
  }

  private strongConnect(v: number): void {
    this.indices[v] = this.index
    this.lowLinks[v] = this.index
    this.index++
    this.stack.push(v)
    this.onStack[v] = true

    for (const w of this.adj[v]!) {
      if (this.indices[w] === -1) {
        this.strongConnect(w)
        this.lowLinks[v] = Math.min(this.lowLinks[v]!, this.lowLinks[w]!)
      } else if (this.onStack[w]) {
        this.lowLinks[v] = Math.min(this.lowLinks[v]!, this.indices[w]!)
      }
    }

    if (this.lowLinks[v] === this.indices[v]) {
      const scc: number[] = []
      let w: number
      do {
        w = this.stack.pop()!
        this.onStack[w] = false
        scc.push(w)
      } while (w !== v)
      this.sccs.push(scc)
    }
  }

  static isDAG(adj: ReadonlyArray<readonly number[]>): boolean {
    for (let v = 0; v < adj.length; v++) {
      if (adj[v]!.includes(v)) return false
    }
    const sccs = new TarjanSCC(adj).solve()
    return sccs.every((scc) => scc.length === 1)
  }

  static condensation(adj: ReadonlyArray<readonly number[]>): { componentId: number[]; dag: number[][] } {
    const tarjan = new TarjanSCC(adj)
    const sccs = tarjan.solve()
    const componentId = new Array(adj.length).fill(-1)
    for (let i = 0; i < sccs.length; i++) {
      for (const v of sccs[i]!) {
        componentId[v] = i
      }
    }
    const dagSet = new Set<string>()
    for (let u = 0; u < adj.length; u++) {
      for (const v of adj[u]!) {
        if (componentId[u] !== componentId[v]) {
          dagSet.add(`${componentId[u]},${componentId[v]}`)
        }
      }
    }
    const dag: number[][] = Array.from({ length: sccs.length }, () => [])
    for (const edge of dagSet) {
      const [from, to] = edge.split(',').map(Number)
      dag[from!]!.push(to!)
    }
    return { componentId, dag }
  }
}
