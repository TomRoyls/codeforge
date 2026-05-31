export class ZAlgorithm {
  static zFunction(s: string): number[] {
    const n = s.length
    const z = new Array<number>(n).fill(0)
    if (n === 0) return z
    z[0] = n
    let l = 0
    let r = 0
    for (let i = 1; i < n; i++) {
      if (i < r) z[i] = Math.min(r - i, z[i - l]!)
      while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++
      if (i + z[i] > r) {
        l = i
        r = i + z[i]
      }
    }
    return z
  }

  static search(text: string, pattern: string): number[] {
    if (pattern.length === 0 || pattern.length > text.length) return []
    const combined = pattern + '$' + text
    const z = ZAlgorithm.zFunction(combined)
    const results: number[] = []
    const offset = pattern.length + 1
    for (let i = offset; i < combined.length; i++) {
      if (z[i] === pattern.length) results.push(i - offset)
    }
    return results
  }

  static contains(text: string, pattern: string): boolean {
    return ZAlgorithm.search(text, pattern).length > 0
  }

  static countOccurrences(text: string, pattern: string): number {
    return ZAlgorithm.search(text, pattern).length
  }

  static longestPrefixSuffix(s: string): number {
    if (s.length <= 1) return 0
    const z = ZAlgorithm.zFunction(s)
    for (let i = 1; i < s.length; i++) {
      if (i + z[i] === s.length) return z[i]!
    }
    return 0
  }

  static distinctSubstringCount(text: string): number {
    let count = 0
    for (let i = 0; i < text.length; i++) {
      const prefix = text.slice(0, i + 1)
      const z = ZAlgorithm.zFunction(prefix)
      let maxZ = 0
      for (let k = 1; k < z.length; k++) if (z[k]! > maxZ) maxZ = z[k]!
      count += (i + 1) - maxZ
    }
    return count
  }
}
