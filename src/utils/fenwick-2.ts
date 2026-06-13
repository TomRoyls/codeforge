export class Fenwick2 {
  private tree: number[]
  readonly n: number

  constructor(n: number) {
    this.n = n
    this.tree = new Array(n + 1).fill(0)
  }

  static fromArray(arr: number[]): Fenwick2 {
    const f = new Fenwick2(arr.length)
    for (let i = 0; i < arr.length; i++) f.update(i, arr[i])
    return f
  }

  update(index: number, delta: number): void {
    index++
    while (index <= this.n) {
      this.tree[index] += delta
      index += index & (-index)
    }
  }

  prefixSum(index: number): number {
    index++
    let sum = 0
    while (index > 0) {
      sum += this.tree[index]
      index -= index & (-index)
    }
    return sum
  }

  rangeSum(lo: number, hi: number): number {
    return this.prefixSum(hi) - (lo > 0 ? this.prefixSum(lo - 1) : 0)
  }

  get(index: number): number {
    return this.rangeSum(index, index)
  }

  get isEmpty(): boolean { return this.n === 0 }

  clear(): void { this.tree.fill(0) }

  toArray(): number[] { return this.tree.slice(1) }
  toString(): string { return JSON.stringify({ n: this.n }) }
  toJSON(): Record<string, number> { return { n: this.n } }

  clone(): Fenwick2 {
    const c = new Fenwick2(this.n)
    c.tree = [...this.tree]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Fenwick2)) return false
    return this.n === other.n
  }
}
