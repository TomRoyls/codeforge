import { describe, it, expect, beforeEach } from 'vitest'
import { CountMinSketch } from '../../src/core/count-min-sketch/count-min-sketch.js'
import { DEFAULT_COUNTMINSKETCH_OPTIONS } from '../../src/core/count-min-sketch/types.js'
import type { CountMinSketchOptions, CountMinSketchJSON } from '../../src/core/count-min-sketch/types.js'

describe('CountMinSketch', () => {
  let sketch: CountMinSketch<string>

  beforeEach(() => {
    sketch = new CountMinSketch<string>()
  })

  describe('constructor', () => {
    it('should create a sketch with default options', () => {
      const s = new CountMinSketch<string>()
      expect(s.isEmpty()).toBe(true)
      expect(s.width).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(s.depth).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('should accept width and depth positional arguments', () => {
      const s = new CountMinSketch<string>(500, 7)
      expect(s.width).toBe(500)
      expect(s.depth).toBe(7)
    })

    it('should accept only width with default depth', () => {
      const s = new CountMinSketch<string>(200)
      expect(s.width).toBe(200)
      expect(s.depth).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('should accept only depth with default width', () => {
      const s = new CountMinSketch<string>(undefined, 10)
      expect(s.width).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(s.depth).toBe(10)
    })

    it('should accept options object', () => {
      const s = new CountMinSketch<string>({ width: 300, depth: 8 })
      expect(s.width).toBe(300)
      expect(s.depth).toBe(8)
    })

    it('should accept partial options object', () => {
      const s = new CountMinSketch<string>({ width: 400 })
      expect(s.width).toBe(400)
      expect(s.depth).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('should accept partial options with only depth', () => {
      const s = new CountMinSketch<string>({ depth: 3 })
      expect(s.width).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(s.depth).toBe(3)
    })

    it('should ceil fractional width', () => {
      const s = new CountMinSketch<string>({ width: 100.5 })
      expect(s.width).toBe(101)
    })

    it('should ceil fractional depth', () => {
      const s = new CountMinSketch<string>({ depth: 2.3 })
      expect(s.depth).toBe(3)
    })

    it('should enforce minimum width of 1', () => {
      const s = new CountMinSketch<string>({ width: 0 })
      expect(s.width).toBe(1)
    })

    it('should enforce minimum depth of 1', () => {
      const s = new CountMinSketch<string>({ depth: 0 })
      expect(s.depth).toBe(1)
    })

    it('should initialize all counters to zero', () => {
      const s = new CountMinSketch<string>(10, 3)
      expect(s.totalCount()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should create matrix with correct dimensions', () => {
      const s = new CountMinSketch<string>(50, 4)
      const json = s.toJSON()
      expect(json.matrix.length).toBe(4)
      expect(json.matrix[0]!.length).toBe(50)
    })
  })

  describe('static create', () => {
    it('should create sketch from epsilon and delta', () => {
      const s = CountMinSketch.create<string>(0.01, 0.01)
      expect(s.width).toBe(Math.ceil(Math.E / 0.01))
      expect(s.depth).toBe(Math.ceil(-Math.log(0.01)))
    })

    it('should compute width as ceil(e/epsilon)', () => {
      const s = CountMinSketch.create<string>(0.1, 0.01)
      expect(s.width).toBe(Math.ceil(Math.E / 0.1))
    })

    it('should compute depth as ceil(-ln(delta))', () => {
      const s = CountMinSketch.create<string>(0.01, 0.05)
      expect(s.depth).toBe(Math.ceil(-Math.log(0.05)))
    })

    it('should enforce minimum width of 1 for large epsilon', () => {
      const s = CountMinSketch.create<string>(100, 0.01)
      expect(s.width).toBeGreaterThanOrEqual(1)
    })

    it('should enforce minimum depth of 1 for large delta', () => {
      const s = CountMinSketch.create<string>(0.01, 0.99)
      expect(s.depth).toBeGreaterThanOrEqual(1)
    })

    it('should produce larger width for smaller epsilon', () => {
      const s1 = CountMinSketch.create<string>(0.1, 0.01)
      const s2 = CountMinSketch.create<string>(0.001, 0.01)
      expect(s2.width).toBeGreaterThan(s1.width)
    })

    it('should produce larger depth for smaller delta', () => {
      const s1 = CountMinSketch.create<string>(0.01, 0.1)
      const s2 = CountMinSketch.create<string>(0.01, 0.001)
      expect(s2.depth).toBeGreaterThan(s1.depth)
    })

    it('should create sketch that accepts updates', () => {
      const s = CountMinSketch.create<string>(0.01, 0.01)
      s.update('test')
      expect(s.query('test')).toBe(1)
    })

    it('should create sketch with correct relativeError', () => {
      const s = CountMinSketch.create<string>(0.01, 0.01)
      expect(s.relativeError()).toBeCloseTo(Math.E / s.width, 10)
    })
  })

  describe('update', () => {
    it('should add a single item with default count', () => {
      sketch.update('hello')
      expect(sketch.query('hello')).toBe(1)
    })

    it('should add an item with explicit count', () => {
      sketch.update('hello', 5)
      expect(sketch.query('hello')).toBe(5)
    })

    it('should increment count for repeated updates', () => {
      sketch.update('hello')
      sketch.update('hello')
      sketch.update('hello')
      expect(sketch.query('hello')).toBe(3)
    })

    it('should track multiple different items independently', () => {
      sketch.update('a')
      sketch.update('b')
      sketch.update('c')
      expect(sketch.query('a')).toBe(1)
      expect(sketch.query('b')).toBe(1)
      expect(sketch.query('c')).toBe(1)
    })

    it('should handle mixed counts for same item', () => {
      sketch.update('x', 3)
      sketch.update('x', 2)
      expect(sketch.query('x')).toBe(5)
    })

    it('should ignore zero count', () => {
      sketch.update('hello', 0)
      expect(sketch.query('hello')).toBe(0)
    })

    it('should ignore negative count', () => {
      sketch.update('hello', -5)
      expect(sketch.query('hello')).toBe(0)
    })

    it('should update totalCount', () => {
      sketch.update('a', 3)
      sketch.update('b', 2)
      expect(sketch.totalCount()).toBe(5)
    })

    it('should handle empty string', () => {
      sketch.update('')
      expect(sketch.query('')).toBe(1)
    })

    it('should handle unicode strings', () => {
      sketch.update('日本語')
      sketch.update('🎉🚀')
      expect(sketch.query('日本語')).toBe(1)
      expect(sketch.query('🎉🚀')).toBe(1)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      sketch.update(longStr)
      expect(sketch.query(longStr)).toBe(1)
    })

    it('should handle large counts', () => {
      sketch.update('big', 1000000)
      expect(sketch.query('big')).toBe(1000000)
    })

    it('should make sketch not empty after update', () => {
      sketch.update('test')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should handle special characters', () => {
      sketch.update('hello\nworld\t!')
      sketch.update('path/to/file.ts')
      expect(sketch.query('hello\nworld\t!')).toBe(1)
      expect(sketch.query('path/to/file.ts')).toBe(1)
    })
  })

  describe('query', () => {
    it('should return 0 for item not in empty sketch', () => {
      expect(sketch.query('nothing')).toBe(0)
    })

    it('should return 0 for item never added', () => {
      sketch.update('a')
      expect(sketch.query('b')).toBe(0)
    })

    it('should return exact count for single item', () => {
      sketch.update('test', 7)
      expect(sketch.query('test')).toBe(7)
    })

    it('should never underestimate true count', () => {
      const s = new CountMinSketch<string>(100, 5)
      for (let i = 0; i < 100; i++) {
        s.update(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(s.query(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should return exact count for non-colliding items', () => {
      const s = new CountMinSketch<string>(10000, 10)
      s.update('unique-item-1')
      s.update('unique-item-2')
      s.update('unique-item-3')
      expect(s.query('unique-item-1')).toBe(1)
      expect(s.query('unique-item-2')).toBe(1)
      expect(s.query('unique-item-3')).toBe(1)
    })

    it('should handle query on empty sketch', () => {
      expect(sketch.query('any')).toBe(0)
    })

    it('should handle case sensitivity', () => {
      sketch.update('Hello')
      expect(sketch.query('Hello')).toBe(1)
      expect(sketch.query('hello')).toBe(0)
    })

    it('should handle numeric strings', () => {
      sketch.update('123')
      expect(sketch.query('123')).toBe(1)
      expect(sketch.query('456')).toBe(0)
    })

    it('should handle whitespace-only strings', () => {
      sketch.update('   ')
      sketch.update('\t')
      sketch.update('\n')
      expect(sketch.query('   ')).toBe(1)
      expect(sketch.query('\t')).toBe(1)
      expect(sketch.query('\n')).toBe(1)
    })

    it('should handle strings with null characters', () => {
      sketch.update('before\0after')
      expect(sketch.query('before\0after')).toBe(1)
    })
  })

  describe('merge', () => {
    it('should merge two sketches with same dimensions', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('a', 3)
      s2.update('b', 2)
      s1.merge(s2)
      expect(s1.query('a')).toBe(3)
      expect(s1.query('b')).toBe(2)
    })

    it('should throw on different width', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(200, 5)
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('should throw on different depth', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 7)
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('should sum total counts', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('a', 10)
      s2.update('b', 20)
      s1.merge(s2)
      expect(s1.totalCount()).toBe(30)
    })

    it('should merge overlapping items correctly', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('x', 5)
      s2.update('x', 3)
      s1.merge(s2)
      expect(s1.query('x')).toBe(8)
    })

    it('should handle merging empty sketches', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.merge(s2)
      expect(s1.isEmpty()).toBe(true)
      expect(s1.totalCount()).toBe(0)
    })

    it('should handle merging with empty sketch', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('item', 5)
      s1.merge(s2)
      expect(s1.query('item')).toBe(5)
      expect(s1.totalCount()).toBe(5)
    })

    it('should handle merging into empty sketch', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s2.update('item', 5)
      s1.merge(s2)
      expect(s1.query('item')).toBe(5)
      expect(s1.totalCount()).toBe(5)
    })

    it('should not affect the merged sketch', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s2.update('x', 10)
      s1.merge(s2)
      expect(s2.query('x')).toBe(10)
      expect(s2.totalCount()).toBe(10)
    })

    it('should handle merge with multiple different items', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('a', 5)
      s1.update('b', 3)
      s2.update('c', 7)
      s2.update('d', 2)
      s1.merge(s2)
      expect(s1.totalCount()).toBe(17)
    })
  })

  describe('width and depth properties', () => {
    it('should return width as a property', () => {
      const s = new CountMinSketch<string>(500, 7)
      expect(s.width).toBe(500)
    })

    it('should return depth as a property', () => {
      const s = new CountMinSketch<string>(500, 7)
      expect(s.depth).toBe(7)
    })

    it('should remain constant after operations', () => {
      const w = sketch.width
      const d = sketch.depth
      sketch.update('test')
      expect(sketch.width).toBe(w)
      expect(sketch.depth).toBe(d)
    })

    it('should remain constant after clear', () => {
      const w = sketch.width
      const d = sketch.depth
      sketch.update('test')
      sketch.clear()
      expect(sketch.width).toBe(w)
      expect(sketch.depth).toBe(d)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new sketch', () => {
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should return false after update', () => {
      sketch.update('test')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      sketch.update('test')
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should return false with many items', () => {
      for (let i = 0; i < 10; i++) {
        sketch.update(`item-${i}`)
      }
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should return true for sketch with only zero-count updates', () => {
      sketch.update('test', 0)
      expect(sketch.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      sketch.update('a')
      sketch.update('b')
      sketch.update('c')
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should reset totalCount', () => {
      sketch.update('test', 100)
      sketch.clear()
      expect(sketch.totalCount()).toBe(0)
    })

    it('should reset all query results to zero', () => {
      sketch.update('test')
      sketch.clear()
      expect(sketch.query('test')).toBe(0)
    })

    it('should allow updates after clear', () => {
      sketch.update('first')
      sketch.clear()
      sketch.update('second')
      expect(sketch.query('second')).toBe(1)
      expect(sketch.query('first')).toBe(0)
    })

    it('should handle clearing an empty sketch', () => {
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
      expect(sketch.totalCount()).toBe(0)
    })

    it('should preserve dimensions after clear', () => {
      const w = sketch.width
      const d = sketch.depth
      sketch.update('test')
      sketch.clear()
      expect(sketch.width).toBe(w)
      expect(sketch.depth).toBe(d)
    })

    it('should handle multiple clears', () => {
      sketch.update('item')
      sketch.clear()
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
      expect(sketch.totalCount()).toBe(0)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      sketch.update('test')
      const cloned = sketch.clone()
      expect(cloned.query('test')).toBe(1)
      expect(cloned.totalCount()).toBe(sketch.totalCount())
    })

    it('should not affect original when modified', () => {
      sketch.update('shared')
      const cloned = sketch.clone()
      cloned.update('new')
      expect(sketch.query('new')).toBe(0)
      expect(cloned.query('new')).toBe(1)
    })

    it('should not affect clone when original is modified', () => {
      sketch.update('shared')
      const cloned = sketch.clone()
      sketch.update('original-only')
      expect(cloned.query('original-only')).toBe(0)
    })

    it('should preserve width', () => {
      const s = new CountMinSketch<string>(500, 7)
      s.update('test')
      const cloned = s.clone()
      expect(cloned.width).toBe(s.width)
    })

    it('should preserve depth', () => {
      const s = new CountMinSketch<string>(500, 7)
      s.update('test')
      const cloned = s.clone()
      expect(cloned.depth).toBe(s.depth)
    })

    it('should clone an empty sketch', () => {
      const cloned = sketch.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.totalCount()).toBe(0)
    })

    it('should preserve all item counts', () => {
      for (let i = 0; i < 50; i++) {
        sketch.update(`item-${i}`, i + 1)
      }
      const cloned = sketch.clone()
      for (let i = 0; i < 50; i++) {
        expect(cloned.query(`item-${i}`)).toBeGreaterThanOrEqual(i + 1)
      }
    })

    it('should produce identical matrix state', () => {
      sketch.update('a', 3)
      sketch.update('b', 5)
      const cloned = sketch.clone()
      const json1 = sketch.toJSON()
      const json2 = cloned.toJSON()
      expect(json1.matrix).toEqual(json2.matrix)
    })
  })

  describe('totalCount', () => {
    it('should return 0 for new sketch', () => {
      expect(sketch.totalCount()).toBe(0)
    })

    it('should return count after single update', () => {
      sketch.update('test')
      expect(sketch.totalCount()).toBe(1)
    })

    it('should return sum of all counts', () => {
      sketch.update('a', 3)
      sketch.update('b', 5)
      expect(sketch.totalCount()).toBe(8)
    })

    it('should track repeated updates', () => {
      sketch.update('test')
      sketch.update('test')
      sketch.update('test')
      expect(sketch.totalCount()).toBe(3)
    })

    it('should reset after clear', () => {
      sketch.update('test', 100)
      sketch.clear()
      expect(sketch.totalCount()).toBe(0)
    })

    it('should update after merge', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('a', 10)
      s2.update('b', 20)
      s1.merge(s2)
      expect(s1.totalCount()).toBe(30)
    })
  })

  describe('relativeError', () => {
    it('should return e/w', () => {
      const s = new CountMinSketch<string>(272, 7)
      expect(s.relativeError()).toBeCloseTo(Math.E / 272, 10)
    })

    it('should decrease with larger width', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(1000, 5)
      expect(s2.relativeError()).toBeLessThan(s1.relativeError())
    })

    it('should not depend on depth', () => {
      const s1 = new CountMinSketch<string>(100, 3)
      const s2 = new CountMinSketch<string>(100, 10)
      expect(s1.relativeError()).toBe(s2.relativeError())
    })

    it('should remain constant after operations', () => {
      const err = sketch.relativeError()
      sketch.update('test')
      expect(sketch.relativeError()).toBe(err)
    })

    it('should match create epsilon bound', () => {
      const epsilon = 0.01
      const s = CountMinSketch.create<string>(epsilon, 0.01)
      expect(s.relativeError()).toBeLessThanOrEqual(epsilon)
    })
  })

  describe('confidence', () => {
    it('should return 1 - e^(-d)', () => {
      const s = new CountMinSketch<string>(100, 5)
      expect(s.confidence()).toBeCloseTo(1 - Math.exp(-5), 10)
    })

    it('should increase with larger depth', () => {
      const s1 = new CountMinSketch<string>(100, 3)
      const s2 = new CountMinSketch<string>(100, 10)
      expect(s2.confidence()).toBeGreaterThan(s1.confidence())
    })

    it('should not depend on width', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(10000, 5)
      expect(s1.confidence()).toBe(s2.confidence())
    })

    it('should be between 0 and 1', () => {
      const s = new CountMinSketch<string>(100, 5)
      expect(s.confidence()).toBeGreaterThan(0)
      expect(s.confidence()).toBeLessThanOrEqual(1)
    })

    it('should remain constant after operations', () => {
      const conf = sketch.confidence()
      sketch.update('test')
      expect(sketch.confidence()).toBe(conf)
    })

    it('should match create delta bound', () => {
      const delta = 0.01
      const s = CountMinSketch.create<string>(0.01, delta)
      expect(s.confidence()).toBeGreaterThanOrEqual(1 - delta)
    })
  })

  describe('toJSON / fromJSON', () => {
    it('should serialize to JSON', () => {
      sketch.update('test')
      const json = sketch.toJSON()
      expect(json.matrix).toBeInstanceOf(Array)
      expect(json.width).toBe(sketch.width)
      expect(json.depth).toBe(sketch.depth)
      expect(json.totalCount).toBe(1)
    })

    it('should round-trip through JSON', () => {
      sketch.update('hello', 3)
      sketch.update('world', 5)
      const json = sketch.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.query('hello')).toBe(3)
      expect(restored.query('world')).toBe(5)
      expect(restored.totalCount()).toBe(8)
    })

    it('should preserve width through serialization', () => {
      const s = new CountMinSketch<string>(500, 7)
      s.update('test')
      const json = s.toJSON()
      expect(json.width).toBe(500)
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.width).toBe(500)
    })

    it('should preserve depth through serialization', () => {
      const s = new CountMinSketch<string>(500, 7)
      s.update('test')
      const json = s.toJSON()
      expect(json.depth).toBe(7)
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.depth).toBe(7)
    })

    it('should preserve totalCount through serialization', () => {
      sketch.update('a', 10)
      sketch.update('b', 20)
      const json = sketch.toJSON()
      expect(json.totalCount).toBe(30)
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.totalCount()).toBe(30)
    })

    it('should handle empty sketch serialization', () => {
      const json = sketch.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.totalCount()).toBe(0)
    })

    it('should handle sketch with many items', () => {
      for (let i = 0; i < 100; i++) {
        sketch.update(`item-${i}`, i + 1)
      }
      const json = sketch.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      for (let i = 0; i < 100; i++) {
        expect(restored.query(`item-${i}`)).toBeGreaterThanOrEqual(i + 1)
      }
      expect(restored.totalCount()).toBe(sketch.totalCount())
    })

    it('should produce valid CountMinSketchJSON type', () => {
      sketch.update('test')
      const json: CountMinSketchJSON = sketch.toJSON()
      expect(typeof json.matrix).toBe('object')
      expect(typeof json.width).toBe('number')
      expect(typeof json.depth).toBe('number')
      expect(typeof json.totalCount).toBe('number')
    })

    it('should preserve matrix state exactly', () => {
      sketch.update('a', 3)
      const json = sketch.toJSON()
      const restored = CountMinSketch.fromJSON<string>(json)
      expect(restored.toJSON().matrix).toEqual(json.matrix)
    })
  })

  describe('frequency estimation accuracy', () => {
    it('should estimate frequency within error bound', () => {
      const s = CountMinSketch.create<string>(0.01, 0.01)
      const n = 1000
      for (let i = 0; i < n; i++) {
        s.update(`item-${i}`)
      }
      for (let i = 0; i < n; i++) {
        const estimate = s.query(`item-${i}`)
        expect(estimate).toBeGreaterThanOrEqual(1)
        expect(estimate).toBeLessThanOrEqual(1 + s.relativeError() * n)
      }
    })

    it('should estimate repeated item frequency correctly', () => {
      const s = new CountMinSketch<string>(10000, 10)
      s.update('popular', 100)
      s.update('rare', 1)
      expect(s.query('popular')).toBe(100)
      expect(s.query('rare')).toBeGreaterThanOrEqual(1)
    })

    it('should never underestimate with no collisions', () => {
      const s = new CountMinSketch<string>(10000, 5)
      s.update('a', 10)
      s.update('b', 20)
      s.update('c', 30)
      expect(s.query('a')).toBeGreaterThanOrEqual(10)
      expect(s.query('b')).toBeGreaterThanOrEqual(20)
      expect(s.query('c')).toBeGreaterThanOrEqual(30)
    })

    it('should handle high-frequency items in stream', () => {
      const s = CountMinSketch.create<string>(0.001, 0.001)
      for (let i = 0; i < 100; i++) {
        s.update('heavy')
      }
      for (let i = 0; i < 1000; i++) {
        s.update(`light-${i}`)
      }
      expect(s.query('heavy')).toBeGreaterThanOrEqual(100)
    })

    it('should produce exact counts for wide sketch', () => {
      const s = new CountMinSketch<string>(100000, 1)
      s.update('a', 5)
      s.update('b', 3)
      s.update('c', 7)
      expect(s.query('a')).toBe(5)
      expect(s.query('b')).toBe(3)
      expect(s.query('c')).toBe(7)
    })

    it('should handle stream-like workload', () => {
      const s = new CountMinSketch<string>(1000, 5)
      const items = ['a', 'b', 'c', 'd', 'e']
      for (let round = 0; round < 100; round++) {
        for (const item of items) {
          s.update(item)
        }
      }
      expect(s.totalCount()).toBe(500)
      for (const item of items) {
        expect(s.query(item)).toBeGreaterThanOrEqual(100)
      }
    })
  })

  describe('heavy hitters', () => {
    it('should identify heavy hitters from a stream', () => {
      const s = CountMinSketch.create<string>(0.001, 0.001)
      const totalItems = 10000
      const heavyCount = 500
      for (let i = 0; i < heavyCount; i++) {
        s.update('heavy-item')
      }
      for (let i = 0; i < totalItems - heavyCount; i++) {
        s.update(`normal-${i}`)
      }
      const estimate = s.query('heavy-item')
      expect(estimate).toBeGreaterThanOrEqual(heavyCount)
      expect(estimate).toBeLessThanOrEqual(heavyCount * 2)
    })

    it('should distinguish heavy from light items', () => {
      const s = new CountMinSketch<string>(1000, 10)
      s.update('heavy', 1000)
      s.update('medium', 100)
      s.update('light', 1)
      expect(s.query('heavy')).toBeGreaterThanOrEqual(1000)
      expect(s.query('light')).toBeGreaterThanOrEqual(1)
      expect(s.query('heavy')).toBeGreaterThan(s.query('light'))
    })

    it('should track top-k items', () => {
      const s = new CountMinSketch<string>(5000, 7)
      const items = ['a', 'b', 'c', 'd', 'e']
      const counts = [100, 80, 60, 40, 20]
      for (let i = 0; i < items.length; i++) {
        s.update(items[i]!, counts[i]!)
      }
      const sorted = [...items].sort((a, b) => s.query(b) - s.query(a))
      expect(sorted[0]).toBe('a')
    })
  })

  describe('double hashing technique', () => {
    it('should use double hashing for position computation', () => {
      const s = new CountMinSketch<string>(100, 5)
      s.update('test')
      expect(s.query('test')).toBe(1)
    })

    it('should produce consistent results for same input', () => {
      sketch.update('consistent')
      const r1 = sketch.query('consistent')
      const r2 = sketch.query('consistent')
      expect(r1).toBe(r2)
      expect(r1).toBe(1)
    })

    it('should produce different positions for different strings', () => {
      sketch.update('aaa')
      sketch.update('bbb')
      expect(sketch.query('aaa')).toBe(1)
      expect(sketch.query('bbb')).toBe(1)
    })

    it('should produce same results with same parameters', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      s1.update('test', 42)
      s2.update('test', 42)
      expect(s1.query('test')).toBe(s2.query('test'))
    })
  })

  describe('generic type support', () => {
    it('should work with number items', () => {
      const s = new CountMinSketch<number>()
      s.update(42)
      s.update(100)
      expect(s.query(42)).toBe(1)
      expect(s.query(100)).toBe(1)
      expect(s.query(999)).toBe(0)
    })

    it('should work with object items', () => {
      const s = new CountMinSketch<{ id: number }>()
      const obj = { id: 1 }
      s.update(obj)
      expect(s.query(obj)).toBe(1)
    })

    it('should work with array items', () => {
      const s = new CountMinSketch<number[]>()
      const arr = [1, 2, 3]
      s.update(arr)
      expect(s.query(arr)).toBe(1)
    })

    it('should work with boolean items', () => {
      const s = new CountMinSketch<boolean>()
      s.update(true)
      s.update(false)
      expect(s.query(true)).toBe(1)
      expect(s.query(false)).toBe(1)
    })

    it('should work with null items', () => {
      const s = new CountMinSketch<null>()
      s.update(null)
      expect(s.query(null)).toBe(1)
    })
  })

  describe('large item sets', () => {
    it('should handle 10000 items', () => {
      const s = CountMinSketch.create<string>(0.001, 0.001)
      for (let i = 0; i < 10000; i++) {
        s.update(`item-${i}`)
      }
      expect(s.totalCount()).toBe(10000)
    })

    it('should estimate counts for 10000 items', () => {
      const s = CountMinSketch.create<string>(0.001, 0.001)
      for (let i = 0; i < 10000; i++) {
        s.update(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(s.query(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should handle rapid update and query cycles', () => {
      const s = new CountMinSketch<string>(1000, 5)
      for (let i = 0; i < 1000; i++) {
        s.update(`item-${i}`)
        expect(s.query(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should handle single item added many times', () => {
      const s = new CountMinSketch<string>(100, 5)
      for (let i = 0; i < 10000; i++) {
        s.update('single')
      }
      expect(s.totalCount()).toBe(10000)
      expect(s.query('single')).toBeGreaterThanOrEqual(10000)
    })
  })

  describe('edge cases', () => {
    it('should handle very small width', () => {
      const s = new CountMinSketch<string>(1, 5)
      s.update('test')
      expect(s.query('test')).toBe(1)
    })

    it('should handle very small depth', () => {
      const s = new CountMinSketch<string>(1000, 1)
      s.update('test')
      expect(s.query('test')).toBe(1)
    })

    it('should handle very long string key', () => {
      const longKey = 'x'.repeat(100000)
      sketch.update(longKey)
      expect(sketch.query(longKey)).toBe(1)
    })

    it('should handle clear followed by immediate operations', () => {
      sketch.update('before')
      sketch.clear()
      sketch.update('after')
      expect(sketch.query('after')).toBe(1)
      expect(sketch.query('before')).toBe(0)
    })

    it('should handle clone of sketch with many operations', () => {
      for (let i = 0; i < 50; i++) {
        sketch.update(`item-${i}`, i + 1)
      }
      const cloned = sketch.clone()
      for (let i = 0; i < 50; i++) {
        expect(cloned.query(`item-${i}`)).toBeGreaterThanOrEqual(i + 1)
      }
    })

    it('should handle adding same item many times', () => {
      for (let i = 0; i < 100; i++) {
        sketch.update('same')
      }
      expect(sketch.query('same')).toBe(100)
      expect(sketch.totalCount()).toBe(100)
    })

    it('should handle query on item never added', () => {
      expect(sketch.query('never-added')).toBe(0)
    })

    it('should handle merging after many operations', () => {
      const s1 = new CountMinSketch<string>(100, 5)
      const s2 = new CountMinSketch<string>(100, 5)
      for (let i = 0; i < 50; i++) {
        s1.update(`item-${i}`)
        s2.update(`item-${i + 50}`)
      }
      s1.merge(s2)
      expect(s1.totalCount()).toBe(100)
    })

    it('should handle very large count values', () => {
      sketch.update('big', Number.MAX_SAFE_INTEGER)
      expect(sketch.totalCount()).toBe(Number.MAX_SAFE_INTEGER)
      expect(sketch.query('big')).toBeGreaterThanOrEqual(Number.MAX_SAFE_INTEGER)
    })

    it('should handle keys that differ by case', () => {
      sketch.update('Hello')
      sketch.update('hello')
      sketch.update('HELLO')
      expect(sketch.totalCount()).toBe(3)
      expect(sketch.query('Hello')).toBeGreaterThanOrEqual(1)
      expect(sketch.query('hello')).toBeGreaterThanOrEqual(1)
      expect(sketch.query('HELLO')).toBeGreaterThanOrEqual(1)
    })

    it('should handle sequential update-clear-update pattern', () => {
      sketch.update('a', 5)
      expect(sketch.totalCount()).toBe(5)
      sketch.clear()
      expect(sketch.totalCount()).toBe(0)
      sketch.update('b', 3)
      expect(sketch.totalCount()).toBe(3)
      expect(sketch.query('a')).toBe(0)
      expect(sketch.query('b')).toBeGreaterThanOrEqual(3)
    })

    it('should handle merge then update', () => {
      const s1 = new CountMinSketch<string>(100, 3)
      const s2 = new CountMinSketch<string>(100, 3)
      s1.update('x', 5)
      s2.update('x', 3)
      s1.merge(s2)
      s1.update('x', 2)
      expect(s1.totalCount()).toBe(10)
      expect(s1.query('x')).toBeGreaterThanOrEqual(10)
    })

    it('should handle very wide sketch', () => {
      const s = new CountMinSketch<string>(10000, 3)
      s.update('item', 10)
      expect(s.query('item')).toBeGreaterThanOrEqual(10)
      expect(s.width).toBe(10000)
    })

    it('should handle very deep sketch', () => {
      const s = new CountMinSketch<string>(100, 20)
      s.update('item', 10)
      expect(s.query('item')).toBeGreaterThanOrEqual(10)
      expect(s.depth).toBe(20)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_COUNTMINSKETCH_OPTIONS', () => {
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS.width).toBe(1000)
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS.depth).toBe(5)
    })

    it('should support CountMinSketchOptions interface', () => {
      const opts: CountMinSketchOptions = {
        width: 500,
        depth: 7,
      }
      expect(opts.width).toBe(500)
      expect(opts.depth).toBe(7)
    })

    it('should support CountMinSketchJSON interface', () => {
      const json: CountMinSketchJSON = {
        matrix: [[0, 1, 2]],
        width: 3,
        depth: 1,
        totalCount: 3,
      }
      expect(json.width).toBe(3)
      expect(json.depth).toBe(1)
    })
  })
})
