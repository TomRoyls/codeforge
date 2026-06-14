export type BlobRef2 = 'refcount' | 'gc'
export interface Blob2 {
  id: string
  hash: string
  size: number
  data: unknown
  refCount: number
  createdAt: number
  lastAccessedAt: number
  tags: string[]
}

export class BlobStore2 {
  private blobs: Map<string, Blob2> = new Map()
  private hashIndex: Map<string, string> = new Map()
  private refMode: BlobRef2 = 'refcount'
  private totalSize: number = 0
  private maxSize: number = Infinity
  private maxBlobs: number = Infinity
  private idCounter = 0
  private stats: { writes: number; reads: number; deletes: number; gcRuns: number } = { writes: 0, reads: 0, deletes: 0, gcRuns: 0 }

  private computeHash(data: unknown): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return `h${Math.abs(hash).toString(16)}`
  }

  put(data: unknown, tags: string[] = []): string {
    const hash = this.computeHash(data)
    const existing = this.hashIndex.get(hash)
    if (existing) {
      const blob = this.blobs.get(existing)!
      blob.refCount++
      blob.lastAccessedAt = Date.now()
      this.stats.writes++
      return existing
    }

    if (this.blobs.size >= this.maxBlobs || this.totalSize >= this.maxSize) {
      this.gc()
    }

    const id = `blob_${++this.idCounter}`
    const size = JSON.stringify(data).length
    const blob: Blob2 = {
      id, hash, size, data,
      refCount: 1,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      tags,
    }
    this.blobs.set(id, blob)
    this.hashIndex.set(hash, id)
    this.totalSize += size
    this.stats.writes++
    return id
  }

  get(id: string): unknown | undefined {
    const blob = this.blobs.get(id)
    if (!blob) return undefined
    blob.lastAccessedAt = Date.now()
    this.stats.reads++
    return blob.data
  }

  getByHash(hash: string): unknown | undefined {
    const id = this.hashIndex.get(hash)
    if (!id) return undefined
    return this.get(id)
  }

  has(id: string): boolean { return this.blobs.has(id) }

  ref(id: string): boolean {
    const blob = this.blobs.get(id)
    if (!blob) return false
    blob.refCount++
    return true
  }

  unref(id: string): boolean {
    const blob = this.blobs.get(id)
    if (!blob) return false
    blob.refCount--
    if (blob.refCount <= 0 && this.refMode === 'refcount') {
      this.delete(id)
    }
    return true
  }

  delete(id: string): boolean {
    const blob = this.blobs.get(id)
    if (!blob) return false
    this.totalSize -= blob.size
    this.hashIndex.delete(blob.hash)
    this.blobs.delete(id)
    this.stats.deletes++
    return true
  }

  addTag(id: string, tag: string): boolean {
    const blob = this.blobs.get(id)
    if (!blob) return false
    if (!blob.tags.includes(tag)) blob.tags.push(tag)
    return true
  }

  getByTag(tag: string): Blob2[] {
    return Array.from(this.blobs.values()).filter(b => b.tags.includes(tag))
  }

  gc(): number {
    let removed = 0
    if (this.refMode === 'refcount') {
      this.blobs.forEach((blob, id) => {
        if (blob.refCount <= 0) {
          this.delete(id)
          removed++
        }
      })
    } else {
      const threshold = Date.now() - 3600000
      this.blobs.forEach((blob, id) => {
        if (blob.lastAccessedAt < threshold) {
          this.delete(id)
          removed++
        }
      })
    }
    this.stats.gcRuns++
    return removed
  }

  setRefMode(mode: BlobRef2): this { this.refMode = mode; return this }
  setMaxSize(bytes: number): this { this.maxSize = bytes; return this }
  setMaxBlobs(count: number): this { this.maxBlobs = count; return this }

  getTotalSize(): number { return this.totalSize }
  getBlobCount(): number { return this.blobs.size }

  getDedupRatio(): number {
    if (this.stats.writes === 0) return 0
    return 1 - this.blobs.size / this.stats.writes
  }

  getStats(): { blobs: number; totalSize: number; writes: number; reads: number; deletes: number; gcRuns: number; dedupRatio: number } {
    return {
      blobs: this.blobs.size,
      totalSize: this.totalSize,
      writes: this.stats.writes,
      reads: this.stats.reads,
      deletes: this.stats.deletes,
      gcRuns: this.stats.gcRuns,
      dedupRatio: this.getDedupRatio(),
    }
  }

  count(): number { return this.blobs.size }

  toArray(): Blob2[] { return Array.from(this.blobs.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): BlobStore2 {
    const bs = new BlobStore2()
    this.blobs.forEach((b, id) => bs.blobs.set(id, { ...b, tags: [...b.tags] }))
    this.hashIndex.forEach((bid, hash) => bs.hashIndex.set(hash, bid))
    bs.totalSize = this.totalSize
    bs.idCounter = this.idCounter
    bs.refMode = this.refMode
    return bs
  }
  equals(other: unknown): boolean {
    if (!(other instanceof BlobStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.blobs.clear()
    this.hashIndex.clear()
    this.totalSize = 0
    this.idCounter = 0
    this.stats = { writes: 0, reads: 0, deletes: 0, gcRuns: 0 }
  }
}
