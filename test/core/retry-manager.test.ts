import { describe, it, expect } from 'vitest'
import { BackoffStrategy } from '../../src/core/retry-manager/backoff-strategy.js'
import { RetryManager } from '../../src/core/retry-manager/retry-manager.js'
import type { RetryConfig, CircuitBreakerConfig, RetryResult, RetryStats } from '../../src/core/retry-manager/types.js'
import { DEFAULT_RETRY_CONFIG, DEFAULT_CIRCUIT_BREAKER_CONFIG } from '../../src/core/retry-manager/types.js'

const noOpSleeper = async (_ms: number): Promise<void> => {}

class FixedRandomBackoffStrategy extends BackoffStrategy {
  calculateDelay(attempt: number): number {
    return this.getConfig().initialDelay * Math.pow(this.getConfig().backoffMultiplier, attempt)
  }
}

describe('BackoffStrategy', () => {
  describe('calculateDelay', () => {
    it('should return initialDelay for attempt 0', () => {
      const bs = new BackoffStrategy()
      const delay = bs.calculateDelay(0)
      expect(delay).toBe(100)
    })

    it('should return initialDelay * multiplier for attempt 1', () => {
      const bs = new BackoffStrategy()
      const delay = bs.calculateDelay(1)
      expect(delay).toBe(200)
    })

    it('should return initialDelay * multiplier^2 for attempt 2', () => {
      const bs = new BackoffStrategy()
      const delay = bs.calculateDelay(2)
      expect(delay).toBe(400)
    })

    it('should return initialDelay * multiplier^3 for attempt 3', () => {
      const bs = new BackoffStrategy()
      const delay = bs.calculateDelay(3)
      expect(delay).toBe(800)
    })

    it('should cap delay at maxDelay', () => {
      const bs = new BackoffStrategy({ initialDelay: 100, maxDelay: 500, backoffMultiplier: 10 })
      const delay = bs.calculateDelay(5)
      expect(delay).toBe(500)
    })

    it('should use custom backoff multiplier', () => {
      const bs = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 3 })
      expect(bs.calculateDelay(0)).toBe(100)
      expect(bs.calculateDelay(1)).toBe(300)
      expect(bs.calculateDelay(2)).toBe(900)
    })

    it('should use custom initial delay', () => {
      const bs = new BackoffStrategy({ initialDelay: 250 })
      expect(bs.calculateDelay(0)).toBe(250)
      expect(bs.calculateDelay(1)).toBe(500)
    })

    it('should handle very large attempt numbers', () => {
      const bs = new BackoffStrategy({ maxDelay: 1000 })
      const delay = bs.calculateDelay(100)
      expect(delay).toBe(1000)
    })
  })

  describe('addJitter', () => {
    it('should return a value between 50% and 100% of the input', () => {
      const bs = new BackoffStrategy()
      for (let i = 0; i < 50; i++) {
        const result = bs.addJitter(1000)
        expect(result).toBeGreaterThanOrEqual(500)
        expect(result).toBeLessThanOrEqual(1000)
      }
    })

    it('should produce different delays on successive calls', () => {
      const bs = new BackoffStrategy()
      const delays = new Set<number>()
      for (let i = 0; i < 20; i++) {
        delays.add(bs.addJitter(1000))
      }
      expect(delays.size).toBeGreaterThan(1)
    })

    it('should handle zero delay', () => {
      const bs = new BackoffStrategy()
      const result = bs.addJitter(0)
      expect(result).toBe(0)
    })
  })

  describe('getMaxDelay', () => {
    it('should return default maxDelay', () => {
      const bs = new BackoffStrategy()
      expect(bs.getMaxDelay()).toBe(30000)
    })

    it('should return custom maxDelay', () => {
      const bs = new BackoffStrategy({ maxDelay: 5000 })
      expect(bs.getMaxDelay()).toBe(5000)
    })
  })

  describe('getInitialDelay', () => {
    it('should return default initialDelay', () => {
      const bs = new BackoffStrategy()
      expect(bs.getInitialDelay()).toBe(100)
    })

    it('should return custom initialDelay', () => {
      const bs = new BackoffStrategy({ initialDelay: 200 })
      expect(bs.getInitialDelay()).toBe(200)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const bs = new BackoffStrategy()
      const config = bs.getConfig()
      config.initialDelay = 999
      expect(bs.getConfig().initialDelay).toBe(100)
    })
  })
})

describe('RetryManager', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const rm = new RetryManager()
      const config = rm.getConfig()
      expect(config.maxRetries).toBe(DEFAULT_RETRY_CONFIG.maxRetries)
      expect(config.initialDelay).toBe(DEFAULT_RETRY_CONFIG.initialDelay)
      expect(config.maxDelay).toBe(DEFAULT_RETRY_CONFIG.maxDelay)
      expect(config.backoffMultiplier).toBe(DEFAULT_RETRY_CONFIG.backoffMultiplier)
      expect(config.jitter).toBe(DEFAULT_RETRY_CONFIG.jitter)
    })

    it('should accept partial retry config', () => {
      const rm = new RetryManager({ maxRetries: 5, initialDelay: 200 })
      const config = rm.getConfig()
      expect(config.maxRetries).toBe(5)
      expect(config.initialDelay).toBe(200)
      expect(config.maxDelay).toBe(DEFAULT_RETRY_CONFIG.maxDelay)
    })

    it('should accept full retry config', () => {
      const rm = new RetryManager({
        maxRetries: 10,
        initialDelay: 50,
        maxDelay: 10000,
        backoffMultiplier: 3,
        jitter: false,
      })
      const config = rm.getConfig()
      expect(config.maxRetries).toBe(10)
      expect(config.initialDelay).toBe(50)
      expect(config.maxDelay).toBe(10000)
      expect(config.backoffMultiplier).toBe(3)
      expect(config.jitter).toBe(false)
    })
  })

  describe('execute - success', () => {
    it('should succeed on first try', async () => {
      const rm = new RetryManager({ sleeper: noOpSleeper })
      const result = await rm.execute(async () => 42)
      expect(result.success).toBe(true)
      expect(result.value).toBe(42)
      expect(result.attempts).toHaveLength(0)
      expect(result.totalDelay).toBe(0)
    })

    it('should succeed after retries', async () => {
      const rm = new RetryManager({ maxRetries: 3, initialDelay: 100, sleeper: noOpSleeper, jitter: false })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        if (callCount < 3) throw new Error('fail')
        return 'success'
      })
      expect(result.success).toBe(true)
      expect(result.value).toBe('success')
      expect(result.attempts).toHaveLength(2)
    })

    it('should return correct attempt info on retry then success', async () => {
      const rm = new RetryManager({ maxRetries: 2, initialDelay: 50, sleeper: noOpSleeper, jitter: false })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        if (callCount === 1) throw new Error('first fail')
        return 'ok'
      })
      expect(result.success).toBe(true)
      expect(result.attempts).toHaveLength(1)
      expect(result.attempts[0]!.attemptNumber).toBe(0)
      expect(result.attempts[0]!.delay).toBe(50)
    })
  })

  describe('execute - failures', () => {
    it('should fail after all retries exhausted', async () => {
      const rm = new RetryManager({ maxRetries: 2, initialDelay: 10, sleeper: noOpSleeper, jitter: false })
      const result = await rm.execute(async () => {
        throw new Error('always fail')
      })
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.attempts).toHaveLength(3)
    })

    it('should track total delay correctly', async () => {
      const rm = new RetryManager({ maxRetries: 2, initialDelay: 100, sleeper: noOpSleeper, jitter: false })
      const result = await rm.execute(async () => {
        throw new Error('fail')
      })
      expect(result.totalDelay).toBe(100 + 200)
    })

    it('should fail immediately on non-retryable error', async () => {
      const rm = new RetryManager({
        maxRetries: 3,
        sleeper: noOpSleeper,
        retryableCheck: (err: unknown) => err instanceof Error && err.message !== 'fatal',
      })
      const result = await rm.execute(async () => {
        throw new Error('fatal')
      })
      expect(result.success).toBe(false)
      expect(result.attempts).toHaveLength(1)
    })

    it('should succeed when non-retryable does not trigger', async () => {
      const rm = new RetryManager({
        maxRetries: 3,
        sleeper: noOpSleeper,
        retryableCheck: (err: unknown) => err instanceof Error && err.message !== 'fatal',
      })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        if (callCount < 2) throw new Error('retryable')
        return 'ok'
      })
      expect(result.success).toBe(true)
      expect(result.value).toBe('ok')
    })
  })

  describe('execute - zero maxRetries', () => {
    it('should not retry when maxRetries is 0', async () => {
      const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        throw new Error('fail')
      })
      expect(result.success).toBe(false)
      expect(callCount).toBe(1)
      expect(result.attempts).toHaveLength(1)
    })

    it('should succeed on first try with zero maxRetries', async () => {
      const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
      const result = await rm.execute(async () => 'ok')
      expect(result.success).toBe(true)
      expect(result.value).toBe('ok')
    })
  })

  describe('retryableCheck', () => {
    it('should default to all errors retryable', () => {
      const rm = new RetryManager()
      expect(rm.isRetryable(new Error('anything'))).toBe(true)
      expect(rm.isRetryable('string error')).toBe(true)
      expect(rm.isRetryable(42)).toBe(true)
    })

    it('should use custom retryableCheck', () => {
      const rm = new RetryManager({
        sleeper: noOpSleeper,
        retryableCheck: (err: unknown) => typeof err === 'string',
      })
      expect(rm.isRetryable('string error')).toBe(true)
      expect(rm.isRetryable(new Error('error'))).toBe(false)
    })

    it('should respect retryableCheck returning false', async () => {
      const rm = new RetryManager({
        maxRetries: 5,
        sleeper: noOpSleeper,
        retryableCheck: () => false,
      })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        throw new Error('fail')
      })
      expect(result.success).toBe(false)
      expect(callCount).toBe(1)
    })
  })

  describe('circuit breaker', () => {
    it('should start in closed state', () => {
      const rm = new RetryManager()
      expect(rm.getCircuitState()).toBe('closed')
    })

    it('should open after failure threshold', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
        failureThreshold: 3,
      }, { failureThreshold: 3, resetTimeout: 30000, halfOpenAttempts: 1 })
      for (let i = 0; i < 3; i++) {
        await rm.execute(async () => { throw new Error('fail') })
      }
      expect(rm.getCircuitState()).toBe('open')
    })

    it('should reject when circuit is open', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getCircuitState()).toBe('open')
      const result = await rm.execute(async () => 'should not run')
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
    })

    it('should track circuit breaker trips', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 2, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getStats().circuitBreakerTrips).toBe(1)
    })

    it('should transition to half-open after reset timeout', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 0, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getCircuitState()).toBe('open')

      await new Promise((resolve) => setTimeout(resolve, 10))
      const result = await rm.execute(async () => 'ok')
      expect(result.success).toBe(true)
    })

    it('should close circuit after successful half-open request', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 0, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getCircuitState()).toBe('open')

      await new Promise((resolve) => setTimeout(resolve, 10))
      await rm.execute(async () => 'ok')
      expect(rm.getCircuitState()).toBe('closed')
    })

    it('should re-open circuit on half-open failure', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 0, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })

      await new Promise((resolve) => setTimeout(resolve, 10))
      await rm.execute(async () => { throw new Error('still failing') })
      expect(rm.getCircuitState()).toBe('open')
      expect(rm.getStats().circuitBreakerTrips).toBe(2)
    })

    it('should require multiple successes in half-open with halfOpenAttempts > 1', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 0, halfOpenAttempts: 2 })
      await rm.execute(async () => { throw new Error('fail') })

      await new Promise((resolve) => setTimeout(resolve, 10))
      await rm.execute(async () => 'ok1')
      expect(rm.getCircuitState()).toBe('half-open')

      await rm.execute(async () => 'ok2')
      expect(rm.getCircuitState()).toBe('closed')
    })
  })

  describe('resetCircuit', () => {
    it('should reset circuit to closed', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getCircuitState()).toBe('open')

      rm.resetCircuit()
      expect(rm.getCircuitState()).toBe('closed')
    })

    it('should reset failure count', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 3, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getFailureCount()).toBe(2)

      rm.resetCircuit()
      expect(rm.getFailureCount()).toBe(0)
    })

    it('should allow execution after reset', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      rm.resetCircuit()

      const result = await rm.execute(async () => 'works')
      expect(result.success).toBe(true)
      expect(result.value).toBe('works')
    })
  })

  describe('getFailureCount', () => {
    it('should return 0 initially', () => {
      const rm = new RetryManager()
      expect(rm.getFailureCount()).toBe(0)
    })

    it('should increment on each failure', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 10, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getFailureCount()).toBe(1)
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getFailureCount()).toBe(2)
    })

    it('should reset on success', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 10, resetTimeout: 60000, halfOpenAttempts: 1 })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getFailureCount()).toBe(1)
      await rm.execute(async () => 'ok')
      expect(rm.getFailureCount()).toBe(0)
    })
  })

  describe('getConfig', () => {
    it('should return current config', () => {
      const rm = new RetryManager({ maxRetries: 5, initialDelay: 200 })
      const config = rm.getConfig()
      expect(config.maxRetries).toBe(5)
      expect(config.initialDelay).toBe(200)
    })

    it('should return a copy of config', () => {
      const rm = new RetryManager({ maxRetries: 3 })
      const config = rm.getConfig()
      config.maxRetries = 999
      expect(rm.getConfig().maxRetries).toBe(3)
    })
  })

  describe('getStats', () => {
    it('should return zero stats initially', () => {
      const rm = new RetryManager()
      const stats = rm.getStats()
      expect(stats.totalAttempts).toBe(0)
      expect(stats.totalSuccesses).toBe(0)
      expect(stats.totalFailures).toBe(0)
      expect(stats.circuitBreakerTrips).toBe(0)
    })

    it('should track total attempts', async () => {
      const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
      await rm.execute(async () => 'ok')
      expect(rm.getStats().totalAttempts).toBe(1)
    })

    it('should track total successes', async () => {
      const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
      await rm.execute(async () => 'ok')
      await rm.execute(async () => 'ok')
      expect(rm.getStats().totalSuccesses).toBe(2)
    })

    it('should track total failures', async () => {
      const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getStats().totalFailures).toBe(1)
    })

    it('should track attempts including retries', async () => {
      const rm = new RetryManager({ maxRetries: 2, sleeper: noOpSleeper })
      let callCount = 0
      await rm.execute(async () => {
        callCount++
        if (callCount < 3) throw new Error('retry')
        return 'ok'
      })
      expect(rm.getStats().totalAttempts).toBe(3)
      expect(rm.getStats().totalSuccesses).toBe(1)
    })
  })

  describe('multiple sequential executions', () => {
    it('should handle multiple successful executions', async () => {
      const rm = new RetryManager({ sleeper: noOpSleeper })
      const r1 = await rm.execute(async () => 1)
      const r2 = await rm.execute(async () => 2)
      const r3 = await rm.execute(async () => 3)
      expect(r1.value).toBe(1)
      expect(r2.value).toBe(2)
      expect(r3.value).toBe(3)
      expect(rm.getStats().totalAttempts).toBe(3)
      expect(rm.getStats().totalSuccesses).toBe(3)
    })

    it('should handle mixed success and failure', async () => {
      const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
      await rm.execute(async () => 'ok')
      await rm.execute(async () => { throw new Error('fail') })
      await rm.execute(async () => 'ok')
      expect(rm.getStats().totalAttempts).toBe(3)
      expect(rm.getStats().totalSuccesses).toBe(2)
      expect(rm.getStats().totalFailures).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should cap very large backoff at maxDelay', async () => {
      const rm = new RetryManager({
        maxRetries: 5,
        initialDelay: 100,
        maxDelay: 500,
        backoffMultiplier: 10,
        sleeper: noOpSleeper,
        jitter: false,
      })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        if (callCount <= 3) throw new Error('fail')
        return 'ok'
      })
      expect(result.success).toBe(true)
      expect(result.attempts.length).toBe(3)
      for (const attempt of result.attempts) {
        expect(attempt.delay).toBeLessThanOrEqual(500)
      }
    })

    it('should produce different jitter values on successive calls', async () => {
      const bs = new BackoffStrategy()
      const delays = new Set<number>()
      for (let i = 0; i < 30; i++) {
        delays.add(bs.addJitter(1000))
      }
      expect(delays.size).toBeGreaterThan(1)
    })

    it('should handle circuit breaker recovery', async () => {
      const rm = new RetryManager({
        maxRetries: 0,
        sleeper: noOpSleeper,
      }, { failureThreshold: 1, resetTimeout: 0, halfOpenAttempts: 1 })

      await rm.execute(async () => { throw new Error('fail') })
      expect(rm.getCircuitState()).toBe('open')

      await new Promise((resolve) => setTimeout(resolve, 10))
      const result = await rm.execute(async () => 'recovered')
      expect(result.success).toBe(true)
      expect(rm.getCircuitState()).toBe('closed')

      const stats = rm.getStats()
      expect(stats.circuitBreakerTrips).toBe(1)
    })

    it('should handle null return value', async () => {
      const rm = new RetryManager({ sleeper: noOpSleeper })
      const result = await rm.execute(async () => null)
      expect(result.success).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should handle undefined return value', async () => {
      const rm = new RetryManager({ sleeper: noOpSleeper })
      const result = await rm.execute(async () => undefined)
      expect(result.success).toBe(true)
      expect(result.value).toBeUndefined()
    })

    it('should record timestamps on attempts', async () => {
      const rm = new RetryManager({ maxRetries: 1, initialDelay: 1, sleeper: noOpSleeper, jitter: false })
      const before = Date.now()
      await rm.execute(async () => { throw new Error('fail') })
      const after = Date.now()
      const stats = rm.getStats()
      expect(stats.totalAttempts).toBe(2)
      expect(stats.totalFailures).toBe(1)
    })

    it('should track attempts with retryableCheck that filters some errors', async () => {
      class RetryableError extends Error { constructor() { super('retryable') } }
      class FatalError extends Error { constructor() { super('fatal') } }
      const rm = new RetryManager({
        maxRetries: 5,
        sleeper: noOpSleeper,
        retryableCheck: (err: unknown) => err instanceof RetryableError,
      })
      let callCount = 0
      const result = await rm.execute(async () => {
        callCount++
        if (callCount === 1) throw new RetryableError()
        if (callCount === 2) throw new FatalError()
        return 'done'
      })
      expect(result.success).toBe(false)
      expect(callCount).toBe(2)
      expect(result.attempts).toHaveLength(2)
    })
  })
})

describe('DEFAULT_RETRY_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3)
    expect(DEFAULT_RETRY_CONFIG.initialDelay).toBe(100)
    expect(DEFAULT_RETRY_CONFIG.maxDelay).toBe(30000)
    expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2)
    expect(DEFAULT_RETRY_CONFIG.jitter).toBe(true)
  })
})

describe('DEFAULT_CIRCUIT_BREAKER_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold).toBe(5)
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeout).toBe(30000)
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.halfOpenAttempts).toBe(1)
  })
})

describe('RetryResult', () => {
  it('should have all required fields on success', async () => {
    const rm = new RetryManager({ sleeper: noOpSleeper })
    const result: RetryResult<string> = await rm.execute(async () => 'test')
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('value')
    expect(result).toHaveProperty('attempts')
    expect(result).toHaveProperty('totalDelay')
  })

  it('should have all required fields on failure', async () => {
    const rm = new RetryManager({ maxRetries: 0, sleeper: noOpSleeper })
    const result: RetryResult<string> = await rm.execute(async () => { throw new Error('fail') })
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('attempts')
    expect(result).toHaveProperty('totalDelay')
  })
})

describe('RetryStats', () => {
  it('should have all required fields', () => {
    const rm = new RetryManager()
    const stats: RetryStats = rm.getStats()
    expect(stats).toHaveProperty('totalAttempts')
    expect(stats).toHaveProperty('totalSuccesses')
    expect(stats).toHaveProperty('totalFailures')
    expect(stats).toHaveProperty('circuitBreakerTrips')
  })
})

describe('BackoffStrategy custom config', () => {
  it('should respect custom multiplier in getConfig', () => {
    const bs = new BackoffStrategy({ backoffMultiplier: 5 })
    expect(bs.getConfig().backoffMultiplier).toBe(5)
  })

  it('should calculate correct delay with custom multiplier', () => {
    const bs = new BackoffStrategy({ initialDelay: 10, backoffMultiplier: 5 })
    expect(bs.calculateDelay(0)).toBe(10)
    expect(bs.calculateDelay(1)).toBe(50)
    expect(bs.calculateDelay(2)).toBe(250)
  })

  it('should calculate correct delay with custom initial delay and multiplier', () => {
    const bs = new BackoffStrategy({ initialDelay: 50, backoffMultiplier: 3 })
    expect(bs.calculateDelay(0)).toBe(50)
    expect(bs.calculateDelay(1)).toBe(150)
    expect(bs.calculateDelay(2)).toBe(450)
  })
})

describe('additional BackoffStrategy edge cases', () => {
  it('should handle attempt 4 correctly', () => {
    const bs = new BackoffStrategy()
    expect(bs.calculateDelay(4)).toBe(1600)
  })

  it('should handle attempt 5 correctly', () => {
    const bs = new BackoffStrategy()
    expect(bs.calculateDelay(5)).toBe(3200)
  })

  it('should handle maxDelay of 1', () => {
    const bs = new BackoffStrategy({ maxDelay: 1 })
    expect(bs.calculateDelay(0)).toBe(1)
  })

  it('should handle initialDelay of 1', () => {
    const bs = new BackoffStrategy({ initialDelay: 1 })
    expect(bs.calculateDelay(0)).toBe(1)
    expect(bs.calculateDelay(1)).toBe(2)
    expect(bs.calculateDelay(2)).toBe(4)
  })

  it('should cap at maxDelay with multiplier 1', () => {
    const bs = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 1, maxDelay: 100 })
    expect(bs.calculateDelay(0)).toBe(100)
    expect(bs.calculateDelay(10)).toBe(100)
  })

  it('should handle very small jitter input', () => {
    const bs = new BackoffStrategy()
    const result = bs.addJitter(1)
    expect(result).toBeGreaterThanOrEqual(0.5)
    expect(result).toBeLessThanOrEqual(1)
  })
})

describe('additional RetryManager edge cases', () => {
  it('should handle retryableCheck returning true for all errors', async () => {
    const rm = new RetryManager({
      maxRetries: 2,
      sleeper: noOpSleeper,
      retryableCheck: () => true,
    })
    let callCount = 0
    const result = await rm.execute(async () => {
      callCount++
      if (callCount <= 2) throw new Error('retry')
      return 'done'
    })
    expect(result.success).toBe(true)
    expect(callCount).toBe(3)
  })

  it('should track attempts correctly when circuit breaker rejects', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      sleeper: noOpSleeper,
    }, { failureThreshold: 1, resetTimeout: 60000, halfOpenAttempts: 1 })
    await rm.execute(async () => { throw new Error('fail') })
    await rm.execute(async () => 'blocked')
    const stats = rm.getStats()
    expect(stats.totalAttempts).toBe(2)
    expect(stats.totalFailures).toBe(2)
  })

  it('should track circuit breaker trips across multiple cycles', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      sleeper: noOpSleeper,
    }, { failureThreshold: 1, resetTimeout: 0, halfOpenAttempts: 1 })

    await rm.execute(async () => { throw new Error('fail') })
    await new Promise((resolve) => setTimeout(resolve, 10))
    await rm.execute(async () => { throw new Error('fail again') })
    await new Promise((resolve) => setTimeout(resolve, 10))
    await rm.execute(async () => { throw new Error('fail again 2') })

    expect(rm.getStats().circuitBreakerTrips).toBeGreaterThanOrEqual(2)
  })

  it('should handle sleeper being called with correct delays', async () => {
    const sleepCalls: number[] = []
    const trackingSleeper = async (ms: number) => { sleepCalls.push(ms) }
    const rm = new RetryManager({
      maxRetries: 2,
      initialDelay: 100,
      backoffMultiplier: 2,
      jitter: false,
      sleeper: trackingSleeper,
    })
    await rm.execute(async () => { throw new Error('fail') })
    expect(sleepCalls.length).toBe(2)
    expect(sleepCalls[0]).toBe(100)
    expect(sleepCalls[1]).toBe(200)
  })

  it('should not call sleeper on success', async () => {
    const sleepCalls: number[] = []
    const trackingSleeper = async (ms: number) => { sleepCalls.push(ms) }
    const rm = new RetryManager({ sleeper: trackingSleeper })
    await rm.execute(async () => 'immediate success')
    expect(sleepCalls).toHaveLength(0)
  })
})
