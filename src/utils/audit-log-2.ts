export type AuditLevel2 = 'info' | 'warning' | 'error' | 'critical'

export interface AuditEntry2 {
  id: number
  level: AuditLevel2
  action: string
  actor: string
  resource: string
  details: Record<string, unknown>
  timestamp: number
}

export class AuditLog2 {
  private entries: AuditEntry2[] = []
  private idCounter = 0
  private maxEntries: number
  private filters: Map<string, Set<string>> = new Map()

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries
  }

  log(level: AuditLevel2, action: string, actor: string, resource: string, details: Record<string, unknown> = {}): this {
    const entry: AuditEntry2 = {
      id: ++this.idCounter,
      level, action, actor, resource, details,
      timestamp: Date.now(),
    }
    this.entries.push(entry)
    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }
    return this
  }

  info(action: string, actor: string, resource: string, details?: Record<string, unknown>): this {
    return this.log('info', action, actor, resource, details)
  }

  warning(action: string, actor: string, resource: string, details?: Record<string, unknown>): this {
    return this.log('warning', action, actor, resource, details)
  }

  error(action: string, actor: string, resource: string, details?: Record<string, unknown>): this {
    return this.log('error', action, actor, resource, details)
  }

  critical(action: string, actor: string, resource: string, details?: Record<string, unknown>): this {
    return this.log('critical', action, actor, resource, details)
  }

  getByLevel(level: AuditLevel2): AuditEntry2[] {
    return this.entries.filter(e => e.level === level)
  }

  getByActor(actor: string): AuditEntry2[] {
    return this.entries.filter(e => e.actor === actor)
  }

  getByResource(resource: string): AuditEntry2[] {
    return this.entries.filter(e => e.resource === resource)
  }

  getByAction(action: string): AuditEntry2[] {
    return this.entries.filter(e => e.action === action)
  }

  getByTimeRange(start: number, end: number): AuditEntry2[] {
    return this.entries.filter(e => e.timestamp >= start && e.timestamp <= end)
  }

  search(query: string): AuditEntry2[] {
    const lower = query.toLowerCase()
    return this.entries.filter(e =>
      e.action.toLowerCase().includes(lower) ||
      e.actor.toLowerCase().includes(lower) ||
      e.resource.toLowerCase().includes(lower),
    )
  }

  getEntry(id: number): AuditEntry2 | undefined {
    return this.entries.find(e => e.id === id)
  }

  getRecent(n: number): AuditEntry2[] {
    return this.entries.slice(-n)
  }

  getAll(): AuditEntry2[] { return [...this.entries] }
  count(): number { return this.entries.length }

  getStats(): Record<AuditLevel2, number> {
    const stats: Record<AuditLevel2, number> = { info: 0, warning: 0, error: 0, critical: 0 }
    this.entries.forEach(e => { stats[e.level]++ })
    return stats
  }

  addFilter(key: string, value: string): this {
    if (!this.filters.has(key)) this.filters.set(key, new Set())
    this.filters.get(key)!.add(value)
    return this
  }

  getFiltered(): AuditEntry2[] {
    let result = [...this.entries]
    this.filters.forEach((values, key) => {
      result = result.filter(e => {
        const val = (e as unknown as Record<string, unknown>)[key]
        return typeof val === 'string' && values.has(val)
      })
    })
    return result
  }

  removeFilter(key: string): this {
    this.filters.delete(key)
    return this
  }

  clearFilters(): this {
    this.filters.clear()
    return this
  }

  toArray(): AuditEntry2[] { return [...this.entries] }
  toString(): string { return JSON.stringify({ entries: this.count() }) }
  toJSON(): Record<string, unknown> { return { entries: this.count(), stats: this.getStats() } }
  clone(): AuditLog2 {
    const al = new AuditLog2(this.maxEntries)
    al.entries = [...this.entries]
    al.idCounter = this.idCounter
    return al
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AuditLog2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries = []
    this.idCounter = 0
    this.filters.clear()
  }
}
