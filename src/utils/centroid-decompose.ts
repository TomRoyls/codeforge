export class CentroidDecomposition {
  private adj: number[][] = []
  private n: number
  private removed: boolean[] = []
  private parent: number[] = []
  private depth: number[] = []
  private visited: boolean[] = []

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) {
      this.adj.push([])
      this.removed.push(false)
      this.parent.push(-1)
      this.depth.push(0)
      this.visited.push(false)
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
    const size = this.getSize(node)
    const centroid = this.findCentroid(node, size)
    this.parent[centroid] = par
    this.depth[centroid] = d
    this.removed[centroid] = true
    for (const child of this.adj[centroid]!) {
      if (!this.removed[child]) {
        this.build(child, centroid, d + 1)
      }
    }
  }

  private getSize(node: number): number {
    this.visited = new Array(this.n).fill(false)
    return this.getSizeDFS(node)
  }

  private getSizeDFS(node: number): number {
    this.visited[node] = true
    let size = 1
    for (const child of this.adj[node]!) {
      if (!this.visited[child] && !this.removed[child]) {
        size += this.getSizeDFS(child)
      }
    }
    return size
  }

  private findCentroid(node: number, total: number): number {
    this.visited = new Array(this.n).fill(false)
    return this.findCentroidDFS(node, total)
  }

  private findCentroidDFS(node: number, total: number): number {
    this.visited[node] = true
    for (const child of this.adj[node]!) {
      if (!this.visited[child] && !this.removed[child]) {
        const childSize = this.getSize(child)
        if (childSize > total / 2) {
          return this.findCentroidDFS(child, total)
        }
      }
    }
    return node
  }
}
