export interface IndexEntry2 {
  key: string
  value: unknown
  fields: Record<string, unknown>
}

export class Indexer2 {
  private index: Map<string, IndexEntry2[]> = new Map()
  private documents: Map<string, IndexEntry2> = new Map()
  private indexedFields: Set<string> = new Set()

  addField(field: string): this {
    this.indexedFields.add(field)
    return this
  }

  add(doc: IndexEntry2): this {
    this.documents.set(doc.key, doc)
    for (const field of this.indexedFields) {
      const value = doc.fields[field]
      if (value === undefined) continue
      const indexKey = this.makeIndexKey(field, String(value))
      if (!this.index.has(indexKey)) {
        this.index.set(indexKey, [])
      }
      this.index.get(indexKey)!.push(doc)
    }
    return this
  }

  remove(key: string): boolean {
    const doc = this.documents.get(key)
    if (!doc) return false
    this.documents.delete(key)
    for (const field of this.indexedFields) {
      const value = doc.fields[field]
      if (value === undefined) continue
      const indexKey = this.makeIndexKey(field, String(value))
      const entries = this.index.get(indexKey)
      if (entries) {
        const filtered = entries.filter(e => e.key !== key)
        if (filtered.length === 0) {
          this.index.delete(indexKey)
        } else {
          this.index.set(indexKey, filtered)
        }
      }
    }
    return true
  }

  lookup(field: string, value: string): IndexEntry2[] {
    const indexKey = this.makeIndexKey(field, value)
    return this.index.get(indexKey) ?? []
  }

  get(key: string): IndexEntry2 | undefined {
    return this.documents.get(key)
  }

  has(key: string): boolean {
    return this.documents.has(key)
  }

  search(query: Partial<Record<string, string>>): IndexEntry2[] {
    let results: IndexEntry2[] | null = null
    for (const [field, value] of Object.entries(query)) {
      const matches = this.lookup(field, value!)
      if (results === null) {
        results = matches
      } else {
        const keys = new Set(matches.map(m => m.key))
        results = results.filter(r => keys.has(r.key))
      }
    }
    return results ?? []
  }

  getAll(): IndexEntry2[] {
    return Array.from(this.documents.values())
  }

  count(): number { return this.documents.size }

  getFields(): string[] {
    return Array.from(this.indexedFields)
  }

  getIndexSize(): number { return this.index.size }

  private makeIndexKey(field: string, value: string): string {
    return `${field}::${value}`
  }

  toArray(): IndexEntry2[] { return this.getAll() }
  toString(): string { return JSON.stringify({ docs: this.count(), fields: this.indexedFields.size }) }
  toJSON(): Record<string, unknown> { return { docs: this.count(), fields: this.getFields(), indexSize: this.index.size } }
  clone(): Indexer2 {
    const idx = new Indexer2()
    this.indexedFields.forEach(f => idx.addField(f))
    this.documents.forEach(d => idx.add(d))
    return idx
  }
  equals(other: unknown): boolean {
    if (!(other instanceof Indexer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.index.clear()
    this.documents.clear()
    this.indexedFields.clear()
  }
}
