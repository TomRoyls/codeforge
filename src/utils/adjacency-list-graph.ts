export interface WeightedGraph {
  addEdge(from: number, to: number, weight: number): void
  addDirectedEdge(from: number, to: number, weight: number): void
  dijkstra(source: number): { dist: Float64Array; prev: Int32Array }
  bellmanFord(source: number): { dist: Float64Array; prev: Int32Array; hasNegativeCycle: boolean }
  bfs(source: number): { dist: Int32Array; prev: Int32Array }
  topologicalSort(): number[] | null
  nodeCount: number
}

export class AdjacencyListGraph implements WeightedGraph {
  private readonly adj: Map<number, { to: number; weight: number }[]> = new Map()
  private _nodeCount = 0
  private _edgeCount = 0

  constructor(nodeCount?: number) {
    if (nodeCount !== undefined) {
      this._nodeCount = nodeCount
      for (let i = 0; i < nodeCount; i++) {
        this.adj.set(i, [])
      }
    }
  }

  get nodeCount(): number {
    return this._nodeCount
  }

  get edgeCount(): number {
    return this._edgeCount
  }

  private ensureNode(node: number): void {
    while (this._nodeCount <= node) {
      this.adj.set(this._nodeCount, [])
      this._nodeCount++
    }
  }

  addEdge(from: number, to: number, weight = 1): void {
    this.addDirectedEdge(from, to, weight)
    this.addDirectedEdge(to, from, weight)
    this._edgeCount--
  }

  addDirectedEdge(from: number, to: number, weight = 1): void {
    this.ensureNode(from)
    this.ensureNode(to)
    this.adj.get(from)!.push({ to, weight })
    this._edgeCount++
  }

  neighbors(node: number): { to: number; weight: number }[] {
    return this.adj.get(node) ?? []
  }

  dijkstra(source: number): { dist: Float64Array; prev: Int32Array } {
    const n = this._nodeCount
    const dist = new Float64Array(n).fill(Infinity)
    const prev = new Int32Array(n).fill(-1)
    const visited = new Uint8Array(n)
    dist[source] = 0

    for (let iter = 0; iter < n; iter++) {
      let u = -1
      let minDist = Infinity
      for (let i = 0; i < n; i++) {
        if (!visited[i] && dist[i]! < minDist) {
          minDist = dist[i]!
          u = i
        }
      }
      if (u === -1) break
      visited[u] = 1

      for (const { to, weight } of this.neighbors(u)) {
        const alt = dist[u]! + weight
        if (alt < dist[to]!) {
          dist[to] = alt
          prev[to] = u
        }
      }
    }

    return { dist, prev }
  }

  bellmanFord(source: number): { dist: Float64Array; prev: Int32Array; hasNegativeCycle: boolean } {
    const n = this._nodeCount
    const dist = new Float64Array(n).fill(Infinity)
    const prev = new Int32Array(n).fill(-1)
    dist[source] = 0

    for (let iter = 0; iter < n - 1; iter++) {
      for (let u = 0; u < n; u++) {
        if (dist[u]! === Infinity) continue
        for (const { to, weight } of this.neighbors(u)) {
          const alt = dist[u]! + weight
          if (alt < dist[to]!) {
            dist[to] = alt
            prev[to] = u
          }
        }
      }
    }

    let hasNegativeCycle = false
    for (let u = 0; u < n; u++) {
      if (dist[u]! === Infinity) continue
      for (const { to, weight } of this.neighbors(u)) {
        if (dist[u]! + weight < dist[to]!) {
          hasNegativeCycle = true
        }
      }
    }

    return { dist, prev, hasNegativeCycle }
  }

  bfs(source: number): { dist: Int32Array; prev: Int32Array } {
    const n = this._nodeCount
    const dist = new Int32Array(n).fill(-1)
    const prev = new Int32Array(n).fill(-1)
    dist[source] = 0
    const queue = [source]
    let qi = 0

    while (qi < queue.length) {
      const u = queue[qi++]!
      for (const { to } of this.neighbors(u)) {
        if (dist[to] === -1) {
          dist[to] = dist[u]! + 1
          prev[to] = u
          queue.push(to)
        }
      }
    }

    return { dist, prev }
  }

  topologicalSort(): number[] | null {
    const n = this._nodeCount
    const inDegree = new Int32Array(n)
    for (let u = 0; u < n; u++) {
      for (const { to } of this.neighbors(u)) {
        inDegree[to]!++
      }
    }

    const queue: number[] = []
    for (let i = 0; i < n; i++) {
      if (inDegree[i] === 0) queue.push(i)
    }

    const result: number[] = []
    let qi = 0
    while (qi < queue.length) {
      const u = queue[qi++]!
      result.push(u)
      for (const { to } of this.neighbors(u)) {
        inDegree[to]!--
        if (inDegree[to] === 0) queue.push(to)
      }
    }

    return result.length === n ? result : null
  }

  toString(): string {
    const parts: string[] = []
    for (const [u, neighbors] of this.adj) {
      for (const { to, weight } of neighbors) {
        parts.push(`${u}->${to}(${weight})`)
      }
    }
    return `AdjacencyListGraph(nodes=${this._nodeCount}, edges=${this._edgeCount})[${parts.join(', ')}]`
  }

  toJSON(): Array<{ from: number; to: number; weight: number }> {
    const edges: Array<{ from: number; to: number; weight: number }> = []
    for (const [u, neighbors] of this.adj) {
      for (const { to, weight } of neighbors) {
        edges.push({ from: u, to, weight })
      }
    }
    return edges
  }

  clone(): this {
    const c = new AdjacencyListGraph()
    for (const [u, neighbors] of this.adj) {
      c.adj.set(u, neighbors.map(n => ({ ...n })))
    }
    c._nodeCount = this._nodeCount
    c._edgeCount = this._edgeCount
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AdjacencyListGraph)) return false
    if (this._nodeCount !== other._nodeCount) return false
    if (this._edgeCount !== other._edgeCount) return false
    if (this.adj.size !== other.adj.size) return false
    for (const [u, neighbors] of this.adj) {
      const otherNeighbors = other.adj.get(u)
      if (!otherNeighbors) return false
      if (neighbors.length !== otherNeighbors.length) return false
      for (let i = 0; i < neighbors.length; i++) {
        const a = neighbors[i]!
        const b = otherNeighbors[i]!
        if (a.to !== b.to || a.weight !== b.weight) return false
      }
    }
    return true
  }
}
