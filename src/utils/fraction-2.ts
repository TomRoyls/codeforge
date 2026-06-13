export class Fraction2 {
  numerator: number
  denominator: number

  constructor(numerator: number, denominator = 1) {
    if (denominator === 0) throw new Error('Denominator cannot be zero')
    if (denominator < 0) { numerator = -numerator; denominator = -denominator }
    const g = Fraction2.gcd(Math.abs(numerator), denominator)
    this.numerator = numerator / g
    this.denominator = denominator / g
  }

  static gcd(a: number, b: number): number {
    while (b) { [a, b] = [b, a % b] }
    return a
  }

  add(other: Fraction2): Fraction2 {
    return new Fraction2(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator
    )
  }

  subtract(other: Fraction2): Fraction2 {
    return new Fraction2(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    )
  }

  multiply(other: Fraction2): Fraction2 {
    return new Fraction2(this.numerator * other.numerator, this.denominator * other.denominator)
  }

  divide(other: Fraction2): Fraction2 {
    return new Fraction2(this.numerator * other.denominator, this.denominator * other.numerator)
  }

  toNumber(): number { return this.numerator / this.denominator }
  reciprocal(): Fraction2 { return new Fraction2(this.denominator, this.numerator) }
  negate(): Fraction2 { return new Fraction2(-this.numerator, this.denominator) }

  get isInteger(): boolean { return this.denominator === 1 }
  get isZero(): boolean { return this.numerator === 0 }
  get isPositive(): boolean { return this.numerator > 0 }
  get isNegative(): boolean { return this.numerator < 0 }

  toArray(): number[] { return [this.numerator, this.denominator] }
  toString(): string { return JSON.stringify({ num: this.numerator, den: this.denominator }) }
  toJSON(): Record<string, number> { return { numerator: this.numerator, denominator: this.denominator } }

  clone(): Fraction2 { return new Fraction2(this.numerator, this.denominator) }

  equals(other: unknown): boolean {
    if (!(other instanceof Fraction2)) return false
    return this.numerator === other.numerator && this.denominator === other.denominator
  }
}
