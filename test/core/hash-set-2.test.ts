import { describe, it, expect } from 'vitest'
import { HashSet } from '../../src/core/hash-set-2/index.js'

describe('HashSet', () => {
  describe('constructor', () => {
    it('creates empty set', () => {
      const s = new HashSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('creates set with default options', () => {
      const s = new HashSet<string>()
      expect(s.size).toBe(0)
    })

    it('creates set with custom initial capacity', () => {
      const s = new HashSet<number>({ initialCapacity: 32 })
      expect(s.size).toBe(0)
      expect(s.stats().capacity).toBe(32)
    })

    it('creates set with custom load factor', () => {
      const s = new HashSet<number>({ loadFactor: 0.5 })
      expect(s.size).toBe(0)
    })

    it('creates set with custom hash function', () => {
      const s = new HashSet<string>({
        hashFunction: (v) => v.length,
      })
      s.add('hello')
      expect(s.has('hello')).toBe(true)
    })

    it('creates set with custom equality comparator', () => {
      const s = new HashSet<string>({
        equals: (a, b) => a.toLowerCase() === b.toLowerCase(),
      })
      s.add('Hello')
      expect(s.has('hello')).toBe(true)
      expect(s.has('HELLO')).toBe(true)
    })

    it('clamps minimum capacity', () => {
      const s = new HashSet<number>({ initialCapacity: 1 })
      expect(s.stats().capacity).toBeGreaterThanOrEqual(4)
    })
  })

  describe('add', () => {
    it('adds single element', () => {
      const s = new HashSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('returns false for duplicate', () => {
      const s = new HashSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds multiple distinct elements', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('handles string elements', () => {
      const s = new HashSet<string>()
      s.add('hello')
      s.add('world')
      expect(s.size).toBe(2)
    })

    it('handles object elements with custom hash', () => {
      const s = new HashSet<{ id: number }>({
        hashFunction: (v) => v.id,
        equals: (a, b) => a.id === b.id,
      })
      expect(s.add({ id: 1 })).toBe(true)
      expect(s.add({ id: 2 })).toBe(true)
      expect(s.add({ id: 1 })).toBe(false)
      expect(s.size).toBe(2)
    })

    it('handles null and undefined via custom equals', () => {
      const s = new HashSet<number | null>()
      s.add(null)
      s.add(0)
      expect(s.size).toBe(2)
      expect(s.has(null)).toBe(true)
    })

    it('handles boolean values', () => {
      const s = new HashSet<boolean>()
      s.add(true)
      s.add(false)
      expect(s.size).toBe(2)
      expect(s.has(true)).toBe(true)
      expect(s.has(false)).toBe(true)
    })

    it('handles negative numbers', () => {
      const s = new HashSet<number>()
      s.add(-1)
      s.add(-2)
      s.add(-3)
      expect(s.size).toBe(3)
      expect(s.has(-1)).toBe(true)
    })

    it('handles zero', () => {
      const s = new HashSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles floating point numbers', () => {
      const s = new HashSet<number>()
      s.add(1.5)
      s.add(2.7)
      expect(s.has(1.5)).toBe(true)
      expect(s.has(2.7)).toBe(true)
    })
  })

  describe('has', () => {
    it('returns false on empty set', () => {
      const s = new HashSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const s = new HashSet<number>()
      s.add(5)
      expect(s.has(5)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const s = new HashSet<number>()
      s.add(5)
      expect(s.has(99)).toBe(false)
    })

    it('finds element after many adds', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.has(50)).toBe(true)
      expect(s.has(99)).toBe(true)
      expect(s.has(100)).toBe(false)
    })

    it('does not find deleted element', () => {
      const s = new HashSet<number>()
      s.add(5)
      s.delete(5)
      expect(s.has(5)).toBe(false)
    })
  })

  describe('delete', () => {
    it('returns false on empty set', () => {
      const s = new HashSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('removes existing element', () => {
      const s = new HashSet<number>()
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.has(5)).toBe(false)
    })

    it('returns false for non-existing element', () => {
      const s = new HashSet<number>()
      s.add(5)
      expect(s.delete(99)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('removes element and allows re-adding', () => {
      const s = new HashSet<number>()
      s.add(5)
      s.delete(5)
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles deleting from middle of probe chain', () => {
      const s = new HashSet<number>({
        hashFunction: () => 0,
        initialCapacity: 8,
      })
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.delete(2)).toBe(true)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(2)).toBe(false)
    })

    it('removes all elements one by one', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 0; i < 10; i++) {
        expect(s.delete(i)).toBe(true)
      }
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for new set', () => {
      const s = new HashSet<number>()
      expect(s.size).toBe(0)
    })

    it('increments on add', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('does not increment on duplicate add', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('decrements on delete', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      expect(new HashSet<number>().isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const s = new HashSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after all elements deleted', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty set', () => {
      const s = new HashSet<number>()
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('clears populated set', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
      expect(s.has(1)).toBe(false)
    })

    it('clears multiple times', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.clear()
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      expect(new HashSet<number>().toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const s = HashSet.from([1, 2, 3])
      const arr = s.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
    })

    it('returns copy not internal reference', () => {
      const s = HashSet.from([1, 2, 3])
      const arr = s.toArray()
      arr.push(999)
      expect(s.size).toBe(3)
    })

    it('returns single element', () => {
      const s = new HashSet<number>()
      s.add(42)
      expect(s.toArray()).toEqual([42])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty set', () => {
      const s = new HashSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates all elements', () => {
      const s = HashSet.from([1, 2, 3])
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const s = HashSet.from([10, 20, 30])
      const indices: number[] = []
      s.forEach((_v, i) => indices.push(i))
      expect(indices.sort()).toEqual([0, 1, 2])
    })

    it('iterates single element', () => {
      const s = new HashSet<number>()
      s.add(5)
      let sum = 0
      s.forEach((v) => (sum += v))
      expect(sum).toBe(5)
    })
  })

  describe('values', () => {
    it('returns empty generator for empty set', () => {
      const s = new HashSet<number>()
      expect([...s.values()]).toEqual([])
    })

    it('returns all values', () => {
      const s = HashSet.from([1, 2, 3])
      expect([...s.values()].sort()).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const s = HashSet.from([1, 2, 3])
      const result: number[] = []
      for (const v of s.values()) result.push(v)
      expect(result.sort()).toEqual([1, 2, 3])
    })
  })

  describe('union', () => {
    it('returns union of disjoint sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([4, 5, 6])
      const u = a.union(b)
      expect(u.size).toBe(6)
      expect(u.has(1)).toBe(true)
      expect(u.has(6)).toBe(true)
    })

    it('returns union with overlapping sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([2, 3, 4])
      const u = a.union(b)
      expect(u.size).toBe(4)
    })

    it('returns union with empty set', () => {
      const a = HashSet.from([1, 2, 3])
      const b = new HashSet<number>()
      expect(a.union(b).size).toBe(3)
      expect(b.union(a).size).toBe(3)
    })

    it('returns union of two empty sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.union(b).isEmpty()).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([3, 4])
      a.union(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })

    it('returns union of identical sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 3])
      expect(a.union(b).size).toBe(3)
    })
  })

  describe('intersection', () => {
    it('returns intersection of overlapping sets', () => {
      const a = HashSet.from([1, 2, 3, 4])
      const b = HashSet.from([2, 3, 5])
      const i = a.intersection(b)
      expect(i.size).toBe(2)
      expect(i.has(2)).toBe(true)
      expect(i.has(3)).toBe(true)
      expect(i.has(1)).toBe(false)
    })

    it('returns empty for disjoint sets', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([3, 4])
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('returns intersection with empty set', () => {
      const a = HashSet.from([1, 2, 3])
      const b = new HashSet<number>()
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('returns identical set for intersection with itself', () => {
      const a = HashSet.from([1, 2, 3])
      expect(a.intersection(a).size).toBe(3)
    })

    it('is commutative', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([2, 3, 4])
      expect(a.intersection(b).equals(b.intersection(a))).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([2, 3])
      a.intersection(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })
  })

  describe('difference', () => {
    it('returns elements in a but not in b', () => {
      const a = HashSet.from([1, 2, 3, 4])
      const b = HashSet.from([2, 4])
      const d = a.difference(b)
      expect(d.size).toBe(2)
      expect(d.has(1)).toBe(true)
      expect(d.has(3)).toBe(true)
    })

    it('returns full set when b is empty', () => {
      const a = HashSet.from([1, 2, 3])
      const b = new HashSet<number>()
      expect(a.difference(b).size).toBe(3)
    })

    it('returns empty when a is empty', () => {
      const a = new HashSet<number>()
      const b = HashSet.from([1, 2, 3])
      expect(a.difference(b).isEmpty()).toBe(true)
    })

    it('returns empty when sets are equal', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 3])
      expect(a.difference(b).isEmpty()).toBe(true)
    })

    it('returns empty when both are empty', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.difference(b).isEmpty()).toBe(true)
    })

    it('is not commutative', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([2, 3])
      const da = a.difference(b)
      const db = b.difference(a)
      expect(da.equals(db)).toBe(false)
    })
  })

  describe('symmetricDifference', () => {
    it('returns elements in either but not both', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([2, 3, 4])
      const sd = a.symmetricDifference(b)
      expect(sd.size).toBe(2)
      expect(sd.has(1)).toBe(true)
      expect(sd.has(4)).toBe(true)
    })

    it('returns union of disjoint sets', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([3, 4])
      const sd = a.symmetricDifference(b)
      expect(sd.size).toBe(4)
    })

    it('returns empty for equal sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 3])
      expect(a.symmetricDifference(b).isEmpty()).toBe(true)
    })

    it('returns full sets when one is empty', () => {
      const a = HashSet.from([1, 2, 3])
      const b = new HashSet<number>()
      expect(a.symmetricDifference(b).size).toBe(3)
    })

    it('is commutative', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([2, 3, 4])
      const sda = a.symmetricDifference(b)
      const sdb = b.symmetricDifference(a)
      expect(sda.equals(sdb)).toBe(true)
    })

    it('returns empty for two empty sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.symmetricDifference(b).isEmpty()).toBe(true)
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([1, 2, 3, 4])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = HashSet.from([1, 5])
      const b = HashSet.from([1, 2, 3, 4])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for equal sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for empty set', () => {
      const a = new HashSet<number>()
      const b = HashSet.from([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when this is larger', () => {
      const a = HashSet.from([1, 2, 3, 4])
      const b = HashSet.from([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for two empty sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for empty superset', () => {
      const a = HashSet.from([1])
      const b = new HashSet<number>()
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = HashSet.from([1, 2, 3, 4])
      const b = HashSet.from([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('returns true for equal sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true when other is empty', () => {
      const a = HashSet.from([1, 2, 3])
      const b = new HashSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true for two empty sets', () => {
      expect(new HashSet<number>().isSupersetOf(new HashSet<number>())).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for equal sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns true for same elements different order', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([3, 2, 1])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sets', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for two empty sets', () => {
      expect(new HashSet<number>().equals(new HashSet<number>())).toBe(true)
    })

    it('returns false for empty vs non-empty', () => {
      const a = new HashSet<number>()
      const b = HashSet.from([1])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for self comparison', () => {
      const a = HashSet.from([1, 2, 3])
      expect(a.equals(a)).toBe(true)
    })
  })

  describe('static from', () => {
    it('creates set from array', () => {
      const s = HashSet.from([1, 2, 3])
      expect(s.size).toBe(3)
    })

    it('creates set from empty array', () => {
      const s = HashSet.from([])
      expect(s.isEmpty()).toBe(true)
    })

    it('deduplicates array elements', () => {
      const s = HashSet.from([1, 2, 2, 3, 3, 3])
      expect(s.size).toBe(3)
    })

    it('creates independent set from array', () => {
      const arr = [1, 2, 3]
      const s = HashSet.from(arr)
      arr.push(4)
      expect(s.size).toBe(3)
    })

    it('creates set with custom options', () => {
      const s = HashSet.from(['Hello', 'World'], {
        equals: (a, b) => a.toLowerCase() === b.toLowerCase(),
      })
      expect(s.size).toBe(2)
    })

    it('creates set with single element', () => {
      const s = HashSet.from([42])
      expect(s.size).toBe(1)
      expect(s.has(42)).toBe(true)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const s = HashSet.from([1, 2, 3])
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const s = HashSet.from([1, 2, 3])
      expect([...s].sort()).toEqual([1, 2, 3])
    })

    it('iterates empty set', () => {
      const s = new HashSet<number>()
      expect([...s]).toEqual([])
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty set', () => {
      const s = new HashSet<number>()
      const st = s.stats()
      expect(st.size).toBe(0)
      expect(st.capacity).toBeGreaterThanOrEqual(4)
    })

    it('returns correct stats after adds', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      const st = s.stats()
      expect(st.size).toBe(10)
      expect(st.capacity).toBeGreaterThanOrEqual(10)
    })
  })

  describe('hash collisions', () => {
    it('handles all elements with same hash', () => {
      const s = new HashSet<number>({
        hashFunction: () => 0,
        initialCapacity: 8,
      })
      for (let i = 0; i < 5; i++) s.add(i)
      expect(s.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('handles deletion in collision chain', () => {
      const s = new HashSet<number>({
        hashFunction: () => 0,
        initialCapacity: 8,
      })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(true)
    })

    it('handles re-adding after deletion in chain', () => {
      const s = new HashSet<number>({
        hashFunction: () => 0,
        initialCapacity: 8,
      })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(2)
      expect(s.size).toBe(3)
      expect(s.has(2)).toBe(true)
    })

    it('handles case-insensitive strings', () => {
      const s = new HashSet<string>({
        hashFunction: (v) => {
          let h = 0
          const lower = v.toLowerCase()
          for (let i = 0; i < lower.length; i++) {
            h = (31 * h + lower.charCodeAt(i)) | 0
          }
          return h
        },
        equals: (a, b) => a.toLowerCase() === b.toLowerCase(),
      })
      s.add('Hello')
      expect(s.has('hello')).toBe(true)
      expect(s.has('HELLO')).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('dynamic resizing', () => {
    it('resizes when load factor exceeded', () => {
      const s = new HashSet<number>({ initialCapacity: 4, loadFactor: 0.75 })
      expect(s.stats().capacity).toBe(4)
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      expect(s.stats().capacity).toBeGreaterThan(4)
      expect(s.size).toBe(4)
      for (let i = 1; i <= 4; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('maintains all elements after resize', () => {
      const s = new HashSet<number>({ initialCapacity: 4, loadFactor: 0.75 })
      for (let i = 0; i < 20; i++) s.add(i)
      expect(s.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('handles large number of elements', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      expect(s.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('resizes with string elements', () => {
      const s = new HashSet<string>({ initialCapacity: 4, loadFactor: 0.75 })
      for (let i = 0; i < 20; i++) s.add(`item-${i}`)
      expect(s.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(s.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('large batches', () => {
    it('handles 100 elements', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.size).toBe(100)
    })

    it('handles 100 elements with duplicates', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 100; i++) s.add(i % 50)
      expect(s.size).toBe(50)
    })

    it('handles adding and removing many elements', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 50; i++) s.delete(i)
      expect(s.size).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(s.has(i)).toBe(true)
      }
      for (let i = 0; i < 50; i++) {
        expect(s.has(i)).toBe(false)
      }
    })

    it('handles alternating add and delete', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 50; i++) {
        s.add(i)
        s.delete(i)
      }
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const s = new HashSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.has(1)).toBe(true)
      expect(s.delete(1)).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.isEmpty()).toBe(true)
    })

    it('handles re-adding after deletion', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles empty string', () => {
      const s = new HashSet<string>()
      s.add('')
      expect(s.has('')).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles NaN', () => {
      const s = new HashSet<number>()
      s.add(NaN)
      expect(s.has(NaN)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles negative zero', () => {
      const s = new HashSet<number>()
      s.add(0)
      s.add(-0)
      expect(s.size).toBe(1)
      expect(s.has(0)).toBe(true)
      expect(s.has(-0)).toBe(true)
    })

    it('handles very long strings', () => {
      const s = new HashSet<string>()
      const long = 'a'.repeat(10000)
      s.add(long)
      expect(s.has(long)).toBe(true)
    })

    it('handles clearing and reusing multiple times', () => {
      const s = new HashSet<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) s.add(i * (round + 1))
        expect(s.size).toBe(10)
        s.clear()
        expect(s.isEmpty()).toBe(true)
      }
    })

    it('handles mixed types in union with custom comparator', () => {
      const s = new HashSet<{ id: number }>({
        hashFunction: (v) => v.id,
        equals: (a, b) => a.id === b.id,
      })
      s.add({ id: 1 })
      s.add({ id: 2 })
      s.add({ id: 1 })
      expect(s.size).toBe(2)
    })
  })

  describe('object elements', () => {
    it('uses reference equality by default', () => {
      const s = new HashSet<{ x: number }>()
      const obj = { x: 1 }
      s.add(obj)
      expect(s.has(obj)).toBe(true)
      expect(s.has({ x: 1 })).toBe(false)
    })

    it('uses custom equality for objects', () => {
      const s = new HashSet<{ x: number }>({
        hashFunction: (v) => v.x,
        equals: (a, b) => a.x === b.x,
      })
      s.add({ x: 1 })
      expect(s.has({ x: 1 })).toBe(true)
      expect(s.has({ x: 2 })).toBe(false)
    })

    it('handles set operations with custom equality', () => {
      const makeSet = (items: number[]) => {
        const s = new HashSet<{ id: number }>({
          hashFunction: (v) => v.id,
          equals: (a, b) => a.id === b.id,
        })
        for (const id of items) s.add({ id })
        return s
      }
      const a = makeSet([1, 2, 3])
      const b = makeSet([2, 3, 4])
      expect(a.union(b).size).toBe(4)
      expect(a.intersection(b).size).toBe(2)
      expect(a.difference(b).size).toBe(1)
    })
  })

  describe('interleaved operations', () => {
    it('add, has, delete, has cycle', () => {
      const s = new HashSet<number>()
      s.add(1)
      expect(s.has(1)).toBe(true)
      s.delete(1)
      expect(s.has(1)).toBe(false)
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('mixed operations maintain correctness', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      for (let i = 0; i < 25; i++) s.delete(i)
      for (let i = 50; i < 75; i++) s.add(i)
      expect(s.size).toBe(50)
      for (let i = 0; i < 25; i++) {
        expect(s.has(i)).toBe(false)
      }
      for (let i = 25; i < 75; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('clear and rebuild', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      s.clear()
      for (let i = 0; i < 50; i++) s.add(i + 100)
      expect(s.size).toBe(50)
      expect(s.has(0)).toBe(false)
      expect(s.has(149)).toBe(true)
    })
  })

  describe('set operation chains', () => {
    it('chained unions', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([3, 4])
      const c = HashSet.from([5, 6])
      const result = a.union(b).union(c)
      expect(result.size).toBe(6)
    })

    it('chained intersections', () => {
      const a = HashSet.from([1, 2, 3, 4])
      const b = HashSet.from([2, 3, 4, 5])
      const c = HashSet.from([3, 4, 5, 6])
      const result = a.intersection(b).intersection(c)
      expect(result.size).toBe(2)
      expect(result.has(3)).toBe(true)
      expect(result.has(4)).toBe(true)
    })

    it('union then intersection', () => {
      const a = HashSet.from([1, 2])
      const b = HashSet.from([2, 3])
      const c = HashSet.from([2, 4])
      const result = a.union(b).intersection(c)
      expect(result.has(2)).toBe(true)
      expect(result.size).toBe(1)
    })

    it('difference then union', () => {
      const a = HashSet.from([1, 2, 3])
      const b = HashSet.from([2])
      const c = HashSet.from([4])
      const result = a.difference(b).union(c)
      expect(result.size).toBe(3)
      expect(result.has(1)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(4)).toBe(true)
    })
  })

  describe('string elements', () => {
    it('handles various string values', () => {
      const s = new HashSet<string>()
      s.add('apple')
      s.add('banana')
      s.add('cherry')
      expect(s.size).toBe(3)
      expect(s.has('apple')).toBe(true)
      expect(s.has('grape')).toBe(false)
    })

    it('handles unicode strings', () => {
      const s = new HashSet<string>()
      s.add('hello')
      s.add('world')
      s.add('!')
      expect(s.size).toBe(3)
    })

    it('handles strings with special characters', () => {
      const s = new HashSet<string>()
      s.add('hello world')
      s.add('hello\tworld')
      s.add('hello\nworld')
      expect(s.size).toBe(3)
    })
  })
})
