export class Dijkstra {
  static shortestPath(
    adjacency: Map<number, { to: number; weight: number }[]>,
    start: number,
    end?: number
  ): { distances: Map<number, number>; parents: Map<number, number | null> } {
    const distances = new Map<number, number>()
    const parents = new Map<number, number | null>()
    const visited = new Set<number>()
    for (const node of adjacency.keys()) {
      distances.set(node, Infinity)
      parents.set(node, null)
    }
    distances.set(start, 0)
    while (true) {
      let minDist = Infinity
      let minNode: number | null = null
      for (const [node, dist] of distances) {
        if (!visited.has(node) && dist < minDist) {
          minDist = dist
          minNode = node
        }
      }
      if (minNode === null || minNode === end) break
      visited.add(minNode)
      for (const { to, weight } of (adjacency.get(minNode) ?? [])) {
        const newDist = minDist + weight
        if (newDist < (distances.get(to) ?? Infinity)) {
          distances.set(to, newDist)
          parents.set(to, minNode)
        }
      }
    }
    return { distances, parents }
  }

  static reconstructPath(parents: Map<number, number | null>, start: number, end: number): number[] | null {
    if (parents.get(end) === null && start !== end) return null
    const path: number[] = []
    let current: number | null = end
    while (current !== null) {
      path.push(current)
      if (current === start) break
      current = parents.get(current) ?? null
    }
    if (path[path.length - 1] !== start) return null
    return path.reverse()
  }
}
