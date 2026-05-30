export class PrefixFunction {
  static compute(s: string): number[] {
    const n = s.length
    const pi = new Array(n).fill(0) as number[]
    for (let i = 1; i < n; i++) {
      let j = pi[i - 1]!
      while (j > 0 && s[i] !== s[j]) j = pi[j - 1]!
      if (s[i] === s[j]) j++
      pi[i] = j
    }
    return pi
  }

  static search(text: string, pattern: string): number[] {
    if (pattern.length === 0) return []
    const combined = pattern + '#' + text
    const pi = PrefixFunction.compute(combined)
    const result: number[] = []
    const pLen = pattern.length
    for (let i = pLen + 1; i < combined.length; i++) {
      if (pi[i] === pLen) {
        result.push(i - 2 * pLen)
      }
    }
    return result
  }

  static countOccurrences(text: string, pattern: string): number {
    return PrefixFunction.search(text, pattern).length
  }

  static isPeriodic(s: string, period: number): boolean {
    if (period <= 0 || period > s.length) return false
    if (s.length % period !== 0) return false
    const pi = PrefixFunction.compute(s)
    const n = s.length
    return pi[n - 1]! >= n - period
  }

  static smallestPeriod(s: string): number {
    if (s.length === 0) return 0
    const pi = PrefixFunction.compute(s)
    const n = s.length
    const candidate = n - pi[n - 1]!
    return n % candidate === 0 ? candidate : n
  }

  static longestPrefixSuffix(s: string): number {
    if (s.length === 0) return 0
    return PrefixFunction.compute(s)[s.length - 1]!
  }
}
