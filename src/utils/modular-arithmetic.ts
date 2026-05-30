export class ModularArithmetic {
  static mod(a: number, m: number): number {
    return ((a % m) + m) % m
  }

  static add(a: number, b: number, m: number): number {
    return ModularArithmetic.mod(a + b, m)
  }

  static sub(a: number, b: number, m: number): number {
    return ModularArithmetic.mod(a - b, m)
  }

  static mul(a: number, b: number, m: number): number {
    return ModularArithmetic.mod(
      (Number(BigInt(a) * BigInt(b) % BigInt(m)) + m) % m,
      m,
    )
  }

  static pow(base: number, exp: number, m: number): number {
    base = ModularArithmetic.mod(base, m)
    let result = 1
    while (exp > 0) {
      if (exp % 2 === 1) result = ModularArithmetic.mul(result, base, m)
      base = ModularArithmetic.mul(base, base, m)
      exp = Math.floor(exp / 2)
    }
    return result
  }

  static extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
    if (a === 0) return { gcd: b, x: 0, y: 1 }
    const result = ModularArithmetic.extendedGcd(b % a, a)
    return {
      gcd: result.gcd,
      x: result.y - Math.floor(b / a) * result.x,
      y: result.x,
    }
  }

  static modInverse(a: number, m: number): number | null {
    const { gcd, x } = ModularArithmetic.extendedGcd(ModularArithmetic.mod(a, m), m)
    if (gcd !== 1) return null
    return ModularArithmetic.mod(x, m)
  }

  static modDiv(a: number, b: number, m: number): number | null {
    const inv = ModularArithmetic.modInverse(b, m)
    if (inv === null) return null
    return ModularArithmetic.mul(a, inv, m)
  }

  static factorial(n: number, m: number): number {
    let result = 1
    for (let i = 2; i <= n; i++) {
      result = ModularArithmetic.mul(result, i, m)
    }
    return result
  }

  static nCr(n: number, r: number, m: number): number | null {
    if (r < 0 || r > n) return 0
    if (r === 0 || r === n) return 1
    const num = ModularArithmetic.factorial(n, m)
    const den = ModularArithmetic.mul(
      ModularArithmetic.factorial(r, m),
      ModularArithmetic.factorial(n - r, m),
      m,
    )
    return ModularArithmetic.modDiv(num, den, m)
  }
}
