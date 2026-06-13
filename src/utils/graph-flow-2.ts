export class GraphFlow2 {
  private capacity = new Map<string, Map<string, number>>()

  addEdge(from: string, to: string, cap: number): void {
    if (!this.capacity.has(from)) this.capacity.set(from, new Map())
    if (!this.capacity.has(to)) this.capacity.set(to, new Map())
    const existing = this.capacity.get(from)!.get(to) ?? 0
    this.capacity.get(from)!.set(to, existing + cap)
    if (!this.capacity.get(to)!.has(from)) this.capacity.get(to)!.set(to, 0)
  }

  maxFlow(source: string, sink: string): number {
    let totalFlow = 0
    const residual = new Map<string, Map<string, number>>()
    for (const [from, edges] of this.capacity) {
      residual.set(from, new Map(edges))
    }
    while (true) {
      const parent = new Map<string, [string, number]>()
      const visited = new Set<string>([source])
      const queue: string[] = [source]
      while (queue.length > 0) {
        const u = queue.shift()!
        if (u === sink) break
        const edges = residual.get(u)
        if (!edges) continue
        for (const [v, cap] of edges) {
          if (!visited.has(v) && cap > 0) {
            visited.add(v)
            parent.set(v, [u, cap])
            queue.push(v)
          }
        }
      }
      if (!parent.has(sink)) break
      let pathFlow = Infinity
      let node: string | undefined = sink
      while (node !== source) {
        const [p, cap] = parent.get(node!)!
        pathFlow = Math.min(pathFlow, cap)
        node = p
      }
      node = sink
      while (node !== source) {
        const [p] = parent.get(node!)!
        residual.get(p)!.set(node, residual.get(p)!.get(node!)! - pathFlow)
        residual.get(node!)!.set(p, (residual.get(node!)!.get(p) ?? 0) + pathFlow)
        node = p
      }
      totalFlow += pathFlow
    }
    return totalFlow
  }

  get vertexCount(): number { return this.capacity.size }
  clear(): void { this.capacity.clear() }

  toArray(): string[] { return [...this.capacity.keys()] }
  toString(): string { return JSON.stringify({ vertices: this.vertexCount }) }
  toJSON(): Record<string, number> { return { vertices: this.vertexCount } }
  clone(): GraphFlow2 {
    const c = new GraphFlow2()
    for (const [from, edges] of this.capacity)
      for (const [to, cap] of edges) c.addEdge(from, to, cap)
    return c
  }
  equals(other: unknown): boolean { return other instanceof GraphFlow2 }
}
