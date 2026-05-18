import { err, ok, type Result } from './result.js'

export interface RetryOptions {
  backoffFactor?: number
  jitter?: boolean
  maxAttempts?: number
  maxDelayMs?: number
  onRetry?: (error: unknown, attempt: number) => void
  shouldRetry?: (error: unknown) => boolean
}

const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_INITIAL_DELAY_MS = 100
const DEFAULT_BACKOFF_FACTOR = 2
const DEFAULT_MAX_DELAY_MS = 30_000

function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  backoffFactor: number,
  maxDelayMs: number,
  jitter: boolean,
): number {
  const exponentialDelay = initialDelayMs * Math.pow(backoffFactor, attempt)
  const capped = Math.min(exponentialDelay, maxDelayMs)
  if (!jitter) return capped
  return capped * (0.5 + Math.random() * 0.5)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<Result<T, unknown>> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const backoffFactor = options.backoffFactor ?? DEFAULT_BACKOFF_FACTOR
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS
  const jitter = options.jitter ?? false
  const shouldRetry = options.shouldRetry
  const onRetry = options.onRetry

  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn()
      return ok(result)
    } catch (error: unknown) {
      lastError = error

      if (shouldRetry && !shouldRetry(error)) {
        return err(error)
      }

      if (attempt < maxAttempts - 1) {
        if (onRetry) {
          onRetry(error, attempt + 1)
        }
        const delay = calculateDelay(attempt, DEFAULT_INITIAL_DELAY_MS, backoffFactor, maxDelayMs, jitter)
        await sleep(delay)
      }
    }
  }

  return err(lastError)
}
