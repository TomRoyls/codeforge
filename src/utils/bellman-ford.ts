export class BellmanFord {
  static shortestPath(
    edges: { from: number; to: number; weight: number }[],
    nodeCount: number,
    start: number
  ): { distances: Map<number, number>; hasNegativeCycle: boolean } {
    const distances = new Map<number, number>()
    for (let i = 0; i < nodeCount; i++) distances.set(i, Infinity)
    distances.set(start, 0)
    for (let iter = 0; iter < nodeCount - 1; iter++) {
      for (const { from, to, weight } of edges) {
        const d = distances.get(from)!
        if (d !== Infinity && d + weight < distances.get(to)!) {
          distances.set(to, d + weight)
        }
      }
    }
    let hasNegativeCycle = false
    for (const { from, to, weight } of edges) {
      const d = distances.get(from)!
      if (d !== Infinity && d + weight < distances.get(to)!) {
        hasNegativeCycle = true
        break
      }
    }
    return { distances, hasNegativeCycle }
  }
}
