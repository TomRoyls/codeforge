import { describe, it, expect, beforeEach } from 'vitest'
import { HopscotchSet } from '../../src/core/hopscotch-set/hopscotch-set.js'
import type { HopscotchSetOptions, HopscotchSetStats } from '../../src/core/hopscotch-set/types.js'

describe('HopscotchSet', () => {
  describe('construction', () => {
    it('should create set with default options', () => {
      const set = new HopscotchSet<string>()
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.capacity()).toBe(16)
    })

    it('should create set with custom capacity', () => {
      const set = new HopscotchSet<string>({ capacity: 64 })
      expect(set.capacity()).toBe(64)
    })

    it('should enforce minimum capacity of 16', () => {
      const set = new HopscotchSet<string>({ capacity: 4 })
      expect(set.capacity()).toBe(16)
    })

    it('should handle zero capacity', () => {
      const set = new HopscotchSet<string>({ capacity: 0 })
      expect(set.capacity()).toBe(16)
    })

    it('should handle negative capacity', () => {
      const set = new HopscotchSet<string>({ capacity: -10 })
      expect(set.capacity()).toBe(16)
    })

    it('should handle undefined options', () => {
      const set = new HopscotchSet<string>(undefined)
      expect(set.capacity()).toBe(16)
    })

    it('should report zero load factor when empty', () => {
      const set = new HopscotchSet<string>()
      expect(set.loadFactor()).toBe(0)
    })

    it('should accept neighborhoodSize option', () => {
      const set = new HopscotchSet<string>({ neighborhoodSize: 16 })
      const stats = set.stats()
      expect(stats.neighborhoodSize).toBe(16)
    })

    it('should default neighborhoodSize to 32', () => {
      const set = new HopscotchSet<string>()
      expect(set.stats().neighborhoodSize).toBe(32)
    })

    it('should reset invalid neighborhoodSize to default', () => {
      const set = new HopscotchSet<string>({ neighborhoodSize: 0 })
      expect(set.stats().neighborhoodSize).toBe(32)
    })

    it('should accept loadFactorThreshold option', () => {
      const set = new HopscotchSet<string>({ loadFactorThreshold: 0.5 })
      expect(set.loadFactor()).toBe(0)
    })
  })

  describe('add', () => {
    let set: HopscotchSet<string>

    beforeEach(() => {
      set = new HopscotchSet<string>()
    })

    it('should add a single value', () => {
      set.add('a')
      expect(set.has('a')).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('should add multiple values', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size()).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('should not duplicate values', () => {
      set.add('a')
      set.add('a')
      expect(set.size()).toBe(1)
    })

    it('should handle number values', () => {
      const s = new HopscotchSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size()).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
    })

    it('should handle empty string', () => {
      set.add('')
      expect(set.has('')).toBe(true)
    })

    it('should handle unicode values', () => {
      set.add('日本語')
      set.add('中文')
      set.add('한국어')
      set.add('🌍🌎🌏')
      expect(set.has('日本語')).toBe(true)
      expect(set.has('中文')).toBe(true)
      expect(set.has('한국어')).toBe(true)
      expect(set.has('🌍🌎🌏')).toBe(true)
    })

    it('should handle special characters', () => {
      set.add('key with spaces')
      set.add('key\nwith\nnewlines')
      set.add('key\twith\ttabs')
      expect(set.has('key with spaces')).toBe(true)
      expect(set.has('key\nwith\nnewlines')).toBe(true)
      expect(set.has('key\twith\ttabs')).toBe(true)
    })

    it('should handle large string values', () => {
      const longVal = 'x'.repeat(1000)
      set.add(longVal)
      expect(set.has(longVal)).toBe(true)
    })

    it('should handle 20 insertions', () => {
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      expect(set.size()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(set.has(`val${i}`)).toBe(true)
      }
    })

    it('should handle boolean values', () => {
      const s = new HopscotchSet<boolean>()
      s.add(true)
      s.add(false)
      expect(s.has(true)).toBe(true)
      expect(s.has(false)).toBe(true)
      expect(s.size()).toBe(2)
    })

    it('should handle object references', () => {
      const obj = { id: 1 }
      const s = new HopscotchSet<object>()
      s.add(obj)
      expect(s.has(obj)).toBe(true)
    })

    it('should add after clear', () => {
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.has('a')).toBe(false)
      expect(set.has('b')).toBe(true)
    })
  })

  describe('delete', () => {
    let set: HopscotchSet<string>

    beforeEach(() => {
      set = new HopscotchSet<string>()
    })

    it('should delete existing value', () => {
      set.add('a')
      expect(set.delete('a')).toBe(true)
      expect(set.has('a')).toBe(false)
    })

    it('should return false for missing value', () => {
      expect(set.delete('missing')).toBe(false)
    })

    it('should decrement size on delete', () => {
      set.add('a')
      set.add('b')
      expect(set.size()).toBe(2)
      set.delete('a')
      expect(set.size()).toBe(1)
    })

    it('should handle delete from empty set', () => {
      expect(set.delete('a')).toBe(false)
      expect(set.size()).toBe(0)
    })

    it('should handle delete then readd', () => {
      set.add('a')
      set.delete('a')
      set.add('a')
      expect(set.has('a')).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('should handle delete of all entries', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('a')
      set.delete('b')
      set.delete('c')
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should handle double delete', () => {
      set.add('a')
      expect(set.delete('a')).toBe(true)
      expect(set.delete('a')).toBe(false)
    })

    it('should not affect other values on delete', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('b')
      expect(set.has('a')).toBe(true)
      expect(set.has('c')).toBe(true)
      expect(set.has('b')).toBe(false)
    })

    it('should handle delete after many insertions', () => {
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      set.delete('val10')
      expect(set.has('val10')).toBe(false)
      expect(set.size()).toBe(19)
    })

    it('should handle delete after resize', () => {
      for (let i = 0; i < 15; i++) {
        set.add(`val${i}`)
      }
      expect(set.delete('val5')).toBe(true)
      expect(set.has('val5')).toBe(false)
    })

    it('should handle delete with number values', () => {
      const s = new HopscotchSet<number>()
      s.add(1)
      s.add(42)
      s.delete(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(42)).toBe(true)
    })
  })

  describe('has', () => {
    let set: HopscotchSet<string>

    beforeEach(() => {
      set = new HopscotchSet<string>()
    })

    it('should return false for missing value', () => {
      expect(set.has('missing')).toBe(false)
    })

    it('should return true for existing value', () => {
      set.add('a')
      expect(set.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      set.add('a')
      set.delete('a')
      expect(set.has('a')).toBe(false)
    })

    it('should return true after readd', () => {
      set.add('a')
      set.delete('a')
      set.add('a')
      expect(set.has('a')).toBe(true)
    })

    it('should handle has on empty set', () => {
      expect(set.has('anything')).toBe(false)
    })

    it('should return true for value added multiple times', () => {
      set.add('a')
      set.add('a')
      set.add('a')
      expect(set.has('a')).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty set', () => {
      const set = new HopscotchSet<string>()
      expect(set.size()).toBe(0)
    })

    it('should track size correctly', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      expect(set.size()).toBe(1)
      set.add('b')
      expect(set.size()).toBe(2)
      set.add('c')
      expect(set.size()).toBe(3)
    })

    it('should not increment on duplicate add', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('a')
      expect(set.size()).toBe(1)
    })

    it('should decrement on delete', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.size()).toBe(1)
    })

    it('should reset to 0 on clear', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.clear()
      expect(set.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      const set = new HopscotchSet<string>()
      expect(set.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      expect(set.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('should return true after deleting all', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.delete('a')
      expect(set.isEmpty()).toBe(true)
    })

    it('should return false if some elements remain', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.clear()
      expect(set.size()).toBe(0)
      expect(set.has('a')).toBe(false)
      expect(set.has('b')).toBe(false)
    })

    it('should work on empty set', () => {
      const set = new HopscotchSet<string>()
      set.clear()
      expect(set.size()).toBe(0)
    })

    it('should preserve capacity', () => {
      const set = new HopscotchSet<string>({ capacity: 64 })
      set.add('a')
      set.clear()
      expect(set.capacity()).toBe(64)
    })

    it('should allow insertions after clear', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.has('b')).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('should reset load factor', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.clear()
      expect(set.loadFactor()).toBe(0)
    })

    it('should handle multiple clears', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.clear()
      set.add('b')
      set.clear()
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
    })

    it('should preserve size in clone', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      expect(cloned.size()).toBe(2)
    })

    it('should preserve capacity in clone', () => {
      const set = new HopscotchSet<string>({ capacity: 64 })
      const cloned = set.clone()
      expect(cloned.capacity()).toBe(64)
    })

    it('should be independent from original', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      const cloned = set.clone()
      cloned.add('b')
      expect(set.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('should not share state on delete', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      cloned.delete('a')
      expect(set.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('should clone empty set', () => {
      const set = new HopscotchSet<string>()
      const cloned = set.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should handle clone after modification', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      cloned.clear()
      expect(set.size()).toBe(2)
    })

    it('should preserve neighborhoodSize in clone', () => {
      const set = new HopscotchSet<string>({ neighborhoodSize: 16 })
      const cloned = set.clone()
      expect(cloned.stats().neighborhoodSize).toBe(16)
    })

    it('should handle clone of large set', () => {
      const set = new HopscotchSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      const cloned = set.clone()
      expect(cloned.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(cloned.has(i)).toBe(true)
      }
    })

    it('should preserve load factor in clone', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      expect(cloned.loadFactor()).toBe(set.loadFactor())
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      const set = new HopscotchSet<string>()
      expect(set.toArray()).toEqual([])
    })

    it('should return all values', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      const arr = set.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain('a')
      expect(arr).toContain('b')
      expect(arr).toContain('c')
    })

    it('should not include deleted values', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      const arr = set.toArray()
      expect(arr).toHaveLength(1)
      expect(arr).toContain('b')
    })

    it('should not include duplicates', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('a')
      set.add('a')
      expect(set.toArray()).toEqual(['a'])
    })

    it('should handle single element', () => {
      const set = new HopscotchSet<string>()
      set.add('x')
      expect(set.toArray()).toEqual(['x'])
    })

    it('should return new array each time', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      const arr1 = set.toArray()
      const arr2 = set.toArray()
      expect(arr1).not.toBe(arr2)
    })

    it('should handle number values', () => {
      const set = new HopscotchSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const arr = set.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('should reflect current state after clear and readd', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.toArray()).toEqual(['b'])
    })
  })

  describe('from factory', () => {
    it('should create set from array', () => {
      const set = HopscotchSet.from(['a', 'b', 'c'])
      expect(set.size()).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('should deduplicate items', () => {
      const set = HopscotchSet.from(['a', 'b', 'a', 'c', 'b'])
      expect(set.size()).toBe(3)
    })

    it('should create set from empty array', () => {
      const set = HopscotchSet.from([])
      expect(set.size()).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should create set from Set', () => {
      const native = new Set([1, 2, 3])
      const set = HopscotchSet.from(native)
      expect(set.size()).toBe(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
    })

    it('should create set with options', () => {
      const set = HopscotchSet.from(['a', 'b'], { capacity: 64 })
      expect(set.capacity()).toBe(64)
      expect(set.size()).toBe(2)
    })

    it('should create set from generator', () => {
      function* gen() {
        yield 'x'
        yield 'y'
        yield 'z'
      }
      const set = HopscotchSet.from(gen())
      expect(set.size()).toBe(3)
      expect(set.has('x')).toBe(true)
    })

    it('should create set from number array', () => {
      const set = HopscotchSet.from([1, 2, 3, 4, 5])
      expect(set.size()).toBe(5)
      for (let i = 1; i <= 5; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('should handle single element iterable', () => {
      const set = HopscotchSet.from(['only'])
      expect(set.size()).toBe(1)
      expect(set.has('only')).toBe(true)
    })
  })

  describe('forEach', () => {
    let set: HopscotchSet<string>

    beforeEach(() => {
      set = new HopscotchSet<string>()
    })

    it('should not call callback on empty set', () => {
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each value', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('should pass correct value', () => {
      set.add('x')
      let received: string | undefined
      set.forEach((v) => { received = v })
      expect(received).toBe('x')
    })

    it('should iterate all values', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      const values: string[] = []
      set.forEach((v) => { values.push(v) })
      expect(values).toHaveLength(3)
      expect(values.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should skip deleted values', () => {
      set.add('a')
      set.add('b')
      set.delete('a')
      const values: string[] = []
      set.forEach((v) => { values.push(v) })
      expect(values).toEqual(['b'])
    })

    it('should handle single element', () => {
      set.add('a')
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(1)
    })

    it('should handle many elements', () => {
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(20)
    })

    it('should not modify set', () => {
      set.add('a')
      set.add('b')
      set.forEach(() => {})
      expect(set.size()).toBe(2)
    })
  })

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const set = new HopscotchSet<string>({ capacity: 32 })
      expect(set.capacity()).toBe(32)
    })

    it('should return default capacity', () => {
      const set = new HopscotchSet<string>()
      expect(set.capacity()).toBe(16)
    })

    it('should update after auto resize', () => {
      const set = new HopscotchSet<string>()
      const initialCap = set.capacity()
      for (let i = 0; i < initialCap; i++) {
        set.add(`val${i}`)
      }
      expect(set.capacity()).toBeGreaterThan(initialCap)
    })
  })

  describe('loadFactor', () => {
    it('should be 0 when empty', () => {
      const set = new HopscotchSet<string>()
      expect(set.loadFactor()).toBe(0)
    })

    it('should increase with adds', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      expect(set.loadFactor()).toBe(1 / set.capacity())
    })

    it('should decrease with deletes', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.loadFactor()).toBe(1 / set.capacity())
    })

    it('should decrease after resize', () => {
      const set = new HopscotchSet<string>()
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      expect(set.loadFactor()).toBeLessThan(0.75)
    })

    it('should be 0 after clear', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.clear()
      expect(set.loadFactor()).toBe(0)
    })
  })

  describe('rehash', () => {
    let set: HopscotchSet<string>

    beforeEach(() => {
      set = new HopscotchSet<string>()
    })

    it('should rehash to specified capacity', () => {
      set.add('a')
      set.rehash(64)
      expect(set.capacity()).toBe(64)
    })

    it('should preserve all values after rehash', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      set.rehash(64)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('should preserve size after rehash', () => {
      set.add('a')
      set.add('b')
      set.rehash(64)
      expect(set.size()).toBe(2)
    })

    it('should rehash to same capacity when no arg given', () => {
      set.add('a')
      set.rehash()
      expect(set.has('a')).toBe(true)
      expect(set.size()).toBe(1)
    })

    it('should enforce minimum capacity on rehash', () => {
      set.add('a')
      set.rehash(4)
      expect(set.capacity()).toBe(16)
    })

    it('should allow insertions after rehash', () => {
      set.add('a')
      set.rehash(64)
      set.add('b')
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('should handle rehash on empty set', () => {
      set.rehash(32)
      expect(set.capacity()).toBe(32)
      expect(set.size()).toBe(0)
    })

    it('should handle rehash to smaller capacity', () => {
      const s = new HopscotchSet<string>({ capacity: 64 })
      s.add('a')
      s.add('b')
      s.rehash(16)
      expect(s.has('a')).toBe(true)
      expect(s.has('b')).toBe(true)
    })

    it('should handle multiple rehashes', () => {
      set.add('a')
      set.add('b')
      set.rehash(32)
      set.rehash(64)
      set.rehash(128)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('should update load factor after rehash', () => {
      set.add('a')
      const lfBefore = set.loadFactor()
      set.rehash(128)
      const lfAfter = set.loadFactor()
      expect(lfAfter).toBeLessThan(lfBefore)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty set', () => {
      const set = new HopscotchSet<string>()
      const stats = set.stats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.neighborhoodSize).toBe(32)
    })

    it('should return correct stats after insertions', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      const stats = set.stats()
      expect(stats.size).toBe(3)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(3 / 16)
    })

    it('should return correct stats after deletions', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      const stats = set.stats()
      expect(stats.size).toBe(1)
    })

    it('should return correct stats after rehash', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.rehash(64)
      const stats = set.stats()
      expect(stats.capacity).toBe(64)
      expect(stats.size).toBe(1)
      expect(stats.loadFactor).toBe(1 / 64)
    })

    it('should return custom neighborhoodSize', () => {
      const set = new HopscotchSet<string>({ neighborhoodSize: 16 })
      const stats = set.stats()
      expect(stats.neighborhoodSize).toBe(16)
    })

    it('should reflect clear', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('b')
      set.clear()
      const stats = set.stats()
      expect(stats.size).toBe(0)
      expect(stats.loadFactor).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty set operations', () => {
      const set = new HopscotchSet<string>()
      expect(set.has('a')).toBe(false)
      expect(set.delete('a')).toBe(false)
      expect(set.toArray()).toEqual([])
      expect(set.size()).toBe(0)
    })

    it('should handle single element lifecycle', () => {
      const set = new HopscotchSet<string>()
      set.add('only')
      expect(set.has('only')).toBe(true)
      expect(set.size()).toBe(1)
      set.delete('only')
      expect(set.has('only')).toBe(false)
      expect(set.size()).toBe(0)
    })

    it('should handle collision-heavy data', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      const keys = ['abc', 'abc1', 'abc2', 'abc3', 'abc4', 'abc5', 'abc6', 'abc7']
      keys.forEach(k => set.add(k))
      keys.forEach(k => expect(set.has(k)).toBe(true))
      expect(set.size()).toBe(keys.length)
    })

    it('should handle very similar values', () => {
      const set = new HopscotchSet<string>()
      set.add('a')
      set.add('aa')
      set.add('aaa')
      expect(set.has('a')).toBe(true)
      expect(set.has('aa')).toBe(true)
      expect(set.has('aaa')).toBe(true)
    })

    it('should handle values differing only by case', () => {
      const set = new HopscotchSet<string>()
      set.add('key')
      set.add('KEY')
      set.add('Key')
      expect(set.has('key')).toBe(true)
      expect(set.has('KEY')).toBe(true)
      expect(set.has('Key')).toBe(true)
      expect(set.size()).toBe(3)
    })

    it('should handle repeated add delete cycle', () => {
      const set = new HopscotchSet<string>()
      for (let i = 0; i < 100; i++) {
        set.add('a')
        if (i % 2 === 0) {
          set.delete('a')
        }
      }
      expect(set.has('a')).toBe(true)
    })

    it('should handle sequential number keys', () => {
      const set = new HopscotchSet<number>({ capacity: 16 })
      for (let i = 0; i < 15; i++) {
        set.add(i)
      }
      for (let i = 0; i < 15; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('should handle forEach on empty set without error', () => {
      const set = new HopscotchSet<string>()
      set.forEach(() => { throw new Error('should not call') })
    })

    it('should handle delete and reinsert causing collisions', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        set.add(`val${i}`)
      }
      set.delete('val5')
      set.delete('val3')
      set.add('val5')
      set.add('val3')
      expect(set.has('val5')).toBe(true)
      expect(set.has('val3')).toBe(true)
    })

    it('should handle dense insertion pattern', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      for (let i = 0; i < 20; i++) {
        set.add(`k${i}`)
      }
      for (let i = 0; i < 20; i++) {
        expect(set.has(`k${i}`)).toBe(true)
      }
    })
  })

  describe('large sets', () => {
    it('should handle 10000+ number elements', () => {
      const set = new HopscotchSet<number>()
      for (let i = 0; i < 10000; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('should handle 10000+ string elements', () => {
      const set = new HopscotchSet<string>()
      for (let i = 0; i < 10000; i++) {
        set.add(`val_${i}`)
      }
      expect(set.size()).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(set.has(`val_${i}`)).toBe(true)
      }
    })

    it('should handle mixed operations on large set', () => {
      const set = new HopscotchSet<number>()
      for (let i = 0; i < 5000; i++) {
        set.add(i)
      }
      for (let i = 0; i < 2500; i++) {
        set.delete(i)
      }
      for (let i = 5000; i < 7500; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(7500 - 2500)
      for (let i = 2500; i < 7500; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('should handle insert delete reinsert cycle on large set', () => {
      const set = new HopscotchSet<number>()
      for (let i = 0; i < 10000; i++) {
        set.add(i)
      }
      for (let i = 0; i < 5000; i++) {
        set.delete(i)
      }
      expect(set.size()).toBe(5000)
      for (let i = 0; i < 5000; i++) {
        set.add(i)
      }
      expect(set.size()).toBe(10000)
    })

    it('should handle forEach on large set', () => {
      const set = new HopscotchSet<number>()
      for (let i = 0; i < 5000; i++) {
        set.add(i)
      }
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(5000)
    })

    it('should handle toArray on large set', () => {
      const set = new HopscotchSet<number>()
      for (let i = 0; i < 5000; i++) {
        set.add(i)
      }
      const arr = set.toArray()
      expect(arr).toHaveLength(5000)
    })
  })

  describe('resize behavior', () => {
    it('should auto-resize when load factor threshold reached', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      const initialCap = set.capacity()
      for (let i = 0; i < initialCap; i++) {
        set.add(`val${i}`)
      }
      expect(set.capacity()).toBeGreaterThan(initialCap)
    })

    it('should preserve all data after auto-resize', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      for (let i = 0; i < 20; i++) {
        expect(set.has(`val${i}`)).toBe(true)
      }
    })

    it('should allow continued insertions after resize', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      for (let i = 0; i < 100; i++) {
        set.add(`val${i}`)
      }
      expect(set.size()).toBe(100)
    })

    it('should maintain correct size after resize', () => {
      const set = new HopscotchSet<string>({ capacity: 16 })
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      expect(set.size()).toBe(20)
    })

    it('should handle custom load factor threshold', () => {
      const set = new HopscotchSet<string>({ capacity: 16, loadFactorThreshold: 0.5 })
      const initialCap = set.capacity()
      for (let i = 0; i < Math.floor(initialCap * 0.5) + 1; i++) {
        set.add(`val${i}`)
      }
      expect(set.capacity()).toBeGreaterThan(initialCap)
    })

    it('should have lower load factor after resize', () => {
      const set = new HopscotchSet<string>()
      for (let i = 0; i < 20; i++) {
        set.add(`val${i}`)
      }
      expect(set.loadFactor()).toBeLessThan(0.75)
    })
  })

  describe('type exports', () => {
    it('should export HopscotchSetOptions type', () => {
      const opts: HopscotchSetOptions = { capacity: 32, neighborhoodSize: 16, loadFactorThreshold: 0.6 }
      const set = new HopscotchSet<string>(opts)
      expect(set.capacity()).toBe(32)
    })

    it('should export HopscotchSetStats type', () => {
      const set = new HopscotchSet<string>()
      const stats: HopscotchSetStats = set.stats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.neighborhoodSize).toBe(32)
    })
  })
})
