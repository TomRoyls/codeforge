export class Autocomplete2 {
  private root = new Map<string, string[]>()
  private suggestions: string[] = []

  addWord(word: string): void {
    this.suggestions.push(word)
    for (let i = 1; i <= word.length; i++) {
      const prefix = word.substring(0, i).toLowerCase()
      if (!this.root.has(prefix)) this.root.set(prefix, [])
      if (!this.root.get(prefix)!.includes(word)) this.root.get(prefix)!.push(word)
    }
  }

  removeWord(word: string): boolean {
    const idx = this.suggestions.indexOf(word)
    if (idx === -1) return false
    this.suggestions.splice(idx, 1)
    for (let i = 1; i <= word.length; i++) {
      const prefix = word.substring(0, i).toLowerCase()
      const arr = this.root.get(prefix)
      if (arr) {
        const wIdx = arr.indexOf(word)
        if (wIdx !== -1) arr.splice(wIdx, 1)
        if (arr.length === 0) this.root.delete(prefix)
      }
    }
    return true
  }

  suggest(prefix: string, maxResults = 10): string[] {
    const results = this.root.get(prefix.toLowerCase()) ?? []
    return results.slice(0, maxResults)
  }

  get wordCount(): number { return this.suggestions.length }

  clear(): void { this.root.clear(); this.suggestions = [] }

  toArray(): string[] { return [...this.suggestions] }
  toString(): string { return JSON.stringify({ words: this.wordCount }) }
  toJSON(): Record<string, number> { return { words: this.wordCount } }
  clone(): Autocomplete2 {
    const c = new Autocomplete2()
    for (const w of this.suggestions) c.addWord(w)
    return c
  }
  equals(other: unknown): boolean { return other instanceof Autocomplete2 }
}
