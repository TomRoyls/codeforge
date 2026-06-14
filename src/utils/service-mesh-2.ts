export type ServiceState2 = 'unregistered' | 'registered' | 'active' | 'inactive' | 'degraded'
export type HealthStatus2 = 'healthy' | 'unhealthy' | 'unknown'

export interface ServiceNode2 {
  id: string
  name: string
  version: string
  host: string
  port: number
  state: ServiceState2
  health: HealthStatus2
  metadata: Record<string, string>
  registeredAt: number
  lastHeartbeat: number
  tags: string[]
}

export class ServiceMesh2 {
  private nodes: Map<string, ServiceNode2> = new Map()
  private idCounter = 0
  private listeners: Array<(event: string, node: ServiceNode2) => void> = []
  private heartbeatTimeout: number = 30000
  private healthChecks: Map<string, (node: ServiceNode2) => Promise<boolean>> = new Map()

  setHeartbeatTimeout(ms: number): this { this.heartbeatTimeout = ms; return this }

  register(name: string, version: string, host: string, port: number, tags: string[] = [], metadata: Record<string, string> = {}): string {
    const id = `svc_${++this.idCounter}`
    const node: ServiceNode2 = {
      id, name, version, host, port,
      state: 'registered',
      health: 'unknown',
      metadata, tags,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
    }
    this.nodes.set(id, node)
    this.notify('registered', node)
    return id
  }

  deregister(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.state = 'unregistered'
    this.nodes.delete(id)
    this.notify('deregistered', node)
    return true
  }

  heartbeat(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.lastHeartbeat = Date.now()
    node.state = 'active'
    return true
  }

  setHealth(id: string, status: HealthStatus2): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.health = status
    if (status === 'unhealthy') node.state = 'degraded'
    this.notify('health-changed', node)
    return true
  }

  registerHealthCheck(id: string, check: (node: ServiceNode2) => Promise<boolean>): boolean {
    if (!this.nodes.has(id)) return false
    this.healthChecks.set(id, check)
    return true
  }

  async runHealthCheck(id: string): Promise<HealthStatus2 | null> {
    const node = this.nodes.get(id)
    const check = this.healthChecks.get(id)
    if (!node || !check) return null
    try {
      const ok = await check(node)
      this.setHealth(id, ok ? 'healthy' : 'unhealthy')
      return ok ? 'healthy' : 'unhealthy'
    } catch {
      this.setHealth(id, 'unhealthy')
      return 'unhealthy'
    }
  }

  get(id: string): ServiceNode2 | undefined { return this.nodes.get(id) }

  getByName(name: string): ServiceNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.name === name)
  }

  getByTag(tag: string): ServiceNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.tags.includes(tag))
  }

  getByState(state: ServiceState2): ServiceNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.state === state)
  }

  getByHealth(health: HealthStatus2): ServiceNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.health === health)
  }

  getStale(): ServiceNode2[] {
    const now = Date.now()
    return Array.from(this.nodes.values()).filter(n => now - n.lastHeartbeat >= this.heartbeatTimeout)
  }

  getHealthy(): ServiceNode2[] { return this.getByHealth('healthy') }
  getUnhealthy(): ServiceNode2[] { return this.getByHealth('unhealthy') }

  resolve(name: string): ServiceNode2 | null {
    const candidates = this.getByName(name).filter(n => n.state === 'active' && n.health !== 'unhealthy')
    if (candidates.length === 0) return null
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  resolveRoundRobin(name: string): ServiceNode2 | null {
    const candidates = this.getByName(name).filter(n => n.state === 'active')
    if (candidates.length === 0) return null
    return candidates[candidates.length % candidates.length]
  }

  listen(fn: (event: string, node: ServiceNode2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, node: ServiceNode2): void {
    this.listeners.forEach(fn => fn(event, node))
  }

  getStats(): { total: number; active: number; degraded: number; healthy: number; unhealthy: number; stale: number } {
    return {
      total: this.nodes.size,
      active: this.getByState('active').length,
      degraded: this.getByState('degraded').length,
      healthy: this.getHealthy().length,
      unhealthy: this.getUnhealthy().length,
      stale: this.getStale().length,
    }
  }

  count(): number { return this.nodes.size }

  toArray(): ServiceNode2[] { return Array.from(this.nodes.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ServiceMesh2 {
    const sm = new ServiceMesh2()
    this.nodes.forEach((n, id) => sm.nodes.set(id, { ...n, tags: [...n.tags], metadata: { ...n.metadata } }))
    sm.idCounter = this.idCounter
    sm.heartbeatTimeout = this.heartbeatTimeout
    return sm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ServiceMesh2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.nodes.clear()
    this.healthChecks.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
