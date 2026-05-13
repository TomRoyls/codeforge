import { describe, it, expect } from 'vitest'
import { VanEmdeBoas3 } from '../src/core/van-emde-boas-3/index.js'

describe('VanEmdeBoas3', () => {
  describe('constructor and universe size', () => {
    it('should create tree with power of 2 universe size', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.size).toBe(0)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should round up universe size to next power of 2', async () => {
      const veb = new VanEmdeBoas3(10)
      expect(veb.size).toBe(0)
      veb.insert(0)
      veb.insert(15)
      expect(veb.has(0)).toBe(true)
      expect(veb.has(15)).toBe(true)
    })

    it('should handle minimum universe size of 2', async () => {
      const veb = new VanEmdeBoas3(2)
      expect(veb.size).toBe(0)
      veb.insert(0)
      veb.insert(1)
      expect(veb.size).toBe(2)
    })
  })

  describe('insert', () => {
    it('should insert single value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.size).toBe(1)
      expect(veb.has(5)).toBe(true)
    })

    it('should insert multiple values', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.size).toBe(3)
      expect(veb.has(3)).toBe(true)
      expect(veb.has(7)).toBe(true)
      expect(veb.has(12)).toBe(true)
    })

    it('should handle duplicate inserts', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(5)
      veb.insert(5)
      expect(veb.size).toBe(1)
    })

    it('should ignore values outside universe', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(-1)
      veb.insert(16)
      veb.insert(100)
      expect(veb.size).toBe(0)
    })

    it('should update min and max correctly', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.min()).toBe(5)
      expect(veb.max()).toBe(5)
      veb.insert(10)
      expect(veb.min()).toBe(5)
      expect(veb.max()).toBe(10)
      veb.insert(2)
      expect(veb.min()).toBe(2)
      expect(veb.max()).toBe(10)
    })
  })

  describe('has', () => {
    it('should return true for existing values', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      veb.insert(15)
      expect(veb.has(5)).toBe(true)
      expect(veb.has(10)).toBe(true)
      expect(veb.has(15)).toBe(true)
    })

    it('should return false for non-existing values', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.has(3)).toBe(false)
      expect(veb.has(7)).toBe(false)
      expect(veb.has(10)).toBe(false)
    })

    it('should return false for values outside universe', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.has(-1)).toBe(false)
      expect(veb.has(16)).toBe(false)
    })

    it('should return false for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.has(0)).toBe(false)
      expect(veb.has(8)).toBe(false)
    })
  })

  describe('min', () => {
    it('should return minimum value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(3)
      veb.insert(8)
      expect(veb.min()).toBe(3)
    })

    it('should return undefined for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.min()).toBeUndefined()
    })

    it('should update min after deletion', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(5)
      veb.insert(8)
      veb.delete(3)
      expect(veb.min()).toBe(5)
    })
  })

  describe('max', () => {
    it('should return maximum value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(12)
      veb.insert(8)
      expect(veb.max()).toBe(12)
    })

    it('should return undefined for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.max()).toBeUndefined()
    })

    it('should update max after deletion', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(12)
      veb.insert(8)
      veb.delete(12)
      expect(veb.max()).toBe(8)
    })
  })

  describe('delete', () => {
    it('should delete existing value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.delete(5)
      expect(veb.has(5)).toBe(false)
      expect(veb.size).toBe(0)
    })

    it('should handle deleting non-existing value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.delete(7)
      expect(veb.has(5)).toBe(true)
      expect(veb.size).toBe(1)
    })

    it('should delete from empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.delete(5)
      expect(veb.size).toBe(0)
    })

    it('should update size correctly', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      veb.insert(15)
      veb.delete(10)
      expect(veb.size).toBe(2)
      veb.delete(5)
      expect(veb.size).toBe(1)
      veb.delete(15)
      expect(veb.size).toBe(0)
    })
  })

  describe('successor', () => {
    it('should return next larger value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.successor(3)).toBe(7)
      expect(veb.successor(7)).toBe(12)
    })

    it('should return undefined for max value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.successor(12)).toBeUndefined()
    })

    it('should return undefined for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.successor(5)).toBeUndefined()
    })

    it('should return successor for value not in tree', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      expect(veb.successor(6)).toBe(10)
    })

    it('should return min for value less than min', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      expect(veb.successor(2)).toBe(5)
    })
  })

  describe('predecessor', () => {
    it('should return next smaller value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.predecessor(12)).toBe(7)
      expect(veb.predecessor(7)).toBe(3)
    })

    it('should return undefined for min value', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.predecessor(3)).toBeUndefined()
    })

    it('should return undefined for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.predecessor(5)).toBeUndefined()
    })

    it('should return predecessor for value not in tree', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      expect(veb.predecessor(8)).toBe(5)
    })

    it('should return max for value greater than max', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      expect(veb.predecessor(15)).toBe(10)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should return false for non-empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.isEmpty()).toBe(false)
    })

    it('should return true after deleting all values', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      veb.delete(5)
      veb.delete(10)
      expect(veb.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.size).toBe(0)
    })

    it('should return correct count after insertions', async () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.size).toBe(0)
      veb.insert(5)
      expect(veb.size).toBe(1)
      veb.insert(10)
      expect(veb.size).toBe(2)
      veb.insert(15)
      expect(veb.size).toBe(3)
    })

    it('should return correct count after deletions', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      veb.insert(15)
      expect(veb.size).toBe(3)
      veb.delete(10)
      expect(veb.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle inserting 0', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(0)
      expect(veb.has(0)).toBe(true)
      expect(veb.min()).toBe(0)
    })

    it('should handle inserting universe size - 1', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(15)
      expect(veb.has(15)).toBe(true)
      expect(veb.max()).toBe(15)
    })

    it('should handle single element tree', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(8)
      expect(veb.min()).toBe(8)
      expect(veb.max()).toBe(8)
      expect(veb.successor(5)).toBe(8)
      expect(veb.predecessor(10)).toBe(8)
      veb.delete(8)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should handle two element tree', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(3)
      veb.insert(10)
      expect(veb.min()).toBe(3)
      expect(veb.max()).toBe(10)
      expect(veb.successor(3)).toBe(10)
      expect(veb.predecessor(10)).toBe(3)
    })
  })

  describe('sequential insert and delete', () => {
    it('should handle sequential insertions', async () => {
      const veb = new VanEmdeBoas3(16)
      for (let i = 0; i < 10; i++) {
        veb.insert(i)
      }
      expect(veb.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(veb.has(i)).toBe(true)
      }
    })

    it('should handle sequential deletions', async () => {
      const veb = new VanEmdeBoas3(16)
      for (let i = 0; i < 10; i++) {
        veb.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        veb.delete(i)
      }
      expect(veb.size).toBe(0)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should handle reverse sequential deletions', async () => {
      const veb = new VanEmdeBoas3(16)
      for (let i = 0; i < 10; i++) {
        veb.insert(i)
      }
      for (let i = 9; i >= 0; i--) {
        veb.delete(i)
      }
      expect(veb.size).toBe(0)
    })

    it('should maintain correctness with mixed operations', async () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(10)
      veb.delete(5)
      veb.insert(3)
      veb.insert(8)
      veb.delete(10)
      expect(veb.has(3)).toBe(true)
      expect(veb.has(8)).toBe(true)
      expect(veb.has(5)).toBe(false)
      expect(veb.has(10)).toBe(false)
      expect(veb.size).toBe(2)
    })
  })

  describe('universe size handling', () => {
    it('should work with small universe size', async () => {
      const veb = new VanEmdeBoas3(4)
      veb.insert(0)
      veb.insert(1)
      veb.insert(2)
      veb.insert(3)
      expect(veb.size).toBe(4)
      expect(veb.has(0)).toBe(true)
      expect(veb.has(3)).toBe(true)
    })

    it('should work with large universe size', async () => {
      const veb = new VanEmdeBoas3(256)
      veb.insert(100)
      veb.insert(200)
      veb.insert(50)
      expect(veb.has(100)).toBe(true)
      expect(veb.has(200)).toBe(true)
      expect(veb.has(50)).toBe(true)
    })

    it('should correctly round up universe size', async () => {
      const veb = new VanEmdeBoas3(17)
      veb.insert(31)
      expect(veb.has(31)).toBe(true)
      expect(veb.has(32)).toBe(false)
    })
  })
})
