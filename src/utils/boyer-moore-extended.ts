export class BoyerMooreExtended {
  private static buildBadCharTable(pattern: string): Map<string, number> {
    const table = new Map<string, number>()
    for (let i = 0; i < pattern.length - 1; i++) {
      table.set(pattern[i]!, pattern.length - 1 - i)
    }
    return table
  }

  private static buildGoodSuffixTable(pattern: string): number[] {
    const m = pattern.length
    const table = new Array(m + 1).fill(m)
    let i = m
    let j = m + 1
    const bpos = new Array(m + 1).fill(0)
    bpos[i] = j
    while (i > 0) {
      while (j <= m && pattern[i - 1] !== pattern[j - 1]) {
        if (table[j] === m) table[j] = j - i
        j = bpos[j]!
      }
      i--
      j--
      bpos[i] = j
    }
    j = bpos[0]!
    for (i = 0; i <= m; i++) {
      if (table[i] === m) table[i] = j
      if (i === j) j = bpos[j]!
    }
    return table
  }

  static search(text: string, pattern: string): number[] {
    if (pattern.length === 0 || text.length < pattern.length) return []
    const badChar = BoyerMooreExtended.buildBadCharTable(pattern)
    const goodSuffix = BoyerMooreExtended.buildGoodSuffixTable(pattern)
    const result: number[] = []
    const m = pattern.length
    const n = text.length
    let s = 0
    while (s <= n - m) {
      let j = m - 1
      while (j >= 0 && pattern[j] === text[s + j]) j--
      if (j < 0) {
        result.push(s)
        s += goodSuffix[0]!
      } else {
        const bc = badChar.get(text[s + j]!) ?? m
        s += Math.max(goodSuffix[j + 1]!, bc - (m - 1 - j))
      }
    }
    return result
  }
}
