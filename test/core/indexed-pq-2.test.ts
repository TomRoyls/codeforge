import { describe, it, expect } from 'vitest'
import { IndexedPQ2 } from '../../src/core/indexed-pq-2/index.js'

// ─── Constructor ───

describe('IndexedPQ2', () => {
  describe('constructor', () => {
    it('creates an empty PQ with default capacity', () => {
      const pq = new IndexedPQ2()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates an empty PQ with custom capacity', () => {
      const pq = new IndexedPQ2(16)
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates a PQ with capacity 1', () => {
      const pq = new IndexedPQ2(1)
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty()).toBe(false)
      expect(pq.peek()?.priority).toBe(5)
    })

    it('inserts multiple elements maintaining min-priority order', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 15)
      expect(pq.peek()?.id).toBe(1)
      expect(pq.peek()?.priority).toBe(5)
    })

    it('throws for duplicate id', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(() => pq.insert(0, 10)).toThrow('ID 0 already exists')
    })

    it('inserts elements with same priority (uses id as tiebreaker)', () => {
      const pq = new IndexedPQ2()
      pq.insert(5, 1)
      pq.insert(2, 1)
      pq.insert(8, 1)
      expect(pq.peek()?.id).toBe(2)
    })

    it('handles negative priorities', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, -5)
      pq.insert(1, 10)
      expect(pq.peek()?.id).toBe(0)
      expect(pq.peek()?.priority).toBe(-5)
    })

    it('grows beyond initial capacity', () => {
      const pq = new IndexedPQ2(2)
      pq.insert(0, 5)
      pq.insert(1, 3)
      pq.insert(2, 1)
      expect(pq.size).toBe(3)
      expect(pq.peek()?.priority).toBe(1)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('deletes an existing element by id', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.insert(1, 3)
      expect(pq.delete(0)).toBe(true)
      expect(pq.size).toBe(1)
      expect(pq.contains(0)).toBe(false)
    })

    it('returns false for non-existing id', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.delete(99)).toBe(false)
      expect(pq.size).toBe(1)
    })

    it('deletes the minimum element and updates peek', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.insert(1, 1)
      pq.insert(2, 10)
      pq.delete(1)
      expect(pq.peek()?.priority).toBe(5)
    })

    it('delete from single element PQ', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.delete(0)).toBe(true)
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('allows re-insert after delete', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.delete(0)
      expect(() => pq.insert(0, 10)).not.toThrow()
      expect(pq.size).toBe(1)
    })
  })

  // ─── Update ───

  describe('update', () => {
    it('updates priority to a lower value', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 10)
      pq.insert(1, 5)
      expect(pq.update(0, 1)).toBe(true)
      expect(pq.peek()?.id).toBe(0)
      expect(pq.peek()?.priority).toBe(1)
    })

    it('updates priority to a higher value', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 1)
      pq.insert(1, 5)
      expect(pq.update(0, 20)).toBe(true)
      expect(pq.peek()?.id).toBe(1)
    })

    it('returns false for non-existing id', () => {
      const pq = new IndexedPQ2()
      expect(pq.update(99, 5)).toBe(false)
    })

    it('updates priority of the only element', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.update(0, 10)).toBe(true)
      expect(pq.getPriority(0)).toBe(10)
    })

    it('getPriority reflects the new value after update', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.update(0, 42)
      expect(pq.getPriority(0)).toBe(42)
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    it('returns false for empty PQ', () => {
      const pq = new IndexedPQ2()
      expect(pq.contains(0)).toBe(false)
    })

    it('returns true for existing id', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.contains(0)).toBe(true)
    })

    it('returns false for non-existing id', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.contains(99)).toBe(false)
    })

    it('returns false after deletion', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.delete(0)
      expect(pq.contains(0)).toBe(false)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined for empty PQ', () => {
      const pq = new IndexedPQ2()
      expect(pq.peek()).toBeUndefined()
    })

    it('returns the minimum priority element', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 15)
      expect(pq.peek()).toEqual({ id: 1, priority: 5 })
    })

    it('does not remove the element', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.peek()
      expect(pq.size).toBe(1)
    })

    it('returns same element on repeated calls', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      expect(pq.peek()).toEqual(pq.peek())
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('returns undefined for empty PQ', () => {
      const pq = new IndexedPQ2()
      expect(pq.extractMin()).toBeUndefined()
    })

    it('extracts the minimum priority element', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 10)
      pq.insert(1, 5)
      pq.insert(2, 15)
      const min = pq.extractMin()
      expect(min).toEqual({ id: 1, priority: 5 })
      expect(pq.size).toBe(2)
    })

    it('extracts elements in priority order', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 30)
      pq.insert(1, 10)
      pq.insert(2, 20)
      expect(pq.extractMin()?.priority).toBe(10)
      expect(pq.extractMin()?.priority).toBe(20)
      expect(pq.extractMin()?.priority).toBe(30)
      expect(pq.isEmpty()).toBe(true)
    })

    it('removes id from index after extraction', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.extractMin()
      expect(pq.contains(0)).toBe(false)
    })

    it('extracts single element', () => {
      const pq = new IndexedPQ2()
      pq.insert(42, 7)
      expect(pq.extractMin()).toEqual({ id: 42, priority: 7 })
      expect(pq.isEmpty()).toBe(true)
    })
  })

  // ─── GetPriority ───

  describe('getPriority', () => {
    it('returns undefined for non-existing id', () => {
      const pq = new IndexedPQ2()
      expect(pq.getPriority(0)).toBeUndefined()
    })

    it('returns the priority of an existing id', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 42)
      expect(pq.getPriority(0)).toBe(42)
    })

    it('returns undefined after deletion', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 42)
      pq.delete(0)
      expect(pq.getPriority(0)).toBeUndefined()
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('tracks size through operations', () => {
      const pq = new IndexedPQ2()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
      pq.insert(0, 5)
      expect(pq.size).toBe(1)
      pq.insert(1, 10)
      expect(pq.size).toBe(2)
      pq.delete(0)
      expect(pq.size).toBe(1)
      pq.extractMin()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.insert(1, 10)
      pq.insert(2, 15)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
      expect(pq.peek()).toBeUndefined()
      expect(pq.contains(0)).toBe(false)
    })

    it('allows insertion after clear', () => {
      const pq = new IndexedPQ2()
      pq.insert(0, 5)
      pq.clear()
      pq.insert(0, 10)
      expect(pq.size).toBe(1)
      expect(pq.getPriority(0)).toBe(10)
    })
  })
})
