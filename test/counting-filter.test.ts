import { describe, it, expect } from 'vitest'
import { CountingFilter } from '../src/core/counting-filter/counting-filter.js'
import { DEFAULT_COUNTING_FILTER_OPTIONS } from '../src/core/counting-filter/counting-filter.js'

// ─── Constructor ───

describe('CountingFilter', () => {
  it('creates with default options', () => {
    const cf = new CountingFilter()
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
    expect(cf.capacity).toBe(DEFAULT_COUNTING_FILTER_OPTIONS.expectedItems)
  })

  it('creates with expected items and FP rate', () => {
    const cf = new CountingFilter(100, 0.01)
    expect(cf.capacity).toBe(100)
  })

  it('creates with options object', () => {
    const cf = new CountingFilter({ expectedItems: 50, falsePositiveRate: 0.05 })
    expect(cf.capacity).toBe(50)
  })

  it('creates with 16-bit counters', () => {
    const cf = new CountingFilter({ expectedItems: 100, counterBits: 16 })
    const stats = cf.stats()
    expect(stats.counterBits).toBe(16)
  })

  // ─── Insert / MayContain ───

  it('insert and mayContain', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('hello')
    expect(cf.mayContain('hello')).toBe(true)
    expect(cf.mayContain('world')).toBe(false)
    expect(cf.size).toBe(1)
  })

  it('insert multiple items', () => {
    const cf = new CountingFilter<string>(100, 0.01)
    cf.insert('a')
    cf.insert('b')
    cf.insert('c')
    expect(cf.mayContain('a')).toBe(true)
    expect(cf.mayContain('b')).toBe(true)
    expect(cf.mayContain('c')).toBe(true)
    expect(cf.size).toBe(3)
  })

  it('duplicate insert increments counters', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('x')
    cf.insert('x')
    cf.insert('x')
    expect(cf.count('x')).toBe(3)
    expect(cf.size).toBe(3)
  })

  it('mayContain returns false for empty filter', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    expect(cf.mayContain('anything')).toBe(false)
  })

  // ─── Remove ───

  it('remove existing item', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('test')
    expect(cf.remove('test')).toBe(true)
    expect(cf.mayContain('test')).toBe(false)
    expect(cf.size).toBe(0)
  })

  it('remove returns false for non-existent', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    expect(cf.remove('nope')).toBe(false)
  })

  it('remove decrements count', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('x')
    cf.insert('x')
    cf.insert('x')
    cf.remove('x')
    expect(cf.count('x')).toBe(2)
    expect(cf.size).toBe(2)
  })

  it('remove all copies then mayContain is false', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('y')
    cf.insert('y')
    cf.remove('y')
    cf.remove('y')
    expect(cf.mayContain('y')).toBe(false)
  })

  // ─── Count ───

  it('count returns 0 for missing item', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    expect(cf.count('missing')).toBe(0)
  })

  it('count returns minimum of hash positions', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('z')
    expect(cf.count('z')).toBeGreaterThanOrEqual(1)
  })

  // ─── FalsePositiveRate ───

  it('falsePositiveRate is 0 when empty', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    expect(cf.falsePositiveRate()).toBe(0)
  })

  it('falsePositiveRate increases with items', () => {
    const cf = new CountingFilter<string>(10, 0.01)
    const initial = cf.falsePositiveRate()
    for (let i = 0; i < 20; i++) cf.insert(`item${i}`)
    expect(cf.falsePositiveRate()).toBeGreaterThan(initial)
  })

  // ─── Clear ───

  it('clear resets filter', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('a')
    cf.insert('b')
    cf.clear()
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
    expect(cf.mayContain('a')).toBe(false)
  })

  // ─── Clone ───

  it('clone preserves state', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('hello')
    const cl = cf.clone()
    expect(cl.size).toBe(1)
    expect(cl.mayContain('hello')).toBe(true)
  })

  it('clone is independent', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('x')
    const cl = cf.clone()
    cl.insert('y')
    expect(cf.size).toBe(1)
    expect(cl.size).toBe(2)
  })

  // ─── ToJSON / FromJSON ───

  it('toJSON serializes filter', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('test')
    const json = cf.toJSON()
    expect(json.itemCount).toBe(1)
    expect(json.counterCount).toBeGreaterThan(0)
    expect(json.hashCount).toBeGreaterThan(0)
    expect(json.counterBits).toBe(8)
    expect(Array.isArray(json.counters)).toBe(true)
  })

  it('fromJSON restores filter', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('hello')
    cf.insert('world')
    const json = cf.toJSON()
    const restored = CountingFilter.fromJSON<string>(json)
    expect(restored.size).toBe(2)
    expect(restored.mayContain('hello')).toBe(true)
    expect(restored.mayContain('world')).toBe(true)
  })

  it('fromJSON with 16-bit counters', () => {
    const cf = new CountingFilter<string>({ expectedItems: 50, counterBits: 16 })
    cf.insert('test')
    const json = cf.toJSON()
    const restored = CountingFilter.fromJSON<string>(json)
    expect(restored.stats().counterBits).toBe(16)
    expect(restored.mayContain('test')).toBe(true)
  })

  it('from is alias for fromJSON', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('x')
    const json = cf.toJSON()
    const restored = CountingFilter.from<string>(json)
    expect(restored.mayContain('x')).toBe(true)
  })

  it('round-trip preserves state', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    for (let i = 0; i < 10; i++) cf.insert(`item${i}`)
    const restored = CountingFilter.fromJSON<string>(cf.toJSON())
    for (let i = 0; i < 10; i++) {
      expect(restored.mayContain(`item${i}`)).toBe(true)
    }
    expect(restored.size).toBe(10)
  })

  // ─── Stats ───

  it('stats returns complete object', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('a')
    const s = cf.stats()
    expect(s.counterCount).toBeGreaterThan(0)
    expect(s.hashCount).toBeGreaterThan(0)
    expect(s.expectedItems).toBe(50)
    expect(s.targetFalsePositiveRate).toBe(0.01)
    expect(s.size).toBe(1)
    expect(s.capacity).toBe(50)
    expect(s.falsePositiveRate).toBeGreaterThanOrEqual(0)
    expect(s.fillRatio).toBeGreaterThan(0)
    expect(s.counterBits).toBe(8)
    expect(s.usedCounters).toBeGreaterThan(0)
    expect(s.maxCounter).toBeGreaterThanOrEqual(1)
  })

  it('stats on empty filter', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    const s = cf.stats()
    expect(s.size).toBe(0)
    expect(s.usedCounters).toBe(0)
    expect(s.maxCounter).toBe(0)
    expect(s.fillRatio).toBe(0)
  })

  // ─── Numeric keys ───

  it('works with number keys', () => {
    const cf = new CountingFilter<number>(50, 0.01)
    cf.insert(42)
    expect(cf.mayContain(42)).toBe(true)
    expect(cf.mayContain(99)).toBe(false)
  })

  // ─── DEFAULT_COUNTING_FILTER_OPTIONS ───

  it('exports default options', () => {
    expect(DEFAULT_COUNTING_FILTER_OPTIONS.expectedItems).toBeGreaterThan(0)
    expect(DEFAULT_COUNTING_FILTER_OPTIONS.falsePositiveRate).toBeGreaterThan(0)
    expect(DEFAULT_COUNTING_FILTER_OPTIONS.falsePositiveRate).toBeLessThan(1)
  })

  // ─── Edge cases ───

  it('handles many insertions', () => {
    const cf = new CountingFilter<string>(200, 0.01)
    for (let i = 0; i < 100; i++) cf.insert(`item${i}`)
    expect(cf.size).toBe(100)
    expect(cf.mayContain('item0')).toBe(true)
    expect(cf.mayContain('item99')).toBe(true)
  })

  it('insert-remove-insert cycle', () => {
    const cf = new CountingFilter<string>(50, 0.01)
    cf.insert('cycle')
    cf.remove('cycle')
    expect(cf.mayContain('cycle')).toBe(false)
    cf.insert('cycle')
    expect(cf.mayContain('cycle')).toBe(true)
  })

  it('counter saturation at max', () => {
    const cf = new CountingFilter<string>({ expectedItems: 10, counterBits: 8 })
    for (let i = 0; i < 300; i++) cf.insert('saturate')
    expect(cf.count('saturate')).toBeLessThanOrEqual(255)
    expect(cf.count('saturate')).toBeGreaterThan(0)
  })
})
