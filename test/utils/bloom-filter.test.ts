import { describe, it, expect } from 'vitest'
import { BloomFilter } from '../../src/utils/bloom-filter.js'

describe('BloomFilter', () => {
  it('should create filter with expected items and false positive rate', () => {
    const filter = new BloomFilter({
      expectedItems: 1000,
      falsePositiveRate: 0.01,
    })

    expect(filter.size).toBe(0)
    expect(filter.bitCount).toBeGreaterThan(0)
    expect(filter.getHashFunctionCount()).toBeGreaterThan(0)
  })

  it('should add item to filter', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('hello')

    expect(filter.size).toBe(1)
  })

  it('should detect added item might be in filter', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('test-item')

    expect(filter.mightContain('test-item')).toBe(true)
  })

  it('should not detect item that was not added', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('item1')
    filter.add('item2')

    expect(filter.mightContain('item3')).toBe(false)
  })

  it('should have low false positive rate', () => {
    const filter = new BloomFilter({
      expectedItems: 1000,
      falsePositiveRate: 0.01,
    })

    for (let i = 0; i < 1000; i++) {
      filter.add(`item-${i}`)
    }

    let falsePositives = 0
    const testCount = 1000
    for (let i = 0; i < testCount; i++) {
      if (filter.mightContain(`non-existent-${i}`)) {
        falsePositives++
      }
    }

    const actualFalsePositiveRate = falsePositives / testCount
    expect(actualFalsePositiveRate).toBeLessThan(0.05)
  })

  it('should handle many elements without crashing', () => {
    const filter = new BloomFilter({
      expectedItems: 10000,
      falsePositiveRate: 0.01,
    })

    for (let i = 0; i < 10000; i++) {
      filter.add(`item-${i}`)
    }

    expect(filter.size).toBe(10000)
    expect(filter.mightContain('item-5000')).toBe(true)
  })

  it('should handle duplicate additions', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('duplicate')
    filter.add('duplicate')
    filter.add('duplicate')

    expect(filter.size).toBe(3)
    expect(filter.mightContain('duplicate')).toBe(true)
  })

  it('should clear filter and reset state', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('item1')
    filter.add('item2')
    expect(filter.size).toBe(2)

    filter.clear()

    expect(filter.size).toBe(0)
    expect(filter.mightContain('item1')).toBe(false)
    expect(filter.mightContain('item2')).toBe(false)
  })

  it('should report empty state for new filter', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    expect(filter.size).toBe(0)
    expect(filter.getEstimatedFalsePositiveRate()).toBe(0)
  })

  it('should be case sensitive', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('Hello')

    expect(filter.mightContain('Hello')).toBe(true)
    expect(filter.mightContain('hello')).toBe(false)
    expect(filter.mightContain('HELLO')).toBe(false)
  })

  it('should estimate false positive rate', () => {
    const filter = new BloomFilter({
      expectedItems: 1000,
      falsePositiveRate: 0.01,
    })

    const initialRate = filter.getEstimatedFalsePositiveRate()
    expect(initialRate).toBe(0)

    for (let i = 0; i < 500; i++) {
      filter.add(`item-${i}`)
    }

    const halfFullRate = filter.getEstimatedFalsePositiveRate()
    expect(halfFullRate).toBeGreaterThan(0)
    expect(halfFullRate).toBeLessThan(0.1)

    for (let i = 500; i < 1000; i++) {
      filter.add(`item-${i}`)
    }

    const fullRate = filter.getEstimatedFalsePositiveRate()
    expect(fullRate).toBeGreaterThan(0)
    expect(fullRate).toBeLessThan(0.05)
  })

  it('should handle empty strings', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    filter.add('')

    expect(filter.size).toBe(1)
    expect(filter.mightContain('')).toBe(true)
  })

  it('should handle special characters', () => {
    const filter = new BloomFilter({
      expectedItems: 100,
      falsePositiveRate: 0.01,
    })

    const specialItems = ['!@#$%^&*()', 'émojis😀', ' espaços ', '\ttab\nnewline']

    for (const item of specialItems) {
      filter.add(item)
    }

    for (const item of specialItems) {
      expect(filter.mightContain(item)).toBe(true)
    }
  })

  it('handles numeric string keys', () => {
    const filter = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    for (let i = 0; i < 50; i++) filter.add(String(i))
    expect(filter.mightContain('25')).toBe(true)
    expect(filter.size).toBe(50)
  })

  it('bitCount is positive for reasonable config', () => {
    const filter = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    expect(filter.bitCount).toBeGreaterThan(100)
  })

  it('has method returns false for empty filter', () => {
    const filter = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    expect(filter.mightContain('anything')).toBe(false)
  })

  it('handles adding the same item many times', () => {
    const filter = new BloomFilter({ expectedItems: 10, falsePositiveRate: 0.01 })
    for (let i = 0; i < 100; i++) filter.add('same-item')
    expect(filter.mightContain('same-item')).toBe(true)
    expect(filter.size).toBe(100)
  })

  it('handles large strings', () => {
    const filter = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    const longStr = 'a'.repeat(10000)
    filter.add(longStr)
    expect(filter.mightContain(longStr)).toBe(true)
  })

  it('handles multiple items correctly', () => {
    const filter = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    filter.add('hello')
    filter.add('world')
    expect(filter.mightContain('hello')).toBe(true)
    expect(filter.mightContain('world')).toBe(true)
  })

  it('add and mightContain work', () => {
    const filter = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
    filter.add('test-item')
    expect(filter.mightContain('test-item')).toBe(true)
  })

  it('mightContain returns false for unseen item', () => {
    const filter = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
    expect(filter.mightContain('not-added')).toBe(false)
  })

  it('mightContain returns true for added item', () => {
    const filter = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
    filter.add('hello')
    expect(filter.mightContain('hello')).toBe(true)
  })

  it('mightContain returns false for absent item', () => {
    const filter = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
    expect(filter.mightContain('never-added')).toBe(false)
  })
})