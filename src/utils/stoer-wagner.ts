export class StoerWagner {
  private adj: Map<number, number>[] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) {
      this.adj.push(new Map())
    }
  }

  addEdge(u: number, v: number, w: number): void {
    this.adj[u]!.set(v, (this.adj[u]!.get(v) ?? 0) + w)
    this.adj[v]!.set(u, (this.adj[v]!.get(u) ?? 0) + w)
  }

  minCut(): number {
    if (this.n <= 1) return 0
    let best = Infinity
    const vertices: number[] = Array.from({ length: this.n }, (_, i) => i)
    const weights: Map<number, number>[] = this.adj.map(m => new Map(m))

    while (vertices.length > 1) {
      const { cutWeight, last, prev } = this.minimumCutPhase(vertices, weights)
      best = Math.min(best, cutWeight)
      for (const v of vertices) {
        if (v === prev || v === last) continue
        const w = (weights[last]!.get(v) ?? 0) + (weights[prev]!.get(v) ?? 0)
        weights[prev]!.set(v, w)
        weights[v]!.set(prev, w)
      }
      weights[last]!.clear()
      for (const v of vertices) {
        weights[v]!.delete(last)
      }
      vertices.splice(vertices.indexOf(last), 1)
    }
    return best === Infinity ? 0 : best
  }

  private minimumCutPhase(
    vertices: number[],
    weights: Map<number, number>[]
  ): { cutWeight: number, last: number } {
    const inSet = new Set<number>()
    const order: number[] = []
    const start = vertices[0]!
    order.push(start)
    inSet.add(start)

    while (inSet.size < vertices.length) {
      let best = -1
      let bestV = -1
      for (const v of vertices) {
        if (inSet.has(v)) continue
        let w = 0
        for (const s of inSet) {
          w += weights[s]!.get(v) ?? 0
        }
        if (w > best) {
          best = w
          bestV = v
        }
      }
      order.push(bestV)
      inSet.add(bestV)
    }

    const last = order[order.length - 1]!
    const prev = order[order.length - 2]!
    let cutWeight = 0
    for (const v of vertices) {
      cutWeight += weights[last]!.get(v) ?? 0
    }
    return { cutWeight, last, prev }
  }
}
