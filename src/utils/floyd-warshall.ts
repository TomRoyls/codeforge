export class FloydWarshall {
  static allPairsShortestPath(
    edges: { from: number; to: number; weight: number }[],
    nodeCount: number
  ): number[][] {
    const dist: number[][] = Array.from({ length: nodeCount }, (_, i) =>
      Array.from({ length: nodeCount }, (_, j) => (i === j ? 0 : Infinity))
    )
    for (const { from, to, weight } of edges) {
      dist[from]![to] = Math.min(dist[from]![to]!, weight)
    }
    for (let k = 0; k < nodeCount; k++) {
      for (let i = 0; i < nodeCount; i++) {
        for (let j = 0; j < nodeCount; j++) {
          if (dist[i]![k]! + dist[k]![j]! < dist[i]![j]!) {
            dist[i]![j] = dist[i]![k]! + dist[k]![j]!
          }
        }
      }
    }
    return dist
  }

  static hasNegativeCycle(
    edges: { from: number; to: number; weight: number }[],
    nodeCount: number
  ): boolean {
    const dist = FloydWarshall.allPairsShortestPath(edges, nodeCount)
    for (let i = 0; i < nodeCount; i++) {
      if (dist[i]![i]! < 0) return true
    }
    return false
  }

  static transitiveClosure(
    edges: { from: number; to: number }[],
    nodeCount: number
  ): boolean[][] {
    const reach: boolean[][] = Array.from({ length: nodeCount }, (_, i) =>
      Array.from({ length: nodeCount }, (_, j) => i === j)
    )
    for (const { from, to } of edges) {
      reach[from]![to] = true
    }
    for (let k = 0; k < nodeCount; k++) {
      for (let i = 0; i < nodeCount; i++) {
        for (let j = 0; j < nodeCount; j++) {
          if (reach[i]![k]! && reach[k]![j]!) reach[i]![j] = true
        }
      }
    }
    return reach
  }
}
