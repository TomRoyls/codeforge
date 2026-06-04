import { describe, it, expect } from 'vitest'
import { HeavyKeeper } from '../../src/utils/heavy-keeper.js'

describe('HeavyKeeper', () => {
  it('creates with default options', () => {
    const hk = new HeavyKeeper()
    expect(hk.size).toBe(1024)
    expect(hk.total).toBe(0)
    expect(hk.isEmpty()).toBe(true)
  })

  it('creates with custom options', () => {
    const hk = new HeavyKeeper({ depth: 2, width: 100, decay: 0.8 })
    expect(hk.size).toBe(200)
    expect(hk.isEmpty()).toBe(true)
  })

  it('throws for invalid depth', () => {
    expect(() => new HeavyKeeper({ depth: 0 })).toThrow(RangeError)
    expect(() => new HeavyKeeper({ depth: -1 })).toThrow(RangeError)
  })

  it('throws for invalid width', () => {
    expect(() => new HeavyKeeper({ width: 0 })).toThrow(RangeError)
    expect(() => new HeavyKeeper({ width: -1 })).toThrow(RangeError)
  })

  it('throws for invalid decay', () => {
    expect(() => new HeavyKeeper({ decay: 0 })).toThrow(RangeError)
    expect(() => new HeavyKeeper({ decay: 1 })).toThrow(RangeError)
    expect(() => new HeavyKeeper({ decay: -0.1 })).toThrow(RangeError)
    expect(() => new HeavyKeeper({ decay: 1.1 })).toThrow(RangeError)
  })

  it('updates single key', () => {
    const hk = new HeavyKeeper()
    hk.update('key1', 1)
    expect(hk.total).toBe(1)
    expect(hk.estimate('key1')).toBe(1)
  })

  it('updates key multiple times', () => {
    const hk = new HeavyKeeper()
    hk.update('key1', 5)
    hk.update('key1', 3)
    expect(hk.total).toBe(8)
    expect(hk.estimate('key1')).toBe(8)
  })

  it('estimates zero for missing key', () => {
    const hk = new HeavyKeeper()
    hk.update('key1', 1)
    expect(hk.estimate('missing')).toBe(0)
  })

  it('updates multiple keys', () => {
    const hk = new HeavyKeeper()
    hk.update('key1', 3)
    hk.update('key2', 2)
    hk.update('key3', 1)
    expect(hk.total).toBe(6)
    expect(hk.estimate('key1')).toBe(3)
    expect(hk.estimate('key2')).toBe(2)
  })

  it('finds heavy hitters with threshold', () => {
    const hk = new HeavyKeeper()
    hk.update('a', 80)
    hk.update('b', 15)
    hk.update('c', 5)
    const hitters = hk.heavyHitters(0.1)
    const keys = hitters.map((h) => h.key)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('returns empty for high threshold', () => {
    const hk = new HeavyKeeper()
    hk.update('a', 10)
    hk.update('b', 10)
    const hitters = hk.heavyHitters(0.9)
    expect(hitters).toEqual([])
  })

  it('throws for invalid threshold', () => {
    const hk = new HeavyKeeper()
    hk.update('a', 1)
    expect(() => hk.heavyHitters(-0.1)).toThrow(RangeError)
    expect(() => hk.heavyHitters(1.1)).toThrow(RangeError)
  })

  it('returns top k items', () => {
    const hk = new HeavyKeeper()
    hk.update('a', 100)
    hk.update('b', 50)
    hk.update('c', 30)
    hk.update('d', 20)
    const top = hk.top(2)
    expect(top.length).toBe(2)
    expect(top[0]!.key).toBe('a')
    expect(top[1]!.key).toBe('b')
  })

  it('returns less than k when few items', () => {
    const hk = new HeavyKeeper()
    hk.update('a', 10)
    const top = hk.top(5)
    expect(top.length).toBe(1)
    expect(top[0]!.key).toBe('a')
  })

  it('top k returns sorted by count', () => {
    const hk = new HeavyKeeper()
    hk.update('z', 10)
    hk.update('a', 100)
    hk.update('m', 50)
    const top = hk.top(3)
    expect(top[0]!.count).toBeGreaterThanOrEqual(top[1]!.count)
    expect(top[1]!.count).toBeGreaterThanOrEqual(top[2]!.count)
  })

  it('handles zero count updates', () => {
    const hk = new HeavyKeeper()
    hk.update('key1', 0)
    expect(hk.total).toBe(0)
    expect(hk.estimate('key1')).toBe(0)
  })

  it('handles negative count updates', () => {
    const hk = new HeavyKeeper()
    hk.update('key1', -5)
    expect(hk.total).toBe(0)
    expect(hk.estimate('key1')).toBe(0)
  })

  it('resets to initial state', () => {
    const hk = new HeavyKeeper()
    hk.update('a', 10)
    hk.update('b', 20)
    hk.reset()
    expect(hk.total).toBe(0)
    expect(hk.isEmpty()).toBe(true)
    expect(hk.estimate('a')).toBe(0)
  })

  it('creates from items with default options', () => {
    const hk = HeavyKeeper.fromItems(['a', 'b', 'a', 'c', 'a', 'a'])
    expect(hk.total).toBe(6)
    expect(hk.estimate('a')).toBe(4)
  })

  it('creates from items with custom options', () => {
    const hk = HeavyKeeper.fromItems(['a', 'b', 'a'], { depth: 2, width: 50 })
    expect(hk.size).toBe(100)
    expect(hk.total).toBe(3)
  })

  it('decays competing keys', () => {
    const hk = new HeavyKeeper({ depth: 2, width: 10, decay: 0.9 })
    for (let i = 0; i < 100; i++) {
      hk.update('a', 1)
    }
    for (let i = 0; i < 50; i++) {
      hk.update('b', 1)
    }
    const estimateA = hk.estimate('a')
    const estimateB = hk.estimate('b')
    expect(estimateA).toBeGreaterThan(estimateB)
  })

  it('tracks isEmpty correctly', () => {
    const hk = new HeavyKeeper()
    expect(hk.isEmpty()).toBe(true)
    hk.update('key', 1)
    expect(hk.isEmpty()).toBe(false)
  })

  it('estimate returns 0 for unseen key', () => {
    const hk = new HeavyKeeper(10, 0.9)
    expect(hk.estimate('unseen')).toBe(0)
  })

  it('estimate after update is positive', () => {
    const hk = new HeavyKeeper({ depth: 2, width: 100, decay: 0.9 })
    hk.update('item')
    expect(hk.estimate('item')).toBeGreaterThanOrEqual(1)
  })
})