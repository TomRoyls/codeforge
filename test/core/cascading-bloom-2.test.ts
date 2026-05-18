import { describe, it, expect } from 'vitest'
import { CascadingBloom2 } from '../../src/core/cascading-bloom-2/index.js'

describe('CascadingBloom2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default config', () => {
      const bf = new CascadingBloom2()
      expect(bf.size()).toBe(0)
      expect(bf.isEmpty()).toBe(true)
      expect(bf.getFilterCount()).toBe(3)
    })

    it('should accept partial config', () => {
      const bf = new CascadingBloom2({ numFilters: 5, numBits: 512 })
      expect(bf.getFilterCount()).toBe(5)
      const config = bf.getConfig()
      expect(config.numHashes).toBe(3)
      expect(config.numBits).toBe(512)
    })

    it('should accept full config', () => {
      const bf = new CascadingBloom2({ numFilters: 2, numBits: 256, numHashes: 5 })
      expect(bf.getFilterCount()).toBe(2)
      const config = bf.getConfig()
      expect(config).toEqual({ numFilters: 2, numBits: 256, numHashes: 5 })
    })
  })

  // ─── Add & MightContain ───

  describe('add and mightContain', () => {
    it('should find an added item', () => {
      const bf = new CascadingBloom2()
      bf.add('hello')
      expect(bf.mightContain('hello')).toBe(true)
    })

    it('should return false for non-added item in small set', () => {
      const bf = new CascadingBloom2()
      bf.add('hello')
      expect(bf.mightContain('world')).toBe(false)
    })

    it('should handle multiple additions', () => {
      const bf = new CascadingBloom2()
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.mightContain('a')).toBe(true)
      expect(bf.mightContain('b')).toBe(true)
      expect(bf.mightContain('c')).toBe(true)
    })

    it('should handle empty string', () => {
      const bf = new CascadingBloom2()
      bf.add('')
      expect(bf.mightContain('')).toBe(true)
    })

    it('should handle adding the same item twice', () => {
      const bf = new CascadingBloom2()
      bf.add('test')
      bf.add('test')
      expect(bf.mightContain('test')).toBe(true)
      expect(bf.size()).toBe(1)
    })
  })

  // ─── Size & IsEmpty ───

  describe('size and isEmpty', () => {
    it('should start empty', () => {
      const bf = new CascadingBloom2()
      expect(bf.size()).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('should increment size on add', () => {
      const bf = new CascadingBloom2()
      bf.add('x')
      expect(bf.size()).toBe(1)
      expect(bf.isEmpty()).toBe(false)
      bf.add('y')
      expect(bf.size()).toBe(2)
    })

    it('should not increment size on duplicate add', () => {
      const bf = new CascadingBloom2()
      bf.add('dup')
      bf.add('dup')
      expect(bf.size()).toBe(1)
    })
  })

  // ─── GetFillRatio ───

  describe('getFillRatio', () => {
    it('should return 0 for empty filter', () => {
      const bf = new CascadingBloom2()
      expect(bf.getFillRatio(0)).toBe(0)
    })

    it('should increase after adding items', () => {
      const bf = new CascadingBloom2({ numBits: 64 })
      bf.add('item1')
      const ratio = bf.getFillRatio(0)
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should return 0 for invalid filter index', () => {
      const bf = new CascadingBloom2()
      expect(bf.getFillRatio(-1)).toBe(0)
      expect(bf.getFillRatio(99)).toBe(0)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all filters and reset count', () => {
      const bf = new CascadingBloom2()
      bf.add('a')
      bf.add('b')
      bf.clear()
      expect(bf.size()).toBe(0)
      expect(bf.isEmpty()).toBe(true)
      expect(bf.getFillRatio(0)).toBe(0)
    })

    it('should allow adds after clearing', () => {
      const bf = new CascadingBloom2()
      bf.add('old')
      bf.clear()
      bf.add('new')
      expect(bf.mightContain('new')).toBe(true)
      expect(bf.size()).toBe(1)
    })
  })

  // ─── GetConfig ───

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const bf = new CascadingBloom2()
      const config = bf.getConfig()
      config.numBits = 9999
      expect(bf.getConfig().numBits).not.toBe(9999)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle many items', () => {
      const bf = new CascadingBloom2({ numBits: 2048, numHashes: 4 })
      const items = Array.from({ length: 100 }, (_, i) => `item_${i}`)
      for (const item of items) bf.add(item)
      for (const item of items) {
        expect(bf.mightContain(item)).toBe(true)
      }
      expect(bf.size()).toBe(100)
    })

    it('should handle special characters', () => {
      const bf = new CascadingBloom2()
      bf.add('hello世界')
      bf.add('🎉')
      bf.add('\t\n')
      expect(bf.mightContain('hello世界')).toBe(true)
      expect(bf.mightContain('🎉')).toBe(true)
      expect(bf.mightContain('\t\n')).toBe(true)
    })

    it('should handle single filter config', () => {
      const bf = new CascadingBloom2({ numFilters: 1 })
      bf.add('test')
      expect(bf.mightContain('test')).toBe(true)
      expect(bf.getFilterCount()).toBe(1)
    })
  })
})
