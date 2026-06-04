export class FordFulkerson {
  static maxFlow(edges: { from: number; to: number; capacity: number }[], source: number, sink: number, n: number): number {
    if (source === sink) return 0
    const cap: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (const { from, to, capacity } of edges) {
      cap[from]![to]! += capacity
    }
    let totalFlow = 0
    while (true) {
      const parent = new Array<number>(n).fill(-1)
      parent[source] = source
      const queue: number[] = [source]
      while (queue.length > 0 && parent[sink] === -1) {
        const u = queue.shift()!
        for (let v = 0; v < n; v++) {
          if (parent[v] === -1 && cap[u]![v]! > 0) {
            parent[v] = u
            queue.push(v)
          }
        }
      }
      if (parent[sink] === -1) break
      let minCap = Infinity
      let v = sink
      while (v !== source) {
        const u = parent[v]!
        minCap = Math.min(minCap, cap[u]![v]!)
        v = u
      }
      v = sink
      while (v !== source) {
        const u = parent[v]!
        cap[u]![v]! -= minCap
        cap[v]![u]! += minCap
        v = u
      }
      totalFlow += minCap
    }
    return totalFlow
  }
}
