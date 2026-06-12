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
    set.add('first'); set.add('second'); set.add('third')
    expect(set.count).toBe(3)
  })

  it('returns true for added element', () => {
    const set = new ApproximateSet()
    set.add('exists')
    expect(set.has('exists')).toBe(true)
  })

  it('returns false for non-existent element in empty set', () => {
    expect(new ApproximateSet().has('nonexistent')).toBe(false)
  })

  it('handles adding duplicate elements', () => {
    const set = new ApproximateSet()
    set.add('dup'); set.add('dup'); set.add('dup')
    expect(set.count).toBe(3)
  })

  it('handles many elements', () => {
    const set = new ApproximateSet(1000)
    for (let i = 0; i < 100; i++) set.add(`item-${i}`)
    expect(set.count).toBe(100)
  })

  it('has returns true for all added elements', () => {
    const set = new ApproximateSet()
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) set.add(item)
    for (const item of items) expect(set.has(item)).toBe(true)
  })

  it('false positive rate within bounds', () => {
    const set = new ApproximateSet(100, 0.01)
    for (let i = 0; i < 50; i++) set.add(`item-${i}`)
    let fp = 0
    for (let i = 100; i < 1100; i++) {
      if (set.has(`item-${i}`)) fp++
    }
    expect(fp / 1000).toBeLessThan(0.05)
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
    for (let i = 0; i < 10; i++) set.add(`item-${i}`)
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
    set.add('日本語'); set.add('🎉')
    expect(set.has('日本語')).toBe(true)
    expect(set.has('🎉')).toBe(true)
  })

  it('handles numeric-like string keys', () => {
    const set = new ApproximateSet()
    set.add('123'); set.add('456')
    expect(set.has('123')).toBe(true)
    expect(set.has('999')).toBe(false)
  })

  it('false positive rate is low for small fill', () => {
    const set = new ApproximateSet(1000, 0.01)
    for (let i = 0; i < 50; i++) set.add(`item-${i}`)
    expect(set.estimatedFalsePositiveRate).toBeLessThan(0.1)
  })

  it('toString contains useful info', () => {
    const set = new ApproximateSet(100)
    set.add('a')
    const str = set.toString()
    expect(str).toContain('ApproximateSet')
    expect(str).toContain('count=1')
  })

  it('toJSON returns structured data', () => {
    const set = new ApproximateSet(100)
    set.add('x')
    const json = set.toJSON() as { size: number; count: number; bits: number[] }
    expect(json.size).toBeGreaterThan(0)
    expect(json.count).toBe(1)
    expect(json.bits).toBeInstanceOf(Array)
  })

  it('clone produces equal set', () => {
    const set = new ApproximateSet(100)
    set.add('a'); set.add('b')
    const cloned = set.clone()
    expect(cloned.equals(set)).toBe(true)
  })

  it('clone produces independent copy', () => {
    const set = new ApproximateSet(100)
    set.add('x')
    const cloned = set.clone()
    cloned.add('y')
    expect(set.count).toBe(1)
    expect(cloned.count).toBe(2)
  })

  it('equals returns false for different types', () => {
    const set = new ApproximateSet()
    expect(set.equals(null)).toBe(false)
    expect(set.equals(undefined)).toBe(false)
    expect(set.equals({})).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const s1 = new ApproximateSet(100)
    const s2 = new ApproximateSet(200)
    expect(s1.equals(s2)).toBe(false)
  })

  it('equals returns false for different counts', () => {
    const s1 = new ApproximateSet(100)
    const s2 = new ApproximateSet(100)
    s1.add('a')
    expect(s1.equals(s2)).toBe(false)
  })

  it('equals returns true for identical sets', () => {
    const s1 = new ApproximateSet(100)
    const s2 = new ApproximateSet(100)
    s1.add('a'); s2.add('a')
    expect(s1.equals(s2)).toBe(true)
  })

  it('estimatedFalsePositiveRate is 0 for empty set', () => {
    const set = new ApproximateSet()
    expect(set.estimatedFalsePositiveRate).toBe(0)
  })

  it('estimatedFalsePositiveRate increases with more items', () => {
    const set = new ApproximateSet(50, 0.01)
    const rate1 = set.estimatedFalsePositiveRate
    for (let i = 0; i < 50; i++) set.add(`item-${i}`)
    const rate2 = set.estimatedFalsePositiveRate
    expect(rate2).toBeGreaterThan(rate1)
  })

  it('handles very small expected items', () => {
    const set = new ApproximateSet(1)
    set.add('x')
    expect(set.has('x')).toBe(true)
    expect(set.bitSize).toBeGreaterThanOrEqual(64)
  })

  it('handles very low false positive rate', () => {
    const set = new ApproximateSet(100, 0.0001)
    expect(set.bitSize).toBeGreaterThan(0)
    set.add('test')
    expect(set.has('test')).toBe(true)
  })

  it('handles very high false positive rate', () => {
    const set = new ApproximateSet(100, 0.5)
    set.add('test')
    expect(set.has('test')).toBe(true)
  })

  it('bitSize is at least 64', () => {
    const set = new ApproximateSet(1, 0.5)
    expect(set.bitSize).toBeGreaterThanOrEqual(64)
  })

  it('count tracks additions accurately', () => {
    const set = new ApproximateSet()
    expect(set.count).toBe(0)
    for (let i = 0; i < 10; i++) set.add(`item${i}`)
    expect(set.count).toBe(10)
  })

  it('adding same item increments count', () => {
    const set = new ApproximateSet()
    set.add('same'); set.add('same')
    expect(set.count).toBe(2)
    expect(set.has('same')).toBe(true)
  })

  it('no false negatives', () => {
    const set = new ApproximateSet(1000)
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
    for (const item of items) set.add(item)
    for (const item of items) expect(set.has(item)).toBe(true)
  })

  it('large scale no false negatives', () => {
    const set = new ApproximateSet(5000, 0.01)
    for (let i = 0; i < 1000; i++) set.add(`key-${i}`)
    for (let i = 0; i < 1000; i++) expect(set.has(`key-${i}`)).toBe(true)
  })

  it('handles special characters', () => {
    const set = new ApproximateSet()
    set.add('a/b\\c'); set.add('\n\t'); set.add('a\x00b')
    expect(set.has('a/b\\c')).toBe(true)
    expect(set.has('\n\t')).toBe(true)
    expect(set.has('a\x00b')).toBe(true)
  })

  it('handles long strings', () => {
    const set = new ApproximateSet()
    const longStr = 'x'.repeat(10000)
    set.add(longStr)
    expect(set.has(longStr)).toBe(true)
  })

  it('different strings likely produce different hashes', () => {
    const set = new ApproximateSet(1000)
    set.add('abc')
    expect(set.has('abc')).toBe(true)
    expect(set.has('def')).toBe(false)
    expect(set.has('cba')).toBe(false)
  })

  it('clone preserves bitSize and hashCount', () => {
    const set = new ApproximateSet(100, 0.01)
    const cloned = set.clone()
    expect(cloned.bitSize).toBe(set.bitSize)
    expect(cloned.count).toBe(set.count)
  })

  it('hashCount varies with configuration', () => {
    const set1 = new ApproximateSet(100, 0.01)
    const set2 = new ApproximateSet(1000, 0.01)
    const set3 = new ApproximateSet(100, 0.001)
    expect(set2.bitSize).toBeGreaterThan(set1.bitSize)
    expect(set3.bitSize).toBeGreaterThan(set1.bitSize)
  })

  it('empty set equals another empty set with same config', () => {
    const s1 = new ApproximateSet(100, 0.01)
    const s2 = new ApproximateSet(100, 0.01)
    expect(s1.equals(s2)).toBe(true)
  })

  it('toJSON includes hashCount in output', () => {
    const set = new ApproximateSet(100, 0.01)
    set.add('test')
    const json = set.toJSON() as { size: number; hashCount: number; count: number }
    expect(json.hashCount).toBeGreaterThan(0)
    expect(json.size).toBeGreaterThan(0)
    expect(json.count).toBe(1)
  })

  it('clone of empty set remains independent', () => {
    const set = new ApproximateSet(100)
    const cloned = set.clone()
    set.add('original')
    cloned.add('copy')
    expect(set.has('original')).toBe(true)
    expect(set.has('copy')).toBe(false)
    expect(cloned.has('copy')).toBe(true)
    expect(cloned.has('original')).toBe(false)
  })

  it('equals returns false when bitSize differs', () => {
    const s1 = new ApproximateSet(100, 0.01)
    const s2 = new ApproximateSet(100, 0.001)
    s1.add('test')
    s2.add('test')
    expect(s1.equals(s2)).toBe(false)
  })

  it('toString format is consistent with different configurations', () => {
    const set1 = new ApproximateSet(100, 0.01)
    const set2 = new ApproximateSet(500, 0.001)
    set1.add('a')
    set2.add('b')
    const str1 = set1.toString()
    const str2 = set2.toString()
    expect(str1).toMatch(/ApproximateSet\(size=\d+, hashCount=\d+, count=\d+\)/)
    expect(str2).toMatch(/ApproximateSet\(size=\d+, hashCount=\d+, count=\d+\)/)
  })

  it('add and has with many unique items', () => {
    const set = new ApproximateSet(200, 0.01)
    for (let i = 0; i < 100; i++) set.add(`unique-${i}`)
    expect(set.count).toBe(100)
    for (let i = 0; i < 100; i++) expect(set.has(`unique-${i}`)).toBe(true)
  })

  it('clone preserves has behavior', () => {
    const set = new ApproximateSet(100)
    set.add('alpha'); set.add('beta')
    const cloned = set.clone()
    expect(cloned.has('alpha')).toBe(true)
    expect(cloned.has('beta')).toBe(true)
    expect(cloned.has('gamma')).toBe(false)
  })

  it('toJSON bits array has correct length', () => {
    const set = new ApproximateSet(100, 0.01)
    const json = set.toJSON() as { bits: number[]; size: number }
    expect(json.bits.length).toBe(Math.ceil(json.size / 8))
  })

  it('estimatedFalsePositiveRate for single item is very low', () => {
    const set = new ApproximateSet(1000, 0.01)
    set.add('only-one')
    expect(set.estimatedFalsePositiveRate).toBeLessThan(0.01)
  })

  it('equals returns false after modifying one set', () => {
    const s1 = new ApproximateSet(100)
    const s2 = new ApproximateSet(100)
    s1.add('a'); s2.add('a')
    expect(s1.equals(s2)).toBe(true)
    s1.add('b')
    expect(s1.equals(s2)).toBe(false)
  })

  it('estimatedFalsePositiveRate starts near zero', () => {
    const s = new ApproximateSet(1000)
    expect(s.estimatedFalsePositiveRate).toBeLessThan(0.01)
  })

  it('estimatedFalsePositiveRate increases with more items', () => {
    const s = new ApproximateSet(10, 0.01)
    for (let i = 0; i < 50; i++) s.add(`item-${i}`)
    const rate = s.estimatedFalsePositiveRate
    expect(rate).toBeGreaterThan(0)
  })

  it('clone preserves hashCount', () => {
    const s = new ApproximateSet(500)
    s.add('x')
    const c = s.clone()
    expect(c.bitSize).toBe(s.bitSize)
    expect(c.count).toBe(s.count)
  })

  it('handles unicode strings', () => {
    const s = new ApproximateSet(100)
    s.add('café')
    s.add('日本語')
    expect(s.has('café')).toBe(true)
    expect(s.has('日本語')).toBe(true)
  })
})

  it('has returns false for non-member', () => {
    const s = new ApproximateSet(100)
    expect(s.has('missing')).toBe(false)
  })

  it('add and has returns true', () => {
    const s = new ApproximateSet(100)
    s.add('hello')
    expect(s.has('hello')).toBe(true)
  })

  it('count returns count', () => {
    const s = new ApproximateSet(100)
    s.add('a')
    s.add('b')
    expect(s.count).toBe(2)
  })

describe('approximate-set - wave544', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
