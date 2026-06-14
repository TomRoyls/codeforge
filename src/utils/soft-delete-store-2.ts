export interface Tombstone2<T = unknown> {
  id: string
  key: string
  value: T
  deletedAt: number
  reason: string
  restorable: boolean
  ttl: number | null
}

export class SoftDeleteStore2<T = unknown> {
  private data: Map<string, T> = new Map()
  private tombstones: Map<string, Tombstone2<T>> = new Map()
  private idCounter = 0
  private defaultTtl: number | null

  constructor(defaultTtl: number | null = 86400000) {
    this.defaultTtl = defaultTtl
  }

  set(key: string, value: T): this {
    this.data.set(key, value)
    return this
  }

  get(key: string): T | undefined { return this.data.get(key) }

  has(key: string): boolean { return this.data.has(key) }

  softDelete(key: string, reason = '', restorable = true): boolean {
    const value = this.data.get(key)
    if (value === undefined) return false
    const id = `tomb_${++this.idCounter}`
    this.tombstones.set(id, {
      id, key, value,
      deletedAt: Date.now(),
      reason,
      restorable,
      ttl: this.defaultTtl,
    })
    this.data.delete(key)
    return true
  }

  restore(tombstoneId: string): boolean {
    const tomb = this.tombstones.get(tombstoneId)
    if (!tomb || !tomb.restorable) return false
    if (tomb.ttl !== null && Date.now() - tomb.deletedAt > tomb.ttl) return false
    this.data.set(tomb.key, tomb.value)
    this.tombstones.delete(tombstoneId)
    return true
  }

  hardDelete(tombstoneId: string): boolean {
    return this.tombstones.delete(tombstoneId)
  }

  purgeExpired(): number {
    let purged = 0
    const now = Date.now()
    this.tombstones.forEach((tomb, id) => {
      if (tomb.ttl !== null && now - tomb.deletedAt > tomb.ttl) {
        this.tombstones.delete(id)
        purged++
      }
    })
    return purged
  }

  getTombstone(id: string): Tombstone2<T> | undefined { return this.tombstones.get(id) }

  getTombstonesByKey(key: string): Tombstone2<T>[] {
    return Array.from(this.tombstones.values()).filter(t => t.key === key)
  }

  getAllTombstones(): Tombstone2<T>[] { return Array.from(this.tombstones.values()) }

  getRestorable(): Tombstone2<T>[] {
    const now = Date.now()
    return Array.from(this.tombstones.values()).filter(t => {
      if (!t.restorable) return false
      if (t.ttl !== null && now - t.deletedAt > t.ttl) return false
      return true
    })
  }

  getExpired(): Tombstone2<T>[] {
    const now = Date.now()
    return Array.from(this.tombstones.values()).filter(t =>
      t.ttl !== null && now - t.deletedAt > t.ttl,
    )
  }

  keys(): string[] { return Array.from(this.data.keys()) }
  values(): T[] { return Array.from(this.data.values()) }

  count(): number { return this.data.size }
  getTombstoneCount(): number { return this.tombstones.size }

  setDefaultTtl(ttl: number | null): this { this.defaultTtl = ttl; return this }
  getDefaultTtl(): number | null { return this.defaultTtl }

  toArray(): string[] { return Array.from(this.data.keys()) }
  toString(): string { return JSON.stringify({ active: this.count(), tombstones: this.getTombstoneCount() }) }
  toJSON(): Record<string, unknown> { return { active: this.count(), tombstones: this.getTombstoneCount(), restorable: this.getRestorable().length } }
  clone(): SoftDeleteStore2<T> {
    const s = new SoftDeleteStore2<T>(this.defaultTtl)
    this.data.forEach((v, k) => s.data.set(k, v))
    this.tombstones.forEach((t, id) => s.tombstones.set(id, { ...t }))
    s.idCounter = this.idCounter
    return s
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SoftDeleteStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.data.clear()
    this.tombstones.clear()
    this.idCounter = 0
  }
}
