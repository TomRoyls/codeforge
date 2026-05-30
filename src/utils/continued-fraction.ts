export class ContinuedFraction {
  static fromNumber(x: number, maxTerms: number = 20): number[] {
    if (Number.isInteger(x)) return [x]
    const result: number[] = []
    let current = x
    for (let i = 0; i < maxTerms; i++) {
      const whole = Math.floor(current)
      result.push(whole)
      const frac = current - whole
      if (frac < 1e-10) break
      current = 1 / frac
    }
    return result
  }

  static toNumber(coefficients: number[]): number {
    if (coefficients.length === 0) return 0
    let result = coefficients[coefficients.length - 1]!
    for (let i = coefficients.length - 2; i >= 0; i--) {
      result = coefficients[i]! + 1 / result
    }
    return result
  }

  static convergents(coefficients: number[]): { numerator: number; denominator: number }[] {
    if (coefficients.length === 0) return []
    const result: { numerator: number; denominator: number }[] = []
    let hPrev = 0
    let hCurr = 1
    let kPrev = 1
    let kCurr = 0
    for (const a of coefficients) {
      const hNext = a * hCurr + hPrev
      const kNext = a * kCurr + kPrev
      result.push({ numerator: hNext, denominator: kNext })
      hPrev = hCurr
      hCurr = hNext
      kPrev = kCurr
      kCurr = kNext
    }
    return result
  }

  static fromRatio(numerator: number, denominator: number): number[] {
    if (denominator === 0) return []
    const result: number[] = []
    let a = Math.abs(numerator)
    let b = Math.abs(denominator)
    while (b !== 0) {
      const q = Math.floor(a / b)
      result.push(q)
      const r = a % b
      a = b
      b = r
    }
    return result
  }

  static approximate(x: number, maxDenominator: number): { numerator: number; denominator: number } {
    const cf = ContinuedFraction.fromNumber(x, 30)
    const convs = ContinuedFraction.convergents(cf)
    let best = convs[0]!
    for (const c of convs) {
      if (c.denominator <= maxDenominator) best = c
    }
    return best
  }
}
