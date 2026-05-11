import { describe, it, expect } from 'vitest'
import { TreapSet } from '../../src/core/treap-set/index.js'
import type { TreapSetOptions } from '../../src/core/treap-set/index.js'

describe('TreapSet', () => {
  describe('constructor', () => {
    it('creates empty set with default options', () => {
      const set = new TreapSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('creates set with custom comparator', () => {
      const set = new TreapSet<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      set.add('Hello')
      expect(set.has('hello')).toBe(true)
      expect(set.has('HELLO')).toBe(true)
    })

    it('accepts options object with undefined comparator', () => {
      const set = new TreapSet<number>({})
      set.add(1)
      expect(set.has(1)).toBe(true)
    })
  })

  describe('add', () => {
    it('adds a single element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('ignores duplicate add', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('maintains correct size after multiple adds', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })

    it('does not increase size on duplicate add', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('adds elements in any order', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(1)
      set.add(3)
      set.add(2)
      set.add(4)
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles adding many elements', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      expect(set.size).toBe(100)
    })

    it('handles reverse insertion', () => {
      const set = new TreapSet<number>()
      for (let i = 100; i >= 0; i--) {
        set.add(i)
      }
      const arr = set.toArray()
      expect(arr).toHaveLength(101)
      expect(arr[0]).toBe(0)
      expect(arr[100]).toBe(100)
    })

    it('handles adding strings', () => {
      const set = new TreapSet<string>()
      set.add('banana')
      set.add('apple')
      set.add('cherry')
      expect(set.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles adding objects with custom comparator', () => {
      interface Item { id: number }
      const set = new TreapSet<Item>({ comparator: (a, b) => a.id - b.id })
      set.add({ id: 3 })
      set.add({ id: 1 })
      set.add({ id: 2 })
      expect(set.size).toBe(3)
      expect(set.toArray().map(x => x.id)).toEqual([1, 2, 3])
    })
  })

  describe('delete', () => {
    it('returns false for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('returns true when deleting existing element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
    })

    it('returns false when deleting non-existing element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.delete(2)).toBe(false)
    })

    it('decreases size after deletion', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })

    it('element not found after deletion', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.has(1)).toBe(false)
    })

    it('handles deleting from set with many elements', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
      for (let i = 0; i < 25; i++) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.size).toBe(25)
      for (let i = 0; i < 25; i++) {
        expect(set.has(i)).toBe(false)
      }
      for (let i = 25; i < 50; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('handles deleting all elements', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      for (let i = 0; i < 10; i++) {
        set.delete(i)
      }
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('handles deleting from the middle', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.toArray()).toEqual([1, 3])
    })

    it('handles deleting min element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(1)
      expect(set.toArray()).toEqual([2, 3])
    })

    it('handles deleting max element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(3)
      expect(set.toArray()).toEqual([1, 2])
    })

    it('handles interleaved add and delete', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.delete(1)
      set.add(1)
      expect(set.has(1)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles deleting root of treap', () => {
      const set = new TreapSet<number>()
      set.add(10)
      set.add(5)
      set.add(15)
      set.add(3)
      set.add(7)
      set.delete(10)
      expect(set.has(10)).toBe(false)
      expect(set.size).toBe(4)
    })
  })

  describe('has', () => {
    it('returns false for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.has(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const set = new TreapSet<number>()
      set.add(42)
      expect(set.has(42)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.has(2)).toBe(false)
    })

    it('finds elements after many inserts', () => {
      const set = new TreapSet<number>()
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
      const set = new TreapSet<string>()
      set.add('hello')
      expect(set.has('hello')).toBe(true)
      expect(set.has('world')).toBe(false)
    })
  })

  describe('min', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.min()).toBeUndefined()
    })

    it('returns the only element', () => {
      const set = new TreapSet<number>()
      set.add(42)
      expect(set.min()).toBe(42)
    })

    it('returns smallest element', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(1)
      set.add(3)
      expect(set.min()).toBe(1)
    })

    it('updates after deletion', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(1)
      expect(set.min()).toBe(2)
    })

    it('updates after clear', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.clear()
      expect(set.min()).toBeUndefined()
    })
  })

  describe('max', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.max()).toBeUndefined()
    })

    it('returns the only element', () => {
      const set = new TreapSet<number>()
      set.add(42)
      expect(set.max()).toBe(42)
    })

    it('returns largest element', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(1)
      set.add(3)
      expect(set.max()).toBe(5)
    })

    it('updates after deletion', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(3)
      expect(set.max()).toBe(2)
    })

    it('updates after clear', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.clear()
      expect(set.max()).toBeUndefined()
    })
  })

  describe('predecessor', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.predecessor(5)).toBeUndefined()
    })

    it('returns the largest element less than value', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.predecessor(4)).toBe(3)
    })

    it('returns element less than value even if value exists', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.predecessor(3)).toBe(1)
    })

    it('returns undefined when no smaller element', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(10)
      expect(set.predecessor(3)).toBeUndefined()
    })

    it('returns predecessor from larger set', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 20; i++) set.add(i)
      expect(set.predecessor(10)).toBe(9)
      expect(set.predecessor(0)).toBeUndefined()
      expect(set.predecessor(19)).toBe(18)
    })
  })

  describe('successor', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.successor(5)).toBeUndefined()
    })

    it('returns the smallest element greater than value', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.successor(2)).toBe(3)
    })

    it('returns element greater than value even if value exists', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.successor(3)).toBe(5)
    })

    it('returns undefined when no greater element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(5)
      expect(set.successor(10)).toBeUndefined()
    })

    it('returns successor from larger set', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 20; i++) set.add(i)
      expect(set.successor(10)).toBe(11)
      expect(set.successor(18)).toBe(19)
      expect(set.successor(19)).toBeUndefined()
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.lowerBound(1)).toBeUndefined()
    })

    it('returns element if it exists', () => {
      const set = new TreapSet<number>()
      set.add(5)
      expect(set.lowerBound(5)).toBe(5)
    })

    it('returns first element greater than or equal to item', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.lowerBound(2)).toBe(3)
    })

    it('returns the element when equal', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.lowerBound(3)).toBe(3)
    })

    it('returns undefined when all elements are smaller', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.lowerBound(10)).toBeUndefined()
    })

    it('returns smallest element when item is very small', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(10)
      set.add(15)
      expect(set.lowerBound(0)).toBe(5)
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.upperBound(1)).toBeUndefined()
    })

    it('returns first element strictly greater than item', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.upperBound(3)).toBe(5)
    })

    it('returns first element when item is smaller than all', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(10)
      expect(set.upperBound(0)).toBe(5)
    })

    it('returns undefined when no element is greater', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.upperBound(3)).toBeUndefined()
    })

    it('returns element strictly greater than item', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.upperBound(1)).toBe(2)
    })

    it('returns undefined when all elements are less or equal', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      expect(set.upperBound(5)).toBeUndefined()
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.size).toBe(0)
    })

    it('returns correct size after adds', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })

    it('returns correct size after deletes', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })

    it('returns correct size after clear', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.clear()
      expect(set.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const set = new TreapSet<number>()
      expect(set.isEmpty).toBe(true)
    })

    it('returns false after adding element', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.isEmpty).toBe(false)
    })

    it('returns true after deleting all elements', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.clear()
      expect(set.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty set without error', () => {
      const set = new TreapSet<number>()
      set.clear()
      expect(set.isEmpty).toBe(true)
    })

    it('clears set with elements', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('allows adding after clear', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.clear()
      set.add(2)
      expect(set.has(2)).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const set = new TreapSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('returns single element array', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.toArray()).toEqual([1])
    })

    it('returns correctly after deletes', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.toArray()).toEqual([1, 3])
    })

    it('returns correctly after clear and re-add', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(3)
      set.clear()
      set.add(1)
      set.add(2)
      expect(set.toArray()).toEqual([1, 2])
    })
  })

  describe('toArraySorted', () => {
    it('returns sorted array same as toArray', () => {
      const set = new TreapSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      expect(set.toArraySorted()).toEqual([1, 2, 3])
      expect(set.toArraySorted()).toEqual(set.toArray())
    })

    it('returns empty array for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.toArraySorted()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty set', () => {
      const set = new TreapSet<number>()
      const items: number[] = []
      set.forEach(item => items.push(item))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const set = new TreapSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      const items: number[] = []
      set.forEach(item => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('iterates single element', () => {
      const set = new TreapSet<number>()
      set.add(42)
      const items: number[] = []
      set.forEach(item => items.push(item))
      expect(items).toEqual([42])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty set', () => {
      const set = new TreapSet<number>()
      const items = [...set]
      expect(items).toEqual([])
    })

    it('iterates elements in sorted order', () => {
      const set = new TreapSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      const items = [...set]
      expect(items).toEqual([1, 2, 3])
    })

    it('can be used with for-of', () => {
      const set = new TreapSet<number>()
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
      const set = new TreapSet<number>()
      set.add(2)
      set.add(1)
      expect([...set]).toEqual([1, 2])
    })

    it('can be used with Array.from', () => {
      const set = new TreapSet<number>()
      set.add(2)
      set.add(1)
      expect(Array.from(set)).toEqual([1, 2])
    })
  })

  describe('clone', () => {
    it('clones empty set', () => {
      const set = new TreapSet<number>()
      const cloned = set.clone()
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones set with elements', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const cloned = set.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      const cloned = set.clone()
      cloned.add(3)
      expect(set.has(3)).toBe(false)
      expect(cloned.has(3)).toBe(true)
    })

    it('clone preserves comparator', () => {
      const set = new TreapSet<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      set.add('Hello')
      const cloned = set.clone()
      expect(cloned.has('hello')).toBe(true)
    })

    it('handles multiple clones', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      const c1 = set.clone()
      const c2 = c1.clone()
      c1.add(3)
      expect(set.size).toBe(2)
      expect(c1.size).toBe(3)
      expect(c2.size).toBe(2)
    })
  })

  describe('static fromArray', () => {
    it('creates set from array', () => {
      const set = TreapSet.fromArray([3, 1, 2])
      expect(set.toArray()).toEqual([1, 2, 3])
      expect(set.size).toBe(3)
    })

    it('creates set from empty array', () => {
      const set = TreapSet.fromArray([])
      expect(set.isEmpty).toBe(true)
    })

    it('creates set from array with duplicates', () => {
      const set = TreapSet.fromArray([1, 2, 2, 3, 1])
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('creates set with custom comparator', () => {
      const set = TreapSet.fromArray(['Banana', 'apple', 'Cherry'], {
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      expect(set.has('APPLE')).toBe(true)
      expect(set.has('banana')).toBe(true)
    })
  })

  describe('rank', () => {
    it('returns 0 for element smaller than all', () => {
      const set = TreapSet.fromArray([10, 20, 30])
      expect(set.rank(5)).toBe(0)
    })

    it('returns correct rank for existing element', () => {
      const set = TreapSet.fromArray([10, 20, 30])
      expect(set.rank(10)).toBe(0)
      expect(set.rank(20)).toBe(1)
      expect(set.rank(30)).toBe(2)
    })

    it('returns correct rank for non-existing element', () => {
      const set = TreapSet.fromArray([10, 20, 30])
      expect(set.rank(15)).toBe(1)
      expect(set.rank(25)).toBe(2)
      expect(set.rank(35)).toBe(3)
    })

    it('returns 0 for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.rank(5)).toBe(0)
    })

    it('handles rank on larger set', () => {
      const set = TreapSet.fromArray(Array.from({ length: 100 }, (_, i) => i))
      for (let i = 0; i < 100; i++) {
        expect(set.rank(i)).toBe(i)
      }
    })
  })

  describe('select', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.select(0)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      const set = TreapSet.fromArray([1, 2, 3])
      expect(set.select(-1)).toBeUndefined()
      expect(set.select(3)).toBeUndefined()
    })

    it('returns correct element at index', () => {
      const set = TreapSet.fromArray([30, 10, 20])
      expect(set.select(0)).toBe(10)
      expect(set.select(1)).toBe(20)
      expect(set.select(2)).toBe(30)
    })

    it('handles select on larger set', () => {
      const set = TreapSet.fromArray(Array.from({ length: 100 }, (_, i) => i))
      for (let i = 0; i < 100; i++) {
        expect(set.select(i)).toBe(i)
      }
    })
  })

  describe('split', () => {
    it('splits empty set', () => {
      const set = new TreapSet<number>()
      const [left, right] = set.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('splits into left and right', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5])
      const [left, right] = set.split(3)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4, 5])
    })

    it('left contains elements strictly less than value', () => {
      const set = TreapSet.fromArray([10, 20, 30, 40])
      const [left, right] = set.split(25)
      expect(left.toArray()).toEqual([10, 20])
      expect(right.toArray()).toEqual([30, 40])
    })

    it('all elements go to left when value is max', () => {
      const set = TreapSet.fromArray([1, 2, 3])
      const [left, right] = set.split(100)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('all elements go to right when value is min', () => {
      const set = TreapSet.fromArray([1, 2, 3])
      const [left, right] = set.split(0)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original set', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5])
      set.split(3)
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('split results are independent', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5])
      const [left, right] = set.split(3)
      left.add(0)
      right.add(10)
      expect(set.size).toBe(5)
    })
  })

  describe('merge', () => {
    it('merges two sets where all this < other', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      const b = TreapSet.fromArray([4, 5, 6])
      const result = a.merge(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merge with empty left', () => {
      const a = new TreapSet<number>()
      const b = TreapSet.fromArray([1, 2, 3])
      const result = a.merge(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('merge with empty right', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      const b = new TreapSet<number>()
      const result = a.merge(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('merge two empty sets', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      const result = a.merge(b)
      expect(result.isEmpty).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([3, 4])
      a.merge(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
    })

    it('returns new set', () => {
      const a = TreapSet.fromArray([1])
      const b = TreapSet.fromArray([2])
      const result = a.merge(b)
      expect(result).not.toBe(a)
      expect(result).not.toBe(b)
    })
  })

  describe('count', () => {
    it('returns 0 for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.count(1, 5)).toBe(0)
    })

    it('returns count of elements in range inclusive', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5])
      expect(set.count(2, 4)).toBe(3)
    })

    it('returns count for full range', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5])
      expect(set.count(1, 5)).toBe(5)
    })

    it('returns count for range with non-existent bounds', () => {
      const set = TreapSet.fromArray([10, 20, 30, 40, 50])
      expect(set.count(15, 45)).toBe(3)
    })

    it('returns 0 when no elements in range', () => {
      const set = TreapSet.fromArray([1, 5, 10])
      expect(set.count(2, 4)).toBe(0)
    })

    it('returns 1 for single element range', () => {
      const set = TreapSet.fromArray([1, 2, 3])
      expect(set.count(2, 2)).toBe(1)
    })

    it('handles count on larger set', () => {
      const set = TreapSet.fromArray(Array.from({ length: 100 }, (_, i) => i))
      expect(set.count(10, 19)).toBe(10)
      expect(set.count(0, 99)).toBe(100)
      expect(set.count(50, 60)).toBe(11)
    })
  })

  describe('first', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.first()).toBeUndefined()
    })

    it('returns min element', () => {
      const set = TreapSet.fromArray([5, 3, 1, 4])
      expect(set.first()).toBe(1)
    })

    it('same as min', () => {
      const set = TreapSet.fromArray([5, 3, 1])
      expect(set.first()).toBe(set.min())
    })
  })

  describe('last', () => {
    it('returns undefined for empty set', () => {
      const set = new TreapSet<number>()
      expect(set.last()).toBeUndefined()
    })

    it('returns max element', () => {
      const set = TreapSet.fromArray([5, 3, 1, 4])
      expect(set.last()).toBe(5)
    })

    it('same as max', () => {
      const set = TreapSet.fromArray([5, 3, 1])
      expect(set.last()).toBe(set.max())
    })
  })

  describe('union', () => {
    it('returns union of two non-overlapping sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([3, 4])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns union of overlapping sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([2, 3])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('returns union with empty set', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = new TreapSet<number>()
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns union of two empty sets', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      const result = a.union(b)
      expect(result.isEmpty).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = TreapSet.fromArray([1])
      const b = TreapSet.fromArray([2])
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('returns new set', () => {
      const a = TreapSet.fromArray([1])
      const b = TreapSet.fromArray([1])
      const result = a.union(b)
      expect(result).not.toBe(a)
      expect(result).not.toBe(b)
    })
  })

  describe('intersection', () => {
    it('returns intersection of overlapping sets', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      const b = TreapSet.fromArray([2, 3, 4])
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('returns empty for non-overlapping sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([3, 4])
      const result = a.intersection(b)
      expect(result.isEmpty).toBe(true)
    })

    it('returns intersection with empty set', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = new TreapSet<number>()
      const result = a.intersection(b)
      expect(result.isEmpty).toBe(true)
    })

    it('returns same elements when sets are equal', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([1, 2])
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('does not modify original sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([2, 3])
      a.intersection(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2, 3])
    })
  })

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      const b = TreapSet.fromArray([2, 4])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('returns all elements when sets do not overlap', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([3, 4])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns empty when a is subset of b', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([1, 2, 3])
      const result = a.difference(b)
      expect(result.isEmpty).toBe(true)
    })

    it('returns empty when both empty', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      expect(a.difference(b).isEmpty).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([2])
      a.difference(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('isSubsetOf', () => {
    it('empty set is subset of any set', () => {
      const a = new TreapSet<number>()
      const b = TreapSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty set is subset of empty set', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('set is subset of itself', () => {
      const a = TreapSet.fromArray([1, 2])
      expect(a.isSubsetOf(a)).toBe(true)
    })

    it('proper subset returns true', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('non-subset returns false', () => {
      const a = TreapSet.fromArray([1, 4])
      const b = TreapSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('larger set is not subset of smaller', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      const b = TreapSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('empty set is superset of empty set', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('set is superset of itself', () => {
      const a = TreapSet.fromArray([1, 2])
      expect(a.isSupersetOf(a)).toBe(true)
    })

    it('larger set is superset of smaller', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      const b = TreapSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('smaller set is not superset of larger', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('non-overlapping sets', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = TreapSet.fromArray([3, 4])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('any set is superset of empty set', () => {
      const a = TreapSet.fromArray([1, 2])
      const b = new TreapSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.has(1)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.min()).toBe(1)
      expect(set.max()).toBe(1)
      set.delete(1)
      expect(set.isEmpty).toBe(true)
    })

    it('handles duplicate adds gracefully', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('handles duplicate deletes gracefully', () => {
      const set = new TreapSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.delete(1)).toBe(false)
    })

    it('handles operations after clear', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      set.clear()
      expect(set.size).toBe(0)
      set.add(100)
      expect(set.has(100)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles negative numbers', () => {
      const set = new TreapSet<number>()
      set.add(-5)
      set.add(-1)
      set.add(0)
      set.add(3)
      expect(set.toArray()).toEqual([-5, -1, 0, 3])
      expect(set.min()).toBe(-5)
      expect(set.max()).toBe(3)
    })

    it('handles zero as element', () => {
      const set = new TreapSet<number>()
      set.add(0)
      expect(set.has(0)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles floating point numbers', () => {
      const set = new TreapSet<number>()
      set.add(1.5)
      set.add(2.7)
      set.add(0.3)
      expect(set.toArray()).toEqual([0.3, 1.5, 2.7])
    })

    it('handles empty string', () => {
      const set = new TreapSet<string>()
      set.add('')
      set.add('a')
      set.add('b')
      expect(set.toArray()).toEqual(['', 'a', 'b'])
    })

    it('handles delete then re-add', () => {
      const set = new TreapSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      set.add(2)
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('handles mixed operations', () => {
      const set = new TreapSet<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.delete(3)
      set.add(1)
      set.delete(7)
      set.add(9)
      expect(set.toArray()).toEqual([1, 5, 9])
    })
  })

  describe('custom comparator', () => {
    it('supports reverse order', () => {
      const set = new TreapSet<number>({ comparator: (a, b) => b - a })
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.toArray()).toEqual([3, 2, 1])
      expect(set.min()).toBe(3)
      expect(set.max()).toBe(1)
    })

    it('supports case-insensitive strings', () => {
      const set = new TreapSet<string>({
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
      const set = new TreapSet<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      set.add({ x: 1, y: 2 })
      set.add({ x: 3, y: 1 })
      set.add({ x: 1, y: 5 })
      expect(set.size).toBe(3)
      expect(set.min()).toEqual({ x: 1, y: 2 })
      expect(set.max()).toEqual({ x: 3, y: 1 })
    })
  })

  describe('large datasets', () => {
    it('handles 1000 sequential inserts', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      expect(set.size).toBe(1000)
      expect(set.min()).toBe(0)
      expect(set.max()).toBe(999)
    })

    it('handles 1000 random-like inserts', () => {
      const set = new TreapSet<number>()
      const values = Array.from({ length: 1000 }, (_, i) => (i * 7919) % 10000)
      for (const v of values) {
        set.add(v)
      }
      const arr = set.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i - 1])
      }
    })

    it('handles 1000 sequential deletes', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.isEmpty).toBe(true)
    })

    it('handles reverse sequential deletes', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 99; i >= 0; i--) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.isEmpty).toBe(true)
    })

    it('handles alternating deletes', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 0; i < 100; i += 2) {
        set.delete(i)
      }
      expect(set.size).toBe(50)
      const arr = set.toArray()
      for (const v of arr) {
        expect(v % 2).toBe(1)
      }
    })

    it('handles set operations on large sets', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      for (let i = 0; i < 500; i++) {
        a.add(i)
        b.add(i + 250)
      }
      const u = a.union(b)
      expect(u.size).toBe(750)
      const inter = a.intersection(b)
      expect(inter.size).toBe(250)
      const diff = a.difference(b)
      expect(diff.size).toBe(250)
    })

    it('handles rank/select on large sets', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 500; i++) {
        set.add(i)
      }
      for (let i = 0; i < 500; i++) {
        expect(set.rank(i)).toBe(i)
        expect(set.select(i)).toBe(i)
      }
    })

    it('handles split on large sets', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      const [left, right] = set.split(50)
      expect(left.size).toBe(50)
      expect(right.size).toBe(50)
      expect(left.max()).toBe(49)
      expect(right.min()).toBe(50)
    })

    it('handles count on large sets', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      expect(set.count(100, 200)).toBe(101)
      expect(set.count(0, 999)).toBe(1000)
    })

    it('handles iteration on large sets', () => {
      const set = new TreapSet<number>()
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
      const set = new TreapSet<number>()
      for (let i = 0; i < 500; i++) {
        set.add(i)
      }
      const cloned = set.clone()
      expect(cloned.size).toBe(500)
      expect(cloned.toArray()).toEqual(set.toArray())
    })

    it('handles isSubsetOf on large sets', () => {
      const a = new TreapSet<number>()
      const b = new TreapSet<number>()
      for (let i = 0; i < 100; i++) {
        a.add(i)
      }
      for (let i = 0; i < 200; i++) {
        b.add(i)
      }
      expect(a.isSubsetOf(b)).toBe(true)
      expect(b.isSubsetOf(a)).toBe(false)
    })

    it('handles add after partial delete', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 50; i++) set.add(i)
      for (let i = 0; i < 25; i++) set.delete(i)
      for (let i = 50; i < 75; i++) set.add(i)
      expect(set.size).toBe(50)
      const arr = set.toArray()
      expect(arr[0]).toBe(25)
      expect(arr[arr.length - 1]).toBe(74)
    })

    it('handles predecessor/successor on large sets', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 100; i++) set.add(i)
      expect(set.predecessor(50)).toBe(49)
      expect(set.successor(50)).toBe(51)
      expect(set.predecessor(0)).toBeUndefined()
      expect(set.successor(99)).toBeUndefined()
    })

    it('handles lowerBound/upperBound on large sets', () => {
      const set = new TreapSet<number>()
      for (let i = 0; i < 1000; i += 2) {
        set.add(i)
      }
      expect(set.lowerBound(501)).toBe(502)
      expect(set.upperBound(500)).toBe(502)
      expect(set.lowerBound(998)).toBe(998)
      expect(set.upperBound(998)).toBeUndefined()
    })
  })

  describe('TreapSetOptions type export', () => {
    it('options type is usable', () => {
      const opts: TreapSetOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const set = new TreapSet<number>(opts)
      set.add(1)
      expect(set.has(1)).toBe(true)
    })
  })

  describe('additional edge cases', () => {
    it('handles lowerBound at exact boundary', () => {
      const set = TreapSet.fromArray([0, 2, 4, 6, 8])
      expect(set.lowerBound(0)).toBe(0)
      expect(set.lowerBound(2)).toBe(2)
      expect(set.lowerBound(4)).toBe(4)
      expect(set.lowerBound(9)).toBeUndefined()
    })

    it('handles upperBound at exact boundary', () => {
      const set = TreapSet.fromArray([0, 2, 4, 6, 8])
      expect(set.upperBound(0)).toBe(2)
      expect(set.upperBound(6)).toBe(8)
      expect(set.upperBound(8)).toBeUndefined()
    })

    it('handles merge after split', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5])
      const [left, right] = set.split(3)
      const merged = left.merge(right)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles multiple splits', () => {
      const set = TreapSet.fromArray([1, 2, 3, 4, 5, 6, 7, 8])
      const [left, right] = set.split(5)
      const [ll, lr] = left.split(2)
      const [rl, rr] = right.split(7)
      expect(ll.toArray()).toEqual([1])
      expect(lr.toArray()).toEqual([2, 3, 4])
      expect(rl.toArray()).toEqual([5, 6])
      expect(rr.toArray()).toEqual([7, 8])
    })

    it('handles forEach mutation safety', () => {
      const set = TreapSet.fromArray([1, 2, 3])
      const collected: number[] = []
      set.forEach(item => collected.push(item))
      expect(collected).toEqual([1, 2, 3])
    })

    it('handles rank after delete', () => {
      const set = TreapSet.fromArray([10, 20, 30, 40, 50])
      set.delete(30)
      expect(set.rank(10)).toBe(0)
      expect(set.rank(20)).toBe(1)
      expect(set.rank(40)).toBe(2)
      expect(set.rank(50)).toBe(3)
    })

    it('handles select after delete', () => {
      const set = TreapSet.fromArray([10, 20, 30, 40, 50])
      set.delete(30)
      expect(set.select(0)).toBe(10)
      expect(set.select(1)).toBe(20)
      expect(set.select(2)).toBe(40)
      expect(set.select(3)).toBe(50)
    })

    it('handles count with equal bounds and non-existent value', () => {
      const set = TreapSet.fromArray([1, 3, 5])
      expect(set.count(2, 2)).toBe(0)
    })

    it('handles isSupersetOf with identical sets', () => {
      const a = TreapSet.fromArray([1, 2, 3])
      expect(a.isSupersetOf(a)).toBe(true)
    })

    it('handles union preserving comparator', () => {
      const a = new TreapSet<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
      })
      a.add('Hello')
      const b = new TreapSet<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
      })
      b.add('World')
      const result = a.union(b)
      expect(result.has('hello')).toBe(true)
      expect(result.has('world')).toBe(true)
    })

    it('handles intersection preserving comparator', () => {
      const a = new TreapSet<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
      })
      a.add('Hello')
      a.add('World')
      const b = new TreapSet<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
      })
      b.add('HELLO')
      b.add('Test')
      const result = a.intersection(b)
      expect(result.has('hello')).toBe(true)
      expect(result.size).toBe(1)
    })

    it('handles difference preserving comparator', () => {
      const a = new TreapSet<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
      })
      a.add('Hello')
      a.add('World')
      const b = new TreapSet<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
      })
      b.add('HELLO')
      const result = a.difference(b)
      expect(result.has('world')).toBe(true)
      expect(result.size).toBe(1)
    })
  })
})
