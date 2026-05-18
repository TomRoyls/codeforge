import {
  BoundedQueue,
  DEFAULT_BOUNDED_QUEUE_OPTIONS,
} from '../src/core/bounded-queue/bounded-queue.js'
import type { BoundedQueueOptions, BoundedQueueStats, EvictionPolicy } from '../src/core/bounded-queue/bounded-queue.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BoundedQueue', () => {
  describe('constructor', () => {
    it('creates a queue with default options', () => {
      const q = new BoundedQueue()
      expect(q.capacity).toBe(DEFAULT_BOUNDED_QUEUE_OPTIONS.capacity)
      expect(q.size).toBe(0)
    })

    it('creates a queue with custom capacity', () => {
      const q = new BoundedQueue({ capacity: 10 })
      expect(q.capacity).toBe(10)
      expect(q.size).toBe(0)
    })

    it('creates a queue with custom policy', () => {
      const q = new BoundedQueue({ policy: 'lru' })
      expect(q.capacity).toBe(DEFAULT_BOUNDED_QUEUE_OPTIONS.capacity)
    })

    it('creates a queue with both capacity and policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      expect(q.capacity).toBe(5)
    })

    it('clamps capacity to minimum of 1 when passed 0', () => {
      const q = new BoundedQueue({ capacity: 0 })
      expect(q.capacity).toBe(1)
    })

    it('clamps capacity to minimum of 1 when passed negative number', () => {
      const q = new BoundedQueue({ capacity: -10 })
      expect(q.capacity).toBe(1)
    })

    it('creates a queue with capacity 1', () => {
      const q = new BoundedQueue({ capacity: 1 })
      expect(q.capacity).toBe(1)
    })

    it('defaults to fifo policy', () => {
      const q = new BoundedQueue({ capacity: 5 })
      const s = q.stats()
      expect(s.policy).toBe('fifo')
    })

    it('accepts lru policy', () => {
      const q = new BoundedQueue({ capacity: 5, policy: 'lru' })
      expect(q.stats().policy).toBe('lru')
    })

    it('accepts random policy', () => {
      const q = new BoundedQueue({ capacity: 5, policy: 'random' })
      expect(q.stats().policy).toBe('random')
    })

    it('creates an empty queue', () => {
      const q = new BoundedQueue({ capacity: 5 })
      expect(q.isEmpty()).toBe(true)
      expect(q.size).toBe(0)
    })
  })

  // ─── DEFAULT_BOUNDED_QUEUE_OPTIONS export ──────────────────────────────

  describe('DEFAULT_BOUNDED_QUEUE_OPTIONS', () => {
    it('has capacity 64', () => {
      expect(DEFAULT_BOUNDED_QUEUE_OPTIONS.capacity).toBe(64)
    })

    it('has policy fifo', () => {
      expect(DEFAULT_BOUNDED_QUEUE_OPTIONS.policy).toBe('fifo')
    })
  })

  // ─── Exports ───────────────────────────────────────────────────────────

  describe('exports', () => {
    it('exports BoundedQueue class', () => {
      expect(BoundedQueue).toBeDefined()
      expect(typeof BoundedQueue).toBe('function')
    })

    it('exports DEFAULT_BOUNDED_QUEUE_OPTIONS', () => {
      expect(DEFAULT_BOUNDED_QUEUE_OPTIONS).toBeDefined()
    })
  })

  // ─── enqueue ──────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('returns undefined when not full (no eviction)', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.enqueue(1)).toBeUndefined()
    })

    it('returns evicted item when queue is full (fifo)', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(1)
    })

    it('increments size after enqueue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('size stays at capacity after enqueuing to full', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.size).toBe(3)
    })

    it('handles string items', () => {
      const q = new BoundedQueue<string>({ capacity: 3 })
      q.enqueue('a')
      q.enqueue('b')
      expect(q.size).toBe(2)
    })

    it('handles object items', () => {
      const q = new BoundedQueue<{ id: number }>({ capacity: 3 })
      const obj = { id: 1 }
      q.enqueue(obj)
      expect(q.size).toBe(1)
    })

    it('handles null items', () => {
      const q = new BoundedQueue<number | null>({ capacity: 3 })
      q.enqueue(null)
      expect(q.size).toBe(1)
    })

    it('handles undefined items', () => {
      const q = new BoundedQueue<number | undefined>({ capacity: 3 })
      q.enqueue(undefined)
      expect(q.size).toBe(1)
    })

    it('evicts fifo order when full with fifo policy', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.enqueue(40)).toBe(10)
      expect(q.enqueue(50)).toBe(20)
    })

    it('works with capacity 1', () => {
      const q = new BoundedQueue<number>({ capacity: 1 })
      expect(q.enqueue(42)).toBeUndefined()
      expect(q.enqueue(99)).toBe(42)
      expect(q.size).toBe(1)
    })

    it('allows enqueue after dequeue frees space', () => {
      const q = new BoundedQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.enqueue(3)).toBeUndefined()
      expect(q.size).toBe(2)
    })
  })

  // ─── dequeue ──────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('returns the first enqueued item (FIFO)', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('returns undefined when queue is empty', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.dequeue()).toBeUndefined()
    })

    it('decrements size after dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      q.dequeue()
      expect(q.size).toBe(1)
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('size stays at 0 when dequeueing from empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('returns undefined for repeated dequeues on empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })

    it('works with capacity 1', () => {
      const q = new BoundedQueue<number>({ capacity: 1 })
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.dequeue()).toBeUndefined()
    })

    it('handles dequeue with lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('handles dequeue with random policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(100)
      q.enqueue(200)
      const val = q.dequeue()
      expect(val).toBe(100)
    })
  })

  // ─── peek ─────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns the front item without removing it', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns undefined when queue is empty', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.peek()).toBeUndefined()
    })

    it('updates after dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.peek()).toBe(20)
    })

    it('does not modify the queue size', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      q.peek()
      q.peek()
      expect(q.size).toBe(2)
      expect(q.peek()).toBe(1)
    })

    it('returns correct value with lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peek()).toBe(10)
      expect(q.size).toBe(2)
    })

    it('returns correct value with random policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(42)
      q.enqueue(99)
      expect(q.peek()).toBe(42)
    })
  })

  // ─── peekBack ─────────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('returns the last enqueued item', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('returns the only item when size is 1', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(42)
      expect(q.peekBack()).toBe(42)
    })

    it('returns undefined when queue is empty', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.peekBack()).toBeUndefined()
    })

    it('does not modify the queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.peekBack()
      expect(q.size).toBe(2)
      expect(q.peekBack()).toBe(2)
    })

    it('updates after enqueue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      expect(q.peekBack()).toBe(1)
      q.enqueue(2)
      expect(q.peekBack()).toBe(2)
    })

    it('works correctly after wrap-around with fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.peekBack()).toBe(4)
    })

    it('returns correct value with lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.peekBack()).toBe(30)
    })

    it('returns correct value with random policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peekBack()).toBe(20)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for new queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.size).toBe(0)
    })

    it('reflects number of enqueued items', () => {
      const q = new BoundedQueue<number>({ capacity: 10 })
      for (let i = 0; i < 5; i++) q.enqueue(i)
      expect(q.size).toBe(5)
    })

    it('reflects after enqueue and dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('returns to 0 after clearing all items via dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.size).toBe(0)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all items dequeued', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── isFull ───────────────────────────────────────────────────────────

  describe('isFull', () => {
    it('returns false for empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.isFull).toBe(false)
    })

    it('returns false when partially full', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(false)
    })

    it('returns true when full', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull).toBe(true)
    })

    it('returns false after dequeue from full queue', () => {
      const q = new BoundedQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.isFull).toBe(false)
    })

    it('returns true for capacity 1 with one item', () => {
      const q = new BoundedQueue<number>({ capacity: 1 })
      q.enqueue(1)
      expect(q.isFull).toBe(true)
    })

    it('stays true when enqueueing beyond capacity', () => {
      const q = new BoundedQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull).toBe(true)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const q = new BoundedQueue<number>({ capacity: 10 })
      expect(q.capacity).toBe(10)
    })

    it('returns default capacity when none specified', () => {
      const q = new BoundedQueue()
      expect(q.capacity).toBe(64)
    })

    it('does not change after enqueue/dequeue operations', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.dequeue()
      expect(q.capacity).toBe(5)
    })

    it('does not change after clear', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.capacity).toBe(5)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('allows reuse after clearing', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('works on an already empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.clear()
      expect(q.capacity).toBe(5)
    })

    it('dequeued items after clear are undefined', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.clear()
      expect(q.dequeue()).toBeUndefined()
    })

    it('clears lru policy queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears random policy queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.toArray()).toEqual([])
    })

    it('returns items in FIFO order for fifo policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns a snapshot that does not mutate with queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      q.dequeue()
      expect(arr).toEqual([1, 2])
    })

    it('reflects state after partial dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('returns correct order after wrap-around with fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('returns items in insertion order for lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.toArray()).toEqual([10, 20, 30])
    })

    it('returns items for random policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const arr = q.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(10)
      expect(arr).toContain(20)
      expect(arr).toContain(30)
    })

    it('returns empty after clear', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.toArray()).toEqual([])
    })
  })

  // ─── contains ─────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for an item in the queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(2)).toBe(true)
    })

    it('returns false for an item not in the queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(99)).toBe(false)
    })

    it('returns false for empty queue', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      expect(q.contains(1)).toBe(false)
    })

    it('finds items after wrap-around with fifo', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.contains(4)).toBe(true)
      expect(q.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const q = new BoundedQueue<string>({ capacity: 5 })
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('HELLO')).toBe(false)
    })

    it('works with object references', () => {
      const obj = { id: 1 }
      const q = new BoundedQueue<{ id: number }>({ capacity: 5 })
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })

    it('returns false after item is dequeued', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
    })

    it('works with lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(2)).toBe(true)
      expect(q.contains(99)).toBe(false)
    })

    it('works with random policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'random' })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.contains(10)).toBe(true)
      expect(q.contains(30)).toBe(false)
    })
  })

  // ─── stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns correct initial stats', () => {
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

    it('tracks totalEnqueued', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.stats().totalEnqueued).toBe(3)
    })

    it('tracks totalDequeued', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.stats().totalDequeued).toBe(2)
    })

    it('tracks totalEvicted when enqueueing past capacity', () => {
      const q = new BoundedQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3) // evicts 1
      q.enqueue(4) // evicts 2
      expect(q.stats().totalEvicted).toBe(2)
    })

    it('tracks eviction with lru policy', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3) // evicts something
      expect(q.stats().totalEvicted).toBe(1)
    })

    it('stats are cumulative and not reset by dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.dequeue()
      q.enqueue(2)
      expect(q.stats().totalEnqueued).toBe(2)
      expect(q.stats().totalDequeued).toBe(1)
    })

    it('reflects current size and fullness', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const s = q.stats()
      expect(s.size).toBe(3)
      expect(s.isFull).toBe(true)
      expect(s.isEmpty).toBe(false)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy with same items', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })

    it('has the same capacity', () => {
      const q = new BoundedQueue<number>({ capacity: 10 })
      q.enqueue(1)
      const cloned = q.clone()
      expect(cloned.capacity).toBe(10)
    })

    it('modifications to clone do not affect original', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      cloned.dequeue()
      cloned.enqueue(99)
      expect(q.toArray()).toEqual([1, 2])
      expect(cloned.toArray()).toEqual([2, 99])
    })

    it('modifications to original do not affect clone', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      q.clear()
      expect(cloned.toArray()).toEqual([1, 2])
    })

    it('cloning an empty queue works', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      const cloned = q.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.capacity).toBe(5)
    })

    it('clones correctly after wrap-around', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4])
    })

    it('preserves the policy', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'lru' })
      q.enqueue(1)
      const cloned = q.clone()
      expect(cloned.stats().policy).toBe('lru')
    })
  })

  // ─── static from ─────────────────────────────────────────────────────

  describe('BoundedQueue.from', () => {
    it('creates a queue from an array', () => {
      const q = BoundedQueue.from([1, 2, 3])
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates a queue with custom capacity', () => {
      const q = BoundedQueue.from([1, 2, 3, 4, 5], { capacity: 3 })
      expect(q.size).toBe(3)
      expect(q.capacity).toBe(3)
    })

    it('creates a queue with custom policy', () => {
      const q = BoundedQueue.from([1, 2, 3], { policy: 'lru' })
      expect(q.stats().policy).toBe('lru')
    })

    it('handles empty iterable', () => {
      const q = BoundedQueue.from([])
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('handles a Set', () => {
      const q = BoundedQueue.from(new Set([10, 20, 30]))
      expect(q.size).toBe(3)
      expect(q.contains(10)).toBe(true)
      expect(q.contains(20)).toBe(true)
      expect(q.contains(30)).toBe(true)
    })

    it('evicts items when iterable exceeds capacity', () => {
      const q = BoundedQueue.from([1, 2, 3, 4, 5], { capacity: 3, policy: 'fifo' })
      expect(q.toArray()).toEqual([3, 4, 5])
      expect(q.stats().totalEvicted).toBe(2)
    })
  })

  // ─── Circular buffer wrap-around (fifo) ───────────────────────────────

  describe('circular buffer wrap-around (fifo)', () => {
    it('handles dequeue after wrap-around', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('handles multiple wrap-around cycles', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'fifo' })
      // Cycle 1
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      // Cycle 2
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      q.dequeue()
      // Cycle 3
      q.enqueue(7)
      expect(q.toArray()).toEqual([5, 6, 7])
    })

    it('handles alternating enqueue/dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 2, policy: 'fifo' })
      q.enqueue(1)
      q.dequeue()
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      expect(q.peek()).toBe(3)
      expect(q.size).toBe(1)
    })

    it('maintains FIFO order through wrap-around', () => {
      const q = new BoundedQueue<number>({ capacity: 4, policy: 'fifo' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.enqueue(5)
      q.enqueue(6)
      expect(q.toArray()).toEqual([3, 4, 5, 6])
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(6)
    })
  })

  // ─── LRU policy specific ──────────────────────────────────────────────

  describe('LRU eviction policy', () => {
    it('evicts least recently used item when full', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1) // accessTime 1
      q.enqueue(2) // accessTime 2
      q.enqueue(3) // accessTime 3
      // Access item 1 via contains, updating its accessTime
      q.contains(1) // accessTime -> 4
      // Now enqueue: 2 is LRU (accessTime 2)
      const evicted = q.enqueue(4)
      expect(evicted).toBe(2)
      expect(q.toArray()).toEqual([1, 3, 4])
    })

    it('evicts in insertion order when no accesses', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      // No access, so 1 is oldest
      const evicted = q.enqueue(4)
      expect(evicted).toBe(1)
    })

    it('peek updates access time for LRU', () => {
      const q = new BoundedQueue<number>({ capacity: 3, policy: 'lru' })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      // Peek updates access time of front item (1)
      q.peek()
      // Now 2 is LRU
      const evicted = q.enqueue(4)
      expect(evicted).toBe(2)
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('single element lifecycle', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
      expect(q.isFull).toBe(false)
      expect(q.peek()).toBe(42)
      expect(q.peekBack()).toBe(42)
      expect(q.contains(42)).toBe(true)
      expect(q.dequeue()).toBe(42)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('capacity 1 full lifecycle', () => {
      const q = new BoundedQueue<number>({ capacity: 1 })
      expect(q.enqueue(1)).toBeUndefined()
      expect(q.isFull).toBe(true)
      expect(q.enqueue(2)).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.isEmpty()).toBe(true)
      expect(q.enqueue(3)).toBeUndefined()
      expect(q.peek()).toBe(3)
    })

    it('fill and dequeue completely', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      for (let i = 0; i < 5; i++) q.enqueue(i + 1)
      expect(q.isFull).toBe(true)
      const items: number[] = []
      while (!q.isEmpty()) items.push(q.dequeue()!)
      expect(items).toEqual([1, 2, 3, 4, 5])
      expect(q.isEmpty()).toBe(true)
    })

    it('repeated fill and clear cycles', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 3; i++) q.enqueue(cycle * 3 + i)
        expect(q.isFull).toBe(true)
        q.clear()
        expect(q.isEmpty()).toBe(true)
      }
      expect(q.capacity).toBe(3)
    })

    it('enqueue after multiple clear cycles', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.peek()).toBe(3)
      expect(q.size).toBe(1)
    })

    it('works with various types', () => {
      const strQ = new BoundedQueue<string>({ capacity: 3 })
      strQ.enqueue('hello')
      expect(strQ.dequeue()).toBe('hello')

      const boolQ = new BoundedQueue<boolean>({ capacity: 3 })
      boolQ.enqueue(true)
      boolQ.enqueue(false)
      expect(boolQ.toArray()).toEqual([true, false])

      const nullQ = new BoundedQueue<null>({ capacity: 2 })
      nullQ.enqueue(null)
      expect(nullQ.dequeue()).toBeNull()
    })

    it('large number of operations', () => {
      const q = new BoundedQueue<number>({ capacity: 100 })
      for (let i = 0; i < 100; i++) q.enqueue(i)
      expect(q.isFull).toBe(true)
      for (let i = 0; i < 100; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('enqueue many items exceeding capacity evicts oldest', () => {
      const q = new BoundedQueue<number>({ capacity: 5, policy: 'fifo' })
      for (let i = 0; i < 10; i++) q.enqueue(i)
      expect(q.size).toBe(5)
      expect(q.toArray()).toEqual([5, 6, 7, 8, 9])
    })

    it('interleaved enqueue and dequeue', () => {
      const q = new BoundedQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeue()).toBe(2)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('toArray returns empty after all dequeued', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.toArray()).toEqual([])
    })

    it('peek and peekBack on same single item', () => {
      const q = new BoundedQueue<number>({ capacity: 5 })
      q.enqueue(99)
      expect(q.peek()).toBe(q.peekBack())
      expect(q.peek()).toBe(99)
    })
  })
})
