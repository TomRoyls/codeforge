export class Narcissistic {
  static isNarcissistic(n: number): boolean {
    if (n < 0) return false
    const digits = String(n).split('').map(Number)
    const k = digits.length
    const sum = digits.reduce((acc, d) => acc + Math.pow(d, k), 0)
    return sum === n
  }

  static generate(limit: number): number[] {
    const result: number[] = []
    for (let i = 0; i <= limit; i++) {
      if (Narcissistic.isNarcissistic(i)) result.push(i)
    }
    return result
  }

  static countDigits(n: number): number {
    if (n === 0) return 1
    return String(Math.abs(n)).length
  }

  static digitPowerSum(n: number): number {
    const abs = Math.abs(n)
    const k = String(abs).length
    let sum = 0
    let val = abs
    while (val > 0) {
      const d = val % 10
      sum += Math.pow(d, k)
      val = Math.floor(val / 10)
    }
    return sum
  }

  static next(n: number): number {
    let candidate = n + 1
    while (!Narcissistic.isNarcissistic(candidate)) {
      candidate++
    }
    return candidate
  }

  static isPerfectDigitalInvariant(n: number, power: number): boolean {
    if (n < 0) return false
    let sum = 0
    let val = n
    while (val > 0) {
      const d = val % 10
      sum += Math.pow(d, power)
      val = Math.floor(val / 10)
    }
    return sum === n
  }
}
