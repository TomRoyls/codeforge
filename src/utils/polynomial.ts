export class Polynomial {
  readonly coefficients: number[]

  constructor(coefficients: number[]) {
    this.coefficients = [...coefficients]
    while (this.coefficients.length > 1 && this.coefficients[this.coefficients.length - 1] === 0) {
      this.coefficients.pop()
    }
  }

  get degree(): number {
    return this.coefficients.length - 1
  }

  evaluate(x: number): number {
    let result = 0
    for (let i = this.coefficients.length - 1; i >= 0; i--) {
      result = result * x + this.coefficients[i]!
    }
    return result
  }

  add(other: Polynomial): Polynomial {
    const len = Math.max(this.coefficients.length, other.coefficients.length)
    const result = new Array<number>(len).fill(0)
    for (let i = 0; i < len; i++) {
      result[i] = (this.coefficients[i] ?? 0) + (other.coefficients[i] ?? 0)
    }
    return new Polynomial(result)
  }

  subtract(other: Polynomial): Polynomial {
    const len = Math.max(this.coefficients.length, other.coefficients.length)
    const result = new Array<number>(len).fill(0)
    for (let i = 0; i < len; i++) {
      result[i] = (this.coefficients[i] ?? 0) - (other.coefficients[i] ?? 0)
    }
    return new Polynomial(result)
  }

  multiply(other: Polynomial): Polynomial {
    if (this.degree === -1 || other.degree === -1) return new Polynomial([0])
    const len = this.coefficients.length + other.coefficients.length - 1
    const result = new Array<number>(len).fill(0)
    for (let i = 0; i < this.coefficients.length; i++) {
      for (let j = 0; j < other.coefficients.length; j++) {
        result[i + j]! += this.coefficients[i]! * other.coefficients[j]!
      }
    }
    return new Polynomial(result)
  }

  scale(scalar: number): Polynomial {
    return new Polynomial(this.coefficients.map(c => c * scalar))
  }

  derivative(): Polynomial {
    if (this.degree <= 0) return new Polynomial([0])
    const result: number[] = []
    for (let i = 1; i < this.coefficients.length; i++) {
      result.push(this.coefficients[i]! * i)
    }
    return new Polynomial(result)
  }

  static fromRoots(roots: number[]): Polynomial {
    let result = new Polynomial([1])
    for (const root of roots) {
      result = result.multiply(new Polynomial([-root, 1]))
    }
    return result
  }

  toString(): string {
    if (this.degree === 0 && this.coefficients[0] === 0) return '0'
    const terms: string[] = []
    for (let i = this.coefficients.length - 1; i >= 0; i--) {
      const c = this.coefficients[i]!
      if (c === 0) continue
      const sign = c >= 0 ? '+' : '-'
      const abs = Math.abs(c)
      let term = ''
      if (i === 0) {
        term = `${abs}`
      } else if (i === 1) {
        term = abs === 1 ? 'x' : `${abs}x`
      } else {
        term = abs === 1 ? `x^${i}` : `${abs}x^${i}`
      }
      terms.push(`${sign}${term}`)
    }
    let s = terms.join('')
    if (s.startsWith('+')) s = s.slice(1)
    return s || '0'
  }
}
