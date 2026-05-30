export class DigitSum {
  static sum(n: number): number {
    const abs = Math.abs(Math.floor(n))
    let s = 0
    let val = abs
    while (val > 0) {
      s += val % 10
      val = Math.floor(val / 10)
    }
    return s
  }

  static digitalRoot(n: number): number {
    if (n === 0) return 0
    const abs = Math.abs(Math.floor(n))
    return 1 + ((abs - 1) % 9)
  }

  static isHarshad(n: number): boolean {
    if (n <= 0) return false
    return n % DigitSum.sum(n) === 0
  }

  static isMoran(n: number): boolean {
    if (n <= 0) return false
    const s = DigitSum.sum(n)
    if (s === 0) return false
    if (n % s !== 0) return false
    const quotient = n / s
    return DigitSum.isPrime(quotient)
  }

  static isPrime(n: number): boolean {
    if (n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false
    }
    return true
  }

  static countDigits(n: number): number {
    if (n === 0) return 1
    return Math.floor(Math.log10(Math.abs(n))) + 1
  }

  static reverse(n: number): number {
    const abs = Math.abs(n)
    const reversed = Number(String(abs).split('').reverse().join(''))
    return n < 0 ? -reversed : reversed
  }

  static isPalindrome(n: number): boolean {
    return n === DigitSum.reverse(n)
  }

  static sumOfSquares(n: number): number {
    const abs = Math.abs(Math.floor(n))
    let s = 0
    let val = abs
    while (val > 0) {
      const d = val % 10
      s += d * d
      val = Math.floor(val / 10)
    }
    return s
  }

  static isHappy(n: number): boolean {
    const seen = new Set<number>()
    let current = n
    while (current !== 1 && !seen.has(current)) {
      seen.add(current)
      current = DigitSum.sumOfSquares(current)
    }
    return current === 1
  }
}
