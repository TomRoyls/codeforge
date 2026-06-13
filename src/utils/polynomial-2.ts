export class Polynomial2 {
  private coeffs: number[]

  constructor(coeffs: number[] = []) {
    this.coeffs = [...coeffs]
    while (this.coeffs.length > 1 && this.coeffs[this.coeffs.length - 1] === 0) {
      this.coeffs.pop()
    }
  }

  static from(coeffs: number[]): Polynomial2 { return new Polynomial2(coeffs) }
  static constant(c: number): Polynomial2 { return new Polynomial2([c]) }
  static zero(): Polynomial2 { return new Polynomial2([0]) }

  degree(): number { return this.coeffs.length - 1 }

  evaluate(x: number): number {
    let result = 0
    for (let i = this.coeffs.length - 1; i >= 0; i--) {
      result = result * x + this.coeffs[i]
    }
    return result
  }

  add(other: Polynomial2): Polynomial2 {
    const len = Math.max(this.coeffs.length, other.coeffs.length)
    const result = new Array(len).fill(0)
    for (let i = 0; i < this.coeffs.length; i++) result[i] += this.coeffs[i]
    for (let i = 0; i < other.coeffs.length; i++) result[i] += other.coeffs[i]
    return new Polynomial2(result)
  }

  multiply(other: Polynomial2): Polynomial2 {
    if (this.coeffs.length === 1 && this.coeffs[0] === 0) return Polynomial2.zero()
    if (other.coeffs.length === 1 && other.coeffs[0] === 0) return Polynomial2.zero()
    const result = new Array(this.coeffs.length + other.coeffs.length - 1).fill(0)
    for (let i = 0; i < this.coeffs.length; i++) {
      for (let j = 0; j < other.coeffs.length; j++) {
        result[i + j] += this.coeffs[i] * other.coeffs[j]
      }
    }
    return new Polynomial2(result)
  }

  scale(s: number): Polynomial2 {
    return new Polynomial2(this.coeffs.map(c => c * s))
  }

  derivative(): Polynomial2 {
    if (this.coeffs.length <= 1) return Polynomial2.zero()
    const result: number[] = []
    for (let i = 1; i < this.coeffs.length; i++) {
      result.push(this.coeffs[i] * i)
    }
    return new Polynomial2(result)
  }

  get isZero(): boolean { return this.coeffs.length === 1 && this.coeffs[0] === 0 }
  get size(): number { return this.coeffs.length }

  toArray(): number[] { return [...this.coeffs] }
  toString(): string { return JSON.stringify({ degree: this.degree(), coeffs: this.coeffs.length }) }
  toJSON(): Record<string, number> { return { degree: this.degree(), size: this.coeffs.length } }

  clone(): Polynomial2 { return new Polynomial2(this.coeffs) }

  equals(other: unknown): boolean {
    if (!(other instanceof Polynomial2)) return false
    if (this.coeffs.length !== other.coeffs.length) return false
    return this.coeffs.every((c, i) => c === other.coeffs[i])
  }
}
