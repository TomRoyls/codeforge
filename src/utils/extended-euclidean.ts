export class ExtendedEuclidean {
  static solve(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint } {
    if (a === 0n) return { gcd: b, x: 0n, y: 1n }
    const result = ExtendedEuclidean.solve(b % a, a)
    return {
      gcd: result.gcd,
      x: result.y - (b / a) * result.x,
      y: result.x,
    }
  }

  static solveNumber(a: number, b: number): { gcd: number; x: number; y: number } {
    const result = ExtendedEuclidean.solve(BigInt(a), BigInt(b))
    return {
      gcd: Number(result.gcd),
      x: Number(result.x),
      y: Number(result.y),
    }
  }

  static modularInverse(a: bigint, m: bigint): bigint | null {
    const result = ExtendedEuclidean.solve(((a % m) + m) % m, m)
    if (result.gcd !== 1n) return null
    return ((result.x % m) + m) % m
  }

  static modularInverseNumber(a: number, m: number): number | null {
    const result = ExtendedEuclidean.modularInverse(BigInt(a), BigInt(m))
    return result !== null ? Number(result) : null
  }

  static lcm(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n
    const gcd = ExtendedEuclidean.solve(a, b).gcd
    const absGcd = gcd < 0n ? -gcd : gcd
    const absA = a < 0n ? -a : a
    const absB = b < 0n ? -b : b
    return (absA / absGcd) * absB
  }
}
