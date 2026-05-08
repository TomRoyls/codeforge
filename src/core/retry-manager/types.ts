export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
  retryableCheck?: (error: unknown) => boolean
  sleeper?: (ms: number) => Promise<void>
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  halfOpenAttempts: number
}

export type CircuitState = 'closed' | 'open' | 'half-open'

export interface RetryAttempt {
  attemptNumber: number
  delay: number
  error: unknown
  timestamp: number
}

export interface RetryResult<T> {
  success: boolean
  value?: T
  error?: unknown
  attempts: RetryAttempt[]
  totalDelay: number
}

export interface RetryStats {
  totalAttempts: number
  totalSuccesses: number
  totalFailures: number
  circuitBreakerTrips: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenAttempts: 1,
}
