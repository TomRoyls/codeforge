export class CRT {
  static solve(remainders: number[], moduli: number[]): { remainder: number; modulus: number } | null {
    if (remainders.length !== moduli.length || remainders.length === 0) return null
    let r = remainders[0]!
    let m = moduli[0]!
    for (let i = 1; i < remainders.length; i++) {
      const result = CRT.mergeTwo(r, m, remainders[i]!, moduli[i]!)
      if (result === null) return null
      r = result.remainder
      m = result.modulus
    }
    r = ((r % m) + m) % m
    return { remainder: r, modulus: m }
  }

  private static mergeTwo(
    r1: number,
    m1: number,
    r2: number,
    m2: number,
  ): { remainder: number; modulus: number } | null {
    const g = CRT.gcd(m1, m2)
    if ((r2 - r1) % g !== 0) return null
    const lcm = (m1 / g) * m2
    const inv = CRT.modInverse(m1 / g, m2 / g)
    if (inv === null) return null
    const diff = (r2 - r1) / g
    const x = (r1 + m1 * ((diff * inv) % (m2 / g))) % lcm
    return { remainder: ((x % lcm) + lcm) % lcm, modulus: lcm }
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }

  static modInverse(a: number, m: number): number | null {
    const result = CRT.extendedGcd(a, m)
    if (result.gcd !== 1) return null
    return ((result.x % m) + m) % m
  }

  private static extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
    if (a === 0) return { gcd: b, x: 0, y: 1 }
    const result = CRT.extendedGcd(b % a, a)
    return {
      gcd: result.gcd,
      x: result.y - Math.floor(b / a) * result.x,
      y: result.x,
    }
  }

  static lcm(a: number, b: number): number {
    return (a / CRT.gcd(a, b)) * b
  }
}
