export class DensePolynomial {
  private coeffs: number[]

  constructor(coeffs: number[] = []) {
    this.coeffs = [...coeffs]
    this.trim()
  }

  degree(): number { return Math.max(0, this.coeffs.length - 1) }

  evaluate(x: number): number {
    let result = 0
    for (let i = this.coeffs.length - 1; i >= 0; i--) {
      result = result * x + this.coeffs[i]!
    }
    return result
  }

  add(other: DensePolynomial): DensePolynomial {
    const len = Math.max(this.coeffs.length, other.coeffs.length)
    const result: number[] = new Array(len).fill(0)
    for (let i = 0; i < this.coeffs.length; i++) result[i]! += this.coeffs[i]!
    for (let i = 0; i < other.coeffs.length; i++) result[i]! += other.coeffs[i]!
    return new DensePolynomial(result)
  }

  scale(s: number): DensePolynomial {
    return new DensePolynomial(this.coeffs.map((c) => c * s))
  }

  derivative(): DensePolynomial {
    if (this.coeffs.length <= 1) return new DensePolynomial([0])
    const dCoeffs: number[] = []
    for (let i = 1; i < this.coeffs.length; i++) {
      dCoeffs.push(this.coeffs[i]! * i)
    }
    return new DensePolynomial(dCoeffs)
  }

  get isZero(): boolean { return this.coeffs.length <= 1 && this.coeffs[0] === 0 }
  get leadingCoeff(): number { return this.coeffs[this.coeffs.length - 1] ?? 0 }

  clear(): void { this.coeffs = [0] }

  toArray(): number[] { return [...this.coeffs] }
  toString(): string { return JSON.stringify(this.coeffs) }
  toJSON(): number[] { return this.toArray() }

  clone(): DensePolynomial { return new DensePolynomial(this.coeffs) }

  equals(other: unknown): boolean {
    if (!(other instanceof DensePolynomial)) return false
    if (this.coeffs.length !== other.coeffs.length) return false
    return this.coeffs.every((c, i) => c === other.coeffs[i])
  }

  private trim(): void {
    while (this.coeffs.length > 1 && this.coeffs[this.coeffs.length - 1] === 0) {
      this.coeffs.pop()
    }
  }
}
