export class DisjointSparseTable<T> {
  private readonly table: T[][]
  private readonly combine: (a: T, b: T) => T
  private readonly n: number

  constructor(data: T[], combine: (a: T, b: T) => T) {
    this.combine = combine
    this.n = data.length
    if (this.n === 0) {
      this.table = []
      return
    }
    const levels = Math.ceil(Math.log2(this.n))
    this.table = Array.from({ length: levels }, () => new Array<T>(this.n))
    for (let level = 0; level < levels; level++) {
      const blockSize = 1 << (level + 1)
      const halfBlock = 1 << level
      for (let blockStart = 0; blockStart < this.n; blockStart += blockSize) {
        const mid = Math.min(blockStart + halfBlock, this.n)
        if (mid < this.n) {
          this.table[level]![mid]! = data[mid]!
          for (let i = mid + 1; i < Math.min(mid + halfBlock, this.n); i++) {
            this.table[level]![i] = this.combine(this.table[level]![i - 1]!, data[i]!)
          }
        }
        const leftEnd = Math.min(mid, this.n) - 1
        if (leftEnd >= blockStart) {
          this.table[level]![leftEnd]! = data[leftEnd]!
          for (let i = leftEnd - 1; i >= blockStart; i--) {
            this.table[level]![i] = this.combine(data[i]!, this.table[level]![i + 1]!)
          }
        }
      }
    }
    this.table.unshift([...data])
  }

  query(l: number, r: number): T {
    if (l === r) return this.table[0]![l]!
    const level = Math.floor(Math.log2(l ^ r))
    return this.combine(this.table[level + 1]![l]!, this.table[level + 1]![r]!)
  }

  toString(): string {
    return `DisjointSparseTable(n=${this.n})`
  }

  toJSON(): T[] {
    return this.table[0] ? [...this.table[0]] : []
  }

  clone(): DisjointSparseTable<T> {
    return new DisjointSparseTable(this.table[0] ?? [], this.combine)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointSparseTable)) return false
    if (this.n !== other.n) return false
    return true
  }
}
