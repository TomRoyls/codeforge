import { describe, expect, it } from 'vitest'

import { Bag } from '../src/core/bag/bag.js'

describe('Bag', () => {
  describe('constructor', () => {
    it('creates an empty bag', () => {
      const bag = new Bag<string>()
      expect(bag.size).toBe(0)
      expect(bag.uniqueSize).toBe(0)
      expect(bag.isEmpty()).toBe(true)
    })

    it('creates a bag without options', () => {
      const bag = new Bag<number>()
      expect(bag.size).toBe(0)
    })
  })

  describe('add', () => {
    it('adds a single item', () => {
      const bag = new Bag<string>()
      bag.add('a')
      expect(bag.size).toBe(1)
      expect(bag.uniqueSize).toBe(1)
      expect(bag.contains('a')).toBe(true)
    })

    it('adds same item multiple times incrementing count', () => {
      const bag = new Bag<string>()
      bag.add('a')
      bag.add('a')
      bag.add('a')
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(1)
      expect(bag.countOf('a')).toBe(3)
    })

    it('adds items with explicit count', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      expect(bag.size).toBe(5)
      expect(bag.countOf(1)).toBe(5)
    })

    it('ignores count of zero', () => {
      const bag = new Bag<number>()
      bag.add(1, 0)
      expect(bag.size).toBe(0)
      expect(bag.contains(1)).toBe(false)
    })

    it('ignores negative count', () => {
      const bag = new Bag<number>()
      bag.add(1, -3)
      expect(bag.size).toBe(0)
    })

    it('handles different types', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(3)
    })
  })

  describe('remove', () => {
    it('removes a single item from count', () => {
      const bag = new Bag<string>()
      bag.add('a', 3)
      const removed = bag.remove('a')
      expect(removed).toBe(1)
      expect(bag.countOf('a')).toBe(2)
      expect(bag.size).toBe(2)
    })

    it('removes multiple items at once', () => {
      const bag = new Bag<string>()
      bag.add('a', 5)
      const removed = bag.remove('a', 3)
      expect(removed).toBe(3)
      expect(bag.countOf('a')).toBe(2)
    })

    it('removes all of an item when count exceeds stored', () => {
      const bag = new Bag<string>()
      bag.add('a', 2)
      const removed = bag.remove('a', 10)
      expect(removed).toBe(2)
      expect(bag.contains('a')).toBe(false)
      expect(bag.size).toBe(0)
    })

    it('returns zero for non-existent item', () => {
      const bag = new Bag<string>()
      bag.add('a')
      const removed = bag.remove('b')
      expect(removed).toBe(0)
    })

    it('returns zero for empty bag', () => {
      const bag = new Bag<string>()
      const removed = bag.remove('a')
      expect(removed).toBe(0)
    })

    it('ignores count of zero', () => {
      const bag = new Bag<string>()
      bag.add('a', 3)
      const removed = bag.remove('a', 0)
      expect(removed).toBe(0)
      expect(bag.countOf('a')).toBe(3)
    })

    it('ignores negative count', () => {
      const bag = new Bag<string>()
      bag.add('a', 3)
      const removed = bag.remove('a', -2)
      expect(removed).toBe(0)
      expect(bag.countOf('a')).toBe(3)
    })
  })

  describe('countOf', () => {
    it('returns zero for non-existent item', () => {
      const bag = new Bag<string>()
      expect(bag.countOf('x')).toBe(0)
    })

    it('returns correct count for existing item', () => {
      const bag = new Bag<number>()
      bag.add(1, 7)
      expect(bag.countOf(1)).toBe(7)
    })
  })

  describe('contains', () => {
    it('returns false for non-existent item', () => {
      const bag = new Bag<string>()
      expect(bag.contains('a')).toBe(false)
    })

    it('returns true for existing item', () => {
      const bag = new Bag<string>()
      bag.add('a')
      expect(bag.contains('a')).toBe(true)
    })

    it('returns false after removing all', () => {
      const bag = new Bag<string>()
      bag.add('a', 2)
      bag.remove('a', 2)
      expect(bag.contains('a')).toBe(false)
    })
  })

  describe('size and uniqueSize', () => {
    it('tracks total size correctly', () => {
      const bag = new Bag<string>()
      bag.add('a', 3)
      bag.add('b', 2)
      bag.add('c', 1)
      expect(bag.size).toBe(6)
      expect(bag.uniqueSize).toBe(3)
    })

    it('updates after remove', () => {
      const bag = new Bag<string>()
      bag.add('a', 3)
      bag.add('b', 2)
      bag.remove('a', 1)
      expect(bag.size).toBe(4)
      expect(bag.uniqueSize).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty bag', () => {
      const bag = new Bag<number>()
      expect(bag.isEmpty()).toBe(true)
    })

    it('returns false after adding', () => {
      const bag = new Bag<number>()
      bag.add(1)
      expect(bag.isEmpty()).toBe(false)
    })

    it('returns true after removing all', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.remove(1)
      expect(bag.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const bag = new Bag<number>()
      bag.add(1, 10)
      bag.clear()
      expect(bag.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all items', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      bag.clear()
      expect(bag.size).toBe(0)
      expect(bag.uniqueSize).toBe(0)
      expect(bag.contains(1)).toBe(false)
      expect(bag.contains(2)).toBe(false)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.add(2, 2)
      const copy = bag.clone()
      expect(copy.size).toBe(5)
      expect(copy.countOf(1)).toBe(3)
      expect(copy.countOf(2)).toBe(2)
    })

    it('does not affect original when modified', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      const copy = bag.clone()
      copy.add(1)
      expect(bag.countOf(1)).toBe(3)
      expect(copy.countOf(1)).toBe(4)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty bag', () => {
      const bag = new Bag<number>()
      expect(bag.toArray()).toEqual([])
    })

    it('expands counts to repeated elements', () => {
      const bag = new Bag<string>()
      bag.add('a', 3)
      bag.add('b', 2)
      const arr = bag.toArray()
      expect(arr.filter((x) => x === 'a')).toHaveLength(3)
      expect(arr.filter((x) => x === 'b')).toHaveLength(2)
    })
  })

  describe('uniqueValues', () => {
    it('returns empty array for empty bag', () => {
      const bag = new Bag<number>()
      expect(bag.uniqueValues()).toEqual([])
    })

    it('returns distinct values', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      const unique = bag.uniqueValues()
      expect(unique).toContain(1)
      expect(unique).toContain(2)
      expect(unique).toHaveLength(2)
    })
  })

  describe('forEach', () => {
    it('calls callback for each occurrence', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.add(2, 2)
      const visited: number[] = []
      bag.forEach((v) => visited.push(v))
      expect(visited).toHaveLength(5)
      expect(visited.filter((v) => v === 1)).toHaveLength(3)
      expect(visited.filter((v) => v === 2)).toHaveLength(2)
    })

    it('does nothing on empty bag', () => {
      const bag = new Bag<number>()
      let callCount = 0
      bag.forEach(() => callCount++)
      expect(callCount).toBe(0)
    })
  })

  describe('Bag.from', () => {
    it('creates bag from array', () => {
      const bag = Bag.from([1, 2, 2, 3, 3, 3])
      expect(bag.countOf(1)).toBe(1)
      expect(bag.countOf(2)).toBe(2)
      expect(bag.countOf(3)).toBe(3)
      expect(bag.size).toBe(6)
    })

    it('creates bag from Set', () => {
      const bag = Bag.from(new Set([1, 2, 3]))
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(3)
    })

    it('creates empty bag from empty iterable', () => {
      const bag = Bag.from([])
      expect(bag.isEmpty()).toBe(true)
    })
  })

  describe('set operations', () => {
    describe('union', () => {
      it('combines bags taking max count per element', () => {
        const a = Bag.from(['x', 'x', 'y'])
        const b = Bag.from(['x', 'y', 'y', 'z'])
        const result = a.union(b)
        expect(result.countOf('x')).toBe(2)
        expect(result.countOf('y')).toBe(2)
        expect(result.countOf('z')).toBe(1)
      })

      it('does not modify original bags', () => {
        const a = Bag.from(['a'])
        const b = Bag.from(['b'])
        const _result = a.union(b)
        expect(a.countOf('a')).toBe(1)
        expect(a.contains('b')).toBe(false)
      })

      it('handles empty bags', () => {
        const a = new Bag<string>()
        const b = Bag.from(['a'])
        expect(a.union(b).countOf('a')).toBe(1)
        expect(b.union(a).countOf('a')).toBe(1)
      })
    })

    describe('intersection', () => {
      it('returns min count for shared elements', () => {
        const a = Bag.from(['x', 'x', 'x', 'y'])
        const b = Bag.from(['x', 'y', 'y'])
        const result = a.intersection(b)
        expect(result.countOf('x')).toBe(1)
        expect(result.countOf('y')).toBe(1)
        expect(result.contains('z')).toBe(false)
      })

      it('returns empty for disjoint bags', () => {
        const a = Bag.from([1])
        const b = Bag.from([2])
        const result = a.intersection(b)
        expect(result.isEmpty()).toBe(true)
      })
    })

    describe('difference', () => {
      it('returns elements in a not in b', () => {
        const a = Bag.from(['x', 'x', 'x', 'y'])
        const b = Bag.from(['x', 'y', 'y'])
        const result = a.difference(b)
        expect(result.countOf('x')).toBe(2)
        expect(result.contains('y')).toBe(false)
      })

      it('returns empty when b contains all of a', () => {
        const a = Bag.from([1])
        const b = Bag.from([1, 1])
        const result = a.difference(b)
        expect(result.isEmpty()).toBe(true)
      })
    })

    describe('isSubsetOf', () => {
      it('returns true when all counts are <= other', () => {
        const a = Bag.from(['x', 'y'])
        const b = Bag.from(['x', 'x', 'y', 'y'])
        expect(a.isSubsetOf(b)).toBe(true)
      })

      it('returns false when count exceeds other', () => {
        const a = Bag.from(['x', 'x', 'x'])
        const b = Bag.from(['x', 'x'])
        expect(a.isSubsetOf(b)).toBe(false)
      })

      it('returns true for empty bag', () => {
        const a = new Bag<string>()
        const b = Bag.from(['x'])
        expect(a.isSubsetOf(b)).toBe(true)
      })
    })
  })

  describe('stats', () => {
    it('returns zeros for empty bag', () => {
      const bag = new Bag<number>()
      expect(bag.stats()).toEqual({
        size: 0,
        uniqueSize: 0,
        minCount: 0,
        maxCount: 0,
        meanCount: 0,
      })
    })

    it('computes stats correctly', () => {
      const bag = new Bag<string>()
      bag.add('a', 2)
      bag.add('b', 5)
      bag.add('c', 3)
      const stats = bag.stats()
      expect(stats.size).toBe(10)
      expect(stats.uniqueSize).toBe(3)
      expect(stats.minCount).toBe(2)
      expect(stats.maxCount).toBe(5)
      expect(stats.meanCount).toBeCloseTo(10 / 3)
    })
  })
})
