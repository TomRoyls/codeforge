export class DependencyGraph<T> {
  private nodes = new Map<T, Set<T>>()
  private reverse = new Map<T, Set<T>>()

  addNode(node: T): void {
    if (!this.nodes.has(node)) {
      this.nodes.set(node, new Set())
      this.reverse.set(node, new Set())
    }
  }

  addDependency(from: T, to: T): void {
    this.addNode(from)
    this.addNode(to)
    this.nodes.get(from)!.add(to)
    this.reverse.get(to)!.add(from)
  }

  dependsOn(node: T): Set<T> {
    return new Set(this.nodes.get(node) ?? [])
  }

  dependents(node: T): Set<T> {
    return new Set(this.reverse.get(node) ?? [])
  }

  has(node: T): boolean {
    return this.nodes.has(node)
  }

  get nodeCount(): number {
    return this.nodes.size
  }

  get edgeCount(): number {
    let count = 0
    for (const deps of this.nodes.values()) count += deps.size
    return count
  }

  leafNodes(): T[] {
    const result: T[] = []
    for (const [node, deps] of this.nodes) {
      if (deps.size === 0) result.push(node)
    }
    return result
  }

  rootNodes(): T[] {
    const result: T[] = []
    for (const [node] of this.reverse) {
      if (this.reverse.get(node)!.size === 0) result.push(node)
    }
    return result
  }

  topologicalSort(): T[] {
    const inDegree = new Map<T, number>()
    for (const node of this.nodes.keys()) inDegree.set(node, 0)
    for (const deps of this.nodes.values()) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }
    const queue: T[] = []
    for (const [node, deg] of inDegree) {
      if (deg === 0) queue.push(node)
    }
    const result: T[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)
      for (const dep of this.nodes.get(node) ?? []) {
        const newDeg = (inDegree.get(dep) ?? 1) - 1
        inDegree.set(dep, newDeg)
        if (newDeg === 0) queue.push(dep)
      }
    }
    return result
  }

  clear(): void {
    this.nodes.clear()
    this.reverse.clear()
  }

  toArray(): Array<[T, T[]]> {
    return Array.from(this.nodes.entries()).map(([n, deps]) => [n, Array.from(deps)])
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[T, T[]]> {
    return this.toArray()
  }

  clone(): DependencyGraph<T> {
    const copy = new DependencyGraph<T>()
    for (const [node, deps] of this.nodes) {
      copy.addNode(node)
      for (const dep of deps) copy.addDependency(node, dep)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DependencyGraph)) return false
    if (this.nodeCount !== other.nodeCount) return false
    if (this.edgeCount !== other.edgeCount) return false
    return true
  }
}
