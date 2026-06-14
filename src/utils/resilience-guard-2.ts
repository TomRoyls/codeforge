export type ResiliencePattern2 = 'circuit-breaker' | 'retry' | 'timeout' | 'bulkhead' | 'fallback' | 'rate-limiter'
export type GuardState2 = 'closed' | 'open' | 'half-open'

export interface GuardConfig2 {
  name: string
  pattern: ResiliencePattern2
  maxFailures: number
  resetTimeout: number
  maxRetries: number
  maxConcurrent: number
  fallback: (() => unknown) | null
}

export interface GuardResult2 {
  success: boolean
  result: unknown
  error: string | null
  attempts: number
  duration: number
  pattern: ResiliencePattern2
}

export class ResilienceGuard2 {
  private guards: Map<string, GuardConfig2> = new Map()
  private states: Map<string, GuardState2> = new Map()
  private failureCounts: Map<string, number> = new Map()
  private concurrent: Map<string, number> = new Map()
  private lastFailureAt: Map<string, number> = new Map()
  private results: GuardResult2[] = []
  private maxResults: number = 10000

  register(config: GuardConfig2): this {
    this.guards.set(config.name, config)
    this.states.set(config.name, 'closed')
    this.failureCounts.set(config.name, 0)
    this.concurrent.set(config.name, 0)
    return this
  }

  unregister(name: string): boolean {
    if (!this.guards.has(name)) return false
    this.guards.delete(name)
    this.states.delete(name)
    this.failureCounts.delete(name)
    this.concurrent.delete(name)
    this.lastFailureAt.delete(name)
    return true
  }

  async execute<T>(name: string, fn: () => T | Promise<T>): Promise<GuardResult2> {
    const config = this.guards.get(name)
    if (!config) return { success: false, result: null, error: 'Guard not found', attempts: 0, duration: 0, pattern: 'circuit-breaker' }

    const start = Date.now()
    const state = this.states.get(name)!

    if (state === 'open') {
      if (config.resetTimeout > 0 && Date.now() - (this.lastFailureAt.get(name) || 0) >= config.resetTimeout) {
        this.states.set(name, 'half-open')
      } else if (config.fallback) {
        return { success: true, result: config.fallback(), error: null, attempts: 0, duration: Date.now() - start, pattern: config.pattern }
      } else {
        return { success: false, result: null, error: 'Circuit open', attempts: 0, duration: Date.now() - start, pattern: config.pattern }
      }
    }

    if ((this.concurrent.get(name) || 0) >= config.maxConcurrent) {
      if (config.fallback) {
        return { success: true, result: config.fallback(), error: null, attempts: 0, duration: Date.now() - start, pattern: config.pattern }
      }
      return { success: false, result: null, error: 'Bulkhead full', attempts: 0, duration: Date.now() - start, pattern: config.pattern }
    }

    this.concurrent.set(name, (this.concurrent.get(name) || 0) + 1)

    let attempts = 0
    let lastError: string | null = null

    while (attempts <= config.maxRetries) {
      attempts++
      try {
        const result = await fn()
        this.onSuccess(name)
        const guardResult: GuardResult2 = { success: true, result, error: null, attempts, duration: Date.now() - start, pattern: config.pattern }
        this.recordResult(guardResult)
        this.concurrent.set(name, Math.max(0, (this.concurrent.get(name) || 0) - 1))
        return guardResult
      } catch (e) {
        lastError = String(e)
        this.onFailure(name, config)
        if (this.states.get(name) === 'open') break
      }
    }

    if (config.fallback) {
      const fallbackResult: GuardResult2 = { success: true, result: config.fallback(), error: null, attempts, duration: Date.now() - start, pattern: config.pattern }
      this.recordResult(fallbackResult)
      this.concurrent.set(name, Math.max(0, (this.concurrent.get(name) || 0) - 1))
      return fallbackResult
    }

    const failResult: GuardResult2 = { success: false, result: null, error: lastError, attempts, duration: Date.now() - start, pattern: config.pattern }
    this.recordResult(failResult)
    this.concurrent.set(name, Math.max(0, (this.concurrent.get(name) || 0) - 1))
    return failResult
  }

  private onSuccess(name: string): void {
    this.failureCounts.set(name, 0)
    this.states.set(name, 'closed')
  }

  private onFailure(name: string, config: GuardConfig2): void {
    const count = (this.failureCounts.get(name) || 0) + 1
    this.failureCounts.set(name, count)
    this.lastFailureAt.set(name, Date.now())
    if (count >= config.maxFailures) {
      this.states.set(name, 'open')
    }
  }

  private recordResult(result: GuardResult2): void {
    this.results.push(result)
    if (this.results.length > this.maxResults) this.results.shift()
  }

  getState(name: string): GuardState2 | undefined { return this.states.get(name) }
  getConfig(name: string): GuardConfig2 | undefined { return this.guards.get(name) }
  getFailures(name: string): number { return this.failureCounts.get(name) || 0 }
  getConcurrent(name: string): number { return this.concurrent.get(name) || 0 }

  forceOpen(name: string): boolean {
    if (!this.guards.has(name)) return false
    this.states.set(name, 'open')
    return true
  }

  forceClose(name: string): boolean {
    if (!this.guards.has(name)) return false
    this.states.set(name, 'closed')
    this.failureCounts.set(name, 0)
    return true
  }

  getResults(): GuardResult2[] { return [...this.results] }

  getStats(): { guards: number; openCircuits: number; totalResults: number; successRate: number } {
    const open = Array.from(this.states.values()).filter(s => s === 'open').length
    const total = this.results.length
    const successes = this.results.filter(r => r.success).length
    return {
      guards: this.guards.size,
      openCircuits: open,
      totalResults: total,
      successRate: total === 0 ? 1 : successes / total,
    }
  }

  count(): number { return this.guards.size }

  toArray(): GuardConfig2[] { return Array.from(this.guards.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ResilienceGuard2 {
    const rg = new ResilienceGuard2()
    this.guards.forEach((c, name) => rg.guards.set(name, { ...c }))
    this.states.forEach((s, name) => rg.states.set(name, s))
    this.failureCounts.forEach((c, name) => rg.failureCounts.set(name, c))
    this.concurrent.forEach((c, name) => rg.concurrent.set(name, c))
    return rg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ResilienceGuard2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.guards.clear()
    this.states.clear()
    this.failureCounts.clear()
    this.concurrent.clear()
    this.lastFailureAt.clear()
    this.results = []
  }
}
