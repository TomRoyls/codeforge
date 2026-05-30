export class ModInt {
  constructor(
    private val: number,
    private readonly mod: number,
  ) {
    this.val = ((val % mod) + mod) % mod
  }

  static from(val: number, mod: number): ModInt {
    return new ModInt(val, mod)
  }

  add(other: ModInt | number): ModInt {
    const o = typeof other === 'number' ? other : other.val
    return new ModInt(this.val + o, this.mod)
  }

  sub(other: ModInt | number): ModInt {
    const o = typeof other === 'number' ? other : other.val
    return new ModInt(this.val - o, this.mod)
  }

  mul(other: ModInt | number): ModInt {
    const o = typeof other === 'number' ? other : other.val
    return new ModInt((this.val * o) % this.mod, this.mod)
  }

  div(other: ModInt | number): ModInt {
    const o = typeof other === 'number' ? other : other.val
    return this.mul(ModInt.modInverse(o, this.mod))
  }

  pow(exp: number): ModInt {
    let result = 1
    let base = this.val
    let e = exp
    while (e > 0) {
      if (e & 1) result = (result * base) % this.mod
      base = (base * base) % this.mod
      e >>= 1
    }
    return new ModInt(result, this.mod)
  }

  inv(): ModInt {
    return new ModInt(ModInt.modInverse(this.val, this.mod), this.mod)
  }

  negate(): ModInt {
    return new ModInt(-this.val, this.mod)
  }

  equals(other: ModInt): boolean {
    return this.val === other.val && this.mod === other.mod
  }

  toNumber(): number {
    return this.val
  }

  get value(): number {
    return this.val
  }

  get modulus(): number {
    return this.mod
  }

  static modInverse(a: number, mod: number): number {
    const result = extendedGcd(((a % mod) + mod) % mod, mod)
    return ((result.x % mod) + mod) % mod
  }

  static factorial(n: number, mod: number): ModInt {
    let result = 1
    for (let i = 2; i <= n; i++) {
      result = (result * i) % mod
    }
    return new ModInt(result, mod)
  }

  static nCr(n: number, r: number, mod: number): ModInt {
    if (r < 0 || r > n) return new ModInt(0, mod)
    const num = ModInt.factorial(n, mod)
    const den = ModInt.factorial(r, mod).mul(ModInt.factorial(n - r, mod))
    return num.div(den)
  }
}

function extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
  if (a === 0) return { gcd: b, x: 0, y: 1 }
  const result = extendedGcd(b % a, a)
  return { gcd: result.gcd, x: result.y - Math.floor(b / a) * result.x, y: result.x }
}
