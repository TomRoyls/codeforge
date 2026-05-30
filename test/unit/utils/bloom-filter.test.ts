import { describe, expect, it } from 'vitest'

import { BloomFilter } from '../../../src/utils/bloom-filter.js'

describe('BloomFilter', () => {
  it('reports added item as possibly contained', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    bf.add('hello')
    expect(bf.mightContain('hello')).toBe(true)
  })

  it('reports missing item as not contained', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    bf.add('hello')
    expect(bf.mightContain('world')).toBe(false)
  })

  it('tracks size', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    expect(bf.size).toBe(0)
    bf.add('a')
    bf.add('b')
    bf.add('c')
    expect(bf.size).toBe(3)
  })

  it('handles many items with low false positive rate', () => {
    const bf = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
    for (let i = 0; i < 1000; i++) {
      bf.add(`item-${i}`)
    }
    for (let i = 0; i < 1000; i++) {
      expect(bf.mightContain(`item-${i}`)).toBe(true)
    }
    let falsePositives = 0
    const testCount = 500
    for (let i = 1000; i < 1000 + testCount; i++) {
      if (bf.mightContain(`item-${i}`)) falsePositives++
    }
    expect(falsePositives / testCount).toBeLessThan(0.1)
  })

  it('clear resets filter', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    bf.add('test')
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.mightContain('test')).toBe(false)
  })

  it('returns bit count', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    expect(bf.bitCount).toBeGreaterThan(0)
  })

  it('returns hash function count', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    expect(bf.getHashFunctionCount()).toBeGreaterThan(0)
  })

  it('estimated false positive rate is 0 when empty', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    expect(bf.getEstimatedFalsePositiveRate()).toBe(0)
  })

  it('estimated false positive rate increases with items', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    for (let i = 0; i < 50; i++) bf.add(`item-${i}`)
    const rate50 = bf.getEstimatedFalsePositiveRate()
    for (let i = 50; i < 100; i++) bf.add(`item-${i}`)
    const rate100 = bf.getEstimatedFalsePositiveRate()
    expect(rate100).toBeGreaterThan(rate50)
  })

  it('works with empty strings', () => {
    const bf = new BloomFilter({ expectedItems: 10, falsePositiveRate: 0.01 })
    bf.add('')
    expect(bf.mightContain('')).toBe(true)
  })

  it('works with special characters', () => {
    const bf = new BloomFilter({ expectedItems: 10, falsePositiveRate: 0.01 })
    bf.add('hello\nworld\t!')
    expect(bf.mightContain('hello\nworld\t!')).toBe(true)
  })

  it('handles duplicate adds', () => {
    const bf = new BloomFilter({ expectedItems: 10, falsePositiveRate: 0.01 })
    bf.add('test')
    bf.add('test')
    expect(bf.size).toBe(2)
    expect(bf.mightContain('test')).toBe(true)
  })

  it('all added items are found', () => {
    const bf = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.001 })
    const items = Array.from({ length: 100 }, (_, i) => `key-${i}`)
    for (const item of items) bf.add(item)
    for (const item of items) {
      expect(bf.mightContain(item)).toBe(true)
    }
  })
})
