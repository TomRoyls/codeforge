import { describe, it, expect } from 'vitest'
import { BloomFilter3 } from '../../src/utils/bloom-filter-3.js'

describe('BloomFilter3', () => {
  it('has default constructor values', () => {
    const filter = new BloomFilter3()

    expect(filter.capacity).toBeGreaterThan(0)
    expect(filter.partitionCount).toBe(1)
    expect(filter.estimatedSize).toBe(0)
    expect(filter.fillRatio).toBe(0)
  })

  it('returns false for items not in filter', () => {
    const filter = new BloomFilter3()

    expect(filter.has('not-added')).toBe(false)
  })

  it('returns true for added items', () => {
    const filter = new BloomFilter3()

    filter.add('item1')

    expect(filter.has('item1')).toBe(true)
  })

  it('handles multiple items correctly', () => {
    const filter = new BloomFilter3()

    filter.add('item1')
    filter.add('item2')
    filter.add('item3')

    expect(filter.has('item1')).toBe(true)
    expect(filter.has('item2')).toBe(true)
    expect(filter.has('item3')).toBe(true)
  })

  it('auto-scales to new partition when full', () => {
    const filter = new BloomFilter3({ initialCapacity: 10, maxFillRatio: 0.5 })

    expect(filter.partitionCount).toBe(1)

    for (let i = 0; i < 20; i++) {
      filter.add(`item${i}`)
    }

    expect(filter.partitionCount).toBeGreaterThan(1)
  })

  it('increases partition count on scaling', () => {
    const filter = new BloomFilter3({ initialCapacity: 5, maxFillRatio: 0.5 })

    const initialPartitions = filter.partitionCount

    for (let i = 0; i < 30; i++) {
      filter.add(`item${i}`)
    }

    expect(filter.partitionCount).toBeGreaterThan(initialPartitions)
  })

  it('has false positive rate within bounds', () => {
    const filter = new BloomFilter3({ initialCapacity: 1000, errorRate: 0.01 })

    const added: string[] = []
    for (let i = 0; i < 1000; i++) {
      const item = `item${i}`
      filter.add(item)
      added.push(item)
    }

    let falsePositives = 0
    const testCount = 100

    for (let i = 0; i < testCount; i++) {
      const testItem = `test-item${i}`
      if (filter.has(testItem) && !added.includes(testItem)) {
        falsePositives++
      }
    }

    const fpRate = falsePositives / testCount
    expect(fpRate).toBeLessThan(0.05)
  })

  it('tracks fill ratio correctly', () => {
    const filter = new BloomFilter3({ initialCapacity: 100, maxFillRatio: 0.5 })

    expect(filter.fillRatio).toBe(0)

    filter.add('item1')

    expect(filter.fillRatio).toBeGreaterThan(0)

    for (let i = 0; i < 200; i++) {
      filter.add(`item${i}`)
    }

    expect(filter.fillRatio).toBeLessThan(1)
  })

  it('resets everything on clear', () => {
    const filter = new BloomFilter3()

    filter.add('item1')
    filter.add('item2')
    filter.add('item3')

    filter.clear()

    expect(filter.estimatedSize).toBe(0)
    expect(filter.has('item1')).toBe(false)
    expect(filter.has('item2')).toBe(false)
    expect(filter.has('item3')).toBe(false)
    expect(filter.fillRatio).toBe(0)
  })

  it('has reasonable capacity', () => {
    const filter = new BloomFilter3({ initialCapacity: 1000 })

    expect(filter.capacity).toBeGreaterThanOrEqual(1000)
  })

  it('handles large number of items', () => {
    const filter = new BloomFilter3({ initialCapacity: 1000, maxFillRatio: 0.5 })

    for (let i = 0; i < 5000; i++) {
      filter.add(`item${i}`)
    }

    expect(filter.estimatedSize).toBe(5000)
    expect(filter.partitionCount).toBeGreaterThan(1)

    for (let i = 0; i < 100; i++) {
      expect(filter.has(`item${i}`)).toBe(true)
    }
  })

  it('returns true after multiple adds of same item', () => {
    const filter = new BloomFilter3()

    filter.add('item1')
    filter.add('item1')
    filter.add('item1')

    expect(filter.has('item1')).toBe(true)
  })

  it('empty filter has() returns false for any item', () => {
    const filter = new BloomFilter3()

    expect(filter.has('')).toBe(false)
    expect(filter.has('item')).toBe(false)
    expect(filter.has('12345')).toBe(false)
    expect(filter.has('special-chars-!@#$%')).toBe(false)
  })

  it('handles unicode items', () => {
    const filter = new BloomFilter3()
    filter.add('日本語')
    filter.add('🎉🎊')
    expect(filter.has('日本語')).toBe(true)
    expect(filter.has('🎉🎊')).toBe(true)
  })

  it('clear allows re-adding items', () => {
    const filter = new BloomFilter3()
    filter.add('test')
    filter.clear()
    filter.add('new-item')
    expect(filter.has('new-item')).toBe(true)
    expect(filter.has('test')).toBe(false)
  })

  it('handles very long strings', () => {
    const filter = new BloomFilter3()
    const longStr = 'x'.repeat(100000)
    filter.add(longStr)
    expect(filter.has(longStr)).toBe(true)
  })

  it('estimatedSize increments with unique adds', () => {
    const filter = new BloomFilter3()
    for (let i = 0; i < 50; i++) filter.add(`item-${i}`)
    expect(filter.estimatedSize).toBeGreaterThanOrEqual(50)
  })

  it('multiple clears work correctly', () => {
    const filter = new BloomFilter3()
    filter.add('a')
    filter.clear()
    filter.add('b')
    expect(filter.has('b')).toBe(true)
    filter.clear()
    expect(filter.has('b')).toBe(false)
    expect(filter.estimatedSize).toBe(0)
  })

  it('union merges two filters', () => {
    const filter1 = new BloomFilter3(100)
    const filter2 = new BloomFilter3(100)
    filter1.add('a')
    filter2.add('b')
    expect(filter1.has('a')).toBe(true)
    expect(filter1.has('b')).toBe(false)
  })

  it('new filter has no items', () => {
    const filter = new BloomFilter3(100)
    expect(filter.has('anything')).toBe(false)
  })

  it('add and has returns true', () => {
    const filter = new BloomFilter3(100)
    filter.add('hello')
    expect(filter.has('hello')).toBe(true)
  })

  it('has returns false for absent item', () => {
    const filter = new BloomFilter3(100)
    expect(filter.has('missing')).toBe(false)
  })
})