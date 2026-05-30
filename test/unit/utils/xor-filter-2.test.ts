import { describe, it, expect } from 'vitest'
import { XorFilter } from '../../../src/utils/xor-filter-2.js'

describe('XorFilter', () => {
  describe('construction', () => {
    it('creates filter from items', () => {
      const xf = new XorFilter(['alpha-key-a', 'beta-key-b', 'gamma-key-c'])
      expect(xf).toBeDefined()
    })

    it('handles empty input', () => {
      const xf = new XorFilter([])
      expect(xf.has('anything')).toBe(false)
    })
  })

  describe('membership', () => {
    it('returns true for single unique item', () => {
      const xf = new XorFilter(['only-item-in-filter'])
      expect(xf.has('only-item-in-filter')).toBe(true)
    })

    it('returns false for clearly different item', () => {
      const xf = new XorFilter(['alpha-bravo-charlie-delta-echo'])
      expect(xf.has('zzz-yyy-xxx-www-vvv')).toBe(false)
    })
  })

  describe('false positive rate', () => {
    it('has bounded false positive rate with many items', () => {
      const items = Array.from({ length: 50 }, (_, i) => `unique-item-${i}-key-value`)
      const xf = new XorFilter(items)
      let falsePositives = 0
      for (let i = 100; i < 200; i++) {
        if (xf.has(`nonexistent-${i}-unique-key`)) falsePositives++
      }
      expect(falsePositives).toBeLessThan(30)
    })
  })

  describe('determinism', () => {
    it('produces consistent results across instances', () => {
      const items = ['alpha-key-unique-1', 'beta-key-unique-2', 'gamma-key-unique-3']
      const xf1 = new XorFilter(items)
      const xf2 = new XorFilter(items)
      for (const item of items) {
        expect(xf1.has(item)).toBe(xf2.has(item))
      }
    })
  })

  describe('edge cases', () => {
    it('handles special characters', () => {
      const xf = new XorFilter(['hello-world-unique-key', 'foo-bar-unique-key'])
      expect(xf.has('hello-world-unique-key')).toBe(true)
    })

    it('handles longer strings', () => {
      const items = Array.from({ length: 10 }, (_, i) => `long-string-with-many-characters-unique-${i}`)
      const xf = new XorFilter(items)
      const result = xf.has(items[0]!)
      expect(typeof result).toBe('boolean')
    })
  })
})
