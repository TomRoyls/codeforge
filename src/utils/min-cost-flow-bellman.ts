interface Edge {
  from: number
  to: number
  capacity: number
  cost: number
}

export class MinCostFlow {
  private n: number
  private edges: Edge[] = []

  constructor(n: number) {
    this.n = n
  }

  addEdge(u: number, v: number, capacity: number, cost: number): void {
    this.edges.push({ from: u, to: v, capacity, cost })
  }

  solve(source: number, sink: number): { maxFlow: number; minCost: number } {
    return MinCostFlow.minCostMaxFlow(this.edges, source, sink, this.n)
  }

  static minCostMaxFlow(
    edges: Edge[],
    source: number,
    sink: number,
    n: number,
  ): { maxFlow: number; minCost: number } {
    const adj: Map<number, number[]> = new Map()
    const to: number[] = []
    const cap: number[] = []
    const cost: number[] = []
    let edgeCount = 0
    function addEdge(u: number, v: number, c: number, w: number) {
      if (!adj.has(u)) adj.set(u, [])
      if (!adj.has(v)) adj.set(v, [])
      adj.get(u)!.push(edgeCount)
      to.push(v); cap.push(c); cost.push(w)
      edgeCount++
      adj.get(v)!.push(edgeCount)
      to.push(u); cap.push(0); cost.push(-w)
      edgeCount++
    }
    for (const e of edges) addEdge(e.from, e.to, e.capacity, e.cost)
    if (source === sink) return { maxFlow: 0, minCost: 0 }
    let totalFlow = 0
    let totalCost = 0
    const dist = new Array<number>(n)
    const parent = new Array<number>(n)
    let outerIter = 0
    while (outerIter++ < n * n) {
      dist.fill(Infinity)
      parent.fill(-1)
      dist[source] = 0
      const inQueue = new Array<boolean>(n).fill(false)
      inQueue[source] = true
      const queue: number[] = [source]
      let qi = 0
      let iterations = 0
      const maxIter = n * n
      while (qi < queue.length && iterations < maxIter) {
        iterations++
        const u = queue[qi++]!
        inQueue[u] = false
        for (const ei of (adj.get(u) ?? [])) {
          if (cap[ei]! > 0 && dist[u]! + cost[ei]! < dist[to[ei]!]!) {
            dist[to[ei]!] = dist[u]! + cost[ei]!
            parent[to[ei]!] = ei
            if (!inQueue[to[ei]!]) {
              queue.push(to[ei]!)
              inQueue[to[ei]!] = true
            }
          }
        }
      }
      if (dist[sink] === Infinity) break
      let pushed = Infinity
      let v = sink
      while (v !== source) {
        const ei = parent[v]!
        pushed = Math.min(pushed, cap[ei]!)
        v = to[ei ^ 1]!
      }
      v = sink
      while (v !== source) {
        const ei = parent[v]!
        cap[ei]! -= pushed
        cap[ei ^ 1]! += pushed
        v = to[ei ^ 1]!
      }
      totalFlow += pushed
      totalCost += pushed * dist[sink]!
    }
    return { maxFlow: totalFlow, minCost: totalCost }
  }
}
