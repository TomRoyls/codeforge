import { describe, it, expect, beforeEach } from 'vitest'
import { K2Tree2 } from '../../src/core/k2-tree-2/index.js'

describe('K2Tree2', () => {
  let tree: K2Tree2

  beforeEach(() => {
    tree = new K2Tree2(4)
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create tree with default size 16', () => {
      const t = new K2Tree2()
      expect(t.getMatrixSize()).toBe(16)
    })

    it('should create tree with specified size', () => {
      const t = new K2Tree2(8)
      expect(t.getMatrixSize()).toBe(8)
    })

    it('should throw for non-power-of-2 size', () => {
      expect(() => new K2Tree2(3)).toThrow('Size must be a power of 2')
      expect(() => new K2Tree2(5)).toThrow('Size must be a power of 2')
    })

    it('should throw for size 0', () => {
      expect(() => new K2Tree2(0)).toThrow('Size must be a power of 2')
    })

    it('should throw for negative size', () => {
      expect(() => new K2Tree2(-4)).toThrow('Size must be a power of 2')
    })

    it('should accept size 1', () => {
      const t = new K2Tree2(1)
      expect(t.getMatrixSize()).toBe(1)
    })

    it('should accept size 2', () => {
      const t = new K2Tree2(2)
      expect(t.getMatrixSize()).toBe(2)
    })
  })

  // ─── set/get ───

  describe('set and get', () => {
    it('should set and get a bit', () => {
      tree.set(0, 0)
      expect(tree.get(0, 0)).toBe(true)
    })

    it('should return false for unset bits', () => {
      expect(tree.get(0, 0)).toBe(false)
      expect(tree.get(1, 2)).toBe(false)
    })

    it('should set multiple bits', () => {
      tree.set(0, 0)
      tree.set(1, 3)
      tree.set(3, 2)
      expect(tree.get(0, 0)).toBe(true)
      expect(tree.get(1, 3)).toBe(true)
      expect(tree.get(3, 2)).toBe(true)
      expect(tree.get(2, 2)).toBe(false)
    })

    it('should throw for out of bounds row', () => {
      expect(() => tree.set(4, 0)).toThrow('Index out of bounds')
      expect(() => tree.get(-1, 0)).toThrow('Index out of bounds')
    })

    it('should throw for out of bounds col', () => {
      expect(() => tree.set(0, 4)).toThrow('Index out of bounds')
      expect(() => tree.get(0, -1)).toThrow('Index out of bounds')
    })

    it('should set bit at last valid index', () => {
      tree.set(3, 3)
      expect(tree.get(3, 3)).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear a set bit', () => {
      tree.set(0, 0)
      tree.clear(0, 0)
      expect(tree.get(0, 0)).toBe(false)
    })

    it('should be no-op for already clear bit', () => {
      tree.clear(0, 0)
      expect(tree.get(0, 0)).toBe(false)
    })

    it('should not affect other bits', () => {
      tree.set(0, 0)
      tree.set(1, 1)
      tree.clear(0, 0)
      expect(tree.get(0, 0)).toBe(false)
      expect(tree.get(1, 1)).toBe(true)
    })
  })

  // ─── toggle ───

  describe('toggle', () => {
    it('should set an unset bit', () => {
      tree.toggle(0, 0)
      expect(tree.get(0, 0)).toBe(true)
    })

    it('should clear a set bit', () => {
      tree.set(0, 0)
      tree.toggle(0, 0)
      expect(tree.get(0, 0)).toBe(false)
    })

    it('should toggle back and forth', () => {
      expect(tree.get(2, 2)).toBe(false)
      tree.toggle(2, 2)
      expect(tree.get(2, 2)).toBe(true)
      tree.toggle(2, 2)
      expect(tree.get(2, 2)).toBe(false)
    })
  })

  // ─── row ───

  describe('row', () => {
    it('should return empty array for empty row', () => {
      expect(tree.row(0)).toEqual([])
    })

    it('should return set columns in a row', () => {
      tree.set(1, 0)
      tree.set(1, 2)
      tree.set(1, 3)
      expect(tree.row(1)).toEqual([0, 2, 3])
    })

    it('should throw for out of bounds row', () => {
      expect(() => tree.row(4)).toThrow('Index out of bounds')
      expect(() => tree.row(-1)).toThrow('Index out of bounds')
    })
  })

  // ─── col ───

  describe('col', () => {
    it('should return empty array for empty column', () => {
      expect(tree.col(0)).toEqual([])
    })

    it('should return set rows in a column', () => {
      tree.set(0, 1)
      tree.set(2, 1)
      tree.set(3, 1)
      expect(tree.col(1)).toEqual([0, 2, 3])
    })

    it('should throw for out of bounds col', () => {
      expect(() => tree.col(4)).toThrow('Index out of bounds')
      expect(() => tree.col(-1)).toThrow('Index out of bounds')
    })
  })

  // ─── count ───

  describe('count', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.count()).toBe(0)
    })

    it('should count set bits', () => {
      tree.set(0, 0)
      tree.set(1, 2)
      tree.set(3, 3)
      expect(tree.count()).toBe(3)
    })

    it('should update after clear', () => {
      tree.set(0, 0)
      tree.set(1, 1)
      tree.clear(0, 0)
      expect(tree.count()).toBe(1)
    })
  })

  // ─── isEmpty ───

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after set', () => {
      tree.set(0, 0)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing all bits', () => {
      tree.set(0, 0)
      tree.clear(0, 0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return all-false matrix for empty tree', () => {
      const matrix = tree.toArray()
      expect(matrix).toHaveLength(4)
      for (const row of matrix) {
        expect(row.every(c => c === false)).toBe(true)
      }
    })

    it('should reflect set bits', () => {
      tree.set(0, 0)
      tree.set(2, 3)
      const matrix = tree.toArray()
      expect(matrix[0]![0]).toBe(true)
      expect(matrix[2]![3]).toBe(true)
      expect(matrix[1]![1]).toBe(false)
    })
  })

  // ─── Fill entire matrix ───

  describe('full matrix', () => {
    it('should handle setting all bits in a 2x2 tree', () => {
      const t = new K2Tree2(2)
      t.set(0, 0)
      t.set(0, 1)
      t.set(1, 0)
      t.set(1, 1)
      expect(t.count()).toBe(4)
      expect(t.isEmpty()).toBe(false)
    })

    it('should handle clearing from fully set 2x2', () => {
      const t = new K2Tree2(2)
      t.set(0, 0)
      t.set(0, 1)
      t.set(1, 0)
      t.set(1, 1)
      t.clear(0, 0)
      expect(t.get(0, 0)).toBe(false)
      expect(t.get(0, 1)).toBe(true)
      expect(t.count()).toBe(3)
    })
  })
})
