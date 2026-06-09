export class BipartiteMatcher<L, R> {
  private leftNodes: Set<L> = new Set()
  private rightNodes: Set<R> = new Set()
  private adj: Map<L, Set<R>> = new Map()
  private reverseAdj: Map<R, Set<L>> = new Map()
  private cachedMatching: Map<L, R> | null = null

  private invalidateCache(): void {
    this.cachedMatching = null
  }

  addLeftNode(node: L): void {
    this.invalidateCache()
    this.leftNodes.add(node)
    if (!this.adj.has(node)) {
      this.adj.set(node, new Set())
    }
  }

  addRightNode(node: R): void {
    this.invalidateCache()
    this.rightNodes.add(node)
    if (!this.reverseAdj.has(node)) {
      this.reverseAdj.set(node, new Set())
    }
  }

  addEdge(left: L, right: R): void {
    this.invalidateCache()
    if (!this.leftNodes.has(left)) {
      this.addLeftNode(left)
    }
    if (!this.rightNodes.has(right)) {
      this.addRightNode(right)
    }
    this.adj.get(left)!.add(right)
    this.reverseAdj.get(right)!.add(left)
  }

  removeEdge(left: L, right: R): boolean {
    const neighbors = this.adj.get(left)
    if (!neighbors || !neighbors.has(right)) {
      return false
    }
    this.invalidateCache()
    neighbors.delete(right)
    const rev = this.reverseAdj.get(right)
    if (rev) {
      rev.delete(left)
    }
    return true
  }

  hasEdge(left: L, right: R): boolean {
    const neighbors = this.adj.get(left)
    return neighbors !== undefined && neighbors.has(right)
  }

  maxMatching(): Map<L, R> {
    if (this.cachedMatching !== null) {
      return new Map(this.cachedMatching)
    }
    const NIL = Symbol('nil')
    const pairU = new Map<L, R | symbol>()
    const pairV = new Map<R, L | symbol>()
    const dist = new Map<L, number>()

    for (const u of this.leftNodes) {
      pairU.set(u, NIL)
    }
    for (const v of this.rightNodes) {
      pairV.set(v, NIL)
    }

    const bfs = (): boolean => {
      const queue: L[] = []
      for (const u of this.leftNodes) {
        if (pairU.get(u) === NIL) {
          dist.set(u, 0)
          queue.push(u)
        } else {
          dist.set(u, Infinity)
        }
      }
      let found = false
      let head = 0
      while (head < queue.length) {
        const u = queue[head]!
        head++
        const neighbors = this.adj.get(u)
        if (!neighbors) continue
        for (const v of neighbors) {
          const uMatch = pairV.get(v)
          if (uMatch === NIL) {
            found = true
          } else if (uMatch !== undefined && (dist.get(uMatch as L) ?? Infinity) === Infinity) {
            dist.set(uMatch as L, dist.get(u)! + 1)
            queue.push(uMatch as L)
          }
        }
      }
      return found
    }

    const dfs = (u: L): boolean => {
      const neighbors = this.adj.get(u)
      if (!neighbors) return false
      for (const v of neighbors) {
        const uMatch = pairV.get(v)
        if (uMatch === NIL) {
          pairU.set(u, v)
          pairV.set(v, u)
          return true
        }
        if (uMatch !== undefined && (dist.get(uMatch as L) ?? Infinity) === dist.get(u)! + 1) {
          if (dfs(uMatch as L)) {
            pairU.set(u, v)
            pairV.set(v, u)
            return true
          }
        }
      }
      dist.set(u, Infinity)
      return false
    }

    while (bfs()) {
      for (const u of this.leftNodes) {
        if (pairU.get(u) === NIL) {
          dfs(u)
        }
      }
    }

    const result = new Map<L, R>()
    for (const u of this.leftNodes) {
      const match = pairU.get(u)
      if (match !== undefined && match !== NIL) {
        result.set(u, match as R)
      }
    }

    this.cachedMatching = new Map(result)
    return result
  }

  maxMatchingSize(): number {
    return this.maxMatching().size
  }

  isPerfectMatching(): boolean {
    if (this.leftNodes.size === 0 && this.rightNodes.size === 0) {
      return true
    }
    const matching = this.maxMatching()
    const minPartition = Math.min(this.leftNodes.size, this.rightNodes.size)
    return matching.size === minPartition
  }

  getUnmatchedLeft(): L[] {
    const matching = this.maxMatching()
    const result: L[] = []
    for (const u of this.leftNodes) {
      if (!matching.has(u)) {
        result.push(u)
      }
    }
    return result
  }

  getUnmatchedRight(): R[] {
    const matching = this.maxMatching()
    const matchedRight = new Set(matching.values())
    const result: R[] = []
    for (const v of this.rightNodes) {
      if (!matchedRight.has(v)) {
        result.push(v)
      }
    }
    return result
  }

  getNeighbors(node: L | R): Array<L | R> {
    if (this.leftNodes.has(node as L)) {
      const neighbors = this.adj.get(node as L)
      if (!neighbors) return []
      return [...neighbors]
    }
    if (this.rightNodes.has(node as R)) {
      const neighbors = this.reverseAdj.get(node as R)
      if (!neighbors) return []
      return [...neighbors]
    }
    return []
  }

  getEdges(): Array<[L, R]> {
    const result: Array<[L, R]> = []
    for (const [u, neighbors] of this.adj) {
      for (const v of neighbors) {
        result.push([u, v])
      }
    }
    return result
  }

  get leftSize(): number {
    return this.leftNodes.size
  }

  get rightSize(): number {
    return this.rightNodes.size
  }

  get edgeCount(): number {
    let count = 0
    for (const neighbors of this.adj.values()) {
      count += neighbors.size
    }
    return count
  }

  clear(): void {
    this.invalidateCache()
    this.leftNodes.clear()
    this.rightNodes.clear()
    this.adj.clear()
    this.reverseAdj.clear()
  }

  clone(): BipartiteMatcher<L, R> {
    const cloned = new BipartiteMatcher<L, R>()
    for (const u of this.leftNodes) {
      cloned.leftNodes.add(u)
      const neighbors = this.adj.get(u)
      if (neighbors) {
        cloned.adj.set(u, new Set(neighbors))
      } else {
        cloned.adj.set(u, new Set())
      }
    }
    for (const v of this.rightNodes) {
      cloned.rightNodes.add(v)
      const neighbors = this.reverseAdj.get(v)
      if (neighbors) {
        cloned.reverseAdj.set(v, new Set(neighbors))
      } else {
        cloned.reverseAdj.set(v, new Set())
      }
    }
    if (this.cachedMatching !== null) {
      cloned.cachedMatching = new Map(this.cachedMatching)
    }
    return cloned
  }

  *[Symbol.iterator]() {
    yield* this.getEdges()
  }

  toArray() {
    return this.getEdges()
  }
}
