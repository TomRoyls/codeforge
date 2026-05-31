export class GomoryHu {
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

  minCut(s: number, t: number): number {
    if (s === t) return 0
    return this.computeMaxFlow(s, t)
  }

  allPairsMinCut(): number[][] {
    const result: number[][] = Array.from({ length: this.n }, () => new Array(this.n).fill(0))
    for (let i = 0; i < this.n; i++) {
      for (let j = i + 1; j < this.n; j++) {
        const cut = this.computeMaxFlow(i, j)
        result[i]![j]! = cut
        result[j]![i]! = cut
      }
    }
    return result
  }

  private computeMaxFlow(source: number, sink: number): number {
    const cap: number[][] = Array.from({ length: this.n }, () => new Array(this.n).fill(0))
    for (let u = 0; u < this.n; u++) {
      for (const [v, w] of this.adj[u]!) {
        cap[u]![v]! += w
      }
    }

    let total = 0
    const bfs = (): number[] | null => {
      const par = new Array(this.n).fill(-1)
      par[source] = source
      const queue = [source]
      while (queue.length > 0) {
        const u = queue.shift()!
        for (let v = 0; v < this.n; v++) {
          if (par[v] === -1 && cap[u]![v]! > 0) {
            par[v] = u
            if (v === sink) return par
            queue.push(v)
          }
        }
      }
      return null
    }

    let p: number[] | null
    while ((p = bfs()) !== null) {
      let flow = Infinity
      let v = sink
      while (v !== source) {
        const u = p[v]!
        flow = Math.min(flow, cap[u]![v]!)
        v = u
      }
      v = sink
      while (v !== source) {
        const u = p[v]!
        cap[u]![v]! -= flow
        cap[v]![u]! += flow
        v = u
      }
      total += flow
    }
    return total
  }
}
