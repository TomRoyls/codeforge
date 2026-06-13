export class ShortestPath2 {
  private graph = new Map<string, Array<{ to: string; weight: number }>>()

  addEdge(u: string, v: string, weight: number): void {
    if (!this.graph.has(u)) this.graph.set(u, [])
    if (!this.graph.has(v)) this.graph.set(v, [])
    this.graph.get(u)!.push({ to: v, weight })
  }

  dijkstra(start: string): Map<string, number> {
    const dist = new Map<string, number>()
    const visited = new Set<string>()
    for (const node of this.graph.keys()) dist.set(node, Infinity)
    dist.set(start, 0)

    while (visited.size < this.graph.size) {
      let minNode: string | null = null
      let minDist = Infinity
      for (const [node, d] of dist) {
        if (!visited.has(node) && d < minDist) { minNode = node; minDist = d }
      }
      if (minNode === null) break
      visited.add(minNode)
      for (const { to, weight } of this.graph.get(minNode) ?? []) {
        const newDist = minDist + weight
        if (newDist < (dist.get(to) ?? Infinity)) dist.set(to, newDist)
      }
    }
    return dist
  }

  bellmanFord(start: string): Map<string, number> | null {
    const dist = new Map<string, number>()
    for (const node of this.graph.keys()) dist.set(node, Infinity)
    dist.set(start, 0)

    const edges: Array<[string, string, number]> = []
    for (const [u, neighbors] of this.graph) {
      for (const { to, weight } of neighbors) edges.push([u, to, weight])
    }

    for (let i = 0; i < this.graph.size - 1; i++) {
      for (const [u, v, w] of edges) {
        const du = dist.get(u) ?? Infinity
        const dv = dist.get(v) ?? Infinity
        if (du + w < dv) dist.set(v, du + w)
      }
    }

    for (const [u, v, w] of edges) {
      const du = dist.get(u) ?? Infinity
      const dv = dist.get(v) ?? Infinity
      if (du + w < dv) return null
    }
    return dist
  }

  get vertexCount(): number { return this.graph.size }
  get isEmpty(): boolean { return this.graph.size === 0 }

  clear(): void { this.graph.clear() }

  toArray(): string[] { return Array.from(this.graph.keys()) }
  toString(): string { return JSON.stringify({ vertices: this.graph.size }) }
  toJSON(): Record<string, number> { return { vertices: this.graph.size } }

  clone(): ShortestPath2 {
    const c = new ShortestPath2()
    for (const [u, neighbors] of this.graph) {
      for (const { to, weight } of neighbors) c.addEdge(u, to, weight)
    }
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ShortestPath2)) return false
    return this.vertexCount === other.vertexCount
  }
}
