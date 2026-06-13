export class GraphColoring2 {
  private adjacency = new Map<string, Set<string>>()

  addEdge(a: string, b: string): void {
    if (!this.adjacency.has(a)) this.adjacency.set(a, new Set())
    if (!this.adjacency.has(b)) this.adjacency.set(b, new Set())
    this.adjacency.get(a)!.add(b)
    this.adjacency.get(b)!.add(a)
  }

  greedyColoring(): Map<string, number> {
    const colors = new Map<string, number>()
    const sorted = [...this.adjacency.keys()].sort()
    for (const node of sorted) {
      const used = new Set<number>()
      for (const neighbor of this.adjacency.get(node) ?? []) {
        const c = colors.get(neighbor)
        if (c !== undefined) used.add(c)
      }
      let color = 0
      while (used.has(color)) color++
      colors.set(node, color)
    }
    return colors
  }

  isBipartite(): boolean {
    const color = new Map<string, 0 | 1>()
    for (const start of this.adjacency.keys()) {
      if (color.has(start)) continue
      color.set(start, 0)
      const queue = [start]
      while (queue.length > 0) {
        const u = queue.shift()!
        for (const v of this.adjacency.get(u) ?? []) {
          if (!color.has(v)) {
            color.set(v, color.get(u) === 0 ? 1 : 0)
            queue.push(v)
          } else if (color.get(v) === color.get(u)) {
            return false
          }
        }
      }
    }
    return true
  }

  chromaticNumber(): number {
    const colors = this.greedyColoring()
    let max = 0
    for (const c of colors.values()) max = Math.max(max, c)
    return max + 1
  }

  get vertexCount(): number { return this.adjacency.size }
  clear(): void { this.adjacency.clear() }

  toArray(): string[] { return [...this.adjacency.keys()] }
  toString(): string { return JSON.stringify({ vertices: this.vertexCount }) }
  toJSON(): Record<string, number> { return { vertices: this.vertexCount } }
  clone(): GraphColoring2 {
    const c = new GraphColoring2()
    for (const [a, neighbors] of this.adjacency)
      for (const b of neighbors) c.addEdge(a, b)
    return c
  }
  equals(other: unknown): boolean { return other instanceof GraphColoring2 }
}
