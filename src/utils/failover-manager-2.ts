export type FailoverState2 = 'primary' | 'failover' | 'recovering' | 'failed'
export type FailoverStrategy2 = 'round-robin' | 'priority' | 'random' | 'sticky'

export interface Endpoint2 {
  id: string
  name: string
  url: string
  priority: number
  healthy: boolean
  consecutiveFailures: number
  totalRequests: number
  totalFailures: number
  lastFailureAt: number | null
  circuitOpen: boolean
}

export class FailoverManager2 {
  private endpoints: Map<string, Endpoint2> = new Map()
  private order: string[] = []
  private state: FailoverState2 = 'primary'
  private strategy: FailoverStrategy2 = 'priority'
  private rrIndex: number = 0
  private failureThreshold: number = 5
  private recoveryTimeout: number = 30000
  private stickyEndpoint: string | null = null
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0

  setStrategy(s: FailoverStrategy2): this { this.strategy = s; return this }
  setFailureThreshold(n: number): this { this.failureThreshold = n; return this }
  setRecoveryTimeout(ms: number): this { this.recoveryTimeout = ms; return this }

  addEndpoint(name: string, url: string, priority = 0): string {
    const id = `ep_${++this.idCounter}`
    const endpoint: Endpoint2 = {
      id, name, url, priority,
      healthy: true,
      consecutiveFailures: 0,
      totalRequests: 0,
      totalFailures: 0,
      lastFailureAt: null,
      circuitOpen: false,
    }
    this.endpoints.set(id, endpoint)
    this.order.push(id)
    this.sortByPriority()
    return id
  }

  removeEndpoint(id: string): boolean {
    if (!this.endpoints.has(id)) return false
    this.endpoints.delete(id)
    this.order = this.order.filter(eid => eid !== id)
    if (this.stickyEndpoint === id) this.stickyEndpoint = null
    return true
  }

  private sortByPriority(): void {
    this.order.sort((a, b) => {
      const ea = this.endpoints.get(a)!
      const eb = this.endpoints.get(b)!
      return ea.priority - eb.priority
    })
  }

  recordSuccess(id: string): void {
    const ep = this.endpoints.get(id)
    if (!ep) return
    ep.totalRequests++
    ep.consecutiveFailures = 0
    ep.healthy = true
    ep.circuitOpen = false
    this.notify('success', ep)
  }

  recordFailure(id: string): void {
    const ep = this.endpoints.get(id)
    if (!ep) return
    ep.totalRequests++
    ep.totalFailures++
    ep.consecutiveFailures++
    ep.lastFailureAt = Date.now()
    if (ep.consecutiveFailures >= this.failureThreshold) {
      ep.healthy = false
      ep.circuitOpen = true
      this.notify('circuit-opened', ep)
      this.checkFailover()
    }
    this.notify('failure', ep)
  }

  private checkFailover(): void {
    const hasHealthy = Array.from(this.endpoints.values()).some(e => e.healthy)
    if (!hasHealthy) {
      this.state = 'failed'
      this.notify('all-failed', null)
    } else if (this.state === 'primary') {
      this.state = 'failover'
      this.notify('failover-started', null)
    }
  }

  select(): Endpoint2 | null {
    const healthy = this.order.filter(id => {
      const ep = this.endpoints.get(id)!
      return ep.healthy && !ep.circuitOpen
    })
    if (healthy.length === 0) return null

    let selectedId: string
    switch (this.strategy) {
      case 'round-robin':
        selectedId = healthy[this.rrIndex % healthy.length]
        this.rrIndex++
        break
      case 'random':
        selectedId = healthy[Math.floor(Math.random() * healthy.length)]
        break
      case 'sticky':
        if (this.stickyEndpoint && healthy.includes(this.stickyEndpoint)) {
          selectedId = this.stickyEndpoint
        } else {
          selectedId = healthy[0]
          this.stickyEndpoint = selectedId
        }
        break
      case 'priority':
      default:
        selectedId = healthy[0]
        break
    }
    return this.endpoints.get(selectedId) || null
  }

  tryRecover(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep || ep.healthy) return false
    if (ep.lastFailureAt && Date.now() - ep.lastFailureAt >= this.recoveryTimeout) {
      ep.healthy = true
      ep.circuitOpen = false
      ep.consecutiveFailures = 0
      this.notify('recovered', ep)
      this.state = 'primary'
      return true
    }
    return false
  }

  recoverAll(): string[] {
    const recovered: string[] = []
    this.endpoints.forEach((ep, id) => {
      if (!ep.healthy && this.tryRecover(id)) recovered.push(id)
    })
    return recovered
  }

  get(id: string): Endpoint2 | undefined { return this.endpoints.get(id) }
  getAll(): Endpoint2[] { return Array.from(this.endpoints.values()) }
  getHealthy(): Endpoint2[] { return this.getAll().filter(e => e.healthy) }
  getUnhealthy(): Endpoint2[] { return this.getAll().filter(e => !e.healthy) }
  getState(): FailoverState2 { return this.state }

  setHealth(id: string, healthy: boolean): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.healthy = healthy
    if (healthy) {
      ep.consecutiveFailures = 0
      ep.circuitOpen = false
    }
    return true
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { total: number; healthy: number; unhealthy: number; state: string; requests: number; failures: number } {
    return {
      total: this.endpoints.size,
      healthy: this.getHealthy().length,
      unhealthy: this.getUnhealthy().length,
      state: this.state,
      requests: this.getAll().reduce((s, e) => s + e.totalRequests, 0),
      failures: this.getAll().reduce((s, e) => s + e.totalFailures, 0),
    }
  }

  count(): number { return this.endpoints.size }

  toArray(): Endpoint2[] { return Array.from(this.endpoints.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): FailoverManager2 {
    const fm = new FailoverManager2()
    this.endpoints.forEach((e, id) => fm.endpoints.set(id, { ...e }))
    fm.order = [...this.order]
    fm.state = this.state
    fm.strategy = this.strategy
    fm.rrIndex = this.rrIndex
    fm.failureThreshold = this.failureThreshold
    fm.recoveryTimeout = this.recoveryTimeout
    fm.stickyEndpoint = this.stickyEndpoint
    return fm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FailoverManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.endpoints.clear()
    this.order = []
    this.listeners = []
    this.state = 'primary'
    this.rrIndex = 0
    this.stickyEndpoint = null
    this.idCounter = 0
  }
}
