import { describe, expect, it } from 'vitest'
import { SparseTable } from '../../../src/utils/sparse-table.js'

describe('SparseTable', () => {
  describe('constructor', () => {
    it('creates empty table with empty array', () => {
      const table = new SparseTable([], (a, b) => a + b)
      expect(table.length).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('creates table with single element', () => {
      const table = new SparseTable([5], (a, b) => a + b)
      expect(table.length).toBe(1)
      expect(table.isEmpty()).toBe(false)
    })

    it('creates table with multiple elements', () => {
      const table = new SparseTable([1, 2, 3, 4, 5], Math.min)
      expect(table.length).toBe(5)
      expect(table.isEmpty()).toBe(false)
    })

    it('creates table with idempotent option true', () => {
      const table = new SparseTable([1, 2, 3], Math.min, { idempotent: true })
      expect(table.length).toBe(3)
    })

    it('creates table with idempotent option false', () => {
      const table = new SparseTable([1, 2, 3], (a, b) => a + b, { idempotent: false })
      expect(table.length).toBe(3)
    })

    it('creates table with default idempotent option', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.length).toBe(3)
    })
  })

  describe('query', () => {
    it('returns undefined for empty table', () => {
      const table = new SparseTable([], (a, b) => a + b)
      expect(table.query(0, 1)).toBe(undefined)
    })

    it('returns undefined for start < 0', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.query(-1, 2)).toBe(undefined)
    })

    it('returns undefined for end > length', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.query(0, 5)).toBe(undefined)
    })

    it('returns undefined for start >= end', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.query(1, 1)).toBe(undefined)
    })

    it('returns undefined for start > end', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.query(2, 1)).toBe(undefined)
    })

    it('returns single element for range of length 1', () => {
      const table = new SparseTable([1, 2, 3, 4, 5], Math.min)
      expect(table.query(0, 1)).toBe(1)
      expect(table.query(2, 3)).toBe(3)
      expect(table.query(4, 5)).toBe(5)
    })

    it('returns minimum for full range with idempotent', () => {
      const table = new SparseTable([3, 1, 4, 1, 5], Math.min, { idempotent: true })
      expect(table.query(0, 5)).toBe(1)
    })

    it('returns maximum for full range with idempotent', () => {
      const table = new SparseTable([3, 1, 4, 1, 5], Math.max, { idempotent: true })
      expect(table.query(0, 5)).toBe(5)
    })

    it('handles single element for non-idempotent', () => {
      const table = new SparseTable([1, 2, 3, 4], (a, b) => a + b, { idempotent: false })
      expect(table.query(0, 1)).toBe(1)
      expect(table.query(1, 2)).toBe(2)
      expect(table.query(2, 3)).toBe(3)
      expect(table.query(3, 4)).toBe(4)
    })

    it('returns minimum for sub-range', () => {
      const table = new SparseTable([3, 1, 4, 1, 5], Math.min, { idempotent: true })
      expect(table.query(1, 4)).toBe(1)
      expect(table.query(0, 3)).toBe(1)
      expect(table.query(2, 5)).toBe(1)
    })

    it('returns maximum for sub-range', () => {
      const table = new SparseTable([3, 1, 4, 1, 5], Math.max, { idempotent: true })
      expect(table.query(1, 4)).toBe(4)
      expect(table.query(0, 3)).toBe(4)
      expect(table.query(2, 5)).toBe(5)
    })

    it('handles overlapping queries correctly with idempotent', () => {
      const table = new SparseTable([5, 2, 8, 3, 9, 1, 7], Math.min, { idempotent: true })
      expect(table.query(0, 4)).toBe(2)
      expect(table.query(2, 6)).toBe(1)
      expect(table.query(1, 5)).toBe(2)
    })

    it('handles single element array', () => {
      const table = new SparseTable([42], Math.min, { idempotent: true })
      expect(table.query(0, 1)).toBe(42)
    })

    it('handles two element array', () => {
      const table = new SparseTable([7, 3], Math.min, { idempotent: true })
      expect(table.query(0, 1)).toBe(7)
      expect(table.query(1, 2)).toBe(3)
      expect(table.query(0, 2)).toBe(3)
    })

    it('handles array with all same values', () => {
      const table = new SparseTable([5, 5, 5, 5, 5], Math.min, { idempotent: true })
      expect(table.query(0, 5)).toBe(5)
      expect(table.query(1, 4)).toBe(5)
      expect(table.query(0, 3)).toBe(5)
    })

    it('handles sorted ascending array', () => {
      const table = new SparseTable([1, 2, 3, 4, 5, 6, 7], Math.min, { idempotent: true })
      expect(table.query(0, 7)).toBe(1)
      expect(table.query(3, 7)).toBe(4)
      expect(table.query(5, 7)).toBe(6)
    })

    it('handles sorted descending array', () => {
      const table = new SparseTable([7, 6, 5, 4, 3, 2, 1], Math.min, { idempotent: true })
      expect(table.query(0, 7)).toBe(1)
      expect(table.query(0, 4)).toBe(4)
      expect(table.query(0, 5)).toBe(3)
    })

    it('handles negative numbers', () => {
      const table = new SparseTable([-3, -1, -4, -1, -5], Math.min, { idempotent: true })
      expect(table.query(0, 5)).toBe(-5)
      expect(table.query(0, 3)).toBe(-4)
      expect(table.query(1, 4)).toBe(-4)
    })

    it('handles large array (1000 elements)', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      const table = new SparseTable(data, Math.min, { idempotent: true })
      expect(table.query(0, 1000)).toBe(1)
      expect(table.query(500, 1000)).toBe(501)
      expect(table.query(0, 500)).toBe(1)
    })
  })

  describe('get', () => {
    it('returns undefined for empty table', () => {
      const table = new SparseTable([], (a, b) => a + b)
      expect(table.get(0)).toBe(undefined)
    })

    it('returns element at valid index', () => {
      const table = new SparseTable([1, 2, 3, 4, 5], Math.min)
      expect(table.get(0)).toBe(1)
      expect(table.get(2)).toBe(3)
      expect(table.get(4)).toBe(5)
    })

    it('returns undefined for index < 0', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.get(-1)).toBe(undefined)
    })

    it('returns undefined for index >= length', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.get(3)).toBe(undefined)
      expect(table.get(5)).toBe(undefined)
    })
  })

  describe('length', () => {
    it('returns 0 for empty array', () => {
      const table = new SparseTable([], (a, b) => a + b)
      expect(table.length).toBe(0)
    })

    it('returns 1 for single element', () => {
      const table = new SparseTable([5], Math.min)
      expect(table.length).toBe(1)
    })

    it('returns correct length for multiple elements', () => {
      const table = new SparseTable([1, 2, 3, 4, 5], Math.min)
      expect(table.length).toBe(5)
    })

    it('returns correct length for large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i)
      const table = new SparseTable(data, Math.min)
      expect(table.length).toBe(1000)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty array', () => {
      const table = new SparseTable([], (a, b) => a + b)
      expect(table.isEmpty()).toBe(true)
    })

    it('returns false for single element', () => {
      const table = new SparseTable([5], Math.min)
      expect(table.isEmpty()).toBe(false)
    })

    it('returns false for multiple elements', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      expect(table.isEmpty()).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty table', () => {
      const table = new SparseTable([], (a, b) => a + b)
      expect(table.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const table = new SparseTable([5], Math.min)
      expect(table.toArray()).toEqual([5])
    })

    it('returns array with multiple elements', () => {
      const table = new SparseTable([1, 2, 3, 4, 5], Math.min)
      expect(table.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns copy, not reference', () => {
      const table = new SparseTable([1, 2, 3], Math.min)
      const arr = table.toArray()
      arr[0] = 999
      expect(table.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('static min', () => {
    it('creates table that returns minimum in range', () => {
      const table = SparseTable.min([3, 1, 4, 1, 5, 9, 2, 6])
      expect(table.query(0, 8)).toBe(1)
      expect(table.query(0, 3)).toBe(1)
      expect(table.query(2, 6)).toBe(1)
      expect(table.query(5, 8)).toBe(2)
    })

    it('handles empty array', () => {
      const table = SparseTable.min([])
      expect(table.length).toBe(0)
    })

    it('handles single element', () => {
      const table = SparseTable.min([42])
      expect(table.query(0, 1)).toBe(42)
    })

    it('handles negative numbers', () => {
      const table = SparseTable.min([-3, -1, -4, -1, -5])
      expect(table.query(0, 5)).toBe(-5)
    })
  })

  describe('static max', () => {
    it('creates table that returns maximum in range', () => {
      const table = SparseTable.max([3, 1, 4, 1, 5, 9, 2, 6])
      expect(table.query(0, 8)).toBe(9)
      expect(table.query(0, 3)).toBe(4)
      expect(table.query(2, 6)).toBe(9)
      expect(table.query(5, 8)).toBe(9)
    })

    it('handles empty array', () => {
      const table = SparseTable.max([])
      expect(table.length).toBe(0)
    })

    it('handles single element', () => {
      const table = SparseTable.max([42])
      expect(table.query(0, 1)).toBe(42)
    })

    it('handles negative numbers', () => {
      const table = SparseTable.max([-3, -1, -4, -1, -5])
      expect(table.query(0, 5)).toBe(-1)
    })
  })

  describe('static gcd', () => {
    it('creates table that returns GCD in range', () => {
      const table = SparseTable.gcd([12, 18, 6, 9, 15])
      expect(table.query(0, 2)).toBe(6)
      expect(table.query(0, 3)).toBe(6)
      expect(table.query(2, 5)).toBe(3)
      expect(table.query(1, 4)).toBe(3)
    })

    it('handles empty array', () => {
      const table = SparseTable.gcd([])
      expect(table.length).toBe(0)
    })

    it('handles single element', () => {
      const table = SparseTable.gcd([42])
      expect(table.query(0, 1)).toBe(42)
    })

    it('handles coprime numbers', () => {
      const table = SparseTable.gcd([7, 11, 13, 17])
      expect(table.query(0, 2)).toBe(1)
      expect(table.query(0, 4)).toBe(1)
    })
  })

  describe('static sum', () => {
    it('creates table with idempotent false', () => {
      const table = SparseTable.sum([1, 2, 3, 4])
      expect(table.length).toBe(4)
    })

    it('handles empty array', () => {
      const table = SparseTable.sum([])
      expect(table.length).toBe(0)
    })

    it('handles single element', () => {
      const table = SparseTable.sum([42])
      expect(table.query(0, 1)).toBe(42)
    })

    it('handles single element queries', () => {
      const table = SparseTable.sum([1, 2, 3, 4, 5, 6, 7, 8])
      expect(table.query(0, 1)).toBe(1)
      expect(table.query(1, 2)).toBe(2)
      expect(table.query(7, 8)).toBe(8)
    })
  })

  describe('static fromArray', () => {
    it('creates table with custom combine function', () => {
      const combine = (a: number, b: number) => Math.min(a, b)
      const table = SparseTable.fromArray([3, 1, 4, 1, 5], combine, { idempotent: true })
      expect(table.query(0, 5)).toBe(1)
      expect(table.query(2, 5)).toBe(1)
    })

    it('creates table with idempotent option', () => {
      const combine = (a: number, b: number) => Math.min(a, b)
      const table = SparseTable.fromArray([1, 2, 3, 4], combine, { idempotent: true })
      expect(table.query(0, 4)).toBe(1)
    })

    it('handles empty array', () => {
      const table = SparseTable.fromArray([], (a, b) => a + b)
      expect(table.length).toBe(0)
    })

    it('works with generic type', () => {
      const combine = (a: string, b: string) => Math.min(a.length, b.length).toString()
      const table = SparseTable.fromArray(['a', 'bb', 'ccc'], combine, { idempotent: true })
      expect(table.query(0, 1)).toBe('a')
      expect(table.query(0, 2)).toBe('1')
      expect(table.query(0, 3)).toBe('1')
      expect(table.get(1)).toBe('bb')
    })
  })

  describe('idempotent queries', () => {
    it('handles overlapping queries correctly', () => {
      const table = new SparseTable([5, 2, 8, 3, 9, 1, 7, 4, 6], Math.min, { idempotent: true })
      expect(table.query(0, 9)).toBe(1)
      expect(table.query(0, 5)).toBe(2)
      expect(table.query(4, 9)).toBe(1)
      expect(table.query(1, 7)).toBe(1)
    })

    it('returns correct result for all possible sub-ranges', () => {
      const data = [4, 2, 7, 3, 8, 1, 5]
      const table = new SparseTable(data, Math.min, { idempotent: true })

      for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j <= data.length; j++) {
          const expected = Math.min(...data.slice(i, j))
          expect(table.query(i, j)).toBe(expected)
        }
      }
    })
  })
})