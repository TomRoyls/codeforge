export class Graph2 {
  private adj = new Map<string, Map<string, number>>()

  addVertex(v: string): void {
    if (!this.adj.has(v)) this.adj.set(v, new Map())
  }

  addEdge(u: string, v: string, weight = 1): void {
    this.addVertex(u)
    this.addVertex(v)
    this.adj.get(u)!.set(v, weight)
    this.adj.get(v)!.set(u, weight)
  }

  removeEdge(u: string, v: string): void {
    this.adj.get(u)?.delete(v)
    this.adj.get(v)?.delete(u)
  }

  hasEdge(u: string, v: string): boolean {
    return this.adj.get(u)?.has(v) ?? false
  }

  getWeight(u: string, v: string): number | undefined {
    return this.adj.get(u)?.get(v)
  }

  neighbors(v: string): Array<[string, number]> {
    return Array.from(this.adj.get(v)?.entries() ?? [])
  }

  bfs(start: string): string[] {
    const visited = new Set<string>([start])
    const queue = [start]
    const result: string[] = []
    while (queue.length > 0) {
      const v = queue.shift()!
      result.push(v)
      for (const [n] of this.neighbors(v)) {
        if (!visited.has(n)) { visited.add(n); queue.push(n) }
      }
    }
    return result
  }

  dfs(start: string): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    const visit = (v: string) => {
      visited.add(v)
      result.push(v)
      for (const [n] of this.neighbors(v)) {
        if (!visited.has(n)) visit(n)
      }
    }
    visit(start)
    return result
  }

  get vertexCount(): number { return this.adj.size }
  get edgeCount(): number {
    let count = 0
    for (const neighbors of this.adj.values()) count += neighbors.size
    return Math.floor(count / 2)
  }
  get isEmpty(): boolean { return this.adj.size === 0 }

  clear(): void { this.adj.clear() }

  toArray(): string[] { return Array.from(this.adj.keys()) }
  toString(): string { return JSON.stringify({ vertices: this.vertexCount, edges: this.edgeCount }) }
  toJSON(): Record<string, number> { return { vertices: this.vertexCount, edges: this.edgeCount } }

  clone(): Graph2 {
    const c = new Graph2()
    for (const [u, neighbors] of this.adj) {
      for (const [v, w] of neighbors) c.addEdge(u, v, w)
    }
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Graph2)) return false
    return this.vertexCount === other.vertexCount
  }
}
