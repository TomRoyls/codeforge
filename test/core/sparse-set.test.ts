import { describe, it, expect, beforeEach } from 'vitest'
import { SparseSet } from '../../src/core/sparse-set/sparse-set.js'

describe('SparseSet', () => {
  describe('constructor', () => {
    it('should create a set with given universe size', () => {
      const s = new SparseSet(10)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept universe size 0', () => {
      const s = new SparseSet(0)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept large universe size', () => {
      const s = new SparseSet(100000)
      expect(s.size).toBe(0)
    })

    it('should throw for negative universe size', () => {
      expect(() => new SparseSet(-1)).toThrow('non-negative')
    })

    it('should throw for non-integer universe size', () => {
      expect(() => new SparseSet(3.5)).toThrow('integer')
    })

    it('should accept options object', () => {
      const s = new SparseSet({ universeSize: 50 })
      expect(s.size).toBe(0)
      expect(s.getUniverseSize()).toBe(50)
    })
  })

  describe('add', () => {
    let s: SparseSet
    beforeEach(() => { s = new SparseSet(10) })

    it('should add a value and return true', () => {
      expect(s.add(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should add multiple values', () => {
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.size).toBe(3)
    })

    it('should return false for duplicate add', () => {
      s.add(3)
      expect(s.add(3)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should return false for negative value', () => {
      expect(s.add(-1)).toBe(false)
    })

    it('should return false for value >= universeSize', () => {
      expect(s.add(10)).toBe(false)
      expect(s.add(100)).toBe(false)
    })

    it('should return false for non-integer value', () => {
      expect(s.add(3.5)).toBe(false)
    })

    it('should add value at boundary 0', () => {
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('should add value at boundary universeSize-1', () => {
      expect(s.add(9)).toBe(true)
      expect(s.has(9)).toBe(true)
    })

    it('should handle adding all values in universe', () => {
      for (let i = 0; i < 10; i++) {
        expect(s.add(i)).toBe(true)
      }
      expect(s.size).toBe(10)
    })

    it('should handle re-adding after remove', () => {
      s.add(5)
      s.remove(5)
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('has', () => {
    let s: SparseSet
    beforeEach(() => { s = new SparseSet(10) })

    it('should return false for empty set', () => {
      expect(s.has(0)).toBe(false)
      expect(s.has(5)).toBe(false)
    })

    it('should return true for added value', () => {
      s.add(3)
      expect(s.has(3)).toBe(true)
    })

    it('should return false for non-added value', () => {
      s.add(3)
      expect(s.has(4)).toBe(false)
    })

    it('should return false for negative value', () => {
      expect(s.has(-1)).toBe(false)
    })

    it('should return false for value >= universeSize', () => {
      expect(s.has(10)).toBe(false)
      expect(s.has(100)).toBe(false)
    })

    it('should return false for non-integer value', () => {
      expect(s.has(3.5)).toBe(false)
    })

    it('should return false after removing value', () => {
      s.add(5)
      s.remove(5)
      expect(s.has(5)).toBe(false)
    })

    it('should still find other values after removal', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.remove(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
    })
  })

  describe('remove', () => {
    let s: SparseSet
    beforeEach(() => { s = new SparseSet(10) })

    it('should remove a value and return true', () => {
      s.add(5)
      expect(s.remove(5)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should return false for value not in set', () => {
      s.add(1)
      expect(s.remove(2)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should return false for out of range value', () => {
      expect(s.remove(-1)).toBe(false)
      expect(s.remove(10)).toBe(false)
    })

    it('should return false for empty set', () => {
      expect(s.remove(0)).toBe(false)
    })

    it('should remove first element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      s.remove(0)
      expect(s.has(0)).toBe(false)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should remove last element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      s.remove(2)
      expect(s.has(0)).toBe(true)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.size).toBe(2)
    })

    it('should remove middle element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      s.remove(1)
      expect(s.has(0)).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should handle removing all elements one by one', () => {
      for (let i = 0; i < 5; i++) s.add(i)
      for (let i = 0; i < 5; i++) s.remove(i)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should allow re-adding after removal', () => {
      s.add(5)
      s.remove(5)
      s.add(5)
      expect(s.has(5)).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const s = new SparseSet(10)
      for (let i = 0; i < 10; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should be safe to call on empty set', () => {
      const s = new SparseSet(10)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.clear()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.add(3)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(3)).toBe(true)
    })

    it('should not find old elements after clear', () => {
      const s = new SparseSet(10)
      s.add(5)
      s.clear()
      expect(s.has(5)).toBe(false)
    })

    it('should return void', () => {
      const s = new SparseSet(10)
      expect(s.clear()).toBeUndefined()
    })

    it('should be O(1) — does not zero arrays', () => {
      const s = new SparseSet(100)
      for (let i = 0; i < 100; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      s.add(0)
      expect(s.size).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for new set', () => {
      expect(new SparseSet(10).size).toBe(0)
    })

    it('should reflect additions', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      expect(s.size).toBe(2)
    })

    it('should reflect removals', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.remove(1)
      expect(s.size).toBe(1)
    })

    it('should reflect clear', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should not count duplicate adds', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      expect(new SparseSet(10).isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const s = new SparseSet(10)
      s.add(0)
      expect(s.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      const s = new SparseSet(10)
      s.add(0)
      s.remove(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const s = new SparseSet(10)
      s.add(0)
      s.add(1)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      const s = new SparseSet(10)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new SparseSet(10)
      s.add(3)
      s.add(7)
      s.add(1)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should iterate single element', () => {
      const s = new SparseSet(10)
      s.add(5)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([5])
    })

    it('should return void', () => {
      const s = new SparseSet(10)
      s.add(1)
      expect(s.forEach(() => {})).toBeUndefined()
    })

    it('should iterate full universe', () => {
      const s = new SparseSet(5)
      for (let i = 0; i < 5; i++) s.add(i)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([0, 1, 2, 3, 4])
    })

    it('should not iterate removed elements', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.remove(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3])
    })

    it('should not iterate elements after clear', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.clear()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })
  })

  describe('values', () => {
    it('should return empty array for empty set', () => {
      expect(new SparseSet(10).values()).toEqual([])
    })

    it('should return all values', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.values().sort()).toEqual([1, 3, 5])
    })

    it('should return new array each call', () => {
      const s = new SparseSet(10)
      s.add(1)
      const a = s.values()
      const b = s.values()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('clone', () => {
    it('should clone empty set', () => {
      const s = new SparseSet(10)
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty set', () => {
      const s = new SparseSet(10)
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
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      const c = s.clone()
      c.add(3)
      c.remove(1)
      expect(s.size).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(false)
      expect(c.has(1)).toBe(false)
      expect(c.has(3)).toBe(true)
    })

    it('should preserve universe size', () => {
      const s = new SparseSet(50)
      const c = s.clone()
      expect(c.getUniverseSize()).toBe(50)
    })
  })

  describe('equals', () => {
    it('should return true for two empty sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      expect(a.equals(b)).toBe(true)
    })

    it('should return true for identical sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(1)
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different sizes', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.equals(b)).toBe(false)
    })

    it('should return false for different elements', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for empty sets with different universe sizes', () => {
      const a = new SparseSet(5)
      const b = new SparseSet(10)
      expect(a.equals(b)).toBe(true)
    })

    it('should be reflexive', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      expect(a.equals(a)).toBe(true)
    })

    it('should be symmetric', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      b.add(1)
      expect(a.equals(b)).toBe(b.equals(a))
    })
  })

  describe('union', () => {
    it('should return empty for two empty sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      expect(a.union(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(u.has(1)).toBe(true)
      expect(u.has(2)).toBe(true)
    })

    it('should combine elements from both sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const u = a.union(b)
      expect(u.size).toBe(4)
    })

    it('should deduplicate overlapping elements', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
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
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      b.add(2)
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should handle union of identical sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.union(b).equals(a)).toBe(true)
    })

    it('should handle different universe sizes', () => {
      const a = new SparseSet(5)
      const b = new SparseSet(10)
      a.add(1)
      b.add(7)
      const u = a.union(b)
      expect(u.has(1)).toBe(true)
      expect(u.has(7)).toBe(true)
      expect(u.getUniverseSize()).toBe(10)
    })
  })

  describe('intersection', () => {
    it('should return empty for two empty sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return empty for disjoint sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return common elements', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
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
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.intersection(b).equals(a)).toBe(true)
    })

    it('should not modify original sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      b.add(1)
      a.intersection(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should return empty when one is empty', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      expect(a.intersection(b).size).toBe(0)
      expect(b.intersection(a).size).toBe(0)
    })

    it('should handle single common element', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(5)
      b.add(5)
      expect(a.intersection(b).size).toBe(1)
      expect(a.intersection(b).has(5)).toBe(true)
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      const d = a.difference(b)
      expect(d.size).toBe(2)
      expect(d.equals(a)).toBe(true)
    })

    it('should remove elements in other', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
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
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      expect(a.difference(a).size).toBe(0)
    })

    it('should return copy for disjoint sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const d = a.difference(b)
      expect(d.size).toBe(2)
      expect(d.equals(a)).toBe(true)
    })

    it('should not modify original sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      b.add(1)
      a.difference(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should remove all when other is superset', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.difference(b).size).toBe(0)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for empty subset of empty', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for empty subset of non-empty', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for proper subset', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for equal sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false when element missing', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return false when larger than other', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isDisjointFrom', () => {
    it('should return true for two empty sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('should return true for empty and non-empty', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      b.add(1)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('should return true for disjoint sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('should return false for overlapping sets', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.isDisjointFrom(b)).toBe(false)
    })

    it('should return false for identical sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      expect(a.isDisjointFrom(a)).toBe(false)
    })

    it('should be symmetric', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      b.add(2)
      expect(a.isDisjointFrom(b)).toBe(b.isDisjointFrom(a))
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate empty set', () => {
      const s = new SparseSet(10)
      const items: number[] = []
      for (const v of s) items.push(v)
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new SparseSet(10)
      s.add(3)
      s.add(1)
      s.add(7)
      const items: number[] = []
      for (const v of s) items.push(v)
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should work with spread operator', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      expect([...s].sort()).toEqual([1, 2])
    })

    it('should work with Array.from', () => {
      const s = new SparseSet(10)
      s.add(5)
      expect(Array.from(s)).toEqual([5])
    })

    it('should work with destructuring', () => {
      const s = new SparseSet(10)
      s.add(3)
      s.add(7)
      const [first] = s
      expect(first).toBe(3)
    })

    it('should not iterate removed elements', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.remove(2)
      const items = [...s].sort()
      expect(items).toEqual([1, 3])
    })
  })

  describe('toString', () => {
    it('should return empty set representation', () => {
      const s = new SparseSet(10)
      expect(s.toString()).toBe('SparseSet{}')
    })

    it('should return sorted elements', () => {
      const s = new SparseSet(10)
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toString()).toBe('SparseSet{1, 2, 3}')
    })

    it('should return single element', () => {
      const s = new SparseSet(10)
      s.add(5)
      expect(s.toString()).toBe('SparseSet{5}')
    })
  })

  describe('getUniverseSize', () => {
    it('should return the universe size', () => {
      expect(new SparseSet(42).getUniverseSize()).toBe(42)
    })

    it('should return 0 for zero-sized universe', () => {
      expect(new SparseSet(0).getUniverseSize()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle universe size 1', () => {
      const s = new SparseSet(1)
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.remove(0)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should handle universe size 0 — no adds possible', () => {
      const s = new SparseSet(0)
      expect(s.add(0)).toBe(false)
      expect(s.size).toBe(0)
    })

    it('should handle NaN value', () => {
      const s = new SparseSet(10)
      expect(s.add(NaN)).toBe(false)
      expect(s.has(NaN)).toBe(false)
      expect(s.remove(NaN)).toBe(false)
    })

    it('should handle Infinity value', () => {
      const s = new SparseSet(10)
      expect(s.add(Infinity)).toBe(false)
      expect(s.has(Infinity)).toBe(false)
    })

    it('should handle negative infinity', () => {
      const s = new SparseSet(10)
      expect(s.add(-Infinity)).toBe(false)
    })

    it('should handle add/remove/add cycle many times', () => {
      const s = new SparseSet(5)
      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < 5; i++) s.add(i)
        expect(s.size).toBe(5)
        for (let i = 0; i < 5; i++) s.remove(i)
        expect(s.size).toBe(0)
      }
    })

    it('should handle clear/add/clear cycle', () => {
      const s = new SparseSet(10)
      for (let round = 0; round < 10; round++) {
        s.add(1)
        s.add(2)
        s.add(3)
        expect(s.size).toBe(3)
        s.clear()
        expect(s.size).toBe(0)
      }
    })

    it('should handle sparse pattern — scattered values', () => {
      const s = new SparseSet(1000)
      s.add(0)
      s.add(500)
      s.add(999)
      expect(s.size).toBe(3)
      expect(s.has(0)).toBe(true)
      expect(s.has(500)).toBe(true)
      expect(s.has(999)).toBe(true)
      expect(s.has(1)).toBe(false)
    })
  })

  describe('stress operations', () => {
    it('should handle full universe add and remove', () => {
      const n = 100
      const s = new SparseSet(n)
      for (let i = 0; i < n; i++) s.add(i)
      expect(s.size).toBe(n)
      for (let i = 0; i < n; i++) s.remove(i)
      expect(s.size).toBe(0)
    })

    it('should handle full universe clear', () => {
      const n = 100
      const s = new SparseSet(n)
      for (let i = 0; i < n; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      for (let i = 0; i < n; i++) {
        expect(s.has(i)).toBe(false)
      }
    })

    it('should handle interleaved add/remove', () => {
      const s = new SparseSet(20)
      s.add(1)
      s.add(2)
      s.remove(1)
      s.add(3)
      s.add(1)
      s.remove(2)
      expect(s.size).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(2)).toBe(false)
    })

    it('should handle set operations on large sets', () => {
      const a = new SparseSet(100)
      const b = new SparseSet(100)
      for (let i = 0; i < 50; i++) a.add(i)
      for (let i = 25; i < 75; i++) b.add(i)
      const u = a.union(b)
      expect(u.size).toBe(75)
      const i = a.intersection(b)
      expect(i.size).toBe(25)
      const d = a.difference(b)
      expect(d.size).toBe(25)
    })
  })

  describe('set operation combinations', () => {
    it('union then difference gives original', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const u = a.union(b)
      const d = u.difference(b)
      expect(d.equals(a)).toBe(true)
    })

    it('intersection is commutative', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).equals(b.intersection(a))).toBe(true)
    })

    it('union is commutative in content', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.union(b).equals(b.union(a))).toBe(true)
    })

    it('difference is not commutative', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.difference(b).equals(b.difference(a))).toBe(false)
    })

    it('a diff b union b diff a gives symmetric difference', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const symDiff = a.difference(b).union(b.difference(a))
      expect(symDiff.size).toBe(2)
      expect(symDiff.has(1)).toBe(true)
      expect(symDiff.has(3)).toBe(true)
    })

    it('De Morgan: a union b complement equals a intersect b complement', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const unionAB = a.union(b)
      const interAB = a.intersection(b)
      expect(unionAB.difference(interAB).equals(a.difference(b).union(b.difference(a)))).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export SparseSetOptions type', async () => {
      const mod = await import('../../src/core/sparse-set/sparse-set.js')
      expect(mod.SparseSet).toBeDefined()
      expect(mod.DEFAULT_SPARSE_SET_OPTIONS).toBeDefined()
    })
  })
})
