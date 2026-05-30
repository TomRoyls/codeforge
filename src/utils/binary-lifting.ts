export class BinaryLifting {
  private readonly up: number[][]
  private readonly depth: number[]
  private readonly log: number
  private readonly n: number

  constructor(adj: number[][], root = 0) {
    this.n = adj.length
    if (this.n === 0) {
      this.log = 0
      this.up = []
      this.depth = []
      return
    }

    this.log = Math.ceil(Math.log2(this.n)) + 1
    this.up = new Array(this.log)
    for (let k = 0; k < this.log; k++) {
      this.up[k] = new Array(this.n).fill(-1)
    }
    this.depth = new Array(this.n).fill(-1)

    this.bfs(adj, root)

    for (let k = 1; k < this.log; k++) {
      for (let v = 0; v < this.n; v++) {
        const mid = this.up[k - 1]![v]!
        this.up[k]![v] = mid === -1 ? -1 : this.up[k - 1]![mid]!
      }
    }
  }

  lca(u: number, v: number): number {
    if (this.depth[u]! < this.depth[v]!) {
      const tmp = u
      u = v
      v = tmp
    }

    const diff = this.depth[u]! - this.depth[v]!
    for (let k = 0; k < this.log; k++) {
      if ((diff >> k) & 1) {
        u = this.up[k]![u]!
      }
    }

    if (u === v) return u

    for (let k = this.log - 1; k >= 0; k--) {
      if (this.up[k]![u] !== this.up[k]![v]) {
        u = this.up[k]![u]!
        v = this.up[k]![v]!
      }
    }

    return this.up[0]![u]!
  }

  distance(u: number, v: number): number {
    const w = this.lca(u, v)
    return this.depth[u]! + this.depth[v]! - 2 * this.depth[w]!
  }

  kthAncestor(u: number, k: number): number {
    if (k > this.depth[u]!) return -1
    for (let i = 0; i < this.log; i++) {
      if ((k >> i) & 1) {
        u = this.up[i]![u]!
      }
    }
    return u
  }

  isAncestor(u: number, v: number): boolean {
    return this.lca(u, v) === u
  }

  getDepth(v: number): number {
    return this.depth[v]!
  }

  getParent(v: number): number {
    return this.up[0]![v]!
  }

  private bfs(adj: number[][], root: number): void {
    const queue = [root]
    let qi = 0
    this.depth[root] = 0
    this.up[0]![root] = -1

    while (qi < queue.length) {
      const u = queue[qi++]!
      for (const v of adj[u] ?? []) {
        if (this.depth[v] === -1) {
          this.depth[v] = this.depth[u]! + 1
          this.up[0]![v] = u
          queue.push(v)
        }
      }
    }
  }
}
