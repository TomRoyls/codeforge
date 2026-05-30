import { describe, expect, it } from 'vitest'
import { CountingBloomFilter } from '../../../src/utils/counting-bloom-filter.js'

describe('CountingBloomFilter', () => {
  it('should create filter with default false positive rate', () => {
    const filter = new CountingBloomFilter(1000)
    expect(filter.capacity).toBe(1000)
    expect(filter.size).toBe(0)
    expect(filter.isEmpty).toBe(true)
  })

  it('should create filter with custom false positive rate', () => {
    const filter = new CountingBloomFilter(1000, 0.001)
    expect(filter.capacity).toBe(1000)
    expect(filter.size).toBe(0)
  })

  it('should throw error for capacity less than 1', () => {
    expect(() => new CountingBloomFilter(0)).toThrow(RangeError)
    expect(() => new CountingBloomFilter(-1)).toThrow(RangeError)
    expect(() => new CountingBloomFilter(-100)).toThrow(RangeError)
  })

  it('should throw error for false positive rate <= 0', () => {
    expect(() => new CountingBloomFilter(100, 0)).toThrow(RangeError)
    expect(() => new CountingBloomFilter(100, -0.01)).toThrow(RangeError)
  })

  it('should throw error for false positive rate >= 1', () => {
    expect(() => new CountingBloomFilter(100, 1)).toThrow(RangeError)
    expect(() => new CountingBloomFilter(100, 1.5)).toThrow(RangeError)
  })

  it('should add single item and increase size', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    expect(filter.size).toBe(1)
    expect(filter.isEmpty).toBe(false)
  })

  it('should detect added item with has', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    expect(filter.has('test')).toBe(true)
  })

  it('should return false for non-existent item', () => {
    const filter = new CountingBloomFilter(100)
    expect(filter.has('nonexistent')).toBe(false)
  })

  it('should add multiple items and track size', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('item1')
    filter.add('item2')
    filter.add('item3')
    expect(filter.size).toBe(3)
  })

  it('should detect multiple added items', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('item1')
    filter.add('item2')
    filter.add('item3')
    expect(filter.has('item1')).toBe(true)
    expect(filter.has('item2')).toBe(true)
    expect(filter.has('item3')).toBe(true)
  })

  it('should remove existing item and decrease size', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    expect(filter.size).toBe(1)
    expect(filter.remove('test')).toBe(true)
    expect(filter.size).toBe(0)
    expect(filter.isEmpty).toBe(true)
  })

  it('should return false when removing non-existent item', () => {
    const filter = new CountingBloomFilter(100)
    expect(filter.remove('nonexistent')).toBe(false)
  })

  it('should not detect removed item', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    filter.remove('test')
    expect(filter.has('test')).toBe(false)
  })

  it('should add same item multiple times and track correctly', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    filter.add('test')
    filter.add('test')
    expect(filter.size).toBe(3)
  })

  it('should remove item added multiple times correctly', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    filter.add('test')
    expect(filter.size).toBe(2)
    filter.remove('test')
    expect(filter.size).toBe(1)
    expect(filter.has('test')).toBe(true)
  })

  it('should clear all items', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('item1')
    filter.add('item2')
    filter.add('item3')
    expect(filter.size).toBe(3)
    filter.clear()
    expect(filter.size).toBe(0)
    expect(filter.isEmpty).toBe(true)
  })

  it('should not detect items after clear', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('item1')
    filter.add('item2')
    filter.clear()
    expect(filter.has('item1')).toBe(false)
    expect(filter.has('item2')).toBe(false)
  })

  it('should return correct stats', () => {
    const filter = new CountingBloomFilter(1000, 0.01)
    filter.add('test')
    const stats = filter.stats()
    expect(stats.capacity).toBe(1000)
    expect(stats.size).toBe(1)
    expect(stats.hashCount).toBe(4)
    expect(typeof stats.counterCount).toBe('number')
    expect(stats.counterCount).toBeGreaterThanOrEqual(64)
    expect(typeof stats.falsePositiveRate).toBe('number')
  })

  it('should return false positive rate of 0 for empty filter', () => {
    const filter = new CountingBloomFilter(100)
    expect(filter.falsePositiveRate).toBe(0)
  })

  it('should return positive false positive rate for non-empty filter', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    expect(filter.falsePositiveRate).toBeGreaterThan(0)
    expect(filter.falsePositiveRate).toBeLessThan(1)
  })

  it('should handle add after remove', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    filter.remove('test')
    filter.add('test')
    expect(filter.size).toBe(1)
    expect(filter.has('test')).toBe(true)
  })

  it('should handle empty string', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('')
    expect(filter.has('')).toBe(true)
    expect(filter.remove('')).toBe(true)
    expect(filter.has('')).toBe(false)
  })

  it('should handle special characters in string', () => {
    const filter = new CountingBloomFilter(100)
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    filter.add(special)
    expect(filter.has(special)).toBe(true)
  })

  it('should handle unicode characters', () => {
    const filter = new CountingBloomFilter(100)
    const unicode = '🎉你好世界🌍'
    filter.add(unicode)
    expect(filter.has(unicode)).toBe(true)
  })

  it('should handle very long strings', () => {
    const filter = new CountingBloomFilter(100)
    const longString = 'a'.repeat(10000)
    filter.add(longString)
    expect(filter.has(longString)).toBe(true)
  })

  it('should handle min capacity', () => {
    const filter = new CountingBloomFilter(1)
    expect(filter.capacity).toBe(1)
    filter.add('test')
    expect(filter.size).toBe(1)
  })

  it('should handle large capacity', () => {
    const filter = new CountingBloomFilter(1000000)
    expect(filter.capacity).toBe(1000000)
  })

  it('should not remove item that was never added', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    expect(filter.remove('other')).toBe(false)
    expect(filter.size).toBe(1)
  })

  it('should handle multiple remove operations', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    filter.add('test')
    filter.remove('test')
    filter.remove('test')
    expect(filter.size).toBe(0)
    expect(filter.remove('test')).toBe(false)
  })

  it('should keep capacity constant after clear', () => {
    const filter = new CountingBloomFilter(100)
    filter.add('test')
    filter.clear()
    expect(filter.capacity).toBe(100)
  })

  it('should handle independent filters correctly', () => {
    const filter1 = new CountingBloomFilter(100)
    const filter2 = new CountingBloomFilter(100)
    filter1.add('test')
    expect(filter1.has('test')).toBe(true)
    expect(filter2.has('test')).toBe(false)
  })
})