import { describe, it, expect } from 'vitest'
import { FenwickTree2 } from '../../src/core/fenwick-tree-2/index.js'

describe('FenwickTree2', () => {
  describe('constructor', () => {
    it('creates empty tree with no arguments', () => {
      const ft = new FenwickTree2()
      expect(ft.size).toBe(0)
      expect(ft.isEmpty).toBe(true)
    })

    it('creates tree from number array', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.size).toBe(5)
      expect(ft.isEmpty).toBe(false)
    })

    it('creates tree from empty array', () => {
      const ft = new FenwickTree2<number>([])
      expect(ft.size).toBe(0)
      expect(ft.isEmpty).toBe(true)
    })

    it('creates tree from single element array', () => {
      const ft = new FenwickTree2([42])
      expect(ft.size).toBe(1)
      expect(ft.get(0)).toBe(42)
    })

    it('handles undefined argument', () => {
      const ft = new FenwickTree2<number>(undefined)
      expect(ft.size).toBe(0)
    })

    it('preserves element order via toArray', () => {
      const ft = new FenwickTree2([10, 20, 30, 40, 50])
      expect(ft.toArray()).toEqual([10, 20, 30, 40, 50])
    })

    it('creates tree with zero values', () => {
      const ft = new FenwickTree2([0, 0, 0])
      expect(ft.toArray()).toEqual([0, 0, 0])
    })

    it('creates tree with negative values', () => {
      const ft = new FenwickTree2([-1, -2, -3])
      expect(ft.toArray()).toEqual([-1, -2, -3])
    })

    it('creates tree with mixed positive and negative', () => {
      const ft = new FenwickTree2([5, -3, 2, -1, 4])
      expect(ft.toArray()).toEqual([5, -3, 2, -1, 4])
    })

    it('creates tree from large array', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i + 1)
      const ft = new FenwickTree2(items)
      expect(ft.size).toBe(1000)
      expect(ft.query(999)).toBe(500500)
    })
  })

  describe('query (prefix sum)', () => {
    it('returns element value for index 0', () => {
      const ft = new FenwickTree2([3, 1, 4, 1, 5])
      expect(ft.query(0)).toBe(3)
    })

    it('returns sum of first two elements', () => {
      const ft = new FenwickTree2([3, 1, 4, 1, 5])
      expect(ft.query(1)).toBe(4)
    })

    it('returns sum of all elements', () => {
      const ft = new FenwickTree2([3, 1, 4, 1, 5])
      expect(ft.query(4)).toBe(14)
    })

    it('returns correct prefix sum at middle index', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5, 6, 7, 8])
      expect(ft.query(3)).toBe(10)
    })

    it('returns correct prefix sum for single element', () => {
      const ft = new FenwickTree2([99])
      expect(ft.query(0)).toBe(99)
    })

    it('returns 0 for prefix sum of all zeros', () => {
      const ft = new FenwickTree2([0, 0, 0, 0])
      expect(ft.query(3)).toBe(0)
    })

    it('handles negative values in prefix sum', () => {
      const ft = new FenwickTree2([5, -3, 2])
      expect(ft.query(1)).toBe(2)
      expect(ft.query(2)).toBe(4)
    })

    it('throws on negative index', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.query(-1)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.query(3)).toThrow(RangeError)
    })

    it('throws on index greater than size', () => {
      const ft = new FenwickTree2([1, 2])
      expect(() => ft.query(100)).toThrow(RangeError)
    })

    it('throws on empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(() => ft.query(0)).toThrow(RangeError)
    })

    it('computes prefix sums correctly for powers of 2 sized arrays', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5, 6, 7, 8])
      expect(ft.query(0)).toBe(1)
      expect(ft.query(1)).toBe(3)
      expect(ft.query(2)).toBe(6)
      expect(ft.query(3)).toBe(10)
      expect(ft.query(4)).toBe(15)
      expect(ft.query(5)).toBe(21)
      expect(ft.query(6)).toBe(28)
      expect(ft.query(7)).toBe(36)
    })
  })

  describe('rangeQuery', () => {
    it('returns single element range', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.rangeQuery(2, 2)).toBe(3)
    })

    it('returns sum of range from start', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.rangeQuery(0, 2)).toBe(6)
    })

    it('returns sum of range to end', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.rangeQuery(3, 4)).toBe(9)
    })

    it('returns sum of full range', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.rangeQuery(0, 4)).toBe(15)
    })

    it('returns middle range', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.rangeQuery(1, 3)).toBe(9)
    })

    it('returns zero for zero-valued range', () => {
      const ft = new FenwickTree2([5, 0, 0, 0, 5])
      expect(ft.rangeQuery(1, 3)).toBe(0)
    })

    it('handles range with negative values', () => {
      const ft = new FenwickTree2([5, -3, 2, -1, 4])
      expect(ft.rangeQuery(1, 3)).toBe(-2)
    })

    it('throws when from > to', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.rangeQuery(2, 1)).toThrow(RangeError)
    })

    it('throws when from is negative', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.rangeQuery(-1, 2)).toThrow(RangeError)
    })

    it('throws when to is out of bounds', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.rangeQuery(0, 3)).toThrow(RangeError)
    })

    it('throws when both indices are out of bounds', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.rangeQuery(5, 10)).toThrow(RangeError)
    })

    it('works on single element tree', () => {
      const ft = new FenwickTree2([42])
      expect(ft.rangeQuery(0, 0)).toBe(42)
    })

    it('works on large array', () => {
      const items = Array.from({ length: 100 }, (_, i) => i + 1)
      const ft = new FenwickTree2(items)
      expect(ft.rangeQuery(9, 19)).toBe(165)
    })
  })

  describe('update', () => {
    it('adds delta to element', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.update(2, 10)
      expect(ft.get(2)).toBe(13)
    })

    it('adds negative delta', () => {
      const ft = new FenwickTree2([10, 20, 30])
      ft.update(1, -5)
      expect(ft.get(1)).toBe(15)
    })

    it('adds zero delta (no change)', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.update(1, 0)
      expect(ft.get(1)).toBe(2)
    })

    it('updates prefix sums correctly', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.update(2, 10)
      expect(ft.query(4)).toBe(25)
    })

    it('does not affect earlier prefix sums', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.update(3, 10)
      expect(ft.query(1)).toBe(3)
    })

    it('updates range queries correctly', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.update(2, 10)
      expect(ft.rangeQuery(1, 4)).toBe(24)
    })

    it('throws on negative index', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.update(-1, 5)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.update(3, 5)).toThrow(RangeError)
    })

    it('throws on empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(() => ft.update(0, 5)).toThrow(RangeError)
    })

    it('handles multiple updates', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.update(0, 10)
      ft.update(2, 20)
      ft.update(4, 30)
      expect(ft.toArray()).toEqual([11, 2, 23, 4, 35])
    })

    it('handles update on first element', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.update(0, 99)
      expect(ft.get(0)).toBe(100)
    })

    it('handles update on last element', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.update(2, 50)
      expect(ft.get(2)).toBe(53)
    })
  })

  describe('set', () => {
    it('sets value at index', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.set(2, 99)
      expect(ft.get(2)).toBe(99)
    })

    it('preserves other elements', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.set(2, 99)
      expect(ft.toArray()).toEqual([1, 2, 99, 4, 5])
    })

    it('updates prefix sums correctly', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.set(1, 10)
      expect(ft.query(4)).toBe(23)
    })

    it('sets first element', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(0, 100)
      expect(ft.get(0)).toBe(100)
    })

    it('sets last element', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(2, 200)
      expect(ft.get(2)).toBe(200)
    })

    it('sets to same value (no change)', () => {
      const ft = new FenwickTree2([42])
      ft.set(0, 42)
      expect(ft.get(0)).toBe(42)
    })

    it('sets to zero', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(1, 0)
      expect(ft.get(1)).toBe(0)
    })

    it('sets to negative', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(1, -5)
      expect(ft.get(1)).toBe(-5)
    })

    it('throws on negative index', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.set(-1, 99)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.set(3, 99)).toThrow(RangeError)
    })

    it('handles multiple sets', () => {
      const ft = new FenwickTree2([1, 2, 3, 4])
      ft.set(0, 10)
      ft.set(1, 20)
      ft.set(2, 30)
      ft.set(3, 40)
      expect(ft.toArray()).toEqual([10, 20, 30, 40])
    })
  })

  describe('get', () => {
    it('returns element at valid index', () => {
      const ft = new FenwickTree2([10, 20, 30])
      expect(ft.get(0)).toBe(10)
      expect(ft.get(1)).toBe(20)
      expect(ft.get(2)).toBe(30)
    })

    it('returns first element', () => {
      const ft = new FenwickTree2([99])
      expect(ft.get(0)).toBe(99)
    })

    it('returns last element of large array', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      expect(ft.get(4)).toBe(5)
    })

    it('throws on negative index', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(() => ft.get(3)).toThrow(RangeError)
    })

    it('throws on empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(() => ft.get(0)).toThrow(RangeError)
    })

    it('reflects updates', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.update(1, 5)
      expect(ft.get(1)).toBe(7)
    })

    it('reflects sets', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(1, 99)
      expect(ft.get(1)).toBe(99)
    })
  })

  describe('push', () => {
    it('adds element to empty tree', () => {
      const ft = new FenwickTree2<number>()
      ft.push(5)
      expect(ft.size).toBe(1)
      expect(ft.get(0)).toBe(5)
    })

    it('adds element to non-empty tree', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.push(4)
      expect(ft.size).toBe(4)
      expect(ft.get(3)).toBe(4)
    })

    it('maintains correct prefix sums after push', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.push(4)
      expect(ft.query(3)).toBe(10)
    })

    it('maintains correct range queries after push', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.push(4)
      expect(ft.rangeQuery(1, 3)).toBe(9)
    })

    it('handles multiple pushes', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      ft.push(3)
      ft.push(4)
      ft.push(5)
      expect(ft.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(ft.query(4)).toBe(15)
    })

    it('updates size after each push', () => {
      const ft = new FenwickTree2<number>()
      expect(ft.size).toBe(0)
      ft.push(1)
      expect(ft.size).toBe(1)
      ft.push(2)
      expect(ft.size).toBe(2)
    })

    it('pushes negative values', () => {
      const ft = new FenwickTree2<number>()
      ft.push(-5)
      expect(ft.get(0)).toBe(-5)
    })

    it('pushes zero', () => {
      const ft = new FenwickTree2<number>()
      ft.push(0)
      expect(ft.get(0)).toBe(0)
    })

    it('push maintains existing element values', () => {
      const ft = new FenwickTree2([10, 20, 30])
      ft.push(40)
      expect(ft.get(0)).toBe(10)
      expect(ft.get(1)).toBe(20)
      expect(ft.get(2)).toBe(30)
      expect(ft.get(3)).toBe(40)
    })

    it('handles many pushes and verifies prefix sums', () => {
      const ft = new FenwickTree2<number>()
      for (let i = 1; i <= 100; i++) {
        ft.push(i)
      }
      expect(ft.query(99)).toBe(5050)
      expect(ft.rangeQuery(49, 99)).toBe(3825)
    })
  })

  describe('pop', () => {
    it('returns last element', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(ft.pop()).toBe(3)
    })

    it('removes element from tree', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.pop()
      expect(ft.size).toBe(2)
    })

    it('returns elements in LIFO order', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(ft.pop()).toBe(3)
      expect(ft.pop()).toBe(2)
      expect(ft.pop()).toBe(1)
    })

    it('throws on empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(() => ft.pop()).toThrow(RangeError)
    })

    it('handles pop to empty', () => {
      const ft = new FenwickTree2([42])
      expect(ft.pop()).toBe(42)
      expect(ft.isEmpty).toBe(true)
      expect(ft.size).toBe(0)
    })

    it('maintains prefix sums after pop', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5])
      ft.pop()
      expect(ft.query(3)).toBe(10)
    })

    it('can push after pop', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.pop()
      ft.push(99)
      expect(ft.toArray()).toEqual([1, 2, 99])
    })

    it('handles interleaved push and pop', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      expect(ft.pop()).toBe(2)
      ft.push(3)
      expect(ft.pop()).toBe(3)
      expect(ft.pop()).toBe(1)
      expect(ft.isEmpty).toBe(true)
    })

    it('handles many pops', () => {
      const items = Array.from({ length: 50 }, (_, i) => i + 1)
      const ft = new FenwickTree2(items)
      for (let i = 50; i >= 1; i--) {
        expect(ft.pop()).toBe(i)
      }
      expect(ft.isEmpty).toBe(true)
    })

    it('preserves prefix queries after pop', () => {
      const ft = new FenwickTree2([3, 1, 4, 1, 5, 9])
      ft.pop()
      expect(ft.query(0)).toBe(3)
      expect(ft.query(1)).toBe(4)
      expect(ft.query(2)).toBe(8)
      expect(ft.query(3)).toBe(9)
      expect(ft.query(4)).toBe(14)
    })
  })

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(ft.size).toBe(0)
    })

    it('returns correct size after construction', () => {
      const ft = new FenwickTree2([1, 2, 3])
      expect(ft.size).toBe(3)
    })

    it('returns correct size after push', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      expect(ft.size).toBe(1)
    })

    it('returns correct size after pop', () => {
      const ft = new FenwickTree2([1, 2])
      ft.pop()
      expect(ft.size).toBe(1)
    })

    it('returns correct size after clear', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.clear()
      expect(ft.size).toBe(0)
    })

    it('returns correct size after multiple operations', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      ft.push(3)
      ft.pop()
      ft.push(4)
      expect(ft.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(ft.isEmpty).toBe(true)
    })

    it('returns false after push', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      expect(ft.isEmpty).toBe(false)
    })

    it('returns true after clearing all elements', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.clear()
      expect(ft.isEmpty).toBe(true)
    })

    it('returns true after popping all elements', () => {
      const ft = new FenwickTree2([1])
      ft.pop()
      expect(ft.isEmpty).toBe(true)
    })

    it('returns false for non-empty constructor', () => {
      const ft = new FenwickTree2([1])
      expect(ft.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty tree without error', () => {
      const ft = new FenwickTree2<number>()
      ft.clear()
      expect(ft.size).toBe(0)
      expect(ft.isEmpty).toBe(true)
    })

    it('clears tree with elements', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.clear()
      expect(ft.size).toBe(0)
      expect(ft.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.clear()
      ft.push(99)
      expect(ft.size).toBe(1)
      expect(ft.get(0)).toBe(99)
    })

    it('double clear is safe', () => {
      const ft = new FenwickTree2([1, 2])
      ft.clear()
      ft.clear()
      expect(ft.isEmpty).toBe(true)
    })

    it('clear allows building from scratch', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.clear()
      ft.push(10)
      ft.push(20)
      expect(ft.query(1)).toBe(30)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const ft = new FenwickTree2<number>()
      expect(ft.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const ft = new FenwickTree2([42])
      expect(ft.toArray()).toEqual([42])
    })

    it('returns all elements in order', () => {
      const ft = new FenwickTree2([10, 20, 30, 40])
      expect(ft.toArray()).toEqual([10, 20, 30, 40])
    })

    it('returns copy of elements', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const result = ft.toArray()
      result[0] = 99
      expect(ft.get(0)).toBe(1)
    })

    it('reflects modifications', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(1, 99)
      expect(ft.toArray()).toEqual([1, 99, 3])
    })

    it('reflects push and pop', () => {
      const ft = new FenwickTree2([1, 2])
      ft.push(3)
      expect(ft.toArray()).toEqual([1, 2, 3])
      ft.pop()
      expect(ft.toArray()).toEqual([1, 2])
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const ft = new FenwickTree2<number>()
      const cloned = ft.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones tree with elements', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const cloned = ft.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('produces independent copy', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const cloned = ft.clone()
      ft.set(0, 99)
      expect(cloned.get(0)).toBe(1)
    })

    it('clone modifications do not affect original', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const cloned = ft.clone()
      cloned.push(4)
      expect(ft.size).toBe(3)
      expect(cloned.size).toBe(4)
    })

    it('clones single element tree', () => {
      const ft = new FenwickTree2([42])
      const cloned = ft.clone()
      expect(cloned.get(0)).toBe(42)
      expect(cloned.size).toBe(1)
    })

    it('clones large tree', () => {
      const items = Array.from({ length: 100 }, (_, i) => i + 1)
      const ft = new FenwickTree2(items)
      const cloned = ft.clone()
      expect(cloned.toArray()).toEqual(items)
      expect(cloned.query(99)).toBe(5050)
    })
  })

  describe('fromArray', () => {
    it('creates tree from empty array', () => {
      const ft = FenwickTree2.fromArray<number>([])
      expect(ft.size).toBe(0)
    })

    it('creates tree from items', () => {
      const ft = FenwickTree2.fromArray([1, 2, 3])
      expect(ft.toArray()).toEqual([1, 2, 3])
    })

    it('creates independent instance', () => {
      const original = [1, 2, 3]
      const ft = FenwickTree2.fromArray(original)
      original.push(4)
      expect(ft.size).toBe(3)
    })

    it('preserves order', () => {
      const ft = FenwickTree2.fromArray([5, 4, 3, 2, 1])
      expect(ft.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('works with large arrays', () => {
      const items = Array.from({ length: 200 }, (_, i) => i + 1)
      const ft = FenwickTree2.fromArray(items)
      expect(ft.size).toBe(200)
      expect(ft.query(199)).toBe(20100)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty tree', () => {
      const ft = new FenwickTree2<number>()
      const collected: number[] = []
      for (const item of ft) {
        collected.push(item)
      }
      expect(collected).toEqual([])
    })

    it('iterates over all elements', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const collected: number[] = []
      for (const item of ft) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const ft = new FenwickTree2([10, 20, 30])
      expect([...ft]).toEqual([10, 20, 30])
    })

    it('works with Array.from', () => {
      const ft = new FenwickTree2([5, 6, 7])
      expect(Array.from(ft)).toEqual([5, 6, 7])
    })

    it('works after push', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      expect([...ft]).toEqual([1, 2])
    })

    it('works after set', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(1, 99)
      expect([...ft]).toEqual([1, 99, 3])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty tree', () => {
      const ft = new FenwickTree2<number>()
      let count = 0
      ft.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each element', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const collected: number[] = []
      ft.forEach((item) => { collected.push(item) })
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const ft = new FenwickTree2([10, 20, 30])
      const indices: number[] = []
      ft.forEach((_, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct item and index pairs', () => {
      const ft = new FenwickTree2([10, 20, 30])
      const pairs: [number, number][] = []
      ft.forEach((item, index) => { pairs.push([item, index]) })
      expect(pairs).toEqual([[10, 0], [20, 1], [30, 2]])
    })

    it('works with single element', () => {
      const ft = new FenwickTree2([42])
      const collected: number[] = []
      ft.forEach((item) => { collected.push(item) })
      expect(collected).toEqual([42])
    })

    it('reflects modifications', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.set(1, 99)
      const collected: number[] = []
      ft.forEach((item) => { collected.push(item) })
      expect(collected).toEqual([1, 99, 3])
    })
  })

  describe('custom BinaryOperation (multiply)', () => {
    const mulOp = {
      add: (a: number, b: number) => a * b,
      subtract: (a: number, b: number) => a / b,
      identity: 1,
    }

    it('creates tree with multiply operation', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      expect(ft.size).toBe(3)
    })

    it('computes prefix product', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      expect(ft.query(0)).toBe(2)
      expect(ft.query(1)).toBe(6)
      expect(ft.query(2)).toBe(24)
    })

    it('computes range product', () => {
      const ft = new FenwickTree2([2, 3, 4, 5], mulOp)
      expect(ft.rangeQuery(1, 3)).toBe(60)
    })

    it('handles update with multiply', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      ft.update(1, 2)
      expect(ft.get(1)).toBe(6)
      expect(ft.query(2)).toBe(48)
    })

    it('handles set with multiply', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      ft.set(1, 5)
      expect(ft.get(1)).toBe(5)
      expect(ft.query(2)).toBe(40)
    })

    it('handles push with multiply', () => {
      const ft = new FenwickTree2([2, 3], mulOp)
      ft.push(4)
      expect(ft.size).toBe(3)
      expect(ft.query(2)).toBe(24)
    })

    it('handles pop with multiply', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      expect(ft.pop()).toBe(4)
      expect(ft.query(1)).toBe(6)
    })

    it('clone preserves custom operation', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      const cloned = ft.clone()
      expect(cloned.query(2)).toBe(24)
    })

    it('fromArray with custom operation', () => {
      const ft = FenwickTree2.fromArray([2, 3, 4, 5], mulOp)
      expect(ft.query(3)).toBe(120)
    })

    it('toArray with multiply', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      expect(ft.toArray()).toEqual([2, 3, 4])
    })

    it('clear and rebuild with multiply', () => {
      const ft = new FenwickTree2([2, 3], mulOp)
      ft.clear()
      ft.push(5)
      ft.push(6)
      expect(ft.query(1)).toBe(30)
    })

    it('iteration with multiply', () => {
      const ft = new FenwickTree2([2, 3, 4], mulOp)
      expect([...ft]).toEqual([2, 3, 4])
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const ft = new FenwickTree2<number>()
      ft.push(42)
      expect(ft.size).toBe(1)
      expect(ft.get(0)).toBe(42)
      expect(ft.isEmpty).toBe(false)
      expect(ft.pop()).toBe(42)
      expect(ft.isEmpty).toBe(true)
    })

    it('handles large tree operations', () => {
      const items = Array.from({ length: 500 }, (_, i) => i + 1)
      const ft = new FenwickTree2(items)
      expect(ft.size).toBe(500)
      expect(ft.query(499)).toBe(125250)
      expect(ft.rangeQuery(99, 199)).toBe(15150)
    })

    it('handles mixed operations', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      ft.push(3)
      ft.set(1, 20)
      expect(ft.get(1)).toBe(20)
      ft.pop()
      expect(ft.toArray()).toEqual([1, 20])
      ft.push(30)
      ft.push(40)
      expect(ft.rangeQuery(1, 3)).toBe(90)
    })

    it('handles zero values correctly', () => {
      const ft = new FenwickTree2([0, 5, 0, 3, 0])
      expect(ft.query(4)).toBe(8)
      expect(ft.rangeQuery(1, 3)).toBe(8)
    })

    it('handles all same values', () => {
      const ft = new FenwickTree2([5, 5, 5, 5, 5])
      expect(ft.query(4)).toBe(25)
      expect(ft.rangeQuery(1, 3)).toBe(15)
    })

    it('handles alternating positive negative', () => {
      const ft = new FenwickTree2([1, -1, 1, -1, 1])
      expect(ft.query(4)).toBe(1)
      expect(ft.rangeQuery(1, 3)).toBe(-1)
    })

    it('handles very large values', () => {
      const ft = new FenwickTree2([1e9, 2e9, 3e9])
      expect(ft.query(2)).toBe(6e9)
    })

    it('handles floating point values', () => {
      const ft = new FenwickTree2([1.5, 2.5, 3.5])
      expect(ft.query(2)).toBeCloseTo(7.5)
    })

    it('clone and modify independently', () => {
      const ft = new FenwickTree2([1, 2, 3])
      const clone = ft.clone()
      clone.pop()
      clone.push(99)
      expect(ft.toArray()).toEqual([1, 2, 3])
      expect(clone.toArray()).toEqual([1, 2, 99])
    })

    it('fromArray and constructor produce equivalent trees', () => {
      const items = [1, 2, 3, 4, 5]
      const ft1 = new FenwickTree2(items)
      const ft2 = FenwickTree2.fromArray(items)
      expect(ft1.toArray()).toEqual(ft2.toArray())
      expect(ft1.size).toBe(ft2.size)
      expect(ft1.query(4)).toBe(ft2.query(4))
    })

    it('handles push after construction with values', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.push(4)
      ft.push(5)
      expect(ft.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(ft.query(4)).toBe(15)
    })

    it('handles update after push', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      ft.push(3)
      ft.update(1, 10)
      expect(ft.get(1)).toBe(12)
      expect(ft.query(2)).toBe(16)
    })

    it('handles set after push', () => {
      const ft = new FenwickTree2<number>()
      ft.push(1)
      ft.push(2)
      ft.push(3)
      ft.set(1, 50)
      expect(ft.get(1)).toBe(50)
      expect(ft.query(2)).toBe(54)
    })

    it('handles rangeQuery after push and update', () => {
      const ft = new FenwickTree2([10, 20, 30])
      ft.push(40)
      ft.update(1, 5)
      expect(ft.rangeQuery(0, 3)).toBe(105)
    })

    it('handles clear and rebuild', () => {
      const ft = new FenwickTree2([1, 2, 3])
      ft.clear()
      ft.push(10)
      ft.push(20)
      ft.push(30)
      expect(ft.query(2)).toBe(60)
      expect(ft.toArray()).toEqual([10, 20, 30])
    })

    it('handles many push/pop cycles', () => {
      const ft = new FenwickTree2<number>()
      for (let i = 0; i < 20; i++) {
        ft.push(i + 1)
      }
      for (let i = 0; i < 10; i++) {
        ft.pop()
      }
      expect(ft.size).toBe(10)
      expect(ft.query(9)).toBe(55)
      for (let i = 0; i < 10; i++) {
        ft.push(100 + i)
      }
      expect(ft.size).toBe(20)
    })

    it('prefix sums are consistent after complex operations', () => {
      const ft = new FenwickTree2([1, 2, 3, 4, 5, 6, 7, 8])
      ft.set(3, 100)
      ft.update(0, 50)
      ft.push(10)
      ft.pop()
      expect(ft.query(0)).toBe(51)
      expect(ft.query(3)).toBe(156)
      expect(ft.query(7)).toBe(182)
      expect(ft.rangeQuery(2, 5)).toBe(114)
    })
  })
})
