export class GraphTraversal {
  static bfs(adjacency: Map<number, number[]>, start: number): number[] {
    const visited = new Set<number>()
    const result: number[] = []
    const queue: number[] = [start]
    visited.add(start)
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)
      for (const neighbor of (adjacency.get(node) ?? [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }
    return result
  }

  static dfs(adjacency: Map<number, number[]>, start: number): number[] {
    const visited = new Set<number>()
    const result: number[] = []
    function visit(node: number) {
      if (visited.has(node)) return
      visited.add(node)
      result.push(node)
      for (const neighbor of (adjacency.get(node) ?? [])) {
        visit(neighbor)
      }
    }
    visit(start)
    return result
  }

  static dfsIterative(adjacency: Map<number, number[]>, start: number): number[] {
    const visited = new Set<number>()
    const result: number[] = []
    const stack: number[] = [start]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (visited.has(node)) continue
      visited.add(node)
      result.push(node)
      const neighbors = (adjacency.get(node) ?? []).slice().reverse()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) stack.push(neighbor)
      }
    }
    return result
  }

  static connectedComponents(adjacency: Map<number, number[]>): number[][] {
    const visited = new Set<number>()
    const components: number[][] = []
    for (const node of adjacency.keys()) {
      if (!visited.has(node)) {
        const component = GraphTraversal.bfs(adjacency, node)
        components.push(component)
        for (const n of component) visited.add(n)
      }
    }
    return components
  }

  static hasCycle(adjacency: Map<number, number[]>): boolean {
    const visited = new Set<number>()
    const recStack = new Set<number>()
    function dfs(node: number): boolean {
      visited.add(node)
      recStack.add(node)
      for (const neighbor of (adjacency.get(node) ?? [])) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true
        } else if (recStack.has(neighbor)) {
          return true
        }
      }
      recStack.delete(node)
      return false
    }
    for (const node of adjacency.keys()) {
      if (!visited.has(node) && dfs(node)) return true
    }
    return false
  }

  static shortestPathBFS(adjacency: Map<number, number[]>, start: number, end: number): number[] | null {
    const visited = new Set<number>()
    const parent = new Map<number, number>()
    const queue: number[] = [start]
    visited.add(start)
    while (queue.length > 0) {
      const node = queue.shift()!
      if (node === end) {
        const path: number[] = []
        let curr: number | undefined = end
        while (curr !== undefined) {
          path.push(curr)
          curr = parent.get(curr)
        }
        return path.reverse()
      }
      for (const neighbor of (adjacency.get(node) ?? [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          parent.set(neighbor, node)
          queue.push(neighbor)
        }
      }
    }
    return null
  }
}
