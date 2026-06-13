export class JohnsonAllPairs {
  compute(graph: Map<string, Array<{ to: string; weight: number }>>): Map<string, Map<string, number>> | null {
    const vertices = Array.from(graph.keys())
    const result = new Map<string, Map<string, number>>()
    for (const v of vertices) {
      const dists = this.dijkstra(graph, v)
      if (dists === null) return null
      result.set(v, dists)
    }
    return result
  }

  private dijkstra(graph: Map<string, Array<{ to: string; weight: number }>>, start: string): Map<string, number> | null {
    const dist = new Map<string, number>()
    dist.set(start, 0)
    const visited = new Set<string>()
    while (visited.size < graph.size) {
      let minDist = Infinity
      let minVertex: string | null = null
      for (const [v, d] of dist) {
        if (!visited.has(v) && d < minDist) { minDist = d; minVertex = v }
      }
      if (minVertex === null) break
      visited.add(minVertex)
      for (const edge of graph.get(minVertex) ?? []) {
        const newDist = minDist + edge.weight
        if (newDist < (dist.get(edge.to) ?? Infinity)) dist.set(edge.to, newDist)
      }
    }
    return dist
  }

  get name(): string { return 'JohnsonAllPairs' }
  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): JohnsonAllPairs { return new JohnsonAllPairs() }
  equals(other: unknown): boolean { return other instanceof JohnsonAllPairs }
  toArray(): string[] { return ['johnson-all-pairs'] }
}
