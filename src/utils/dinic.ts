export class DinicMaxFlow {
  static maxFlow(
    edges: { from: number; to: number; capacity: number }[],
    source: number,
    sink: number,
    nodeCount: number
  ): number {
    const adj: number[][] = Array.from({ length: nodeCount }, () => [])
    const capacities: number[][] = Array.from({ length: nodeCount }, () => new Array<number>(nodeCount).fill(0))
    for (const { from, to, capacity } of edges) {
      if (capacities[from]![to]! === 0 && capacities[to]![from]! === 0) {
        adj[from]!.push(to)
        adj[to]!.push(from)
      }
      capacities[from]![to]! += capacity
    }
    if (source === sink) return 0
    let totalFlow = 0
    const level = new Array<number>(nodeCount).fill(-1)
    function bfs(): boolean {
      level.fill(-1)
      level[source] = 0
      const queue: number[] = [source]
      let qi = 0
      while (qi < queue.length) {
        const u = queue[qi++]!
        for (const v of adj[u]!) {
          if (level[v] === -1 && capacities[u]![v]! > 0) {
            level[v] = level[u]! + 1
            queue.push(v)
          }
        }
      }
      return level[sink] !== -1
    }
    const iter = new Array<number>(nodeCount).fill(0)
    function dfs(u: number, flow: number): number {
      if (u === sink) return flow
      while (iter[u]! < adj[u]!.length) {
        const v = adj[u]![iter[u]!]
        if (level[v] === level[u]! + 1 && capacities[u]![v]! > 0) {
          const pushed = dfs(v, Math.min(flow, capacities[u]![v]!))
          if (pushed > 0) {
            capacities[u]![v]! -= pushed
            capacities[v]![u]! += pushed
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
      let safetyIter = 0
      do {
        pushed = dfs(source, 1e15)
        totalFlow += pushed
        safetyIter++
        if (safetyIter > 10000) break
      } while (pushed > 0)
    }
    return totalFlow
  }
}
