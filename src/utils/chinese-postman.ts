export class ChinesePostman {
  private adj: Map<number, number>[] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push(new Map())
  }

  addEdge(u: number, v: number, w: number): void {
    this.adj[u]!.set(v, (this.adj[u]!.get(v) ?? 0) + w)
    this.adj[v]!.set(u, (this.adj[v]!.get(u) ?? 0) + w)
  }

  solve(): number {
    let totalEdgeWeight = 0
    const degree = new Array(this.n).fill(0)
    for (let u = 0; u < this.n; u++) {
      for (const [_v, w] of this.adj[u]!) {
        totalEdgeWeight += w
        degree[u]!++
      }
    }
    totalEdgeWeight /= 2

    const oddVertices: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (degree[i]! % 2 === 1) oddVertices.push(i)
    }

    if (oddVertices.length === 0) return totalEdgeWeight

    const minExtra = this.minWeightPerfectMatching(oddVertices)
    return totalEdgeWeight + minExtra
  }

  private minWeightPerfectMatching(verts: number[]): number {
    if (verts.length <= 1) return 0
    if (verts.length === 2) {
      return this.shortestPath(verts[0]!, verts[1]!)
    }
    let minCost = Infinity
    for (let i = 1; i < verts.length; i++) {
      const cost = this.shortestPath(verts[0]!, verts[i]!)
      const remaining = verts.filter((_, idx) => idx !== 0 && idx !== i)
      minCost = Math.min(minCost, cost + this.minWeightPerfectMatching(remaining))
    }
    return minCost
  }

  private shortestPath(source: number, target: number): number {
    const dist = new Array(this.n).fill(Infinity)
    dist[source] = 0
    const visited = new Array(this.n).fill(false)
    for (let i = 0; i < this.n; i++) {
      let u = -1
      for (let v = 0; v < this.n; v++) {
        if (!visited[v] && (u === -1 || dist[v]! < dist[u]!)) u = v
      }
      if (u === -1 || dist[u] === Infinity) break
      visited[u] = true
      for (const [v, w] of this.adj[u]!) {
        dist[v] = Math.min(dist[v]!, dist[u]! + w)
      }
    }
    return dist[target]!
  }
}
