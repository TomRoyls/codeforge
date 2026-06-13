export class BinaryIndexedTree {
  private tree: number[]
  private n: number

  constructor(size: number) {
    this.n = size
    this.tree = new Array(size + 1).fill(0)
  }

  update(index: number, delta: number): void {
    index++
    while (index <= this.n) {
      this.tree[index]! += delta
      index += index & (-index)
    }
  }

  query(index: number): number {
    index++
    let sum = 0
    while (index > 0) {
      sum += this.tree[index]!
      index -= index & (-index)
    }
    return sum
  }

  rangeQuery(from: number, to: number): number {
    if (from === 0) return this.query(to)
    return this.query(to) - this.query(from - 1)
  }

  get size(): number {
    return this.n
  }

  clear(): void {
    this.tree.fill(0)
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.n; i++) result.push(this.rangeQuery(i, i))
    return result
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): number[] {
    return this.toArray()
  }

  clone(): BinaryIndexedTree {
    const copy = new BinaryIndexedTree(this.n)
    copy.tree = [...this.tree]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinaryIndexedTree)) return false
    return this.n === other.n
  }
}
