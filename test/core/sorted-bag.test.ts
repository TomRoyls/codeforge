import { describe, it, expect, beforeEach } from 'vitest'
import { SortedBag } from '../../src/core/sorted-bag/sorted-bag.js'
import type { SortedBagOptions } from '../../src/core/sorted-bag/types.js'

describe('SortedBag', () => {
  describe('constructor', () => {
    it('creates empty bag with no options', () => {
      const bag = new SortedBag<number>()
      expect(bag.size).toBe(0)
    })

    it('creates bag with default comparator', () => {
      const bag = new SortedBag<number>()
      bag.add(3)
      bag.add(1)
      bag.add(2)
      expect(bag.toArray()).toEqual([1, 2, 3])
    })

    it('creates bag with custom comparator', () => {
      const opts: SortedBagOptions<number> = { comparator: (a, b) => b - a }
      const bag = new SortedBag<number>(opts)
      bag.add(1)
      bag.add(3)
      bag.add(2)
      expect(bag.toArray()).toEqual([3, 2, 1])
    })

    it('creates bag with undefined options', () => {
      const bag = new SortedBag<number>(undefined)
      expect(bag.size).toBe(0)
    })

    it('creates bag with empty options object', () => {
      const bag = new SortedBag<number>({})
      expect(bag.size).toBe(0)
    })

    it('works with string type', () => {
      const bag = new SortedBag<string>()
      bag.add('banana')
      bag.add('apple')
      bag.add('cherry')
      expect(bag.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('add', () => {
    it('adds single element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.size).toBe(1)
      expect(bag.has(5)).toBe(true)
    })

    it('adds multiple elements in sorted order', () => {
      const bag = new SortedBag<number>()
      bag.add(3)
      bag.add(1)
      bag.add(4)
      bag.add(1)
      bag.add(5)
      expect(bag.toArray()).toEqual([1, 1, 3, 4, 5])
    })

    it('allows duplicate elements', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(1)
      expect(bag.size).toBe(3)
      expect(bag.count(1)).toBe(3)
    })

    it('maintains sorted order with negative numbers', () => {
      const bag = new SortedBag<number>()
      bag.add(-3)
      bag.add(0)
      bag.add(-1)
      bag.add(5)
      bag.add(-5)
      expect(bag.toArray()).toEqual([-5, -3, -1, 0, 5])
    })

    it('maintains sorted order with duplicates at boundaries', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.add(1)
      bag.add(5)
      bag.add(1)
      bag.add(3)
      expect(bag.toArray()).toEqual([1, 1, 3, 5, 5])
    })

    it('adds element at beginning', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.add(3)
      bag.add(1)
      expect(bag.first()).toBe(1)
    })

    it('adds element at end', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.last()).toBe(5)
    })

    it('adds element in middle', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(3)
      expect(bag.nth(1)).toBe(3)
    })

    it('adds zero', () => {
      const bag = new SortedBag<number>()
      bag.add(0)
      expect(bag.has(0)).toBe(true)
      expect(bag.size).toBe(1)
    })

    it('adds floating point numbers', () => {
      const bag = new SortedBag<number>()
      bag.add(1.5)
      bag.add(1.1)
      bag.add(1.9)
      expect(bag.toArray()).toEqual([1.1, 1.5, 1.9])
    })
  })

  describe('remove', () => {
    it('removes existing element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.remove(5)).toBe(true)
      expect(bag.size).toBe(0)
    })

    it('removes one of duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(1)
      expect(bag.remove(1)).toBe(true)
      expect(bag.size).toBe(2)
      expect(bag.count(1)).toBe(2)
    })

    it('returns false for non-existent element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      expect(bag.remove(2)).toBe(false)
    })

    it('returns false for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.remove(1)).toBe(false)
    })

    it('removes first element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(1)
      expect(bag.toArray()).toEqual([2, 3])
    })

    it('removes last element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(3)
      expect(bag.toArray()).toEqual([1, 2])
    })

    it('removes middle element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(2)
      expect(bag.toArray()).toEqual([1, 3])
    })

    it('removes and re-adds element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.remove(5)
      expect(bag.has(5)).toBe(false)
      bag.add(5)
      expect(bag.has(5)).toBe(true)
      expect(bag.size).toBe(1)
    })

    it('removes all duplicates one by one', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(1)
      expect(bag.remove(1)).toBe(true)
      expect(bag.remove(1)).toBe(true)
      expect(bag.remove(1)).toBe(true)
      expect(bag.size).toBe(0)
      expect(bag.has(1)).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.has(5)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.has(3)).toBe(false)
    })

    it('returns false for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.has(1)).toBe(false)
    })

    it('finds element with duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      expect(bag.has(1)).toBe(true)
    })

    it('finds first element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.has(1)).toBe(true)
    })

    it('finds last element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.has(3)).toBe(true)
    })

    it('returns false after removal', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.remove(5)
      expect(bag.has(5)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.size).toBe(0)
    })

    it('returns correct size after adds', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.size).toBe(3)
    })

    it('counts duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(1)
      expect(bag.size).toBe(3)
    })

    it('decreases after removal', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.remove(1)
      expect(bag.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.clear()
      expect(bag.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears empty bag', () => {
      const bag = new SortedBag<number>()
      bag.clear()
      expect(bag.size).toBe(0)
    })

    it('clears bag with elements', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.clear()
      expect(bag.size).toBe(0)
      expect(bag.toArray()).toEqual([])
    })

    it('allows adding after clear', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.clear()
      bag.add(2)
      expect(bag.size).toBe(1)
      expect(bag.has(2)).toBe(true)
    })
  })

  describe('count', () => {
    it('returns 0 for non-existent element', () => {
      const bag = new SortedBag<number>()
      expect(bag.count(1)).toBe(0)
    })

    it('returns 0 for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.count(5)).toBe(0)
    })

    it('returns 1 for single element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.count(5)).toBe(1)
    })

    it('returns correct count for duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(3)
      bag.add(3)
      bag.add(3)
      expect(bag.count(3)).toBe(3)
    })

    it('counts only the specified element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(2)
      bag.add(3)
      expect(bag.count(1)).toBe(1)
      expect(bag.count(2)).toBe(2)
      expect(bag.count(3)).toBe(1)
    })

    it('updates count after removal', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(1)
      bag.remove(1)
      expect(bag.count(1)).toBe(2)
    })
  })

  describe('min', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.min()).toBeUndefined()
    })

    it('returns single element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.min()).toBe(5)
    })

    it('returns smallest element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.add(1)
      bag.add(3)
      expect(bag.min()).toBe(1)
    })

    it('returns smallest with duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(5)
      expect(bag.min()).toBe(1)
    })

    it('handles negative numbers', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(3)
      bag.add(-1)
      expect(bag.min()).toBe(-5)
    })
  })

  describe('max', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.max()).toBeUndefined()
    })

    it('returns single element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.max()).toBe(5)
    })

    it('returns largest element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(3)
      expect(bag.max()).toBe(5)
    })

    it('returns largest with duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(5)
      expect(bag.max()).toBe(5)
    })

    it('handles negative numbers', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(-1)
      bag.add(-3)
      expect(bag.max()).toBe(-1)
    })
  })

  describe('nth', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.nth(0)).toBeUndefined()
    })

    it('returns first element at index 0', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.nth(0)).toBe(1)
    })

    it('returns last element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.nth(2)).toBe(3)
    })

    it('returns middle element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.nth(1)).toBe(2)
    })

    it('returns undefined for negative index', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      expect(bag.nth(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      expect(bag.nth(5)).toBeUndefined()
    })

    it('returns correct elements with duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.add(3)
      expect(bag.nth(0)).toBe(1)
      expect(bag.nth(1)).toBe(1)
      expect(bag.nth(2)).toBe(2)
      expect(bag.nth(3)).toBe(3)
      expect(bag.nth(4)).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const bag = new SortedBag<number>()
      bag.add(3)
      bag.add(1)
      bag.add(2)
      expect(bag.toArray()).toEqual([1, 2, 3])
    })

    it('includes duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(1)
      expect(bag.toArray()).toEqual([1, 1, 2])
    })

    it('returns copy of data', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      const arr = bag.toArray()
      arr.push(3)
      expect(bag.size).toBe(2)
    })

    it('reflects current state after removal', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(2)
      expect(bag.toArray()).toEqual([1, 3])
    })
  })

  describe('forEach', () => {
    it('does nothing for empty bag', () => {
      const bag = new SortedBag<number>()
      const items: number[] = []
      bag.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('iterates in sorted order', () => {
      const bag = new SortedBag<number>()
      bag.add(3)
      bag.add(1)
      bag.add(2)
      const items: number[] = []
      bag.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const bag = new SortedBag<number>()
      bag.add(10)
      bag.add(20)
      bag.add(30)
      const indices: number[] = []
      bag.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates over duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(1)
      bag.add(2)
      const items: number[] = []
      bag.forEach((item) => items.push(item))
      expect(items).toEqual([1, 1, 2])
    })

    it('iterates single element', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      const items: number[] = []
      bag.forEach((item) => items.push(item))
      expect(items).toEqual([42])
    })
  })

  describe('containsAll', () => {
    it('empty bag contains empty bag', () => {
      const bag1 = new SortedBag<number>()
      const bag2 = new SortedBag<number>()
      expect(bag1.containsAll(bag2)).toBe(true)
    })

    it('non-empty bag contains empty bag', () => {
      const bag1 = new SortedBag<number>()
      bag1.add(1)
      const bag2 = new SortedBag<number>()
      expect(bag1.containsAll(bag2)).toBe(true)
    })

    it('empty bag does not contain non-empty bag', () => {
      const bag1 = new SortedBag<number>()
      const bag2 = new SortedBag<number>()
      bag2.add(1)
      expect(bag1.containsAll(bag2)).toBe(false)
    })

    it('contains all same elements', () => {
      const bag1 = new SortedBag<number>()
      bag1.add(1)
      bag1.add(2)
      bag1.add(3)
      const bag2 = new SortedBag<number>()
      bag2.add(1)
      bag2.add(2)
      expect(bag1.containsAll(bag2)).toBe(true)
    })

    it('contains all with duplicates', () => {
      const bag1 = new SortedBag<number>()
      bag1.add(1)
      bag1.add(1)
      bag1.add(2)
      const bag2 = new SortedBag<number>()
      bag2.add(1)
      bag2.add(1)
      expect(bag1.containsAll(bag2)).toBe(true)
    })

    it('does not contain when not enough duplicates', () => {
      const bag1 = new SortedBag<number>()
      bag1.add(1)
      bag1.add(2)
      const bag2 = new SortedBag<number>()
      bag2.add(1)
      bag2.add(1)
      expect(bag1.containsAll(bag2)).toBe(false)
    })

    it('does not contain missing element', () => {
      const bag1 = new SortedBag<number>()
      bag1.add(1)
      bag1.add(2)
      const bag2 = new SortedBag<number>()
      bag2.add(3)
      expect(bag1.containsAll(bag2)).toBe(false)
    })

    it('self contains self', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      expect(bag.containsAll(bag)).toBe(true)
    })
  })

  describe('addAll', () => {
    it('adds empty array', () => {
      const bag = new SortedBag<number>()
      bag.addAll([])
      expect(bag.size).toBe(0)
    })

    it('adds multiple elements', () => {
      const bag = new SortedBag<number>()
      bag.addAll([3, 1, 2])
      expect(bag.toArray()).toEqual([1, 2, 3])
    })

    it('adds elements with duplicates', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 1, 3, 2])
      expect(bag.toArray()).toEqual([1, 1, 2, 2, 3])
    })

    it('adds to existing elements', () => {
      const bag = new SortedBag<number>()
      bag.add(2)
      bag.add(4)
      bag.addAll([1, 3, 5])
      expect(bag.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('adds single element array', () => {
      const bag = new SortedBag<number>()
      bag.addAll([42])
      expect(bag.size).toBe(1)
      expect(bag.has(42)).toBe(true)
    })
  })

  describe('removeAll', () => {
    it('removes from empty bag', () => {
      const bag = new SortedBag<number>()
      bag.removeAll([1, 2, 3])
      expect(bag.size).toBe(0)
    })

    it('removes multiple elements', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3, 4, 5])
      bag.removeAll([1, 3, 5])
      expect(bag.toArray()).toEqual([2, 4])
    })

    it('removes one instance per occurrence in list', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 1, 1, 2])
      bag.removeAll([1, 1])
      expect(bag.toArray()).toEqual([1, 2])
    })

    it('ignores non-existent elements', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.removeAll([3, 4, 5])
      expect(bag.toArray()).toEqual([1, 2])
    })

    it('removes with empty array', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.removeAll([])
      expect(bag.size).toBe(2)
    })
  })

  describe('retainAll', () => {
    it('retains nothing from empty bag', () => {
      const bag = new SortedBag<number>()
      bag.retainAll([1, 2, 3])
      expect(bag.size).toBe(0)
    })

    it('retains all matching elements', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3, 4, 5])
      bag.retainAll([1, 3, 5])
      expect(bag.toArray()).toEqual([1, 3, 5])
    })

    it('respects duplicate limits', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 1, 1, 2, 3])
      bag.retainAll([1, 1])
      expect(bag.toArray()).toEqual([1, 1])
    })

    it('retains nothing with empty array', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3])
      bag.retainAll([])
      expect(bag.size).toBe(0)
    })

    it('retains all when all match', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3])
      bag.retainAll([1, 2, 3])
      expect(bag.toArray()).toEqual([1, 2, 3])
    })

    it('ignores items in retain list not in bag', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3])
      bag.retainAll([1, 2, 3, 4, 5])
      expect(bag.toArray()).toEqual([1, 2, 3])
    })

    it('retains correct duplicates', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 1, 2, 2, 3, 3])
      bag.retainAll([1, 2, 2, 3])
      expect(bag.toArray()).toEqual([1, 2, 2, 3])
    })
  })

  describe('first', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.first()).toBeUndefined()
    })

    it('returns only element', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      expect(bag.first()).toBe(42)
    })

    it('returns smallest element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.add(1)
      bag.add(3)
      expect(bag.first()).toBe(1)
    })
  })

  describe('last', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.last()).toBeUndefined()
    })

    it('returns only element', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      expect(bag.last()).toBe(42)
    })

    it('returns largest element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(3)
      expect(bag.last()).toBe(5)
    })
  })

  describe('lower', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.lower(5)).toBeUndefined()
    })

    it('returns undefined when no smaller element', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.add(10)
      expect(bag.lower(3)).toBeUndefined()
    })

    it('returns greatest element strictly less than item', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(5)
      bag.add(7)
      expect(bag.lower(5)).toBe(3)
    })

    it('returns element less than item when item not in bag', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(7)
      expect(bag.lower(5)).toBe(3)
    })

    it('returns element less with duplicates of item', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(3)
      bag.add(5)
      expect(bag.lower(3)).toBe(1)
    })

    it('handles first element in bag', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      expect(bag.lower(1)).toBeUndefined()
    })

    it('handles single element bag', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.lower(5)).toBeUndefined()
      expect(bag.lower(10)).toBe(5)
    })
  })

  describe('higher', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.higher(5)).toBeUndefined()
    })

    it('returns undefined when no greater element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      expect(bag.higher(10)).toBeUndefined()
    })

    it('returns smallest element strictly greater than item', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(5)
      bag.add(7)
      expect(bag.higher(3)).toBe(5)
    })

    it('returns element greater when item not in bag', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(7)
      expect(bag.higher(3)).toBe(5)
    })

    it('returns element greater with duplicates of item', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(3)
      bag.add(5)
      expect(bag.higher(3)).toBe(5)
    })

    it('handles last element in bag', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      expect(bag.higher(5)).toBeUndefined()
    })

    it('handles single element bag', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.higher(5)).toBeUndefined()
      expect(bag.higher(1)).toBe(5)
    })
  })

  describe('floor', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.floor(5)).toBeUndefined()
    })

    it('returns equal element when present', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.floor(3)).toBe(3)
    })

    it('returns greatest element less than item when not present', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(7)
      expect(bag.floor(4)).toBe(1)
    })

    it('returns undefined when all elements are greater', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      bag.add(10)
      expect(bag.floor(3)).toBeUndefined()
    })

    it('handles duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(3)
      bag.add(3)
      bag.add(5)
      expect(bag.floor(3)).toBe(3)
    })

    it('returns largest duplicate', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(3)
      expect(bag.floor(3)).toBe(3)
    })

    it('handles last element', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      expect(bag.floor(10)).toBe(5)
    })

    it('handles single element bag', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.floor(5)).toBe(5)
      expect(bag.floor(10)).toBe(5)
      expect(bag.floor(3)).toBeUndefined()
    })
  })

  describe('ceiling', () => {
    it('returns undefined for empty bag', () => {
      const bag = new SortedBag<number>()
      expect(bag.ceiling(5)).toBeUndefined()
    })

    it('returns equal element when present', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.ceiling(3)).toBe(3)
    })

    it('returns smallest element greater than item when not present', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(5)
      bag.add(7)
      expect(bag.ceiling(4)).toBe(5)
    })

    it('returns undefined when all elements are less', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      expect(bag.ceiling(5)).toBeUndefined()
    })

    it('handles duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(3)
      bag.add(3)
      expect(bag.ceiling(3)).toBe(3)
    })

    it('handles single element bag', () => {
      const bag = new SortedBag<number>()
      bag.add(5)
      expect(bag.ceiling(5)).toBe(5)
      expect(bag.ceiling(1)).toBe(5)
      expect(bag.ceiling(10)).toBeUndefined()
    })
  })

  describe('custom comparator (descending)', () => {
    it('maintains descending order', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(2)
      expect(bag.toArray()).toEqual([3, 2, 1])
    })

    it('first returns largest element', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(5)
      bag.add(3)
      expect(bag.first()).toBe(5)
    })

    it('last returns smallest element', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(5)
      bag.add(3)
      expect(bag.last()).toBe(1)
    })

    it('min returns largest with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.min()).toBe(5)
    })

    it('max returns smallest with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.max()).toBe(1)
    })

    it('lower works with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.lower(3)).toBe(5)
    })

    it('higher works with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.higher(3)).toBe(1)
    })

    it('removes correctly with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.remove(3)).toBe(true)
      expect(bag.toArray()).toEqual([5, 1])
    })

    it('has works with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.has(3)).toBe(true)
      expect(bag.has(2)).toBe(false)
    })

    it('count works with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(3)
      bag.add(3)
      bag.add(1)
      expect(bag.count(3)).toBe(2)
    })

    it('nth works with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.nth(0)).toBe(5)
      expect(bag.nth(1)).toBe(3)
      expect(bag.nth(2)).toBe(1)
    })

    it('floor and ceiling work with descending comparator', () => {
      const bag = new SortedBag<number>({ comparator: (a, b) => b - a })
      bag.add(1)
      bag.add(3)
      bag.add(5)
      expect(bag.floor(3)).toBe(3)
      expect(bag.ceiling(2)).toBe(1)
    })
  })

  describe('empty bag operations', () => {
    it('has returns false', () => {
      const bag = new SortedBag<number>()
      expect(bag.has(1)).toBe(false)
    })

    it('remove returns false', () => {
      const bag = new SortedBag<number>()
      expect(bag.remove(1)).toBe(false)
    })

    it('count returns 0', () => {
      const bag = new SortedBag<number>()
      expect(bag.count(1)).toBe(0)
    })

    it('min returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.min()).toBeUndefined()
    })

    it('max returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.max()).toBeUndefined()
    })

    it('nth returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.nth(0)).toBeUndefined()
    })

    it('toArray returns empty array', () => {
      const bag = new SortedBag<number>()
      expect(bag.toArray()).toEqual([])
    })

    it('forEach does nothing', () => {
      const bag = new SortedBag<number>()
      let called = false
      bag.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('first returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.first()).toBeUndefined()
    })

    it('last returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.last()).toBeUndefined()
    })

    it('lower returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.lower(5)).toBeUndefined()
    })

    it('higher returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.higher(5)).toBeUndefined()
    })

    it('floor returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.floor(5)).toBeUndefined()
    })

    it('ceiling returns undefined', () => {
      const bag = new SortedBag<number>()
      expect(bag.ceiling(5)).toBeUndefined()
    })

    it('containsAll empty bag returns true', () => {
      const bag = new SortedBag<number>()
      expect(bag.containsAll(new SortedBag<number>())).toBe(true)
    })

    it('addAll empty array does nothing', () => {
      const bag = new SortedBag<number>()
      bag.addAll([])
      expect(bag.size).toBe(0)
    })

    it('removeAll empty array does nothing', () => {
      const bag = new SortedBag<number>()
      bag.removeAll([])
      expect(bag.size).toBe(0)
    })

    it('retainAll empty array does nothing', () => {
      const bag = new SortedBag<number>()
      bag.retainAll([])
      expect(bag.size).toBe(0)
    })

    it('clear does nothing', () => {
      const bag = new SortedBag<number>()
      bag.clear()
      expect(bag.size).toBe(0)
    })
  })

  describe('single element', () => {
    it('add and remove single element', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      expect(bag.size).toBe(1)
      expect(bag.has(42)).toBe(true)
      bag.remove(42)
      expect(bag.size).toBe(0)
      expect(bag.has(42)).toBe(false)
    })

    it('all accessors return same element', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      expect(bag.first()).toBe(42)
      expect(bag.last()).toBe(42)
      expect(bag.min()).toBe(42)
      expect(bag.max()).toBe(42)
      expect(bag.nth(0)).toBe(42)
    })

    it('lower and higher return undefined', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      expect(bag.lower(42)).toBeUndefined()
      expect(bag.higher(42)).toBeUndefined()
    })

    it('floor and ceiling return the element', () => {
      const bag = new SortedBag<number>()
      bag.add(42)
      expect(bag.floor(42)).toBe(42)
      expect(bag.ceiling(42)).toBe(42)
    })
  })

  describe('many elements (10000+)', () => {
    it('handles 10000 elements', () => {
      const bag = new SortedBag<number>()
      for (let i = 10000; i >= 1; i--) {
        bag.add(i)
      }
      expect(bag.size).toBe(10000)
      expect(bag.first()).toBe(1)
      expect(bag.last()).toBe(10000)
      expect(bag.min()).toBe(1)
      expect(bag.max()).toBe(10000)
    })

    it('handles 10000 elements with duplicates', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 5000; i++) {
        bag.add(i)
        bag.add(i)
      }
      expect(bag.size).toBe(10000)
      expect(bag.count(0)).toBe(2)
      expect(bag.count(4999)).toBe(2)
    })

    it('removes from large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      expect(bag.remove(5000)).toBe(true)
      expect(bag.size).toBe(9999)
      expect(bag.has(5000)).toBe(false)
    })

    it('has works on large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      expect(bag.has(0)).toBe(true)
      expect(bag.has(9999)).toBe(true)
      expect(bag.has(10000)).toBe(false)
    })

    it('nth works on large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      expect(bag.nth(0)).toBe(0)
      expect(bag.nth(5000)).toBe(5000)
      expect(bag.nth(9999)).toBe(9999)
    })

    it('toArray returns sorted for large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 9999; i >= 0; i--) {
        bag.add(i)
      }
      const arr = bag.toArray()
      expect(arr.length).toBe(10000)
      expect(arr[0]).toBe(0)
      expect(arr[9999]).toBe(9999)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! >= arr[i - 1]!).toBe(true)
      }
    })

    it('lower and higher on large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      expect(bag.lower(5000)).toBe(4999)
      expect(bag.higher(5000)).toBe(5001)
    })

    it('floor and ceiling on large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      expect(bag.floor(5000)).toBe(5000)
      expect(bag.ceiling(5000)).toBe(5000)
    })

    it('clear large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      bag.clear()
      expect(bag.size).toBe(0)
    })

    it('forEach on large bag', () => {
      const bag = new SortedBag<number>()
      for (let i = 0; i < 1000; i++) {
        bag.add(i)
      }
      let count = 0
      let lastItem = -1
      bag.forEach((item) => {
        expect(item >= lastItem).toBe(true)
        count++
        lastItem = item
      })
      expect(count).toBe(1000)
    })
  })

  describe('negative numbers', () => {
    it('sorts negative numbers', () => {
      const bag = new SortedBag<number>()
      bag.add(-1)
      bag.add(-5)
      bag.add(-3)
      expect(bag.toArray()).toEqual([-5, -3, -1])
    })

    it('sorts mixed positive and negative', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(3)
      bag.add(-1)
      bag.add(0)
      bag.add(5)
      bag.add(-3)
      expect(bag.toArray()).toEqual([-5, -3, -1, 0, 3, 5])
    })

    it('min and max with negatives', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(3)
      bag.add(-1)
      expect(bag.min()).toBe(-5)
      expect(bag.max()).toBe(3)
    })

    it('lower and higher with negatives', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(-1)
      bag.add(3)
      expect(bag.lower(-1)).toBe(-5)
      expect(bag.higher(-1)).toBe(3)
    })

    it('floor and ceiling with negatives', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(-1)
      bag.add(3)
      expect(bag.floor(-2)).toBe(-5)
      expect(bag.ceiling(-2)).toBe(-1)
    })

    it('removes negative numbers', () => {
      const bag = new SortedBag<number>()
      bag.add(-5)
      bag.add(-1)
      bag.add(3)
      expect(bag.remove(-1)).toBe(true)
      expect(bag.toArray()).toEqual([-5, 3])
    })

    it('counts negative duplicates', () => {
      const bag = new SortedBag<number>()
      bag.add(-3)
      bag.add(-3)
      bag.add(-1)
      expect(bag.count(-3)).toBe(2)
      expect(bag.count(-1)).toBe(1)
    })
  })

  describe('string type', () => {
    it('sorts strings', () => {
      const bag = new SortedBag<string>()
      bag.add('cherry')
      bag.add('apple')
      bag.add('banana')
      expect(bag.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles string duplicates', () => {
      const bag = new SortedBag<string>()
      bag.add('a')
      bag.add('b')
      bag.add('a')
      expect(bag.count('a')).toBe(2)
    })

    it('lower and higher with strings', () => {
      const bag = new SortedBag<string>()
      bag.add('apple')
      bag.add('cherry')
      bag.add('banana')
      expect(bag.lower('banana')).toBe('apple')
      expect(bag.higher('banana')).toBe('cherry')
    })
  })

  describe('mixed operations', () => {
    it('add remove add sequence', () => {
      const bag = new SortedBag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(2)
      bag.add(0)
      expect(bag.toArray()).toEqual([0, 1, 3])
    })

    it('multiple operations preserve order', () => {
      const bag = new SortedBag<number>()
      bag.addAll([5, 3, 1, 4, 2])
      bag.remove(3)
      bag.add(6)
      bag.remove(1)
      bag.add(0)
      expect(bag.toArray()).toEqual([0, 2, 4, 5, 6])
    })

    it('addAll then removeAll', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3, 4, 5])
      bag.removeAll([2, 4])
      expect(bag.toArray()).toEqual([1, 3, 5])
    })

    it('addAll then retainAll', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3, 4, 5])
      bag.retainAll([2, 3, 4])
      expect(bag.toArray()).toEqual([2, 3, 4])
    })

    it('navigation methods after modifications', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 3, 5, 7, 9])
      bag.remove(5)
      expect(bag.lower(5)).toBe(3)
      expect(bag.higher(5)).toBe(7)
      expect(bag.floor(5)).toBe(3)
      expect(bag.ceiling(5)).toBe(7)
    })

    it('clear and rebuild', () => {
      const bag = new SortedBag<number>()
      bag.addAll([1, 2, 3])
      bag.clear()
      expect(bag.size).toBe(0)
      bag.addAll([5, 4, 6])
      expect(bag.toArray()).toEqual([4, 5, 6])
    })
  })
})
