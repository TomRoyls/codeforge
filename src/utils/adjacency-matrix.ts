export class AdjacencyMatrix {
  private matrix: Float64Array
  private _nodeCount: number
  private _edgeCount: number = 0
  private _directed: boolean

  constructor(nodeCount: number, directed = false) {
    this._nodeCount = nodeCount
    this._directed = directed
    this.matrix = new Float64Array(nodeCount * nodeCount)
  }

  get nodeCount(): number {
    return this._nodeCount
  }

  get edgeCount(): number {
    return this._edgeCount
  }

  get directed(): boolean {
    return this._directed
  }

  private idx(row: number, col: number): number {
    return row * this._nodeCount + col
  }

  addEdge(from: number, to: number, weight = 1): void {
    if (from < 0 || from >= this._nodeCount || to < 0 || to >= this._nodeCount) {
      throw new RangeError(`Node index out of bounds: ${from}, ${to}`)
    }
    const hadEdge = this.matrix[this.idx(from, to)] !== 0
    this.matrix[this.idx(from, to)] = weight
    if (!this._directed) {
      this.matrix[this.idx(to, from)] = weight
    }
    if (!hadEdge) {
      this._edgeCount++
    }
  }

  removeEdge(from: number, to: number): boolean {
    if (from < 0 || from >= this._nodeCount || to < 0 || to >= this._nodeCount) {
      return false
    }
    const hadEdge = this.matrix[this.idx(from, to)] !== 0
    this.matrix[this.idx(from, to)] = 0
    if (!this._directed) {
      this.matrix[this.idx(to, from)] = 0
    }
    if (hadEdge) {
      this._edgeCount--
    }
    return hadEdge
  }

  hasEdge(from: number, to: number): boolean {
    if (from < 0 || from >= this._nodeCount || to < 0 || to >= this._nodeCount) {
      return false
    }
    return this.matrix[this.idx(from, to)] !== 0
  }

  getWeight(from: number, to: number): number {
    if (from < 0 || from >= this._nodeCount || to < 0 || to >= this._nodeCount) {
      return 0
    }
    return this.matrix[this.idx(from, to)]
  }

  neighbors(node: number): number[] {
    if (node < 0 || node >= this._nodeCount) return []
    const result: number[] = []
    for (let j = 0; j < this._nodeCount; j++) {
      if (this.matrix[this.idx(node, j)] !== 0) {
        result.push(j)
      }
    }
    return result
  }

  degree(node: number): number {
    return this.neighbors(node).length
  }

  inDegree(node: number): number {
    if (node < 0 || node >= this._nodeCount) return 0
    let count = 0
    for (let i = 0; i < this._nodeCount; i++) {
      if (this.matrix[this.idx(i, node)] !== 0) count++
    }
    return count
  }

  outDegree(node: number): number {
    return this.degree(node)
  }

  bfs(source: number): { dist: Int32Array; prev: Int32Array } {
    const dist = new Int32Array(this._nodeCount).fill(-1)
    const prev = new Int32Array(this._nodeCount).fill(-1)
    dist[source] = 0
    const queue: number[] = [source]
    let head = 0
    while (head < queue.length) {
      const u = queue[head++]!
      for (let v = 0; v < this._nodeCount; v++) {
        if (this.matrix[this.idx(u, v)] !== 0 && dist[v] === -1) {
          dist[v] = dist[u]! + 1
          prev[v] = u
          queue.push(v)
        }
      }
    }
    return { dist, prev }
  }

  dfs(source: number): number[] {
    const visited = new Uint8Array(this._nodeCount)
    const result: number[] = []
    const stack: number[] = [source]
    while (stack.length > 0) {
      const u = stack.pop()!
      if (visited[u]) continue
      visited[u] = 1
      result.push(u)
      for (let v = this._nodeCount - 1; v >= 0; v--) {
        if (this.matrix[this.idx(u, v)] !== 0 && !visited[v]) {
          stack.push(v)
        }
      }
    }
    return result
  }

  isComplete(): boolean {
    const expected = this._directed
      ? this._nodeCount * (this._nodeCount - 1)
      : this._nodeCount * (this._nodeCount - 1) / 2
    return this._edgeCount === expected
  }

  isEmpty(): boolean {
    return this._edgeCount === 0
  }

  density(): number {
    if (this._nodeCount <= 1) return 0
    const maxEdges = this._directed
      ? this._nodeCount * (this._nodeCount - 1)
      : this._nodeCount * (this._nodeCount - 1) / 2
    return this._edgeCount / maxEdges
  }

  clear(): void {
    this.matrix.fill(0)
    this._edgeCount = 0
  }

  transpose(): AdjacencyMatrix {
    const result = new AdjacencyMatrix(this._nodeCount, this._directed)
    for (let i = 0; i < this._nodeCount; i++) {
      for (let j = 0; j < this._nodeCount; j++) {
        const w = this.matrix[this.idx(i, j)]
        if (w !== 0) {
          result.matrix[result.idx(j, i)] = w
        }
      }
    }
    result._edgeCount = this._edgeCount
    return result
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let i = 0; i < this._nodeCount; i++) {
      const row: number[] = []
      for (let j = 0; j < this._nodeCount; j++) {
        row.push(this.matrix[this.idx(i, j)])
      }
      result.push(row)
    }
    return result
  }

  toString(): string {
    return `AdjacencyMatrix(nodes=${this._nodeCount}, edges=${this._edgeCount}, directed=${this._directed})`
  }

  toJSON(): { nodes: number; edges: number; directed: boolean; matrix: number[][] } {
    return {
      nodes: this._nodeCount,
      edges: this._edgeCount,
      directed: this._directed,
      matrix: this.toArray(),
    }
  }

  clone(): AdjacencyMatrix {
    const copy = new AdjacencyMatrix(this._nodeCount, this._directed)
    copy.matrix = new Float64Array(this.matrix)
    copy._edgeCount = this._edgeCount
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AdjacencyMatrix)) return false
    if (this._nodeCount !== other._nodeCount) return false
    if (this._directed !== other._directed) return false
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[i] !== other.matrix[i]) return false
    }
    return true
  }
}
