import { describe, it, expect } from 'vitest'
import { FractionalCascading } from '../../../src/utils/fractional-cascading.js'

describe('FractionalCascading', () => {
  describe('construction', () => {
    it('creates with empty lists', () => {
      const fc = new FractionalCascading([])
      expect(fc.listCount).toBe(0)
      expect(fc.search(5)).toEqual([])
    })

    it('creates with single list', () => {
      const fc = new FractionalCascading([[1, 3, 5, 7, 9]])
      expect(fc.listCount).toBe(1)
    })

    it('creates with multiple sorted lists', () => {
      const fc = new FractionalCascading([
        [1, 3, 5],
        [2, 4, 6],
        [0, 8, 10],
      ])
      expect(fc.listCount).toBe(3)
    })

    it('sorts unsorted lists', () => {
      const fc = new FractionalCascading([[5, 1, 3]])
      expect(fc.getList(0)).toEqual([1, 3, 5])
    })
  })

  describe('search', () => {
    it('finds element in single list', () => {
      const fc = new FractionalCascading([[1, 3, 5, 7, 9]])
      const result = fc.search(5)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(2)
    })

    it('finds first element', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      const result = fc.search(1)
      expect(result[0]).toBe(0)
    })

    it('finds last element', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      const result = fc.search(5)
      expect(result[0]).toBe(2)
    })

    it('returns -1 for missing element', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      const result = fc.search(4)
      expect(result[0]).toBe(-1)
    })

    it('searches across multiple lists', () => {
      const fc = new FractionalCascading([
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ])
      const result = fc.search(5)
      expect(result).toHaveLength(3)
    })

    it('finds element present in all lists', () => {
      const fc = new FractionalCascading([
        [1, 5, 10],
        [5, 6, 7],
        [3, 5, 8],
      ])
      const result = fc.search(5)
      expect(result).toHaveLength(3)
      expect(result[0]).toBe(1)
      expect(result[1]).toBe(0)
      expect(result[2]).toBe(1)
    })
  })

  describe('getList', () => {
    it('returns copy of list', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      const list = fc.getList(0)
      expect(list).toEqual([1, 2, 3])
      list.push(4)
      expect(fc.getList(0)).toEqual([1, 2, 3])
    })

    it('returns empty for out of bounds', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.getList(5)).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('handles single element lists', () => {
      const fc = new FractionalCascading([[1], [2], [3]])
      const result = fc.search(2)
      expect(result).toHaveLength(3)
      expect(result[1]).toBe(0)
    })

    it('handles empty inner lists', () => {
      const fc = new FractionalCascading([[], [1, 2, 3]])
      const result = fc.search(2)
      expect(result).toHaveLength(2)
    })

    it('handles large lists', () => {
      const lists: number[][] = []
      for (let i = 0; i < 5; i++) {
        const list: number[] = []
        for (let j = 0; j < 100; j++) {
          list.push(i * 100 + j)
        }
        lists.push(list)
      }
      const fc = new FractionalCascading(lists)
      const result = fc.search(250)
      expect(result).toHaveLength(5)
    })
  })
})
