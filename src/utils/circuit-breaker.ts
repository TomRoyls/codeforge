export type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeoutMs: number
  halfOpenMaxAttempts: number
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  totalRejected: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures: number = 0
  private successes: number = 0
  private totalRejected: number = 0
  private lastFailureTime: number | null = null
  private lastSuccessTime: number | null = null
  private openedAt: number = 0
  private halfOpenAttempts: number = 0
  private readonly failureThreshold: number
  private readonly resetTimeoutMs: number
  private readonly halfOpenMaxAttempts: number

  constructor(options: CircuitBreakerOptions) {
    if (options.failureThreshold < 1)
      throw new RangeError(`failureThreshold must be >= 1, got ${options.failureThreshold}`)
    if (options.resetTimeoutMs < 1)
      throw new RangeError(`resetTimeoutMs must be >= 1, got ${options.resetTimeoutMs}`)
    if (options.halfOpenMaxAttempts < 1)
      throw new RangeError(`halfOpenMaxAttempts must be >= 1, got ${options.halfOpenMaxAttempts}`)

    this.failureThreshold = options.failureThreshold
    this.resetTimeoutMs = options.resetTimeoutMs
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canAttempt()) {
      this.totalRejected++
      throw new Error(`Circuit breaker is ${this.state}`)
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error: unknown) {
      this.onFailure()
      throw error
    }
  }

  public canAttempt(): boolean {
    if (this.state === 'closed') return true
    if (this.state === 'open') {
      if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
        this.state = 'half-open'
        this.halfOpenAttempts = 0
        return true
      }
      return false
    }
    return this.halfOpenAttempts < this.halfOpenMaxAttempts
  }

  public getState(): CircuitState {
    return this.state
  }

  private onSuccess(): void {
    this.successes++
    this.lastSuccessTime = Date.now()

    if (this.state === 'half-open') {
      this.state = 'closed'
      this.failures = 0
      this.halfOpenAttempts = 0
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === 'half-open') {
      this.halfOpenAttempts++
      if (this.halfOpenAttempts >= this.halfOpenMaxAttempts) {
        this.state = 'open'
        this.openedAt = Date.now()
      }
    } else if (this.failures >= this.failureThreshold) {
      this.state = 'open'
      this.openedAt = Date.now()
    }
  }

  public getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRejected: this.totalRejected,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
    }
  }

  public reset(): void {
    this.state = 'closed'
    this.failures = 0
    this.successes = 0
    this.totalRejected = 0
    this.lastFailureTime = null
    this.lastSuccessTime = null
    this.openedAt = 0
    this.halfOpenAttempts = 0
  }
}
