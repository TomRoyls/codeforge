export class NetworkFlow {
  static maxFlow(edges: { from: number; to: number; capacity: number }[], source: number, sink: number, n: number): number {
    if (source === sink) return 0
    const adj: Map<number, number[]> = new Map()
    const to: number[] = []
    const cap: number[] = []
    let edgeCount = 0
    function addEdge(u: number, v: number, c: number) {
      if (!adj.has(u)) adj.set(u, [])
      if (!adj.has(v)) adj.set(v, [])
      adj.get(u)!.push(edgeCount)
      to.push(v)
      cap.push(c)
      edgeCount++
      adj.get(v)!.push(edgeCount)
      to.push(u)
      cap.push(0)
      edgeCount++
    }
    for (const e of edges) addEdge(e.from, e.to, e.capacity)
    let totalFlow = 0
    while (true) {
      const level = new Array<number>(n).fill(-1)
      level[source] = 0
      const queue: number[] = [source]
      let qi = 0
      while (qi < queue.length && level[sink] === -1) {
        const u = queue[qi++]!
        for (const ei of (adj.get(u) ?? [])) {
          if (cap[ei]! > 0 && level[to[ei]!] === -1) {
            level[to[ei]!] = level[u]! + 1
            queue.push(to[ei]!)
          }
        }
      }
      if (level[sink] === -1) break
      const iter = new Array<number>(n).fill(0)
      function dfs(u: number, pushed: number): number {
        if (u === sink) return pushed
        while (iter[u]! < (adj.get(u)?.length ?? 0)) {
          const ei = adj.get(u)![iter[u]!]!
          if (cap[ei]! > 0 && level[to[ei]!] === level[u]! + 1) {
            const f = dfs(to[ei]!, Math.min(pushed, cap[ei]!))
            if (f > 0) {
              cap[ei]! -= f
              cap[ei ^ 1]! += f
              return f
            }
          }
          iter[u]!++
        }
        return 0
      }
      let pushed: number
      while ((pushed = dfs(source, Infinity)) > 0) totalFlow += pushed
    }
    return totalFlow
  }

  static hasAugmentingPath(edges: { from: number; to: number; capacity: number }[], source: number, sink: number, n: number): boolean {
    return NetworkFlow.maxFlow(edges, source, sink, n) > 0
  }
}
