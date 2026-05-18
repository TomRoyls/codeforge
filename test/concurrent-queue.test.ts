import { ConcurrentQueue, DEFAULT_CONCURRENT_QUEUE_OPTIONS } from '../src/core/concurrent-queue/concurrent-queue.js'
import type { ConcurrentQueueOptions, ConcurrentQueueStats } from '../src/core/concurrent-queue/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('ConcurrentQueue', () => {
  describe('constructor', () => {
    it('creates an empty queue with default options', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates a queue with custom maxSize', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 5 })
      expect(q.isFull()).toBe(false)
      expect(q.getStats().maxSize).toBe(5)
    })

    it('creates a queue with default maxSize of Infinity', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.getStats().maxSize).toBe(Infinity)
    })

    it('accepts partial options overriding defaults', () => {
      const q = new ConcurrentQueue<string>({ maxSize: 10 })
      expect(q.getStats().maxSize).toBe(10)
    })

    it('accepts no options argument', () => {
      const q = new ConcurrentQueue()
      expect(q.size()).toBe(0)
      expect(q.getStats().maxSize).toBe(Infinity)
    })
  })

  // ─── enqueue ────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('adds an item and returns true', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.enqueue(1)).toBe(true)
      expect(q.size()).toBe(1)
    })

    it('adds multiple items in order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns false when queue is full', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 2 })
      expect(q.enqueue(1)).toBe(true)
      expect(q.enqueue(2)).toBe(true)
      expect(q.enqueue(3)).toBe(false)
      expect(q.size()).toBe(2)
    })

    it('increments totalEnqueued counter', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStats().totalEnqueued).toBe(2)
    })

    it('increments totalRejected when full', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 1 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStats().totalRejected).toBe(1)
    })

    it('tracks multiple rejections', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.getStats().totalRejected).toBe(3)
    })

    it('handles undefined values', () => {
      const q = new ConcurrentQueue<number | undefined>()
      expect(q.enqueue(undefined)).toBe(true)
      expect(q.dequeue()).toBeUndefined()
      expect(q.size()).toBe(0)
    })

    it('handles null values', () => {
      const q = new ConcurrentQueue<number | null>()
      expect(q.enqueue(null)).toBe(true)
      expect(q.dequeue()).toBe(null)
    })

    it('handles object values', () => {
      const q = new ConcurrentQueue<{ id: number }>()
      const obj = { id: 1 }
      q.enqueue(obj)
      expect(q.dequeue()).toBe(obj)
    })

    it('handles string values', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('hello')
      q.enqueue('world')
      expect(q.toArray()).toEqual(['hello', 'world'])
    })
  })

  // ─── dequeue ────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns the first enqueued item (FIFO)', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('decrements size', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })

    it('increments totalDequeued counter', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.getStats().totalDequeued).toBe(2)
    })

    it('dequeues priority items before normal items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(99)
      expect(q.dequeue()).toBe(99)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('returns undefined after dequeuing all items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
      expect(q.size()).toBe(0)
    })

    it('drains queue completely with repeated dequeue', () => {
      const q = new ConcurrentQueue<number>()
      for (let i = 0; i < 5; i++) q.enqueue(i)
      const results: number[] = []
      while (!q.isEmpty()) {
        const val = q.dequeue()
        if (val !== undefined) results.push(val)
      }
      expect(results).toEqual([0, 1, 2, 3, 4])
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── peek ───────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns the front item without removing it', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('returns priority item over normal item', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(99)
      expect(q.peek()).toBe(99)
    })

    it('does not modify the queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.peek()
      q.peek()
      q.peek()
      expect(q.size()).toBe(1)
      expect(q.dequeue()).toBe(1)
    })

    it('returns normal item when no priority items exist', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
    })
  })

  // ─── enqueuePriority ────────────────────────────────────────────────

  describe('enqueuePriority', () => {
    it('adds item to the front of the dequeue order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(99)
      expect(q.dequeue()).toBe(99)
      expect(q.dequeue()).toBe(1)
    })

    it('maintains LIFO order for multiple priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.enqueuePriority(3)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(1)
    })

    it('increments size', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      expect(q.size()).toBe(1)
    })

    it('increments totalEnqueued counter', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      expect(q.getStats().totalEnqueued).toBe(1)
    })

    it('updates priorityCount in stats', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      expect(q.getStats().priorityCount).toBe(2)
    })

    it('decrements priorityCount on dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.dequeue()
      expect(q.getStats().priorityCount).toBe(1)
    })

    it('can be called on empty queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(42)
      expect(q.size()).toBe(1)
      expect(q.dequeue()).toBe(42)
    })

    it('is not blocked by maxSize (bypasses capacity)', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 1 })
      q.enqueue(1)
      q.enqueuePriority(99)
      expect(q.size()).toBe(2)
    })
  })

  // ─── enqueueBatch ───────────────────────────────────────────────────

  describe('enqueueBatch', () => {
    it('adds all items from an array', () => {
      const q = new ConcurrentQueue<number>()
      const count = q.enqueueBatch([1, 2, 3])
      expect(count).toBe(3)
      expect(q.size()).toBe(3)
    })

    it('returns 0 for empty array', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.enqueueBatch([])).toBe(0)
      expect(q.size()).toBe(0)
    })

    it('returns count of successfully enqueued items when partially full', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 3 })
      q.enqueue(1)
      const count = q.enqueueBatch([2, 3, 4, 5])
      expect(count).toBe(2)
      expect(q.size()).toBe(3)
    })

    it('enqueues items in order', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueueBatch(['a', 'b', 'c'])
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('tracks rejections from batch', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 2 })
      q.enqueueBatch([1, 2, 3, 4])
      expect(q.getStats().totalRejected).toBe(2)
    })
  })

  // ─── dequeueBatch ───────────────────────────────────────────────────

  describe('dequeueBatch', () => {
    it('dequeues up to count items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 2, 3, 4, 5])
      const items = q.dequeueBatch(3)
      expect(items).toEqual([1, 2, 3])
      expect(q.size()).toBe(2)
    })

    it('returns fewer items if queue has less than count', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const items = q.dequeueBatch(5)
      expect(items).toEqual([1, 2])
    })

    it('returns empty array for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.dequeueBatch(3)).toEqual([])
    })

    it('returns empty array when count is 0', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.dequeueBatch(0)).toEqual([])
      expect(q.size()).toBe(1)
    })

    it('dequeues priority items first in batch', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(99)
      q.enqueuePriority(98)
      const items = q.dequeueBatch(3)
      expect(items).toEqual([98, 99, 1])
    })
  })

  // ─── size / isEmpty / isFull ────────────────────────────────────────

  describe('size / isEmpty / isFull', () => {
    it('size returns 0 for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('isEmpty returns true for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after enqueue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('isFull returns false when not at capacity', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 10 })
      q.enqueue(1)
      expect(q.isFull()).toBe(false)
    })

    it('isFull returns true when at capacity', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull()).toBe(true)
    })

    it('size reflects priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(2)
      expect(q.size()).toBe(2)
    })

    it('size decreases after dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })
  })

  // ─── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items from the queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('clears both normal and priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(2)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.dequeue()).toBeUndefined()
    })

    it('clears an already empty queue without error', () => {
      const q = new ConcurrentQueue<number>()
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('allows enqueue after clear', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('resets priorityCount to 0', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.clear()
      expect(q.getStats().priorityCount).toBe(0)
    })
  })

  // ─── toArray ────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns all items in dequeue order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('includes priority items before normal items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(99)
      expect(q.toArray()).toEqual([99, 1, 2])
    })

    it('returns a new array each time', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      const a1 = q.toArray()
      const a2 = q.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('does not modify the queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.toArray()
      expect(q.size()).toBe(2)
    })

    it('reflects priority LIFO order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.enqueuePriority(3)
      expect(q.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── clone ──────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([1, 2])
      expect(cloned.size()).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      const cloned = q.clone()
      cloned.enqueue(2)
      expect(q.size()).toBe(1)
      expect(cloned.size()).toBe(2)
    })

    it('clones empty queue', () => {
      const q = new ConcurrentQueue<number>()
      const cloned = q.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('preserves priority items in clone', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(99)
      const cloned = q.clone()
      expect(cloned.dequeue()).toBe(99)
      expect(cloned.dequeue()).toBe(1)
    })

    it('preserves maxSize option', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 5 })
      q.enqueue(1)
      const cloned = q.clone()
      expect(cloned.getStats().maxSize).toBe(5)
    })

    it('clone has independent priority list', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueue(2)
      const cloned = q.clone()
      cloned.dequeue()
      expect(q.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })
  })

  // ─── drain ──────────────────────────────────────────────────────────

  describe('drain', () => {
    it('returns all items and clears the queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items = q.drain()
      expect(items).toEqual([1, 2, 3])
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('returns empty array for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.drain()).toEqual([])
      expect(q.isEmpty()).toBe(true)
    })

    it('includes priority items in drain result', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(99)
      const items = q.drain()
      expect(items).toEqual([99, 1])
    })

    it('queue is reusable after drain', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.size()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })
  })

  // ─── forEach ────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all items with correct indices', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const results: Array<{ value: number; index: number }> = []
      q.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 1, index: 0 },
        { value: 2, index: 1 },
        { value: 3, index: 2 },
      ])
    })

    it('does not call callback on empty queue', () => {
      const q = new ConcurrentQueue<number>()
      let callCount = 0
      q.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })

    it('iterates priority items before normal items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(99)
      const values: number[] = []
      q.forEach((v) => values.push(v))
      expect(values).toEqual([99, 1, 2])
    })

    it('provides sequential index across priority and normal', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueuePriority('z')
      const indices: number[] = []
      q.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── filter ─────────────────────────────────────────────────────────

  describe('filter', () => {
    it('filters items based on predicate', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 2, 3, 4, 5])
      const result = q.filter((v) => v % 2 === 0)
      expect(result).toEqual([2, 4])
    })

    it('returns empty array when nothing matches', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 3, 5])
      expect(q.filter((v) => v % 2 === 0)).toEqual([])
    })

    it('returns all items when all match', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([2, 4, 6])
      expect(q.filter((v) => v % 2 === 0)).toEqual([2, 4, 6])
    })

    it('returns empty array for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.filter(() => true)).toEqual([])
    })

    it('includes priority items in filtering', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(2)
      q.enqueuePriority(1)
      expect(q.filter((v) => v === 1)).toEqual([1])
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes items matching predicate and returns count', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 2, 3, 4, 5])
      const removed = q.remove((v) => v % 2 === 0)
      expect(removed).toBe(2)
      expect(q.toArray()).toEqual([1, 3, 5])
    })

    it('returns 0 when nothing matches', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 3, 5])
      expect(q.remove((v) => v % 2 === 0)).toBe(0)
      expect(q.size()).toBe(3)
    })

    it('returns 0 for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.remove(() => true)).toBe(0)
    })

    it('removes all items if all match', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([2, 4, 6])
      expect(q.remove(() => true)).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('removes priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(2)
      q.enqueuePriority(3)
      const removed = q.remove((v) => v > 1)
      expect(removed).toBe(2)
      expect(q.toArray()).toEqual([1])
    })

    it('updates size correctly', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 2, 3, 4])
      q.remove((v) => v <= 2)
      expect(q.size()).toBe(2)
    })

    it('updates priorityCount correctly', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.enqueue(3)
      q.remove((v) => v <= 2)
      expect(q.getStats().priorityCount).toBe(0)
    })

    it('removes from the head of normal list', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.remove((v) => v === 1)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('removes from the tail of normal list', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.remove((v) => v === 3)
      expect(q.toArray()).toEqual([1, 2])
    })
  })

  // ─── contains ───────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true when item exists in normal queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(2)).toBe(true)
    })

    it('returns false when item does not exist', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(99)).toBe(false)
    })

    it('returns false on empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('finds items in priority queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(99)
      expect(q.contains(99)).toBe(true)
    })

    it('uses strict equality', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('HELLO')).toBe(false)
    })

    it('finds object by reference', () => {
      const obj = { id: 1 }
      const q = new ConcurrentQueue<{ id: number }>()
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })
  })

  // ─── Symbol.iterator ────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over all items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('yields nothing for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('works with spread operator', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueueBatch([1, 2, 3])
      expect([...q]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect(Array.from(q)).toEqual(['a', 'b'])
    })

    it('iterates priority items first', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueuePriority(99)
      expect([...q]).toEqual([99, 1])
    })
  })

  // ─── getStats ───────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns correct initial stats', () => {
      const q = new ConcurrentQueue<number>()
      const stats = q.getStats()
      expect(stats.size).toBe(0)
      expect(stats.isEmpty).toBe(true)
      expect(stats.isFull).toBe(false)
      expect(stats.maxSize).toBe(Infinity)
      expect(stats.totalEnqueued).toBe(0)
      expect(stats.totalDequeued).toBe(0)
      expect(stats.totalRejected).toBe(0)
      expect(stats.priorityCount).toBe(0)
    })

    it('tracks stats through operations', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4) // rejected
      q.enqueuePriority(99)
      q.dequeue()
      q.dequeue()

      const stats = q.getStats()
      expect(stats.size).toBe(2) // 99 and 2 remain (3 was dequeued from normal after 99 was dequeued from priority)
      expect(stats.totalEnqueued).toBe(4)
      expect(stats.totalDequeued).toBe(2)
      expect(stats.totalRejected).toBe(1)
      expect(stats.priorityCount).toBe(0) // 99 was dequeued
    })

    it('reports isFull correctly', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStats().isFull).toBe(true)
    })

    it('reports isEmpty correctly', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.getStats().isEmpty).toBe(true)
      q.enqueue(1)
      expect(q.getStats().isEmpty).toBe(false)
    })

    it('returns a snapshot (not affected by later mutations)', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      const stats = q.getStats()
      q.enqueue(2)
      expect(stats.size).toBe(1)
      expect(stats.totalEnqueued).toBe(1)
    })
  })

  // ─── DEFAULT_CONCURRENT_QUEUE_OPTIONS ───────────────────────────────

  describe('DEFAULT_CONCURRENT_QUEUE_OPTIONS', () => {
    it('has maxSize of Infinity', () => {
      expect(DEFAULT_CONCURRENT_QUEUE_OPTIONS.maxSize).toBe(Infinity)
    })
  })

  // ─── Type exports ───────────────────────────────────────────────────

  describe('type exports', () => {
    it('ConcurrentQueueOptions has correct shape', () => {
      const opts: ConcurrentQueueOptions = { maxSize: 10 }
      expect(opts.maxSize).toBe(10)
    })

    it('ConcurrentQueueStats has correct shape', () => {
      const stats: ConcurrentQueueStats = {
        size: 0,
        isEmpty: true,
        isFull: false,
        maxSize: 100,
        totalEnqueued: 0,
        totalDequeued: 0,
        totalRejected: 0,
        priorityCount: 0,
      }
      expect(stats.size).toBe(0)
    })
  })

  // ─── Edge Cases ─────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('enqueue and dequeue single item', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('interleaved enqueue and dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      q.enqueue(4)
      expect(q.toArray()).toEqual([3, 4])
    })

    it('large number of items', () => {
      const q = new ConcurrentQueue<number>()
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      expect(q.size()).toBe(1000)
      expect(q.dequeue()).toBe(0)
      expect(q.peek()).toBe(1)
    })

    it('fill and drain queue repeatedly', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 5 })
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 5; i++) {
          expect(q.enqueue(i)).toBe(true)
        }
        expect(q.isFull()).toBe(true)
        const items = q.drain()
        expect(items.length).toBe(5)
        expect(q.isEmpty()).toBe(true)
      }
    })

    it('priority items drain before normal after multiple enqueues', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(10)
      q.enqueue(3)
      q.enqueuePriority(20)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBeUndefined()
    })

    it('clone after mixed operations', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(99)
      q.dequeue()
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual(q.toArray())
    })

    it('remove does not affect stats counters', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const statsBefore = q.getStats()
      q.remove((v) => v === 2)
      const statsAfter = q.getStats()
      expect(statsAfter.totalEnqueued).toBe(statsBefore.totalEnqueued)
      expect(statsAfter.totalDequeued).toBe(statsBefore.totalDequeued)
    })

    it('drain with only priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      const items = q.drain()
      expect(items).toEqual([2, 1])
    })

    it('queue with maxSize 0 rejects all enqueues', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 0 })
      expect(q.enqueue(1)).toBe(false)
      expect(q.size()).toBe(0)
      expect(q.getStats().totalRejected).toBe(1)
    })

    it('clear does not reset cumulative stats', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.clear()
      const stats = q.getStats()
      expect(stats.totalEnqueued).toBe(2)
      expect(stats.totalDequeued).toBe(1)
    })

    it('batch operations with full queue', () => {
      const q = new ConcurrentQueue<number>({ maxSize: 3 })
      expect(q.enqueueBatch([1, 2, 3, 4, 5])).toBe(3)
      expect(q.dequeueBatch(10)).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })

    it('mixed types with generic parameter', () => {
      const q = new ConcurrentQueue<string | number>()
      q.enqueue('hello')
      q.enqueue(42)
      expect(q.dequeue()).toBe('hello')
      expect(q.dequeue()).toBe(42)
    })

    it('forEach on queue with only priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      const values: number[] = []
      q.forEach((v) => values.push(v))
      expect(values).toEqual([2, 1])
    })

    it('filter on queue with only priority items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.enqueuePriority(3)
      expect(q.filter((v) => v > 1)).toEqual([3, 2])
    })

    it('contains after partial dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
    })
  })
})
