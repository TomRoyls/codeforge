import { describe, it, expect } from 'vitest'
import { IndexedPriorityQueue } from '../../src/core/indexed-priority-queue/indexed-priority-queue.js'

describe('IndexedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with defaults', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.size()).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates queue with capacity', () => {
      const pq = new IndexedPriorityQueue({ capacity: 10 })
      expect(pq.size()).toBe(0)
    })

    it('creates queue with custom comparator for max-heap', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      expect(pq.peek()?.priority).toBe(10)
    })

    it('creates queue with both options', () => {
      const pq = new IndexedPriorityQueue({
        capacity: 5,
        comparator: (a, b) => b - a,
      })
      expect(pq.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.size()).toBe(1)
      expect(pq.isEmpty()).toBe(false)
    })

    it('inserts multiple elements', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 20)
      expect(pq.size()).toBe(3)
    })

    it('throws on duplicate index', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(() => pq.insert(0, 10)).toThrow('Index 0 already exists')
    })

    it('throws when exceeding capacity', () => {
      const pq = new IndexedPriorityQueue({ capacity: 2 })
      pq.insert(0, 1)
      pq.insert(1, 2)
      expect(() => pq.insert(2, 3)).toThrow('capacity')
    })

    it('maintains heap property after inserts', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('poll', () => {
    it('returns undefined on empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.poll()).toBeUndefined()
    })

    it('returns and removes the min element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      const result = pq.poll()
      expect(result).toEqual({ index: 1, priority: 10 })
      expect(pq.size()).toBe(2)
    })

    it('polls all elements in order', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      pq.insert(3, 5)
      pq.insert(4, 25)
      expect(pq.poll()).toEqual({ index: 3, priority: 5 })
      expect(pq.poll()).toEqual({ index: 1, priority: 10 })
      expect(pq.poll()).toEqual({ index: 2, priority: 20 })
      expect(pq.poll()).toEqual({ index: 4, priority: 25 })
      expect(pq.poll()).toEqual({ index: 0, priority: 30 })
      expect(pq.poll()).toBeUndefined()
    })

    it('handles polling after mixed operations', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 7)
      pq.delete(1)
      expect(pq.poll()).toEqual({ index: 0, priority: 5 })
      expect(pq.poll()).toEqual({ index: 2, priority: 7 })
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.peek()).toBeUndefined()
    })

    it('returns min element without removing', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      expect(pq.peek()).toEqual({ index: 1, priority: 5 })
      expect(pq.size()).toBe(2)
    })

    it('returns same element on repeated peeks', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.peek()).toEqual({ index: 0, priority: 5 })
      expect(pq.peek()).toEqual({ index: 0, priority: 5 })
    })

    it('reflects changes after priority update', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.changePriority(0, 1)
      expect(pq.peek()).toEqual({ index: 0, priority: 1 })
    })
  })

  describe('delete', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue()
      expect(() => pq.delete(0)).toThrow('Index 0 not found')
    })

    it('deletes an element and returns its priority', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 20)
      expect(pq.delete(1)).toBe(5)
      expect(pq.size()).toBe(2)
      expect(pq.contains(1)).toBe(false)
    })

    it('deletes the root element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.delete(0)).toBe(5)
      expect(pq.peek()?.index).toBe(1)
    })

    it('deletes the last element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 10)
      expect(pq.delete(1)).toBe(10)
      expect(pq.size()).toBe(1)
      expect(pq.contains(1)).toBe(false)
    })

    it('maintains heap property after deletion', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.insert(2, 5)
      pq.insert(3, 30)
      pq.insert(4, 15)
      pq.delete(3)
      expect(pq.isValid()).toBe(true)
    })

    it('allows re-inserting a deleted index', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.delete(0)
      expect(() => pq.insert(0, 20)).not.toThrow()
      expect(pq.getPriority(0)).toBe(20)
    })

    it('deletes middle element and restructures', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 10; i++) {
        pq.insert(i, 10 - i)
      }
      pq.delete(5)
      expect(pq.isValid()).toBe(true)
      expect(pq.size()).toBe(9)
    })
  })

  describe('changePriority', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue()
      expect(() => pq.changePriority(0, 5)).toThrow('Index 0 not found')
    })

    it('changes priority to a lower value', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.changePriority(0, 1)
      expect(pq.getPriority(0)).toBe(1)
      expect(pq.peek()?.index).toBe(0)
    })

    it('changes priority to a higher value', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      pq.insert(1, 10)
      pq.changePriority(0, 20)
      expect(pq.getPriority(0)).toBe(20)
      expect(pq.peek()?.index).toBe(1)
    })

    it('no-op when priority is unchanged', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.changePriority(0, 5)
      expect(pq.getPriority(0)).toBe(5)
    })

    it('maintains heap property after change', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 20; i++) {
        pq.insert(i, i * 10)
      }
      pq.changePriority(10, 1)
      pq.changePriority(0, 1000)
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue()
      expect(() => pq.decreaseKey(0, 5)).toThrow('Index 0 not found')
    })

    it('decreases key for min-heap', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.decreaseKey(0, 1)
      expect(pq.peek()?.index).toBe(0)
      expect(pq.peek()?.priority).toBe(1)
    })

    it('throws when new priority is not less (min-heap)', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(() => pq.decreaseKey(0, 5)).toThrow()
      expect(() => pq.decreaseKey(0, 10)).toThrow()
    })

    it('maintains heap property after decreaseKey', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 15; i++) {
        pq.insert(i, i + 10)
      }
      pq.decreaseKey(14, 0)
      expect(pq.isValid()).toBe(true)
      expect(pq.peek()?.index).toBe(14)
    })

    it('decreaseKey works with max-heap comparator', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.decreaseKey(0, 30)
      expect(pq.peek()?.index).toBe(0)
      expect(pq.peek()?.priority).toBe(30)
    })
  })

  describe('increaseKey', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue()
      expect(() => pq.increaseKey(0, 5)).toThrow('Index 0 not found')
    })

    it('increases key for min-heap', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      pq.insert(1, 10)
      pq.increaseKey(0, 20)
      expect(pq.peek()?.index).toBe(1)
    })

    it('throws when new priority is not greater (min-heap)', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      expect(() => pq.increaseKey(0, 10)).toThrow()
      expect(() => pq.increaseKey(0, 5)).toThrow()
    })

    it('maintains heap property after increaseKey', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 15; i++) {
        pq.insert(i, i)
      }
      pq.increaseKey(0, 100)
      expect(pq.isValid()).toBe(true)
    })

    it('increaseKey works with max-heap comparator', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 30)
      pq.insert(1, 20)
      pq.increaseKey(1, 10)
      expect(pq.peek()?.index).toBe(0)
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.contains(0)).toBe(false)
    })

    it('returns true for existing index', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.contains(0)).toBe(true)
    })

    it('returns false after deletion', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.delete(0)
      expect(pq.contains(0)).toBe(false)
    })

    it('returns false for never-inserted index', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.contains(1)).toBe(false)
    })
  })

  describe('getPriority', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue()
      expect(() => pq.getPriority(0)).toThrow('Index 0 not found')
    })

    it('returns correct priority', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(5, 42)
      expect(pq.getPriority(5)).toBe(42)
    })

    it('reflects priority changes', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.changePriority(0, 20)
      expect(pq.getPriority(0)).toBe(20)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 on empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.size()).toBe(0)
    })

    it('size increments on insert', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      expect(pq.size()).toBe(1)
      pq.insert(1, 2)
      expect(pq.size()).toBe(2)
    })

    it('size decrements on delete', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      pq.insert(1, 2)
      pq.delete(0)
      expect(pq.size()).toBe(1)
    })

    it('size decrements on poll', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      pq.poll()
      expect(pq.size()).toBe(0)
    })

    it('isEmpty returns true after clearing all via poll', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      pq.insert(1, 2)
      pq.poll()
      pq.poll()
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the queue', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.clear()
      expect(pq.size()).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('clears index mapping', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.clear()
      expect(pq.contains(0)).toBe(false)
    })

    it('allows insertion after clear', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.clear()
      expect(() => pq.insert(0, 20)).not.toThrow()
    })
  })

  describe('indices', () => {
    it('returns empty array for empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.indices()).toEqual([])
    })

    it('returns all active indices', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(3, 10)
      pq.insert(7, 15)
      const idx = pq.indices().sort((a, b) => a - b)
      expect(idx).toEqual([0, 3, 7])
    })

    it('does not include deleted indices', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 15)
      pq.delete(1)
      const idx = pq.indices().sort((a, b) => a - b)
      expect(idx).toEqual([0, 2])
    })

    it('includes re-inserted indices', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.delete(0)
      pq.insert(0, 10)
      expect(pq.indices()).toEqual([0])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.toArray()).toEqual([])
    })

    it('returns elements sorted by priority', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      const arr = pq.toArray()
      expect(arr.map(e => e.priority)).toEqual([10, 20, 30])
    })

    it('does not modify the queue', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.toArray()
      expect(pq.size()).toBe(2)
    })

    it('works with max-heap', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 10)
      pq.insert(1, 30)
      pq.insert(2, 20)
      const arr = pq.toArray()
      expect(arr.map(e => e.priority)).toEqual([30, 20, 10])
    })
  })

  describe('isValid', () => {
    it('returns true for empty queue', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.isValid()).toBe(true)
    })

    it('returns true for single element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.isValid()).toBe(true)
    })

    it('returns true after inserts', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 8)
      pq.insert(3, 1)
      pq.insert(4, 6)
      expect(pq.isValid()).toBe(true)
    })

    it('returns true after deletes', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 20; i++) {
        pq.insert(i, Math.random() * 100)
      }
      pq.delete(5)
      pq.delete(10)
      pq.delete(15)
      expect(pq.isValid()).toBe(true)
    })

    it('returns true after priority changes', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 10; i++) {
        pq.insert(i, i * 5)
      }
      pq.changePriority(5, 100)
      pq.changePriority(9, -1)
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('poll returns max element', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      expect(pq.poll()).toEqual({ index: 1, priority: 10 })
    })

    it('polls all in descending order', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      expect(pq.poll()?.priority).toBe(10)
      expect(pq.poll()?.priority).toBe(5)
      expect(pq.poll()?.priority).toBe(3)
    })

    it('peek returns max element', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      expect(pq.peek()?.priority).toBe(10)
    })

    it('changePriority works correctly', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.changePriority(0, 20)
      expect(pq.peek()?.index).toBe(0)
    })

    it('delete works correctly', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      pq.delete(1)
      expect(pq.peek()?.priority).toBe(5)
    })

    it('isValid works with max-heap', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      pq.insert(3, 7)
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('stress test', () => {
    it('handles 1000+ insertions', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 1000; i++) {
        pq.insert(i, 1000 - i)
      }
      expect(pq.size()).toBe(1000)
      expect(pq.isValid()).toBe(true)
    })

    it('handles 1000 insertions with random priority changes', () => {
      const pq = new IndexedPriorityQueue()
      const priorities: number[] = []
      for (let i = 0; i < 1000; i++) {
        const p = Math.floor(Math.random() * 10000)
        priorities.push(p)
        pq.insert(i, p)
      }
      for (let k = 0; k < 200; k++) {
        const idx = Math.floor(Math.random() * 1000)
        const newP = Math.floor(Math.random() * 10000)
        pq.changePriority(idx, newP)
      }
      expect(pq.isValid()).toBe(true)
    })

    it('handles mixed operations sequence', () => {
      const pq = new IndexedPriorityQueue()
      const inserted = new Set<number>()
      for (let i = 0; i < 500; i++) {
        pq.insert(i, Math.random() * 1000)
        inserted.add(i)
      }
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * 500)
        if (inserted.has(idx)) {
          pq.delete(idx)
          inserted.delete(idx)
        }
      }
      for (let i = 500; i < 600; i++) {
        pq.insert(i, Math.random() * 1000)
        inserted.add(i)
      }
      for (let k = 0; k < 50; k++) {
        const arr = Array.from(inserted)
        if (arr.length > 0) {
          const idx = arr[Math.floor(Math.random() * arr.length)]!
          pq.changePriority(idx, Math.random() * 1000)
        }
      }
      expect(pq.isValid()).toBe(true)
      expect(pq.size()).toBe(inserted.size)
    })

    it('handles sequential poll of 1000 elements', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 1000; i++) {
        pq.insert(i, i)
      }
      let last = -Infinity
      while (!pq.isEmpty()) {
        const entry = pq.poll()
        expect(entry).toBeDefined()
        expect(entry!.priority).toBeGreaterThanOrEqual(last)
        last = entry!.priority
      }
    })

    it('handles stress with max-heap', () => {
      const pq = new IndexedPriorityQueue({
        comparator: (a, b) => b - a,
      })
      for (let i = 0; i < 500; i++) {
        pq.insert(i, Math.random() * 1000)
      }
      for (let k = 0; k < 100; k++) {
        pq.changePriority(k, Math.random() * 1000)
      }
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('min-heap ordering verification', () => {
    it('correctly orders elements with equal priorities', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 5)
      pq.insert(2, 5)
      expect(pq.isValid()).toBe(true)
    })

    it('correctly orders descending input', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 100)
      pq.insert(1, 50)
      pq.insert(2, 10)
      pq.insert(3, 1)
      const arr = pq.toArray()
      expect(arr.map(e => e.priority)).toEqual([1, 10, 50, 100])
    })

    it('correctly orders ascending input', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1)
      pq.insert(1, 10)
      pq.insert(2, 50)
      pq.insert(3, 100)
      const arr = pq.toArray()
      expect(arr.map(e => e.priority)).toEqual([1, 10, 50, 100])
    })

    it('correctly handles negative priorities', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, -10)
      pq.insert(1, 5)
      pq.insert(2, -3)
      pq.insert(3, 0)
      expect(pq.peek()?.priority).toBe(-10)
      const arr = pq.toArray()
      expect(arr.map(e => e.priority)).toEqual([-10, -3, 0, 5])
    })

    it('correctly handles floating point priorities', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 1.5)
      pq.insert(1, 0.3)
      pq.insert(2, 2.7)
      expect(pq.peek()?.priority).toBeCloseTo(0.3)
    })

    it('correctly handles zero priorities', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 0)
      pq.insert(1, 5)
      pq.insert(2, -1)
      expect(pq.peek()?.priority).toBe(-1)
    })
  })

  describe('error handling', () => {
    it('getPriority throws after deletion', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.delete(0)
      expect(() => pq.getPriority(0)).toThrow('Index 0 not found')
    })

    it('changePriority throws after deletion', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.delete(0)
      expect(() => pq.changePriority(0, 10)).toThrow('Index 0 not found')
    })

    it('delete throws after clear', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.clear()
      expect(() => pq.delete(0)).toThrow('Index 0 not found')
    })

    it('decreaseKey throws after poll removed element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.poll()
      expect(() => pq.decreaseKey(0, 1)).toThrow('Index 0 not found')
    })

    it('increaseKey throws after poll removed element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.poll()
      expect(() => pq.increaseKey(0, 20)).toThrow('Index 0 not found')
    })

    it('insert of large index works', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(999999, 42)
      expect(pq.contains(999999)).toBe(true)
      expect(pq.getPriority(999999)).toBe(42)
    })
  })

  describe('complex scenarios', () => {
    it('simulates Dijkstra-like operations', () => {
      const pq = new IndexedPriorityQueue()
      const distances = [Infinity, Infinity, Infinity, Infinity, Infinity]
      distances[0] = 0
      for (let i = 0; i < distances.length; i++) {
        pq.insert(i, distances[i]!)
      }
      expect(pq.poll()?.index).toBe(0)
      pq.decreaseKey(1, 4)
      pq.decreaseKey(2, 2)
      expect(pq.poll()?.index).toBe(2)
      pq.decreaseKey(3, 5)
      pq.decreaseKey(4, 7)
      expect(pq.poll()?.index).toBe(1)
      expect(pq.poll()?.index).toBe(3)
      expect(pq.poll()?.index).toBe(4)
    })

    it('handles interleaved insert and delete', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.delete(0)
      pq.insert(2, 1)
      pq.insert(0, 7)
      expect(pq.isValid()).toBe(true)
      expect(pq.poll()?.priority).toBe(1)
      expect(pq.poll()?.priority).toBe(3)
      expect(pq.poll()?.priority).toBe(7)
    })

    it('handles rapid priority changes on same element', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 50)
      pq.insert(1, 25)
      pq.insert(2, 75)
      pq.changePriority(0, 10)
      pq.changePriority(0, 100)
      pq.changePriority(0, 1)
      expect(pq.isValid()).toBe(true)
      expect(pq.peek()?.index).toBe(0)
    })

    it('handles delete-then-reinsert cycle', () => {
      const pq = new IndexedPriorityQueue()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          pq.insert(i, 10 - i + cycle * 100)
        }
        for (let i = 0; i < 10; i++) {
          pq.delete(i)
        }
        expect(pq.isEmpty()).toBe(true)
      }
    })

    it('toArray and poll produce same order', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 50; i++) {
        pq.insert(i, Math.random() * 1000)
      }
      const sorted = pq.toArray()
      const polled: number[] = []
      while (!pq.isEmpty()) {
        const e = pq.poll()
        polled.push(e!.priority)
      }
      expect(polled).toEqual(sorted.map(e => e.priority))
    })

    it('handles sparse indices', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(100, 5)
      pq.insert(200, 3)
      pq.insert(300, 7)
      expect(pq.contains(100)).toBe(true)
      expect(pq.contains(200)).toBe(true)
      expect(pq.contains(150)).toBe(false)
      expect(pq.poll()?.index).toBe(200)
    })

    it('handles single element operations', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.peek()).toEqual({ index: 0, priority: 5 })
      expect(pq.size()).toBe(1)
      pq.changePriority(0, 10)
      expect(pq.getPriority(0)).toBe(10)
      pq.delete(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('handles two element swap scenario', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 10)
      pq.insert(1, 5)
      expect(pq.peek()?.index).toBe(1)
      pq.changePriority(1, 20)
      expect(pq.peek()?.index).toBe(0)
      pq.changePriority(0, 30)
      expect(pq.peek()?.index).toBe(1)
    })

    it('handles alternating insert and poll', () => {
      const pq = new IndexedPriorityQueue()
      pq.insert(0, 5)
      expect(pq.poll()).toEqual({ index: 0, priority: 5 })
      pq.insert(1, 3)
      pq.insert(2, 7)
      expect(pq.poll()).toEqual({ index: 1, priority: 3 })
      expect(pq.poll()).toEqual({ index: 2, priority: 7 })
    })

    it('handles capacity edge cases', () => {
      const pq = new IndexedPriorityQueue({ capacity: 1 })
      pq.insert(0, 10)
      expect(pq.size()).toBe(1)
      pq.delete(0)
      expect(pq.size()).toBe(0)
      pq.insert(1, 20)
      expect(pq.getPriority(1)).toBe(20)
    })

    it('validates heap after many decreaseKey on random indices', () => {
      const pq = new IndexedPriorityQueue()
      for (let i = 0; i < 200; i++) {
        pq.insert(i, 1000 + i)
      }
      for (let k = 0; k < 100; k++) {
        pq.decreaseKey(k, k)
      }
      expect(pq.isValid()).toBe(true)
      expect(pq.peek()?.priority).toBe(0)
    })
  })
})
