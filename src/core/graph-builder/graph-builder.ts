import type { GraphEdge, GraphNode, GraphOptions, GraphStats, TraversalResult, CycleResult } from './types.js'
import { DEFAULT_GRAPH_OPTIONS } from './types.js'

const WHITE = 0
const GRAY = 1
const BLACK = 2

export class GraphBuilder {
  private nodes: Map<string, GraphNode> = new Map()
  private options: GraphOptions
  private edgeCount: number = 0

  constructor(options?: Partial<GraphOptions>) {
    this.options = { ...DEFAULT_GRAPH_OPTIONS, ...options }
  }

  addNode(id: string, metadata?: Record<string, unknown>): boolean {
    if (this.nodes.has(id)) {
      return false
    }
    if (this.nodes.size >= this.options.maxNodes) {
      return false
    }
    this.nodes.set(id, { id, edges: [], metadata })
    return true
  }

  removeNode(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) {
      return false
    }
    const edgesToRemove = new Set<string>()
    for (const edge of node.edges) {
      edgesToRemove.add(`${id}->${edge.to}`)
    }
    for (const [nid, n] of this.nodes) {
      if (nid === id) continue
      for (const edge of n.edges) {
        if (edge.to === id) {
          edgesToRemove.add(`${nid}->${id}`)
        }
      }
    }
    for (const edge of node.edges) {
      const targetNode = this.nodes.get(edge.to)
      if (targetNode) {
        targetNode.edges = targetNode.edges.filter(e => e.to !== id)
      }
    }
    for (const [nid, n] of this.nodes) {
      if (nid === id) continue
      n.edges = n.edges.filter(e => e.to !== id)
    }
    this.nodes.delete(id)
    this.edgeCount = Math.max(0, this.edgeCount - edgesToRemove.size)
    return true
  }

  addEdge(from: string, to: string, weight?: number, label?: string): boolean {
    const fromNode = this.nodes.get(from)
    const toNode = this.nodes.get(to)
    if (!fromNode || !toNode) {
      return false
    }
    if (!this.options.allowSelfLoops && from === to) {
      return false
    }
    const existingFrom = fromNode.edges.find(e => e.to === to)
    if (existingFrom) {
      existingFrom.weight = weight
      existingFrom.label = label
      return true
    }
    const edge: GraphEdge = { from, to, weight, label }
    fromNode.edges.push(edge)
    this.edgeCount++
    if (this.options.type === 'undirected') {
      const existingTo = toNode.edges.find(e => e.to === from)
      if (!existingTo) {
        toNode.edges.push({ from: to, to: from, weight, label })
        this.edgeCount++
      }
    }
    return true
  }

  removeEdge(from: string, to: string): boolean {
    const fromNode = this.nodes.get(from)
    if (!fromNode) {
      return false
    }
    const idx = fromNode.edges.findIndex(e => e.to === to)
    if (idx === -1) {
      return false
    }
    fromNode.edges.splice(idx, 1)
    this.edgeCount--
    if (this.options.type === 'undirected') {
      const toNode = this.nodes.get(to)
      if (toNode) {
        const reverseIdx = toNode.edges.findIndex(e => e.to === from)
        if (reverseIdx !== -1) {
          toNode.edges.splice(reverseIdx, 1)
          this.edgeCount--
        }
      }
    }
    return true
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id)
  }

  hasEdge(from: string, to: string): boolean {
    const fromNode = this.nodes.get(from)
    if (!fromNode) {
      return false
    }
    return fromNode.edges.some(e => e.to === to)
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id)
  }

  getNeighbors(id: string): string[] {
    const node = this.nodes.get(id)
    if (!node) {
      return []
    }
    const result = node.edges.map(e => e.to)
    if (this.options.type === 'directed') {
      for (const [, n] of this.nodes) {
        if (n.id === id) continue
        if (n.edges.some(e => e.to === id) && !result.includes(n.id)) {
          result.push(n.id)
        }
      }
    }
    return result
  }

  getInDegree(id: string): number {
    let count = 0
    for (const [, node] of this.nodes) {
      if (node.edges.some(e => e.to === id)) {
        count++
      }
    }
    return count
  }

  getOutDegree(id: string): number {
    const node = this.nodes.get(id)
    if (!node) {
      return 0
    }
    return node.edges.length
  }

  bfs(startId: string): TraversalResult[] {
    if (!this.nodes.has(startId)) {
      return []
    }
    const result: TraversalResult[] = []
    const visited = new Set<string>()
    const queue: Array<{ id: string; depth: number; parent: string | null }> = [
      { id: startId, depth: 0, parent: null },
    ]
    visited.add(startId)
    let _qi = 0
    while (_qi < queue.length) {
      const current = queue[_qi++]!
      result.push({ nodeId: current.id, depth: current.depth, parent: current.parent })
      const neighbors = this.getAdjacentNodes(current.id)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push({ id: neighbor, depth: current.depth + 1, parent: current.id })
        }
      }
    }
    return result
  }

  dfs(startId: string): TraversalResult[] {
    if (!this.nodes.has(startId)) {
      return []
    }
    const result: TraversalResult[] = []
    const visited = new Set<string>()
    this.dfsVisit(startId, 0, null, visited, result)
    return result
  }

  private dfsVisit(
    nodeId: string,
    depth: number,
    parent: string | null,
    visited: Set<string>,
    result: TraversalResult[],
  ): void {
    visited.add(nodeId)
    result.push({ nodeId, depth, parent })
    const neighbors = this.getAdjacentNodes(nodeId)
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfsVisit(neighbor, depth + 1, nodeId, visited, result)
      }
    }
  }

  private getAdjacentNodes(id: string): string[] {
    const node = this.nodes.get(id)
    if (!node) {
      return []
    }
    return node.edges.map(e => e.to)
  }

  detectCycles(): CycleResult {
    if (this.options.type === 'undirected') {
      return this.detectUndirectedCycle()
    }
    return this.detectDirectedCycle()
  }

  private detectDirectedCycle(): CycleResult {
    const color = new Map<string, number>()
    const parent = new Map<string, string | null>()

    for (const id of this.nodes.keys()) {
      color.set(id, WHITE)
      parent.set(id, null)
    }

    for (const id of this.nodes.keys()) {
      if (color.get(id) === WHITE) {
        const cycle = this.dfsCycleDirected(id, color, parent)
        if (cycle.length > 0) {
          return { hasCycle: true, cycle }
        }
      }
    }

    return { hasCycle: false, cycle: [] }
  }

  private dfsCycleDirected(
    nodeId: string,
    color: Map<string, number>,
    parent: Map<string, string | null>,
  ): string[] {
    color.set(nodeId, GRAY)
    const neighbors = this.getAdjacentNodes(nodeId)

    for (const neighbor of neighbors) {
      if (color.get(neighbor) === GRAY) {
        const cycle: string[] = [neighbor]
        let current: string | null = nodeId
        while (current !== null && current !== neighbor) {
          cycle.push(current)
          current = parent.get(current) ?? null
        }
        cycle.push(neighbor)
        cycle.reverse()
        return cycle
      }
      if (color.get(neighbor) === WHITE) {
        parent.set(neighbor, nodeId)
        const result = this.dfsCycleDirected(neighbor, color, parent)
        if (result.length > 0) {
          return result
        }
      }
    }

    color.set(nodeId, BLACK)
    return []
  }

  private detectUndirectedCycle(): CycleResult {
    const visited = new Set<string>()
    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) {
        const result = this.dfsUndirectedCycle(id, null, visited)
        if (result.length > 0) {
          return { hasCycle: true, cycle: result }
        }
      }
    }
    return { hasCycle: false, cycle: [] }
  }

  private dfsUndirectedCycle(
    nodeId: string,
    parentNode: string | null,
    visited: Set<string>,
  ): string[] {
    visited.add(nodeId)
    const neighbors = this.getAdjacentNodes(nodeId)

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const result = this.dfsUndirectedCycle(neighbor, nodeId, visited)
        if (result.length > 0) {
          if (result[0] === neighbor || result.includes(neighbor)) {
            return result
          }
          return [nodeId, ...result]
        }
      } else if (neighbor !== parentNode) {
        return [neighbor, nodeId]
      }
    }

    return []
  }

  topologicalSort(): string[] | null {
    if (this.options.type !== 'directed') {
      return null
    }
    const cycleResult = this.detectCycles()
    if (cycleResult.hasCycle) {
      return null
    }
    const visited = new Set<string>()
    const result: string[] = []
    const nodes = Array.from(this.nodes.keys())
    for (const id of nodes) {
      if (!visited.has(id)) {
        this.topoDfs(id, visited, result)
      }
    }
    return result.reverse()
  }

  private topoDfs(nodeId: string, visited: Set<string>, result: string[]): void {
    visited.add(nodeId)
    const neighbors = this.getAdjacentNodes(nodeId)
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.topoDfs(neighbor, visited, result)
      }
    }
    result.push(nodeId)
  }

  getStats(): GraphStats {
    const nodeCount = this.nodes.size
    const edgeCount = this.edgeCount
    const averageDegree = nodeCount > 0 ? edgeCount / nodeCount : 0
    const isConnected = nodeCount === 0 ? true : this.checkConnected()
    return {
      nodeCount,
      edgeCount,
      isDirected: this.options.type === 'directed',
      averageDegree,
      isConnected,
    }
  }

  private checkConnected(): boolean {
    if (this.nodes.size === 0) {
      return true
    }
    const startNode = this.nodes.keys().next().value
    if (startNode === undefined) {
      return true
    }
    const visited = new Set<string>()
    const stack = [startNode]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      const node = this.nodes.get(current)
      if (node) {
        for (const edge of node.edges) {
          if (!visited.has(edge.to)) {
            stack.push(edge.to)
          }
        }
      }
      for (const [nid, n] of this.nodes) {
        if (nid === current) continue
        if (n.edges.some(e => e.to === current) && !visited.has(nid)) {
          stack.push(nid)
        }
      }
    }
    return visited.size === this.nodes.size
  }

  clear(): void {
    this.nodes.clear()
    this.edgeCount = 0
  }

  getNodeCount(): number {
    return this.nodes.size
  }

  getEdgeCount(): number {
    return this.edgeCount
  }
}

export { DEFAULT_GRAPH_OPTIONS } from './types.js'
export type { GraphEdge, GraphNode, GraphType, GraphOptions, TraversalResult, CycleResult, GraphStats } from './types.js'
