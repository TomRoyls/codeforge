import { describe, expect, it } from 'vitest'
import { PersistentArray2 } from '../../src/core/persistent-array-2/index.js'

// ─── Constructor ───

describe('PersistentArray2', () => {
  describe('constructor', () => {
    it('creates an empty array with no arguments', () => {
      const arr = new PersistentArray2()
      expect(arr.length).toBe(0)
    })

    it('creates an array from initial items', () => {
      const arr = new PersistentArray2([1, 2, 3])
      expect(arr.length).toBe(3)
    })

    it('creates an array preserving element order', () => {
      const arr = new PersistentArray2(['a', 'b', 'c'])
      expect(arr.get(0)).toBe('a')
      expect(arr.get(1)).toBe('b')
      expect(arr.get(2)).toBe('c')
    })

    it('creates an array from a single element', () => {
      const arr = new PersistentArray2([42])
      expect(arr.length).toBe(1)
      expect(arr.get(0)).toBe(42)
    })
  })

  // ─── get ───

  describe('get', () => {
    it('returns the element at a valid index', () => {
      const arr = new PersistentArray2([10, 20, 30])
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds index', () => {
      const arr = new PersistentArray2([1, 2])
      expect(arr.get(5)).toBeUndefined()
      expect(arr.get(-1)).toBeUndefined()
    })

    it('returns undefined on an empty array', () => {
      const arr = new PersistentArray2()
      expect(arr.get(0)).toBeUndefined()
    })
  })

  // ─── set ───

  describe('set', () => {
    it('returns a new array with the value updated', () => {
      const original = new PersistentArray2([1, 2, 3])
      const modified = original.set(1, 99)
      expect(modified.get(1)).toBe(99)
    })

    it('does not mutate the original array', () => {
      const original = new PersistentArray2([1, 2, 3])
      original.set(1, 99)
      expect(original.get(1)).toBe(2)
      expect(original.length).toBe(3)
    })

    it('preserves other elements unchanged', () => {
      const original = new PersistentArray2([10, 20, 30])
      const modified = original.set(0, 100)
      expect(modified.get(1)).toBe(20)
      expect(modified.get(2)).toBe(30)
    })

    it('sets value at index beyond current length', () => {
      const original = new PersistentArray2([1])
      const modified = original.set(3, 99)
      expect(modified.get(3)).toBe(99)
    })
  })

  // ─── push ───

  describe('push', () => {
    it('returns a new array with the element appended', () => {
      const original = new PersistentArray2([1, 2])
      const modified = original.push(3)
      expect(modified.length).toBe(3)
      expect(modified.get(2)).toBe(3)
    })

    it('does not mutate the original array', () => {
      const original = new PersistentArray2([1, 2])
      original.push(3)
      expect(original.length).toBe(2)
      expect(original.toArray()).toEqual([1, 2])
    })

    it('appends to an empty array', () => {
      const original = new PersistentArray2<number>()
      const modified = original.push(42)
      expect(modified.length).toBe(1)
      expect(modified.get(0)).toBe(42)
    })

    it('can be chained to add multiple elements', () => {
      const arr = new PersistentArray2<number>()
        .push(1)
        .push(2)
        .push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── pop ───

  describe('pop', () => {
    it('returns the last element and a new array without it', () => {
      const original = new PersistentArray2([1, 2, 3])
      const [value, modified] = original.pop()
      expect(value).toBe(3)
      expect(modified.length).toBe(2)
      expect(modified.toArray()).toEqual([1, 2])
    })

    it('does not mutate the original array', () => {
      const original = new PersistentArray2([1, 2])
      original.pop()
      expect(original.length).toBe(2)
    })

    it('returns [undefined, self] for an empty array', () => {
      const original = new PersistentArray2<number>()
      const [value, modified] = original.pop()
      expect(value).toBeUndefined()
      expect(modified.length).toBe(0)
    })

    it('handles single-element array', () => {
      const original = new PersistentArray2([42])
      const [value, modified] = original.pop()
      expect(value).toBe(42)
      expect(modified.length).toBe(0)
    })
  })

  // ─── length ───

  describe('length', () => {
    it('returns 0 for an empty array', () => {
      const arr = new PersistentArray2()
      expect(arr.length).toBe(0)
    })

    it('returns the correct count of elements', () => {
      const arr = new PersistentArray2([1, 2, 3, 4, 5])
      expect(arr.length).toBe(5)
    })

    it('reflects push operations', () => {
      const arr = new PersistentArray2([1]).push(2).push(3)
      expect(arr.length).toBe(3)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns an empty array for empty PersistentArray2', () => {
      const arr = new PersistentArray2()
      expect(arr.toArray()).toEqual([])
    })

    it('returns a copy of the elements', () => {
      const arr = new PersistentArray2([1, 2, 3])
      const copy = arr.toArray()
      expect(copy).toEqual([1, 2, 3])
      copy[0] = 999
      expect(arr.get(0)).toBe(1)
    })
  })

  // ─── map ───

  describe('map', () => {
    it('transforms each element', () => {
      const arr = new PersistentArray2([1, 2, 3])
      const mapped = arr.map((x) => x * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('does not mutate the original', () => {
      const original = new PersistentArray2([1, 2, 3])
      original.map((x) => x * 10)
      expect(original.toArray()).toEqual([1, 2, 3])
    })

    it('provides the correct index', () => {
      const arr = new PersistentArray2(['a', 'b', 'c'])
      const mapped = arr.map((item, i) => `${item}${i}`)
      expect(mapped.toArray()).toEqual(['a0', 'b1', 'c2'])
    })

    it('returns empty array when mapping empty', () => {
      const arr = new PersistentArray2<number>()
      const mapped = arr.map((x) => x + 1)
      expect(mapped.length).toBe(0)
    })
  })

  // ─── filter ───

  describe('filter', () => {
    it('keeps elements matching the predicate', () => {
      const arr = new PersistentArray2([1, 2, 3, 4, 5])
      const filtered = arr.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('does not mutate the original', () => {
      const original = new PersistentArray2([1, 2, 3])
      original.filter((x) => x > 1)
      expect(original.toArray()).toEqual([1, 2, 3])
    })

    it('provides the correct index in the predicate', () => {
      const arr = new PersistentArray2([10, 20, 30])
      const filtered = arr.filter((_item, i) => i !== 1)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('returns empty when no elements match', () => {
      const arr = new PersistentArray2([1, 3, 5])
      const filtered = arr.filter((x) => x % 2 === 0)
      expect(filtered.length).toBe(0)
    })

    it('returns all elements when all match', () => {
      const arr = new PersistentArray2([2, 4, 6])
      const filtered = arr.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })
  })

  // ─── Immutability ───

  describe('immutability', () => {
    it('branching preserves independent state', () => {
      const root = new PersistentArray2([1, 2, 3])
      const branchA = root.set(0, 100)
      const branchB = root.push(4)
      expect(root.toArray()).toEqual([1, 2, 3])
      expect(branchA.toArray()).toEqual([100, 2, 3])
      expect(branchB.toArray()).toEqual([1, 2, 3, 4])
    })

    it('multiple operations create independent versions', () => {
      const v0 = new PersistentArray2<number>()
      const v1 = v0.push(1)
      const v2 = v1.push(2)
      const v3 = v2.push(3)
      expect(v0.length).toBe(0)
      expect(v1.length).toBe(1)
      expect(v2.length).toBe(2)
      expect(v3.length).toBe(3)
    })
  })
})
