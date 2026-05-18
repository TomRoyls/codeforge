import { describe, it, expect, vi } from 'vitest'
import { BackoffStrategy } from '../src/core/retry-manager/backoff-strategy.js'
import { RetryManager } from '../src/core/retry-manager/retry-manager.js'

// ─── BackoffStrategy ───

describe('BackoffStrategy: delay calculation', () => {
  it('calculates exponential backoff delay', () => {
    const bs = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 2, maxDelay: 10000, jitter: false })
    expect(bs.calculateDelay(0)).toBe(100)
    expect(bs.calculateDelay(1)).toBe(200)
    expect(bs.calculateDelay(2)).toBe(400)
    expect(bs.calculateDelay(3)).toBe(800)
  })

  it('respects maxDelay cap', () => {
    const bs = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 10, maxDelay: 500, jitter: false })
    expect(bs.calculateDelay(0)).toBe(100)
    expect(bs.calculateDelay(1)).toBe(500)
    expect(bs.calculateDelay(5)).toBe(500)
  })

  it('addJitter returns value between 50% and 100% of delay', () => {
    const bs = new BackoffStrategy({ jitter: false })
    const delay = 1000
    for (let i = 0; i < 50; i++) {
      const jittered = bs.addJitter(delay)
      expect(jittered).toBeGreaterThanOrEqual(delay * 0.5)
      expect(jittered).toBeLessThanOrEqual(delay)
    }
  })

  it('getMaxDelay returns configured maxDelay', () => {
    const bs = new BackoffStrategy({ maxDelay: 5000, jitter: false })
    expect(bs.getMaxDelay()).toBe(5000)
  })

  it('getInitialDelay returns configured initialDelay', () => {
    const bs = new BackoffStrategy({ initialDelay: 200, jitter: false })
    expect(bs.getInitialDelay()).toBe(200)
  })

  it('getConfig returns a copy of the config', () => {
    const bs = new BackoffStrategy({ initialDelay: 150, jitter: false })
    const config = bs.getConfig()
    expect(config.initialDelay).toBe(150)
    config.initialDelay = 999
    expect(bs.getInitialDelay()).toBe(150)
  })
})

// ─── RetryManager: Successful Execution ───

describe('RetryManager: successful execution', () => {
  it('executes a successful function on first try', async () => {
    const rm = new RetryManager({ maxRetries: 3 }, {})
    const result = await rm.execute(async () => 42)
    expect(result.success).toBe(true)
    expect(result.value).toBe(42)
    expect(result.attempts).toHaveLength(0)
  })

  it('records stats after successful execution', async () => {
    const rm = new RetryManager({ maxRetries: 3, jitter: false }, {})
    await rm.execute(async () => 'ok')
    const stats = rm.getStats()
    expect(stats.totalAttempts).toBe(1)
    expect(stats.totalSuccesses).toBe(1)
    expect(stats.totalFailures).toBe(0)
  })

  it('retries and succeeds on subsequent attempt', async () => {
    let callCount = 0
    const rm = new RetryManager({
      maxRetries: 3,
      initialDelay: 1,
      maxDelay: 10,
      backoffMultiplier: 2,
      jitter: false,
      sleeper: async () => {},
    }, {})
    const result = await rm.execute(async () => {
      callCount++
      if (callCount < 3) throw new Error('fail')
      return 'done'
    })
    expect(result.success).toBe(true)
    expect(result.value).toBe('done')
    expect(result.attempts).toHaveLength(2)
    expect(callCount).toBe(3)
  })
})

// ─── RetryManager: Failed Execution ───

describe('RetryManager: failed execution', () => {
  it('returns failure after exhausting retries', async () => {
    const rm = new RetryManager({
      maxRetries: 2,
      initialDelay: 1,
      maxDelay: 10,
      backoffMultiplier: 2,
      jitter: false,
      sleeper: async () => {},
    }, {})
    const result = await rm.execute(async () => {
      throw new Error('always fails')
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(result.attempts.length).toBeGreaterThan(0)
  })

  it('non-retryable errors fail immediately', async () => {
    const rm = new RetryManager({
      maxRetries: 3,
      jitter: false,
      retryableCheck: (err) => !(err instanceof TypeError),
    }, {})
    const result = await rm.execute(async () => {
      throw new TypeError('not retryable')
    })
    expect(result.success).toBe(false)
    expect(result.attempts).toHaveLength(1)
  })

  it('records failure stats', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      initialDelay: 1,
      maxDelay: 10,
      jitter: false,
      sleeper: async () => {},
    }, {})
    await rm.execute(async () => { throw new Error('fail') })
    const stats = rm.getStats()
    expect(stats.totalFailures).toBe(1)
  })
})

// ─── RetryManager: Circuit Breaker ───

describe('RetryManager: circuit breaker', () => {
  it('starts with circuit closed', () => {
    const rm = new RetryManager({}, {})
    expect(rm.getCircuitState()).toBe('closed')
  })

  it('opens circuit after reaching failure threshold', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      initialDelay: 1,
      jitter: false,
      sleeper: async () => {},
    }, {
      failureThreshold: 2,
      resetTimeout: 10000,
      halfOpenAttempts: 1,
    })
    await rm.execute(async () => { throw new Error('fail') })
    expect(rm.getCircuitState()).toBe('closed')
    await rm.execute(async () => { throw new Error('fail') })
    expect(rm.getCircuitState()).toBe('open')
  })

  it('rejects immediately when circuit is open', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      initialDelay: 1,
      jitter: false,
      sleeper: async () => {},
    }, {
      failureThreshold: 1,
      resetTimeout: 60000,
      halfOpenAttempts: 1,
    })
    await rm.execute(async () => { throw new Error('fail') })
    const result = await rm.execute(async () => 'should not run')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect((result.error as Error).message).toContain('Circuit breaker is open')
  })

  it('resetCircuit resets to closed state', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      initialDelay: 1,
      jitter: false,
      sleeper: async () => {},
    }, {
      failureThreshold: 1,
      resetTimeout: 60000,
      halfOpenAttempts: 1,
    })
    await rm.execute(async () => { throw new Error('fail') })
    expect(rm.getCircuitState()).toBe('open')
    rm.resetCircuit()
    expect(rm.getCircuitState()).toBe('closed')
    expect(rm.getFailureCount()).toBe(0)
  })
})

// ─── RetryManager: Config and Utilities ───

describe('RetryManager: config and utilities', () => {
  it('getConfig returns a copy', () => {
    const rm = new RetryManager({ maxRetries: 5, jitter: false }, {})
    const config = rm.getConfig()
    expect(config.maxRetries).toBe(5)
    config.maxRetries = 99
    expect(rm.getConfig().maxRetries).toBe(5)
  })

  it('isRetryable uses custom check when provided', () => {
    const rm = new RetryManager({
      jitter: false,
      retryableCheck: (err) => (err as Error).message === 'retry',
    }, {})
    expect(rm.isRetryable(new Error('retry'))).toBe(true)
    expect(rm.isRetryable(new Error('nope'))).toBe(false)
  })

  it('isRetryable defaults to true', () => {
    const rm = new RetryManager({ jitter: false }, {})
    expect(rm.isRetryable(new Error('anything'))).toBe(true)
  })

  it('tracks circuitBreakerTrips in stats', async () => {
    const rm = new RetryManager({
      maxRetries: 0,
      initialDelay: 1,
      jitter: false,
      sleeper: async () => {},
    }, {
      failureThreshold: 1,
      resetTimeout: 60000,
      halfOpenAttempts: 1,
    })
    await rm.execute(async () => { throw new Error('fail') })
    expect(rm.getStats().circuitBreakerTrips).toBe(1)
  })
})
