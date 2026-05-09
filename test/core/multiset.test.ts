import { describe, it, expect, beforeEach } from 'vitest'
import { Multiset, DEFAULT_COMPARATOR } from '../../src/core/multiset/multiset.js'

describe('Multiset', () => {
  describe('construction', () => {
    it('should create an empty multiset', () => {
      const ms = new Multiset<number>()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const ms = new Multiset<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      ms.add('Hello')
      ms.add('hello')
      expect(ms.uniqueSize).toBe(1)
      expect(ms.size).toBe(2)
    })

    it('should work with default comparator for numbers', () => {
      const ms = new Multiset<number>()
      ms.add(3)
      ms.add(1)
      ms.add(2)
      expect(ms.toArray()).toEqual([1, 2, 3])
    })

    it('should work with default comparator for strings', () => {
      const ms = new Multiset<string>()
      ms.add('c')
      ms.add('a')
      ms.add('b')
      expect(ms.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should accept empty options object', () => {
      const ms = new Multiset<number>({})
      expect(ms.size).toBe(0)
    })

    it('should handle undefined options', () => {
      const ms = new Multiset<number>(undefined)
      expect(ms.size).toBe(0)
    })
  })

  describe('add', () => {
    let ms: Multiset<number>
    beforeEach(() => {
      ms = new Multiset<number>()
    })

    it('should add a single element', () => {
      ms.add(5)
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.contains(5)).toBe(true)
    })

    it('should add duplicate elements', () => {
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.countOf(5)).toBe(3)
    })

    it('should add multiple distinct elements', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('should add with explicit count', () => {
      ms.add(5, 10)
      expect(ms.size).toBe(10)
      expect(ms.countOf(5)).toBe(10)
    })

    it('should add to existing count', () => {
      ms.add(5, 3)
      ms.add(5, 7)
      expect(ms.countOf(5)).toBe(10)
    })

    it('should do nothing for count 0', () => {
      ms.add(5, 0)
      expect(ms.size).toBe(0)
      expect(ms.contains(5)).toBe(false)
    })

    it('should do nothing for negative count', () => {
      ms.add(5, -1)
      expect(ms.size).toBe(0)
    })

    it('should maintain sorted order', () => {
      ms.add(5)
      ms.add(1)
      ms.add(3)
      ms.add(2)
      ms.add(4)
      expect(ms.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle mixed add with counts and singles', () => {
      ms.add(1, 3)
      ms.add(3)
      ms.add(2, 2)
      expect(ms.toArray()).toEqual([1, 1, 1, 2, 2, 3])
    })
  })

  describe('remove', () => {
    let ms: Multiset<number>
    beforeEach(() => {
      ms = new Multiset<number>()
    })

    it('should remove a single copy', () => {
      ms.add(5, 3)
      const removed = ms.remove(5)
      expect(removed).toBe(1)
      expect(ms.countOf(5)).toBe(2)
    })

    it('should remove multiple copies', () => {
      ms.add(5, 10)
      const removed = ms.remove(5, 7)
      expect(removed).toBe(7)
      expect(ms.countOf(5)).toBe(3)
    })

    it('should remove up to available count', () => {
      ms.add(5, 3)
      const removed = ms.remove(5, 10)
      expect(removed).toBe(3)
      expect(ms.countOf(5)).toBe(0)
      expect(ms.contains(5)).toBe(false)
    })

    it('should return 0 for non-existent element', () => {
      const removed = ms.remove(5)
      expect(removed).toBe(0)
    })

    it('should return 0 for count < 1', () => {
      ms.add(5)
      expect(ms.remove(5, 0)).toBe(0)
      expect(ms.remove(5, -1)).toBe(0)
    })

    it('should remove element entirely when count reaches 0', () => {
      ms.add(5, 2)
      ms.remove(5, 2)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.contains(5)).toBe(false)
    })

    it('should handle remove from empty multiset', () => {
      expect(ms.remove(1)).toBe(0)
    })

    it('should handle sequential removes', () => {
      ms.add(5, 5)
      expect(ms.remove(5, 2)).toBe(2)
      expect(ms.remove(5, 2)).toBe(2)
      expect(ms.remove(5, 2)).toBe(1)
      expect(ms.remove(5, 1)).toBe(0)
    })

    it('should not affect other elements', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      ms.remove(2)
      expect(ms.contains(1)).toBe(true)
      expect(ms.contains(3)).toBe(true)
      expect(ms.contains(2)).toBe(false)
    })

    it('should update total size correctly', () => {
      ms.add(1, 5)
      ms.add(2, 3)
      ms.remove(1, 2)
      ms.remove(2, 1)
      expect(ms.size).toBe(5)
    })
  })

  describe('countOf', () => {
    it('should return 0 for non-existent element', () => {
      const ms = new Multiset<number>()
      expect(ms.countOf(5)).toBe(0)
    })

    it('should return the multiplicity', () => {
      const ms = new Multiset<number>()
      ms.add(5, 7)
      expect(ms.countOf(5)).toBe(7)
    })

    it('should reflect adds and removes', () => {
      const ms = new Multiset<number>()
      ms.add(5, 10)
      ms.remove(5, 3)
      expect(ms.countOf(5)).toBe(7)
    })

    it('should return 0 after complete removal', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.remove(5, 3)
      expect(ms.countOf(5)).toBe(0)
    })

    it('should return 0 after clear', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.clear()
      expect(ms.countOf(5)).toBe(0)
    })

    it('should handle multiple elements independently', () => {
      const ms = new Multiset<number>()
      ms.add(1, 2)
      ms.add(2, 5)
      ms.add(3, 1)
      expect(ms.countOf(1)).toBe(2)
      expect(ms.countOf(2)).toBe(5)
      expect(ms.countOf(3)).toBe(1)
      expect(ms.countOf(4)).toBe(0)
    })
  })

  describe('contains', () => {
    let ms: Multiset<number>
    beforeEach(() => {
      ms = new Multiset<number>()
    })

    it('should return false for empty multiset', () => {
      expect(ms.contains(1)).toBe(false)
    })

    it('should return true for present element', () => {
      ms.add(5)
      expect(ms.contains(5)).toBe(true)
    })

    it('should return false for absent element', () => {
      ms.add(5)
      expect(ms.contains(6)).toBe(false)
    })

    it('should return false after complete removal', () => {
      ms.add(5, 3)
      ms.remove(5, 3)
      expect(ms.contains(5)).toBe(false)
    })

    it('should return true when some copies remain', () => {
      ms.add(5, 3)
      ms.remove(5, 2)
      expect(ms.contains(5)).toBe(true)
    })
  })

  describe('min/max', () => {
    it('should return undefined for empty multiset', () => {
      const ms = new Multiset<number>()
      expect(ms.min).toBeUndefined()
      expect(ms.max).toBeUndefined()
    })

    it('should return the only element for singleton', () => {
      const ms = new Multiset<number>()
      ms.add(5)
      expect(ms.min).toBe(5)
      expect(ms.max).toBe(5)
    })

    it('should return min and max from multiple elements', () => {
      const ms = new Multiset<number>()
      ms.add(3)
      ms.add(1)
      ms.add(5)
      ms.add(2)
      ms.add(4)
      expect(ms.min).toBe(1)
      expect(ms.max).toBe(5)
    })

    it('should handle duplicates of min and max', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(3)
      ms.add(5, 3)
      expect(ms.min).toBe(1)
      expect(ms.max).toBe(5)
    })

    it('should update after removal of min', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      ms.remove(1)
      expect(ms.min).toBe(2)
    })

    it('should update after removal of max', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      ms.remove(3)
      expect(ms.max).toBe(2)
    })

    it('should return undefined after clearing all', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.clear()
      expect(ms.min).toBeUndefined()
      expect(ms.max).toBeUndefined()
    })

    it('should work with string elements', () => {
      const ms = new Multiset<string>()
      ms.add('cherry')
      ms.add('apple')
      ms.add('banana')
      expect(ms.min).toBe('apple')
      expect(ms.max).toBe('cherry')
    })
  })

  describe('lowerBound/upperBound', () => {
    let ms: Multiset<number>
    beforeEach(() => {
      ms = new Multiset<number>()
      ms.add(1)
      ms.add(3)
      ms.add(5)
      ms.add(7)
    })

    it('should find exact element via lowerBound', () => {
      expect(ms.lowerBound(3)).toBe(3)
    })

    it('should find next greater via lowerBound for absent', () => {
      expect(ms.lowerBound(4)).toBe(5)
    })

    it('should return first element for value below min', () => {
      expect(ms.lowerBound(0)).toBe(1)
    })

    it('should return undefined for value above max via lowerBound', () => {
      expect(ms.lowerBound(8)).toBeUndefined()
    })

    it('should find next greater via upperBound for exact', () => {
      expect(ms.upperBound(3)).toBe(5)
    })

    it('should find next greater via upperBound for absent', () => {
      expect(ms.upperBound(4)).toBe(5)
    })

    it('should return first element for value below min via upperBound', () => {
      expect(ms.upperBound(0)).toBe(1)
    })

    it('should return undefined for value at or above max via upperBound', () => {
      expect(ms.upperBound(7)).toBeUndefined()
      expect(ms.upperBound(8)).toBeUndefined()
    })

    it('should return undefined for empty multiset', () => {
      const empty = new Multiset<number>()
      expect(empty.lowerBound(1)).toBeUndefined()
      expect(empty.upperBound(1)).toBeUndefined()
    })

    it('should handle single element', () => {
      const single = new Multiset<number>()
      single.add(5)
      expect(single.lowerBound(5)).toBe(5)
      expect(single.upperBound(5)).toBeUndefined()
      expect(single.lowerBound(4)).toBe(5)
      expect(single.upperBound(6)).toBeUndefined()
    })
  })

  describe('range', () => {
    let ms: Multiset<number>
    beforeEach(() => {
      ms = new Multiset<number>()
      ms.add(1)
      ms.add(2, 2)
      ms.add(3)
      ms.add(4, 3)
      ms.add(5)
    })

    it('should return elements in range inclusive', () => {
      expect(ms.range(2, 4)).toEqual([2, 2, 3, 4, 4, 4])
    })

    it('should return single element range', () => {
      expect(ms.range(3, 3)).toEqual([3])
    })

    it('should return empty for non-overlapping range', () => {
      expect(ms.range(6, 10)).toEqual([])
    })

    it('should return empty for range below min', () => {
      expect(ms.range(-5, 0)).toEqual([])
    })

    it('should return all elements for full range', () => {
      expect(ms.range(1, 5)).toEqual([1, 2, 2, 3, 4, 4, 4, 5])
    })

    it('should return empty for empty multiset', () => {
      const empty = new Multiset<number>()
      expect(empty.range(1, 5)).toEqual([])
    })

    it('should handle partial range at edges', () => {
      expect(ms.range(1, 2)).toEqual([1, 2, 2])
      expect(ms.range(4, 5)).toEqual([4, 4, 4, 5])
    })

    it('should return empty when lower > max', () => {
      expect(ms.range(10, 20)).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty multiset', () => {
      const ms = new Multiset<number>()
      const items: Array<{ value: number; count: number }> = []
      ms.forEach((value, count) => items.push({ value, count }))
      expect(items).toEqual([])
    })

    it('should iterate unique elements in sorted order', () => {
      const ms = new Multiset<number>()
      ms.add(3, 2)
      ms.add(1, 1)
      ms.add(2, 3)
      const items: Array<{ value: number; count: number }> = []
      ms.forEach((value, count) => items.push({ value, count }))
      expect(items).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 3 },
        { value: 3, count: 2 },
      ])
    })

    it('should iterate single element', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      const items: Array<{ value: number; count: number }> = []
      ms.forEach((value, count) => items.push({ value, count }))
      expect(items).toEqual([{ value: 5, count: 3 }])
    })

    it('should return void', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      expect(ms.forEach(() => {})).toBeUndefined()
    })

    it('should not iterate removed elements', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      ms.remove(2)
      const values: number[] = []
      ms.forEach((value) => values.push(value))
      expect(values).toEqual([1, 3])
    })

    it('should not iterate after clear', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.clear()
      const values: number[] = []
      ms.forEach((value) => values.push(value))
      expect(values).toEqual([])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty multiset', () => {
      expect(new Multiset<number>().toArray()).toEqual([])
    })

    it('should return all elements with duplicates in sorted order', () => {
      const ms = new Multiset<number>()
      ms.add(3, 2)
      ms.add(1, 1)
      ms.add(2, 3)
      expect(ms.toArray()).toEqual([1, 2, 2, 2, 3, 3])
    })

    it('should return new array each call', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      const a = ms.toArray()
      const b = ms.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should reflect current state after modifications', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 2)
      ms.remove(1, 1)
      expect(ms.toArray()).toEqual([1, 1, 2, 2])
    })

    it('should return empty after clear', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.clear()
      expect(ms.toArray()).toEqual([])
    })
  })

  describe('size/uniqueSize', () => {
    it('should return 0 for new multiset', () => {
      const ms = new Multiset<number>()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should track total size with duplicates', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(2, 3)
      expect(ms.size).toBe(8)
      expect(ms.uniqueSize).toBe(2)
    })

    it('should update after remove', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.remove(1, 3)
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should update after removing all copies', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 2)
      ms.remove(1, 3)
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should update after clear', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.clear()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should handle single element', () => {
      const ms = new Multiset<number>()
      ms.add(5, 10)
      expect(ms.size).toBe(10)
      expect(ms.uniqueSize).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new multiset', () => {
      expect(new Multiset<number>().isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const ms = new Multiset<number>()
      ms.add(5)
      expect(ms.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.remove(5, 3)
      expect(ms.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.clear()
      expect(ms.isEmpty()).toBe(true)
    })

    it('should return false when some copies remain', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.remove(5, 2)
      expect(ms.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(2, 3)
      ms.add(3, 1)
      ms.clear()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('should be safe to call on empty multiset', () => {
      const ms = new Multiset<number>()
      ms.clear()
      expect(ms.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.clear()
      ms.clear()
      expect(ms.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.clear()
      ms.add(2, 2)
      expect(ms.size).toBe(2)
      expect(ms.contains(1)).toBe(false)
      expect(ms.contains(2)).toBe(true)
    })

    it('should return void', () => {
      const ms = new Multiset<number>()
      expect(ms.clear()).toBeUndefined()
    })

    it('should not find old elements after clear', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.clear()
      expect(ms.countOf(5)).toBe(0)
      expect(ms.contains(5)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty multiset', () => {
      const ms = new Multiset<number>()
      const c = ms.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty multiset', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 2)
      ms.add(3, 1)
      const c = ms.clone()
      expect(c.size).toBe(6)
      expect(c.uniqueSize).toBe(3)
      expect(c.toArray()).toEqual([1, 1, 1, 2, 2, 3])
    })

    it('should be independent from original', () => {
      const ms = new Multiset<number>()
      ms.add(1, 2)
      ms.add(2, 1)
      const c = ms.clone()
      c.add(3)
      c.remove(1)
      expect(ms.size).toBe(3)
      expect(ms.contains(3)).toBe(false)
      expect(c.size).toBe(3)
      expect(c.contains(3)).toBe(true)
    })

    it('should preserve comparator', () => {
      const cmp = (a: number, b: number) => b - a
      const ms = new Multiset<number>({ comparator: cmp })
      ms.add(1)
      ms.add(2)
      ms.add(3)
      const c = ms.clone()
      expect(c.toArray()).toEqual([3, 2, 1])
    })

    it('should not share internal state', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      const c = ms.clone()
      ms.remove(1, 5)
      expect(c.size).toBe(5)
      expect(c.countOf(1)).toBe(5)
    })
  })

  describe('from factory', () => {
    it('should create multiset from array', () => {
      const ms = Multiset.from([3, 1, 2, 1, 3])
      expect(ms.size).toBe(5)
      expect(ms.uniqueSize).toBe(3)
      expect(ms.toArray()).toEqual([1, 1, 2, 3, 3])
    })

    it('should create multiset from empty array', () => {
      const ms = Multiset.from<number>([])
      expect(ms.size).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('should create multiset from single element', () => {
      const ms = Multiset.from([5])
      expect(ms.size).toBe(1)
      expect(ms.countOf(5)).toBe(1)
    })

    it('should create multiset with custom comparator', () => {
      const ms = Multiset.from(['A', 'b', 'C'], {
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      expect(ms.uniqueSize).toBe(3)
      expect(ms.toArray()).toEqual(['A', 'b', 'C'])
    })

    it('should create multiset from Set', () => {
      const ms = Multiset.from(new Set([3, 1, 2]))
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('should create multiset from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 2
        yield 3
      }
      const ms = Multiset.from(gen())
      expect(ms.size).toBe(4)
      expect(ms.uniqueSize).toBe(3)
    })

    it('should create multiset from strings', () => {
      const ms = Multiset.from('hello')
      expect(ms.size).toBe(5)
      expect(ms.countOf('l')).toBe(2)
      expect(ms.countOf('o')).toBe(1)
    })
  })

  describe('union', () => {
    it('should return empty for two empty multisets', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.union(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      const u = a.union(b)
      expect(u.size).toBe(3)
      expect(u.countOf(1)).toBe(3)
    })

    it('should take max count for overlapping elements', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 1)
      const b = new Multiset<number>()
      b.add(1, 1)
      b.add(2, 4)
      const u = a.union(b)
      expect(u.countOf(1)).toBe(3)
      expect(u.countOf(2)).toBe(4)
    })

    it('should include elements only in one multiset', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(3, 2)
      const u = a.union(b)
      expect(u.size).toBe(4)
      expect(u.countOf(1)).toBe(2)
      expect(u.countOf(3)).toBe(2)
    })

    it('should not modify original multisets', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(1, 3)
      a.union(b)
      expect(a.countOf(1)).toBe(2)
      expect(b.countOf(1)).toBe(3)
    })

    it('should produce sorted output', () => {
      const a = new Multiset<number>()
      a.add(5, 1)
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(3, 1)
      b.add(2, 3)
      expect(a.union(b).toArray()).toEqual([1, 1, 2, 2, 2, 3, 5])
    })
  })

  describe('intersection', () => {
    it('should return empty for two empty multisets', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('should return empty for disjoint multisets', () => {
      const a = new Multiset<number>()
      a.add(1)
      const b = new Multiset<number>()
      b.add(2)
      expect(a.intersection(b).size).toBe(0)
    })

    it('should take min count for overlapping elements', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Multiset<number>()
      b.add(1, 2)
      b.add(2, 7)
      const i = a.intersection(b)
      expect(i.countOf(1)).toBe(2)
      expect(i.countOf(2)).toBe(3)
    })

    it('should return empty when one is empty', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      expect(a.intersection(b).size).toBe(0)
      expect(b.intersection(a).size).toBe(0)
    })

    it('should not modify original multisets', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 2)
      a.intersection(b)
      expect(a.countOf(1)).toBe(3)
      expect(b.countOf(1)).toBe(2)
    })

    it('should produce sorted output', () => {
      const a = new Multiset<number>()
      a.add(3, 2)
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(2, 1)
      b.add(1, 1)
      b.add(3, 4)
      expect(a.intersection(b).toArray()).toEqual([1, 3, 3])
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      const d = a.difference(b)
      expect(d.size).toBe(3)
      expect(d.countOf(1)).toBe(3)
    })

    it('should subtract counts', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Multiset<number>()
      b.add(1, 2)
      b.add(2, 3)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(3)
      expect(d.countOf(2)).toBe(0)
      expect(d.contains(2)).toBe(false)
    })

    it('should return empty when subtracting self', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 2)
      expect(a.difference(a).size).toBe(0)
    })

    it('should not produce negative counts', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(1, 5)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(0)
      expect(d.size).toBe(0)
    })

    it('should not modify original multisets', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 1)
      a.difference(b)
      expect(a.countOf(1)).toBe(3)
      expect(b.countOf(1)).toBe(1)
    })

    it('should keep elements only in this', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      a.add(2, 1)
      const b = new Multiset<number>()
      b.add(2, 1)
      b.add(3, 1)
      const d = a.difference(b)
      expect(d.countOf(1)).toBe(2)
      expect(d.countOf(2)).toBe(0)
      expect(d.countOf(3)).toBe(0)
    })
  })

  describe('symmetricDifference', () => {
    it('should return empty for two empty multisets', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.symmetricDifference(b).size).toBe(0)
    })

    it('should return copy when other is empty', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      const sd = a.symmetricDifference(b)
      expect(sd.size).toBe(3)
      expect(sd.countOf(1)).toBe(3)
    })

    it('should return abs difference of counts', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      a.add(2, 2)
      const b = new Multiset<number>()
      b.add(1, 2)
      b.add(2, 4)
      const sd = a.symmetricDifference(b)
      expect(sd.countOf(1)).toBe(3)
      expect(sd.countOf(2)).toBe(2)
    })

    it('should exclude elements with equal counts', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 3)
      const sd = a.symmetricDifference(b)
      expect(sd.size).toBe(0)
    })

    it('should include elements only in one multiset', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(3, 4)
      const sd = a.symmetricDifference(b)
      expect(sd.size).toBe(6)
      expect(sd.countOf(1)).toBe(2)
      expect(sd.countOf(3)).toBe(4)
    })

    it('should not modify original multisets', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 1)
      a.symmetricDifference(b)
      expect(a.countOf(1)).toBe(3)
      expect(b.countOf(1)).toBe(1)
    })

    it('should produce sorted output', () => {
      const a = new Multiset<number>()
      a.add(3, 2)
      a.add(1, 1)
      const b = new Multiset<number>()
      b.add(2, 3)
      b.add(3, 1)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2, 2, 2, 3])
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for empty subset of empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for empty subset of non-empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      b.add(1, 5)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true when counts are all <= other', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      a.add(2, 1)
      const b = new Multiset<number>()
      b.add(1, 5)
      b.add(2, 3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for equal multisets', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false when count exceeds', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      b.add(1, 3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return false when element missing from other', () => {
      const a = new Multiset<number>()
      a.add(1)
      a.add(2)
      const b = new Multiset<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('should return true for empty superset of empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return true for non-empty superset of empty', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return true when all counts >= other', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Multiset<number>()
      b.add(1, 2)
      b.add(2, 1)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('should return false when count insufficient', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(1, 5)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('should return false when element missing', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      b.add(1, 3)
      b.add(2, 1)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('should be inverse of isSubsetOf', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 1)
      const b = new Multiset<number>()
      b.add(1, 2)
      expect(a.isSupersetOf(b)).toBe(true)
      expect(b.isSupersetOf(a)).toBe(false)
    })
  })

  describe('stats', () => {
    it('should return empty stats for empty multiset', () => {
      const ms = new Multiset<number>()
      const s = ms.stats()
      expect(s.min).toBeUndefined()
      expect(s.max).toBeUndefined()
      expect(s.size).toBe(0)
      expect(s.uniqueSize).toBe(0)
      expect(s.minCount).toBe(0)
      expect(s.maxCount).toBe(0)
      expect(s.meanCount).toBe(0)
    })

    it('should return stats for single element', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      const s = ms.stats()
      expect(s.min).toBe(5)
      expect(s.max).toBe(5)
      expect(s.size).toBe(3)
      expect(s.uniqueSize).toBe(1)
      expect(s.minCount).toBe(3)
      expect(s.maxCount).toBe(3)
      expect(s.meanCount).toBe(3)
    })

    it('should compute stats correctly', () => {
      const ms = new Multiset<number>()
      ms.add(1, 2)
      ms.add(2, 5)
      ms.add(3, 1)
      const s = ms.stats()
      expect(s.min).toBe(1)
      expect(s.max).toBe(3)
      expect(s.size).toBe(8)
      expect(s.uniqueSize).toBe(3)
      expect(s.minCount).toBe(1)
      expect(s.maxCount).toBe(5)
      expect(s.meanCount).toBeCloseTo(8 / 3)
    })

    it('should handle uniform counts', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 3)
      ms.add(3, 3)
      const s = ms.stats()
      expect(s.minCount).toBe(3)
      expect(s.maxCount).toBe(3)
      expect(s.meanCount).toBe(3)
    })

    it('should reflect changes after remove', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(2, 3)
      ms.remove(1, 4)
      const s = ms.stats()
      expect(s.size).toBe(4)
      expect(s.uniqueSize).toBe(2)
      expect(s.minCount).toBe(1)
      expect(s.maxCount).toBe(3)
    })

    it('should handle string elements', () => {
      const ms = new Multiset<string>()
      ms.add('a', 2)
      ms.add('b', 4)
      const s = ms.stats()
      expect(s.min).toBe('a')
      expect(s.max).toBe('b')
      expect(s.uniqueSize).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty multiset operations', () => {
      const ms = new Multiset<number>()
      expect(ms.min).toBeUndefined()
      expect(ms.max).toBeUndefined()
      expect(ms.lowerBound(1)).toBeUndefined()
      expect(ms.upperBound(1)).toBeUndefined()
      expect(ms.range(1, 5)).toEqual([])
      expect(ms.toArray()).toEqual([])
    })

    it('should handle single element operations', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      expect(ms.min).toBe(5)
      expect(ms.max).toBe(5)
      expect(ms.lowerBound(5)).toBe(5)
      expect(ms.upperBound(5)).toBeUndefined()
      expect(ms.range(5, 5)).toEqual([5, 5, 5])
    })

    it('should handle all duplicates', () => {
      const ms = new Multiset<number>()
      ms.add(7, 100)
      expect(ms.size).toBe(100)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.toArray().length).toBe(100)
      expect(ms.toArray().every((v) => v === 7)).toBe(true)
    })

    it('should handle many unique elements', () => {
      const ms = new Multiset<number>()
      for (let i = 0; i < 100; i++) {
        ms.add(i)
      }
      expect(ms.size).toBe(100)
      expect(ms.uniqueSize).toBe(100)
      expect(ms.min).toBe(0)
      expect(ms.max).toBe(99)
    })

    it('should handle add/remove/add cycle', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.remove(5, 3)
      expect(ms.contains(5)).toBe(false)
      ms.add(5, 2)
      expect(ms.countOf(5)).toBe(2)
    })

    it('should handle clear/add/clear cycle', () => {
      const ms = new Multiset<number>()
      for (let round = 0; round < 5; round++) {
        ms.add(1, 3)
        ms.add(2, 2)
        expect(ms.size).toBe(5)
        ms.clear()
        expect(ms.size).toBe(0)
      }
    })

    it('should handle large counts', () => {
      const ms = new Multiset<number>()
      ms.add(1, 1000000)
      expect(ms.size).toBe(1000000)
      expect(ms.countOf(1)).toBe(1000000)
      expect(ms.uniqueSize).toBe(1)
      ms.remove(1, 500000)
      expect(ms.countOf(1)).toBe(500000)
    })

    it('should handle negative numbers', () => {
      const ms = new Multiset<number>()
      ms.add(-5)
      ms.add(-1)
      ms.add(0)
      ms.add(3)
      expect(ms.toArray()).toEqual([-5, -1, 0, 3])
      expect(ms.min).toBe(-5)
      expect(ms.max).toBe(3)
    })

    it('should handle custom reverse comparator', () => {
      const ms = new Multiset<number>({ comparator: (a, b) => b - a })
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.toArray()).toEqual([3, 2, 1])
      expect(ms.min).toBe(3)
      expect(ms.max).toBe(1)
    })
  })

  describe('large multisets', () => {
    it('should handle 10000 unique elements', () => {
      const ms = new Multiset<number>()
      for (let i = 0; i < 10000; i++) {
        ms.add(i)
      }
      expect(ms.size).toBe(10000)
      expect(ms.uniqueSize).toBe(10000)
      expect(ms.min).toBe(0)
      expect(ms.max).toBe(9999)
    })

    it('should handle 10000 elements with duplicates', () => {
      const ms = Multiset.from<number>([])
      for (let i = 0; i < 1000; i++) {
        ms.add(i, 10)
      }
      expect(ms.size).toBe(10000)
      expect(ms.uniqueSize).toBe(1000)
      const arr = ms.toArray()
      expect(arr.length).toBe(10000)
      expect(arr[0]).toBe(0)
      expect(arr[arr.length - 1]).toBe(999)
    })

    it('should handle large set operations', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      for (let i = 0; i < 5000; i++) {
        a.add(i, 2)
        b.add(i + 2500, 3)
      }
      const u = a.union(b)
      expect(u.size).toBeGreaterThan(0)
      expect(u.uniqueSize).toBeGreaterThan(5000)
      const i = a.intersection(b)
      expect(i.uniqueSize).toBe(2500)
      const d = a.difference(b)
      expect(d.uniqueSize).toBe(2500)
    })

    it('should handle large clone and clear', () => {
      const ms = new Multiset<number>()
      for (let i = 0; i < 5000; i++) {
        ms.add(i, 3)
      }
      const c = ms.clone()
      expect(c.size).toBe(15000)
      ms.clear()
      expect(ms.size).toBe(0)
      expect(c.size).toBe(15000)
    })
  })

  describe('set operation combinations', () => {
    it('union then difference restores original when disjoint', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      a.add(2, 3)
      const b = new Multiset<number>()
      b.add(3, 1)
      b.add(4, 2)
      const u = a.union(b)
      const d = u.difference(b)
      expect(d.toArray()).toEqual([1, 1, 2, 2, 2])
    })

    it('intersection is commutative', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 2)
      const b = new Multiset<number>()
      b.add(1, 1)
      b.add(2, 5)
      expect(a.intersection(b).toArray()).toEqual(b.intersection(a).toArray())
    })

    it('union is commutative in content', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(1, 3)
      expect(a.union(b).toArray()).toEqual(b.union(a).toArray())
    })

    it('difference is not commutative', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      b.add(1, 2)
      expect(a.difference(b).toArray()).toEqual([1, 1, 1])
      expect(b.difference(a).toArray()).toEqual([])
    })

    it('symmetric difference equals union minus intersection', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 1)
      const b = new Multiset<number>()
      b.add(1, 1)
      b.add(2, 4)
      const sd = a.symmetricDifference(b)
      const u = a.union(b).difference(a.intersection(b))
      expect(sd.toArray()).toEqual(u.toArray())
    })
  })

  describe('type exports', () => {
    it('should export Multiset class', async () => {
      const mod = await import('../../src/core/multiset/multiset.js')
      expect(mod.Multiset).toBeDefined()
      expect(mod.DEFAULT_COMPARATOR).toBeDefined()
    })

    it('should allow type imports', async () => {
      const mod = await import('../../src/core/multiset/multiset.js')
      const ms = new mod.Multiset<number>()
      ms.add(1, 2)
      expect(ms.size).toBe(2)
    })
  })
})
