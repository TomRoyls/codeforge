export interface ManifestEntry2 {
  id: string
  type: string
  name: string
  size: number
  checksum: string
  tags: string[]
  metadata: Record<string, unknown>
}

export class AssetManifest2 {
  private entries: Map<string, ManifestEntry2> = new Map()
  private typeIndex: Map<string, Set<string>> = new Map()
  private tagIndex: Map<string, Set<string>> = new Map()
  private maxEntries: number

  constructor(maxEntries = 100000) {
    this.maxEntries = maxEntries
  }

  add(entry: Omit<ManifestEntry2, 'tags' | 'metadata'> & { tags?: string[]; metadata?: Record<string, unknown> }): this {
    if (this.entries.size >= this.maxEntries) {
      this.evictOldest()
    }
    const full: ManifestEntry2 = {
      ...entry,
      tags: entry.tags ?? [],
      metadata: entry.metadata ?? {},
    }
    this.entries.set(entry.id, full)
    this.indexByType(full.type, full.id)
    full.tags.forEach(tag => this.indexByTag(tag, full.id))
    return this
  }

  remove(id: string): boolean {
    const entry = this.entries.get(id)
    if (!entry) return false
    this.entries.delete(id)
    this.removeFromIndex(this.typeIndex, entry.type, id)
    entry.tags.forEach(tag => this.removeFromIndex(this.tagIndex, tag, id))
    return true
  }

  get(id: string): ManifestEntry2 | undefined { return this.entries.get(id) }

  getByType(type: string): ManifestEntry2[] {
    const ids = this.typeIndex.get(type)
    if (!ids) return []
    return Array.from(ids).map(id => this.entries.get(id)).filter(Boolean) as ManifestEntry2[]
  }

  getByTag(tag: string): ManifestEntry2[] {
    const ids = this.tagIndex.get(tag)
    if (!ids) return []
    return Array.from(ids).map(id => this.entries.get(id)).filter(Boolean) as ManifestEntry2[]
  }

  getByChecksum(checksum: string): ManifestEntry2[] {
    return Array.from(this.entries.values()).filter(e => e.checksum === checksum)
  }

  getByName(name: string): ManifestEntry2[] {
    return Array.from(this.entries.values()).filter(e => e.name === name)
  }

  addTag(id: string, tag: string): boolean {
    const entry = this.entries.get(id)
    if (!entry) return false
    if (!entry.tags.includes(tag)) {
      entry.tags.push(tag)
      this.indexByTag(tag, id)
    }
    return true
  }

  removeTag(id: string, tag: string): boolean {
    const entry = this.entries.get(id)
    if (!entry) return false
    const idx = entry.tags.indexOf(tag)
    if (idx === -1) return false
    entry.tags.splice(idx, 1)
    this.removeFromIndex(this.tagIndex, tag, id)
    return true
  }

  search(query: string): ManifestEntry2[] {
    const lower = query.toLowerCase()
    return Array.from(this.entries.values()).filter(e =>
      e.name.toLowerCase().includes(lower) ||
      e.type.toLowerCase().includes(lower),
    )
  }

  getTotalSize(): number {
    let total = 0
    this.entries.forEach(e => { total += e.size })
    return total
  }

  getTypes(): string[] { return Array.from(this.typeIndex.keys()) }
  getTags(): string[] { return Array.from(this.tagIndex.keys()) }

  verifyChecksum(id: string, checksum: string): boolean {
    const entry = this.entries.get(id)
    return entry?.checksum === checksum
  }

  findDuplicates(): Map<string, string[]> {
    const byChecksum = new Map<string, string[]>()
    this.entries.forEach(e => {
      const existing = byChecksum.get(e.checksum) ?? []
      existing.push(e.id)
      byChecksum.set(e.checksum, existing)
    })
    const dups = new Map<string, string[]>()
    byChecksum.forEach((ids, checksum) => {
      if (ids.length > 1) dups.set(checksum, ids)
    })
    return dups
  }

  count(): number { return this.entries.size }

  toArray(): ManifestEntry2[] { return Array.from(this.entries.values()) }
  toString(): string { return JSON.stringify({ entries: this.count(), size: this.getTotalSize() }) }
  toJSON(): Record<string, unknown> { return { entries: this.count(), size: this.getTotalSize(), types: this.getTypes().length, tags: this.getTags().length } }
  clone(): AssetManifest2 {
    const am = new AssetManifest2(this.maxEntries)
    this.entries.forEach((entry, id) => am.entries.set(id, { ...entry, tags: [...entry.tags], metadata: { ...entry.metadata } }))
    this.typeIndex.forEach((ids, type) => am.typeIndex.set(type, new Set(ids)))
    this.tagIndex.forEach((ids, tag) => am.tagIndex.set(tag, new Set(ids)))
    return am
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AssetManifest2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries.clear()
    this.typeIndex.clear()
    this.tagIndex.clear()
  }

  private indexByType(type: string, id: string): void {
    if (!this.typeIndex.has(type)) this.typeIndex.set(type, new Set())
    this.typeIndex.get(type)!.add(id)
  }

  private indexByTag(tag: string, id: string): void {
    if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set())
    this.tagIndex.get(tag)!.add(id)
  }

  private removeFromIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    const set = index.get(key)
    if (set) {
      set.delete(id)
      if (set.size === 0) index.delete(key)
    }
  }

  private evictOldest(): void {
    const first = this.entries.keys().next()
    if (!first.done) this.remove(first.value)
  }
}
