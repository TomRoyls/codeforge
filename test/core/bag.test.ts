import { describe, it, expect, beforeEach } from 'vitest'
import { Bag } from '../../src/core/bag/bag.js'

describe('Bag', () => {
  describe('construction', () => {
    it('should create an empty bag', () => {
      const bag = new Bag<number>()
      expect(bag.size).toBe(0)
      expect(bag.uniqueSize).toBe(0)
      expect(bag.isEmpty()).toBe(true)
    })

    it('should accept empty options object', () => {
      const bag = new Bag<number>({})
      expect(bag.size).toBe(0)
    })

    it('should handle undefined options', () => {
      const bag = new Bag<number>(undefined)
      expect(bag.size).toBe(0)
    })

    it('should accept partial options', () => {
      const bag = new Bag<number>({ hash: String })
      expect(bag.size).toBe(0)
    })

    it('should work with string type', () => {
      const bag = new Bag<string>()
      bag.add('hello')
      expect(bag.size).toBe(1)
      expect(bag.contains('hello')).toBe(true)
    })

    it('should work with object type', () => {
      const bag = new Bag<object>()
      const obj = { x: 1 }
      bag.add(obj)
      expect(bag.size).toBe(1)
      expect(bag.contains(obj)).toBe(true)
    })
  })

  describe('add', () => {
    let bag: Bag<number>
    beforeEach(() => {
      bag = new Bag<number>()
    })

    it('should add a single element', () => {
      bag.add(5)
      expect(bag.size).toBe(1)
      expect(bag.uniqueSize).toBe(1)
      expect(bag.contains(5)).toBe(true)
    })

    it('should add duplicate elements', () => {
      bag.add(5)
      bag.add(5)
      bag.add(5)
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(1)
      expect(bag.countOf(5)).toBe(3)
    })

    it('should add multiple distinct elements', () => {
      bag.add(1)
      bag.add(2)
      bag.add(3)
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(3)
    })

    it('should add with explicit count', () => {
      bag.add(5, 10)
      expect(bag.size).toBe(10)
      expect(bag.countOf(5)).toBe(10)
    })

    it('should add to existing count', () => {
      bag.add(5, 3)
      bag.add(5, 7)
      expect(bag.countOf(5)).toBe(10)
    })

    it('should do nothing for count 0', () => {
      bag.add(5, 0)
      expect(bag.size).toBe(0)
      expect(bag.contains(5)).toBe(false)
    })

    it('should do nothing for negative count', () => {
      bag.add(5, -1)
      expect(bag.size).toBe(0)
      expect(bag.contains(5)).toBe(false)
    })

    it('should handle mixed add with counts and singles', () => {
      bag.add(1, 3)
      bag.add(3)
      bag.add(2, 2)
      expect(bag.size).toBe(6)
      expect(bag.uniqueSize).toBe(3)
    })

    it('should handle adding NaN', () => {
      bag.add(NaN)
      bag.add(NaN)
      expect(bag.countOf(NaN)).toBe(2)
      expect(bag.contains(NaN)).toBe(true)
    })

    it('should handle adding zero', () => {
      bag.add(0)
      bag.add(0, 3)
      expect(bag.countOf(0)).toBe(4)
    })

    it('should handle adding undefined values', () => {
      const b = new Bag<undefined>()
      b.add(undefined)
      b.add(undefined, 2)
      expect(b.countOf(undefined)).toBe(3)
    })
  })

  describe('remove', () => {
    let bag: Bag<number>
    beforeEach(() => {
      bag = new Bag<number>()
    })

    it('should remove a single copy', () => {
      bag.add(5, 3)
      const removed = bag.remove(5)
      expect(removed).toBe(1)
      expect(bag.countOf(5)).toBe(2)
    })

    it('should remove multiple copies', () => {
      bag.add(5, 10)
      const removed = bag.remove(5, 7)
      expect(removed).toBe(7)
      expect(bag.countOf(5)).toBe(3)
    })

    it('should remove up to available count', () => {
      bag.add(5, 3)
      const removed = bag.remove(5, 10)
      expect(removed).toBe(3)
      expect(bag.countOf(5)).toBe(0)
      expect(bag.contains(5)).toBe(false)
    })

    it('should return 0 for non-existent element', () => {
      const removed = bag.remove(5)
      expect(removed).toBe(0)
    })

    it('should return 0 for count < 1', () => {
      bag.add(5)
      expect(bag.remove(5, 0)).toBe(0)
      expect(bag.remove(5, -1)).toBe(0)
    })

    it('should remove element entirely when count reaches 0', () => {
      bag.add(5, 2)
      bag.remove(5, 2)
      expect(bag.uniqueSize).toBe(0)
      expect(bag.contains(5)).toBe(false)
    })

    it('should handle remove from empty bag', () => {
      expect(bag.remove(1)).toBe(0)
    })

    it('should handle sequential removes', () => {
      bag.add(5, 5)
      expect(bag.remove(5, 2)).toBe(2)
      expect(bag.remove(5, 2)).toBe(2)
      expect(bag.remove(5, 2)).toBe(1)
      expect(bag.remove(5, 1)).toBe(0)
    })

    it('should not affect other elements', () => {
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(2)
      expect(bag.contains(1)).toBe(true)
      expect(bag.contains(3)).toBe(true)
      expect(bag.contains(2)).toBe(false)
    })

    it('should update total size correctly', () => {
      bag.add(1, 5)
      bag.add(2, 3)
      bag.remove(1, 2)
      bag.remove(2, 1)
      expect(bag.size).toBe(5)
    })

    it('should handle removing NaN', () => {
      bag.add(NaN, 3)
      expect(bag.remove(NaN, 2)).toBe(2)
      expect(bag.countOf(NaN)).toBe(1)
    })
  })

  describe('countOf', () => {
    it('should return 0 for non-existent element', () => {
      const bag = new Bag<number>()
      expect(bag.countOf(5)).toBe(0)
    })

    it('should return the multiplicity', () => {
      const bag = new Bag<number>()
      bag.add(5, 7)
      expect(bag.countOf(5)).toBe(7)
    })

    it('should reflect adds and removes', () => {
      const bag = new Bag<number>()
      bag.add(5, 10)
      bag.remove(5, 3)
      expect(bag.countOf(5)).toBe(7)
    })

    it('should return 0 after complete removal', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      bag.remove(5, 3)
      expect(bag.countOf(5)).toBe(0)
    })

    it('should return 0 after clear', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      bag.clear()
      expect(bag.countOf(5)).toBe(0)
    })

    it('should handle multiple elements independently', () => {
      const bag = new Bag<number>()
      bag.add(1, 2)
      bag.add(2, 5)
      bag.add(3, 1)
      expect(bag.countOf(1)).toBe(2)
      expect(bag.countOf(2)).toBe(5)
      expect(bag.countOf(3)).toBe(1)
      expect(bag.countOf(4)).toBe(0)
    })

    it('should handle NaN', () => {
      const bag = new Bag<number>()
      bag.add(NaN, 3)
      expect(bag.countOf(NaN)).toBe(3)
      expect(bag.countOf(NaN)).toBe(3)
    })
  })

  describe('contains', () => {
    let bag: Bag<number>
    beforeEach(() => {
      bag = new Bag<number>()
    })

    it('should return false for empty bag', () => {
      expect(bag.contains(1)).toBe(false)
    })

    it('should return true for present element', () => {
      bag.add(5)
      expect(bag.contains(5)).toBe(true)
    })

    it('should return false for absent element', () => {
      bag.add(5)
      expect(bag.contains(6)).toBe(false)
    })

    it('should return false after complete removal', () => {
      bag.add(5, 3)
      bag.remove(5, 3)
      expect(bag.contains(5)).toBe(false)
    })

    it('should return true when some copies remain', () => {
      bag.add(5, 3)
      bag.remove(5, 2)
      expect(bag.contains(5)).toBe(true)
    })

    it('should handle NaN correctly', () => {
      bag.add(NaN)
      expect(bag.contains(NaN)).toBe(true)
    })
  })

  describe('size/uniqueSize', () => {
    it('should return 0 for new bag', () => {
      const bag = new Bag<number>()
      expect(bag.size).toBe(0)
      expect(bag.uniqueSize).toBe(0)
    })

    it('should track total size with duplicates', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      expect(bag.size).toBe(8)
      expect(bag.uniqueSize).toBe(2)
    })

    it('should update after remove', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.remove(1, 3)
      expect(bag.size).toBe(2)
      expect(bag.uniqueSize).toBe(1)
    })

    it('should update after removing all copies', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.add(2, 2)
      bag.remove(1, 3)
      expect(bag.size).toBe(2)
      expect(bag.uniqueSize).toBe(1)
    })

    it('should update after clear', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.clear()
      expect(bag.size).toBe(0)
      expect(bag.uniqueSize).toBe(0)
    })

    it('should handle single element', () => {
      const bag = new Bag<number>()
      bag.add(5, 10)
      expect(bag.size).toBe(10)
      expect(bag.uniqueSize).toBe(1)
    })

    it('should handle many unique elements', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 100; i++) {
        bag.add(i)
      }
      expect(bag.size).toBe(100)
      expect(bag.uniqueSize).toBe(100)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new bag', () => {
      expect(new Bag<number>().isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const bag = new Bag<number>()
      bag.add(5)
      expect(bag.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      bag.remove(5, 3)
      expect(bag.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.clear()
      expect(bag.isEmpty()).toBe(true)
    })

    it('should return false when some copies remain', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      bag.remove(5, 2)
      expect(bag.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      bag.add(3, 1)
      bag.clear()
      expect(bag.size).toBe(0)
      expect(bag.uniqueSize).toBe(0)
      expect(bag.isEmpty()).toBe(true)
    })

    it('should be safe to call on empty bag', () => {
      const bag = new Bag<number>()
      bag.clear()
      expect(bag.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.clear()
      bag.clear()
      expect(bag.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.clear()
      bag.add(2, 2)
      expect(bag.size).toBe(2)
      expect(bag.contains(1)).toBe(false)
      expect(bag.contains(2)).toBe(true)
    })

    it('should return void', () => {
      const bag = new Bag<number>()
      expect(bag.clear()).toBeUndefined()
    })

    it('should not find old elements after clear', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      bag.clear()
      expect(bag.countOf(5)).toBe(0)
      expect(bag.contains(5)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty bag', () => {
      const bag = new Bag<number>()
      const c = bag.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty bag', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.add(2, 2)
      bag.add(3, 1)
      const c = bag.clone()
      expect(c.size).toBe(6)
      expect(c.uniqueSize).toBe(3)
    })

    it('should be independent from original', () => {
      const bag = new Bag<number>()
      bag.add(1, 2)
      bag.add(2, 1)
      const c = bag.clone()
      c.add(3)
      c.remove(1)
      expect(bag.size).toBe(3)
      expect(bag.contains(3)).toBe(false)
      expect(c.size).toBe(3)
      expect(c.contains(3)).toBe(true)
    })

    it('should preserve all counts', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 10)
      bag.add(3, 1)
      const c = bag.clone()
      expect(c.countOf(1)).toBe(5)
      expect(c.countOf(2)).toBe(10)
      expect(c.countOf(3)).toBe(1)
    })

    it('should not share internal state', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      const c = bag.clone()
      bag.remove(1, 5)
      expect(c.size).toBe(5)
      expect(c.countOf(1)).toBe(5)
    })

    it('should produce equivalent toArray', () => {
      const bag = new Bag<number>()
      bag.add(1, 2)
      bag.add(2, 3)
      const c = bag.clone()
      const a = bag.toArray().sort()
      const b = c.toArray().sort()
      expect(a).toEqual(b)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty bag', () => {
      expect(new Bag<number>().toArray()).toEqual([])
    })

    it('should return all elements with duplicates', () => {
      const bag = new Bag<number>()
      bag.add(3, 2)
      bag.add(1, 1)
      bag.add(2, 3)
      const arr = bag.toArray().sort()
      expect(arr).toEqual([1, 2, 2, 2, 3, 3])
    })

    it('should return new array each call', () => {
      const bag = new Bag<number>()
      bag.add(1)
      const a = bag.toArray()
      const b = bag.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should reflect current state after modifications', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.add(2, 2)
      bag.remove(1, 1)
      const arr = bag.toArray().sort()
      expect(arr).toEqual([1, 1, 2, 2])
    })

    it('should return empty after clear', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.clear()
      expect(bag.toArray()).toEqual([])
    })

    it('should expand all duplicates', () => {
      const bag = new Bag<number>()
      bag.add(5, 100)
      const arr = bag.toArray()
      expect(arr.length).toBe(100)
      expect(arr.every((v) => v === 5)).toBe(true)
    })
  })

  describe('uniqueValues', () => {
    it('should return empty array for empty bag', () => {
      expect(new Bag<number>().uniqueValues()).toEqual([])
    })

    it('should return unique values', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      bag.add(3, 1)
      const uv = bag.uniqueValues().sort()
      expect(uv).toEqual([1, 2, 3])
    })

    it('should not include duplicates', () => {
      const bag = new Bag<number>()
      bag.add(5, 10)
      expect(bag.uniqueValues()).toEqual([5])
    })

    it('should return new array each call', () => {
      const bag = new Bag<number>()
      bag.add(1)
      const a = bag.uniqueValues()
      const b = bag.uniqueValues()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should reflect removals', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(2)
      const uv = bag.uniqueValues().sort()
      expect(uv).toEqual([1, 3])
    })

    it('should reflect clear', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      bag.clear()
      expect(bag.uniqueValues()).toEqual([])
    })

    it('should maintain insertion order', () => {
      const bag = new Bag<number>()
      bag.add(3)
      bag.add(1)
      bag.add(2)
      expect(bag.uniqueValues()).toEqual([3, 1, 2])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty bag', () => {
      const bag = new Bag<number>()
      const items: number[] = []
      bag.forEach((value) => items.push(value))
      expect(items).toEqual([])
    })

    it('should iterate each occurrence', () => {
      const bag = new Bag<number>()
      bag.add(3, 2)
      bag.add(1, 1)
      const items: number[] = []
      bag.forEach((value) => items.push(value))
      const sorted = items.sort()
      expect(sorted).toEqual([1, 3, 3])
    })

    it('should iterate single element once', () => {
      const bag = new Bag<number>()
      bag.add(5)
      const items: number[] = []
      bag.forEach((value) => items.push(value))
      expect(items).toEqual([5])
    })

    it('should return void', () => {
      const bag = new Bag<number>()
      bag.add(1)
      expect(bag.forEach(() => {})).toBeUndefined()
    })

    it('should not iterate removed elements', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      bag.remove(2)
      const values: number[] = []
      bag.forEach((value) => values.push(value))
      const sorted = values.sort()
      expect(sorted).toEqual([1, 3])
    })

    it('should not iterate after clear', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.clear()
      const values: number[] = []
      bag.forEach((value) => values.push(value))
      expect(values).toEqual([])
    })

    it('should iterate all occurrences of duplicates', () => {
      const bag = new Bag<number>()
      bag.add(5, 100)
      let count = 0
      bag.forEach(() => count++)
      expect(count).toBe(100)
    })

    it('should handle bag with many unique values', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 50; i++) {
        bag.add(i, 2)
      }
      let count = 0
      bag.forEach(() => count++)
      expect(count).toBe(100)
    })
  })

  describe('from factory', () => {
    it('should create bag from array', () => {
      const bag = Bag.from([3, 1, 2, 1, 3])
      expect(bag.size).toBe(5)
      expect(bag.uniqueSize).toBe(3)
      expect(bag.countOf(1)).toBe(2)
      expect(bag.countOf(3)).toBe(2)
    })

    it('should create bag from empty array', () => {
      const bag = Bag.from<number>([])
      expect(bag.size).toBe(0)
      expect(bag.isEmpty()).toBe(true)
    })

    it('should create bag from single element', () => {
      const bag = Bag.from([5])
      expect(bag.size).toBe(1)
      expect(bag.countOf(5)).toBe(1)
    })

    it('should create bag with options', () => {
      const bag = Bag.from(['a', 'b', 'c'], { hash: String })
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(3)
    })

    it('should create bag from Set', () => {
      const bag = Bag.from(new Set([3, 1, 2]))
      expect(bag.size).toBe(3)
      expect(bag.uniqueSize).toBe(3)
    })

    it('should create bag from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 2
        yield 3
      }
      const bag = Bag.from(gen())
      expect(bag.size).toBe(4)
      expect(bag.uniqueSize).toBe(3)
    })

    it('should create bag from strings', () => {
      const bag = Bag.from('hello')
      expect(bag.size).toBe(5)
      expect(bag.countOf('l')).toBe(2)
      expect(bag.countOf('o')).toBe(1)
    })

    it('should create bag from another bag toArray', () => {
      const original = new Bag<number>()
      original.add(1, 3)
      original.add(2, 2)
      const copy = Bag.from(original.toArray())
      expect(copy.size).toBe(5)
      expect(copy.countOf(1)).toBe(3)
      expect(copy.countOf(2)).toBe(2)
    })
  })

  describe('union', () => {
    it('should return empty for two empty bags', () => {
      const a = new Bag<number>()
      const b = new Bag<number>()
      expect(a.union(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      const u = a.union(b)
      expect(u.size).toBe(3)
      expect(u.countOf(1)).toBe(3)
    })

    it('should take max count for overlapping elements', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 1)
      const b = new Bag<number>()
      b.add(1, 1)
      b.add(2, 4)
      const u = a.union(b)
      expect(u.countOf(1)).toBe(3)
      expect(u.countOf(2)).toBe(4)
    })

    it('should include elements only in one bag', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      const b = new Bag<number>()
      b.add(3, 2)
      const u = a.union(b)
      expect(u.size).toBe(4)
      expect(u.countOf(1)).toBe(2)
      expect(u.countOf(3)).toBe(2)
    })

    it('should not modify original bags', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      const b = new Bag<number>()
      b.add(1, 3)
      a.union(b)
      expect(a.countOf(1)).toBe(2)
      expect(b.countOf(1)).toBe(3)
    })

    it('should handle empty bag union with non-empty', () => {
      const a = new Bag<number>()
      const b = new Bag<number>()
      b.add(5, 3)
      const u = a.union(b)
      expect(u.size).toBe(3)
      expect(u.countOf(5)).toBe(3)
    })

    it('should produce correct total size', () => {
      const a = new Bag<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Bag<number>()
      b.add(1, 2)
      b.add(3, 4)
      const u = a.union(b)
      expect(u.countOf(1)).toBe(5)
      expect(u.countOf(2)).toBe(3)
      expect(u.countOf(3)).toBe(4)
      expect(u.size).toBe(12)
    })
  })

  describe('intersection', () => {
    it('should return empty for two empty bags', () => {
      const a = new Bag<number>()
      const b = new Bag<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return empty for disjoint bags', () => {
      const a = new Bag<number>()
      a.add(1)
      const b = new Bag<number>()
      b.add(2)
      expect(a.intersection(b).size).toBe(0)
    })

    it('should take min count for overlapping elements', () => {
      const a = new Bag<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Bag<number>()
      b.add(1, 2)
      b.add(2, 7)
      const i = a.intersection(b)
      expect(i.countOf(1)).toBe(2)
      expect(i.countOf(2)).toBe(3)
    })

    it('should return empty when one is empty', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      expect(a.intersection(b).size).toBe(0)
      expect(b.intersection(a).size).toBe(0)
    })

    it('should not modify original bags', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      b.add(1, 2)
      a.intersection(b)
      expect(a.countOf(1)).toBe(3)
      expect(b.countOf(1)).toBe(2)
    })

    it('should be commutative', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 2)
      const b = new Bag<number>()
      b.add(1, 1)
      b.add(2, 5)
      const ab = a.intersection(b)
      const ba = b.intersection(a)
      expect(ab.countOf(1)).toBe(ba.countOf(1))
      expect(ab.countOf(2)).toBe(ba.countOf(2))
      expect(ab.size).toBe(ba.size)
    })

    it('should handle equal bags', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 2)
      const b = new Bag<number>()
      b.add(1, 3)
      b.add(2, 2)
      const i = a.intersection(b)
      expect(i.size).toBe(5)
      expect(i.countOf(1)).toBe(3)
      expect(i.countOf(2)).toBe(2)
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      const d = a.difference(b)
      expect(d.size).toBe(3)
      expect(d.countOf(1)).toBe(3)
    })

    it('should subtract counts', () => {
      const a = new Bag<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Bag<number>()
      b.add(1, 2)
      b.add(2, 3)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(3)
      expect(d.countOf(2)).toBe(0)
      expect(d.contains(2)).toBe(false)
    })

    it('should return empty when subtracting self', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 2)
      expect(a.difference(a).size).toBe(0)
    })

    it('should not produce negative counts', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      const b = new Bag<number>()
      b.add(1, 5)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(0)
      expect(d.size).toBe(0)
    })

    it('should not modify original bags', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      b.add(1, 1)
      a.difference(b)
      expect(a.countOf(1)).toBe(3)
      expect(b.countOf(1)).toBe(1)
    })

    it('should keep elements only in this', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      a.add(2, 1)
      const b = new Bag<number>()
      b.add(2, 1)
      b.add(3, 1)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(2)
      expect(d.countOf(2)).toBe(0)
      expect(d.countOf(3)).toBe(0)
    })

    it('should not include elements only in other', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      b.add(2, 5)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(3)
      expect(d.countOf(2)).toBe(0)
      expect(d.uniqueSize).toBe(1)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for empty subset of empty', () => {
      const a = new Bag<number>()
      const b = new Bag<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for empty subset of non-empty', () => {
      const a = new Bag<number>()
      const b = new Bag<number>()
      b.add(1, 5)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true when counts are all <= other', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      a.add(2, 1)
      const b = new Bag<number>()
      b.add(1, 5)
      b.add(2, 3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for equal bags', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      const b = new Bag<number>()
      b.add(1, 3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false when count exceeds', () => {
      const a = new Bag<number>()
      a.add(1, 5)
      const b = new Bag<number>()
      b.add(1, 3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return false when element missing from other', () => {
      const a = new Bag<number>()
      a.add(1)
      a.add(2)
      const b = new Bag<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return false for non-empty subset of empty', () => {
      const a = new Bag<number>()
      a.add(1)
      const b = new Bag<number>()
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should handle multiple elements with varying counts', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      a.add(2, 3)
      a.add(3, 1)
      const b = new Bag<number>()
      b.add(1, 5)
      b.add(2, 3)
      b.add(3, 2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false if any count exceeds', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      a.add(2, 10)
      a.add(3, 1)
      const b = new Bag<number>()
      b.add(1, 5)
      b.add(2, 3)
      b.add(3, 2)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty bag operations', () => {
      const bag = new Bag<number>()
      expect(bag.toArray()).toEqual([])
      expect(bag.uniqueValues()).toEqual([])
    })

    it('should handle single element operations', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      expect(bag.countOf(5)).toBe(3)
      expect(bag.uniqueSize).toBe(1)
    })

    it('should handle all duplicates', () => {
      const bag = new Bag<number>()
      bag.add(7, 100)
      expect(bag.size).toBe(100)
      expect(bag.uniqueSize).toBe(1)
      expect(bag.toArray().length).toBe(100)
      expect(bag.toArray().every((v) => v === 7)).toBe(true)
    })

    it('should handle add/remove/add cycle', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      bag.remove(5, 3)
      expect(bag.contains(5)).toBe(false)
      bag.add(5, 2)
      expect(bag.countOf(5)).toBe(2)
    })

    it('should handle clear/add/clear cycle', () => {
      const bag = new Bag<number>()
      for (let round = 0; round < 5; round++) {
        bag.add(1, 3)
        bag.add(2, 2)
        expect(bag.size).toBe(5)
        bag.clear()
        expect(bag.size).toBe(0)
      }
    })

    it('should handle large counts', () => {
      const bag = new Bag<number>()
      bag.add(1, 1000000)
      expect(bag.size).toBe(1000000)
      expect(bag.countOf(1)).toBe(1000000)
      expect(bag.uniqueSize).toBe(1)
      bag.remove(1, 500000)
      expect(bag.countOf(1)).toBe(500000)
    })

    it('should handle negative numbers as values', () => {
      const bag = new Bag<number>()
      bag.add(-5)
      bag.add(-1)
      bag.add(0)
      bag.add(3)
      expect(bag.size).toBe(4)
      expect(bag.contains(-5)).toBe(true)
      expect(bag.contains(0)).toBe(true)
    })

    it('should handle string values', () => {
      const bag = new Bag<string>()
      bag.add('hello')
      bag.add('world')
      bag.add('hello')
      expect(bag.countOf('hello')).toBe(2)
      expect(bag.countOf('world')).toBe(1)
      expect(bag.uniqueSize).toBe(2)
    })

    it('should handle boolean values', () => {
      const bag = new Bag<boolean>()
      bag.add(true, 3)
      bag.add(false, 1)
      expect(bag.countOf(true)).toBe(3)
      expect(bag.countOf(false)).toBe(1)
      expect(bag.size).toBe(4)
    })

    it('should handle null and undefined as distinct', () => {
      const bag = new Bag<null | undefined>()
      bag.add(null)
      bag.add(undefined)
      expect(bag.countOf(null)).toBe(1)
      expect(bag.countOf(undefined)).toBe(1)
      expect(bag.uniqueSize).toBe(2)
    })

    it('should handle object references', () => {
      const bag = new Bag<{ id: number }>()
      const a = { id: 1 }
      const b = { id: 1 }
      bag.add(a, 2)
      bag.add(b, 1)
      expect(bag.countOf(a)).toBe(2)
      expect(bag.countOf(b)).toBe(1)
      expect(bag.uniqueSize).toBe(2)
    })

    it('should handle negative count handling in add', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(1, -3)
      expect(bag.countOf(1)).toBe(5)
      bag.add(1, -100)
      expect(bag.countOf(1)).toBe(5)
    })

    it('should handle negative count handling in remove', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      expect(bag.remove(1, -3)).toBe(0)
      expect(bag.remove(1, 0)).toBe(0)
      expect(bag.countOf(1)).toBe(5)
    })
  })

  describe('large bags', () => {
    it('should handle 10000 unique elements', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 10000; i++) {
        bag.add(i)
      }
      expect(bag.size).toBe(10000)
      expect(bag.uniqueSize).toBe(10000)
    })

    it('should handle 10000 elements with duplicates', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 1000; i++) {
        bag.add(i, 10)
      }
      expect(bag.size).toBe(10000)
      expect(bag.uniqueSize).toBe(1000)
    })

    it('should handle large bag operations', () => {
      const a = new Bag<number>()
      const b = new Bag<number>()
      for (let i = 0; i < 5000; i++) {
        a.add(i, 2)
        b.add(i + 2500, 3)
      }
      const u = a.union(b)
      expect(u.size).toBeGreaterThan(0)
      expect(u.uniqueSize).toBeGreaterThan(5000)
      const intersection = a.intersection(b)
      expect(intersection.uniqueSize).toBe(2500)
      const d = a.difference(b)
      expect(d.uniqueSize).toBe(2500)
    })

    it('should handle large clone and clear', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 5000; i++) {
        bag.add(i, 3)
      }
      const c = bag.clone()
      expect(c.size).toBe(15000)
      bag.clear()
      expect(bag.size).toBe(0)
      expect(c.size).toBe(15000)
    })

    it('should handle large forEach', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 1000; i++) {
        bag.add(i, 10)
      }
      let count = 0
      bag.forEach(() => count++)
      expect(count).toBe(10000)
    })

    it('should handle large toArray', () => {
      const bag = new Bag<number>()
      for (let i = 0; i < 1000; i++) {
        bag.add(i, 10)
      }
      const arr = bag.toArray()
      expect(arr.length).toBe(10000)
    })
  })

  describe('bag operations combinations', () => {
    it('union then difference restores original when disjoint', () => {
      const a = new Bag<number>()
      a.add(1, 2)
      a.add(2, 3)
      const b = new Bag<number>()
      b.add(3, 1)
      b.add(4, 2)
      const u = a.union(b)
      const d = u.difference(b)
      expect(d.countOf(1)).toBe(2)
      expect(d.countOf(2)).toBe(3)
      expect(d.countOf(3)).toBe(0)
      expect(d.countOf(4)).toBe(0)
    })

    it('intersection is commutative', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 2)
      const b = new Bag<number>()
      b.add(1, 1)
      b.add(2, 5)
      const ab = a.intersection(b)
      const ba = b.intersection(a)
      expect(ab.countOf(1)).toBe(ba.countOf(1))
      expect(ab.countOf(2)).toBe(ba.countOf(2))
    })

    it('difference is not commutative', () => {
      const a = new Bag<number>()
      a.add(1, 5)
      const b = new Bag<number>()
      b.add(1, 2)
      expect(a.difference(b).countOf(1)).toBe(3)
      expect(b.difference(a).countOf(1)).toBe(0)
    })

    it('self difference is empty', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 5)
      expect(a.difference(a).size).toBe(0)
    })

    it('self intersection equals self', () => {
      const a = new Bag<number>()
      a.add(1, 3)
      a.add(2, 5)
      const i = a.intersection(a)
      expect(i.countOf(1)).toBe(3)
      expect(i.countOf(2)).toBe(5)
      expect(i.size).toBe(a.size)
    })
  })

  describe('stats', () => {
    it('should return empty stats for empty bag', () => {
      const bag = new Bag<number>()
      const s = bag.stats()
      expect(s.size).toBe(0)
      expect(s.uniqueSize).toBe(0)
      expect(s.minCount).toBe(0)
      expect(s.maxCount).toBe(0)
      expect(s.meanCount).toBe(0)
    })

    it('should return stats for single element', () => {
      const bag = new Bag<number>()
      bag.add(5, 3)
      const s = bag.stats()
      expect(s.size).toBe(3)
      expect(s.uniqueSize).toBe(1)
      expect(s.minCount).toBe(3)
      expect(s.maxCount).toBe(3)
      expect(s.meanCount).toBe(3)
    })

    it('should compute stats correctly', () => {
      const bag = new Bag<number>()
      bag.add(1, 2)
      bag.add(2, 5)
      bag.add(3, 1)
      const s = bag.stats()
      expect(s.size).toBe(8)
      expect(s.uniqueSize).toBe(3)
      expect(s.minCount).toBe(1)
      expect(s.maxCount).toBe(5)
      expect(s.meanCount).toBeCloseTo(8 / 3)
    })

    it('should handle uniform counts', () => {
      const bag = new Bag<number>()
      bag.add(1, 3)
      bag.add(2, 3)
      bag.add(3, 3)
      const s = bag.stats()
      expect(s.minCount).toBe(3)
      expect(s.maxCount).toBe(3)
      expect(s.meanCount).toBe(3)
    })

    it('should reflect changes after remove', () => {
      const bag = new Bag<number>()
      bag.add(1, 5)
      bag.add(2, 3)
      bag.remove(1, 4)
      const s = bag.stats()
      expect(s.size).toBe(4)
      expect(s.uniqueSize).toBe(2)
      expect(s.minCount).toBe(1)
      expect(s.maxCount).toBe(3)
    })

    it('should handle two elements', () => {
      const bag = new Bag<number>()
      bag.add('a', 2)
      bag.add('b', 4)
      const s = bag.stats()
      expect(s.uniqueSize).toBe(2)
      expect(s.minCount).toBe(2)
      expect(s.maxCount).toBe(4)
      expect(s.meanCount).toBe(3)
    })

    it('should handle single occurrence elements', () => {
      const bag = new Bag<number>()
      bag.add(1)
      bag.add(2)
      bag.add(3)
      const s = bag.stats()
      expect(s.minCount).toBe(1)
      expect(s.maxCount).toBe(1)
      expect(s.meanCount).toBeCloseTo(1)
    })
  })

  describe('type exports', () => {
    it('should export Bag class', async () => {
      const mod = await import('../../src/core/bag/bag.js')
      expect(mod.Bag).toBeDefined()
    })

    it('should allow type imports', async () => {
      const mod = await import('../../src/core/bag/bag.js')
      const bag = new mod.Bag<number>()
      bag.add(1, 2)
      expect(bag.size).toBe(2)
    })
  })
})
