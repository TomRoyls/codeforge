import { describe, it, expect } from 'vitest'
import { DAryHeap4 } from '../src/core/d-ary-heap-4/index.js'

describe('DAryHeap4', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const h = new DAryHeap4<number>()
      expect(h.isEmpty).toBe(true)
      expect(h.size).toBe(0)
    })

    it('accepts custom comparator for min-heap', () => {
      const h = new DAryHeap4<number>((a, b) => b - a)
      h.insert(3)
      h.insert(1)
      h.insert(5)
      expect(h.peek()).toBe(1)
    })
  })

  describe('insert and extract', () => {
    it('inserts and extracts max', () => {
      const h = new DAryHeap4<number>()
      h.insert(3)
      h.insert(1)
      h.insert(5)
      expect(h.extract()).toBe(5)
      expect(h.extract()).toBe(3)
      expect(h.extract()).toBe(1)
    })

    it('returns undefined for empty extract', () => {
      expect(new DAryHeap4<number>().extract()).toBeUndefined()
    })

    it('handles single element', () => {
      const h = new DAryHeap4<number>()
      h.insert(42)
      expect(h.peek()).toBe(42)
      expect(h.extract()).toBe(42)
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns max without removing', () => {
      const h = new DAryHeap4<number>()
      h.insert(10)
      h.insert(20)
      expect(h.peek()).toBe(20)
      expect(h.size).toBe(2)
    })

    it('returns undefined for empty', () => {
      expect(new DAryHeap4<number>().peek()).toBeUndefined()
    })
  })

  describe('heapify', () => {
    it('heapifies an array', () => {
      const h = new DAryHeap4<number>()
      h.heapify([3, 1, 5, 2, 4])
      expect(h.extract()).toBe(5)
      expect(h.extract()).toBe(4)
      expect(h.extract()).toBe(3)
    })
  })

  describe('contains', () => {
    it('finds contained value', () => {
      const h = new DAryHeap4<number>()
      h.insert(42)
      expect(h.contains(42)).toBe(true)
    })

    it('does not find missing value', () => {
      const h = new DAryHeap4<number>()
      h.insert(42)
      expect(h.contains(99)).toBe(false)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const a = new DAryHeap4<number>()
      a.insert(5)
      a.insert(1)
      const b = new DAryHeap4<number>()
      b.insert(3)
      b.insert(7)
      const merged = a.merge(b)
      expect(merged.size).toBe(4)
      expect(merged.extract()).toBe(7)
    })

    it('does not modify original heaps', () => {
      const a = new DAryHeap4<number>()
      a.insert(5)
      const b = new DAryHeap4<number>()
      b.insert(3)
      a.merge(b)
      expect(a.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const h = new DAryHeap4<number>()
      h.insert(1)
      h.insert(2)
      h.clear()
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('update', () => {
    it('updates value and rebalances', () => {
      const h = new DAryHeap4<number>()
      h.heapify([1, 2, 3, 4, 5])
      h.update(0, 10)
      expect(h.peek()).toBe(10)
    })

    it('ignores invalid index', () => {
      const h = new DAryHeap4<number>()
      h.insert(1)
      h.update(-1, 99)
      h.update(5, 99)
      expect(h.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns copy of heap array', () => {
      const h = new DAryHeap4<number>()
      h.insert(1)
      h.insert(2)
      const arr = h.toArray()
      expect(arr.length).toBe(2)
      arr.push(99)
      expect(h.size).toBe(2)
    })
  })

  describe('stress test', () => {
    it('extracts all elements in sorted order', () => {
      const h = new DAryHeap4<number>()
      for (let i = 0; i < 100; i++) h.insert(i)
      let prev = h.extract()!
      while (h.size > 0) {
        const curr = h.extract()!
        expect(curr).toBeLessThan(prev)
        prev = curr
      }
    })
  })
})
