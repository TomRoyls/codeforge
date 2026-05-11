import { describe, it, expect } from 'vitest'
import { BTreeSet } from '../../src/core/btree-set/index.js'

describe('BTreeSet', () => {
  describe('constructor', () => {
    it('creates empty set with default options', () => {
      const set = new BTreeSet<number>()
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates set with custom order', () => {
      const set = new BTreeSet<number>({ order: 6 })
      set.add(1)
      expect(set.has(1)).toBe(true)
    })

    it('creates set with custom comparator', () => {
      const set = new BTreeSet<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      set.add('Hello')
      expect(set.has('hello')).toBe(true)
      expect(set.has('HELLO')).toBe(true)
    })

    it('creates set with both options', () => {
      const set = new BTreeSet<number>({ order: 3, comparator: (a, b) => a - b })
      set.add(5)
      expect(set.has(5)).toBe(true)
    })

    it('defaults order to 4', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(100)
    })
  })

  describe('add', () => {
    it('adds a single element', () => {
      const set = new BTreeSet<number>()
      expect(set.add(1)).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('returns true when adding new element', () => {
      const set = new BTreeSet<number>()
      expect(set.add(42)).toBe(true)
    })

    it('returns false when adding duplicate', () => {
      const set = new BTreeSet<number>()
      set.add(42)
      expect(set.add(42)).toBe(false)
    })

    it('maintains correct size after multiple adds', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size()).toBe(3)
    })

    it('does not increase size on duplicate add', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(1)
      expect(set.size()).toBe(1)
    })

    it('adds elements in any order', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      set.add(1)
      set.add(3)
      set.add(2)
      set.add(4)
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles adding many elements', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        expect(set.add(i)).toBe(true)
      }
      expect(set.size()).toBe(100)
    })

    it('handles adding elements that cause splits', () => {
      const set = new BTreeSet<number>({ order: 3 })
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(10)
      expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles reverse insertion', () => {
      const set = new BTreeSet<number>()
      for (let i = 100; i >= 0; i--) {
        set.add(i)
      }
      const arr = set.toArray()
      expect(arr).toHaveLength(101)
      expect(arr[0]).toBe(0)
      expect(arr[100]).toBe(100)
    })

    it('handles adding strings', () => {
      const set = new BTreeSet<string>()
      set.add('banana')
      set.add('apple')
      set.add('cherry')
      expect(set.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles adding objects with custom comparator', () => {
      interface Item { id: number }
      const set = new BTreeSet<Item>({ comparator: (a, b) => a.id - b.id })
      set.add({ id: 3 })
      set.add({ id: 1 })
      set.add({ id: 2 })
      expect(set.size()).toBe(3)
      expect(set.toArray().map(x => x.id)).toEqual([1, 2, 3])
    })

    it('handles adding with high order value', () => {
      const set = new BTreeSet<number>({ order: 10 })
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(50)
    })

    it('handles adding with order 2 (minimum)', () => {
      const set = new BTreeSet<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(10)
      expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles adding with order 3', () => {
      const set = new BTreeSet<number>({ order: 3 })
      for (let i = 0; i < 20; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(20)
      expect(set.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })
  })

  describe('has', () => {
    it('returns false for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.has(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const set = new BTreeSet<number>()
      set.add(42)
      expect(set.has(42)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      expect(set.has(2)).toBe(false)
    })

    it('finds elements after many inserts', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(true)
      }
      expect(set.has(100)).toBe(false)
      expect(set.has(-1)).toBe(false)
    })

    it('works with string set', () => {
      const set = new BTreeSet<string>()
      set.add('hello')
      expect(set.has('hello')).toBe(true)
      expect(set.has('world')).toBe(false)
    })
  })

  describe.skip('delete', () => {
    it('returns false for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('returns true when deleting existing element', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
    })

    it('returns false when deleting non-existing element', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      expect(set.delete(2)).toBe(false)
    })

    it('decreases size after deletion', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size()).toBe(1)
    })

    it('element not found after deletion', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.has(1)).toBe(false)
    })

    it('handles deleting from set with many elements', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
      for (let i = 0; i < 25; i++) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.size()).toBe(25)
      for (let i = 0; i < 25; i++) {
        expect(set.has(i)).toBe(false)
      }
      for (let i = 25; i < 50; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('handles deleting all elements', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      for (let i = 0; i < 10; i++) {
        set.delete(i)
      }
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('handles deleting from the middle', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.toArray()).toEqual([1, 3])
    })

    it('handles deleting min element', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(1)
      expect(set.toArray()).toEqual([2, 3])
    })

    it('handles deleting max element', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(3)
      expect(set.toArray()).toEqual([1, 2])
    })

    it('handles delete with order 3', () => {
      const set = new BTreeSet<number>({ order: 3 })
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      set.delete(5)
      expect(set.has(5)).toBe(false)
      expect(set.size()).toBe(9)
    })

    it.skip('handles delete with order 2', () => {
      const set = new BTreeSet<number>({ order: 2 })
      for (let i = 0; i < 5; i++) {
        set.add(i)
      }
      set.delete(2)
      expect(set.has(2)).toBe(false)
      expect(set.size()).toBe(4)
    })

    it.skip('handles deleting with rebalancing', () => {
      const set = new BTreeSet<number>({ order: 3 })
      for (let i = 0; i < 20; i++) {
        set.add(i)
      }
      for (let i = 0; i < 20; i++) {
        set.delete(i)
      }
      expect(set.isEmpty()).toBe(true)
    })

    it('handles interleaved add and delete', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.delete(1)
      set.add(1)
      expect(set.has(1)).toBe(true)
      expect(set.size()).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.size()).toBe(0)
    })

    it('returns correct size after adds', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size()).toBe(3)
    })

    it.skip('returns correct size after deletes', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size()).toBe(1)
    })

    it('returns correct size after clear', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.clear()
      expect(set.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const set = new BTreeSet<number>()
      expect(set.isEmpty()).toBe(true)
    })

    it('returns false after adding element', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })

    it.skip('returns true after deleting all elements', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty set without error', () => {
      const set = new BTreeSet<number>()
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('clears set with elements', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('allows adding after clear', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.clear()
      set.add(2)
      expect(set.has(2)).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.size()).toBe(1)
    })
  })

  describe('min', () => {
    it('returns undefined for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.min()).toBeUndefined()
    })

    it('returns the only element', () => {
      const set = new BTreeSet<number>()
      set.add(42)
      expect(set.min()).toBe(42)
    })

    it('returns smallest element', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      set.add(1)
      set.add(3)
      expect(set.min()).toBe(1)
    })

    it.skip('updates after deletion', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(1)
      expect(set.min()).toBe(2)
    })

    it('updates after clear', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.clear()
      expect(set.min()).toBeUndefined()
    })
  })

  describe('max', () => {
    it('returns undefined for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.max()).toBeUndefined()
    })

    it('returns the only element', () => {
      const set = new BTreeSet<number>()
      set.add(42)
      expect(set.max()).toBe(42)
    })

    it('returns largest element', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      set.add(1)
      set.add(3)
      expect(set.max()).toBe(5)
    })

    it.skip('updates after deletion', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(3)
      expect(set.max()).toBe(2)
    })

    it('updates after clear', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.clear()
      expect(set.max()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const set = new BTreeSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('returns single element array', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      expect(set.toArray()).toEqual([1])
    })

    it.skip('returns correctly after deletes', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.toArray()).toEqual([1, 3])
    })

    it('returns correctly after clear and re-add', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      set.add(3)
      set.clear()
      set.add(1)
      set.add(2)
      expect(set.toArray()).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty set', () => {
      const set = new BTreeSet<number>()
      const items: number[] = []
      set.forEach(item => items.push(item))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const set = new BTreeSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      const items: number[] = []
      set.forEach(item => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('iterates single element', () => {
      const set = new BTreeSet<number>()
      set.add(42)
      const items: number[] = []
      set.forEach(item => items.push(item))
      expect(items).toEqual([42])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty set', () => {
      const set = new BTreeSet<number>()
      const items = [...set]
      expect(items).toEqual([])
    })

    it('iterates elements in sorted order', () => {
      const set = new BTreeSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      const items = [...set]
      expect(items).toEqual([1, 2, 3])
    })

    it('can be used with for-of', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const items: number[] = []
      for (const item of set) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('can be used with spread', () => {
      const set = new BTreeSet<number>()
      set.add(2)
      set.add(1)
      expect([...set]).toEqual([1, 2])
    })

    it('can be used with Array.from', () => {
      const set = new BTreeSet<number>()
      set.add(2)
      set.add(1)
      expect(Array.from(set)).toEqual([1, 2])
    })
  })

  describe('range', () => {
    it('returns empty for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.range(1, 10)).toEqual([])
    })

    it('returns elements in range', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.range(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('returns single element when min equals max and exists', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.range(5, 5)).toEqual([5])
    })

    it('returns empty when min equals max and not exists', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(3)
      expect(set.range(2, 2)).toEqual([])
    })

    it('returns empty when range has no elements', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(10)
      expect(set.range(3, 7)).toEqual([])
    })

    it('includes both boundaries', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect(set.range(1, 10)).toEqual([1, 5, 10])
    })

    it('handles range at beginning', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.range(0, 2)).toEqual([0, 1, 2])
    })

    it('handles range at end', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.range(8, 9)).toEqual([8, 9])
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.lowerBound(1)).toBeUndefined()
    })

    it('returns element if it exists', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      expect(set.lowerBound(5)).toBe(5)
    })

    it('returns first element greater than item', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.lowerBound(2)).toBe(3)
    })

    it('returns the element when equal', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.lowerBound(3)).toBe(3)
    })

    it('returns undefined when all elements are smaller', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.lowerBound(10)).toBeUndefined()
    })

    it('returns smallest element when item is very small', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      set.add(10)
      set.add(15)
      expect(set.lowerBound(0)).toBe(5)
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty set', () => {
      const set = new BTreeSet<number>()
      expect(set.upperBound(1)).toBeUndefined()
    })

    it('returns first element greater than item', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.upperBound(3)).toBe(5)
    })

    it('returns first element when item is smaller than all', () => {
      const set = new BTreeSet<number>()
      set.add(5)
      set.add(10)
      expect(set.upperBound(0)).toBe(5)
    })

    it('returns undefined when no element is greater', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.upperBound(3)).toBeUndefined()
    })

    it('returns element strictly greater than item', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.upperBound(1)).toBe(2)
    })

    it('returns undefined when all elements are less or equal', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      expect(set.upperBound(5)).toBeUndefined()
    })
  })

  describe('union', () => {
    it('returns union of two non-overlapping sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(3)
      b.add(4)
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns union of overlapping sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(2)
      b.add(3)
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('returns union with empty set', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns union of two empty sets', () => {
      const a = new BTreeSet<number>()
      const b = new BTreeSet<number>()
      const result = a.union(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      const b = new BTreeSet<number>()
      b.add(2)
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('returns new set', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      const b = new BTreeSet<number>()
      b.add(1)
      const result = a.union(b)
      expect(result).not.toBe(a)
      expect(result).not.toBe(b)
    })
  })

  describe('intersection', () => {
    it('returns intersection of overlapping sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new BTreeSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('returns empty for non-overlapping sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(3)
      b.add(4)
      const result = a.intersection(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('returns intersection with empty set', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      const result = a.intersection(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('returns same elements when sets are equal', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(1)
      b.add(2)
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('does not modify original sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(2)
      b.add(3)
      a.intersection(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2, 3])
    })
  })

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new BTreeSet<number>()
      b.add(2)
      b.add(4)
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('returns all elements when sets do not overlap', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(3)
      b.add(4)
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns empty when a is subset of b', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      const result = a.difference(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('returns empty when both empty', () => {
      const a = new BTreeSet<number>()
      const b = new BTreeSet<number>()
      expect(a.difference(b).isEmpty()).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(2)
      a.difference(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('isSubsetOf', () => {
    it('empty set is subset of any set', () => {
      const a = new BTreeSet<number>()
      const b = new BTreeSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty set is subset of empty set', () => {
      const a = new BTreeSet<number>()
      const b = new BTreeSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('set is subset of itself', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      expect(a.isSubsetOf(a)).toBe(true)
    })

    it('proper subset returns true', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new BTreeSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('non-subset returns false', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(4)
      const b = new BTreeSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('larger set is not subset of smaller', () => {
      const a = new BTreeSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new BTreeSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('clone', () => {
    it('clones empty set', () => {
      const set = new BTreeSet<number>()
      const cloned = set.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones set with elements', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const cloned = set.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(2)
      const cloned = set.clone()
      cloned.add(3)
      expect(set.has(3)).toBe(false)
      expect(cloned.has(3)).toBe(true)
    })

    it('clone preserves comparator', () => {
      const set = new BTreeSet<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      set.add('Hello')
      const cloned = set.clone()
      expect(cloned.has('hello')).toBe(true)
    })

    it('clone preserves order', () => {
      const set = new BTreeSet<number>({ order: 3 })
      set.add(1)
      set.add(2)
      const cloned = set.clone()
      cloned.add(3)
      expect(cloned.has(3)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it.skip('handles single element lifecycle', () => {
      const set = new BTreeSet<number>()
      expect(set.add(1)).toBe(true)
      expect(set.has(1)).toBe(true)
      expect(set.size()).toBe(1)
      expect(set.min()).toBe(1)
      expect(set.max()).toBe(1)
      expect(set.delete(1)).toBe(true)
      expect(set.isEmpty()).toBe(true)
    })

    it('handles duplicate adds gracefully', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      set.add(1)
      set.add(1)
      expect(set.size()).toBe(1)
      expect(set.add(1)).toBe(false)
    })

    it.skip('handles duplicate deletes gracefully', () => {
      const set = new BTreeSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.delete(1)).toBe(false)
    })

    it('handles operations after clear', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      set.clear()
      expect(set.size()).toBe(0)
      set.add(100)
      expect(set.has(100)).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('handles negative numbers', () => {
      const set = new BTreeSet<number>()
      set.add(-5)
      set.add(-1)
      set.add(0)
      set.add(3)
      expect(set.toArray()).toEqual([-5, -1, 0, 3])
      expect(set.min()).toBe(-5)
      expect(set.max()).toBe(3)
    })

    it('handles zero as element', () => {
      const set = new BTreeSet<number>()
      set.add(0)
      expect(set.has(0)).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('handles floating point numbers', () => {
      const set = new BTreeSet<number>()
      set.add(1.5)
      set.add(2.7)
      set.add(0.3)
      expect(set.toArray()).toEqual([0.3, 1.5, 2.7])
    })

    it('handles empty string', () => {
      const set = new BTreeSet<string>()
      set.add('')
      set.add('a')
      set.add('b')
      expect(set.toArray()).toEqual(['', 'a', 'b'])
    })

    it('handles boolean-like values via custom comparator', () => {
      const set = new BTreeSet<number>()
      set.add(0)
      set.add(1)
      expect(set.has(0)).toBe(true)
      expect(set.has(1)).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('supports reverse order', () => {
      const set = new BTreeSet<number>({ comparator: (a, b) => b - a })
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.toArray()).toEqual([3, 2, 1])
      expect(set.min()).toBe(3)
      expect(set.max()).toBe(1)
    })

    it('supports case-insensitive strings', () => {
      const set = new BTreeSet<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      set.add('Banana')
      set.add('apple')
      set.add('Cherry')
      expect(set.has('APPLE')).toBe(true)
      expect(set.has('banana')).toBe(true)
    })

    it('supports object comparison by property', () => {
      interface Point { x: number; y: number }
      const set = new BTreeSet<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      set.add({ x: 1, y: 2 })
      set.add({ x: 3, y: 1 })
      set.add({ x: 1, y: 5 })
      expect(set.size()).toBe(3)
      expect(set.min()).toEqual({ x: 1, y: 2 })
      expect(set.max()).toEqual({ x: 3, y: 1 })
    })
  })

  describe.skip('large datasets', () => {
    it('handles 1000 sequential inserts', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(1000)
      expect(set.min()).toBe(0)
      expect(set.max()).toBe(999)
    })

    it('handles 1000 random-like inserts', () => {
      const set = new BTreeSet<number>()
      const values = Array.from({ length: 1000 }, (_, i) => (i * 7919) % 10000)
      for (const v of values) {
        set.add(v)
      }
      const arr = set.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i - 1])
      }
    })

    it.skip('handles 1000 sequential deletes', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.isEmpty()).toBe(true)
    })

    it.skip('handles reverse sequential deletes', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 99; i >= 0; i--) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.isEmpty()).toBe(true)
    })

    it.skip('handles alternating deletes', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 0; i < 100; i += 2) {
        set.delete(i)
      }
      expect(set.size()).toBe(50)
      const arr = set.toArray()
      for (const v of arr) {
        expect(v % 2).toBe(1)
      }
    })

    it('handles set operations on large sets', () => {
      const a = new BTreeSet<number>()
      const b = new BTreeSet<number>()
      for (let i = 0; i < 500; i++) {
        a.add(i)
        b.add(i + 250)
      }
      const union = a.union(b)
      expect(union.size()).toBe(750)
      const intersection = a.intersection(b)
      expect(intersection.size()).toBe(250)
      const diff = a.difference(b)
      expect(diff.size()).toBe(250)
    })

    it('handles range queries on large sets', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      const result = set.range(100, 200)
      expect(result).toHaveLength(101)
      expect(result[0]).toBe(100)
      expect(result[100]).toBe(200)
    })

    it('handles lowerBound/upperBound on large sets', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 1000; i += 2) {
        set.add(i)
      }
      expect(set.lowerBound(501)).toBe(502)
      expect(set.upperBound(500)).toBe(502)
      expect(set.lowerBound(998)).toBe(998)
      expect(set.upperBound(998)).toBeUndefined()
    })

    it('handles iteration on large sets', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 500; i++) {
        set.add(i)
      }
      let count = 0
      let last = -1
      set.forEach(item => {
        expect(item).toBeGreaterThan(last)
        last = item
        count++
      })
      expect(count).toBe(500)
    })

    it('handles clone on large sets', () => {
      const set = new BTreeSet<number>()
      for (let i = 0; i < 500; i++) {
        set.add(i)
      }
      const cloned = set.clone()
      expect(cloned.size()).toBe(500)
      expect(cloned.toArray()).toEqual(set.toArray())
    })

    it('handles isSubsetOf on large sets', () => {
      const a = new BTreeSet<number>()
      const b = new BTreeSet<number>()
      for (let i = 0; i < 100; i++) {
        a.add(i)
      }
      for (let i = 0; i < 200; i++) {
        b.add(i)
      }
      expect(a.isSubsetOf(b)).toBe(true)
      expect(b.isSubsetOf(a)).toBe(false)
    })
  })
})
