export class ZAlgorithmExtended {
  static search(text: string, pattern: string): number[] {
    if (pattern.length === 0) return []
    const s = pattern + '$' + text
    const n = s.length
    const z = new Array(n).fill(0)
    let l = 0
    let r = 0
    for (let i = 1; i < n; i++) {
      if (i < r) {
        z[i] = Math.min(r - i, z[i - l]!)
      }
      while (i + z[i]! < n && s[z[i]!] === s[i + z[i]!]) {
        z[i]!++
      }
      if (i + z[i]! > r) {
        l = i
        r = i + z[i]!
      }
    }
    const result: number[] = []
    const m = pattern.length
    for (let i = m + 1; i < n; i++) {
      if (z[i] === m) {
        result.push(i - m - 1)
      }
    }
    return result
  }

  static zArray(s: string): number[] {
    const n = s.length
    const z = new Array(n).fill(0)
    let l = 0
    let r = 0
    for (let i = 1; i < n; i++) {
      if (i < r) {
        z[i] = Math.min(r - i, z[i - l]!)
      }
      while (i + z[i]! < n && s[z[i]!] === s[i + z[i]!]) {
        z[i]!++
      }
      if (i + z[i]! > r) {
        l = i
        r = i + z[i]!
      }
    }
    z[0] = n
    return z
  }

  static longestPrefixSuffix(s: string): number {
    const z = ZAlgorithmExtended.zArray(s)
    const n = s.length
    for (let i = 1; i < n; i++) {
      if (i + z[i] === n) return z[i]!
    }
    return 0
  }
}
