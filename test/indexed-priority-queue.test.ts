import { IndexedPriorityQueue } from '../src/core/indexed-priority-queue/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('IndexedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with default comparator', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('accepts a custom comparator for max-heap behavior', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 7)
      expect(pq.peekMinPriority()).toBe(7)
    })
  })

  // ─── Insert ─────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty()).toBe(false)
    })

    it('maintains min-heap property', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.peekMinPriority()).toBe(10)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('throws when inserting duplicate index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      expect(() => pq.insert(0, 20)).toThrow('already exists')
    })
  })

  // ─── Delete ─────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an element by index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      const val = pq.delete(0)
      expect(val).toBe(10)
      expect(pq.size).toBe(1)
    })

    it('throws when deleting non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.delete(99)).toThrow('not found')
    })

    it('maintains heap property after deletion', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      pq.delete(1)
      expect(pq.peekMinPriority()).toBe(20)
    })
  })

  // ─── Change Priority ────────────────────────────────────────────────────

  describe('changePriority', () => {
    it('increases priority correctly', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.changePriority(0, 30)
      expect(pq.peekMinPriority()).toBe(20)
    })

    it('decreases priority correctly', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.changePriority(1, 5)
      expect(pq.peekMinPriority()).toBe(5)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('throws for non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.changePriority(5, 1)).toThrow('not found')
    })
  })

  // ─── Peek / Pop ─────────────────────────────────────────────────────────

  describe('peekMin and popMin', () => {
    it('returns undefined on empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.peekMinIndex()).toBe(undefined)
      expect(pq.peekMinPriority()).toBe(undefined)
      expect(pq.popMin()).toBe(undefined)
    })

    it('pops elements in sorted order', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.popMin()?.priority).toBe(10)
      expect(pq.popMin()?.priority).toBe(20)
      expect(pq.popMin()?.priority).toBe(30)
      expect(pq.popMin()).toBe(undefined)
    })
  })

  // ─── Contains / PriorityOf ──────────────────────────────────────────────

  describe('contains and priorityOf', () => {
    it('checks if index exists', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      expect(pq.contains(0)).toBe(true)
      expect(pq.contains(1)).toBe(false)
    })

    it('returns priority of given index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 42)
      expect(pq.priorityOf(0)).toBe(42)
    })

    it('throws for non-existent index in priorityOf', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.priorityOf(5)).toThrow('not found')
    })
  })

  // ─── DecreaseKey / IncreaseKey ───────────────────────────────────────────

  describe('decreaseKey and increaseKey', () => {
    it('decreaseKey updates and bubbles up', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 50)
      pq.insert(1, 10)
      pq.decreaseKey(0, 5)
      expect(pq.peekMinPriority()).toBe(5)
      expect(pq.peekMinIndex()).toBe(0)
    })

    it('increaseKey updates and sinks down', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 50)
      pq.increaseKey(0, 100)
      expect(pq.peekMinPriority()).toBe(50)
    })

    it('decreaseKey throws if new value is not less', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(() => pq.decreaseKey(0, 10)).toThrow('not less')
    })

    it('increaseKey throws if new value is not greater', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      expect(() => pq.increaseKey(0, 5)).toThrow('not greater')
    })
  })

  // ─── Utility Methods ────────────────────────────────────────────────────

  describe('utility methods', () => {
    it('clear empties the queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('toArray returns all entries', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      const arr = pq.toArray()
      expect(arr.length).toBe(2)
    })

    it('indices returns all stored indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(5, 10)
      pq.insert(10, 20)
      const idx = pq.indices()
      expect(idx).toContain(5)
      expect(idx).toContain(10)
    })

    it('isValid checks heap property', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.isValid()).toBe(true)
    })

    it('stats returns correct info', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.stats()).toEqual({ size: 0, height: 0 })
      pq.insert(0, 10)
      expect(pq.stats().size).toBe(1)
      expect(pq.stats().height).toBe(1)
    })
  })

  // ─── Clone / Iterator / Static ──────────────────────────────────────────

  describe('clone, iterator, and static from', () => {
    it('clone creates independent copy', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      const cloned = pq.clone()
      expect(cloned.size).toBe(1)
      pq.delete(0)
      expect(cloned.size).toBe(1)
    })

    it('iterates in sorted order', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      const result = [...pq]
      expect(result.map((e) => e.priority)).toEqual([10, 20, 30])
    })

    it('from static creates queue from entries', () => {
      const pq = IndexedPriorityQueue.from([
        { index: 0, priority: 20 },
        { index: 1, priority: 10 },
      ])
      expect(pq.size).toBe(2)
      expect(pq.peekMinPriority()).toBe(10)
    })
  })
})
