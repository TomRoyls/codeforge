import type { WeightedUnionOptions, ComponentInfo } from './types.js'

export class WeightedUnion {
  private parent: number[]
  private weights: number[]
  private _componentCount: number

  constructor(n: number, options?: WeightedUnionOptions) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new RangeError('Size must be a non-negative integer')
    }
    const w = options?.initialWeight ?? 1
    this.parent = new Array<number>(n)
    this.weights = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      this.parent[i] = i
      this.weights[i] = w
    }
    this._componentCount = n
  }

  find(x: number): number {
    this.validateIndex(x)
    let root = x
    while (this.parent[root]! !== root) {
      root = this.parent[root]!
    }
    while (this.parent[x]! !== x) {
      const next = this.parent[x]!
      this.parent[x] = root
      x = next
    }
    return root
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x)
    const rootY = this.find(y)
    if (rootX === rootY) return false
    if (this.weights[rootX]! < this.weights[rootY]!) {
      this.parent[rootX] = rootY
      this.weights[rootY]! += this.weights[rootX]!
    } else {
      this.parent[rootY] = rootX
      this.weights[rootX]! += this.weights[rootY]!
    }
    this._componentCount--
    return true
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
  }

  setSize(x: number): number {
    const root = this.find(x)
    let count = 0
    for (let i = 0; i < this.parent.length; i++) {
      if (this.find(i) === root) count++
    }
    return count
  }

  get componentCount(): number {
    return this._componentCount
  }

  get size(): number {
    return this.parent.length
  }

  weight(x: number): number {
    const root = this.find(x)
    return this.weights[root]!
  }

  setWeight(x: number, w: number): void {
    const root = this.find(x)
    this.weights[root] = w
  }

  toArray(): number[] {
    return [...this.parent]
  }

  clone(): WeightedUnion {
    const copy = new WeightedUnion(0)
    copy.parent = [...this.parent]
    copy.weights = [...this.weights]
    copy._componentCount = this._componentCount
    return copy
  }

  forEach(callback: (element: number, root: number) => void): void {
    for (let i = 0; i < this.parent.length; i++) {
      callback(i, this.find(i))
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this.parent.length; i++) {
      yield this.find(i)
    }
  }

  static fromElements(weights: number[]): WeightedUnion {
    const uf = new WeightedUnion(0)
    const n = weights.length
    uf.parent = new Array<number>(n)
    uf.weights = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      uf.parent[i] = i
      uf.weights[i] = weights[i]!
    }
    uf._componentCount = n
    return uf
  }

  addComponent(weight: number = 1): number {
    const idx = this.parent.length
    this.parent.push(idx)
    this.weights.push(weight)
    this._componentCount++
    return idx
  }

  removeComponent(x: number): void {
    this.validateIndex(x)
    for (let i = 0; i < this.parent.length; i++) {
      this.find(i)
    }
    const root = this.parent[x]!
    if (root === x) {
      const members: number[] = []
      for (let i = 0; i < this.parent.length; i++) {
        if (this.parent[i] === root && i !== x) {
          members.push(i)
        }
      }
      if (members.length === 0) return
      const newRoot = members[0]!
      this.weights[newRoot] = this.weights[root]!
      for (const m of members) {
        this.parent[m] = newRoot
      }
    }
    this.parent[x] = x
    this.weights[x] = 1
    this._componentCount++
  }

  components(): number[][] {
    const map = new Map<number, number[]>()
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i)
      let list = map.get(root)
      if (!list) {
        list = []
        map.set(root, list)
      }
      list.push(i)
    }
    return [...map.values()]
  }

  getComponentInfo(x: number): ComponentInfo {
    const root = this.find(x)
    return {
      root,
      size: this.setSize(x),
      weight: this.weights[root]!,
    }
  }

  reset(): void {
    for (let i = 0; i < this.parent.length; i++) {
      this.parent[i] = i
      this.weights[i] = 1
    }
    this._componentCount = this.parent.length
  }

  private validateIndex(x: number): void {
    if (x < 0 || x >= this.parent.length || !Number.isInteger(x)) {
      throw new RangeError(`Index ${x} out of bounds [0, ${this.parent.length})`)
    }
  }

  private membersOf(root: number): number[] {
    const members: number[] = []
    for (let i = 0; i < this.parent.length; i++) {
      if (this.find(i) === root) members.push(i)
    }
    return members
  }
}

export type { WeightedUnionOptions, ComponentInfo } from './types.js'
