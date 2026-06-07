export class HeavyLightDecomposition {
  private parent: number[]
  private depth: number[]
  private size: number[]
  private heavy: number[]
  private head: number[]
  private adj: Map<number, number[]>

  constructor(adj: Map<number, number[]>, root: number = 0) {
    this.adj = adj
    const n = adj.size
    this.parent = new Array(n).fill(-1)
    this.depth = new Array(n).fill(0)
    this.size = new Array(n).fill(0)
    this.heavy = new Array(n).fill(-1)
    this.head = new Array(n).fill(root)
    this.dfs(root)
    let curPos = 0
    this.decompose(root, root, curPos)
  }

  private dfs(u: number): number {
    this.size[u] = 1
    let maxSubtree = 0
    for (const v of (this.adj.get(u) ?? [])) {
      if (v === this.parent[u]) continue
      this.parent[v] = u
      this.depth[v] = this.depth[u]! + 1
      const subtreeSize = this.dfs(v)
      this.size[u] += subtreeSize
      if (subtreeSize > maxSubtree) {
        maxSubtree = subtreeSize
        this.heavy[u] = v
      }
    }
    return this.size[u]
  }

  private decompose(u: number, h: number, _curPos: number): void {
    this.head[u] = h
    if (this.heavy[u] !== -1) {
      this.decompose(this.heavy[u]!, h, _curPos)
    }
    for (const v of (this.adj.get(u) ?? [])) {
      if (v === this.parent[u] || v === this.heavy[u]) continue
      this.decompose(v, v, _curPos)
    }
  }

  lca(u: number, v: number): number {
    while (this.head[u] !== this.head[v]) {
      if (this.depth[this.head[u]!]! > this.depth[this.head[v]!]!) u = this.parent[this.head[u]!]!
      else v = this.parent[this.head[v]!]!
    }
    return this.depth[u]! < this.depth[v]! ? u : v
  }

  distance(u: number, v: number): number {
    return this.depth[u]! + this.depth[v]! - 2 * this.depth[this.lca(u, v)]!
  }

  toString(): string {
    return `HeavyLightDecomposition(${this.parent.length})`
  }

  toJSON(): unknown {
    return {
      parent: this.parent,
      depth: this.depth,
      size: this.size,
      heavy: this.heavy,
      head: this.head,
    }
  }

  clone(): HeavyLightDecomposition {
    const adjCopy = new Map<number, number[]>()
    for (const [k, v] of this.adj) adjCopy.set(k, [...v])
    return new HeavyLightDecomposition(adjCopy)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HeavyLightDecomposition)) return false
    if (this.parent.length !== other.parent.length) return false
    for (let i = 0; i < this.parent.length; i++) {
      if (this.parent[i] !== other.parent[i]) return false
      if (this.depth[i] !== other.depth[i]) return false
      if (this.heavy[i] !== other.heavy[i]) return false
      if (this.head[i] !== other.head[i]) return false
    }
    return true
  }
}
