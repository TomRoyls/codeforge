import { BoundedPriorityQueue } from '../src/core/bounded-priority-queue/bounded-priority-queue.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BoundedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates a queue with positive capacity', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.capacity).toBe(5)
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('clamps negative capacity to 0', () => {
      const q = new BoundedPriorityQueue<number>(-1)
      expect(q.capacity).toBe(0)
    })

    it('clamps large negative capacity to 0', () => {
      const q = new BoundedPriorityQueue<number>(-100)
      expect(q.capacity).toBe(0)
    })

    it('creates a queue with capacity 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.capacity).toBe(0)
      expect(q.size).toBe(0)
    })

    it('accepts a custom comparator', () => {
      const q = new BoundedPriorityQueue<number>(10, {
        comparator: (a, b) => b - a,
      })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.peek()).toBe(5)
    })

    it('uses default comparator when no options provided', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
    })

    it('uses default comparator when options object is empty', () => {
      const q = new BoundedPriorityQueue<number>(10, {})
      q.enqueue(3)
      q.enqueue(1)
      expect(q.peek()).toBe(1)
    })

    it('creates a queue with capacity 1', () => {
      const q = new BoundedPriorityQueue<number>(1)
      expect(q.capacity).toBe(1)
      expect(q.isEmpty).toBe(true)
      expect(q.isFull).toBe(false)
    })
  })

  // ─── Enqueue ──────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('adds an item to an empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      const result = q.enqueue(10)
      expect(result).toBeUndefined()
      expect(q.size).toBe(1)
    })

    it('returns undefined when adding below capacity', () => {
      const q = new BoundedPriorityQueue<number>(3)
      expect(q.enqueue(1)).toBeUndefined()
      expect(q.enqueue(2)).toBeUndefined()
      expect(q.enqueue(3)).toBeUndefined()
      expect(q.size).toBe(3)
    })

    it('returns undefined when capacity is 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      const result = q.enqueue(10)
      expect(result).toBeUndefined()
      expect(q.size).toBe(0)
    })

    it('evicts minimum when full and new item is greater', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const evicted = q.enqueue(10)
      expect(evicted).toBe(1)
      expect(q.size).toBe(3)
    })

    it('returns undefined when full and new item is not greater than min', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(5)
      q.enqueue(6)
      q.enqueue(7)
      const result = q.enqueue(3)
      expect(result).toBeUndefined()
      expect(q.size).toBe(3)
    })

    it('returns undefined when full and new item equals min', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(5)
      q.enqueue(10)
      const result = q.enqueue(5)
      expect(result).toBeUndefined()
    })

    it('maintains heap property after multiple enqueues', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      q.enqueue(1)
      q.enqueue(9)
      expect(q.peek()).toBe(1)
    })

    it('handles enqueue with custom comparator (max-heap)', () => {
      const q = new BoundedPriorityQueue<number>(3, {
        comparator: (a, b) => b - a,
      })
      q.enqueue(3)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.peek()).toBe(3)
      const evicted = q.enqueue(0)
      expect(evicted).toBe(3)
      expect(q.peek()).toBe(2)
    })

    it('evicts correctly when repeatedly adding to full queue', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(10)
      q.enqueue(20)
      expect(q.enqueue(30)).toBe(10)
      expect(q.enqueue(40)).toBe(20)
      expect(q.size).toBe(2)
    })

    it('does not exceed capacity', () => {
      const q = new BoundedPriorityQueue<number>(3)
      for (let i = 0; i < 10; i++) q.enqueue(i)
      expect(q.size).toBe(3)
    })
  })

  // ─── Dequeue ──────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.dequeue()).toBeUndefined()
    })

    it('removes and returns the minimum element', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      expect(q.dequeue()).toBe(3)
      expect(q.size).toBe(2)
    })

    it('returns the only element', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty).toBe(true)
    })

    it('removes all elements in priority order', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(2)
      q.enqueue(4)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBeUndefined()
    })

    it('maintains heap property after dequeue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(5)
      q.enqueue(15)
      q.dequeue()
      expect(q.peek()).toBe(10)
    })

    it('handles dequeue after eviction', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(10)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(10)
    })

    it('returns undefined on capacity-0 queue', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.dequeue()).toBeUndefined()
    })
  })

  // ─── Peek ─────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.peek()).toBeUndefined()
    })

    it('returns the minimum element without removing it', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      expect(q.peek()).toBe(3)
      expect(q.size).toBe(3)
    })

    it('returns the only element', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(99)
      expect(q.peek()).toBe(99)
    })

    it('updates after dequeue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBe(3)
    })

    it('returns undefined on capacity-0 queue', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.peek()).toBeUndefined()
    })
  })

  // ─── Size / isEmpty / isFull ──────────────────────────────────────────

  describe('size / isEmpty / isFull', () => {
    it('size is 0 for new queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.size).toBe(0)
    })

    it('isEmpty is true for new queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.isEmpty).toBe(true)
    })

    it('isFull is false for new queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.isFull).toBe(false)
    })

    it('isFull becomes true at capacity', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(1)
      expect(q.isFull).toBe(false)
      q.enqueue(2)
      expect(q.isFull).toBe(true)
    })

    it('isFull stays true after eviction', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull).toBe(true)
    })

    it('isEmpty becomes false after enqueue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.isEmpty).toBe(false)
    })

    it('isEmpty becomes true after draining all elements', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty).toBe(true)
    })

    it('capacity-0 queue is always full', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.isFull).toBe(true)
    })

    it('capacity-0 queue is always empty', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.isEmpty).toBe(true)
    })

    it('size tracks correctly after mixed operations', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
      q.dequeue()
      expect(q.size).toBe(2)
      q.enqueue(4)
      expect(q.size).toBe(3)
      q.clear()
      expect(q.size).toBe(0)
    })
  })

  // ─── Clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('does not change capacity', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.clear()
      expect(q.capacity).toBe(5)
    })

    it('is safe to call on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.clear()
      expect(q.size).toBe(0)
    })

    it('allows enqueue after clear', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      q.enqueue(10)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(10)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.toArray()).toEqual([])
    })

    it('returns a copy of the heap', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('returns a new array each time', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      const a1 = q.toArray()
      const a2 = q.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('does not modify queue when array is mutated', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      arr.push(99)
      expect(q.size).toBe(2)
    })
  })

  // ─── Contains ─────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns false on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.contains(1)).toBe(false)
    })

    it('returns true when item exists', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(42)
      expect(q.contains(42)).toBe(true)
    })

    it('returns false when item does not exist', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(99)).toBe(false)
    })

    it('uses reference equality for objects', () => {
      const q = new BoundedPriorityQueue<object>(5)
      const obj = { id: 1 }
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })

    it('finds elements after dequeue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      q.dequeue()
      expect(q.contains(5)).toBe(true)
      expect(q.contains(8)).toBe(true)
      expect(q.contains(3)).toBe(false)
    })
  })

  // ─── Remove ───────────────────────────────────────────────────────────

  describe('remove', () => {
    it('returns false when item not found', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      expect(q.remove(99)).toBe(false)
    })

    it('returns false on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.remove(1)).toBe(false)
    })

    it('removes an existing item and returns true', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(2)).toBe(true)
      expect(q.size).toBe(2)
      expect(q.contains(2)).toBe(false)
    })

    it('removes the root element', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(1)).toBe(true)
      expect(q.peek()).toBe(2)
    })

    it('removes the last element', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(3)).toBe(true)
      expect(q.size).toBe(2)
      expect(q.contains(3)).toBe(false)
    })

    it('maintains heap property after removal', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      q.enqueue(1)
      q.enqueue(9)
      q.remove(3)
      const values: number[] = []
      while (!q.isEmpty) values.push(q.dequeue()!)
      const sorted = [...values].sort((a, b) => a - b)
      expect(values).toEqual(sorted)
    })

    it('removes a middle element and re-heapifies', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.enqueue(40)
      q.remove(20)
      expect(q.size).toBe(3)
      const values: number[] = []
      while (!q.isEmpty) values.push(q.dequeue()!)
      expect(values).toEqual([10, 30, 40])
    })

    it('uses reference equality for objects', () => {
      const q = new BoundedPriorityQueue<object>(5)
      const obj = { id: 1 }
      q.enqueue(obj)
      expect(q.remove({ id: 1 })).toBe(false)
      expect(q.remove(obj)).toBe(true)
    })
  })

  // ─── Drain ────────────────────────────────────────────────────────────

  describe('drain', () => {
    it('returns all elements and empties the queue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const drained = q.drain()
      expect(drained.length).toBe(3)
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('returns empty array for empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      const drained = q.drain()
      expect(drained).toEqual([])
    })

    it('returned array is the original heap reference', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      const drained = q.drain()
      drained.push(99)
      expect(q.size).toBe(0)
    })

    it('allows reuse after drain', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      const collected: number[] = []
      q.forEach((item) => collected.push(item))
      expect(collected.length).toBe(3)
      expect(collected).toContain(1)
      expect(collected).toContain(2)
      expect(collected).toContain(3)
    })

    it('does not call callback on empty queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates over single element', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(42)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([42])
    })
  })

  // ─── Accept ───────────────────────────────────────────────────────────

  describe('accept', () => {
    it('returns false when capacity is 0', () => {
      const q = new BoundedPriorityQueue<number>(0)
      expect(q.accept(1)).toBe(false)
    })

    it('returns true when queue is not full', () => {
      const q = new BoundedPriorityQueue<number>(5)
      expect(q.accept(1)).toBe(true)
    })

    it('returns true when full and item is greater than min', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.accept(10)).toBe(true)
    })

    it('returns false when full and item equals min', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.accept(1)).toBe(false)
    })

    it('returns false when full and item is less than min', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(5)
      q.enqueue(6)
      q.enqueue(7)
      expect(q.accept(1)).toBe(false)
    })

    it('returns true when queue has room', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(false)
      expect(q.accept(0)).toBe(true)
    })
  })

  // ─── Priority Ordering ────────────────────────────────────────────────

  describe('priority ordering', () => {
    it('dequeue returns elements in ascending order', () => {
      const q = new BoundedPriorityQueue<number>(10)
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) q.enqueue(v)
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles string ordering with default comparator', () => {
      const q = new BoundedPriorityQueue<string>(10)
      q.enqueue('cherry')
      q.enqueue('apple')
      q.enqueue('banana')
      expect(q.dequeue()).toBe('apple')
      expect(q.dequeue()).toBe('banana')
      expect(q.dequeue()).toBe('cherry')
    })

    it('handles custom comparator for descending order', () => {
      const q = new BoundedPriorityQueue<number>(10, {
        comparator: (a, b) => b - a,
      })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(1)
    })

    it('handles objects with custom comparator', () => {
      interface Task {
        priority: number
        name: string
      }
      const q = new BoundedPriorityQueue<Task>(10, {
        comparator: (a, b) => a.priority - b.priority,
      })
      q.enqueue({ priority: 3, name: 'low' })
      q.enqueue({ priority: 1, name: 'high' })
      q.enqueue({ priority: 2, name: 'medium' })
      expect(q.dequeue()!.name).toBe('high')
      expect(q.dequeue()!.name).toBe('medium')
      expect(q.dequeue()!.name).toBe('low')
    })

    it('handles equal priorities correctly', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.size).toBe(3)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(5)
    })
  })

  // ─── Capacity Enforcement / Eviction ──────────────────────────────────

  describe('capacity enforcement', () => {
    it('keeps the largest N elements when overflow', () => {
      const q = new BoundedPriorityQueue<number>(3)
      for (let i = 1; i <= 10; i++) q.enqueue(i)
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result).toEqual([8, 9, 10])
    })

    it('evicts lowest priority items for higher priority', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(10)
      q.enqueue(20)
      const evicted = q.enqueue(15)
      expect(evicted).toBe(10)
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result).toEqual([15, 20])
    })

    it('does not accept items that would not make top N', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(100)
      q.enqueue(200)
      q.enqueue(300)
      expect(q.enqueue(50)).toBeUndefined()
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result).toEqual([100, 200, 300])
    })

    it('correctly tracks top K of a stream', () => {
      const k = 5
      const q = new BoundedPriorityQueue<number>(k)
      const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
      for (const v of data) q.enqueue(v)
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result).toEqual([5, 5, 5, 6, 9])
    })

    it('handles eviction when all items are equal', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.enqueue(5)).toBeUndefined()
      expect(q.size).toBe(2)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('capacity 1 queue stores single highest item', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(5)
      expect(q.enqueue(10)).toBe(5)
      expect(q.peek()).toBe(10)
      expect(q.enqueue(3)).toBeUndefined()
      expect(q.peek()).toBe(10)
    })

    it('capacity 1 dequeue returns the single element', () => {
      const q = new BoundedPriorityQueue<number>(1)
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty).toBe(true)
    })

    it('handles negative numbers', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(-5)
      q.enqueue(-1)
      q.enqueue(-10)
      expect(q.dequeue()).toBe(-10)
      expect(q.dequeue()).toBe(-5)
      expect(q.dequeue()).toBe(-1)
    })

    it('handles zero values', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(0)
      q.enqueue(-1)
      q.enqueue(1)
      expect(q.dequeue()).toBe(-1)
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(1)
    })

    it('handles large number of elements', () => {
      const q = new BoundedPriorityQueue<number>(1000)
      for (let i = 999; i >= 0; i--) q.enqueue(i)
      expect(q.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })

    it('handles large number of elements with small capacity (top-K)', () => {
      const q = new BoundedPriorityQueue<number>(10)
      for (let i = 0; i < 10000; i++) q.enqueue(i)
      expect(q.size).toBe(10)
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result[0]).toBe(9990)
      expect(result[9]).toBe(9999)
    })

    it('handles alternating enqueue dequeue', () => {
      const q = new BoundedPriorityQueue<number>(10)
      q.enqueue(5)
      expect(q.dequeue()).toBe(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(7)
      expect(q.isEmpty).toBe(true)
    })

    it('handles enqueue after clear into full capacity', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.enqueue(10)).toBeUndefined()
      expect(q.enqueue(20)).toBeUndefined()
      expect(q.enqueue(30)).toBe(10)
      expect(q.size).toBe(2)
    })

    it('handles string type', () => {
      const q = new BoundedPriorityQueue<string>(5)
      q.enqueue('hello')
      q.enqueue('world')
      q.enqueue('abc')
      expect(q.dequeue()).toBe('abc')
    })

    it('handles boolean type', () => {
      const q = new BoundedPriorityQueue<boolean>(5)
      q.enqueue(true)
      q.enqueue(false)
      expect(q.dequeue()).toBe(false)
      expect(q.dequeue()).toBe(true)
    })

    it('remove on single-element queue', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(42)
      expect(q.remove(42)).toBe(true)
      expect(q.isEmpty).toBe(true)
    })

    it('contains after eviction returns correct result', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(10)
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
      expect(q.contains(10)).toBe(true)
    })

    it('forEach after mixed operations', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(10)
      q.enqueue(5)
      q.enqueue(20)
      q.dequeue()
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items.length).toBe(2)
      expect(items).toContain(10)
      expect(items).toContain(20)
    })

    it('drain preserves element count', () => {
      const q = new BoundedPriorityQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const drained = q.drain()
      expect(drained.length).toBe(3)
      expect(q.size).toBe(0)
    })

    it('toArray after eviction reflects current state', () => {
      const q = new BoundedPriorityQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(10)
      const arr = q.toArray()
      expect(arr.length).toBe(3)
      expect(arr).not.toContain(1)
      expect(arr).toContain(10)
    })

    it('accept is consistent with enqueue behavior', () => {
      const q = new BoundedPriorityQueue<number>(2)
      q.enqueue(5)
      q.enqueue(10)
      expect(q.accept(3)).toBe(false)
      expect(q.accept(15)).toBe(true)
      expect(q.enqueue(3)).toBeUndefined()
      expect(q.enqueue(15)).toBe(5)
    })

    it('repeated clear and fill', () => {
      const q = new BoundedPriorityQueue<number>(3)
      for (let round = 0; round < 5; round++) {
        q.enqueue(round * 10)
        q.enqueue(round * 10 + 1)
        q.enqueue(round * 10 + 2)
        expect(q.size).toBe(3)
        q.clear()
        expect(q.size).toBe(0)
      }
    })

    it('handles NaN-like comparisons gracefully with custom comparator', () => {
      const q = new BoundedPriorityQueue<number>(3, {
        comparator: (a, b) => {
          if (Number.isNaN(a)) return 1
          if (Number.isNaN(b)) return -1
          return a - b
        },
      })
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('enqueue dequeue cycle maintains correctness', () => {
      const q = new BoundedPriorityQueue<number>(100)
      const expected: number[] = []
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
        expected.push(i)
      }
      expected.sort((a, b) => a - b)
      const result: number[] = []
      while (!q.isEmpty) result.push(q.dequeue()!)
      expect(result).toEqual(expected)
    })
  })
})
