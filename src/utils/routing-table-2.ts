export type EndpointState2 = 'healthy' | 'unhealthy' | 'draining' | 'removed'
export type RoutingStrategy2 = 'round-robin' | 'weighted' | 'least-connections' | 'consistent-hash'

export interface Endpoint2 {
  id: string
  host: string
  port: number
  weight: number
  connections: number
  state: EndpointState2
  latency: number
  errorRate: number
  lastChecked: number
  metadata: Record<string, unknown>
}

export interface Route2 {
  id: string
  pattern: string
  service: string
  strategy: RoutingStrategy2
  endpoints: string[]
  currentIndex: number
}

export class RoutingTable2 {
  private endpoints: Map<string, Endpoint2> = new Map()
  private routes: Map<string, Route2> = new Map()
  private consistentRing: Map<number, string> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private routeCounter = 0
  private healthCheckFn: ((ep: Endpoint2) => boolean) | null = null

  setHealthCheck(fn: (ep: Endpoint2) => boolean): this { this.healthCheckFn = fn; return this }

  addEndpoint(host: string, port: number, weight: number = 1, metadata: Record<string, unknown> = {}): string {
    const id = `ep_${++this.idCounter}`
    const endpoint: Endpoint2 = {
      id, host, port, weight,
      connections: 0,
      state: 'healthy',
      latency: 0,
      errorRate: 0,
      lastChecked: Date.now(),
      metadata,
    }
    this.endpoints.set(id, endpoint)
    this.addToRing(id)
    this.notify('endpoint-added', { id })
    return id
  }

  removeEndpoint(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.state = 'removed'
    this.endpoints.delete(id)
    this.removeFromRing(id)
    this.notify('endpoint-removed', { id })
    return true
  }

  drainEndpoint(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.state = 'draining'
    this.notify('endpoint-draining', { id })
    return true
  }

  markUnhealthy(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.state = 'unhealthy'
    this.notify('endpoint-unhealthy', { id })
    return true
  }

  markHealthy(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.state = 'healthy'
    this.notify('endpoint-healthy', { id })
    return true
  }

  incrementConnections(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep || ep.state !== 'healthy') return false
    ep.connections++
    return true
  }

  decrementConnections(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep || ep.connections <= 0) return false
    ep.connections--
    return true
  }

  recordLatency(id: string, ms: number): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.latency = ep.latency * 0.9 + ms * 0.1
    return true
  }

  recordError(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.errorRate = Math.min(1, ep.errorRate + 0.1)
    if (ep.errorRate >= 0.5) this.markUnhealthy(id)
    return true
  }

  recordSuccess(id: string): boolean {
    const ep = this.endpoints.get(id)
    if (!ep) return false
    ep.errorRate = Math.max(0, ep.errorRate - 0.05)
    if (ep.errorRate < 0.1 && ep.state === 'unhealthy') this.markHealthy(id)
    return true
  }

  healthCheck(): { healthy: number; unhealthy: number; recovered: number } {
    let healthy = 0, unhealthy = 0, recovered = 0
    this.endpoints.forEach(ep => {
      if (this.healthCheckFn) {
        const ok = this.healthCheckFn(ep)
        if (ok && ep.state === 'unhealthy') { ep.state = 'healthy'; recovered++ }
        else if (!ok && ep.state === 'healthy') { ep.state = 'unhealthy'; unhealthy++ }
        else if (ok) healthy++
      }
      ep.lastChecked = Date.now()
    })
    return { healthy, unhealthy, recovered }
  }

  addRoute(pattern: string, service: string, strategy: RoutingStrategy2 = 'round-robin'): string {
    const id = `route_${++this.routeCounter}`
    const route: Route2 = {
      id, pattern, service, strategy,
      endpoints: [],
      currentIndex: 0,
    }
    this.routes.set(id, route)
    this.notify('route-added', { id })
    return id
  }

  assignEndpoint(routeId: string, endpointId: string): boolean {
    const route = this.routes.get(routeId)
    if (!route) return false
    if (!route.endpoints.includes(endpointId)) route.endpoints.push(endpointId)
    return true
  }

  unassignEndpoint(routeId: string, endpointId: string): boolean {
    const route = this.routes.get(routeId)
    if (!route) return false
    route.endpoints = route.endpoints.filter(e => e !== endpointId)
    return true
  }

  select(routeId: string): string | null {
    const route = this.routes.get(routeId)
    if (!route || route.endpoints.length === 0) return null

    const healthy = route.endpoints.filter(eid => {
      const ep = this.endpoints.get(eid)
      return ep && ep.state === 'healthy'
    })
    if (healthy.length === 0) return null

    switch (route.strategy) {
      case 'round-robin': {
        route.currentIndex = (route.currentIndex + 1) % healthy.length
        return healthy[route.currentIndex]
      }
      case 'weighted': {
        const weighted = healthy.flatMap(eid => {
          const ep = this.endpoints.get(eid)!
          return Array(ep.weight).fill(eid)
        })
        route.currentIndex = (route.currentIndex + 1) % weighted.length
        return weighted[route.currentIndex]
      }
      case 'least-connections': {
        return healthy.sort((a, b) => {
          const ea = this.endpoints.get(a)!
          const eb = this.endpoints.get(b)!
          return ea.connections - eb.connections
        })[0]
      }
      case 'consistent-hash': {
        const hash = this.hashString(routeId) % this.consistentRing.size
        const sorted = Array.from(this.consistentRing.keys()).sort((a, b) => a - b)
        for (const h of sorted) {
          const eid = this.consistentRing.get(h)!
          if (healthy.includes(eid)) return eid
        }
        return healthy[0] || null
      }
      default:
        return healthy[0] || null
    }
  }

  private addToRing(endpointId: string): void {
    for (let i = 0; i < 150; i++) {
      const hash = this.hashString(`${endpointId}_${i}`)
      this.consistentRing.set(hash, endpointId)
    }
  }

  private removeFromRing(endpointId: string): void {
    for (const [hash, eid] of this.consistentRing.entries()) {
      if (eid === endpointId) this.consistentRing.delete(hash)
    }
  }

  private hashString(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  getEndpoint(id: string): Endpoint2 | undefined { return this.endpoints.get(id) }
  getRoute(id: string): Route2 | undefined { return this.routes.get(id) }
  getHealthyEndpoints(): Endpoint2[] { return Array.from(this.endpoints.values()).filter(e => e.state === 'healthy') }
  getRoutes(): Route2[] { return Array.from(this.routes.values()) }
  getRouteByPattern(pattern: string): Route2 | undefined { return Array.from(this.routes.values()).find(r => r.pattern === pattern) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { endpoints: number; healthy: number; unhealthy: number; draining: number; routes: number } {
    return {
      endpoints: this.endpoints.size,
      healthy: this.getHealthyEndpoints().length,
      unhealthy: Array.from(this.endpoints.values()).filter(e => e.state === 'unhealthy').length,
      draining: Array.from(this.endpoints.values()).filter(e => e.state === 'draining').length,
      routes: this.routes.size,
    }
  }

  count(): number { return this.endpoints.size }

  toArray(): Endpoint2[] { return Array.from(this.endpoints.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): RoutingTable2 {
    const rt = new RoutingTable2()
    rt.idCounter = this.idCounter
    rt.routeCounter = this.routeCounter
    return rt
  }
  equals(other: unknown): boolean {
    if (!(other instanceof RoutingTable2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.endpoints.clear()
    this.routes.clear()
    this.consistentRing.clear()
    this.listeners = []
    this.idCounter = 0
    this.routeCounter = 0
  }
}
