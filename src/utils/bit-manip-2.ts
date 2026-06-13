export class BitManip2 {
  static popcount(n: number): number {
    let count = 0
    while (n) { count += n & 1; n = Math.floor(n / 2) }
    return count
  }

  static trailingZeros(n: number): number {
    if (n === 0) return 32
    let count = 0
    while ((n & 1) === 0) { count++; n = Math.floor(n / 2) }
    return count
  }

  static leadingZeros(n: number): number {
    if (n === 0) return 32
    let count = 0
    let bit = 1 << 31
    while (bit !== 0 && (n & bit) === 0) { count++; bit = bit >>> 1 }
    return count
  }

  static reverseBits(n: number): number {
    let result = 0
    for (let i = 0; i < 32; i++) {
      result = (result << 1) | (n & 1)
      n = Math.floor(n / 2)
    }
    return result >>> 0
  }

  static nextPow2(n: number): number {
    if (n <= 1) return 1
    let p = 1
    while (p < n) p *= 2
    return p
  }

  static isPow2(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
  }

  static grayCode(n: number): number { return n ^ Math.floor(n / 2) }
  static swapBits(n: number, i: number, j: number): number {
    const bi = (n >> i) & 1
    const bj = (n >> j) & 1
    if (bi !== bj) n ^= (1 << i) | (1 << j)
    return n >>> 0
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): BitManip2 { return new BitManip2() }
  equals(other: unknown): boolean { return other instanceof BitManip2 }
}
