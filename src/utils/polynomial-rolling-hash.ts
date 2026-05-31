export class PolynomialRollingHash {
  private static readonly BASE = 91138233n
  private static readonly MOD = 972663749n

  static hash(s: string): bigint {
    let h = 0n
    for (let i = 0; i < s.length; i++) {
      h = (h * PolynomialRollingHash.BASE + BigInt(s.charCodeAt(i))) % PolynomialRollingHash.MOD
    }
    return h
  }

  static hashArray(arr: number[]): bigint {
    let h = 0n
    for (const v of arr) {
      h = (h * PolynomialRollingHash.BASE + BigInt(v)) % PolynomialRollingHash.MOD
    }
    return h
  }

  static areEqual(s1: string, s2: string): boolean {
    if (s1.length !== s2.length) return false
    return PolynomialRollingHash.hash(s1) === PolynomialRollingHash.hash(s2)
  }
}
