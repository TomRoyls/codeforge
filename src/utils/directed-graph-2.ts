export class DirectedGraph2 {
  private adj = new Map<string, Set<string>>()
  private _edgeCount = 0

  addVertex(v: string): void {
    if (!this.adj.has(v)) this.adj.set(v, new Set())
  }

  addEdge(from: string, to: string): void {
    this.addVertex(from)
    this.addVertex(to)
    if (!this.adj.get(from)!.has(to)) { this.adj.get(from)!.add(to); this._edgeCount++ }
  }

  removeEdge(from: string, to: string): void {
    if (this.adj.get(from)?.delete(to)) this._edgeCount--
  }

  hasVertex(v: string): boolean { return this.adj.has(v) }
  hasEdge(from: string, to: string): boolean { return this.adj.get(from)?.has(to) ?? false }

  neighbors(v: string): string[] { return Array.from(this.adj.get(v) ?? []) }

  topologicalSort(): string[] | null {
    const inDegree = new Map<string, number>()
    for (const v of this.adj.keys()) inDegree.set(v, 0)
    for (const v of this.adj.keys()) {
      for (const n of this.adj.get(v)!) inDegree.set(n, (inDegree.get(n) ?? 0) + 1)
    }
    const queue: string[] = []
    for (const [v, d] of inDegree) if (d === 0) queue.push(v)
    const result: string[] = []
    while (queue.length > 0) {
      const v = queue.shift()!
      result.push(v)
      for (const n of this.adj.get(v)!) {
        inDegree.set(n, inDegree.get(n)! - 1)
        if (inDegree.get(n) === 0) queue.push(n)
      }
    }
    return result.length === this.adj.size ? result : null
  }

  hasCycle(): boolean { return this.topologicalSort() === null }

  get vertexCount(): number { return this.adj.size }
  get edgeCount(): number { return this._edgeCount }
  get isEmpty(): boolean { return this.adj.size === 0 }

  clear(): void { this.adj.clear(); this._edgeCount = 0 }

  toArray(): string[] { return Array.from(this.adj.keys()) }
  toString(): string { return JSON.stringify({ vertices: this.vertexCount, edges: this._edgeCount }) }
  toJSON(): Record<string, number> { return { vertices: this.vertexCount, edges: this._edgeCount } }

  clone(): DirectedGraph2 {
    const c = new DirectedGraph2()
    for (const [v, neighbors] of this.adj) {
      c.addVertex(v)
      for (const n of neighbors) c.addEdge(v, n)
    }
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DirectedGraph2)) return false
    return this.vertexCount === other.vertexCount && this._edgeCount === other._edgeCount
  }
}
