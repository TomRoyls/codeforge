import { describe, it, expect } from 'vitest'
import { RangeMinimumQuery } from '../src/core/range-minimum-query/index.js'

describe('RangeMinimumQuery', () => {
  // ─── Construction & Query ───
  describe('construction and query', () => {
    it('creates from array', () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5, 9, 2, 6])
      expect(rmq.size()).toBe(8)
      expect(rmq.isEmpty()).toBe(false)
    })

    it('creates empty', () => {
      const rmq = new RangeMinimumQuery([])
      expect(rmq.size()).toBe(0)
      expect(rmq.isEmpty()).toBe(true)
    })

    it('query returns minimum in range', () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5, 9, 2, 6])
      const result = rmq.query(0, 3)
      expect(result.value).toBe(1)
    })

    it('query single element', () => {
      const rmq = new RangeMinimumQuery([5])
      expect(rmq.query(0, 0).value).toBe(5)
    })

    it('query full range', () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5])
      expect(rmq.query(0, 4).value).toBe(1)
    })

    it('query throws on empty', () => {
      const rmq = new RangeMinimumQuery([])
      expect(() => rmq.query(0, 0)).toThrow(RangeError)
    })

    it('query throws on invalid range', () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.query(-1, 2)).toThrow(RangeError)
      expect(() => rmq.query(2, 1)).toThrow(RangeError)
    })

    it('query returns correct index', () => {
      const rmq = new RangeMinimumQuery([5, 3, 7])
      expect(rmq.query(0, 2).index).toBe(1)
    })
  })

  // ─── Custom Comparator ───
  describe('custom comparator', () => {
    it('supports max query via reverse comparator', () => {
      const rmq = new RangeMinimumQuery([3, 1, 4], (a, b) => b - a)
      expect(rmq.query(0, 2).value).toBe(4)
    })

    it('works with strings', () => {
      const rmq = new RangeMinimumQuery(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b))
      expect(rmq.query(0, 2).value).toBe('apple')
    })
  })

  // ─── Update ───
  describe('update', () => {
    it('updates value at index', () => {
      const rmq = new RangeMinimumQuery([5, 3, 7])
      rmq.update(1, 10)
      expect(rmq.getValue(1)).toBe(10)
      expect(rmq.query(0, 2).value).toBe(5)
    })

    it('update throws on out of bounds', () => {
      const rmq = new RangeMinimumQuery([1, 2])
      expect(() => rmq.update(5, 0)).toThrow(RangeError)
    })
  })

  // ─── Utilities ───
  describe('utilities', () => {
    it('toArray returns copy', () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(rmq.toArray()).toEqual([1, 2, 3])
    })

    it('clone produces independent copy', () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      const c = rmq.clone()
      rmq.update(0, 99)
      expect(c.getValue(0)).toBe(1)
    })

    it('getValue returns element at index', () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      expect(rmq.getValue(1)).toBe(20)
    })

    it('getValue throws on out of bounds', () => {
      const rmq = new RangeMinimumQuery([1])
      expect(() => rmq.getValue(5)).toThrow(RangeError)
    })

    it('forEach iterates', () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      const vals: number[] = []
      rmq.forEach((v) => vals.push(v))
      expect(vals).toEqual([1, 2, 3])
    })

    it('is iterable', () => {
      const rmq = new RangeMinimumQuery([1, 2])
      expect([...rmq]).toEqual([1, 2])
    })

    it('getComparator returns the comparator', () => {
      const rmq = new RangeMinimumQuery([1])
      expect(typeof rmq.getComparator()).toBe('function')
    })
  })
})
