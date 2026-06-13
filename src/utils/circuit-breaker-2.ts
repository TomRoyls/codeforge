export type CircuitState = 'closed' | 'open' | 'half-open'

export class CircuitBreaker2 {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private failureThreshold: number
  private successThreshold: number
  private resetTimeout: number
  private monitorWindow: number
  private failures: number[] = []

  constructor(options?: { failureThreshold?: number; successThreshold?: number; resetTimeout?: number; monitorWindow?: number }) {
    this.failureThreshold = options?.failureThreshold ?? 5
    this.successThreshold = options?.successThreshold ?? 3
    this.resetTimeout = options?.resetTimeout ?? 60000
    this.monitorWindow = options?.monitorWindow ?? 60000
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'half-open'
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed'
        this.failureCount = 0
        this.failures = []
      }
    } else if (this.state === 'closed') {
      this.failureCount = 0
      this.failures = []
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    this.failures.push(this.lastFailureTime)
    this.pruneOldFailures()

    if (this.state === 'half-open') {
      this.state = 'open'
    } else if (this.state === 'closed') {
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open'
      }
    }
  }

  private pruneOldFailures(): void {
    const cutoff = Date.now() - this.monitorWindow
    this.failures = this.failures.filter(t => t >= cutoff)
  }

  getState(): CircuitState { return this.state }
  getFailureCount(): number { return this.failureCount }
  getRecentFailureCount(): number { this.pruneOldFailures(); return this.failures.length }
  isOpen(): boolean { return this.state === 'open' }
  isClosed(): boolean { return this.state === 'closed' }
  isHalfOpen(): boolean { return this.state === 'half-open' }

  reset(): void {
    this.state = 'closed'
    this.failureCount = 0
    this.successCount = 0
    this.failures = []
  }

  forceOpen(): void { this.state = 'open'; this.lastFailureTime = Date.now() }
  forceClose(): void { this.reset() }

  getStats(): { state: CircuitState; failureCount: number; successCount: number; recentFailures: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      recentFailures: this.getRecentFailureCount(),
    }
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): CircuitBreaker2 {
    const cb = new CircuitBreaker2({
      failureThreshold: this.failureThreshold,
      successThreshold: this.successThreshold,
      resetTimeout: this.resetTimeout,
      monitorWindow: this.monitorWindow,
    })
    cb.state = this.state
    cb.failureCount = this.failureCount
    return cb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CircuitBreaker2)) return false
    return this.state === other.state
  }
}
