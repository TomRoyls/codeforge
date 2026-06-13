export class ModularArith2 {
  readonly mod: number

  constructor(mod: number) { this.mod = mod }

  add(a: number, b: number): number { return ((a % this.mod + b % this.mod) % this.mod + this.mod) % this.mod }
  sub(a: number, b: number): number { return this.add(a, -b) }
  mul(a: number, b: number): number {
    a = ((a % this.mod) + this.mod) % this.mod
    b = ((b % this.mod) + this.mod) % this.mod
    return Number((BigInt(a) * BigInt(b)) % BigInt(this.mod))
  }
  pow(base: number, exp: number): number {
    base = ((base % this.mod) + this.mod) % this.mod
    let result = 1
    while (exp > 0) {
      if (exp & 1) result = this.mul(result, base)
      base = this.mul(base, base)
      exp = Math.floor(exp / 2)
    }
    return result
  }
  inv(a: number): number { return this.pow(a, this.mod - 2) }

  toArray(): number[] { return [this.mod] }
  toString(): string { return JSON.stringify({ mod: this.mod }) }
  toJSON(): Record<string, number> { return { mod: this.mod } }
  clone(): ModularArith2 { return new ModularArith2(this.mod) }
  equals(other: unknown): boolean {
    if (!(other instanceof ModularArith2)) return false
    return this.mod === other.mod
  }
}
