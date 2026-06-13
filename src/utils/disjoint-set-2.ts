export class DisjointSet2 {
  private parent: number[]
  private rank: number[]
  private _count: number

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
    this._count = n
  }

  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x])
    return this.parent[x]
  }

  union(x: number, y: number): boolean {
    const px = this.find(x)
    const py = this.find(y)
    if (px === py) return false
    if (this.rank[px] < this.rank[py]) { this.parent[px] = py }
    else if (this.rank[px] > this.rank[py]) { this.parent[py] = px }
    else { this.parent[py] = px; this.rank[px]++ }
    this._count--
    return true
  }

  connected(x: number, y: number): boolean { return this.find(x) === this.find(y) }

  get componentCount(): number { return this._count }
  get size(): number { return this.parent.length }

  clear(): void {
    for (let i = 0; i < this.parent.length; i++) {
      this.parent[i] = i
      this.rank[i] = 0
    }
    this._count = this.parent.length
  }

  toArray(): number[] { return [...this.parent] }
  toString(): string { return JSON.stringify({ components: this._count, size: this.size }) }
  toJSON(): Record<string, number> { return { components: this._count, size: this.size } }

  clone(): DisjointSet2 {
    const c = new DisjointSet2(this.parent.length)
    c.parent = [...this.parent]
    c.rank = [...this.rank]
    c._count = this._count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointSet2)) return false
    return this._count === other._count
  }
}
