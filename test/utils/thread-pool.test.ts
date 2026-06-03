import { describe, it, expect } from 'vitest'
import { ThreadPool } from '../../src/utils/thread-pool.js'

describe('ThreadPool', () => {
  it('creates with default concurrency', () => {
    const pool = new ThreadPool()
    expect(pool.maxSlots).toBe(4)
    expect(pool.available).toBe(4)
    expect(pool.active).toBe(0)
  })

  it('creates with custom concurrency', () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    expect(pool.maxSlots).toBe(2)
  })

  it('submits and returns result', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => 42)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.result).toBe(42)
      expect(outcome.duration).toBeGreaterThanOrEqual(0)
    }
  })

  it('handles task errors', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw new Error('fail') })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('fail')
    }
  })

  it('tracks active tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    const task1 = pool.submit(async () => { await p1; return 1 })
    await new Promise(r => setTimeout(r, 10))
    expect(pool.active).toBe(1)
    resolve1!()
    await task1
  })

  it('queues tasks beyond concurrency', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    pool.submit(async () => { await p1; return 1 })
    await new Promise(r => setTimeout(r, 10))
    pool.submit(async () => 2)
    expect(pool.pending).toBe(1)
    resolve1!()
    await new Promise(r => setTimeout(r, 50))
  })

  it('runs multiple tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 4 })
    const results = await Promise.all([
      pool.submit(async () => 1),
      pool.submit(async () => 2),
      pool.submit(async () => 3),
    ])
    const values = results.map(r => r.error ? -1 : r.result)
    expect(values).toEqual([1, 2, 3])
  })

  it('respects concurrency limit', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    let maxActive = 0
    let currentActive = 0
    const tasks = Array.from({ length: 6 }, (_, i) =>
      pool.submit(async () => {
        currentActive++
        if (currentActive > maxActive) maxActive = currentActive
        await new Promise(r => setTimeout(r, 20))
        currentActive--
        return i
      })
    )
    await Promise.all(tasks)
    expect(maxActive).toBeLessThanOrEqual(2)
  })

  it('reports available slots', () => {
    const pool = new ThreadPool({ maxConcurrency: 3 })
    expect(pool.available).toBe(3)
  })

  it('handles non-Error throws', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw 'string error' })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('string error')
    }
  })

  it('handles sync function', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => 'sync result')
    expect(outcome.error).toBe(false)
    if (!outcome.error) expect(outcome.result).toBe('sync result')
  })

  it('tracks duration', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => {
      await new Promise(r => setTimeout(r, 10))
      return 1
    })
    expect(outcome.error).toBe(false)
    if (!outcome.error) expect(outcome.duration).toBeGreaterThanOrEqual(0)
  })

  it('handles many sequential tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let sum = 0
    for (let i = 0; i < 10; i++) {
      const outcome = await pool.submit(async () => i)
      if (!outcome.error) sum += outcome.result
    }
    expect(sum).toBe(45)
  })

  it('handles single task pool', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    const outcome = await pool.submit(async () => 42)
    expect(outcome.error).toBe(false)
    if (!outcome.error) expect(outcome.result).toBe(42)
  })

  it('handles error in task', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw new Error('fail') })
    expect(outcome.error).toBe(true)
    if (outcome.error) expect(outcome.message).toBe('fail')
  })

  it('handles zero tasks gracefully', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    expect(pool.available).toBe(2)
  })

  it('runs single task via submit', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => 42)
    expect(outcome.result).toBe(42)
  })

  it('submit returns duration', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => 99)
    expect(typeof outcome.duration).toBe('number')
  })

  it('submit resolves with correct value', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => 'hello')
    expect(outcome.result).toBe('hello')
  })

  it('submit multiple tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 3 })
    const results = await Promise.all([
      pool.submit(async () => 1),
      pool.submit(async () => 2),
      pool.submit(async () => 3),
    ])
    expect(results.map(r => r.result).sort()).toEqual([1, 2, 3])
  })

  it('pool with single thread processes sequentially', async () => {
    const pool = new ThreadPool(1)
    const results = await Promise.all([
      pool.submit(async () => 10),
    ])
    expect(results[0]!.result).toBe(10)
  })

  it('handles single task submission', async () => {
    const pool = new ThreadPool(1)
    const result = await pool.submit(async () => 42)
    expect(result.result).toBe(42)
  })
})
