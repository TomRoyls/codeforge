export class GraphEntropy {
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

  degreeEntropy(): number {
    const degrees = this.adj.map(s => s.size)
    const totalEdges = degrees.reduce((a, b) => a + b, 0)
    if (totalEdges === 0) return 0
    const counts = new Map<number, number>()
    for (const d of degrees) counts.set(d, (counts.get(d) ?? 0) + 1)
    let entropy = 0
    for (const count of counts.values()) {
      const p = count / this.n
      if (p > 0) entropy -= p * Math.log2(p)
    }
    return entropy
  }

  edgeEntropy(): number {
    let edgeCount = 0
    for (let i = 0; i < this.n; i++) edgeCount += this.adj[i]!.size
    edgeCount /= 2
    if (edgeCount === 0) return 0
    const total = edgeCount
    let entropy = 0
    if (total > 0) {
      const p = total / (this.n * (this.n - 1) / 2)
      if (p > 0 && p < 1) {
        entropy = -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p))
      }
    }
    return entropy
  }

  clusteringCoefficient(): number {
    let total = 0
    let count = 0
    for (let u = 0; u < this.n; u++) {
      const neighbors = [...this.adj[u]!]
      if (neighbors.length < 2) continue
      let triangles = 0
      let possible = 0
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          possible++
          if (this.adj[neighbors[i]!]!.has(neighbors[j]!)) triangles++
        }
      }
      total += triangles / possible
      count++
    }
    return count === 0 ? 0 : total / count
  }

  toString(): string {
    return `GraphEntropy(${this.n})`
  }

  toJSON(): unknown {
    const edges: Array<[number, number]> = []
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) {
        if (i < v) edges.push([i, v])
      }
    }
    return { n: this.n, edges }
  }

  clone(): GraphEntropy {
    const copy = new GraphEntropy(this.n)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) {
        if (i < v) copy.addEdge(i, v)
      }
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof GraphEntropy)) return false
    if (this.n !== other.n) return false
    for (let i = 0; i < this.n; i++) {
      const a = [...this.adj[i]!].sort((x, y) => x - y)
      const b = [...other.adj[i]!].sort((x, y) => x - y)
      if (a.length !== b.length) return false
      for (let j = 0; j < a.length; j++) {
        if (a[j] !== b[j]) return false
      }
    }
    return true
  }
}
