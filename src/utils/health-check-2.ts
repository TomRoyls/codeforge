export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheckResult {
  name: string
  status: HealthStatus
  message?: string
  timestamp: number
  latencyMs?: number
  metadata?: Record<string, unknown>
}

export type HealthChecker = () => Promise<HealthCheckResult> | HealthCheckResult

export class HealthCheck2 {
  private checks: Map<string, HealthChecker> = new Map()

  register(name: string, checker: HealthChecker): this {
    this.checks.set(name, checker)
    return this
  }

  unregister(name: string): boolean {
    return this.checks.delete(name)
  }

  has(name: string): boolean {
    return this.checks.has(name)
  }

  names(): string[] {
    return Array.from(this.checks.keys())
  }

  count(): number { return this.checks.size }

  async check(name: string): Promise<HealthCheckResult> {
    const checker = this.checks.get(name)
    if (!checker) return { name, status: 'unhealthy', message: 'Check not found', timestamp: Date.now() }
    const start = Date.now()
    try {
      const result = await checker()
      return { ...result, latencyMs: Date.now() - start }
    } catch (err) {
      return { name, status: 'unhealthy', message: String(err), timestamp: Date.now(), latencyMs: Date.now() - start }
    }
  }

  async checkAll(): Promise<{ results: HealthCheckResult[]; overall: HealthStatus }> {
    const names = this.names()
    const results = await Promise.all(names.map(n => this.check(n)))
    let overall: HealthStatus = 'healthy'
    if (results.some(r => r.status === 'unhealthy')) overall = 'unhealthy'
    else if (results.some(r => r.status === 'degraded')) overall = 'degraded'
    return { results, overall }
  }

  async checkSubset(names: string[]): Promise<{ results: HealthCheckResult[]; overall: HealthStatus }> {
    const results = await Promise.all(names.map(n => this.check(n)))
    let overall: HealthStatus = 'healthy'
    if (results.some(r => r.status === 'unhealthy')) overall = 'unhealthy'
    else if (results.some(r => r.status === 'degraded')) overall = 'degraded'
    return { results, overall }
  }

  clear(): void {
    this.checks.clear()
  }

  toArray(): string[] { return this.names() }
  toString(): string { return JSON.stringify({ checks: this.names() }) }
  toJSON(): string[] { return this.names() }
  clone(): HealthCheck2 {
    const hc = new HealthCheck2()
    this.checks.forEach((fn, name) => hc.register(name, fn))
    return hc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof HealthCheck2)) return false
    return this.count() === other.count()
  }
}
