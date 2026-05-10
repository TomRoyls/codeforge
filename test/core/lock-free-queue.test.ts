import { describe, it, expect, beforeEach } from 'vitest'
import { LockFreeQueue } from '../../src/core/lock-free-queue/lock-free-queue.js'
import { DEFAULT_LOCK_FREE_QUEUE_OPTIONS } from '../../src/core/lock-free-queue/types.js'
import type { LockFreeQueueOptions, LockFreeQueueJSON, LockFreeQueueStatistics } from '../../src/core/lock-free-queue/types.js'

describe('LockFreeQueue', () => {
  let queue: LockFreeQueue<number>

  beforeEach(() => {
    queue = new LockFreeQueue<number>()
  })

  describe('constructor', () => {
    it('should create with no options', () => {
      const q = new LockFreeQueue()
      expect(q.isEmpty).toBe(true)
      expect(q.size).toBe(0)
    })

    it('should create with empty options object', () => {
      const q = new LockFreeQueue({})
      expect(q.isEmpty).toBe(true)
    })

    it('should create with trackStatistics enabled', () => {
      const q = new LockFreeQueue({ trackStatistics: true })
      expect(q.isEmpty).toBe(true)
    })

    it('should create with simulateCasFailures enabled', () => {
      const q = new LockFreeQueue({ simulateCasFailures: true })
      expect(q.isEmpty).toBe(true)
    })

    it('should create with both options enabled', () => {
      const q = new LockFreeQueue({ trackStatistics: true, simulateCasFailures: true })
      expect(q.isEmpty).toBe(true)
    })

    it('should have default options when none provided', () => {
      expect(DEFAULT_LOCK_FREE_QUEUE_OPTIONS.trackStatistics).toBe(false)
      expect(DEFAULT_LOCK_FREE_QUEUE_OPTIONS.simulateCasFailures).toBe(false)
    })

    it('should accept partial options', () => {
      const q = new LockFreeQueue({ trackStatistics: true })
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('enqueue', () => {
    it('should enqueue a single item', () => {
      queue.enqueue(1)
      expect(queue.size).toBe(1)
    })

    it('should enqueue multiple items', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size).toBe(3)
    })

    it('should maintain FIFO order after enqueue', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.dequeue()).toBe(10)
      expect(queue.dequeue()).toBe(20)
      expect(queue.dequeue()).toBe(30)
    })

    it('should handle enqueueing undefined-equivalent values', () => {
      const q = new LockFreeQueue<number | null>()
      q.enqueue(null)
      q.enqueue(0)
      expect(q.size).toBe(2)
    })

    it('should update isEmpty after enqueue', () => {
      expect(queue.isEmpty).toBe(true)
      queue.enqueue(1)
      expect(queue.isEmpty).toBe(false)
    })

    it('should work with string values', () => {
      const q = new LockFreeQueue<string>()
      q.enqueue('hello')
      q.enqueue('world')
      expect(q.size).toBe(2)
      expect(q.dequeue()).toBe('hello')
    })

    it('should work with object values', () => {
      const q = new LockFreeQueue<{ id: number }>()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      expect(q.size).toBe(2)
    })

    it('should handle enqueue after dequeue', () => {
      queue.enqueue(1)
      queue.dequeue()
      queue.enqueue(2)
      expect(queue.size).toBe(1)
      expect(queue.dequeue()).toBe(2)
    })

    it('should handle large number of enqueues', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }
      expect(queue.size).toBe(1000)
    })
  })

  describe('dequeue', () => {
    it('should return undefined on empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should dequeue a single item', () => {
      queue.enqueue(42)
      expect(queue.dequeue()).toBe(42)
    })

    it('should return items in FIFO order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should decrement size on dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('should update isEmpty when last item dequeued', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.isEmpty).toBe(true)
    })

    it('should return undefined after all items dequeued', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle interleaved enqueue and dequeue', () => {
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle many enqueues and dequeues', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty).toBe(true)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return the front item without removing it', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
      expect(queue.size).toBe(2)
    })

    it('should return the same item on repeated peeks', () => {
      queue.enqueue(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
    })

    it('should reflect new front after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })

    it('should return undefined after all items removed', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size).toBe(0)
    })

    it('should return correct size after enqueues', () => {
      queue.enqueue(1)
      expect(queue.size).toBe(1)
      queue.enqueue(2)
      expect(queue.size).toBe(2)
    })

    it('should return correct size after dequeues', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('should not go below zero', () => {
      queue.dequeue()
      expect(queue.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new queue', () => {
      expect(queue.isEmpty).toBe(true)
    })

    it('should be false after enqueue', () => {
      queue.enqueue(1)
      expect(queue.isEmpty).toBe(false)
    })

    it('should be true after all items dequeued', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty queue', () => {
      queue.clear()
      expect(queue.isEmpty).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('should clear a queue with items', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.isEmpty).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      queue.enqueue(1)
      queue.clear()
      queue.enqueue(2)
      expect(queue.size).toBe(1)
      expect(queue.dequeue()).toBe(2)
    })

    it('should return empty array after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.toArray()).toEqual([])
    })

    it('should handle multiple clears', () => {
      queue.enqueue(1)
      queue.clear()
      queue.clear()
      queue.clear()
      expect(queue.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return all items in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.toArray()
      expect(queue.size).toBe(2)
    })

    it('should reflect current state after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.toArray()).toEqual([2, 3])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty queue', () => {
      let count = 0
      queue.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all items in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const collected: number[] = []
      queue.forEach((v) => { collected.push(v) })
      expect(collected).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const indices: number[] = []
      queue.forEach((_v, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should provide correct value and index pairs', () => {
      queue.enqueue(5)
      queue.enqueue(10)
      const pairs: Array<[number, number]> = []
      queue.forEach((v, i) => { pairs.push([v, i]) })
      expect(pairs).toEqual([[5, 0], [10, 1]])
    })
  })

  describe('Symbol.iterator', () => {
    it('should produce no values for empty queue', () => {
      const result = [...queue]
      expect(result).toEqual([])
    })

    it('should iterate all items in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect([...queue]).toEqual([1, 2, 3])
    })

    it('should work with for...of', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      const collected: number[] = []
      for (const item of queue) {
        collected.push(item)
      }
      expect(collected).toEqual([10, 20])
    })

    it('should work with spread in array literal', () => {
      queue.enqueue(1)
      expect([0, ...queue, 4]).toEqual([0, 1, 4])
    })
  })

  describe('contains', () => {
    it('should return false on empty queue', () => {
      expect(queue.contains(1)).toBe(false)
    })

    it('should return true for existing item', () => {
      queue.enqueue(42)
      expect(queue.contains(42)).toBe(true)
    })

    it('should return false for non-existing item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.contains(99)).toBe(false)
    })

    it('should find items in the middle', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.contains(2)).toBe(true)
    })

    it('should find the last item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.contains(2)).toBe(true)
    })

    it('should use strict equality', () => {
      const q = new LockFreeQueue<object>()
      const obj = { id: 1 }
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })

    it('should handle string values', () => {
      const q = new LockFreeQueue<string>()
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('world')).toBe(false)
    })

    it('should not find item after dequeue', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.contains(1)).toBe(false)
    })
  })

  describe('drain', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.drain()).toEqual([])
    })

    it('should return all items and clear the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const items = queue.drain()
      expect(items).toEqual([1, 2, 3])
      expect(queue.isEmpty).toBe(true)
    })

    it('should allow reuse after drain', () => {
      queue.enqueue(1)
      queue.drain()
      queue.enqueue(2)
      expect(queue.size).toBe(1)
      expect(queue.dequeue()).toBe(2)
    })

    it('should return items in FIFO order', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(i)
      }
      const items = queue.drain()
      for (let i = 0; i < 10; i++) {
        expect(items[i]).toBe(i)
      }
    })
  })

  describe('enqueueMany', () => {
    it('should enqueue an array of values', () => {
      queue.enqueueMany([1, 2, 3])
      expect(queue.size).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should enqueue an empty iterable', () => {
      queue.enqueueMany([])
      expect(queue.isEmpty).toBe(true)
    })

    it('should enqueue a Set', () => {
      queue.enqueueMany(new Set([1, 2, 3]))
      expect(queue.size).toBe(3)
    })

    it('should enqueue a generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      queue.enqueueMany(gen())
      expect(queue.size).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should work with existing items in queue', () => {
      queue.enqueue(0)
      queue.enqueueMany([1, 2])
      expect(queue.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('tryDequeue', () => {
    it('should return failure on empty queue', () => {
      const result = queue.tryDequeue()
      expect(result.success).toBe(false)
      expect(result.value).toBeUndefined()
    })

    it('should return success with value', () => {
      queue.enqueue(42)
      const result = queue.tryDequeue()
      expect(result.success).toBe(true)
      expect(result.value).toBe(42)
    })

    it('should decrement size on success', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.tryDequeue()
      expect(queue.size).toBe(1)
    })

    it('should handle multiple tryDequeues', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.tryDequeue()).toEqual({ success: true, value: 1 })
      expect(queue.tryDequeue()).toEqual({ success: true, value: 2 })
      expect(queue.tryDequeue()).toEqual({ success: false, value: undefined })
    })
  })

  describe('getStatistics', () => {
    it('should return zeros when tracking is disabled', () => {
      const q = new LockFreeQueue({ trackStatistics: false })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(0)
      expect(stats.dequeues).toBe(0)
      expect(stats.casFailures).toBe(0)
      expect(stats.maxSize).toBe(0)
      expect(stats.totalSpinAttempts).toBe(0)
      expect(stats.currentSize).toBe(1)
    })

    it('should track enqueues', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.getStatistics().enqueues).toBe(3)
    })

    it('should track dequeues', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.getStatistics().dequeues).toBe(2)
    })

    it('should track maxSize', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.getStatistics().maxSize).toBe(3)
    })

    it('should track currentSize', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStatistics().currentSize).toBe(1)
    })

    it('should track totalSpinAttempts', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStatistics().totalSpinAttempts).toBeGreaterThan(0)
    })

    it('should return a copy of statistics', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      const stats1 = q.getStatistics()
      q.enqueue(2)
      const stats2 = q.getStatistics()
      expect(stats1.enqueues).toBe(1)
      expect(stats2.enqueues).toBe(2)
    })

    it('should have zero casFailures without simulation', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true, simulateCasFailures: false })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.getStatistics().casFailures).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should serialize an empty queue', () => {
      const json = queue.toJSON()
      expect(json.items).toEqual([])
      expect(json.options).toEqual({ trackStatistics: false, simulateCasFailures: false })
      expect(json.statistics.currentSize).toBe(0)
    })

    it('should serialize items in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const json = queue.toJSON()
      expect(json.items).toEqual([1, 2, 3])
    })

    it('should serialize options', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      const json = q.toJSON()
      expect(json.options.trackStatistics).toBe(true)
      expect(json.options.simulateCasFailures).toBe(false)
    })

    it('should serialize statistics', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      const json = q.toJSON()
      expect(json.statistics.enqueues).toBe(2)
      expect(json.statistics.dequeues).toBe(1)
    })

    it('should produce JSON-serializable output', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const json = queue.toJSON()
      const str = JSON.stringify(json)
      expect(typeof str).toBe('string')
      const parsed = JSON.parse(str)
      expect(parsed.items).toEqual([1, 2])
    })
  })

  describe('fromJSON', () => {
    it('should restore an empty queue', () => {
      const json: LockFreeQueueJSON<number> = {
        items: [],
        options: { trackStatistics: false, simulateCasFailures: false },
        statistics: { enqueues: 0, dequeues: 0, casFailures: 0, maxSize: 0, totalSpinAttempts: 0, currentSize: 0 },
      }
      const q = LockFreeQueue.fromJSON(json)
      expect(q.isEmpty).toBe(true)
    })

    it('should restore items in order', () => {
      const json: LockFreeQueueJSON<number> = {
        items: [1, 2, 3],
        options: { trackStatistics: false, simulateCasFailures: false },
        statistics: { enqueues: 3, dequeues: 0, casFailures: 0, maxSize: 3, totalSpinAttempts: 3, currentSize: 3 },
      }
      const q = LockFreeQueue.fromJSON(json)
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('should restore with correct options', () => {
      const json: LockFreeQueueJSON<number> = {
        items: [1],
        options: { trackStatistics: true, simulateCasFailures: false },
        statistics: { enqueues: 1, dequeues: 0, casFailures: 0, maxSize: 1, totalSpinAttempts: 1, currentSize: 1 },
      }
      const q = LockFreeQueue.fromJSON(json)
      expect(q.getStatistics().enqueues).toBe(1)
    })

    it('should round-trip through JSON', () => {
      const q1 = new LockFreeQueue<number>({ trackStatistics: true })
      q1.enqueue(10)
      q1.enqueue(20)
      q1.dequeue()
      const json = q1.toJSON()
      const q2 = LockFreeQueue.fromJSON(json)
      expect(q2.toArray()).toEqual([20])
      expect(q2.size).toBe(1)
    })

    it('should handle string type', () => {
      const json: LockFreeQueueJSON<string> = {
        items: ['a', 'b', 'c'],
        options: { trackStatistics: false, simulateCasFailures: false },
        statistics: { enqueues: 3, dequeues: 0, casFailures: 0, maxSize: 3, totalSpinAttempts: 3, currentSize: 3 },
      }
      const q = LockFreeQueue.fromJSON<string>(json)
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('c')
    })
  })

  describe('simulateCasFailures', () => {
    it('should eventually succeed with cas failures simulated', () => {
      const q = new LockFreeQueue<number>({ simulateCasFailures: true, trackStatistics: true })
      q.enqueue(1)
      expect(q.size).toBe(1)
      expect(q.dequeue()).toBe(1)
    })

    it('should track cas failures when both options enabled', () => {
      const q = new LockFreeQueue<number>({ simulateCasFailures: true, trackStatistics: true })
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
      }
      const stats = q.getStatistics()
      expect(stats.casFailures).toBeGreaterThanOrEqual(0)
    })

    it('should not track cas failures when tracking disabled', () => {
      const q = new LockFreeQueue<number>({ simulateCasFailures: true, trackStatistics: false })
      q.enqueue(1)
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.casFailures).toBe(0)
    })

    it('should handle enqueue and dequeue with cas simulation', () => {
      const q = new LockFreeQueue<number>({ simulateCasFailures: true, trackStatistics: true })
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 20; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('DEFAULT_LOCK_FREE_QUEUE_OPTIONS', () => {
    it('should have trackStatistics false by default', () => {
      expect(DEFAULT_LOCK_FREE_QUEUE_OPTIONS.trackStatistics).toBe(false)
    })

    it('should have simulateCasFailures false by default', () => {
      expect(DEFAULT_LOCK_FREE_QUEUE_OPTIONS.simulateCasFailures).toBe(false)
    })

    it('should be a required options type', () => {
      const opts: Required<LockFreeQueueOptions> = DEFAULT_LOCK_FREE_QUEUE_OPTIONS
      expect(typeof opts.trackStatistics).toBe('boolean')
      expect(typeof opts.simulateCasFailures).toBe('boolean')
    })
  })

  describe('stress tests', () => {
    it('should handle many enqueues and dequeues correctly', () => {
      for (let i = 0; i < 500; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < 500; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty).toBe(true)
    })

    it('should handle alternating enqueue/dequeue', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty).toBe(true)
    })

    it('should handle enqueue many then drain', () => {
      queue.enqueueMany(Array.from({ length: 100 }, (_, i) => i))
      const items = queue.drain()
      expect(items).toHaveLength(100)
      expect(items[0]).toBe(0)
      expect(items[99]).toBe(99)
    })

    it('should handle clear in the middle of operations', () => {
      for (let i = 0; i < 50; i++) {
        queue.enqueue(i)
      }
      queue.clear()
      expect(queue.size).toBe(0)
      queue.enqueue(999)
      expect(queue.dequeue()).toBe(999)
    })

    it('should handle large drain', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }
      const items = queue.drain()
      expect(items).toHaveLength(1000)
      expect(queue.isEmpty).toBe(true)
    })

    it('should handle forEach on large queue', () => {
      for (let i = 0; i < 200; i++) {
        queue.enqueue(i)
      }
      let sum = 0
      queue.forEach((v) => { sum += v })
      expect(sum).toBe(199 * 200 / 2)
    })

    it('should handle contains on large queue', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
      }
      expect(queue.contains(50)).toBe(true)
      expect(queue.contains(99)).toBe(true)
      expect(queue.contains(0)).toBe(true)
      expect(queue.contains(100)).toBe(false)
      expect(queue.contains(-1)).toBe(false)
    })

    it('should handle toArray on large queue', () => {
      for (let i = 0; i < 50; i++) {
        queue.enqueue(i)
      }
      const arr = queue.toArray()
      expect(arr).toHaveLength(50)
      expect(arr[0]).toBe(0)
      expect(arr[49]).toBe(49)
    })

    it('should handle tryDequeue on large queue', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        const result = queue.tryDequeue()
        expect(result.success).toBe(true)
        expect(result.value).toBe(i)
      }
      const result = queue.tryDequeue()
      expect(result.success).toBe(false)
    })

    it('should handle statistics on large workload', () => {
      const q = new LockFreeQueue<number>({ trackStatistics: true })
      for (let i = 0; i < 200; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        q.dequeue()
      }
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(200)
      expect(stats.dequeues).toBe(100)
      expect(stats.maxSize).toBe(200)
      expect(stats.currentSize).toBe(100)
      expect(stats.totalSpinAttempts).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle enqueue after multiple clear cycles', () => {
      queue.enqueue(1)
      queue.clear()
      queue.enqueue(2)
      queue.clear()
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(3)
    })

    it('should handle boolean values', () => {
      const q = new LockFreeQueue<boolean>()
      q.enqueue(true)
      q.enqueue(false)
      expect(q.dequeue()).toBe(true)
      expect(q.dequeue()).toBe(false)
    })

    it('should handle null values', () => {
      const q = new LockFreeQueue<null>()
      q.enqueue(null)
      q.enqueue(null)
      expect(q.size).toBe(2)
      expect(q.dequeue()).toBe(null)
    })

    it('should handle zero as a value', () => {
      queue.enqueue(0)
      expect(queue.contains(0)).toBe(true)
      expect(queue.dequeue()).toBe(0)
    })

    it('should handle empty string as a value', () => {
      const q = new LockFreeQueue<string>()
      q.enqueue('')
      expect(q.contains('')).toBe(true)
      expect(q.dequeue()).toBe('')
    })

    it('should handle false as a value', () => {
      const q = new LockFreeQueue<boolean>()
      q.enqueue(false)
      expect(q.contains(false)).toBe(true)
    })

    it('should drain an empty queue without error', () => {
      expect(queue.drain()).toEqual([])
      expect(queue.isEmpty).toBe(true)
    })

    it('should forEach on empty queue', () => {
      let called = false
      queue.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should iterator on empty queue', () => {
      expect([...queue]).toEqual([])
    })

    it('should peek after clear and enqueue', () => {
      queue.enqueue(1)
      queue.clear()
      queue.enqueue(2)
      expect(queue.peek()).toBe(2)
    })

    it('should handle enqueueMany with single item', () => {
      queue.enqueueMany([42])
      expect(queue.size).toBe(1)
      expect(queue.dequeue()).toBe(42)
    })

    it('should handle tryDequeue on single-item queue', () => {
      queue.enqueue(1)
      const result = queue.tryDequeue()
      expect(result.success).toBe(true)
      expect(result.value).toBe(1)
      expect(queue.isEmpty).toBe(true)
    })
  })

  describe('type safety', () => {
    it('should work with generic number type', () => {
      const q = new LockFreeQueue<number>()
      q.enqueue(1)
      const val: number | undefined = q.dequeue()
      expect(typeof val).toBe('number')
    })

    it('should work with generic string type', () => {
      const q = new LockFreeQueue<string>()
      q.enqueue('hello')
      const val: string | undefined = q.dequeue()
      expect(typeof val).toBe('string')
    })

    it('should work with complex object types', () => {
      interface Item { name: string; value: number }
      const q = new LockFreeQueue<Item>()
      q.enqueue({ name: 'test', value: 42 })
      const val = q.dequeue()
      expect(val?.name).toBe('test')
      expect(val?.value).toBe(42)
    })
  })
})
