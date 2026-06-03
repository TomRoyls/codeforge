import { describe, it, expect } from 'vitest'
import { TaskRunner, runWithConcurrency } from '../../src/utils/task-runner.js'

describe('TaskRunner', () => {
  it('runs all tasks successfully', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => 2, name: 'b' },
      { fn: async () => 3, name: 'c' },
    ])
    expect(results.length).toBe(3)
    expect(results.every(r => r.status === 'success')).toBe(true)
  })

  it('returns results in correct order', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const results = await runner.runAll([
      { fn: async () => 'first', name: 'a' },
      { fn: async () => 'second', name: 'b' },
    ])
    expect(results[0]!.result).toBe('first')
    expect(results[1]!.result).toBe('second')
  })

  it('handles task errors', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'ok' },
      { fn: async () => { throw new Error('fail') }, name: 'bad' },
      { fn: async () => 3, name: 'ok2' },
    ])
    expect(results[0]!.status).toBe('success')
    expect(results[1]!.status).toBe('error')
    expect(results[1]!.error!.message).toBe('fail')
    expect(results[2]!.status).toBe('success')
  })

  it('stopOnError stops further execution', async () => {
    const runner = new TaskRunner({ concurrency: 1, stopOnError: true })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => { throw new Error('stop') }, name: 'b' },
      { fn: async () => 3, name: 'c' },
    ])
    expect(results[1]!.status).toBe('error')
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

  it('calls onProgress callback', async () => {
    const progress: Array<[number, number]> = []
    const runner = new TaskRunner({
      concurrency: 1,
      onProgress: (c, t) => progress.push([c, t]),
    })
    await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => 2, name: 'b' },
    ])
    expect(progress.length).toBe(2)
    expect(progress[0]!).toEqual([1, 2])
    expect(progress[1]!).toEqual([2, 2])
  })

  it('computes stats', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'a' },
      { fn: async () => { throw new Error('x') }, name: 'b' },
    ])
    const stats = runner.getStats(results)
    expect(stats.completed).toBe(2)
    expect(stats.errors).toBe(1)
    expect(stats.total).toBe(2)
  })

  it('aborts running tasks', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const resultsP = runner.runAll([
      { fn: async () => { await new Promise(r => setTimeout(r, 10)); return 1 }, name: 'a' },
      { fn: async () => 2, name: 'b' },
    ])
    runner.abort()
    expect(runner.isAborted).toBe(true)
    await resultsP
  })

  it('handles empty task list', async () => {
    const runner = new TaskRunner({ concurrency: 2 })
    const results = await runner.runAll([])
    expect(results.length).toBe(0)
  })

  it('throws on invalid concurrency', () => {
    expect(() => new TaskRunner({ concurrency: 0 })).toThrow(RangeError)
  })

  it('taskName is preserved in results', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const results = await runner.runAll([
      { fn: async () => 1, name: 'task-1' },
      { fn: async () => 2, name: 'task-2' },
    ])
    expect(results[0]!.taskName).toBe('task-1')
    expect(results[1]!.taskName).toBe('task-2')
  })
})

describe('runWithConcurrency', () => {
  it('runs items with concurrency', async () => {
    const order: number[] = []
    await runWithConcurrency([1, 2, 3], async (item) => {
      order.push(item)
    }, 2)
    expect(order.sort()).toEqual([1, 2, 3])
  })

  it('handles empty array', async () => {
    await runWithConcurrency([], async () => {}, 2)
  })

  it('respects concurrency limit', async () => {
    let active = 0
    let maxActive = 0
    await runWithConcurrency([1, 2, 3, 4, 5], async () => {
      active++
      if (active > maxActive) maxActive = active
      await new Promise(r => setTimeout(r, 10))
      active--
    }, 2)
    expect(maxActive).toBeLessThanOrEqual(2)
  })

  it('handles errors in tasks gracefully', async () => {
    const runner = new TaskRunner({ concurrency: 1 })
    const results = await runner.runAll([
      { fn: async () => { throw new Error('boom') }, name: 'fail' },
      { fn: async () => 42, name: 'ok' },
    ])
    expect(results.length).toBe(2)
  })

  it('runWithConcurrency handles single item', async () => {
    let called = false
    await runWithConcurrency([1], async () => { called = true }, 1)
    expect(called).toBe(true)
  })

  it('processes empty array', async () => {
    const results: number[] = []
    await runWithConcurrency([], async (x) => { results.push(x) }, 2)
    expect(results).toEqual([])
  })

  it('single task completes', async () => {
    const results: number[] = []
    await runWithConcurrency([42], async (x) => { results.push(x) }, 2)
    expect(results).toEqual([42])
  })

  it('respects concurrency limit', async () => {
    const order: number[] = []
    await runWithConcurrency([1, 2, 3, 4], async (x) => { order.push(x) }, 2)
    expect(order.length).toBe(4)
  })

  it('empty array completes immediately', async () => {
    const order: number[] = []
    await runWithConcurrency([], async (x) => { order.push(x) }, 2)
    expect(order.length).toBe(0)
  })

  it('runs single task', async () => {
    const order: number[] = []
    await runWithConcurrency([42], async (x) => { order.push(x) }, 2)
    expect(order).toEqual([42])
  })

  it('handles empty task list', async () => {
    const order: number[] = []
    await runWithConcurrency([], async (x) => { order.push(x) }, 2)
    expect(order).toEqual([])
  })
})
