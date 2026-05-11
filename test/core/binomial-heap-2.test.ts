import { describe, it, expect } from 'vitest'
import { BinomialHeap } from '../../src/core/binomial-heap-2/index.js'

describe('BinomialHeap', () => {
  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const h = new BinomialHeap<number>()
      expect(h.isEmpty()).toBe(true)
      expect(h.size()).toBe(0)
    })

    it('should create a heap with custom comparator', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => b - a })
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept options object with no comparator', () => {
      const h = new BinomialHeap<number>({})
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert a single item', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.size()).toBe(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('should insert multiple items', () => {
      const h = new BinomialHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.size()).toBe(3)
    })

    it('should insert duplicate values', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(5)
      h.insert(5)
      expect(h.size()).toBe(3)
      expect(h.peek()).toBe(5)
    })

    it('should insert negative numbers', () => {
      const h = new BinomialHeap<number>()
      h.insert(-3)
      h.insert(-1)
      h.insert(-2)
      expect(h.peek()).toBe(-3)
    })

    it('should insert zero', () => {
      const h = new BinomialHeap<number>()
      h.insert(0)
      expect(h.peek()).toBe(0)
    })

    it('should handle many sequential inserts', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 100; i++) {
        h.insert(i)
      }
      expect(h.size()).toBe(100)
      expect(h.peek()).toBe(0)
    })

    it('should handle reverse sequential inserts', () => {
      const h = new BinomialHeap<number>()
      for (let i = 99; i >= 0; i--) {
        h.insert(i)
      }
      expect(h.size()).toBe(100)
      expect(h.peek()).toBe(0)
    })

    it('should work with string values', () => {
      const h = new BinomialHeap<string>()
      h.insert('banana')
      h.insert('apple')
      h.insert('cherry')
      expect(h.peek()).toBe('apple')
    })

    it('should work with objects via custom comparator', () => {
      const h = new BinomialHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      h.insert({ id: 3 })
      h.insert({ id: 1 })
      h.insert({ id: 2 })
      expect(h.peek().id).toBe(1)
    })
  })

  describe('peek', () => {
    it('should return the minimum element without removing it', () => {
      const h = new BinomialHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.peek()).toBe(1)
      expect(h.size()).toBe(3)
    })

    it('should throw on empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(() => h.peek()).toThrow('Heap is empty')
    })

    it('should return correct min after multiple inserts', () => {
      const h = new BinomialHeap<number>()
      h.insert(10)
      expect(h.peek()).toBe(10)
      h.insert(5)
      expect(h.peek()).toBe(5)
      h.insert(15)
      expect(h.peek()).toBe(5)
      h.insert(1)
      expect(h.peek()).toBe(1)
    })

    it('should handle single element', () => {
      const h = new BinomialHeap<number>()
      h.insert(42)
      expect(h.peek()).toBe(42)
    })
  })

  describe('extractMin', () => {
    it('should extract the single item', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.extractMin()).toBe(5)
      expect(h.isEmpty()).toBe(true)
    })

    it('should extract items in sorted order', () => {
      const h = new BinomialHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(3)
    })

    it('should throw on empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(() => h.extractMin()).toThrow('Heap is empty')
    })

    it('should handle duplicate minimum values', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(1)
      h.insert(2)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
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
    })

    it('should extract all elements from large heap in order', () => {
      const h = new BinomialHeap<number>()
      const items = [64, 32, 16, 8, 4, 2, 1, 128, 256, 512]
      for (const item of items) {
        h.insert(item)
      }
      const sorted = [...items].sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(h.extractMin()).toBe(expected)
      }
      expect(h.isEmpty()).toBe(true)
    })

    it('should handle negative numbers', () => {
      const h = new BinomialHeap<number>()
      h.insert(-5)
      h.insert(-1)
      h.insert(-3)
      expect(h.extractMin()).toBe(-5)
      expect(h.extractMin()).toBe(-3)
      expect(h.extractMin()).toBe(-1)
    })

    it('should handle max heap via custom comparator', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => b - a })
      h.insert(1)
      h.insert(3)
      h.insert(2)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(1)
    })
  })

  describe('merge', () => {
    it('should merge two empty heaps', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      h1.merge(h2)
      expect(h1.isEmpty()).toBe(true)
      expect(h2.isEmpty()).toBe(true)
    })

    it('should merge into empty heap', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      h2.insert(1)
      h2.insert(2)
      h1.merge(h2)
      expect(h1.size()).toBe(2)
      expect(h2.size()).toBe(0)
    })

    it('should merge empty into non-empty', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1)
      const h2 = new BinomialHeap<number>()
      h1.merge(h2)
      expect(h1.size()).toBe(1)
    })

    it('should merge two non-empty heaps', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1)
      h1.insert(3)
      const h2 = new BinomialHeap<number>()
      h2.insert(2)
      h2.insert(4)
      h1.merge(h2)
      expect(h1.size()).toBe(4)
      expect(h1.extractMin()).toBe(1)
      expect(h1.extractMin()).toBe(2)
      expect(h1.extractMin()).toBe(3)
      expect(h1.extractMin()).toBe(4)
    })

    it('should clear the merged heap', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      h2.insert(1)
      h1.merge(h2)
      expect(h2.size()).toBe(0)
      expect(h2.isEmpty()).toBe(true)
    })

    it('should handle merging with same comparator', () => {
      const cmp = (a: number, b: number) => a - b
      const h1 = new BinomialHeap<number>({ comparator: cmp })
      const h2 = new BinomialHeap<number>({ comparator: cmp })
      h1.insert(5)
      h2.insert(3)
      h1.merge(h2)
      expect(h1.extractMin()).toBe(3)
      expect(h1.extractMin()).toBe(5)
    })

    it('should handle self-merge as no-op', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.merge(h)
      expect(h.size()).toBe(2)
    })

    it('should merge large heaps', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      for (let i = 0; i < 50; i++) h1.insert(i)
      for (let i = 50; i < 100; i++) h2.insert(i)
      h1.merge(h2)
      expect(h1.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(h1.extractMin()).toBe(i)
      }
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.size()).toBe(0)
    })

    it('should return correct size after inserts', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.size()).toBe(3)
    })

    it('should return correct size after extracts', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.extractMin()
      expect(h.size()).toBe(2)
    })

    it('should return correct size after clear', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.clear()
      expect(h.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('should return true after extracting all elements', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.extractMin()
      expect(h.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.clear()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty heap', () => {
      const h = new BinomialHeap<number>()
      h.clear()
      expect(h.isEmpty()).toBe(true)
      expect(h.size()).toBe(0)
    })

    it('should clear a heap with items', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.clear()
      expect(h.isEmpty()).toBe(true)
      expect(h.size()).toBe(0)
    })

    it('should allow insert after clear', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.clear()
      h.insert(2)
      expect(h.size()).toBe(1)
      expect(h.peek()).toBe(2)
    })

    it('should allow extractMin after clear and insert', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.clear()
      h.insert(10)
      expect(h.extractMin()).toBe(10)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('should return all elements for single element', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      expect(h.toArray()).toEqual([1])
    })

    it('should return all elements for multiple elements', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const arr = h.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should not modify the heap', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.toArray()
      expect(h.size()).toBe(2)
    })
  })

  describe('contains', () => {
    it('should return false for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('should return true for existing element', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.contains(5)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.contains(3)).toBe(false)
    })

    it('should find elements after multiple inserts', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.contains(1)).toBe(true)
      expect(h.contains(2)).toBe(true)
      expect(h.contains(3)).toBe(true)
      expect(h.contains(4)).toBe(false)
    })

    it('should find duplicate values', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(5)
      expect(h.contains(5)).toBe(true)
    })

    it('should not find after extract', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.extractMin()
      expect(h.contains(1)).toBe(false)
    })

    it('should work with string values', () => {
      const h = new BinomialHeap<string>()
      h.insert('hello')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('world')).toBe(false)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease a key', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(10)
      expect(h.decreaseKey(10, 3)).toBe(true)
      expect(h.peek()).toBe(3)
    })

    it('should return false if old key not found', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(10, 3)).toBe(false)
    })

    it('should return false if new key is greater', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(5, 10)).toBe(false)
    })

    it('should handle decrease to same value', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      expect(h.decreaseKey(5, 5)).toBe(true)
    })

    it('should maintain heap order after decrease', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(5)
      h.insert(10)
      h.decreaseKey(10, 0)
      expect(h.peek()).toBe(0)
      expect(h.extractMin()).toBe(0)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(5)
    })

    it('should work on root node', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(10)
      expect(h.decreaseKey(5, 1)).toBe(true)
      expect(h.peek()).toBe(1)
    })

    it('should handle decrease on empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.decreaseKey(1, 0)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an element', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.delete(2)).toBe(true)
      expect(h.size()).toBe(2)
      expect(h.contains(2)).toBe(false)
    })

    it('should return false if element not found', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      expect(h.delete(5)).toBe(false)
    })

    it('should delete the minimum element', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.delete(1)
      expect(h.peek()).toBe(2)
    })

    it('should delete the maximum element', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.delete(3)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.isEmpty()).toBe(true)
    })

    it('should handle delete on single element heap', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      expect(h.delete(1)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })

    it('should handle delete on empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.delete(1)).toBe(false)
    })

    it('should maintain order after multiple deletes', () => {
      const h = new BinomialHeap<number>()
      for (let i = 1; i <= 5; i++) h.insert(i)
      h.delete(3)
      h.delete(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(4)
      expect(h.extractMin()).toBe(5)
    })
  })

  describe('clone', () => {
    it('should clone an empty heap', () => {
      const h = new BinomialHeap<number>()
      const c = h.clone()
      expect(c.isEmpty()).toBe(true)
      expect(c.size()).toBe(0)
    })

    it('should clone a heap with elements', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const c = h.clone()
      expect(c.size()).toBe(3)
      expect(c.extractMin()).toBe(1)
      expect(c.extractMin()).toBe(2)
      expect(c.extractMin()).toBe(3)
    })

    it('should not affect original when modifying clone', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      const c = h.clone()
      c.extractMin()
      expect(h.size()).toBe(2)
      expect(c.size()).toBe(1)
    })

    it('should preserve comparator', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => b - a })
      h.insert(1)
      h.insert(2)
      const c = h.clone()
      expect(c.extractMin()).toBe(2)
    })
  })

  describe('fromArray', () => {
    it('should create heap from empty array', () => {
      const h = BinomialHeap.fromArray<number>([])
      expect(h.isEmpty()).toBe(true)
    })

    it('should create heap from single element array', () => {
      const h = BinomialHeap.fromArray([5])
      expect(h.size()).toBe(1)
      expect(h.peek()).toBe(5)
    })

    it('should create heap from array', () => {
      const h = BinomialHeap.fromArray([3, 1, 2])
      expect(h.size()).toBe(3)
      expect(h.peek()).toBe(1)
    })

    it('should create heap with custom comparator', () => {
      const h = BinomialHeap.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(h.peek()).toBe(3)
    })

    it('should create heap from large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const h = BinomialHeap.fromArray(arr)
      expect(h.size()).toBe(100)
      expect(h.peek()).toBe(1)
    })

    it('should work with string arrays', () => {
      const h = BinomialHeap.fromArray(['cherry', 'apple', 'banana'])
      expect(h.peek()).toBe('apple')
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty heap', () => {
      const h = new BinomialHeap<number>()
      let count = 0
      h.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should visit all elements', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const collected: number[] = []
      h.forEach((item) => collected.push(item))
      expect(collected.length).toBe(3)
      expect(collected.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  describe('iterator', () => {
    it('should iterate over empty heap', () => {
      const h = new BinomialHeap<number>()
      const items = [...h]
      expect(items).toEqual([])
    })

    it('should iterate over heap elements', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const items = [...h]
      expect(items.length).toBe(3)
      expect(items.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  describe('generics', () => {
    it('should work with string type', () => {
      const h = new BinomialHeap<string>()
      h.insert('charlie')
      h.insert('alpha')
      h.insert('bravo')
      expect(h.extractMin()).toBe('alpha')
      expect(h.extractMin()).toBe('bravo')
      expect(h.extractMin()).toBe('charlie')
    })

    it('should work with object type via custom comparator', () => {
      interface Task {
        priority: number
        name: string
      }
      const h = new BinomialHeap<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      h.insert({ priority: 3, name: 'low' })
      h.insert({ priority: 1, name: 'high' })
      h.insert({ priority: 2, name: 'medium' })
      expect(h.extractMin().name).toBe('high')
      expect(h.extractMin().name).toBe('medium')
      expect(h.extractMin().name).toBe('low')
    })

    it('should work with Date objects', () => {
      const h = new BinomialHeap<Date>({
        comparator: (a, b) => a.getTime() - b.getTime(),
      })
      const d1 = new Date(2020, 0, 1)
      const d2 = new Date(2021, 0, 1)
      const d3 = new Date(2019, 0, 1)
      h.insert(d1)
      h.insert(d2)
      h.insert(d3)
      expect(h.extractMin()).toBe(d3)
      expect(h.extractMin()).toBe(d1)
    })
  })

  describe('stress tests', () => {
    it('should handle power-of-2 sized inserts', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 16; i++) {
        h.insert(16 - i)
      }
      expect(h.size()).toBe(16)
      for (let i = 1; i <= 16; i++) {
        expect(h.extractMin()).toBe(i)
      }
    })

    it('should handle 1000 elements', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 1000; i++) {
        h.insert(i)
      }
      expect(h.size()).toBe(1000)
      expect(h.peek()).toBe(0)
    })

    it('should extract 1000 elements in order', () => {
      const h = new BinomialHeap<number>()
      const items = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      for (const item of items) {
        h.insert(item)
      }
      const sorted = [...items].sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(h.extractMin()).toBe(expected)
      }
      expect(h.isEmpty()).toBe(true)
    })

    it('should handle merge after many operations', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      for (let i = 0; i < 50; i++) h1.insert(i * 2)
      for (let i = 0; i < 50; i++) h2.insert(i * 2 + 1)
      h1.merge(h2)
      expect(h1.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(h1.extractMin()).toBe(i)
      }
    })

    it('should handle repeated insert-extract cycles', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 100; i++) {
        h.insert(i)
        expect(h.extractMin()).toBe(i)
      }
      expect(h.isEmpty()).toBe(true)
    })

    it('should handle all same values', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 20; i++) h.insert(42)
      for (let i = 0; i < 20; i++) {
        expect(h.extractMin()).toBe(42)
      }
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle NaN-like comparisons gracefully', () => {
      const h = new BinomialHeap<number>()
      h.insert(0)
      h.insert(-0)
      expect(h.size()).toBe(2)
    })

    it('should handle very large numbers', () => {
      const h = new BinomialHeap<number>()
      h.insert(Number.MAX_SAFE_INTEGER)
      h.insert(Number.MIN_SAFE_INTEGER)
      h.insert(0)
      expect(h.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(h.extractMin()).toBe(0)
      expect(h.extractMin()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle alternating high-low inserts', () => {
      const h = new BinomialHeap<number>()
      h.insert(100)
      h.insert(1)
      h.insert(99)
      h.insert(2)
      h.insert(98)
      h.insert(3)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(98)
      expect(h.extractMin()).toBe(99)
      expect(h.extractMin()).toBe(100)
    })

    it('should handle merge with self as no-op', () => {
      const h = new BinomialHeap<number>()
      h.insert(1)
      h.insert(2)
      const sizeBefore = h.size()
      h.merge(h)
      expect(h.size()).toBe(sizeBefore)
    })

    it('should clear and reuse heap', () => {
      const h = new BinomialHeap<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) h.insert(i)
        for (let i = 0; i < 10; i++) expect(h.extractMin()).toBe(i)
        expect(h.isEmpty()).toBe(true)
      }
    })

    it('should handle toArray on large heap', () => {
      const h = new BinomialHeap<number>()
      for (let i = 0; i < 50; i++) h.insert(i)
      const arr = h.toArray()
      expect(arr.length).toBe(50)
      expect(arr.sort((a, b) => a - b)[0]).toBe(0)
    })

    it('should handle delete then extractMin', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      h.delete(3)
      expect(h.extractMin()).toBe(5)
      expect(h.extractMin()).toBe(7)
    })

    it('should handle decreaseKey making element new min', () => {
      const h = new BinomialHeap<number>()
      h.insert(10)
      h.insert(20)
      h.insert(30)
      h.decreaseKey(30, 1)
      expect(h.peek()).toBe(1)
    })

    it('should handle many merges', () => {
      const heaps: BinomialHeap<number>[] = []
      for (let i = 0; i < 10; i++) {
        const h = new BinomialHeap<number>()
        h.insert(i)
        heaps.push(h)
      }
      const main = heaps[0]!
      for (let i = 1; i < heaps.length; i++) {
        main.merge(heaps[i]!)
      }
      expect(main.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(main.extractMin()).toBe(i)
      }
    })

    it('should handle clone after operations', () => {
      const h = new BinomialHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      h.extractMin()
      const c = h.clone()
      expect(c.size()).toBe(2)
      expect(c.extractMin()).toBe(5)
      expect(c.extractMin()).toBe(7)
    })

    it('should handle contains after merge', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1)
      h1.insert(2)
      const h2 = new BinomialHeap<number>()
      h2.insert(3)
      h2.insert(4)
      h1.merge(h2)
      expect(h1.contains(1)).toBe(true)
      expect(h1.contains(2)).toBe(true)
      expect(h1.contains(3)).toBe(true)
      expect(h1.contains(4)).toBe(true)
      expect(h1.contains(5)).toBe(false)
    })

    it('should handle fromArray with duplicates', () => {
      const h = BinomialHeap.fromArray([3, 1, 2, 1, 3])
      expect(h.size()).toBe(5)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(1)
    })

    it('should handle single element operations', () => {
      const h = new BinomialHeap<number>()
      h.insert(42)
      expect(h.peek()).toBe(42)
      expect(h.contains(42)).toBe(true)
      expect(h.toArray()).toEqual([42])
      expect(h.delete(42)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })
  })
})
