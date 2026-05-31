export class BlockCutTree {
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

  build(): { isArticulation: boolean[], componentOf: number[][] } {
    const disc = new Array(this.n).fill(-1)
    const low = new Array(this.n).fill(-1)
    const parent = new Array(this.n).fill(-1)
    const isAp = new Array(this.n).fill(false)
    const stack: [number, number][] = []
    const components: number[][] = []
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
            isAp[u] = true
            const comp: Set<number> = new Set()
            let e: [number, number]
            do {
              e = stack.pop()!
              comp.add(e[0])
              comp.add(e[1])
            } while (e[0] !== u || e[1] !== v)
            components.push([...comp])
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
          const comp = new Set<number>()
          while (stack.length > 0) {
            const e = stack.pop()!
            comp.add(e[0])
            comp.add(e[1])
          }
          components.push([...comp])
        }
      }
    }
    return { isArticulation: isAp, componentOf: components }
  }
}
