import { Indexer2, IndexEntry2 } from './indexer-2.js'

export interface SearchResult2 {
  key: string
  score: number
  doc: IndexEntry2
}

export type Scorer2 = (doc: IndexEntry2, query: string) => number

export class SearchEngine2 {
  private indexer: Indexer2
  private scorer: Scorer2
  private documents: Map<string, string> = new Map()

  constructor(indexer?: Indexer2, scorer?: Scorer2) {
    this.indexer = indexer ?? new Indexer2()
    this.indexer.addField('text')
    this.scorer = scorer ?? this.defaultScorer
  }

  addDocument(key: string, text: string, extraFields: Record<string, unknown> = {}): this {
    this.documents.set(key, text)
    this.indexer.add({ key, value: text, fields: { text, ...extraFields } })
    return this
  }

  removeDocument(key: string): boolean {
    this.documents.delete(key)
    return this.indexer.remove(key)
  }

  search(query: string, limit = 10): SearchResult2[] {
    const terms = this.tokenize(query)
    if (terms.length === 0) return []

    const candidates = new Set<string>()
    for (const doc of this.indexer.getAll()) {
      const text = String(doc.fields.text ?? '').toLowerCase()
      for (const term of terms) {
        if (text.includes(term)) {
          candidates.add(doc.key)
          break
        }
      }
    }

    const results: SearchResult2[] = []
    for (const key of candidates) {
      const doc = this.indexer.get(key)
      if (!doc) continue
      const score = this.scorer(doc, query)
      results.push({ key, score, doc })
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  }

  searchField(field: string, value: string, limit = 10): SearchResult2[] {
    const matches = this.indexer.lookup(field, value)
    return matches.slice(0, limit).map(doc => ({
      key: doc.key,
      score: 1,
      doc,
    }))
  }

  setScorer(scorer: Scorer2): this {
    this.scorer = scorer
    return this
  }

  count(): number { return this.documents.size }

  getDocument(key: string): string | undefined {
    return this.documents.get(key)
  }

  hasDocument(key: string): boolean {
    return this.documents.has(key)
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(t => t.length > 0)
  }

  private defaultScorer: Scorer2 = (doc, query) => {
    const text = String(doc.fields.text ?? '').toLowerCase()
    const terms = this.tokenize(query)
    let score = 0
    for (const term of terms) {
      const idx = text.indexOf(term)
      if (idx >= 0) score += term.length
      if (idx === 0) score += 5
    }
    return score
  }

  toArray(): string[] { return Array.from(this.documents.keys()) }
  toString(): string { return JSON.stringify({ docs: this.count() }) }
  toJSON(): Record<string, unknown> { return { docs: this.count() } }
  clone(): SearchEngine2 {
    const se = new SearchEngine2()
    this.documents.forEach((text, key) => se.addDocument(key, text))
    return se
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SearchEngine2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.indexer.clear()
    this.documents.clear()
  }
}
