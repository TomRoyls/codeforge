import { describe, expect, it } from 'vitest'
import { XorFilter } from '../../../src/utils/xor-filter.js'

describe('XorFilter', () => {
  it('creates filter from empty array', () => {
    const filter = XorFilter.create([])
    expect(filter.size).toBe(0)
  })

  it('creates filter from single item', () => {
    const filter = XorFilter.create(['test'])
    expect(filter.size).toBe(1)
  })

  it('creates filter from multiple items', () => {
    const items = ['apple', 'banana', 'cherry', 'date', 'elderberry']
    const filter = XorFilter.create(items)
    expect(filter.size).toBe(5)
  })

  it('has returns true for inserted item', () => {
    const filter = XorFilter.create(['test-item'])
    expect(filter.has('test-item')).toBe(true)
  })

  it('has returns false for non-existent item', () => {
    const filter = XorFilter.create(['test-item'])
    expect(filter.has('non-existent')).toBe(false)
  })

  it('contains all inserted items', () => {
    const items = ['one', 'two', 'three', 'four', 'five']
    const filter = XorFilter.create(items)
    for (const item of items) {
      expect(filter.has(item)).toBe(true)
    }
  })

  it('handles duplicate items in input', () => {
    const items = ['test', 'test', 'test']
    const filter = XorFilter.create(items)
    expect(filter.size).toBe(1)
    expect(filter.has('test')).toBe(true)
  })

  it('handles strings with spaces', () => {
    const filter = XorFilter.create(['hello world', 'foo bar'])
    expect(filter.has('hello world')).toBe(true)
    expect(filter.has('foo bar')).toBe(true)
  })

  it('handles strings with special characters', () => {
    const filter = XorFilter.create(['test@example.com', 'user@domain.org'])
    expect(filter.has('test@example.com')).toBe(true)
    expect(filter.has('user@domain.org')).toBe(true)
  })

  it('handles strings with unicode characters', () => {
    const filter = XorFilter.create(['café', '日本語', 'emoji😀'])
    expect(filter.has('café')).toBe(true)
    expect(filter.has('日本語')).toBe(true)
    expect(filter.has('emoji😀')).toBe(true)
  })

  it('handles empty string', () => {
    const filter = XorFilter.create([''])
    expect(filter.has('')).toBe(true)
  })

  it('handles long strings', () => {
    const longString = 'a'.repeat(1000)
    const filter = XorFilter.create([longString])
    expect(filter.has(longString)).toBe(true)
  })

  it('returns false for all items in empty filter', () => {
    const filter = XorFilter.create([])
    expect(filter.has('anything')).toBe(false)
    expect(filter.has('')).toBe(false)
  })

  it('has no false negatives for inserted items', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
    const filter = XorFilter.create(items)
    for (const item of items) {
      expect(filter.has(item)).toBe(true)
    }
  })

  it('has false positive rate below 5%', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
    const filter = XorFilter.create(items)
    let falsePositives = 0
    const testItems = Array.from({ length: 1000 }, (_, i) => `nonexistent-${i}`)
    for (const item of testItems) {
      if (filter.has(item)) {
        falsePositives++
      }
    }
    const rate = falsePositives / testItems.length
    expect(rate).toBeLessThan(0.05)
  })

  it('has capacity getter', () => {
    const filter = XorFilter.create(['a', 'b', 'c'])
    expect(filter.capacity).toBeGreaterThan(0)
  })

  it('has falsePositiveRate getter', () => {
    const filter = XorFilter.create(['a', 'b', 'c'])
    expect(filter.falsePositiveRate).toBeGreaterThan(0)
  })

  it('has serializedSize getter', () => {
    const filter = XorFilter.create(['a', 'b', 'c'])
    expect(filter.serializedSize).toBeGreaterThan(0)
  })

  it('false positive rate is 0 for empty filter', () => {
    const filter = XorFilter.create([])
    expect(filter.falsePositiveRate).toBe(0)
  })

  it('handles case sensitivity', () => {
    const filter = XorFilter.create(['Test'])
    expect(filter.has('Test')).toBe(true)
    expect(filter.has('test')).toBe(false)
    expect(filter.has('TEST')).toBe(false)
  })

  it('creates filter with custom seed', () => {
    const items = ['test', 'example']
    const filter1 = XorFilter.create(items, 123)
    const filter2 = XorFilter.create(items, 456)
    expect(filter1.size).toBe(filter2.size)
    expect(filter1.has('test')).toBe(true)
    expect(filter2.has('test')).toBe(true)
  })

  it('handles large number of items', () => {
    const items = Array.from({ length: 500 }, (_, i) => `item-${i}`)
    const filter = XorFilter.create(items)
    expect(filter.size).toBe(500)
    for (const item of items.slice(0, 100)) {
      expect(filter.has(item)).toBe(true)
    }
  })

  it('handles strings that differ by one character', () => {
    const filter = XorFilter.create(['test'])
    expect(filter.has('test')).toBe(true)
    expect(filter.has('tesy')).toBe(false)
    expect(filter.has('tess')).toBe(false)
  })

  it('handles numeric strings', () => {
    const filter = XorFilter.create(['123', '456', '789'])
    expect(filter.has('123')).toBe(true)
    expect(filter.has('456')).toBe(true)
    expect(filter.has('789')).toBe(true)
    expect(filter.has('000')).toBe(false)
  })

  it('handles mixed alphanumeric strings', () => {
    const filter = XorFilter.create(['test123', 'abc456', 'xyz789'])
    expect(filter.has('test123')).toBe(true)
    expect(filter.has('abc456')).toBe(true)
    expect(filter.has('xyz789')).toBe(true)
  })

  it('maintains low false positive rate with many items', () => {
    const items = Array.from({ length: 200 }, (_, i) => `item-${i}`)
    const filter = XorFilter.create(items)
    let falsePositives = 0
    const testItems = Array.from({ length: 1000 }, (_, i) => `nonexistent-${i}`)
    for (const item of testItems) {
      if (filter.has(item)) {
        falsePositives++
      }
    }
    const rate = falsePositives / testItems.length
    expect(rate).toBeLessThan(0.05)
  })

  it('handles strings with newlines', () => {
    const filter = XorFilter.create(['line1\nline2', 'test\nvalue'])
    expect(filter.has('line1\nline2')).toBe(true)
    expect(filter.has('test\nvalue')).toBe(true)
  })

  it('handles strings with tabs', () => {
    const filter = XorFilter.create(['tab\tseparated', 'value\ttest'])
    expect(filter.has('tab\tseparated')).toBe(true)
    expect(filter.has('value\ttest')).toBe(true)
  })

  it('has size matching input after deduplication', () => {
    const items = ['a', 'b', 'a', 'c', 'b', 'd', 'a']
    const filter = XorFilter.create(items)
    expect(filter.size).toBe(4)
  })

  it('handles URL strings', () => {
    const filter = XorFilter.create([
      'https://example.com/path',
      'https://test.org/page',
      'http://domain.net/resource'
    ])
    expect(filter.has('https://example.com/path')).toBe(true)
    expect(filter.has('https://test.org/page')).toBe(true)
    expect(filter.has('http://domain.net/resource')).toBe(true)
  })
})