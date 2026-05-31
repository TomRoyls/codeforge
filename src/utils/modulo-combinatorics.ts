export class ModuloCombinatorics {
  readonly mod: number
  private fact: number[]
  private invFact: number[]

  constructor(maxN: number, mod: number = 1_000_000_007) {
    this.mod = mod
    this.fact = new Array(maxN + 1)
    this.invFact = new Array(maxN + 1)
    this.fact[0] = 1
    for (let i = 1; i <= maxN; i++) {
      this.fact[i] = Number(BigInt(this.fact[i - 1]!) * BigInt(i) % BigInt(mod))
    }
    this.invFact[maxN] = this.modPow(this.fact[maxN]!, mod - 2, mod)
    for (let i = maxN - 1; i >= 0; i--) {
      this.invFact[i] = Number(BigInt(this.invFact[i + 1]!) * BigInt(i + 1) % BigInt(mod))
    }
  }

  private modPow(base: number, exp: number, mod: number): number {
    let result = 1n
    let b = BigInt(base % mod)
    const m = BigInt(mod)
    while (exp > 0) {
      if (exp & 1) result = (result * b) % m
      b = (b * b) % m
      exp >>= 1
    }
    return Number(result)
  }

  factorial(n: number): number {
    return this.fact[n]!
  }

  nCr(n: number, r: number): number {
    if (r < 0 || r > n) return 0
    return Number(BigInt(this.fact[n]!) * BigInt(this.invFact[r]!) % BigInt(this.mod) * BigInt(this.invFact[n - r]!) % BigInt(this.mod))
  }

  nPr(n: number, r: number): number {
    if (r < 0 || r > n) return 0
    return Number(BigInt(this.fact[n]!) * BigInt(this.invFact[n - r]!) % BigInt(this.mod))
  }

  nHr(n: number, r: number): number {
    return this.nCr(n + r - 1, r)
  }
}
