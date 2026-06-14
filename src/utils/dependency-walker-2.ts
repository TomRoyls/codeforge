export type NodeType2 = 'root' | 'module' | 'function' | 'class' | 'variable' | 'import' | 'export'

export interface DependencyNode2 {
  id: string
  name: string
  type: NodeType2
  path: string
  size: number
  metadata: Record<string, unknown>
}

export interface DependencyEdge2 {
  from: string
  to: string
  type: 'imports' | 'calls' | 'extends' | 'implements' | 'references'
  count: number
}

export class DependencyWalker2 {
  private nodes: Map<string, DependencyNode2> = new Map()
  private edges: Map<string, DependencyEdge2> = new Map()
  private reverseEdges: Map<string, Set<string>> = new Map()
  private forwardEdges: Map<string, Set<string>> = new Map()
  private idCounter = 0

  addNode(name: string, type: NodeType2, path = '', size = 0): string {
    const id = `node_${++this.idCounter}`
    this.nodes.set(id, { id, name, type, path, size, metadata: {} })
    return id
  }

  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) return false
    this.removeAllEdgesFor(id)
    this.nodes.delete(id)
    return true
  }

  getNode(id: string): DependencyNode2 | undefined { return this.nodes.get(id) }

  getByName(name: string): DependencyNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.name === name)
  }

  getByType(type: NodeType2): DependencyNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type)
  }

  addEdge(from: string, to: string, type: DependencyEdge2['type'] = 'imports'): boolean {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return false
    const key = `${from}->${to}:${type}`
    if (this.edges.has(key)) {
      this.edges.get(key)!.count++
      return true
    }
    this.edges.set(key, { from, to, type, count: 1 })
    if (!this.forwardEdges.has(from)) this.forwardEdges.set(from, new Set())
    this.forwardEdges.get(from)!.add(to)
    if (!this.reverseEdges.has(to)) this.reverseEdges.set(to, new Set())
    this.reverseEdges.get(to)!.add(from)
    return true
  }

  removeEdge(from: string, to: string, type: DependencyEdge2['type']): boolean {
    const key = `${from}->${to}:${type}`
    const existed = this.edges.delete(key)
    if (existed) {
      this.forwardEdges.get(from)?.delete(to)
      this.reverseEdges.get(to)?.delete(from)
    }
    return existed
  }

  getDependencies(id: string): DependencyNode2[] {
    const deps = this.forwardEdges.get(id)
    if (!deps) return []
    return Array.from(deps).map(d => this.nodes.get(d)).filter(Boolean) as DependencyNode2[]
  }

  getDependents(id: string): DependencyNode2[] {
    const deps = this.reverseEdges.get(id)
    if (!deps) return []
    return Array.from(deps).map(d => this.nodes.get(d)).filter(Boolean) as DependencyNode2[]
  }

  getTransitiveDependencies(id: string, visited = new Set<string>()): DependencyNode2[] {
    if (visited.has(id)) return []
    visited.add(id)
    const result: DependencyNode2[] = []
    const direct = this.forwardEdges.get(id)
    if (direct) {
      direct.forEach(depId => {
        const node = this.nodes.get(depId)
        if (node && !visited.has(depId)) {
          result.push(node)
          result.push(...this.getTransitiveDependencies(depId, visited))
        }
      })
    }
    return result
  }

  getOrphans(): DependencyNode2[] {
    return Array.from(this.nodes.values()).filter(n => {
      const hasIncoming = this.reverseEdges.get(n.id)?.size ?? 0
      const hasOutgoing = this.forwardEdges.get(n.id)?.size ?? 0
      return hasIncoming === 0 && hasOutgoing === 0 && n.type !== 'root'
    })
  }

  getCycles(): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (nodeId: string) => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId)
        if (cycleStart !== -1) cycles.push([...path.slice(cycleStart), nodeId])
        return
      }
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      recursionStack.add(nodeId)
      path.push(nodeId)
      const deps = this.forwardEdges.get(nodeId)
      if (deps) deps.forEach(d => dfs(d))
      path.pop()
      recursionStack.delete(nodeId)
    }

    this.nodes.forEach((_, id) => dfs(id))
    return cycles
  }

  getDepth(id: string): number {
    const deps = this.getTransitiveDependencies(id)
    if (deps.length === 0) return 0
    let maxDepth = 0
    deps.forEach(d => {
      maxDepth = Math.max(maxDepth, this.getDepth(d.id))
    })
    return maxDepth + 1
  }

  getFanIn(id: string): number { return this.reverseEdges.get(id)?.size ?? 0 }
  getFanOut(id: string): number { return this.forwardEdges.get(id)?.size ?? 0 }

  getHotspots(n = 10): DependencyNode2[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => this.getFanIn(b.id) - this.getFanIn(a.id))
      .slice(0, n)
  }

  count(): number { return this.nodes.size }
  getEdgeCount(): number { return this.edges.size }

  toArray(): DependencyNode2[] { return Array.from(this.nodes.values()) }
  toString(): string { return JSON.stringify({ nodes: this.count(), edges: this.getEdgeCount() }) }
  toJSON(): Record<string, unknown> { return { nodes: this.count(), edges: this.getEdgeCount(), orphans: this.getOrphans().length } }
  clone(): DependencyWalker2 {
    const dw = new DependencyWalker2()
    this.nodes.forEach((n, id) => dw.nodes.set(id, { ...n, metadata: { ...n.metadata } }))
    this.edges.forEach((e, key) => dw.edges.set(key, { ...e }))
    this.forwardEdges.forEach((s, k) => dw.forwardEdges.set(k, new Set(s)))
    this.reverseEdges.forEach((s, k) => dw.reverseEdges.set(k, new Set(s)))
    dw.idCounter = this.idCounter
    return dw
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DependencyWalker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.nodes.clear()
    this.edges.clear()
    this.forwardEdges.clear()
    this.reverseEdges.clear()
    this.idCounter = 0
  }

  private removeAllEdgesFor(id: string): void {
    this.forwardEdges.get(id)?.forEach(to => this.reverseEdges.get(to)?.delete(id))
    this.reverseEdges.get(id)?.forEach(from => this.forwardEdges.get(from)?.delete(id))
    this.forwardEdges.delete(id)
    this.reverseEdges.delete(id)
    this.edges.forEach((edge, key) => {
      if (edge.from === id || edge.to === id) this.edges.delete(key)
    })
  }
}
