export class PrimMST {
  private adj: [number, number][][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number, w: number): void {
    this.adj[u]!.push([v, w])
    this.adj[v]!.push([u, w])
  }

  findMST(): { totalWeight: number, edges: [number, number, number][] } {
    const visited = new Array(this.n).fill(false)
    const minEdge = new Array(this.n).fill(Infinity)
    const parent = new Array(this.n).fill(-1)
    minEdge[0] = 0
    let totalWeight = 0
    const edges: [number, number, number][] = []

    for (let i = 0; i < this.n; i++) {
      let u = -1
      for (let v = 0; v < this.n; v++) {
        if (!visited[v] && (u === -1 || minEdge[v]! < minEdge[u]!)) u = v
      }
      if (u === -1 || minEdge[u] === Infinity) break
      visited[u] = true
      totalWeight += minEdge[u]!
      if (parent[u] !== -1) {
        edges.push([parent[u]!, u, minEdge[u]!])
      }
      for (const [v, w] of this.adj[u]!) {
        if (!visited[v] && w < minEdge[v]!) {
          minEdge[v] = w
          parent[v] = u
        }
      }
    }
    return { totalWeight, edges }
  }

  isConnected(): boolean {
    if (this.n === 0) return true
    const visited = new Array(this.n).fill(false)
    const queue = [0]
    visited[0] = true
    while (queue.length > 0) {
      const u = queue.shift()!
      for (const [v] of this.adj[u]!) {
        if (!visited[v]) {
          visited[v] = true
          queue.push(v)
        }
      }
    }
    return visited.every(v => v)
  }
}
