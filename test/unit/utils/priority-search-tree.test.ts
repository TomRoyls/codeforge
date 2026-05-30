import { describe, it, expect } from 'vitest'
import { PrioritySearchTree } from '../../../src/utils/priority-search-tree.js'

describe('PrioritySearchTree', () => {
  describe('insert and query', () => {
    it('finds points in range', () => {
      const pst = new PrioritySearchTree()
      pst.insert(5, 10, 'a')
      pst.insert(15, 20, 'b')
      pst.insert(25, 5, 'c')
      const result = pst.query(0, 20, 15)
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('a')
    })

    it('returns empty for no matches', () => {
      const pst = new PrioritySearchTree()
      pst.insert(50, 50, 'far')
      const result = pst.query(0, 10, 10)
      expect(result).toEqual([])
    })

    it('finds multiple points', () => {
      const pst = new PrioritySearchTree()
      pst.insert(1, 5, 'a')
      pst.insert(3, 3, 'b')
      pst.insert(5, 7, 'c')
      pst.insert(7, 2, 'd')
      const result = pst.query(0, 10, 5)
      expect(result.length).toBe(3)
    })
  })

  describe('2D range queries', () => {
    it('handles spatial data', () => {
      const pst = new PrioritySearchTree()
      pst.insert(2, 8, 'p1')
      pst.insert(4, 6, 'p2')
      pst.insert(6, 4, 'p3')
      pst.insert(8, 2, 'p4')
      const result = pst.query(1, 5, 9)
      expect(result.map(r => r.data).sort()).toEqual(['p1', 'p2'])
    })
  })

  describe('edge cases', () => {
    it('handles empty tree', () => {
      const pst = new PrioritySearchTree()
      expect(pst.query(0, 100, 100)).toEqual([])
    })

    it('handles single point in range', () => {
      const pst = new PrioritySearchTree()
      pst.insert(5, 5, 'center')
      expect(pst.query(0, 10, 10)).toEqual([{ x: 5, y: 5, data: 'center' }])
    })

    it('handles point on boundary', () => {
      const pst = new PrioritySearchTree()
      pst.insert(5, 10, 'boundary')
      expect(pst.query(5, 5, 10).length).toBe(1)
    })
  })
})
