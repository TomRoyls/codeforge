import { describe, it, expect } from 'vitest'
import { FenwickTree2D } from '../../../src/utils/fenwick-2d.js'

describe('FenwickTree2D', () => {
  describe('construction', () => {
    it('creates a 2D Fenwick tree', () => {
      const ft = new FenwickTree2D(5, 5)
      expect(ft.query(4, 4)).toBe(0)
    })
  })

  describe('update and query', () => {
    it('updates a single cell', () => {
      const ft = new FenwickTree2D(5, 5)
      ft.update(2, 3, 10)
      expect(ft.query(4, 4)).toBe(10)
    })

    it('accumulates multiple updates', () => {
      const ft = new FenwickTree2D(3, 3)
      ft.update(0, 0, 1)
      ft.update(1, 1, 2)
      ft.update(2, 2, 3)
      expect(ft.query(2, 2)).toBe(6)
    })

    it('handles updates to same cell', () => {
      const ft = new FenwickTree2D(3, 3)
      ft.update(1, 1, 5)
      ft.update(1, 1, 3)
      expect(ft.query(2, 2)).toBe(8)
    })
  })

  describe('rangeQuery', () => {
    it('queries a rectangular region', () => {
      const ft = new FenwickTree2D(5, 5)
      ft.update(1, 1, 10)
      ft.update(2, 2, 20)
      ft.update(3, 3, 30)
      expect(ft.rangeQuery(1, 1, 3, 3)).toBe(60)
    })

    it('excludes cells outside range', () => {
      const ft = new FenwickTree2D(5, 5)
      ft.update(0, 0, 100)
      ft.update(3, 3, 200)
      expect(ft.rangeQuery(1, 1, 2, 2)).toBe(0)
    })

    it('queries single cell', () => {
      const ft = new FenwickTree2D(5, 5)
      ft.update(2, 2, 42)
      expect(ft.rangeQuery(2, 2, 2, 2)).toBe(42)
    })
  })

  describe('get and set', () => {
    it('gets cell value', () => {
      const ft = new FenwickTree2D(4, 4)
      ft.update(1, 2, 15)
      expect(ft.get(1, 2)).toBe(15)
    })

    it('sets cell value', () => {
      const ft = new FenwickTree2D(4, 4)
      ft.update(1, 1, 10)
      ft.set(1, 1, 20)
      expect(ft.get(1, 1)).toBe(20)
    })

    it('set works on uninitialized cell', () => {
      const ft = new FenwickTree2D(4, 4)
      ft.set(2, 3, 50)
      expect(ft.get(2, 3)).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('handles 1x1 grid', () => {
      const ft = new FenwickTree2D(1, 1)
      ft.update(0, 0, 7)
      expect(ft.query(0, 0)).toBe(7)
    })

    it('handles large grid', () => {
      const ft = new FenwickTree2D(100, 100)
      ft.update(50, 50, 1)
      expect(ft.rangeQuery(0, 0, 99, 99)).toBe(1)
    })
  })
})
