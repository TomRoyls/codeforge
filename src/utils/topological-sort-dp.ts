export class TopologicalSortDP {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
  }

  longestPath(): number {
    const inDegree = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) inDegree[v]!++
    }
    const dist = new Array(this.n).fill(0)
    const queue: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (inDegree[i] === 0) queue.push(i)
    }
    let count = 0
    while (queue.length > 0) {
      const u = queue.shift()!
      count++
      for (const v of this.adj[u]!) {
        dist[v] = Math.max(dist[v]!, dist[u]! + 1)
        inDegree[v]!--
        if (inDegree[v] === 0) queue.push(v)
      }
    }
    if (count !== this.n) return -1
    return Math.max(...dist)
  }

  countPaths(): number {
    const inDegree = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) inDegree[v]!++
    }
    const paths = new Array(this.n).fill(0)
    const queue: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (inDegree[i] === 0) {
        queue.push(i)
        paths[i] = 1
      }
    }
    while (queue.length > 0) {
      const u = queue.shift()!
      for (const v of this.adj[u]!) {
        paths[v]! += paths[u]!
        inDegree[v]!--
        if (inDegree[v] === 0) queue.push(v)
      }
    }
    return paths.reduce((a, b) => a + b, 0)
  }

  shortestPath(source: number, target: number): number {
    const inDegree = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) inDegree[v]!++
    }
    const dist = new Array(this.n).fill(Infinity)
    dist[source] = 0
    const queue: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (inDegree[i] === 0) queue.push(i)
    }
    while (queue.length > 0) {
      const u = queue.shift()!
      for (const v of this.adj[u]!) {
        dist[v] = Math.min(dist[v]!, dist[u]! + 1)
        inDegree[v]!--
        if (inDegree[v] === 0) queue.push(v)
      }
    }
    return dist[target]!
  }
}
