import { describe, it, expect } from 'vitest'
import { CountingBloomFilter } from '../src/core/counting-bloom-filter-2/index.js'

// ─── Constructor ───

describe('CountingBloomFilter', () => {
  it('creates with capacity', () => {
    const cbf = new CountingBloomFilter(100)
    expect(cbf.capacity).toBe(100)
    expect(cbf.size()).toBe(0)
    expect(cbf.isEmpty()).toBe(true)
  })

  it('creates with capacity and error rate', () => {
    const cbf = new CountingBloomFilter(50, 0.01)
    expect(cbf.capacity).toBe(50)
    expect(cbf.getErrorRate()).toBe(0.01)
  })

  it('creates with default error rate', () => {
    const cbf = new CountingBloomFilter(100)
    expect(cbf.getErrorRate()).toBeGreaterThan(0)
    expect(cbf.getErrorRate()).toBeLessThan(1)
  })

  // ─── Add / Has ───

  it('add and has', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('hello')
    expect(cbf.has('hello')).toBe(true)
    expect(cbf.has('world')).toBe(false)
  })

  it('add multiple items', () => {
    const cbf = new CountingBloomFilter(100)
    cbf.add('a')
    cbf.add('b')
    cbf.add('c')
    expect(cbf.has('a')).toBe(true)
    expect(cbf.has('b')).toBe(true)
    expect(cbf.has('c')).toBe(true)
    expect(cbf.size()).toBe(3)
  })

  it('duplicate add increments counters', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('x')
    cbf.add('x')
    expect(cbf.count('x')).toBeGreaterThanOrEqual(2)
    expect(cbf.size()).toBe(2)
  })

  // ─── Remove ───

  it('remove existing item', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('test')
    expect(cbf.remove('test')).toBe(true)
    expect(cbf.has('test')).toBe(false)
    expect(cbf.size()).toBe(0)
  })

  it('remove returns false for non-existent', () => {
    const cbf = new CountingBloomFilter(50)
    expect(cbf.remove('nope')).toBe(false)
  })

  it('remove decrements count', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('x')
    cbf.add('x')
    cbf.remove('x')
    expect(cbf.count('x')).toBeGreaterThanOrEqual(1)
  })

  // ─── Count ───

  it('count returns 0 for missing', () => {
    const cbf = new CountingBloomFilter(50)
    expect(cbf.count('missing')).toBe(0)
  })

  it('count returns estimated count', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('z')
    expect(cbf.count('z')).toBeGreaterThanOrEqual(1)
  })

  // ─── Clear ───

  it('clear resets filter', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('a')
    cbf.add('b')
    cbf.clear()
    expect(cbf.size()).toBe(0)
    expect(cbf.isEmpty()).toBe(true)
    expect(cbf.has('a')).toBe(false)
  })

  // ─── Clone ───

  it('clone preserves state', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('hello')
    const cl = cbf.clone()
    expect(cl.size()).toBe(1)
    expect(cl.has('hello')).toBe(true)
  })

  it('clone is independent', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('x')
    const cl = cbf.clone()
    cl.add('y')
    expect(cbf.size()).toBe(1)
    expect(cl.size()).toBe(2)
  })

  // ─── Equals ───

  it('equals returns true for identical filters', () => {
    const cbf1 = new CountingBloomFilter(50, 0.01)
    const cbf2 = new CountingBloomFilter(50, 0.01)
    cbf1.add('a')
    cbf2.add('a')
    expect(cbf1.equals(cbf2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const cbf1 = new CountingBloomFilter(50)
    const cbf2 = new CountingBloomFilter(100)
    expect(cbf1.equals(cbf2)).toBe(false)
  })

  it('equals returns false for different items', () => {
    const cbf1 = new CountingBloomFilter(50, 0.01)
    const cbf2 = new CountingBloomFilter(50, 0.01)
    cbf1.add('a')
    cbf2.add('b')
    expect(cbf1.equals(cbf2)).toBe(false)
  })

  // ─── Union ───

  it('union combines filters with max', () => {
    const cbf1 = new CountingBloomFilter(50, 0.01)
    const cbf2 = new CountingBloomFilter(50, 0.01)
    cbf1.add('a')
    cbf2.add('b')
    const result = cbf1.union(cbf2)
    expect(result.has('a')).toBe(true)
    expect(result.has('b')).toBe(true)
  })

  it('union throws on incompatible', () => {
    const cbf1 = new CountingBloomFilter(50)
    const cbf2 = new CountingBloomFilter(100)
    expect(() => cbf1.union(cbf2)).toThrow()
  })

  // ─── Intersection ───

  it('intersection combines with min', () => {
    const cbf1 = new CountingBloomFilter(50, 0.01)
    const cbf2 = new CountingBloomFilter(50, 0.01)
    cbf1.add('a')
    cbf1.add('b')
    cbf2.add('b')
    cbf2.add('c')
    const result = cbf1.intersection(cbf2)
    expect(result.has('b')).toBe(true)
  })

  it('intersection throws on incompatible', () => {
    const cbf1 = new CountingBloomFilter(50)
    const cbf2 = new CountingBloomFilter(100)
    expect(() => cbf1.intersection(cbf2)).toThrow()
  })

  // ─── LoadFactor ───

  it('loadFactor is 0 when empty', () => {
    const cbf = new CountingBloomFilter(50)
    expect(cbf.loadFactor).toBe(0)
  })

  it('loadFactor increases with items', () => {
    const cbf = new CountingBloomFilter(10)
    cbf.add('a')
    cbf.add('b')
    expect(cbf.loadFactor).toBeGreaterThan(0)
  })

  // ─── ExpectedFalsePositiveRate ───

  it('expectedFalsePositiveRate is 0 when empty', () => {
    const cbf = new CountingBloomFilter(50)
    expect(cbf.expectedFalsePositiveRate()).toBe(0)
  })

  it('expectedFalsePositiveRate increases with items', () => {
    const cbf = new CountingBloomFilter(10)
    for (let i = 0; i < 20; i++) cbf.add(`item${i}`)
    expect(cbf.expectedFalsePositiveRate()).toBeGreaterThan(0)
  })

  // ─── Static from ───

  it('static from creates filter from array', () => {
    const cbf = CountingBloomFilter.from(['a', 'b', 'c'])
    expect(cbf.has('a')).toBe(true)
    expect(cbf.has('b')).toBe(true)
    expect(cbf.has('c')).toBe(true)
    expect(cbf.size()).toBe(3)
  })

  it('static from with empty array', () => {
    const cbf = CountingBloomFilter.from([])
    expect(cbf.isEmpty()).toBe(true)
  })

  it('static from with custom capacity', () => {
    const cbf = CountingBloomFilter.from(['a'], 50, 0.01)
    expect(cbf.capacity).toBe(50)
  })

  // ─── Getters ───

  it('getBucketCount returns positive', () => {
    const cbf = new CountingBloomFilter(100)
    expect(cbf.getBucketCount()).toBeGreaterThan(0)
  })

  it('getHashFunctionCount returns positive', () => {
    const cbf = new CountingBloomFilter(100)
    expect(cbf.getHashFunctionCount()).toBeGreaterThan(0)
  })

  // ─── Edge cases ───

  it('add-remove-add cycle', () => {
    const cbf = new CountingBloomFilter(50)
    cbf.add('cycle')
    cbf.remove('cycle')
    expect(cbf.has('cycle')).toBe(false)
    cbf.add('cycle')
    expect(cbf.has('cycle')).toBe(true)
  })

  it('handles many items', () => {
    const cbf = new CountingBloomFilter(200)
    for (let i = 0; i < 100; i++) cbf.add(`item${i}`)
    expect(cbf.size()).toBe(100)
    expect(cbf.has('item0')).toBe(true)
    expect(cbf.has('item99')).toBe(true)
  })
})
