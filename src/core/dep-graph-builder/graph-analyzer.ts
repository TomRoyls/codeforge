import type {
  DependencyGraph,
  CyclePath,
  GraphMetrics,
  TopologicalOrder,
} from './types.js'

export class GraphAnalyzer {
  private graph: DependencyGraph
  private adjList: Map<string, Set<string>>
  private revAdjList: Map<string, Set<string>>

  constructor(graph: DependencyGraph) {
    this.graph = graph
    this.adjList = new Map()
    this.revAdjList = new Map()
    for (const id of graph.nodes.keys()) {
      this.adjList.set(id, new Set())
      this.revAdjList.set(id, new Set())
    }
    for (const edge of graph.edges) {
      this.adjList.get(edge.from)?.add(edge.to)
      this.revAdjList.get(edge.to)?.add(edge.from)
    }
  }

  detectCycles(): CyclePath[] {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const cycles: CyclePath[] = []

    const dfs = (node: string, path: string[]): void => {
      if (stack.has(node)) {
        const cycleStart = path.indexOf(node)
        if (cycleStart !== -1) {
          const cycleNodes = [...path.slice(cycleStart), node]
          const cyclePath: CyclePath = {
            nodes: cycleNodes,
            length: cycleNodes.length - 1,
            severity: this.computeCycleSeverity(cycleNodes.length - 1),
          }
          cycles.push(cyclePath)
        }
        return
      }
      if (visited.has(node)) return

      visited.add(node)
      stack.add(node)
      path.push(node)

      const neighbors = this.adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors) {
          dfs(neighbor, path)
        }
      }

      path.pop()
      stack.delete(node)
    }

    for (const nodeId of this.graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, [])
      }
    }

    return cycles
  }

  private computeCycleSeverity(length: number): 'low' | 'medium' | 'high' {
    if (length <= 2) return 'low'
    if (length <= 5) return 'medium'
    return 'high'
  }

  topologicalSort(): TopologicalOrder {
    const inDegree = new Map<string, number>()
    for (const id of this.graph.nodes.keys()) {
      inDegree.set(id, 0)
    }
    for (const edge of this.graph.edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
    }

    const queue: string[] = []
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id)
    }

    const order: string[] = []
    const levels = new Map<string, number>()

    for (const id of queue) {
      levels.set(id, 0)
    }

    let idx = 0
    while (idx < queue.length) {
      const node = queue[idx]!
      order.push(node)
      const currentLevel = levels.get(node) ?? 0

      const neighbors = this.adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors) {
          const deg = inDegree.get(neighbor)! - 1
          inDegree.set(neighbor, deg)
          const neighborLevel = currentLevel + 1
          const existingLevel = levels.get(neighbor)
          if (existingLevel === undefined || neighborLevel > existingLevel) {
            levels.set(neighbor, neighborLevel)
          }
          if (deg === 0) {
            queue.push(neighbor)
          }
        }
      }
      idx++
    }

    const isValid = order.length === this.graph.nodes.size
    if (!isValid && order.length < this.graph.nodes.size) {
      for (const id of this.graph.nodes.keys()) {
        if (!levels.has(id)) {
          levels.set(id, -1)
        }
      }
    }

    return { order, levels, isValid }
  }

  getMetrics(): GraphMetrics {
    const totalNodes = this.graph.nodes.size
    const totalEdges = this.graph.edges.length

    const inDegrees = new Map<string, number>()
    const outDegrees = new Map<string, number>()
    for (const id of this.graph.nodes.keys()) {
      inDegrees.set(id, 0)
      outDegrees.set(id, 0)
    }
    for (const edge of this.graph.edges) {
      inDegrees.set(edge.to, (inDegrees.get(edge.to) ?? 0) + 1)
      outDegrees.set(edge.from, (outDegrees.get(edge.from) ?? 0) + 1)
    }

    let maxInDeg = { node: '', degree: 0 }
    let maxOutDeg = { node: '', degree: 0 }
    for (const [id, deg] of inDegrees) {
      if (deg > maxInDeg.degree) maxInDeg = { node: id, degree: deg }
    }
    for (const [id, deg] of outDegrees) {
      if (deg > maxOutDeg.degree) maxOutDeg = { node: id, degree: deg }
    }

    if (maxInDeg.node === '' && totalNodes > 0) {
      const first = this.graph.nodes.keys().next().value!
      maxInDeg = { node: first, degree: 0 }
    }
    if (maxOutDeg.node === '' && totalNodes > 0) {
      const first = this.graph.nodes.keys().next().value!
      maxOutDeg = { node: first, degree: 0 }
    }

    const avgDegree = totalNodes > 0 ? totalEdges / totalNodes : 0
    const maxPossibleEdges = totalNodes * (totalNodes - 1)
    const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0

    const cycles = this.detectCycles()
    const orphans = this.getOrphans()

    return {
      totalNodes,
      totalEdges,
      avgDegree,
      maxInDegree: maxInDeg,
      maxOutDegree: maxOutDeg,
      density,
      cycles: cycles.length,
      orphans,
    }
  }

  getDependents(nodeId: string): string[] {
    const visited = new Set<string>()
    const stack = [nodeId]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      const parents = this.revAdjList.get(current)
      if (parents) {
        for (const parent of parents) {
          if (!visited.has(parent)) {
            stack.push(parent)
          }
        }
      }
    }
    visited.delete(nodeId)
    return [...visited]
  }

  getDependencies(nodeId: string): string[] {
    const visited = new Set<string>()
    const stack = [nodeId]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      const children = this.adjList.get(current)
      if (children) {
        for (const child of children) {
          if (!visited.has(child)) {
            stack.push(child)
          }
        }
      }
    }
    visited.delete(nodeId)
    return [...visited]
  }

  getOrphans(): string[] {
    const orphans: string[] = []
    for (const id of this.graph.nodes.keys()) {
      const hasIn = this.revAdjList.get(id)?.size ?? 0
      const hasOut = this.adjList.get(id)?.size ?? 0
      if (hasIn === 0 && hasOut === 0) {
        orphans.push(id)
      }
    }
    return orphans
  }

  getBottlenecks(threshold: number = 3): string[] {
    const bottlenecks: string[] = []
    for (const [id, parents] of this.revAdjList) {
      if (parents.size >= threshold) {
        bottlenecks.push(id)
      }
    }
    return bottlenecks
  }

  getSubgraph(nodeIds: string[]): DependencyGraph {
    const idSet = new Set(nodeIds)
    const nodes = new Map<string, import('./types.js').GraphNode>()
    const edges: import('./types.js').GraphEdge[] = []

    for (const id of nodeIds) {
      const node = this.graph.nodes.get(id)
      if (node) {
        nodes.set(id, { ...node, metadata: { ...node.metadata } })
      }
    }

    for (const edge of this.graph.edges) {
      if (idSet.has(edge.from) && idSet.has(edge.to)) {
        edges.push({ ...edge, importedNames: [...edge.importedNames] })
      }
    }

    return { nodes, edges, root: nodeIds[0] ?? '' }
  }

  shortestPath(from: string, to: string): string[] | null {
    if (from === to) return [from]

    const visited = new Set<string>()
    const queue: string[][] = [[from]]
    visited.add(from)

    while (queue.length > 0) {
      const path = queue.shift()!
      const current = path[path.length - 1]!

      const neighbors = this.adjList.get(current)
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (neighbor === to) {
            return [...path, neighbor]
          }
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push([...path, neighbor])
          }
        }
      }
    }

    return null
  }

  affects(nodeId: string): string[] {
    return this.getDependents(nodeId)
  }
}
