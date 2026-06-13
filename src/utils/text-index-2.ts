export class TextIndex2 {
  private index = new Map<string, Set<number>>()
  private documents: string[] = []

  addDocument(text: string): number {
    const id = this.documents.length
    this.documents.push(text)
    const words = text.toLowerCase().split(/\s+/)
    for (const word of words) {
      const w = word.replace(/[^a-z0-9]/g, '')
      if (!w) continue
      if (!this.index.has(w)) this.index.set(w, new Set())
      this.index.get(w)!.add(id)
    }
    return id
  }

  search(query: string): number[] {
    const words = query.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w)
    if (words.length === 0) return []
    let result: Set<number> | null = null
    for (const word of words) {
      const docs = this.index.get(word) ?? new Set<number>()
      if (result === null) result = new Set(docs)
      else result = new Set([...result].filter(d => docs.has(d)))
    }
    return [...(result ?? [])].sort((a, b) => a - b)
  }

  getDocument(id: number): string | undefined {
    return this.documents[id]
  }

  get docCount(): number { return this.documents.length }
  get termCount(): number { return this.index.size }

  getWordFrequency(word: string): number {
    return this.index.get(word.toLowerCase().replace(/[^a-z0-9]/g, ''))?.size ?? 0
  }

  clear(): void { this.index.clear(); this.documents = [] }

  toArray(): string[] { return [...this.index.keys()] }
  toString(): string { return JSON.stringify({ docs: this.docCount, terms: this.termCount }) }
  toJSON(): Record<string, number> { return { docs: this.docCount, terms: this.termCount } }
  clone(): TextIndex2 {
    const c = new TextIndex2()
    for (const doc of this.documents) c.addDocument(doc)
    return c
  }
  equals(other: unknown): boolean { return other instanceof TextIndex2 }
}
