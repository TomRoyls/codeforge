import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PocketQueue } from '../../src/core/pocket-queue/pocket-queue.js'
import type { PocketQueueOptions } from '../../src/core/pocket-queue/types.js'

describe('PocketQueue', () => {
  describe('constructor - positional args', () => {
    it('creates queue with capacity only', () => {
      const q = new PocketQueue<number>(5)
      expect(q.capacity).toBe(5)
      expect(q.size).toBe(0)
    })

    it('creates queue with capacity and autoFlush false', () => {
      const q = new PocketQueue<number>(3, false)
      expect(q.capacity).toBe(3)
    })

    it('creates queue with capacity and autoFlush true', () => {
      const q = new PocketQueue<number>(3, true)
      expect(q.capacity).toBe(3)
    })

    it('creates queue with capacity, autoFlush, and onFlush', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(3, true, cb)
      expect(q.capacity).toBe(3)
    })

    it('clamps capacity to 1 when given 0', () => {
      const q = new PocketQueue<number>(0)
      expect(q.capacity).toBe(1)
    })

    it('clamps capacity to 1 when given negative', () => {
      const q = new PocketQueue<number>(-5)
      expect(q.capacity).toBe(1)
    })

    it('floors fractional capacity', () => {
      const q = new PocketQueue<number>(3.7)
      expect(q.capacity).toBe(3)
    })
  })

  describe('constructor - options object', () => {
    it('creates queue from options with capacity', () => {
      const q = new PocketQueue<number>({ capacity: 10 })
      expect(q.capacity).toBe(10)
    })

    it('creates queue from options with autoFlush true', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>({ capacity: 5, autoFlush: true, onFlush: cb })
      expect(q.capacity).toBe(5)
    })

    it('creates queue from options with autoFlush false by default', () => {
      const q = new PocketQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(5)
    })

    it('creates queue from options with onFlush callback', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>({ capacity: 2, autoFlush: true, onFlush: cb })
      q.enqueue(1)
      q.enqueue(2)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith([1, 2])
    })

    it('clamps capacity from options object to 1', () => {
      const q = new PocketQueue<number>({ capacity: 0 })
      expect(q.capacity).toBe(1)
    })
  })

  describe('enqueue', () => {
    let q: PocketQueue<number>

    beforeEach(() => {
      q = new PocketQueue<number>(5)
    })

    it('adds a single item', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('adds multiple items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('fills to capacity', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.isFull).toBe(true)
    })

    it('auto-flushes when capacity reached then new item enqueued', () => {
      const cb = vi.fn()
      const pq = new PocketQueue<number>(2, true, cb)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith([1, 2])
      expect(pq.size).toBe(0)
    })

    it('continues accepting items after auto-flush', () => {
      const cb = vi.fn()
      const pq = new PocketQueue<number>(2, true, cb)
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(pq.size).toBe(1)
      expect(pq.peek()).toBe(3)
    })

    it('auto-flushes multiple times', () => {
      const cb = vi.fn()
      const pq = new PocketQueue<number>(2, true, cb)
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.enqueue(4)
      expect(cb).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenNthCalledWith(1, [1, 2])
      expect(cb).toHaveBeenNthCalledWith(2, [3, 4])
    })

    it('does not auto-flush when autoFlush is false', () => {
      const cb = vi.fn()
      const pq = new PocketQueue<number>(2, false, cb)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(cb).not.toHaveBeenCalled()
      expect(pq.size).toBe(2)
    })

    it('handles enqueue at exact capacity without autoFlush', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(5)
      expect(q.isFull).toBe(true)
    })
  })

  describe('dequeue', () => {
    let q: PocketQueue<number>

    beforeEach(() => {
      q = new PocketQueue<number>(5)
    })

    it('returns undefined on empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns first enqueued item', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('returns items in FIFO order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('decrements size', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('returns undefined after dequeueing all items', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns undefined when called repeatedly on empty', () => {
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })

    it('allows enqueue after dequeue from full', () => {
      const pq = new PocketQueue<number>(3)
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.dequeue()
      pq.enqueue(4)
      expect(pq.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new PocketQueue<number>(5)
      expect(q.peek()).toBeUndefined()
    })

    it('returns first item without removing it', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peek()).toBe(10)
      expect(q.size).toBe(2)
    })

    it('returns the new front after dequeue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('does not change on repeated calls', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(42)
      q.peek()
      q.peek()
      q.peek()
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(42)
    })
  })

  describe('size', () => {
    it('starts at 0', () => {
      const q = new PocketQueue<number>(5)
      expect(q.size).toBe(0)
    })

    it('increments on enqueue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('decrements on dequeue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('returns 0 after flush', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.size).toBe(0)
    })
  })

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const q = new PocketQueue<number>(10)
      expect(q.capacity).toBe(10)
    })

    it('remains constant after operations', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.flush()
      expect(q.capacity).toBe(3)
    })
  })

  describe('isFull', () => {
    it('is false when empty', () => {
      const q = new PocketQueue<number>(3)
      expect(q.isFull).toBe(false)
    })

    it('is false when partially filled', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      expect(q.isFull).toBe(false)
    })

    it('is true when at capacity', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull).toBe(true)
    })

    it('is false after dequeue from full', () => {
      const q = new PocketQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.isFull).toBe(false)
    })

    it('is false after flush', () => {
      const q = new PocketQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.isFull).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('is true on new queue', () => {
      const q = new PocketQueue<number>(5)
      expect(q.isEmpty).toBe(true)
    })

    it('is false after enqueue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      expect(q.isEmpty).toBe(false)
    })

    it('is true after dequeueing all', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty).toBe(true)
    })

    it('is true after flush', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.isEmpty).toBe(true)
    })

    it('is true after reset', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.reset()
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('flush', () => {
    it('returns empty array on empty queue', () => {
      const q = new PocketQueue<number>(5)
      expect(q.flush()).toEqual([])
    })

    it('returns all items in order', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.flush()).toEqual([1, 2, 3])
    })

    it('clears the queue after flush', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('allows enqueue after flush', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('does not increment batchSize for empty flush', () => {
      const q = new PocketQueue<number>(5)
      q.flush()
      expect(q.batchSize).toBe(0)
    })

    it('increments batchSize for non-empty flush', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.batchSize).toBe(1)
    })

    it('increments totalFlushed by number of items', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.totalFlushed).toBe(3)
    })

    it('handles multiple flushes', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.flush()
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.batchSize).toBe(2)
      expect(q.totalFlushed).toBe(3)
    })

    it('handles flush on full queue', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items = q.flush()
      expect(items).toEqual([1, 2, 3])
      expect(q.size).toBe(0)
    })
  })

  describe('pocket (alias for flush)', () => {
    it('returns all items like flush', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.pocket()).toEqual([1, 2])
    })

    it('clears the queue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.pocket()
      expect(q.size).toBe(0)
    })

    it('increments batchSize and totalFlushed', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.pocket()
      expect(q.batchSize).toBe(1)
      expect(q.totalFlushed).toBe(2)
    })

    it('returns empty array when empty', () => {
      const q = new PocketQueue<number>(5)
      expect(q.pocket()).toEqual([])
    })
  })

  describe('reset', () => {
    it('clears all items', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.reset()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('allows enqueue after reset', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.reset()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('does not increment batchSize', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.reset()
      expect(q.batchSize).toBe(0)
      expect(q.totalFlushed).toBe(0)
    })

    it('reset on empty queue is no-op', () => {
      const q = new PocketQueue<number>(5)
      q.reset()
      expect(q.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new PocketQueue<number>(5)
      expect(q.toArray()).toEqual([])
    })

    it('returns items in FIFO order', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns remaining items after dequeue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('does not modify the queue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.toArray()
      expect(q.size).toBe(2)
    })

    it('handles wraparound in circular buffer', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.dequeue()
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty queue', () => {
      const q = new PocketQueue<number>(5)
      const cb = vi.fn()
      q.forEach(cb)
      expect(cb).not.toHaveBeenCalled()
    })

    it('calls callback for each item in order', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const results: number[] = []
      q.forEach((item) => { results.push(item) })
      expect(results).toEqual([1, 2, 3])
    })

    it('passes correct index', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const indices: number[] = []
      q.forEach((_item, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not modify the queue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.forEach(() => {})
      expect(q.size).toBe(2)
    })

    it('handles queue with gaps after dequeue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const results: number[] = []
      q.forEach((item) => { results.push(item) })
      expect(results).toEqual([2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty queue', () => {
      const q = new PocketQueue<number>(5)
      expect([...q]).toEqual([])
    })

    it('iterates items in FIFO order', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect([...q]).toEqual([1, 2, 3])
    })

    it('works with for-of loop', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      const results: number[] = []
      for (const item of q) {
        results.push(item)
      }
      expect(results).toEqual([10, 20])
    })

    it('works with Array.from', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(Array.from(q)).toEqual([1, 2])
    })

    it('does not modify the queue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      ;[...q]
      expect(q.size).toBe(1)
    })
  })

  describe('enqueueMany', () => {
    it('adds multiple items from array', () => {
      const q = new PocketQueue<number>(10)
      q.enqueueMany([1, 2, 3])
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('adds items from empty array', () => {
      const q = new PocketQueue<number>(5)
      q.enqueueMany([])
      expect(q.size).toBe(0)
    })

    it('adds items from a Set', () => {
      const q = new PocketQueue<number>(10)
      q.enqueueMany(new Set([1, 2, 3]))
      expect(q.size).toBe(3)
    })

    it('triggers auto-flush when capacity exceeded', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueueMany([1, 2])
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith([1, 2])
    })

    it('handles enqueueMany on partially filled queue', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueueMany([2, 3, 4])
      expect(q.size).toBe(4)
      expect(q.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('dequeueMany', () => {
    it('returns empty array when count is 0', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      expect(q.dequeueMany(0)).toEqual([])
    })

    it('returns requested number of items', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeueMany(2)).toEqual([1, 2])
    })

    it('returns all items if count exceeds size', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueMany(10)).toEqual([1, 2])
    })

    it('returns empty array on empty queue', () => {
      const q = new PocketQueue<number>(5)
      expect(q.dequeueMany(5)).toEqual([])
    })

    it('decrements size correctly', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueMany(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('returns items in FIFO order', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeueMany(2)).toEqual([10, 20])
    })
  })

  describe('remaining', () => {
    it('returns capacity when empty', () => {
      const q = new PocketQueue<number>(5)
      expect(q.remaining).toBe(5)
    })

    it('returns capacity minus size', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remaining).toBe(3)
    })

    it('returns 0 when full', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remaining).toBe(0)
    })

    it('updates after dequeue', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.remaining).toBe(1)
    })

    it('updates after flush', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.remaining).toBe(3)
    })
  })

  describe('batchSize', () => {
    it('starts at 0', () => {
      const q = new PocketQueue<number>(5)
      expect(q.batchSize).toBe(0)
    })

    it('increments on each non-empty flush', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.flush()
      expect(q.batchSize).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.batchSize).toBe(2)
    })

    it('does not increment on empty flush', () => {
      const q = new PocketQueue<number>(5)
      q.flush()
      expect(q.batchSize).toBe(0)
    })

    it('tracks auto-flush batches', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.batchSize).toBe(2)
    })
  })

  describe('totalFlushed', () => {
    it('starts at 0', () => {
      const q = new PocketQueue<number>(5)
      expect(q.totalFlushed).toBe(0)
    })

    it('accumulates flushed item count', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.totalFlushed).toBe(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.flush()
      expect(q.totalFlushed).toBe(5)
    })

    it('does not increment on empty flush', () => {
      const q = new PocketQueue<number>(5)
      q.flush()
      expect(q.totalFlushed).toBe(0)
    })

    it('tracks total across auto-flushes', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.totalFlushed).toBe(4)
    })
  })

  describe('circular buffer wraparound', () => {
    it('handles head-tail wraparound correctly', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('handles full wraparound cycle', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('handles multiple wraparound cycles', () => {
      const q = new PocketQueue<number>(2)
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('handles enqueue-dequeue-then-fill', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
      expect(q.isFull).toBe(true)
    })
  })

  describe('autoFlush behavior', () => {
    it('calls onFlush when capacity reached', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(3, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith([1, 2, 3])
    })

    it('clears queue after auto-flush', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(0)
    })

    it('queues item after auto-flush correctly', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('auto-flushes on every capacity fill', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueue(10)
      q.enqueue(20)
      expect(cb).toHaveBeenLastCalledWith([10, 20])
      q.enqueue(30)
      q.enqueue(40)
      expect(cb).toHaveBeenLastCalledWith([30, 40])
      expect(cb).toHaveBeenCalledTimes(2)
    })

    it('does not auto-flush without callback', () => {
      const q = new PocketQueue<number>(2, true)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(0)
    })

    it('auto-flush with enqueueMany', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueueMany([1, 2, 3, 4])
      expect(cb).toHaveBeenCalledTimes(2)
    })

    it('flushes when full then new item triggers flush', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(3, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(cb).toHaveBeenCalledTimes(1)
      q.enqueue(4)
      expect(q.size).toBe(1)
      q.enqueue(5)
      q.enqueue(6)
      expect(cb).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenNthCalledWith(2, [4, 5, 6])
    })
  })

  describe('capacity 1 edge case', () => {
    it('handles enqueue and dequeue with capacity 1', () => {
      const q = new PocketQueue<number>(1)
      q.enqueue(1)
      expect(q.isFull).toBe(true)
      expect(q.dequeue()).toBe(1)
      expect(q.isEmpty).toBe(true)
    })

    it('handles flush with capacity 1', () => {
      const q = new PocketQueue<number>(1)
      q.enqueue(42)
      expect(q.flush()).toEqual([42])
      expect(q.size).toBe(0)
    })

    it('auto-flush with capacity 1', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(1, true, cb)
      q.enqueue(1)
      expect(cb).toHaveBeenCalledWith([1])
      expect(q.size).toBe(0)
    })

    it('auto-flush fires repeatedly with capacity 1', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(1, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(cb).toHaveBeenCalledTimes(3)
      expect(cb).toHaveBeenNthCalledWith(1, [1])
      expect(cb).toHaveBeenNthCalledWith(2, [2])
      expect(cb).toHaveBeenNthCalledWith(3, [3])
    })
  })

  describe('string values', () => {
    it('handles string items', () => {
      const q = new PocketQueue<string>(5)
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('dequeues strings in order', () => {
      const q = new PocketQueue<string>(5)
      q.enqueue('x')
      q.enqueue('y')
      expect(q.dequeue()).toBe('x')
      expect(q.dequeue()).toBe('y')
    })
  })

  describe('object values', () => {
    it('handles object references', () => {
      const q = new PocketQueue<{ id: number }>(5)
      const a = { id: 1 }
      const b = { id: 2 }
      q.enqueue(a)
      q.enqueue(b)
      expect(q.dequeue()).toBe(a)
      expect(q.dequeue()).toBe(b)
    })

    it('handles object references in flush', () => {
      const q = new PocketQueue<{ id: number }>(5)
      const a = { id: 1 }
      const b = { id: 2 }
      q.enqueue(a)
      q.enqueue(b)
      const items = q.flush()
      expect(items[0]).toBe(a)
      expect(items[1]).toBe(b)
    })
  })

  describe('large capacity', () => {
    it('handles 10000 enqueue/dequeue operations', () => {
      const q = new PocketQueue<number>(10000)
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10000)
      expect(q.isFull).toBe(true)
      expect(q.peek()).toBe(0)
    })

    it('handles 10000 dequeues', () => {
      const q = new PocketQueue<number>(5000)
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 5000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })

    it('handles large flush', () => {
      const q = new PocketQueue<number>(1000)
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      const items = q.flush()
      expect(items.length).toBe(1000)
      expect(q.totalFlushed).toBe(1000)
      expect(q.batchSize).toBe(1)
    })
  })

  describe('rapid enqueue/dequeue cycles', () => {
    it('handles alternating enqueue/dequeue', () => {
      const q = new PocketQueue<number>(10)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })

    it('handles batch enqueue then batch dequeue', () => {
      const q = new PocketQueue<number>(100)
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('dequeueMany edge cases', () => {
    it('handles negative count gracefully', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      const result = q.dequeueMany(-1)
      expect(result).toEqual([])
      expect(q.size).toBe(1)
    })

    it('handles dequeueMany equal to size', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeueMany(3)).toEqual([1, 2, 3])
      expect(q.isEmpty).toBe(true)
    })

    it('handles dequeueMany larger than size', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueMany(100)).toEqual([1, 2])
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('flush does not trigger onFlush callback', () => {
    it('manual flush does not call onFlush', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(5, true, cb)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(cb).not.toHaveBeenCalled()
    })
  })

  describe('enqueueMany with auto-flush exceeding capacity multiple times', () => {
    it('handles enqueueMany that exceeds capacity multiple times', () => {
      const cb = vi.fn()
      const q = new PocketQueue<number>(2, true, cb)
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(cb).toHaveBeenCalledTimes(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(5)
    })
  })

  describe('forEach with various states', () => {
    it('iterates over wrapped buffer', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      const results: number[] = []
      q.forEach((item) => { results.push(item) })
      expect(results).toEqual([2, 3, 4])
    })
  })

  describe('Symbol.iterator with wrapped buffer', () => {
    it('iterates correctly after wraparound', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      expect([...q]).toEqual([3, 4, 5])
    })
  })

  describe('sequential operations', () => {
    it('enqueue-dequeue-flush-enqueue sequence', () => {
      const q = new PocketQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      q.enqueue(4)
      const items = q.flush()
      expect(items).toEqual([2, 3, 4])
      q.enqueue(5)
      expect(q.peek()).toBe(5)
    })

    it('fill-flush-fill pattern', () => {
      const q = new PocketQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const first = q.flush()
      expect(first).toEqual([1, 2, 3])
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      const second = q.flush()
      expect(second).toEqual([4, 5, 6])
      expect(q.batchSize).toBe(2)
      expect(q.totalFlushed).toBe(6)
    })
  })
})
