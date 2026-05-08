import { describe, it, expect, beforeEach } from 'vitest'
import { TaskQueue } from '../../src/core/worker-pool/task-queue.js'
import { WorkerPool } from '../../src/core/worker-pool/worker-pool.js'
import { DEFAULT_POOL_CONFIG } from '../../src/core/worker-pool/types.js'
import type { PoolTask, PoolConfig, PoolStats } from '../../src/core/worker-pool/types.js'

function makeTask(overrides: Partial<PoolTask> = {}): PoolTask {
  return {
    id: overrides.id ?? 't1',
    fn: overrides.fn ?? (() => 42),
    priority: overrides.priority ?? 0,
    status: overrides.status ?? 'pending',
    result: overrides.result,
    error: overrides.error,
  }
}

describe('TaskQueue', () => {
  let queue: TaskQueue

  beforeEach(() => {
    queue = new TaskQueue()
  })

  it('should enqueue a task', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    expect(queue.size).toBe(1)
  })

  it('should enqueue multiple tasks', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    expect(queue.size).toBe(2)
  })

  it('should enqueueAll tasks', () => {
    queue.enqueueAll([
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c' }),
    ])
    expect(queue.size).toBe(3)
  })

  it('should dequeue highest priority task', () => {
    queue.enqueue(makeTask({ id: 'a', priority: 1 }))
    queue.enqueue(makeTask({ id: 'b', priority: 5 }))
    queue.enqueue(makeTask({ id: 'c', priority: 3 }))
    const task = queue.dequeue()
    expect(task!.id).toBe('b')
    expect(task!.status).toBe('running')
  })

  it('should return undefined when dequeuing from empty queue', () => {
    expect(queue.dequeue()).toBeUndefined()
  })

  it('should return undefined when all tasks are non-pending', () => {
    queue.enqueue(makeTask({ id: 'a', status: 'completed' }))
    expect(queue.dequeue()).toBeUndefined()
  })

  it('should dequeue next highest priority after first dequeue', () => {
    queue.enqueue(makeTask({ id: 'a', priority: 1 }))
    queue.enqueue(makeTask({ id: 'b', priority: 5 }))
    queue.enqueue(makeTask({ id: 'c', priority: 3 }))
    queue.dequeue()
    const task = queue.dequeue()
    expect(task!.id).toBe('c')
  })

  it('should peek at highest priority pending task without removing', () => {
    queue.enqueue(makeTask({ id: 'a', priority: 1 }))
    queue.enqueue(makeTask({ id: 'b', priority: 5 }))
    const peeked = queue.peek()
    expect(peeked!.id).toBe('b')
    expect(queue.size).toBe(2)
    expect(peeked!.status).toBe('pending')
  })

  it('should return undefined when peeking empty queue', () => {
    expect(queue.peek()).toBeUndefined()
  })

  it('should update task status', () => {
    queue.enqueue(makeTask({ id: 'a', status: 'pending' }))
    queue.updateStatus('a', 'completed')
    expect(queue.get('a')!.status).toBe('completed')
  })

  it('should not throw when updating non-existent task', () => {
    expect(() => queue.updateStatus('nonexistent', 'completed')).not.toThrow()
  })

  it('should get a task by id', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    expect(queue.get('a')!.id).toBe('a')
  })

  it('should return undefined for non-existent get', () => {
    expect(queue.get('nonexistent')).toBeUndefined()
  })

  it('should remove a task by id', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    expect(queue.remove('a')).toBe(true)
    expect(queue.size).toBe(1)
    expect(queue.get('a')).toBeUndefined()
  })

  it('should return false when removing non-existent task', () => {
    expect(queue.remove('nonexistent')).toBe(false)
  })

  it('should return pending tasks sorted by priority descending', () => {
    queue.enqueue(makeTask({ id: 'a', priority: 1 }))
    queue.enqueue(makeTask({ id: 'b', priority: 5 }))
    queue.enqueue(makeTask({ id: 'c', priority: 3 }))
    queue.enqueue(makeTask({ id: 'd', status: 'completed', priority: 10 }))
    const pending = queue.pending()
    expect(pending).toHaveLength(3)
    expect(pending[0]!.id).toBe('b')
    expect(pending[1]!.id).toBe('c')
    expect(pending[2]!.id).toBe('a')
  })

  it('should return empty array for no pending tasks', () => {
    queue.enqueue(makeTask({ id: 'a', status: 'completed' }))
    expect(queue.pending()).toEqual([])
  })

  it('should report correct size', () => {
    expect(queue.size).toBe(0)
    queue.enqueue(makeTask())
    expect(queue.size).toBe(1)
  })

  it('should clear all tasks', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    queue.clear()
    expect(queue.size).toBe(0)
  })

  it('should return all tasks via all()', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    queue.enqueue(makeTask({ id: 'b' }))
    const all = queue.all()
    expect(all).toHaveLength(2)
    expect(all[0]!.id).toBe('a')
    expect(all[1]!.id).toBe('b')
  })

  it('should return copy from all()', () => {
    queue.enqueue(makeTask({ id: 'a' }))
    const all = queue.all()
    all.push(makeTask({ id: 'b' }))
    expect(queue.size).toBe(1)
  })
})

describe('WorkerPool', () => {
  let pool: WorkerPool

  beforeEach(() => {
    pool = new WorkerPool()
  })

  describe('constructor', () => {
    it('should use default config', () => {
      const config = pool.getConfig()
      expect(config.concurrency).toBe(DEFAULT_POOL_CONFIG.concurrency)
      expect(config.timeout).toBe(DEFAULT_POOL_CONFIG.timeout)
      expect(config.retryCount).toBe(DEFAULT_POOL_CONFIG.retryCount)
      expect(config.retryDelay).toBe(DEFAULT_POOL_CONFIG.retryDelay)
    })

    it('should accept custom config', () => {
      const custom = new WorkerPool({ concurrency: 8, timeout: 60000 })
      const config = custom.getConfig()
      expect(config.concurrency).toBe(8)
      expect(config.timeout).toBe(60000)
    })

    it('should merge partial config with defaults', () => {
      const custom = new WorkerPool({ concurrency: 2 })
      const config = custom.getConfig()
      expect(config.concurrency).toBe(2)
      expect(config.timeout).toBe(DEFAULT_POOL_CONFIG.timeout)
    })

    it('should return a copy of config', () => {
      const config = pool.getConfig()
      config.concurrency = 99
      expect(pool.getConfig().concurrency).toBe(DEFAULT_POOL_CONFIG.concurrency)
    })
  })

  describe('submit and complete', () => {
    it('should submit and complete a sync task', async () => {
      const result = await pool.submit(() => 42)
      expect(result).toBe(42)
    })

    it('should submit and complete an async task', async () => {
      const result = await pool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 10))
        return 'done'
      })
      expect(result).toBe('done')
    })

    it('should generate sequential ids', async () => {
      const p1 = pool.submit(() => 1)
      const p2 = pool.submit(() => 2)
      const [r1, r2] = await Promise.all([p1, p2])
      expect(r1).toBe(1)
      expect(r2).toBe(2)
    })

    it('should use custom id when provided', async () => {
      const result = await pool.submit(() => 'custom', 0, 'my-task')
      expect(result).toBe('custom')
      const task = pool.getTask('my-task')
      expect(task!.id).toBe('my-task')
    })

    it('should handle task that returns undefined', async () => {
      const result = await pool.submit(() => { })
      expect(result).toBeUndefined()
    })

    it('should handle multiple sequential submissions', async () => {
      const results: number[] = []
      for (let i = 0; i < 5; i++) {
        const r = await pool.submit(() => i)
        results.push(r)
      }
      expect(results).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('submit with priority', () => {
    it('should run higher priority tasks first', async () => {
      const order: string[] = []
      const slowPool = new WorkerPool({ concurrency: 1 })
      slowPool.submit(async () => {
        order.push('blocker')
      }, 0, 'blocker')
      await new Promise<void>((r) => setTimeout(r, 5))
      slowPool.submit(async () => {
        order.push('low')
      }, 1, 'low')
      slowPool.submit(async () => {
        order.push('high')
      }, 10, 'high')
      slowPool.submit(async () => {
        order.push('mid')
      }, 5, 'mid')
      await new Promise<void>((r) => setTimeout(r, 50))
      expect(order[0]).toBe('blocker')
    })
  })

  describe('cancel', () => {
    it('should cancel a pending task', async () => {
      const blockingPool = new WorkerPool({ concurrency: 1 })
      blockingPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 100))
        return 'blocking'
      })
      const pending = blockingPool.submit(() => 'pending', 0, 'to-cancel')
      await new Promise<void>((r) => setTimeout(r, 5))
      const cancelled = blockingPool.cancel('to-cancel')
      expect(cancelled).toBe(true)
      await expect(pending).rejects.toThrow('Task cancelled')
    })

    it('should return false for non-existent task', () => {
      expect(pool.cancel('nonexistent')).toBe(false)
    })

    it('should return false for running task', async () => {
      const running = pool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 100))
        return 'running'
      }, 0, 'running-task')
      await new Promise<void>((r) => setTimeout(r, 5))
      expect(pool.cancel('running-task')).toBe(false)
      await running
    })

    it('should set task status to cancelled', async () => {
      const blockingPool = new WorkerPool({ concurrency: 1 })
      blockingPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 100))
      })
      const pending = blockingPool.submit(() => 'done', 0, 'to-cancel')
      await new Promise<void>((r) => setTimeout(r, 5))
      blockingPool.cancel('to-cancel')
      await expect(pending).rejects.toThrow('Task cancelled')
      const task = blockingPool.getTask('to-cancel')
      expect(task!.status).toBe('cancelled')
    })
  })

  describe('cancelAll', () => {
    it('should cancel all pending tasks', async () => {
      const blockingPool = new WorkerPool({ concurrency: 1 })
      blockingPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 100))
      })
      const p1 = blockingPool.submit(() => 1, 0, 'p1')
      const p2 = blockingPool.submit(() => 2, 0, 'p2')
      const p3 = blockingPool.submit(() => 3, 0, 'p3')
      await new Promise<void>((r) => setTimeout(r, 5))
      const count = blockingPool.cancelAll()
      expect(count).toBe(3)
      await expect(p1).rejects.toThrow('Task cancelled')
      await expect(p2).rejects.toThrow('Task cancelled')
      await expect(p3).rejects.toThrow('Task cancelled')
    })

    it('should return zero when no pending tasks', () => {
      expect(pool.cancelAll()).toBe(0)
    })
  })

  describe('getStatus', () => {
    it('should return empty stats for new pool', () => {
      const stats = pool.getStatus()
      expect(stats.total).toBe(0)
      expect(stats.pending).toBe(0)
      expect(stats.running).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.failed).toBe(0)
      expect(stats.cancelled).toBe(0)
    })

    it('should return completed after task finishes', async () => {
      await pool.submit(() => 42)
      const stats = pool.getStatus()
      expect(stats.completed).toBe(1)
      expect(stats.total).toBe(1)
    })

    it('should track failed tasks', async () => {
      try { await pool.submit(() => { throw new Error('fail') }) } catch { }
      const stats = pool.getStatus()
      expect(stats.failed).toBe(1)
    })

    it('should track cancelled tasks', async () => {
      const blockingPool = new WorkerPool({ concurrency: 1 })
      blockingPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 100))
      })
      const pending = blockingPool.submit(() => 1, 0, 'cancel-me')
      await new Promise<void>((r) => setTimeout(r, 5))
      blockingPool.cancel('cancel-me')
      await expect(pending).rejects.toThrow('Task cancelled')
      const stats = blockingPool.getStatus()
      expect(stats.cancelled).toBe(1)
    })

    it('should track mixed task states', async () => {
      const blockingPool = new WorkerPool({ concurrency: 1 })
      blockingPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 50))
        return 'ok'
      })
      const pending = blockingPool.submit(() => 1, 0, 'to-cancel')
      await new Promise<void>((r) => setTimeout(r, 5))
      blockingPool.cancel('to-cancel')
      await expect(pending).rejects.toThrow('Task cancelled')
      await new Promise<void>((r) => setTimeout(r, 100))
      const stats = blockingPool.getStatus()
      expect(stats.completed).toBe(1)
      expect(stats.cancelled).toBe(1)
      expect(stats.total).toBe(2)
    })
  })

  describe('getTask', () => {
    it('should return task by id', async () => {
      await pool.submit(() => 42, 0, 'my-task')
      const task = pool.getTask('my-task')
      expect(task).toBeDefined()
      expect(task!.id).toBe('my-task')
      expect(task!.status).toBe('completed')
      expect(task!.result).toBe(42)
    })

    it('should return undefined for non-existent task', () => {
      expect(pool.getTask('nonexistent')).toBeUndefined()
    })

    it('should include error on failed task', async () => {
      try { await pool.submit(() => { throw new Error('oops') }, 0, 'fail-task') } catch { }
      const task = pool.getTask('fail-task')
      expect(task!.status).toBe('failed')
      expect(task!.error).toBeDefined()
    })
  })

  describe('awaitAll', () => {
    it('should return empty for pool with no tasks', async () => {
      const results = await pool.awaitAll()
      expect(results).toEqual([])
    })

    it('should wait for running tasks to complete', async () => {
      pool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 20))
        return 1
      })
      pool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 10))
        return 2
      })
      const results = await pool.awaitAll()
      expect(results).toHaveLength(2)
      expect(results).toContain(1)
      expect(results).toContain(2)
    })

    it('should not include failed tasks in results', async () => {
      pool.submit(() => 42)
      try { await pool.submit(() => { throw new Error('fail') }) } catch { }
      const results = await pool.awaitAll()
      expect(results).toEqual([42])
    })
  })

  describe('concurrency limit', () => {
    it('should respect concurrency limit of 1', async () => {
      const singlePool = new WorkerPool({ concurrency: 1 })
      let maxConcurrent = 0
      let current = 0
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(singlePool.submit(async () => {
          current++
          maxConcurrent = Math.max(maxConcurrent, current)
          await new Promise<void>((r) => setTimeout(r, 20))
          current--
          return i
        }))
      }
      await Promise.all(promises)
      expect(maxConcurrent).toBeLessThanOrEqual(1)
    })

    it('should respect concurrency limit of 2', async () => {
      const twoPool = new WorkerPool({ concurrency: 2 })
      let maxConcurrent = 0
      let current = 0
      const promises = []
      for (let i = 0; i < 6; i++) {
        promises.push(twoPool.submit(async () => {
          current++
          maxConcurrent = Math.max(maxConcurrent, current)
          await new Promise<void>((r) => setTimeout(r, 20))
          current--
          return i
        }))
      }
      await Promise.all(promises)
      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('should run all tasks eventually', async () => {
      const smallPool = new WorkerPool({ concurrency: 2 })
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(smallPool.submit(async () => {
          await new Promise<void>((r) => setTimeout(r, 5))
          return i
        }))
      }
      const results = await Promise.all(promises)
      expect(results).toHaveLength(10)
    })

    it('should handle high concurrency', async () => {
      const highPool = new WorkerPool({ concurrency: 20 })
      const promises = []
      for (let i = 0; i < 20; i++) {
        promises.push(highPool.submit(() => i))
      }
      const results = await Promise.all(promises)
      expect(results).toHaveLength(20)
    })
  })

  describe('timeout', () => {
    it('should timeout slow tasks', async () => {
      const timeoutPool = new WorkerPool({ timeout: 30 })
      await expect(timeoutPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 500))
        return 'late'
      })).rejects.toThrow('Task timeout')
    })

    it('should not timeout fast tasks', async () => {
      const timeoutPool = new WorkerPool({ timeout: 500 })
      const result = await timeoutPool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 10))
        return 'fast'
      })
      expect(result).toBe('fast')
    })
  })

  describe('retry on failure', () => {
    it('should retry on failure', async () => {
      let attempts = 0
      const retryPool = new WorkerPool({ retryCount: 3, retryDelay: 10 })
      const result = await retryPool.submit(() => {
        attempts++
        if (attempts < 3) throw new Error('not yet')
        return 'success'
      })
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should fail after all retries exhausted', async () => {
      const retryPool = new WorkerPool({ retryCount: 2, retryDelay: 10 })
      await expect(retryPool.submit(() => {
        throw new Error('always fails')
      })).rejects.toThrow('always fails')
    })

    it('should not retry when retryCount is 0', async () => {
      let attempts = 0
      await expect(pool.submit(() => {
        attempts++
        throw new Error('no retry')
      })).rejects.toThrow('no retry')
      expect(attempts).toBe(1)
    })

    it('should set error on failed task after retries', async () => {
      const retryPool = new WorkerPool({ retryCount: 1, retryDelay: 10 })
      try {
        await retryPool.submit(() => { throw new Error('fail') }, 0, 'retry-task')
      } catch { }
      const task = retryPool.getTask('retry-task')
      expect(task!.status).toBe('failed')
      expect(task!.error).toBeDefined()
    })
  })

  describe('getConfig', () => {
    it('should return default config values', () => {
      const config = pool.getConfig()
      expect(config.concurrency).toBe(4)
      expect(config.timeout).toBe(30000)
      expect(config.retryCount).toBe(0)
      expect(config.retryDelay).toBe(100)
    })

    it('should return custom config values', () => {
      const custom = new WorkerPool({ concurrency: 8, timeout: 60000, retryCount: 3, retryDelay: 200 })
      const config = custom.getConfig()
      expect(config.concurrency).toBe(8)
      expect(config.timeout).toBe(60000)
      expect(config.retryCount).toBe(3)
      expect(config.retryDelay).toBe(200)
    })
  })

  describe('edge cases', () => {
    it('should handle single concurrency pool', async () => {
      const single = new WorkerPool({ concurrency: 1 })
      const results: number[] = []
      const promises = []
      for (let i = 0; i < 3; i++) {
        promises.push(single.submit(async () => {
          results.push(i)
          await new Promise<void>((r) => setTimeout(r, 10))
          return i
        }))
      }
      await Promise.all(promises)
      expect(results).toEqual([0, 1, 2])
    })

    it('should handle empty pool getStatus', () => {
      const stats = pool.getStatus()
      expect(stats.total).toBe(0)
    })

    it('should handle all tasks failing', async () => {
      const promises = []
      for (let i = 0; i < 3; i++) {
        promises.push(pool.submit(() => { throw new Error(`fail-${i}`) }).catch(() => `caught-${i}`))
      }
      const results = await Promise.all(promises)
      expect(results).toEqual(['caught-0', 'caught-1', 'caught-2'])
      const stats = pool.getStatus()
      expect(stats.failed).toBe(3)
    })

    it('should handle mixed success and failure', async () => {
      const promises = [
        pool.submit(() => 1),
        pool.submit(() => { throw new Error('fail') }).catch(() => 'caught'),
        pool.submit(() => 3),
      ]
      const results = await Promise.all(promises)
      expect(results[0]).toBe(1)
      expect(results[1]).toBe('caught')
      expect(results[2]).toBe(3)
    })

    it('should handle cancel running task as no-op', async () => {
      const promise = pool.submit(async () => {
        await new Promise<void>((r) => setTimeout(r, 50))
        return 'done'
      }, 0, 'running-task')
      await new Promise<void>((r) => setTimeout(r, 5))
      expect(pool.cancel('running-task')).toBe(false)
      const result = await promise
      expect(result).toBe('done')
    })

    it('should handle task returning object', async () => {
      const obj = { name: 'test', value: 42 }
      const result = await pool.submit(() => obj)
      expect(result).toEqual(obj)
    })

    it('should handle task returning array', async () => {
      const result = await pool.submit(() => [1, 2, 3])
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle task returning null', async () => {
      const result = await pool.submit(() => null)
      expect(result).toBeNull()
    })

    it('should handle task returning boolean', async () => {
      const result = await pool.submit(() => true)
      expect(result).toBe(true)
    })

    it('should handle task returning string', async () => {
      const result = await pool.submit(() => 'hello world')
      expect(result).toBe('hello world')
    })

    it('should handle many concurrent submissions', async () => {
      const promises = []
      for (let i = 0; i < 50; i++) {
        promises.push(pool.submit(async () => {
          await new Promise<void>((r) => setTimeout(r, 5))
          return i
        }))
      }
      const results = await Promise.all(promises)
      expect(results).toHaveLength(50)
    })

    it('should handle sync task throwing immediately', async () => {
      await expect(pool.submit(() => { throw new Error('sync fail') }))
        .rejects.toThrow('sync fail')
    })

    it('should handle async task rejection', async () => {
      await expect(pool.submit(async () => {
        throw new Error('async reject')
      })).rejects.toThrow('async reject')
    })

    it('should handle tasks with same priority in order', async () => {
      const singlePool = new WorkerPool({ concurrency: 1 })
      const order: number[] = []
      const promises = []
      for (let i = 0; i < 4; i++) {
        promises.push(singlePool.submit(async () => {
          order.push(i)
          await new Promise<void>((r) => setTimeout(r, 10))
          return i
        }))
      }
      await Promise.all(promises)
      expect(order).toEqual([0, 1, 2, 3])
    })

    it('should handle zero timeout', async () => {
      const zeroTimeout = new WorkerPool({ timeout: 0 })
      const result = await zeroTimeout.submit(() => 'instant')
      expect(result).toBe('instant')
    })

    it('should return PoolStats with all fields', async () => {
      await pool.submit(() => 1)
      const stats: PoolStats = pool.getStatus()
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('pending')
      expect(stats).toHaveProperty('running')
      expect(stats).toHaveProperty('completed')
      expect(stats).toHaveProperty('failed')
      expect(stats).toHaveProperty('cancelled')
    })

    it('should handle submit with explicit priority 0', async () => {
      const result = await pool.submit(() => 42, 0)
      expect(result).toBe(42)
    })

    it('should handle submit with negative priority', async () => {
      const result = await pool.submit(() => 42, -5)
      expect(result).toBe(42)
    })

    it('should handle submit with high priority', async () => {
      const result = await pool.submit(() => 42, 100)
      expect(result).toBe(42)
    })
  })
})
