import { describe, expect, it } from 'vitest'

import { ThreadPool } from '../../../src/utils/thread-pool.js'

describe('ThreadPool', () => {
  it('executes a single task', async () => {
    const pool = new ThreadPool()
    const result = await pool.submit(() => Promise.resolve(42))
    expect(result.error).toBe(false)
    if (!result.error) {
      expect(result.result).toBe(42)
    }
  })

  it('tracks duration', async () => {
    const pool = new ThreadPool()
    const result = await pool.submit(() => Promise.resolve('done'))
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('handles task errors', async () => {
    const pool = new ThreadPool()
    const result = await pool.submit(() => Promise.reject(new Error('boom')))
    expect(result.error).toBe(true)
    if (result.error) {
      expect(result.message).toBe('boom')
    }
  })

  it('handles non-Error rejections', async () => {
    const pool = new ThreadPool()
    const result = await pool.submit(() => Promise.reject('string error'))
    expect(result.error).toBe(true)
    if (result.error) {
      expect(result.message).toBe('string error')
    }
  })

  it('executes multiple tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const results = await Promise.all([
      pool.submit(() => Promise.resolve(1)),
      pool.submit(() => Promise.resolve(2)),
      pool.submit(() => Promise.resolve(3)),
    ])
    const values = results
      .filter((r) => !r.error)
      .map((r) => (r as { result: number }).result)
    expect(values.sort()).toEqual([1, 2, 3])
  })

  it('respects maxConcurrency', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let maxConcurrent = 0
    let current = 0

    const tasks = Array.from({ length: 5 }, (_, i) =>
      pool.submit(async () => {
        current++
        if (current > maxConcurrent) maxConcurrent = current
        await new Promise((resolve) => setTimeout(resolve, 10))
        current--
        return i
      }),
    )

    await Promise.all(tasks)
    expect(maxConcurrent).toBeLessThanOrEqual(1)
  })

  it('queues tasks when at capacity', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    const order: number[] = []

    const task = (id: number) =>
      pool.submit(async () => {
        order.push(id)
        await new Promise((resolve) => setTimeout(resolve, 5))
        return id
      })

    const promises = [task(1), task(2), task(3)]
    await Promise.all(promises)
    expect(order).toEqual([1, 2, 3])
  })

  it('reports active count', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    expect(pool.active).toBe(0)
    expect(pool.available).toBe(2)
    expect(pool.maxSlots).toBe(2)
  })

  it('reports pending count', () => {
    const pool = new ThreadPool()
    expect(pool.pending).toBe(0)
  })

  it('uses default concurrency of 4', () => {
    const pool = new ThreadPool()
    expect(pool.maxSlots).toBe(4)
  })

  it('handles mixed success and failure', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const results = await Promise.all([
      pool.submit(() => Promise.resolve('ok')),
      pool.submit(() => Promise.reject(new Error('fail'))),
    ])
    expect(results[0]!.error).toBe(false)
    expect(results[1]!.error).toBe(true)
  })
})
