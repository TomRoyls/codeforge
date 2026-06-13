export class Complex {
  real: number
  imag: number

  constructor(real = 0, imag = 0) {
    this.real = real
    this.imag = imag
  }

  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag)
  }

  sub(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imag - other.imag)
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    )
  }

  div(other: Complex): Complex {
    const denom = other.real * other.real + other.imag * other.imag
    if (denom === 0) throw new Error('Division by zero')
    return new Complex(
      (this.real * other.real + this.imag * other.imag) / denom,
      (this.imag * other.real - this.real * other.imag) / denom
    )
  }

  conjugate(): Complex { return new Complex(this.real, -this.imag) }
  abs(): number { return Math.sqrt(this.real * this.real + this.imag * this.imag) }
  abs2(): number { return this.real * this.real + this.imag * this.imag }
  arg(): number { return Math.atan2(this.imag, this.real) }

  get isReal(): boolean { return this.imag === 0 }
  get isImaginary(): boolean { return this.real === 0 && this.imag !== 0 }
  get isZero(): boolean { return this.real === 0 && this.imag === 0 }

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta))
  }

  clear(): void { this.real = 0; this.imag = 0 }

  toArray(): number[] { return [this.real, this.imag] }
  toString(): string {
    if (this.imag === 0) return `${this.real}`
    if (this.real === 0) return `${this.imag}i`
    return `${this.real}${this.imag >= 0 ? '+' : ''}${this.imag}i`
  }
  toJSON(): Record<string, number> { return { real: this.real, imag: this.imag } }

  clone(): Complex { return new Complex(this.real, this.imag) }

  equals(other: unknown): boolean {
    if (!(other instanceof Complex)) return false
    return this.real === other.real && this.imag === other.imag
  }
}
