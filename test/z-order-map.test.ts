import { describe, it, expect } from 'vitest'
import { ZOrderMap } from '../src/core/z-order-map/index.js'
import type { ZOrderEntry, Point2D } from '../src/core/z-order-map/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('ZOrderMap', () => {
  describe('constructor', () => {
    it('creates with default bits (16)', () => {
      const m = new ZOrderMap<string>()
      expect(m.bits).toBe(16)
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })

    it('creates with custom bits', () => {
      const m = new ZOrderMap<string>({ bits: 8 })
      expect(m.bits).toBe(8)
    })
  })

  // ─── encode / decode ──────────────────────────────────────────────────

  describe('encode', () => {
    it('encodes (0, 0) to 0n', () => {
      const m = new ZOrderMap<string>()
      expect(m.encode(0, 0)).toBe(0n)
    })

    it('encodes and decodes are inverse operations', () => {
      const m = new ZOrderMap<string>({ bits: 16 })
      const pairs: [number, number][] = [
        [0, 0],
        [1, 1],
        [5, 10],
        [100, 200],
        [255, 255],
      ]
      for (const [x, y] of pairs) {
        expect(m.decode(m.encode(x, y))).toEqual([x, y])
      }
    })

    it('throws for negative coordinates', () => {
      const m = new ZOrderMap<string>()
      expect(() => m.encode(-1, 0)).toThrow()
      expect(() => m.encode(0, -1)).toThrow()
    })

    it('throws for coordinates exceeding bit precision', () => {
      const m = new ZOrderMap<string>({ bits: 4 })
      expect(() => m.encode(16, 0)).toThrow()
      expect(() => m.encode(0, 16)).toThrow()
    })
  })

  describe('decode', () => {
    it('decodes 0n to (0, 0)', () => {
      const m = new ZOrderMap<string>()
      expect(m.decode(0n)).toEqual([0, 0])
    })

    it('throws for negative morton code', () => {
      const m = new ZOrderMap<string>()
      expect(() => m.decode(-1n)).toThrow()
    })
  })

  // ─── set / get / has / delete ─────────────────────────────────────────

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const m = new ZOrderMap<string>()
      m.set(5, 10, 'hello')
      expect(m.get(5, 10)).toBe('hello')
    })

    it('returns undefined for missing point', () => {
      const m = new ZOrderMap<string>()
      expect(m.get(1, 1)).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const m = new ZOrderMap<string>()
      m.set(1, 1, 'old')
      m.set(1, 1, 'new')
      expect(m.get(1, 1)).toBe('new')
      expect(m.size).toBe(1)
    })

    it('set returns this for chaining', () => {
      const m = new ZOrderMap<string>()
      const result = m.set(1, 1, 'a')
      expect(result).toBe(m)
    })
  })

  describe('has', () => {
    it('returns true for existing point', () => {
      const m = new ZOrderMap<string>()
      m.set(3, 4, 'x')
      expect(m.has(3, 4)).toBe(true)
    })

    it('returns false for missing point', () => {
      const m = new ZOrderMap<string>()
      expect(m.has(3, 4)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes an existing point', () => {
      const m = new ZOrderMap<string>()
      m.set(1, 2, 'a')
      expect(m.delete(1, 2)).toBe(true)
      expect(m.get(1, 2)).toBeUndefined()
      expect(m.size).toBe(0)
    })

    it('returns false for missing point', () => {
      const m = new ZOrderMap<string>()
      expect(m.delete(1, 2)).toBe(false)
    })
  })

  // ─── size / isEmpty / clear ───────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const m = new ZOrderMap<number>()
      m.set(1, 1, 10)
      m.set(2, 2, 20)
      expect(m.size).toBe(2)
      expect(m.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const m = new ZOrderMap<string>()
      m.set(1, 1, 'a')
      m.set(2, 2, 'b')
      m.clear()
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })
  })

  // ─── keys / values / entries ──────────────────────────────────────────

  describe('keys', () => {
    it('yields all points', () => {
      const m = new ZOrderMap<string>()
      m.set(1, 2, 'a')
      m.set(3, 4, 'b')
      const pts = [...m.keys()]
      expect(pts.length).toBe(2)
    })
  })

  describe('values', () => {
    it('yields all values', () => {
      const m = new ZOrderMap<string>()
      m.set(1, 2, 'x')
      m.set(3, 4, 'y')
      const vals = [...m.values()]
      expect(vals).toContain('x')
      expect(vals).toContain('y')
    })
  })

  describe('entries', () => {
    it('yields point-value pairs', () => {
      const m = new ZOrderMap<string>()
      m.set(5, 10, 'hello')
      const entries = [...m.entries()]
      expect(entries.length).toBe(1)
      expect(entries[0]![0]).toEqual({ x: 5, y: 10 })
      expect(entries[0]![1]).toBe('hello')
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const m = new ZOrderMap<number>()
      m.set(1, 1, 10)
      m.set(2, 2, 20)
      const collected: [Point2D, number][] = []
      m.forEach((v, k) => collected.push([k, v]))
      expect(collected.length).toBe(2)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const m = new ZOrderMap<string>()
      m.set(1, 1, 'a')
      const c = m.clone()
      expect(c.size).toBe(1)
      expect(c.get(1, 1)).toBe('a')
      m.delete(1, 1)
      expect(c.get(1, 1)).toBe('a')
    })
  })

  // ─── fromEntries ──────────────────────────────────────────────────────

  describe('fromEntries', () => {
    it('creates from entry tuples', () => {
      const entries: ZOrderEntry<string>[] = [
        { x: 1, y: 2, value: 'a' },
        { x: 3, y: 4, value: 'b' },
      ]
      const m = ZOrderMap.fromEntries(entries)
      expect(m.size).toBe(2)
      expect(m.get(1, 2)).toBe('a')
    })
  })

  // ─── rangeQuery ───────────────────────────────────────────────────────

  describe('rangeQuery', () => {
    it('returns entries within the bounding box', () => {
      const m = new ZOrderMap<string>({ bits: 16 })
      m.set(5, 5, 'center')
      m.set(10, 10, 'far')
      m.set(1, 1, 'near')
      const results = m.rangeQuery(0, 0, 6, 6)
      expect(results.length).toBe(2)
      const vals = results.map((r) => r.value)
      expect(vals).toContain('center')
      expect(vals).toContain('near')
    })

    it('returns empty for range with no points', () => {
      const m = new ZOrderMap<string>()
      m.set(100, 100, 'far')
      expect(m.rangeQuery(0, 0, 1, 1)).toEqual([])
    })
  })

  // ─── nearestNeighbor ──────────────────────────────────────────────────

  describe('nearestNeighbor', () => {
    it('returns the closest point', () => {
      const m = new ZOrderMap<string>({ bits: 16 })
      m.set(10, 10, 'far')
      m.set(2, 2, 'near')
      const nearest = m.nearestNeighbor(1, 1)
      expect(nearest).toEqual({ x: 2, y: 2 })
    })

    it('returns undefined when empty', () => {
      const m = new ZOrderMap<string>()
      expect(m.nearestNeighbor(0, 0)).toBeUndefined()
    })
  })

  // ─── toSortedArray ────────────────────────────────────────────────────

  describe('toSortedArray', () => {
    it('returns entries sorted by Z-order', () => {
      const m = new ZOrderMap<string>({ bits: 8 })
      m.set(3, 3, 'b')
      m.set(1, 1, 'a')
      m.set(5, 5, 'c')
      const arr = m.toSortedArray()
      expect(arr.length).toBe(3)
      const codes = arr.map((e) => m.encode(e.x, e.y))
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i]! >= codes[i - 1]!).toBe(true)
      }
    })
  })

  // ─── containsPoint ────────────────────────────────────────────────────

  describe('containsPoint', () => {
    it('is an alias for has', () => {
      const m = new ZOrderMap<string>()
      m.set(5, 5, 'x')
      expect(m.containsPoint(5, 5)).toBe(true)
      expect(m.containsPoint(6, 6)).toBe(false)
    })
  })
})
