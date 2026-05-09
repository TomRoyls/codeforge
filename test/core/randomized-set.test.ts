import { describe, it, expect, beforeEach } from 'vitest'
import { RandomizedSet } from '../../src/core/randomized-set/randomized-set.js'

describe('RandomizedSet', () => {
  describe('constructor', () => {
    it('should create an empty set with no arguments', () => {
      const s = new RandomizedSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should create a set from an array of items', () => {
      const s = new RandomizedSet([1, 2, 3])
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should deduplicate items in constructor', () => {
      const s = new RandomizedSet([1, 2, 2, 3, 1])
      expect(s.size).toBe(3)
    })

    it('should create a set from a Set', () => {
      const s = new RandomizedSet(new Set([10, 20, 30]))
      expect(s.size).toBe(3)
      expect(s.has(10)).toBe(true)
      expect(s.has(20)).toBe(true)
      expect(s.has(30)).toBe(true)
    })

    it('should create a set with options', () => {
      const s = new RandomizedSet<number>(undefined, { initialCapacity: 64 })
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should create a set with items and options', () => {
      const s = new RandomizedSet([1, 2], { initialCapacity: 32 })
      expect(s.size).toBe(2)
    })

    it('should handle empty iterable', () => {
      const s = new RandomizedSet([])
      expect(s.size).toBe(0)
    })

    it('should handle string items', () => {
      const s = new RandomizedSet(['a', 'b', 'c'])
      expect(s.size).toBe(3)
      expect(s.has('a')).toBe(true)
    })

    it('should handle object items by reference', () => {
      const obj = { x: 1 }
      const s = new RandomizedSet([obj])
      expect(s.has(obj)).toBe(true)
    })
  })

  describe('add', () => {
    let s: RandomizedSet<number>
    beforeEach(() => { s = new RandomizedSet<number>() })

    it('should add a value and return true', () => {
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
      s.add(5)
      expect(s.add(5)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should return true for different values', () => {
      expect(s.add(1)).toBe(true)
      expect(s.add(2)).toBe(true)
      expect(s.add(3)).toBe(true)
    })

    it('should handle adding after removal', () => {
      s.add(5)
      s.delete(5)
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should handle adding zero', () => {
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('should handle adding negative numbers', () => {
      expect(s.add(-1)).toBe(true)
      expect(s.has(-1)).toBe(true)
    })

    it('should handle adding string values', () => {
      const ss = new RandomizedSet<string>()
      expect(ss.add('hello')).toBe(true)
      expect(ss.has('hello')).toBe(true)
    })

    it('should handle adding null', () => {
      const sn = new RandomizedSet<null>()
      expect(sn.add(null)).toBe(true)
      expect(sn.has(null)).toBe(true)
    })

    it('should handle adding undefined', () => {
      const su = new RandomizedSet<undefined>()
      expect(su.add(undefined)).toBe(true)
      expect(su.has(undefined)).toBe(true)
    })

    it('should handle duplicate null', () => {
      const sn = new RandomizedSet<null>()
      sn.add(null)
      expect(sn.add(null)).toBe(false)
    })
  })

  describe('delete', () => {
    let s: RandomizedSet<number>
    beforeEach(() => { s = new RandomizedSet<number>() })

    it('should delete a value and return true', () => {
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should return false for value not in set', () => {
      expect(s.delete(99)).toBe(false)
    })

    it('should return false for empty set', () => {
      expect(s.delete(1)).toBe(false)
    })

    it('should delete first element', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should delete last element', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(false)
      expect(s.size).toBe(2)
    })

    it('should delete middle element', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(true)
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

    it('should maintain integrity after many deletions', () => {
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 0; i < 10; i += 2) s.delete(i)
      expect(s.size).toBe(5)
      for (let i = 1; i < 10; i += 2) {
        expect(s.has(i)).toBe(true)
      }
      for (let i = 0; i < 10; i += 2) {
        expect(s.has(i)).toBe(false)
      }
    })

    it('should handle single element delete', () => {
      s.add(42)
      expect(s.delete(42)).toBe(true)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return false for second delete of same value', () => {
      s.add(1)
      s.delete(1)
      expect(s.delete(1)).toBe(false)
    })
  })

  describe('has', () => {
    let s: RandomizedSet<number>
    beforeEach(() => { s = new RandomizedSet<number>() })

    it('should return false for empty set', () => {
      expect(s.has(1)).toBe(false)
    })

    it('should return true for added value', () => {
      s.add(3)
      expect(s.has(3)).toBe(true)
    })

    it('should return false for non-added value', () => {
      s.add(3)
      expect(s.has(4)).toBe(false)
    })

    it('should return false after deletion', () => {
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

    it('should find value after many operations', () => {
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 50; i++) s.delete(i)
      for (let i = 50; i < 100; i++) {
        expect(s.has(i)).toBe(true)
      }
      for (let i = 0; i < 50; i++) {
        expect(s.has(i)).toBe(false)
      }
    })
  })

  describe('getRandom', () => {
    it('should throw on empty set', () => {
      const s = new RandomizedSet<number>()
      expect(() => s.getRandom()).toThrow('Cannot get random element from empty set')
    })

    it('should return the only element', () => {
      const s = new RandomizedSet([42])
      for (let i = 0; i < 10; i++) {
        expect(s.getRandom()).toBe(42)
      }
    })

    it('should return an element from the set', () => {
      const s = new RandomizedSet([1, 2, 3, 4, 5])
      for (let i = 0; i < 50; i++) {
        const val = s.getRandom()
        expect(s.has(val)).toBe(true)
      }
    })

    it('should have reasonable distribution over many calls', () => {
      const s = new RandomizedSet([1, 2, 3, 4])
      const counts = new Map<number, number>()
      for (const v of [1, 2, 3, 4]) counts.set(v, 0)
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        const val = s.getRandom()
        counts.set(val, counts.get(val)! + 1)
      }
      const expected = trials / 4
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(expected * 0.6)
        expect(count).toBeLessThan(expected * 1.4)
      }
    })

    it('should work with string elements', () => {
      const s = new RandomizedSet(['a', 'b', 'c'])
      const val = s.getRandom()
      expect(['a', 'b', 'c']).toContain(val)
    })

    it('should still work after add and delete', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      for (let i = 0; i < 20; i++) {
        const val = s.getRandom()
        expect(val === 1 || val === 3).toBe(true)
      }
    })

    it('should throw after clearing set', () => {
      const s = new RandomizedSet([1, 2, 3])
      s.clear()
      expect(() => s.getRandom()).toThrow()
    })

    it('should cover all elements over many samples', () => {
      const items = [10, 20, 30, 40, 50]
      const s = new RandomizedSet(items)
      const seen = new Set<number>()
      for (let i = 0; i < 1000; i++) {
        seen.add(s.getRandom())
        if (seen.size === items.length) break
      }
      expect(seen.size).toBe(items.length)
    })
  })

  describe('size', () => {
    it('should return 0 for new set', () => {
      expect(new RandomizedSet().size).toBe(0)
    })

    it('should reflect additions', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      expect(s.size).toBe(2)
    })

    it('should reflect deletions', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('should reflect clear', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should not count duplicate adds', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('should reflect constructor items', () => {
      const s = new RandomizedSet([1, 2, 3])
      expect(s.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      expect(new RandomizedSet().isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })

    it('should return false with constructor items', () => {
      const s = new RandomizedSet([1])
      expect(s.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const s = new RandomizedSet([1, 2, 3])
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should be safe on empty set', () => {
      const s = new RandomizedSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.clear()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.add(3)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(3)).toBe(true)
    })

    it('should not find old elements after clear', () => {
      const s = new RandomizedSet<number>()
      s.add(5)
      s.clear()
      expect(s.has(5)).toBe(false)
    })

    it('should return void', () => {
      const s = new RandomizedSet<number>()
      expect(s.clear()).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      const s = new RandomizedSet<number>()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new RandomizedSet([3, 7, 1])
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should iterate single element', () => {
      const s = new RandomizedSet([5])
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([5])
    })

    it('should return void', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      expect(s.forEach(() => {})).toBeUndefined()
    })

    it('should not iterate removed elements', () => {
      const s = new RandomizedSet([1, 2, 3])
      s.delete(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.sort()).toEqual([1, 3])
    })

    it('should not iterate elements after clear', () => {
      const s = new RandomizedSet([1, 2])
      s.clear()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(new RandomizedSet().toArray()).toEqual([])
    })

    it('should return all values', () => {
      const s = new RandomizedSet([1, 3, 5])
      expect(s.toArray().sort()).toEqual([1, 3, 5])
    })

    it('should return new array each call', () => {
      const s = new RandomizedSet([1])
      const a = s.toArray()
      const b = s.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should reflect current state after mutations', () => {
      const s = new RandomizedSet([1, 2, 3])
      s.delete(2)
      expect(s.toArray().sort()).toEqual([1, 3])
    })
  })

  describe('values', () => {
    it('should return empty array for empty set', () => {
      expect(new RandomizedSet().values()).toEqual([])
    })

    it('should return all values', () => {
      const s = new RandomizedSet([1, 3, 5])
      expect(s.values().sort()).toEqual([1, 3, 5])
    })

    it('should return new array each call', () => {
      const s = new RandomizedSet([1])
      const a = s.values()
      const b = s.values()
      expect(a).not.toBe(b)
    })
  })

  describe('clone', () => {
    it('should clone empty set', () => {
      const s = new RandomizedSet<number>()
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty set', () => {
      const s = new RandomizedSet([1, 3, 5])
      const c = s.clone()
      expect(c.size).toBe(3)
      expect(c.has(1)).toBe(true)
      expect(c.has(3)).toBe(true)
      expect(c.has(5)).toBe(true)
    })

    it('should be independent from original', () => {
      const s = new RandomizedSet([1, 2])
      const c = s.clone()
      c.add(3)
      c.delete(1)
      expect(s.size).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(false)
      expect(c.has(1)).toBe(false)
      expect(c.has(3)).toBe(true)
    })

    it('should preserve all elements', () => {
      const s = new RandomizedSet([10, 20, 30, 40, 50])
      const c = s.clone()
      expect(c.toArray().sort()).toEqual([10, 20, 30, 40, 50])
    })

    it('should clone after mutations', () => {
      const s = new RandomizedSet([1, 2, 3, 4])
      s.delete(2)
      const c = s.clone()
      expect(c.size).toBe(3)
      expect(c.has(2)).toBe(false)
    })
  })

  describe('from', () => {
    it('should create set from array', () => {
      const s = RandomizedSet.from([1, 2, 3])
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
    })

    it('should create set from Set', () => {
      const s = RandomizedSet.from(new Set([1, 2, 3]))
      expect(s.size).toBe(3)
    })

    it('should deduplicate', () => {
      const s = RandomizedSet.from([1, 1, 2, 2, 3])
      expect(s.size).toBe(3)
    })

    it('should create empty set from empty array', () => {
      const s = RandomizedSet.from([])
      expect(s.size).toBe(0)
    })

    it('should create set from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const s = RandomizedSet.from(gen())
      expect(s.size).toBe(3)
    })
  })

  describe('getStats', () => {
    it('should return stats for empty set', () => {
      const s = new RandomizedSet<number>()
      const stats = s.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(0)
    })

    it('should return stats for non-empty set', () => {
      const s = new RandomizedSet([1, 2, 3])
      const stats = s.getStats()
      expect(stats.size).toBe(3)
      expect(stats.capacity).toBe(3)
    })

    it('should update after mutations', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      expect(s.getStats().size).toBe(2)
      s.delete(1)
      expect(s.getStats().size).toBe(1)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate empty set', () => {
      const s = new RandomizedSet<number>()
      const items: number[] = []
      for (const v of s) items.push(v)
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const s = new RandomizedSet([3, 1, 7])
      const items: number[] = []
      for (const v of s) items.push(v)
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('should work with spread operator', () => {
      const s = new RandomizedSet([1, 2])
      expect([...s].sort()).toEqual([1, 2])
    })

    it('should work with Array.from', () => {
      const s = new RandomizedSet([5])
      expect(Array.from(s)).toEqual([5])
    })

    it('should work with destructuring', () => {
      const s = new RandomizedSet([3, 7])
      const [first] = s
      expect(first).toBe(3)
    })

    it('should not iterate removed elements', () => {
      const s = new RandomizedSet([1, 2, 3])
      s.delete(2)
      const items = [...s].sort()
      expect(items).toEqual([1, 3])
    })

    it('should work after clear and re-add', () => {
      const s = new RandomizedSet([1, 2])
      s.clear()
      s.add(5)
      expect([...s]).toEqual([5])
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const s = new RandomizedSet<number>()
      s.add(42)
      expect(s.size).toBe(1)
      expect(s.has(42)).toBe(true)
      expect(s.isEmpty()).toBe(false)
      expect(s.getRandom()).toBe(42)
      s.delete(42)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle add/delete cycles', () => {
      const s = new RandomizedSet<number>()
      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < 5; i++) s.add(i)
        expect(s.size).toBe(5)
        for (let i = 0; i < 5; i++) s.delete(i)
        expect(s.size).toBe(0)
      }
    })

    it('should handle clear/add cycles', () => {
      const s = new RandomizedSet<number>()
      for (let round = 0; round < 10; round++) {
        s.add(1)
        s.add(2)
        s.add(3)
        expect(s.size).toBe(3)
        s.clear()
        expect(s.size).toBe(0)
      }
    })

    it('should handle boolean values', () => {
      const s = new RandomizedSet<boolean>()
      expect(s.add(true)).toBe(true)
      expect(s.add(false)).toBe(true)
      expect(s.size).toBe(2)
      expect(s.has(true)).toBe(true)
      expect(s.has(false)).toBe(true)
    })

    it('should handle NaN values', () => {
      const s = new RandomizedSet<number>()
      expect(s.add(NaN)).toBe(true)
      expect(s.has(NaN)).toBe(true)
      expect(s.add(NaN)).toBe(false)
      expect(s.delete(NaN)).toBe(true)
      expect(s.has(NaN)).toBe(false)
    })

    it('should handle object values by reference', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const obj3 = { id: 1 }
      const s = new RandomizedSet<object>()
      s.add(obj1)
      s.add(obj2)
      expect(s.has(obj1)).toBe(true)
      expect(s.has(obj2)).toBe(true)
      expect(s.has(obj3)).toBe(false)
    })

    it('should handle empty string', () => {
      const s = new RandomizedSet<string>()
      expect(s.add('')).toBe(true)
      expect(s.has('')).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('large sets', () => {
    it('should handle 1000 elements', () => {
      const s = new RandomizedSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      expect(s.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should handle deleting from 1000 elements', () => {
      const s = new RandomizedSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      for (let i = 0; i < 500; i++) s.delete(i)
      expect(s.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(s.has(i)).toBe(false)
      }
      for (let i = 500; i < 1000; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should getRandom from large set', () => {
      const s = new RandomizedSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      for (let i = 0; i < 100; i++) {
        const val = s.getRandom()
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(1000)
      }
    })

    it('should handle 10000 elements', () => {
      const s = new RandomizedSet<number>()
      for (let i = 0; i < 10000; i++) s.add(i)
      expect(s.size).toBe(10000)
    })

    it('should handle interleaved add/delete on large set', () => {
      const s = new RandomizedSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      for (let i = 0; i < 500; i++) s.delete(i)
      for (let i = 1000; i < 1500; i++) s.add(i)
      expect(s.size).toBe(1000)
    })

    it('getRandom distribution on large set', () => {
      const s = new RandomizedSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      const seen = new Set<number>()
      for (let i = 0; i < 5000; i++) {
        seen.add(s.getRandom())
        if (seen.size === 100) break
      }
      expect(seen.size).toBe(100)
    })
  })

  describe('getRandom distribution', () => {
    it('should have roughly uniform distribution with 2 elements', () => {
      const s = new RandomizedSet([0, 1])
      const counts = [0, 0]
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        counts[s.getRandom()]!++
      }
      const expected = trials / 2
      expect(counts[0]!).toBeGreaterThan(expected * 0.7)
      expect(counts[1]!).toBeGreaterThan(expected * 0.7)
    })

    it('should have roughly uniform distribution with 10 elements', () => {
      const s = new RandomizedSet([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      const counts = new Array(10).fill(0)
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        counts[s.getRandom()]!++
      }
      const expected = trials / 10
      for (let i = 0; i < 10; i++) {
        expect(counts[i]!).toBeGreaterThan(expected * 0.5)
      }
    })

    it('should update distribution after mutations', () => {
      const s = new RandomizedSet([1, 2, 3, 4, 5])
      s.delete(1)
      s.delete(3)
      const seen = new Set<number>()
      for (let i = 0; i < 200; i++) {
        seen.add(s.getRandom())
      }
      expect(seen.has(1)).toBe(false)
      expect(seen.has(3)).toBe(false)
      expect(seen.has(2)).toBe(true)
      expect(seen.has(4)).toBe(true)
      expect(seen.has(5)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export the class and types', async () => {
      const mod = await import('../../src/core/randomized-set/randomized-set.js')
      expect(mod.RandomizedSet).toBeDefined()
      expect(mod.DEFAULT_RANDOMIZED_SET_OPTIONS).toBeDefined()
    })
  })

  describe('combined operations', () => {
    it('should handle add-delete-add sequence', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      s.delete(1)
      s.add(3)
      s.add(1)
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should handle clone after complex operations', () => {
      const s = new RandomizedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(4)
      s.add(5)
      s.delete(1)
      const c = s.clone()
      expect(c.size).toBe(3)
      expect(c.has(3)).toBe(true)
      expect(c.has(4)).toBe(true)
      expect(c.has(5)).toBe(true)
    })

    it('should handle from with subsequent mutations', () => {
      const s = RandomizedSet.from([1, 2, 3, 4, 5])
      s.delete(3)
      s.add(6)
      expect(s.size).toBe(5)
      expect(s.has(3)).toBe(false)
      expect(s.has(6)).toBe(true)
    })

    it('should handle forEach with index-like tracking', () => {
      const s = new RandomizedSet([10, 20, 30])
      let sum = 0
      s.forEach((v) => { sum += v })
      expect(sum).toBe(60)
    })

    it('toArray and values should return same contents', () => {
      const s = new RandomizedSet([1, 2, 3])
      expect(s.toArray().sort()).toEqual(s.values().sort())
    })

    it('should handle string set throughout lifecycle', () => {
      const s = new RandomizedSet<string>()
      s.add('hello')
      s.add('world')
      s.add('!')
      expect(s.size).toBe(3)
      expect(s.getRandom()).toBeTruthy()
      s.delete('!')
      expect(s.size).toBe(2)
      const arr = s.toArray()
      expect(arr).toContain('hello')
      expect(arr).toContain('world')
    })

    it('should handle Symbol values', () => {
      const sym1 = Symbol('a')
      const sym2 = Symbol('b')
      const s = new RandomizedSet<symbol>()
      s.add(sym1)
      s.add(sym2)
      expect(s.size).toBe(2)
      expect(s.has(sym1)).toBe(true)
      expect(s.has(sym2)).toBe(true)
      expect(s.delete(sym1)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should handle mixed object types', () => {
      const arr = [1, 2, 3]
      const obj = { a: 1 }
      const fn = () => {}
      const s = new RandomizedSet<unknown>([arr, obj, fn])
      expect(s.size).toBe(3)
      expect(s.has(arr)).toBe(true)
      expect(s.has(obj)).toBe(true)
      expect(s.has(fn)).toBe(true)
    })
  })
})
