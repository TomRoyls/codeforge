import { describe, it, expect, beforeEach } from 'vitest'
import { HilbertIndex } from '../../src/core/hilbert-index/hilbert-index.js'
import type { HilbertIndexOptions, Point2D } from '../../src/core/hilbert-index/types.js'

describe('HilbertIndex', () => {
  describe('constructor', () => {
    it('should create with default order 16', () => {
      const h = new HilbertIndex()
      expect(h.order).toBe(16)
    })

    it('should create with no arguments', () => {
      const h = new HilbertIndex()
      expect(h.order).toBe(16)
    })

    it('should create with empty options', () => {
      const h = new HilbertIndex({})
      expect(h.order).toBe(16)
    })

    it('should create with custom order 1', () => {
      const h = new HilbertIndex({ order: 1 })
      expect(h.order).toBe(1)
    })

    it('should create with custom order 2', () => {
      const h = new HilbertIndex({ order: 2 })
      expect(h.order).toBe(2)
    })

    it('should create with custom order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.order).toBe(4)
    })

    it('should create with custom order 8', () => {
      const h = new HilbertIndex({ order: 8 })
      expect(h.order).toBe(8)
    })

    it('should create with custom order 16', () => {
      const h = new HilbertIndex({ order: 16 })
      expect(h.order).toBe(16)
    })
  })

  describe('getters', () => {
    it('should return correct order for order 1', () => {
      const h = new HilbertIndex({ order: 1 })
      expect(h.order).toBe(1)
    })

    it('should return correct sideLength for order 1', () => {
      const h = new HilbertIndex({ order: 1 })
      expect(h.sideLength).toBe(2)
    })

    it('should return correct totalPoints for order 1', () => {
      const h = new HilbertIndex({ order: 1 })
      expect(h.totalPoints).toBe(4)
    })

    it('should return correct sideLength for order 2', () => {
      const h = new HilbertIndex({ order: 2 })
      expect(h.sideLength).toBe(4)
    })

    it('should return correct totalPoints for order 2', () => {
      const h = new HilbertIndex({ order: 2 })
      expect(h.totalPoints).toBe(16)
    })

    it('should return correct sideLength for order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.sideLength).toBe(16)
    })

    it('should return correct totalPoints for order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.totalPoints).toBe(256)
    })

    it('should return correct sideLength for order 8', () => {
      const h = new HilbertIndex({ order: 8 })
      expect(h.sideLength).toBe(256)
    })

    it('should return correct totalPoints for order 8', () => {
      const h = new HilbertIndex({ order: 8 })
      expect(h.totalPoints).toBe(65536)
    })

    it('should return correct sideLength for order 16', () => {
      const h = new HilbertIndex({ order: 16 })
      expect(h.sideLength).toBe(65536)
    })

    it('should return correct totalPoints for order 16', () => {
      const h = new HilbertIndex({ order: 16 })
      expect(h.totalPoints).toBe(4294967296)
    })
  })

  describe('order 1 complete mapping', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 1 })
    })

    it('should map (0,0) to 0', () => {
      expect(h.xy2d(0, 0)).toBe(0)
    })

    it('should map (1,0) to 1', () => {
      expect(h.xy2d(1, 0)).toBe(1)
    })

    it('should map (1,1) to 2', () => {
      expect(h.xy2d(1, 1)).toBe(2)
    })

    it('should map (0,1) to 3', () => {
      expect(h.xy2d(0, 1)).toBe(3)
    })
  })

  describe('order 1 decode', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 1 })
    })

    it('should decode 0 to (0,0)', () => {
      expect(h.d2xy(0)).toEqual({ x: 0, y: 0 })
    })

    it('should decode 1 to (1,0)', () => {
      expect(h.d2xy(1)).toEqual({ x: 1, y: 0 })
    })

    it('should decode 2 to (1,1)', () => {
      expect(h.d2xy(2)).toEqual({ x: 1, y: 1 })
    })

    it('should decode 3 to (0,1)', () => {
      expect(h.d2xy(3)).toEqual({ x: 0, y: 1 })
    })
  })

  describe('order 2 complete mapping', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 2 })
    })

    it('should map (0,0) to 0', () => {
      expect(h.xy2d(0, 0)).toBe(0)
    })

    it('should map (0,1) to 1', () => {
      expect(h.xy2d(0, 1)).toBe(1)
    })

    it('should map (1,1) to 2', () => {
      expect(h.xy2d(1, 1)).toBe(2)
    })

    it('should map (1,0) to 3', () => {
      expect(h.xy2d(1, 0)).toBe(3)
    })

    it('should map (2,0) to 4', () => {
      expect(h.xy2d(2, 0)).toBe(4)
    })

    it('should map (3,0) to 5', () => {
      expect(h.xy2d(3, 0)).toBe(5)
    })

    it('should map (3,1) to 6', () => {
      expect(h.xy2d(3, 1)).toBe(6)
    })

    it('should map (2,1) to 7', () => {
      expect(h.xy2d(2, 1)).toBe(7)
    })

    it('should map (0,2) to 14', () => {
      expect(h.xy2d(0, 2)).toBe(14)
    })

    it('should map (1,2) to 13', () => {
      expect(h.xy2d(1, 2)).toBe(13)
    })

    it('should map (0,3) to 15', () => {
      expect(h.xy2d(0, 3)).toBe(15)
    })

    it('should map (3,3) to 10', () => {
      expect(h.xy2d(3, 3)).toBe(10)
    })

    it('should map (2,3) to 11', () => {
      expect(h.xy2d(2, 3)).toBe(11)
    })

    it('should produce all 16 unique values for order 2 grid', () => {
      const values = new Set<number>()
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          values.add(h.xy2d(x, y))
        }
      }
      expect(values.size).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(values.has(i)).toBe(true)
      }
    })
  })

  describe('order 2 decode complete', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 2 })
    })

    it('should decode 0 to (0,0)', () => {
      expect(h.d2xy(0)).toEqual({ x: 0, y: 0 })
    })

    it('should decode 1 to (0,1)', () => {
      expect(h.d2xy(1)).toEqual({ x: 0, y: 1 })
    })

    it('should decode 2 to (1,1)', () => {
      expect(h.d2xy(2)).toEqual({ x: 1, y: 1 })
    })

    it('should decode 3 to (1,0)', () => {
      expect(h.d2xy(3)).toEqual({ x: 1, y: 0 })
    })

    it('should decode 4 to (2,0)', () => {
      expect(h.d2xy(4)).toEqual({ x: 2, y: 0 })
    })

    it('should decode 5 to (3,0)', () => {
      expect(h.d2xy(5)).toEqual({ x: 3, y: 0 })
    })

    it('should decode 6 to (3,1)', () => {
      expect(h.d2xy(6)).toEqual({ x: 3, y: 1 })
    })

    it('should decode 7 to (2,1)', () => {
      expect(h.d2xy(7)).toEqual({ x: 2, y: 1 })
    })

    it('should decode 10 to (3,3)', () => {
      expect(h.d2xy(10)).toEqual({ x: 3, y: 3 })
    })

    it('should decode 11 to (2,3)', () => {
      expect(h.d2xy(11)).toEqual({ x: 2, y: 3 })
    })
  })

  describe('encode/decode roundtrip at order 4', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 4 })
    })

    it('should roundtrip all 256 points at order 4', () => {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const d = h.xy2d(x, y)
          const p = h.d2xy(d)
          expect(p).toEqual({ x, y })
        }
      }
    })

    it('should produce unique distances for all points at order 4', () => {
      const distances = new Set<number>()
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          distances.add(h.xy2d(x, y))
        }
      }
      expect(distances.size).toBe(256)
    })

    it('should produce distances 0..255 for order 4', () => {
      const distances = new Set<number>()
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          distances.add(h.xy2d(x, y))
        }
      }
      for (let i = 0; i < 256; i++) {
        expect(distances.has(i)).toBe(true)
      }
    })
  })

  describe('adjacent points have nearby indices', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 4 })
    })

    it('should have close indices for (0,0) and (1,0)', () => {
      const d0 = h.xy2d(0, 0)
      const d1 = h.xy2d(1, 0)
      expect(Math.abs(d1 - d0)).toBeLessThanOrEqual(3)
    })

    it('should have close indices for (0,0) and (0,1)', () => {
      const d0 = h.xy2d(0, 0)
      const d1 = h.xy2d(0, 1)
      expect(Math.abs(d1 - d0)).toBeLessThanOrEqual(3)
    })

    it('should have close indices for (1,1) and (0,1)', () => {
      const d0 = h.xy2d(1, 1)
      const d1 = h.xy2d(0, 1)
      expect(Math.abs(d1 - d0)).toBeLessThanOrEqual(3)
    })

    it('should have close indices for (1,1) and (1,0)', () => {
      const d0 = h.xy2d(1, 1)
      const d1 = h.xy2d(1, 0)
      expect(Math.abs(d1 - d0)).toBeLessThanOrEqual(3)
    })

    it('should have close indices for (5,5) and (6,5)', () => {
      const d0 = h.xy2d(5, 5)
      const d1 = h.xy2d(6, 5)
      expect(Math.abs(d1 - d0)).toBeLessThanOrEqual(15)
    })

    it('should have close indices for (5,5) and (5,6)', () => {
      const d0 = h.xy2d(5, 5)
      const d1 = h.xy2d(5, 6)
      expect(Math.abs(d1 - d0)).toBeLessThanOrEqual(15)
    })

    it('should have all 2x2 block indices within range 0-3 at order 1', () => {
      const h1 = new HilbertIndex({ order: 1 })
      const indices = [
        h1.xy2d(0, 0),
        h1.xy2d(1, 0),
        h1.xy2d(1, 1),
        h1.xy2d(0, 1),
      ]
      for (const d of indices) {
        expect(d).toBeGreaterThanOrEqual(0)
        expect(d).toBeLessThanOrEqual(3)
      }
    })
  })

  describe('isValidPoint', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 4 })
    })

    it('should return true for (0,0)', () => {
      expect(h.isValidPoint(0, 0)).toBe(true)
    })

    it('should return true for (15,15) at order 4', () => {
      expect(h.isValidPoint(15, 15)).toBe(true)
    })

    it('should return true for (0,15)', () => {
      expect(h.isValidPoint(0, 15)).toBe(true)
    })

    it('should return true for (15,0)', () => {
      expect(h.isValidPoint(15, 0)).toBe(true)
    })

    it('should return false for (16,0) at order 4', () => {
      expect(h.isValidPoint(16, 0)).toBe(false)
    })

    it('should return false for (0,16) at order 4', () => {
      expect(h.isValidPoint(0, 16)).toBe(false)
    })

    it('should return false for (-1,0)', () => {
      expect(h.isValidPoint(-1, 0)).toBe(false)
    })

    it('should return false for (0,-1)', () => {
      expect(h.isValidPoint(0, -1)).toBe(false)
    })

    it('should return false for (-1,-1)', () => {
      expect(h.isValidPoint(-1, -1)).toBe(false)
    })
  })

  describe('isValidDistance', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 4 })
    })

    it('should return true for 0', () => {
      expect(h.isValidDistance(0)).toBe(true)
    })

    it('should return true for 255 at order 4', () => {
      expect(h.isValidDistance(255)).toBe(true)
    })

    it('should return true for 128', () => {
      expect(h.isValidDistance(128)).toBe(true)
    })

    it('should return false for 256 at order 4', () => {
      expect(h.isValidDistance(256)).toBe(false)
    })

    it('should return false for -1', () => {
      expect(h.isValidDistance(-1)).toBe(false)
    })

    it('should return false for negative distance', () => {
      expect(h.isValidDistance(-100)).toBe(false)
    })
  })

  describe('encode (alias)', () => {
    it('should return same result as xy2d', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.encode(0, 0)).toBe(h.xy2d(0, 0))
    })

    it('should return same result as xy2d for (5,7)', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.encode(5, 7)).toBe(h.xy2d(5, 7))
    })

    it('should return same result as xy2d for (15,15)', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.encode(15, 15)).toBe(h.xy2d(15, 15))
    })
  })

  describe('decode (alias)', () => {
    it('should return same result as d2xy', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.decode(0)).toEqual(h.d2xy(0))
    })

    it('should return same result as d2xy for d=100', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.decode(100)).toEqual(h.d2xy(100))
    })

    it('should return same result as d2xy for d=255', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.decode(255)).toEqual(h.d2xy(255))
    })
  })

  describe('encodeRange', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 4 })
    })

    it('should return 1 code for point range', () => {
      const codes = h.encodeRange(0, 0, 0, 0)
      expect(codes).toHaveLength(1)
      expect(codes[0]).toBe(0)
    })

    it('should return 4 codes for 2x2 range', () => {
      const codes = h.encodeRange(0, 0, 1, 1)
      expect(codes).toHaveLength(4)
    })

    it('should return sorted codes', () => {
      const codes = h.encodeRange(0, 0, 3, 3)
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i]).toBeGreaterThan(codes[i - 1]!)
      }
    })

    it('should return 16 codes for 4x4 range', () => {
      const codes = h.encodeRange(0, 0, 3, 3)
      expect(codes).toHaveLength(16)
    })

    it('should handle reversed coordinates', () => {
      const codes = h.encodeRange(1, 1, 0, 0)
      expect(codes).toHaveLength(4)
    })

    it('should return all unique codes', () => {
      const codes = h.encodeRange(0, 0, 3, 3)
      const unique = new Set(codes)
      expect(unique.size).toBe(codes.length)
    })

    it('should handle single row', () => {
      const codes = h.encodeRange(0, 0, 3, 0)
      expect(codes).toHaveLength(4)
    })

    it('should handle single column', () => {
      const codes = h.encodeRange(0, 0, 0, 3)
      expect(codes).toHaveLength(4)
    })

    it('should handle asymmetric rectangle', () => {
      const codes = h.encodeRange(2, 2, 4, 5)
      expect(codes).toHaveLength(12)
    })
  })

  describe('boundary points', () => {
    it('should handle origin (0,0) at order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      expect(h.xy2d(0, 0)).toBe(0)
    })

    it('should handle maximum point at order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      const d = h.xy2d(15, 15)
      const p = h.d2xy(d)
      expect(p).toEqual({ x: 15, y: 15 })
    })

    it('should handle maximum point at order 1', () => {
      const h = new HilbertIndex({ order: 1 })
      const d = h.xy2d(1, 1)
      const p = h.d2xy(d)
      expect(p).toEqual({ x: 1, y: 1 })
    })

    it('should handle maximum point at order 2', () => {
      const h = new HilbertIndex({ order: 2 })
      const d = h.xy2d(3, 3)
      const p = h.d2xy(d)
      expect(p).toEqual({ x: 3, y: 3 })
    })

    it('should handle (0, max) at order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      const d = h.xy2d(0, 15)
      const p = h.d2xy(d)
      expect(p).toEqual({ x: 0, y: 15 })
    })

    it('should handle (max, 0) at order 4', () => {
      const h = new HilbertIndex({ order: 4 })
      const d = h.xy2d(15, 0)
      const p = h.d2xy(d)
      expect(p).toEqual({ x: 15, y: 0 })
    })
  })

  describe('error handling', () => {
    let h: HilbertIndex

    beforeEach(() => {
      h = new HilbertIndex({ order: 4 })
    })

    it('should throw on negative x', () => {
      expect(() => h.xy2d(-1, 0)).toThrow()
    })

    it('should throw on negative y', () => {
      expect(() => h.xy2d(0, -1)).toThrow()
    })

    it('should throw on x exceeding sideLength', () => {
      expect(() => h.xy2d(16, 0)).toThrow()
    })

    it('should throw on y exceeding sideLength', () => {
      expect(() => h.xy2d(0, 16)).toThrow()
    })

    it('should throw on negative distance', () => {
      expect(() => h.d2xy(-1)).toThrow()
    })

    it('should throw on distance exceeding totalPoints', () => {
      expect(() => h.d2xy(256)).toThrow()
    })
  })

  describe('roundtrip at various orders', () => {
    it('should roundtrip all points at order 1', () => {
      const h = new HilbertIndex({ order: 1 })
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const d = h.xy2d(x, y)
          const p = h.d2xy(d)
          expect(p).toEqual({ x, y })
        }
      }
    })

    it('should roundtrip all points at order 2', () => {
      const h = new HilbertIndex({ order: 2 })
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const d = h.xy2d(x, y)
          const p = h.d2xy(d)
          expect(p).toEqual({ x, y })
        }
      }
    })

    it('should roundtrip all points at order 3', () => {
      const h = new HilbertIndex({ order: 3 })
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const d = h.xy2d(x, y)
          const p = h.d2xy(d)
          expect(p).toEqual({ x, y })
        }
      }
    })

    it('should roundtrip all points at order 5', () => {
      const h = new HilbertIndex({ order: 5 })
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const d = h.xy2d(x, y)
          const p = h.d2xy(d)
          expect(p).toEqual({ x, y })
        }
      }
    })

    it('should roundtrip specific points at order 8', () => {
      const h = new HilbertIndex({ order: 8 })
      const testPoints = [
        [0, 0], [1, 0], [0, 1], [1, 1],
        [100, 200], [255, 255], [127, 128],
        [50, 50], [200, 100],
      ]
      for (const [x, y] of testPoints) {
        const d = h.xy2d(x, y)
        const p = h.d2xy(d)
        expect(p).toEqual({ x, y })
      }
    })
  })

  describe('spatial locality', () => {
    it('should preserve locality: close points should have close indices', () => {
      const h = new HilbertIndex({ order: 4 })
      let maxAdjacentDiff = 0
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          const d = h.xy2d(x, y)
          const dRight = h.xy2d(x + 1, y)
          const dDown = h.xy2d(x, y + 1)
          maxAdjacentDiff = Math.max(maxAdjacentDiff, Math.abs(dRight - d))
          maxAdjacentDiff = Math.max(maxAdjacentDiff, Math.abs(dDown - d))
        }
      }
      expect(maxAdjacentDiff).toBeLessThan(256)
    })

    it('should have better locality than random ordering', () => {
      const h = new HilbertIndex({ order: 4 })
      let totalHilbertDiff = 0
      let count = 0
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (x + 1 < 16) {
            totalHilbertDiff += Math.abs(h.xy2d(x + 1, y) - h.xy2d(x, y))
            count++
          }
          if (y + 1 < 16) {
            totalHilbertDiff += Math.abs(h.xy2d(x, y + 1) - h.xy2d(x, y))
            count++
          }
        }
      }
      const avgDiff = totalHilbertDiff / count
      expect(avgDiff).toBeLessThan(30)
    })
  })

  describe('type exports', () => {
    it('should support Point2D type', () => {
      const p: Point2D = { x: 1, y: 2 }
      expect(p.x).toBe(1)
      expect(p.y).toBe(2)
    })

    it('should support HilbertIndexOptions type', () => {
      const opts: HilbertIndexOptions = { order: 4 }
      const h = new HilbertIndex(opts)
      expect(h.order).toBe(4)
    })
  })
})
