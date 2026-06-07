export class ChineseRemainderTheorem {
  static solve(congruences: Array<[number, number]>): { remainder: number; modulus: number } | null
  static solve(remainders: number[], moduli: number[]): { remainder: number; modulus: number } | null
  static solve(arg1: Array<[number, number]> | number[], arg2?: number[]): { remainder: number; modulus: number } | null {
    let remainders: number[]
    let moduli: number[]
    if (Array.isArray(arg1) && arg1.length > 0 && Array.isArray((arg1 as unknown[])[0])) {
      const congruences = arg1 as Array<[number, number]>
      remainders = congruences.map(([r]) => r)
      moduli = congruences.map(([, m]) => m)
    } else {
      remainders = arg1 as number[]
      moduli = arg2 ?? []
    }
    if (remainders.length !== moduli.length || remainders.length === 0) return null
    let r = remainders[0]!
    let m = moduli[0]!
    for (let i = 1; i < remainders.length; i++) {
      const result = ChineseRemainderTheorem.combineTwo(r, m, remainders[i]!, moduli[i]!)
      if (result === null) return null
      r = result.remainder
      m = result.modulus
    }
    return { remainder: ((r % m) + m) % m, modulus: m }
  }

  private static combineTwo(r1: number, m1: number, r2: number, m2: number): { remainder: number; modulus: number } | null {
    const ext = ChineseRemainderTheorem.extendedGcd(m1, m2)
    const g = ext.gcd
    if ((r2 - r1) % g !== 0) return null
    const lcm = (m1 / g) * m2
    const diff = (r2 - r1) / g
    const k = ((diff * ext.x) % (m2 / g) + (m2 / g)) % (m2 / g)
    const r = r1 + k * m1
    return { remainder: ((r % lcm) + lcm) % lcm, modulus: Math.abs(lcm) }
  }

  private static extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
    if (b === 0) return { gcd: a, x: 1, y: 0 }
    const result = ChineseRemainderTheorem.extendedGcd(b, a % b)
    return { gcd: result.gcd, x: result.y, y: result.x - Math.floor(a / b) * result.y }
  }

  static modularInverse(a: number, m: number): number | null {
    const ext = ChineseRemainderTheorem.extendedGcd(a % m, m)
    if (ext.gcd !== 1) return null
    return ((ext.x % m) + m) % m
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / ChineseRemainderTheorem.extendedGcd(a, b).gcd
  }
}
