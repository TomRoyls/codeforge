export class Josephus {
  static survivor(n: number, k: number): number {
    if (n < 1) throw new RangeError('n must be >= 1')
    if (k < 1) throw new RangeError('k must be >= 1')
    let result = 0
    for (let i = 2; i <= n; i++) {
      result = (result + k) % i
    }
    return result
  }

  static order(n: number, k: number): number[] {
    if (n < 1) throw new RangeError('n must be >= 1')
    if (k < 1) throw new RangeError('k must be >= 1')
    const people: number[] = Array.from({ length: n }, (_, i) => i)
    const elimination: number[] = []
    let idx = 0
    while (people.length > 0) {
      idx = (idx + k - 1) % people.length
      elimination.push(people[idx]!)
      people.splice(idx, 1)
    }
    return elimination
  }

  static survivorRecursive(n: number, k: number): number {
    if (n === 1) return 0
    return (Josephus.survivorRecursive(n - 1, k) + k) % n
  }

  static generalSurvivor(n: number, k: number, startIndex: number = 0): number {
    return (Josephus.survivor(n, k) + startIndex) % n
  }
}
