import { describe, it, expect } from 'vitest'
import { SimpleBloomFilter } from '../src/utils/simple-bloom-filter.js'
import { CountMinSketchWeighted } from '../src/utils/count-min-sketch-weighted.js'
import { HyperLogLog } from '../src/utils/hyper-log-log.js'
import { MinHash } from '../src/utils/min-hash.js'

describe('Probabilistic invariants', () => {
  describe('BloomFilter', () => {
    it('never has false negatives', () => {
      const bf = new SimpleBloomFilter(1000, 0.01)
      const items = Array.from({ length: 500 }, (_, i) => `item-${i}`)
      for (const item of items) bf.add(item)
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })

    it('false positive rate stays within expected bounds', () => {
      const bf = new SimpleBloomFilter(1000, 0.01)
      for (let i = 0; i < 500; i++) bf.add(`present-${i}`)
      let falsePositives = 0
      const trials = 5000
      for (let i = 0; i < trials; i++) {
        if (bf.has(`absent-${i}`)) falsePositives++
      }
      expect(falsePositives / trials).toBeLessThan(0.05)
    })

    it('has() returns false for empty filter', () => {
      const bf = new SimpleBloomFilter(100, 0.01)
      expect(bf.has('anything')).toBe(false)
    })
  })

  describe('CountMinSketchWeighted', () => {
    it('count estimate is always >= actual count', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      const counts = new Map<string, number>()
      for (let i = 0; i < 200; i++) {
        const item = `item-${i % 20}`
        cms.add(item)
        counts.set(item, (counts.get(item) ?? 0) + 1)
      }
      for (const [item, expected] of counts) {
        expect(cms.count(item)).toBeGreaterThanOrEqual(expected)
      }
    })

    it('total tracks sum of all counts', () => {
      const cms = new CountMinSketchWeighted(50, 3)
      let expectedTotal = 0
      for (let i = 0; i < 100; i++) {
        cms.add(`item-${i % 10}`, 1 + (i % 3))
        expectedTotal += 1 + (i % 3)
      }
      expect(cms.total).toBe(expectedTotal)
    })

    it('count is 0 for empty sketch', () => {
      const cms = new CountMinSketchWeighted(50, 3)
      expect(cms.count('missing')).toBe(0)
    })

    it('heavyHitters returns items above threshold', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      for (let i = 0; i < 100; i++) cms.add('frequent', 10)
      for (let i = 0; i < 100; i++) cms.add(`rare-${i}`)
      const hitters = cms.heavyHitters(0.1)
      expect(hitters).toContain('frequent')
    })
  })

  describe('HyperLogLog', () => {
    it('estimate is within 50-200% of actual for 1000 items', () => {
      const hll = new HyperLogLog(12)
      const n = 1000
      for (let i = 0; i < n; i++) hll.add(`item-${i}`)
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(n * 0.5)
      expect(estimate).toBeLessThan(n * 2)
    })

    it('estimate for empty set is 0', () => {
      const hll = new HyperLogLog(10)
      expect(hll.count()).toBe(0)
    })

    it('merge produces larger estimate', () => {
      const a = new HyperLogLog(10)
      const b = new HyperLogLog(10)
      for (let i = 0; i < 500; i++) a.add(`a-${i}`)
      for (let i = 0; i < 500; i++) b.add(`b-${i}`)
      const merged = a.merge(b)
      expect(merged.count()).toBeGreaterThan(a.count())
    })

    it('adding duplicates does not inflate count significantly', () => {
      const hll = new HyperLogLog(12)
      for (let r = 0; r < 10; r++) {
        for (let i = 0; i < 100; i++) hll.add(`item-${i}`)
      }
      expect(hll.count()).toBeLessThan(300)
    })
  })

  describe('MinHash', () => {
    it('identical sets produce similarity close to 1', () => {
      const a = new MinHash(256, 42)
      const b = new MinHash(256, 42)
      for (let i = 0; i < 200; i++) {
        a.add(`item-${i}`)
        b.add(`item-${i}`)
      }
      expect(a.similarity(b)).toBeGreaterThan(0.85)
    })

    it('disjoint sets produce similarity close to 0', () => {
      const a = new MinHash(256, 42)
      const b = new MinHash(256, 42)
      for (let i = 0; i < 200; i++) {
        a.add(`set-a-${i}`)
        b.add(`set-b-${i}`)
      }
      expect(a.similarity(b)).toBeLessThan(0.15)
    })

    it('clone produces identical signatures', () => {
      const mh = new MinHash(64, 0)
      for (let i = 0; i < 50; i++) mh.add(`item-${i}`)
      const clone = mh.clone()
      expect(clone.signature).toEqual(mh.signature)
    })

    it('merge produces subset signature', () => {
      const a = new MinHash(64, 0)
      const b = new MinHash(64, 0)
      a.addBatch(Array.from({ length: 50 }, (_, i) => `a-${i}`))
      b.addBatch(Array.from({ length: 50 }, (_, i) => `b-${i}`))
      const origA = [...a.signature]
      a.merge(b)
      for (let i = 0; i < 64; i++) {
        expect(a.signature[i]!).toBeLessThanOrEqual(origA[i]!)
      }
    })
  })
})
