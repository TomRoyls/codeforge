export class ZFunction {
  readonly z: number[]
  readonly s: string

  constructor(s: string) {
    this.s = s
    const n = s.length
    this.z = new Array(n).fill(0)
    if (n === 0) return

    this.z[0] = n
    let l = 0
    let r = 0

    for (let i = 1; i < n; i++) {
      if (i < r) {
        this.z[i] = Math.min(r - i, this.z[i - l]!)
      }
      while (i + this.z[i]! < n && s[this.z[i]!] === s[i + this.z[i]!]) {
        this.z[i]++
      }
      if (i + this.z[i]! > r) {
        l = i
        r = i + this.z[i]!
      }
    }
  }

  static search(text: string, pattern: string): number[] {
    const combined = pattern + '$' + text
    const zf = new ZFunction(combined)
    const result: number[] = []
    const plen = pattern.length

    for (let i = plen + 1; i < combined.length; i++) {
      if (zf.z[i]! === plen) {
        result.push(i - plen - 1)
      }
    }
    return result
  }

  static findPeriod(s: string): number {
    const zf = new ZFunction(s)
    const n = s.length
    for (let i = 1; i < n; i++) {
      if (i + zf.z[i]! >= n && n % i === 0) {
        return i
      }
    }
    return n
  }

  static longestCommonPrefix(s1: string, s2: string): number {
    const combined = s1 + '$' + s2
    const zf = new ZFunction(combined)
    return zf.z[s1.length + 1] ?? 0
  }

  static isSubstring(text: string, pattern: string): boolean {
    return ZFunction.search(text, pattern).length > 0
  }

  static countOccurrences(text: string, pattern: string): number {
    return ZFunction.search(text, pattern).length
  }

  static distinctSubstrings(n: number): number {
    return (n * (n + 1)) / 2
  }
}
