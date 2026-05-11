import { describe, it, expect } from 'vitest'
import { OrderedHashSet } from '../../src/core/ordered-hash-set/index.js'

describe('OrderedHashSet', () => {
  describe('constructor', () => {
    it('creates an empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('creates a set with custom hash function', () => {
      const set = new OrderedHashSet<{ id: number }>({
        hash: (v) => v.id,
      })
      set.add({ id: 1 })
      set.add({ id: 2 })
      expect(set.size).toBe(2)
    })

    it('creates a set without options', () => {
      const set = new OrderedHashSet<string>()
      expect(set.size).toBe(0)
    })
  })

  describe('add', () => {
    it('adds a value and returns true', () => {
      const set = new OrderedHashSet<number>()
      expect(set.add(1)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('returns false when adding duplicate', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      expect(set.add(1)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('adds multiple values', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })

    it('preserves insertion order', () => {
      const set = new OrderedHashSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      expect(set.toArray()).toEqual([3, 1, 2])
    })

    it('handles strings', () => {
      const set = new OrderedHashSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles mixed string add with duplicates', () => {
      const set = new OrderedHashSet<string>()
      set.add('x')
      set.add('y')
      set.add('x')
      expect(set.toArray()).toEqual(['x', 'y'])
    })
  })

  describe('delete', () => {
    it('removes a value and returns true', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.size).toBe(0)
    })

    it('returns false for non-existent value', () => {
      const set = new OrderedHashSet<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('removes from middle and preserves order', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.toArray()).toEqual([1, 3])
    })

    it('removes from head', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(1)
      expect(set.toArray()).toEqual([2, 3])
    })

    it('removes from tail', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(3)
      expect(set.toArray()).toEqual([1, 2])
    })

    it('removes the only element', () => {
      const set = new OrderedHashSet<number>()
      set.add(42)
      set.delete(42)
      expect(set.isEmpty).toBe(true)
      expect(set.toArray()).toEqual([])
    })
  })

  describe('has / contains', () => {
    it('has returns true for existing value', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      expect(set.has(1)).toBe(true)
    })

    it('has returns false for non-existent value', () => {
      const set = new OrderedHashSet<number>()
      expect(set.has(1)).toBe(false)
    })

    it('contains is alias for has', () => {
      const set = new OrderedHashSet<number>()
      set.add(5)
      expect(set.contains(5)).toBe(true)
      expect(set.contains(10)).toBe(false)
    })

    it('has works with strings', () => {
      const set = new OrderedHashSet<string>()
      set.add('hello')
      expect(set.has('hello')).toBe(true)
      expect(set.has('world')).toBe(false)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns 0 for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.size).toBe(0)
    })

    it('size returns correct count', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      expect(set.size).toBe(2)
    })

    it('isEmpty returns true for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.isEmpty).toBe(true)
    })

    it('isEmpty returns false after add', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      expect(set.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
      expect(set.toArray()).toEqual([])
    })

    it('clear on empty set is safe', () => {
      const set = new OrderedHashSet<number>()
      set.clear()
      expect(set.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns values in insertion order', () => {
      const set = new OrderedHashSet<number>()
      set.add(3)
      set.add(1)
      set.add(4)
      set.add(1)
      set.add(5)
      expect(set.toArray()).toEqual([3, 1, 4, 5])
    })

    it('returns a copy', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      const arr = set.toArray()
      arr.push(99)
      expect(set.size).toBe(1)
    })
  })

  describe('clone', () => {
    it('clones an empty set', () => {
      const set = new OrderedHashSet<number>()
      const copy = set.clone()
      expect(copy.size).toBe(0)
    })

    it('clones with all elements in order', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const copy = set.clone()
      expect(copy.toArray()).toEqual([1, 2, 3])
      expect(copy.size).toBe(3)
    })

    it('clone is independent', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.add(2)
      const copy = set.clone()
      copy.add(3)
      expect(set.size).toBe(2)
      expect(copy.size).toBe(3)
    })

    it('clone preserves hash function', () => {
      const set = new OrderedHashSet<{ id: number }>({ hash: (v) => v.id })
      set.add({ id: 1 })
      const copy = set.clone()
      expect(copy.has({ id: 1 })).toBe(true)
    })
  })

  describe('fromArray', () => {
    it('creates set from array', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('deduplicates', () => {
      const set = OrderedHashSet.fromArray([1, 2, 1, 3, 2])
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('creates from empty array', () => {
      const set = OrderedHashSet.fromArray([])
      expect(set.size).toBe(0)
    })

    it('accepts options', () => {
      const set = OrderedHashSet.fromArray(
        [{ id: 1 }, { id: 2 }],
        { hash: (v) => v.id }
      )
      expect(set.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates in insertion order', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      const result: number[] = []
      set.forEach((v) => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('provides index', () => {
      const set = OrderedHashSet.fromArray(['a', 'b', 'c'])
      const indices: number[] = []
      set.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty set', () => {
      const set = new OrderedHashSet<number>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      const result: number[] = []
      for (const v of set) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect([...set]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const set = OrderedHashSet.fromArray([5, 6, 7])
      expect(Array.from(set)).toEqual([5, 6, 7])
    })
  })

  describe('first / last', () => {
    it('first returns first element', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      expect(set.first()).toBe(10)
    })

    it('last returns last element', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      expect(set.last()).toBe(30)
    })

    it('first throws on empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(() => set.first()).toThrow(RangeError)
    })

    it('last throws on empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(() => set.last()).toThrow(RangeError)
    })

    it('first and last same for single element', () => {
      const set = OrderedHashSet.fromArray([42])
      expect(set.first()).toBe(42)
      expect(set.last()).toBe(42)
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([3, 4, 5])
      expect(a.union(b).toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('union with empty set returns copy', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = new OrderedHashSet<number>()
      expect(a.union(b).toArray()).toEqual([1, 2])
    })

    it('union of empty with non-empty', () => {
      const a = new OrderedHashSet<number>()
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.union(b).toArray()).toEqual([1, 2])
    })

    it('union of identical sets', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.union(b).toArray()).toEqual([1, 2])
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([2, 3, 4])
      expect(a.intersection(b).toArray()).toEqual([2, 3])
    })

    it('intersection with empty set', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = new OrderedHashSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('intersection of disjoint sets', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([3, 4])
      expect(a.intersection(b).size).toBe(0)
    })

    it('intersection preserves order from first set', () => {
      const a = OrderedHashSet.fromArray([3, 1, 2])
      const b = OrderedHashSet.fromArray([2, 3])
      expect(a.intersection(b).toArray()).toEqual([3, 2])
    })
  })

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([2, 3, 4])
      expect(a.difference(b).toArray()).toEqual([1])
    })

    it('difference with empty set returns copy', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = new OrderedHashSet<number>()
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('difference from superset returns empty', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2, 3])
      expect(a.difference(b).size).toBe(0)
    })

    it('difference preserves order', () => {
      const a = OrderedHashSet.fromArray([5, 3, 1, 2])
      const b = OrderedHashSet.fromArray([3, 2])
      expect(a.difference(b).toArray()).toEqual([5, 1])
    })
  })

  describe('symmetricDifference', () => {
    it('returns symmetric difference', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([2, 3, 4])
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 4])
    })

    it('symmetricDifference of identical sets is empty', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.symmetricDifference(b).size).toBe(0)
    })

    it('symmetricDifference of empty sets is empty', () => {
      const a = new OrderedHashSet<number>()
      const b = new OrderedHashSet<number>()
      expect(a.symmetricDifference(b).size).toBe(0)
    })

    it('symmetricDifference with empty returns copy', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = new OrderedHashSet<number>()
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2])
    })
  })

  describe('isSubsetOf', () => {
    it('subset of superset is true', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('equal sets are subsets', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('non-subset returns false', () => {
      const a = OrderedHashSet.fromArray([1, 4])
      const b = OrderedHashSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('empty set is subset of any set', () => {
      const a = new OrderedHashSet<number>()
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty set is subset of empty set', () => {
      const a = new OrderedHashSet<number>()
      const b = new OrderedHashSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('larger set is not subset of smaller', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('superset of subset is true', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('equal sets are supersets', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('non-superset returns false', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('any set is superset of empty', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = new OrderedHashSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('isDisjointFrom', () => {
    it('disjoint sets return true', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([3, 4])
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('overlapping sets return false', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([2, 3])
      expect(a.isDisjointFrom(b)).toBe(false)
    })

    it('two empty sets are disjoint', () => {
      const a = new OrderedHashSet<number>()
      const b = new OrderedHashSet<number>()
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('empty set is disjoint from any set', () => {
      const a = new OrderedHashSet<number>()
      const b = OrderedHashSet.fromArray([1, 2])
      expect(a.isDisjointFrom(b)).toBe(true)
    })
  })

  describe('equals', () => {
    it('equal sets return true', () => {
      const a = OrderedHashSet.fromArray([1, 2, 3])
      const b = OrderedHashSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('different sizes return false', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('same size different elements return false', () => {
      const a = OrderedHashSet.fromArray([1, 2])
      const b = OrderedHashSet.fromArray([3, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('empty sets are equal', () => {
      const a = new OrderedHashSet<number>()
      const b = new OrderedHashSet<number>()
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('filter', () => {
    it('filters elements', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3, 4, 5])
      const filtered = set.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('filter returns empty when none match', () => {
      const set = OrderedHashSet.fromArray([1, 3, 5])
      const filtered = set.filter((v) => v % 2 === 0)
      expect(filtered.size).toBe(0)
    })

    it('filter returns all when all match', () => {
      const set = OrderedHashSet.fromArray([2, 4, 6])
      const filtered = set.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('filter provides index', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      const filtered = set.filter((_v, i) => i === 1)
      expect(filtered.toArray()).toEqual([20])
    })

    it('filter on empty set', () => {
      const set = new OrderedHashSet<number>()
      const filtered = set.filter(() => true)
      expect(filtered.size).toBe(0)
    })
  })

  describe('map', () => {
    it('maps values', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      const mapped = set.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('map with different type', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      const mapped = set.map((v) => `n${v}`)
      expect(mapped.toArray()).toEqual(['n1', 'n2', 'n3'])
    })

    it('map deduplicates results', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      const mapped = set.map(() => 42)
      expect(mapped.toArray()).toEqual([42])
    })

    it('map provides index', () => {
      const set = OrderedHashSet.fromArray([10, 20])
      const mapped = set.map((v, i) => v + i)
      expect(mapped.toArray()).toEqual([10, 21])
    })
  })

  describe('every', () => {
    it('returns true when all match', () => {
      const set = OrderedHashSet.fromArray([2, 4, 6])
      expect(set.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when some do not match', () => {
      const set = OrderedHashSet.fromArray([2, 3, 6])
      expect(set.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.every(() => false)).toBe(true)
    })
  })

  describe('some', () => {
    it('returns true when some match', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect(set.some((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when none match', () => {
      const set = OrderedHashSet.fromArray([1, 3, 5])
      expect(set.some((v) => v % 2 === 0)).toBe(false)
    })

    it('returns false for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.some(() => true)).toBe(false)
    })
  })

  describe('reduce', () => {
    it('reces values', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect(set.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('returns initial for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.reduce((acc, v) => acc + v, 0)).toBe(0)
    })

    it('reduce with string concatenation', () => {
      const set = OrderedHashSet.fromArray(['a', 'b', 'c'])
      expect(set.reduce((acc, v) => acc + v, '')).toBe('abc')
    })

    it('reduce provides index', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      const result = set.reduce((acc, v, i) => acc + v * i, 0)
      expect(result).toBe(10 * 0 + 20 * 1 + 30 * 2)
    })
  })

  describe('join', () => {
    it('joins with default separator', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect(set.join()).toBe('1,2,3')
    })

    it('joins with custom separator', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect(set.join(' | ')).toBe('1 | 2 | 3')
    })

    it('joins empty set returns empty string', () => {
      const set = new OrderedHashSet<number>()
      expect(set.join()).toBe('')
    })

    it('joins single element', () => {
      const set = OrderedHashSet.fromArray([42])
      expect(set.join('-')).toBe('42')
    })
  })

  describe('at', () => {
    it('returns element at positive index', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      expect(set.at(0)).toBe(10)
      expect(set.at(1)).toBe(20)
      expect(set.at(2)).toBe(30)
    })

    it('returns element at negative index', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      expect(set.at(-1)).toBe(30)
      expect(set.at(-2)).toBe(20)
      expect(set.at(-3)).toBe(10)
    })

    it('throws for out of bounds', () => {
      const set = OrderedHashSet.fromArray([1, 2])
      expect(() => set.at(5)).toThrow(RangeError)
      expect(() => set.at(-3)).toThrow(RangeError)
    })

    it('throws for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(() => set.at(0)).toThrow(RangeError)
    })
  })

  describe('indexOf', () => {
    it('returns index of existing value', () => {
      const set = OrderedHashSet.fromArray([10, 20, 30])
      expect(set.indexOf(10)).toBe(0)
      expect(set.indexOf(20)).toBe(1)
      expect(set.indexOf(30)).toBe(2)
    })

    it('returns -1 for non-existent value', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      expect(set.indexOf(99)).toBe(-1)
    })

    it('returns -1 for empty set', () => {
      const set = new OrderedHashSet<number>()
      expect(set.indexOf(1)).toBe(-1)
    })
  })

  describe('custom hash function', () => {
    it('uses custom hash for objects', () => {
      const set = new OrderedHashSet<{ id: number }>({ hash: (v) => v.id })
      set.add({ id: 1 })
      set.add({ id: 2 })
      set.add({ id: 1 })
      expect(set.size).toBe(2)
    })

    it('custom hash with strings', () => {
      const set = new OrderedHashSet<string>({
        hash: (v) => v.toLowerCase().charCodeAt(0),
      })
      set.add('Hello')
      set.add('hello')
      expect(set.size).toBe(1)
    })
  })

  describe('operations after delete', () => {
    it('can add after delete', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      set.delete(2)
      set.add(4)
      expect(set.toArray()).toEqual([1, 3, 4])
    })

    it('can re-add deleted value', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3])
      set.delete(2)
      set.add(2)
      expect(set.toArray()).toEqual([1, 3, 2])
    })

    it('forEach after multiple deletes', () => {
      const set = OrderedHashSet.fromArray([1, 2, 3, 4, 5])
      set.delete(2)
      set.delete(4)
      const result: number[] = []
      set.forEach((v) => result.push(v))
      expect(result).toEqual([1, 3, 5])
    })
  })

  describe('stress scenarios', () => {
    it('handles many adds and deletes', () => {
      const set = new OrderedHashSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      expect(set.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        set.delete(i)
      }
      expect(set.size).toBe(50)
      expect(set.first()).toBe(50)
      expect(set.last()).toBe(99)
    })

    it('handles sequential add-delete cycles', () => {
      const set = new OrderedHashSet<number>()
      set.add(1)
      set.delete(1)
      set.add(2)
      set.delete(2)
      set.add(3)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([3])
    })

    it('handles boolean values', () => {
      const set = new OrderedHashSet<boolean>()
      set.add(true)
      set.add(false)
      set.add(true)
      expect(set.size).toBe(2)
    })
  })
})
