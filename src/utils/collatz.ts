export class Collatz {
  static sequence(n: number): number[] {
    if (n <= 0) return []
    const result: number[] = [n]
    let current = n
    while (current !== 1) {
      if (current % 2 === 0) {
        current = current / 2
      } else {
        current = 3 * current + 1
      }
      result.push(current)
    }
    return result
  }

  static steps(n: number): number {
    if (n <= 0) return -1
    let count = 0
    let current = n
    while (current !== 1) {
      if (current % 2 === 0) {
        current = current / 2
      } else {
        current = 3 * current + 1
      }
      count++
    }
    return count
  }

  static maxValue(n: number): number {
    if (n <= 0) return 0
    let max = n
    let current = n
    while (current !== 1) {
      if (current % 2 === 0) {
        current = current / 2
      } else {
        current = 3 * current + 1
      }
      if (current > max) max = current
    }
    return max
  }

  static converges(n: number, maxSteps: number = 100000): boolean {
    if (n <= 0) return false
    let current = n
    let steps = 0
    while (current !== 1 && steps < maxSteps) {
      if (current % 2 === 0) {
        current = current / 2
      } else {
        current = 3 * current + 1
      }
      steps++
    }
    return current === 1
  }

  static longestSequence(limit: number): { n: number; steps: number } {
    let maxN = 1
    let maxSteps = 0
    for (let i = 1; i <= limit; i++) {
      const s = Collatz.steps(i)
      if (s > maxSteps) {
        maxSteps = s
        maxN = i
      }
    }
    return { n: maxN, steps: maxSteps }
  }

  static step(n: number): number {
    if (n <= 0) return 0
    if (n === 1) return 1
    return n % 2 === 0 ? n / 2 : 3 * n + 1
  }
}
