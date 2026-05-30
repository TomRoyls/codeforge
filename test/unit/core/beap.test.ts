import { describe, expect, it } from 'vitest'
import { Beap } from '../../../src/core/beap/index.js'

describe('Beap', () => {
  describe('constructor', () => {
    it('creates empty beap with default comparator', () => {
      const beap = new Beap<number>()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('creates empty beap with custom comparator for max-heap', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('creates beap with custom comparator for objects', () => {
      interface Item { value: number }
      const beap = new Beap<Item>({ comparator: (a, b) => a.value - b.value })
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts single value', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      expect(beap.size).toBe(1)
      expect(beap.isEmpty).toBe(false)
    })

    it('inserts values in ascending order', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.insert(4)
      expect(beap.size).toBe(4)
      expect(beap.peek()).toBe(1)
    })

    it('inserts values in descending order', () => {
      const beap = new Beap<number>()
      beap.insert(4)
      beap.insert(3)
      beap.insert(2)
      beap.insert(1)
      expect(beap.size).toBe(4)
      expect(beap.peek()).toBe(1)
    })

    it('inserts values in random order', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      expect(beap.size).toBe(4)
      expect(beap.peek()).toBe(1)
    })

    it('inserts duplicate values', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      beap.insert(5)
      expect(beap.size).toBe(3)
      expect(beap.peek()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const beap = new Beap<number>()
      beap.insert(-5)
      beap.insert(3)
      beap.insert(-2)
      expect(beap.size).toBe(3)
      expect(beap.peek()).toBe(-5)
    })

    it('inserts with max-heap comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      expect(beap.size).toBe(4)
      expect(beap.peek()).toBe(4)
    })
  })

  describe('extractMin', () => {
    it('throws error when empty', () => {
      const beap = new Beap<number>()
      expect(() => beap.extractMin()).toThrow('Beap is empty')
    })

    it('extracts single element', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      const min = beap.extractMin()
      expect(min).toBe(5)
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('extracts values in sorted order', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      const result = []
      while (!beap.isEmpty) {
        result.push(beap.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('extracts values after multiple inserts', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.extractMin()).toBe(3)
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(5)
    })

    it('extracts with duplicates', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(5)
      beap.insert(3)
      const result = []
      while (!beap.isEmpty) {
        result.push(beap.extractMin())
      }
      expect(result).toEqual([3, 3, 5, 5])
    })

    it('extracts with max-heap comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      const result = []
      while (!beap.isEmpty) {
        result.push(beap.extractMin())
      }
      expect(result).toEqual([4, 3, 2, 1])
    })
  })

  describe('peek', () => {
    it('throws error when empty', () => {
      const beap = new Beap<number>()
      expect(() => beap.peek()).toThrow('Beap is empty')
    })

    it('peeks minimum value without removing', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(3)
    })

    it('peeks after extract', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      beap.extractMin()
      expect(beap.peek()).toBe(2)
    })

    it('peeks with max-heap comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      expect(beap.peek()).toBe(4)
    })
  })

  describe('contains', () => {
    it('returns false for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.contains(5)).toBe(false)
    })

    it('returns true for existing value', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      expect(beap.contains(5)).toBe(true)
      expect(beap.contains(3)).toBe(true)
      expect(beap.contains(7)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.contains(7)).toBe(false)
    })

    it('finds duplicates', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      expect(beap.contains(5)).toBe(true)
    })

    it('works with negative numbers', () => {
      const beap = new Beap<number>()
      beap.insert(-5)
      beap.insert(3)
      expect(beap.contains(-5)).toBe(true)
    })

    it('works with custom comparator', () => {
      interface Item { value: number }
      const beap = new Beap<Item>({ comparator: (a, b) => a.value - b.value })
      const item1 = { value: 5 }
      const item2 = { value: 3 }
      beap.insert(item1)
      beap.insert(item2)
      expect(beap.contains(item1)).toBe(true)
      expect(beap.contains(item2)).toBe(true)
    })
  })

  describe('delete', () => {
    it('returns false for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.delete(5)).toBe(false)
    })

    it('returns false for non-existing value', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.delete(7)).toBe(false)
    })

    it('deletes single element', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      expect(beap.delete(5)).toBe(true)
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('deletes middle element and maintains heap property', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(3)
      beap.insert(5)
      expect(beap.delete(3)).toBe(true)
      expect(beap.size).toBe(2)
      expect(beap.peek()).toBe(1)
      expect(beap.toSortedArray()).toEqual([1, 5])
    })

    it('deletes and re-inserts', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(3)
      beap.insert(5)
      expect(beap.delete(3)).toBe(true)
      expect(beap.size).toBe(2)
      beap.insert(3)
      expect(beap.size).toBe(3)
      expect(beap.toSortedArray()).toEqual([1, 3, 5])
    })

    it('deletes root and maintains heap property', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(3)
      beap.insert(5)
      expect(beap.delete(1)).toBe(true)
      expect(beap.size).toBe(2)
      expect(beap.peek()).toBe(3)
      expect(beap.toSortedArray()).toEqual([3, 5])
    })

    it('deletes last element', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(3)
      beap.insert(5)
      expect(beap.delete(5)).toBe(true)
      expect(beap.size).toBe(2)
      expect(beap.peek()).toBe(1)
      expect(beap.toSortedArray()).toEqual([1, 3])
    })

    it('deletes one of duplicates', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(5)
      expect(beap.delete(5)).toBe(true)
      expect(beap.size).toBe(2)
      expect(beap.contains(5)).toBe(true)
    })

    it('works with custom comparator', () => {
      interface Item { value: number }
      const beap = new Beap<Item>({ comparator: (a, b) => a.value - b.value })
      const item1 = { value: 5 }
      const item2 = { value: 3 }
      const item3 = { value: 7 }
      beap.insert(item1)
      beap.insert(item2)
      beap.insert(item3)
      expect(beap.delete(item2)).toBe(true)
      expect(beap.size).toBe(2)
      expect(beap.toSortedArray()).toEqual([item1, item3])
    })
  })

  describe('size', () => {
    it('returns 0 for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      expect(beap.size).toBe(1)
      beap.insert(3)
      expect(beap.size).toBe(2)
      beap.insert(7)
      expect(beap.size).toBe(3)
    })

    it('returns correct size after extract', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.size).toBe(2)
      beap.extractMin()
      expect(beap.size).toBe(1)
    })

    it('returns correct size after delete', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      expect(beap.size).toBe(3)
      beap.delete(3)
      expect(beap.size).toBe(2)
    })

    it('returns correct size after clear', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.size).toBe(2)
      beap.clear()
      expect(beap.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      expect(beap.isEmpty).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.extractMin()
      beap.extractMin()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.clear()
      expect(beap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty beap', () => {
      const beap = new Beap<number>()
      beap.clear()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('clears beap with elements', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      beap.clear()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
      expect(() => beap.peek()).toThrow('Beap is empty')
    })

    it('allows operations after clear', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.clear()
      beap.insert(7)
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(7)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.toArray()).toEqual([])
    })

    it('returns array with elements', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      const arr = beap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(5)
      expect(arr).toContain(3)
      expect(arr).toContain(7)
    })

    it('returns independent array', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      const arr = beap.toArray()
      arr.push(7)
      expect(beap.size).toBe(2)
    })
  })

  describe('clone', () => {
    it('clones empty beap', () => {
      const beap = new Beap<number>()
      const cloned = beap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones beap with elements', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      const cloned = beap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toSortedArray()).toEqual([3, 5, 7])
    })

    it('clone is independent of original', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      const cloned = beap.clone()
      cloned.insert(7)
      expect(beap.size).toBe(2)
      expect(cloned.size).toBe(3)
      cloned.extractMin()
      expect(beap.toSortedArray()).toEqual([3, 5])
      expect(cloned.toSortedArray()).toEqual([5, 7])
    })

    it('clone maintains comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(3)
      beap.insert(1)
      const cloned = beap.clone()
      cloned.insert(4)
      expect(cloned.peek()).toBe(4)
    })
  })

  describe('fromArray', () => {
    it('creates beap from empty array', () => {
      const beap = Beap.fromArray<number>([])
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('creates beap from array with one element', () => {
      const beap = Beap.fromArray<number>([5])
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(5)
    })

    it('creates valid min-heap from array', () => {
      const beap = Beap.fromArray<number>([3, 1, 4, 2, 5])
      expect(beap.size).toBe(5)
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates beap from array with duplicates', () => {
      const beap = Beap.fromArray<number>([5, 3, 5, 3, 7])
      expect(beap.size).toBe(5)
      expect(beap.toSortedArray()).toEqual([3, 3, 5, 5, 7])
    })

    it('creates beap from array with custom comparator', () => {
      const beap = Beap.fromArray<number>([3, 1, 4, 2], { comparator: (a, b) => b - a })
      expect(beap.size).toBe(4)
      expect(beap.toSortedArray()).toEqual([4, 3, 2, 1])
    })

    it('creates beap from large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      const beap = Beap.fromArray<number>(arr)
      expect(beap.size).toBe(100)
      const sorted = beap.toSortedArray()
      for (let i = 0; i < 100; i++) {
        expect(sorted[i]).toBe(i)
      }
    })
  })

  describe('forEach', () => {
    it('does nothing on empty beap', () => {
      const beap = new Beap<number>()
      let called = false
      beap.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('calls callback for each element', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      const values: number[] = []
      beap.forEach((value) => values.push(value))
      expect(values.length).toBe(3)
      expect(values).toContain(5)
      expect(values).toContain(3)
      expect(values).toContain(7)
    })

    it('passes index to callback', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      const indices: number[] = []
      beap.forEach((_, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty beap', () => {
      const beap = new Beap<number>()
      const values = [...beap]
      expect(values).toEqual([])
    })

    it('iterates over all elements', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      const values = [...beap]
      expect(values.length).toBe(3)
      expect(values).toContain(5)
      expect(values).toContain(3)
      expect(values).toContain(7)
    })

    it('supports for-of loop', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      const values: number[] = []
      for (const value of beap) {
        values.push(value)
      }
      expect(values.length).toBe(3)
    })

    it('allows multiple iterations', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      const first = [...beap]
      const second = [...beap]
      expect(first).toEqual(second)
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.toSortedArray()).toEqual([])
    })

    it('returns sorted array from beap', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4])
    })

    it('does not modify original beap', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      const sizeBefore = beap.size
      beap.toSortedArray()
      expect(beap.size).toBe(sizeBefore)
      expect(beap.peek()).toBe(1)
    })

    it('returns sorted array with duplicates', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(5)
      beap.insert(3)
      expect(beap.toSortedArray()).toEqual([3, 3, 5, 5])
    })

    it('returns reverse sorted with max-heap comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      expect(beap.toSortedArray()).toEqual([4, 3, 2, 1])
    })
  })

  describe('height', () => {
    it('returns -1 for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.height).toBe(-1)
    })

    it('returns 0 for single element', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      expect(beap.height).toBe(0)
    })

    it('returns correct height for multiple elements', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      expect(beap.height).toBe(1)
    })

    it('returns correct height for large beap', () => {
      const beap = new Beap<number>()
      for (let i = 0; i < 100; i++) {
        beap.insert(i)
      }
      expect(beap.height).toBeGreaterThan(0)
    })
  })

  describe('integration tests', () => {
    it('handles insert and extract cycle', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.extractMin()).toBe(3)
      expect(beap.extractMin()).toBe(5)
      expect(beap.isEmpty).toBe(true)
    })

    it('handles mixed operations', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      expect(beap.extractMin()).toBe(3)
      beap.insert(2)
      beap.insert(4)
      expect(beap.peek()).toBe(2)
      expect(beap.delete(5)).toBe(true)
      expect(beap.toSortedArray()).toEqual([2, 4, 7])
    })

    it('handles large number of elements', () => {
      const beap = new Beap<number>()
      const values = Array.from({ length: 200 }, (_, i) => (i * 7) % 1000)
      values.forEach((v) => beap.insert(v))
      expect(beap.size).toBe(200)
      const sorted = beap.toSortedArray()
      expect(sorted.length).toBe(200)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i] >= sorted[i - 1]).toBe(true)
      }
    })

    it('maintains heap property after complex operations', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(15)
      beap.insert(2)
      beap.insert(8)
      beap.insert(20)
      beap.delete(5)
      beap.insert(3)
      expect(beap.peek()).toBe(2)
      expect(beap.toSortedArray()).toEqual([2, 3, 8, 10, 15, 20])
    })
  })
})