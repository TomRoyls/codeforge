export class BitmapIndex<T extends string | number> {
  private readonly bitmaps: Map<string, Set<number>>
  private readonly idToDoc: Map<number, T>
  private readonly docToId: Map<T, number>
  private nextId: number

  constructor() {
    this.bitmaps = new Map()
    this.idToDoc = new Map()
    this.docToId = new Map()
    this.nextId = 0
  }

  add(document: T, tags: string[]): void {
    let docId = this.docToId.get(document)
    if (docId === undefined) {
      docId = this.nextId++
      this.docToId.set(document, docId)
      this.idToDoc.set(docId, document)
    }
    for (const tag of tags) {
      let bitmap = this.bitmaps.get(tag)
      if (!bitmap) {
        bitmap = new Set<number>()
        this.bitmaps.set(tag, bitmap)
      }
      bitmap.add(docId)
    }
  }

  remove(document: T): boolean {
    const docId = this.docToId.get(document)
    if (docId === undefined) return false
    for (const bitmap of this.bitmaps.values()) {
      bitmap.delete(docId)
    }
    this.docToId.delete(document)
    this.idToDoc.delete(docId)
    return true
  }

  query(tag: string): T[] {
    const bitmap = this.bitmaps.get(tag)
    if (!bitmap) return []
    const result: T[] = []
    for (const docId of bitmap) {
      const doc = this.idToDoc.get(docId)
      if (doc !== undefined) result.push(doc)
    }
    return result
  }

  queryAnd(tags: string[]): T[] {
    if (tags.length === 0) return []
    const sets = tags.map((t) => this.bitmaps.get(t))
    if (sets.some((s) => !s || s.size === 0)) return []

    let smallest = sets[0]!
    for (let i = 1; i < sets.length; i++) {
      if (sets[i]!.size < smallest.size) smallest = sets[i]!
    }

    const result: T[] = []
    for (const docId of smallest) {
      if (sets.every((s) => s!.has(docId))) {
        const doc = this.idToDoc.get(docId)
        if (doc !== undefined) result.push(doc)
      }
    }
    return result
  }

  queryOr(tags: string[]): T[] {
    if (tags.length === 0) return []
    const union = new Set<number>()
    for (const tag of tags) {
      const bitmap = this.bitmaps.get(tag)
      if (bitmap) {
        for (const docId of bitmap) union.add(docId)
      }
    }
    const result: T[] = []
    for (const docId of union) {
      const doc = this.idToDoc.get(docId)
      if (doc !== undefined) result.push(doc)
    }
    return result
  }

  queryNot(tag: string): T[] {
    const excluded = this.bitmaps.get(tag)
    const result: T[] = []
    for (const [docId, doc] of this.idToDoc) {
      if (!excluded || !excluded.has(docId)) result.push(doc)
    }
    return result
  }

  queryAndNot(include: string[], exclude: string[]): T[] {
    const included = this.queryAnd(include)
    const excludedSet = new Set<number>()
    for (const tag of exclude) {
      const bitmap = this.bitmaps.get(tag)
      if (bitmap) {
        for (const docId of bitmap) excludedSet.add(docId)
      }
    }
    return included.filter((doc) => {
      const docId = this.docToId.get(doc)
      return docId !== undefined && !excludedSet.has(docId)
    })
  }

  getTagCount(tag: string): number {
    return this.bitmaps.get(tag)?.size ?? 0
  }

  get tags(): string[] {
    return [...this.bitmaps.keys()]
  }

  get documentCount(): number {
    return this.idToDoc.size
  }

  getDocumentsWithTag(tag: string): number {
    return this.bitmaps.get(tag)?.size ?? 0
  }

  hasTag(tag: string): boolean {
    return this.bitmaps.has(tag)
  }

  clear(): void {
    this.bitmaps.clear()
    this.idToDoc.clear()
    this.docToId.clear()
    this.nextId = 0
  }
}
