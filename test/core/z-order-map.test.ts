import { describe, it, expect } from 'vitest'
import { ZOrderMap } from '../../src/core/z-order-map/index.js'

describe('ZOrderMap', () => {
  describe('constructor', () => {
    it('creates empty map with default options', () => {
      const map = new ZOrderMap<number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map with custom bits', () => {
      const map = new ZOrderMap<number>({ bits: 8 })
      expect(map.bits).toBe(8)
    })

    it('creates map with default 16 bits', () => {
      const map = new ZOrderMap<number>()
      expect(map.bits).toBe(16)
    })

    it('creates map with bits=4', () => {
      const map = new ZOrderMap<number>({ bits: 4 })
      expect(map.bits).toBe(4)
    })
  })

  describe('encode', () => {
    it('encodes (0,0) to 0', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(0, 0)).toBe(0n)
    })

    it('encodes (1,0) to 1', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(1, 0)).toBe(1n)
    })

    it('encodes (0,1) to 2', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(0, 1)).toBe(2n)
    })

    it('encodes (1,1) to 3', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(1, 1)).toBe(3n)
    })

    it('encodes (2,0) to 4', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(2, 0)).toBe(4n)
    })

    it('encodes (0,2) to 8', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(0, 2)).toBe(8n)
    })

    it('encodes (3,3) correctly', () => {
      const map = new ZOrderMap<number>()
      const code = map.encode(3, 3)
      const [x, y] = map.decode(code)
      expect(x).toBe(3)
      expect(y).toBe(3)
    })

    it('encodes (5,5) correctly', () => {
      const map = new ZOrderMap<number>()
      const code = map.encode(5, 5)
      const [x, y] = map.decode(code)
      expect(x).toBe(5)
      expect(y).toBe(5)
    })

    it('throws on negative x', () => {
      const map = new ZOrderMap<number>()
      expect(() => map.encode(-1, 0)).toThrow('non-negative')
    })

    it('throws on negative y', () => {
      const map = new ZOrderMap<number>()
      expect(() => map.encode(0, -1)).toThrow('non-negative')
    })

    it('throws on coordinates exceeding bit precision', () => {
      const map = new ZOrderMap<number>({ bits: 2 })
      expect(() => map.encode(4, 0)).toThrow('exceed')
    })

    it('accepts max coordinate for given bits', () => {
      const map = new ZOrderMap<number>({ bits: 4 })
      expect(() => map.encode(15, 15)).not.toThrow()
    })

    it('interleaves bits correctly for (3,5)', () => {
      const map = new ZOrderMap<number>()
      const code = map.encode(3, 5)
      expect(code).toBeGreaterThan(0n)
      const [x, y] = map.decode(code)
      expect(x).toBe(3)
      expect(y).toBe(5)
    })
  })

  describe('decode', () => {
    it('decodes 0 to [0,0]', () => {
      const map = new ZOrderMap<number>()
      expect(map.decode(0n)).toEqual([0, 0])
    })

    it('decodes 1 to [1,0]', () => {
      const map = new ZOrderMap<number>()
      expect(map.decode(1n)).toEqual([1, 0])
    })

    it('decodes 2 to [0,1]', () => {
      const map = new ZOrderMap<number>()
      expect(map.decode(2n)).toEqual([0, 1])
    })

    it('decodes 3 to [1,1]', () => {
      const map = new ZOrderMap<number>()
      expect(map.decode(3n)).toEqual([1, 1])
    })

    it('round-trips multiple coordinates', () => {
      const map = new ZOrderMap<number>()
      const coords = [
        [0, 0], [1, 0], [0, 1], [1, 1],
        [2, 3], [7, 5], [10, 15], [255, 255],
      ]
      for (const [x, y] of coords) {
        const code = map.encode(x, y)
        const [dx, dy] = map.decode(code)
        expect(dx).toBe(x)
        expect(dy).toBe(y)
      }
    })

    it('throws on negative morton code', () => {
      const map = new ZOrderMap<number>()
      expect(() => map.decode(-1n)).toThrow('non-negative')
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new ZOrderMap<string>()
      map.set(1, 2, 'hello')
      expect(map.get(1, 2)).toBe('hello')
    })

    it('returns undefined for missing key', () => {
      const map = new ZOrderMap<string>()
      expect(map.get(0, 0)).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(1, 1, 20)
      expect(map.get(1, 1)).toBe(20)
    })

    it('returns this from set', () => {
      const map = new ZOrderMap<number>()
      const result = map.set(1, 1, 10)
      expect(result).toBe(map)
    })

    it('allows chaining sets', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1).set(1, 0, 2).set(0, 1, 3)
      expect(map.size).toBe(3)
      expect(map.get(0, 0)).toBe(1)
      expect(map.get(1, 0)).toBe(2)
      expect(map.get(0, 1)).toBe(3)
    })

    it('stores various value types', () => {
      const map = new ZOrderMap<unknown>()
      map.set(0, 0, 'string')
      map.set(1, 0, 42)
      map.set(2, 0, true)
      map.set(3, 0, { key: 'val' })
      map.set(4, 0, [1, 2, 3])
      map.set(5, 0, null)
      expect(map.get(0, 0)).toBe('string')
      expect(map.get(1, 0)).toBe(42)
      expect(map.get(2, 0)).toBe(true)
      expect(map.get(3, 0)).toEqual({ key: 'val' })
      expect(map.get(4, 0)).toEqual([1, 2, 3])
      expect(map.get(5, 0)).toBeNull()
    })
  })

  describe('has', () => {
    it('returns true for existing point', () => {
      const map = new ZOrderMap<number>()
      map.set(3, 4, 100)
      expect(map.has(3, 4)).toBe(true)
    })

    it('returns false for missing point', () => {
      const map = new ZOrderMap<number>()
      expect(map.has(3, 4)).toBe(false)
    })

    it('returns false after delete', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.delete(1, 1)
      expect(map.has(1, 1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing entry', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      expect(map.delete(1, 2)).toBe(true)
      expect(map.get(1, 2)).toBeUndefined()
    })

    it('returns false for missing entry', () => {
      const map = new ZOrderMap<number>()
      expect(map.delete(1, 2)).toBe(false)
    })

    it('decrements size', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(2, 2, 20)
      expect(map.size).toBe(2)
      map.delete(1, 1)
      expect(map.size).toBe(1)
    })

    it('does not affect other entries', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(2, 2, 20)
      map.delete(1, 1)
      expect(map.get(2, 2)).toBe(20)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new ZOrderMap<number>()
      expect(map.size).toBe(0)
    })

    it('increments on set', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      expect(map.size).toBe(1)
      map.set(1, 1, 2)
      expect(map.size).toBe(2)
    })

    it('does not increment on overwrite', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.set(0, 0, 2)
      expect(map.size).toBe(1)
    })

    it('decrements on delete', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.delete(0, 0)
      expect(map.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty map', () => {
      const map = new ZOrderMap<number>()
      expect(map.isEmpty).toBe(true)
    })

    it('returns false after set', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      expect(map.isEmpty).toBe(false)
    })

    it('returns true after clear', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.clear()
      expect(map.isEmpty).toBe(true)
    })

    it('returns true after deleting all entries', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.delete(0, 0)
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1).set(1, 1, 2).set(2, 2, 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('allows adding after clear', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.clear()
      map.set(1, 1, 2)
      expect(map.size).toBe(1)
      expect(map.get(1, 1)).toBe(2)
    })
  })

  describe('keys', () => {
    it('returns empty iterator for empty map', () => {
      const map = new ZOrderMap<number>()
      expect([...map.keys()]).toEqual([])
    })

    it('returns all keys', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      map.set(3, 4, 20)
      const keys = [...map.keys()]
      expect(keys).toHaveLength(2)
      expect(keys).toContainEqual({ x: 1, y: 2 })
      expect(keys).toContainEqual({ x: 3, y: 4 })
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty map', () => {
      const map = new ZOrderMap<number>()
      expect([...map.values()]).toEqual([])
    })

    it('returns all values', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 10)
      map.set(1, 1, 20)
      const vals = [...map.values()]
      expect(vals).toHaveLength(2)
      expect(vals).toContain(10)
      expect(vals).toContain(20)
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty map', () => {
      const map = new ZOrderMap<number>()
      expect([...map.entries()]).toEqual([])
    })

    it('returns all entries as [Point2D, value] pairs', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 100)
      map.set(3, 4, 200)
      const entries = [...map.entries()]
      expect(entries).toHaveLength(2)
      const pointValues = entries.map(([{ x, y }, v]) => ({ x, y, v }))
      expect(pointValues).toContainEqual({ x: 1, y: 2, v: 100 })
      expect(pointValues).toContainEqual({ x: 3, y: 4, v: 200 })
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      const result = [...map]
      expect(result).toHaveLength(1)
      expect(result[0]![0]).toEqual({ x: 1, y: 1 })
      expect(result[0]![1]).toBe(10)
    })

    it('works in for-of loop', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.set(1, 1, 2)
      const collected: number[] = []
      for (const [, v] of map) {
        collected.push(v)
      }
      expect(collected).toHaveLength(2)
      expect(collected).toContain(1)
      expect(collected).toContain(2)
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      map.set(3, 4, 20)
      const collected: Array<{ key: { x: number; y: number }; value: number }> = []
      map.forEach((value, key) => {
        collected.push({ key, value })
      })
      expect(collected).toHaveLength(2)
    })

    it('passes the map as third argument', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      let received: ZOrderMap<number> | undefined
      map.forEach((_v, _k, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('does not iterate on empty map', () => {
      const map = new ZOrderMap<number>()
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      const clone = map.clone()
      expect(clone.size).toBe(1)
      expect(clone.get(1, 2)).toBe(10)
    })

    it('modifications to clone do not affect original', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      const clone = map.clone()
      clone.set(3, 4, 20)
      expect(map.size).toBe(1)
      expect(clone.size).toBe(2)
    })

    it('modifications to original do not affect clone', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      const clone = map.clone()
      map.delete(1, 2)
      expect(clone.get(1, 2)).toBe(10)
      expect(clone.size).toBe(1)
    })

    it('preserves bits option', () => {
      const map = new ZOrderMap<number>({ bits: 8 })
      const clone = map.clone()
      expect(clone.bits).toBe(8)
    })

    it('clones empty map', () => {
      const map = new ZOrderMap<number>()
      const clone = map.clone()
      expect(clone.size).toBe(0)
      expect(clone.isEmpty).toBe(true)
    })
  })

  describe('static fromEntries', () => {
    it('creates map from entries', () => {
      const map = ZOrderMap.fromEntries([
        { x: 1, y: 2, value: 'a' },
        { x: 3, y: 4, value: 'b' },
      ])
      expect(map.size).toBe(2)
      expect(map.get(1, 2)).toBe('a')
      expect(map.get(3, 4)).toBe('b')
    })

    it('creates empty map from empty entries', () => {
      const map = ZOrderMap.fromEntries([])
      expect(map.size).toBe(0)
    })

    it('accepts options', () => {
      const map = ZOrderMap.fromEntries(
        [{ x: 1, y: 1, value: 10 }],
        { bits: 8 },
      )
      expect(map.bits).toBe(8)
      expect(map.get(1, 1)).toBe(10)
    })

    it('overwrites duplicate entries', () => {
      const map = ZOrderMap.fromEntries([
        { x: 1, y: 1, value: 'first' },
        { x: 1, y: 1, value: 'second' },
      ])
      expect(map.size).toBe(1)
      expect(map.get(1, 1)).toBe('second')
    })
  })

  describe('rangeQuery', () => {
    it('returns entries within range', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(2, 2, 20)
      map.set(5, 5, 50)
      const results = map.rangeQuery(0, 0, 3, 3)
      expect(results).toHaveLength(2)
      expect(results.map((r) => r.value).sort()).toEqual([10, 20])
    })

    it('returns empty for no matches', () => {
      const map = new ZOrderMap<number>()
      map.set(10, 10, 100)
      const results = map.rangeQuery(0, 0, 5, 5)
      expect(results).toHaveLength(0)
    })

    it('returns all entries for large range', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(5, 5, 50)
      map.set(10, 10, 100)
      const results = map.rangeQuery(0, 0, 20, 20)
      expect(results).toHaveLength(3)
    })

    it('handles single-point range', () => {
      const map = new ZOrderMap<number>()
      map.set(3, 3, 30)
      map.set(4, 4, 40)
      const results = map.rangeQuery(3, 3, 3, 3)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe(30)
    })

    it('handles swapped min/max coordinates', () => {
      const map = new ZOrderMap<number>()
      map.set(2, 2, 20)
      const results = map.rangeQuery(5, 5, 0, 0)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe(20)
    })

    it('returns entries on boundary', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.set(5, 5, 2)
      const results = map.rangeQuery(0, 0, 5, 5)
      expect(results).toHaveLength(2)
    })

    it('works on empty map', () => {
      const map = new ZOrderMap<number>()
      const results = map.rangeQuery(0, 0, 10, 10)
      expect(results).toHaveLength(0)
    })

    it('filters entries outside range', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.set(3, 3, 2)
      map.set(10, 10, 3)
      const results = map.rangeQuery(2, 2, 5, 5)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe(2)
    })
  })

  describe('nearestNeighbor', () => {
    it('returns undefined for empty map', () => {
      const map = new ZOrderMap<number>()
      expect(map.nearestNeighbor(0, 0)).toBeUndefined()
    })

    it('returns the single point in map', () => {
      const map = new ZOrderMap<number>()
      map.set(5, 5, 10)
      expect(map.nearestNeighbor(0, 0)).toEqual({ x: 5, y: 5 })
    })

    it('returns closest point', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(10, 10, 20)
      expect(map.nearestNeighbor(0, 0)).toEqual({ x: 1, y: 1 })
    })

    it('returns closest point among many', () => {
      const map = new ZOrderMap<number>()
      map.set(5, 5, 1)
      map.set(50, 50, 2)
      map.set(100, 100, 3)
      expect(map.nearestNeighbor(48, 48)).toEqual({ x: 50, y: 50 })
    })

    it('handles exact match', () => {
      const map = new ZOrderMap<number>()
      map.set(3, 3, 10)
      map.set(10, 10, 20)
      expect(map.nearestNeighbor(3, 3)).toEqual({ x: 3, y: 3 })
    })

    it('handles equidistant points (returns one)', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 2, 1)
      map.set(2, 0, 2)
      const result = map.nearestNeighbor(0, 0)
      expect(result).toBeDefined()
      expect(result!.x * result!.x + result!.y * result!.y).toBe(4)
    })
  })

  describe('containsPoint', () => {
    it('returns true for existing point', () => {
      const map = new ZOrderMap<number>()
      map.set(3, 4, 10)
      expect(map.containsPoint(3, 4)).toBe(true)
    })

    it('returns false for missing point', () => {
      const map = new ZOrderMap<number>()
      expect(map.containsPoint(3, 4)).toBe(false)
    })

    it('is equivalent to has', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      expect(map.containsPoint(1, 2)).toBe(map.has(1, 2))
      expect(map.containsPoint(5, 5)).toBe(map.has(5, 5))
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty map', () => {
      const map = new ZOrderMap<number>()
      expect(map.toSortedArray()).toEqual([])
    })

    it('returns sorted entries by morton code', () => {
      const map = new ZOrderMap<number>()
      map.set(3, 3, 30)
      map.set(0, 0, 0)
      map.set(1, 0, 10)
      const arr = map.toSortedArray()
      expect(arr[0]!.value).toBe(0)
      expect(arr[1]!.value).toBe(10)
      expect(arr[2]!.value).toBe(30)
    })

    it('preserves coordinates', () => {
      const map = new ZOrderMap<string>()
      map.set(1, 2, 'a')
      map.set(3, 4, 'b')
      const arr = map.toSortedArray()
      for (const entry of arr) {
        expect(entry.x).toBeDefined()
        expect(entry.y).toBeDefined()
        expect(entry.value).toBeDefined()
      }
    })

    it('returns entries in morton order', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 1, 1)
      map.set(1, 0, 2)
      map.set(1, 1, 3)
      map.set(0, 0, 0)
      const arr = map.toSortedArray()
      const codes = arr.map((e) => map.encode(e.x, e.y))
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i]! >= codes[i - 1]!).toBe(true)
      }
    })
  })

  describe('encode/decode consistency', () => {
    it('encode then decode returns original coordinates', () => {
      const map = new ZOrderMap<number>()
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          const code = map.encode(x, y)
          const [dx, dy] = map.decode(code)
          expect(dx).toBe(x)
          expect(dy).toBe(y)
        }
      }
    })

    it('encode is deterministic', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(5, 7)).toBe(map.encode(5, 7))
    })

    it('different coordinates produce different codes', () => {
      const map = new ZOrderMap<number>()
      const codes = new Set<bigint>()
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          codes.add(map.encode(x, y))
        }
      }
      expect(codes.size).toBe(100)
    })
  })

  describe('large-scale operations', () => {
    it('handles 1000 entries', () => {
      const map = new ZOrderMap<number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i % 100, Math.floor(i / 100), i)
      }
      expect(map.size).toBe(1000)
    })

    it('rangeQuery on 100 entries', () => {
      const map = new ZOrderMap<number>()
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          map.set(x, y, x * 10 + y)
        }
      }
      const results = map.rangeQuery(2, 2, 5, 5)
      expect(results.length).toBe(16)
    })

    it('nearestNeighbor on 100 entries', () => {
      const map = new ZOrderMap<number>()
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          map.set(x, y, x * 10 + y)
        }
      }
      const nearest = map.nearestNeighbor(4.5, 4.5)
      expect(nearest).toBeDefined()
      expect(nearest!.x === 4 || nearest!.x === 5).toBe(true)
      expect(nearest!.y === 4 || nearest!.y === 5).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles (0,0)', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 42)
      expect(map.get(0, 0)).toBe(42)
      expect(map.has(0, 0)).toBe(true)
    })

    it('handles max coordinate for 4 bits', () => {
      const map = new ZOrderMap<number>({ bits: 4 })
      map.set(15, 15, 999)
      expect(map.get(15, 15)).toBe(999)
    })

    it('handles max coordinate for 8 bits', () => {
      const map = new ZOrderMap<number>({ bits: 8 })
      map.set(255, 255, 123)
      expect(map.get(255, 255)).toBe(123)
    })

    it('set returns this for chaining with get', () => {
      const map = new ZOrderMap<number>()
      const val = map.set(1, 1, 42).get(1, 1)
      expect(val).toBe(42)
    })

    it('clone of modified map', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(2, 2, 20)
      map.delete(1, 1)
      const clone = map.clone()
      expect(clone.size).toBe(1)
      expect(clone.get(2, 2)).toBe(20)
    })
  })

  describe('types', () => {
    it('works with string values', () => {
      const map = new ZOrderMap<string>()
      map.set(0, 0, 'hello')
      expect(map.get(0, 0)).toBe('hello')
    })

    it('works with object values', () => {
      const map = new ZOrderMap<{ name: string }>()
      map.set(0, 0, { name: 'test' })
      expect(map.get(0, 0)?.name).toBe('test')
    })

    it('works with array values', () => {
      const map = new ZOrderMap<number[]>()
      map.set(0, 0, [1, 2, 3])
      expect(map.get(0, 0)).toEqual([1, 2, 3])
    })

    it('works with null values', () => {
      const map = new ZOrderMap<null>()
      map.set(0, 0, null)
      expect(map.get(0, 0)).toBeNull()
      expect(map.has(0, 0)).toBe(true)
    })

    it('works with undefined values', () => {
      const map = new ZOrderMap<number | undefined>()
      map.set(0, 0, undefined)
      expect(map.get(0, 0)).toBeUndefined()
      expect(map.has(0, 0)).toBe(true)
      expect(map.size).toBe(1)
    })
  })

  describe('bits option', () => {
    it('bits=1 works for small coordinates', () => {
      const map = new ZOrderMap<number>({ bits: 1 })
      map.set(0, 0, 1)
      map.set(1, 1, 2)
      expect(map.size).toBe(2)
      expect(map.get(0, 0)).toBe(1)
      expect(map.get(1, 1)).toBe(2)
    })

    it('bits=2 supports coordinates 0-3', () => {
      const map = new ZOrderMap<number>({ bits: 2 })
      map.set(3, 3, 99)
      expect(map.get(3, 3)).toBe(99)
    })

    it('bits=32 supports larger coordinates', () => {
      const map = new ZOrderMap<number>({ bits: 32 })
      const big = 2 ** 20
      map.set(big, big, 42)
      expect(map.get(big, big)).toBe(42)
    })
  })

  describe('rangeQuery edge cases', () => {
    it('returns correct results for overlapping points', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      map.set(0, 1, 2)
      map.set(1, 0, 3)
      map.set(1, 1, 4)
      const results = map.rangeQuery(0, 0, 1, 1)
      expect(results).toHaveLength(4)
    })

    it('returns empty for range with no points', () => {
      const map = new ZOrderMap<number>()
      map.set(0, 0, 1)
      const results = map.rangeQuery(10, 10, 20, 20)
      expect(results).toHaveLength(0)
    })

    it('handles range with single matching entry', () => {
      const map = new ZOrderMap<number>()
      map.set(5, 5, 50)
      map.set(0, 0, 0)
      const results = map.rangeQuery(4, 4, 6, 6)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe(50)
    })
  })

  describe('toSortedArray stability', () => {
    it('does not modify map', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 2, 10)
      map.set(3, 4, 20)
      map.toSortedArray()
      expect(map.size).toBe(2)
      expect(map.get(1, 2)).toBe(10)
      expect(map.get(3, 4)).toBe(20)
    })
  })

  describe('multiple operations sequence', () => {
    it('set-delete-set cycle', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.delete(1, 1)
      map.set(1, 1, 20)
      expect(map.get(1, 1)).toBe(20)
      expect(map.size).toBe(1)
    })

    it('clear-set-clear-set', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.clear()
      expect(map.size).toBe(0)
      map.set(2, 2, 20)
      expect(map.size).toBe(1)
      map.clear()
      expect(map.size).toBe(0)
    })

    it('clone-delete-clone', () => {
      const map = new ZOrderMap<number>()
      map.set(1, 1, 10)
      map.set(2, 2, 20)
      const c1 = map.clone()
      map.delete(1, 1)
      const c2 = map.clone()
      expect(c1.size).toBe(2)
      expect(c2.size).toBe(1)
    })
  })

  describe('fromEntries edge cases', () => {
    it('works with generator', () => {
      function* gen(): Generator<{ x: number; y: number; value: number }> {
        yield { x: 0, y: 0, value: 1 }
        yield { x: 1, y: 1, value: 2 }
      }
      const map = ZOrderMap.fromEntries(gen())
      expect(map.size).toBe(2)
    })
  })

  describe('morton ordering properties', () => {
    it('adjacent points have similar morton codes', () => {
      const map = new ZOrderMap<number>()
      const code00 = map.encode(0, 0)
      const code10 = map.encode(1, 0)
      const code01 = map.encode(0, 1)
      expect(code10 > code00).toBe(true)
      expect(code01 > code00).toBe(true)
    })

    it('morton codes are unique for all small coordinates', () => {
      const map = new ZOrderMap<number>({ bits: 4 })
      const codes = new Set<bigint>()
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          codes.add(map.encode(x, y))
        }
      }
      expect(codes.size).toBe(256)
    })

    it('encode(0,y) has even morton code for small y', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(0, 0) % 2n).toBe(0n)
      expect(map.encode(0, 2) % 4n).toBe(0n)
    })

    it('encode(x,0) produces powers of 2 for power-of-2 x', () => {
      const map = new ZOrderMap<number>()
      expect(map.encode(1, 0)).toBe(1n)
      expect(map.encode(2, 0)).toBe(4n)
      expect(map.encode(4, 0)).toBe(16n)
    })
  })

  describe('rangeQuery with various distributions', () => {
    it('finds diagonal entries', () => {
      const map = new ZOrderMap<number>()
      for (let i = 0; i < 10; i++) {
        map.set(i, i, i)
      }
      const results = map.rangeQuery(0, 0, 9, 9)
      expect(results).toHaveLength(10)
    })

    it('finds horizontal line', () => {
      const map = new ZOrderMap<number>()
      for (let x = 0; x < 10; x++) {
        map.set(x, 5, x)
      }
      const results = map.rangeQuery(0, 5, 9, 5)
      expect(results).toHaveLength(10)
    })

    it('finds vertical line', () => {
      const map = new ZOrderMap<number>()
      for (let y = 0; y < 10; y++) {
        map.set(5, y, y)
      }
      const results = map.rangeQuery(5, 0, 5, 9)
      expect(results).toHaveLength(10)
    })

    it('excludes points just outside range', () => {
      const map = new ZOrderMap<number>()
      map.set(2, 2, 1)
      map.set(8, 8, 2)
      const results = map.rangeQuery(3, 3, 7, 7)
      expect(results).toHaveLength(0)
    })
  })

  describe('nearestNeighbor edge cases', () => {
    it('handles query at exact stored point', () => {
      const map = new ZOrderMap<number>()
      map.set(5, 5, 10)
      map.set(6, 6, 20)
      const nearest = map.nearestNeighbor(5, 5)
      expect(nearest).toEqual({ x: 5, y: 5 })
    })

    it('finds nearest in a grid', () => {
      const map = new ZOrderMap<number>()
      for (let x = 0; x <= 10; x += 5) {
        for (let y = 0; y <= 10; y += 5) {
          map.set(x, y, x + y)
        }
      }
      const nearest = map.nearestNeighbor(7, 3)
      expect(nearest).toEqual({ x: 5, y: 5 })
    })
  })

  describe('integration', () => {
    it('full workflow: create, populate, query, clone, clear', () => {
      const map = new ZOrderMap<string>({ bits: 8 })
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          map.set(x, y, `${x},${y}`)
        }
      }
      expect(map.size).toBe(100)
      expect(map.isEmpty).toBe(false)

      const range = map.rangeQuery(2, 2, 4, 4)
      expect(range).toHaveLength(9)

      const nearest = map.nearestNeighbor(2, 6)
      expect(nearest).toEqual({ x: 2, y: 6 })

      const clone = map.clone()
      map.clear()
      expect(map.size).toBe(0)
      expect(clone.size).toBe(100)

      const sorted = clone.toSortedArray()
      expect(sorted.length).toBe(100)
    })

    it('encode/decode roundtrip with entries', () => {
      const map = new ZOrderMap<number>()
      map.set(10, 20, 100)
      map.set(30, 40, 200)
      for (const [point] of map.entries()) {
        const code = map.encode(point.x, point.y)
        const [dx, dy] = map.decode(code)
        expect(dx).toBe(point.x)
        expect(dy).toBe(point.y)
      }
    })
  })
})
