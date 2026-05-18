import { describe, it, expect } from 'vitest'
import { CountedBloomFilter } from '../src/core/counted-bloom/counted-bloom.js'

// ─── Constructor ───

describe('CountedBloomFilter', () => {
  it('creates with defaults', () => {
    const cbf = new CountedBloomFilter<string>()
    expect(cbf.size).toBe(0)
    expect(cbf.isEmpty).toBe(true)
    expect(cbf.capacity()).toBeGreaterThan(0)
  })

  it('creates with expected items and FP rate', () => {
    const cbf = new CountedBloomFilter<string>(100, 0.01)
    expect(cbf.capacity()).toBe(100)
  })

  it('creates with options object', () => {
    const cbf = new CountedBloomFilter<string>({ expectedItems: 50, falsePositiveRate: 0.05, counterBits: 16 })
    expect(cbf.capacity()).toBe(50)
  })

  it('creates with 16-bit counters', () => {
    const cbf = new CountedBloomFilter<string>({ expectedItems: 100, counterBits: 16 })
    const json = cbf.toJSON()
    expect(json.counterBits).toBe(16)
  })

  // ─── Add / Has ───

  it('add and has', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('hello')
    expect(cbf.has('hello')).toBe(true)
    expect(cbf.has('world')).toBe(false)
    expect(cbf.size).toBe(1)
  })

  it('add multiple items', () => {
    const cbf = new CountedBloomFilter<string>(100, 0.01)
    cbf.add('a')
    cbf.add('b')
    cbf.add('c')
    expect(cbf.has('a')).toBe(true)
    expect(cbf.has('b')).toBe(true)
    expect(cbf.has('c')).toBe(true)
    expect(cbf.size).toBe(3)
  })

  it('duplicate add increments counters', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('x')
    cbf.add('x')
    expect(cbf.count('x')).toBeGreaterThanOrEqual(2)
    expect(cbf.size).toBe(2)
  })

  it('has returns false for empty filter', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect(cbf.has('anything')).toBe(false)
  })

  // ─── Remove ───

  it('remove existing item', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('test')
    expect(cbf.remove('test')).toBe(true)
    expect(cbf.has('test')).toBe(false)
    expect(cbf.size).toBe(0)
  })

  it('remove returns false for non-existent', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect(cbf.remove('nope')).toBe(false)
  })

  it('remove decrements count', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('x')
    cbf.add('x')
    cbf.add('x')
    cbf.remove('x')
    expect(cbf.count('x')).toBeGreaterThanOrEqual(1)
    expect(cbf.size).toBe(2)
  })

  it('remove all copies', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('y')
    cbf.add('y')
    cbf.remove('y')
    cbf.remove('y')
    expect(cbf.has('y')).toBe(false)
  })

  // ─── Count ───

  it('count returns 0 for missing item', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect(cbf.count('missing')).toBe(0)
  })

  it('count returns estimated count', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('z')
    expect(cbf.count('z')).toBeGreaterThanOrEqual(1)
  })

  // ─── FalsePositiveRate ───

  it('falsePositiveRate is 0 when empty', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect(cbf.falsePositiveRate()).toBe(0)
  })

  it('falsePositiveRate increases with items', () => {
    const cbf = new CountedBloomFilter<string>(10, 0.01)
    const initial = cbf.falsePositiveRate()
    for (let i = 0; i < 20; i++) cbf.add(`item${i}`)
    expect(cbf.falsePositiveRate()).toBeGreaterThan(initial)
  })

  // ─── FillRatio ───

  it('fillRatio is 0 when empty', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect(cbf.fillRatio()).toBe(0)
  })

  it('fillRatio increases with items', () => {
    const cbf = new CountedBloomFilter<string>(10, 0.01)
    cbf.add('a')
    cbf.add('b')
    cbf.add('c')
    expect(cbf.fillRatio()).toBeGreaterThan(0)
  })

  // ─── EstimatedCount ───

  it('estimatedCount on empty filter', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect(cbf.estimatedCount()).toBe(0)
  })

  it('estimatedCount with items', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    for (let i = 0; i < 10; i++) cbf.add(`item${i}`)
    expect(cbf.estimatedCount()).toBeGreaterThan(0)
  })

  // ─── Clear ───

  it('clear resets filter', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('a')
    cbf.add('b')
    cbf.clear()
    expect(cbf.size).toBe(0)
    expect(cbf.isEmpty).toBe(true)
    expect(cbf.has('a')).toBe(false)
    expect(cbf.getStatistics().adds).toBe(0)
  })

  // ─── Merge ───

  it('merge combines filters', () => {
    const cbf1 = new CountedBloomFilter<string>(50, 0.01)
    const cbf2 = new CountedBloomFilter<string>(50, 0.01)
    cbf1.add('a')
    cbf2.add('b')
    cbf1.merge(cbf2)
    expect(cbf1.has('a')).toBe(true)
    expect(cbf1.has('b')).toBe(true)
    expect(cbf1.size).toBe(2)
  })

  it('merge throws on incompatible bucket counts', () => {
    const cbf1 = new CountedBloomFilter<string>(50, 0.01)
    const cbf2 = new CountedBloomFilter<string>(100, 0.01)
    expect(() => cbf1.merge(cbf2)).toThrow('bucket counts')
  })

  it('merge throws on incompatible hash counts', () => {
    const cbf1 = new CountedBloomFilter<string>({ expectedItems: 50, counterBits: 8 })
    const cbf2 = new CountedBloomFilter<string>({ expectedItems: 50, counterBits: 16 })
    expect(() => cbf1.merge(cbf2)).toThrow()
  })

  // ─── ToJSON / FromJSON ───

  it('toJSON serializes filter', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('test')
    const json = cbf.toJSON()
    expect(json.size).toBe(1)
    expect(json.bucketCount).toBeGreaterThan(0)
    expect(json.hashCount).toBeGreaterThan(0)
    expect(json.counterBits).toBe(4)
    expect(json.statistics.adds).toBe(1)
    expect(Array.isArray(json.counters)).toBe(true)
  })

  it('fromJSON restores filter', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('hello')
    cbf.add('world')
    const json = cbf.toJSON()
    const restored = CountedBloomFilter.fromJSON<string>(json)
    expect(restored.size).toBe(2)
    expect(restored.has('hello')).toBe(true)
    expect(restored.has('world')).toBe(true)
  })

  it('round-trip preserves state', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    for (let i = 0; i < 10; i++) cbf.add(`item${i}`)
    const restored = CountedBloomFilter.fromJSON<string>(cbf.toJSON())
    for (let i = 0; i < 10; i++) {
      expect(restored.has(`item${i}`)).toBe(true)
    }
    expect(restored.size).toBe(10)
  })

  // ─── Statistics ───

  it('statistics track operations', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('a')
    cbf.add('b')
    cbf.has('a')
    cbf.remove('a')
    const stats = cbf.getStatistics()
    expect(stats.adds).toBe(2)
    expect(stats.removes).toBe(1)
    expect(stats.lookups).toBeGreaterThanOrEqual(1)
  })

  it('statistics resets on clear', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('a')
    cbf.clear()
    const stats = cbf.getStatistics()
    expect(stats.adds).toBe(0)
    expect(stats.removes).toBe(0)
    expect(stats.lookups).toBe(0)
  })

  // ─── Iterator ───

  it('iterates over non-zero counters', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('test')
    const entries = [...cbf]
    expect(entries.length).toBeGreaterThan(0)
    expect(entries[0]!.count).toBeGreaterThan(0)
    expect(entries[0]!.position).toBeGreaterThanOrEqual(0)
  })

  it('empty filter yields nothing', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    expect([...cbf]).toEqual([])
  })

  // ─── Counter overflow ───

  it('tracks counter overflows', () => {
    const cbf = new CountedBloomFilter<string>({ expectedItems: 5, counterBits: 4 })
    for (let i = 0; i < 20; i++) cbf.add('saturate')
    expect(cbf.getStatistics().overflows).toBeGreaterThan(0)
  })

  // ─── Numeric keys ───

  it('works with number keys', () => {
    const cbf = new CountedBloomFilter<number>(50, 0.01)
    cbf.add(42)
    expect(cbf.has(42)).toBe(true)
    expect(cbf.has(99)).toBe(false)
  })

  // ─── Edge cases ───

  it('handles many insertions', () => {
    const cbf = new CountedBloomFilter<string>(200, 0.01)
    for (let i = 0; i < 100; i++) cbf.add(`item${i}`)
    expect(cbf.size).toBe(100)
    expect(cbf.has('item0')).toBe(true)
    expect(cbf.has('item99')).toBe(true)
  })

  it('add-remove-add cycle', () => {
    const cbf = new CountedBloomFilter<string>(50, 0.01)
    cbf.add('cycle')
    cbf.remove('cycle')
    expect(cbf.has('cycle')).toBe(false)
    cbf.add('cycle')
    expect(cbf.has('cycle')).toBe(true)
  })
})
