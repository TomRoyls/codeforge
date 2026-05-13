import { describe, it, expect } from 'vitest'
import { VEBTree3, DEFAULT_UNIVERSE_SIZE } from '../src/core/van-emde-boas-3/index.js'

describe('VEBTree3', () => {
  describe('constructor', () => {
    it('should create tree with default universe size', () => {
      const tree = new VEBTree3()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should create tree with custom universe size', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      expect(tree.size).toBe(0)
    })

    it('should throw for universe size < 2', () => {
      expect(() => new VEBTree3({ universeSize: 1 })).toThrow()
    })

    it('should throw for non-power-of-2 universe size', () => {
      expect(() => new VEBTree3({ universeSize: 3 })).toThrow()
    })
  })

  describe('insert and has', () => {
    it('should insert and find a value', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(0)).toBe(false)
    })

    it('should insert multiple values', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(15)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(15)).toBe(true)
      expect(tree.has(0)).toBe(false)
      expect(tree.size).toBe(4)
    })

    it('should not insert duplicate values', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('should throw for out of range value', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      expect(() => tree.insert(-1)).toThrow()
      expect(() => tree.insert(16)).toThrow()
    })
  })

  describe('delete', () => {
    it('should delete a value', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size).toBe(0)
    })

    it('should return false for non-existent value', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      expect(tree.delete(5)).toBe(false)
    })

    it('should handle deleting all values', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.delete(3)
      tree.delete(7)
      tree.delete(1)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('min and max', () => {
    it('should return min and max', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(15)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(15)
    })

    it('should return undefined for empty tree', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      expect(tree.min()).toBe(undefined)
      expect(tree.max()).toBe(undefined)
    })
  })

  describe('successor', () => {
    it('should return successor', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.successor(1)).toBe(3)
      expect(tree.successor(3)).toBe(7)
    })

    it('should return undefined for max value', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      expect(tree.successor(7)).toBe(undefined)
    })
  })

  describe('predecessor', () => {
    it('should return predecessor', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.predecessor(7)).toBe(3)
      expect(tree.predecessor(3)).toBe(1)
    })

    it('should return undefined for min value', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      expect(tree.predecessor(1)).toBe(undefined)
    })
  })

  describe('extractMin and extractMax', () => {
    it('should extract min', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.extractMin()).toBe(1)
      expect(tree.size).toBe(2)
      expect(tree.min()).toBe(3)
    })

    it('should extract max', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.extractMax()).toBe(7)
      expect(tree.size).toBe(2)
      expect(tree.max()).toBe(3)
    })

    it('should return undefined for empty tree', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      expect(tree.extractMin()).toBe(undefined)
      expect(tree.extractMax()).toBe(undefined)
    })
  })

  describe('bulkInsert', () => {
    it('should insert multiple values at once', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.bulkInsert([5, 3, 7, 1, 15])
      expect(tree.size).toBe(5)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(15)
    })
  })

  describe('toArray', () => {
    it('should return sorted array', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should return empty array for empty tree', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all values', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([3, 5, 7])
    })
  })

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      tree.insert(3)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const tree = new VEBTree3({ universeSize: 16 })
      tree.insert(5)
      tree.clear()
      tree.insert(10)
      expect(tree.has(10)).toBe(true)
      expect(tree.has(5)).toBe(false)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const tree = new VEBTree3()
      expect(tree.getTimeComplexity()).toContain('log log U')
    })
  })

  describe('large dataset', () => {
    it('should handle 256 values', () => {
      const tree = new VEBTree3()
      for (let i = 0; i < 256; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(256)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(255)
    })
  })

  describe('DEFAULT_UNIVERSE_SIZE', () => {
    it('should be exported', () => {
      expect(DEFAULT_UNIVERSE_SIZE).toBe(256)
    })
  })
})
