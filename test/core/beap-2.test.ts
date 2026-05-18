import { describe, it, expect } from 'vitest'
import { Beap2 } from '../../src/core/beap-2/index.js'

// ─── Constructor ───

describe('Beap2', () => {
  describe('constructor', () => {
    it('creates an empty beap by default', () => {
      const beap = new Beap2<number>()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty()).toBe(true)
    })

    it('accepts a custom comparator for max-beap', () => {
      const beap = new Beap2<number>((a, b) => b - a)
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      expect(beap.peek()).toBe(5)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      expect(beap.size).toBe(1)
      expect(beap.isEmpty()).toBe(false)
      expect(beap.peek()).toBe(5)
    })

    it('inserts multiple elements maintaining min-beap property', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      beap.insert(1)
      beap.insert(4)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(5)
    })

    it('inserts duplicate values', () => {
      const beap = new Beap2<number>()
      beap.insert(3)
      beap.insert(3)
      beap.insert(1)
      expect(beap.size).toBe(3)
    })

    it('inserts in sorted order', () => {
      const beap = new Beap2<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.insert(4)
      beap.insert(5)
      expect(beap.peek()).toBe(1)
    })

    it('inserts in reverse sorted order', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      beap.insert(4)
      beap.insert(3)
      beap.insert(2)
      beap.insert(1)
      expect(beap.peek()).toBe(1)
    })

    it('handles negative numbers', () => {
      const beap = new Beap2<number>()
      beap.insert(-3)
      beap.insert(0)
      beap.insert(-1)
      beap.insert(2)
      expect(beap.peek()).toBe(-3)
    })

    it('handles strings', () => {
      const beap = new Beap2<string>()
      beap.insert('cherry')
      beap.insert('apple')
      beap.insert('banana')
      expect(beap.peek()).toBe('apple')
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('returns undefined for empty beap', () => {
      const beap = new Beap2<number>()
      expect(beap.extractMin()).toBeUndefined()
    })

    it('extracts the single element', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      expect(beap.extractMin()).toBe(5)
      expect(beap.size).toBe(0)
      expect(beap.isEmpty()).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      beap.insert(1)
      beap.insert(4)
      const sorted: number[] = []
      while (!beap.isEmpty()) {
        sorted.push(beap.extractMin()!)
      }
      expect(sorted).toEqual([1, 3, 4, 5, 7])
    })

    it('handles duplicate values during extraction', () => {
      const beap = new Beap2<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(3)
      beap.insert(1)
      expect(beap.extractMin()).toBe(1)
      expect(beap.extractMin()).toBe(1)
      expect(beap.extractMin()).toBe(3)
      expect(beap.extractMin()).toBe(3)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined for empty beap', () => {
      const beap = new Beap2<number>()
      expect(beap.peek()).toBeUndefined()
    })

    it('returns the minimum element without removing it', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      expect(beap.peek()).toBe(3)
      expect(beap.size).toBe(3)
    })

    it('updates after extraction', () => {
      const beap = new Beap2<number>()
      beap.insert(1)
      beap.insert(3)
      beap.insert(2)
      beap.extractMin()
      expect(beap.peek()).toBe(2)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns true for existing element', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      expect(beap.has(5)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const beap = new Beap2<number>()
      beap.insert(5)
      expect(beap.has(99)).toBe(false)
    })

    it('returns false on empty beap', () => {
      const beap = new Beap2<number>()
      expect(beap.has(1)).toBe(false)
    })
  })

  // ─── Size / isEmpty / clear ───

  describe('size', () => {
    it('tracks size correctly', () => {
      const beap = new Beap2<number>()
      expect(beap.size).toBe(0)
      beap.insert(1)
      expect(beap.size).toBe(1)
      beap.insert(2)
      expect(beap.size).toBe(2)
      beap.extractMin()
      expect(beap.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const beap = new Beap2<number>()
      expect(beap.isEmpty()).toBe(true)
    })

    it('returns false when not empty', () => {
      const beap = new Beap2<number>()
      beap.insert(1)
      expect(beap.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const beap = new Beap2<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.clear()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty()).toBe(true)
      expect(beap.peek()).toBeUndefined()
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty beap', () => {
      const beap = new Beap2<number>()
      expect(beap.toArray()).toEqual([])
    })

    it('returns a copy of the internal array', () => {
      const beap = new Beap2<number>()
      beap.insert(1)
      beap.insert(2)
      const arr = beap.toArray()
      expect(arr.length).toBe(2)
      arr.push(99)
      expect(beap.size).toBe(2)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles many sequential inserts and extractions', () => {
      const beap = new Beap2<number>()
      for (let i = 0; i < 50; i++) beap.insert(i)
      expect(beap.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(beap.extractMin()).toBe(i)
      }
      expect(beap.isEmpty()).toBe(true)
    })

    it('handles single element insert and extract', () => {
      const beap = new Beap2<number>()
      beap.insert(42)
      expect(beap.peek()).toBe(42)
      expect(beap.has(42)).toBe(true)
      expect(beap.extractMin()).toBe(42)
      expect(beap.isEmpty()).toBe(true)
      expect(beap.peek()).toBeUndefined()
    })

    it('correctly sorts with negative values', () => {
      const beap = new Beap2<number>()
      beap.insert(-5)
      beap.insert(3)
      beap.insert(-1)
      beap.insert(0)
      beap.insert(-3)
      const sorted: number[] = []
      while (!beap.isEmpty()) sorted.push(beap.extractMin()!)
      expect(sorted).toEqual([-5, -3, -1, 0, 3])
    })
  })
})
