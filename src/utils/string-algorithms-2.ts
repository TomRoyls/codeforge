export class StringAlgorithms2 {
  static kmp(text: string, pattern: string): number[] {
    if (pattern.length === 0) return []
    const lps = StringAlgorithms2.buildLPS(pattern)
    const result: number[] = []
    let i = 0, j = 0
    while (i < text.length) {
      if (text[i] === pattern[j]) {
        i++; j++
        if (j === pattern.length) {
          result.push(i - j)
          j = lps[j - 1]
        }
      } else if (j > 0) {
        j = lps[j - 1]
      } else {
        i++
      }
    }
    return result
  }

  private static buildLPS(pattern: string): number[] {
    const lps: number[] = new Array(pattern.length).fill(0)
    let len = 0, i = 1
    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        len++; lps[i] = len; i++
      } else if (len > 0) {
        len = lps[len - 1]
      } else {
        lps[i] = 0; i++
      }
    }
    return lps
  }

  static zFunction(s: string): number[] {
    const n = s.length
    const z: number[] = new Array(n).fill(0)
    let l = 0, r = 0
    for (let i = 1; i < n; i++) {
      if (i < r) z[i] = Math.min(r - i, z[i - l])
      while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++
      if (i + z[i] > r) { l = i; r = i + z[i] }
    }
    return z
  }

  static manacher(s: string): string {
    const t = '#' + s.split('').join('#') + '#'
    const n = t.length
    const p: number[] = new Array(n).fill(0)
    let c = 0, r = 0
    for (let i = 1; i < n - 1; i++) {
      const mirror = 2 * c - i
      if (i < r) p[i] = Math.min(r - i, p[mirror])
      while (i + p[i] + 1 < n && i - p[i] - 1 >= 0 && t[i + p[i] + 1] === t[i - p[i] - 1]) p[i]++
      if (i + p[i] > r) { c = i; r = i + p[i] }
    }
    let maxLen = 0, center = 0
    for (let i = 1; i < n - 1; i++) {
      if (p[i] > maxLen) { maxLen = p[i]; center = i }
    }
    const start = Math.floor((center - maxLen) / 2)
    return s.substring(start, start + maxLen)
  }

  static isPalindrome(s: string): boolean {
    let l = 0, r = s.length - 1
    while (l < r) {
      if (s[l] !== s[r]) return false
      l++; r--
    }
    return true
  }

  static reverseString(s: string): string {
    return s.split('').reverse().join('')
  }

  static anagramCheck(s1: string, s2: string): boolean {
    if (s1.length !== s2.length) return false
    const count = new Map<string, number>()
    for (const c of s1) count.set(c, (count.get(c) ?? 0) + 1)
    for (const c of s2) {
      const v = count.get(c)
      if (!v) return false
      count.set(c, v - 1)
    }
    return true
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): StringAlgorithms2 { return new StringAlgorithms2() }
  equals(other: unknown): boolean { return other instanceof StringAlgorithms2 }
}
