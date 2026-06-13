export class SegmentTree2 {
  private tree: number[]
  private n: number
  private combine: (a: number, b: number) => number

  constructor(data: number[], combine?: (a: number, b: number) => number) {
    this.n = data.length
    this.combine = combine ?? ((a, b) => Math.max(a, b))
    this.tree = new Array(2 * this.n).fill(0)
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = data[i]
    for (let i = this.n - 1; i > 0; i--) this.tree[i] = this.combine(this.tree[2 * i], this.tree[2 * i + 1])
  }

  update(index: number, value: number): void {
    index += this.n
    this.tree[index] = value
    for (let i = Math.floor(index / 2); i >= 1; i = Math.floor(i / 2)) {
      this.tree[i] = this.combine(this.tree[2 * i], this.tree[2 * i + 1])
    }
  }

  query(lo: number, hi: number): number {
    let l = lo + this.n
    let r = hi + this.n
    let result: number | undefined
    while (l <= r) {
      if (l % 2 === 1) {
        result = result === undefined ? this.tree[l] : this.combine(result, this.tree[l])
        l++
      }
      if (r % 2 === 0) {
        result = result === undefined ? this.tree[r] : this.combine(this.tree[r], result)
        r--
      }
      l = Math.floor(l / 2)
      r = Math.floor(r / 2)
    }
    return result ?? 0
  }

  get size(): number { return this.n }
  get isEmpty(): boolean { return this.n === 0 }

  toArray(): number[] { return this.tree.slice(this.n) }
  toString(): string { return JSON.stringify({ n: this.n }) }
  toJSON(): Record<string, number> { return { n: this.n } }

  clone(): SegmentTree2 {
    const data = this.toArray()
    return new SegmentTree2(data, this.combine)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SegmentTree2)) return false
    return this.n === other.n
  }
}
