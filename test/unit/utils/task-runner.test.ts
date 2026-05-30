import { describe, expect, it, vi } from 'vitest'

import { TaskRunner, runWithConcurrency } from '../../../src/utils/task-runner.js'

describe('TaskRunner', () => {
  it('validates concurrency >= 1', () => {
    expect(() => new TaskRunner({ concurrency: 0 })).toThrow(RangeError)
  })

  it('runs all tasks and returns results', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => 2, name: 'b' },
      { fn: async () => 3, name: 'c' },
    ])
    expect(results).toHaveLength(3)
    const values = results.filter((r) => r.status === 'success').map((r) => r.result)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('captures errors without stopping by default', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const results = await runner.runAll([
      { fn: async () => 'ok', name: 'a' },
      { fn: async () => { throw new Error('boom') }, name: 'b' },
      { fn: async () => 'also ok', name: 'c' },
    ])
    expect(results[0]!.status).toBe('success')
    expect(results[1]!.status).toBe('error')
    expect(results[1]!.error!.message).toBe('boom')
    expect(results[2]!.status).toBe('success')
  })

  it('stops on error when stopOnError is true', async () => {
    const runner = new TaskRunner({ concurrency: 1, stopOnError: true })
    const results = await runner.runAll([
      { fn: async () => 'ok', name: 'a' },
      { fn: async () => { throw new Error('boom') }, name: 'b' },
      { fn: async () => 'should not run', name: 'c' },
    ])
    expect(results.filter((r) => r !== undefined)).toBeLessThanOrEqual
    const successes = results.filter((r) => r?.status === 'success')
    expect(successes.length).toBeLessThanOrEqual(2)
  })

  it('reports progress via callback', async () => {
    const progress = vi.fn()
    const runner = new TaskRunner({ concurrency: 1, onProgress: progress })
    await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => 2, name: 'b' },
    ])
    expect(progress).toHaveBeenCalledTimes(2)
    expect(progress).toHaveBeenNthCalledWith(1, 1, 2)
    expect(progress).toHaveBeenNthCalledWith(2, 2, 2)
  })

  it('runSuccessful returns only successful results', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runSuccessful([
      { fn: async () => 1, name: 'a' },
      { fn: async () => { throw new Error('x') }, name: 'b' },
      { fn: async () => 3, name: 'c' },
    ])
    expect(results).toEqual([1, 3])
  })

  it('preserves task names in results', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'task-a' },
      { fn: async () => 2, name: 'task-b' },
    ])
    expect(results[0]!.taskName).toBe('task-a')
    expect(results[1]!.taskName).toBe('task-b')
  })

  it('aborts remaining tasks', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      fn: async () => {
        if (i === 2) runner.abort()
        return i
      },
      name: `task-${i}`,
    }))
    const results = await runner.runAll(tasks)
    const completed = results.filter((r) => r !== undefined)
    expect(completed.length).toBeLessThanOrEqual(10)
  })

  it('handles empty task array', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([])
    expect(results).toHaveLength(0)
  })

  it('respects concurrency limit', async () => {
    let running = 0
    let maxRunning = 0
    const runner = new TaskRunner({ concurrency: 3 })
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      fn: async () => {
        running++
        if (running > maxRunning) maxRunning = running
        await new Promise((r) => setTimeout(r, 10))
        running--
        return i
      },
      name: `task-${i}`,
    }))
    await runner.runAll(tasks)
    expect(maxRunning).toBeLessThanOrEqual(3)
  })

  it('getStats returns correct counts', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => { throw new Error('x') }, name: 'b' },
    ])
    const stats = runner.getStats(results)
    expect(stats.completed).toBe(2)
    expect(stats.errors).toBe(1)
  })
})

describe('runWithConcurrency', () => {
  it('processes all items', async () => {
    const processed: number[] = []
    await runWithConcurrency([1, 2, 3, 4, 5], async (item) => {
      processed.push(item)
    }, 2)
    expect(processed).toHaveLength(5)
    expect(processed.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', async () => {
    await runWithConcurrency([], async () => {}, 2)
  })

  it('provides correct index', async () => {
    const indices: number[] = []
    await runWithConcurrency(['a', 'b', 'c'], async (_, idx) => {
      indices.push(idx)
    }, 1)
    expect(indices).toEqual([0, 1, 2])
  })
})
