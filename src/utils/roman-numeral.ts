export class RomanNumeral {
  private static readonly VALUES: [string, number][] = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4],
    ['I', 1],
  ]

  static toRoman(n: number): string {
    if (n <= 0 || n > 3999 || !Number.isInteger(n)) {
      throw new Error('Number must be an integer between 1 and 3999')
    }
    let result = ''
    let remaining = n
    for (const [symbol, value] of RomanNumeral.VALUES) {
      while (remaining >= value) {
        result += symbol
        remaining -= value
      }
    }
    return result
  }

  static fromRoman(roman: string): number {
    const values: Record<string, number> = {
      I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
    }
    let result = 0
    for (let i = 0; i < roman.length; i++) {
      const current = values[roman[i]!]
      if (current === undefined) {
        throw new Error(`Invalid Roman numeral character: ${roman[i]}`)
      }
      const next = values[roman[i + 1]!] ?? 0
      if (current < next) {
        result -= current
      } else {
        result += current
      }
    }
    return result
  }

  static isValid(roman: string): boolean {
    try {
      const n = RomanNumeral.fromRoman(roman)
      return RomanNumeral.toRoman(n) === roman
    } catch {
      return false
    }
  }
}
