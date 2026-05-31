export class LineGraph {
  private edges: [number, number][] = []
  private n: number

  constructor(n: number) {
    this.n = n
  }

  addEdge(u: number, v: number): number {
    const idx = this.edges.length
    this.edges.push([u, v])
    return idx
  }

  build(): number[][] {
    const m = this.edges.length
    const lineAdj: number[][] = Array.from({ length: m }, () => [])

    for (let i = 0; i < m; i++) {
      for (let j = i + 1; j < m; j++) {
        const [a1, a2] = this.edges[i]!
        const [b1, b2] = this.edges[j]!
        if (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2) {
          lineAdj[i]!.push(j)
          lineAdj[j]!.push(i)
        }
      }
    }

    return lineAdj
  }

  maxDegree(): number {
    const lineAdj = this.build()
    let max = 0
    for (const neighbors of lineAdj) {
      max = Math.max(max, neighbors.length)
    }
    return max
  }

  edgeCount(): number {
    return this.edges.length
  }

  isCompleteLineGraph(): boolean {
    const lineAdj = this.build()
    for (let i = 0; i < lineAdj.length; i++) {
      if (lineAdj[i]!.length !== lineAdj.length - 1) return false
    }
    return lineAdj.length > 0
  }
}
