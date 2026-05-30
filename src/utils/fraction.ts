export class Fraction {
  constructor(public readonly num: number, public readonly den: number = 1) {
    if (den === 0) throw new Error('Denominator cannot be zero')
    if (den < 0) {
      this.num = -num
      this.den = -den
    }
  }

  static from(n: number): Fraction {
    if (Number.isInteger(n)) return new Fraction(n, 1)
    const str = n.toString()
    const decimals = str.includes('.') ? str.split('.')[1]!.length : 0
    const factor = 10 ** decimals
    return new Fraction(Math.round(n * factor), factor).simplify()
  }

  simplify(): Fraction {
    const g = gcd(Math.abs(this.num), Math.abs(this.den))
    const sign = this.den < 0 ? -1 : 1
    return new Fraction(sign * this.num / g, sign * this.den / g)
  }

  add(other: Fraction): Fraction {
    return new Fraction(
      this.num * other.den + other.num * this.den,
      this.den * other.den,
    ).simplify()
  }

  sub(other: Fraction): Fraction {
    return new Fraction(
      this.num * other.den - other.num * this.den,
      this.den * other.den,
    ).simplify()
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den).simplify()
  }

  div(other: Fraction): Fraction {
    if (other.num === 0) throw new Error('Division by zero')
    return new Fraction(this.num * other.den, this.den * other.num).simplify()
  }

  equals(other: Fraction): boolean {
    const a = this.simplify()
    const b = other.simplify()
    return a.num === b.num && a.den === b.den
  }

  lessThan(other: Fraction): boolean {
    return this.num * other.den < other.num * this.den
  }

  greaterThan(other: Fraction): boolean {
    return this.num * other.den > other.num * this.den
  }

  toNumber(): number {
    return this.num / this.den
  }

  toString(): string {
    return this.den === 1 ? `${this.num}` : `${this.num}/${this.den}`
  }

  abs(): Fraction {
    return new Fraction(Math.abs(this.num), this.den)
  }

  negate(): Fraction {
    return new Fraction(-this.num, this.den)
  }

  reciprocal(): Fraction {
    if (this.num === 0) throw new Error('Zero has no reciprocal')
    return new Fraction(this.den, this.num)
  }

  isInteger(): boolean {
    return this.num % this.den === 0
  }
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}
