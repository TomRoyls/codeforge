export class LongestCommonSubstring {
  static find(a: string, b: string): string {
    if (a.length === 0 || b.length === 0) return ''
    let maxLen = 0
    let endIdx = 0
    const n = a.length
    const m = b.length
    let prev = new Array<number>(m + 1).fill(0)
    let curr = new Array<number>(m + 1).fill(0)
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (a[i - 1] === b[j - 1]) {
          curr[j] = prev[j - 1]! + 1
          if (curr[j]! > maxLen) {
            maxLen = curr[j]!
            endIdx = i
          }
        } else {
          curr[j] = 0
        }
      }
      const temp = prev
      prev = curr
      curr = temp
      curr.fill(0)
    }
    return a.slice(endIdx - maxLen, endIdx)
  }

  static findLength(a: string, b: string): number {
    return LongestCommonSubstring.find(a, b).length
  }

  static findAll(a: string, b: string): string[] {
    if (a.length === 0 || b.length === 0) return []
    let maxLen = 0
    const ends = new Set<number>()
    const n = a.length
    const m = b.length
    let prev = new Array<number>(m + 1).fill(0)
    let curr = new Array<number>(m + 1).fill(0)
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (a[i - 1] === b[j - 1]) {
          curr[j] = prev[j - 1]! + 1
          if (curr[j]! > maxLen) {
            maxLen = curr[j]!
            ends.clear()
            ends.add(i)
          } else if (curr[j] === maxLen && maxLen > 0) {
            ends.add(i)
          }
        } else {
          curr[j] = 0
        }
      }
      const temp = prev
      prev = curr
      curr = temp
      curr.fill(0)
    }
    if (maxLen === 0) return []
    const results = new Set<string>()
    for (const end of ends) {
      results.add(a.slice(end - maxLen, end))
    }
    return [...results]
  }

  static ofMany(strings: string[]): string {
    if (strings.length === 0) return ''
    if (strings.length === 1) return strings[0]!
    let result = LongestCommonSubstring.find(strings[0]!, strings[1]!)
    for (let i = 2; i < strings.length; i++) {
      result = LongestCommonSubstring.find(result, strings[i]!)
      if (result.length === 0) break
    }
    return result
  }
}
