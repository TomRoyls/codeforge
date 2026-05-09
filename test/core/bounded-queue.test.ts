import { describe, it, expect, beforeEach } from 'vitest'
import { BoundedQueue } from '../../src/core/bounded-queue/bounded-queue.js'
import { DEFAULT_BOUNDED_QUEUE_OPTIONS } from '../../src/core/bounded-queue/types.js'
import type { BoundedQueueOptions, BoundedQueueStats, EvictionPolicy } from '../../src/core/bounded-queue/types.js'

describe('BoundedQueue', () => {
  describe('construction - fifo', () => {
    it('should create queue with default options', () => {
      const q = new BoundedQueue<number>()
      expect(q.capacity).toBe(DEFAULT_BOUNDED_QUEUE_OPTIONS.capacity)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.isFull).toBe(false)
    })

    it('should create queue with custom capacity', () => {
      const q = new BoundedQueue<number>({ capacity: 10, policy: 'fifo' })
      expect(q.capacity).toBe(10)
    })

    it('should clamp capacity to minimum 1', () => {
      const q = new BoundedQueue<number>({ capacity: 0, policy: 'fifo' })
      expect(q.capacity).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const q = new BoundedQueue<number>({ capacity: -5, policy: 'fifo' })
      expect(q.capacity).toBe(1)
    })

    it('should default to fifo policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      const s = q.stats()
      expect(s.policy).toBe('fifo')
    })

    it('should start with zero stats', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      const s = q.stats()
      expect(s.totalEnqueued).toBe(0)
      expect(s.totalDequeued).toBe(0)
      expect(s.totalEvicted).toBe(0)
    })
  })

  describe('construction - lru', () => {
    it('should create queue with lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.stats().policy).toBe('lru')
    })

    it('should start empty with lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.isEmpty()).toBe(true)
      expect(q.size).toBe(0)
    })

    it('should clamp capacity for lru', () => {
      const q = new BoundedQueue<number>({ capacity: 0, policy: 'lru' })
      expect(q.capacity).toBe(1)
    })
  })

  describe('construction - random', () => {
    it('should create queue with random policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.stats().policy).toBe('random')
    })

    it('should start empty with random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.isEmpty()).toBe(true)
      expect(q.size).toBe(0)
    })

    it('should clamp capacity for random', () => {
      const q = new BoundedQueue<number>({ capacity: -1, policy: 'random' })
      expect(q.capacity).toBe(1)
    })
  })

  describe('enqueue - fifo', () => {
    let q: BoundedQueue<number>

    beforeEach(() => {
      q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
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

    it('should return undefined when not full', () => {
      expect(q.enqueue(1)).toBeUndefined()
    })

    it('should evict oldest when full (fifo)', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(1)
    })

    it('should evict in fifo order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(4)).toBe(1)
      expect(q.enqueue(5)).toBe(2)
    })

    it('should maintain correct size after eviction', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.size).toBe(3)
    })

    it('should update totalEnqueued', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.stats().totalEnqueued).toBe(2)
    })

    it('should update totalEvicted', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.stats().totalEvicted).toBe(1)
    })

    it('should handle rapid enqueue cycle', () => {
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([97, 98, 99])
    })
  })

  describe('enqueue - lru', () => {
    let q: BoundedQueue<number>

    beforeEach(() => {
      q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
    })

    it('should enqueue a single item', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('should return undefined when not full', () => {
      expect(q.enqueue(1)).toBeUndefined()
    })

    it('should evict lru element when full', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(1)
    })

    it('should evict least recently accessed', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(2)
    })

    it('should update recency on contains', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(2)
      q.contains(3)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(1)
    })

    it('should handle all items being accessed', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(3)
      q.contains(2)
      q.contains(1)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(3)
    })

    it('should update totalEvicted for lru', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.stats().totalEvicted).toBe(1)
    })
  })

  describe('enqueue - random', () => {
    it('should evict when full', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const evicted = q.enqueue(4)
      expect(evicted).toBeDefined()
      expect(q.size).toBe(3)
    })

    it('should maintain size after multiple evictions', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(2)
    })

    it('should return evicted element', () => {
      const q = new BoundedQueue<number>({ capacity: 1, policy: 'random' })
      q.enqueue(1)
      const evicted = q.enqueue(2)
      expect(evicted).toBe(1)
    })
  })

  describe('dequeue - fifo', () => {
    let q: BoundedQueue<number>

    beforeEach(() => {
      q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
    })

    it('should return undefined on empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('should dequeue the first element', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('should dequeue in fifo order', () => {
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
  })

  describe('dequeue - lru', () => {
    it('should dequeue from front of lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('should return undefined on empty lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.dequeue()).toBeUndefined()
    })

    it('should handle dequeue after contains', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      expect(q.dequeue()).toBe(1)
      expect(q.toArray()).toEqual([2, 3])
    })
  })

  describe('dequeue - random', () => {
    it('should dequeue first element', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const val = q.dequeue()
      expect(val).toBeDefined()
      expect(q.size).toBe(2)
    })

    it('should return undefined on empty random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return undefined on empty fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      expect(q.peek()).toBeUndefined()
    })

    it('should return front of fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
    })

    it('should not remove element on fifo peek', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.peek()
      expect(q.size).toBe(1)
    })

    it('should return undefined on empty lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      expect(q.peek()).toBeUndefined()
    })

    it('should return front of lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
    })

    it('should return undefined on empty random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'random' })
      expect(q.peek()).toBeUndefined()
    })

    it('should return first element of random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peek()).toBe(10)
    })

    it('should not remove element on lru peek', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.peek()
      expect(q.size).toBe(1)
    })
  })

  describe('peekBack', () => {
    it('should return undefined on empty fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      expect(q.peekBack()).toBeUndefined()
    })

    it('should return back of fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('should not remove element on peekBack', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.peekBack()
      expect(q.size).toBe(1)
    })

    it('should return undefined on empty lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      expect(q.peekBack()).toBeUndefined()
    })

    it('should return back of lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('should return undefined on empty random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'random' })
      expect(q.peekBack()).toBeUndefined()
    })

    it('should return last element of random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peekBack()).toBe(20)
    })
  })

  describe('isFull', () => {
    it('should be false when empty fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      expect(q.isFull).toBe(false)
    })

    it('should be true when full fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(true)
    })

    it('should be false after dequeue from full', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.isFull).toBe(false)
    })

    it('should be false when empty lru', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'lru' })
      expect(q.isFull).toBe(false)
    })

    it('should be true when full lru', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(true)
    })

    it('should be false when empty random', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'random' })
      expect(q.isFull).toBe(false)
    })

    it('should be true when full random', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(true)
    })
  })

  describe('size', () => {
    it('should track size for fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      expect(q.size).toBe(0)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('should track size for lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.size).toBe(0)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('should track size for random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.size).toBe(0)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.dequeue()
      expect(q.size).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return capacity for fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 10, policy: 'fifo' })
      expect(q.capacity).toBe(10)
    })

    it('should return capacity for lru', () => {
      const q = new BoundedQueue<number>({ capacity: 10, policy: 'lru' })
      expect(q.capacity).toBe(10)
    })

    it('should return capacity for random', () => {
      const q = new BoundedQueue<number>({ capacity: 10, policy: 'random' })
      expect(q.capacity).toBe(10)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      expect(q.isEmpty()).toBe(true)
    })

    it('should be false after enqueue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should be true after dequeueing all', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('should be true on new lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.isEmpty()).toBe(true)
    })

    it('should be true on new random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should allow enqueue after clear fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('should clear lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should allow enqueue after clear lru', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
    })

    it('should clear random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should allow enqueue after clear random', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
    })
  })

  describe('clone', () => {
    it('should clone fifo queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const c = q.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(c.capacity).toBe(5)
      expect(c.stats().policy).toBe('fifo')
    })

    it('should not affect original on fifo clone', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      const c = q.clone()
      c.enqueue(3)
      expect(q.size).toBe(2)
      expect(c.size).toBe(3)
    })

    it('should clone lru queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const c = q.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(c.stats().policy).toBe('lru')
    })

    it('should not affect original on lru clone', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      const c = q.clone()
      c.enqueue(2)
      expect(q.size).toBe(1)
      expect(c.size).toBe(2)
    })

    it('should clone random queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      const c = q.clone()
      expect(c.toArray()).toEqual([1, 2])
      expect(c.stats().policy).toBe('random')
    })

    it('should clone empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      const c = q.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('from factory', () => {
    it('should create from array with fifo', () => {
      const q = BoundedQueue.from([1, 2, 3], { capacity: 10, policy: 'fifo' })
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should create from array with lru', () => {
      const q = BoundedQueue.from([1, 2, 3], { capacity: 10, policy: 'lru' })
      expect(q.size).toBe(3)
    })

    it('should create from array with random', () => {
      const q = BoundedQueue.from([1, 2, 3], { capacity: 10, policy: 'random' })
      expect(q.size).toBe(3)
    })

    it('should evict when items exceed capacity', () => {
      const q = BoundedQueue.from([1, 2, 3, 4, 5], { capacity: 3, policy: 'fifo' })
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should create from empty array', () => {
      const q = BoundedQueue.from([], { capacity: 5, policy: 'fifo' })
      expect(q.size).toBe(0)
    })

    it('should use default options when none provided', () => {
      const q = BoundedQueue.from([1, 2, 3])
      expect(q.capacity).toBe(DEFAULT_BOUNDED_QUEUE_OPTIONS.capacity)
      expect(q.stats().policy).toBe(DEFAULT_BOUNDED_QUEUE_OPTIONS.policy)
    })

    it('should accept a set as iterable', () => {
      const q = BoundedQueue.from(new Set([1, 2, 3]), { capacity: 10, policy: 'fifo' })
      expect(q.size).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      expect(q.toArray()).toEqual([])
    })

    it('should return items in order for fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.toArray()).toEqual([])
    })

    it('should return items in fifo order for lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.toArray()).toEqual([])
    })

    it('should return items for random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.toArray()).toEqual([10, 20])
    })
  })

  describe('contains', () => {
    it('should return false for empty fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      expect(q.contains(1)).toBe(false)
    })

    it('should return true if element exists in fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(1)).toBe(true)
      expect(q.contains(2)).toBe(true)
    })

    it('should return false if element does not exist in fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      expect(q.contains(99)).toBe(false)
    })

    it('should return false for empty lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.contains(1)).toBe(false)
    })

    it('should return true if element exists in lru', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(1)).toBe(true)
    })

    it('should update recency on lru contains', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(2)
    })

    it('should return false for empty random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.contains(1)).toBe(false)
    })

    it('should return true if element exists in random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(1)).toBe(true)
      expect(q.contains(2)).toBe(true)
    })

    it('should return false if element does not exist in random', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(1)
      expect(q.contains(99)).toBe(false)
    })
  })

  describe('eviction - fifo', () => {
    it('should evict oldest element', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(4)).toBe(1)
      expect(q.enqueue(5)).toBe(2)
      expect(q.enqueue(6)).toBe(3)
    })

    it('should handle wraparound in circular buffer', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should track eviction count', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.stats().totalEvicted).toBe(3)
    })
  })

  describe('eviction - lru', () => {
    it('should evict least recently used', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      q.contains(2)
      expect(q.enqueue(4)).toBe(3)
    })

    it('should handle multiple access updates', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      q.contains(3)
      q.contains(1)
      expect(q.enqueue(4)).toBe(2)
    })

    it('should evict in access order after peek', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.peek()
      expect(q.enqueue(4)).toBe(2)
    })
  })

  describe('eviction - random', () => {
    it('should evict an element when full', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const evicted = q.enqueue(4)
      expect(evicted).toBeDefined()
      expect(q.size).toBe(3)
    })

    it('should handle multiple evictions', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'random' })
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(2)
      expect(q.stats().totalEvicted).toBe(8)
    })
  })

  describe('edge cases - capacity 1', () => {
    it('should work with fifo capacity 1', () => {
      const q = new BoundedQueue<number>({ capacity: 1, policy: 'fifo' })
      expect(q.enqueue(1)).toBeUndefined()
      expect(q.isFull).toBe(true)
      expect(q.enqueue(2)).toBe(1)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('should work with lru capacity 1', () => {
      const q = new BoundedQueue<number>({ capacity: 1, policy: 'lru' })
      q.enqueue(1)
      expect(q.isFull).toBe(true)
      expect(q.enqueue(2)).toBe(1)
      expect(q.size).toBe(1)
    })

    it('should work with random capacity 1', () => {
      const q = new BoundedQueue<number>({ capacity: 1, policy: 'random' })
      q.enqueue(1)
      expect(q.isFull).toBe(true)
      expect(q.enqueue(2)).toBe(1)
      expect(q.size).toBe(1)
    })

    it('should dequeue from capacity 1 fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 1, policy: 'fifo' })
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('edge cases - empty queue dequeue', () => {
    it('should return undefined on empty fifo dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      expect(q.dequeue()).toBeUndefined()
    })

    it('should return undefined on empty lru dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      expect(q.dequeue()).toBeUndefined()
    })

    it('should return undefined on empty random dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('edge cases - full queue behavior', () => {
    it('should handle enqueue-dequeue cycle on full fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('should handle clear on full queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isFull).toBe(false)
    })
  })

  describe('edge cases - rapid enqueue/dequeue cycle', () => {
    it('should handle rapid cycle on fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })

    it('should handle rapid cycle on lru', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })

    it('should handle rapid cycle on random', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'random' })
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })
  })

  describe('large queues', () => {
    it('should handle fifo with 10000 items', () => {
      const q = new BoundedQueue<number>({ capacity: 10000, policy: 'fifo' })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10000)
      expect(q.isFull).toBe(true)
      expect(q.peek()).toBe(0)
      expect(q.peekBack()).toBe(9999)
    })

    it('should handle lru with 10000 items', () => {
      const q = new BoundedQueue<number>({ capacity: 10000, policy: 'lru' })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10000)
      expect(q.isFull).toBe(true)
    })

    it('should handle random with 10000 items', () => {
      const q = new BoundedQueue<number>({ capacity: 10000, policy: 'random' })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10000)
      expect(q.isFull).toBe(true)
    })

    it('should evict from fifo 10000', () => {
      const q = new BoundedQueue<number>({ capacity: 10000, policy: 'fifo' })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      const evicted = q.enqueue(10000)
      expect(evicted).toBe(0)
      expect(q.size).toBe(10000)
    })

    it('should handle large dequeue fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 10000, policy: 'fifo' })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 5000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      const s = q.stats()
      expect(s.capacity).toBe(5)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.isFull).toBe(false)
      expect(s.policy).toBe('fifo')
      expect(s.totalEnqueued).toBe(0)
      expect(s.totalDequeued).toBe(0)
      expect(s.totalEvicted).toBe(0)
    })

    it('should return correct stats after operations', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const s = q.stats()
      expect(s.size).toBe(1)
      expect(s.isEmpty).toBe(false)
      expect(s.isFull).toBe(false)
      expect(s.totalEnqueued).toBe(3)
      expect(s.totalDequeued).toBe(1)
      expect(s.totalEvicted).toBe(1)
    })

    it('should reflect lru policy in stats', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      const s = q.stats()
      expect(s.policy).toBe('lru')
      expect(s.totalEvicted).toBe(1)
    })

    it('should reflect random policy in stats', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const s = q.stats()
      expect(s.policy).toBe('random')
      expect(s.totalEvicted).toBe(1)
    })
  })

  describe('lru access tracking', () => {
    it('should track enqueue as access', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(4)).toBe(1)
    })

    it('should track contains as access', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      expect(q.enqueue(4)).toBe(2)
    })

    it('should track peek as access', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.peek()
      expect(q.enqueue(4)).toBe(2)
    })

    it('should handle multiple contains calls', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(1)
      q.contains(1)
      q.contains(1)
      expect(q.enqueue(4)).toBe(2)
    })

    it('should handle contains for non-existent element', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(99)).toBe(false)
      expect(q.enqueue(4)).toBe(1)
    })

    it('should handle duplicate values in lru', () => {
      const q = new BoundedQueue<number>({ capacity: 4, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      expect(q.size).toBe(4)
      expect(q.contains(1)).toBe(true)
    })

    it('should evict correct element with duplicate values', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      const evicted = q.enqueue(3)
      expect(evicted).toBe(1)
    })

    it('should handle dequeue after lru access', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.contains(2)
      expect(q.dequeue()).toBe(1)
      expect(q.toArray()).toEqual([2, 3])
    })
  })

  describe('string values', () => {
    it('should work with strings in fifo', () => {
      const q = new BoundedQueue<string>({ capacity: 3, policy: 'fifo' })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
      expect(q.enqueue('d')).toBe('a')
    })

    it('should work with strings in lru', () => {
      const q = new BoundedQueue<string>({ capacity: 3, policy: 'lru' })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      q.contains('a')
      expect(q.enqueue('d')).toBe('b')
    })

    it('should work with strings in random', () => {
      const q = new BoundedQueue<string>({ capacity: 2, policy: 'random' })
      q.enqueue('x')
      q.enqueue('y')
      q.enqueue('z')
      expect(q.size).toBe(2)
    })
  })

  describe('object values', () => {
    it('should work with object references in fifo', () => {
      const q = new BoundedQueue<{ id: number }>({ capacity: 3, policy: 'fifo' })
      const a = { id: 1 }
      const b = { id: 2 }
      const c = { id: 3 }
      q.enqueue(a)
      q.enqueue(b)
      q.enqueue(c)
      expect(q.contains(a)).toBe(true)
      expect(q.contains(b)).toBe(true)
      expect(q.dequeue()).toBe(a)
    })

    it('should work with object references in lru', () => {
      const q = new BoundedQueue<{ id: number }>({ capacity: 3, policy: 'lru' })
      const a = { id: 1 }
      const b = { id: 2 }
      const c = { id: 3 }
      q.enqueue(a)
      q.enqueue(b)
      q.enqueue(c)
      q.contains(a)
      expect(q.enqueue({ id: 4 })).toBe(b)
    })
  })
})
