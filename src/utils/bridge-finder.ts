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

  toString(): string {
    return `BridgeFinder(bridges=${this.bridges.length}, articulationPoints=${this.articulationPoints.length})`
  }

  toJSON(): unknown {
    return {
      bridges: this.bridges.map(([u, v]) => [u, v]),
      articulationPoints: [...this.articulationPoints],
    }
  }

  clone(): this {
    const adj: number[][] = []
    const n = Math.max(
      this.bridges.length > 0 ? Math.max(...this.bridges.flat()) + 1 : 0,
      this.articulationPoints.length > 0 ? Math.max(...this.articulationPoints) + 1 : 0,
    )
    for (let i = 0; i < n; i++) adj.push([])
    for (const [u, v] of this.bridges) {
      adj[u]!.push(v)
      adj[v]!.push(u)
    }
    return new BridgeFinder(adj) as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BridgeFinder)) return false
    if (this.bridges.length !== other.bridges.length) return false
    if (this.articulationPoints.length !== other.articulationPoints.length) return false
    const aBridges = new Set(this.bridges.map(([u, v]) => `${Math.min(u, v)},${Math.max(u, v)}`))
    for (const [u, v] of other.bridges) {
      if (!aBridges.has(`${Math.min(u, v)},${Math.max(u, v)}`)) return false
    }
    const aAp = new Set(this.articulationPoints)
    for (const ap of other.articulationPoints) {
      if (!aAp.has(ap)) return false
    }
    return true
  }
}
