export class SteinerTree {
  private adj: [number, number][][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number, w: number): void {
    this.adj[u]!.push([v, w])
    this.adj[v]!.push([u, w])
  }

  approximateSteiner(terminals: number[]): { edges: [number, number, number][], totalWeight: number } {
    if (terminals.length <= 1) return { edges: [], totalWeight: 0 }

    const dist: number[][] = Array.from({ length: this.n }, () => new Array(this.n).fill(Infinity))
    const next: number[][] = Array.from({ length: this.n }, () => new Array(this.n).fill(-1))
    for (let i = 0; i < this.n; i++) {
      dist[i]![i]! = 0
      next[i]![i]! = i
      for (const [v, w] of this.adj[i]!) {
        dist[i]![v]! = w
        next[i]![v]! = v
      }
    }
    for (let k = 0; k < this.n; k++) {
      for (let i = 0; i < this.n; i++) {
        for (let j = 0; j < this.n; j++) {
          if (dist[i]![k]! + dist[k]![j]! < dist[i]![j]!) {
            dist[i]![j]! = dist[i]![k]! + dist[k]![j]!
            next[i]![j]! = next[i]![k]!
          }
        }
      }
    }

    const inTree = new Set<number>(terminals)
    const treeEdges: [number, number, number][] = []
    const connected = new Set<number>([terminals[0]!])

    const allConnected = (): boolean => {
      for (const t of inTree) {
        if (!connected.has(t)) return false
      }
      return true
    }

    while (!allConnected()) {
      let bestDist = Infinity
      let bestFrom = -1
      let bestTo = -1
      for (const u of connected) {
        for (const t of terminals) {
          if (connected.has(t)) continue
          if (dist[u]![t]! < bestDist) {
            bestDist = dist[u]![t]!
            bestFrom = u
            bestTo = t
          }
        }
      }
      if (bestFrom === -1) break
      let curr = bestFrom
      while (curr !== bestTo) {
        const nxt = next[curr]![bestTo]!
        const w = dist[curr]![nxt]!
        treeEdges.push([curr, nxt, w])
        connected.add(nxt)
        curr = nxt
      }
    }

    const uniqueEdges: [number, number, number][] = []
    const seen = new Set<string>()
    for (const [u, v, w] of treeEdges) {
      const key = u < v ? `${u},${v}` : `${v},${u}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueEdges.push([u, v, w])
      }
    }

    const totalWeight = uniqueEdges.reduce((sum, [, , w]) => sum + w, 0)
    return { edges: uniqueEdges, totalWeight }
  }
}
