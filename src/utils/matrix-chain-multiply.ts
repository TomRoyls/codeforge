export class MatrixChainMultiply {
  static minCost(dims: number[]): { cost: number; splits: number[][] } {
    const n = dims.length - 1
    if (n <= 0) return { cost: 0, splits: [] }
    if (n === 1) return { cost: 0, splits: [[0]] }
    const dp: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    const split: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1
        dp[i]![j] = Infinity
        for (let k = i; k < j; k++) {
          const cost = dp[i]![k]! + dp[k + 1]![j]! + dims[i]! * dims[k + 1]! * dims[j + 1]!
          if (cost < dp[i]![j]!) {
            dp[i]![j] = cost
            split[i]![j] = k
          }
        }
      }
    }
    return { cost: dp[0]![n - 1]!, splits: split }
  }

  static optimalOrder(dims: number[]): string {
    const n = dims.length - 1
    if (n <= 0) return ''
    if (n === 1) return 'A0'
    const { splits } = MatrixChainMultiply.minCost(dims)
    function buildExpr(i: number, j: number): string {
      if (i === j) return `A${i}`
      const k = splits[i]![j]!
      return `(${buildExpr(i, k)} × ${buildExpr(k + 1, j)})`
    }
    return buildExpr(0, n - 1)
  }

  static matrixMultiply(a: number[][], b: number[][]): number[][] {
    const m = a.length
    const p = b[0]!.length
    const n = b.length
    const result: number[][] = Array.from({ length: m }, () => new Array<number>(p).fill(0))
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0
        for (let k = 0; k < n; k++) {
          sum += a[i]![k]! * b[k]![j]!
        }
        result[i]![j] = sum
      }
    }
    return result
  }
}
