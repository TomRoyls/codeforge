import { describe, it, expect, beforeEach } from 'vitest'
import { K2Tree } from '../../src/core/k2-tree/k2-tree.js'
import { DEFAULT_K } from '../../src/core/k2-tree/types.js'
import type { K2TreeOptions } from '../../src/core/k2-tree/types.js'

describe('K2Tree', () => {
  let tree: K2Tree

  beforeEach(() => {
    tree = new K2Tree(4)
  })

  describe('constructor', () => {
    it('should create an empty tree with default K=2', () => {
      const t = new K2Tree(4)
      expect(t.rows).toBe(4)
      expect(t.cols).toBe(4)
      expect(t.count).toBe(0)
    })

    it('should round up size to next power of K', () => {
      const t = new K2Tree(3)
      expect(t.rows).toBe(4)
      expect(t.cols).toBe(4)
    })

    it('should handle size 0', () => {
      const t = new K2Tree(0)
      expect(t.rows).toBe(2)
      expect(t.cols).toBe(2)
    })

    it('should handle size 1', () => {
      const t = new K2Tree(1)
      expect(t.rows).toBe(2)
      expect(t.cols).toBe(2)
    })

    it('should handle size that is already a power of 2', () => {
      const t = new K2Tree(8)
      expect(t.rows).toBe(8)
      expect(t.cols).toBe(8)
    })

    it('should accept K2TreeOptions', () => {
      const opts: K2TreeOptions = { k: 2 }
      const t = new K2Tree(4, opts)
      expect(t.rows).toBe(4)
    })

    it('should export DEFAULT_K as 2', () => {
      expect(DEFAULT_K).toBe(2)
    })

    it('should start with density 0', () => {
      const t = new K2Tree(4)
      expect(t.density).toBe(0)
    })

    it('should create a 2x2 tree for size 2', () => {
      const t = new K2Tree(2)
      expect(t.rows).toBe(2)
      expect(t.cols).toBe(2)
    })

    it('should handle large size', () => {
      const t = new K2Tree(1024)
      expect(t.rows).toBe(1024)
      expect(t.cols).toBe(1024)
    })
  })

  describe('set and get', () => {
    it('should set and get a single bit', () => {
      tree.set(0, 0, 1)
      expect(tree.get(0, 0)).toBe(1)
    })

    it('should return 0 for unset bits', () => {
      tree.set(0, 0, 1)
      expect(tree.get(0, 1)).toBe(0)
      expect(tree.get(1, 0)).toBe(0)
      expect(tree.get(1, 1)).toBe(0)
    })

    it('should set multiple bits', () => {
      tree.set(0, 0, 1)
      tree.set(1, 2, 1)
      tree.set(3, 3, 1)
      expect(tree.get(0, 0)).toBe(1)
      expect(tree.get(1, 2)).toBe(1)
      expect(tree.get(3, 3)).toBe(1)
      expect(tree.get(0, 1)).toBe(0)
    })

    it('should clear a bit by setting to 0', () => {
      tree.set(0, 0, 1)
      expect(tree.get(0, 0)).toBe(1)
      tree.set(0, 0, 0)
      expect(tree.get(0, 0)).toBe(0)
    })

    it('should be idempotent when setting same value', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 1)
      expect(tree.get(0, 0)).toBe(1)
      expect(tree.count).toBe(1)
    })

    it('should be idempotent when clearing unset bit', () => {
      tree.set(0, 0, 0)
      expect(tree.get(0, 0)).toBe(0)
      expect(tree.count).toBe(0)
    })

    it('should throw for out-of-bounds row', () => {
      expect(() => tree.set(4, 0, 1)).toThrow(RangeError)
    })

    it('should throw for out-of-bounds column', () => {
      expect(() => tree.set(0, 4, 1)).toThrow(RangeError)
    })

    it('should throw for negative row', () => {
      expect(() => tree.set(-1, 0, 1)).toThrow(RangeError)
    })

    it('should throw for negative column', () => {
      expect(() => tree.set(0, -1, 1)).toThrow(RangeError)
    })

    it('should set all bits in a 2x2 tree', () => {
      const t = new K2Tree(2)
      t.set(0, 0, 1)
      t.set(0, 1, 1)
      t.set(1, 0, 1)
      t.set(1, 1, 1)
      expect(t.get(0, 0)).toBe(1)
      expect(t.get(0, 1)).toBe(1)
      expect(t.get(1, 0)).toBe(1)
      expect(t.get(1, 1)).toBe(1)
    })

    it('should handle set and clear repeatedly', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 0)
      tree.set(0, 0, 1)
      expect(tree.get(0, 0)).toBe(1)
      expect(tree.count).toBe(1)
    })

    it('should set bits at corners of 4x4 tree', () => {
      tree.set(0, 0, 1)
      tree.set(0, 3, 1)
      tree.set(3, 0, 1)
      tree.set(3, 3, 1)
      expect(tree.get(0, 0)).toBe(1)
      expect(tree.get(0, 3)).toBe(1)
      expect(tree.get(3, 0)).toBe(1)
      expect(tree.get(3, 3)).toBe(1)
    })

    it('should get out-of-bounds as 0', () => {
      expect(tree.get(4, 0)).toBe(0)
      expect(tree.get(0, 4)).toBe(0)
      expect(tree.get(-1, 0)).toBe(0)
    })

    it('should handle diagonal pattern in 8x8', () => {
      const t = new K2Tree(8)
      for (let i = 0; i < 8; i++) {
        t.set(i, i, 1)
      }
      for (let i = 0; i < 8; i++) {
        expect(t.get(i, i)).toBe(1)
        expect(t.get(i, (i + 1) % 8)).toBe(0)
      }
    })

    it('should clear bit and prune empty subtrees', () => {
      const t = new K2Tree(4)
      t.set(0, 0, 1)
      t.set(0, 1, 1)
      expect(t.count).toBe(2)
      t.set(0, 0, 0)
      t.set(0, 1, 0)
      expect(t.get(0, 0)).toBe(0)
      expect(t.get(0, 1)).toBe(0)
      expect(t.count).toBe(0)
    })

    it('should handle clearing last bit', () => {
      tree.set(2, 2, 1)
      expect(tree.count).toBe(1)
      tree.set(2, 2, 0)
      expect(tree.get(2, 2)).toBe(0)
      expect(tree.count).toBe(0)
    })
  })

  describe('has', () => {
    it('should return true for set bit', () => {
      tree.set(1, 1, 1)
      expect(tree.has(1, 1)).toBe(true)
    })

    it('should return false for unset bit', () => {
      expect(tree.has(0, 0)).toBe(false)
    })

    it('should return false for out-of-bounds', () => {
      expect(tree.has(4, 0)).toBe(false)
      expect(tree.has(0, -1)).toBe(false)
    })

    it('should return false after clearing', () => {
      tree.set(1, 1, 1)
      tree.set(1, 1, 0)
      expect(tree.has(1, 1)).toBe(false)
    })

    it('should return true for bits set in different quadrants', () => {
      tree.set(0, 0, 1)
      tree.set(3, 3, 1)
      expect(tree.has(0, 0)).toBe(true)
      expect(tree.has(3, 3)).toBe(true)
      expect(tree.has(1, 1)).toBe(false)
    })
  })

  describe('count', () => {
    it('should start at 0', () => {
      expect(tree.count).toBe(0)
    })

    it('should increment when setting bit to 1', () => {
      tree.set(0, 0, 1)
      expect(tree.count).toBe(1)
    })

    it('should decrement when setting bit to 0', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 0)
      expect(tree.count).toBe(0)
    })

    it('should count multiple bits correctly', () => {
      tree.set(0, 0, 1)
      tree.set(1, 1, 1)
      tree.set(2, 2, 1)
      expect(tree.count).toBe(3)
    })

    it('should not change on duplicate set', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 1)
      expect(tree.count).toBe(1)
    })

    it('should handle set-clear-set pattern', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 0)
      tree.set(0, 0, 1)
      expect(tree.count).toBe(1)
    })
  })

  describe('density', () => {
    it('should be 0 for empty tree', () => {
      expect(tree.density).toBe(0)
    })

    it('should be 1/16 for single bit in 4x4', () => {
      tree.set(0, 0, 1)
      expect(tree.density).toBeCloseTo(1 / 16)
    })

    it('should be 1 for full matrix', () => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          tree.set(r, c, 1)
        }
      }
      expect(tree.density).toBe(1)
    })

    it('should be count / (rows * cols)', () => {
      tree.set(0, 0, 1)
      tree.set(1, 2, 1)
      expect(tree.density).toBeCloseTo(2 / 16)
    })

    it('should be 0 after clear', () => {
      tree.set(0, 0, 1)
      tree.clear()
      expect(tree.density).toBe(0)
    })

    it('should update after removing bits', () => {
      for (let r = 0; r < 4; r++) {
        tree.set(r, 0, 1)
      }
      expect(tree.density).toBeCloseTo(4 / 16)
      tree.set(0, 0, 0)
      expect(tree.density).toBeCloseTo(3 / 16)
    })
  })

  describe('rows and cols', () => {
    it('should return matrix dimension', () => {
      const t = new K2Tree(4)
      expect(t.rows).toBe(4)
      expect(t.cols).toBe(4)
    })

    it('should return rounded-up dimension', () => {
      const t = new K2Tree(3)
      expect(t.rows).toBe(4)
      expect(t.cols).toBe(4)
    })

    it('should return 2 for size 1', () => {
      const t = new K2Tree(1)
      expect(t.rows).toBe(2)
      expect(t.cols).toBe(2)
    })
  })

  describe('neighbors', () => {
    it('should return empty for empty tree', () => {
      expect(tree.neighbors(0)).toEqual([])
    })

    it('should return columns where bit is 1', () => {
      tree.set(0, 1, 1)
      tree.set(0, 3, 1)
      expect(tree.neighbors(0)).toEqual([1, 3])
    })

    it('should return empty for row with no 1s', () => {
      tree.set(0, 0, 1)
      expect(tree.neighbors(1)).toEqual([])
    })

    it('should return all columns for full row', () => {
      for (let c = 0; c < 4; c++) {
        tree.set(2, c, 1)
      }
      expect(tree.neighbors(2)).toEqual([0, 1, 2, 3])
    })

    it('should return empty for out-of-bounds row', () => {
      expect(tree.neighbors(4)).toEqual([])
      expect(tree.neighbors(-1)).toEqual([])
    })

    it('should handle single bit neighbor', () => {
      tree.set(1, 2, 1)
      expect(tree.neighbors(1)).toEqual([2])
    })

    it('should update after clearing bit', () => {
      tree.set(0, 0, 1)
      tree.set(0, 2, 1)
      expect(tree.neighbors(0)).toEqual([0, 2])
      tree.set(0, 0, 0)
      expect(tree.neighbors(0)).toEqual([2])
    })

    it('should handle neighbors in 8x8 tree', () => {
      const t = new K2Tree(8)
      t.set(3, 0, 1)
      t.set(3, 4, 1)
      t.set(3, 7, 1)
      const nbrs = t.neighbors(3)
      expect(nbrs).toEqual([0, 4, 7])
    })

    it('should handle neighbors across quadrants', () => {
      tree.set(0, 0, 1)
      tree.set(0, 3, 1)
      const nbrs = tree.neighbors(0)
      expect(nbrs).toEqual([0, 3])
    })

    it('should return empty after clear', () => {
      tree.set(0, 0, 1)
      tree.clear()
      expect(tree.neighbors(0)).toEqual([])
    })
  })

  describe('reverseNeighbors', () => {
    it('should return empty for empty tree', () => {
      expect(tree.reverseNeighbors(0)).toEqual([])
    })

    it('should return rows where bit is 1', () => {
      tree.set(0, 1, 1)
      tree.set(2, 1, 1)
      expect(tree.reverseNeighbors(1)).toEqual([0, 2])
    })

    it('should return empty for column with no 1s', () => {
      tree.set(0, 0, 1)
      expect(tree.reverseNeighbors(1)).toEqual([])
    })

    it('should return all rows for full column', () => {
      for (let r = 0; r < 4; r++) {
        tree.set(r, 2, 1)
      }
      expect(tree.reverseNeighbors(2)).toEqual([0, 1, 2, 3])
    })

    it('should return empty for out-of-bounds column', () => {
      expect(tree.reverseNeighbors(4)).toEqual([])
      expect(tree.reverseNeighbors(-1)).toEqual([])
    })

    it('should handle single reverse neighbor', () => {
      tree.set(2, 1, 1)
      expect(tree.reverseNeighbors(1)).toEqual([2])
    })

    it('should update after clearing bit', () => {
      tree.set(0, 0, 1)
      tree.set(2, 0, 1)
      expect(tree.reverseNeighbors(0)).toEqual([0, 2])
      tree.set(0, 0, 0)
      expect(tree.reverseNeighbors(0)).toEqual([2])
    })

    it('should handle reverseNeighbors in 8x8 tree', () => {
      const t = new K2Tree(8)
      t.set(0, 5, 1)
      t.set(4, 5, 1)
      t.set(7, 5, 1)
      expect(t.reverseNeighbors(5)).toEqual([0, 4, 7])
    })

    it('should handle reverseNeighbors across quadrants', () => {
      tree.set(0, 0, 1)
      tree.set(3, 0, 1)
      expect(tree.reverseNeighbors(0)).toEqual([0, 3])
    })

    it('should return empty after clear', () => {
      tree.set(0, 0, 1)
      tree.clear()
      expect(tree.reverseNeighbors(0)).toEqual([])
    })
  })

  describe('clear', () => {
    it('should clear all bits', () => {
      tree.set(0, 0, 1)
      tree.set(1, 1, 1)
      tree.set(2, 2, 1)
      tree.clear()
      expect(tree.count).toBe(0)
      expect(tree.get(0, 0)).toBe(0)
      expect(tree.get(1, 1)).toBe(0)
      expect(tree.get(2, 2)).toBe(0)
    })

    it('should reset density to 0', () => {
      tree.set(0, 0, 1)
      tree.clear()
      expect(tree.density).toBe(0)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.count).toBe(0)
    })

    it('should allow set after clear', () => {
      tree.set(0, 0, 1)
      tree.clear()
      tree.set(1, 1, 1)
      expect(tree.get(1, 1)).toBe(1)
      expect(tree.count).toBe(1)
    })

    it('should handle double clear', () => {
      tree.set(0, 0, 1)
      tree.clear()
      tree.clear()
      expect(tree.count).toBe(0)
    })

    it('should preserve matrix size after clear', () => {
      tree.clear()
      expect(tree.rows).toBe(4)
      expect(tree.cols).toBe(4)
    })
  })

  describe('toArray', () => {
    it('should return all zeros for empty tree', () => {
      const arr = tree.toArray()
      expect(arr.length).toBe(4)
      for (let r = 0; r < 4; r++) {
        expect(arr[r]!.length).toBe(4)
        for (let c = 0; c < 4; c++) {
          expect(arr[r]![c]).toBe(0)
        }
      }
    })

    it('should return correct matrix for single bit', () => {
      tree.set(1, 2, 1)
      const arr = tree.toArray()
      expect(arr[1]![2]).toBe(1)
      expect(arr[0]![0]).toBe(0)
    })

    it('should return all ones for full matrix', () => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          tree.set(r, c, 1)
        }
      }
      const arr = tree.toArray()
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          expect(arr[r]![c]).toBe(1)
        }
      }
    })

    it('should handle diagonal matrix', () => {
      tree.set(0, 0, 1)
      tree.set(1, 1, 1)
      tree.set(2, 2, 1)
      tree.set(3, 3, 1)
      const arr = tree.toArray()
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          expect(arr[r]![c]).toBe(r === c ? 1 : 0)
        }
      }
    })

    it('should return 2x2 for 2x2 tree', () => {
      const t = new K2Tree(2)
      t.set(0, 1, 1)
      const arr = t.toArray()
      expect(arr.length).toBe(2)
      expect(arr[0]).toEqual([0, 1])
      expect(arr[1]).toEqual([0, 0])
    })

    it('should reflect cleared bits', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 0)
      const arr = tree.toArray()
      expect(arr[0]![0]).toBe(0)
    })
  })

  describe('fromMatrix', () => {
    it('should create tree from binary matrix', () => {
      const matrix = [
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 0, 1, 0],
      ]
      const t = K2Tree.fromMatrix(matrix)
      expect(t.get(0, 1)).toBe(1)
      expect(t.get(1, 3)).toBe(1)
      expect(t.get(2, 0)).toBe(1)
      expect(t.get(3, 2)).toBe(1)
      expect(t.get(0, 0)).toBe(0)
      expect(t.count).toBe(4)
    })

    it('should handle empty matrix', () => {
      const t = K2Tree.fromMatrix([])
      expect(t.count).toBe(0)
    })

    it('should handle 1x1 matrix', () => {
      const t = K2Tree.fromMatrix([[1]])
      expect(t.get(0, 0)).toBe(1)
      expect(t.rows).toBe(2)
    })

    it('should handle 2x2 matrix', () => {
      const matrix = [
        [1, 0],
        [0, 1],
      ]
      const t = K2Tree.fromMatrix(matrix)
      expect(t.get(0, 0)).toBe(1)
      expect(t.get(1, 1)).toBe(1)
      expect(t.get(0, 1)).toBe(0)
      expect(t.get(1, 0)).toBe(0)
    })

    it('should handle full matrix', () => {
      const matrix = [
        [1, 1],
        [1, 1],
      ]
      const t = K2Tree.fromMatrix(matrix)
      expect(t.count).toBe(4)
    })

    it('should handle all-zero matrix', () => {
      const matrix = [
        [0, 0],
        [0, 0],
      ]
      const t = K2Tree.fromMatrix(matrix)
      expect(t.count).toBe(0)
    })

    it('should accept options', () => {
      const matrix = [
        [1, 0],
        [0, 0],
      ]
      const t = K2Tree.fromMatrix(matrix, { k: 2 })
      expect(t.get(0, 0)).toBe(1)
    })

    it('should round up non-power-of-2 matrix', () => {
      const matrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]
      const t = K2Tree.fromMatrix(matrix)
      expect(t.rows).toBe(4)
      expect(t.get(0, 0)).toBe(1)
      expect(t.get(1, 1)).toBe(1)
      expect(t.get(2, 2)).toBe(1)
    })

    it('should handle non-square matrix using max dimension', () => {
      const matrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
      ]
      const t = K2Tree.fromMatrix(matrix)
      expect(t.rows).toBe(4)
      expect(t.get(0, 0)).toBe(1)
      expect(t.get(1, 1)).toBe(1)
    })

    it('should roundtrip with toArray', () => {
      const matrix = [
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 0, 1, 0],
      ]
      const t = K2Tree.fromMatrix(matrix)
      const arr = t.toArray()
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          expect(arr[r]![c]).toBe(matrix[r]![c])
        }
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single bit in 2x2 tree', () => {
      const t = new K2Tree(2)
      t.set(0, 0, 1)
      expect(t.get(0, 0)).toBe(1)
      expect(t.count).toBe(1)
      expect(t.neighbors(0)).toEqual([0])
    })

    it('should handle full 2x2 tree', () => {
      const t = new K2Tree(2)
      t.set(0, 0, 1)
      t.set(0, 1, 1)
      t.set(1, 0, 1)
      t.set(1, 1, 1)
      expect(t.count).toBe(4)
      expect(t.density).toBe(1)
    })

    it('should handle sparse matrix with 1 bit in 8x8', () => {
      const t = new K2Tree(8)
      t.set(5, 7, 1)
      expect(t.get(5, 7)).toBe(1)
      expect(t.count).toBe(1)
      expect(t.density).toBeCloseTo(1 / 64)
    })

    it('should handle diagonal 8x8 matrix', () => {
      const t = new K2Tree(8)
      for (let i = 0; i < 8; i++) {
        t.set(i, i, 1)
      }
      expect(t.count).toBe(8)
      for (let r = 0; r < 8; r++) {
        const nbrs = t.neighbors(r)
        expect(nbrs).toEqual([r])
      }
    })

    it('should handle anti-diagonal matrix', () => {
      const t = new K2Tree(4)
      t.set(0, 3, 1)
      t.set(1, 2, 1)
      t.set(2, 1, 1)
      t.set(3, 0, 1)
      for (let r = 0; r < 4; r++) {
        expect(t.get(r, 3 - r)).toBe(1)
        expect(t.get(r, r)).toBe(0)
      }
    })

    it('should handle alternating pattern', () => {
      const t = new K2Tree(4)
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if ((r + c) % 2 === 0) t.set(r, c, 1)
        }
      }
      expect(t.count).toBe(8)
      expect(t.get(0, 0)).toBe(1)
      expect(t.get(0, 1)).toBe(0)
      expect(t.get(1, 0)).toBe(0)
      expect(t.get(1, 1)).toBe(1)
    })

    it('should handle setting all bits then clearing all', () => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          tree.set(r, c, 1)
        }
      }
      expect(tree.count).toBe(16)
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          tree.set(r, c, 0)
        }
      }
      expect(tree.count).toBe(0)
      expect(tree.density).toBe(0)
    })

    it('should handle clear and rebuild', () => {
      tree.set(0, 0, 1)
      tree.set(1, 1, 1)
      tree.clear()
      tree.set(2, 2, 1)
      tree.set(3, 3, 1)
      expect(tree.count).toBe(2)
      expect(tree.get(0, 0)).toBe(0)
      expect(tree.get(2, 2)).toBe(1)
    })

    it('should handle overwriting bit multiple times', () => {
      tree.set(0, 0, 1)
      tree.set(0, 0, 0)
      tree.set(0, 0, 1)
      tree.set(0, 0, 0)
      tree.set(0, 0, 1)
      expect(tree.get(0, 0)).toBe(1)
      expect(tree.count).toBe(1)
    })

    it('should handle first row set', () => {
      for (let c = 0; c < 4; c++) {
        tree.set(0, c, 1)
      }
      expect(tree.neighbors(0)).toEqual([0, 1, 2, 3])
      for (let c = 0; c < 4; c++) {
        expect(tree.reverseNeighbors(c)).toEqual([0])
      }
    })

    it('should handle first column set', () => {
      for (let r = 0; r < 4; r++) {
        tree.set(r, 0, 1)
      }
      for (let r = 0; r < 4; r++) {
        expect(tree.neighbors(r)).toEqual([0])
      }
      expect(tree.reverseNeighbors(0)).toEqual([0, 1, 2, 3])
    })
  })

  describe('graph adjacency use case', () => {
    it('should represent directed graph adjacency matrix', () => {
      const t = new K2Tree(4)
      t.set(0, 1, 1)
      t.set(0, 2, 1)
      t.set(1, 2, 1)
      t.set(2, 0, 1)
      t.set(2, 3, 1)
      t.set(3, 3, 1)
      expect(t.neighbors(0)).toEqual([1, 2])
      expect(t.neighbors(1)).toEqual([2])
      expect(t.neighbors(2)).toEqual([0, 3])
      expect(t.neighbors(3)).toEqual([3])
      expect(t.reverseNeighbors(0)).toEqual([2])
      expect(t.reverseNeighbors(1)).toEqual([0])
      expect(t.reverseNeighbors(2)).toEqual([0, 1])
      expect(t.reverseNeighbors(3)).toEqual([2, 3])
    })

    it('should support edge removal in graph', () => {
      const t = new K2Tree(4)
      t.set(0, 1, 1)
      t.set(0, 2, 1)
      t.set(0, 2, 0)
      expect(t.neighbors(0)).toEqual([1])
    })

    it('should support edge addition after removal', () => {
      const t = new K2Tree(4)
      t.set(0, 1, 1)
      t.set(0, 1, 0)
      t.set(0, 1, 1)
      expect(t.neighbors(0)).toEqual([1])
    })
  })

  describe('stress tests', () => {
    it('should handle 16x16 sparse matrix', () => {
      const t = new K2Tree(16)
      const positions: Array<[number, number]> = [
        [0, 0], [3, 7], [5, 2], [8, 8], [10, 15], [15, 0], [15, 15],
      ]
      for (const [r, c] of positions) {
        t.set(r, c, 1)
      }
      expect(t.count).toBe(positions.length)
      for (const [r, c] of positions) {
        expect(t.get(r, c)).toBe(1)
      }
      expect(t.get(1, 1)).toBe(0)
      expect(t.density).toBeCloseTo(positions.length / 256)
    })

    it('should handle 32x32 diagonal matrix', () => {
      const t = new K2Tree(32)
      for (let i = 0; i < 32; i++) {
        t.set(i, i, 1)
      }
      expect(t.count).toBe(32)
      for (let i = 0; i < 32; i++) {
        expect(t.neighbors(i)).toEqual([i])
        expect(t.reverseNeighbors(i)).toEqual([i])
      }
    })

    it('should handle setting and clearing many bits', () => {
      const t = new K2Tree(8)
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          t.set(r, c, 1)
        }
      }
      expect(t.count).toBe(64)
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (r % 2 === 0) t.set(r, c, 0)
        }
      }
      expect(t.count).toBe(32)
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          expect(t.get(r, c)).toBe(r % 2 === 0 ? 0 : 1)
        }
      }
    })

    it('should handle 64x64 fromMatrix roundtrip', () => {
      const size = 64
      const matrix: number[][] = []
      for (let r = 0; r < size; r++) {
        const row: number[] = []
        for (let c = 0; c < size; c++) {
          row.push(r === c ? 1 : 0)
        }
        matrix.push(row)
      }
      const t = K2Tree.fromMatrix(matrix)
      expect(t.count).toBe(size)
      for (let i = 0; i < size; i++) {
        expect(t.get(i, i)).toBe(1)
        expect(t.get(i, (i + 1) % size)).toBe(0)
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_K', () => {
      expect(DEFAULT_K).toBe(2)
    })

    it('should support K2TreeOptions interface', () => {
      const opts: K2TreeOptions = { k: 2 }
      expect(opts.k).toBe(2)
    })

    it('should support K2TreeOptions without k', () => {
      const opts: K2TreeOptions = {}
      expect(opts.k).toBeUndefined()
    })
  })

  describe('mixed operations', () => {
    it('should handle set-get-clear-set cycle', () => {
      tree.set(0, 0, 1)
      expect(tree.has(0, 0)).toBe(true)
      tree.clear()
      expect(tree.has(0, 0)).toBe(false)
      tree.set(0, 0, 1)
      expect(tree.has(0, 0)).toBe(true)
      expect(tree.count).toBe(1)
    })

    it('should handle neighbors after partial clear', () => {
      tree.set(0, 0, 1)
      tree.set(0, 1, 1)
      tree.set(0, 2, 1)
      tree.set(0, 0, 0)
      expect(tree.neighbors(0)).toEqual([1, 2])
    })

    it('should handle reverseNeighbors after partial clear', () => {
      tree.set(0, 0, 1)
      tree.set(1, 0, 1)
      tree.set(2, 0, 1)
      tree.set(1, 0, 0)
      expect(tree.reverseNeighbors(0)).toEqual([0, 2])
    })

    it('should maintain consistency across operations', () => {
      const t = new K2Tree(8)
      t.set(0, 0, 1)
      t.set(3, 5, 1)
      t.set(7, 7, 1)
      expect(t.count).toBe(3)
      expect(t.neighbors(0)).toEqual([0])
      expect(t.neighbors(3)).toEqual([5])
      expect(t.neighbors(7)).toEqual([7])
      expect(t.reverseNeighbors(0)).toEqual([0])
      expect(t.reverseNeighbors(5)).toEqual([3])
      expect(t.reverseNeighbors(7)).toEqual([7])
    })

    it('should handle toArray after set and clear', () => {
      tree.set(1, 1, 1)
      tree.set(2, 2, 1)
      tree.set(1, 1, 0)
      const arr = tree.toArray()
      expect(arr[1]![1]).toBe(0)
      expect(arr[2]![2]).toBe(1)
    })
  })
})
