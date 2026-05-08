import type {
  DependencyNode,
  ResolutionOrder,
  ResolverConfig,
  ResolverError,
} from './types.js'

const DEFAULT_CONFIG: ResolverConfig = {
  allowCycles: false,
  maxDepth: 100,
  onCycle: 'error',
}

export class DependencyResolver {
  private nodes: Map<string, DependencyNode> = new Map()
  private config: ResolverConfig

  constructor(config?: Partial<ResolverConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  addNode(node: DependencyNode): boolean {
    if (this.nodes.has(node.id)) {
      return false
    }
    this.nodes.set(node.id, {
      id: node.id,
      dependencies: [...node.dependencies],
      metadata: { ...node.metadata },
    })
    return true
  }

  removeNode(id: string): boolean {
    return this.nodes.delete(id)
  }

  getNode(id: string): DependencyNode | undefined {
    const node = this.nodes.get(id)
    if (!node) return undefined
    return { id: node.id, dependencies: [...node.dependencies], metadata: { ...node.metadata } }
  }

  getNodes(): DependencyNode[] {
    return [...this.nodes.values()].map((n) => ({
      id: n.id,
      dependencies: [...n.dependencies],
      metadata: { ...n.metadata },
    }))
  }

  resolve(rootId: string): ResolutionOrder {
    if (!this.nodes.has(rootId)) {
      return { nodes: [], cycles: [] }
    }
    const visited = new Set<string>()
    const stack = new Set<string>()
    const order: string[] = []
    const cycles: string[][] = []

    const dfs = (id: string, path: string[], depth: number): void => {
      if (depth > this.config.maxDepth) return
      if (stack.has(id)) {
        const cycleStart = path.indexOf(id)
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), id])
        }
        return
      }
      if (visited.has(id)) return

      visited.add(id)
      stack.add(id)
      path.push(id)

      const node = this.nodes.get(id)
      if (node) {
        for (const dep of node.dependencies) {
          if (this.nodes.has(dep)) {
            dfs(dep, path, depth + 1)
          }
        }
      }

      path.pop()
      stack.delete(id)
      order.push(id)
    }

    dfs(rootId, [], 0)
    return { nodes: order, cycles }
  }

  resolveAll(): ResolutionOrder {
    const allCycles = this.detectCycles()
    const inDegree = new Map<string, number>()

    for (const id of this.nodes.keys()) {
      inDegree.set(id, 0)
    }

    for (const node of this.nodes.values()) {
      for (const dep of node.dependencies) {
        if (this.nodes.has(dep)) {
          inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
        }
      }
    }

    const queue: string[] = []
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id)
    }

    const order: string[] = []
    let idx = 0
    while (idx < queue.length) {
      const current = queue[idx]!
      order.push(current)
      const node = this.nodes.get(current)
      if (node) {
        for (const dep of node.dependencies) {
          if (this.nodes.has(dep)) {
            const newDeg = (inDegree.get(dep) ?? 1) - 1
            inDegree.set(dep, newDeg)
            if (newDeg === 0) {
              queue.push(dep)
            }
          }
        }
      }
      idx++
    }

    for (const id of this.nodes.keys()) {
      if (!order.includes(id)) {
        order.push(id)
      }
    }

    return { nodes: order, cycles: allCycles }
  }

  detectCycles(): string[][] {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const cycles: string[][] = []

    const dfs = (id: string, path: string[]): void => {
      if (stack.has(id)) {
        const cycleStart = path.indexOf(id)
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), id])
        }
        return
      }
      if (visited.has(id)) return

      visited.add(id)
      stack.add(id)
      path.push(id)

      const node = this.nodes.get(id)
      if (node) {
        for (const dep of node.dependencies) {
          if (this.nodes.has(dep)) {
            dfs(dep, path)
          }
        }
      }

      path.pop()
      stack.delete(id)
    }

    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) {
        dfs(id, [])
      }
    }

    return cycles
  }

  hasCycle(): boolean {
    const visited = new Set<string>()
    const stack = new Set<string>()

    const dfs = (id: string): boolean => {
      if (stack.has(id)) return true
      if (visited.has(id)) return false

      visited.add(id)
      stack.add(id)

      const node = this.nodes.get(id)
      if (node) {
        for (const dep of node.dependencies) {
          if (this.nodes.has(dep) && dfs(dep)) {
            stack.delete(id)
            return true
          }
        }
      }

      stack.delete(id)
      return false
    }

    for (const id of this.nodes.keys()) {
      if (!visited.has(id) && dfs(id)) {
        return true
      }
    }

    return false
  }

  getDependencies(id: string): string[] {
    const node = this.nodes.get(id)
    if (!node) return []
    return [...node.dependencies]
  }

  getDependents(id: string): string[] {
    const dependents: string[] = []
    for (const node of this.nodes.values()) {
      if (node.dependencies.includes(id)) {
        dependents.push(node.id)
      }
    }
    return dependents
  }

  getTransitiveDependencies(id: string): string[] {
    const visited = new Set<string>()
    const stack = [id]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      if (current !== id) visited.add(current)
      const node = this.nodes.get(current)
      if (node) {
        for (const dep of node.dependencies) {
          if (!visited.has(dep)) {
            stack.push(dep)
          }
        }
      }
    }
    return [...visited]
  }

  getTransitiveDependents(id: string): string[] {
    const dependents = new Set<string>()
    const stack = [id]
    while (stack.length > 0) {
      const current = stack.pop()!
      const directDeps = this.getDependents(current)
      for (const dep of directDeps) {
        if (dep !== id && !dependents.has(dep)) {
          dependents.add(dep)
          stack.push(dep)
        }
      }
    }
    return [...dependents]
  }

  getOrphans(): string[] {
    const orphanIds: string[] = []
    for (const id of this.nodes.keys()) {
      const hasDependents = this.getDependents(id).length > 0
      if (!hasDependents) {
        orphanIds.push(id)
      }
    }
    return orphanIds
  }

  getRoots(): string[] {
    const rootIds: string[] = []
    for (const node of this.nodes.values()) {
      if (node.dependencies.length === 0) {
        rootIds.push(node.id)
      }
    }
    return rootIds
  }

  getStatistics(): {
    totalNodes: number
    totalEdges: number
    avgDependencies: number
    maxDepth: number
    cycles: number
  } {
    const totalNodes = this.nodes.size
    let totalEdges = 0
    let maxDeps = 0

    for (const node of this.nodes.values()) {
      const edgeCount = node.dependencies.filter((d) => this.nodes.has(d)).length
      totalEdges += edgeCount
      if (edgeCount > maxDeps) maxDeps = edgeCount
    }

    const avgDependencies = totalNodes > 0 ? totalEdges / totalNodes : 0

    let graphMaxDepth = 0
    const depthCache = new Map<string, number>()

    const computeDepth = (id: string, visiting: Set<string>): number => {
      if (depthCache.has(id)) return depthCache.get(id)!
      if (visiting.has(id)) return 0

      visiting.add(id)
      const node = this.nodes.get(id)
      let depth = 0
      if (node) {
        for (const dep of node.dependencies) {
          if (this.nodes.has(dep)) {
            const d = computeDepth(dep, visiting) + 1
            if (d > depth) depth = d
          }
        }
      }
      visiting.delete(id)
      depthCache.set(id, depth)
      return depth
    }

    for (const id of this.nodes.keys()) {
      const d = computeDepth(id, new Set())
      if (d > graphMaxDepth) graphMaxDepth = d
    }

    const cycles = this.detectCycles().length

    return {
      totalNodes,
      totalEdges,
      avgDependencies,
      maxDepth: graphMaxDepth,
      cycles,
    }
  }

  validate(): ResolverError[] {
    const errors: ResolverError[] = []

    for (const node of this.nodes.values()) {
      for (const dep of node.dependencies) {
        if (!this.nodes.has(dep)) {
          errors.push({
            type: 'missing',
            message: `Missing dependency: '${dep}' referenced by '${node.id}'`,
            path: [node.id, dep],
          })
        }
      }
    }

    const cycles = this.detectCycles()
    for (const cycle of cycles) {
      errors.push({
        type: 'cycle',
        message: `Cycle detected: ${cycle.join(' -> ')}`,
        path: cycle,
      })
    }

    return errors
  }

  clear(): void {
    this.nodes.clear()
  }
}
