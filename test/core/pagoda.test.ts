import { describe, it, expect, beforeEach } from 'vitest'
import { Pagoda } from '../../src/core/pagoda/index.js'
import type { PagodaOptions } from '../../src/core/pagoda/types.js'

describe('Pagoda', () => {
  describe('constructor', () => {
    it('should create an empty pagoda with default options', () => {
      const pq = new Pagoda<number>()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should create a pagoda with custom comparator (max-heap)', () => {
      const pq = new Pagoda<number>({ comparator: (a, b) => b - a })
      pq.insert(1)
      pq.insert(3)
      pq.insert(2)
      expect(pq.peek()).toBe(3)
    })

    it('should create a pagoda with empty options object', () => {
      const pq = new Pagoda<number>({})
      pq.insert(5)
      expect(pq.peek()).toBe(5)
    })

    it('should work with undefined options', () => {
      const pq = new Pagoda<number>(undefined)
      pq.insert(10)
      expect(pq.peek()).toBe(10)
    })

    it('should default to min-heap behavior', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(1)
      pq.insert(3)
      expect(pq.peek()).toBe(1)
    })

    it('should work with string values', () => {
      const pq = new Pagoda<string>()
      pq.insert('banana')
      pq.insert('apple')
      pq.insert('cherry')
      expect(pq.peek()).toBe('apple')
    })

    it('should work with object values using custom comparator', () => {
      const pq = new Pagoda<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority,
      })
      pq.insert({ priority: 5 })
      pq.insert({ priority: 1 })
      pq.insert({ priority: 3 })
      expect(pq.peek()).toEqual({ priority: 1 })
    })

    it('should handle null options', () => {
      const pq = new Pagoda<number>(null as unknown as PagodaOptions<number>)
      pq.insert(42)
      expect(pq.peek()).toBe(42)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      const pq = new Pagoda<number>()
      pq.insert(10)
      expect(pq.size).toBe(1)
      expect(pq.peek()).toBe(10)
    })

    it('should insert multiple elements in ascending order', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      pq.insert(4)
      pq.insert(5)
      expect(pq.size).toBe(5)
      expect(pq.peek()).toBe(1)
    })

    it('should insert multiple elements in descending order', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(4)
      pq.insert(3)
      pq.insert(2)
      pq.insert(1)
      expect(pq.size).toBe(5)
      expect(pq.peek()).toBe(1)
    })

    it('should insert duplicate values', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(5)
      pq.insert(5)
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(5)
    })

    it('should insert zero', () => {
      const pq = new Pagoda<number>()
      pq.insert(0)
      expect(pq.peek()).toBe(0)
    })

    it('should insert negative numbers', () => {
      const pq = new Pagoda<number>()
      pq.insert(-5)
      pq.insert(-1)
      pq.insert(-10)
      expect(pq.peek()).toBe(-10)
    })

    it('should insert floating point numbers', () => {
      const pq = new Pagoda<number>()
      pq.insert(3.14)
      pq.insert(2.71)
      pq.insert(1.41)
      expect(pq.peek()).toBeCloseTo(1.41)
    })

    it('should maintain heap property after many inserts', () => {
      const pq = new Pagoda<number>()
      for (let i = 100; i >= 1; i--) {
        pq.insert(i)
      }
      expect(pq.peek()).toBe(1)
      expect(pq.size).toBe(100)
    })

    it('should handle inserting same value many times', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 50; i++) {
        pq.insert(42)
      }
      expect(pq.size).toBe(50)
      expect(pq.peek()).toBe(42)
    })

    it('should handle alternating insert and extract', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      expect(pq.extractMin()).toBe(5)
      pq.insert(3)
      pq.insert(7)
      expect(pq.extractMin()).toBe(3)
      expect(pq.extractMin()).toBe(7)
    })
  })

  describe('extractMin', () => {
    it('should throw on empty pagoda', () => {
      const pq = new Pagoda<number>()
      expect(() => pq.extractMin()).toThrow('Pagoda is empty')
    })

    it('should extract the single element', () => {
      const pq = new Pagoda<number>()
      pq.insert(42)
      expect(pq.extractMin()).toBe(42)
      expect(pq.isEmpty).toBe(true)
    })

    it('should extract elements in sorted order', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(1)
      pq.insert(4)
      pq.insert(2)
      expect(pq.extractMin()).toBe(1)
      expect(pq.extractMin()).toBe(2)
      expect(pq.extractMin()).toBe(3)
      expect(pq.extractMin()).toBe(4)
      expect(pq.extractMin()).toBe(5)
    })

    it('should extract all elements and leave empty', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      pq.extractMin()
      pq.extractMin()
      pq.extractMin()
      expect(pq.isEmpty).toBe(true)
      expect(pq.size).toBe(0)
    })

    it('should handle duplicates correctly', () => {
      const pq = new Pagoda<number>()
      pq.insert(3)
      pq.insert(1)
      pq.insert(3)
      pq.insert(1)
      expect(pq.extractMin()).toBe(1)
      expect(pq.extractMin()).toBe(1)
      expect(pq.extractMin()).toBe(3)
      expect(pq.extractMin()).toBe(3)
    })

    it('should extract negative numbers in order', () => {
      const pq = new Pagoda<number>()
      pq.insert(-1)
      pq.insert(-5)
      pq.insert(-3)
      expect(pq.extractMin()).toBe(-5)
      expect(pq.extractMin()).toBe(-3)
      expect(pq.extractMin()).toBe(-1)
    })

    it('should handle 100 elements extraction', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 100; i++) {
        pq.insert(100 - i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(pq.extractMin()).toBe(i)
      }
    })

    it('should throw after all elements extracted', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.extractMin()
      expect(() => pq.extractMin()).toThrow('Pagoda is empty')
    })

    it('should work with max-heap comparator', () => {
      const pq = new Pagoda<number>({ comparator: (a, b) => b - a })
      pq.insert(1)
      pq.insert(5)
      pq.insert(3)
      expect(pq.extractMin()).toBe(5)
      expect(pq.extractMin()).toBe(3)
      expect(pq.extractMin()).toBe(1)
    })

    it('should handle extraction of elements with same value', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 10; i++) {
        pq.insert(7)
      }
      for (let i = 0; i < 10; i++) {
        expect(pq.extractMin()).toBe(7)
      }
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('peek', () => {
    it('should throw on empty pagoda', () => {
      const pq = new Pagoda<number>()
      expect(() => pq.peek()).toThrow('Pagoda is empty')
    })

    it('should return the minimum element without removing it', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(7)
      expect(pq.peek()).toBe(3)
      expect(pq.size).toBe(3)
    })

    it('should return same value on consecutive peeks', () => {
      const pq = new Pagoda<number>()
      pq.insert(10)
      expect(pq.peek()).toBe(10)
      expect(pq.peek()).toBe(10)
      expect(pq.peek()).toBe(10)
    })

    it('should update after extraction', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(1)
      expect(pq.peek()).toBe(1)
      pq.extractMin()
      expect(pq.peek()).toBe(3)
      pq.extractMin()
      expect(pq.peek()).toBe(5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty pagoda', () => {
      const pq = new Pagoda<number>()
      expect(pq.size).toBe(0)
    })

    it('should increment on insert', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      expect(pq.size).toBe(1)
      pq.insert(2)
      expect(pq.size).toBe(2)
      pq.insert(3)
      expect(pq.size).toBe(3)
    })

    it('should decrement on extractMin', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.extractMin()
      expect(pq.size).toBe(1)
      pq.extractMin()
      expect(pq.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new pagoda', () => {
      const pq = new Pagoda<number>()
      expect(pq.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      expect(pq.isEmpty).toBe(false)
    })

    it('should be true after extracting all elements', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.extractMin()
      pq.extractMin()
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty pagoda', () => {
      const pq = new Pagoda<number>()
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should clear a populated pagoda', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should allow operations after clear', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.clear()
      pq.insert(5)
      expect(pq.peek()).toBe(5)
      expect(pq.size).toBe(1)
    })

    it('should throw extractMin after clear', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.clear()
      expect(() => pq.extractMin()).toThrow('Pagoda is empty')
    })
  })

  describe('merge', () => {
    it('should merge two empty pagodas', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.merge(b)
      expect(a.size).toBe(0)
      expect(b.size).toBe(0)
    })

    it('should merge empty into non-empty', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(1)
      a.merge(b)
      expect(a.size).toBe(1)
      expect(a.peek()).toBe(1)
    })

    it('should merge non-empty into empty', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      b.insert(1)
      a.merge(b)
      expect(a.size).toBe(1)
      expect(a.peek()).toBe(1)
      expect(b.size).toBe(0)
    })

    it('should merge two non-empty pagodas', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(1)
      a.insert(3)
      b.insert(2)
      b.insert(4)
      a.merge(b)
      expect(a.size).toBe(4)
      expect(a.extractMin()).toBe(1)
      expect(a.extractMin()).toBe(2)
      expect(a.extractMin()).toBe(3)
      expect(a.extractMin()).toBe(4)
    })

    it('should clear the other pagoda after merge', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(1)
      b.insert(2)
      b.insert(3)
      a.merge(b)
      expect(b.isEmpty).toBe(true)
      expect(b.size).toBe(0)
    })

    it('should handle self-merge gracefully', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.merge(pq)
      expect(pq.size).toBe(2)
    })

    it('should merge pagodas with overlapping values', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(1)
      a.insert(3)
      a.insert(5)
      b.insert(2)
      b.insert(3)
      b.insert(4)
      a.merge(b)
      expect(a.toSortedArray()).toEqual([1, 2, 3, 3, 4, 5])
    })

    it('should merge large pagodas', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      for (let i = 0; i < 50; i++) {
        a.insert(i * 2)
        b.insert(i * 2 + 1)
      }
      a.merge(b)
      expect(a.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(a.extractMin()).toBe(i)
      }
    })

    it('should maintain correct min after merge', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(10)
      a.insert(20)
      b.insert(5)
      b.insert(15)
      a.merge(b)
      expect(a.peek()).toBe(5)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty pagoda', () => {
      const pq = new Pagoda<number>()
      expect(pq.toArray()).toEqual([])
    })

    it('should return array with single element', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      expect(pq.toArray()).toEqual([1])
    })

    it('should return inorder traversal', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(7)
      const arr = pq.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(3)
      expect(arr).toContain(5)
      expect(arr).toContain(7)
    })

    it('should not modify the pagoda', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      pq.toArray()
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(1)
    })

    it('should return all elements', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 20; i++) {
        pq.insert(i)
      }
      expect(pq.toArray().length).toBe(20)
    })
  })

  describe('toSortedArray', () => {
    it('should return empty array for empty pagoda', () => {
      const pq = new Pagoda<number>()
      expect(pq.toSortedArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(1)
      pq.insert(4)
      pq.insert(2)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should not modify the original pagoda', () => {
      const pq = new Pagoda<number>()
      pq.insert(3)
      pq.insert(1)
      pq.insert(2)
      pq.toSortedArray()
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(1)
    })

    it('should handle duplicates', () => {
      const pq = new Pagoda<number>()
      pq.insert(3)
      pq.insert(1)
      pq.insert(3)
      pq.insert(1)
      expect(pq.toSortedArray()).toEqual([1, 1, 3, 3])
    })
  })

  describe('contains', () => {
    it('should return false for empty pagoda', () => {
      const pq = new Pagoda<number>()
      expect(pq.contains(1)).toBe(false)
    })

    it('should find existing element', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(7)
      expect(pq.contains(5)).toBe(true)
      expect(pq.contains(3)).toBe(true)
      expect(pq.contains(7)).toBe(true)
    })

    it('should not find missing element', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(7)
      expect(pq.contains(1)).toBe(false)
      expect(pq.contains(9)).toBe(false)
    })

    it('should find duplicates', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(5)
      expect(pq.contains(5)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should clone an empty pagoda', () => {
      const pq = new Pagoda<number>()
      const cloned = pq.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('should clone a populated pagoda', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      const cloned = pq.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toSortedArray()).toEqual([1, 2, 3])
    })

    it('should be independent from original', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      const cloned = pq.clone()
      cloned.extractMin()
      expect(pq.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('should preserve comparator', () => {
      const pq = new Pagoda<number>({ comparator: (a, b) => b - a })
      pq.insert(1)
      pq.insert(3)
      pq.insert(2)
      const cloned = pq.clone()
      expect(cloned.extractMin()).toBe(3)
      expect(cloned.extractMin()).toBe(2)
      expect(cloned.extractMin()).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('should create pagoda from empty array', () => {
      const pq = Pagoda.fromArray([] as number[])
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should create pagoda from single element array', () => {
      const pq = Pagoda.fromArray([5])
      expect(pq.size).toBe(1)
      expect(pq.peek()).toBe(5)
    })

    it('should create pagoda from multiple elements', () => {
      const pq = Pagoda.fromArray([5, 3, 1, 4, 2])
      expect(pq.size).toBe(5)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should accept options', () => {
      const pq = Pagoda.fromArray([1, 3, 2], {
        comparator: (a, b) => b - a,
      })
      expect(pq.peek()).toBe(3)
    })

    it('should handle array with duplicates', () => {
      const pq = Pagoda.fromArray([3, 1, 2, 1, 3])
      expect(pq.toSortedArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('static merge', () => {
    it('should merge two pagodas without modifying originals', () => {
      const a = new Pagoda<number>()
      a.insert(1)
      a.insert(3)
      const b = new Pagoda<number>()
      b.insert(2)
      b.insert(4)
      const merged = Pagoda.merge(a, b)
      expect(merged.toSortedArray()).toEqual([1, 2, 3, 4])
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })

    it('should handle empty pagodas', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      const merged = Pagoda.merge(a, b)
      expect(merged.isEmpty).toBe(true)
    })

    it('should handle one empty pagoda', () => {
      const a = new Pagoda<number>()
      a.insert(1)
      a.insert(2)
      const b = new Pagoda<number>()
      const merged = Pagoda.merge(a, b)
      expect(merged.toSortedArray()).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty pagoda', () => {
      const pq = new Pagoda<number>()
      const items: number[] = []
      pq.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('should iterate over all elements', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      const items: number[] = []
      pq.forEach((item) => items.push(item))
      expect(items.length).toBe(3)
      expect(items).toContain(1)
      expect(items).toContain(2)
      expect(items).toContain(3)
    })
  })

  describe('iterator', () => {
    it('should iterate over empty pagoda', () => {
      const pq = new Pagoda<number>()
      const items = [...pq]
      expect(items).toEqual([])
    })

    it('should iterate in sorted order', () => {
      const pq = new Pagoda<number>()
      pq.insert(3)
      pq.insert(1)
      pq.insert(2)
      const items = [...pq]
      expect(items).toEqual([1, 2, 3])
    })

    it('should iterate over many elements', () => {
      const pq = new Pagoda<number>()
      for (let i = 10; i >= 1; i--) {
        pq.insert(i)
      }
      const items = [...pq]
      expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('stress tests', () => {
    it('should handle sequential insert and extract', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 200; i++) {
        pq.insert(i)
      }
      for (let i = 0; i < 200; i++) {
        expect(pq.extractMin()).toBe(i)
      }
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle reverse sequential insert and extract', () => {
      const pq = new Pagoda<number>()
      for (let i = 199; i >= 0; i--) {
        pq.insert(i)
      }
      for (let i = 0; i < 200; i++) {
        expect(pq.extractMin()).toBe(i)
      }
    })

    it('should handle random order insert and sorted extract', () => {
      const pq = new Pagoda<number>()
      const values = [42, 17, 89, 3, 55, 21, 77, 12, 33, 68]
      for (const v of values) {
        pq.insert(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      for (const v of sorted) {
        expect(pq.extractMin()).toBe(v)
      }
    })

    it('should handle mixed insert and extract operations', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      expect(pq.extractMin()).toBe(3)
      pq.insert(7)
      pq.insert(1)
      pq.insert(4)
      expect(pq.extractMin()).toBe(1)
      expect(pq.extractMin()).toBe(4)
      pq.insert(2)
      expect(pq.extractMin()).toBe(2)
      expect(pq.extractMin()).toBe(5)
      expect(pq.extractMin()).toBe(7)
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle merge followed by extraction', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      for (let i = 0; i < 10; i++) {
        a.insert(i * 2)
      }
      for (let i = 0; i < 10; i++) {
        b.insert(i * 2 + 1)
      }
      a.merge(b)
      for (let i = 0; i < 20; i++) {
        expect(a.extractMin()).toBe(i)
      }
    })

    it('should handle many duplicates', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 100; i++) {
        pq.insert(42)
      }
      expect(pq.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(pq.extractMin()).toBe(42)
      }
    })

    it('should handle large range of values', () => {
      const pq = new Pagoda<number>()
      pq.insert(Number.MIN_SAFE_INTEGER)
      pq.insert(0)
      pq.insert(Number.MAX_SAFE_INTEGER)
      expect(pq.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(pq.extractMin()).toBe(0)
      expect(pq.extractMin()).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('generics', () => {
    it('should work with string type', () => {
      const pq = new Pagoda<string>()
      pq.insert('cherry')
      pq.insert('apple')
      pq.insert('banana')
      expect(pq.extractMin()).toBe('apple')
      expect(pq.extractMin()).toBe('banana')
      expect(pq.extractMin()).toBe('cherry')
    })

    it('should work with number type (default)', () => {
      const pq = new Pagoda()
      pq.insert(3)
      pq.insert(1)
      pq.insert(2)
      expect(pq.toSortedArray()).toEqual([1, 2, 3])
    })

    it('should work with custom object type', () => {
      interface Task {
        name: string
        priority: number
      }
      const pq = new Pagoda<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      pq.insert({ name: 'low', priority: 10 })
      pq.insert({ name: 'high', priority: 1 })
      pq.insert({ name: 'mid', priority: 5 })
      expect(pq.extractMin()!.name).toBe('high')
      expect(pq.extractMin()!.name).toBe('mid')
      expect(pq.extractMin()!.name).toBe('low')
    })

    it('should work with Date type', () => {
      const pq = new Pagoda<Date>()
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 6, 1)
      const d3 = new Date(2023, 3, 1)
      pq.insert(d2)
      pq.insert(d1)
      pq.insert(d3)
      expect(pq.extractMin()).toEqual(d1)
      expect(pq.extractMin()).toEqual(d3)
      expect(pq.extractMin()).toEqual(d2)
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      const pq = new Pagoda<number>()
      pq.insert(42)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty).toBe(false)
      expect(pq.peek()).toBe(42)
      expect(pq.contains(42)).toBe(true)
      expect(pq.extractMin()).toBe(42)
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
      expect(pq.contains(42)).toBe(false)
    })

    it('should handle clear and reuse', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 10; i++) {
        pq.insert(i)
      }
      pq.clear()
      expect(pq.isEmpty).toBe(true)
      pq.insert(100)
      expect(pq.peek()).toBe(100)
    })

    it('should handle merge empty after clear', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(1)
      a.insert(2)
      a.clear()
      b.insert(3)
      a.merge(b)
      expect(a.peek()).toBe(3)
      expect(b.isEmpty).toBe(true)
    })

    it('should handle clone of clone', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      const c1 = pq.clone()
      const c2 = c1.clone()
      expect(c2.toSortedArray()).toEqual([1, 2])
      c2.extractMin()
      expect(c1.size).toBe(2)
      expect(c2.size).toBe(1)
    })

    it('should handle fromArray with large dataset', () => {
      const data = Array.from({ length: 500 }, (_, i) => 500 - i)
      const pq = Pagoda.fromArray(data)
      expect(pq.size).toBe(500)
      expect(pq.peek()).toBe(1)
    })

    it('should handle interleaved operations', () => {
      const pq = new Pagoda<number>()
      const expected: number[] = []
      const inserted: number[] = []

      for (let i = 0; i < 20; i++) {
        const val = 20 - i
        pq.insert(val)
        inserted.push(val)
      }

      inserted.sort((a, b) => a - b)
      for (const v of inserted) {
        expected.push(pq.extractMin())
      }

      const sorted = [...expected]
      expect(sorted).toEqual(expected)
    })

    it('should maintain correctness with two-element tree', () => {
      const pq = new Pagoda<number>()
      pq.insert(2)
      pq.insert(1)
      expect(pq.peek()).toBe(1)
      expect(pq.extractMin()).toBe(1)
      expect(pq.extractMin()).toBe(2)
    })

    it('should handle three-element tree', () => {
      const pq = new Pagoda<number>()
      pq.insert(3)
      pq.insert(1)
      pq.insert(2)
      expect(pq.extractMin()).toBe(1)
      expect(pq.extractMin()).toBe(2)
      expect(pq.extractMin()).toBe(3)
    })

    it('should handle four-element tree', () => {
      const pq = new Pagoda<number>()
      pq.insert(4)
      pq.insert(2)
      pq.insert(3)
      pq.insert(1)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle five-element tree', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(1)
      pq.insert(4)
      pq.insert(2)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle comparison with equal elements', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(1)
      pq.insert(2)
      expect(pq.toSortedArray()).toEqual([1, 1, 2])
    })

    it('should handle negative and positive mix', () => {
      const pq = new Pagoda<number>()
      pq.insert(-5)
      pq.insert(5)
      pq.insert(-1)
      pq.insert(1)
      pq.insert(0)
      expect(pq.toSortedArray()).toEqual([-5, -1, 0, 1, 5])
    })

    it('should handle descending comparator consistently', () => {
      const pq = new Pagoda<number>({ comparator: (a, b) => b - a })
      const values = [1, 5, 3, 2, 4]
      for (const v of values) {
        pq.insert(v)
      }
      const sorted: number[] = []
      while (!pq.isEmpty) {
        sorted.push(pq.extractMin())
      }
      expect(sorted).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle string comparison', () => {
      const pq = new Pagoda<string>()
      pq.insert('delta')
      pq.insert('alpha')
      pq.insert('charlie')
      pq.insert('bravo')
      expect(pq.toSortedArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
    })

    it('should handle very small values', () => {
      const pq = new Pagoda<number>()
      pq.insert(0.001)
      pq.insert(0.002)
      pq.insert(0.0005)
      expect(pq.extractMin()).toBeCloseTo(0.0005)
    })

    it('should handle alternating high and low values', () => {
      const pq = new Pagoda<number>()
      for (let i = 0; i < 50; i++) {
        pq.insert(i % 2 === 0 ? 100 + i : i)
      }
      const sorted = pq.toSortedArray()
      expect(sorted.length).toBe(50)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('should handle clone after partial extraction', () => {
      const pq = new Pagoda<number>()
      pq.insert(5)
      pq.insert(3)
      pq.insert(1)
      pq.insert(4)
      pq.insert(2)
      pq.extractMin()
      pq.extractMin()
      const cloned = pq.clone()
      expect(cloned.toSortedArray()).toEqual([3, 4, 5])
    })

    it('should handle merge after extraction', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(5)
      a.insert(1)
      a.extractMin()
      b.insert(3)
      b.insert(2)
      a.merge(b)
      expect(a.toSortedArray()).toEqual([2, 3, 5])
    })

    it('should handle fromArray then merge', () => {
      const a = Pagoda.fromArray([1, 3, 5])
      const b = Pagoda.fromArray([2, 4, 6])
      a.merge(b)
      expect(a.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should handle multiple clears', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.clear()
      pq.clear()
      pq.insert(2)
      pq.clear()
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle merge then clone', () => {
      const a = new Pagoda<number>()
      const b = new Pagoda<number>()
      a.insert(1)
      b.insert(2)
      a.merge(b)
      const c = a.clone()
      expect(c.toSortedArray()).toEqual([1, 2])
    })

    it('should handle toArray on single element', () => {
      const pq = new Pagoda<number>()
      pq.insert(42)
      expect(pq.toArray()).toEqual([42])
    })

    it('should handle forEach with early elements', () => {
      const pq = new Pagoda<number>()
      pq.insert(10)
      pq.insert(20)
      pq.insert(30)
      const items: number[] = []
      pq.forEach((v) => items.push(v))
      expect(items.length).toBe(3)
    })

    it('should handle contains after extraction', () => {
      const pq = new Pagoda<number>()
      pq.insert(1)
      pq.insert(2)
      pq.insert(3)
      pq.extractMin()
      expect(pq.contains(1)).toBe(false)
      expect(pq.contains(2)).toBe(true)
      expect(pq.contains(3)).toBe(true)
    })
  })
})
