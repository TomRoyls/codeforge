import { describe, it, expect } from 'vitest'
import { WindowTinyLFU } from '../../src/utils/window-tiny-lfu.js'

describe('WindowTinyLFU', () => {
  it('throws on capacity < 1', () => {
    expect(() => new WindowTinyLFU(0)).toThrow(RangeError)
  })

  it('records accesses', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('a')
    w.recordAccess('a')
    expect(w.estimate('a')).toBeGreaterThanOrEqual(3)
  })

  it('admits more frequent over less frequent', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 10; i++) w.recordAccess('popular')
    w.recordAccess('rare')
    expect(w.shouldAdmit('popular', 'rare')).toBe(true)
  })

  it('rejects less frequent candidate', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 10; i++) w.recordAccess('victim')
    w.recordAccess('candidate')
    expect(w.shouldAdmit('candidate', 'victim')).toBe(false)
  })

  it('exposes capacity', () => {
    const w = new WindowTinyLFU(50)
    expect(w.capacity).toBe(50)
  })

  it('exposes windowSize', () => {
    const w = new WindowTinyLFU(100)
    expect(w.windowSize).toBeGreaterThanOrEqual(1)
  })

  it('tracks totalAccessesCount', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('b')
    expect(w.totalAccessesCount).toBe(2)
  })

  it('works with number keys', () => {
    const w = new WindowTinyLFU<number>(100)
    w.recordAccess(42)
    w.recordAccess(42)
    expect(w.estimate(42)).toBeGreaterThanOrEqual(2)
  })

  it('handles many unique keys', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 500; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.totalAccessesCount).toBe(500)
  })

  it('window eviction keeps working', () => {
    const w = new WindowTinyLFU(100, 0.02)
    for (let i = 0; i < 20; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.windowSize).toBeLessThanOrEqual(20)
  })

  it('estimate returns 0 for unseen key', () => {
    const w = new WindowTinyLFU(100)
    expect(w.estimate('unknown')).toBe(0)
  })

  it('shouldAdmit with equal frequencies', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('b')
    const result = w.shouldAdmit('a', 'b')
    expect(typeof result).toBe('boolean')
  })

  it('handles single capacity', () => {
    const w = new WindowTinyLFU(1)
    w.recordAccess('x')
    expect(w.estimate('x')).toBeGreaterThanOrEqual(1)
  })

  it('many accesses to same key', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 50; i++) w.recordAccess('hot')
    expect(w.estimate('hot')).toBeGreaterThanOrEqual(10)
  })

  it('totalAccessesCount tracks accesses', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('b')
    w.recordAccess('c')
    expect(w.totalAccessesCount).toBe(3)
  })

  it('unseen key has estimate zero', () => {
    const w = new WindowTinyLFU(100)
    expect(w.estimate('unknown')).toBe(0)
  })

  it('recordAccess increases estimate', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('item')
    w.recordAccess('item')
    expect(w.estimate('item')).toBeGreaterThan(0)
  })

  it('unseen item has zero estimate', () => {
    const w = new WindowTinyLFU(10)
    expect(w.estimate('ghost')).toBe(0)
  })

  it('recordAccess increases estimate', () => {
    const w = new WindowTinyLFU(10)
    w.recordAccess('key')
    expect(w.estimate('key')).toBeGreaterThan(0)
  })
})
