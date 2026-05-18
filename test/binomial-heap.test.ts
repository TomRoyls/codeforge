import { describe, it, expect } from 'vitest'
import { BinomialHeap } from '../src/core/binomial-heap/binomial-heap.js'

describe('BinomialHeap', () => {
  describe('constructor', () => {
    it('should create an empty heap with no options', () => {
      const h = new BinomialHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should create an empty heap with empty options', () => {
      const h = new BinomialHeap<number>({})
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator for max-heap behavior', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      expect(h.peek()).toBe(5)
    })

    it('should accept a custom comparator for string sorting', () => {
      const h = new BinomialHeap<string>({ comparator: (a, b) => (a as string).localeCompare(b as string) })
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.peek()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      const h = new BinomialHeap<number>()
      h.insert(42)
      expect(h.size()).toBe(1)
      expect(h.isEmpty()).toBe(false)
      expect(h.peek()).toBe(42)
    })

    it('should insert multiple elements and maintain min at root', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      h.insert(1)
      h.insert(9)
      expect(h.peek()).toBe(1)
      expect(h.size()).toBe(5)
    })

    it('should handle duplicate values', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(5)
      h.insert(5)
      expect(h.size()).toBe(3)
      expect(h.peek()).toBe(5)
    })

    it('should handle negative numbers', () => {
      const h = new BinomialHeap<number>()
      h.insert(-3)
      h.insert(-1)
      h.insert(-7)
      expect(h.peek()).toBe(-7)
    })

    it('should maintain valid heap structure after many inserts', () => {
      const h = new BinomialHeap<number>()
      for (let i = 20; i >= 1; i--) {
        h.insert(i)
      }
      expect(h.size()).toBe(20)
      expect(h.isValid()).toBe(true)
      expect(h.peek()).toBe(1)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.peek()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      const h = new BinomialHeap<number>()
      h.insert(10)
      h.insert(5)
      h.insert(15)
      expect(h.peek()).toBe(5)
      expect(h.size()).toBe(3)
      expect(h.peek()).toBe(5)
    })

    it('should track the minimum after insertions in any order', () => {
      const h = new BinomialHeap<number>()
      h.insert(100)
      expect(h.peek()).toBe(100)
      h.insert(50)
      expect(h.peek()).toBe(50)
      h.insert(200)
      expect(h.peek()).toBe(50)
      h.insert(25)
      expect(h.peek()).toBe(25)
    })
  })

  describe('extractMin', () => {
    it('should return undefined on empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.extractMin()).toBeUndefined()
    })

    it('should extract the single element', () => {
      const h = new BinomialHeap<number>()
      h.insert(42)
      expect(h.extractMin()).toBe(42)
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should extract elements in ascending order', () => {
      const h = new BinomialHeap<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) h.insert(v)
      const extracted: number[] = []
      while (!h.isEmpty()) {
        extracted.push(h.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should maintain valid heap structure after extractions', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 16; i++) h.insert(i)
      for (let i = 0; i < 8; i++) h.extractMin()
      expect(h.isValid()).toBe(true)
      expect(h.size()).toBe(8)
    })

    it('should handle extract from heap with many elements', () => {
      const h = new BinomialHeap<number>()
      const n = 100
      for (let i = n; i >= 1; i--) h.insert(i)
      for (let i = 1; i <= n; i++) {
        expect(h.extractMin()).toBe(i)
      }
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge an empty heap into a non-empty one', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1)
      h1.insert(3)
      const h2 = new BinomialHeap<number>()
      h1.merge(h2)
      expect(h1.size()).toBe(2)
      expect(h2.size()).toBe(0)
    })

    it('should merge a non-empty heap into an empty one', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      h2.insert(5)
      h2.insert(10)
      h1.merge(h2)
      expect(h1.size()).toBe(2)
      expect(h1.peek()).toBe(5)
      expect(h2.isEmpty()).toBe(true)
    })

    it('should merge two non-empty heaps', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1)
      h1.insert(5)
      h1.insert(9)
      const h2 = new BinomialHeap<number>()
      h2.insert(2)
      h2.insert(6)
      h2.insert(10)
      h1.merge(h2)
      expect(h1.size()).toBe(6)
      expect(h2.size()).toBe(0)
      expect(h1.peek()).toBe(1)
      expect(h1.isValid()).toBe(true)
    })

    it('should clear the merged heap after merge', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1)
      const h2 = new BinomialHeap<number>()
      h2.insert(2)
      h2.insert(3)
      h1.merge(h2)
      expect(h2.isEmpty()).toBe(true)
      expect(h2.peek()).toBeUndefined()
    })

    it('should extract in correct order after merge', () => {
      const h1 = new BinomialHeap<number>()
      for (let i = 0; i < 5; i++) h1.insert(i * 2) // 0,2,4,6,8
      const h2 = new BinomialHeap<number>()
      for (let i = 0; i < 5; i++) h2.insert(i * 2 + 1) // 1,3,5,7,9
      h1.merge(h2)
      const result: number[] = []
      while (!h1.isEmpty()) result.push(h1.extractMin()!)
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should merge heaps of different sizes', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(10)
      const h2 = new BinomialHeap<number>()
      for (let i = 0; i < 15; i++) h2.insert(i)
      h1.merge(h2)
      expect(h1.size()).toBe(16)
      expect(h1.peek()).toBe(0)
      expect(h1.isValid()).toBe(true)
    })

    it('should handle merging two empty heaps', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      h1.merge(h2)
      expect(h1.isEmpty()).toBe(true)
      expect(h2.isEmpty()).toBe(true)
    })

    it('should produce valid binomial heap after merge', () => {
      const h1 = new BinomialHeap<number>()
      for (let i = 1; i <= 7; i++) h1.insert(i)
      const h2 = new BinomialHeap<number>()
      for (let i = 8; i <= 15; i++) h2.insert(i)
      h1.merge(h2)
      expect(h1.isValid()).toBe(true)
      expect(h1.size()).toBe(15)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size through insertions', () => {
      const h = new BinomialHeap<number>()
      expect(h.size()).toBe(0)
      h.insert(1)
      expect(h.size()).toBe(1)
      h.insert(2)
      expect(h.size()).toBe(2)
    })

    it('should track size through extractions', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.extractMin()
      expect(h.size()).toBe(2)
      h.extractMin()
      expect(h.size()).toBe(1)
      h.extractMin()
      expect(h.size()).toBe(0)
    })

    it('should reflect isEmpty correctly', () => {
      const h = new BinomialHeap<number>()
      expect(h.isEmpty()).toBe(true)
      h.insert(1)
      expect(h.isEmpty()).toBe(false)
      h.extractMin()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty heap', () => {
      const h = new BinomialHeap<number>()
      h.clear()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should clear a non-empty heap', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.clear()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
      expect(h.peek()).toBeUndefined()
    })

    it('should allow reuse after clearing', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.clear()
      h.insert(10)
      h.insert(3)
      expect(h.size()).toBe(2)
      expect(h.peek()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('should return all inserted values', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const arr = h.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
    })

    it('should include duplicate values', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(1)
      h.insert(2)
      const arr = h.toArray()
      expect(arr.sort()).toEqual([1, 1, 2])
    })

    it('should not modify the heap', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(3)
      h.toArray()
      expect(h.size()).toBe(2)
      expect(h.peek()).toBe(3)
    })
  })

  describe('contains', () => {
    it('should return false for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('should find an existing element', () => {
      const h = new BinomialHeap<number>()
      h.insert(42)
      expect(h.contains(42)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.contains(99)).toBe(false)
    })

    it('should find elements among many', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 20; i++) h.insert(i)
      expect(h.contains(0)).toBe(true)
      expect(h.contains(10)).toBe(true)
      expect(h.contains(19)).toBe(true)
      expect(h.contains(20)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone an empty heap', () => {
      const h = new BinomialHeap<number>()
      const c = h.clone()
      expect(c.size()).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone a non-empty heap with same values', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      const c = h.clone()
      expect(c.size()).toBe(3)
      expect(c.peek()).toBe(3)
      const original = h.toArray().sort()
      const cloned = c.toArray().sort()
      expect(cloned).toEqual(original)
    })

    it('should produce an independent copy', () => {
      const h = new BinomialHeap<number>()
      h.insert(10)
      h.insert(20)
      const c = h.clone()
      h.extractMin()
      expect(h.size()).toBe(1)
      expect(c.size()).toBe(2)
    })

    it('should produce a valid binomial heap', () => {
      const h = new BinomialHeap<number>()
      for (let i = 10; i >= 1; i--) h.insert(i)
      const c = h.clone()
      expect(c.isValid()).toBe(true)
    })
  })

  describe('isValid', () => {
    it('should return true for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.isValid()).toBe(true)
    })

    it('should return true after inserts', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 8; i++) h.insert(i)
      expect(h.isValid()).toBe(true)
    })

    it('should return true after extractions', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 16; i++) h.insert(i)
      for (let i = 0; i < 4; i++) h.extractMin()
      expect(h.isValid()).toBe(true)
    })

    it('should return true after merge', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      for (let i = 0; i < 4; i++) h1.insert(i)
      for (let i = 4; i < 8; i++) h2.insert(i)
      h1.merge(h2)
      expect(h1.isValid()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('should return false when decreasing to a larger value', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(5, 10)).toBe(false)
    })

    it('should return true when decreasing to an equal value (no-op)', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(5, 5)).toBe(true)
      expect(h.peek()).toBe(5)
    })

    it('should return false when the old value is not found', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(99, 1)).toBe(false)
    })

    it('should decrease a key and maintain heap property', () => {
      const h = new BinomialHeap<number>()
      h.insert(10)
      h.insert(20)
      h.insert(30)
      expect(h.decreaseKey(20, 5)).toBe(true)
      expect(h.peek()).toBe(5)
      expect(h.isValid()).toBe(true)
    })

    it('should bubble up after decreaseKey', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(10)
      h.insert(20)
      h.insert(30)
      h.decreaseKey(30, 0)
      expect(h.peek()).toBe(0)
    })

    it('should return true on successful decrease', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(10)
      expect(h.decreaseKey(10, 3)).toBe(true)
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('should extract in descending order with max-heap comparator', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      h.insert(2)
      h.insert(4)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual([5, 4, 3, 2, 1])
    })

    it('should peek the maximum element', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h.insert(1)
      h.insert(10)
      h.insert(5)
      expect(h.peek()).toBe(10)
    })

    it('should merge correctly with max-heap comparator', () => {
      const h1 = new BinomialHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h1.insert(10)
      h1.insert(20)
      const h2 = new BinomialHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h2.insert(15)
      h2.insert(5)
      h1.merge(h2)
      expect(h1.size()).toBe(4)
      expect(h1.peek()).toBe(20)
      expect(h2.isEmpty()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle inserting zero', () => {
      const h = new BinomialHeap<number>()
      h.insert(0)
      expect(h.peek()).toBe(0)
      expect(h.extractMin()).toBe(0)
    })

    it('should handle inserting negative and positive numbers', () => {
      const h = new BinomialHeap<number>()
      h.insert(-5)
      h.insert(0)
      h.insert(5)
      expect(h.extractMin()).toBe(-5)
      expect(h.extractMin()).toBe(0)
      expect(h.extractMin()).toBe(5)
    })

    it('should handle inserting in reverse sorted order', () => {
      const h = new BinomialHeap<number>()
      for (let i = 100; i >= 1; i--) h.insert(i)
      expect(h.peek()).toBe(1)
      expect(h.isValid()).toBe(true)
    })

    it('should handle inserting in sorted order', () => {
      const h = new BinomialHeap<number>()
      for (let i = 1; i <= 100; i++) h.insert(i)
      expect(h.peek()).toBe(1)
      expect(h.isValid()).toBe(true)
    })

    it('should handle interleaved insert and extract', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(3)
      expect(h.extractMin()).toBe(3)
      h.insert(1)
      h.insert(7)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(5)
      expect(h.extractMin()).toBe(7)
      expect(h.isEmpty()).toBe(true)
    })

    it('should handle merge followed by extract sequence', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(3)
      h1.insert(7)
      const h2 = new BinomialHeap<number>()
      h2.insert(1)
      h2.insert(5)
      h1.merge(h2)
      expect(h1.extractMin()).toBe(1)
      expect(h1.extractMin()).toBe(3)
      expect(h1.extractMin()).toBe(5)
      expect(h1.extractMin()).toBe(7)
    })

    it('should handle objects with custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const h = new BinomialHeap<Item>({
        comparator: (a, b) => (a as Item).priority - (b as Item).priority,
      })
      h.insert({ priority: 3, name: 'c' })
      h.insert({ priority: 1, name: 'a' })
      h.insert({ priority: 2, name: 'b' })
      expect(h.peek()!.name).toBe('a')
      expect(h.extractMin()!.name).toBe('a')
      expect(h.extractMin()!.name).toBe('b')
    })

    it('should handle power-of-2 element counts', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 16; i++) h.insert(i)
      expect(h.isValid()).toBe(true)
      expect(h.size()).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(h.extractMin()).toBe(i)
      }
    })

    it('should handle repeated clear and reuse', () => {
      const h = new BinomialHeap<number>()
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 5; i++) h.insert(i)
        expect(h.size()).toBe(5)
        h.clear()
        expect(h.isEmpty()).toBe(true)
      }
    })
  })

  describe('binomial tree structure properties', () => {
    it('should maintain valid structure after sequential inserts of powers of 2 minus 1', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 7; i++) h.insert(i)
      expect(h.isValid()).toBe(true)
      expect(h.size()).toBe(7)
    })

    it('should maintain valid structure with 2^k elements forming optimal tree', () => {
      const h = new BinomialHeap<number>()
      for (let i = 1; i <= 8; i++) h.insert(i)
      expect(h.isValid()).toBe(true)
      expect(h.size()).toBe(8)
    })

    it('should produce correctly sorted output for random-like input', () => {
      const h = new BinomialHeap<number>()
      const input = [17, 3, 25, 1, 8, 14, 22, 6, 19, 11, 4, 28, 9, 2, 16]
      for (const v of input) h.insert(v)
      const sorted = [...input].sort((a, b) => a - b)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual(sorted)
    })

    it('should handle merge preserving all elements', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      const h3 = new BinomialHeap<number>()
      for (let i = 0; i < 10; i++) h1.insert(i)
      for (let i = 10; i < 20; i++) h2.insert(i)
      for (let i = 20; i < 30; i++) h3.insert(i)
      h1.merge(h2)
      h1.merge(h3)
      expect(h1.size()).toBe(30)
      for (let i = 0; i < 30; i++) {
        expect(h1.extractMin()).toBe(i)
      }
    })
  })
})
