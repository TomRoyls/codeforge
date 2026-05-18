import {
  CountMinSketch,
  DEFAULT_COUNTMINSKETCH_OPTIONS,
} from '../src/core/count-min-sketch/count-min-sketch.js'
import type { CountMinSketchJSON, CountMinSketchOptions } from '../src/core/count-min-sketch/count-min-sketch.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CountMinSketch', () => {
  describe('constructor', () => {
    it('creates a sketch with default width and depth', () => {
      const cms = new CountMinSketch()
      expect(cms.width).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(cms.depth).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('creates a sketch with positional width and depth', () => {
      const cms = new CountMinSketch(50, 3)
      expect(cms.width).toBe(50)
      expect(cms.depth).toBe(3)
    })

    it('creates a sketch with options object', () => {
      const cms = new CountMinSketch({ width: 200, depth: 7 })
      expect(cms.width).toBe(200)
      expect(cms.depth).toBe(7)
    })

    it('creates a sketch with partial options (width only)', () => {
      const cms = new CountMinSketch({ width: 500 })
      expect(cms.width).toBe(500)
      expect(cms.depth).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('creates a sketch with partial options (depth only)', () => {
      const cms = new CountMinSketch({ depth: 10 })
      expect(cms.width).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(cms.depth).toBe(10)
    })

    it('clamps width to at least 1', () => {
      const cms = new CountMinSketch(0, 5)
      expect(cms.width).toBe(1)
    })

    it('clamps depth to at least 1', () => {
      const cms = new CountMinSketch(10, 0)
      expect(cms.depth).toBe(1)
    })

    it('clamps negative width to 1', () => {
      const cms = new CountMinSketch(-5, 3)
      expect(cms.width).toBe(1)
    })

    it('clamps negative depth to 1', () => {
      const cms = new CountMinSketch(10, -2)
      expect(cms.depth).toBe(1)
    })

    it('initializes with zero total count', () => {
      const cms = new CountMinSketch()
      expect(cms.totalCount()).toBe(0)
    })

    it('initializes as empty', () => {
      const cms = new CountMinSketch()
      expect(cms.isEmpty()).toBe(true)
    })

    it('ceils fractional width', () => {
      const cms = new CountMinSketch(10.3, 4)
      expect(cms.width).toBe(11)
    })

    it('ceils fractional depth', () => {
      const cms = new CountMinSketch(10, 3.7)
      expect(cms.depth).toBe(4)
    })
  })

  // ─── static create ──────────────────────────────────────────────────

  describe('static create', () => {
    it('creates a sketch from epsilon and delta', () => {
      const cms = CountMinSketch.create(0.01, 0.01)
      expect(cms.width).toBe(Math.max(1, Math.ceil(Math.E / 0.01)))
      expect(cms.depth).toBe(Math.max(1, Math.ceil(-Math.log(0.01))))
    })

    it('produces a working sketch', () => {
      const cms = CountMinSketch.create<string>(0.01, 0.01)
      cms.update('hello')
      expect(cms.query('hello')).toBe(1)
    })

    it('clamps width to 1 for very large epsilon', () => {
      const cms = CountMinSketch.create(100, 0.01)
      expect(cms.width).toBe(1)
    })

    it('clamps depth to 1 for delta close to 1', () => {
      const cms = CountMinSketch.create(0.1, 0.99)
      expect(cms.depth).toBe(1)
    })
  })

  // ─── update / query ─────────────────────────────────────────────────

  describe('update and query', () => {
    it('updates a single item and queries its count', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('apple')
      expect(cms.query('apple')).toBe(1)
    })

    it('increments count for repeated updates', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('apple')
      cms.update('apple')
      cms.update('apple')
      expect(cms.query('apple')).toBe(3)
    })

    it('updates with a custom count', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('apple', 5)
      expect(cms.query('apple')).toBe(5)
    })

    it('updates different items independently', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('a', 3)
      cms.update('b', 7)
      expect(cms.query('a')).toBe(3)
      expect(cms.query('b')).toBe(7)
    })

    it('returns 0 for an item never updated', () => {
      const cms = new CountMinSketch<string>(100, 5)
      expect(cms.query('missing')).toBe(0)
    })

    it('ignores update with count 0', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('apple', 0)
      expect(cms.query('apple')).toBe(0)
      expect(cms.totalCount()).toBe(0)
    })

    it('ignores update with negative count', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('apple', -5)
      expect(cms.query('apple')).toBe(0)
      expect(cms.totalCount()).toBe(0)
    })

    it('handles numeric items', () => {
      const cms = new CountMinSketch<number>(100, 5)
      cms.update(42)
      expect(cms.query(42)).toBe(1)
      expect(cms.query(99)).toBe(0)
    })

    it('handles object items via JSON serialization', () => {
      interface Item {
        id: number
        name: string
      }
      const cms = new CountMinSketch<Item>(100, 5)
      const item: Item = { id: 1, name: 'test' }
      cms.update(item)
      expect(cms.query(item)).toBe(1)
      expect(cms.query({ id: 2, name: 'other' })).toBe(0)
    })

    it('handles empty string', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('')
      expect(cms.query('')).toBe(1)
    })

    it('handles items with special characters', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('hello\nworld')
      cms.update('tab\there')
      cms.update('quote"inside')
      expect(cms.query('hello\nworld')).toBe(1)
      expect(cms.query('tab\there')).toBe(1)
      expect(cms.query('quote"inside')).toBe(1)
    })

    it('handles boolean items', () => {
      const cms = new CountMinSketch<boolean>(100, 5)
      cms.update(true)
      cms.update(false)
      expect(cms.query(true)).toBe(1)
      expect(cms.query(false)).toBe(1)
    })

    it('handles null item', () => {
      const cms = new CountMinSketch<null>(100, 5)
      cms.update(null)
      expect(cms.query(null)).toBe(1)
    })

    it('handles array items', () => {
      const cms = new CountMinSketch<number[]>(100, 5)
      cms.update([1, 2, 3])
      expect(cms.query([1, 2, 3])).toBe(1)
      expect(cms.query([4, 5, 6])).toBe(0)
    })
  })

  // ─── No underestimation (guaranteed) ────────────────────────────────

  describe('no underestimation guarantee', () => {
    it('query never returns less than actual count', () => {
      const cms = new CountMinSketch<string>(100, 5)
      const actualCount = 50
      for (let i = 0; i < actualCount; i++) {
        cms.update('heavy')
      }
      expect(cms.query('heavy')).toBeGreaterThanOrEqual(actualCount)
    })

    it('query equals actual count when no collisions', () => {
      const cms = new CountMinSketch<string>(10000, 5)
      cms.update('unique-item')
      expect(cms.query('unique-item')).toBe(1)
    })

    it('maintains guarantee across many items', () => {
      const cms = new CountMinSketch<string>(1000, 7)
      const counts: Map<string, number> = new Map()
      for (let i = 0; i < 200; i++) {
        const key = `item-${i}`
        const count = Math.floor(Math.random() * 10) + 1
        counts.set(key, (counts.get(key) ?? 0) + count)
        cms.update(key, count)
      }
      for (const [key, actualCount] of counts) {
        expect(cms.query(key)).toBeGreaterThanOrEqual(actualCount)
      }
    })
  })

  // ─── totalCount ─────────────────────────────────────────────────────

  describe('totalCount', () => {
    it('returns 0 for a new sketch', () => {
      const cms = new CountMinSketch()
      expect(cms.totalCount()).toBe(0)
    })

    it('tracks single update', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('x')
      expect(cms.totalCount()).toBe(1)
    })

    it('tracks updates with custom counts', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('x', 5)
      cms.update('y', 3)
      expect(cms.totalCount()).toBe(8)
    })

    it('tracks total across many updates', () => {
      const cms = new CountMinSketch<string>(100, 5)
      for (let i = 0; i < 100; i++) {
        cms.update(`item-${i}`)
      }
      expect(cms.totalCount()).toBe(100)
    })

    it('does not count zero-weight updates', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('x', 0)
      cms.update('y', -1)
      expect(cms.totalCount()).toBe(0)
    })
  })

  // ─── isEmpty ────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for a new sketch', () => {
      const cms = new CountMinSketch()
      expect(cms.isEmpty()).toBe(true)
    })

    it('returns false after an update', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('item')
      expect(cms.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('item')
      cms.clear()
      expect(cms.isEmpty()).toBe(true)
    })
  })

  // ─── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('resets the sketch to empty state', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('a', 10)
      cms.update('b', 20)
      cms.clear()
      expect(cms.isEmpty()).toBe(true)
      expect(cms.totalCount()).toBe(0)
      expect(cms.query('a')).toBe(0)
      expect(cms.query('b')).toBe(0)
    })

    it('allows reuse after clearing', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('first', 5)
      cms.clear()
      cms.update('second', 3)
      expect(cms.query('first')).toBe(0)
      expect(cms.query('second')).toBe(3)
      expect(cms.totalCount()).toBe(3)
    })

    it('preserves width and depth after clear', () => {
      const cms = new CountMinSketch(100, 5)
      cms.update('x')
      cms.clear()
      expect(cms.width).toBe(100)
      expect(cms.depth).toBe(5)
    })
  })

  // ─── merge ──────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two sketches with same dimensions', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 5)
      cms1.update('a', 3)
      cms2.update('b', 7)
      cms1.merge(cms2)
      expect(cms1.query('a')).toBeGreaterThanOrEqual(3)
      expect(cms1.query('b')).toBeGreaterThanOrEqual(7)
    })

    it('adds total counts together', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 5)
      cms1.update('x', 10)
      cms2.update('y', 5)
      cms1.merge(cms2)
      expect(cms1.totalCount()).toBe(15)
    })

    it('throws when widths differ', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(200, 5)
      expect(() => cms1.merge(cms2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('throws when depths differ', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 7)
      expect(() => cms1.merge(cms2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('accumulates counts for the same item across sketches', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 5)
      cms1.update('shared', 4)
      cms2.update('shared', 6)
      cms1.merge(cms2)
      expect(cms1.query('shared')).toBeGreaterThanOrEqual(10)
    })

    it('does not modify the source sketch', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 5)
      cms2.update('x', 5)
      const originalTotal = cms2.totalCount()
      cms1.merge(cms2)
      expect(cms2.totalCount()).toBe(originalTotal)
      expect(cms2.query('x')).toBe(5)
    })
  })

  // ─── clone ──────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('original', 3)
      const cloned = cms.clone()
      expect(cloned.query('original')).toBeGreaterThanOrEqual(3)
      expect(cloned.totalCount()).toBe(3)
    })

    it('does not affect original when modified', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('shared')
      const cloned = cms.clone()
      cloned.update('extra', 10)
      expect(cms.query('extra')).toBe(0)
      expect(cloned.query('extra')).toBeGreaterThanOrEqual(10)
      expect(cms.totalCount()).toBe(1)
      expect(cloned.totalCount()).toBe(11)
    })

    it('preserves width and depth', () => {
      const cms = new CountMinSketch<string>(200, 7)
      const cloned = cms.clone()
      expect(cloned.width).toBe(200)
      expect(cloned.depth).toBe(7)
    })

    it('clone of empty sketch works correctly', () => {
      const cms = new CountMinSketch<string>(100, 5)
      const cloned = cms.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.totalCount()).toBe(0)
      expect(cloned.width).toBe(cms.width)
      expect(cloned.depth).toBe(cms.depth)
    })

    it('clone preserves exact query results', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('a', 5)
      cms.update('b', 3)
      const cloned = cms.clone()
      expect(cloned.query('a')).toBe(cms.query('a'))
      expect(cloned.query('b')).toBe(cms.query('b'))
      expect(cloned.query('c')).toBe(cms.query('c'))
    })
  })

  // ─── toJSON / fromJSON ─────────────────────────────────────────────

  describe('toJSON and fromJSON', () => {
    it('serializes to a valid JSON object', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('test', 3)
      const json = cms.toJSON()
      expect(json).toHaveProperty('matrix')
      expect(json).toHaveProperty('width')
      expect(json).toHaveProperty('depth')
      expect(json).toHaveProperty('totalCount')
      expect(json.width).toBe(100)
      expect(json.depth).toBe(5)
      expect(json.totalCount).toBe(3)
      expect(Array.isArray(json.matrix)).toBe(true)
      expect(json.matrix.length).toBe(5)
    })

    it('round-trips correctly', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('alpha', 2)
      cms.update('beta', 4)
      const json = cms.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.query('alpha')).toBeGreaterThanOrEqual(2)
      expect(restored.query('beta')).toBeGreaterThanOrEqual(4)
      expect(restored.query('gamma')).toBe(0)
      expect(restored.totalCount()).toBe(6)
    })

    it('preserves width and depth after round-trip', () => {
      const cms = new CountMinSketch<string>(150, 8)
      const json = cms.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.width).toBe(150)
      expect(restored.depth).toBe(8)
    })

    it('handles empty sketch serialization', () => {
      const cms = new CountMinSketch<string>(100, 5)
      const json = cms.toJSON()
      expect(json.totalCount).toBe(0)
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.totalCount()).toBe(0)
    })

    it('produces the same query results after round-trip', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('x', 7)
      cms.update('y', 3)
      const restored = CountMinSketch.fromJSON<string>(cms.toJSON())
      expect(restored.query('x')).toBe(cms.query('x'))
      expect(restored.query('y')).toBe(cms.query('y'))
    })

    it('toJSON matrix is a deep copy', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('x', 5)
      const json = cms.toJSON()
      json.matrix[0]![0]! = 999
      expect(cms.query('x')).not.toBe(999)
    })
  })

  // ─── width / depth getters ─────────────────────────────────────────

  describe('width and depth getters', () => {
    it('width returns the configured width', () => {
      const cms = new CountMinSketch(42, 3)
      expect(cms.width).toBe(42)
    })

    it('depth returns the configured depth', () => {
      const cms = new CountMinSketch(42, 3)
      expect(cms.depth).toBe(3)
    })

    it('defaults match DEFAULT_COUNTMINSKETCH_OPTIONS', () => {
      const cms = new CountMinSketch()
      expect(cms.width).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(cms.depth).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })
  })

  // ─── relativeError / confidence ────────────────────────────────────

  describe('relativeError and confidence', () => {
    it('relativeError returns e/width', () => {
      const cms = new CountMinSketch(100, 5)
      expect(cms.relativeError()).toBeCloseTo(Math.E / 100)
    })

    it('confidence returns 1 - exp(-depth)', () => {
      const cms = new CountMinSketch(100, 5)
      expect(cms.confidence()).toBeCloseTo(1 - Math.exp(-5))
    })

    it('relativeError decreases with larger width', () => {
      const cms1 = new CountMinSketch(100, 5)
      const cms2 = new CountMinSketch(1000, 5)
      expect(cms2.relativeError()).toBeLessThan(cms1.relativeError())
    })

    it('confidence increases with larger depth', () => {
      const cms1 = new CountMinSketch(100, 3)
      const cms2 = new CountMinSketch(100, 10)
      expect(cms2.confidence()).toBeGreaterThan(cms1.confidence())
    })

    it('confidence is between 0 and 1', () => {
      const cms = new CountMinSketch(100, 5)
      expect(cms.confidence()).toBeGreaterThan(0)
      expect(cms.confidence()).toBeLessThanOrEqual(1)
    })
  })

  // ─── DEFAULT_COUNTMINSKETCH_OPTIONS ─────────────────────────────────

  describe('DEFAULT_COUNTMINSKETCH_OPTIONS', () => {
    it('has expected default width', () => {
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS.width).toBe(1000)
    })

    it('has expected default depth', () => {
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS.depth).toBe(5)
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles very small sketch (1x1)', () => {
      const cms = new CountMinSketch<string>(1, 1)
      cms.update('only')
      expect(cms.query('only')).toBe(1)
      expect(cms.width).toBe(1)
      expect(cms.depth).toBe(1)
    })

    it('handles single item sketch', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('solo')
      expect(cms.query('solo')).toBe(1)
      expect(cms.totalCount()).toBe(1)
    })

    it('handles heavy hitter pattern', () => {
      const cms = new CountMinSketch<string>(1000, 5)
      for (let i = 0; i < 100; i++) {
        cms.update('common')
      }
      for (let i = 0; i < 10; i++) {
        cms.update(`rare-${i}`)
      }
      expect(cms.query('common')).toBeGreaterThanOrEqual(100)
      for (let i = 0; i < 10; i++) {
        expect(cms.query(`rare-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('handles large stream of updates', () => {
      const cms = new CountMinSketch<string>(1000, 7)
      const n = 10000
      for (let i = 0; i < n; i++) {
        cms.update(`item-${i % 100}`, 1)
      }
      expect(cms.totalCount()).toBe(n)
      for (let i = 0; i < 100; i++) {
        expect(cms.query(`item-${i}`)).toBeGreaterThanOrEqual(100)
      }
    })

    it('query returns non-negative values (0 at minimum)', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('a', 5)
      expect(cms.query('never-seen')).toBe(0)
      expect(cms.query('never-seen')).toBeGreaterThanOrEqual(0)
    })

    it('handles large count values', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('big', 1000000)
      expect(cms.query('big')).toBeGreaterThanOrEqual(1000000)
      expect(cms.totalCount()).toBe(1000000)
    })

    it('clone and clear sequence works', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('x', 5)
      const cloned = cms.clone()
      cms.clear()
      expect(cms.query('x')).toBe(0)
      expect(cloned.query('x')).toBeGreaterThanOrEqual(5)
    })

    it('merge with empty sketch preserves original data', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 5)
      cms1.update('a', 3)
      cms1.merge(cms2)
      expect(cms1.query('a')).toBeGreaterThanOrEqual(3)
      expect(cms1.totalCount()).toBe(3)
    })

    it('merge into empty sketch adopts source data', () => {
      const cms1 = new CountMinSketch<string>(100, 5)
      const cms2 = new CountMinSketch<string>(100, 5)
      cms2.update('a', 3)
      cms1.merge(cms2)
      expect(cms1.query('a')).toBeGreaterThanOrEqual(3)
      expect(cms1.totalCount()).toBe(3)
    })

    it('handles update then query with no intervening operations', () => {
      const cms = new CountMinSketch<string>(100, 5)
      cms.update('item', 42)
      expect(cms.query('item')).toBe(42)
    })

    it('preserves correctness after many mixed operations', () => {
      const cms = new CountMinSketch<string>(500, 7)
      const actualCounts = new Map<string, number>()

      // Updates
      for (let i = 0; i < 50; i++) {
        const key = `key-${i % 10}`
        cms.update(key, 1)
        actualCounts.set(key, (actualCounts.get(key) ?? 0) + 1)
      }

      // Verify no underestimation
      for (const [key, count] of actualCounts) {
        expect(cms.query(key)).toBeGreaterThanOrEqual(count)
      }

      // Clone, clear, and verify
      const cloned = cms.clone()
      cms.clear()
      expect(cms.isEmpty()).toBe(true)
      expect(cloned.isEmpty()).toBe(false)
      expect(cloned.totalCount()).toBe(50)

      // Serialize and restore
      const json = cloned.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      for (const [key] of actualCounts) {
        expect(restored.query(key)).toBeGreaterThanOrEqual(cloned.query(key))
      }
    })
  })
})
