export class BinaryExponentiation {
  static power(base: bigint, exp: bigint, mod: bigint): bigint {
    if (mod === 1n) return 0n
    let result = 1n
    base = ((base % mod) + mod) % mod
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod
      exp >>= 1n
      base = (base * base) % mod
    }
    return result
  }

  static powerNumber(base: number, exp: number, mod: number): number {
    return Number(BinaryExponentiation.power(BigInt(base), BigInt(exp), BigInt(mod)))
  }

  static powerNoMod(base: bigint, exp: bigint): bigint {
    if (exp === 0n) return 1n
    let result = 1n
    let b = base
    let e = exp
    while (e > 0n) {
      if (e & 1n) result *= b
      e >>= 1n
      b *= b
    }
    return result
  }

  static matrixPower(matrix: bigint[][], exp: bigint, mod: bigint): bigint[][] {
    const n = matrix.length
    let result: bigint[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1n : 0n))
    )
    let base = matrix.map(row => row.map(v => ((v % mod) + mod) % mod))
    while (exp > 0n) {
      if (exp & 1n) {
        result = BinaryExponentiation.multiplyMatrices(result, base, mod)
      }
      base = BinaryExponentiation.multiplyMatrices(base, base, mod)
      exp >>= 1n
    }
    return result
  }

  private static multiplyMatrices(a: bigint[][], b: bigint[][], mod: bigint): bigint[][] {
    const n = a.length
    const result: bigint[][] = Array.from({ length: n }, () => new Array<bigint>(n).fill(0n))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          result[i]![j] = (result[i]![j]! + a[i]![k]! * b[k]![j]!) % mod
        }
      }
    }
    return result
  }

  static fibonacci(n: number, mod: bigint = 1000000007n): bigint {
    if (n <= 0) return 0n
    if (n === 1) return 1n
    const mat: bigint[][] = [[1n, 1n], [1n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, BigInt(n - 1), mod)
    return result[0]![0]!
  }
}
