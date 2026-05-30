export class BridgeFinder {
  readonly bridges: Array<[number, number]>
  readonly articulationPoints: number[]

  constructor(adj: number[][]) {
    const n = adj.length
    const disc = new Array(n).fill(-1)
    const low = new Array(n).fill(-1)
    const parent = new Array(n).fill(-1)
    this.bridges = []
    this.articulationPoints = []
    let timer = 0

    const dfs = (u: number) => {
      disc[u] = low[u] = timer++
      let children = 0

      for (const v of adj[u]!) {
        if (disc[v] === -1) {
          children++
          parent[v] = u
          dfs(v)
          low[u] = Math.min(low[u]!, low[v]!)

          if (low[v]! > disc[u]!) {
            this.bridges.push([u, v])
          }

          if (parent[u] === -1 && children > 1) {
            if (!this.articulationPoints.includes(u)) {
              this.articulationPoints.push(u)
            }
          }

          if (parent[u] !== -1 && low[v]! >= disc[u]!) {
            if (!this.articulationPoints.includes(u)) {
              this.articulationPoints.push(u)
            }
          }
        } else if (v !== parent[u]) {
          low[u] = Math.min(low[u]!, disc[v]!)
        }
      }
    }

    for (let i = 0; i < n; i++) {
      if (disc[i] === -1) dfs(i)
    }
  }
}
