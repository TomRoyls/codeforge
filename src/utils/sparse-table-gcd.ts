export class SparseTableGCD {
  private table: number[][]
  private log: number[]

  constructor(arr: number[]) {
    const n = arr.length
    this.log = new Array(n + 1).fill(0)
    for (let i = 2; i <= n; i++) this.log[i] = this.log[i >> 1]! + 1
    const k = n > 0 ? this.log[n]! + 1 : 0
    this.table = new Array(k)
    this.table[0] = [...arr]
    for (let j = 1; j < k; j++) {
      this.table[j] = new Array(n - (1 << j) + 1)
      for (let i = 0; i + (1 << j) <= n; i++) {
        this.table[j]![i] = SparseTableGCD.gcd(
          this.table[j - 1]![i]!,
          this.table[j - 1]![i + (1 << (j - 1))]!,
        )
      }
    }
  }

  private static gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }

  query(l: number, r: number): number {
    if (l > r || this.table[0]!.length === 0) return 0
    const j = this.log[r - l + 1]!
    return SparseTableGCD.gcd(this.table[j]![l]!, this.table[j]![r - (1 << j) + 1]!)
  }
}
