export class CycleDetector {
  private adj = new Map<string, Set<string>>()

  addEdge(from: string, to: string): void {
    if (!this.adj.has(from)) this.adj.set(from, new Set())
    if (!this.adj.has(to)) this.adj.set(to, new Set())
    this.adj.get(from)!.add(to)
  }

  hasCycle(): boolean {
    const visited = new Set<string>()
    const recStack = new Set<string>()
    for (const v of this.adj.keys()) {
      if (!visited.has(v)) {
        if (this.dfs(v, visited, recStack)) return true
      }
    }
    return false
  }

  private dfs(v: string, visited: Set<string>, recStack: Set<string>): boolean {
    visited.add(v)
    recStack.add(v)
    for (const n of this.adj.get(v) ?? []) {
      if (!visited.has(n)) {
        if (this.dfs(n, visited, recStack)) return true
      } else if (recStack.has(n)) return true
    }
    recStack.delete(v)
    return false
  }

  findCycle(): string[] | null {
    const visited = new Set<string>()
    const recStack = new Set<string>()
    const parent = new Map<string, string | null>()
    for (const v of this.adj.keys()) {
      if (!visited.has(v)) {
        const cycle = this.findCycleDFS(v, visited, recStack, parent)
        if (cycle) return cycle
      }
    }
    return null
  }

  private findCycleDFS(v: string, visited: Set<string>, recStack: Set<string>, parent: Map<string, string | null>): string[] | null {
    visited.add(v)
    recStack.add(v)
    for (const n of this.adj.get(v) ?? []) {
      if (!visited.has(n)) {
        parent.set(n, v)
        const result = this.findCycleDFS(n, visited, recStack, parent)
        if (result) return result
      } else if (recStack.has(n)) {
        const cycle: string[] = [n]
        let cur: string | null = v
        while (cur && cur !== n) { cycle.push(cur); cur = parent.get(cur) ?? null }
        cycle.push(n)
        return cycle.reverse()
      }
    }
    recStack.delete(v)
    return null
  }

  get vertexCount(): number { return this.adj.size }
  get isEmpty(): boolean { return this.adj.size === 0 }

  clear(): void { this.adj.clear() }

  toArray(): string[] { return Array.from(this.adj.keys()) }
  toString(): string { return JSON.stringify({ vertices: this.vertexCount }) }
  toJSON(): Record<string, number> { return { vertices: this.vertexCount } }

  clone(): CycleDetector {
    const c = new CycleDetector()
    for (const [u, neighbors] of this.adj) for (const v of neighbors) c.addEdge(u, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CycleDetector)) return false
    return this.vertexCount === other.vertexCount
  }
}
