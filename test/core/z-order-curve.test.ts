import { describe, it, expect, beforeEach } from 'vitest'
import { ZOrderCurve } from '../../src/core/z-order-curve/z-order-curve.js'
import type { Point2D, Point3D, ZOrderCurveOptions } from '../../src/core/z-order-curve/types.js'

describe('ZOrderCurve', () => {
  describe('constructor', () => {
    it('should create with default bits=16', () => {
      const z = new ZOrderCurve()
      expect(z.bits).toBe(16)
    })

    it('should create with default dimensions=2', () => {
      const z = new ZOrderCurve()
      expect(z.dimensions).toBe(2)
    })

    it('should create with custom bits', () => {
      const z = new ZOrderCurve({ bits: 8 })
      expect(z.bits).toBe(8)
    })

    it('should create with custom dimensions', () => {
      const z = new ZOrderCurve({ dimensions: 3 })
      expect(z.dimensions).toBe(3)
    })

    it('should create with both custom options', () => {
      const z = new ZOrderCurve({ bits: 10, dimensions: 3 })
      expect(z.bits).toBe(10)
      expect(z.dimensions).toBe(3)
    })

    it('should create with no arguments', () => {
      const z = new ZOrderCurve()
      expect(z.bits).toBe(16)
      expect(z.dimensions).toBe(2)
    })

    it('should create with empty options', () => {
      const z = new ZOrderCurve({})
      expect(z.bits).toBe(16)
      expect(z.dimensions).toBe(2)
    })
  })

  describe('encode2D known values', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should encode (0, 0) to 0', () => {
      expect(z.encode2D(0, 0)).toBe(0n)
    })

    it('should encode (1, 0) to 1', () => {
      expect(z.encode2D(1, 0)).toBe(1n)
    })

    it('should encode (0, 1) to 2', () => {
      expect(z.encode2D(0, 1)).toBe(2n)
    })

    it('should encode (1, 1) to 3', () => {
      expect(z.encode2D(1, 1)).toBe(3n)
    })

    it('should encode (2, 0) to 4', () => {
      expect(z.encode2D(2, 0)).toBe(4n)
    })

    it('should encode (3, 0) to 5', () => {
      expect(z.encode2D(3, 0)).toBe(5n)
    })

    it('should encode (2, 1) to 6', () => {
      expect(z.encode2D(2, 1)).toBe(6n)
    })

    it('should encode (3, 1) to 7', () => {
      expect(z.encode2D(3, 1)).toBe(7n)
    })

    it('should encode (0, 2) to 8', () => {
      expect(z.encode2D(0, 2)).toBe(8n)
    })

    it('should encode (0, 3) to 10', () => {
      expect(z.encode2D(0, 3)).toBe(10n)
    })

    it('should encode (2, 2) to 12', () => {
      expect(z.encode2D(2, 2)).toBe(12n)
    })

    it('should encode (3, 3) to 15', () => {
      expect(z.encode2D(3, 3)).toBe(15n)
    })
  })

  describe('decode2D known values', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should decode 0 to (0, 0)', () => {
      expect(z.decode2D(0n)).toEqual({ x: 0, y: 0 })
    })

    it('should decode 1 to (1, 0)', () => {
      expect(z.decode2D(1n)).toEqual({ x: 1, y: 0 })
    })

    it('should decode 2 to (0, 1)', () => {
      expect(z.decode2D(2n)).toEqual({ x: 0, y: 1 })
    })

    it('should decode 3 to (1, 1)', () => {
      expect(z.decode2D(3n)).toEqual({ x: 1, y: 1 })
    })

    it('should decode 4 to (2, 0)', () => {
      expect(z.decode2D(4n)).toEqual({ x: 2, y: 0 })
    })

    it('should decode 5 to (3, 0)', () => {
      expect(z.decode2D(5n)).toEqual({ x: 3, y: 0 })
    })

    it('should decode 6 to (2, 1)', () => {
      expect(z.decode2D(6n)).toEqual({ x: 2, y: 1 })
    })

    it('should decode 7 to (3, 1)', () => {
      expect(z.decode2D(7n)).toEqual({ x: 3, y: 1 })
    })
  })

  describe('encode2D/decode2D roundtrip', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should roundtrip (0, 0)', () => {
      const code = z.encode2D(0, 0)
      expect(z.decode2D(code)).toEqual({ x: 0, y: 0 })
    })

    it('should roundtrip (1, 0)', () => {
      const code = z.encode2D(1, 0)
      expect(z.decode2D(code)).toEqual({ x: 1, y: 0 })
    })

    it('should roundtrip (0, 1)', () => {
      const code = z.encode2D(0, 1)
      expect(z.decode2D(code)).toEqual({ x: 0, y: 1 })
    })

    it('should roundtrip (5, 3)', () => {
      const code = z.encode2D(5, 3)
      expect(z.decode2D(code)).toEqual({ x: 5, y: 3 })
    })

    it('should roundtrip (10, 20)', () => {
      const code = z.encode2D(10, 20)
      expect(z.decode2D(code)).toEqual({ x: 10, y: 20 })
    })

    it('should roundtrip (100, 200)', () => {
      const code = z.encode2D(100, 200)
      expect(z.decode2D(code)).toEqual({ x: 100, y: 200 })
    })

    it('should roundtrip (0, 15)', () => {
      const code = z.encode2D(0, 15)
      expect(z.decode2D(code)).toEqual({ x: 0, y: 15 })
    })

    it('should roundtrip (15, 0)', () => {
      const code = z.encode2D(15, 0)
      expect(z.decode2D(code)).toEqual({ x: 15, y: 0 })
    })

    it('should roundtrip (7, 7)', () => {
      const code = z.encode2D(7, 7)
      expect(z.decode2D(code)).toEqual({ x: 7, y: 7 })
    })

    it('should roundtrip (255, 255)', () => {
      const code = z.encode2D(255, 255)
      expect(z.decode2D(code)).toEqual({ x: 255, y: 255 })
    })

    it('should roundtrip (65535, 0)', () => {
      const code = z.encode2D(65535, 0)
      expect(z.decode2D(code)).toEqual({ x: 65535, y: 0 })
    })

    it('should roundtrip (0, 65535)', () => {
      const code = z.encode2D(0, 65535)
      expect(z.decode2D(code)).toEqual({ x: 0, y: 65535 })
    })
  })

  describe('encode3D known values', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should encode (0, 0, 0) to 0', () => {
      expect(z.encode3D(0, 0, 0)).toBe(0n)
    })

    it('should encode (1, 0, 0) to 1', () => {
      expect(z.encode3D(1, 0, 0)).toBe(1n)
    })

    it('should encode (0, 1, 0) to 2', () => {
      expect(z.encode3D(0, 1, 0)).toBe(2n)
    })

    it('should encode (0, 0, 1) to 4', () => {
      expect(z.encode3D(0, 0, 1)).toBe(4n)
    })

    it('should encode (1, 1, 0) to 3', () => {
      expect(z.encode3D(1, 1, 0)).toBe(3n)
    })

    it('should encode (1, 0, 1) to 5', () => {
      expect(z.encode3D(1, 0, 1)).toBe(5n)
    })

    it('should encode (0, 1, 1) to 6', () => {
      expect(z.encode3D(0, 1, 1)).toBe(6n)
    })

    it('should encode (1, 1, 1) to 7', () => {
      expect(z.encode3D(1, 1, 1)).toBe(7n)
    })
  })

  describe('decode3D known values', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should decode 0 to (0, 0, 0)', () => {
      expect(z.decode3D(0n)).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('should decode 1 to (1, 0, 0)', () => {
      expect(z.decode3D(1n)).toEqual({ x: 1, y: 0, z: 0 })
    })

    it('should decode 2 to (0, 1, 0)', () => {
      expect(z.decode3D(2n)).toEqual({ x: 0, y: 1, z: 0 })
    })

    it('should decode 4 to (0, 0, 1)', () => {
      expect(z.decode3D(4n)).toEqual({ x: 0, y: 0, z: 1 })
    })

    it('should decode 7 to (1, 1, 1)', () => {
      expect(z.decode3D(7n)).toEqual({ x: 1, y: 1, z: 1 })
    })

    it('should decode 3 to (1, 1, 0)', () => {
      expect(z.decode3D(3n)).toEqual({ x: 1, y: 1, z: 0 })
    })
  })

  describe('encode3D/decode3D roundtrip', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should roundtrip (0, 0, 0)', () => {
      const code = z.encode3D(0, 0, 0)
      expect(z.decode3D(code)).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('should roundtrip (1, 2, 3)', () => {
      const code = z.encode3D(1, 2, 3)
      expect(z.decode3D(code)).toEqual({ x: 1, y: 2, z: 3 })
    })

    it('should roundtrip (5, 10, 15)', () => {
      const code = z.encode3D(5, 10, 15)
      expect(z.decode3D(code)).toEqual({ x: 5, y: 10, z: 15 })
    })

    it('should roundtrip (7, 7, 7)', () => {
      const code = z.encode3D(7, 7, 7)
      expect(z.decode3D(code)).toEqual({ x: 7, y: 7, z: 7 })
    })

    it('should roundtrip (0, 0, 255)', () => {
      const code = z.encode3D(0, 0, 255)
      expect(z.decode3D(code)).toEqual({ x: 0, y: 0, z: 255 })
    })

    it('should roundtrip (255, 0, 0)', () => {
      const code = z.encode3D(255, 0, 0)
      expect(z.decode3D(code)).toEqual({ x: 255, y: 0, z: 0 })
    })

    it('should roundtrip (100, 200, 50)', () => {
      const code = z.encode3D(100, 200, 50)
      expect(z.decode3D(code)).toEqual({ x: 100, y: 200, z: 50 })
    })

    it('should roundtrip (0, 100, 0)', () => {
      const code = z.encode3D(0, 100, 0)
      expect(z.decode3D(code)).toEqual({ x: 0, y: 100, z: 0 })
    })
  })

  describe('adjacent points have close codes', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should have close codes for (0,0) and (1,0)', () => {
      const c0 = z.encode2D(0, 0)
      const c1 = z.encode2D(1, 0)
      expect(Number(c1 - c0)).toBeLessThanOrEqual(3)
    })

    it('should have close codes for (0,0) and (0,1)', () => {
      const c0 = z.encode2D(0, 0)
      const c1 = z.encode2D(0, 1)
      expect(Number(c1 - c0)).toBeLessThanOrEqual(3)
    })

    it('should have close codes for (1,1) and (0,1)', () => {
      const c0 = z.encode2D(1, 1)
      const c1 = z.encode2D(0, 1)
      expect(Math.abs(Number(c1 - c0))).toBeLessThanOrEqual(3)
    })

    it('should have close codes for (1,1) and (1,0)', () => {
      const c0 = z.encode2D(1, 1)
      const c1 = z.encode2D(1, 0)
      expect(Math.abs(Number(c1 - c0))).toBeLessThanOrEqual(3)
    })

    it('should have all 2x2 block codes within range 0-3', () => {
      const codes = [
        z.encode2D(0, 0),
        z.encode2D(1, 0),
        z.encode2D(0, 1),
        z.encode2D(1, 1),
      ]
      for (const c of codes) {
        expect(c).toBeGreaterThanOrEqual(0n)
        expect(c).toBeLessThanOrEqual(3n)
      }
    })

    it('should have bounded code difference for 4x4 grid', () => {
      const codes: bigint[] = []
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          codes.push(z.encode2D(x, y))
        }
      }
      const min = codes.reduce((a, b) => (a < b ? a : b))
      const max = codes.reduce((a, b) => (a > b ? a : b))
      expect(Number(max - min)).toBeLessThanOrEqual(15)
    })
  })

  describe('encodeRange2D', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should return 4 codes for 2x2 range', () => {
      const codes = z.encodeRange2D(0, 0, 1, 1)
      expect(codes).toHaveLength(4)
    })

    it('should return sorted codes for 2x2 range', () => {
      const codes = z.encodeRange2D(0, 0, 1, 1)
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i]).toBeGreaterThan(codes[i - 1]!)
      }
    })

    it('should return single code for point range', () => {
      const codes = z.encodeRange2D(0, 0, 0, 0)
      expect(codes).toHaveLength(1)
      expect(codes[0]).toBe(0n)
    })

    it('should return 16 codes for 4x4 range', () => {
      const codes = z.encodeRange2D(0, 0, 3, 3)
      expect(codes).toHaveLength(16)
    })

    it('should handle reversed coordinates', () => {
      const codes = z.encodeRange2D(1, 1, 0, 0)
      expect(codes).toHaveLength(4)
      expect(codes).toEqual([0n, 1n, 2n, 3n])
    })

    it('should return codes for single row', () => {
      const codes = z.encodeRange2D(0, 0, 3, 0)
      expect(codes).toHaveLength(4)
    })

    it('should return codes for single column', () => {
      const codes = z.encodeRange2D(0, 0, 0, 3)
      expect(codes).toHaveLength(4)
    })

    it('should return all unique codes', () => {
      const codes = z.encodeRange2D(0, 0, 3, 3)
      const unique = new Set(codes)
      expect(unique.size).toBe(codes.length)
    })
  })

  describe('queryRange2D', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should return 4 points for 2x2 range', () => {
      const points = z.queryRange2D(0, 0, 1, 1)
      expect(points).toHaveLength(4)
    })

    it('should contain all expected points for 2x2 range', () => {
      const points = z.queryRange2D(0, 0, 1, 1)
      const expected: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]
      for (const p of expected) {
        expect(points).toContainEqual(p)
      }
    })

    it('should return single point for point range', () => {
      const points = z.queryRange2D(5, 3, 5, 3)
      expect(points).toHaveLength(1)
      expect(points[0]).toEqual({ x: 5, y: 3 })
    })

    it('should return 16 points for 4x4 range', () => {
      const points = z.queryRange2D(0, 0, 3, 3)
      expect(points).toHaveLength(16)
    })

    it('should not contain points outside range', () => {
      const points = z.queryRange2D(1, 1, 2, 2)
      for (const p of points) {
        expect(p.x).toBeGreaterThanOrEqual(1)
        expect(p.x).toBeLessThanOrEqual(2)
        expect(p.y).toBeGreaterThanOrEqual(1)
        expect(p.y).toBeLessThanOrEqual(2)
      }
    })

    it('should handle single row', () => {
      const points = z.queryRange2D(0, 5, 3, 5)
      expect(points).toHaveLength(4)
      for (const p of points) {
        expect(p.y).toBe(5)
      }
    })

    it('should handle single column', () => {
      const points = z.queryRange2D(5, 0, 5, 3)
      expect(points).toHaveLength(4)
      for (const p of points) {
        expect(p.x).toBe(5)
      }
    })
  })

  describe('coversRange', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should return true when block covers exact range', () => {
      expect(z.coversRange(0n, 4n, 0, 0, 1, 1)).toBe(true)
    })

    it('should return true when block is larger than range', () => {
      expect(z.coversRange(0n, 16n, 1, 1, 2, 2)).toBe(true)
    })

    it('should return false when block is too small', () => {
      expect(z.coversRange(0n, 4n, 0, 0, 2, 2)).toBe(false)
    })

    it('should return true for 4x4 block covering full range', () => {
      expect(z.coversRange(0n, 16n, 0, 0, 3, 3)).toBe(true)
    })

    it('should return true for single point block', () => {
      expect(z.coversRange(0n, 1n, 0, 0, 0, 0)).toBe(true)
    })

    it('should return false for offset block', () => {
      expect(z.coversRange(4n, 4n, 0, 0, 1, 1)).toBe(false)
    })

    it('should return true for block at offset covering sub-range', () => {
      expect(z.coversRange(4n, 4n, 2, 0, 3, 1)).toBe(true)
    })
  })

  describe('biggestPowerOf2', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should return 1 for code 0', () => {
      expect(z.biggestPowerOf2(0n)).toBe(1n)
    })

    it('should return 1 for code 1', () => {
      expect(z.biggestPowerOf2(1n)).toBe(1n)
    })

    it('should return 2 for code 2', () => {
      expect(z.biggestPowerOf2(2n)).toBe(2n)
    })

    it('should return 1 for code 3', () => {
      expect(z.biggestPowerOf2(3n)).toBe(1n)
    })

    it('should return 4 for code 4', () => {
      expect(z.biggestPowerOf2(4n)).toBe(4n)
    })

    it('should return 2 for code 6', () => {
      expect(z.biggestPowerOf2(6n)).toBe(2n)
    })

    it('should return 8 for code 8', () => {
      expect(z.biggestPowerOf2(8n)).toBe(8n)
    })

    it('should return 4 for code 12', () => {
      expect(z.biggestPowerOf2(12n)).toBe(4n)
    })
  })

  describe('compare', () => {
    let z: ZOrderCurve

    beforeEach(() => {
      z = new ZOrderCurve()
    })

    it('should return -1 when a < b', () => {
      expect(z.compare(1n, 2n)).toBe(-1)
    })

    it('should return 1 when a > b', () => {
      expect(z.compare(2n, 1n)).toBe(1)
    })

    it('should return 0 when a equals b', () => {
      expect(z.compare(5n, 5n)).toBe(0)
    })

    it('should return -1 for 0n vs 1n', () => {
      expect(z.compare(0n, 1n)).toBe(-1)
    })

    it('should handle large values', () => {
      const a = z.encode2D(1000, 1000)
      const b = z.encode2D(1000, 1001)
      expect(z.compare(a, b)).toBe(-1)
    })

    it('should return correct order for morton codes', () => {
      const c00 = z.encode2D(0, 0)
      const c10 = z.encode2D(1, 0)
      const c01 = z.encode2D(0, 1)
      expect(z.compare(c00, c10)).toBe(-1)
      expect(z.compare(c10, c01)).toBe(-1)
    })
  })

  describe('bits precision', () => {
    it('should allow coordinates up to 2^bits - 1', () => {
      const z = new ZOrderCurve({ bits: 8 })
      const code = z.encode2D(255, 255)
      expect(z.decode2D(code)).toEqual({ x: 255, y: 255 })
    })

    it('should reject coordinates exceeding bit precision', () => {
      const z = new ZOrderCurve({ bits: 8 })
      expect(() => z.encode2D(256, 0)).toThrow()
    })

    it('should reject coordinates exceeding bit precision for y', () => {
      const z = new ZOrderCurve({ bits: 8 })
      expect(() => z.encode2D(0, 256)).toThrow()
    })

    it('should work with bits=4', () => {
      const z = new ZOrderCurve({ bits: 4 })
      const code = z.encode2D(15, 15)
      expect(z.decode2D(code)).toEqual({ x: 15, y: 15 })
    })

    it('should work with bits=1', () => {
      const z = new ZOrderCurve({ bits: 1 })
      const code = z.encode2D(1, 1)
      expect(z.decode2D(code)).toEqual({ x: 1, y: 1 })
    })

    it('should reject exceeding bits=1', () => {
      const z = new ZOrderCurve({ bits: 1 })
      expect(() => z.encode2D(2, 0)).toThrow()
    })
  })

  describe('large coordinates', () => {
    it('should handle max 16-bit coordinates', () => {
      const z = new ZOrderCurve()
      const code = z.encode2D(65535, 65535)
      expect(z.decode2D(code)).toEqual({ x: 65535, y: 65535 })
    })

    it('should roundtrip (1000, 1000)', () => {
      const z = new ZOrderCurve()
      const code = z.encode2D(1000, 1000)
      expect(z.decode2D(code)).toEqual({ x: 1000, y: 1000 })
    })

    it('should roundtrip (32767, 32767)', () => {
      const z = new ZOrderCurve()
      const code = z.encode2D(32767, 32767)
      expect(z.decode2D(code)).toEqual({ x: 32767, y: 32767 })
    })

    it('should produce sorted codes for range of large values', () => {
      const z = new ZOrderCurve()
      const codes = z.encodeRange2D(1000, 1000, 1003, 1003)
      expect(codes).toHaveLength(16)
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i]).toBeGreaterThan(codes[i - 1]!)
      }
    })

    it('should handle large 3D coordinates', () => {
      const z = new ZOrderCurve()
      const code = z.encode3D(100, 200, 300)
      expect(z.decode3D(code)).toEqual({ x: 100, y: 200, z: 300 })
    })
  })

  describe('negative coordinates', () => {
    it('should throw on negative x in encode2D', () => {
      const z = new ZOrderCurve()
      expect(() => z.encode2D(-1, 0)).toThrow()
    })

    it('should throw on negative y in encode2D', () => {
      const z = new ZOrderCurve()
      expect(() => z.encode2D(0, -1)).toThrow()
    })

    it('should throw on negative x in encode3D', () => {
      const z = new ZOrderCurve()
      expect(() => z.encode3D(-1, 0, 0)).toThrow()
    })

    it('should throw on negative y in encode3D', () => {
      const z = new ZOrderCurve()
      expect(() => z.encode3D(0, -1, 0)).toThrow()
    })

    it('should throw on negative z in encode3D', () => {
      const z = new ZOrderCurve()
      expect(() => z.encode3D(0, 0, -1)).toThrow()
    })
  })

  describe('many points roundtrip', () => {
    it('should roundtrip 100 2D points', () => {
      const z = new ZOrderCurve()
      for (let i = 0; i < 100; i++) {
        const x = i % 10
        const y = Math.floor(i / 10)
        const code = z.encode2D(x, y)
        expect(z.decode2D(code)).toEqual({ x, y })
      }
    })

    it('should roundtrip 100 3D points', () => {
      const z = new ZOrderCurve()
      for (let i = 0; i < 100; i++) {
        const x = i % 5
        const y = Math.floor(i / 5) % 5
        const zz = Math.floor(i / 25)
        const code = z.encode3D(x, y, zz)
        expect(z.decode3D(code)).toEqual({ x, y, z: zz })
      }
    })

    it('should roundtrip sequential grid coordinates', () => {
      const z = new ZOrderCurve()
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          const code = z.encode2D(x, y)
          const decoded = z.decode2D(code)
          expect(decoded.x).toBe(x)
          expect(decoded.y).toBe(y)
        }
      }
    })

    it('should produce unique codes for all points in grid', () => {
      const z = new ZOrderCurve()
      const codes = new Set<bigint>()
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          codes.add(z.encode2D(x, y))
        }
      }
      expect(codes.size).toBe(256)
    })
  })

  describe('getters', () => {
    it('should return bits from getter', () => {
      const z = new ZOrderCurve({ bits: 8 })
      expect(z.bits).toBe(8)
    })

    it('should return dimensions from getter', () => {
      const z = new ZOrderCurve({ dimensions: 3 })
      expect(z.dimensions).toBe(3)
    })

    it('should return default bits', () => {
      const z = new ZOrderCurve()
      expect(z.bits).toBe(16)
    })

    it('should return default dimensions', () => {
      const z = new ZOrderCurve()
      expect(z.dimensions).toBe(2)
    })
  })

  describe('type exports', () => {
    it('should support Point2D type', () => {
      const p: Point2D = { x: 1, y: 2 }
      expect(p.x).toBe(1)
      expect(p.y).toBe(2)
    })

    it('should support Point3D type', () => {
      const p: Point3D = { x: 1, y: 2, z: 3 }
      expect(p.x).toBe(1)
      expect(p.y).toBe(2)
      expect(p.z).toBe(3)
    })

    it('should support ZOrderCurveOptions type', () => {
      const opts: ZOrderCurveOptions = { bits: 8, dimensions: 3 }
      const z = new ZOrderCurve(opts)
      expect(z.bits).toBe(8)
      expect(z.dimensions).toBe(3)
    })
  })
})
