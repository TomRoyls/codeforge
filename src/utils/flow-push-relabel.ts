export class FlowPushRelabel {
  static maxFlow(
    edges: { from: number; to: number; capacity: number }[],
    source: number,
    sink: number,
    n: number,
  ): number {
    if (source === sink) return 0
    const cap: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (const e of edges) cap[e.from]![e.to]! += e.capacity
    const flow: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    const height = new Array(n).fill(0)
    const excess = new Array(n).fill(0)
    height[source] = n
    for (let v = 0; v < n; v++) {
      if (cap[source]![v]! > 0) {
        const c = cap[source]![v]!
        flow[source]![v] = c
        flow[v]![source] = -c
        excess[v] = c
        excess[source] -= c
      }
    }
    const list: number[] = []
    for (let i = 0; i < n; i++) {
      if (i !== source && i !== sink) list.push(i)
    }
    let pos = 0
    while (pos < list.length) {
      const u = list[pos]!
      let oldHeight = height[u]!
      FlowPushRelabel.discharge(u, n, cap, flow, height, excess, source, sink)
      if (height[u]! > oldHeight) {
        const node = list.splice(pos, 1)[0]!
        list.unshift(node)
        pos = 0
      }
      pos++
    }
    let total = 0
    for (let v = 0; v < n; v++) total += Math.max(0, flow[source]![v]!)
    return total
  }

  private static discharge(
    u: number,
    n: number,
    cap: number[][],
    flow: number[][],
    height: number[],
    excess: number[],
    _source: number,
    _sink: number,
  ): void {
    while (excess[u]! > 0) {
      let pushed = false
      for (let v = 0; v < n; v++) {
        const residual = cap[u]![v]! - flow[u]![v]!
        if (residual > 0 && height[u]! === height[v]! + 1) {
          const d = Math.min(excess[u]!, residual)
          flow[u]![v]! += d
          flow[v]![u]! -= d
          excess[u]! -= d
          excess[v]! += d
          pushed = true
          if (excess[u]! <= 0) break
        }
      }
      if (!pushed) {
        let minHeight = 2 * n
        for (let v = 0; v < n; v++) {
          if (cap[u]![v]! - flow[u]![v]! > 0 && height[v]! < minHeight) {
            minHeight = height[v]!
          }
        }
        height[u] = minHeight + 1
      }
    }
  }
}
