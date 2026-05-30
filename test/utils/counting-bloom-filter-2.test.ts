import { describe, it, expect } from 'vitest'
import { CountingBloomFilter2 } from '../../src/utils/counting-bloom-filter-2.js'

describe('CountingBloomFilter2', () => {
  it('constructor with defaults', () => {
    const filter = new CountingBloomFilter2(1000)
    expect(filter.capacity).toBe(1000)
    expect(filter.filterSize).toBeGreaterThan(0)
    expect(filter.hashCount).toBeGreaterThan(0)
  })

  it('constructor with custom false positive rate', () => {
    const filter = new CountingBloomFilter2(1000, 0.001)
    expect(filter.capacity).toBe(1000)
    expect(filter.filterSize).toBeGreaterThan(0)
    expect(filter.hashCount).toBeGreaterThan(0)
  })

  it('add and contains', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('test-item')
    expect(filter.contains('test-item')).toBe(true)
    expect(filter.contains('non-existent')).toBe(false)
  })

  it('add same item multiple times', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    filter.add('item')
    filter.add('item')
    expect(filter.contains('item')).toBe(true)
    expect(filter.count('item')).toBeGreaterThan(0)
  })

  it('remove item', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    expect(filter.contains('item')).toBe(true)
    expect(filter.remove('item')).toBe(true)
    expect(filter.contains('item')).toBe(false)
  })

  it('remove item not present', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    const result = filter.remove('non-existent')
    expect(result).toBe(false)
  })

  it('clear empties the filter', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item1')
    filter.add('item2')
    filter.add('item3')
    expect(filter.contains('item1')).toBe(true)
    filter.clear()
    expect(filter.contains('item1')).toBe(false)
    expect(filter.estimatedCount).toBe(0)
  })

  it('count returns estimated frequency', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    filter.add('item')
    filter.add('item')
    const estimatedCount = filter.count('item')
    expect(estimatedCount).toBe(3)
  })

  it('count returns zero for non-existent items', () => {
    const filter = new CountingBloomFilter2(100)
    const estimatedCount = filter.count('non-existent')
    expect(estimatedCount).toBe(0)
  })

  it('filterSize and hashCount are reasonable', () => {
    const filter = new CountingBloomFilter2(1000, 0.01)
    expect(filter.filterSize).toBeGreaterThan(1000)
    expect(filter.hashCount).toBeGreaterThan(0)
    expect(filter.hashCount).toBeLessThan(20)
  })

  it('mixed add/remove operations', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('a')
    filter.add('b')
    filter.add('c')
    expect(filter.contains('a')).toBe(true)
    expect(filter.contains('b')).toBe(true)
    expect(filter.remove('b')).toBe(true)
    expect(filter.contains('b')).toBe(false)
    expect(filter.contains('a')).toBe(true)
    filter.add('d')
    expect(filter.contains('d')).toBe(true)
  })

  it('many items operations', () => {
    const filter = new CountingBloomFilter2(2000, 0.001)
    const items = new Set<string>()
    for (let i = 0; i < 1500; i++) {
      const item = `item-${i}`
      items.add(item)
      filter.add(item)
    }
    let positiveCount = 0
    items.forEach((item) => {
      if (filter.contains(item)) {
        positiveCount++
      }
    })
    expect(positiveCount).toBe(1500)
  })

  it('estimatedCount reflects additions', () => {
    const filter = new CountingBloomFilter2(100)
    expect(filter.estimatedCount).toBe(0)
    filter.add('a')
    expect(filter.estimatedCount).toBe(1)
    filter.add('b')
    expect(filter.estimatedCount).toBe(2)
    filter.add('c')
    expect(filter.estimatedCount).toBe(3)
  })

  it('false positive rate roughly within bounds', () => {
    const filter = new CountingBloomFilter2(1000, 0.01)
    const expectedSize = 1000
    for (let i = 0; i < expectedSize; i++) {
      filter.add(`item-${i}`)
    }
    let falsePositives = 0
    const testCount = 1000
    for (let i = expectedSize; i < expectedSize + testCount; i++) {
      const testItem = `item-${i}`
      if (filter.contains(testItem)) {
        falsePositives++
      }
    }
    const observedRate = falsePositives / testCount
    expect(observedRate).toBeLessThan(0.05)
  })

  it('handles unicode keys', () => {
    const filter = new CountingBloomFilter2(50)
    filter.add('日本語')
    filter.add('🎉')
    expect(filter.contains('日本語')).toBe(true)
    expect(filter.contains('🎉')).toBe(true)
  })

  it('add and remove multiple times', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('x')
    filter.add('x')
    filter.remove('x')
    expect(filter.count('x')).toBeGreaterThanOrEqual(1)
  })
})