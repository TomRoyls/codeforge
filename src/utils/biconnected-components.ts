export class BiconnectedComponents {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  findComponents(): number[][] {
    const disc = new Array(this.n).fill(-1)
    const low = new Array(this.n).fill(-1)
    const parent = new Array(this.n).fill(-1)
    const components: number[][] = []
    const stack: [number, number][] = []
    let timer = 0

    const dfs = (u: number): void => {
      disc[u] = low[u] = timer++
      let children = 0
      for (const v of this.adj[u]!) {
        if (disc[v] === -1) {
          children++
          parent[v] = u
          stack.push([u, v])
          dfs(v)
          low[u] = Math.min(low[u]!, low[v]!)
          if ((parent[u] === -1 && children > 1) || (parent[u] !== -1 && low[v]! >= disc[u]!)) {
            const comp: number[] = []
            let e: [number, number]
            do {
              e = stack.pop()!
              comp.push(e[0], e[1])
            } while (e[0] !== u || e[1] !== v)
            components.push([...new Set(comp)])
          }
        } else if (v !== parent[u] && disc[v]! < disc[u]!) {
          low[u] = Math.min(low[u]!, disc[v]!)
          stack.push([u, v])
        }
      }
    }

    for (let i = 0; i < this.n; i++) {
      if (disc[i] === -1) {
        dfs(i)
        if (stack.length > 0) {
          components.push([...new Set(stack.flat())])
          stack.length = 0
        }
      }
    }
    return components
  }

  findArticulationPoints(): number[] {
    const disc = new Array(this.n).fill(-1)
    const low = new Array(this.n).fill(-1)
    const parent = new Array(this.n).fill(-1)
    const ap: boolean[] = new Array(this.n).fill(false)
    let timer = 0

    const dfs = (u: number): void => {
      disc[u] = low[u] = timer++
      let children = 0
      for (const v of this.adj[u]!) {
        if (disc[v] === -1) {
          children++
          parent[v] = u
          dfs(v)
          low[u] = Math.min(low[u]!, low[v]!)
          if (parent[u] === -1 && children > 1) ap[u] = true
          if (parent[u] !== -1 && low[v]! >= disc[u]!) ap[u] = true
        } else if (v !== parent[u]) {
          low[u] = Math.min(low[u]!, disc[v]!)
        }
      }
    }

    for (let i = 0; i < this.n; i++) {
      if (disc[i] === -1) dfs(i)
    }
    return ap.reduce((acc, v, i) => { if (v) acc.push(i); return acc }, [] as number[])
  }

  toString(): string {
    return `BiconnectedComponents(n=${this.n})`
  }

  toJSON(): unknown {
    return {
      n: this.n,
      adj: this.adj.map(row => [...row]),
    }
  }

  clone(): this {
    const c = new BiconnectedComponents(this.n)
    c.adj = this.adj.map(row => [...row])
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BiconnectedComponents)) return false
    if (this.n !== other.n) return false
    if (this.adj.length !== other.adj.length) return false
    for (let i = 0; i < this.adj.length; i++) {
      const a = new Set(this.adj[i]!)
      const b = new Set(other.adj[i]!)
      if (a.size !== b.size) return false
      for (const v of a) {
        if (!b.has(v)) return false
      }
    }
    return true
  }
}
