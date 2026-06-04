type Change = {
  changedRoot: number
  previousSize: number
  otherRoot: number
}

export class UnionFindUndo {
  private parent: Int32Array
  private sz: Int32Array
  private changes: Change[]
  private _componentCount: number
  private readonly _n: number

  constructor(n: number) {
    if (n < 0 || !Number.isFinite(n) || !Number.isInteger(n)) {
      throw new RangeError(`UnionFindUndo: n must be a non-negative integer, got ${n}`)
    }
    this._n = n
    this.parent = new Int32Array(n)
    this.sz = new Int32Array(n)
    this.changes = []
    this._componentCount = n
    for (let i = 0; i < n; i++) {
      this.parent[i] = i
      this.sz[i] = 1
    }
  }

  find(x: number): number {
    this.validateIndex(x)
    while (this.parent[x] !== x) {
      x = this.parent[x]!
    }
    return x
  }

  union(a: number, b: number): boolean {
    this.validateIndex(a)
    this.validateIndex(b)
    let rootA = this.find(a)
    let rootB = this.find(b)
    if (rootA === rootB) {
      return false
    }
    if (this.sz[rootA]! < this.sz[rootB]!) {
      const tmp = rootA
      rootA = rootB
      rootB = tmp
    }
    return this.unionInternal(rootA, rootB)
  }

  private unionInternal(rootA: number, rootB: number): boolean {
    this.changes.push({
      changedRoot: rootA,
      previousSize: this.sz[rootA]!,
      otherRoot: rootB
    })
    this.parent[rootB] = rootA
    this.sz[rootA]! += this.sz[rootB]!
    this._componentCount--
    return true
  }

  connected(a: number, b: number): boolean {
    this.validateIndex(a)
    this.validateIndex(b)
    return this.find(a) === this.find(b)
  }

  snapshot(): number {
    return this.changes.length
  }

  rollback(version: number): void {
    if (version < 0 || version > this.changes.length) {
      throw new RangeError(`UnionFindUndo: version ${version} out of bounds [0, ${this.changes.length}]`)
    }
    while (this.changes.length > version) {
      this.undo()
    }
  }

  undo(): void {
    if (this.changes.length === 0) {
      throw new Error('UnionFindUndo: nothing to undo')
    }
    const change = this.changes.pop()
    if (change === undefined) {
      throw new Error('UnionFindUndo: unexpected undefined change')
    }
    this.sz[change.changedRoot] = change.previousSize
    this.parent[change.otherRoot] = change.otherRoot
    this._componentCount++
  }

  getSize(a: number): number {
    this.validateIndex(a)
    const root = this.find(a)
    return this.sz[root]!
  }

  get componentCount(): number {
    return this._componentCount
  }

  get size(): number {
    return this._n
  }

  private validateIndex(x: number): void {
    if (x < 0 || x >= this._n) {
      throw new RangeError(`UnionFindUndo: index ${x} out of bounds [0, ${this._n})`)
    }
  }
}