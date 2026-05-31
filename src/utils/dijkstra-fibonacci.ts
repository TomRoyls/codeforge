export class DijkstraFibonacci {
  static shortestPath(
    edges: { from: number; to: number; weight: number }[],
    source: number,
    n: number,
  ): number[] {
    const adj: { to: number; weight: number }[][] = Array.from({ length: n }, () => [])
    for (const e of edges) adj[e.from]!.push({ to: e.to, weight: e.weight })
    const dist = new Array(n).fill(Infinity)
    dist[source] = 0
    const visited = new Array(n).fill(false)
    const heap: { node: number; dist: number }[] = [{ node: source, dist: 0 }]
    const decreaseKey = (node: number, newDist: number): void => {
      for (const entry of heap) {
        if (entry.node === node) {
          entry.dist = newDist
          return
        }
      }
      heap.push({ node, dist: newDist })
    }
    while (heap.length > 0) {
      let minIdx = 0
      for (let i = 1; i < heap.length; i++) {
        if (heap[i]!.dist < heap[minIdx]!.dist) minIdx = i
      }
      const { node: u, dist: d } = heap.splice(minIdx, 1)[0]!
      if (visited[u]) continue
      visited[u] = true
      for (const { to: v, weight: w } of adj[u]!) {
        if (!visited[v] && d + w < dist[v]!) {
          dist[v] = d + w
          decreaseKey(v, dist[v]!)
        }
      }
    }
    return dist
  }
}
