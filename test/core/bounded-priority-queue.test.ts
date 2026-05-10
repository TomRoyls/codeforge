import { describe, it, expect, beforeEach } from 'vitest'
import { BoundedPriorityQueue } from '../../src/core/bounded-priority-queue/bounded-priority-queue.js'
import type { BoundedPriorityQueueOptions } from '../../src/core/bounded-priority-queue/types.js'

describe('BoundedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates with specified capacity', () => {
      const q = new BoundedPriorityQueue<number>(10)
      expect(q.capacity).toBe(10)
    })

    it('creates with default comparator', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(5)
      expect(q.peek()).toBe(1)
    })

    it('creates with custom comparator', () => {
      const opts: BoundedPriorityQueueOptions<number> = { comparator: (a, b) => b - a }
      const q = new BoundedPriorityQueue<number>(5, opts)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(5)
      expect(q.peek()).toBe(5)
    })

    it('handles capacity 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.capacity).toBe(0)
      expect(q.size).toBe(0)
    })

    it('handles negative capacity as 0', () => {
      const q = new BoundedPriorityQueue<number>(-5)
      expect(q.capacity).toBe(0)
    })

    it('creates with capacity 1', () => {
      const q = new BoundedPriorityQueue<number>(1)
      expect(q.capacity).toBe(1)
    })

    it('works with no options', () => {
      const q = new BoundedPriorityQueue<string>(5)
      expect(q.size).toBe(0)
    })

    it('starts empty', () => {
      const q = new BoundedPriorityQueue<number>(10)
      expect(q.isEmpty).toBe(true)
      expect(q.size).toBe(0)
    })

    it('isFull when capacity is 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.isFull).toBe(true)
    })

    it('is not full initially when capacity > 0', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.isFull).toBe(false)
    })
  })

  describe('enqueue', () => {
    let q: BoundedPriorityQueue<number>

    beforeEach(() => {
      q = new BoundedPriorityQueue<number>(5)
    })

    it('adds a single item', () => {
      const result = q.enqueue(10)
      expect(result).toBeUndefined()
      expect(q.size).toBe(1)
    })

    it('adds multiple items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('returns undefined when not full', () => {
      expect(q.enqueue(1)).toBeUndefined()
      expect(q.enqueue(2)).toBeUndefined()
    })

    it('returns evicted item when full and higher priority', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      const evicted = q.enqueue(10)
      expect(evicted).toBe(1)
    })

    it('returns undefined when full and lower priority', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.enqueue(40)
      q.enqueue(50)
      const result = q.enqueue(5)
      expect(result).toBeUndefined()
    })

    it('returns undefined when full and equal priority to minimum', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.enqueue(40)
      q.enqueue(50)
      const result = q.enqueue(10)
      expect(result).toBeUndefined()
    })

    it('increases size', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('fills to capacity', () => {
      for (let i = 0; i < 5; i++) q.enqueue(i)
      expect(q.isFull).toBe(true)
      expect(q.size).toBe(5)
    })

    it('capacity 0 rejects all enqueues', () => {
      const q0 = new BoundedPriorityQueue<number>(0)
      expect(q0.enqueue(1)).toBeUndefined()
      expect(q0.size).toBe(0)
    })

    it('maintains heap property after multiple enqueues', () => {
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      q.enqueue(9)
      expect(q.peek()).toBe(1)
    })
  })

  describe('dequeue', () => {
    let q: BoundedPriorityQueue<number>

    beforeEach(() => {
      q = new BoundedPriorityQueue<number>(10)
    })

    it('returns undefined on empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('removes and returns lowest priority item', () => {
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.dequeue()).toBe(3)
    })

    it('decreases size', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('isEmpty after dequeuing all items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty).toBe(true)
    })

    it('isFull becomes false after dequeue from full queue', () => {
      const qf = new BoundedPriorityQueue<number>(3)
      qf.enqueue(1)
      qf.enqueue(2)
      qf.enqueue(3)
      expect(qf.isFull).toBe(true)
      qf.dequeue()
      expect(qf.isFull).toBe(false)
    })

    it('maintains heap property after dequeue', () => {
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBe(3)
    })

    it('handles single element', () => {
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.size).toBe(0)
    })

    it('dequeues in ascending order', () => {
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      q.enqueue(9)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(7)
      expect(q.dequeue()).toBe(9)
    })

    it('works after eviction', () => {
      const qb = new BoundedPriorityQueue<number>(3)
      qb.enqueue(10)
      qb.enqueue(20)
      qb.enqueue(30)
      qb.enqueue(40)
      expect(qb.dequeue()).toBe(20)
    })

    it('returns undefined on capacity 0', () => {
      const q0 = new BoundedPriorityQueue<number>(0)
      expect(q0.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.peek()).toBeUndefined()
    })

    it('returns lowest priority item', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(1)
      q.enqueue(3)
      expect(q.peek()).toBe(1)
    })

    it('does not remove the item', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      expect(q.size).toBe(2)
    })

    it('updates after enqueue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      expect(q.peek()).toBe(5)
      q.enqueue(2)
      expect(q.peek()).toBe(2)
    })

    it('updates after dequeue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(5)
      q.dequeue()
      expect(q.peek()).toBe(3)
    })

    it('updates after eviction', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.peek()).toBe(10)
      q.enqueue(40)
      expect(q.peek()).toBe(20)
    })

    it('returns undefined after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.clear()
      expect(q.peek()).toBeUndefined()
    })

    it('returns undefined with capacity 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.peek()).toBeUndefined()
    })
  })

  describe('size / capacity / isFull / isEmpty', () => {
    it('size starts at 0', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.size).toBe(0)
    })

    it('size increases after enqueue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('size decreases after dequeue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('capacity is constant', () => {
      const q = new BoundedPriorityQueue<number>(7)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.capacity).toBe(7)
    })

    it('isEmpty is true when empty', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.isEmpty).toBe(true)
    })

    it('isFull is true at capacity', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull).toBe(true)
    })

    it('isFull is false below capacity', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.isFull).toBe(false)
    })

    it('isEmpty is false with items', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.isEmpty).toBe(false)
    })

    it('size is 0 after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
    })

    it('size is 0 after drain', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.drain()
      expect(q.size).toBe(0)
    })
  })

  describe('eviction', () => {
    it('evicts lowest priority when full and inserting higher', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const evicted = q.enqueue(25)
      expect(evicted).toBe(10)
      expect(q.size).toBe(3)
    })

    it('does not evict when inserting lower priority', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const result = q.enqueue(5)
      expect(result).toBeUndefined()
      expect(q.size).toBe(3)
    })

    it('returns the evicted item', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(10)).toBe(1)
    })

    it('keeps top N items after eviction', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(30)
      q.enqueue(20)
      q.enqueue(40)
      q.enqueue(50)
      const items = q.toArray().sort()
      expect(items).toEqual([30, 40, 50])
    })

    it('does not evict when equal priority to minimum', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.enqueue(10)).toBeUndefined()
    })

    it('handles sequential evictions', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(4)).toBe(1)
      expect(q.enqueue(5)).toBe(2)
      expect(q.enqueue(6)).toBe(3)
      expect(q.toArray().sort()).toEqual([4, 5, 6])
    })

    it('eviction with custom comparator', () => {
      const q = new BoundedPriorityQueue<{ v: number }>(3, {
        comparator: (a, b) => a.v - b.v,
      })
      q.enqueue({ v: 10 })
      q.enqueue({ v: 20 })
      q.enqueue({ v: 30 })
      const evicted = q.enqueue({ v: 25 })
      expect(evicted!.v).toBe(10)
    })

    it('preserves heap property after eviction', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(30)
      q.enqueue(20)
      q.enqueue(40)
      expect(q.peek()).toBe(20)
    })

    it('handles many evictions', () => {
      const q = new BoundedPriorityQueue<number>(5)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(5)
      expect(q.toArray().sort()).toEqual([95, 96, 97, 98, 99])
    })

    it('evicted item is the minimum', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(5)
      q.enqueue(15)
      expect(q.enqueue(20)).toBe(5)
    })
  })

  describe('custom comparator', () => {
    it('uses custom numeric comparator', () => {
      const q = new BoundedPriorityQueue<number>(5, { comparator: (a, b) => b - a })
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(5)
      expect(q.peek()).toBe(5)
    })

    it('uses custom comparator for objects', () => {
      const q = new BoundedPriorityQueue<{ priority: number }>(5, {
        comparator: (a, b) => a.priority - b.priority,
      })
      q.enqueue({ priority: 3 })
      q.enqueue({ priority: 1 })
      q.enqueue({ priority: 5 })
      expect(q.peek()!.priority).toBe(1)
    })

    it('supports reverse ordering', () => {
      const q = new BoundedPriorityQueue<number>(5, { comparator: (a, b) => b - a })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.dequeue()).toBe(5)
    })

    it('custom comparator affects eviction', () => {
      const q = new BoundedPriorityQueue<number>(3, { comparator: (a, b) => b - a })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      const evicted = q.enqueue(2)
      expect(evicted).toBe(5)
    })

    it('custom comparator affects peek', () => {
      const q = new BoundedPriorityQueue<number>(3, { comparator: (a, b) => b - a })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.peek()).toBe(5)
    })

    it('custom comparator affects accept', () => {
      const q = new BoundedPriorityQueue<number>(3, { comparator: (a, b) => b - a })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.accept(0)).toBe(true)
      expect(q.accept(6)).toBe(false)
    })

    it('supports string comparator', () => {
      const q = new BoundedPriorityQueue<string>(5, {
        comparator: (a, b) => a.localeCompare(b),
      })
      q.enqueue('cherry')
      q.enqueue('apple')
      q.enqueue('banana')
      expect(q.peek()).toBe('apple')
    })

    it('handles comparator returning 0', () => {
      const q = new BoundedPriorityQueue<number>(3, { comparator: () => 0 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(4)).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.toArray()).toEqual([])
    })

    it('returns all items', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray().sort()).toEqual([1, 2, 3])
    })

    it('returns a copy', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      arr.push(999)
      expect(q.size).toBe(2)
    })

    it('reflects state after enqueue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(10)
      expect(q.toArray()).toHaveLength(1)
      q.enqueue(20)
      expect(q.toArray()).toHaveLength(2)
    })

    it('reflects state after dequeue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray().sort()).toEqual([2, 3])
    })

    it('returns empty array after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.toArray()).toEqual([])
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.contains(1)).toBe(false)
    })

    it('returns true for existing item', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(42)
      expect(q.contains(42)).toBe(true)
    })

    it('returns false for non-existing item', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(99)).toBe(false)
    })

    it('finds items after multiple enqueues', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      expect(q.contains(7)).toBe(true)
      expect(q.contains(3)).toBe(true)
    })

    it('finds lowest priority item', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.contains(3)).toBe(true)
    })

    it('returns false after dequeue removes item', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('returns false after remove', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.remove(3)
      expect(q.contains(3)).toBe(false)
    })

    it('returns false after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.remove(1)).toBe(false)
    })

    it('returns true for existing item', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.remove(1)).toBe(true)
    })

    it('removes the item', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.remove(3)
      expect(q.contains(3)).toBe(false)
    })

    it('decreases size', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.remove(2)
      expect(q.size).toBe(2)
    })

    it('returns false for non-existing item', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.remove(99)).toBe(false)
    })

    it('maintains heap property after remove', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      q.remove(3)
      expect(q.peek()).toBe(1)
    })

    it('removes root element', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.remove(1)
      expect(q.peek()).toBe(3)
    })

    it('removes leaf element', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(5)
      q.remove(5)
      expect(q.toArray().sort()).toEqual([1, 3])
    })

    it('removes middle element', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.remove(5)
      expect(q.size).toBe(3)
      expect(q.contains(5)).toBe(false)
    })

    it('removes last remaining element', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(42)
      expect(q.remove(42)).toBe(true)
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('drain', () => {
    it('returns empty array for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.drain()).toEqual([])
    })

    it('returns all items', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items = q.drain()
      expect(items.sort()).toEqual([1, 2, 3])
    })

    it('empties the queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.drain()
      expect(q.isEmpty).toBe(true)
    })

    it('size is 0 after drain', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.drain()
      expect(q.size).toBe(0)
    })

    it('queue is reusable after drain', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears empty queue without error', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.clear()
      expect(q.size).toBe(0)
    })

    it('clears non-empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
    })

    it('size is 0 after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.clear()
      expect(q.size).toBe(0)
    })

    it('isEmpty after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.clear()
      expect(q.isEmpty).toBe(true)
    })

    it('can enqueue after clear', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })
  })

  describe('accept', () => {
    it('returns true when not full', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.accept(1)).toBe(true)
    })

    it('returns false when full and lower priority', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.accept(5)).toBe(false)
    })

    it('returns true when full and higher priority', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.accept(25)).toBe(true)
    })

    it('returns false for capacity 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.accept(1)).toBe(false)
    })

    it('does not modify the queue', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.accept(25)
      expect(q.size).toBe(3)
    })

    it('returns false for equal priority', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.accept(10)).toBe(false)
    })

    it('returns true after dequeue makes room', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.accept(5)).toBe(true)
    })

    it('works with custom comparator', () => {
      const q = new BoundedPriorityQueue<number>(3, { comparator: (a, b) => b - a })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.accept(5)).toBe(true)
      expect(q.accept(35)).toBe(false)
    })
  })

  describe('single capacity', () => {
    it('keeps only the best item', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(5)
      q.enqueue(10)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(10)
    })

    it('evicts lower priority', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(5)
      const evicted = q.enqueue(10)
      expect(evicted).toBe(5)
    })

    it('does not change for equal priority', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(5)
      expect(q.enqueue(5)).toBeUndefined()
      expect(q.peek()).toBe(5)
    })

    it('dequeue returns the item', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty).toBe(true)
    })

    it('accept only higher priority', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(10)
      expect(q.accept(5)).toBe(false)
      expect(q.accept(15)).toBe(true)
    })
  })

  describe('large capacity', () => {
    it('handles 1000 items', () => {
      const q = new BoundedPriorityQueue<number>(1000)
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(1000)
      expect(q.isFull).toBe(true)
    })

    it('eviction at large capacity', () => {
      const q = new BoundedPriorityQueue<number>(1000)
      for (let i = 0; i < 2000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(1000)
      expect(q.peek()).toBe(1000)
    })

    it('size tracking with many items', () => {
      const q = new BoundedPriorityQueue<number>(500)
      for (let i = 0; i < 500; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(500)
      q.dequeue()
      expect(q.size).toBe(499)
    })

    it('drain with many items', () => {
      const q = new BoundedPriorityQueue<number>(1000)
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      const items = q.drain()
      expect(items).toHaveLength(1000)
      expect(q.isEmpty).toBe(true)
    })

    it('dequeue all items', () => {
      const q = new BoundedPriorityQueue<number>(100)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      const results: number[] = []
      while (!q.isEmpty) {
        results.push(q.dequeue()!)
      }
      expect(results).toHaveLength(100)
      const sorted = [...results].sort((a, b) => a - b)
      expect(sorted).toEqual(results)
    })
  })

  describe('duplicate priorities', () => {
    it('handles duplicate values', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.size).toBe(3)
    })

    it('eviction with duplicates', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      const evicted = q.enqueue(10)
      expect(evicted).toBe(5)
      expect(q.size).toBe(3)
    })

    it('remove removes first occurrence of duplicate', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.remove(5)).toBe(true)
      expect(q.size).toBe(2)
    })

    it('contains finds duplicates', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.contains(5)).toBe(true)
      q.remove(5)
      expect(q.contains(5)).toBe(true)
    })

    it('dequeue with duplicates', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(3)
      q.enqueue(3)
      q.enqueue(5)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(5)
    })
  })

  describe('many enqueue/dequeue cycles', () => {
    it('alternating enqueue dequeue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })

    it('maintains consistency over cycles', () => {
      const q = new BoundedPriorityQueue<number>(3)
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
        q.enqueue(i + 100)
        q.dequeue()
        q.dequeue()
      }
      expect(q.size).toBe(0)
    })

    it('eviction during cycles', () => {
      const q = new BoundedPriorityQueue<number>(3)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(3)
      expect(q.peek()).toBe(97)
    })

    it('size tracking during cycles', () => {
      const q = new BoundedPriorityQueue<number>(10)
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
        if (i % 2 === 0) q.dequeue()
      }
      expect(q.size).toBeLessThanOrEqual(10)
    })

    it('stress test with random operations', () => {
      const q = new BoundedPriorityQueue<number>(10)
      for (let i = 0; i < 500; i++) {
        q.enqueue(i)
        if (i % 3 === 0) q.dequeue()
        if (i % 7 === 0) q.peek()
        if (i % 11 === 0) q.contains(i)
        if (i % 13 === 0) q.accept(i)
      }
      expect(q.size).toBeLessThanOrEqual(10)
      expect(q.size).toBeGreaterThan(0)
    })
  })

  describe('forEach', () => {
    it('iterates over all items', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items: number[] = []
      q.forEach(item => items.push(item))
      expect(items).toHaveLength(3)
      expect(items.sort()).toEqual([1, 2, 3])
    })

    it('does not call callback for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      let callCount = 0
      q.forEach(() => callCount++)
      expect(callCount).toBe(0)
    })

    it('callback count matches size', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(q.size)
    })
  })

  describe('edge cases', () => {
    it('enqueue and dequeue single item repeatedly', () => {
      const q = new BoundedPriorityQueue<number>(1)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        expect(q.dequeue()).toBe(i)
      }
    })

    it('enqueue to full then dequeue all then refill', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty).toBe(true)
      q.enqueue(10)
      q.enqueue(20)
      expect(q.size).toBe(2)
      expect(q.peek()).toBe(10)
    })

    it('object identity for eviction', () => {
      const q = new BoundedPriorityQueue<{ x: number }>(3, {
        comparator: (a, b) => a.x - b.x,
      })
      const a = { x: 1 }
      const b = { x: 2 }
      const c = { x: 3 }
      q.enqueue(a)
      q.enqueue(b)
      q.enqueue(c)
      const evicted = q.enqueue({ x: 4 })
      expect(evicted).toBe(a)
    })

    it('accept does not change queue state', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(5)
      q.enqueue(10)
      const sizeBefore = q.size
      const peekBefore = q.peek()
      q.accept(7)
      expect(q.size).toBe(sizeBefore)
      expect(q.peek()).toBe(peekBefore)
    })

    it('toArray does not modify queue', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.toArray()
      expect(q.size).toBe(3)
      expect(q.peek()).toBe(1)
    })

    it('negative numbers as priorities', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(-5)
      q.enqueue(-10)
      q.enqueue(-1)
      expect(q.peek()).toBe(-10)
      expect(q.dequeue()).toBe(-10)
    })

    it('zero as priority', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(0)
      q.enqueue(-1)
      q.enqueue(1)
      expect(q.peek()).toBe(-1)
    })

    it('mixed enqueue and remove operations', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      q.remove(3)
      q.enqueue(2)
      expect(q.size).toBe(4)
      expect(q.toArray().sort()).toEqual([1, 2, 5, 7])
    })

    it('remove then enqueue same item', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(5)
      q.enqueue(3)
      q.remove(3)
      q.enqueue(3)
      expect(q.contains(3)).toBe(true)
      expect(q.size).toBe(2)
    })

    it('capacity unchanged after operations', () => {
      const q = new BoundedPriorityQueue<number>(7)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.clear()
      q.enqueue(3)
      q.drain()
      expect(q.capacity).toBe(7)
    })
  })
})
