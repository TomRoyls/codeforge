export class SparseSet {
  private dense: number[]
  private sparse: number[]
  private n: number

  constructor(universe: number) {
    this.dense = []
    this.sparse = new Array(universe).fill(-1)
    this.n = 0
  }

  has(x: number): boolean {
    if (x < 0 || x >= this.sparse.length) return false
    const idx = this.sparse[x]!
    return idx >= 0 && idx < this.n && this.dense[idx] === x
  }

  add(x: number): boolean {
    if (this.has(x)) return false
    this.sparse[x] = this.n
    this.dense[this.n] = x
    this.n++
    return true
  }

  remove(x: number): boolean {
    if (!this.has(x)) return false
    const idx = this.sparse[x]!
    const last = this.dense[this.n - 1]!
    this.dense[idx] = last
    this.sparse[last] = idx
    this.n--
    return true
  }

  clear(): void {
    this.n = 0
  }

  get size(): number {
    return this.n
  }

  values(): number[] {
    return this.dense.slice(0, this.n)
  }

  [Symbol.iterator](): Iterator<number> {
    let i = 0
    const self = this
    return {
      next(): IteratorResult<number> {
        if (i < self.n) return { value: self.dense[i++]!, done: false }
        return { value: undefined, done: true } as IteratorResult<number>
      },
    }
  }
}
