export type FieldType2 = 'text' | 'number' | 'date' | 'boolean' | 'keyword' | 'geo'
export type SortOrder2 = 'asc' | 'desc'

export interface IndexedDocument2 {
  id: string
  fields: Record<string, unknown>
  boost: number
  createdAt: number
  updatedAt: number
}

export interface SearchQuery2 {
  text: string
  filters: Array<{ field: string; value: unknown; operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' }>
  sort: Array<{ field: string; order: SortOrder2 }>
  facets: string[]
  limit: number
  offset: number
}

export interface SearchResult2 {
  doc: IndexedDocument2
  score: number
  highlights: Record<string, string[]>
}

export interface FacetBucket2 {
  field: string
  value: string
  count: number
}

export class IndexManager2 {
  private documents: Map<string, IndexedDocument2> = new Map()
  private invertedIndex: Map<string, Map<string, number>> = new Map()
  private fieldTypes: Map<string, FieldType2> = new Map()
  private analyzers: Map<string, (text: string) => string[]> = new Map()

  defineField(field: string, type: FieldType2): this {
    this.fieldTypes.set(field, type)
    return this
  }

  getFieldType(field: string): FieldType2 | undefined { return this.fieldTypes.get(field) }

  setAnalyzer(field: string, fn: (text: string) => string[]): this {
    this.analyzers.set(field, fn)
    return this
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(t => t.length > 0)
  }

  private analyze(field: string, text: string): string[] {
    const analyzer = this.analyzers.get(field)
    if (analyzer) return analyzer(text)
    return this.tokenize(text)
  }

  add(doc: Omit<IndexedDocument2, 'createdAt' | 'updatedAt'> & { createdAt?: number; updatedAt?: number }): this {
    const now = Date.now()
    const fullDoc: IndexedDocument2 = { ...doc, createdAt: doc.createdAt ?? now, updatedAt: doc.updatedAt ?? now }
    this.documents.set(doc.id, fullDoc)
    this.indexDocument(fullDoc)
    return this
  }

  private indexDocument(doc: IndexedDocument2): void {
    Object.entries(doc.fields).forEach(([field, value]) => {
      const type = this.fieldTypes.get(field)
      if (type === 'text' && typeof value === 'string') {
        const tokens = this.analyze(field, value)
        tokens.forEach(token => {
          if (!this.invertedIndex.has(token)) this.invertedIndex.set(token, new Map())
          const postings = this.invertedIndex.get(token)!
          postings.set(doc.id, (postings.get(doc.id) ?? 0) + 1)
        })
      } else if (type === 'keyword' && typeof value === 'string') {
        const token = value.toLowerCase()
        if (!this.invertedIndex.has(token)) this.invertedIndex.set(token, new Map())
        const postings = this.invertedIndex.get(token)!
        postings.set(doc.id, (postings.get(doc.id) ?? 0) + 1)
      }
    })
  }

  update(id: string, fields: Record<string, unknown>): boolean {
    const doc = this.documents.get(id)
    if (!doc) return false
    this.removeFromIndex(doc)
    doc.fields = { ...doc.fields, ...fields }
    doc.updatedAt = Date.now()
    this.indexDocument(doc)
    return true
  }

  private removeFromIndex(doc: IndexedDocument2): void {
    Object.entries(doc.fields).forEach(([field, value]) => {
      const type = this.fieldTypes.get(field)
      if (type === 'text' && typeof value === 'string') {
        const tokens = this.analyze(field, value)
        tokens.forEach(token => {
          this.invertedIndex.get(token)?.delete(doc.id)
        })
      } else if (type === 'keyword' && typeof value === 'string') {
        this.invertedIndex.get(value.toLowerCase())?.delete(doc.id)
      }
    })
  }

  remove(id: string): boolean {
    const doc = this.documents.get(id)
    if (!doc) return false
    this.removeFromIndex(doc)
    return this.documents.delete(id)
  }

  get(id: string): IndexedDocument2 | undefined { return this.documents.get(id) }

  search(query: Partial<SearchQuery2>): SearchResult2[] {
    const text = query.text ?? ''
    const limit = query.limit ?? 10
    const offset = query.offset ?? 0
    const tokens = this.tokenize(text)
    const scores: Map<string, number> = new Map()

    if (tokens.length === 0) {
      this.documents.forEach((doc, id) => scores.set(id, doc.boost))
    } else {
      tokens.forEach(token => {
        const postings = this.invertedIndex.get(token)
        if (postings) {
          postings.forEach((freq, docId) => {
            const doc = this.documents.get(docId)
            if (doc) {
              const tf = freq / Math.max(1, this.tokenize(String(Object.values(doc.fields).join(' '))).length)
              const idf = Math.log(1 + this.documents.size / postings.size)
              const score = tf * idf * doc.boost
              scores.set(docId, (scores.get(docId) ?? 0) + score)
            }
          })
        }
      })
    }

    let results: SearchResult2[] = Array.from(scores.entries())
      .map(([docId, score]) => ({
        doc: this.documents.get(docId)!,
        score,
        highlights: {},
      }))

    if (query.filters) {
      results = results.filter(r => this.matchFilters(r.doc, query.filters!))
    }

    if (query.sort) {
      query.sort.forEach(s => {
        results.sort((a, b) => {
          const av = a.doc.fields[s.field]
          const bv = b.doc.fields[s.field]
          if (typeof av === 'number' && typeof bv === 'number') {
            return s.order === 'asc' ? av - bv : bv - av
          }
          return 0
        })
      })
    } else {
      results.sort((a, b) => b.score - a.score)
    }

    results = results.slice(offset, offset + limit)
    return results
  }

  private matchFilters(doc: IndexedDocument2, filters: NonNullable<SearchQuery2['filters']>): boolean {
    return filters.every(f => {
      const value = doc.fields[f.field]
      switch (f.operator) {
        case 'eq': return value === f.value
        case 'ne': return value !== f.value
        case 'gt': return typeof value === 'number' && typeof f.value === 'number' && value > f.value
        case 'lt': return typeof value === 'number' && typeof f.value === 'number' && value < f.value
        case 'gte': return typeof value === 'number' && typeof f.value === 'number' && value >= f.value
        case 'lte': return typeof value === 'number' && typeof f.value === 'number' && value <= f.value
        case 'in': return Array.isArray(f.value) && f.value.includes(value)
        default: return false
      }
    })
  }

  aggregate(field: string): FacetBucket2[] {
    const buckets: Map<string, number> = new Map()
    this.documents.forEach(doc => {
      const value = doc.fields[field]
      if (value !== undefined) {
        const key = String(value)
        buckets.set(key, (buckets.get(key) ?? 0) + 1)
      }
    })
    return Array.from(buckets.entries())
      .map(([value, count]) => ({ field, value, count }))
      .sort((a, b) => b.count - a.count)
  }

  getTermFrequency(term: string): number {
    return this.invertedIndex.get(term.toLowerCase())?.size ?? 0
  }

  getDocumentFrequency(term: string): number {
    return this.invertedIndex.get(term.toLowerCase())?.size ?? 0
  }

  getIndexedTerms(): string[] { return Array.from(this.invertedIndex.keys()) }
  getTermCount(): number { return this.invertedIndex.size }

  getStats(): { documents: number; terms: number; fields: number } {
    return { documents: this.documents.size, terms: this.invertedIndex.size, fields: this.fieldTypes.size }
  }

  count(): number { return this.documents.size }

  toArray(): IndexedDocument2[] { return Array.from(this.documents.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): IndexManager2 {
    const im = new IndexManager2()
    this.documents.forEach((d, id) => im.documents.set(id, { ...d, fields: { ...d.fields } }))
    this.fieldTypes.forEach((t, f) => im.fieldTypes.set(f, t))
    return im
  }
  equals(other: unknown): boolean {
    if (!(other instanceof IndexManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.documents.clear()
    this.invertedIndex.clear()
    this.fieldTypes.clear()
    this.analyzers.clear()
  }
}
