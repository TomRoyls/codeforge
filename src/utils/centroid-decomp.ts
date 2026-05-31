export class CentroidDecomposition {
  private parent: number[]
  private removed: boolean[]
  private adj: Map<number, number[]>

  constructor(adj: Map<number, number[]>) {
    this.adj = adj
    const n = adj.size
    this.parent = new Array(n).fill(-1)
    this.removed = new Array(n).fill(false)
    this.build(0, -1)
  }

  private build(u: number, par: number): void {
    const subtreeSize = new Map<number, number>()
    const totalSize = this.calcSize(u, -1, subtreeSize)
    const centroid = this.findCentroid(u, -1, totalSize, subtreeSize)
    this.parent[centroid] = par
    this.removed[centroid] = true
    for (const v of (this.adj.get(centroid) ?? [])) {
      if (!this.removed[v]) this.build(v, centroid)
    }
  }

  private calcSize(u: number, par: number, subtreeSize: Map<number, number>): number {
    let size = 1
    for (const v of (this.adj.get(u) ?? [])) {
      if (v !== par && !this.removed[v]) {
        size += this.calcSize(v, u, subtreeSize)
      }
    }
    subtreeSize.set(u, size)
    return size
  }

  private findCentroid(u: number, par: number, totalSize: number, subtreeSize: Map<number, number>): number {
    for (const v of (this.adj.get(u) ?? [])) {
      if (v !== par && !this.removed[v] && (subtreeSize.get(v) ?? 0) > totalSize / 2) {
        return this.findCentroid(v, u, totalSize, subtreeSize)
      }
    }
    return u
  }

  getParent(node: number): number {
    return this.parent[node]!
  }

  getCentroidTree(): number[] {
    return [...this.parent]
  }
}
