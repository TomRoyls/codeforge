export class MatrixChain {
  solve(dimensions: number[]): { cost: number; splits: number[][] } {
    const n = dimensions.length - 1
    if (n <= 0) return { cost: 0, splits: [] }
    const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    const split: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1
        dp[i]![j] = Infinity
        for (let k = i; k < j; k++) {
          const cost = dp[i]![k]! + dp[k + 1]![j]! + dimensions[i]! * dimensions[k + 1]! * dimensions[j + 1]!
          if (cost < dp[i]![j]!) { dp[i]![j] = cost; split[i]![j] = k }
        }
      }
    }
    return { cost: dp[0]![n - 1]!, splits: split }
  }

  get name(): string { return 'MatrixChain' }
  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): MatrixChain { return new MatrixChain() }
  equals(other: unknown): boolean { return other instanceof MatrixChain }
  toArray(): string[] { return ['matrix-chain'] }
}
