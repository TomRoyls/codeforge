export class KMP {
  static buildTable(pattern: string): number[] {
    const table = new Array(pattern.length).fill(0)
    let len = 0
    for (let i = 1; i < pattern.length; i++) {
      while (len > 0 && pattern[i] !== pattern[len]) {
        len = table[len - 1]!
      }
      if (pattern[i] === pattern[len]) len++
      table[i] = len
    }
    return table
  }

  static search(text: string, pattern: string): number[] {
    if (pattern.length === 0) return []
    if (text.length < pattern.length) return []
    const table = KMP.buildTable(pattern)
    const matches: number[] = []
    let j = 0
    for (let i = 0; i < text.length; i++) {
      while (j > 0 && text[i] !== pattern[j]) {
        j = table[j - 1]!
      }
      if (text[i] === pattern[j]) j++
      if (j === pattern.length) {
        matches.push(i - j + 1)
        j = table[j - 1]!
      }
    }
    return matches
  }

  static contains(text: string, pattern: string): boolean {
    return KMP.search(text, pattern).length > 0
  }

  static countOccurrences(text: string, pattern: string): number {
    return KMP.search(text, pattern).length
  }

  static findAllOverlapping(text: string, pattern: string): string[] {
    return KMP.search(text, pattern).map((i) => text.slice(i, i + pattern.length))
  }
}
