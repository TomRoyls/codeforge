export class CentroidDecomposition {
  private adj: number[][] = []
  private n: number
  private removed: boolean[] = []
  private parent: number[] = []
  private depth: number[] = []

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) {
      this.adj.push([])
      this.removed.push(false)
      this.parent.push(-1)
      this.depth.push(0)
    }
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  decompose(): { parent: number[], depth: number[] } {
    this.build(0, 0, 0)
    return { parent: [...this.parent], depth: [...this.depth] }
  }

  private build(node: number, par: number, d: number): void {
    const sizes: number[] = new Array(this.n).fill(0)
    this.computeSizes(node, new Set<number>(), sizes)
    const total = sizes[node]!
    const centroid = this.findCentroid(node, new Set<number>(), sizes, total)
    this.parent[centroid] = par
    this.depth[centroid] = d
    this.removed[centroid] = true
    for (const child of this.adj[centroid]!) {
      if (!this.removed[child]) {
        this.build(child, centroid, d + 1)
      }
    }
  }

  private computeSizes(node: number, visited: Set<number>, sizes: number[]): void {
    visited.add(node)
    let size = 1
    for (const child of this.adj[node]!) {
      if (visited.has(child) || this.removed[child]) continue
      this.computeSizes(child, visited, sizes)
      size += sizes[child]!
    }
    sizes[node] = size
  }

  private findCentroid(node: number, visited: Set<number>, sizes: number[], total: number): number {
    visited.add(node)
    for (const child of this.adj[node]!) {
      if (visited.has(child) || this.removed[child]) continue
      if (sizes[child]! > total / 2) {
        return this.findCentroid(child, visited, sizes, total)
      }
    }
    return node
  }
}
