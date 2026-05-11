import { describe, it, expect } from 'vitest'
import { SkipListSet } from '../../src/core/skip-list-set/index.js'

describe('SkipListSet', () => {
  describe('constructor', () => {
    it('creates empty set with defaults', () => {
      const s = new SkipListSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('creates set with custom maxLevel', () => {
      const s = new SkipListSet<number>({ maxLevel: 8 })
      expect(s.maxLevel).toBe(8)
    })

    it('creates set with custom comparator', () => {
      const s = new SkipListSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('banana')
      s.add('apple')
      expect(s.min()).toBe('apple')
      expect(s.max()).toBe('banana')
    })

    it('creates set with descending comparator', () => {
      const s = new SkipListSet<number>({
        comparator: (a, b) => b - a,
      })
      s.add(1)
      s.add(5)
      s.add(3)
      expect(s.toArray()).toEqual([5, 3, 1])
    })

    it('uses default maxLevel of 32', () => {
      const s = new SkipListSet<number>()
      expect(s.maxLevel).toBe(32)
    })
  })

  describe('add', () => {
    it('adds a single element', () => {
      const s = new SkipListSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns false for duplicate', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds multiple elements in any order', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      s.add(2)
      s.add(4)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('maintains sorted order', () => {
      const s = new SkipListSet<number>()
      const input = [10, 5, 20, 15, 1, 25, 3, 8, 12, 18]
      for (const v of input) s.add(v)
      const arr = s.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1])
      }
    })

    it('handles many insertions', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 200; i++) {
        s.add(i)
      }
      expect(s.size).toBe(200)
      expect(s.toArray().length).toBe(200)
    })

    it('returns true for new elements', () => {
      const s = new SkipListSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.add(2)).toBe(true)
      expect(s.add(3)).toBe(true)
    })

    it('handles negative numbers', () => {
      const s = new SkipListSet<number>()
      s.add(-5)
      s.add(-1)
      s.add(0)
      s.add(3)
      expect(s.toArray()).toEqual([-5, -1, 0, 3])
    })

    it('handles zero', () => {
      const s = new SkipListSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles floating point', () => {
      const s = new SkipListSet<number>()
      s.add(1.5)
      s.add(0.5)
      s.add(2.5)
      expect(s.toArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles large dataset', () => {
      const s = new SkipListSet<number>()
      for (let i = 500; i >= 0; i--) {
        s.add(i)
      }
      expect(s.size).toBe(501)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(500)
    })
  })

  describe('delete', () => {
    it('deletes existing element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false for non-existent', () => {
      const s = new SkipListSet<number>()
      expect(s.delete(99)).toBe(false)
    })

    it('deletes from middle', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
      expect(s.size).toBe(2)
    })

    it('deletes first element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.toArray()).toEqual([2, 3])
      expect(s.min()).toBe(2)
    })

    it('deletes last element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.toArray()).toEqual([1, 2])
      expect(s.max()).toBe(2)
    })

    it('deletes all elements one by one', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 0; i < 10; i++) {
        expect(s.delete(i)).toBe(true)
      }
      expect(s.isEmpty()).toBe(true)
    })

    it('deletes in reverse order', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 9; i >= 0; i--) {
        expect(s.delete(i)).toBe(true)
      }
      expect(s.isEmpty()).toBe(true)
    })

    it('maintains order after deletions', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      for (let i = 0; i < 20; i += 2) s.delete(i)
      const arr = s.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(arr[i]).toBe(i * 2 + 1)
      }
    })

    it('handles deleting from empty', () => {
      const s = new SkipListSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('deletes single element', () => {
      const s = new SkipListSet<number>()
      s.add(42)
      expect(s.delete(42)).toBe(true)
      expect(s.isEmpty()).toBe(true)
      expect(s.has(42)).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      expect(s.has(5)).toBe(true)
    })

    it('returns false for non-existent', () => {
      const s = new SkipListSet<number>()
      expect(s.has(5)).toBe(false)
    })

    it('returns false after deletion', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.delete(5)
      expect(s.has(5)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('finds elements across range', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      for (let i = 0; i < 50; i++) {
        expect(s.has(i)).toBe(true)
      }
      expect(s.has(50)).toBe(false)
      expect(s.has(-1)).toBe(false)
    })
  })

  describe('get', () => {
    it('returns element at index', () => {
      const s = new SkipListSet<number>()
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.get(0)).toBe(10)
      expect(s.get(1)).toBe(20)
      expect(s.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      expect(s.get(-1)).toBe(undefined)
    })

    it('returns undefined for out of bounds', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      expect(s.get(5)).toBe(undefined)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.get(0)).toBe(undefined)
    })

    it('returns correct elements for many items', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.get(0)).toBe(0)
      expect(s.get(50)).toBe(50)
      expect(s.get(99)).toBe(99)
    })

    it('returns correct index after deletions', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.get(0)).toBe(1)
      expect(s.get(1)).toBe(3)
    })
  })

  describe('indexOf', () => {
    it('returns index of existing element', () => {
      const s = new SkipListSet<number>()
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.indexOf(10)).toBe(0)
      expect(s.indexOf(20)).toBe(1)
      expect(s.indexOf(30)).toBe(2)
    })

    it('returns -1 for non-existent', () => {
      const s = new SkipListSet<number>()
      expect(s.indexOf(5)).toBe(-1)
    })

    it('returns -1 for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.indexOf(1)).toBe(-1)
    })

    it('returns -1 after deletion', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.delete(5)
      expect(s.indexOf(5)).toBe(-1)
    })

    it('updates index after deletion', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.indexOf(2)).toBe(0)
      expect(s.indexOf(3)).toBe(1)
    })

    it('works for large sets', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.indexOf(0)).toBe(0)
      expect(s.indexOf(99)).toBe(99)
      expect(s.indexOf(50)).toBe(50)
    })
  })

  describe('floor', () => {
    it('returns equal element', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      expect(s.floor(5)).toBe(5)
    })

    it('returns greatest lesser element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.floor(7)).toBe(5)
    })

    it('returns undefined when all greater', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(10)
      expect(s.floor(3)).toBe(undefined)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.floor(5)).toBe(undefined)
    })

    it('returns max for large search value', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.floor(100)).toBe(10)
    })

    it('works at exact boundary', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.floor(3)).toBe(3)
    })
  })

  describe('ceiling', () => {
    it('returns equal element', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      expect(s.ceiling(5)).toBe(5)
    })

    it('returns least greater element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.ceiling(7)).toBe(10)
    })

    it('returns undefined when all lesser', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      expect(s.ceiling(10)).toBe(undefined)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.ceiling(5)).toBe(undefined)
    })

    it('returns min for small search value', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(10)
      s.add(15)
      expect(s.ceiling(0)).toBe(5)
    })

    it('works at exact boundary', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.ceiling(3)).toBe(3)
    })
  })

  describe('lower', () => {
    it('returns strictly lesser element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.lower(5)).toBe(1)
    })

    it('returns undefined when no lesser', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      expect(s.lower(5)).toBe(undefined)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.lower(5)).toBe(undefined)
    })

    it('returns greatest lesser for value between elements', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.lower(7)).toBe(5)
    })

    it('returns undefined when value below min', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lower(3)).toBe(undefined)
    })

    it('returns max for value above max', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.lower(100)).toBe(10)
    })
  })

  describe('higher', () => {
    it('returns strictly greater element', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.higher(5)).toBe(10)
    })

    it('returns undefined when no greater', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      expect(s.higher(5)).toBe(undefined)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.higher(5)).toBe(undefined)
    })

    it('returns least greater for value between elements', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.higher(7)).toBe(10)
    })

    it('returns undefined when value above max', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(10)
      expect(s.higher(15)).toBe(undefined)
    })

    it('returns min for value below min', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.higher(0)).toBe(1)
    })
  })

  describe('range', () => {
    it('returns elements in range', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      expect([...s.range(5, 10)]).toEqual([5, 6, 7, 8, 9, 10])
    })

    it('returns empty when no elements in range', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      expect([...s.range(5, 10)]).toEqual([])
    })

    it('returns single element range', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      expect([...s.range(5, 5)]).toEqual([5])
    })

    it('returns empty for empty set', () => {
      const s = new SkipListSet<number>()
      expect([...s.range(0, 10)]).toEqual([])
    })

    it('returns full range', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect([...s.range(1, 3)]).toEqual([1, 2, 3])
    })

    it('handles range with partial overlap', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      expect([...s.range(-5, 3)]).toEqual([0, 1, 2, 3])
    })

    it('handles range extending beyond max', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      expect([...s.range(7, 100)]).toEqual([7, 8, 9])
    })

    it('returns results in order', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      const result = [...s.range(10, 20)]
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1])
      }
    })
  })

  describe('min', () => {
    it('returns minimum element', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(1)
      s.add(10)
      expect(s.min()).toBe(1)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.min()).toBe(undefined)
    })

    it('updates after deletion', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min()).toBe(2)
    })
  })

  describe('max', () => {
    it('returns maximum element', () => {
      const s = new SkipListSet<number>()
      s.add(5)
      s.add(1)
      s.add(10)
      expect(s.max()).toBe(10)
    })

    it('returns undefined for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.max()).toBe(undefined)
    })

    it('updates after deletion', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new SkipListSet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const s = new SkipListSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns all elements', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      expect(s.toArray().length).toBe(10)
    })

    it('returns new array each time', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      const a1 = s.toArray()
      const a2 = s.toArray()
      expect(a1).not.toBe(a2)
    })
  })

  describe('forEach', () => {
    it('iterates all elements in order', () => {
      const s = new SkipListSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const s = new SkipListSet<number>()
      s.add(10)
      s.add(20)
      s.add(30)
      const indices: number[] = []
      s.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate empty set', () => {
      const s = new SkipListSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('clear', () => {
    it('empties the set', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('allows adding after clear', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
      expect(s.has(1)).toBe(false)
    })

    it('clears already empty set', () => {
      const s = new SkipListSet<number>()
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('iterator', () => {
    it('iterates in order', () => {
      const s = new SkipListSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })

    it('handles empty set', () => {
      const s = new SkipListSet<number>()
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([])
    })

    it('works with spread', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      expect([...s]).toEqual([1, 2])
    })

    it('works with Array.from', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(Array.from(s)).toEqual([1, 2, 3])
    })

    it('values() returns same as iterator', () => {
      const s = new SkipListSet<number>()
      s.add(1)
      s.add(2)
      expect([...s.values()]).toEqual([...s])
    })
  })

  describe('string elements', () => {
    it('works with string comparator', () => {
      const s = new SkipListSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('finds strings', () => {
      const s = new SkipListSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('hello')
      s.add('world')
      expect(s.has('hello')).toBe(true)
      expect(s.has('world')).toBe(true)
      expect(s.has('foo')).toBe(false)
    })

    it('deletes strings', () => {
      const s = new SkipListSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('a')
      s.add('b')
      s.add('c')
      s.delete('b')
      expect(s.toArray()).toEqual(['a', 'c'])
    })

    it('floor/ceiling with strings', () => {
      const s = new SkipListSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('banana')
      s.add('cherry')
      s.add('apple')
      expect(s.floor('blueberry')).toBe('banana')
      expect(s.ceiling('blueberry')).toBe('cherry')
    })
  })

  describe('stress tests', () => {
    it('handles many sequential inserts', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 500; i++) s.add(i)
      expect(s.size).toBe(500)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(499)
    })

    it('handles many reverse inserts', () => {
      const s = new SkipListSet<number>()
      for (let i = 499; i >= 0; i--) s.add(i)
      expect(s.size).toBe(500)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(499)
    })

    it('handles interleaved add/delete', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 50; i++) s.delete(i)
      expect(s.size).toBe(50)
      expect(s.min()).toBe(50)
      expect(s.max()).toBe(99)
    })

    it('handles clear and rebuild', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      s.clear()
      for (let i = 200; i < 300; i++) s.add(i)
      expect(s.size).toBe(100)
      expect(s.min()).toBe(200)
      expect(s.max()).toBe(299)
    })

    it('get returns correct values after mixed ops', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 50; i++) s.add(i * 2)
      s.delete(10)
      s.delete(20)
      s.delete(30)
      expect(s.indexOf(0)).toBe(0)
      expect(s.indexOf(8)).toBe(4)
      expect(s.indexOf(12)).toBe(5)
      expect(s.size).toBe(47)
    })

    it('indexOf is consistent with get', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 50; i++) s.add(i * 3)
      for (let i = 0; i < 50; i++) {
        const val = i * 3
        expect(s.get(s.indexOf(val))).toBe(val)
      }
    })

    it('handles duplicate adds gracefully', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 5; j++) {
          s.add(i)
        }
      }
      expect(s.size).toBe(10)
    })

    it('range works after deletions', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      s.delete(5)
      s.delete(10)
      s.delete(15)
      const r = [...s.range(0, 19)]
      expect(r).not.toContain(5)
      expect(r).not.toContain(10)
      expect(r).not.toContain(15)
      expect(r.length).toBe(17)
    })

    it('low maxLevel still works', () => {
      const s = new SkipListSet<number>({ maxLevel: 4 })
      for (let i = 0; i < 50; i++) s.add(i)
      expect(s.size).toBe(50)
      expect(s.toArray().length).toBe(50)
    })

    it('forEach and toArray consistent', () => {
      const s = new SkipListSet<number>()
      for (let i = 0; i < 30; i++) s.add(i)
      const arr: number[] = []
      s.forEach((v) => arr.push(v))
      expect(arr).toEqual(s.toArray())
    })
  })

  describe('object elements with custom comparator', () => {
    it('works with object elements', () => {
      type Item = { id: number }
      const s = new SkipListSet<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      s.add({ id: 3 })
      s.add({ id: 1 })
      s.add({ id: 2 })
      const arr = s.toArray()
      expect(arr[0].id).toBe(1)
      expect(arr[1].id).toBe(2)
      expect(arr[2].id).toBe(3)
    })

    it('has with object comparator', () => {
      type Item = { id: number }
      const s = new SkipListSet<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      s.add({ id: 5 })
      expect(s.has({ id: 5 })).toBe(true)
      expect(s.has({ id: 6 })).toBe(false)
    })
  })
})
