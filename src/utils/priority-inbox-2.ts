export interface InboxMessage2 {
  id: string
  subject: string
  body: string
  priority: number
  read: boolean
  starred: boolean
  timestamp: number
  from: string
  tags: string[]
}

export class PriorityInbox2 {
  private messages: Map<string, InboxMessage2> = new Map()
  private maxMessages: number

  constructor(maxMessages = 10000) {
    this.maxMessages = maxMessages
  }

  add(message: Omit<InboxMessage2, 'read' | 'starred' | 'timestamp'>): this {
    if (this.messages.size >= this.maxMessages) {
      this.evictOldest()
    }
    this.messages.set(message.id, {
      ...message,
      read: false,
      starred: false,
      timestamp: Date.now(),
    })
    return this
  }

  remove(id: string): boolean {
    return this.messages.delete(id)
  }

  get(id: string): InboxMessage2 | undefined {
    return this.messages.get(id)
  }

  markRead(id: string): boolean {
    const msg = this.messages.get(id)
    if (!msg) return false
    msg.read = true
    return true
  }

  markUnread(id: string): boolean {
    const msg = this.messages.get(id)
    if (!msg) return false
    msg.read = false
    return true
  }

  toggleStar(id: string): boolean {
    const msg = this.messages.get(id)
    if (!msg) return false
    msg.starred = !msg.starred
    return true
  }

  markAllRead(): number {
    let count = 0
    this.messages.forEach(m => {
      if (!m.read) { m.read = true; count++ }
    })
    return count
  }

  getUnread(): InboxMessage2[] {
    return this.getSorted().filter(m => !m.read)
  }

  getStarred(): InboxMessage2[] {
    return this.getSorted().filter(m => m.starred)
  }

  getByTag(tag: string): InboxMessage2[] {
    return this.getSorted().filter(m => m.tags.includes(tag))
  }

  getSorted(): InboxMessage2[] {
    return Array.from(this.messages.values())
      .sort((a, b) => {
        if (a.starred !== b.starred) return b.starred ? 1 : -1
        if (a.priority !== b.priority) return b.priority - a.priority
        return b.timestamp - a.timestamp
      })
  }

  getTop(n: number): InboxMessage2[] {
    return this.getSorted().slice(0, n)
  }

  search(query: string): InboxMessage2[] {
    const lower = query.toLowerCase()
    return this.getSorted().filter(m =>
      m.subject.toLowerCase().includes(lower) ||
      m.body.toLowerCase().includes(lower) ||
      m.from.toLowerCase().includes(lower),
    )
  }

  getUnreadCount(): number {
    let count = 0
    this.messages.forEach(m => { if (!m.read) count++ })
    return count
  }

  count(): number { return this.messages.size }

  clear(): void { this.messages.clear() }

  private evictOldest(): void {
    let oldest: InboxMessage2 | null = null
    this.messages.forEach(m => {
      if (!oldest || m.timestamp < oldest.timestamp) {
        if (!m.starred) oldest = m
      }
    })
    if (oldest) this.messages.delete(oldest.id)
  }

  toArray(): InboxMessage2[] { return this.getSorted() }
  toString(): string { return JSON.stringify({ total: this.count(), unread: this.getUnreadCount() }) }
  toJSON(): Record<string, unknown> { return { total: this.count(), unread: this.getUnreadCount(), starred: this.getStarred().length } }
  clone(): PriorityInbox2 {
    const inbox = new PriorityInbox2(this.maxMessages)
    this.messages.forEach((msg, id) => inbox.messages.set(id, { ...msg, tags: [...msg.tags] }))
    return inbox
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PriorityInbox2)) return false
    return this.count() === other.count()
  }
}
