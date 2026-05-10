import { describe, it, expect } from 'vitest'
import { PagedArray } from '../../src/core/paged-array/paged-array.js'
import { DEFAULT_PAGED_ARRAY_OPTIONS } from '../../src/core/paged-array/types.js'

describe('PagedArray', () => {
  describe('constructor', () => {
    it('creates empty array with default options', () => {
      const arr = new PagedArray<number>()
      expect(arr.size).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('accepts options object with pageSize', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      expect(arr.size).toBe(0)
    })

    it('accepts empty options object', () => {
      const arr = new PagedArray<number>({})
      expect(arr.size).toBe(0)
    })

    it('clamps pageSize to 1 when given 0', () => {
      const arr = new PagedArray<number>({ pageSize: 0 })
      arr.push(1)
      arr.push(2)
      expect(arr.toArray()).toEqual([1, 2])
      expect(arr.pageCount()).toBe(2)
    })

    it('clamps pageSize to 1 when given negative', () => {
      const arr = new PagedArray<number>({ pageSize: -5 })
      arr.push(1)
      arr.push(2)
      expect(arr.pageCount()).toBe(2)
    })

    it('floors fractional pageSize', () => {
      const arr = new PagedArray<number>({ pageSize: 3.7 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pageCount()).toBe(1)
      arr.push(4)
      expect(arr.pageCount()).toBe(2)
    })

    it('uses DEFAULT_PAGED_ARRAY_OPTIONS constant', () => {
      expect(DEFAULT_PAGED_ARRAY_OPTIONS.pageSize).toBe(1024)
    })

    it('creates array with default page size when no args', () => {
      const arr = new PagedArray<number>()
      for (let i = 0; i < 1024; i++) arr.push(i)
      expect(arr.pageCount()).toBe(1)
      arr.push(1024)
      expect(arr.pageCount()).toBe(2)
    })

    it('handles pageSize of 1', () => {
      const arr = new PagedArray<number>({ pageSize: 1 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.size).toBe(3)
      expect(arr.toArray()).toEqual([10, 20, 30])
      expect(arr.pageCount()).toBe(3)
    })

    it('handles large pageSize', () => {
      const arr = new PagedArray<number>({ pageSize: 1000 })
      arr.push(1)
      arr.push(2)
      expect(arr.pageCount()).toBe(1)
      expect(arr.capacity()).toBe(1000)
    })
  })

  describe('push', () => {
    it('adds a single element', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(42)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(42)
    })

    it('adds multiple elements within one page', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.size).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('spills to second page when first is full', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pageCount()).toBe(1)
      arr.push(4)
      expect(arr.pageCount()).toBe(2)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('creates multiple pages', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      for (let i = 0; i < 6; i++) arr.push(i)
      expect(arr.pageCount()).toBe(3)
      expect(arr.toArray()).toEqual([0, 1, 2, 3, 4, 5])
    })

    it('pushes strings', () => {
      const arr = new PagedArray<string>({ pageSize: 2 })
      arr.push('a')
      arr.push('b')
      arr.push('c')
      expect(arr.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('pushes objects', () => {
      const arr = new PagedArray<{ x: number }>({ pageSize: 2 })
      arr.push({ x: 1 })
      arr.push({ x: 2 })
      expect(arr.size).toBe(2)
    })

    it('pushes null values', () => {
      const arr = new PagedArray<null>({ pageSize: 2 })
      arr.push(null)
      arr.push(null)
      expect(arr.size).toBe(2)
    })

    it('pushes undefined values', () => {
      const arr = new PagedArray<undefined>({ pageSize: 2 })
      arr.push(undefined)
      arr.push(undefined)
      expect(arr.size).toBe(2)
    })

    it('updates pushes statistic', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.getStatistics().pushes).toBe(2)
    })

    it('updates pagesAllocated statistic', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      expect(arr.getStatistics().pagesAllocated).toBe(1)
      arr.push(2)
      expect(arr.getStatistics().pagesAllocated).toBe(1)
      arr.push(3)
      expect(arr.getStatistics().pagesAllocated).toBe(2)
    })

    it('pushes after pop correctly', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      arr.pop()
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 4])
    })

    it('pushes after full drain', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      arr.pop()
      arr.push(10)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(10)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.pop()).toBeUndefined()
    })

    it('returns the last element', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.pop()).toBe(2)
    })

    it('decreases size', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      expect(arr.size).toBe(1)
    })

    it('maintains LIFO order', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      for (let i = 0; i < 5; i++) arr.push(i)
      expect(arr.pop()).toBe(4)
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(2)
    })

    it('returns undefined after all elements popped', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.pop()
      expect(arr.pop()).toBeUndefined()
    })

    it('frees pages via compact', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.pop()
      arr.pop()
      arr.compact()
      expect(arr.pageCount()).toBe(1)
    })

    it('updates pops statistic', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      expect(arr.getStatistics().pops).toBe(1)
    })

    it('updates pagesFreed statistic on compact', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      arr.pop()
      arr.compact()
      expect(arr.getStatistics().pagesFreed).toBeGreaterThanOrEqual(1)
    })

    it('handles single element pop', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(42)
      expect(arr.pop()).toBe(42)
      expect(arr.size).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('handles pageSize 1 pop', () => {
      const arr = new PagedArray<number>({ pageSize: 1 })
      arr.push(10)
      arr.push(20)
      expect(arr.pop()).toBe(20)
      expect(arr.pop()).toBe(10)
      expect(arr.pop()).toBeUndefined()
    })

    it('pops all elements leaves empty array', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      for (let i = 0; i < 7; i++) arr.push(i)
      for (let i = 0; i < 7; i++) arr.pop()
      expect(arr.size).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.pageCount()).toBe(0)
    })

    it('can push after fully draining', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      arr.pop()
      arr.push(99)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(99)
    })

    it('interleaved push and pop', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.pop()).toBe(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(1)
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('get', () => {
    it('returns undefined for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.get(0)).toBeUndefined()
    })

    it('returns element at index 0', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.get(0)).toBe(10)
    })

    it('returns element at last valid index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.get(2)).toBe(30)
    })

    it('returns undefined for out of bounds index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      expect(arr.get(1)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      expect(arr.get(-1)).toBeUndefined()
    })

    it('returns correct element across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(3)
      expect(arr.get(3)).toBe(4)
    })

    it('updates gets statistic', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.get(0)
      arr.get(0)
      expect(arr.getStatistics().gets).toBe(2)
    })
  })

  describe('set', () => {
    it('sets element at valid index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.set(0, 99)
      expect(arr.get(0)).toBe(99)
    })

    it('sets element at last valid index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.set(1, 88)
      expect(arr.get(1)).toBe(88)
    })

    it('throws on negative index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(() => arr.set(-1, 99)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(() => arr.set(1, 99)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      expect(() => arr.set(0, 99)).toThrow(RangeError)
    })

    it('updates sets statistic', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.set(0, 10)
      expect(arr.getStatistics().sets).toBe(1)
    })

    it('sets element across page boundary', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.set(2, 99)
      expect(arr.get(2)).toBe(99)
    })
  })

  describe('insertAt', () => {
    it('inserts at beginning', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.insertAt(0, 99)
      expect(arr.toArray()).toEqual([99, 1, 2])
    })

    it('inserts at middle', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(3)
      arr.insertAt(1, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.insertAt(2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty array at index 0', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.insertAt(0, 42)
      expect(arr.toArray()).toEqual([42])
    })

    it('throws on negative index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(() => arr.insertAt(-1, 99)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(() => arr.insertAt(2, 99)).toThrow(RangeError)
    })

    it('maintains correct size after insert', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.insertAt(1, 99)
      expect(arr.size).toBe(3)
    })

    it('works across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(4)
      arr.push(5)
      arr.insertAt(2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('removeAt', () => {
    it('returns undefined for out of bounds', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      expect(arr.removeAt(0)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(arr.removeAt(-1)).toBeUndefined()
    })

    it('removes from beginning', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(0)).toBe(1)
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('removes from middle', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(1)).toBe(2)
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('removes from end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(2)).toBe(3)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('removes single element', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(42)
      expect(arr.removeAt(0)).toBe(42)
      expect(arr.isEmpty()).toBe(true)
    })

    it('maintains correct size', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.removeAt(1)
      expect(arr.size).toBe(2)
    })

    it('works across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.removeAt(1)
      expect(arr.toArray()).toEqual([1, 3, 4])
    })
  })

  describe('size', () => {
    it('returns 0 for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.size).toBe(0)
    })

    it('increases with push', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(arr.size).toBe(1)
      arr.push(2)
      expect(arr.size).toBe(2)
    })

    it('decreases with pop', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      expect(arr.size).toBe(1)
    })

    it('stays 0 when pop on empty', () => {
      const arr = new PagedArray<number>()
      arr.pop()
      expect(arr.size).toBe(0)
    })

    it('resets to 0 after clear', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.clear()
      expect(arr.size).toBe(0)
    })
  })

  describe('capacity', () => {
    it('returns 0 for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.capacity()).toBe(0)
    })

    it('returns pageSize for single element', () => {
      const arr = new PagedArray<number>({ pageSize: 8 })
      arr.push(1)
      expect(arr.capacity()).toBe(8)
    })

    it('returns 2 * pageSize for two pages', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.capacity()).toBe(6)
    })

    it('decreases when compacted', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.pop()
      arr.pop()
      arr.compact()
      expect(arr.capacity()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new array', () => {
      const arr = new PagedArray<number>()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const arr = new PagedArray<number>()
      arr.push(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('returns true after draining', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.pop()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const arr = new PagedArray<number>()
      arr.push(1)
      arr.clear()
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears a non-empty array', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.clear()
      expect(arr.size).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.pageCount()).toBe(0)
    })

    it('clears an empty array without error', () => {
      const arr = new PagedArray<number>()
      arr.clear()
      expect(arr.size).toBe(0)
    })

    it('allows push after clear', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.clear()
      arr.push(2)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(2)
    })

    it('allows operations after clear', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.clear()
      arr.push(10)
      arr.push(20)
      expect(arr.pop()).toBe(20)
      expect(arr.toArray()).toEqual([10])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty paged array', () => {
      const arr = new PagedArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns correct array after partial pop', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('returns correct array across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.pop()
      arr.pop()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('returns copy not reference', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      const a = arr.toArray()
      a.push(2)
      expect(arr.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty array', () => {
      const arr = new PagedArray<number>()
      const items: number[] = []
      arr.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const items: number[] = []
      arr.forEach((v) => items.push(v))
      expect(items).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const indices: number[] = []
      arr.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates correctly after partial pop', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      const items: number[] = []
      arr.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2])
    })

    it('iterates across multiple pages', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      for (let i = 0; i < 10; i++) arr.push(i)
      const items: number[] = []
      arr.forEach((v) => items.push(v))
      expect(items).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('produces empty iterator for empty array', () => {
      const arr = new PagedArray<number>()
      expect([...arr]).toEqual([])
    })

    it('iterates all elements', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect([...arr]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(10)
      arr.push(20)
      const items: number[] = []
      for (const v of arr) items.push(v)
      expect(items).toEqual([10, 20])
    })

    it('works with spread after partial pop', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      expect([...arr]).toEqual([1, 2])
    })

    it('works with Array.from', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      arr.push(1)
      arr.push(2)
      expect(Array.from(arr)).toEqual([1, 2])
    })
  })

  describe('at', () => {
    it('returns undefined for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.at(0)).toBeUndefined()
    })

    it('returns element at index 0', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.at(0)).toBe(10)
    })

    it('returns element at last valid index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.at(2)).toBe(30)
    })

    it('returns undefined for out of bounds index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      expect(arr.at(1)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      expect(arr.at(-1)).toBeUndefined()
    })

    it('returns correct element across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.at(0)).toBe(1)
      expect(arr.at(1)).toBe(2)
      expect(arr.at(2)).toBe(3)
      expect(arr.at(3)).toBe(4)
    })

    it('returns correct element with many pages', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      for (let i = 0; i < 10; i++) arr.push(i)
      for (let i = 0; i < 10; i++) {
        expect(arr.at(i)).toBe(i)
      }
    })
  })

  describe('fill', () => {
    it('fills entire array with value', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0, 0])
    })

    it('fills from start index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0, 1)
      expect(arr.toArray()).toEqual([1, 0, 0])
    })

    it('fills from start to end index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.fill(0, 1, 3)
      expect(arr.toArray()).toEqual([1, 0, 0, 4])
    })

    it('does nothing on empty array', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.fill(0)
      expect(arr.size).toBe(0)
    })

    it('handles start beyond size', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.fill(0, 5)
      expect(arr.toArray()).toEqual([1])
    })

    it('handles negative start', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0, -2)
      expect(arr.toArray()).toEqual([1, 0, 0])
    })

    it('handles negative end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.fill(0, 0, -1)
      expect(arr.toArray()).toEqual([0, 0, 0, 4])
    })

    it('handles start >= end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.fill(0, 2, 1)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('fills across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0, 0, 0])
    })

    it('fills with objects', () => {
      const obj = { x: 1 }
      const arr = new PagedArray<{ x: number }>({ pageSize: 4 })
      arr.push({ x: 0 })
      arr.push({ x: 0 })
      arr.fill(obj)
      expect(arr.get(0)).toBe(obj)
      expect(arr.get(1)).toBe(obj)
    })
  })

  describe('pageCount', () => {
    it('returns 0 for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.pageCount()).toBe(0)
    })

    it('returns 1 after first push', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(arr.pageCount()).toBe(1)
    })

    it('increases when new page needed', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      expect(arr.pageCount()).toBe(1)
      arr.push(3)
      expect(arr.pageCount()).toBe(2)
    })

    it('decreases when compacted', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.pop()
      arr.pop()
      arr.compact()
      expect(arr.pageCount()).toBe(1)
    })

    it('returns 0 after fully drained', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      arr.pop()
      expect(arr.pageCount()).toBe(0)
    })
  })

  describe('pageSize', () => {
    it('returns configured pageSize', () => {
      const arr = new PagedArray<number>({ pageSize: 16 })
      expect(arr.pageSize()).toBe(16)
    })

    it('returns default pageSize when not specified', () => {
      const arr = new PagedArray<number>()
      expect(arr.pageSize()).toBe(1024)
    })

    it('returns 1 when configured with 0', () => {
      const arr = new PagedArray<number>({ pageSize: 0 })
      expect(arr.pageSize()).toBe(1)
    })
  })

  describe('compact', () => {
    it('does nothing on empty array', () => {
      const arr = new PagedArray<number>()
      arr.compact()
      expect(arr.size).toBe(0)
      expect(arr.getStatistics().compactions).toBe(0)
    })

    it('does nothing when already compact', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.compact()
      expect(arr.getStatistics().compactions).toBe(0)
    })

    it('frees excess pages via compact', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.push(6)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.compact()
      expect(arr.pageCount()).toBe(1)
      expect(arr.toArray()).toEqual([6])
    })

    it('increments compactions statistic', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.compact()
      expect(arr.getStatistics().compactions).toBe(1)
    })

    it('increments pagesFreed on compact', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.removeAt(0)
      const freedBefore = arr.getStatistics().pagesFreed
      arr.compact()
      expect(arr.getStatistics().pagesFreed).toBeGreaterThan(freedBefore)
    })

    it('maintains correct iteration after compact', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.pop()
      arr.pop()
      arr.compact()
      expect([...arr]).toEqual([1, 2, 3])
    })

    it('maintains correct at after compact', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      arr.push(40)
      arr.push(50)
      arr.pop()
      arr.pop()
      arr.compact()
      expect(arr.at(0)).toBe(10)
      expect(arr.at(1)).toBe(20)
      expect(arr.at(2)).toBe(30)
    })

    it('allows continued push after compact', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.pop()
      arr.pop()
      arr.compact()
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.indexOf(1)).toBe(-1)
    })

    it('returns index of found element', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.indexOf(20)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('returns first occurrence', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(10)
      expect(arr.indexOf(10)).toBe(0)
    })

    it('finds element across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.indexOf(3)).toBe(2)
      expect(arr.indexOf(4)).toBe(3)
    })

    it('finds null', () => {
      const arr = new PagedArray<null>({ pageSize: 4 })
      arr.push(null)
      arr.push(null)
      expect(arr.indexOf(null)).toBe(0)
    })

    it('uses strict equality', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(arr.indexOf(1)).toBe(0)
      expect(arr.indexOf('1' as unknown as number)).toBe(-1)
    })
  })

  describe('lastIndexOf', () => {
    it('returns -1 for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.lastIndexOf(1)).toBe(-1)
    })

    it('returns last index of found element', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(10)
      expect(arr.lastIndexOf(10)).toBe(2)
    })

    it('returns -1 when not found', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.lastIndexOf(99)).toBe(-1)
    })

    it('returns last occurrence across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(1)
      arr.push(4)
      expect(arr.lastIndexOf(1)).toBe(2)
    })

    it('returns same as indexOf for unique elements', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.lastIndexOf(20)).toBe(arr.indexOf(20))
    })

    it('finds null', () => {
      const arr = new PagedArray<null>({ pageSize: 4 })
      arr.push(null)
      arr.push(null)
      expect(arr.lastIndexOf(null)).toBe(1)
    })
  })

  describe('includes', () => {
    it('returns false for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.includes(1)).toBe(false)
    })

    it('returns true when element found', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.includes(20)).toBe(true)
    })

    it('returns false when not found', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.includes(99)).toBe(false)
    })

    it('finds element across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.includes(3)).toBe(true)
    })

    it('uses strict equality', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(arr.includes(1)).toBe(true)
      expect(arr.includes('1' as unknown as number)).toBe(false)
    })
  })

  describe('slice', () => {
    it('returns empty for empty array', () => {
      const arr = new PagedArray<number>()
      expect(arr.slice()).toEqual([])
    })

    it('returns full array with no args', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice()).toEqual([1, 2, 3])
    })

    it('returns from start index', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(1)).toEqual([2, 3])
    })

    it('returns from start to end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(1, 3)).toEqual([2, 3])
    })

    it('handles negative start', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(-2)).toEqual([2, 3])
    })

    it('handles negative end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(0, -1)).toEqual([1, 2, 3])
    })

    it('handles both negative', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(-3, -1)).toEqual([2, 3])
    })

    it('returns empty when start >= end', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.slice(2, 1)).toEqual([])
    })

    it('returns empty when start >= size', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      expect(arr.slice(5)).toEqual([])
    })

    it('works across page boundaries', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.slice(1, 4)).toEqual([2, 3, 4])
    })

    it('clamps negative start beyond beginning', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(-10)).toEqual([1, 2, 3])
    })

    it('clamps negative end beyond beginning', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(0, -10)).toEqual([])
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const arr = new PagedArray<number>()
      const stats = arr.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.pagesAllocated).toBe(0)
      expect(stats.pagesFreed).toBe(0)
      expect(stats.compactions).toBe(0)
    })

    it('tracks pushes', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.getStatistics().pushes).toBe(3)
    })

    it('tracks pops', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.pop()
      arr.pop()
      expect(arr.getStatistics().pops).toBe(2)
    })

    it('tracks sets', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.set(0, 99)
      arr.set(0, 88)
      expect(arr.getStatistics().sets).toBe(2)
    })

    it('tracks gets', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.get(0)
      arr.get(0)
      arr.get(0)
      expect(arr.getStatistics().gets).toBe(3)
    })

    it('tracks pagesAllocated', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.getStatistics().pagesAllocated).toBe(2)
    })

    it('tracks pagesFreed', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      arr.pop()
      arr.compact()
      expect(arr.getStatistics().pagesFreed).toBeGreaterThanOrEqual(1)
    })

    it('tracks compactions', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.compact()
      expect(arr.getStatistics().compactions).toBe(1)
    })

    it('returns a copy of statistics', () => {
      const arr = new PagedArray<number>()
      const stats1 = arr.getStatistics()
      const stats2 = arr.getStatistics()
      expect(stats1).not.toBe(stats2)
      expect(stats1).toEqual(stats2)
    })

    it('comprehensive statistics tracking', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.pop()
      arr.pop()
      arr.get(0)
      arr.set(0, 99)
      arr.push(6)
      arr.push(7)
      arr.removeAt(0)
      arr.removeAt(0)
      arr.compact()
      const stats = arr.getStatistics()
      expect(stats.pushes).toBeGreaterThanOrEqual(7)
      expect(stats.pops).toBeGreaterThanOrEqual(2)
      expect(stats.gets).toBeGreaterThanOrEqual(1)
      expect(stats.sets).toBeGreaterThanOrEqual(1)
      expect(stats.pagesAllocated).toBeGreaterThanOrEqual(3)
      expect(stats.compactions).toBe(1)
    })
  })

  describe('type generics', () => {
    it('works with string type', () => {
      const arr = new PagedArray<string>({ pageSize: 2 })
      arr.push('hello')
      arr.push('world')
      expect(arr.pop()).toBe('world')
    })

    it('works with object type', () => {
      const arr = new PagedArray<{ id: number }>({ pageSize: 2 })
      arr.push({ id: 1 })
      arr.push({ id: 2 })
      expect(arr.pop()!.id).toBe(2)
    })

    it('works with array type', () => {
      const arr = new PagedArray<number[]>({ pageSize: 2 })
      arr.push([1, 2])
      arr.push([3, 4])
      expect(arr.pop()).toEqual([3, 4])
    })

    it('works with default unknown type', () => {
      const arr = new PagedArray()
      arr.push(42)
      arr.push('test')
      expect(arr.size).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('handles many pushes and pops', () => {
      const arr = new PagedArray<number>({ pageSize: 8 })
      for (let i = 0; i < 1000; i++) arr.push(i)
      expect(arr.size).toBe(1000)
      for (let i = 999; i >= 0; i--) {
        expect(arr.pop()).toBe(i)
      }
      expect(arr.isEmpty()).toBe(true)
    })

    it('handles interleaved push/pop', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      for (let i = 0; i < 100; i++) {
        arr.push(i)
        if (i % 2 === 0) arr.pop()
      }
      expect(arr.size).toBe(50)
    })

    it('handles push after full drain repeatedly', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      for (let round = 0; round < 10; round++) {
        arr.push(round * 10)
        arr.push(round * 10 + 1)
        expect(arr.pop()).toBe(round * 10 + 1)
        expect(arr.pop()).toBe(round * 10)
        expect(arr.isEmpty()).toBe(true)
      }
    })

    it('toArray is consistent after many operations', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      const expected: number[] = []
      for (let i = 0; i < 20; i++) {
        arr.push(i)
        expected.push(i)
      }
      for (let i = 0; i < 5; i++) {
        arr.pop()
        expected.pop()
      }
      expect(arr.toArray()).toEqual(expected)
    })

    it('at is consistent with toArray', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      for (let i = 0; i < 15; i++) arr.push(i)
      for (let i = 0; i < 3; i++) arr.pop()
      const a = arr.toArray()
      for (let i = 0; i < a.length; i++) {
        expect(arr.at(i)).toBe(a[i])
      }
    })

    it('forEach matches toArray', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      for (let i = 0; i < 20; i++) arr.push(i)
      for (let i = 0; i < 10; i++) arr.pop()
      const fromForEach: number[] = []
      arr.forEach((v) => fromForEach.push(v))
      expect(fromForEach).toEqual(arr.toArray())
    })

    it('iterator matches toArray', () => {
      const arr = new PagedArray<number>({ pageSize: 5 })
      for (let i = 0; i < 25; i++) arr.push(i)
      for (let i = 0; i < 12; i++) arr.pop()
      expect([...arr]).toEqual(arr.toArray())
    })

    it('handles pageSize 1 stress', () => {
      const arr = new PagedArray<number>({ pageSize: 1 })
      for (let i = 0; i < 50; i++) arr.push(i)
      expect(arr.pageCount()).toBe(50)
      for (let i = 49; i >= 0; i--) {
        expect(arr.pop()).toBe(i)
      }
      expect(arr.pageCount()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('pop on empty does not corrupt state', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.pop()
      arr.pop()
      arr.push(1)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('at on empty returns undefined', () => {
      const arr = new PagedArray<number>()
      expect(arr.at(0)).toBeUndefined()
      expect(arr.at(100)).toBeUndefined()
      expect(arr.at(-1)).toBeUndefined()
    })

    it('clear does not affect statistics', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      const statsBefore = arr.getStatistics()
      arr.clear()
      const statsAfter = arr.getStatistics()
      expect(statsAfter.pushes).toBe(statsBefore.pushes)
      expect(statsAfter.pops).toBe(statsBefore.pops)
    })

    it('get increments gets counter', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.get(0)
      arr.get(0)
      expect(arr.getStatistics().gets).toBe(2)
    })

    it('compact when already compact does not increment', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.compact()
      expect(arr.getStatistics().compactions).toBe(0)
    })

    it('re-push after full drain multiple times', () => {
      const arr = new PagedArray<number>({ pageSize: 2 })
      for (let cycle = 0; cycle < 5; cycle++) {
        arr.push(cycle)
        arr.pop()
      }
      arr.push(999)
      expect(arr.get(0)).toBe(999)
      expect(arr.size).toBe(1)
    })

    it('insertAt triggers push internally', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.insertAt(1, 99)
      expect(arr.size).toBe(3)
      expect(arr.getStatistics().pushes).toBe(3)
    })

    it('removeAt triggers pop internally', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.removeAt(1)
      expect(arr.size).toBe(2)
      expect(arr.getStatistics().pops).toBe(1)
    })

    it('slice with undefined end defaults to size', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(0, undefined)).toEqual([1, 2, 3])
    })

    it('fill default parameters', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0])
    })

    it('stable references - get returns same after new pushes', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const val = arr.get(0)
      arr.push(4)
      arr.push(5)
      arr.push(6)
      expect(arr.get(0)).toBe(val)
      expect(arr.get(0)).toBe(1)
    })

    it('indexOf with NaN', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(NaN)
      expect(arr.indexOf(NaN)).toBe(-1)
    })

    it('lastIndexOf with single element', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(42)
      expect(arr.lastIndexOf(42)).toBe(0)
    })

    it('includes with NaN', () => {
      const arr = new PagedArray<number>({ pageSize: 4 })
      arr.push(NaN)
      expect(arr.includes(NaN)).toBe(false)
    })

    it('slice of large array', () => {
      const arr = new PagedArray<number>({ pageSize: 3 })
      for (let i = 0; i < 100; i++) arr.push(i)
      expect(arr.slice(10, 20)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    })
  })
})
