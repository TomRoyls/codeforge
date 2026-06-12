export class TopologicalOrder<T> {
  private graph = new Map<T, Set<T>>()
  private allNodes = new Set<T>()

  addNode(node: T): void {
    this.allNodes.add(node)
    if (!this.graph.has(node)) {
      this.graph.set(node, new Set())
    }
  }

  addEdge(from: T, to: T): void {
    this.addNode(from)
    this.addNode(to)
    this.graph.get(from)!.add(to)
  }

  sort(): T[] {
    const inDegree = new Map<T, number>()
    for (const node of this.allNodes) {
      inDegree.set(node, 0)
    }
    for (const [, deps] of this.graph) {
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
      for (const dep of this.graph.get(node) ?? []) {
        const newDeg = (inDegree.get(dep) ?? 1) - 1
        inDegree.set(dep, newDeg)
        if (newDeg === 0) queue.push(dep)
      }
    }

    if (result.length !== this.allNodes.size) {
      throw new Error('cycle detected')
    }
    return result
  }

  hasCycle(): boolean {
    try {
      this.sort()
      return false
    } catch {
      return true
    }
  }

  get nodeCount(): number {
    return this.allNodes.size
  }

  get edgeCount(): number {
    let count = 0
    for (const deps of this.graph.values()) count += deps.size
    return count
  }

  nodes(): T[] {
    return Array.from(this.allNodes)
  }

  edges(): Array<[T, T]> {
    const result: Array<[T, T]> = []
    for (const [from, deps] of this.graph) {
      for (const to of deps) {
        result.push([from, to])
      }
    }
    return result
  }

  clear(): void {
    this.graph.clear()
    this.allNodes.clear()
  }

  toString(): string {
    return JSON.stringify(this.edges())
  }

  toJSON(): Array<[T, T]> {
    return this.edges()
  }

  clone(): TopologicalOrder<T> {
    const copy = new TopologicalOrder<T>()
    for (const node of this.allNodes) copy.addNode(node)
    for (const [from, deps] of this.graph) {
      for (const to of deps) copy.addEdge(from, to)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TopologicalOrder)) return false
    if (this.nodeCount !== other.nodeCount) return false
    if (this.edgeCount !== other.edgeCount) return false
    return true
  }
}
