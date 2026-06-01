import { describe, expect, it } from 'vitest'
import { HeavyHitters } from '../../src/utils/heavy-hitters.js'

describe('HeavyHitters', () => {
  it('tracks frequent items', () => {
    const hh = new HeavyHitters<string>(3)
    hh.add('a', 10)
    hh.add('b', 5)
    hh.add('c', 1)
    expect(hh.getCount('a')).toBe(10)
    expect(hh.getCount('b')).toBe(5)
  })

  it('evicts low-frequency items', () => {
    const hh = new HeavyHitters<string>(2)
    hh.add('a', 5)
    hh.add('b', 5)
    hh.add('c', 1)
    hh.add('d', 1)
    expect(hh.size).toBeLessThanOrEqual(2)
  })

  it('returns items and counts', () => {
    const hh = new HeavyHitters<number>(5)
    hh.add(1)
    hh.add(2)
    hh.add(3)
    expect(hh.getItems()).toEqual([1, 2, 3])
    expect(hh.getHitters().size).toBe(3)
  })

  it('handles single tracker', () => {
    const hh = new HeavyHitters<string>(1)
    hh.add('x', 10)
    expect(hh.getCount('x')).toBe(10)
    hh.add('y', 5)
    expect(hh.getCount('y')).toBe(0)
  })

  it('clear resets all state', () => {
    const hh = new HeavyHitters<string>(5)
    hh.add('a', 10)
    hh.clear()
    expect(hh.size).toBe(0)
    expect(hh.getCount('a')).toBe(0)
  })

  it('ignores zero and negative counts', () => {
    const hh = new HeavyHitters<string>(3)
    hh.add('a', 0)
    hh.add('b', -1)
    expect(hh.size).toBe(0)
  })

  it('throws on invalid k', () => {
    expect(() => new HeavyHitters(0)).toThrow(RangeError)
    expect(() => new HeavyHitters(-1)).toThrow(RangeError)
  })

  it('handles bulk adds correctly', () => {
    const hh = new HeavyHitters<number>(3)
    for (let i = 0; i < 100; i++) hh.add(1)
    for (let i = 0; i < 50; i++) hh.add(2)
    expect(hh.getCount(1)).toBe(100)
    expect(hh.getCount(2)).toBe(50)
  })

  it('getCount returns 0 for unseen item', () => {
    const hh = new HeavyHitters<string>(3)
    expect(hh.getCount('missing')).toBe(0)
  })

  it('getItems returns tracked items', () => {
    const hh = new HeavyHitters<number>(5)
    hh.add(1)
    hh.add(2)
    hh.add(3)
    expect(hh.getItems().sort()).toEqual([1, 2, 3])
  })

  it('getHitters returns map', () => {
    const hh = new HeavyHitters<string>(5)
    hh.add('a', 5)
    const hitters = hh.getHitters()
    expect(hitters.get('a')).toBe(5)
  })

  it('frequent item survives eviction', () => {
    const hh = new HeavyHitters<number>(2)
    hh.add(1, 100)
    hh.add(2, 1)
    hh.add(3, 1)
    expect(hh.getCount(1)).toBeGreaterThan(0)
    expect(hh.getCount(1)).toBeGreaterThanOrEqual(98)
  })

  it('clear allows reuse', () => {
    const hh = new HeavyHitters<string>(3)
    hh.add('a', 100)
    hh.clear()
    expect(hh.size).toBe(0)
    hh.add('b', 50)
    expect(hh.getCount('b')).toBe(50)
  })

  it('handles repeated adds to same item', () => {
    const hh = new HeavyHitters<string>(3)
    hh.add('a', 1)
    hh.add('a', 1)
    hh.add('a', 1)
    expect(hh.getCount('a')).toBe(3)
  })

  it('default count is 1', () => {
    const hh = new HeavyHitters<string>(3)
    hh.add('a')
    expect(hh.getCount('a')).toBe(1)
  })

  it('handles single item', () => {
    const hh = new HeavyHitters<string>(1)
    hh.add('a', 10)
    expect(hh.getCount('a')).toBe(10)
    expect(hh.size).toBe(1)
  })

  it('handles get for unknown item', () => {
    const hh = new HeavyHitters<string>()
    expect(hh.getCount('x')).toBe(0)
  })
})
