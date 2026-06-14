export type PoolState2 = 'idle' | 'active' | 'closing' | 'closed'
export type AcquireStrategy2 = 'fifo' | 'lifo' | 'random' | 'round-robin'

export interface PooledConnection2 {
  id: string
  state: PoolState2
  createdAt: number
  lastUsedAt: number
  acquireCount: number
  inUse: boolean
  checkedOut: boolean
  generation: number
}

export class ConnectionPool2 {
  private connections: Map<string, PooledConnection2> = new Map()
  private factory: { create: () => unknown; destroy: (c: unknown) => void; validate: (c: unknown) => boolean } | null = null
  private handles: Map<string, unknown> = new Map()
  private idle: string[] = []
  private active: Set<string> = new Set()
  private waiting: Array<{ resolve: (id: string) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }> = []
  private maxConnections: number = 10
  private minIdle: number = 1
  private maxIdleTime: number = 30000
  private acquireTimeout: number = 5000
  private strategy: AcquireStrategy2 = 'lifo'
  private rrIndex: number = 0
  private generation: number = 0
  private idCounter = 0
  private listeners: Array<(event: string, conn: PooledConnection2) => void> = []
  private totalCreated: number = 0
  private totalDestroyed: number = 0
  private totalAcquired: number = 0
  private totalReleased: number = 0
  private totalTimeouts: number = 0

  setFactory(create: () => unknown, destroy: (c: unknown) => void, validate: (c: unknown) => boolean): this {
    this.factory = { create, destroy, validate }
    return this
  }

  setMaxConnections(n: number): this { this.maxConnections = n; return this }
  setMinIdle(n: number): this { this.minIdle = n; return this }
  setMaxIdleTime(ms: number): this { this.maxIdleTime = ms; return this }
  setAcquireTimeout(ms: number): this { this.acquireTimeout = ms; return this }
  setStrategy(s: AcquireStrategy2): this { this.strategy = s; return this }

  private createConnection(): string | null {
    if (this.connections.size >= this.maxConnections) return null
    const id = `conn_${++this.idCounter}`
    const conn: PooledConnection2 = {
      id, state: 'idle',
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      acquireCount: 0,
      inUse: false, checkedOut: false,
      generation: this.generation,
    }
    this.connections.set(id, conn)
    if (this.factory) this.handles.set(id, this.factory.create())
    this.idle.push(id)
    this.totalCreated++
    this.notify('created', conn)
    return id
  }

  acquire(): string | null {
    const id = this.selectIdle()
    if (id) {
      this.checkout(id)
      return id
    }
    if (this.connections.size < this.maxConnections) {
      const newId = this.createConnection()
      if (newId) {
        this.idle = this.idle.filter(i => i !== newId)
        this.checkout(newId)
        return newId
      }
    }
    this.totalTimeouts++
    return null
  }

  private selectIdle(): string | null {
    if (this.idle.length === 0) return null
    while (this.idle.length > 0) {
      let id: string
      switch (this.strategy) {
        case 'fifo': id = this.idle.shift()!; break
        case 'lifo': id = this.idle.pop()!; break
        case 'random': id = this.idle.splice(Math.floor(Math.random() * this.idle.length), 1)[0]; break
        case 'round-robin': id = this.idle.splice(this.rrIndex % this.idle.length, 1)[0]; this.rrIndex++; break
      }
      const conn = this.connections.get(id)
      if (!conn) continue
      if (this.factory) {
        const handle = this.handles.get(id)
        if (handle && !this.factory.validate(handle)) {
          this.destroyConnection(id)
          continue
        }
      }
      return id
    }
    return null
  }

  private checkout(id: string): void {
    const conn = this.connections.get(id)
    if (!conn) return
    conn.inUse = true
    conn.checkedOut = true
    conn.acquireCount++
    conn.lastUsedAt = Date.now()
    this.active.add(id)
    this.totalAcquired++
    this.notify('acquired', conn)
  }

  release(id: string): boolean {
    const conn = this.connections.get(id)
    if (!conn || !conn.checkedOut) return false
    conn.inUse = false
    conn.checkedOut = false
    conn.lastUsedAt = Date.now()
    this.active.delete(id)
    this.idle.push(id)
    this.totalReleased++
    this.notify('released', conn)
    return true
  }

  getHandle(id: string): unknown | undefined { return this.handles.get(id) }

  private destroyConnection(id: string): void {
    const conn = this.connections.get(id)
    if (!conn) return
    const handle = this.handles.get(id)
    if (handle && this.factory) this.factory.destroy(handle)
    this.handles.delete(id)
    this.connections.delete(id)
    this.idle = this.idle.filter(i => i !== id)
    this.active.delete(id)
    this.totalDestroyed++
    this.notify('destroyed', conn)
  }

  close(): void {
    this.generation++
    this.connections.forEach((_, id) => this.destroyConnection(id))
    this.listeners = []
  }

  drain(): void {
    this.connections.forEach((conn, id) => {
      if (!conn.checkedOut) this.destroyConnection(id)
    })
  }

  sweepIdle(): number {
    const now = Date.now()
    let swept = 0
    const toRemove: string[] = []
    this.idle.forEach(id => {
      const conn = this.connections.get(id)
      if (conn && this.connections.size - toRemove.length > this.minIdle) {
        if (now - conn.lastUsedAt >= this.maxIdleTime) {
          toRemove.push(id)
        }
      }
    })
    toRemove.forEach(id => { this.destroyConnection(id); swept++ })
    return swept
  }

  ensureMinIdle(): number {
    let created = 0
    while (this.connections.size < this.minIdle) {
      if (!this.createConnection()) break
      created++
    }
    return created
  }

  getActiveCount(): number { return this.active.size }
  getIdleCount(): number { return this.idle.length }
  getTotalCount(): number { return this.connections.size }

  listen(fn: (event: string, conn: PooledConnection2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, conn: PooledConnection2): void {
    this.listeners.forEach(fn => fn(event, conn))
  }

  getStats(): { total: number; active: number; idle: number; created: number; destroyed: number; acquired: number; released: number; timeouts: number } {
    return {
      total: this.connections.size,
      active: this.active.size,
      idle: this.idle.length,
      created: this.totalCreated,
      destroyed: this.totalDestroyed,
      acquired: this.totalAcquired,
      released: this.totalReleased,
      timeouts: this.totalTimeouts,
    }
  }

  count(): number { return this.connections.size }

  toArray(): PooledConnection2[] { return Array.from(this.connections.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ConnectionPool2 {
    const cp = new ConnectionPool2()
    cp.maxConnections = this.maxConnections
    cp.minIdle = this.minIdle
    cp.maxIdleTime = this.maxIdleTime
    cp.acquireTimeout = this.acquireTimeout
    cp.strategy = this.strategy
    cp.totalCreated = this.totalCreated
    cp.totalDestroyed = this.totalDestroyed
    cp.totalAcquired = this.totalAcquired
    cp.totalReleased = this.totalReleased
    cp.totalTimeouts = this.totalTimeouts
    return cp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConnectionPool2)) return false
    return this.connections.size === other.connections.size
  }
  clear(): void {
    this.close()
    this.totalCreated = 0
    this.totalDestroyed = 0
    this.totalAcquired = 0
    this.totalReleased = 0
    this.totalTimeouts = 0
    this.rrIndex = 0
  }
}
