export class HeavyLightDecomposition {
  private readonly adjacencyList: number[][]
  private readonly subtreeSize: number[]
  private readonly parent: number[]
  private readonly depth: number[]
  private readonly heavy: number[]
  private readonly head: number[]
  private readonly position: number[]
  private readonly _nodeCount: number

  public constructor(adjacencyList: number[][], root: number = 0) {
    this.adjacencyList = adjacencyList
    this._nodeCount = adjacencyList.length
    this.subtreeSize = new Array(this._nodeCount).fill(0) as number[]
    this.parent = new Array(this._nodeCount).fill(-1) as number[]
    this.depth = new Array(this._nodeCount).fill(0) as number[]
    this.heavy = new Array(this._nodeCount).fill(-1) as number[]
    this.head = new Array(this._nodeCount).fill(-1) as number[]
    this.position = new Array(this._nodeCount).fill(0) as number[]

    this.dfsFirst(root, -1)
    let currentPos = 0
    this.dfsSecond(root, -1, root, () => {
      return currentPos++
    })
  }

  private dfsFirst(node: number, par: number): void {
    this.subtreeSize[node] = 1
    this.parent[node] = par
    let maxSize = 0

    const neighbors = this.adjacencyList[node] ?? []
    for (const child of neighbors) {
      if (child === par) continue
      this.depth[child] = (this.depth[node] ?? 0) + 1
      this.dfsFirst(child, node)
      this.subtreeSize[node] = (this.subtreeSize[node] ?? 0) + (this.subtreeSize[child] ?? 0)

      if ((this.subtreeSize[child] ?? 0) > maxSize) {
        maxSize = this.subtreeSize[child] ?? 0
        this.heavy[node] = child
      }
    }
  }

  private dfsSecond(
    node: number,
    par: number,
    chainHead: number,
    getPosition: () => number,
  ): void {
    this.head[node] = chainHead
    this.position[node] = getPosition()

    if (this.heavy[node] !== -1) {
      this.dfsSecond(this.heavy[node]!, node, chainHead, getPosition)
    }

    const neighbors = this.adjacencyList[node] ?? []
    for (const child of neighbors) {
      if (child === par || child === this.heavy[node]) continue
      this.dfsSecond(child, node, child, getPosition)
    }
  }

  public lca(u: number, v: number): number {
    while (this.head[u] !== this.head[v]) {
      const headU = this.head[u] ?? -1
      const headV = this.head[v] ?? -1
      const depthHeadU = this.depth[headU] ?? 0
      const depthHeadV = this.depth[headV] ?? 0
      if (depthHeadU < depthHeadV) {
        v = this.parent[headV] ?? -1
      } else {
        u = this.parent[headU] ?? -1
      }
    }

    return (this.depth[u] ?? 0) < (this.depth[v] ?? 0) ? u : v
  }

  public pathDistance(u: number, v: number): number {
    const ancestor = this.lca(u, v)
    return (this.depth[u] ?? 0) + (this.depth[v] ?? 0) - 2 * (this.depth[ancestor] ?? 0)
  }

  public isAncestor(u: number, v: number): boolean {
    if (u === v) return true
    return this.lca(u, v) === u
  }

  public getPath(u: number, v: number): number[] {
    const ancestor = this.lca(u, v)
    const pathU: number[] = []
    const pathV: number[] = []

    let current = u
    while (current !== -1 && current !== ancestor) {
      pathU.push(current)
      current = this.parent[current] ?? -1
    }
    pathU.push(ancestor)
    pathU.reverse()

    current = v
    while (current !== -1 && current !== ancestor) {
      pathV.push(current)
      current = this.parent[current] ?? -1
    }
    pathV.reverse()

    return [...pathU, ...pathV]
  }

  public get nodeCount(): number {
    return this._nodeCount
  }

  toString(): string {
    return `HeavyLightDecomposition(${this._nodeCount})`
  }

  toJSON(): unknown {
    return {
      nodeCount: this._nodeCount,
      parent: this.parent,
      depth: this.depth,
      heavy: this.heavy,
      head: this.head,
      position: this.position,
    }
  }

  clone(): HeavyLightDecomposition {
    return new HeavyLightDecomposition(this.adjacencyList.map(row => [...row]))
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HeavyLightDecomposition)) return false
    if (this._nodeCount !== other._nodeCount) return false
    for (let i = 0; i < this._nodeCount; i++) {
      if (this.parent[i] !== other.parent[i]) return false
      if (this.depth[i] !== other.depth[i]) return false
      if (this.heavy[i] !== other.heavy[i]) return false
      if (this.head[i] !== other.head[i]) return false
      if (this.position[i] !== other.position[i]) return false
    }
    return true
  }
}