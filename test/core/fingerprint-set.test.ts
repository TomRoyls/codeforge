import { describe, it, expect } from 'vitest'
import { FingerprintSet } from '../../src/core/fingerprint-set/index.js'
import type { FingerprintSetOptions } from '../../src/core/fingerprint-set/index.js'

describe('FingerprintSet', () => {
  describe('constructor', () => {
    it('creates empty set with default options', () => {
      const set = new FingerprintSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('creates set with custom hashBits', () => {
      const set = new FingerprintSet<number>({ hashBits: 16 })
      set.add(1)
      expect(set.has(1)).toBe(true)
    })

    it('creates set with custom serializer', () => {
      const set = new FingerprintSet<{ id: number }>({
        serialize: (v) => String(v.id),
      })
      set.add({ id: 1 })
      expect(set.has({ id: 1 })).toBe(true)
    })

    it('creates set with both options', () => {
      const set = new FingerprintSet<string>({
        hashBits: 32,
        serialize: (v) => v.toLowerCase(),
      })
      set.add('Hello')
      expect(set.has('hello')).toBe(true)
    })

    it('uses default hashBits of 64', () => {
      const set = new FingerprintSet<number>()
      expect(set.capacity).toBe(1 << 16)
    })

    it('accepts hashBits of 8', () => {
      const set = new FingerprintSet<number>({ hashBits: 8 })
      expect(set.capacity).toBe(256)
    })

    it('accepts hashBits of 16', () => {
      const set = new FingerprintSet<number>({ hashBits: 16 })
      expect(set.capacity).toBe(65536)
    })

    it('accepts hashBits of 32', () => {
      const set = new FingerprintSet<number>({ hashBits: 32 })
      expect(set.capacity).toBe(65536)
    })
  })

  describe('add', () => {
    it('adds a single element', () => {
      const set = new FingerprintSet<number>()
      expect(set.add(1)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('returns true when adding new element', () => {
      const set = new FingerprintSet<number>()
      expect(set.add(42)).toBe(true)
    })

    it('returns false when adding duplicate', () => {
      const set = new FingerprintSet<number>()
      set.add(42)
      expect(set.add(42)).toBe(false)
    })

    it('maintains correct size after multiple adds', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })

    it('does not count duplicates toward size', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('handles string values', () => {
      const set = new FingerprintSet<string>()
      set.add('hello')
      set.add('world')
      expect(set.size).toBe(2)
    })

    it('handles object values with custom serializer', () => {
      const set = new FingerprintSet<{ id: number }>({
        serialize: (v) => String(v.id),
      })
      set.add({ id: 1 })
      set.add({ id: 2 })
      expect(set.size).toBe(2)
    })

    it('handles adding many elements', () => {
      const set = new FingerprintSet<number>()
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      expect(set.size).toBe(1000)
    })
  })

  describe('delete', () => {
    it('removes an existing element', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.size).toBe(0)
    })

    it('returns false for non-existent element', () => {
      const set = new FingerprintSet<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('returns false after element already deleted', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.delete(1)).toBe(false)
    })

    it('maintains correct size after deletes', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.size).toBe(2)
    })

    it('handles deleting from empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.delete(42)).toBe(false)
    })

    it('handles deleting string values', () => {
      const set = new FingerprintSet<string>()
      set.add('hello')
      expect(set.delete('hello')).toBe(true)
      expect(set.has('hello')).toBe(false)
    })
  })

  describe('has / contains', () => {
    it('returns true for existing element', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      expect(set.has(1)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const set = new FingerprintSet<number>()
      expect(set.has(1)).toBe(false)
    })

    it('contains is alias for has', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      expect(set.contains(1)).toBe(true)
      expect(set.contains(2)).toBe(false)
    })

    it('returns false after deletion', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.has(1)).toBe(false)
    })

    it('works with custom serializer', () => {
      const set = new FingerprintSet<{ id: number }>({
        serialize: (v) => String(v.id),
      })
      set.add({ id: 5 })
      expect(set.has({ id: 5 })).toBe(true)
      expect(set.has({ id: 6 })).toBe(false)
    })
  })

  describe('size / isEmpty / count', () => {
    it('size returns 0 for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.size).toBe(0)
    })

    it('isEmpty returns true for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.isEmpty).toBe(true)
    })

    it('isEmpty returns false after adding', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      expect(set.isEmpty).toBe(false)
    })

    it('count returns same as size', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      expect(set.count()).toBe(set.size)
    })

    it('isEmpty returns true after clearing', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.clear()
      expect(set.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('clear on empty set is no-op', () => {
      const set = new FingerprintSet<number>()
      set.clear()
      expect(set.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.clear()
      set.add(2)
      expect(set.size).toBe(1)
      expect(set.has(2)).toBe(true)
      expect(set.has(1)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const arr = set.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('returns new array each time', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      const arr1 = set.toArray()
      const arr2 = set.toArray()
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      const clone = set.clone()
      expect(clone.size).toBe(2)
      expect(clone.has(1)).toBe(true)
      expect(clone.has(2)).toBe(true)
    })

    it('modifications to clone do not affect original', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      const clone = set.clone()
      clone.add(2)
      expect(set.size).toBe(1)
      expect(clone.size).toBe(2)
    })

    it('modifications to original do not affect clone', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      const clone = set.clone()
      set.add(2)
      expect(clone.size).toBe(1)
      expect(set.size).toBe(2)
    })

    it('preserves custom serializer', () => {
      const set = new FingerprintSet<{ id: number }>({
        serialize: (v) => String(v.id),
      })
      set.add({ id: 1 })
      const clone = set.clone()
      expect(clone.has({ id: 1 })).toBe(true)
    })

    it('clones empty set', () => {
      const set = new FingerprintSet<number>()
      const clone = set.clone()
      expect(clone.isEmpty).toBe(true)
    })
  })

  describe('fromArray', () => {
    it('creates set from number array', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      expect(set.size).toBe(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(3)).toBe(true)
    })

    it('deduplicates array', () => {
      const set = FingerprintSet.fromArray([1, 2, 2, 3, 3, 3])
      expect(set.size).toBe(3)
    })

    it('creates set from empty array', () => {
      const set = FingerprintSet.fromArray<number>([])
      expect(set.size).toBe(0)
    })

    it('accepts options', () => {
      const set = FingerprintSet.fromArray(['a', 'B'], {
        serialize: (v) => v.toLowerCase(),
      })
      expect(set.size).toBe(2)
    })

    it('works with custom hashBits', () => {
      const set = FingerprintSet.fromArray([1, 2, 3], { hashBits: 16 })
      expect(set.size).toBe(3)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected.length).toBe(3)
    })

    it('provides correct index', () => {
      const set = new FingerprintSet<number>()
      set.add(10)
      set.add(20)
      const indices: number[] = []
      set.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does not iterate empty set', () => {
      const set = new FingerprintSet<number>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      const arr = [...set]
      expect(arr.length).toBe(2)
    })

    it('works with for...of', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      set.add(2)
      const collected: number[] = []
      for (const v of set) {
        collected.push(v)
      }
      expect(collected.length).toBe(2)
    })

    it('works with spread in empty set', () => {
      const set = new FingerprintSet<number>()
      const arr = [...set]
      expect(arr).toEqual([])
    })
  })

  describe('fingerprint', () => {
    it('returns a bigint', () => {
      const set = new FingerprintSet<number>()
      const fp = set.fingerprint(42)
      expect(typeof fp).toBe('bigint')
    })

    it('returns same fingerprint for same value', () => {
      const set = new FingerprintSet<string>()
      const fp1 = set.fingerprint('hello')
      const fp2 = set.fingerprint('hello')
      expect(fp1).toBe(fp2)
    })

    it('typically returns different fingerprints for different values', () => {
      const set = new FingerprintSet<string>()
      const fp1 = set.fingerprint('hello')
      const fp2 = set.fingerprint('world')
      expect(fp1).not.toBe(fp2)
    })

    it('uses custom serializer', () => {
      const set = new FingerprintSet<{ id: number }>({
        serialize: (v) => String(v.id),
      })
      const fp1 = set.fingerprint({ id: 5 })
      const fp2 = set.fingerprint({ id: 5 })
      expect(fp1).toBe(fp2)
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([3, 4, 5])
      const result = a.union(b)
      expect(result.size).toBe(5)
    })

    it('returns new set without modifying originals', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([3, 4])
      a.union(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })

    it('handles empty sets', () => {
      const a = new FingerprintSet<number>()
      const b = FingerprintSet.fromArray([1, 2])
      const result = a.union(b)
      expect(result.size).toBe(2)
    })

    it('handles both empty sets', () => {
      const a = new FingerprintSet<number>()
      const b = new FingerprintSet<number>()
      const result = a.union(b)
      expect(result.isEmpty).toBe(true)
    })

    it('handles identical sets', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([1, 2, 3])
      const result = a.union(b)
      expect(result.size).toBe(3)
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([2, 3, 4])
      const result = a.intersection(b)
      expect(result.size).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('returns empty for disjoint sets', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([3, 4])
      const result = a.intersection(b)
      expect(result.isEmpty).toBe(true)
    })

    it('handles identical sets', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([1, 2, 3])
      const result = a.intersection(b)
      expect(result.size).toBe(3)
    })

    it('handles empty sets', () => {
      const a = new FingerprintSet<number>()
      const b = FingerprintSet.fromArray([1, 2])
      const result = a.intersection(b)
      expect(result.isEmpty).toBe(true)
    })
  })

  describe('difference', () => {
    it('returns elements in a but not b', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([2, 3, 4])
      const result = a.difference(b)
      expect(result.size).toBe(1)
      expect(result.has(1)).toBe(true)
    })

    it('returns full set if no overlap', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([3, 4])
      const result = a.difference(b)
      expect(result.size).toBe(2)
    })

    it('returns empty if all overlap', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([1, 2, 3])
      const result = a.difference(b)
      expect(result.isEmpty).toBe(true)
    })

    it('handles empty sets', () => {
      const a = new FingerprintSet<number>()
      const b = FingerprintSet.fromArray([1, 2])
      const result = a.difference(b)
      expect(result.isEmpty).toBe(true)
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = FingerprintSet.fromArray([1, 4])
      const b = FingerprintSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for equal sets', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for empty set', () => {
      const a = new FingerprintSet<number>()
      const b = FingerprintSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for superset', () => {
      const a = FingerprintSet.fromArray([1, 2, 3, 4])
      const b = FingerprintSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('returns true for equal sets', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('empty set is superset of empty set', () => {
      const a = new FingerprintSet<number>()
      const b = new FingerprintSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for equal sets', () => {
      const a = FingerprintSet.fromArray([1, 2, 3])
      const b = FingerprintSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for same size different elements', () => {
      const a = FingerprintSet.fromArray([1, 2])
      const b = FingerprintSet.fromArray([3, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('empty sets are equal', () => {
      const a = new FingerprintSet<number>()
      const b = new FingerprintSet<number>()
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('filter', () => {
    it('filters elements by predicate', () => {
      const set = FingerprintSet.fromArray([1, 2, 3, 4, 5])
      const result = set.filter((v) => v % 2 === 0)
      expect(result.size).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(4)).toBe(true)
    })

    it('returns empty when no match', () => {
      const set = FingerprintSet.fromArray([1, 3, 5])
      const result = set.filter((v) => v % 2 === 0)
      expect(result.isEmpty).toBe(true)
    })

    it('returns all when all match', () => {
      const set = FingerprintSet.fromArray([2, 4, 6])
      const result = set.filter((v) => v % 2 === 0)
      expect(result.size).toBe(3)
    })

    it('does not modify original', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      set.filter((v) => v > 1)
      expect(set.size).toBe(3)
    })
  })

  describe('every', () => {
    it('returns true when all pass', () => {
      const set = FingerprintSet.fromArray([2, 4, 6])
      expect(set.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when some fail', () => {
      const set = FingerprintSet.fromArray([2, 3, 6])
      expect(set.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.every(() => false)).toBe(true)
    })
  })

  describe('some', () => {
    it('returns true when some pass', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      expect(set.some((v) => v === 2)).toBe(true)
    })

    it('returns false when none pass', () => {
      const set = FingerprintSet.fromArray([1, 3, 5])
      expect(set.some((v) => v % 2 === 0)).toBe(false)
    })

    it('returns false for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.some(() => true)).toBe(false)
    })
  })

  describe('reduce', () => {
    it('sums elements', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      const sum = set.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(6)
    })

    it('returns initial for empty set', () => {
      const set = new FingerprintSet<number>()
      const result = set.reduce((acc, v) => acc + v, 42)
      expect(result).toBe(42)
    })

    it('builds array from set', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      const arr = set.reduce<number[]>((acc, v) => {
        acc.push(v)
        return acc
      }, [])
      expect(arr.length).toBe(3)
    })
  })

  describe('join', () => {
    it('joins with default separator', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      const joined = set.join()
      expect(typeof joined).toBe('string')
    })

    it('joins with custom separator', () => {
      const set = FingerprintSet.fromArray(['a', 'b', 'c'])
      const joined = set.join('-')
      const parts = joined.split('-')
      expect(parts.length).toBe(3)
    })

    it('returns empty string for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.join()).toBe('')
    })

    it('returns single element without separator', () => {
      const set = FingerprintSet.fromArray(['hello'])
      expect(set.join()).toBe('hello')
    })
  })

  describe('first / last', () => {
    it('first returns undefined for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.first()).toBeUndefined()
    })

    it('last returns undefined for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.last()).toBeUndefined()
    })

    it('first returns some element', () => {
      const set = FingerprintSet.fromArray([42])
      expect(set.first()).toBe(42)
    })

    it('last returns some element', () => {
      const set = FingerprintSet.fromArray([42])
      expect(set.last()).toBe(42)
    })

    it('first and last are same for single element', () => {
      const set = FingerprintSet.fromArray([7])
      expect(set.first()).toBe(set.last())
    })

    it('first returns an element from the set', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      const f = set.first()
      expect(set.has(f!)).toBe(true)
    })

    it('last returns an element from the set', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      const l = set.last()
      expect(set.has(l!)).toBe(true)
    })
  })

  describe('hasCollision', () => {
    it('returns true for identical values', () => {
      const set = new FingerprintSet<string>()
      expect(set.hasCollision('abc', 'abc')).toBe(true)
    })

    it('returns false for clearly different values', () => {
      const set = new FingerprintSet<string>({ hashBits: 64 })
      expect(set.hasCollision('hello', 'world')).toBe(false)
    })

    it('uses custom serializer for collision detection', () => {
      const set = new FingerprintSet<string>({
        serialize: (v) => v.toLowerCase(),
      })
      expect(set.hasCollision('ABC', 'abc')).toBe(true)
    })
  })

  describe('loadFactor', () => {
    it('returns 0 for empty set', () => {
      const set = new FingerprintSet<number>()
      expect(set.loadFactor()).toBe(0)
    })

    it('increases as elements are added', () => {
      const set = new FingerprintSet<number>()
      set.add(1)
      const lf1 = set.loadFactor()
      set.add(2)
      const lf2 = set.loadFactor()
      expect(lf2).toBeGreaterThan(lf1)
    })

    it('returns value between 0 and 1', () => {
      const set = FingerprintSet.fromArray([1, 2, 3])
      const lf = set.loadFactor()
      expect(lf).toBeGreaterThan(0)
      expect(lf).toBeLessThanOrEqual(1)
    })
  })

  describe('capacity', () => {
    it('returns 1<<16 for default 64-bit', () => {
      const set = new FingerprintSet<number>()
      expect(set.capacity).toBe(65536)
    })

    it('returns correct capacity for 8-bit', () => {
      const set = new FingerprintSet<number>({ hashBits: 8 })
      expect(set.capacity).toBe(256)
    })

    it('returns correct capacity for 16-bit', () => {
      const set = new FingerprintSet<number>({ hashBits: 16 })
      expect(set.capacity).toBe(65536)
    })
  })

  describe('edge cases', () => {
    it('handles empty string values', () => {
      const set = new FingerprintSet<string>()
      set.add('')
      expect(set.has('')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles zero values', () => {
      const set = new FingerprintSet<number>()
      set.add(0)
      expect(set.has(0)).toBe(true)
    })

    it('handles negative numbers', () => {
      const set = new FingerprintSet<number>()
      set.add(-1)
      set.add(-42)
      expect(set.has(-1)).toBe(true)
      expect(set.has(-42)).toBe(true)
    })

    it('handles boolean-like strings', () => {
      const set = new FingerprintSet<string>()
      set.add('true')
      set.add('false')
      expect(set.size).toBe(2)
    })

    it('handles special characters in strings', () => {
      const set = new FingerprintSet<string>()
      set.add('\n\t\r')
      set.add('\\/')
      expect(set.size).toBe(2)
    })

    it('handles very long strings', () => {
      const set = new FingerprintSet<string>()
      const longStr = 'a'.repeat(10000)
      set.add(longStr)
      expect(set.has(longStr)).toBe(true)
    })

    it('handles large numbers', () => {
      const set = new FingerprintSet<number>()
      set.add(Number.MAX_SAFE_INTEGER)
      set.add(Number.MIN_SAFE_INTEGER)
      expect(set.size).toBe(2)
    })

    it('handles unicode strings', () => {
      const set = new FingerprintSet<string>()
      set.add('🎉')
      set.add('hello世界')
      expect(set.size).toBe(2)
      expect(set.has('🎉')).toBe(true)
    })

    it('stress test with many elements', () => {
      const set = new FingerprintSet<number>()
      for (let i = 0; i < 5000; i++) {
        set.add(i)
      }
      expect(set.size).toBe(5000)
      for (let i = 0; i < 5000; i++) {
        expect(set.has(i)).toBe(true)
      }
    })
  })

  describe('type exports', () => {
    it('exports FingerprintSetOptions type', () => {
      const opts: FingerprintSetOptions<number> = { hashBits: 32 }
      const set = new FingerprintSet(opts)
      expect(set).toBeDefined()
    })
  })
})
