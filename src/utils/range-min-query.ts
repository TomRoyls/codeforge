export class RangeMinQuery {
  private table: number[][]
  private log: number[]

  constructor(arr: number[]) {
    const n = arr.length
    this.log = new Array(n + 1).fill(0)
    for (let i = 2; i <= n; i++) this.log[i] = this.log[i >> 1] + 1

    const k = this.log[n] + 1
    this.table = new Array(k)
    this.table[0] = [...arr]
    for (let j = 1; j < k; j++) {
      this.table[j] = new Array(n)
      for (let i = 0; i + (1 << j) <= n; i++) {
        this.table[j]![i] = Math.min(
          this.table[j - 1]![i]!,
          this.table[j - 1]![i + (1 << (j - 1))]!,
        )
      }
    }
  }

  query(l: number, r: number): number {
    const k = this.log[r - l + 1]!
    return Math.min(this.table[k]![l]!, this.table[k]![r - (1 << k) + 1]!)
  }
}
