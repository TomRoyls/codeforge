export class PowerOf2 {
  static next(n: number): number {
    if (n <= 1) return 1
    let p = 1
    while (p < n) p <<= 1
    return p
  }

  static prev(n: number): number {
    if (n < 1) return 0
    return 1 << (31 - Math.clz32(n))
  }

  static isPowerOf2(n: number): boolean { return n > 0 && (n & (n - 1)) === 0 }

  static log2(n: number): number {
    if (n <= 0) return 0
    return 31 - Math.clz32(n)
  }

  static msb(n: number): number { return n <= 0 ? 0 : 1 << this.log2(n) }
  static lsb(n: number): number { return n === 0 ? 0 : n & (-n) }

  static popcount(n: number): number {
    let count = 0
    while (n) { count++; n &= n - 1 }
    return count
  }

  static countLeadingZeros(n: number): number { return n === 0 ? 32 : Math.clz32(n) }
  static countTrailingZeros(n: number): number { return n === 0 ? 32 : this.log2(n & (-n)) }

  get name(): string { return 'PowerOf2' }
  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): PowerOf2 { return new PowerOf2() }
  equals(other: unknown): boolean { return other instanceof PowerOf2 }
  toArray(): string[] { return ['power-of-2'] }
}
