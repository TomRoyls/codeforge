import type { DependencyGraph, CycleInfo } from './types.js'

export class CycleDetector {
  detectCycles(graph: DependencyGraph): CycleInfo[] {
    const cycles: CycleInfo[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const adjacency = this.buildAdjacency(graph)

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        this.findCyclesDFS(nodeId, adjacency, visited, recursionStack, path, cycles)
      }
    }

    return this.deduplicateCycles(cycles)
  }

  private findCyclesDFS(
    nodeId: string,
    adjacency: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    cycles: CycleInfo[],
  ): void {
    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    const neighbors = adjacency.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.findCyclesDFS(neighbor, adjacency, visited, recursionStack, path, cycles)
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor)
        const cycle = path.slice(cycleStart)
        if (cycle.length > 0) {
          cycles.push({
            cycle: [...cycle],
            length: cycle.length,
            severity: this.getSeverity(cycle.length),
          })
        }
      }
    }

    path.pop()
    recursionStack.delete(nodeId)
  }

  private getSeverity(length: number): 'low' | 'medium' | 'high' {
    if (length <= 2) return 'high'
    if (length <= 4) return 'medium'
    return 'low'
  }

  private deduplicateCycles(cycles: CycleInfo[]): CycleInfo[] {
    const seen = new Set<string>()
    return cycles.filter((c) => {
      const sorted = [...c.cycle].sort().join(',')
      if (seen.has(sorted)) return false
      seen.add(sorted)
      return true
    })
  }

  hasCycles(graph: DependencyGraph): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const adjacency = this.buildAdjacency(graph)

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (this.hasCycleDFS(nodeId, adjacency, visited, recursionStack)) {
          return true
        }
      }
    }

    return false
  }

  private hasCycleDFS(
    nodeId: string,
    adjacency: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
  ): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacency.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.hasCycleDFS(neighbor, adjacency, visited, recursionStack)) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  findStronglyConnectedComponents(graph: DependencyGraph): string[][] {
    const adjacency = this.buildAdjacency(graph)
    const indexCounter = { value: 0 }
    const stack: string[] = []
    const onStack = new Set<string>()
    const index = new Map<string, number>()
    const lowlink = new Map<string, number>()
    const sccs: string[][] = []

    for (const nodeId of graph.nodes.keys()) {
      if (!index.has(nodeId)) {
        this.tarjanSCC(nodeId, adjacency, indexCounter, stack, onStack, index, lowlink, sccs)
      }
    }

    return sccs.filter((scc) => scc.length > 1 || this.hasSelfLoop(scc[0]!, adjacency))
  }

  private tarjanSCC(
    nodeId: string,
    adjacency: Map<string, string[]>,
    indexCounter: { value: number },
    stack: string[],
    onStack: Set<string>,
    index: Map<string, number>,
    lowlink: Map<string, number>,
    sccs: string[][],
  ): void {
    index.set(nodeId, indexCounter.value)
    lowlink.set(nodeId, indexCounter.value)
    indexCounter.value++
    stack.push(nodeId)
    onStack.add(nodeId)

    const neighbors = adjacency.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (!index.has(neighbor)) {
        this.tarjanSCC(neighbor, adjacency, indexCounter, stack, onStack, index, lowlink, sccs)
        const nodeLow = lowlink.get(nodeId)!
        const neighborLow = lowlink.get(neighbor)!
        lowlink.set(nodeId, Math.min(nodeLow, neighborLow))
      } else if (onStack.has(neighbor)) {
        const nodeLow = lowlink.get(nodeId)!
        const neighborIdx = index.get(neighbor)!
        lowlink.set(nodeId, Math.min(nodeLow, neighborIdx))
      }
    }

    if (lowlink.get(nodeId) === index.get(nodeId)) {
      const scc: string[] = []
      let w: string | undefined
      do {
        w = stack.pop()!
        onStack.delete(w)
        scc.push(w)
      } while (w !== nodeId)
      sccs.push(scc)
    }
  }

  private hasSelfLoop(nodeId: string, adjacency: Map<string, string[]>): boolean {
    return (adjacency.get(nodeId) ?? []).includes(nodeId)
  }

  suggestFix(cycle: CycleInfo): string {
    const [first, second] = cycle.cycle
    if (cycle.length === 2 && first && second) {
      return `Consider extracting shared logic from "${first}" and "${second}" into a separate module to break the direct circular dependency.`
    }
    if (cycle.length === 1) {
      return `Self-dependency detected in "${cycle.cycle[0]}". Remove the self-referencing import.`
    }
    const start = cycle.cycle[0]!
    const end = cycle.cycle[cycle.cycle.length - 1]!
    return `Circular dependency: ${cycle.cycle.join(' -> ')} -> ${start}. Consider using dependency injection or an event emitter pattern to decouple "${start}" from "${end}".`
  }

  private buildAdjacency(graph: DependencyGraph): Map<string, string[]> {
    const adjacency = new Map<string, string[]>()
    for (const nodeId of graph.nodes.keys()) {
      adjacency.set(nodeId, [])
    }
    for (const edge of graph.edges) {
      const neighbors = adjacency.get(edge.from)
      if (neighbors) {
        neighbors.push(edge.to)
      }
    }
    return adjacency
  }
}
