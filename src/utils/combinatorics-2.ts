export class Combinatorics2 {
  private factorials: number[]
  private mod: number

  constructor(maxN: number, mod = 1000000007) {
    this.mod = mod
    this.factorials = new Array(maxN + 1).fill(0)
    this.factorials[0] = 1
    for (let i = 1; i <= maxN; i++) {
      this.factorials[i] = Number((BigInt(this.factorials[i - 1]) * BigInt(i)) % BigInt(mod))
    }
  }

  factorial(n: number): number { return this.factorials[n] }

  perm(n: number, k: number): number {
    if (k > n) return 0
    let result = 1
    for (let i = 0; i < k; i++) {
      result = Number((BigInt(result) * BigInt(n - i)) % BigInt(this.mod))
    }
    return result
  }

  comb(n: number, k: number): number {
    if (k > n || k < 0) return 0
    if (k === 0 || k === n) return 1
    let result = 1
    for (let i = 0; i < k; i++) {
      result = Number((BigInt(result) * BigInt(n - i)) % BigInt(this.mod))
      result = Number((BigInt(result) * BigInt(this.modInverse(i + 1))) % BigInt(this.mod))
    }
    return result
  }

  private modInverse(a: number): number {
    return this.modPow(a, this.mod - 2)
  }

  private modPow(base: number, exp: number): number {
    base = base % this.mod
    let result = 1
    while (exp > 0) {
      if (exp & 1) result = Number((BigInt(result) * BigInt(base)) % BigInt(this.mod))
      base = Number((BigInt(base) * BigInt(base)) % BigInt(this.mod))
      exp = Math.floor(exp / 2)
    }
    return result
  }

  catalan(n: number): number {
    return Number((BigInt(this.comb(2 * n, n)) * BigInt(this.modInverse(n + 1))) % BigInt(this.mod))
  }

  get maxN(): number { return this.factorials.length - 1 }

  toArray(): number[] { return [...this.factorials] }
  toString(): string { return JSON.stringify({ maxN: this.maxN, mod: this.mod }) }
  toJSON(): Record<string, number> { return { maxN: this.maxN, mod: this.mod } }
  clone(): Combinatorics2 { return new Combinatorics2(this.maxN, this.mod) }
  equals(other: unknown): boolean {
    if (!(other instanceof Combinatorics2)) return false
    return this.maxN === other.maxN
  }
}
