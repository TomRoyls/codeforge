export type RevisionState2 = 'draft' | 'published' | 'archived' | 'reverted'

export interface Revision2 {
  id: string
  version: number
  content: string
  author: string
  state: RevisionState2
  parentId: string | null
  createdAt: number
  message: string
  tags: string[]
  diff: Record<string, { added: number; removed: number }> | null
}

export class RevisionStore2 {
  private revisions: Map<string, Revision2> = new Map()
  private versionIndex: Map<number, string> = new Map()
  private head: string | null = null
  private idCounter = 0
  private versionCounter = 0
  private listeners: Array<(event: string, rev: Revision2) => void> = []
  private maxRevisions: number = 1000

  setMaxRevisions(n: number): this { this.maxRevisions = n; return this }

  private computeDiff(old: string, newContent: string): { added: number; removed: number } {
    const oldLines = old.split('\n')
    const newLines = newContent.split('\n')
    const oldSet = new Set(oldLines)
    const newSet = new Set(newLines)
    let added = 0, removed = 0
    newLines.forEach(l => { if (!oldSet.has(l)) added++ })
    oldLines.forEach(l => { if (!newSet.has(l)) removed++ })
    return { added, removed }
  }

  commit(content: string, author: string, message = '', tags: string[] = []): string {
    while (this.revisions.size >= this.maxRevisions) {
      const oldest = Array.from(this.revisions.values())[0]
      if (oldest) {
        this.revisions.delete(oldest.id)
        this.versionIndex.delete(oldest.version)
      }
    }

    const id = `rev_${++this.idCounter}`
    const version = ++this.versionCounter
    const parent = this.head ? this.revisions.get(this.head) : null
    const diff = parent ? this.computeDiff(parent.content, content) : null

    const revision: Revision2 = {
      id, version, content, author,
      state: 'draft',
      parentId: this.head,
      createdAt: Date.now(),
      message, tags,
      diff: diff ? { content: diff } : null,
    }
    this.revisions.set(id, revision)
    this.versionIndex.set(version, id)
    this.head = id
    this.notify('committed', revision)
    return id
  }

  publish(id: string): boolean {
    const rev = this.revisions.get(id)
    if (!rev) return false
    rev.state = 'published'
    this.notify('published', rev)
    return true
  }

  archive(id: string): boolean {
    const rev = this.revisions.get(id)
    if (!rev) return false
    rev.state = 'archived'
    this.notify('archived', rev)
    return true
  }

  revert(id: string): string | null {
    const rev = this.revisions.get(id)
    if (!rev) return null
    rev.state = 'reverted'
    const newId = this.commit(rev.content, 'system', `Revert to rev_${rev.version}`)
    const newRev = this.revisions.get(newId)!
    newRev.state = 'published'
    this.notify('reverted', rev)
    return newId
  }

  get(id: string): Revision2 | undefined { return this.revisions.get(id) }
  getByVersion(version: number): Revision2 | undefined {
    const id = this.versionIndex.get(version)
    return id ? this.revisions.get(id) : undefined
  }

  getHead(): Revision2 | null {
    return this.head ? this.revisions.get(this.head) || null : null
  }

  getHistory(limit = 50): Revision2[] {
    const revs: Revision2[] = []
    let current = this.head
    while (current && revs.length < limit) {
      const rev = this.revisions.get(current)
      if (!rev) break
      revs.push(rev)
      current = rev.parentId
    }
    return revs
  }

  getByAuthor(author: string): Revision2[] {
    return Array.from(this.revisions.values()).filter(r => r.author === author)
  }

  getByTag(tag: string): Revision2[] {
    return Array.from(this.revisions.values()).filter(r => r.tags.includes(tag))
  }

  getByState(state: RevisionState2): Revision2[] {
    return Array.from(this.revisions.values()).filter(r => r.state === state)
  }

  getChildren(parentId: string): Revision2[] {
    return Array.from(this.revisions.values()).filter(r => r.parentId === parentId)
  }

  diff(fromId: string, toId: string): { added: number; removed: number } | null {
    const from = this.revisions.get(fromId)
    const to = this.revisions.get(toId)
    if (!from || !to) return null
    return this.computeDiff(from.content, to.content)
  }

  listen(fn: (event: string, rev: Revision2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, rev: Revision2): void {
    this.listeners.forEach(fn => fn(event, rev))
  }

  getStats(): { total: number; published: number; drafts: number; archived: number; version: number } {
    return {
      total: this.revisions.size,
      published: this.getByState('published').length,
      drafts: this.getByState('draft').length,
      archived: this.getByState('archived').length,
      version: this.versionCounter,
    }
  }

  count(): number { return this.revisions.size }

  toArray(): Revision2[] { return Array.from(this.revisions.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): RevisionStore2 {
    const rs = new RevisionStore2()
    this.revisions.forEach((r, id) => rs.revisions.set(id, { ...r, tags: [...r.tags] }))
    this.versionIndex.forEach((id, v) => rs.versionIndex.set(v, id))
    rs.head = this.head
    rs.idCounter = this.idCounter
    rs.versionCounter = this.versionCounter
    rs.maxRevisions = this.maxRevisions
    return rs
  }
  equals(other: unknown): boolean {
    if (!(other instanceof RevisionStore2)) return false
    return this.versionCounter === other.versionCounter
  }
  clear(): void {
    this.revisions.clear()
    this.versionIndex.clear()
    this.head = null
    this.idCounter = 0
    this.versionCounter = 0
    this.listeners = []
  }
}
