export type ResourceType2 = 'cpu' | 'memory' | 'disk' | 'network' | 'gpu' | 'custom'
export type AllocationState2 = 'granted' | 'denied' | 'pending' | 'released' | 'expired'

export interface ResourceAllocation2 {
  id: string
  consumer: string
  type: ResourceType2
  requested: number
  granted: number
  priority: number
  state: AllocationState2
  timestamp: number
  expiresAt: number | null
  metadata: Record<string, unknown>
}

export interface ResourcePool2 {
  type: ResourceType2
  capacity: number
  allocated: number
  reserved: number
}

export class ResourceGovernor2 {
  private pools: Map<ResourceType2, ResourcePool2> = new Map()
  private allocations: Map<string, ResourceAllocation2> = new Map()
  private pending: string[] = []
  private listeners: Array<(event: string, allocation: ResourceAllocation2) => void> = []
  private idCounter = 0
  private defaultExpiry: number = 3600000
  private fairShare: boolean = true

  setDefaultExpiry(ms: number): this { this.defaultExpiry = ms; return this }
  setFairShare(enabled: boolean): this { this.fairShare = enabled; return this }

  register(type: ResourceType2, capacity: number): this {
    this.pools.set(type, { type, capacity, allocated: 0, reserved: 0 })
    return this
  }

  setCapacity(type: ResourceType2, capacity: number): boolean {
    const pool = this.pools.get(type)
    if (!pool) return false
    pool.capacity = capacity
    return true
  }

  request(consumer: string, type: ResourceType2, amount: number, priority: number = 0, metadata: Record<string, unknown> = {}): ResourceAllocation2 | null {
    const pool = this.pools.get(type)
    if (!pool) return null

    const id = `alloc_${++this.idCounter}`
    const allocation: ResourceAllocation2 = {
      id, consumer, type,
      requested: amount,
      granted: 0,
      priority,
      state: 'pending',
      timestamp: Date.now(),
      expiresAt: null,
      metadata,
    }

    const available = pool.capacity - pool.allocated - pool.reserved
    if (available >= amount) {
      allocation.granted = amount
      allocation.state = 'granted'
      allocation.expiresAt = Date.now() + this.defaultExpiry
      pool.allocated += amount
      this.notify('granted', allocation)
    } else if (this.fairShare && available > 0) {
      allocation.granted = available
      allocation.state = 'granted'
      allocation.expiresAt = Date.now() + this.defaultExpiry
      pool.allocated += available
      this.notify('partial', allocation)
    } else {
      allocation.state = 'denied'
      allocation.granted = 0
      this.pending.push(id)
      this.notify('denied', allocation)
    }

    this.allocations.set(id, allocation)
    return allocation
  }

  release(id: string): boolean {
    const allocation = this.allocations.get(id)
    if (!allocation) return false
    const pool = this.pools.get(allocation.type)
    if (!pool) return false

    pool.allocated = Math.max(0, pool.allocated - allocation.granted)
    allocation.state = 'released'
    this.notify('released', allocation)
    this.processPending(allocation.type)
    return true
  }

  reserve(type: ResourceType2, amount: number): boolean {
    const pool = this.pools.get(type)
    if (!pool) return false
    if (pool.capacity - pool.allocated - pool.reserved < amount) return false
    pool.reserved += amount
    return true
  }

  releaseReservation(type: ResourceType2, amount: number): boolean {
    const pool = this.pools.get(type)
    if (!pool) return false
    pool.reserved = Math.max(0, pool.reserved - amount)
    return true
  }

  private processPending(type: ResourceType2): void {
    const stillPending: string[] = []
    for (const id of this.pending) {
      const allocation = this.allocations.get(id)
      if (!allocation || allocation.type !== type) { stillPending.push(id); continue }
      const pool = this.pools.get(type)!
      const available = pool.capacity - pool.allocated - pool.reserved
      if (available >= allocation.requested) {
        allocation.granted = allocation.requested
        allocation.state = 'granted'
        allocation.expiresAt = Date.now() + this.defaultExpiry
        pool.allocated += allocation.requested
        this.notify('granted', allocation)
      } else {
        stillPending.push(id)
      }
    }
    this.pending = stillPending
  }

  expire(allocId: string): boolean {
    const allocation = this.allocations.get(allocId)
    if (!allocation || allocation.state !== 'granted') return false
    if (!allocation.expiresAt || Date.now() < allocation.expiresAt) return false
    return this.release(allocId)
  }

  sweepExpired(): number {
    let count = 0
    this.allocations.forEach(a => {
      if (a.state === 'granted' && a.expiresAt && Date.now() >= a.expiresAt) {
        if (this.release(a.id)) count++
      }
    })
    return count
  }

  get(id: string): ResourceAllocation2 | undefined { return this.allocations.get(id) }
  getPool(type: ResourceType2): ResourcePool2 | undefined { return this.pools.get(type) }
  getByConsumer(consumer: string): ResourceAllocation2[] { return Array.from(this.allocations.values()).filter(a => a.consumer === consumer && a.state === 'granted') }
  getByType(type: ResourceType2): ResourceAllocation2[] { return Array.from(this.allocations.values()).filter(a => a.type === type && a.state === 'granted') }
  getPending(): ResourceAllocation2[] { return this.pending.map(id => this.allocations.get(id)!).filter(Boolean) }

  getUtilization(type: ResourceType2): number {
    const pool = this.pools.get(type)
    if (!pool || pool.capacity === 0) return 0
    return pool.allocated / pool.capacity
  }

  getTotalAllocated(type: ResourceType2): number {
    return this.getByType(type).reduce((sum, a) => sum + a.granted, 0)
  }

  listen(fn: (event: string, allocation: ResourceAllocation2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, allocation: ResourceAllocation2): void {
    this.listeners.forEach(fn => fn(event, allocation))
  }

  getStats(): { pools: number; allocations: number; pending: number; granted: number } {
    return {
      pools: this.pools.size,
      allocations: this.allocations.size,
      pending: this.pending.length,
      granted: Array.from(this.allocations.values()).filter(a => a.state === 'granted').length,
    }
  }

  count(): number { return this.allocations.size }

  toArray(): ResourceAllocation2[] { return Array.from(this.allocations.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ResourceGovernor2 {
    const rg = new ResourceGovernor2()
    rg.idCounter = this.idCounter
    return rg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ResourceGovernor2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.pools.clear()
    this.allocations.clear()
    this.pending = []
    this.listeners = []
    this.idCounter = 0
  }
}
