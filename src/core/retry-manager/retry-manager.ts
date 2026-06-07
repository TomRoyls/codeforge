import type { RetryConfig, CircuitBreakerConfig, CircuitState, RetryResult, RetryStats } from './types.js'
import { DEFAULT_RETRY_CONFIG, DEFAULT_CIRCUIT_BREAKER_CONFIG } from './types.js'
import { BackoffStrategy } from './backoff-strategy.js'

const defaultSleeper = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export class RetryManager {
  private readonly config: RetryConfig
  private readonly circuitConfig: CircuitBreakerConfig
  private readonly backoff: BackoffStrategy
  private readonly sleeper: (ms: number) => Promise<void>
  private circuitState: CircuitState = 'closed'
  private failureCount = 0
  private halfOpenSuccessCount = 0
  private lastFailureTime = 0
  private totalAttempts = 0
  private totalSuccesses = 0
  private totalFailures = 0
  private circuitBreakerTrips = 0

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    circuitBreakerConfig: Partial<CircuitBreakerConfig> = {},
  ) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    this.circuitConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...circuitBreakerConfig }
    this.backoff = new BackoffStrategy(this.config)
    this.sleeper = this.config.sleeper ?? defaultSleeper
  }

  async execute<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    const state = this.checkCircuitState()

    if (state === 'open') {
      this.totalAttempts++
      this.totalFailures++
      return {
        success: false,
        error: new Error('Circuit breaker is open'),
        attempts: [],
        totalDelay: 0,
      }
    }

    const attempts: Array<{ attemptNumber: number; delay: number; error: unknown; timestamp: number }> = []
    let totalDelay = 0

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      this.totalAttempts++

      try {
        const value = await fn()
        this.totalSuccesses++
        this.onSuccess()

        return {
          success: true,
          value,
          attempts,
          totalDelay,
        }
      } catch (error: unknown) {
        if (!this.isRetryable(error)) {
          this.totalFailures++
          this.onFailure()

          attempts.push({
            attemptNumber: attempt,
            delay: 0,
            error,
            timestamp: Date.now(),
          })

          return {
            success: false,
            error,
            attempts,
            totalDelay,
          }
        }

        const isLastAttempt = attempt >= this.config.maxRetries
        const delay = isLastAttempt ? 0 : this.calculateDelay(attempt)

        attempts.push({
          attemptNumber: attempt,
          delay,
          error,
          timestamp: Date.now(),
        })

        if (isLastAttempt) {
          this.totalFailures++
          this.onFailure()

          return {
            success: false,
            error,
            attempts,
            totalDelay,
          }
        }

        totalDelay += delay
        await this.sleeper(delay)
      }
    }

    this.totalFailures++
    return {
      success: false,
      error: attempts.length > 0 ? attempts[attempts.length - 1]!.error : undefined,
      attempts,
      totalDelay,
    }
  }

  private calculateDelay(attempt: number): number {
    let delay = this.backoff.calculateDelay(attempt)
    if (this.config.jitter) {
      delay = this.backoff.addJitter(delay)
    }
    return delay
  }

  private checkCircuitState(): CircuitState {
    if (this.circuitState === 'open') {
      const elapsed = Date.now() - this.lastFailureTime
      if (elapsed >= this.circuitConfig.resetTimeout) {
        this.circuitState = 'half-open'
        this.halfOpenSuccessCount = 0
      }
    }
    return this.circuitState
  }

  private onSuccess(): void {
    if (this.circuitState === 'half-open') {
      this.halfOpenSuccessCount++
      if (this.halfOpenSuccessCount >= this.circuitConfig.halfOpenAttempts) {
        this.circuitState = 'closed'
        this.failureCount = 0
      }
    } else {
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.circuitState === 'half-open') {
      this.circuitState = 'open'
      this.circuitBreakerTrips++
    } else if (this.failureCount >= this.circuitConfig.failureThreshold) {
      this.circuitState = 'open'
      this.circuitBreakerTrips++
    }
  }

  getCircuitState(): CircuitState {
    return this.circuitState
  }

  resetCircuit(): void {
    this.circuitState = 'closed'
    this.failureCount = 0
    this.halfOpenSuccessCount = 0
  }

  getFailureCount(): number {
    return this.failureCount
  }

  isRetryable(error: unknown): boolean {
    if (this.config.retryableCheck) {
      return this.config.retryableCheck(error)
    }
    return true
  }

  getConfig(): RetryConfig {
    return { ...this.config }
  }

  getStats(): RetryStats {
    return {
      totalAttempts: this.totalAttempts,
      totalSuccesses: this.totalSuccesses,
      totalFailures: this.totalFailures,
      circuitBreakerTrips: this.circuitBreakerTrips,
    }
  }
}
