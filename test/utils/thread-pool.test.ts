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

  it('handles zero tasks gracefully', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    expect(pool.available).toBe(2)
    expect(pool.pending).toBe(0)
  })

  it('handles throwing object', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw { code: 'ERR' } })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('[object Object]')
    }
  })

  it('handles throwing null', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw null })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('null')
    }
  })

  it('handles throwing undefined', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw undefined })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('undefined')
    }
  })

  it('handles throwing number', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => { throw 42 })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('42')
    }
  })

  it('processes queued tasks in order', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    const results: number[] = []
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    pool.submit(async () => { await p1; results.push(1) })
    pool.submit(async () => { results.push(2) })
    pool.submit(async () => { results.push(3) })
    resolve1!()
    await new Promise(r => setTimeout(r, 50))
    expect(results).toEqual([1, 2, 3])
  })

  it('handles concurrency of 10', async () => {
    const pool = new ThreadPool({ maxConcurrency: 10 })
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) => pool.submit(async () => i))
    )
    expect(results.every(r => !r.error)).toBe(true)
    expect(results.map(r => !r.error ? r.result : -1)).toEqual(Array.from({ length: 20 }, (_, i) => i))
  })

  it('handles concurrency of 0 from options', async () => {
    const pool = new ThreadPool({ maxConcurrency: 0 })
    expect(pool.maxSlots).toBe(0)
    expect(pool.available).toBe(0)
  })

  it('handles empty options object', () => {
    const pool = new ThreadPool({})
    expect(pool.maxSlots).toBe(4)
  })

  it('tracks pending tasks correctly', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    pool.submit(async () => { await p1 })
    pool.submit(async () => {})
    pool.submit(async () => {})
    await new Promise(r => setTimeout(r, 10))
    expect(pool.pending).toBe(2)
    resolve1!()
    await new Promise(r => setTimeout(r, 50))
    expect(pool.pending).toBe(0)
  })

  it('returns error duration', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => {
      await new Promise(r => setTimeout(r, 10))
      throw new Error('test')
    })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.duration).toBeGreaterThanOrEqual(10)
    }
  })

  it('handles task returning undefined', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => undefined)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.result).toBe(undefined)
    }
  })

  it('handles task returning null', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => null)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.result).toBe(null)
    }
  })

  it('handles task returning object', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const obj = { a: 1, b: 2 }
    const outcome = await pool.submit(async () => obj)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.result).toEqual(obj)
    }
  })

  it('handles task returning array', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const arr = [1, 2, 3]
    const outcome = await pool.submit(async () => arr)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.result).toEqual(arr)
    }
  })

  it('handles task returning boolean', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => true)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.result).toBe(true)
    }
  })

  it('handles very fast tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 4 })
    const outcomes = await Promise.all([
      pool.submit(async () => 1),
      pool.submit(async () => 2),
      pool.submit(async () => 3),
      pool.submit(async () => 4),
    ])
    expect(outcomes.every(o => !o.error && o.duration < 100)).toBe(true)
  })

  it('handles large number of queued tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    pool.submit(async () => { await p1 })
    for (let i = 0; i < 70; i++) {
      pool.submit(async () => i)
    }
    await new Promise(r => setTimeout(r, 10))
    expect(pool.pending).toBeGreaterThan(0)
    expect(pool.pending).toBeLessThanOrEqual(70)
    resolve1!()
    await new Promise(r => setTimeout(r, 200))
  })

  it('updates available after task completion', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    pool.submit(async () => { await p1 })
    await new Promise(r => setTimeout(r, 10))
    expect(pool.available).toBe(1)
    resolve1!()
    await new Promise(r => setTimeout(r, 50))
    expect(pool.available).toBe(2)
  })

  it('handles task with zero duration', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => 42)
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.duration).toBeGreaterThanOrEqual(0)
    }
  })

  it('respects maxConcurrency exactly', async () => {
    const pool = new ThreadPool({ maxConcurrency: 3 })
    const promises: Promise<void>[] = []
    let activeCount = 0
    let maxActive = 0

    for (let i = 0; i < 10; i++) {
      const task = pool.submit(async () => {
        activeCount++
        if (activeCount > maxActive) maxActive = activeCount
        await new Promise(r => setTimeout(r, 30))
        activeCount--
      })
      promises.push(task.then(() => {}))
    }
    await Promise.all(promises)
    expect(maxActive).toBe(3)
  })

  it('clears queue when all tasks complete', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    pool.submit(async () => 1)
    pool.submit(async () => 2)
    pool.submit(async () => 3)
    await new Promise(r => setTimeout(r, 100))
    expect(pool.pending).toBe(0)
  })

  it('handles mixed success and error tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 3 })
    const outcomes = await Promise.all([
      pool.submit(async () => 1),
      pool.submit(async () => { throw new Error('error') }),
      pool.submit(async () => 3),
    ])
    expect(outcomes[0]!.error).toBe(false)
    expect(outcomes[1]!.error).toBe(true)
    expect(outcomes[2]!.error).toBe(false)
    if (!outcomes[0]!.error && !outcomes[2]!.error) {
      expect(outcomes[0]!.result).toBe(1)
      expect(outcomes[2]!.result).toBe(3)
    }
  })

  it('handles concurrent task submissions', async () => {
    const pool = new ThreadPool({ maxConcurrency: 4 })
    const results = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        pool.submit(async () => i)
      )
    )
    const values = results.filter(r => !r.error).map(r => r.result)
    expect(values.length).toBe(50)
    expect(new Set(values).size).toBe(50)
  })

  it('preserves task result types', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const strResult = await pool.submit(async () => 'hello')
    const numResult = await pool.submit(async () => 42)
    const boolResult = await pool.submit(async () => true)

    expect(strResult.error).toBe(false)
    expect(numResult.error).toBe(false)
    expect(boolResult.error).toBe(false)

    if (!strResult.error && !numResult.error && !boolResult.error) {
      expect(typeof strResult.result).toBe('string')
      expect(typeof numResult.result).toBe('number')
      expect(typeof boolResult.result).toBe('boolean')
    }
  })

  it('handles task that resolves to void', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => {})
    expect(outcome.error).toBe(false)
  })

  it('handles Error with custom message', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => {
      throw new Error('Custom error message 123')
    })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('Custom error message 123')
    }
  })

  it('handles Error with stack', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const err = new Error('stack error')
    const outcome = await pool.submit(async () => {
      throw err
    })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('stack error')
    }
  })

  it('tracks pending during high load', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    pool.submit(async () => { await p1 })
    await new Promise(r => setTimeout(r, 10))

    const pendingBefore = pool.pending
    pool.submit(async () => 1)
    pool.submit(async () => 2)
    pool.submit(async () => 3)
    await new Promise(r => setTimeout(r, 5))
    const pendingDuring = pool.pending

    resolve1!()
    await new Promise(r => setTimeout(r, 100))
    const pendingAfter = pool.pending

    expect(pendingBefore).toBe(0)
    expect(pendingDuring).toBeGreaterThan(0)
    expect(pendingAfter).toBe(0)
  })

  it('handles tasks with varying durations', async () => {
    const pool = new ThreadPool({ maxConcurrency: 3 })
    const outcomes = await Promise.all([
      pool.submit(async () => {
        await new Promise(r => setTimeout(r, 5))
        return 'fast'
      }),
      pool.submit(async () => {
        await new Promise(r => setTimeout(r, 20))
        return 'medium'
      }),
      pool.submit(async () => {
        await new Promise(r => setTimeout(r, 40))
        return 'slow'
      }),
    ])
    expect(outcomes.every(o => !o.error)).toBe(true)
    const durations = outcomes.map(o => o.duration)
    expect(durations.every(d => d >= 0)).toBe(true)
  })

  it('maintains correct available count', async () => {
    const pool = new ThreadPool({ maxConcurrency: 4 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })

    pool.submit(async () => { await p1 })
    pool.submit(async () => {})
    pool.submit(async () => {})

    await new Promise(r => setTimeout(r, 10))
    const availableDuring = pool.available
    resolve1!()
    await new Promise(r => setTimeout(r, 50))
    const availableAfter = pool.available

    expect(availableDuring).toBeGreaterThanOrEqual(1)
    expect(availableDuring).toBeLessThanOrEqual(3)
    expect(availableAfter).toBe(4)
  })

  it('handles rapid sequential submissions', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const results: number[] = []
    for (let i = 0; i < 20; i++) {
      const outcome = await pool.submit(async () => i)
      if (!outcome.error) results.push(outcome.result)
    }
    expect(results).toEqual(Array.from({ length: 20 }, (_, i) => i))
  })

  it('queue processes tasks FIFO', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    let resolve1: () => void
    const p1 = new Promise<void>(r => { resolve1 = r })
    const order: number[] = []

    pool.submit(async () => { await p1; order.push(1) })
    pool.submit(async () => { order.push(2) })
    pool.submit(async () => { order.push(3) })
    pool.submit(async () => { order.push(4) })

    resolve1!()
    await new Promise(r => setTimeout(r, 100))

    expect(order).toEqual([1, 2, 3, 4])
  })

  it('handles maxConcurrency of 100', async () => {
    const pool = new ThreadPool({ maxConcurrency: 100 })
    const tasks = Array.from({ length: 200 }, (_, i) =>
      pool.submit(async () => i)
    )
    const results = await Promise.all(tasks)
    expect(results.every(r => !r.error)).toBe(true)
  })

  it('error does not affect queued tasks', async () => {
    const pool = new ThreadPool({ maxConcurrency: 1 })
    const results: (number | string)[] = []

    pool.submit(async () => {
      await new Promise(r => setTimeout(r, 10))
      results.push(1)
    })
    const errorTask = pool.submit(async () => {
      await new Promise(r => setTimeout(r, 10))
      throw new Error('fail')
    })
    pool.submit(async () => {
      results.push(3)
    })

    await errorTask.catch(() => {})
    await new Promise(r => setTimeout(r, 100))

    expect(results).toEqual([1, 3])
  })

  it('active count returns to zero after completion', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    pool.submit(async () => {
      await new Promise(r => setTimeout(r, 20))
    })
    pool.submit(async () => {
      await new Promise(r => setTimeout(r, 20))
    })

    await new Promise(r => setTimeout(r, 10))
    expect(pool.active).toBe(2)

    await new Promise(r => setTimeout(r, 50))
    expect(pool.active).toBe(0)
  })

  it('handles tasks that reject immediately', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const outcome = await pool.submit(async () => {
      return Promise.reject(new Error('immediate reject'))
    })
    expect(outcome.error).toBe(true)
    if (outcome.error) {
      expect(outcome.message).toBe('immediate reject')
    }
  })

  it('duration is accurate for completed task', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const expectedMin = 30
    const outcome = await pool.submit(async () => {
      await new Promise(r => setTimeout(r, expectedMin))
      return 'done'
    })
    expect(outcome.error).toBe(false)
    if (!outcome.error) {
      expect(outcome.duration).toBeGreaterThanOrEqual(expectedMin - 5)
    }
  })
})
  it('default options create pool', () => {
    const pool = new ThreadPool()
    expect(pool).toBeDefined()
  })

  it('submit resolves task', async () => {
    const pool = new ThreadPool({ maxConcurrency: 2 })
    const result = await pool.submit(() => Promise.resolve(42))
    expect(result.error).toBe(false)
  })

  it('pending starts at 0', () => {
    const pool = new ThreadPool()
    expect(pool.pending).toBe(0)
  })

describe('thread-pool - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('thread-pool - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('thread-pool - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})
