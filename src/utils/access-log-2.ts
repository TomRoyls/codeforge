export type AccessVerdict2 = 'allow' | 'deny' | 'challenge'
export type AccessAction2 = 'read' | 'write' | 'delete' | 'create' | 'execute' | 'admin'

export interface AccessEvent2 {
  id: string
  timestamp: number
  principal: string
  action: AccessAction2
  resource: string
  verdict: AccessVerdict2
  ipAddress: string
  userAgent: string
  metadata: Record<string, unknown>
  reason: string | null
}

export class AccessLog2 {
  private events: Map<string, AccessEvent2> = new Map()
  private chronological: string[] = []
  private principalIndex: Map<string, string[]> = new Map()
  private resourceIndex: Map<string, string[]> = new Map()
  private actionIndex: Map<AccessAction2, string[]> = new Map()
  private idCounter = 0
  private maxEvents: number = 100000
  private listeners: Array<(event: string, entry: AccessEvent2) => void> = []

  setMaxEvents(n: number): this { this.maxEvents = n; return this }

  record(principal: string, action: AccessAction2, resource: string, verdict: AccessVerdict2, ipAddress = '', userAgent = '', metadata: Record<string, unknown> = {}, reason: string | null = null): string {
    const id = `acc_${++this.idCounter}`
    const event: AccessEvent2 = {
      id, principal, action, resource, verdict, ipAddress, userAgent, metadata, reason,
      timestamp: Date.now(),
    }
    this.events.set(id, event)
    this.chronological.push(id)

    if (this.chronological.length > this.maxEvents) {
      const oldest = this.chronological.shift()!
      this.events.delete(oldest)
    }

    this.indexAdd(this.principalIndex, principal, id)
    this.indexAdd(this.resourceIndex, resource, id)
    if (!this.actionIndex.has(action)) this.actionIndex.set(action, [])
    this.actionIndex.get(action)!.push(id)

    this.notify('recorded', event)
    return id
  }

  private indexAdd(index: Map<string, string[]>, key: string, id: string): void {
    if (!index.has(key)) index.set(key, [])
    index.get(key)!.push(id)
  }

  get(id: string): AccessEvent2 | undefined { return this.events.get(id) }

  getByPrincipal(principal: string): AccessEvent2[] {
    return (this.principalIndex.get(principal) || []).map(id => this.events.get(id)!).filter(Boolean)
  }

  getByResource(resource: string): AccessEvent2[] {
    return (this.resourceIndex.get(resource) || []).map(id => this.events.get(id)!).filter(Boolean)
  }

  getByAction(action: AccessAction2): AccessEvent2[] {
    return (this.actionIndex.get(action) || []).map(id => this.events.get(id)!).filter(Boolean)
  }

  getByVerdict(verdict: AccessVerdict2): AccessEvent2[] {
    return Array.from(this.events.values()).filter(e => e.verdict === verdict)
  }

  getDenied(): AccessEvent2[] { return this.getByVerdict('deny') }
  getAllowed(): AccessEvent2[] { return this.getByVerdict('allow') }

  getByTimeRange(start: number, end: number): AccessEvent2[] {
    return Array.from(this.events.values()).filter(e => e.timestamp >= start && e.timestamp <= end)
  }

  getRecent(limit = 100): AccessEvent2[] {
    return this.chronological.slice(-limit).reverse().map(id => this.events.get(id)!).filter(Boolean)
  }

  getDeniedCount(principal: string): number {
    return this.getByPrincipal(principal).filter(e => e.verdict === 'deny').length
  }

  detectAnomalies(threshold = 10): string[] {
    const denyCounts = new Map<string, number>()
    this.getDenied().forEach(e => {
      denyCounts.set(e.principal, (denyCounts.get(e.principal) || 0) + 1)
    })
    return Array.from(denyCounts.entries()).filter(([_, count]) => count >= threshold).map(([p]) => p)
  }

  listen(fn: (event: string, entry: AccessEvent2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, entry: AccessEvent2): void {
    this.listeners.forEach(fn => fn(event, entry))
  }

  getStats(): { total: number; allowed: number; denied: number; challenged: number; uniquePrincipals: number; uniqueResources: number } {
    return {
      total: this.events.size,
      allowed: this.getAllowed().length,
      denied: this.getDenied().length,
      challenged: this.getByVerdict('challenge').length,
      uniquePrincipals: this.principalIndex.size,
      uniqueResources: this.resourceIndex.size,
    }
  }

  count(): number { return this.events.size }

  toArray(): AccessEvent2[] { return this.getRecent(this.events.size) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): AccessLog2 {
    const al = new AccessLog2()
    al.maxEvents = this.maxEvents
    al.idCounter = this.idCounter
    return al
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AccessLog2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.events.clear()
    this.chronological = []
    this.principalIndex.clear()
    this.resourceIndex.clear()
    this.actionIndex.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
