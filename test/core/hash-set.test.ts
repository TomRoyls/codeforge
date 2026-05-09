import { describe, it, expect, beforeEach } from 'vitest'
import { HashSet } from '../../src/core/hash-set/hash-set.js'

describe('HashSet', () => {
  describe('constructor', () => {
    it('should create empty set with defaults', () => {
      const s = new HashSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should create set with custom capacity', () => {
      const s = new HashSet<number>({ capacity: 64 })
      const st = s.stats()
      expect(st.capacity).toBe(64)
    })

    it('should enforce minimum capacity', () => {
      const s = new HashSet<number>({ capacity: 2 })
      const st = s.stats()
      expect(st.capacity).toBe(8)
    })

    it('should accept custom loadFactorThreshold', () => {
      const s = new HashSet<number>({ loadFactorThreshold: 0.5 })
      expect(s.stats().loadFactor).toBe(0)
    })

    it('should accept custom minLoadFactor', () => {
      const s = new HashSet<number>({ minLoadFactor: 0.1 })
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept custom hash function', () => {
      const s = new HashSet<number>({ hash: (v) => v * 31 })
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('should accept custom equals function', () => {
      const s = new HashSet<string>({ equals: (a, b) => a.toLowerCase() === b.toLowerCase() })
      s.add('Hello')
      expect(s.has('hello')).toBe(true)
    })

    it('should work with no options', () => {
      const s = new HashSet<string>()
      expect(s.size).toBe(0)
    })

    it('should handle zero capacity by using minimum', () => {
      const s = new HashSet<number>({ capacity: 0 })
      expect(s.stats().capacity).toBe(8)
    })

    it('should handle negative capacity by using minimum', () => {
      const s = new HashSet<number>({ capacity: -10 })
      expect(s.stats().capacity).toBe(8)
    })
  })

  describe('add', () => {
    let s: HashSet<number>
    beforeEach(() => { s = new HashSet<number>() })

    it('should add value and return true', () => {
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should add multiple values', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('should return false for duplicate add', () => {
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should add value 0', () => {
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('should add negative numbers', () => {
      expect(s.add(-1)).toBe(true)
      expect(s.has(-1)).toBe(true)
    })

    it('should add NaN', () => {
      expect(s.add(NaN)).toBe(true)
      expect(s.has(NaN)).toBe(true)
    })

    it('should not add duplicate NaN', () => {
      s.add(NaN)
      expect(s.add(NaN)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should handle re-adding after delete', () => {
      s.add(5)
      s.delete(5)
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should add many values', () => {
      for (let i = 0; i < 100; i++) {
        s.add(i)
      }
      expect(s.size).toBe(100)
    })
  })

  describe('delete', () => {
    let s: HashSet<number>
    beforeEach(() => {
      s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
    })

    it('should delete existing value and return true', () => {
      expect(s.delete(2)).toBe(true)
      expect(s.size).toBe(2)
      expect(s.has(2)).toBe(false)
    })

    it('should return false for missing value', () => {
      expect(s.delete(99)).toBe(false)
      expect(s.size).toBe(3)
    })

    it('should return false for empty set', () => {
      const empty = new HashSet<number>()
      expect(empty.delete(1)).toBe(false)
    })

    it('should allow re-adding after delete', () => {
      s.delete(2)
      expect(s.add(2)).toBe(true)
      expect(s.has(2)).toBe(true)
    })

    it('should handle deleting all elements', () => {
      s.delete(1)
      s.delete(2)
      s.delete(3)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle deleting NaN', () => {
      const s2 = new HashSet<number>()
      s2.add(NaN)
      expect(s2.delete(NaN)).toBe(true)
      expect(s2.has(NaN)).toBe(false)
    })
  })

  describe('has', () => {
    let s: HashSet<number>
    beforeEach(() => {
      s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
    })

    it('should return true for existing value', () => {
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should return false for missing value', () => {
      expect(s.has(99)).toBe(false)
    })

    it('should return false for empty set', () => {
      const empty = new HashSet<number>()
      expect(empty.has(1)).toBe(false)
    })

    it('should return false after delete', () => {
      s.delete(2)
      expect(s.has(2)).toBe(false)
    })

    it('should still find other values after delete', () => {
      s.delete(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should find NaN', () => {
      const s2 = new HashSet<number>()
      s2.add(NaN)
      expect(s2.has(NaN)).toBe(true)
    })

    it('should not find NaN if not added', () => {
      expect(s.has(NaN)).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for new set', () => {
      expect(new HashSet<number>().size).toBe(0)
    })

    it('should reflect additions', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      expect(s.size).toBe(2)
    })

    it('should reflect deletions', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('should reflect clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should not count duplicate adds', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      expect(new HashSet<number>().isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const s = new HashSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should be safe to call on empty set', () => {
      const s = new HashSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.clear()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.clear()
      expect(s.add(2)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(true)
    })

    it('should not find old elements after clear', () => {
      const s = new HashSet<number>()
      s.add(5)
      s.clear()
      expect(s.has(5)).toBe(false)
    })

    it('should return void', () => {
      const s = new HashSet<number>()
      expect(s.clear()).toBeUndefined()
    })
  })

  describe('clone', () => {
    it('should clone empty set', () => {
      const s = new HashSet<number>()
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty set', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      const c = s.clone()
      expect(c.size).toBe(3)
      expect(c.has(1)).toBe(true)
      expect(c.has(3)).toBe(true)
      expect(c.has(5)).toBe(true)
    })

    it('should be independent from original', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      const c = s.clone()
      c.add(3)
      c.delete(1)
      expect(s.size).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(false)
      expect(c.has(1)).toBe(false)
      expect(c.has(3)).toBe(true)
    })

    it('should preserve custom hash and equals', () => {
      const s = new HashSet<string>({
        equals: (a, b) => a.toLowerCase() === b.toLowerCase(),
        hash: (v) => defaultHashStr(v.toLowerCase()),
      })
      s.add('Hello')
      const c = s.clone()
      expect(c.has('hello')).toBe(true)
      expect(c.has('HELLO')).toBe(true)
    })
  })

  describe('from (static factory)', () => {
    it('should create set from array', () => {
      const s = HashSet.from([1, 2, 3])
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should create set from empty array', () => {
      const s = HashSet.from<number>([])
      expect(s.size).toBe(0)
    })

    it('should deduplicate elements', () => {
      const s = HashSet.from([1, 2, 2, 3, 3, 3])
      expect(s.size).toBe(3)
    })

    it('should create set from Set', () => {
      const native = new Set([1, 2, 3])
      const s = HashSet.from(native)
      expect(s.size).toBe(3)
    })

    it('should accept options', () => {
      const s = HashSet.from([1, 2, 3], { capacity: 32 })
      expect(s.size).toBe(3)
      expect(s.stats().capacity).toBeGreaterThanOrEqual(32)
    })

    it('should create set from single element', () => {
      const s = HashSet.from([42])
      expect(s.size).toBe(1)
      expect(s.has(42)).toBe(true)
    })

    it('should create set from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const s = HashSet.from(gen())
      expect(s.size).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(new HashSet<number>().toArray()).toEqual([])
    })

    it('should return all values', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      const arr = s.toArray().sort()
      expect(arr).toEqual([1, 3, 5])
    })

    it('should return new array each call', () => {
      const s = new HashSet<number>()
      s.add(1)
      const a = s.toArray()
      const b = s.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should not include deleted values', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      const arr = s.toArray().sort()
      expect(arr).toEqual([1, 3])
    })

    it('should reflect state after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.clear()
      expect(s.toArray()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      const s = new HashSet<number>()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new HashSet<number>()
      s.add(3)
      s.add(7)
      s.add(1)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should iterate single element', () => {
      const s = new HashSet<number>()
      s.add(5)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([5])
    })

    it('should return void', () => {
      const s = new HashSet<number>()
      s.add(1)
      expect(s.forEach(() => {})).toBeUndefined()
    })

    it('should not iterate deleted elements', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3])
    })

    it('should not iterate elements after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })
  })

  describe('union', () => {
    it('should return empty for two empty sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.union(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(u.has(1)).toBe(true)
      expect(u.has(2)).toBe(true)
    })

    it('should combine elements from both sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const u = a.union(b)
      expect(u.size).toBe(4)
    })

    it('should deduplicate overlapping elements', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const u = a.union(b)
      expect(u.size).toBe(3)
      expect(u.has(1)).toBe(true)
      expect(u.has(2)).toBe(true)
      expect(u.has(3)).toBe(true)
    })

    it('should not modify original sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(2)
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should handle union of identical sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      const u = a.union(b)
      expect(u.size).toBe(2)
    })
  })

  describe('intersection', () => {
    it('should return empty for two empty sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return empty for disjoint sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return common elements', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const i = a.intersection(b)
      expect(i.size).toBe(2)
      expect(i.has(2)).toBe(true)
      expect(i.has(3)).toBe(true)
    })

    it('should return identical set when equal', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      const i = a.intersection(b)
      expect(i.size).toBe(2)
    })

    it('should not modify original sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(1)
      a.intersection(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should return empty when one is empty', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      expect(a.intersection(b).size).toBe(0)
      expect(b.intersection(a).size).toBe(0)
    })

    it('should be commutative', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const ab = a.intersection(b).toArray().sort()
      const ba = b.intersection(a).toArray().sort()
      expect(ab).toEqual(ba)
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      const d = a.difference(b)
      expect(d.size).toBe(2)
    })

    it('should remove elements in other', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      const d = a.difference(b)
      expect(d.size).toBe(2)
      expect(d.has(1)).toBe(true)
      expect(d.has(3)).toBe(true)
      expect(d.has(2)).toBe(false)
    })

    it('should return empty when subtracting self', () => {
      const a = new HashSet<number>()
      a.add(1)
      a.add(2)
      expect(a.difference(a).size).toBe(0)
    })

    it('should return copy for disjoint sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const d = a.difference(b)
      expect(d.size).toBe(2)
    })

    it('should not modify original sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(1)
      a.difference(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should remove all when other is superset', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.difference(b).size).toBe(0)
    })
  })

  describe('symmetricDifference', () => {
    it('should return empty for two empty sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      expect(a.symmetricDifference(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new HashSet<number>()
      a.add(1)
      a.add(2)
      const sd = a.symmetricDifference(new HashSet<number>())
      expect(sd.size).toBe(2)
    })

    it('should return elements in either but not both', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const sd = a.symmetricDifference(b)
      expect(sd.size).toBe(2)
      expect(sd.has(1)).toBe(true)
      expect(sd.has(3)).toBe(true)
      expect(sd.has(2)).toBe(false)
    })

    it('should return empty for identical sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.symmetricDifference(b).size).toBe(0)
    })

    it('should be commutative', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const ab = a.symmetricDifference(b).toArray().sort()
      const ba = b.symmetricDifference(a).toArray().sort()
      expect(ab).toEqual(ba)
    })

    it('should not modify original sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(2)
      a.symmetricDifference(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for empty subset of empty', () => {
      expect(new HashSet<number>().isSubsetOf(new HashSet<number>())).toBe(true)
    })

    it('should return true for empty subset of non-empty', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for proper subset', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for equal sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false when element missing', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return false when larger than other', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('should return true for empty superset of empty', () => {
      expect(new HashSet<number>().isSupersetOf(new HashSet<number>())).toBe(true)
    })

    it('should return true for proper superset', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return true for equal sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return false when missing element', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('should be inverse of isSubsetOf', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSupersetOf(b)).toBe(b.isSubsetOf(a))
    })
  })

  describe('isDisjointFrom', () => {
    it('should return true for two empty sets', () => {
      expect(new HashSet<number>().isDisjointFrom(new HashSet<number>())).toBe(true)
    })

    it('should return true for empty and non-empty', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      b.add(1)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('should return true for disjoint sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('should return false for overlapping sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.isDisjointFrom(b)).toBe(false)
    })

    it('should return false for identical sets', () => {
      const a = new HashSet<number>()
      a.add(1)
      expect(a.isDisjointFrom(a)).toBe(false)
    })

    it('should be symmetric', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      b.add(2)
      expect(a.isDisjointFrom(b)).toBe(b.isDisjointFrom(a))
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty set', () => {
      const s = new HashSet<number>()
      const st = s.stats()
      expect(st.size).toBe(0)
      expect(st.capacity).toBeGreaterThanOrEqual(8)
      expect(st.loadFactor).toBe(0)
      expect(st.tombstones).toBe(0)
    })

    it('should return correct stats for non-empty set', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      const st = s.stats()
      expect(st.size).toBe(3)
      expect(st.loadFactor).toBe(3 / st.capacity)
    })

    it('should count tombstones after deletions', () => {
      const s = new HashSet<number>({ minLoadFactor: 0 })
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 0; i < 5; i++) s.delete(i)
      const st = s.stats()
      expect(st.size).toBe(5)
      expect(st.tombstones).toBeGreaterThanOrEqual(5)
    })

    it('should reset tombstones after clear', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.delete(1)
      s.clear()
      expect(s.stats().tombstones).toBe(0)
    })
  })

  describe('loadFactor', () => {
    it('should return 0 for empty set', () => {
      expect(new HashSet<number>().loadFactor()).toBe(0)
    })

    it('should increase with adds', () => {
      const s = new HashSet<number>()
      s.add(1)
      expect(s.loadFactor()).toBeGreaterThan(0)
    })

    it('should decrease with deletes', () => {
      const s = new HashSet<number>({ minLoadFactor: 0 })
      for (let i = 0; i < 10; i++) s.add(i)
      const lf1 = s.loadFactor()
      for (let i = 0; i < 5; i++) s.delete(i)
      expect(s.loadFactor()).toBeLessThan(lf1)
    })
  })

  describe('rehash', () => {
    it('should rehash to specified capacity', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.rehash(64)
      expect(s.size).toBe(3)
      expect(s.stats().capacity).toBe(64)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should enforce minimum capacity on rehash', () => {
      const s = new HashSet<number>()
      s.rehash(2)
      expect(s.stats().capacity).toBe(8)
    })

    it('should preserve elements after rehash', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 20; i++) {
        s.add(i)
      }
      s.rehash(128)
      expect(s.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should clear tombstones on rehash', () => {
      const s = new HashSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      s.delete(2)
      s.rehash()
      expect(s.stats().tombstones).toBe(0)
      expect(s.size).toBe(1)
    })
  })

  describe('auto-resize', () => {
    it('should grow when load factor exceeds threshold', () => {
      const s = new HashSet<number>({ capacity: 8, loadFactorThreshold: 0.75 })
      for (let i = 0; i < 6; i++) {
        s.add(i)
      }
      expect(s.stats().capacity).toBeGreaterThan(8)
    })

    it('should shrink when load factor drops below minimum', () => {
      const s = new HashSet<number>({ capacity: 8, minLoadFactor: 0.25 })
      for (let i = 0; i < 6; i++) {
        s.add(i)
      }
      for (let i = 0; i < 6; i++) {
        s.delete(i)
      }
      expect(s.stats().capacity).toBeLessThanOrEqual(8)
    })

    it('should not shrink below minimum capacity', () => {
      const s = new HashSet<number>({ capacity: 8 })
      s.add(1)
      s.delete(1)
      expect(s.stats().capacity).toBeGreaterThanOrEqual(8)
    })

    it('should preserve elements during growth', () => {
      const s = new HashSet<number>({ capacity: 8, loadFactorThreshold: 0.75 })
      for (let i = 0; i < 100; i++) {
        s.add(i)
      }
      expect(s.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should handle rapid add/delete cycles', () => {
      const s = new HashSet<number>({ capacity: 8 })
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 50; i++) {
          s.add(i)
        }
        for (let i = 0; i < 50; i++) {
          s.delete(i)
        }
      }
      expect(s.size).toBe(0)
    })
  })

  describe('strings', () => {
    it('should work with string values', () => {
      const s = new HashSet<string>()
      s.add('hello')
      s.add('world')
      expect(s.size).toBe(2)
      expect(s.has('hello')).toBe(true)
      expect(s.has('world')).toBe(true)
      expect(s.has('foo')).toBe(false)
    })

    it('should handle empty string', () => {
      const s = new HashSet<string>()
      expect(s.add('')).toBe(true)
      expect(s.has('')).toBe(true)
    })

    it('should handle long strings', () => {
      const s = new HashSet<string>()
      const long = 'a'.repeat(1000)
      s.add(long)
      expect(s.has(long)).toBe(true)
    })

    it('should handle unicode strings', () => {
      const s = new HashSet<string>()
      s.add('🎉')
      s.add('你好')
      s.add('مرحبا')
      expect(s.size).toBe(3)
      expect(s.has('🎉')).toBe(true)
      expect(s.has('你好')).toBe(true)
    })
  })

  describe('objects by reference', () => {
    it('should distinguish different object references', () => {
      const s = new HashSet<object>()
      const a = { x: 1 }
      const b = { x: 1 }
      s.add(a)
      expect(s.has(a)).toBe(true)
      expect(s.has(b)).toBe(false)
    })

    it('should find same object reference', () => {
      const s = new HashSet<object>()
      const obj = { x: 1 }
      s.add(obj)
      expect(s.has(obj)).toBe(true)
    })

    it('should delete by same reference', () => {
      const s = new HashSet<object>()
      const obj = { x: 1 }
      s.add(obj)
      expect(s.delete(obj)).toBe(true)
      expect(s.has(obj)).toBe(false)
    })
  })

  describe('all same hash (collision stress)', () => {
    it('should handle all elements hashing to same bucket', () => {
      const s = new HashSet<number>({
        hash: () => 42,
        capacity: 16,
      })
      for (let i = 0; i < 10; i++) {
        s.add(i)
      }
      expect(s.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should handle deletions with all same hash', () => {
      const s = new HashSet<number>({
        hash: () => 42,
        capacity: 16,
      })
      for (let i = 0; i < 10; i++) {
        s.add(i)
      }
      for (let i = 0; i < 5; i++) {
        s.delete(i)
      }
      expect(s.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(s.has(i)).toBe(false)
      }
      for (let i = 5; i < 10; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should handle add/delete/add with all same hash', () => {
      const s = new HashSet<number>({
        hash: () => 0,
        capacity: 16,
      })
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty set operations', () => {
      const empty = new HashSet<number>()
      expect(empty.size).toBe(0)
      expect(empty.isEmpty()).toBe(true)
      expect(empty.has(1)).toBe(false)
      expect(empty.delete(1)).toBe(false)
      expect(empty.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      const s = new HashSet<number>()
      s.add(42)
      expect(s.size).toBe(1)
      expect(s.has(42)).toBe(true)
      expect(s.isEmpty()).toBe(false)
      s.delete(42)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle Infinity', () => {
      const s = new HashSet<number>()
      s.add(Infinity)
      s.add(-Infinity)
      expect(s.size).toBe(2)
      expect(s.has(Infinity)).toBe(true)
      expect(s.has(-Infinity)).toBe(true)
    })

    it('should handle null and undefined in generic sets', () => {
      const s = new HashSet<null | undefined | number>()
      s.add(null)
      s.add(undefined)
      s.add(0)
      expect(s.size).toBe(3)
      expect(s.has(null)).toBe(true)
      expect(s.has(undefined)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('should handle boolean values', () => {
      const s = new HashSet<boolean>()
      s.add(true)
      s.add(false)
      expect(s.size).toBe(2)
      expect(s.has(true)).toBe(true)
      expect(s.has(false)).toBe(true)
    })

    it('should handle clearing after many operations', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 50; i++) s.delete(i)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.toArray()).toEqual([])
    })
  })

  describe('large sets', () => {
    it('should handle 10000 elements', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      expect(s.size).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should handle adding and removing 10000 elements', () => {
      const s = new HashSet<number>()
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      for (let i = 0; i < 10000; i++) {
        s.delete(i)
      }
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle 10000 strings', () => {
      const s = new HashSet<string>()
      for (let i = 0; i < 10000; i++) {
        s.add(`key-${i}`)
      }
      expect(s.size).toBe(10000)
      expect(s.has('key-0')).toBe(true)
      expect(s.has('key-9999')).toBe(true)
      expect(s.has('key-10000')).toBe(false)
    })

    it('should handle set operations on large sets', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      for (let i = 0; i < 5000; i++) a.add(i)
      for (let i = 2500; i < 7500; i++) b.add(i)
      const u = a.union(b)
      expect(u.size).toBe(7500)
      const i = a.intersection(b)
      expect(i.size).toBe(2500)
      const d = a.difference(b)
      expect(d.size).toBe(2500)
    })
  })

  describe('set operation combinations', () => {
    it('union then difference gives original for disjoint', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const u = a.union(b)
      const d = u.difference(b)
      expect(d.toArray().sort()).toEqual([1, 2])
    })

    it('intersection is commutative in content', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).toArray().sort()).toEqual(b.intersection(a).toArray().sort())
    })

    it('union is commutative in content', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.union(b).toArray().sort()).toEqual(b.union(a).toArray().sort())
    })

    it('symmetric difference equals union minus intersection', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const sd = a.symmetricDifference(b)
      const expected = a.union(b).difference(a.intersection(b))
      expect(sd.toArray().sort()).toEqual(expected.toArray().sort())
    })

    it('difference is not commutative', () => {
      const a = new HashSet<number>()
      const b = new HashSet<number>()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.difference(b).toArray().sort()).not.toEqual(b.difference(a).toArray().sort())
    })
  })

  describe('type exports', () => {
    it('should export HashSet class', async () => {
      const mod = await import('../../src/core/hash-set/hash-set.js')
      expect(mod.HashSet).toBeDefined()
      expect(mod.DEFAULT_HASH_SET_OPTIONS).toBeDefined()
    })
  })
})

function defaultHashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return h
}
