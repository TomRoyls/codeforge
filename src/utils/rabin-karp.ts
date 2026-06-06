export interface RabinKarpOptions {
  caseSensitive?: boolean
}

const BASE = 256
const MOD = 1_000_000_007

export class RabinKarp {
  private readonly pattern: string
  private readonly caseSensitive: boolean

  constructor(pattern?: string, options: RabinKarpOptions = {}) {
    this.pattern = pattern ?? ''
    this.caseSensitive = options.caseSensitive ?? true
  }

  search(text: string, pattern?: string): number[] {
    const effectivePattern = pattern ?? this.pattern
    const p = this.caseSensitive ? effectivePattern : effectivePattern.toLowerCase()
    const haystack = this.caseSensitive ? text : text.toLowerCase()

    if (p.length === 0 || p.length > haystack.length) return []

    const results: number[] = []
    const m = p.length
    const n = haystack.length

    const highOrderBase = powMod(BASE, m - 1)
    let patternHash = 0
    let textHash = 0

    for (let i = 0; i < m; i++) {
      patternHash = (patternHash * BASE + p.charCodeAt(i)) % MOD
      textHash = (textHash * BASE + haystack.charCodeAt(i)) % MOD
    }

    for (let i = 0; i <= n - m; i++) {
      if (textHash === patternHash && verify(haystack, p, i)) {
        results.push(i)
      }
      if (i < n - m) {
        textHash =
          ((textHash - haystackChar(haystack, i) * highOrderBase) * BASE +
            haystackChar(haystack, i + m)) %
          MOD
        if (textHash < 0) textHash += MOD
      }
    }

    return results
  }

  searchFirst(text: string): number {
    const indices = this.search(text)
    return indices.length > 0 ? indices[0]! : -1
  }

  count(text: string, pattern?: string): number {
    return this.search(text, pattern).length
  }

  contains(text: string, pattern?: string): boolean {
    return this.search(text, pattern).length > 0
  }

  searchMultiple(text: string, patterns: string[]): Map<string, number[]> {
    const result = new Map<string, number[]>()
    for (const pattern of patterns) {
      const rk = new RabinKarp(pattern)
      result.set(pattern, rk.search(text))
    }
    return result
  }

  static searchMultiple(text: string, patterns: string[]): Map<string, number[]> {
    const result = new Map<string, number[]>()
    for (const pattern of patterns) {
      const rk = new RabinKarp(pattern)
      result.set(pattern, rk.search(text))
    }
    return result
  }
}

function haystackChar(text: string, i: number): number {
  return text.charCodeAt(i)
}

function verify(text: string, pattern: string, start: number): boolean {
  for (let i = 0; i < pattern.length; i++) {
    if (text[start + i] !== pattern[i]) return false
  }
  return true
}

function powMod(base: number, exp: number): number {
  let result = 1
  let b = base % MOD
  let e = exp
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % MOD
    e = Math.floor(e / 2)
    b = (b * b) % MOD
  }
  return result
}
