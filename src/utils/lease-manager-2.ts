export type LeaseState2 = 'active' | 'expired' | 'released' | 'revoked'
export type LeaseType2 = 'exclusive' | 'shared' | 'optimistic'

export interface Lease2 {
  id: string
  resource: string
  holder: string
  type: LeaseType2
  state: LeaseState2
  acquiredAt: number
  expiresAt: number
  renewals: number
  metadata: Record<string, unknown>
}

export class LeaseManager2 {
  private leases: Map<string, Lease2> = new Map()
  private resourceIndex: Map<string, Set<string>> = new Map()
  private holderIndex: Map<string, Set<string>> = new Map()
  private idCounter = 0
  private defaultTtl: number = 30000
  private listeners: Array<(event: string, lease: Lease2) => void> = []

  setDefaultTtl(ms: number): this { this.defaultTtl = ms; return this }

  acquire(resource: string, holder: string, type: LeaseType2 = 'exclusive', ttl: number = this.defaultTtl, metadata: Record<string, unknown> = {}): string | null {
    const existing = this.getForResource(resource)
    if (existing.length > 0) {
      if (type === 'exclusive' || existing.some(l => l.type === 'exclusive')) return null
    }
    const id = `lease_${++this.idCounter}`
    const lease: Lease2 = {
      id, resource, holder, type,
      state: 'active',
      acquiredAt: Date.now(),
      expiresAt: Date.now() + ttl,
      renewals: 0,
      metadata,
    }
    this.leases.set(id, lease)
    this.indexAdd(this.resourceIndex, resource, id)
    this.indexAdd(this.holderIndex, holder, id)
    this.notify('acquired', lease)
    return id
  }

  renew(id: string, ttl: number = this.defaultTtl): boolean {
    const lease = this.leases.get(id)
    if (!lease || lease.state !== 'active') return false
    lease.expiresAt = Date.now() + ttl
    lease.renewals++
    this.notify('renewed', lease)
    return true
  }

  release(id: string): boolean {
    const lease = this.leases.get(id)
    if (!lease || lease.state !== 'active') return false
    lease.state = 'released'
    this.indexRemove(this.resourceIndex, lease.resource, id)
    this.indexRemove(this.holderIndex, lease.holder, id)
    this.notify('released', lease)
    return true
  }

  revoke(id: string): boolean {
    const lease = this.leases.get(id)
    if (!lease || lease.state !== 'active') return false
    lease.state = 'revoked'
    this.indexRemove(this.resourceIndex, lease.resource, id)
    this.indexRemove(this.holderIndex, lease.holder, id)
    this.notify('revoked', lease)
    return true
  }

  expire(): string[] {
    const expired: string[] = []
    const now = Date.now()
    this.leases.forEach((lease, id) => {
      if (lease.state === 'active' && now >= lease.expiresAt) {
        lease.state = 'expired'
        this.indexRemove(this.resourceIndex, lease.resource, id)
        this.indexRemove(this.holderIndex, lease.holder, id)
        expired.push(id)
        this.notify('expired', lease)
      }
    })
    return expired
  }

  get(id: string): Lease2 | undefined { return this.leases.get(id) }

  getForResource(resource: string): Lease2[] {
    const ids = this.resourceIndex.get(resource)
    if (!ids) return []
    return Array.from(ids).map(id => this.leases.get(id)).filter(Boolean) as Lease2[]
  }

  getForHolder(holder: string): Lease2[] {
    const ids = this.holderIndex.get(holder)
    if (!ids) return []
    return Array.from(ids).map(id => this.leases.get(id)).filter(Boolean) as Lease2[]
  }

  getByState(state: LeaseState2): Lease2[] {
    return Array.from(this.leases.values()).filter(l => l.state === state)
  }

  getActive(): Lease2[] { return this.getByState('active') }
  getExpired(): Lease2[] { return this.getByState('expired') }

  canAcquire(resource: string, type: LeaseType2 = 'exclusive'): boolean {
    const existing = this.getForResource(resource)
    if (existing.length === 0) return true
    if (type === 'shared' && existing.every(l => l.type === 'shared')) return true
    return false
  }

  forceExpire(resource: string): number {
    const leases = this.getForResource(resource)
    let count = 0
    leases.forEach(l => {
      if (l.state === 'active') {
        l.state = 'expired'
        this.indexRemove(this.resourceIndex, resource, l.id)
        this.indexRemove(this.holderIndex, l.holder, l.id)
        count++
        this.notify('force-expired', l)
      }
    })
    return count
  }

  listen(fn: (event: string, lease: Lease2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, lease: Lease2): void {
    this.listeners.forEach(fn => fn(event, lease))
  }

  private indexAdd(index: Map<string, Set<string>>, key: string, id: string): void {
    if (!index.has(key)) index.set(key, new Set())
    index.get(key)!.add(id)
  }

  private indexRemove(index: Map<string, Set<string>>, key: string, id: string): void {
    const set = index.get(key)
    if (set) {
      set.delete(id)
      if (set.size === 0) index.delete(key)
    }
  }

  getStats(): { total: number; active: number; expired: number; released: number; revoked: number; resources: number; holders: number } {
    return {
      total: this.leases.size,
      active: this.getActive().length,
      expired: this.getExpired().length,
      released: this.getByState('released').length,
      revoked: this.getByState('revoked').length,
      resources: this.resourceIndex.size,
      holders: this.holderIndex.size,
    }
  }

  count(): number { return this.leases.size }

  toArray(): Lease2[] { return Array.from(this.leases.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): LeaseManager2 {
    const lm = new LeaseManager2()
    lm.defaultTtl = this.defaultTtl
    this.leases.forEach((l, id) => lm.leases.set(id, { ...l, metadata: { ...l.metadata } }))
    this.resourceIndex.forEach((set, key) => lm.resourceIndex.set(key, new Set(set)))
    this.holderIndex.forEach((set, key) => lm.holderIndex.set(key, new Set(set)))
    lm.idCounter = this.idCounter
    return lm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LeaseManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.leases.clear()
    this.resourceIndex.clear()
    this.holderIndex.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
