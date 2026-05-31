export class TreeDiameter {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  findDiameter(): number {
    if (this.n === 0) return 0
    const farthest1 = this.bfs(0)
    const farthest2 = this.bfs(farthest1.node)
    return farthest2.dist
  }

  findDiameterPath(): number[] {
    if (this.n === 0) return []
    const far1 = this.bfs(0)
    const far2 = this.bfs(far1.node)
    return this.getPath(far1.node, far2.node)
  }

  private bfs(start: number): { node: number, dist: number } {
    const dist = new Array(this.n).fill(-1)
    const queue = [start]
    dist[start] = 0
    let farthest = start
    while (queue.length > 0) {
      const u = queue.shift()!
      for (const v of this.adj[u]!) {
        if (dist[v] === -1) {
          dist[v] = dist[u]! + 1
          queue.push(v)
          if (dist[v]! > dist[farthest]!) farthest = v
        }
      }
    }
    return { node: farthest, dist: dist[farthest]! }
  }

  private getPath(start: number, end: number): number[] {
    const parent = new Array(this.n).fill(-1)
    const visited = new Array(this.n).fill(false)
    const queue = [start]
    visited[start] = true
    while (queue.length > 0) {
      const u = queue.shift()!
      if (u === end) break
      for (const v of this.adj[u]!) {
        if (!visited[v]) {
          visited[v] = true
          parent[v] = u
          queue.push(v)
        }
      }
    }
    const path: number[] = []
    let cur = end
    while (cur !== -1) {
      path.push(cur)
      cur = parent[cur]!
    }
    return path.reverse()
  }
}
