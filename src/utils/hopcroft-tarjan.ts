export class HopcroftTarjan {
  private adj: Map<string, Set<string>> = new Map()
  private disc = new Map<string, number>()
  private low = new Map<string, number>()
  private onStack = new Set<string>()
  private stack: string[] = []
  private timer = 0
  private sccs: string[][] = []

  addEdge(u: string, v: string): void {
    if (!this.adj.has(u)) this.adj.set(u, new Set())
    if (!this.adj.has(v)) this.adj.set(v, new Set())
    this.adj.get(u)!.add(v)
  }

  findSCCs(): string[][] {
    this.disc.clear()
    this.low.clear()
    this.onStack.clear()
    this.stack = []
    this.timer = 0
    this.sccs = []
    for (const v of this.adj.keys()) {
      if (!this.disc.has(v)) this.dfs(v)
    }
    return this.sccs
  }

  private dfs(u: string): void {
    this.disc.set(u, this.timer)
    this.low.set(u, this.timer)
    this.timer++
    this.stack.push(u)
    this.onStack.add(u)
    for (const v of this.adj.get(u) ?? []) {
      if (!this.disc.has(v)) {
        this.dfs(v)
        this.low.set(u, Math.min(this.low.get(u)!, this.low.get(v)!))
      } else if (this.onStack.has(v)) {
        this.low.set(u, Math.min(this.low.get(u)!, this.disc.get(v)!))
      }
    }
    if (this.low.get(u) === this.disc.get(u)) {
      const scc: string[] = []
      while (true) {
        const w = this.stack.pop()!
        this.onStack.delete(w)
        scc.push(w)
        if (w === u) break
      }
      this.sccs.push(scc)
    }
  }

  get vertexCount(): number { return this.adj.size }
  get isEmpty(): boolean { return this.adj.size === 0 }

  clear(): void { this.adj.clear(); this.sccs = [] }

  toArray(): string[] { return Array.from(this.adj.keys()) }
  toString(): string { return JSON.stringify({ vertices: this.vertexCount, sccs: this.sccs.length }) }
  toJSON(): Record<string, number> { return { vertices: this.vertexCount, sccs: this.sccs.length } }

  clone(): HopcroftTarjan {
    const c = new HopcroftTarjan()
    for (const [u, neighbors] of this.adj) for (const v of neighbors) c.addEdge(u, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HopcroftTarjan)) return false
    return this.vertexCount === other.vertexCount
  }
}
