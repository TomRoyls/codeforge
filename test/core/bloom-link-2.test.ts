import { describe, it, expect } from 'vitest'
import { BloomLink2 } from '../../src/core/bloom-link-2/index.js'

describe('BloomLink2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default parameters', () => {
      const bl = new BloomLink2()
      expect(bl.count()).toBe(0)
      expect(bl.isEmpty()).toBe(true)
    })

    it('should create with custom expected items and false positive rate', () => {
      const bl = new BloomLink2(500, 0.001)
      expect(bl.count()).toBe(0)
    })

    it('should handle small expected items', () => {
      const bl = new BloomLink2(1, 0.5)
      expect(bl.count()).toBe(0)
    })
  })

  // ─── Add and MightContain ───

  describe('add and mightContain', () => {
    it('should add and find an item', () => {
      const bl = new BloomLink2()
      bl.add('hello')
      expect(bl.mightContain('hello')).toBe(true)
    })

    it('should return false for non-existent item', () => {
      const bl = new BloomLink2()
      expect(bl.mightContain('missing')).toBe(false)
    })

    it('should handle multiple items', () => {
      const bl = new BloomLink2()
      bl.add('a')
      bl.add('b')
      bl.add('c')
      expect(bl.mightContain('a')).toBe(true)
      expect(bl.mightContain('b')).toBe(true)
      expect(bl.mightContain('c')).toBe(true)
    })

    it('should not add duplicate items', () => {
      const bl = new BloomLink2()
      bl.add('dup')
      bl.add('dup')
      expect(bl.count()).toBe(1)
    })

    it('should handle empty string', () => {
      const bl = new BloomLink2()
      bl.add('')
      expect(bl.mightContain('')).toBe(true)
    })

    it('should handle special characters', () => {
      const bl = new BloomLink2()
      bl.add('hello world!@#$%')
      expect(bl.mightContain('hello world!@#$%')).toBe(true)
    })
  })

  // ─── Count ───

  describe('count', () => {
    it('should return 0 for empty structure', () => {
      const bl = new BloomLink2()
      expect(bl.count()).toBe(0)
    })

    it('should track count after insertions', () => {
      const bl = new BloomLink2()
      bl.add('a')
      bl.add('b')
      bl.add('c')
      expect(bl.count()).toBe(3)
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('should return true when empty', () => {
      const bl = new BloomLink2()
      expect(bl.isEmpty()).toBe(true)
    })

    it('should return false after adding item', () => {
      const bl = new BloomLink2()
      bl.add('item')
      expect(bl.isEmpty()).toBe(false)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all items', () => {
      const bl = new BloomLink2()
      bl.add('a')
      bl.add('b')
      bl.clear()
      expect(bl.count()).toBe(0)
      expect(bl.isEmpty()).toBe(true)
    })

    it('should be usable after clear', () => {
      const bl = new BloomLink2()
      bl.add('a')
      bl.clear()
      bl.add('b')
      expect(bl.mightContain('b')).toBe(true)
      expect(bl.count()).toBe(1)
    })
  })

  // ─── Fill Ratio ───

  describe('fillRatio', () => {
    it('should return 0 for empty structure', () => {
      const bl = new BloomLink2()
      expect(bl.fillRatio()).toBe(0)
    })

    it('should increase as items are added', () => {
      const bl = new BloomLink2(10, 0.01)
      bl.add('a')
      expect(bl.fillRatio()).toBeGreaterThan(0)
    })
  })

  // ─── False Positive Rate ───

  describe('falsePositiveRate', () => {
    it('should return computed rate', () => {
      const bl = new BloomLink2(10, 0.01)
      bl.add('a')
      bl.add('b')
      bl.add('c')
      const rate = bl.falsePositiveRate()
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })
  })
})
