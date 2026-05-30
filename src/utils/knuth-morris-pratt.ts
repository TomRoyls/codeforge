export class KnuthMorrisPratt {
  static search(text: string, pattern: string): number[] {
    if (pattern.length === 0) return []
    if (text.length < pattern.length) return []
    const lps = KnuthMorrisPratt.buildLPS(pattern)
    const matches: number[] = []
    let i = 0
    let j = 0
    while (i < text.length) {
      if (text[i] === pattern[j]) {
        i++
        j++
        if (j === pattern.length) {
          matches.push(i - j)
          j = lps[j - 1]!
        }
      } else if (j > 0) {
        j = lps[j - 1]!
      } else {
        i++
      }
    }
    return matches
  }

  static buildLPS(pattern: string): number[] {
    const lps = new Array<number>(pattern.length).fill(0)
    let len = 0
    let i = 1
    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        len++
        lps[i] = len
        i++
      } else if (len > 0) {
        len = lps[len - 1]!
      } else {
        lps[i] = 0
        i++
      }
    }
    return lps
  }

  static contains(text: string, pattern: string): boolean {
    return KnuthMorrisPratt.search(text, pattern).length > 0
  }

  static countOccurrences(text: string, pattern: string): number {
    return KnuthMorrisPratt.search(text, pattern).length
  }

  static firstOccurrence(text: string, pattern: string): number {
    const matches = KnuthMorrisPratt.search(text, pattern)
    return matches.length > 0 ? matches[0]! : -1
  }
}
