export class SubstringCounter {
  private readonly text: string

  constructor(text: string) {
    this.text = text
  }

  countNaive(substring: string): number {
    if (substring.length === 0) return 0
    let count = 0
    let pos = 0
    while (true) {
      pos = this.text.indexOf(substring, pos)
      if (pos === -1) break
      count++
      pos++
    }
    return count
  }

  countNonOverlapping(substring: string): number {
    if (substring.length === 0) return 0
    let count = 0
    let pos = 0
    while (true) {
      pos = this.text.indexOf(substring, pos)
      if (pos === -1) break
      count++
      pos += substring.length
    }
    return count
  }

  contains(substring: string): boolean {
    return this.text.includes(substring)
  }

  countAllOf(substrings: string[]): Map<string, number> {
    const result = new Map<string, number>()
    for (const sub of substrings) {
      result.set(sub, this.countNaive(sub))
    }
    return result
  }

  countChar(character: string): number {
    if (character.length !== 1) return 0
    let count = 0
    for (const ch of this.text) {
      if (ch === character) count++
    }
    return count
  }

  get length(): number {
    return this.text.length
  }

  getText(): string {
    return this.text
  }
}
