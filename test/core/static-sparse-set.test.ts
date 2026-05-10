import { describe, it, expect, beforeEach } from 'vitest'
import { StaticSparseSet } from '../../src/core/static-sparse-set/static-sparse-set.js'

describe('StaticSparseSet', () => {
  describe('constructor', () => {
    it('should create set with default options', () => {
      const s = new StaticSparseSet()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.getUniverseSize()).toBe(256)
    })

    it('should create set with custom universe size', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      expect(s.size).toBe(0)
      expect(s.getUniverseSize()).toBe(10)
    })

    it('should create set with universe size 0', () => {
      const s = new StaticSparseSet({ universeSize: 0 })
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should throw for negative universe size', () => {
      expect(() => new StaticSparseSet({ universeSize: -1 })).toThrow('non-negative')
    })

    it('should throw for non-integer universe size', () => {
      expect(() => new StaticSparseSet({ universeSize: 3.5 })).toThrow('integer')
    })

    it('should accept large universe size', () => {
      const s = new StaticSparseSet({ universeSize: 100000 })
      expect(s.size).toBe(0)
      expect(s.getUniverseSize()).toBe(100000)
    })

    it('should use default when empty options object provided', () => {
      const s = new StaticSparseSet({})
      expect(s.getUniverseSize()).toBe(256)
    })

    it('should initialize statistics to zero', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      const stats = s.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.iterations).toBe(0)
      expect(stats.denseArrayMoves).toBe(0)
    })
  })

  describe('add', () => {
    let s: StaticSparseSet
    beforeEach(() => { s = new StaticSparseSet({ universeSize: 10 }) })

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

    it('should handle re-adding after delete', () => {
      s.add(5)
      s.delete(5)
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should track insert statistics', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.getStatistics().inserts).toBe(3)
    })

    it('should not count failed adds in statistics', () => {
      s.add(1)
      s.add(1)
      s.add(-1)
      expect(s.getStatistics().inserts).toBe(1)
    })

    it('should return false for NaN', () => {
      expect(s.add(NaN)).toBe(false)
    })

    it('should return false for Infinity', () => {
      expect(s.add(Infinity)).toBe(false)
      expect(s.add(-Infinity)).toBe(false)
    })
  })

  describe('has', () => {
    let s: StaticSparseSet
    beforeEach(() => { s = new StaticSparseSet({ universeSize: 10 }) })

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

    it('should return false after deleting value', () => {
      s.add(5)
      s.delete(5)
      expect(s.has(5)).toBe(false)
    })

    it('should still find other values after deletion', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should track lookup statistics', () => {
      s.add(1)
      const lookupsBefore = s.getStatistics().lookups
      s.has(1)
      s.has(2)
      expect(s.getStatistics().lookups).toBe(lookupsBefore + 2)
    })

    it('should count lookups from add duplicate check', () => {
      s.add(1)
      const lookupsBefore = s.getStatistics().lookups
      s.add(1)
      expect(s.getStatistics().lookups).toBeGreaterThan(lookupsBefore)
    })

    it('should count lookups from delete membership check', () => {
      s.add(1)
      const lookupsBefore = s.getStatistics().lookups
      s.delete(1)
      expect(s.getStatistics().lookups).toBeGreaterThan(lookupsBefore)
    })

    it('should return false for NaN', () => {
      expect(s.has(NaN)).toBe(false)
    })

    it('should return false for Infinity', () => {
      expect(s.has(Infinity)).toBe(false)
    })
  })

  describe('delete', () => {
    let s: StaticSparseSet
    beforeEach(() => { s = new StaticSparseSet({ universeSize: 10 }) })

    it('should delete a value and return true', () => {
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should return false for value not in set', () => {
      s.add(1)
      expect(s.delete(2)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should return false for out of range value', () => {
      expect(s.delete(-1)).toBe(false)
      expect(s.delete(10)).toBe(false)
    })

    it('should return false for empty set', () => {
      expect(s.delete(0)).toBe(false)
    })

    it('should delete first element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      s.delete(0)
      expect(s.has(0)).toBe(false)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should delete last element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      s.delete(2)
      expect(s.has(0)).toBe(true)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.size).toBe(2)
    })

    it('should delete middle element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.has(0)).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should handle deleting all elements one by one', () => {
      for (let i = 0; i < 5; i++) s.add(i)
      for (let i = 0; i < 5; i++) s.delete(i)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should allow re-adding after deletion', () => {
      s.add(5)
      s.delete(5)
      s.add(5)
      expect(s.has(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should track delete statistics', () => {
      s.add(1)
      s.add(2)
      s.delete(1)
      s.delete(2)
      expect(s.getStatistics().deletes).toBe(2)
    })

    it('should not count failed deletes in statistics', () => {
      s.add(1)
      s.delete(1)
      s.delete(1)
      expect(s.getStatistics().deletes).toBe(1)
    })

    it('should track dense array moves for middle element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      const movesBefore = s.getStatistics().denseArrayMoves
      s.delete(0)
      expect(s.getStatistics().denseArrayMoves).toBe(movesBefore + 1)
    })

    it('should not move dense array for last element', () => {
      s.add(0)
      s.add(1)
      s.add(2)
      const movesBefore = s.getStatistics().denseArrayMoves
      s.delete(2)
      expect(s.getStatistics().denseArrayMoves).toBe(movesBefore)
    })

    it('should handle single element set', () => {
      s.add(5)
      s.delete(5)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return false for NaN', () => {
      expect(s.delete(NaN)).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      for (let i = 0; i < 10; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should be safe to call on empty set', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.clear()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.add(3)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(3)).toBe(true)
    })

    it('should not find old elements after clear', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(5)
      s.clear()
      expect(s.has(5)).toBe(false)
    })

    it('should return void', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      expect(s.clear()).toBeUndefined()
    })

    it('should be O(1) by resetting dense length', () => {
      const s = new StaticSparseSet({ universeSize: 100 })
      for (let i = 0; i < 100; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      s.add(0)
      expect(s.size).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for new set', () => {
      expect(new StaticSparseSet().size).toBe(0)
    })

    it('should reflect additions', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      expect(s.size).toBe(2)
    })

    it('should reflect deletions', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('should reflect clear', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should not count duplicate adds', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      expect(new StaticSparseSet().isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(0)
      expect(s.isEmpty()).toBe(false)
    })

    it('should return true after deleting all', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(0)
      s.delete(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(0)
      s.add(1)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(new StaticSparseSet({ universeSize: 10 }).toArray()).toEqual([])
    })

    it('should return all values', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.toArray().sort()).toEqual([1, 3, 5])
    })

    it('should return new array each call', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      const a = s.toArray()
      const b = s.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should reflect state after deletions', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray().sort()).toEqual([1, 3])
    })

    it('should return empty after clear', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.toArray()).toEqual([])
    })

    it('should return full universe contents', () => {
      const s = new StaticSparseSet({ universeSize: 5 })
      for (let i = 0; i < 5; i++) s.add(i)
      expect(s.toArray().sort()).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(3)
      s.add(7)
      s.add(1)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should iterate single element', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(5)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([5])
    })

    it('should return void', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      expect(s.forEach(() => {})).toBeUndefined()
    })

    it('should iterate full universe', () => {
      const s = new StaticSparseSet({ universeSize: 5 })
      for (let i = 0; i < 5; i++) s.add(i)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([0, 1, 2, 3, 4])
    })

    it('should not iterate deleted elements', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3])
    })

    it('should not iterate elements after clear', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.clear()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should track iteration statistics', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.forEach(() => {})
      expect(s.getStatistics().iterations).toBe(1)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate empty set', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      const items: number[] = []
      for (const v of s) items.push(v)
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(3)
      s.add(1)
      s.add(7)
      const items: number[] = []
      for (const v of s) items.push(v)
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should work with spread operator', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      expect([...s].sort()).toEqual([1, 2])
    })

    it('should work with Array.from', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(5)
      expect(Array.from(s)).toEqual([5])
    })

    it('should work with destructuring', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(3)
      s.add(7)
      const [first] = s
      expect(first).toBe(3)
    })

    it('should not iterate deleted elements', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      const items = [...s].sort()
      expect(items).toEqual([1, 3])
    })

    it('should track iteration statistics', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      for (const _ of s) { break }
      expect(s.getStatistics().iterations).toBe(1)
    })
  })

  describe('union', () => {
    it('should return empty for two empty sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      expect(a.union(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(u.has(1)).toBe(true)
      expect(u.has(2)).toBe(true)
    })

    it('should combine elements from both sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const u = a.union(b)
      expect(u.size).toBe(4)
    })

    it('should deduplicate overlapping elements', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
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
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      b.add(2)
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should handle union of identical sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(u.toArray().sort()).toEqual([1, 2])
    })

    it('should handle different universe sizes', () => {
      const a = new StaticSparseSet({ universeSize: 5 })
      const b = new StaticSparseSet({ universeSize: 10 })
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
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return empty for disjoint sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return common elements', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
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
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      const inter = a.intersection(b)
      expect(inter.size).toBe(2)
      expect(inter.toArray().sort()).toEqual([1, 2])
    })

    it('should not modify original sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      b.add(1)
      a.intersection(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should return empty when one is empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      expect(a.intersection(b).size).toBe(0)
      expect(b.intersection(a).size).toBe(0)
    })

    it('should return single common element', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(5)
      b.add(5)
      expect(a.intersection(b).size).toBe(1)
      expect(a.intersection(b).has(5)).toBe(true)
    })

    it('should be commutative', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const ab = a.intersection(b)
      const ba = b.intersection(a)
      expect(ab.toArray().sort()).toEqual(ba.toArray().sort())
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      const d = a.difference(b)
      expect(d.size).toBe(2)
      expect(d.toArray().sort()).toEqual([1, 2])
    })

    it('should remove elements in other', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
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
      const a = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      expect(a.difference(a).size).toBe(0)
    })

    it('should return copy for disjoint sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const d = a.difference(b)
      expect(d.size).toBe(2)
      expect(d.toArray().sort()).toEqual([1, 2])
    })

    it('should not modify original sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      b.add(1)
      a.difference(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('should remove all when other is superset', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.difference(b).size).toBe(0)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for empty subset of empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for empty subset of non-empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for proper subset', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for equal sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false when element missing', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return false when larger than other', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('should return true for empty superset of empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return true for non-empty superset of empty', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return true for proper superset', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return true for equal sets', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return false when element missing', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('should return false when smaller than other', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('should be inverse of isSubsetOf', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
      expect(b.isSupersetOf(a)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty set', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty set', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
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
      const s = new StaticSparseSet({ universeSize: 10 })
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

    it('should preserve universe size', () => {
      const s = new StaticSparseSet({ universeSize: 50 })
      const c = s.clone()
      expect(c.getUniverseSize()).toBe(50)
    })

    it('should copy statistics', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.delete(1)
      s.has(2)
      const c = s.clone()
      expect(c.getStatistics()).toEqual(s.getStatistics())
    })

    it('should have independent statistics', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      const c = s.clone()
      c.add(2)
      expect(s.getStatistics().inserts).toBe(1)
      expect(c.getStatistics().inserts).toBe(2)
    })
  })

  describe('getUniverseSize', () => {
    it('should return the universe size', () => {
      expect(new StaticSparseSet({ universeSize: 42 }).getUniverseSize()).toBe(42)
    })

    it('should return 0 for zero-sized universe', () => {
      expect(new StaticSparseSet({ universeSize: 0 }).getUniverseSize()).toBe(0)
    })

    it('should return default universe size', () => {
      expect(new StaticSparseSet().getUniverseSize()).toBe(256)
    })
  })

  describe('getStatistics', () => {
    it('should return fresh copy each call', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      const a = s.getStatistics()
      const b = s.getStatistics()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should track full operation lifecycle', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.has(1)
      s.has(4)
      s.delete(2)
      s.forEach(() => {})
      const stats = s.getStatistics()
      expect(stats.inserts).toBe(3)
      expect(stats.lookups).toBeGreaterThan(0)
      expect(stats.deletes).toBe(1)
      expect(stats.iterations).toBe(1)
      expect(stats.denseArrayMoves).toBe(1)
    })

    it('should track iterations from Symbol.iterator', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      for (const _ of s) { break }
      expect(s.getStatistics().iterations).toBe(1)
    })

    it('should accumulate statistics across operations', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      s.add(4)
      s.has(2)
      s.has(5)
      expect(s.getStatistics().inserts).toBe(4)
      expect(s.getStatistics().deletes).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle universe size 1', () => {
      const s = new StaticSparseSet({ universeSize: 1 })
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.delete(0)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should handle universe size 0 — no adds possible', () => {
      const s = new StaticSparseSet({ universeSize: 0 })
      expect(s.add(0)).toBe(false)
      expect(s.size).toBe(0)
    })

    it('should handle NaN value', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      expect(s.add(NaN)).toBe(false)
      expect(s.has(NaN)).toBe(false)
      expect(s.delete(NaN)).toBe(false)
    })

    it('should handle Infinity value', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      expect(s.add(Infinity)).toBe(false)
      expect(s.has(Infinity)).toBe(false)
      expect(s.add(-Infinity)).toBe(false)
    })

    it('should handle add/delete/add cycle many times', () => {
      const s = new StaticSparseSet({ universeSize: 5 })
      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < 5; i++) s.add(i)
        expect(s.size).toBe(5)
        for (let i = 0; i < 5; i++) s.delete(i)
        expect(s.size).toBe(0)
      }
    })

    it('should handle clear/add/clear cycle', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
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
      const s = new StaticSparseSet({ universeSize: 1000 })
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
    it('should handle full universe add and delete', () => {
      const n = 100
      const s = new StaticSparseSet({ universeSize: n })
      for (let i = 0; i < n; i++) s.add(i)
      expect(s.size).toBe(n)
      for (let i = 0; i < n; i++) s.delete(i)
      expect(s.size).toBe(0)
    })

    it('should handle full universe clear', () => {
      const n = 100
      const s = new StaticSparseSet({ universeSize: n })
      for (let i = 0; i < n; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      for (let i = 0; i < n; i++) {
        expect(s.has(i)).toBe(false)
      }
    })

    it('should handle interleaved add/delete', () => {
      const s = new StaticSparseSet({ universeSize: 20 })
      s.add(1)
      s.add(2)
      s.delete(1)
      s.add(3)
      s.add(1)
      s.delete(2)
      expect(s.size).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(2)).toBe(false)
    })

    it('should handle set operations on large sets', () => {
      const a = new StaticSparseSet({ universeSize: 100 })
      const b = new StaticSparseSet({ universeSize: 100 })
      for (let i = 0; i < 50; i++) a.add(i)
      for (let i = 25; i < 75; i++) b.add(i)
      const u = a.union(b)
      expect(u.size).toBe(75)
      const inter = a.intersection(b)
      expect(inter.size).toBe(25)
      const d = a.difference(b)
      expect(d.size).toBe(25)
    })
  })

  describe('set operation combinations', () => {
    it('union then difference gives original', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const u = a.union(b)
      const d = u.difference(b)
      expect(d.toArray().sort()).toEqual([1, 2])
    })

    it('intersection is commutative', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const ab = a.intersection(b)
      const ba = b.intersection(a)
      expect(ab.toArray().sort()).toEqual(ba.toArray().sort())
    })

    it('union is commutative in content', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const ab = a.union(b)
      const ba = b.union(a)
      expect(ab.toArray().sort()).toEqual(ba.toArray().sort())
    })

    it('difference is not commutative', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      expect(a.difference(b).toArray().sort()).toEqual([1])
      expect(b.difference(a).toArray().sort()).toEqual([3])
    })

    it('symmetric difference via union of differences', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const symDiff = a.difference(b).union(b.difference(a))
      expect(symDiff.size).toBe(2)
      expect(symDiff.has(1)).toBe(true)
      expect(symDiff.has(3)).toBe(true)
    })

    it('subset and superset relationship', () => {
      const a = new StaticSparseSet({ universeSize: 10 })
      const b = new StaticSparseSet({ universeSize: 10 })
      a.add(1)
      a.add(2)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
      expect(b.isSupersetOf(a)).toBe(true)
      expect(b.isSubsetOf(a)).toBe(false)
      expect(a.isSupersetOf(b)).toBe(false)
    })
  })

  describe('type exports', () => {
    it('should export StaticSparseSet class', async () => {
      const mod = await import('../../src/core/static-sparse-set/static-sparse-set.js')
      expect(mod.StaticSparseSet).toBeDefined()
      expect(mod.DEFAULT_STATIC_SPARSE_SET_OPTIONS).toBeDefined()
    })

    it('should export DEFAULT_STATIC_SPARSE_SET_OPTIONS with correct defaults', async () => {
      const mod = await import('../../src/core/static-sparse-set/static-sparse-set.js')
      expect(mod.DEFAULT_STATIC_SPARSE_SET_OPTIONS.universeSize).toBe(256)
    })
  })

  describe('Briggs-Torczon invariants', () => {
    it('should maintain dense array membership invariant after operations', () => {
      const s = new StaticSparseSet({ universeSize: 20 })
      for (let i = 0; i < 10; i++) s.add(i * 2)
      for (let i = 1; i < 10; i++) s.delete(i * 2)
      expect(s.size).toBe(1)
      expect(s.has(0)).toBe(true)
      for (let i = 1; i < 10; i++) {
        expect(s.has(i * 2)).toBe(false)
      }
    })

    it('should maintain sparse-to-dense mapping consistency', () => {
      const s = new StaticSparseSet({ universeSize: 20 })
      s.add(5)
      s.add(10)
      s.add(15)
      s.delete(10)
      const arr = s.toArray().sort((a, b) => a - b)
      expect(arr).toEqual([5, 15])
      expect(s.has(5)).toBe(true)
      expect(s.has(15)).toBe(true)
      expect(s.has(10)).toBe(false)
    })

    it('should allow iteration over dense array after swap-with-last delete', () => {
      const s = new StaticSparseSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.delete(2)
      const arr = s.toArray().sort()
      expect(arr).toEqual([1, 3, 4])
    })

    it('should handle O(1) clear correctly with subsequent operations', () => {
      const s = new StaticSparseSet({ universeSize: 100 })
      for (let i = 0; i < 100; i++) s.add(i)
      s.clear()
      expect(s.size).toBe(0)
      s.add(50)
      expect(s.has(50)).toBe(true)
      expect(s.size).toBe(1)
      for (let i = 0; i < 100; i++) {
        if (i !== 50) expect(s.has(i)).toBe(false)
      }
    })
  })
})
