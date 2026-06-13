export class WeightedGraph<T> {
  private adjacency = new Map<T, Array<{ node: T; weight: number }>>()

  addEdge(from: T, to: T, weight: number): void {
    if (!this.adjacency.has(from)) this.adjacency.set(from, [])
    if (!this.adjacency.has(to)) this.adjacency.set(to, [])
    this.adjacency.get(from)!.push({ node: to, weight })
  }

  neighbors(node: T): Array<{ node: T; weight: number }> {
    return this.adjacency.get(node) ?? []
  }

  hasNode(node: T): boolean { return this.adjacency.has(node) }

  get nodeCount(): number { return this.adjacency.size }

  get edgeCount(): number {
    let count = 0
    for (const edges of this.adjacency.values()) count += edges.length
    return count
  }

  get isEmpty(): boolean { return this.adjacency.size === 0 }

  clear(): void { this.adjacency.clear() }

  toArray(): Array<{ from: T; to: T; weight: number }> {
    const result: Array<{ from: T; to: T; weight: number }> = []
    for (const [from, edges] of this.adjacency) {
      for (const e of edges) result.push({ from, to: e.node, weight: e.weight })
    }
    return result
  }

  toString(): string { return JSON.stringify({ nodes: this.nodeCount, edges: this.edgeCount }) }
  toJSON(): Record<string, number> { return { nodes: this.nodeCount, edges: this.edgeCount } }

  clone(): WeightedGraph<T> {
    const c = new WeightedGraph<T>()
    for (const [from, edges] of this.adjacency) {
      c.adjacency.set(from, edges.map((e) => ({ ...e })))
    }
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof WeightedGraph)) return false
    return this.nodeCount === other.nodeCount && this.edgeCount === other.edgeCount
  }
}
