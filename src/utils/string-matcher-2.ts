export class StringMatcher2 {
  private text: string

  constructor(text: string) {
    this.text = text
  }

  indexOf(pattern: string): number { return this.text.indexOf(pattern) }
  lastIndexOf(pattern: string): number { return this.text.lastIndexOf(pattern) }
  contains(pattern: string): boolean { return this.text.includes(pattern) }
  countOccurrences(pattern: string): number {
    if (pattern.length === 0) return 0
    let count = 0
    let idx = 0
    while ((idx = this.text.indexOf(pattern, idx)) !== -1) { count++; idx += pattern.length }
    return count
  }
  startsWith(prefix: string): boolean { return this.text.startsWith(prefix) }
  endsWith(suffix: string): boolean { return this.text.endsWith(suffix) }
  replaceAll(pattern: string, replacement: string): string { return this.text.split(pattern).join(replacement) }
  split(pattern: string): string[] { return this.text.split(pattern) }

  get length(): number { return this.text.length }
  get isEmpty(): boolean { return this.text.length === 0 }

  toArray(): string[] { return [this.text] }
  toString(): string { return JSON.stringify({ length: this.text.length }) }
  toJSON(): Record<string, number> { return { length: this.text.length } }

  clone(): StringMatcher2 { return new StringMatcher2(this.text) }

  equals(other: unknown): boolean {
    if (!(other instanceof StringMatcher2)) return false
    return this.length === other.length
  }
}
