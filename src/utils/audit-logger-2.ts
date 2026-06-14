export type AuditCategory2 = 'auth' | 'access' | 'config' | 'data' | 'security' | 'system' | 'api'
export type AuditSeverity2 = 'info' | 'low' | 'medium' | 'high' | 'critical'

export interface AuditEntry2 {
  id: string
  category: AuditCategory2
  severity: AuditSeverity2
  actor: string
  action: string
  resource: string
  timestamp: number
  ip: string | null
  userAgent: string | null
  before: unknown
  after: unknown
  metadata: Record<string, unknown>
  hash: string
}

export interface AuditQuery2 {
  category?: AuditCategory2
  severity?: AuditSeverity2
  actor?: string
  resource?: string
  startTime?: number
  endTime?: number
  limit?: number
}

export class AuditLogger2 {
  private entries: AuditEntry2[] = []
  private listeners: Array<(entry: AuditEntry2) => void> = []
  private idCounter = 0
  private maxEntries: number = 100000
  private tamperCheck: boolean = true
  private lastHash: string = 'genesis'

  setMaxEntries(n: number): this { this.maxEntries = n; return this }
  setTamperCheck(enabled: boolean): this { this.tamperCheck = enabled; return this }

  log(
    category: AuditCategory2,
    severity: AuditSeverity2,
    actor: string,
    action: string,
    resource: string,
    options: Partial<{
      ip: string | null
      userAgent: string | null
      before: unknown
      after: unknown
      metadata: Record<string, unknown>
    }> = {}
  ): AuditEntry2 {
    const id = `audit_${++this.idCounter}`
    const entry: AuditEntry2 = {
      id, category, severity, actor, action, resource,
      timestamp: Date.now(),
      ip: options.ip ?? null,
      userAgent: options.userAgent ?? null,
      before: options.before ?? null,
      after: options.after ?? null,
      metadata: options.metadata ?? {},
      hash: '',
    }
    entry.hash = this.computeHash(entry)
    this.entries.push(entry)
    if (this.entries.length > this.maxEntries) this.entries.shift()
    this.lastHash = entry.hash
    this.listeners.forEach(fn => fn(entry))
    return entry
  }

  private computeHash(entry: AuditEntry2): string {
    const prevHash = this.lastHash
    const data = `${prevHash}:${entry.id}:${entry.category}:${entry.action}:${entry.actor}:${entry.timestamp}`
    let h = 0
    for (let i = 0; i < data.length; i++) {
      h = ((h << 5) - h + data.charCodeAt(i)) | 0
    }
    return `h_${Math.abs(h).toString(16)}`
  }

  verify(): boolean {
    if (!this.tamperCheck) return true
    let prevHash = 'genesis'
    for (const entry of this.entries) {
      const expectedHash = this.computeHashWithPrev(entry, prevHash)
      if (entry.hash !== expectedHash) return false
      prevHash = entry.hash
    }
    return true
  }

  private computeHashWithPrev(entry: AuditEntry2, prevHash: string): string {
    const data = `${prevHash}:${entry.id}:${entry.category}:${entry.action}:${entry.actor}:${entry.timestamp}`
    let h = 0
    for (let i = 0; i < data.length; i++) {
      h = ((h << 5) - h + data.charCodeAt(i)) | 0
    }
    return `h_${Math.abs(h).toString(16)}`
  }

  query(q: AuditQuery2 = {}): AuditEntry2[] {
    let results = [...this.entries]

    if (q.category) results = results.filter(e => e.category === q.category)
    if (q.severity) results = results.filter(e => e.severity === q.severity)
    if (q.actor) results = results.filter(e => e.actor === q.actor)
    if (q.resource) results = results.filter(e => e.resource === q.resource)
    if (q.startTime !== undefined) results = results.filter(e => e.timestamp >= q.startTime!)
    if (q.endTime !== undefined) results = results.filter(e => e.timestamp <= q.endTime!)

    results.sort((a, b) => b.timestamp - a.timestamp)
    if (q.limit) results = results.slice(0, q.limit)
    return results
  }

  getByActor(actor: string): AuditEntry2[] { return this.query({ actor }) }
  getByCategory(category: AuditCategory2): AuditEntry2[] { return this.query({ category }) }
  getByResource(resource: string): AuditEntry2[] { return this.query({ resource }) }
  getBySeverity(severity: AuditSeverity2): AuditEntry2[] { return this.query({ severity }) }
  getById(id: string): AuditEntry2 | undefined { return this.entries.find(e => e.id === id) }

  getByTimeRange(start: number, end: number): AuditEntry2[] {
    return this.query({ startTime: start, endTime: end })
  }

  countByCategory(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.entries.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1 })
    return counts
  }

  countBySeverity(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.entries.forEach(e => { counts[e.severity] = (counts[e.severity] || 0) + 1 })
    return counts
  }

  countByActor(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.entries.forEach(e => { counts[e.actor] = (counts[e.actor] || 0) + 1 })
    return counts
  }

  listen(fn: (entry: AuditEntry2) => void): this {
    this.listeners.push(fn)
    return this
  }

  getStats(): { total: number; categories: number; severities: Record<string, number>; verified: boolean } {
    return {
      total: this.entries.length,
      categories: Object.keys(this.countByCategory()).length,
      severities: this.countBySeverity(),
      verified: this.verify(),
    }
  }

  count(): number { return this.entries.length }

  toArray(): AuditEntry2[] { return [...this.entries] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): AuditLogger2 {
    const al = new AuditLogger2()
    al.idCounter = this.idCounter
    al.maxEntries = this.maxEntries
    al.tamperCheck = this.tamperCheck
    return al
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AuditLogger2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries = []
    this.listeners = []
    this.idCounter = 0
    this.lastHash = 'genesis'
  }
}
