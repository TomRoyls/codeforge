export class DisjointSetUnion {
  private parent: Int32Array
  private rnk: Int32Array
  private sz: Int32Array
  private _componentCount: number
  private readonly _n: number

  constructor(n: number) {
    if (n < 0 || !Number.isFinite(n) || !Number.isInteger(n)) {
      throw new RangeError(`DisjointSetUnion: n must be a non-negative integer, got ${n}`)
    }
    this._n = n
    this.parent = new Int32Array(n)
    this.rnk = new Int32Array(n)
    this.sz = new Int32Array(n)
    this._componentCount = n
    for (let i = 0; i < n; i++) {
      this.parent[i] = i
      this.rnk[i] = 0
      this.sz[i] = 1
    }
  }

  find(x: number): number {
    this.validateIndex(x)
    while (this.parent[x]! !== x) {
      this.parent[x] = this.parent[this.parent[x]!]!
      x = this.parent[x]!
    }
    return x
  }

  union(x: number, y: number): boolean {
    this.validateIndex(x)
    this.validateIndex(y)
    let rootX = this.find(x)
    let rootY = this.find(y)
    if (rootX === rootY) return false
    if (this.rnk[rootX]! < this.rnk[rootY]!) {
      const tmp = rootX
      rootX = rootY
      rootY = tmp
    }
    this.parent[rootY] = rootX
    this.sz[rootX]! += this.sz[rootY]!
    if (this.rnk[rootX]! === this.rnk[rootY]!) {
      this.rnk[rootX]!++
    }
    this._componentCount--
    return true
  }

  connected(x: number, y: number): boolean {
    this.validateIndex(x)
    this.validateIndex(y)
    return this.find(x) === this.find(y)
  }

  setSize(x: number): number {
    this.validateIndex(x)
    const root = this.find(x)
    return this.sz[root]!
  }

  rank(x: number): number {
    this.validateIndex(x)
    const root = this.find(x)
    return this.rnk[root]!
  }

  get componentCount(): number {
    return this._componentCount
  }

  reset(): void {
    for (let i = 0; i < this._n; i++) {
      this.parent[i] = i
      this.rnk[i] = 0
      this.sz[i] = 1
    }
    this._componentCount = this._n
  }

  private validateIndex(x: number): void {
    if (x < 0 || x >= this._n) {
      throw new RangeError(`DisjointSetUnion: index ${x} out of bounds [0, ${this._n})`)
    }
  }

  toString(): string {
    return `DisjointSetUnion(n=${this._n}, components=${this._componentCount})`
  }

  toJSON(): { parent: number[]; size: number[]; components: number } {
    return { parent: Array.from(this.parent), size: Array.from(this.sz), components: this._componentCount }
  }

  clone(): DisjointSetUnion {
    const copy = new DisjointSetUnion(this._n)
    copy.parent = new Int32Array(this.parent)
    copy.rnk = new Int32Array(this.rnk)
    copy.sz = new Int32Array(this.sz)
    copy._componentCount = this._componentCount
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointSetUnion)) return false
    if (this._n !== other._n) return false
    if (this._componentCount !== other._componentCount) return false

    const thisMap = new Map<number, number>()
    let next = 0
    const thisPid = new Int32Array(this._n)
    for (let i = 0; i < this._n; i++) {
      const root = this.find(i)
      if (!thisMap.has(root)) thisMap.set(root, next++)
      thisPid[i] = thisMap.get(root)!
    }

    const otherMap = new Map<number, number>()
    next = 0
    const otherPid = new Int32Array(this._n)
    for (let i = 0; i < this._n; i++) {
      const root = other.find(i)
      if (!otherMap.has(root)) otherMap.set(root, next++)
      otherPid[i] = otherMap.get(root)!
    }

    const forward = new Map<number, number>()
    const backward = new Map<number, number>()
    for (let i = 0; i < this._n; i++) {
      const tp = thisPid[i]!
      const op = otherPid[i]!
      const f = forward.get(tp)
      if (f === undefined) forward.set(tp, op)
      else if (f !== op) return false
      const b = backward.get(op)
      if (b === undefined) backward.set(op, tp)
      else if (b !== tp) return false
    }
    return true
  }
}
