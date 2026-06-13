import { DependencyGraph2 } from './dependency-graph-2.js'

export class TopologicalSort2<T = string> {
  private graph: DependencyGraph2<T>

  constructor(graph?: DependencyGraph2<T>) {
    this.graph = graph ?? new DependencyGraph2<T>()
  }

  addNode(node: T): this {
    this.graph.addNode(node)
    return this
  }

  addEdge(from: T, to: T): this {
    this.graph.addDependency(from, to)
    return this
  }

  sort(): T[] | null {
    const inDegree = new Map<T, number>()
    const nodes = this.graph.getNodes()

    for (const node of nodes) {
      inDegree.set(node, 0)
    }

    for (const node of nodes) {
      for (const dep of this.graph.getDependencies(node)) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }

    const queue: T[] = []
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node)
    }

    const result: T[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)

      for (const dep of this.graph.getDependencies(node)) {
        const newDegree = (inDegree.get(dep) ?? 0) - 1
        inDegree.set(dep, newDegree)
        if (newDegree === 0) queue.push(dep)
      }
    }

    if (result.length !== nodes.length) {
      return null
    }

    return result
  }

  sortDFS(): T[] | null {
    if (this.graph.hasCycle()) return null

    const visited = new Set<T>()
    const result: T[] = []

    const visit = (node: T) => {
      if (visited.has(node)) return
      visited.add(node)

      for (const dep of this.graph.getDependencies(node)) {
        visit(dep)
      }

      result.push(node)
    }

    for (const node of this.graph.getNodes()) {
      visit(node)
    }

    return result.reverse()
  }

  getLevels(): T[][] | null {
    const sorted = this.sort()
    if (!sorted) return null

    const inDegree = new Map<T, number>()
    for (const node of this.graph.getNodes()) {
      inDegree.set(node, 0)
    }
    for (const node of this.graph.getNodes()) {
      for (const dep of this.graph.getDependencies(node)) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }

    const levels: T[][] = []
    const remaining = new Map(inDegree)
    const processed = new Set<T>()

    while (processed.size < sorted.length) {
      const level: T[] = []
      for (const node of sorted) {
        if (processed.has(node)) continue
        if ((remaining.get(node) ?? 0) === 0) {
          level.push(node)
          processed.add(node)
        }
      }
      if (level.length === 0) return null

      for (const node of level) {
        for (const dep of this.graph.getDependencies(node)) {
          remaining.set(dep, (remaining.get(dep) ?? 0) - 1)
        }
      }
      levels.push(level)
    }

    return levels
  }

  hasCycle(): boolean {
    return this.graph.hasCycle()
  }

  count(): number {
    return this.graph.count()
  }

  getGraph(): DependencyGraph2<T> {
    return this.graph
  }

  toArray(): T[] {
    return this.sort() ?? []
  }
  toString(): string {
    const sorted = this.sort()
    return JSON.stringify({ sorted: sorted ? sorted.length : 'has cycle' })
  }
  toJSON(): Record<string, unknown> {
    const sorted = this.sort()
    return { count: this.count(), hasCycle: sorted === null }
  }
  clone(): TopologicalSort2<T> {
    return new TopologicalSort2(this.graph.clone())
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TopologicalSort2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.graph.clear()
  }
}
