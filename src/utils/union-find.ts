export interface UnionFindOptions {
  initialCapacity?: number
}

export interface UnionFindStatistics {
  readonly elementCount: number
  readonly setCount: number
  readonly findOperations: number
  readonly unionOperations: number
  readonly maxDepth: number
}

interface NodeInfo {
  parent: number
  rank: number
  size: number
}

export class UnionFind {
  private nodes: NodeInfo[] = []
  private _setCount = 0
  private _findOps = 0
  private _unionOps = 0

  constructor(options?: UnionFindOptions) {
    if (options?.initialCapacity) {
      for (let i = 0; i < options.initialCapacity; i++) {
        this.makeSet()
      }
    }
  }

  makeSet(): number {
    const id = this.nodes.length
    this.nodes.push({ parent: id, rank: 0, size: 1 })
    this._setCount++
    return id
  }

  find(x: number): number {
    this._findOps++
    this.validateIndex(x)
    let root = x
    while (this.nodes[root]!.parent !== root) {
      root = this.nodes[root]!.parent
    }
    while (this.nodes[x]!.parent !== root) {
      const next = this.nodes[x]!.parent
      this.nodes[x]!.parent = root
      x = next
    }
    return root
  }

  union(x: number, y: number): boolean {
    this._unionOps++
    this.validateIndex(x)
    this.validateIndex(y)
    const rootX = this.find(x)
    const rootY = this.find(y)
    if (rootX === rootY) return false
    const nodeX = this.nodes[rootX]!
    const nodeY = this.nodes[rootY]!
    if (nodeX.rank < nodeY.rank) {
      nodeX.parent = rootY
      nodeY.size += nodeX.size
    } else if (nodeX.rank > nodeY.rank) {
      nodeY.parent = rootX
      nodeX.size += nodeY.size
    } else {
      nodeY.parent = rootX
      nodeX.rank++
      nodeX.size += nodeY.size
    }
    this._setCount--
    return true
  }

  connected(x: number, y: number): boolean {
    this.validateIndex(x)
    this.validateIndex(y)
    return this.find(x) === this.find(y)
  }

  getComponentSize(x: number): number {
    this.validateIndex(x)
    const root = this.find(x)
    return this.nodes[root]!.size
  }

  getComponentMembers(x: number): number[] {
    const root = this.find(x)
    const members: number[] = []
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.find(i) === root) {
        members.push(i)
      }
    }
    return members
  }

  getSize(x: number): number {
    return this.getComponentSize(x)
  }

  get elementCount(): number {
    return this.nodes.length
  }

  get setCount(): number {
    return this._setCount
  }

  get isEmpty(): boolean {
    return this.nodes.length === 0
  }

  clear(): void {
    this.nodes = []
    this._setCount = 0
    this._findOps = 0
    this._unionOps = 0
  }

  reset(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i] = { parent: i, rank: 0, size: 1 }
    }
    this._setCount = this.nodes.length
    this._findOps = 0
    this._unionOps = 0
  }

  toArray(): number[][] {
    const rootMap = new Map<number, number[]>()
    for (let i = 0; i < this.nodes.length; i++) {
      const root = this.find(i)
      let group = rootMap.get(root)
      if (group === undefined) {
        group = []
        rootMap.set(root, group)
      }
      group.push(i)
    }
    return [...rootMap.values()]
  }

  getRoots(): number[] {
    const roots = new Set<number>()
    for (let i = 0; i < this.nodes.length; i++) {
      roots.add(this.find(i))
    }
    return Array.from(roots)
  }

  getStatistics(): UnionFindStatistics {
    let maxDepth = 0
    for (let i = 0; i < this.nodes.length; i++) {
      let depth = 0
      let x = i
      while (this.nodes[x]!.parent !== x) {
        x = this.nodes[x]!.parent
        depth++
      }
      if (depth > maxDepth) maxDepth = depth
    }
    return {
      elementCount: this.nodes.length,
      setCount: this._setCount,
      findOperations: this._findOps,
      unionOperations: this._unionOps,
      maxDepth,
    }
  }

  clone(): UnionFind {
    const copy = new UnionFind()
    copy.nodes = this.nodes.map((n) => ({ ...n }))
    copy._setCount = this._setCount
    copy._findOps = this._findOps
    copy._unionOps = this._unionOps
    return copy
  }

  private validateIndex(x: number): void {
    if (x < 0 || x >= this.nodes.length) {
      throw new RangeError(`UnionFind: index ${x} out of bounds [0, ${this.nodes.length})`)
    }
  }
}
