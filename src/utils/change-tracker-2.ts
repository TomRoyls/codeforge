export type ChangeType2 = 'create' | 'update' | 'delete' | 'move' | 'rename'
export type ChangeStatus2 = 'pending' | 'applied' | 'reverted' | 'conflicted'

export interface Change2 {
  id: string
  path: string
  type: ChangeType2
  oldValue: unknown
  newValue: unknown
  status: ChangeStatus2
  timestamp: number
  author: string
  message: string
  tags: string[]
}

export class ChangeTracker2 {
  private changes: Map<string, Change2> = new Map()
  private pathIndex: Map<string, string[]> = new Map()
  private authorIndex: Map<string, string[]> = new Map()
  private idCounter = 0
  private batchSize: number = 50

  record(path: string, type: ChangeType2, oldValue: unknown, newValue: unknown, author = '', message = '', tags: string[] = []): string {
    const id = `chg_${++this.idCounter}`
    const change: Change2 = {
      id, path, type, oldValue, newValue,
      status: 'pending', timestamp: Date.now(),
      author, message, tags,
    }
    this.changes.set(id, change)
    if (!this.pathIndex.has(path)) this.pathIndex.set(path, [])
    this.pathIndex.get(path)!.push(id)
    if (author && !this.authorIndex.has(author)) this.authorIndex.set(author, [])
    if (author) this.authorIndex.get(author)!.push(id)
    return id
  }

  get(id: string): Change2 | undefined { return this.changes.get(id) }

  getByPath(path: string): Change2[] {
    return (this.pathIndex.get(path) ?? []).map(id => this.changes.get(id)!).filter(Boolean)
  }

  getByAuthor(author: string): Change2[] {
    return (this.authorIndex.get(author) ?? []).map(id => this.changes.get(id)!).filter(Boolean)
  }

  getByType(type: ChangeType2): Change2[] {
    return Array.from(this.changes.values()).filter(c => c.type === type)
  }

  getByStatus(status: ChangeStatus2): Change2[] {
    return Array.from(this.changes.values()).filter(c => c.status === status)
  }

  getByTag(tag: string): Change2[] {
    return Array.from(this.changes.values()).filter(c => c.tags.includes(tag))
  }

  markApplied(id: string): boolean {
    const change = this.changes.get(id)
    if (!change || change.status !== 'pending') return false
    change.status = 'applied'
    return true
  }

  markReverted(id: string): boolean {
    const change = this.changes.get(id)
    if (!change || change.status !== 'applied') return false
    change.status = 'reverted'
    return true
  }

  markConflicted(id: string): boolean {
    const change = this.changes.get(id)
    if (!change) return false
    change.status = 'conflicted'
    return true
  }

  getLatest(path: string): Change2 | undefined {
    const changes = this.getByPath(path)
    return changes.length > 0 ? changes[changes.length - 1] : undefined
  }

  getHistory(path: string, limit = 50): Change2[] {
    return this.getByPath(path).slice(-limit)
  }

  getConflictedPaths(): string[] {
    return Array.from(new Set(this.getByStatus('conflicted').map(c => c.path)))
  }

  getChangedPaths(): string[] {
    return Array.from(this.pathIndex.keys())
  }

  diff(oldId: string, newId: string): { type: ChangeType2; from: unknown; to: unknown } | null {
    const old = this.changes.get(oldId)
    const newC = this.changes.get(newId)
    if (!old || !newC) return null
    return { type: newC.type, from: old.newValue, to: newC.newValue }
  }

  batch(paths: string[], applyFn: (changes: Change2[]) => void): number {
    let applied = 0
    paths.forEach(path => {
      const changes = this.getByPath(path).filter(c => c.status === 'pending')
      if (changes.length > 0) {
        applyFn(changes)
        changes.forEach(c => this.markApplied(c.id))
        applied += changes.length
      }
    })
    return applied
  }

  revert(id: string): Change2 | null {
    const change = this.changes.get(id)
    if (!change) return null
    const revertChange = this.record(change.path, change.type === 'create' ? 'delete' : 'update', change.newValue, change.oldValue, change.author, `Revert: ${change.message}`, change.tags)
    change.status = 'reverted'
    return this.changes.get(revertChange) ?? null
  }

  compact(beforeTimestamp: number): number {
    let removed = 0
    this.changes.forEach((change, id) => {
      if (change.timestamp < beforeTimestamp && (change.status === 'applied' || change.status === 'reverted')) {
        this.changes.delete(id)
        const pathChanges = this.pathIndex.get(change.path)
        if (pathChanges) {
          const idx = pathChanges.indexOf(id)
          if (idx >= 0) pathChanges.splice(idx, 1)
          if (pathChanges.length === 0) this.pathIndex.delete(change.path)
        }
        removed++
      }
    })
    return removed
  }

  getStats(): { total: number; pending: number; applied: number; reverted: number; conflicted: number; paths: number } {
    return {
      total: this.changes.size,
      pending: this.getByStatus('pending').length,
      applied: this.getByStatus('applied').length,
      reverted: this.getByStatus('reverted').length,
      conflicted: this.getByStatus('conflicted').length,
      paths: this.pathIndex.size,
    }
  }

  count(): number { return this.changes.size }

  toArray(): Change2[] { return Array.from(this.changes.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ChangeTracker2 {
    const ct = new ChangeTracker2()
    this.changes.forEach((c, id) => ct.changes.set(id, { ...c, tags: [...c.tags] }))
    this.pathIndex.forEach((ids, path) => ct.pathIndex.set(path, [...ids]))
    this.authorIndex.forEach((ids, author) => ct.authorIndex.set(author, [...ids]))
    ct.idCounter = this.idCounter
    return ct
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ChangeTracker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.changes.clear()
    this.pathIndex.clear()
    this.authorIndex.clear()
    this.idCounter = 0
  }
}
