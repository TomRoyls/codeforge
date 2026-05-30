export class TriangularNumber {
  static nth(n: number): number {
    if (n <= 0) return 0
    return (n * (n + 1)) / 2
  }

  static isTriangular(x: number): boolean {
    if (x < 0) return false
    const n = (Math.sqrt(8 * x + 1) - 1) / 2
    return n === Math.floor(n) && n > 0
  }

  static indexOf(x: number): number {
    if (!TriangularNumber.isTriangular(x)) return -1
    return Math.floor((Math.sqrt(8 * x + 1) - 1) / 2)
  }

  static sumOfFirst(n: number): number {
    if (n <= 0) return 0
    return (n * (n + 1) * (n + 2)) / 6
  }

  static generate(count: number): number[] {
    const result: number[] = []
    for (let i = 1; i <= count; i++) {
      result.push(TriangularNumber.nth(i))
    }
    return result
  }

  static tetrahedral(n: number): number {
    return TriangularNumber.sumOfFirst(n)
  }

  static pentagonal(n: number): number {
    if (n <= 0) return 0
    return (3 * n * n - n) / 2
  }

  static hexagonal(n: number): number {
    if (n <= 0) return 0
    return n * (2 * n - 1)
  }
}
