export class GraphSearch2 {
  private graph: Map<string, string[]>

  constructor() { this.graph = new Map() }

  addEdge(u: string, v: string): void {
    if (!this.graph.has(u)) this.graph.set(u, [])
    if (!this.graph.has(v)) this.graph.set(v, [])
    this.graph.get(u)!.push(v)
  }

  bfs(start: string): string[] {
    const visited = new Set<string>([start])
    const queue = [start]
    const result: string[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)
      for (const neighbor of this.graph.get(node) ?? []) {
        if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor) }
      }
    }
    return result
  }

  dfs(start: string): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    const visit = (node: string) => {
      visited.add(node)
      result.push(node)
      for (const neighbor of this.graph.get(node) ?? []) {
        if (!visited.has(neighbor)) visit(neighbor)
      }
    }
    visit(start)
    return result
  }

  dfsIterative(start: string): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    const stack = [start]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (visited.has(node)) continue
      visited.add(node)
      result.push(node)
      const neighbors = this.graph.get(node) ?? []
      for (let i = neighbors.length - 1; i >= 0; i--) {
        if (!visited.has(neighbors[i])) stack.push(neighbors[i])
      }
    }
    return result
  }

  hasPath(start: string, end: string): boolean {
    return this.bfs(start).includes(end)
  }

  shortestPath(start: string, end: string): string[] | null {
    const visited = new Set<string>([start])
    const queue: Array<[string, string[]]> = [[start, [start]]]
    while (queue.length > 0) {
      const [node, path] = queue.shift()!
      if (node === end) return path
      for (const neighbor of this.graph.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push([neighbor, [...path, neighbor]])
        }
      }
    }
    return null
  }

  get vertexCount(): number { return this.graph.size }
  get isEmpty(): boolean { return this.graph.size === 0 }

  clear(): void { this.graph.clear() }

  toArray(): string[] { return Array.from(this.graph.keys()) }
  toString(): string { return JSON.stringify({ vertices: this.graph.size }) }
  toJSON(): Record<string, number> { return { vertices: this.graph.size } }

  clone(): GraphSearch2 {
    const c = new GraphSearch2()
    for (const [u, neighbors] of this.graph) {
      for (const v of neighbors) c.addEdge(u, v)
    }
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof GraphSearch2)) return false
    return this.vertexCount === other.vertexCount
  }
}
