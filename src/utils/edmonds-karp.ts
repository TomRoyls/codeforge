export class EdmondsKarp {
  static maxFlow(edges: { from: number; to: number; capacity: number }[], source: number, sink: number, n: number): number {
    if (source === sink) return 0
    const adj: number[][] = Array.from({ length: n }, () => [])
    const cap: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (const { from, to, capacity } of edges) {
      if (cap[from]![to] === 0 && cap[to]![from] === 0) {
        adj[from]!.push(to)
        adj[to]!.push(from)
      }
      cap[from]![to]! += capacity
    }
    let totalFlow = 0
    while (true) {
      const parent = new Array<number>(n).fill(-1)
      parent[source] = source
      const queue: number[] = [source]
      while (queue.length > 0 && parent[sink] === -1) {
        const u = queue.shift()!
        for (const v of adj[u]!) {
          if (parent[v] === -1 && cap[u]![v]! > 0) {
            parent[v] = u
            queue.push(v)
          }
        }
      }
      if (parent[sink] === -1) break
      let pathFlow = Infinity
      let v = sink
      while (v !== source) {
        const u = parent[v]!
        pathFlow = Math.min(pathFlow, cap[u]![v]!)
        v = u
      }
      v = sink
      while (v !== source) {
        const u = parent[v]!
        cap[u]![v]! -= pathFlow
        cap[v]![u]! += pathFlow
        v = u
      }
      totalFlow += pathFlow
    }
    return totalFlow
  }

  static minCut(edges: { from: number; to: number; capacity: number }[], source: number, sink: number, n: number): { maxFlow: number; reachable: Set<number> } {
    if (source === sink) return { maxFlow: 0, reachable: new Set([source]) }

    const adj: number[][] = Array.from({ length: n }, () => [])
    const cap: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (const { from, to, capacity } of edges) {
      if (cap[from]![to]! === 0 && cap[to]![from]! === 0) {
        adj[from]!.push(to)
        adj[to]!.push(from)
      }
      cap[from]![to]! += capacity
    }

    let totalFlow = 0
    while (true) {
      const parent = new Array<number>(n).fill(-1)
      parent[source] = source
      const queue: number[] = [source]
      while (queue.length > 0 && parent[sink] === -1) {
        const u = queue.shift()!
        for (const v of adj[u]!) {
          if (parent[v] === -1 && cap[u]![v]! > 0) {
            parent[v] = u
            queue.push(v)
          }
        }
      }
      if (parent[sink] === -1) break
      let pathFlow = Infinity
      let v = sink
      while (v !== source) {
        const u = parent[v]!
        pathFlow = Math.min(pathFlow, cap[u]![v]!)
        v = u
      }
      v = sink
      while (v !== source) {
        const u = parent[v]!
        cap[u]![v]! -= pathFlow
        cap[v]![u]! += pathFlow
        v = u
      }
      totalFlow += pathFlow
    }

    const visited = new Set<number>()
    const queue: number[] = [source]
    visited.add(source)
    while (queue.length > 0) {
      const u = queue.shift()!
      for (const v of adj[u]!) {
        if (!visited.has(v) && cap[u]![v]! > 0) {
          visited.add(v)
          queue.push(v)
        }
      }
    }
    return { maxFlow: totalFlow, reachable: visited }
  }
}
