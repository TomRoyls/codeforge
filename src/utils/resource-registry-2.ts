export type ResourceState2 = 'idle' | 'acquired' | 'released' | 'destroyed'
export type ResourceType2 = 'connection' | 'file-handle' | 'thread' | 'socket' | 'custom'

export interface Resource2 {
  id: string
  type: ResourceType2
  state: ResourceState2
  createdAt: number
  acquiredAt: number | null
  releasedAt: number | null
  acquiredBy: string | null
  acquireCount: number
  totalActiveTime: number
  metadata: Record<string, unknown>
}

export interface ResourceFactory2 {
  create: () => unknown
  destroy: (resource: unknown) => void
  validate: (resource: unknown) => boolean
}

export class ResourceRegistry2 {
  private resources: Map<string, Resource2> = new Map()
  private handles: Map<string, unknown> = new Map()
  private factory: ResourceFactory2 | null = null
  private idCounter = 0
  private listeners: Array<(event: string, resource: Resource2) => void> = []
  private leakThreshold: number = 60000
  private maxLifetime: number = 3600000

  setFactory(factory: ResourceFactory2): this { this.factory = factory; return this }

  create(type: ResourceType2, handle?: unknown, metadata: Record<string, unknown> = {}): string {
    const id = `res_${++this.idCounter}`
    const resource: Resource2 = {
      id, type, state: 'idle',
      createdAt: Date.now(),
      acquiredAt: null, releasedAt: null,
      acquiredBy: null, acquireCount: 0,
      totalActiveTime: 0, metadata,
    }
    this.resources.set(id, resource)
    if (handle !== undefined) this.handles.set(id, handle)
    this.notify('created', resource)
    return id
  }

  acquire(id: string, acquiredBy: string): boolean {
    const resource = this.resources.get(id)
    if (!resource || resource.state !== 'idle') return false
    resource.state = 'acquired'
    resource.acquiredAt = Date.now()
    resource.acquiredBy = acquiredBy
    resource.acquireCount++
    this.notify('acquired', resource)
    return true
  }

  release(id: string): boolean {
    const resource = this.resources.get(id)
    if (!resource || resource.state !== 'acquired') return false
    resource.state = 'released'
    resource.releasedAt = Date.now()
    if (resource.acquiredAt) {
      resource.totalActiveTime += resource.releasedAt - resource.acquiredAt
    }
    resource.acquiredBy = null
    this.notify('released', resource)
    return true
  }

  reactivate(id: string): boolean {
    const resource = this.resources.get(id)
    if (!resource || resource.state !== 'released') return false
    resource.state = 'idle'
    resource.acquiredAt = null
    resource.releasedAt = null
    this.notify('reactivated', resource)
    return true
  }

  destroy(id: string): boolean {
    const resource = this.resources.get(id)
    if (!resource || resource.state === 'destroyed') return false
    if (resource.state === 'acquired') this.release(id)
    resource.state = 'destroyed'
    const handle = this.handles.get(id)
    if (handle && this.factory) this.factory.destroy(handle)
    this.handles.delete(id)
    this.notify('destroyed', resource)
    return true
  }

  get(id: string): Resource2 | undefined { return this.resources.get(id) }
  getHandle(id: string): unknown | undefined { return this.handles.get(id) }

  validate(id: string): boolean {
    const resource = this.resources.get(id)
    if (!resource || resource.state === 'destroyed') return false
    const handle = this.handles.get(id)
    if (handle && this.factory) return this.factory.validate(handle)
    return true
  }

  getByType(type: ResourceType2): Resource2[] {
    return Array.from(this.resources.values()).filter(r => r.type === type)
  }

  getByState(state: ResourceState2): Resource2[] {
    return Array.from(this.resources.values()).filter(r => r.state === state)
  }

  getByAcquirer(acquiredBy: string): Resource2[] {
    return Array.from(this.resources.values()).filter(r => r.acquiredBy === acquiredBy)
  }

  getIdle(): Resource2[] { return this.getByState('idle') }
  getAcquired(): Resource2[] { return this.getByState('acquired') }
  getDestroyed(): Resource2[] { return this.getByState('destroyed') }

  detectLeaks(): string[] {
    const now = Date.now()
    const leaks: string[] = []
    this.resources.forEach((resource, id) => {
      if (resource.state === 'acquired' && resource.acquiredAt) {
        if (now - resource.acquiredAt >= this.leakThreshold) leaks.push(id)
      }
      if (resource.state !== 'destroyed' && now - resource.createdAt >= this.maxLifetime) {
        leaks.push(id)
      }
    })
    return leaks
  }

  forceRelease(staleMs: number): number {
    const now = Date.now()
    let count = 0
    this.resources.forEach((resource, id) => {
      if (resource.state === 'acquired' && resource.acquiredAt && now - resource.acquiredAt >= staleMs) {
        this.release(id)
        count++
      }
    })
    return count
  }

  setLeakThreshold(ms: number): this { this.leakThreshold = ms; return this }
  setMaxLifetime(ms: number): this { this.maxLifetime = ms; return this }

  listen(fn: (event: string, resource: Resource2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, resource: Resource2): void {
    this.listeners.forEach(fn => fn(event, resource))
  }

  getUtilization(): number {
    const total = this.resources.size
    if (total === 0) return 0
    return this.getAcquired().length / total
  }

  getAverageActiveTime(): number {
    const resources = Array.from(this.resources.values()).filter(r => r.acquireCount > 0)
    if (resources.length === 0) return 0
    return resources.reduce((s, r) => s + r.totalActiveTime, 0) / resources.length
  }

  getStats(): { total: number; idle: number; acquired: number; released: number; destroyed: number; utilization: number; leaks: number } {
    return {
      total: this.resources.size,
      idle: this.getIdle().length,
      acquired: this.getAcquired().length,
      released: this.getByState('released').length,
      destroyed: this.getDestroyed().length,
      utilization: this.getUtilization(),
      leaks: this.detectLeaks().length,
    }
  }

  count(): number { return this.resources.size }

  toArray(): Resource2[] { return Array.from(this.resources.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ResourceRegistry2 {
    const rr = new ResourceRegistry2()
    this.resources.forEach((r, id) => rr.resources.set(id, { ...r, metadata: { ...r.metadata } }))
    this.handles.forEach((h, id) => rr.handles.set(id, h))
    rr.idCounter = this.idCounter
    rr.leakThreshold = this.leakThreshold
    rr.maxLifetime = this.maxLifetime
    return rr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ResourceRegistry2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.resources.forEach((_, id) => this.destroy(id))
    this.resources.clear()
    this.handles.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
