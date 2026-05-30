export class KahnTopologicalSort {
  readonly order: number[]
  readonly hasCycle: boolean
  readonly cycleNodes: number[]

  constructor(adj: number[][]) {
    const n = adj.length
    const inDegree = new Array(n).fill(0)
    this.order = []
    this.hasCycle = false
    this.cycleNodes = []

    for (let u = 0; u < n; u++) {
      for (const v of adj[u]!) {
        inDegree[v]++
      }
    }

    const queue: number[] = []
    for (let i = 0; i < n; i++) {
      if (inDegree[i] === 0) queue.push(i)
    }

    let processed = 0
    while (queue.length > 0) {
      const u = queue.shift()!
      this.order.push(u)
      processed++

      for (const v of adj[u]!) {
        inDegree[v]--
        if (inDegree[v] === 0) queue.push(v)
      }
    }

    if (processed !== n) {
      this.hasCycle = true
      for (let i = 0; i < n; i++) {
        if (inDegree[i]! > 0) this.cycleNodes.push(i)
      }
    }
  }

  static isDAG(adj: number[][]): boolean {
    const sort = new KahnTopologicalSort(adj)
    return !sort.hasCycle
  }

  static longestPath(adj: number[][], weights: number[]): number {
    const n = adj.length
    const sort = new KahnTopologicalSort(adj)
    if (sort.hasCycle) return -1

    const dist = new Array(n).fill(0)
    for (const u of sort.order) {
      for (const v of adj[u]!) {
        dist[v] = Math.max(dist[v]!, dist[u]! + (weights[u] ?? 0))
      }
    }

    let maxDist = 0
    for (let i = 0; i < n; i++) {
      maxDist = Math.max(maxDist, dist[i]! + (weights[i] ?? 0))
    }
    return maxDist
  }
}
