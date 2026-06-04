export class UndoDisjointSet {
  private readonly parent: Int32Array
  private readonly rank: Uint8Array
  private readonly history: Array<{ type: 'parent'; idx: number; prev: number } | { type: 'rank'; idx: number; prev: number }> = []
  private _components: number

  constructor(n: number) {
    this.parent = new Int32Array(n)
    this.rank = new Uint8Array(n)
    this._components = n
    for (let i = 0; i < n; i++) {
      this.parent[i] = i
    }
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      x = this.parent[x]!
    }
    return x
  }

  union(a: number, b: number): boolean {
    let ra = this.find(a)
    let rb = this.find(b)
    if (ra === rb) return false

    if (this.rank[ra]! < this.rank[rb]!) {
      const tmp = ra
      ra = rb
      rb = tmp
    }

    this.history.push({ type: 'parent', idx: rb, prev: this.parent[rb]! })
    this.parent[rb] = ra

    if (this.rank[ra] === this.rank[rb]) {
      this.history.push({ type: 'rank', idx: ra, prev: this.rank[ra]! })
      this.rank[ra]!++
    }

    this._components--
    return true
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b)
  }

  undo(): boolean {
    if (this.history.length === 0) return false

    let entry = this.history.pop()!
    if (entry.type === 'rank') {
      this.rank[entry.idx] = entry.prev
      entry = this.history.pop()!
    }

    this.parent[entry.idx] = entry.prev
    this._components++
    return true
  }

  snapshot(): number {
    return this.history.length
  }

  rollback(target: number): void {
    while (this.history.length > target) {
      this.undo()
    }
  }

  get components(): number {
    return this._components
  }

  get size(): number {
    return this.parent.length
  }
}
