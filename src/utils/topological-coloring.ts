export class TopologicalColoring {
  private adj: Set<number>[] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push(new Set())
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.add(v)
    this.adj[v]!.add(u)
  }

  colorSequential(): number[] {
    const colors = new Array(this.n).fill(-1)
    for (let u = 0; u < this.n; u++) {
      const used = new Set<number>()
      for (const v of this.adj[u]!) {
        if (colors[v]! !== -1) used.add(colors[v]!)
      }
      let c = 0
      while (used.has(c)) c++
      colors[u] = c
    }
    return colors
  }

  colorLargestFirst(): number[] {
    const colors = new Array(this.n).fill(-1)
    const order = Array.from({ length: this.n }, (_, i) => i)
    order.sort((a, b) => this.adj[b]!.size - this.adj[a]!.size)
    for (const u of order) {
      const used = new Set<number>()
      for (const v of this.adj[u]!) {
        if (colors[v]! !== -1) used.add(colors[v]!)
      }
      let c = 0
      while (used.has(c)) c++
      colors[u] = c
    }
    return colors
  }

  chromaticNumber(): number {
    const colors = this.colorLargestFirst()
    return Math.max(...colors) + 1
  }
}
