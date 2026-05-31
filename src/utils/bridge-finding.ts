export class BridgeFinding {
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

  findBridges(): [number, number][] {
    const disc = new Array(this.n).fill(-1)
    const low = new Array(this.n).fill(-1)
    const bridges: [number, number][] = []
    let timer = 0

    const dfs = (u: number, parent: number): void => {
      disc[u] = low[u] = timer++
      for (const v of this.adj[u]!) {
        if (disc[v] === -1) {
          dfs(v, u)
          low[u] = Math.min(low[u]!, low[v]!)
          if (low[v]! > disc[u]!) {
            bridges.push([Math.min(u, v), Math.max(u, v)])
          }
        } else if (v !== parent) {
          low[u] = Math.min(low[u]!, disc[v]!)
        }
      }
    }

    for (let i = 0; i < this.n; i++) {
      if (disc[i] === -1) dfs(i, -1)
    }
    return bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  }
}
