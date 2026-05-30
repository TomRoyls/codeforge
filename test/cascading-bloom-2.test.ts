import { describe, it, expect } from 'vitest'
import { CascadingBloom2 } from '../src/core/cascading-bloom-2/index.js'

describe('CascadingBloom2', () => {
  describe('constructor', () => {
    it('creates with default config', () => {
      const cb = new CascadingBloom2()
      expect(cb.getFilterCount()).toBe(3)
      expect(cb.isEmpty()).toBe(true)
    })

    it('accepts custom config', () => {
      const cb = new CascadingBloom2({ numFilters: 5, numBits: 512, numHashes: 2 })
      expect(cb.getFilterCount()).toBe(5)
      expect(cb.getConfig().numBits).toBe(512)
    })
  })

  describe('add and mightContain', () => {
    it('finds added item', () => {
      const cb = new CascadingBloom2()
      cb.add('hello')
      expect(cb.mightContain('hello')).toBe(true)
    })

    it('does not find unadded item (usually)', () => {
      const cb = new CascadingBloom2()
      cb.add('hello')
      expect(cb.mightContain('never-added-item-xyz')).toBe(false)
    })

    it('tracks size', () => {
      const cb = new CascadingBloom2()
      cb.add('a')
      cb.add('b')
      cb.add('c')
      expect(cb.size()).toBe(3)
    })

    it('handles duplicate adds gracefully', () => {
      const cb = new CascadingBloom2()
      cb.add('hello')
      cb.add('hello')
      expect(cb.mightContain('hello')).toBe(true)
    })
  })

  describe('getFillRatio', () => {
    it('returns 0 for empty filter', () => {
      const cb = new CascadingBloom2()
      expect(cb.getFillRatio(0)).toBe(0)
    })

    it('increases after adds', () => {
      const cb = new CascadingBloom2({ numBits: 64, numHashes: 2 })
      for (let i = 0; i < 20; i++) cb.add(`item-${i}`)
      expect(cb.getFillRatio(0)).toBeGreaterThan(0)
    })

    it('returns 0 for invalid index', () => {
      const cb = new CascadingBloom2()
      expect(cb.getFillRatio(-1)).toBe(0)
      expect(cb.getFillRatio(99)).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all filters', () => {
      const cb = new CascadingBloom2()
      cb.add('hello')
      cb.clear()
      expect(cb.isEmpty()).toBe(true)
      expect(cb.size()).toBe(0)
    })
  })

  describe('cascading behavior', () => {
    it('uses multiple filters as cascade', () => {
      const cb = new CascadingBloom2({ numFilters: 3, numBits: 64, numHashes: 2 })
      for (let i = 0; i < 50; i++) cb.add(`item-${i}`)
      expect(cb.getFillRatio(0)).toBeGreaterThan(0)
      expect(cb.size()).toBeGreaterThan(0)
    })

    it('cascading still allows lookups', () => {
      const cb = new CascadingBloom2({ numFilters: 3, numBits: 64, numHashes: 2 })
      const items = Array.from({ length: 50 }, (_, i) => `item-${i}`)
      for (const item of items) cb.add(item)
      for (const item of items) {
        expect(cb.mightContain(item)).toBe(true)
      }
    })
  })
})
