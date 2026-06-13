export interface ServiceRegistration2 {
  id: string
  name: string
  host: string
  port: number
  metadata: Record<string, string>
  healthy: boolean
  registeredAt: number
  lastHeartbeat: number
}

export class ServiceRegistry2 {
  private services: Map<string, ServiceRegistration2> = new Map()
  private nameIndex: Map<string, Set<string>> = new Map()
  private idCounter = 0
  private heartbeatTimeout: number

  constructor(heartbeatTimeout = 30000) {
    this.heartbeatTimeout = heartbeatTimeout
  }

  register(name: string, host: string, port: number, metadata: Record<string, string> = {}): string {
    const id = `svc_${++this.idCounter}`
    const now = Date.now()
    const reg: ServiceRegistration2 = {
      id, name, host, port, metadata,
      healthy: true, registeredAt: now, lastHeartbeat: now,
    }
    this.services.set(id, reg)
    if (!this.nameIndex.has(name)) this.nameIndex.set(name, new Set())
    this.nameIndex.get(name)!.add(id)
    return id
  }

  deregister(id: string): boolean {
    const svc = this.services.get(id)
    if (!svc) return false
    this.services.delete(id)
    const nameSet = this.nameIndex.get(svc.name)
    if (nameSet) {
      nameSet.delete(id)
      if (nameSet.size === 0) this.nameIndex.delete(svc.name)
    }
    return true
  }

  heartbeat(id: string): boolean {
    const svc = this.services.get(id)
    if (!svc) return false
    svc.lastHeartbeat = Date.now()
    svc.healthy = true
    return true
  }

  get(id: string): ServiceRegistration2 | undefined { return this.services.get(id) }

  getByName(name: string): ServiceRegistration2[] {
    const ids = this.nameIndex.get(name)
    if (!ids) return []
    return Array.from(ids).map(id => this.services.get(id)).filter(Boolean) as ServiceRegistration2[]
  }

  getHealthy(name: string): ServiceRegistration2[] {
    return this.getByName(name).filter(s => s.healthy)
  }

  getUnhealthy(): ServiceRegistration2[] {
    return Array.from(this.services.values()).filter(s => !s.healthy)
  }

  checkHealth(): number {
    const now = Date.now()
    let expired = 0
    this.services.forEach(svc => {
      if (now - svc.lastHeartbeat > this.heartbeatTimeout) {
        svc.healthy = false
        expired++
      }
    })
    return expired
  }

  getAll(): ServiceRegistration2[] { return Array.from(this.services.values()) }
  count(): number { return this.services.size }
  getNameCount(): number { return this.nameIndex.size }

  setHeartbeatTimeout(timeout: number): this {
    this.heartbeatTimeout = timeout
    return this
  }

  getHeartbeatTimeout(): number { return this.heartbeatTimeout }

  toArray(): ServiceRegistration2[] { return this.getAll() }
  toString(): string { return JSON.stringify({ services: this.count(), names: this.getNameCount() }) }
  toJSON(): Record<string, unknown> { return { services: this.count(), names: this.getNameCount(), unhealthy: this.getUnhealthy().length } }
  clone(): ServiceRegistry2 {
    const sr = new ServiceRegistry2(this.heartbeatTimeout)
    this.services.forEach((svc, id) => sr.services.set(id, { ...svc, metadata: { ...svc.metadata } }))
    this.nameIndex.forEach((ids, name) => sr.nameIndex.set(name, new Set(ids)))
    sr.idCounter = this.idCounter
    return sr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ServiceRegistry2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.services.clear()
    this.nameIndex.clear()
    this.idCounter = 0
  }
}
