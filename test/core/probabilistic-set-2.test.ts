import { describe, it, expect } from 'vitest'
import { ProbabilisticSet2 } from '../../src/core/probabilistic-set-2/index.js'

describe('ProbabilisticSet2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates set with default parameters', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.size).toBe(0)
      expect(ps.isEmpty()).toBe(true)
    })

    it('creates set with custom expected size', () => {
      const ps = new ProbabilisticSet2<string>(500, 0.01)
      expect(ps.isEmpty()).toBe(true)
    })

    it('creates set with custom false positive rate', () => {
      const ps = new ProbabilisticSet2<string>(1000, 0.001)
      expect(ps.falsePositiveRate()).toBe(0.001)
    })

    it('allocates more bits for lower false positive rate', () => {
      const ps1 = new ProbabilisticSet2<string>(1000, 0.1)
      const ps2 = new ProbabilisticSet2<string>(1000, 0.001)
      expect(ps2.bitCount()).toBeGreaterThan(ps1.bitCount())
    })

    it('allocates more bits for larger expected size', () => {
      const ps1 = new ProbabilisticSet2<string>(100, 0.01)
      const ps2 = new ProbabilisticSet2<string>(10000, 0.01)
      expect(ps2.bitCount()).toBeGreaterThan(ps1.bitCount())
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds a single element', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('hello')
      expect(ps.size).toBe(1)
    })

    it('adds multiple elements', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('a')
      ps.add('b')
      ps.add('c')
      expect(ps.size).toBe(3)
    })

    it('increments size for duplicate adds', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('same')
      ps.add('same')
      expect(ps.size).toBe(2)
    })

    it('handles empty string', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('')
      expect(ps.size).toBe(1)
      expect(ps.has('')).toBe(true)
    })

    it('handles numeric types', () => {
      const ps = new ProbabilisticSet2<number>()
      ps.add(42)
      ps.add(100)
      expect(ps.size).toBe(2)
      expect(ps.has(42)).toBe(true)
    })

    it('handles special characters', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('!@#$%^&*()')
      ps.add('你好世界')
      ps.add('🎉')
      expect(ps.size).toBe(3)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns false for empty set', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.has('anything')).toBe(false)
    })

    it('returns true for added element', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('hello')
      expect(ps.has('hello')).toBe(true)
    })

    it('returns true for all added elements', () => {
      const ps = new ProbabilisticSet2<string>()
      const items = ['a', 'b', 'c', 'd', 'e']
      for (const item of items) ps.add(item)
      for (const item of items) {
        expect(ps.has(item)).toBe(true)
      }
    })

    it('no false negatives for many elements', () => {
      const ps = new ProbabilisticSet2<string>(2000, 0.01)
      const items: string[] = []
      for (let i = 0; i < 1000; i++) {
        ps.add(`item_${i}`)
        items.push(`item_${i}`)
      }
      for (const item of items) {
        expect(ps.has(item)).toBe(true)
      }
    })

    it('mostly returns false for non-added elements', () => {
      const ps = new ProbabilisticSet2<string>(1000, 0.01)
      for (let i = 0; i < 100; i++) ps.add(`item_${i}`)
      let falsePositives = 0
      for (let i = 100; i < 1100; i++) {
        if (ps.has(`other_${i}`)) falsePositives++
      }
      expect(falsePositives).toBeLessThan(100)
    })
  })

  // ─── Size ───

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.size).toBe(0)
    })

    it('increments with each add', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('a')
      expect(ps.size).toBe(1)
      ps.add('b')
      expect(ps.size).toBe(2)
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('x')
      expect(ps.isEmpty()).toBe(false)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('a')
      ps.add('b')
      ps.clear()
      expect(ps.size).toBe(0)
      expect(ps.isEmpty()).toBe(true)
    })

    it('allows add after clear', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('before')
      ps.clear()
      ps.add('after')
      expect(ps.size).toBe(1)
      expect(ps.has('after')).toBe(true)
    })

    it('clear on empty set does nothing harmful', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.clear()
      expect(ps.size).toBe(0)
    })
  })

  // ─── FalsePositiveRate ───

  describe('falsePositiveRate', () => {
    it('returns configured rate', () => {
      const ps = new ProbabilisticSet2<string>(1000, 0.05)
      expect(ps.falsePositiveRate()).toBe(0.05)
    })

    it('returns default rate', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.falsePositiveRate()).toBe(0.01)
    })
  })

  // ─── BitCount ───

  describe('bitCount', () => {
    it('returns positive bit count', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.bitCount()).toBeGreaterThan(0)
    })

    it('returns multiple of 8', () => {
      const ps = new ProbabilisticSet2<string>()
      expect(ps.bitCount() % 8).toBe(0)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles long strings', () => {
      const ps = new ProbabilisticSet2<string>()
      const longStr = 'a'.repeat(10000)
      ps.add(longStr)
      expect(ps.has(longStr)).toBe(true)
    })

    it('handles whitespace strings', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add(' ')
      ps.add('  ')
      ps.add('\t')
      ps.add('\n')
      expect(ps.has(' ')).toBe(true)
      expect(ps.has('\t')).toBe(true)
    })

    it('stress test with many items', () => {
      const ps = new ProbabilisticSet2<string>(10000, 0.01)
      for (let i = 0; i < 5000; i++) {
        ps.add(`item_${i}`)
      }
      expect(ps.size).toBe(5000)
      expect(ps.has('item_0')).toBe(true)
      expect(ps.has('item_4999')).toBe(true)
    })

    it('add clear add cycle', () => {
      const ps = new ProbabilisticSet2<string>()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 50; i++) ps.add(`el_${i}`)
        expect(ps.size).toBe(50)
        ps.clear()
        expect(ps.size).toBe(0)
      }
    })

    it('handles boolean-like string values', () => {
      const ps = new ProbabilisticSet2<string>()
      ps.add('true')
      ps.add('false')
      ps.add('null')
      ps.add('undefined')
      expect(ps.has('true')).toBe(true)
      expect(ps.has('false')).toBe(true)
    })

    it('handles object types via toString', () => {
      const ps = new ProbabilisticSet2<object>()
      const obj = { key: 'value' }
      ps.add(obj)
      expect(ps.has(obj)).toBe(true)
    })
  })
})
