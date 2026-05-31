export class NetworkFlowDinic {
  private adj: [number, number, number][][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number, cap: number): void {
    this.adj[u]!.push([v, this.adj[v]!.length, cap])
    this.adj[v]!.push([u, this.adj[u]!.length - 1, 0])
  }

  maxFlow(source: number, sink: number): number {
    if (source === sink) return 0
    let total = 0
    const level = new Array(this.n).fill(-1)
    const iter = new Array(this.n).fill(0)

    const bfs = (): boolean => {
      level.fill(-1)
      level[source] = 0
      const queue = [source]
      while (queue.length > 0) {
        const u = queue.shift()!
        for (const [v, , cap] of this.adj[u]!) {
          if (cap > 0 && level[v] === -1) {
            level[v] = level[u]! + 1
            queue.push(v)
          }
        }
      }
      return level[sink] !== -1
    }

    const dfs = (u: number, flow: number): number => {
      if (u === sink) return flow
      while (iter[u]! < this.adj[u]!.length) {
        const edge = this.adj[u]![iter[u]!]
        const [v, rev, cap] = edge!
        if (cap > 0 && level[v] === level[u]! + 1) {
          const pushed = dfs(v, Math.min(flow, cap))
          if (pushed > 0) {
            edge![2] -= pushed
            this.adj[v]![rev]![2] += pushed
            return pushed
          }
        }
        iter[u]!++
      }
      return 0
    }

    while (bfs()) {
      iter.fill(0)
      let pushed: number
      do {
        pushed = dfs(source, Infinity)
        total += pushed
      } while (pushed > 0)
    }
    return total
  }
}
