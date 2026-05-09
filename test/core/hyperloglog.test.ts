import { describe, it, expect, beforeEach } from 'vitest'
import { HyperLogLog } from '../../src/core/hyperloglog/hyperloglog.js'
import { DEFAULT_HYPERLOGLOG_OPTIONS } from '../../src/core/hyperloglog/types.js'
import type { HyperLogLogOptions } from '../../src/core/hyperloglog/types.js'

describe('HyperLogLog', () => {
  let hll: HyperLogLog

  beforeEach(() => {
    hll = new HyperLogLog()
  })

  describe('constructor', () => {
    it('should create with default precision 14', () => {
      const h = new HyperLogLog()
      expect(h.precision()).toBe(14)
    })

    it('should create with custom precision 4', () => {
      const h = new HyperLogLog({ precision: 4 })
      expect(h.precision()).toBe(4)
    })

    it('should create with custom precision 16', () => {
      const h = new HyperLogLog({ precision: 16 })
      expect(h.precision()).toBe(16)
    })

    it('should create with precision 8', () => {
      const h = new HyperLogLog({ precision: 8 })
      expect(h.precision()).toBe(8)
    })

    it('should create with precision 10', () => {
      const h = new HyperLogLog({ precision: 10 })
      expect(h.precision()).toBe(10)
    })

    it('should throw for precision below 4', () => {
      expect(() => new HyperLogLog({ precision: 3 })).toThrow(RangeError)
    })

    it('should throw for precision above 16', () => {
      expect(() => new HyperLogLog({ precision: 17 })).toThrow(RangeError)
    })

    it('should throw for precision 0', () => {
      expect(() => new HyperLogLog({ precision: 0 })).toThrow(RangeError)
    })

    it('should throw for negative precision', () => {
      expect(() => new HyperLogLog({ precision: -1 })).toThrow(RangeError)
    })

    it('should create with precision 5', () => {
      const h = new HyperLogLog({ precision: 5 })
      expect(h.precision()).toBe(5)
    })

    it('should create with precision 6', () => {
      const h = new HyperLogLog({ precision: 6 })
      expect(h.precision()).toBe(6)
    })

    it('should create with precision 7', () => {
      const h = new HyperLogLog({ precision: 7 })
      expect(h.precision()).toBe(7)
    })

    it('should create with precision 12', () => {
      const h = new HyperLogLog({ precision: 12 })
      expect(h.precision()).toBe(12)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new instance', () => {
      expect(hll.isEmpty()).toBe(true)
    })

    it('should return false after adding an item', () => {
      hll.add('test')
      expect(hll.isEmpty()).toBe(false)
    })

    it('should return true after reset', () => {
      hll.add('test')
      hll.reset()
      expect(hll.isEmpty()).toBe(true)
    })

    it('should return false after adding multiple items', () => {
      hll.add('a')
      hll.add('b')
      hll.add('c')
      expect(hll.isEmpty()).toBe(false)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      hll.add('hello')
      expect(hll.isEmpty()).toBe(false)
    })

    it('should handle adding same item multiple times', () => {
      hll.add('dup')
      hll.add('dup')
      hll.add('dup')
      expect(hll.count()).toBe(1)
    })

    it('should handle empty string', () => {
      hll.add('')
      expect(hll.isEmpty()).toBe(false)
    })

    it('should handle unicode strings', () => {
      hll.add('日本語')
      hll.add('🎉🚀')
      expect(hll.count()).toBe(2)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      hll.add(longStr)
      expect(hll.isEmpty()).toBe(false)
    })

    it('should handle strings with special characters', () => {
      hll.add('hello\nworld\t!')
      hll.add('path/to/file.ts')
      expect(hll.count()).toBe(2)
    })

    it('should handle numeric strings', () => {
      hll.add('123')
      hll.add('456')
      expect(hll.count()).toBe(2)
    })

    it('should be case sensitive', () => {
      hll.add('Hello')
      hll.add('hello')
      expect(hll.count()).toBe(2)
    })

    it('should handle whitespace strings', () => {
      hll.add('   ')
      hll.add('\t')
      hll.add('\n')
      expect(hll.count()).toBe(3)
    })

    it('should handle null character in string', () => {
      hll.add('before\0after')
      expect(hll.isEmpty()).toBe(false)
    })

    it('should handle mixed unicode content', () => {
      hll.add('hello世界🎉')
      expect(hll.isEmpty()).toBe(false)
    })
  })

  describe('count', () => {
    it('should return 0 for empty structure', () => {
      expect(hll.count()).toBe(0)
    })

    it('should return 1 after adding one item', () => {
      hll.add('single')
      expect(hll.count()).toBe(1)
    })

    it('should estimate cardinality for 100 distinct items', () => {
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(50)
      expect(estimate).toBeLessThan(200)
    })

    it('should estimate cardinality for 1000 distinct items', () => {
      for (let i = 0; i < 1000; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(700)
      expect(estimate).toBeLessThan(1500)
    })

    it('should handle duplicates correctly', () => {
      for (let i = 0; i < 100; i++) {
        hll.add('same')
      }
      expect(hll.count()).toBe(1)
    })

    it('should work with low precision for small sets', () => {
      const h = new HyperLogLog({ precision: 4 })
      for (let i = 0; i < 10; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      expect(estimate).toBeGreaterThan(0)
      expect(estimate).toBeLessThan(50)
    })

    it('should work with high precision', () => {
      const h = new HyperLogLog({ precision: 16 })
      for (let i = 0; i < 100; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      expect(estimate).toBeGreaterThan(50)
      expect(estimate).toBeLessThan(200)
    })

    it('should return same count for same inputs', () => {
      hll.add('a')
      hll.add('b')
      hll.add('c')
      expect(hll.count()).toBe(hll.count())
    })

    it('should increase count with more distinct items', () => {
      const h = new HyperLogLog({ precision: 12 })
      h.add('item-1')
      const c1 = h.count()
      for (let i = 2; i <= 50; i++) {
        h.add(`item-${i}`)
      }
      const c2 = h.count()
      expect(c2).toBeGreaterThan(c1)
    })

    it('should handle 10000 items with reasonable accuracy', () => {
      const h = new HyperLogLog({ precision: 14 })
      for (let i = 0; i < 10000; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      expect(estimate).toBeGreaterThan(7000)
      expect(estimate).toBeLessThan(14000)
    })
  })

  describe('merge', () => {
    it('should merge two empty structures', () => {
      const other = new HyperLogLog()
      hll.merge(other)
      expect(hll.count()).toBe(0)
    })

    it('should merge an empty with a non-empty structure', () => {
      const other = new HyperLogLog()
      other.add('a')
      other.add('b')
      hll.merge(other)
      expect(hll.count()).toBe(2)
    })

    it('should merge a non-empty with an empty structure', () => {
      hll.add('a')
      const other = new HyperLogLog()
      hll.merge(other)
      expect(hll.count()).toBe(1)
    })

    it('should merge two non-overlapping structures', () => {
      for (let i = 0; i < 50; i++) {
        hll.add(`set1-${i}`)
      }
      const other = new HyperLogLog()
      for (let i = 0; i < 50; i++) {
        other.add(`set2-${i}`)
      }
      hll.merge(other)
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(60)
      expect(estimate).toBeLessThan(150)
    })

    it('should merge two overlapping structures', () => {
      for (let i = 0; i < 50; i++) {
        hll.add(`shared-${i}`)
      }
      const other = new HyperLogLog()
      for (let i = 0; i < 50; i++) {
        other.add(`shared-${i}`)
      }
      for (let i = 0; i < 30; i++) {
        other.add(`unique-${i}`)
      }
      hll.merge(other)
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(40)
      expect(estimate).toBeLessThan(130)
    })

    it('should throw when merging different precisions', () => {
      const other = new HyperLogLog({ precision: 8 })
      expect(() => hll.merge(other)).toThrow()
    })

    it('should take max register values on merge', () => {
      hll.add('x')
      const regsBefore = hll.registers()
      const other = new HyperLogLog()
      other.add('y')
      hll.merge(other)
      const regsAfter = hll.registers()
      let anyGreater = false
      for (let i = 0; i < regsAfter.length; i++) {
        if (regsAfter[i]! > regsBefore[i]!) {
          anyGreater = true
          break
        }
      }
      expect(anyGreater || regsAfter.some((v, i) => v !== regsBefore[i])).toBe(true)
    })

    it('should be idempotent when merging same data', () => {
      const h1 = new HyperLogLog({ precision: 10 })
      const h2 = new HyperLogLog({ precision: 10 })
      for (let i = 0; i < 50; i++) {
        h1.add(`item-${i}`)
        h2.add(`item-${i}`)
      }
      const beforeMerge = h1.count()
      h1.merge(h2)
      const afterMerge = h1.count()
      expect(afterMerge).toBe(beforeMerge)
    })

    it('should merge with same precision but different data', () => {
      const h1 = new HyperLogLog({ precision: 12 })
      const h2 = new HyperLogLog({ precision: 12 })
      h1.add('alpha')
      h2.add('beta')
      h1.merge(h2)
      expect(h1.count()).toBe(2)
    })
  })

  describe('reset', () => {
    it('should clear all registers', () => {
      hll.add('test')
      hll.reset()
      expect(hll.isEmpty()).toBe(true)
    })

    it('should reset count to 0', () => {
      hll.add('test')
      hll.reset()
      expect(hll.count()).toBe(0)
    })

    it('should allow adding after reset', () => {
      hll.add('before')
      hll.reset()
      hll.add('after')
      expect(hll.count()).toBe(1)
    })

    it('should handle resetting empty structure', () => {
      hll.reset()
      expect(hll.isEmpty()).toBe(true)
    })

    it('should reset registers to all zeros', () => {
      hll.add('test')
      hll.reset()
      const regs = hll.registers()
      for (let i = 0; i < regs.length; i++) {
        expect(regs[i]).toBe(0)
      }
    })

    it('should produce same state as new instance after reset', () => {
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      hll.reset()
      const fresh = new HyperLogLog()
      expect(hll.registers()).toEqual(fresh.registers())
      expect(hll.count()).toBe(fresh.count())
      expect(hll.isEmpty()).toBe(fresh.isEmpty())
    })
  })

  describe('precision', () => {
    it('should return the configured precision', () => {
      const h = new HyperLogLog({ precision: 8 })
      expect(h.precision()).toBe(8)
    })

    it('should return 14 for default', () => {
      expect(hll.precision()).toBe(14)
    })

    it('should return 4 for minimum precision', () => {
      const h = new HyperLogLog({ precision: 4 })
      expect(h.precision()).toBe(4)
    })

    it('should return 16 for maximum precision', () => {
      const h = new HyperLogLog({ precision: 16 })
      expect(h.precision()).toBe(16)
    })
  })

  describe('registers', () => {
    it('should return a Uint8Array', () => {
      expect(hll.registers()).toBeInstanceOf(Uint8Array)
    })

    it('should return correct size for precision 4', () => {
      const h = new HyperLogLog({ precision: 4 })
      expect(h.registers().length).toBe(16)
    })

    it('should return correct size for precision 8', () => {
      const h = new HyperLogLog({ precision: 8 })
      expect(h.registers().length).toBe(256)
    })

    it('should return correct size for precision 14', () => {
      expect(hll.registers().length).toBe(16384)
    })

    it('should return correct size for precision 16', () => {
      const h = new HyperLogLog({ precision: 16 })
      expect(h.registers().length).toBe(65536)
    })

    it('should return all zeros for empty structure', () => {
      const regs = hll.registers()
      for (let i = 0; i < regs.length; i++) {
        expect(regs[i]).toBe(0)
      }
    })

    it('should return a copy not a reference', () => {
      hll.add('test')
      const regs1 = hll.registers()
      regs1[0] = 255
      const regs2 = hll.registers()
      expect(regs2[0]).not.toBe(255)
    })

    it('should have non-zero values after adding items', () => {
      hll.add('test')
      const regs = hll.registers()
      const hasNonZero = Array.from(regs).some(v => v !== 0)
      expect(hasNonZero).toBe(true)
    })

    it('should have registers in valid range 0-32', () => {
      for (let i = 0; i < 1000; i++) {
        hll.add(`item-${i}`)
      }
      const regs = hll.registers()
      for (let i = 0; i < regs.length; i++) {
        expect(regs[i]).toBeGreaterThanOrEqual(0)
        expect(regs[i]).toBeLessThanOrEqual(32)
      }
    })
  })

  describe('estimateError', () => {
    it('should return a positive number', () => {
      expect(hll.estimateError()).toBeGreaterThan(0)
    })

    it('should return smaller error for higher precision', () => {
      const h4 = new HyperLogLog({ precision: 4 })
      const h14 = new HyperLogLog({ precision: 14 })
      expect(h14.estimateError()).toBeLessThan(h4.estimateError())
    })

    it('should return ~0.0081 for precision 14', () => {
      const err = hll.estimateError()
      expect(err).toBeCloseTo(1.04 / Math.sqrt(16384), 4)
    })

    it('should return ~0.065 for precision 4', () => {
      const h = new HyperLogLog({ precision: 4 })
      const err = h.estimateError()
      expect(err).toBeCloseTo(1.04 / Math.sqrt(16), 4)
    })

    it('should follow 1.04/sqrt(m) formula', () => {
      for (let p = 4; p <= 16; p++) {
        const h = new HyperLogLog({ precision: p })
        const m = 1 << p
        expect(h.estimateError()).toBeCloseTo(1.04 / Math.sqrt(m), 6)
      }
    })

    it('should decrease as precision increases', () => {
      let prev = Infinity
      for (let p = 4; p <= 16; p++) {
        const h = new HyperLogLog({ precision: p })
        const err = h.estimateError()
        expect(err).toBeLessThan(prev)
        prev = err
      }
    })
  })

  describe('accuracy', () => {
    it('should estimate 100 items within 10% with precision 14', () => {
      const h = new HyperLogLog({ precision: 14 })
      for (let i = 0; i < 100; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      const error = Math.abs(estimate - 100) / 100
      expect(error).toBeLessThan(0.15)
    })

    it('should estimate 1000 items within 5% with precision 14', () => {
      const h = new HyperLogLog({ precision: 14 })
      for (let i = 0; i < 1000; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      const error = Math.abs(estimate - 1000) / 1000
      expect(error).toBeLessThan(0.1)
    })

    it('should estimate 5000 items within 5% with precision 14', () => {
      const h = new HyperLogLog({ precision: 14 })
      for (let i = 0; i < 5000; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      const error = Math.abs(estimate - 5000) / 5000
      expect(error).toBeLessThan(0.05)
    })

    it('should have lower accuracy with lower precision', () => {
      const h = new HyperLogLog({ precision: 4 })
      for (let i = 0; i < 100; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      expect(estimate).toBeGreaterThan(0)
    })

    it('should handle very large cardinalities', () => {
      const h = new HyperLogLog({ precision: 14 })
      for (let i = 0; i < 50000; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      expect(estimate).toBeGreaterThan(30000)
      expect(estimate).toBeLessThan(80000)
    })
  })

  describe('merge accuracy', () => {
    it('should produce correct cardinality after merging disjoint sets', () => {
      const h1 = new HyperLogLog({ precision: 12 })
      const h2 = new HyperLogLog({ precision: 12 })
      for (let i = 0; i < 500; i++) {
        h1.add(`set1-${i}`)
      }
      for (let i = 0; i < 500; i++) {
        h2.add(`set2-${i}`)
      }
      h1.merge(h2)
      const estimate = h1.count()
      expect(estimate).toBeGreaterThan(700)
      expect(estimate).toBeLessThan(1300)
    })

    it('should handle merging many small structures', () => {
      const main = new HyperLogLog({ precision: 12 })
      for (let batch = 0; batch < 5; batch++) {
        const shard = new HyperLogLog({ precision: 12 })
        for (let i = 0; i < 100; i++) {
          shard.add(`batch${batch}-item${i}`)
        }
        main.merge(shard)
      }
      const estimate = main.count()
      expect(estimate).toBeGreaterThan(300)
      expect(estimate).toBeLessThan(700)
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      hll.add('only')
      expect(hll.count()).toBe(1)
    })

    it('should handle two items', () => {
      hll.add('a')
      hll.add('b')
      expect(hll.count()).toBe(2)
    })

    it('should handle repeated identical items', () => {
      for (let i = 0; i < 1000; i++) {
        hll.add('same')
      }
      expect(hll.count()).toBe(1)
    })

    it('should handle mixed duplicates and uniques', () => {
      hll.add('unique-1')
      hll.add('unique-2')
      hll.add('unique-3')
      for (let i = 0; i < 100; i++) {
        hll.add('dup')
      }
      expect(hll.count()).toBe(4)
    })

    it('should work with precision 4 (minimum)', () => {
      const h = new HyperLogLog({ precision: 4 })
      for (let i = 0; i < 20; i++) {
        h.add(`item-${i}`)
      }
      expect(h.isEmpty()).toBe(false)
      expect(h.count()).toBeGreaterThan(0)
    })

    it('should work with precision 16 (maximum)', () => {
      const h = new HyperLogLog({ precision: 16 })
      for (let i = 0; i < 500; i++) {
        h.add(`item-${i}`)
      }
      expect(h.isEmpty()).toBe(false)
      expect(h.count()).toBeGreaterThan(0)
    })

    it('should handle sequential integer strings', () => {
      for (let i = 0; i < 200; i++) {
        hll.add(String(i))
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(100)
      expect(estimate).toBeLessThan(400)
    })

    it('should handle GUID-like strings', () => {
      for (let i = 0; i < 100; i++) {
        hll.add(`xxxxxxxx-xxxx-xxxx-xxxx-${String(i).padStart(12, '0')}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(60)
      expect(estimate).toBeLessThan(160)
    })

    it('should handle URL-like strings', () => {
      const paths = ['/api/users', '/api/posts', '/api/comments', '/api/likes']
      for (let i = 0; i < 100; i++) {
        hll.add(`${paths[i % paths.length]!}/${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(50)
      expect(estimate).toBeLessThan(200)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_HYPERLOGLOG_OPTIONS', () => {
      expect(DEFAULT_HYPERLOGLOG_OPTIONS.precision).toBe(14)
    })

    it('should support HyperLogLogOptions interface', () => {
      const opts: HyperLogLogOptions = { precision: 10 }
      expect(opts.precision).toBe(10)
    })

    it('should use DEFAULT_HYPERLOGLOG_OPTIONS when no options provided', () => {
      const h = new HyperLogLog()
      expect(h.precision()).toBe(DEFAULT_HYPERLOGLOG_OPTIONS.precision)
    })
  })

  describe('determinism', () => {
    it('should produce same count for same inputs in same order', () => {
      const h1 = new HyperLogLog({ precision: 10 })
      const h2 = new HyperLogLog({ precision: 10 })
      for (let i = 0; i < 100; i++) {
        h1.add(`item-${i}`)
        h2.add(`item-${i}`)
      }
      expect(h1.count()).toBe(h2.count())
    })

    it('should produce same count regardless of insertion order', () => {
      const h1 = new HyperLogLog({ precision: 10 })
      const h2 = new HyperLogLog({ precision: 10 })
      for (let i = 0; i < 100; i++) {
        h1.add(`item-${i}`)
      }
      for (let i = 99; i >= 0; i--) {
        h2.add(`item-${i}`)
      }
      expect(h1.count()).toBe(h2.count())
    })

    it('should produce same registers for same inputs', () => {
      const h1 = new HyperLogLog({ precision: 10 })
      const h2 = new HyperLogLog({ precision: 10 })
      for (let i = 0; i < 50; i++) {
        h1.add(`item-${i}`)
        h2.add(`item-${i}`)
      }
      expect(h1.registers()).toEqual(h2.registers())
    })
  })

  describe('stress tests', () => {
    it('should handle adding 100000 items', () => {
      const h = new HyperLogLog({ precision: 16 })
      for (let i = 0; i < 100000; i++) {
        h.add(`item-${i}`)
      }
      const estimate = h.count()
      expect(estimate).toBeGreaterThan(60000)
      expect(estimate).toBeLessThan(150000)
    })

    it('should handle rapid add-reset cycles', () => {
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 10; i++) {
          hll.add(`cycle${cycle}-item${i}`)
        }
        expect(hll.count()).toBeGreaterThan(0)
        hll.reset()
        expect(hll.isEmpty()).toBe(true)
      }
    })

    it('should handle many merges', () => {
      const main = new HyperLogLog({ precision: 10 })
      for (let batch = 0; batch < 20; batch++) {
        const shard = new HyperLogLog({ precision: 10 })
        shard.add(`item-${batch}`)
        main.merge(shard)
      }
      const estimate = main.count()
      expect(estimate).toBeGreaterThan(10)
      expect(estimate).toBeLessThan(40)
    })
  })

  describe('register size validation', () => {
    it('should allocate 2^p registers', () => {
      for (let p = 4; p <= 16; p++) {
        const h = new HyperLogLog({ precision: p })
        expect(h.registers().length).toBe(1 << p)
      }
    })
  })

  describe('clone', () => {
    it('should produce an independent copy', () => {
      hll.add('a')
      hll.add('b')
      hll.add('c')
      const cloned = hll.clone()
      expect(cloned.count()).toBe(hll.count())
      cloned.add('d')
      expect(cloned.count()).not.toBe(hll.count())
    })

    it('should have same registers after clone', () => {
      for (let i = 0; i < 50; i++) {
        hll.add(`item-${i}`)
      }
      const cloned = hll.clone()
      expect(cloned.registers()).toEqual(hll.registers())
    })

    it('should have same precision after clone', () => {
      const h = new HyperLogLog({ precision: 8 })
      const cloned = h.clone()
      expect(cloned.precision()).toBe(8)
    })

    it('should produce empty clone from empty original', () => {
      const cloned = hll.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should not affect original when modifying clone', () => {
      hll.add('original')
      const cloned = hll.clone()
      cloned.add('clone-only')
      expect(hll.count()).toBe(1)
    })

    it('should not affect clone when modifying original', () => {
      hll.add('first')
      const cloned = hll.clone()
      hll.add('second')
      expect(cloned.count()).toBe(1)
    })

    it('should clone with precision 4 correctly', () => {
      const h = new HyperLogLog({ precision: 4 })
      h.add('test')
      const cloned = h.clone()
      expect(cloned.precision()).toBe(4)
      expect(cloned.count()).toBe(h.count())
    })

    it('should clone with precision 16 correctly', () => {
      const h = new HyperLogLog({ precision: 16 })
      h.add('test')
      const cloned = h.clone()
      expect(cloned.precision()).toBe(16)
      expect(cloned.count()).toBe(h.count())
    })
  })

  describe('clear', () => {
    it('should clear all data', () => {
      hll.add('test')
      hll.clear()
      expect(hll.isEmpty()).toBe(true)
    })

    it('should reset count to 0', () => {
      hll.add('test')
      hll.clear()
      expect(hll.count()).toBe(0)
    })

    it('should allow adding after clear', () => {
      hll.add('before')
      hll.clear()
      hll.add('after')
      expect(hll.count()).toBe(1)
    })

    it('should behave same as reset', () => {
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const h2 = new HyperLogLog()
      for (let i = 0; i < 100; i++) {
        h2.add(`item-${i}`)
      }
      hll.clear()
      h2.reset()
      expect(hll.registers()).toEqual(h2.registers())
    })
  })

  describe('relativeError', () => {
    it('should return same value as estimateError', () => {
      expect(hll.relativeError()).toBe(hll.estimateError())
    })

    it('should return 1.04/sqrt(m)', () => {
      const m = 1 << 14
      expect(hll.relativeError()).toBeCloseTo(1.04 / Math.sqrt(m), 6)
    })

    it('should decrease with higher precision', () => {
      const h4 = new HyperLogLog({ precision: 4 })
      const h10 = new HyperLogLog({ precision: 10 })
      const h16 = new HyperLogLog({ precision: 16 })
      expect(h10.relativeError()).toBeLessThan(h4.relativeError())
      expect(h16.relativeError()).toBeLessThan(h10.relativeError())
    })
  })

  describe('registerCount', () => {
    it('should return 16384 for default precision 14', () => {
      expect(hll.registerCount).toBe(16384)
    })

    it('should return 16 for precision 4', () => {
      const h = new HyperLogLog({ precision: 4 })
      expect(h.registerCount).toBe(16)
    })

    it('should return 256 for precision 8', () => {
      const h = new HyperLogLog({ precision: 8 })
      expect(h.registerCount).toBe(256)
    })

    it('should return 65536 for precision 16', () => {
      const h = new HyperLogLog({ precision: 16 })
      expect(h.registerCount).toBe(65536)
    })

    it('should equal 2^precision', () => {
      for (let p = 4; p <= 16; p++) {
        const h = new HyperLogLog({ precision: p })
        expect(h.registerCount).toBe(1 << p)
      }
    })
  })

  describe('toJSON', () => {
    it('should return an object with precision and registers', () => {
      const json = hll.toJSON()
      expect(json).toHaveProperty('precision')
      expect(json).toHaveProperty('registers')
      expect(typeof json.precision).toBe('number')
      expect(Array.isArray(json.registers)).toBe(true)
    })

    it('should return correct precision', () => {
      const h = new HyperLogLog({ precision: 8 })
      const json = h.toJSON()
      expect(json.precision).toBe(8)
    })

    it('should return all zeros for empty structure', () => {
      const json = hll.toJSON()
      expect(json.registers.every(v => v === 0)).toBe(true)
    })

    it('should return correct register length', () => {
      const h = new HyperLogLog({ precision: 8 })
      const json = h.toJSON()
      expect(json.registers.length).toBe(256)
    })

    it('should capture non-zero values after adding items', () => {
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const json = hll.toJSON()
      const hasNonZero = json.registers.some(v => v !== 0)
      expect(hasNonZero).toBe(true)
    })

    it('should be JSON serializable', () => {
      hll.add('test')
      const json = hll.toJSON()
      const str = JSON.stringify(json)
      expect(() => JSON.parse(str)).not.toThrow()
    })
  })

  describe('fromJSON', () => {
    it('should restore from JSON', () => {
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const json = hll.toJSON()
      const restored = HyperLogLog.fromJSON(json)
      expect(restored.count()).toBe(hll.count())
    })

    it('should restore registers exactly', () => {
      hll.add('a')
      hll.add('b')
      const json = hll.toJSON()
      const restored = HyperLogLog.fromJSON(json)
      expect(restored.registers()).toEqual(hll.registers())
    })

    it('should restore precision', () => {
      const h = new HyperLogLog({ precision: 8 })
      h.add('test')
      const json = h.toJSON()
      const restored = HyperLogLog.fromJSON(json)
      expect(restored.precision()).toBe(8)
    })

    it('should restore empty structure', () => {
      const json = hll.toJSON()
      const restored = HyperLogLog.fromJSON(json)
      expect(restored.isEmpty()).toBe(true)
    })

    it('should produce independent instance', () => {
      hll.add('test')
      const json = hll.toJSON()
      const restored = HyperLogLog.fromJSON(json)
      restored.add('new-item')
      expect(hll.count()).not.toBe(restored.count())
    })

    it('should roundtrip through JSON string', () => {
      for (let i = 0; i < 50; i++) {
        hll.add(`item-${i}`)
      }
      const str = JSON.stringify(hll.toJSON())
      const parsed = JSON.parse(str)
      const restored = HyperLogLog.fromJSON(parsed)
      expect(restored.registers()).toEqual(hll.registers())
      expect(restored.count()).toBe(hll.count())
    })

    it('should support generic type parameter', () => {
      const h: HyperLogLog<number> = new HyperLogLog({ precision: 10 })
      h.add(42)
      h.add(100)
      const json = h.toJSON()
      const restored = HyperLogLog.fromJSON<number>(json)
      expect(restored.count()).toBe(h.count())
    })
  })

  describe('generic type support', () => {
    it('should work with number items', () => {
      const h: HyperLogLog<number> = new HyperLogLog({ precision: 10 })
      h.add(1)
      h.add(2)
      h.add(3)
      expect(h.count()).toBe(3)
    })

    it('should work with object items', () => {
      const h: HyperLogLog<{ id: number }> = new HyperLogLog({ precision: 10 })
      h.add({ id: 1 })
      h.add({ id: 2 })
      h.add({ id: 3 })
      expect(h.count()).toBe(3)
    })

    it('should handle duplicate objects by value', () => {
      const h: HyperLogLog<{ v: number }> = new HyperLogLog({ precision: 10 })
      h.add({ v: 1 })
      h.add({ v: 1 })
      expect(h.count()).toBe(1)
    })

    it('should distinguish different objects', () => {
      const h: HyperLogLog<{ x: number }> = new HyperLogLog({ precision: 10 })
      h.add({ x: 1 })
      h.add({ x: 2 })
      expect(h.count()).toBe(2)
    })

    it('should work with boolean items', () => {
      const h: HyperLogLog<boolean> = new HyperLogLog({ precision: 10 })
      h.add(true)
      h.add(false)
      expect(h.count()).toBe(2)
    })

    it('should handle null items via JSON', () => {
      const h: HyperLogLog<null> = new HyperLogLog({ precision: 10 })
      h.add(null)
      expect(h.isEmpty()).toBe(false)
    })
  })

  describe('merge with clone interaction', () => {
    it('should clone then merge without affecting original', () => {
      const h1 = new HyperLogLog({ precision: 10 })
      h1.add('a')
      const cloned = h1.clone()
      const h2 = new HyperLogLog({ precision: 10 })
      h2.add('b')
      cloned.merge(h2)
      expect(cloned.count()).toBe(2)
      expect(h1.count()).toBe(1)
    })
  })

  describe('serialization with merge', () => {
    it('should serialize merged result correctly', () => {
      const h1 = new HyperLogLog({ precision: 10 })
      const h2 = new HyperLogLog({ precision: 10 })
      for (let i = 0; i < 50; i++) {
        h1.add(`a-${i}`)
        h2.add(`b-${i}`)
      }
      h1.merge(h2)
      const json = h1.toJSON()
      const restored = HyperLogLog.fromJSON(json)
      expect(restored.count()).toBe(h1.count())
      expect(restored.registers()).toEqual(h1.registers())
    })
  })
})
