export class PascalTriangle {
  static row(n: number): number[] {
    if (n < 0) return []
    const result: number[] = [1]
    for (let k = 1; k <= n; k++) {
      result.push(Math.round(result[k - 1]! * (n - k + 1) / k))
    }
    return result
  }

  static generate(rows: number): number[][] {
    const result: number[][] = []
    for (let i = 0; i < rows; i++) {
      result.push(PascalTriangle.row(i))
    }
    return result
  }

  static binomial(n: number, k: number): number {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1
    const row = PascalTriangle.row(n)
    return row[k]!
  }

  static element(n: number, k: number): number {
    return PascalTriangle.binomial(n, k)
  }

  static sumOfRow(n: number): number {
    return 1 << n
  }

  static diagonalSum(n: number): number {
    let sum = 0
    for (let k = 0; k <= Math.floor(n / 2); k++) {
      sum += PascalTriangle.binomial(n - k, k)
    }
    return sum
  }
}
