export class BigIntRing {
  private mod: bigint

  constructor(modulus: bigint) {
    if (modulus <= 0n) throw new Error('Modulus must be positive')
    this.mod = modulus
  }

  add(a: bigint, b: bigint): bigint {
    return ((a % this.mod + b % this.mod) % this.mod + this.mod) % this.mod
  }

  sub(a: bigint, b: bigint): bigint {
    return ((a % this.mod - b % this.mod) % this.mod + this.mod) % this.mod
  }

  mul(a: bigint, b: bigint): bigint {
    return ((a % this.mod) * (b % this.mod) % this.mod + this.mod) % this.mod
  }

  pow(base: bigint, exp: bigint): bigint {
    if (exp < 0n) throw new Error('Negative exponent not supported')
    base = ((base % this.mod) + this.mod) % this.mod
    let result = 1n
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % this.mod
      base = (base * base) % this.mod
      exp >>= 1n
    }
    return result
  }

  norm(a: bigint): bigint {
    return ((a % this.mod) + this.mod) % this.mod
  }

  get modulus(): bigint { return this.mod }
  get zero(): bigint { return 0n }
  get one(): bigint { return 1n }

  toArray(): bigint[] { return [this.mod] }
  toString(): string { return `Z/${this.mod}Z` }
  toJSON(): Record<string, string> { return { modulus: this.mod.toString() } }

  clone(): BigIntRing { return new BigIntRing(this.mod) }

  equals(other: unknown): boolean {
    if (!(other instanceof BigIntRing)) return false
    return this.mod === other.mod
  }
}
