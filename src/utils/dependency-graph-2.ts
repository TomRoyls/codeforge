export class DependencyGraph2<T = string> {
  private nodes: Map<T, Set<T>> = new Map()
  private reverseDeps: Map<T, Set<T>> = new Map()

  addNode(node: T): this {
    if (!this.nodes.has(node)) {
      this.nodes.set(node, new Set())
    }
    if (!this.reverseDeps.has(node)) {
      this.reverseDeps.set(node, new Set())
    }
    return this
  }

  addDependency(from: T, to: T): this {
    this.addNode(from)
    this.addNode(to)
    this.nodes.get(from)!.add(to)
    this.reverseDeps.get(to)!.add(from)
    return this
  }

  removeDependency(from: T, to: T): boolean {
    const deps = this.nodes.get(from)
    if (!deps || !deps.has(to)) return false
    deps.delete(to)
    this.reverseDeps.get(to)?.delete(from)
    return true
  }

  removeNode(node: T): boolean {
    if (!this.nodes.has(node)) return false

    const deps = this.nodes.get(node)!
    for (const dep of deps) {
      this.reverseDeps.get(dep)?.delete(node)
    }

    this.nodes.delete(node)

    const dependents = this.reverseDeps.get(node)!
    for (const dep of dependents) {
      this.nodes.get(dep)?.delete(node)
    }
    this.reverseDeps.delete(node)

    return true
  }

  hasNode(node: T): boolean {
    return this.nodes.has(node)
  }

  hasDependency(from: T, to: T): boolean {
    return this.nodes.get(from)?.has(to) ?? false
  }

  getDependencies(node: T): T[] {
    return Array.from(this.nodes.get(node) ?? [])
  }

  getDependents(node: T): T[] {
    return Array.from(this.reverseDeps.get(node) ?? [])
  }

  getNodes(): T[] {
    return Array.from(this.nodes.keys())
  }

  hasCycle(): boolean {
    const visited = new Set<T>()
    const recursion = new Set<T>()

    for (const node of this.nodes.keys()) {
      if (this.detectCycle(node, visited, recursion)) return true
    }
    return false
  }

  private detectCycle(node: T, visited: Set<T>, recursion: Set<T>): boolean {
    if (recursion.has(node)) return true
    if (visited.has(node)) return false

    visited.add(node)
    recursion.add(node)

    const deps = this.nodes.get(node) ?? new Set<T>()
    for (const dep of deps) {
      if (this.detectCycle(dep, visited, recursion)) return true
    }

    recursion.delete(node)
    return false
  }

  getCycle(): T[] | null {
    const visited = new Set<T>()
    const path: T[] = []

    for (const node of this.nodes.keys()) {
      const cycle = this.findCycle(node, visited, path)
      if (cycle) return cycle
    }
    return null
  }

  private findCycle(node: T, visited: Set<T>, path: T[]): T[] | null {
    if (path.includes(node)) {
      return path.slice(path.indexOf(node))
    }
    if (visited.has(node)) return null

    visited.add(node)
    path.push(node)

    const deps = this.nodes.get(node) ?? new Set<T>()
    for (const dep of deps) {
      const cycle = this.findCycle(dep, visited, path)
      if (cycle) return cycle
    }

    path.pop()
    return null
  }

  getOrphans(): T[] {
    const orphans: T[] = []
    for (const [node, deps] of this.nodes) {
      if (deps.size === 0 && (this.reverseDeps.get(node)?.size ?? 0) === 0) {
        orphans.push(node)
      }
    }
    return orphans
  }

  count(): number { return this.nodes.size }

  toArray(): T[] { return this.getNodes() }
  toString(): string { return JSON.stringify({ nodes: this.count() }) }
  toJSON(): Record<string, unknown> { return { nodes: this.count(), nodes_list: this.getNodes() } }
  clone(): DependencyGraph2<T> {
    const dg = new DependencyGraph2<T>()
    this.nodes.forEach((deps, node) => {
      dg.addNode(node)
      deps.forEach(dep => dg.addDependency(node, dep))
    })
    return dg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DependencyGraph2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.nodes.clear(); this.reverseDeps.clear() }
}
