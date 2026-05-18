import { describe, it, expect } from 'vitest'
import { VanEmdeBoas3 } from '../../src/core/van-emde-boas-3/index.js'

describe('VanEmdeBoas3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty tree with universe size 2', () => {
      const veb = new VanEmdeBoas3(2)
      expect(veb.isEmpty()).toBe(true)
      expect(veb.size).toBe(0)
      expect(veb.min()).toBeUndefined()
      expect(veb.max()).toBeUndefined()
    })

    it('should create an empty tree with universe size 4', () => {
      const veb = new VanEmdeBoas3(4)
      expect(veb.isEmpty()).toBe(true)
      expect(veb.size).toBe(0)
    })

    it('should round up non-power-of-2 to next power of 2', () => {
      const veb = new VanEmdeBoas3(5)
      // universe size rounds to 8; values 0-7 should be valid
      veb.insert(7)
      expect(veb.has(7)).toBe(true)
    })

    it('should handle universe size 1 (rounds to 2)', () => {
      const veb = new VanEmdeBoas3(1)
      veb.insert(0)
      expect(veb.has(0)).toBe(true)
    })

    it('should handle large universe size', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.isEmpty()).toBe(true)
      veb.insert(5)
      veb.insert(10)
      expect(veb.size).toBe(2)
    })
  })

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for a new tree', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.isEmpty()).toBe(false)
    })

    it('should return true after all elements are deleted', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.delete(5)
      expect(veb.isEmpty()).toBe(true)
    })
  })

  // ─── size ───
  describe('size', () => {
    it('should track size correctly', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.size).toBe(0)
      veb.insert(1)
      expect(veb.size).toBe(1)
      veb.insert(2)
      expect(veb.size).toBe(2)
      veb.insert(3)
      expect(veb.size).toBe(3)
    })

    it('should decrement on delete', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(1)
      veb.insert(2)
      veb.delete(1)
      expect(veb.size).toBe(1)
    })

    it('should not change on duplicate insert', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(5)
      expect(veb.size).toBe(1)
    })
  })

  // ─── min / max ───
  describe('min and max', () => {
    it('should return undefined on empty tree', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.min()).toBeUndefined()
      expect(veb.max()).toBeUndefined()
    })

    it('should return the same value for single element', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.min()).toBe(5)
      expect(veb.max()).toBe(5)
    })

    it('should track min and max across multiple inserts', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(10)
      veb.insert(3)
      veb.insert(15)
      veb.insert(7)
      expect(veb.min()).toBe(3)
      expect(veb.max()).toBe(15)
    })

    it('should update min and max after deleting extremes', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(2)
      veb.insert(5)
      veb.insert(10)
      veb.delete(2)
      expect(veb.min()).toBe(5)
      veb.delete(10)
      expect(veb.max()).toBe(5)
    })
  })

  // ─── has ───
  describe('has', () => {
    it('should return false for values in empty tree', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.has(0)).toBe(false)
      expect(veb.has(5)).toBe(false)
    })

    it('should find inserted values', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(0)
      veb.insert(5)
      veb.insert(15)
      expect(veb.has(0)).toBe(true)
      expect(veb.has(5)).toBe(true)
      expect(veb.has(15)).toBe(true)
    })

    it('should return false for non-inserted values', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(0)
      veb.insert(5)
      expect(veb.has(3)).toBe(false)
      expect(veb.has(10)).toBe(false)
    })

    it('should reject out-of-range negative values', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.has(-1)).toBe(false)
    })

    it('should reject values >= universeSize', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.has(16)).toBe(false)
      expect(veb.has(100)).toBe(false)
    })

    it('should work with universe size 2', () => {
      const veb = new VanEmdeBoas3(2)
      veb.insert(0)
      expect(veb.has(0)).toBe(true)
      expect(veb.has(1)).toBe(false)
    })
  })

  // ─── insert ───
  describe('insert', () => {
    it('should insert a single element', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.has(5)).toBe(true)
      expect(veb.size).toBe(1)
    })

    it('should ignore duplicate inserts', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.insert(5)
      expect(veb.size).toBe(1)
    })

    it('should ignore negative values', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(-1)
      expect(veb.size).toBe(0)
    })

    it('should ignore values >= universeSize', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(16)
      expect(veb.size).toBe(0)
    })

    it('should handle inserting 0', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(0)
      expect(veb.has(0)).toBe(true)
      expect(veb.min()).toBe(0)
    })

    it('should handle inserting max valid value', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(15)
      expect(veb.has(15)).toBe(true)
      expect(veb.max()).toBe(15)
    })

    it('should handle many sequential inserts', () => {
      const veb = new VanEmdeBoas3(16)
      for (let i = 0; i < 16; i++) {
        veb.insert(i)
      }
      expect(veb.size).toBe(16)
      expect(veb.min()).toBe(0)
      expect(veb.max()).toBe(15)
    })

    it('should handle reverse-order inserts', () => {
      const veb = new VanEmdeBoas3(16)
      for (let i = 15; i >= 0; i--) {
        veb.insert(i)
      }
      expect(veb.size).toBe(16)
      expect(veb.min()).toBe(0)
      expect(veb.max()).toBe(15)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('should delete the only element', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      veb.delete(5)
      expect(veb.isEmpty()).toBe(true)
      expect(veb.has(5)).toBe(false)
    })

    it('should do nothing when deleting from empty tree', () => {
      const veb = new VanEmdeBoas3(16)
      veb.delete(5)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should do nothing when deleting non-existent value', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(1)
      veb.insert(3)
      veb.delete(2)
      expect(veb.size).toBe(2)
    })

    it('should delete min and update min', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(1)
      veb.insert(5)
      veb.insert(10)
      veb.delete(1)
      expect(veb.min()).toBe(5)
      expect(veb.has(1)).toBe(false)
    })

    it('should delete max and update max', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(1)
      veb.insert(5)
      veb.insert(10)
      veb.delete(10)
      expect(veb.max()).toBe(5)
      expect(veb.has(10)).toBe(false)
    })

    it('should delete middle element', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(1)
      veb.insert(5)
      veb.insert(10)
      veb.delete(5)
      expect(veb.has(5)).toBe(false)
      expect(veb.min()).toBe(1)
      expect(veb.max()).toBe(10)
    })

    it('should handle universe size 2 deletion', () => {
      const veb = new VanEmdeBoas3(2)
      veb.insert(0)
      veb.insert(1)
      veb.delete(0)
      expect(veb.has(0)).toBe(false)
      expect(veb.has(1)).toBe(true)
      expect(veb.min()).toBe(1)
      expect(veb.max()).toBe(1)
    })

    it('should handle deleting all elements one by one', () => {
      const veb = new VanEmdeBoas3(16)
      const values = [3, 7, 1, 12, 0]
      for (const v of values) veb.insert(v)
      for (const v of values) veb.delete(v)
      expect(veb.isEmpty()).toBe(true)
    })

    it('should maintain correct size after deletions', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(1)
      veb.insert(2)
      veb.insert(3)
      veb.insert(4)
      veb.delete(2)
      expect(veb.size).toBe(3)
      veb.delete(1)
      expect(veb.size).toBe(2)
    })
  })

  // ─── successor ───
  describe('successor', () => {
    it('should return undefined for empty tree', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.successor(0)).toBeUndefined()
    })

    it('should return min when value < min', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.successor(0)).toBe(5)
    })

    it('should find successor among inserted values', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(2)
      veb.insert(5)
      veb.insert(10)
      expect(veb.successor(2)).toBe(5)
      expect(veb.successor(5)).toBe(10)
    })

    it('should return undefined if no successor exists', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.successor(5)).toBeUndefined()
    })

    it('should return undefined for out-of-range values', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.successor(-1)).toBeUndefined()
      expect(veb.successor(16)).toBeUndefined()
    })

    it('should work with universe size 2', () => {
      const veb = new VanEmdeBoas3(2)
      veb.insert(0)
      veb.insert(1)
      expect(veb.successor(0)).toBe(1)
      expect(veb.successor(1)).toBeUndefined()
    })

    it('should find successor for value not in tree', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(2)
      veb.insert(8)
      expect(veb.successor(5)).toBe(8)
    })
  })

  // ─── predecessor ───
  describe('predecessor', () => {
    it('should return undefined for empty tree', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.predecessor(0)).toBeUndefined()
    })

    it('should return max when value > max', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.predecessor(10)).toBe(5)
    })

    it('should find predecessor among inserted values', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(2)
      veb.insert(5)
      veb.insert(10)
      expect(veb.predecessor(10)).toBe(5)
      expect(veb.predecessor(5)).toBe(2)
    })

    it('should return undefined if no predecessor exists', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(5)
      expect(veb.predecessor(5)).toBeUndefined()
    })

    it('should return undefined for out-of-range values', () => {
      const veb = new VanEmdeBoas3(16)
      expect(veb.predecessor(-1)).toBeUndefined()
      expect(veb.predecessor(16)).toBeUndefined()
    })

    it('should work with universe size 2', () => {
      const veb = new VanEmdeBoas3(2)
      veb.insert(0)
      veb.insert(1)
      expect(veb.predecessor(1)).toBe(0)
      expect(veb.predecessor(0)).toBeUndefined()
    })

    it('should find predecessor for value not in tree', () => {
      const veb = new VanEmdeBoas3(16)
      veb.insert(2)
      veb.insert(8)
      expect(veb.predecessor(5)).toBe(2)
    })
  })

  // ─── Integration ───
  describe('integration', () => {
    it('should support insert, delete, successor, predecessor cycle', () => {
      const veb = new VanEmdeBoas3(16)
      const values = [0, 2, 5, 9, 14]
      for (const v of values) veb.insert(v)

      expect(veb.size).toBe(5)
      expect(veb.successor(2)).toBe(5)
      expect(veb.predecessor(9)).toBe(5)

      veb.delete(5)
      expect(veb.successor(2)).toBe(9)
      expect(veb.predecessor(9)).toBe(2)
      expect(veb.size).toBe(4)
    })

    it('should handle dense universe (all values)', () => {
      const veb = new VanEmdeBoas3(16)
      for (let i = 0; i < 16; i++) veb.insert(i)
      expect(veb.size).toBe(16)

      for (let i = 0; i < 15; i++) {
        expect(veb.successor(i)).toBe(i + 1)
      }
      for (let i = 15; i > 0; i--) {
        expect(veb.predecessor(i)).toBe(i - 1)
      }
    })
  })
})
