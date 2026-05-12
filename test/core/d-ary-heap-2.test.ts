import { describe, it, expect } from 'vitest'
import { DAryHeap } from '../../src/core/d-ary-heap-2/index.js'

describe('DAryHeap', () => {
  describe('constructor (default d=4)', () => {
    it('creates empty heap with defaults', () => {
      const h = new DAryHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const h = new DAryHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.peek()).toBe(3)
    })

    it('creates heap with default comparator (min-heap)', () => {
      const h = new DAryHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      expect(h.peek()).toBe(1)
    })
  })

  describe('constructor with d=2 (binary heap)', () => {
    it('creates empty binary heap', () => {
      const h = new DAryHeap<number>({ d: 2 })
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('maintains heap property with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      expect(h.peek()).toBe(3)
    })

    it('pops in sorted order with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      for (let i = 10; i >= 0; i--) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('constructor with d=3 (ternary heap)', () => {
    it('creates empty ternary heap', () => {
      const h = new DAryHeap<number>({ d: 3 })
      expect(h.size).toBe(0)
    })

    it('maintains heap property with d=3', () => {
      const h = new DAryHeap<number>({ d: 3 })
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      expect(h.peek()).toBe(3)
    })

    it('pops in sorted order with d=3', () => {
      const h = new DAryHeap<number>({ d: 3 })
      for (let i = 20; i >= 0; i--) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i + 1]!).toBeGreaterThanOrEqual(result[i]!)
      }
    })
  })

  describe('constructor with d=8', () => {
    it('creates heap with d=8', () => {
      const h = new DAryHeap<number>({ d: 8 })
      expect(h.size).toBe(0)
    })

    it('pops in sorted order with d=8', () => {
      const h = new DAryHeap<number>({ d: 8 })
      for (let i = 50; i >= 0; i--) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i + 1]!).toBeGreaterThanOrEqual(result[i]!)
      }
    })

    it('maintains heap property with d=8', () => {
      const h = new DAryHeap<number>({ d: 8 })
      const values = [50, 30, 70, 10, 90, 20, 80, 40, 60, 5, 95, 15]
      for (const v of values) h.push(v)
      expect(h.peek()).toBe(5)
    })
  })

  describe('constructor d validation', () => {
    it('clamps d < 2 to 2', () => {
      const h = new DAryHeap<number>({ d: 1 })
      h.push(3)
      h.push(1)
      h.push(2)
      expect(h.peek()).toBe(1)
      expect(h.stats().d).toBe(2)
    })

    it('clamps d=0 to 2', () => {
      const h = new DAryHeap<number>({ d: 0 })
      expect(h.stats().d).toBe(2)
    })

    it('clamps negative d to 2', () => {
      const h = new DAryHeap<number>({ d: -5 })
      expect(h.stats().d).toBe(2)
    })
  })

  describe('push', () => {
    it('adds single element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      expect(h.size).toBe(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.size).toBe(3)
    })

    it('maintains min at root after pushes', () => {
      const h = new DAryHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      expect(h.peek()).toBe(3)
    })

    it('handles equal elements', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(5)
      h.push(5)
      expect(h.peek()).toBe(5)
      expect(h.size).toBe(3)
    })

    it('works with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      expect(h.peek()).toBe(1)
    })

    it('works with d=3', () => {
      const h = new DAryHeap<number>({ d: 3 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      expect(h.peek()).toBe(1)
    })

    it('works with d=4', () => {
      const h = new DAryHeap<number>({ d: 4 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      expect(h.peek()).toBe(1)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.peek()).toBeUndefined()
    })

    it('returns single element', () => {
      const h = new DAryHeap<number>()
      h.push(42)
      expect(h.peek()).toBe(42)
    })

    it('returns minimum without removing', () => {
      const h = new DAryHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      expect(h.peek()).toBe(5)
      expect(h.size).toBe(3)
    })

    it('does not modify heap', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      const before = h.size
      h.peek()
      expect(h.size).toBe(before)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.pop()).toBeUndefined()
    })

    it('removes and returns single element', () => {
      const h = new DAryHeap<number>()
      h.push(42)
      expect(h.pop()).toBe(42)
      expect(h.size).toBe(0)
    })

    it('removes elements in ascending order (min-heap)', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('maintains heap property after removal', () => {
      const h = new DAryHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.pop()
      expect(h.peek()).toBe(5)
    })

    it('handles duplicates', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(5)
      h.push(3)
      h.push(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(5)
    })

    it('works correctly with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('works correctly with d=3', () => {
      const h = new DAryHeap<number>({ d: 3 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('works correctly with d=8', () => {
      const h = new DAryHeap<number>({ d: 8 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([1, 3, 5, 7, 9])
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const h = new DAryHeap<number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('returns true after all elements popped', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.pop()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(2)
      h.clear()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const h = new DAryHeap<number>()
      expect(h.size).toBe(0)
    })

    it('increments on push', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.size).toBe(3)
    })

    it('decrements on pop', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(2)
      h.pop()
      expect(h.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears empty heap', () => {
      const h = new DAryHeap<number>()
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('clears populated heap', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
      expect(h.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.clear()
      h.push(2)
      expect(h.peek()).toBe(2)
      expect(h.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('returns internal array representation', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      expect(h.toArray()).toEqual([1])
    })

    it('returns copy of internal array', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(2)
      const arr = h.toArray()
      arr.push(999)
      expect(h.size).toBe(2)
    })
  })

  describe('contains', () => {
    it('returns false on empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('returns true when element exists', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.contains(5)).toBe(true)
      expect(h.contains(3)).toBe(true)
      expect(h.contains(7)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.contains(99)).toBe(false)
    })

    it('uses comparator for equality', () => {
      const h = new DAryHeap<string>()
      h.push('hello')
      h.push('world')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('HELLO')).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false on empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.remove(1)).toBe(false)
    })

    it('removes existing element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(2)
      expect(h.contains(5)).toBe(false)
    })

    it('returns false for non-existent element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.remove(99)).toBe(false)
      expect(h.size).toBe(2)
    })

    it('removes root element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(3)).toBe(true)
      expect(h.peek()).toBe(5)
    })

    it('removes last element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(7)).toBe(true)
      expect(h.size).toBe(2)
    })

    it('removes only first occurrence of duplicate', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(5)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(1)
      expect(h.contains(5)).toBe(true)
    })

    it('removes single element leaving empty heap', () => {
      const h = new DAryHeap<number>()
      h.push(42)
      expect(h.remove(42)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })

    it('maintains heap property after removal with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.push(8)
      h.remove(10)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('maintains heap property after removal with d=4', () => {
      const h = new DAryHeap<number>({ d: 4 })
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.push(8)
      h.remove(10)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })
  })

  describe('replace', () => {
    it('returns undefined and adds value to empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.replace(5)).toBeUndefined()
      expect(h.size).toBe(1)
      expect(h.peek()).toBe(5)
    })

    it('replaces root and returns old root', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(3)
      h.push(5)
      const old = h.replace(2)
      expect(old).toBe(1)
      expect(h.peek()).toBe(2)
      expect(h.size).toBe(3)
    })

    it('maintains heap property after replace', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(3)
      h.push(5)
      h.replace(10)
      expect(h.peek()).toBe(3)
    })

    it('replace with smaller value bubbles up', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(10)
      h.push(15)
      h.replace(1)
      expect(h.peek()).toBe(1)
    })

    it('replace with larger value trickles down', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(5)
      h.push(10)
      h.replace(20)
      expect(h.peek()).toBe(5)
    })

    it('works with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      h.push(1)
      h.push(5)
      h.push(10)
      const old = h.replace(3)
      expect(old).toBe(1)
      expect(h.peek()).toBe(3)
    })
  })

  describe('update', () => {
    it('returns false on empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.update(1, 2)).toBe(false)
    })

    it('updates existing element to smaller value', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(10)
      h.push(15)
      expect(h.update(10, 1)).toBe(true)
      expect(h.peek()).toBe(1)
    })

    it('updates existing element to larger value', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(10)
      h.push(15)
      expect(h.update(5, 20)).toBe(true)
      expect(h.peek()).toBe(10)
    })

    it('updates existing element to same value', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(10)
      expect(h.update(5, 5)).toBe(true)
      expect(h.peek()).toBe(5)
      expect(h.size).toBe(2)
    })

    it('returns false for non-existent element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(10)
      expect(h.update(99, 1)).toBe(false)
    })

    it('maintains heap property after update with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      h.push(10)
      h.push(20)
      h.push(30)
      h.push(5)
      h.update(30, 1)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([1, 5, 10, 20])
    })

    it('maintains heap property after update with d=3', () => {
      const h = new DAryHeap<number>({ d: 3 })
      h.push(10)
      h.push(20)
      h.push(30)
      h.push(5)
      h.update(5, 50)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([10, 20, 30, 50])
    })

    it('maintains heap property after update with d=8', () => {
      const h = new DAryHeap<number>({ d: 8 })
      h.push(10)
      h.push(20)
      h.push(30)
      h.push(5)
      h.update(20, 2)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([2, 5, 10, 30])
    })
  })

  describe('static from', () => {
    it('creates heap from array', () => {
      const h = DAryHeap.from([5, 3, 7, 1, 9])
      expect(h.size).toBe(5)
      expect(h.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const h = DAryHeap.from([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const h = DAryHeap.from([5, 3, 7], { comparator: (a, b) => b - a })
      expect(h.peek()).toBe(7)
    })

    it('creates heap with custom d', () => {
      const h = DAryHeap.from([5, 3, 7, 1, 9], { d: 2 })
      expect(h.peek()).toBe(1)
      expect(h.stats().d).toBe(2)
    })

    it('creates independent heap from array', () => {
      const arr = [1, 2, 3]
      const h = DAryHeap.from(arr)
      arr.push(4)
      expect(h.size).toBe(3)
    })

    it('handles single element array', () => {
      const h = DAryHeap.from([42])
      expect(h.peek()).toBe(42)
    })

    it('pops all elements in sorted order', () => {
      const h = DAryHeap.from([5, 3, 7, 1, 9, 2, 8, 4, 6])
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty heap', () => {
      const h = new DAryHeap<number>()
      expect(h.stats()).toEqual({ size: 0, height: 0, d: 4 })
    })

    it('returns correct stats for single element', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      expect(h.stats()).toEqual({ size: 1, height: 1, d: 4 })
    })

    it('returns correct d value', () => {
      const h = new DAryHeap<number>({ d: 3 })
      expect(h.stats().d).toBe(3)
    })

    it('returns correct stats for multiple elements', () => {
      const h = new DAryHeap<number>({ d: 2 })
      for (let i = 0; i < 7; i++) h.push(i)
      const s = h.stats()
      expect(s.size).toBe(7)
      expect(s.height).toBe(3)
      expect(s.d).toBe(2)
    })

    it('computes height correctly for d=4', () => {
      const h = new DAryHeap<number>({ d: 4 })
      for (let i = 0; i < 5; i++) h.push(i)
      const s = h.stats()
      expect(s.height).toBe(2)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const h = DAryHeap.from([5, 3, 7, 1, 9])
      const c = h.clone()
      expect(c.size).toBe(h.size)
      expect(c.peek()).toBe(h.peek())
      h.pop()
      expect(c.size).toBe(5)
      expect(h.size).toBe(4)
    })

    it('clones empty heap', () => {
      const h = new DAryHeap<number>()
      const c = h.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('preserves d value', () => {
      const h = new DAryHeap<number>({ d: 3 })
      h.push(1)
      const c = h.clone()
      expect(c.stats().d).toBe(3)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = DAryHeap.from([1, 3, 5])
      const h2 = DAryHeap.from([2, 4, 6])
      h1.merge(h2)
      expect(h1.size).toBe(6)
      expect(h1.peek()).toBe(1)
    })

    it('merges with empty heap', () => {
      const h1 = DAryHeap.from([1, 2, 3])
      const h2 = new DAryHeap<number>()
      h1.merge(h2)
      expect(h1.size).toBe(3)
    })

    it('merges into empty heap', () => {
      const h1 = new DAryHeap<number>()
      const h2 = DAryHeap.from([1, 2, 3])
      h1.merge(h2)
      expect(h1.size).toBe(3)
    })

    it('merges and maintains sorted order', () => {
      const h1 = DAryHeap.from([1, 5, 9])
      const h2 = DAryHeap.from([2, 6, 10])
      h1.merge(h2)
      const result: number[] = []
      while (!h1.isEmpty()) result.push(h1.pop()!)
      expect(result).toEqual([1, 2, 5, 6, 9, 10])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const h = DAryHeap.from([3, 1, 2])
      const result: number[] = []
      for (const v of h) result.push(v)
      expect(result.length).toBe(3)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const h = DAryHeap.from([3, 1, 2])
      expect([...h].sort()).toEqual([1, 2, 3])
    })

    it('iterates empty heap', () => {
      const h = new DAryHeap<number>()
      const result: number[] = []
      for (const v of h) result.push(v)
      expect(result).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      expect(h.peek()).toBe(1)
      expect(h.pop()).toBe(1)
      expect(h.isEmpty()).toBe(true)
    })

    it('handles two elements', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.peek()).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
    })

    it('handles negative numbers', () => {
      const h = new DAryHeap<number>()
      h.push(-5)
      h.push(-3)
      h.push(-7)
      h.push(-1)
      expect(h.peek()).toBe(-7)
    })

    it('handles mixed positive and negative', () => {
      const h = new DAryHeap<number>()
      h.push(-5)
      h.push(3)
      h.push(-7)
      h.push(1)
      expect(h.peek()).toBe(-7)
    })

    it('handles zero', () => {
      const h = new DAryHeap<number>()
      h.push(0)
      h.push(-1)
      h.push(1)
      expect(h.peek()).toBe(-1)
    })

    it('handles floating point numbers', () => {
      const h = new DAryHeap<number>()
      h.push(1.5)
      h.push(0.3)
      h.push(2.7)
      expect(h.peek()).toBeCloseTo(0.3)
    })

    it('handles all identical elements', () => {
      const h = new DAryHeap<number>()
      for (let i = 0; i < 10; i++) h.push(42)
      expect(h.peek()).toBe(42)
      for (let i = 0; i < 10; i++) {
        expect(h.pop()).toBe(42)
      }
    })
  })

  describe('duplicates', () => {
    it('handles duplicate min values', () => {
      const h = new DAryHeap<number>()
      h.push(1)
      h.push(1)
      h.push(5)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(5)
    })

    it('handles all duplicates', () => {
      const h = new DAryHeap<number>()
      h.push(3)
      h.push(3)
      h.push(3)
      expect(h.size).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
    })
  })

  describe('large batches', () => {
    it('handles 100 elements with d=2', () => {
      const h = new DAryHeap<number>({ d: 2 })
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles 100 elements with d=3', () => {
      const h = new DAryHeap<number>({ d: 3 })
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles 100 elements with d=4', () => {
      const h = new DAryHeap<number>({ d: 4 })
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles 100 elements with d=8', () => {
      const h = new DAryHeap<number>({ d: 8 })
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles 1000 elements', () => {
      const h = new DAryHeap<number>()
      for (let i = 0; i < 1000; i++) h.push(Math.random())
      let prev = h.pop()!
      while (!h.isEmpty()) {
        const curr = h.pop()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('handles reverse-inserted elements', () => {
      const h = new DAryHeap<number>()
      for (let i = 100; i >= 0; i--) h.push(i)
      expect(h.peek()).toBe(0)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i <= 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles random order elements', () => {
      const h = new DAryHeap<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!]
      }
      for (const v of arr) h.push(v)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('string elements', () => {
    it('works with string values', () => {
      const h = new DAryHeap<string>()
      h.push('cherry')
      h.push('apple')
      h.push('banana')
      expect(h.peek()).toBe('apple')
    })

    it('sorts strings correctly', () => {
      const h = DAryHeap.from(['delta', 'alpha', 'charlie', 'bravo'])
      expect(h.pop()).toBe('alpha')
      expect(h.pop()).toBe('bravo')
      expect(h.pop()).toBe('charlie')
      expect(h.pop()).toBe('delta')
    })
  })

  describe('object elements with custom comparator', () => {
    it('works with objects', () => {
      const h = new DAryHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority
      })
      h.push({ priority: 3 })
      h.push({ priority: 1 })
      h.push({ priority: 2 })
      expect(h.peek()!.priority).toBe(1)
    })

    it('pops objects in priority order', () => {
      const h = new DAryHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority
      })
      h.push({ priority: 3 })
      h.push({ priority: 1 })
      h.push({ priority: 2 })
      expect(h.pop()!.priority).toBe(1)
      expect(h.pop()!.priority).toBe(2)
      expect(h.pop()!.priority).toBe(3)
    })
  })

  describe('descending comparator (max-heap)', () => {
    it('treats larger values as priority', () => {
      const h = new DAryHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.peek()).toBe(5)
    })

    it('pops in descending order', () => {
      const h = new DAryHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(1)
    })

    it('works with d=2 and descending comparator', () => {
      const h = new DAryHeap<number>({ d: 2, comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      h.push(2)
      h.push(4)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('heap property validation', () => {
    it('maintains heap invariant after many operations', () => {
      const h = new DAryHeap<number>()
      const values = [50, 30, 70, 10, 90, 20, 80, 40, 60]
      for (const v of values) h.push(v)
      while (!h.isEmpty()) {
        const top = h.peek()!
        const popped = h.pop()!
        expect(top).toBe(popped)
      }
    })

    it('maintains invariant with alternating push and pop', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      h.pop()
      h.push(7)
      h.push(1)
      h.pop()
      h.push(9)
      h.push(2)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('handles remove then push sequence', () => {
      const h = DAryHeap.from([10, 20, 30, 40, 50])
      h.remove(30)
      h.push(25)
      h.push(35)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([10, 20, 25, 35, 40, 50])
    })
  })

  describe('interleaved operations', () => {
    it('push and pop interleaved', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.pop()).toBe(3)
      h.push(1)
      h.push(7)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(7)
      expect(h.isEmpty()).toBe(true)
    })

    it('clear and reuse multiple times', () => {
      const h = new DAryHeap<number>()
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 10; i++) h.push(i * (round + 1))
        expect(h.size).toBe(10)
        h.clear()
        expect(h.isEmpty()).toBe(true)
      }
    })
  })

  describe('replace edge cases', () => {
    it('replace on heap with one element', () => {
      const h = new DAryHeap<number>()
      h.push(5)
      const old = h.replace(10)
      expect(old).toBe(5)
      expect(h.peek()).toBe(10)
      expect(h.size).toBe(1)
    })

    it('replace then pop gives sorted order', () => {
      const h = DAryHeap.from([1, 3, 5, 7, 9])
      h.replace(4)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual([3, 4, 5, 7, 9])
    })
  })

  describe('update edge cases', () => {
    it('update root to smaller value', () => {
      const h = DAryHeap.from([5, 10, 15])
      h.update(5, 1)
      expect(h.peek()).toBe(1)
    })

    it('update root to larger value', () => {
      const h = DAryHeap.from([5, 10, 15])
      h.update(5, 20)
      expect(h.peek()).toBe(10)
    })

    it('update leaf to smaller value', () => {
      const h = DAryHeap.from([1, 5, 10])
      h.update(10, 0)
      expect(h.peek()).toBe(0)
    })

    it('update leaf to larger value', () => {
      const h = DAryHeap.from([1, 5, 10])
      h.update(1, 20)
      expect(h.peek()).toBe(5)
    })
  })

  describe('mixed d values stress test', () => {
    it('d=2 handles 200 random operations', () => {
      const h = new DAryHeap<number>({ d: 2 })
      const reference: number[] = []
      for (let i = 0; i < 100; i++) {
        const v = Math.floor(Math.random() * 1000)
        h.push(v)
        reference.push(v)
      }
      reference.sort((a, b) => a - b)
      for (let i = 0; i < 100; i++) {
        expect(h.pop()).toBe(reference[i])
      }
    })

    it('d=3 handles 200 random operations', () => {
      const h = new DAryHeap<number>({ d: 3 })
      const reference: number[] = []
      for (let i = 0; i < 100; i++) {
        const v = Math.floor(Math.random() * 1000)
        h.push(v)
        reference.push(v)
      }
      reference.sort((a, b) => a - b)
      for (let i = 0; i < 100; i++) {
        expect(h.pop()).toBe(reference[i])
      }
    })

    it('d=4 handles 200 random operations', () => {
      const h = new DAryHeap<number>({ d: 4 })
      const reference: number[] = []
      for (let i = 0; i < 100; i++) {
        const v = Math.floor(Math.random() * 1000)
        h.push(v)
        reference.push(v)
      }
      reference.sort((a, b) => a - b)
      for (let i = 0; i < 100; i++) {
        expect(h.pop()).toBe(reference[i])
      }
    })

    it('d=8 handles 200 random operations', () => {
      const h = new DAryHeap<number>({ d: 8 })
      const reference: number[] = []
      for (let i = 0; i < 100; i++) {
        const v = Math.floor(Math.random() * 1000)
        h.push(v)
        reference.push(v)
      }
      reference.sort((a, b) => a - b)
      for (let i = 0; i < 100; i++) {
        expect(h.pop()).toBe(reference[i])
      }
    })
  })
})
