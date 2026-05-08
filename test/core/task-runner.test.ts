import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskQueue } from '../../src/core/task-runner/task-queue.js'
import { TaskScheduler } from '../../src/core/task-runner/task-scheduler.js'
import { TaskRunner } from '../../src/core/task-runner/task-runner.js'
import { DEFAULT_SCHEDULER_CONFIG } from '../../src/core/task-runner/types.js'
import type { Task, TaskResult } from '../../src/core/task-runner/types.js'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 't1',
    name: overrides.name ?? 'test task',
    handler: overrides.handler ?? (() => 42),
    dependencies: overrides.dependencies ?? [],
    priority: overrides.priority ?? 0,
    timeout: overrides.timeout ?? 5000,
    retries: overrides.retries ?? 0,
    retryDelay: overrides.retryDelay ?? 10,
    status: overrides.status ?? 'pending',
    createdAt: overrides.createdAt ?? Date.now(),
  }
}

describe('TaskQueue', () => {
  let queue: TaskQueue

  beforeEach(() => {
    queue = new TaskQueue()
  })

  it('should enqueue a task', () => {
    const task = makeTask({ id: 'a' })
    queue.enqueue(task)
    expect(queue.size()).toBe(1)
  })

  it('should dequeue a task in FIFO order', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    const first = queue.dequeue()
    expect(first!.id).toBe('a')
    const second = queue.dequeue()
    expect(second!.id).toBe('b')
  })

  it('should return null when dequeuing from empty queue', () => {
    expect(queue.dequeue()).toBeNull()
  })

  it('should peek at front task without removing it', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    const peeked = queue.peek()
    expect(peeked!.id).toBe('a')
    expect(queue.size()).toBe(1)
  })

  it('should return null when peeking empty queue', () => {
    expect(queue.peek()).toBeNull()
  })

  it('should remove a task by id', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    expect(queue.remove('a')).toBe(true)
    expect(queue.size()).toBe(1)
    expect(queue.get('a')).toBeNull()
  })

  it('should return false when removing non-existent task', () => {
    expect(queue.remove('nonexistent')).toBe(false)
  })

  it('should get a task by id', () => {
    const task = makeTask({ id: 'a' })
    queue.enqueue(task)
    expect(queue.get('a')!.id).toBe('a')
  })

  it('should return null for non-existent get', () => {
    expect(queue.get('nonexistent')).toBeNull()
  })

  it('should get all tasks in order', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    const all = queue.getAll()
    expect(all).toHaveLength(2)
    expect(all[0]!.id).toBe('a')
    expect(all[1]!.id).toBe('b')
  })

  it('should get tasks by status', () => {
    queue.enqueue(makeTask({ id: 'a', status: 'pending' }))
    queue.enqueue(makeTask({ id: 'b', status: 'running' }))
    queue.enqueue(makeTask({ id: 'c', status: 'pending' }))
    const pending = queue.getByStatus('pending')
    expect(pending).toHaveLength(2)
  })

  it('should return empty array for no matching status', () => {
    queue.enqueue(makeTask({ id: 'a', status: 'pending' }))
    expect(queue.getByStatus('completed')).toHaveLength(0)
  })

  it('should report correct size', () => {
    expect(queue.size()).toBe(0)
    queue.enqueue(makeTask())
    expect(queue.size()).toBe(1)
  })

  it('should clear all tasks', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    queue.clear()
    expect(queue.size()).toBe(0)
    expect(queue.getAll()).toEqual([])
  })

  it('should sort by priority descending', () => {
    queue.enqueue(makeTask({ id: 'a', priority: 1 }))
    queue.enqueue(makeTask({ id: 'b', priority: 5 }))
    queue.enqueue(makeTask({ id: 'c', priority: 3 }))
    queue.sortByPriority()
    const all = queue.getAll()
    expect(all[0]!.id).toBe('b')
    expect(all[1]!.id).toBe('c')
    expect(all[2]!.id).toBe('a')
  })
})

describe('TaskScheduler', () => {
  let scheduler: TaskScheduler

  beforeEach(() => {
    scheduler = new TaskScheduler()
  })

  it('should schedule a single task', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    expect(scheduler.getReadyTasks()).toHaveLength(1)
  })

  it('should schedule many tasks', () => {
    scheduler.scheduleMany([
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c' }),
    ])
    expect(scheduler.getReadyTasks()).toHaveLength(3)
  })

  it('should return ready tasks with no dependencies', () => {
    scheduler.scheduleMany([
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
    ])
    const ready = scheduler.getReadyTasks()
    expect(ready).toHaveLength(2)
  })

  it('should not return tasks with unmet dependencies as ready', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    const ready = scheduler.getReadyTasks()
    expect(ready).toHaveLength(1)
    expect(ready[0]!.id).toBe('a')
  })

  it('should return tasks as ready after dependencies complete', () => {
    const taskA = makeTask({ id: 'a' })
    const taskB = makeTask({ id: 'b', dependencies: ['a'] })
    scheduler.scheduleMany([taskA, taskB])

    expect(scheduler.getReadyTasks()).toHaveLength(1)

    taskA.status = 'completed'
    const ready = scheduler.getReadyTasks()
    expect(ready).toHaveLength(1)
    expect(ready[0]!.id).toBe('b')
  })

  it('should resolve topological order for independent tasks', () => {
    scheduler.scheduleMany([
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c' }),
    ])
    const order = scheduler.resolveOrder()
    expect(order).toContain('a')
    expect(order).toContain('b')
    expect(order).toContain('c')
  })

  it('should resolve topological order respecting dependencies', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    scheduler.schedule(makeTask({ id: 'c', dependencies: ['b'] }))
    const order = scheduler.resolveOrder()
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'))
  })

  it('should resolve diamond dependency pattern', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    scheduler.schedule(makeTask({ id: 'c', dependencies: ['a'] }))
    scheduler.schedule(makeTask({ id: 'd', dependencies: ['b', 'c'] }))
    const order = scheduler.resolveOrder()
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'))
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'))
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'))
  })

  it('should detect cycles', () => {
    scheduler.schedule(makeTask({ id: 'a', dependencies: ['b'] }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    const cycles = scheduler.detectCycles()
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('should detect three-node cycle', () => {
    scheduler.schedule(makeTask({ id: 'a', dependencies: ['c'] }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    scheduler.schedule(makeTask({ id: 'c', dependencies: ['b'] }))
    const cycles = scheduler.detectCycles()
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('should return empty cycles for acyclic graph', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    expect(scheduler.detectCycles()).toEqual([])
  })

  it('should report blocked task', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    expect(scheduler.isBlocked('b')).toBe(true)
  })

  it('should not report unblocked task as blocked', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    expect(scheduler.isBlocked('a')).toBe(false)
  })

  it('should not report non-pending task as blocked', () => {
    scheduler.schedule(makeTask({ id: 'a', status: 'running' }))
    expect(scheduler.isBlocked('a')).toBe(false)
  })

  it('should return false for non-existent task in isBlocked', () => {
    expect(scheduler.isBlocked('nonexistent')).toBe(false)
  })

  it('should get blockers for a task', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    expect(scheduler.getBlockers('b')).toEqual(['a'])
  })

  it('should return empty blockers for unblocked task', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    expect(scheduler.getBlockers('a')).toEqual([])
  })

  it('should return empty blockers for non-existent task', () => {
    expect(scheduler.getBlockers('nonexistent')).toEqual([])
  })

  it('should get dependents of a task', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    scheduler.schedule(makeTask({ id: 'b', dependencies: ['a'] }))
    scheduler.schedule(makeTask({ id: 'c', dependencies: ['a'] }))
    const deps = scheduler.getDependents('a')
    expect(deps).toContain('b')
    expect(deps).toContain('c')
  })

  it('should return empty dependents for leaf task', () => {
    scheduler.schedule(makeTask({ id: 'a' }))
    expect(scheduler.getDependents('a')).toEqual([])
  })
})

describe('TaskRunner', () => {
  let runner: TaskRunner

  beforeEach(() => {
    runner = new TaskRunner()
  })

  describe('addTask', () => {
    it('should add a task and return its id', () => {
      const id = runner.addTask('test', () => 42)
      expect(id).toBe('task-1')
    })

    it('should generate sequential ids', () => {
      const id1 = runner.addTask('first', () => 1)
      const id2 = runner.addTask('second', () => 2)
      expect(id1).toBe('task-1')
      expect(id2).toBe('task-2')
    })

    it('should use custom id when provided', () => {
      const id = runner.addTask('test', () => 42, { id: 'custom-id' })
      expect(id).toBe('custom-id')
    })

    it('should use default config values', () => {
      runner.addTask('test', () => 42)
      const config = runner.getConfig()
      expect(config.defaultTimeout).toBe(DEFAULT_SCHEDULER_CONFIG.defaultTimeout)
      expect(config.defaultRetries).toBe(DEFAULT_SCHEDULER_CONFIG.defaultRetries)
    })
  })

  describe('addDependency', () => {
    it('should add a dependency between tasks', async () => {
      const order: string[] = []
      const idA = runner.addTask('a', () => { order.push('a') })
      const idB = runner.addTask('b', () => { order.push('b') })
      runner.addDependency(idB, idA)
      await runner.run()
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    })

    it('should not duplicate dependencies', () => {
      const idA = runner.addTask('a', () => 1)
      const idB = runner.addTask('b', () => 2)
      runner.addDependency(idB, idA)
      runner.addDependency(idB, idA)
      const config = runner.getConfig()
      expect(config).toBeTruthy()
    })
  })

  describe('run', () => {
    it('should execute a single task', async () => {
      runner.addTask('test', () => 42)
      const results = await runner.run()
      expect(results).toHaveLength(1)
      expect(results[0]!.status).toBe('completed')
      expect(results[0]!.result).toBe(42)
    })

    it('should execute multiple independent tasks', async () => {
      runner.addTask('a', () => 1)
      runner.addTask('b', () => 2)
      runner.addTask('c', () => 3)
      const results = await runner.run()
      expect(results).toHaveLength(3)
      const completed = results.filter((r) => r.status === 'completed')
      expect(completed).toHaveLength(3)
    })

    it('should execute async tasks', async () => {
      runner.addTask('async', async () => {
        await new Promise((r) => setTimeout(r, 10))
        return 'done'
      })
      const results = await runner.run()
      expect(results[0]!.status).toBe('completed')
      expect(results[0]!.result).toBe('done')
    })

    it('should handle task failures', async () => {
      runner.addTask('fail', () => {
        throw new Error('boom')
      })
      const results = await runner.run()
      expect(results[0]!.status).toBe('failed')
      expect(results[0]!.error).toBe('boom')
    })

    it('should handle async task failures', async () => {
      runner.addTask('async-fail', async () => {
        throw new Error('async boom')
      })
      const results = await runner.run()
      expect(results[0]!.status).toBe('failed')
      expect(results[0]!.error).toBe('async boom')
    })

    it('should respect dependency order', async () => {
      const order: string[] = []
      const idA = runner.addTask('a', () => { order.push('a') })
      const idB = runner.addTask('b', () => { order.push('b'); return 'b' }, { dependencies: [idA] })
      void idB
      await runner.run()
      expect(order).toEqual(['a', 'b'])
    })

    it('should execute tasks with retry on failure', async () => {
      let attempts = 0
      runner.addTask(
        'retry',
        () => {
          attempts++
          if (attempts < 3) throw new Error('not yet')
          return 'success'
        },
        { retries: 3 }
      )
      const results = await runner.run()
      expect(results[0]!.status).toBe('completed')
      expect(results[0]!.result).toBe('success')
      expect(results[0]!.retries).toBe(2)
    })

    it('should fail after all retries exhausted', async () => {
      runner.addTask(
        'always-fail',
        () => {
          throw new Error('always fails')
        },
        { retries: 2 }
      )
      const results = await runner.run()
      expect(results[0]!.status).toBe('failed')
      expect(results[0]!.retries).toBe(2)
    })

    it('should timeout long-running tasks', async () => {
      runner.addTask(
        'slow',
        async () => {
          await new Promise((r) => setTimeout(r, 500))
          return 'done'
        },
        { timeout: 50 }
      )
      const results = await runner.run()
      expect(results[0]!.status).toBe('timeout')
    })

    it('should return empty results for no tasks', async () => {
      const results = await runner.run()
      expect(results).toEqual([])
    })

    it('should throw on circular dependencies', async () => {
      const idA = runner.addTask('a', () => 1)
      const idB = runner.addTask('b', () => 2, { dependencies: [idA] })
      runner.addDependency(idA, idB)
      await expect(runner.run()).rejects.toThrow('Circular dependencies detected')
    })
  })

  describe('runSingle', () => {
    it('should execute a single task by id', async () => {
      const id = runner.addTask('single', () => 99)
      const result = await runner.runSingle(id)
      expect(result.status).toBe('completed')
      expect(result.result).toBe(99)
    })

    it('should return failed result for non-existent task', async () => {
      const result = await runner.runSingle('nonexistent')
      expect(result.status).toBe('failed')
      expect(result.error).toContain('not found')
    })

    it('should handle failure in single task', async () => {
      const id = runner.addTask('fail', () => {
        throw new Error('nope')
      })
      const result = await runner.runSingle(id)
      expect(result.status).toBe('failed')
      expect(result.error).toBe('nope')
    })
  })

  describe('cancel', () => {
    it('should cancel a pending task', async () => {
      const id = runner.addTask('cancel-me', () => 42)
      expect(runner.cancel(id)).toBe(true)
      const results = await runner.run()
      const task = results.find((r) => r.taskId === id)
      expect(task!.status).toBe('skipped')
    })

    it('should return false for non-existent task', () => {
      expect(runner.cancel('nonexistent')).toBe(false)
    })

    it('should cancel dependent tasks when using failFast', async () => {
      const failRunner = new TaskRunner({ failFast: true })
      const idA = failRunner.addTask('a', () => { throw new Error('fail') })
      failRunner.addTask('b', () => 42, { dependencies: [idA] })
      const results = await failRunner.run()
      const taskA = results.find((r) => r.taskId === 'task-1')
      const taskB = results.find((r) => r.taskId === 'task-2')
      expect(taskA!.status).toBe('failed')
      expect(taskB!.status).toBe('skipped')
    })
  })

  describe('getResults', () => {
    it('should return empty results before run', () => {
      expect(runner.getResults()).toEqual([])
    })

    it('should return results after run', async () => {
      runner.addTask('test', () => 42)
      await runner.run()
      expect(runner.getResults()).toHaveLength(1)
    })

    it('should return a copy of results', async () => {
      runner.addTask('test', () => 42)
      await runner.run()
      const results = runner.getResults()
      results.push({
        taskId: 'fake',
        status: 'completed',
        duration: 0,
        retries: 0,
      })
      expect(runner.getResults()).toHaveLength(1)
    })
  })

  describe('getStats', () => {
    it('should return zero stats before run', () => {
      const stats = runner.getStats()
      expect(stats.totalTasks).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.failed).toBe(0)
    })

    it('should compute stats after run', async () => {
      runner.addTask('a', () => 1)
      runner.addTask('b', () => { throw new Error('fail') })
      await runner.run()
      const stats = runner.getStats()
      expect(stats.totalTasks).toBe(2)
      expect(stats.completed).toBe(1)
      expect(stats.failed).toBe(1)
    })

    it('should track max concurrent', async () => {
      runner.addTask('a', async () => {
        await new Promise((r) => setTimeout(r, 50))
        return 1
      })
      runner.addTask('b', async () => {
        await new Promise((r) => setTimeout(r, 50))
        return 2
      })
      await runner.run()
      const stats = runner.getStats()
      expect(stats.maxConcurrent).toBeGreaterThanOrEqual(2)
    })

    it('should compute avg duration', async () => {
      runner.addTask('a', async () => {
        await new Promise((r) => setTimeout(r, 10))
        return 1
      })
      runner.addTask('b', async () => {
        await new Promise((r) => setTimeout(r, 10))
        return 2
      })
      const results = await runner.run()
      const stats = runner.getStats()
      expect(stats.avgTaskDuration).toBeGreaterThan(0)
      expect(stats.totalDuration).toBeGreaterThan(0)
    })

    it('should track skipped tasks', async () => {
      const id = runner.addTask('skip-me', () => 42)
      runner.cancel(id)
      await runner.run()
      const stats = runner.getStats()
      expect(stats.skipped).toBe(1)
    })
  })

  describe('getConfig', () => {
    it('should return default config', () => {
      const config = runner.getConfig()
      expect(config.maxConcurrent).toBe(4)
      expect(config.defaultTimeout).toBe(30000)
      expect(config.defaultRetries).toBe(0)
      expect(config.defaultRetryDelay).toBe(100)
      expect(config.failFast).toBe(false)
    })

    it('should return custom config', () => {
      const customRunner = new TaskRunner({
        maxConcurrent: 8,
        defaultTimeout: 60000,
        failFast: true,
      })
      const config = customRunner.getConfig()
      expect(config.maxConcurrent).toBe(8)
      expect(config.defaultTimeout).toBe(60000)
      expect(config.failFast).toBe(true)
    })

    it('should return a copy of config', () => {
      const config = runner.getConfig()
      config.maxConcurrent = 99
      expect(runner.getConfig().maxConcurrent).toBe(4)
    })
  })

  describe('reset', () => {
    it('should clear all state', async () => {
      runner.addTask('test', () => 42)
      await runner.run()
      runner.reset()
      expect(runner.getResults()).toEqual([])
      expect(runner.getStats().totalTasks).toBe(0)
    })

    it('should reset task counter', () => {
      runner.addTask('test', () => 42)
      runner.reset()
      const id = runner.addTask('new', () => 1)
      expect(id).toBe('task-1')
    })

    it('should allow reuse after reset', async () => {
      runner.addTask('first', () => 1)
      await runner.run()
      runner.reset()
      runner.addTask('second', () => 2)
      const results = await runner.run()
      expect(results).toHaveLength(1)
      expect(results[0]!.result).toBe(2)
    })
  })

  describe('callbacks', () => {
    it('should call onComplete for successful tasks', async () => {
      const completed: TaskResult[] = []
      runner.onComplete((result) => completed.push(result))
      runner.addTask('test', () => 42)
      await runner.run()
      expect(completed).toHaveLength(1)
      expect(completed[0]!.status).toBe('completed')
    })

    it('should call onError for failed tasks', async () => {
      const errors: TaskResult[] = []
      runner.onError((result) => errors.push(result))
      runner.addTask('fail', () => { throw new Error('oops') })
      await runner.run()
      expect(errors).toHaveLength(1)
      expect(errors[0]!.status).toBe('failed')
    })

    it('should call onError for timed out tasks', async () => {
      const errors: TaskResult[] = []
      runner.onError((result) => errors.push(result))
      runner.addTask(
        'slow',
        async () => {
          await new Promise((r) => setTimeout(r, 500))
        },
        { timeout: 50 }
      )
      await runner.run()
      expect(errors).toHaveLength(1)
      expect(errors[0]!.status).toBe('timeout')
    })

    it('should support multiple callbacks', async () => {
      const calls1: TaskResult[] = []
      const calls2: TaskResult[] = []
      runner.onComplete((r) => calls1.push(r))
      runner.onComplete((r) => calls2.push(r))
      runner.addTask('test', () => 1)
      await runner.run()
      expect(calls1).toHaveLength(1)
      expect(calls2).toHaveLength(1)
    })
  })

  describe('concurrency', () => {
    it('should respect maxConcurrent limit', async () => {
      const concurrentRunner = new TaskRunner({ maxConcurrent: 2 })
      let concurrentCount = 0
      let maxConcurrent = 0

      for (let i = 0; i < 5; i++) {
        concurrentRunner.addTask(`task-${i}`, async () => {
          concurrentCount++
          maxConcurrent = Math.max(maxConcurrent, concurrentCount)
          await new Promise((r) => setTimeout(r, 50))
          concurrentCount--
          return i
        })
      }

      await concurrentRunner.run()
      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('should run all tasks eventually', async () => {
      const concurrentRunner = new TaskRunner({ maxConcurrent: 2 })
      for (let i = 0; i < 10; i++) {
        concurrentRunner.addTask(`task-${i}`, async () => {
          await new Promise((r) => setTimeout(r, 10))
          return i
        })
      }
      const results = await concurrentRunner.run()
      expect(results).toHaveLength(10)
      const completed = results.filter((r) => r.status === 'completed')
      expect(completed).toHaveLength(10)
    })
  })

  describe('complex scenarios', () => {
    it('should handle diamond dependency', async () => {
      const order: string[] = []
      const idA = runner.addTask('a', () => { order.push('a'); return 'a' })
      const idB = runner.addTask('b', () => { order.push('b'); return 'b' }, { dependencies: [idA] })
      const idC = runner.addTask('c', () => { order.push('c'); return 'c' }, { dependencies: [idA] })
      runner.addTask('d', () => { order.push('d'); return 'd' }, { dependencies: [idB, idC] })
      void idC
      await runner.run()
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'))
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'))
    })

    it('should handle mixed success and failure', async () => {
      runner.addTask('ok1', () => 1)
      runner.addTask('fail', () => { throw new Error('nope') })
      runner.addTask('ok2', () => 2)
      const results = await runner.run()
      expect(results.filter((r) => r.status === 'completed')).toHaveLength(2)
      expect(results.filter((r) => r.status === 'failed')).toHaveLength(1)
    })

    it('should handle tasks with no handler return', async () => {
      runner.addTask('void', () => { })
      const results = await runner.run()
      expect(results[0]!.status).toBe('completed')
      expect(results[0]!.result).toBeUndefined()
    })

    it('should record duration for tasks', async () => {
      runner.addTask('timed', async () => {
        await new Promise((r) => setTimeout(r, 20))
        return 'done'
      })
      const results = await runner.run()
      expect(results[0]!.duration).toBeGreaterThanOrEqual(15)
    })

    it('should handle high concurrency with dependencies', async () => {
      const ids: string[] = []
      for (let i = 0; i < 8; i++) {
        const deps = i > 0 ? [ids[i - 1]!] : []
        const id = runner.addTask(`task-${i}`, () => i, { dependencies: deps })
        ids.push(id)
      }
      const results = await runner.run()
      expect(results).toHaveLength(8)
      expect(results.every((r) => r.status === 'completed')).toBe(true)
    })
  })

  describe('failFast', () => {
    it('should cancel dependents on failure when failFast is enabled', async () => {
      const ffRunner = new TaskRunner({ failFast: true })
      const idA = ffRunner.addTask('a', () => { throw new Error('fail') })
      ffRunner.addTask('b', () => 42, { dependencies: [idA] })
      ffRunner.addTask('c', () => 99)
      const results = await ffRunner.run()
      const failed = results.find((r) => r.taskId === 'task-1')
      const skipped = results.find((r) => r.taskId === 'task-2')
      const independent = results.find((r) => r.taskId === 'task-3')
      expect(failed!.status).toBe('failed')
      expect(skipped!.status).toBe('skipped')
      expect(independent!.status).toBe('completed')
    })

    it('should not cancel tasks when failFast is disabled', async () => {
      const noFFRunner = new TaskRunner({ failFast: false })
      const idA = noFFRunner.addTask('a', () => { throw new Error('fail') })
      noFFRunner.addTask('b', () => 42, { dependencies: [idA] })
      const results = await noFFRunner.run()
      expect(results.filter((r) => r.status === 'failed')).toHaveLength(1)
      expect(results.filter((r) => r.status === 'completed')).toHaveLength(0)
    })
  })

  describe('retry with delay', () => {
    it('should retry with specified delay', async () => {
      let attempts = 0
      const start = Date.now()
      runner.addTask(
        'retry-delay',
        () => {
          attempts++
          if (attempts < 3) throw new Error('retry')
          return 'done'
        },
        { retries: 3, retryDelay: 50 }
      )
      const results = await runner.run()
      expect(results[0]!.status).toBe('completed')
      expect(Date.now() - start).toBeGreaterThanOrEqual(90)
    })
  })
})
