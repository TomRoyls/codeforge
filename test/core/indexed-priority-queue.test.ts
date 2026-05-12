import { describe, it, expect } from 'vitest'
import { IndexedPriorityQueue } from '../../src/core/indexed-priority-queue/index.js'

describe('IndexedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with defaults', () => {
      const pq = new IndexedPriorityQueue()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates queue with custom comparator for max-heap', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      expect(pq.peekMinPriority()).toBe(10)
    })

    it('creates queue with default comparator ascending', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 3)
      pq.insert(1, 1)
      pq.insert(2, 2)
      expect(pq.peekMinPriority()).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty()).toBe(false)
    })

    it('inserts multiple elements', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 20)
      expect(pq.size).toBe(3)
    })

    it('throws on duplicate index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(() => pq.insert(0, 10)).toThrow('Index 0 already exists')
    })

    it('maintains heap property after inserts', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.isValid()).toBe(true)
    })

    it('maintains min at root after many inserts', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 50)
      expect(pq.peekMinIndex()).toBe(0)
      pq.insert(1, 30)
      expect(pq.peekMinIndex()).toBe(1)
      pq.insert(2, 10)
      expect(pq.peekMinIndex()).toBe(2)
      pq.insert(3, 40)
      expect(pq.peekMinIndex()).toBe(2)
    })

    it('handles inserting with non-sequential indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(10, 5)
      pq.insert(20, 3)
      pq.insert(30, 7)
      expect(pq.size).toBe(3)
      expect(pq.peekMinIndex()).toBe(20)
    })

    it('handles inserting with index 0', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 42)
      expect(pq.contains(0)).toBe(true)
      expect(pq.priorityOf(0)).toBe(42)
    })
  })

  describe('peekMinIndex', () => {
    it('returns undefined on empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.peekMinIndex()).toBeUndefined()
    })

    it('returns index of min priority element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('does not remove the element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.peekMinIndex()
      expect(pq.size).toBe(1)
    })

    it('returns same index on repeated calls', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.peekMinIndex()).toBe(0)
      expect(pq.peekMinIndex()).toBe(0)
    })

    it('reflects changes after priority update', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.changePriority(0, 1)
      expect(pq.peekMinIndex()).toBe(0)
    })
  })

  describe('peekMinPriority', () => {
    it('returns undefined on empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.peekMinPriority()).toBeUndefined()
    })

    it('returns min priority without removing', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      expect(pq.peekMinPriority()).toBe(5)
      expect(pq.size).toBe(2)
    })

    it('reflects changes after priority update', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.changePriority(0, 1)
      expect(pq.peekMinPriority()).toBe(1)
    })
  })

  describe('popMin', () => {
    it('returns undefined on empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.popMin()).toBeUndefined()
    })

    it('returns and removes the min element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      const result = pq.popMin()
      expect(result).toEqual({ index: 1, priority: 10 })
      expect(pq.size).toBe(2)
    })

    it('pops all elements in order', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      pq.insert(3, 5)
      pq.insert(4, 25)
      expect(pq.popMin()).toEqual({ index: 3, priority: 5 })
      expect(pq.popMin()).toEqual({ index: 1, priority: 10 })
      expect(pq.popMin()).toEqual({ index: 2, priority: 20 })
      expect(pq.popMin()).toEqual({ index: 4, priority: 25 })
      expect(pq.popMin()).toEqual({ index: 0, priority: 30 })
      expect(pq.popMin()).toBeUndefined()
    })

    it('handles polling after mixed operations', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 7)
      pq.delete(1)
      expect(pq.popMin()).toEqual({ index: 0, priority: 5 })
      expect(pq.popMin()).toEqual({ index: 2, priority: 7 })
    })

    it('removes element from contains after pop', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.popMin()
      expect(pq.contains(1)).toBe(false)
      expect(pq.contains(0)).toBe(true)
    })
  })

  describe('delete', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.delete(0)).toThrow('Index 0 not found')
    })

    it('deletes an element and returns its priority', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 20)
      expect(pq.delete(1)).toBe(5)
      expect(pq.size).toBe(2)
      expect(pq.contains(1)).toBe(false)
    })

    it('deletes the root element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.delete(0)).toBe(5)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('deletes the last element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 10)
      expect(pq.delete(1)).toBe(10)
      expect(pq.size).toBe(1)
      expect(pq.contains(1)).toBe(false)
    })

    it('maintains heap property after deletion', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.insert(2, 5)
      pq.insert(3, 30)
      pq.insert(4, 15)
      pq.delete(3)
      expect(pq.isValid()).toBe(true)
    })

    it('allows re-inserting a deleted index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.delete(0)
      expect(() => pq.insert(0, 20)).not.toThrow()
      expect(pq.priorityOf(0)).toBe(20)
    })

    it('deletes middle element and restructures', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 10; i++) {
        pq.insert(i, 10 - i)
      }
      pq.delete(5)
      expect(pq.isValid()).toBe(true)
      expect(pq.size).toBe(9)
    })

    it('deleting all elements leaves empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.delete(0)
      pq.delete(1)
      expect(pq.isEmpty()).toBe(true)
      expect(pq.size).toBe(0)
    })
  })

  describe('changePriority', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.changePriority(0, 5)).toThrow('Index 0 not found')
    })

    it('changes priority to a lower value', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.changePriority(0, 1)
      expect(pq.priorityOf(0)).toBe(1)
      expect(pq.peekMinIndex()).toBe(0)
    })

    it('changes priority to a higher value', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.insert(1, 10)
      pq.changePriority(0, 20)
      expect(pq.priorityOf(0)).toBe(20)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('no-op when priority is unchanged', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.changePriority(0, 5)
      expect(pq.priorityOf(0)).toBe(5)
    })

    it('maintains heap property after change', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 20; i++) {
        pq.insert(i, i * 10)
      }
      pq.changePriority(10, 1)
      pq.changePriority(0, 1000)
      expect(pq.isValid()).toBe(true)
    })

    it('changePriority works after delete', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.delete(1)
      pq.changePriority(0, 1)
      expect(pq.peekMinPriority()).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.contains(0)).toBe(false)
    })

    it('returns true for existing index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.contains(0)).toBe(true)
    })

    it('returns false after deletion', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.delete(0)
      expect(pq.contains(0)).toBe(false)
    })

    it('returns false for never-inserted index', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.contains(1)).toBe(false)
    })

    it('returns false for all after clear', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.clear()
      expect(pq.contains(0)).toBe(false)
      expect(pq.contains(1)).toBe(false)
    })
  })

  describe('priorityOf', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.priorityOf(0)).toThrow('Index 0 not found')
    })

    it('returns correct priority', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(5, 42)
      expect(pq.priorityOf(5)).toBe(42)
    })

    it('reflects priority changes', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.changePriority(0, 20)
      expect(pq.priorityOf(0)).toBe(20)
    })

    it('throws after deletion', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.delete(0)
      expect(() => pq.priorityOf(0)).toThrow('Index 0 not found')
    })
  })

  describe('size', () => {
    it('is 0 on empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.size).toBe(0)
    })

    it('increments on insert', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      expect(pq.size).toBe(1)
      pq.insert(1, 2)
      expect(pq.size).toBe(2)
    })

    it('decrements on delete', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.insert(1, 2)
      pq.delete(0)
      expect(pq.size).toBe(1)
    })

    it('decrements on popMin', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.popMin()
      expect(pq.size).toBe(0)
    })

    it('is 0 after clear', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.insert(1, 2)
      pq.clear()
      expect(pq.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      expect(pq.isEmpty()).toBe(false)
    })

    it('returns true after clearing all via popMin', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.insert(1, 2)
      pq.popMin()
      pq.popMin()
      expect(pq.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.clear()
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('clears index mapping', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.clear()
      expect(pq.contains(0)).toBe(false)
    })

    it('allows insertion after clear', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.clear()
      expect(() => pq.insert(0, 20)).not.toThrow()
    })

    it('allows reuse after clear', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.clear()
      pq.insert(0, 3)
      pq.insert(1, 7)
      expect(pq.peekMinPriority()).toBe(3)
      expect(pq.size).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.toArray()).toEqual([])
    })

    it('returns elements from the heap', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      const arr = pq.toArray()
      expect(arr).toHaveLength(3)
    })

    it('does not modify the queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.toArray()
      expect(pq.size).toBe(2)
    })

    it('returns entries with index and priority', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      const arr = pq.toArray()
      expect(arr.every((e) => typeof e.index === 'number' && typeof e.priority === 'number')).toBe(true)
    })
  })

  describe('isValid', () => {
    it('returns true for empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.isValid()).toBe(true)
    })

    it('returns true for single element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.isValid()).toBe(true)
    })

    it('returns true after inserts', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 8)
      pq.insert(3, 1)
      pq.insert(4, 6)
      expect(pq.isValid()).toBe(true)
    })

    it('returns true after deletes', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 20; i++) {
        pq.insert(i, i * 7)
      }
      pq.delete(5)
      pq.delete(10)
      pq.delete(15)
      expect(pq.isValid()).toBe(true)
    })

    it('returns true after priority changes', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 10; i++) {
        pq.insert(i, i * 5)
      }
      pq.changePriority(5, 100)
      pq.changePriority(9, -1)
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('stats', () => {
    it('returns stats for empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      const s = pq.stats()
      expect(s.size).toBe(0)
      expect(s.height).toBe(0)
    })

    it('returns stats for single element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      const s = pq.stats()
      expect(s.size).toBe(1)
      expect(s.height).toBe(1)
    })

    it('returns correct height for multiple elements', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 7; i++) {
        pq.insert(i, i)
      }
      const s = pq.stats()
      expect(s.size).toBe(7)
      expect(s.height).toBe(3)
    })
  })

  describe('indices', () => {
    it('returns empty array for empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(pq.indices()).toEqual([])
    })

    it('returns all active indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(3, 10)
      pq.insert(7, 15)
      const idx = pq.indices().sort((a, b) => a - b)
      expect(idx).toEqual([0, 3, 7])
    })

    it('does not include deleted indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 15)
      pq.delete(1)
      const idx = pq.indices().sort((a, b) => a - b)
      expect(idx).toEqual([0, 2])
    })

    it('includes re-inserted indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.delete(0)
      pq.insert(0, 10)
      expect(pq.indices()).toEqual([0])
    })
  })

  describe('decreaseKey', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.decreaseKey(0, 5)).toThrow('Index 0 not found')
    })

    it('decreases key for min-heap', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.decreaseKey(0, 1)
      expect(pq.peekMinIndex()).toBe(0)
      expect(pq.peekMinPriority()).toBe(1)
    })

    it('throws when new priority is not less', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(() => pq.decreaseKey(0, 5)).toThrow()
      expect(() => pq.decreaseKey(0, 10)).toThrow()
    })

    it('maintains heap property after decreaseKey', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 15; i++) {
        pq.insert(i, i + 10)
      }
      pq.decreaseKey(14, 0)
      expect(pq.isValid()).toBe(true)
      expect(pq.peekMinIndex()).toBe(14)
    })

    it('decreaseKey works with max-heap comparator', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 10)
      pq.insert(1, 20)
      pq.decreaseKey(0, 30)
      expect(pq.peekMinIndex()).toBe(0)
      expect(pq.peekMinPriority()).toBe(30)
    })
  })

  describe('increaseKey', () => {
    it('throws on non-existent index', () => {
      const pq = new IndexedPriorityQueue<number>()
      expect(() => pq.increaseKey(0, 5)).toThrow('Index 0 not found')
    })

    it('increases key for min-heap', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.insert(1, 10)
      pq.increaseKey(0, 20)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('throws when new priority is not greater', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      expect(() => pq.increaseKey(0, 10)).toThrow()
      expect(() => pq.increaseKey(0, 5)).toThrow()
    })

    it('maintains heap property after increaseKey', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 15; i++) {
        pq.insert(i, i)
      }
      pq.increaseKey(0, 100)
      expect(pq.isValid()).toBe(true)
    })

    it('increaseKey works with max-heap comparator', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 30)
      pq.insert(1, 20)
      pq.increaseKey(1, 10)
      expect(pq.peekMinIndex()).toBe(0)
    })
  })

  describe('clone', () => {
    it('clones an empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      const c = pq.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('clones a non-empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 7)
      const c = pq.clone()
      expect(c.size).toBe(3)
      expect(c.peekMinPriority()).toBe(3)
    })

    it('clone is independent of original', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      const c = pq.clone()
      c.delete(0)
      expect(pq.contains(0)).toBe(true)
      expect(c.contains(0)).toBe(false)
    })

    it('clone preserves comparator', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      const c = pq.clone()
      expect(c.peekMinPriority()).toBe(10)
    })
  })

  describe('from static factory', () => {
    it('creates queue from entries', () => {
      const pq = IndexedPriorityQueue.from([
        { index: 0, priority: 30 },
        { index: 1, priority: 10 },
        { index: 2, priority: 20 },
      ])
      expect(pq.size).toBe(3)
      expect(pq.peekMinPriority()).toBe(10)
    })

    it('creates empty queue from empty entries', () => {
      const pq = IndexedPriorityQueue.from([])
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates with custom comparator', () => {
      const pq = IndexedPriorityQueue.from(
        [
          { index: 0, priority: 5 },
          { index: 1, priority: 10 },
        ],
        { comparator: (a, b) => b - a },
      )
      expect(pq.peekMinPriority()).toBe(10)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      const result = [...pq]
      expect(result).toEqual([])
    })

    it('iterates elements in priority order', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      const priorities = [...pq].map((e) => e.priority)
      expect(priorities).toEqual([10, 20, 30])
    })

    it('does not modify the queue', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      ;[...pq]
      expect(pq.size).toBe(2)
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('popMin returns max element', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      expect(pq.popMin()).toEqual({ index: 1, priority: 10 })
    })

    it('pops all in descending order', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      expect(pq.popMin()?.priority).toBe(10)
      expect(pq.popMin()?.priority).toBe(5)
      expect(pq.popMin()?.priority).toBe(3)
    })

    it('peekMinPriority returns max', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      expect(pq.peekMinPriority()).toBe(10)
    })

    it('changePriority works correctly', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.changePriority(0, 20)
      expect(pq.peekMinIndex()).toBe(0)
    })

    it('delete works correctly', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      pq.delete(1)
      expect(pq.peekMinPriority()).toBe(5)
    })

    it('isValid works with max-heap', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 3)
      pq.insert(3, 7)
      expect(pq.isValid()).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('handles 1000+ insertions', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 1000; i++) {
        pq.insert(i, 1000 - i)
      }
      expect(pq.size).toBe(1000)
      expect(pq.isValid()).toBe(true)
    })

    it('handles 1000 insertions with random priority changes', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 1000; i++) {
        const p = Math.floor(Math.random() * 10000)
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
      const pq = new IndexedPriorityQueue<number>()
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
      expect(pq.size).toBe(inserted.size)
    })

    it('handles sequential popMin of 1000 elements', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 1000; i++) {
        pq.insert(i, i)
      }
      let last = -Infinity
      while (!pq.isEmpty()) {
        const entry = pq.popMin()
        expect(entry).toBeDefined()
        expect(entry!.priority).toBeGreaterThanOrEqual(last)
        last = entry!.priority
      }
    })

    it('handles stress with max-heap', () => {
      const pq = new IndexedPriorityQueue<number>({ comparator: (a, b) => b - a })
      for (let i = 0; i < 500; i++) {
        pq.insert(i, Math.random() * 1000)
      }
      for (let k = 0; k < 100; k++) {
        pq.changePriority(k, Math.random() * 1000)
      }
      expect(pq.isValid()).toBe(true)
    })

    it('validates heap after many decreaseKey on random indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 200; i++) {
        pq.insert(i, 1000 + i)
      }
      for (let k = 0; k < 100; k++) {
        pq.decreaseKey(k, k)
      }
      expect(pq.isValid()).toBe(true)
      expect(pq.peekMinPriority()).toBe(0)
    })
  })

  describe('ordering verification', () => {
    it('correctly orders elements with equal priorities', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 5)
      pq.insert(2, 5)
      expect(pq.isValid()).toBe(true)
    })

    it('correctly orders descending input', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 100)
      pq.insert(1, 50)
      pq.insert(2, 10)
      pq.insert(3, 1)
      const priorities = [...pq].map((e) => e.priority)
      expect(priorities).toEqual([1, 10, 50, 100])
    })

    it('correctly orders ascending input', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1)
      pq.insert(1, 10)
      pq.insert(2, 50)
      pq.insert(3, 100)
      const priorities = [...pq].map((e) => e.priority)
      expect(priorities).toEqual([1, 10, 50, 100])
    })

    it('correctly handles negative priorities', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, -10)
      pq.insert(1, 5)
      pq.insert(2, -3)
      pq.insert(3, 0)
      expect(pq.peekMinPriority()).toBe(-10)
      const priorities = [...pq].map((e) => e.priority)
      expect(priorities).toEqual([-10, -3, 0, 5])
    })

    it('correctly handles floating point priorities', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 1.5)
      pq.insert(1, 0.3)
      pq.insert(2, 2.7)
      expect(pq.peekMinPriority()).toBeCloseTo(0.3)
    })

    it('correctly handles zero priorities', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 0)
      pq.insert(1, 5)
      pq.insert(2, -1)
      expect(pq.peekMinPriority()).toBe(-1)
    })
  })

  describe('error handling', () => {
    it('priorityOf throws after deletion', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.delete(0)
      expect(() => pq.priorityOf(0)).toThrow('Index 0 not found')
    })

    it('changePriority throws after deletion', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.delete(0)
      expect(() => pq.changePriority(0, 10)).toThrow('Index 0 not found')
    })

    it('delete throws after clear', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.clear()
      expect(() => pq.delete(0)).toThrow('Index 0 not found')
    })

    it('decreaseKey throws after popMin removed element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.popMin()
      expect(() => pq.decreaseKey(0, 1)).toThrow('Index 0 not found')
    })

    it('increaseKey throws after popMin removed element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.popMin()
      expect(() => pq.increaseKey(0, 20)).toThrow('Index 0 not found')
    })

    it('insert of large index works', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(999999, 42)
      expect(pq.contains(999999)).toBe(true)
      expect(pq.priorityOf(999999)).toBe(42)
    })
  })

  describe('complex scenarios', () => {
    it('simulates Dijkstra-like operations', () => {
      const pq = new IndexedPriorityQueue<number>()
      const distances = [Infinity, Infinity, Infinity, Infinity, Infinity]
      distances[0] = 0
      for (let i = 0; i < distances.length; i++) {
        pq.insert(i, distances[i]!)
      }
      expect(pq.popMin()?.index).toBe(0)
      pq.decreaseKey(1, 4)
      pq.decreaseKey(2, 2)
      expect(pq.popMin()?.index).toBe(2)
      pq.decreaseKey(3, 5)
      pq.decreaseKey(4, 7)
      expect(pq.popMin()?.index).toBe(1)
      expect(pq.popMin()?.index).toBe(3)
      expect(pq.popMin()?.index).toBe(4)
    })

    it('handles interleaved insert and delete', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.delete(0)
      pq.insert(2, 1)
      pq.insert(0, 7)
      expect(pq.isValid()).toBe(true)
      expect(pq.popMin()?.priority).toBe(1)
      expect(pq.popMin()?.priority).toBe(3)
      expect(pq.popMin()?.priority).toBe(7)
    })

    it('handles rapid priority changes on same element', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 50)
      pq.insert(1, 25)
      pq.insert(2, 75)
      pq.changePriority(0, 10)
      pq.changePriority(0, 100)
      pq.changePriority(0, 1)
      expect(pq.isValid()).toBe(true)
      expect(pq.peekMinIndex()).toBe(0)
    })

    it('handles delete-then-reinsert cycle', () => {
      const pq = new IndexedPriorityQueue<number>()
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

    it('iterator and popMin produce same order', () => {
      const pq = new IndexedPriorityQueue<number>()
      for (let i = 0; i < 50; i++) {
        pq.insert(i, Math.random() * 1000)
      }
      const sorted = [...pq].map((e) => e.priority)
      const polled: number[] = []
      while (!pq.isEmpty()) {
        const e = pq.popMin()
        polled.push(e!.priority)
      }
      expect(polled).toEqual(sorted)
    })

    it('handles sparse indices', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(100, 5)
      pq.insert(200, 3)
      pq.insert(300, 7)
      expect(pq.contains(100)).toBe(true)
      expect(pq.contains(200)).toBe(true)
      expect(pq.contains(150)).toBe(false)
      expect(pq.popMin()?.index).toBe(200)
    })

    it('handles single element operations', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.peekMinIndex()).toBe(0)
      expect(pq.peekMinPriority()).toBe(5)
      expect(pq.size).toBe(1)
      pq.changePriority(0, 10)
      expect(pq.priorityOf(0)).toBe(10)
      pq.delete(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('handles two element swap scenario', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 10)
      pq.insert(1, 5)
      expect(pq.peekMinIndex()).toBe(1)
      pq.changePriority(1, 20)
      expect(pq.peekMinIndex()).toBe(0)
      pq.changePriority(0, 30)
      expect(pq.peekMinIndex()).toBe(1)
    })

    it('handles alternating insert and popMin', () => {
      const pq = new IndexedPriorityQueue<number>()
      pq.insert(0, 5)
      expect(pq.popMin()).toEqual({ index: 0, priority: 5 })
      pq.insert(1, 3)
      pq.insert(2, 7)
      expect(pq.popMin()).toEqual({ index: 1, priority: 3 })
      expect(pq.popMin()).toEqual({ index: 2, priority: 7 })
    })

    it('handles string priorities', () => {
      const pq = new IndexedPriorityQueue<string>()
      pq.insert(0, 'cherry')
      pq.insert(1, 'apple')
      pq.insert(2, 'banana')
      expect(pq.peekMinPriority()).toBe('apple')
      expect(pq.popMin()?.index).toBe(1)
    })

    it('handles object priorities with custom comparator', () => {
      type Task = { urgency: number }
      const pq = new IndexedPriorityQueue<Task>({
        comparator: (a, b) => a.urgency - b.urgency,
      })
      pq.insert(0, { urgency: 5 })
      pq.insert(1, { urgency: 1 })
      pq.insert(2, { urgency: 3 })
      expect(pq.peekMinPriority()?.urgency).toBe(1)
      expect(pq.popMin()?.index).toBe(1)
    })
  })
})
