import { describe, it, expect } from 'vitest'
import { BloomierFilter2 } from '../../src/core/bloomier-filter-2/index.js'

describe('BloomierFilter2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create a filter with default hash functions', () => {
      const filter = new BloomierFilter2(100)
      expect(filter.size).toBe(0)
    })

    it('should create a filter with custom hash functions', () => {
      const filter = new BloomierFilter2(100, 5)
      expect(filter.size).toBe(0)
    })

    it('should create a filter with minimal size', () => {
      const filter = new BloomierFilter2(1)
      expect(filter.size).toBe(0)
    })
  })

  // ─── Set and Get ───

  describe('set and get', () => {
    it('should set and get a value', () => {
      const filter = new BloomierFilter2(100)
      filter.set('key1', 42)
      expect(filter.get('key1')).toBe(42)
    })

    it('should return undefined for non-existent key', () => {
      const filter = new BloomierFilter2(100)
      expect(filter.get('missing')).toBeUndefined()
    })

    it('should handle multiple keys', () => {
      const filter = new BloomierFilter2(200)
      filter.set('a', 1)
      filter.set('b', 2)
      filter.set('c', 3)
      expect(filter.get('a')).toBe(1)
      expect(filter.get('b')).toBe(2)
      expect(filter.get('c')).toBe(3)
    })

    it('should overwrite existing key value', () => {
      const filter = new BloomierFilter2(100)
      filter.set('key', 10)
      filter.set('key', 20)
      expect(filter.size).toBe(1)
      expect(filter.get('key')).toBe(20)
    })

    it('should handle zero value', () => {
      const filter = new BloomierFilter2(100)
      filter.set('key', 0)
      expect(filter.get('key')).toBe(0)
    })

    it('should handle negative values', () => {
      const filter = new BloomierFilter2(100)
      filter.set('neg', -42)
      expect(filter.get('neg')).toBe(-42)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      const filter = new BloomierFilter2(100)
      filter.set('exists', 1)
      expect(filter.has('exists')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const filter = new BloomierFilter2(100)
      expect(filter.has('missing')).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing key', () => {
      const filter = new BloomierFilter2(100)
      filter.set('key', 1)
      expect(filter.delete('key')).toBe(true)
      expect(filter.has('key')).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('should return false when deleting non-existent key', () => {
      const filter = new BloomierFilter2(100)
      expect(filter.delete('missing')).toBe(false)
    })

    it('should only delete the specified key', () => {
      const filter = new BloomierFilter2(200)
      filter.set('a', 1)
      filter.set('b', 2)
      filter.delete('a')
      expect(filter.has('a')).toBe(false)
      expect(filter.has('b')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should handle delete and re-add', () => {
      const filter = new BloomierFilter2(100)
      filter.set('key', 10)
      filter.delete('key')
      filter.set('key', 20)
      expect(filter.get('key')).toBe(20)
      expect(filter.size).toBe(1)
    })
  })

  // ─── Size ───

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      const filter = new BloomierFilter2(100)
      expect(filter.size).toBe(0)
    })

    it('should track size after insertions', () => {
      const filter = new BloomierFilter2(200)
      filter.set('a', 1)
      filter.set('b', 2)
      filter.set('c', 3)
      expect(filter.size).toBe(3)
    })

    it('should not increment size on duplicate set', () => {
      const filter = new BloomierFilter2(100)
      filter.set('key', 1)
      filter.set('key', 2)
      expect(filter.size).toBe(1)
    })
  })

  // ─── Load Factor ───

  describe('loadFactor', () => {
    it('should return 0 for empty filter', () => {
      const filter = new BloomierFilter2(100)
      expect(filter.loadFactor()).toBe(0)
    })

    it('should increase with entries', () => {
      const filter = new BloomierFilter2(100)
      filter.set('a', 1)
      expect(filter.loadFactor()).toBeGreaterThan(0)
    })

    it('should return correct ratio', () => {
      const filter = new BloomierFilter2(10)
      filter.set('a', 1)
      filter.set('b', 2)
      expect(filter.loadFactor()).toBe(0.2)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      const filter = new BloomierFilter2(100)
      filter.set('a', 1)
      filter.set('b', 2)
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.has('a')).toBe(false)
      expect(filter.has('b')).toBe(false)
    })

    it('should be usable after clear', () => {
      const filter = new BloomierFilter2(100)
      filter.set('a', 1)
      filter.clear()
      filter.set('b', 2)
      expect(filter.has('b')).toBe(true)
      expect(filter.size).toBe(1)
    })
  })
})
