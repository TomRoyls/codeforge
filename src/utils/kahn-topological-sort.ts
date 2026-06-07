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

  toString(): string {
    return `KahnTopologicalSort(order.length=${this.order.length}, hasCycle=${this.hasCycle})`
  }

  toJSON(): unknown {
    return { order: this.order, hasCycle: this.hasCycle, cycleNodes: this.cycleNodes }
  }

  clone(): KahnTopologicalSort {
    const copy = Object.create(KahnTopologicalSort.prototype) as KahnTopologicalSort
    ;(copy as unknown as { order: number[] }).order = [...this.order]
    ;(copy as unknown as { hasCycle: boolean }).hasCycle = this.hasCycle
    ;(copy as unknown as { cycleNodes: number[] }).cycleNodes = [...this.cycleNodes]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof KahnTopologicalSort)) return false
    if (this.hasCycle !== other.hasCycle) return false
    if (this.order.length !== other.order.length) return false
    for (let i = 0; i < this.order.length; i++) {
      if (this.order[i] !== other.order[i]) return false
    }
    return true
  }
}
