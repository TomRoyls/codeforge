import { describe, it, expect } from 'vitest'
import { WeirdHeap } from '../src/core/weird-heap/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('WeirdHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap', () => {
      const h = new WeirdHeap<number>()
      expect(h.isEmpty()).toBe(true)
      expect(h.size()).toBe(0)
    })

    it('accepts a custom comparator for max-heap behavior', () => {
      const h = new WeirdHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h.insert(1)
      h.insert(3)
      h.insert(2)
      expect(h.peek()).toBe(3)
    })
  })

  // ─── insert / peek / extractMin ───────────────────────────────────────

  describe('insert and peek', () => {
    it('peek returns undefined on empty heap', () => {
      const h = new WeirdHeap<number>()
      expect(h.peek()).toBeUndefined()
    })

    it('peek returns the minimum element', () => {
      const h = new WeirdHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      expect(h.peek()).toBe(3)
    })

    it('insert increases size', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      h.insert(2)
      expect(h.size()).toBe(2)
    })
  })

  describe('extractMin', () => {
    it('returns undefined on empty heap', () => {
      const h = new WeirdHeap<number>()
      expect(h.extractMin()).toBeUndefined()
    })

    it('extracts elements in sorted order', () => {
      const h = new WeirdHeap<number>()
      const values = [5, 3, 7, 1, 4, 6, 2]
      for (const v of values) h.insert(v)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.extractMin()!)
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('decreases size on each extraction', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      h.insert(2)
      h.extractMin()
      expect(h.size()).toBe(1)
    })

    it('handles single element', () => {
      const h = new WeirdHeap<number>()
      h.insert(42)
      expect(h.extractMin()).toBe(42)
      expect(h.isEmpty()).toBe(true)
    })
  })

  // ─── merge ────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = new WeirdHeap<number>()
      h1.insert(1)
      h1.insert(3)
      const h2 = new WeirdHeap<number>()
      h2.insert(2)
      h2.insert(4)
      h1.merge(h2)
      expect(h1.size()).toBe(4)
      expect(h2.isEmpty()).toBe(true)
      expect(h1.extractMin()).toBe(1)
      expect(h1.extractMin()).toBe(2)
    })

    it('merging empty heap is no-op', () => {
      const h = new WeirdHeap<number>()
      h.insert(5)
      const empty = new WeirdHeap<number>()
      h.merge(empty)
      expect(h.size()).toBe(1)
    })
  })

  // ─── clear / toArray ──────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all elements', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      h.insert(2)
      h.clear()
      expect(h.isEmpty()).toBe(true)
      expect(h.size()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns all values', () => {
      const h = new WeirdHeap<number>()
      h.insert(10)
      h.insert(20)
      const arr = h.toArray()
      expect(arr.length).toBe(2)
      expect(arr).toContain(10)
      expect(arr).toContain(20)
    })

    it('returns empty array for empty heap', () => {
      const h = new WeirdHeap<number>()
      expect(h.toArray()).toEqual([])
    })
  })

  // ─── contains ─────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for present value', () => {
      const h = new WeirdHeap<string>()
      h.insert('hello')
      expect(h.contains('hello')).toBe(true)
    })

    it('returns false for absent value', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      expect(h.contains(99)).toBe(false)
    })
  })

  // ─── decreaseKey ──────────────────────────────────────────────────────

  describe('decreaseKey', () => {
    it('decreases a key value', () => {
      const h = new WeirdHeap<number>()
      h.insert(10)
      h.insert(20)
      expect(h.decreaseKey(20, 5)).toBe(true)
      expect(h.extractMin()).toBe(5)
    })

    it('returns false if oldValue not found', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      expect(h.decreaseKey(99, 1)).toBe(false)
    })

    it('returns false if newValue > oldValue', () => {
      const h = new WeirdHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(5, 10)).toBe(false)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      h.insert(2)
      const c = h.clone()
      expect(c.size()).toBe(2)
      h.clear()
      expect(c.size()).toBe(2)
    })
  })

  // ─── isValid ──────────────────────────────────────────────────────────

  describe('isValid', () => {
    it('empty heap is valid', () => {
      const h = new WeirdHeap<number>()
      expect(h.isValid()).toBe(true)
    })

    it('heap after insertions is valid', () => {
      const h = new WeirdHeap<number>()
      for (let i = 10; i >= 1; i--) h.insert(i)
      expect(h.isValid()).toBe(true)
    })

    it('heap after extractions remains valid', () => {
      const h = new WeirdHeap<number>()
      for (let i = 0; i < 20; i++) h.insert(i)
      h.extractMin()
      h.extractMin()
      expect(h.isValid()).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a specific value', () => {
      const h = new WeirdHeap<number>()
      h.insert(10)
      h.insert(20)
      h.insert(30)
      expect(h.delete(20)).toBe(true)
      expect(h.size()).toBe(2)
      expect(h.contains(20)).toBe(false)
    })

    it('returns false for absent value', () => {
      const h = new WeirdHeap<number>()
      h.insert(1)
      expect(h.delete(99)).toBe(false)
    })
  })
})
