import type { WeightedUnionFindData } from './types.js'

export class WeightedUnionFind {
  private parent: number[]
  private weight: number[]
  private sizes: number[]
  private rank: number[]
  private n: number
  private count: number

  constructor(n: number) {
    if (n < 0) {
      throw new Error(`Size must be non-negative, got ${n}`)
    }
    this.n = n
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.weight = new Array(n).fill(0)
    this.sizes = new Array(n).fill(1)
    this.rank = new Array(n).fill(0)
    this.count = n
  }

  find(x: number): number {
    this.validateIndex(x)
    if (this.parent[x]! !== x) {
      const root = this.find(this.parent[x]!)
      this.weight[x]! += this.weight[this.parent[x]!]!
      this.parent[x]! = root
    }
    return this.parent[x]!
  }

  union(x: number, y: number, w: number): boolean {
    this.validateIndex(x)
    this.validateIndex(y)
    const rootX = this.find(x)
    const rootY = this.find(y)
    if (rootX === rootY) return false
    const wX = this.weight[x]!
    const wY = this.weight[y]!
    if (this.rank[rootX]! < this.rank[rootY]!) {
      this.parent[rootX]! = rootY
      this.weight[rootX]!! = wY - wX + w
      this.sizes[rootY]! += this.sizes[rootX]!
    } else if (this.rank[rootX]! > this.rank[rootY]!) {
      this.parent[rootY]! = rootX
      this.weight[rootY]!! = wX - wY - w
      this.sizes[rootX]! += this.sizes[rootY]!
    } else {
      this.parent[rootY]! = rootX
      this.weight[rootY]!! = wX - wY - w
      this.rank[rootX]!++
      this.sizes[rootX]! += this.sizes[rootY]!
    }
    this.count--
    return true
  }

  connected(x: number, y: number): boolean {
    this.validateIndex(x)
    this.validateIndex(y)
    return this.find(x) === this.find(y)
  }

  distance(x: number, y: number): number {
    if (!this.connected(x, y)) {
      throw new Error(`Elements ${x} and ${y} are not connected`)
    }
    return this.weight[x]! - this.weight[y]!
  }

  getWeight(x: number): number {
    this.validateIndex(x)
    this.find(x)
    return this.weight[x]!
  }

  getSize(x: number): number {
    this.validateIndex(x)
    const root = this.find(x)
    return this.sizes[root]!
  }

  setWeight(x: number, w: number): void {
    this.validateIndex(x)
    this.weight[x]! = w
  }

  getComponentCount(): number {
    return this.count
  }

  getElements(x: number): number[] {
    this.validateIndex(x)
    const root = this.find(x)
    const elements: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (this.find(i) === root) {
        elements.push(i)
      }
    }
    return elements
  }

  clone(): WeightedUnionFind {
    const copy = new WeightedUnionFind(this.n)
    copy.parent = [...this.parent]
    copy.weight = [...this.weight]
    copy.sizes = [...this.sizes]
    copy.rank = [...this.rank]
    copy.count = this.count
    return copy
  }

  toArray(): WeightedUnionFindData {
    return {
      parent: [...this.parent],
      weight: [...this.weight],
      size: [...this.sizes],
    }
  }

  static fromEdges(n: number, edges: [number, number, number][]): WeightedUnionFind {
    const wuf = new WeightedUnionFind(n)
    for (const [u, v, w] of edges) {
      wuf.union(u, v, w)
    }
    return wuf
  }

  private validateIndex(x: number): void {
    if (x < 0 || x >= this.n) {
      throw new Error(`Index ${x} out of bounds [0, ${this.n})`)
    }
  }
}

export type { WeightedUnionFindData } from './types.js'
