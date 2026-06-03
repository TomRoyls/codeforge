import { describe, it, expect } from 'vitest'
import { ApproximateSet } from '../../src/utils/approximate-set.js'

describe('ApproximateSet', () => {
  it('constructs with default parameters', () => {
    const set = new ApproximateSet()
    expect(set.count).toBe(0)
    expect(set.bitSize).toBeGreaterThan(0)
  })

  it('constructs with custom expected items', () => {
    const set = new ApproximateSet(5000)
    expect(set.count).toBe(0)
    expect(set.bitSize).toBeGreaterThan(0)
  })

  it('constructs with custom false positive rate', () => {
    const set = new ApproximateSet(1000, 0.001)
    expect(set.count).toBe(0)
    expect(set.bitSize).toBeGreaterThan(0)
  })

  it('adds a single element', () => {
    const set = new ApproximateSet()
    set.add('test')
    expect(set.count).toBe(1)
  })

  it('adds multiple elements', () => {
    const set = new ApproximateSet()
    set.add('first')
    set.add('second')
    set.add('third')
    expect(set.count).toBe(3)
  })

  it('returns true for added element', () => {
    const set = new ApproximateSet()
    set.add('exists')
    expect(set.has('exists')).toBe(true)
  })

  it('returns false for non-existent element in empty set', () => {
    const set = new ApproximateSet()
    expect(set.has('nonexistent')).toBe(false)
  })

  it('handles adding duplicate elements', () => {
    const set = new ApproximateSet()
    set.add('duplicate')
    set.add('duplicate')
    set.add('duplicate')
    expect(set.count).toBe(3)
  })

  it('handles many elements', () => {
    const set = new ApproximateSet(1000)
    for (let i = 0; i < 100; i++) {
      set.add(`item-${i}`)
    }
    expect(set.count).toBe(100)
  })

  it('has returns true for all added elements', () => {
    const set = new ApproximateSet()
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) {
      set.add(item)
    }
    for (const item of items) {
      expect(set.has(item)).toBe(true)
    }
  })

  it('false positive rate remains within acceptable bounds', () => {
    const set = new ApproximateSet(100, 0.01)
    const addedItems = new Set<string>()
    for (let i = 0; i < 50; i++) {
      const item = `item-${i}`
      set.add(item)
      addedItems.add(item)
    }
    let falsePositives = 0
    const testCount = 1000
    for (let i = 100; i < 100 + testCount; i++) {
      const item = `item-${i}`
      if (!addedItems.has(item) && set.has(item)) {
        falsePositives++
      }
    }
    const actualRate = falsePositives / testCount
    expect(actualRate).toBeLessThan(0.05)
  })

  it('respects case sensitivity', () => {
    const set = new ApproximateSet()
    set.add('Hello')
    expect(set.has('Hello')).toBe(true)
    expect(set.has('hello')).toBe(false)
    expect(set.has('HELLO')).toBe(false)
  })

  it('provides estimated false positive rate', () => {
    const set = new ApproximateSet(100, 0.01)
    for (let i = 0; i < 10; i++) {
      set.add(`item-${i}`)
    }
    const rate = set.estimatedFalsePositiveRate
    expect(rate).toBeGreaterThanOrEqual(0)
    expect(rate).toBeLessThanOrEqual(1)
  })

  it('bitSize reflects internal capacity', () => {
    const set1 = new ApproximateSet(100)
    const set2 = new ApproximateSet(1000)
    expect(set2.bitSize).toBeGreaterThan(set1.bitSize)
  })

  it('handles empty string', () => {
    const set = new ApproximateSet()
    set.add('')
    expect(set.has('')).toBe(true)
  })

  it('handles unicode strings', () => {
    const set = new ApproximateSet()
    set.add('日本語')
    set.add('🎉')
    expect(set.has('日本語')).toBe(true)
    expect(set.has('🎉')).toBe(true)
  })

  it('handles numeric-like string keys', () => {
    const set = new ApproximateSet()
    set.add('123')
    set.add('456')
    expect(set.has('123')).toBe(true)
    expect(set.has('999')).toBe(false)
  })

  it('false positive rate is low for small fill', () => {
    const set = new ApproximateSet(1000, 0.01)
    for (let i = 0; i < 50; i++) set.add(`item-${i}`)
    const rate = set.estimatedFalsePositiveRate
    expect(rate).toBeLessThan(0.1)
  })

  it('has returns true after add', () => {
    const set = new ApproximateSet(1000)
    set.add('my-item')
    expect(set.has('my-item')).toBe(true)
  })

  it('has returns false for non-member', () => {
    const set = new ApproximateSet(1000)
    expect(set.has('not-added')).toBe(false)
  })

  it('add multiple items all report as members', () => {
    const set = new ApproximateSet(1000)
    set.add('a')
    set.add('b')
    set.add('c')
    expect(set.has('a')).toBe(true)
    expect(set.has('b')).toBe(true)
    expect(set.has('c')).toBe(true)
  })

  it('has returns false for absent element', () => {
    const set = new ApproximateSet(100)
    set.add('a')
    expect(set.has('zzz')).toBe(false)
  })
})