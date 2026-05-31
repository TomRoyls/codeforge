export class TopologicalSort {
  static sort(adjacency: Map<number, number[]>): number[] | null {
    const inDegree = new Map<number, number>()
    for (const node of adjacency.keys()) {
      if (!inDegree.has(node)) inDegree.set(node, 0)
    }
    for (const [, neighbors] of adjacency) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1)
      }
    }
    const queue: number[] = []
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node)
    }
    const result: number[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)
      for (const neighbor of (adjacency.get(node) ?? [])) {
        const newDegree = inDegree.get(neighbor)! - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) queue.push(neighbor)
      }
    }
    return result.length === inDegree.size ? result : null
  }

  static allTopologicalSorts(adjacency: Map<number, number[]>): number[][] {
    const inDegree = new Map<number, number>()
    const nodes: number[] = []
    for (const node of adjacency.keys()) {
      inDegree.set(node, 0)
      nodes.push(node)
    }
    for (const [, neighbors] of adjacency) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1)
      }
    }
    const results: number[][] = []
    function backtrack(current: number[], degree: Map<number, number>, remaining: Set<number>) {
      if (current.length === nodes.length) {
        results.push([...current])
        return
      }
      for (const node of remaining) {
        if (degree.get(node) === 0) {
          current.push(node)
          const nextRemaining = new Set(remaining)
          nextRemaining.delete(node)
          const nextDegree = new Map(degree)
          for (const neighbor of (adjacency.get(node) ?? [])) {
            nextDegree.set(neighbor, nextDegree.get(neighbor)! - 1)
          }
          backtrack(current, nextDegree, nextRemaining)
          current.pop()
        }
      }
    }
    backtrack([], inDegree, new Set(nodes))
    return results
  }
}
