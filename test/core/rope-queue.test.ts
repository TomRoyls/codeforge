import { describe, it, expect, beforeEach } from 'vitest'
import { RopeQueue } from '../../src/core/rope-queue/rope-queue.js'
import { DEFAULT_ROPE_QUEUE_OPTIONS } from '../../src/core/rope-queue/types.js'
import type { RopeQueueOptions, RopeQueueStats } from '../../src/core/rope-queue/types.js'

describe('RopeQueue', () => {
  describe('construction', () => {
    it('should create empty queue with default options', () => {
      const q = new RopeQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should create queue with custom leafSize', () => {
      const q = new RopeQueue<number>({ leafSize: 8 })
      expect(q.stats().leafSize).toBe(8)
    })

    it('should clamp leafSize to minimum 1', () => {
      const q = new RopeQueue<number>({ leafSize: 0 })
      expect(q.stats().leafSize).toBe(1)
    })

    it('should clamp negative leafSize to 1', () => {
      const q = new RopeQueue<number>({ leafSize: -5 })
      expect(q.stats().leafSize).toBe(1)
    })

    it('should have correct default leafSize', () => {
      expect(DEFAULT_ROPE_QUEUE_OPTIONS.leafSize).toBe(64)
    })

    it('should start with zero stats', () => {
      const q = new RopeQueue<number>()
      const s = q.stats()
      expect(s.totalEnqueued).toBe(0)
      expect(s.totalDequeued).toBe(0)
      expect(s.totalBulkEnqueued).toBe(0)
      expect(s.totalBulkDequeued).toBe(0)
      expect(s.leafCount).toBe(0)
      expect(s.depth).toBe(0)
    })

    it('should use default options when none provided', () => {
      const q = new RopeQueue<number>()
      expect(q.stats().leafSize).toBe(DEFAULT_ROPE_QUEUE_OPTIONS.leafSize)
    })
  })

  describe('enqueue', () => {
    let q: RopeQueue<number>

    beforeEach(() => {
      q = new RopeQueue<number>({ leafSize: 4 })
    })

    it('should enqueue a single item', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('should enqueue multiple items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('should update totalEnqueued', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.stats().totalEnqueued).toBe(2)
    })

    it('should create new leaf when current is full', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.stats().leafCount).toBe(2)
    })

    it('should maintain correct order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should fill exactly one leaf', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.stats().leafCount).toBe(1)
      expect(q.size).toBe(4)
    })

    it('should spill to second leaf on overflow', () => {
      for (let i = 0; i < 5; i++) q.enqueue(i)
      expect(q.size).toBe(5)
      expect(q.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle enqueue after dequeue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      expect(q.toArray()).toEqual([2, 3])
    })
  })

  describe('dequeue', () => {
    let q: RopeQueue<number>

    beforeEach(() => {
      q = new RopeQueue<number>({ leafSize: 4 })
    })

    it('should return undefined on empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('should dequeue first element', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('should dequeue in FIFO order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('should decrease size', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('should update totalDequeued', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.stats().totalDequeued).toBe(1)
    })

    it('should return undefined when queue becomes empty', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('should handle dequeue across leaf boundaries', () => {
      for (let i = 0; i < 8; i++) q.enqueue(i)
      for (let i = 0; i < 4; i++) q.dequeue()
      expect(q.dequeue()).toBe(4)
      expect(q.size).toBe(3)
    })

    it('should drain entire queue', () => {
      for (let i = 0; i < 6; i++) q.enqueue(i)
      for (let i = 0; i < 6; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
      expect(q.dequeue()).toBeUndefined()
    })

    it('should handle dequeue on single item', () => {
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.size).toBe(0)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty queue', () => {
      const q = new RopeQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('should return front element', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
    })

    it('should not remove element', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.peek()
      expect(q.size).toBe(1)
    })

    it('should return first element after dequeue', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('should work after enqueueAll', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([10, 20, 30])
      expect(q.peek()).toBe(10)
    })
  })

  describe('enqueueAll', () => {
    it('should add multiple items', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('should maintain order', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([])
      expect(q.size).toBe(0)
    })

    it('should update totalBulkEnqueued', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      expect(q.stats().totalBulkEnqueued).toBe(1)
    })

    it('should append to existing items', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueueAll([2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should work on empty queue', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([5, 6, 7])
      expect(q.toArray()).toEqual([5, 6, 7])
    })

    it('should accept a Set as iterable', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll(new Set([1, 2, 3]))
      expect(q.size).toBe(3)
    })

    it('should accept a generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const q = new RopeQueue<number>()
      q.enqueueAll(gen())
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should update totalEnqueued', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      expect(q.stats().totalEnqueued).toBe(3)
    })

    it('should handle large batch', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll(Array.from({ length: 10000 }, (_, i) => i))
      expect(q.size).toBe(10000)
      expect(q.peek()).toBe(0)
      expect(q.last).toBe(9999)
    })
  })

  describe('dequeueN', () => {
    it('should dequeue 0 items', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      expect(q.dequeueN(0)).toEqual([])
    })

    it('should dequeue specified number of items', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      expect(q.dequeueN(3)).toEqual([1, 2, 3])
    })

    it('should decrease size', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      q.dequeueN(2)
      expect(q.size).toBe(3)
    })

    it('should clamp to available items', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2])
      expect(q.dequeueN(5)).toEqual([1, 2])
    })

    it('should handle negative n', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      expect(q.dequeueN(-1)).toEqual([])
    })

    it('should return empty array for empty queue', () => {
      const q = new RopeQueue<number>()
      expect(q.dequeueN(5)).toEqual([])
    })

    it('should update totalBulkDequeued', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4])
      q.dequeueN(2)
      expect(q.stats().totalBulkDequeued).toBe(1)
    })

    it('should maintain order after dequeueN', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      q.dequeueN(2)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should drain entire queue', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.dequeueN(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle cross-leaf dequeueN', () => {
      const q = new RopeQueue<number>({ leafSize: 4 })
      q.enqueueAll([1, 2, 3, 4, 5, 6, 7, 8])
      const result = q.dequeueN(5)
      expect(result).toEqual([1, 2, 3, 4, 5])
      expect(q.toArray()).toEqual([6, 7, 8])
    })
  })

  describe('split', () => {
    it('should split empty queue', () => {
      const q = new RopeQueue<number>()
      const [left, right] = q.split(3)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('should split at beginning', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      const [left, right] = q.split(0)
      expect(left.size).toBe(0)
      expect(right.size).toBe(5)
      expect(right.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should split at end', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      const [left, right] = q.split(5)
      expect(left.size).toBe(5)
      expect(left.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(right.size).toBe(0)
    })

    it('should split in middle', () => {
      const q = RopeQueue.from([1, 2, 3, 4, 5])
      const [left, right] = q.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4, 5])
    })

    it('should clamp negative n', () => {
      const q = RopeQueue.from([1, 2, 3])
      const [left, right] = q.split(-1)
      expect(left.size).toBe(0)
      expect(right.size).toBe(3)
    })

    it('should clamp n greater than size', () => {
      const q = RopeQueue.from([1, 2, 3])
      const [left, right] = q.split(100)
      expect(left.size).toBe(3)
      expect(right.size).toBe(0)
    })

    it('should not modify original queue', () => {
      const q = RopeQueue.from([1, 2, 3, 4, 5])
      q.split(2)
      expect(q.size).toBe(5)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should produce independent queues', () => {
      const q = RopeQueue.from([1, 2, 3, 4])
      const [left, right] = q.split(2)
      left.enqueue(99)
      expect(right.size).toBe(2)
    })
  })

  describe('first / last', () => {
    it('should return undefined first on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.first).toBeUndefined()
    })

    it('should return undefined last on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.last).toBeUndefined()
    })

    it('should return first element', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([10, 20, 30])
      expect(q.first).toBe(10)
    })

    it('should return last element', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([10, 20, 30])
      expect(q.last).toBe(30)
    })

    it('should update first after dequeue', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.dequeue()
      expect(q.first).toBe(2)
    })

    it('should return same element for single item', () => {
      const q = new RopeQueue<number>()
      q.enqueue(42)
      expect(q.first).toBe(42)
      expect(q.last).toBe(42)
    })
  })

  describe('size', () => {
    it('should be 0 for new queue', () => {
      const q = new RopeQueue<number>()
      expect(q.size).toBe(0)
    })

    it('should increase on enqueue', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('should decrease on dequeue', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('should reflect enqueueAll', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('should reflect dequeueN', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      q.dequeueN(2)
      expect(q.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new queue', () => {
      const q = new RopeQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('should be false after enqueue', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should be true after draining', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('should be true after clear', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty queue', () => {
      const q = new RopeQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should clear queue with items', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should allow operations after clear', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.clear()
      q.enqueue(4)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(4)
    })

    it('should allow enqueueAll after clear', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2])
      q.clear()
      q.enqueueAll([3, 4, 5])
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should reset stats counters', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.clear()
      const s = q.stats()
      expect(s.leafCount).toBe(0)
      expect(s.depth).toBe(0)
    })
  })

  describe('clone', () => {
    it('should clone empty queue', () => {
      const q = new RopeQueue<number>()
      const c = q.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone queue with items', () => {
      const q = RopeQueue.from([1, 2, 3])
      const c = q.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should not affect original', () => {
      const q = RopeQueue.from([1, 2, 3])
      const c = q.clone()
      c.enqueue(4)
      expect(q.size).toBe(3)
      expect(c.size).toBe(4)
    })

    it('should preserve leafSize', () => {
      const q = new RopeQueue<number>({ leafSize: 8 })
      q.enqueueAll([1, 2, 3])
      const c = q.clone()
      expect(c.stats().leafSize).toBe(8)
    })

    it('should be independent after dequeue', () => {
      const q = RopeQueue.from([1, 2, 3])
      const c = q.clone()
      c.dequeue()
      expect(q.size).toBe(3)
      expect(c.size).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const q = new RopeQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('should return items in order', () => {
      const q = RopeQueue.from([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect modifications', () => {
      const q = RopeQueue.from([1, 2, 3, 4, 5])
      q.dequeue()
      q.enqueue(6)
      expect(q.toArray()).toEqual([2, 3, 4, 5, 6])
    })

    it('should return snapshot', () => {
      const q = RopeQueue.from([1, 2, 3])
      const arr = q.toArray()
      arr.push(99)
      expect(q.size).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should iterate empty queue', () => {
      const q = new RopeQueue<number>()
      const items: number[] = []
      q.forEach(item => items.push(item))
      expect(items).toEqual([])
    })

    it('should iterate all items', () => {
      const q = RopeQueue.from([1, 2, 3])
      const items: number[] = []
      q.forEach(item => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct index', () => {
      const q = RopeQueue.from([10, 20, 30])
      const indices: number[] = []
      q.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should iterate in FIFO order', () => {
      const q = RopeQueue.from([1, 2, 3])
      const items: number[] = []
      q.forEach(item => items.push(item))
      expect(items[0]).toBe(1)
      expect(items[2]).toBe(3)
    })

    it('should work after dequeue', () => {
      const q = RopeQueue.from([1, 2, 3])
      q.dequeue()
      const items: number[] = []
      q.forEach(item => items.push(item))
      expect(items).toEqual([2, 3])
    })
  })

  describe('static from', () => {
    it('should create from array', () => {
      const q = RopeQueue.from([1, 2, 3])
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should create from empty array', () => {
      const q = RopeQueue.from([])
      expect(q.size).toBe(0)
    })

    it('should create with options', () => {
      const q = RopeQueue.from([1, 2, 3], { leafSize: 8 })
      expect(q.stats().leafSize).toBe(8)
    })

    it('should accept Set', () => {
      const q = RopeQueue.from(new Set([1, 2, 3]))
      expect(q.size).toBe(3)
    })

    it('should accept generator', () => {
      function* gen() {
        yield 'a'
        yield 'b'
      }
      const q = RopeQueue.from(gen())
      expect(q.toArray()).toEqual(['a', 'b'])
    })

    it('should create from string iterable', () => {
      const q = RopeQueue.from('hello')
      expect(q.toArray()).toEqual(['h', 'e', 'l', 'l', 'o'])
    })

    it('should create from large array', () => {
      const q = RopeQueue.from(Array.from({ length: 1000 }, (_, i) => i))
      expect(q.size).toBe(1000)
      expect(q.first).toBe(0)
      expect(q.last).toBe(999)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty queue', () => {
      const q = new RopeQueue<number>()
      const s = q.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.leafCount).toBe(0)
      expect(s.depth).toBe(0)
    })

    it('should return correct stats after enqueue', () => {
      const q = new RopeQueue<number>({ leafSize: 4 })
      q.enqueueAll([1, 2, 3])
      const s = q.stats()
      expect(s.size).toBe(3)
      expect(s.isEmpty).toBe(false)
      expect(s.leafCount).toBe(1)
      expect(s.depth).toBe(0)
    })

    it('should track totalEnqueued', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueueAll([3, 4])
      expect(q.stats().totalEnqueued).toBe(4)
    })

    it('should track totalDequeued', () => {
      const q = RopeQueue.from([1, 2, 3, 4, 5])
      q.dequeue()
      q.dequeueN(2)
      expect(q.stats().totalDequeued).toBe(3)
    })

    it('should track totalBulkEnqueued', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueueAll([2, 3])
      q.enqueueAll([4, 5])
      expect(q.stats().totalBulkEnqueued).toBe(2)
    })

    it('should track totalBulkDequeued', () => {
      const q = RopeQueue.from([1, 2, 3, 4, 5])
      q.dequeueN(2)
      q.dequeueN(1)
      expect(q.stats().totalBulkDequeued).toBe(2)
    })

    it('should report depth > 0 with multiple leaves', () => {
      const q = new RopeQueue<number>({ leafSize: 2 })
      for (let i = 0; i < 5; i++) q.enqueue(i)
      expect(q.stats().depth).toBeGreaterThan(0)
    })

    it('should report leafSize', () => {
      const q = new RopeQueue<number>({ leafSize: 32 })
      expect(q.stats().leafSize).toBe(32)
    })
  })

  describe('edge cases - empty queue', () => {
    it('should handle dequeue on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('should handle peek on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('should handle dequeueN on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.dequeueN(10)).toEqual([])
    })

    it('should handle toArray on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('should handle first/last on empty', () => {
      const q = new RopeQueue<number>()
      expect(q.first).toBeUndefined()
      expect(q.last).toBeUndefined()
    })

    it('should handle clone of empty', () => {
      const q = new RopeQueue<number>()
      const c = q.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should handle split of empty', () => {
      const q = new RopeQueue<number>()
      const [l, r] = q.split(5)
      expect(l.isEmpty()).toBe(true)
      expect(r.isEmpty()).toBe(true)
    })
  })

  describe('edge cases - single item', () => {
    it('should handle single enqueue/dequeue cycle', () => {
      const q = new RopeQueue<number>()
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle first/last on single item', () => {
      const q = new RopeQueue<number>()
      q.enqueue(99)
      expect(q.first).toBe(99)
      expect(q.last).toBe(99)
    })

    it('should handle toArray on single item', () => {
      const q = new RopeQueue<number>()
      q.enqueue(7)
      expect(q.toArray()).toEqual([7])
    })

    it('should handle forEach on single item', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      let sum = 0
      q.forEach(item => { sum += item })
      expect(sum).toBe(1)
    })

    it('should handle split of single item', () => {
      const q = RopeQueue.from([42])
      const [l, r] = q.split(1)
      expect(l.toArray()).toEqual([42])
      expect(r.isEmpty()).toBe(true)
    })
  })

  describe('large batches', () => {
    it('should handle 10000 items via enqueue', () => {
      const q = new RopeQueue<number>({ leafSize: 64 })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10000)
      expect(q.first).toBe(0)
      expect(q.last).toBe(9999)
    })

    it('should handle 10000 items via enqueueAll', () => {
      const items = Array.from({ length: 10000 }, (_, i) => i)
      const q = RopeQueue.from(items)
      expect(q.size).toBe(10000)
      expect(q.toArray()[0]).toBe(0)
      expect(q.toArray()[9999]).toBe(9999)
    })

    it('should dequeue 10000 items in order', () => {
      const q = RopeQueue.from(Array.from({ length: 10000 }, (_, i) => i))
      for (let i = 0; i < 10000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle dequeueN of 5000 from 10000', () => {
      const q = RopeQueue.from(Array.from({ length: 10000 }, (_, i) => i))
      const first = q.dequeueN(5000)
      expect(first.length).toBe(5000)
      expect(first[0]).toBe(0)
      expect(first[4999]).toBe(4999)
      expect(q.size).toBe(5000)
    })

    it('should handle split of 10000 items', () => {
      const q = RopeQueue.from(Array.from({ length: 10000 }, (_, i) => i))
      const [left, right] = q.split(7000)
      expect(left.size).toBe(7000)
      expect(right.size).toBe(3000)
    })

    it('should handle clone of large queue', () => {
      const q = RopeQueue.from(Array.from({ length: 10000 }, (_, i) => i))
      const c = q.clone()
      expect(c.size).toBe(10000)
      expect(c.first).toBe(0)
      expect(c.last).toBe(9999)
    })

    it('should handle forEach on 10000 items', () => {
      const q = RopeQueue.from(Array.from({ length: 10000 }, (_, i) => i))
      let sum = 0
      q.forEach(item => { sum += item })
      expect(sum).toBe(49995000)
    })

    it('should handle interleaved ops on large queue', () => {
      const q = new RopeQueue<number>({ leafSize: 16 })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 2000; i++) {
        q.dequeue()
      }
      for (let i = 5000; i < 7000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(5000)
    })
  })

  describe('interleaved operations', () => {
    it('should handle enqueue-dequeue-enqueue pattern', () => {
      const q = new RopeQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([3])
    })

    it('should handle enqueueAll then dequeue then enqueueAll', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3])
      q.dequeue()
      q.enqueueAll([4, 5])
      expect(q.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle dequeueN then enqueueAll', () => {
      const q = new RopeQueue<number>()
      q.enqueueAll([1, 2, 3, 4, 5])
      q.dequeueN(2)
      q.enqueueAll([6, 7])
      expect(q.toArray()).toEqual([3, 4, 5, 6, 7])
    })

    it('should handle rapid enqueue-dequeue cycle', () => {
      const q = new RopeQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })

    it('should handle bulk then individual operations', () => {
      const q = new RopeQueue<number>({ leafSize: 4 })
      q.enqueueAll([1, 2, 3, 4, 5, 6, 7, 8])
      expect(q.dequeue()).toBe(1)
      q.enqueue(9)
      expect(q.dequeueN(3)).toEqual([2, 3, 4])
      expect(q.toArray()).toEqual([5, 6, 7, 8, 9])
    })

    it('should handle split then modify both halves', () => {
      const q = RopeQueue.from([1, 2, 3, 4, 5, 6])
      const [left, right] = q.split(3)
      left.enqueue(7)
      right.enqueue(8)
      expect(left.toArray()).toEqual([1, 2, 3, 7])
      expect(right.toArray()).toEqual([4, 5, 6, 8])
    })

    it('should handle clear then reuse', () => {
      const q = RopeQueue.from([1, 2, 3])
      q.clear()
      q.enqueueAll([4, 5, 6])
      q.enqueue(7)
      expect(q.toArray()).toEqual([4, 5, 6, 7])
    })

    it('should handle clone then modify both', () => {
      const q = RopeQueue.from([1, 2, 3])
      const c = q.clone()
      q.enqueue(4)
      c.enqueue(5)
      expect(q.toArray()).toEqual([1, 2, 3, 4])
      expect(c.toArray()).toEqual([1, 2, 3, 5])
    })
  })

  describe('string values', () => {
    it('should work with strings', () => {
      const q = new RopeQueue<string>()
      q.enqueueAll(['a', 'b', 'c'])
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should handle string dequeue', () => {
      const q = RopeQueue.from(['hello', 'world'])
      expect(q.dequeue()).toBe('hello')
    })

    it('should handle string peek', () => {
      const q = RopeQueue.from(['first'])
      expect(q.peek()).toBe('first')
    })
  })

  describe('object values', () => {
    it('should work with object references', () => {
      const a = { id: 1 }
      const b = { id: 2 }
      const q = new RopeQueue<{ id: number }>()
      q.enqueue(a)
      q.enqueue(b)
      expect(q.dequeue()).toBe(a)
      expect(q.dequeue()).toBe(b)
    })

    it('should preserve references through toArray', () => {
      const obj = { id: 42 }
      const q = RopeQueue.from([obj])
      expect(q.toArray()[0]).toBe(obj)
    })

    it('should preserve references through clone', () => {
      const obj = { id: 1 }
      const q = RopeQueue.from([obj])
      const c = q.clone()
      expect(c.toArray()[0]).toBe(obj)
    })
  })

  describe('type imports', () => {
    it('should export types correctly', () => {
      const opts: RopeQueueOptions = { leafSize: 16 }
      const q = new RopeQueue<number>(opts)
      const s: RopeQueueStats = q.stats()
      expect(s.leafSize).toBe(16)
    })
  })

  describe('leaf boundary handling', () => {
    it('should handle exact leaf fill and dequeue', () => {
      const q = new RopeQueue<number>({ leafSize: 3 })
      q.enqueueAll([1, 2, 3])
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle crossing leaf boundary on dequeue', () => {
      const q = new RopeQueue<number>({ leafSize: 2 })
      q.enqueueAll([1, 2, 3, 4])
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle enqueue after draining to empty across leaves', () => {
      const q = new RopeQueue<number>({ leafSize: 2 })
      q.enqueueAll([1, 2, 3, 4])
      q.dequeueN(4)
      q.enqueue(5)
      expect(q.peek()).toBe(5)
      expect(q.size).toBe(1)
    })

    it('should handle multiple leaves via individual enqueue', () => {
      const q = new RopeQueue<number>({ leafSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.stats().leafCount).toBeGreaterThanOrEqual(2)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle leafSize of 1', () => {
      const q = new RopeQueue<number>({ leafSize: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })
  })

  describe('rebalancing', () => {
    it('should handle many bulk enqueues that trigger rebalance', () => {
      const q = new RopeQueue<number>({ leafSize: 4 })
      for (let i = 0; i < 100; i++) {
        q.enqueueAll([i * 10, i * 10 + 1])
      }
      expect(q.size).toBe(200)
      expect(q.first).toBe(0)
      expect(q.last).toBe(991)
    })

    it('should maintain order after rebalance', () => {
      const q = new RopeQueue<number>({ leafSize: 2 })
      for (let i = 0; i < 50; i++) {
        q.enqueueAll([i])
      }
      const arr = q.toArray()
      for (let i = 0; i < 50; i++) {
        expect(arr[i]).toBe(i)
      }
    })
  })
})
