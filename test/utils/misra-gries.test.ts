import { describe, it, expect } from 'vitest'
import { MisraGries } from '../../src/utils/misra-gries.js'

describe('MisraGries', () => {
  it('tracks single heavy item', () => {
    const mg = new MisraGries<string>(3)
    for (let i = 0; i < 100; i++) {
      mg.process('heavy')
    }
    expect(mg.getCount('heavy')).toBeGreaterThan(0)
    expect(mg.top()[0]!.item).toBe('heavy')
  })

  it('tracks multiple heavy items', () => {
    const mg = new MisraGries<string>(3)
    const items = ['a', 'a', 'a', 'b', 'b', 'c']
    for (const item of items) {
      mg.process(item)
    }
    expect(mg.has('a')).toBe(true)
    expect(mg.getCount('a')).toBeGreaterThan(mg.getCount('c')!)
  })

  it('processBatch works', () => {
    const mg = new MisraGries<number>(2)
    mg.processBatch([1, 1, 1, 2, 2, 3])
    expect(mg.has(1)).toBe(true)
    expect(mg.has(2)).toBe(true)
  })

  it('resets state', () => {
    const mg = new MisraGries<string>(3)
    mg.process('a')
    mg.process('b')
    mg.reset()
    expect(mg.size).toBe(0)
    expect(mg.getCount('a')).toBe(0)
  })

  it('top returns sorted by count', () => {
    const mg = new MisraGries<string>(5)
    mg.processBatch(['a', 'b', 'a', 'c', 'a', 'b'])
    const top = mg.top()
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1]!.count).toBeGreaterThanOrEqual(top[i]!.count)
    }
  })

  it('handles k=1', () => {
    const mg = new MisraGries<string>(1)
    mg.processBatch(['a', 'a', 'a', 'b', 'a'])
    expect(mg.size).toBeLessThanOrEqual(1)
  })

  it('throws for invalid k', () => {
    expect(() => new MisraGries<string>(0)).toThrow()
    expect(() => new MisraGries<string>(-1)).toThrow()
  })

  it('returns correct size', () => {
    const mg = new MisraGries<string>(5)
    expect(mg.size).toBe(0)
    mg.process('x')
    expect(mg.size).toBeGreaterThanOrEqual(1)
  })

  it('getCount returns 0 for unseen item', () => {
    const mg = new MisraGries<string>(3)
    expect(mg.getCount('unseen')).toBe(0)
  })

  it('handles numeric items', () => {
    const mg = new MisraGries<number>(3)
    mg.processBatch([1, 2, 1, 3, 1])
    expect(mg.getCount(1)).toBeGreaterThan(0)
  })

  it('heavy item survives eviction', () => {
    const mg = new MisraGries<string>(2)
    for (let i = 0; i < 200; i++) {
      mg.process('dominant')
      if (i % 10 === 0) mg.process(`rare-${i}`)
    }
    expect(mg.has('dominant')).toBe(true)
    expect(mg.getCount('dominant')).toBeGreaterThan(50)
  })

  it('reset then process works', () => {
    const mg = new MisraGries<string>(3)
    mg.processBatch(['a', 'a', 'a'])
    mg.reset()
    mg.processBatch(['b', 'b', 'c'])
    expect(mg.getCount('b')).toBeGreaterThan(0)
    expect(mg.getCount('a')).toBe(0)
  })

  it('all same items tracked', () => {
    const mg = new MisraGries<string>(5)
    mg.processBatch(['x', 'x', 'x', 'x', 'x'])
    expect(mg.getCount('x')).toBe(5)
    expect(mg.size).toBe(1)
  })

  it('handles empty batch', () => {
    const mg = new MisraGries<string>(3)
    mg.processBatch([])
    expect(mg.size).toBe(0)
  })

  it('top returns sorted entries', () => {
    const mg = new MisraGries<string>(5)
    mg.processBatch(['a', 'a', 'b', 'b', 'b', 'c', 'd'])
    const top = mg.top()
    expect(top.length).toBeGreaterThan(0)
    expect(top[0]!.item).toBe('b')
  })

  it('getCount for items evicted may be 0', () => {
    const mg = new MisraGries<string>(2)
    mg.processBatch(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(mg.size).toBeLessThanOrEqual(2)
  })

  it('getCount for unseen item is 0', () => {
    const mg = new MisraGries<string>(5)
    mg.processBatch(['a'])
    expect(mg.getCount('z')).toBe(0)
  })

  it('process single items via process', () => {
    const mg = new MisraGries<string>(3)
    mg.process('a')
    mg.process('a')
    mg.process('b')
    expect(mg.getCount('a')).toBe(2)
    expect(mg.getCount('b')).toBe(1)
  })

  it('empty stream has zero counts', () => {
    const mg = new MisraGries<string>(3)
    expect(mg.getCount('any')).toBe(0)
  })

  it('tracks frequent items', () => {
    const mg = new MisraGries<string>(2)
    mg.process('a')
    mg.process('a')
    mg.process('b')
    expect(mg.getCount('a')).toBeGreaterThanOrEqual(2)
  })

  it('getCount for unseen item is 0', () => {
    const mg = new MisraGries<string>(3)
    expect(mg.getCount('z')).toBe(0)
  })

  it('process increases count for item', () => {
    const mg = new MisraGries<string>(3)
    mg.process('a')
    mg.process('a')
    expect(mg.getCount('a')).toBeGreaterThanOrEqual(1)
  })

  it('returns 0 for unseen element', () => {
    const mg = new MisraGries(2)
    mg.process('a')
    expect(mg.getCount('z')).toBe(0)
  })
})
