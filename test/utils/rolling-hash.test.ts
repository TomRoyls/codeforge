import { describe, it, expect } from 'vitest'
import { RollingHash } from '../../src/utils/rolling-hash.js'

describe('RollingHash', () => {
  it('computes hash of window', () => {
    const rh = new RollingHash(3)
    rh.push(1)
    rh.push(2)
    const h = rh.push(3)
    expect(typeof h).toBe('number')
    expect(Number.isFinite(h)).toBe(true)
  })

  it('reports full after window fills', () => {
    const rh = new RollingHash(3)
    expect(rh.isFull).toBe(false)
    rh.push(1)
    rh.push(2)
    expect(rh.isFull).toBe(false)
    rh.push(3)
    expect(rh.isFull).toBe(true)
  })

  it('rolling update changes hash', () => {
    const rh = new RollingHash(3)
    rh.push(1)
    rh.push(2)
    const h1 = rh.push(3)
    const h2 = rh.push(4)
    expect(h1).not.toBe(h2)
  })

  it('same window produces same hash', () => {
    const rh1 = new RollingHash(3)
    rh1.push(1)
    rh1.push(2)
    const h1 = rh1.push(3)

    const rh2 = new RollingHash(3)
    rh2.push(1)
    rh2.push(2)
    const h2 = rh2.push(3)
    expect(h1).toBe(h2)
  })

  it('reset clears state', () => {
    const rh = new RollingHash(3)
    rh.push(1)
    rh.push(2)
    rh.push(3)
    expect(rh.isFull).toBe(true)
    rh.reset()
    expect(rh.isFull).toBe(false)
    expect(rh.currentHash).toBe(0)
  })

  it('reports correct windowSize', () => {
    const rh = new RollingHash(5)
    expect(rh.windowSize).toBe(5)
  })

  it('handles large window', () => {
    const rh = new RollingHash(100)
    for (let i = 0; i < 100; i++) {
      rh.push(i)
    }
    expect(rh.isFull).toBe(true)
    expect(Number.isFinite(rh.currentHash)).toBe(true)
  })

  it('rolling wraps around correctly', () => {
    const rh = new RollingHash(2)
    const h1 = rh.push(10)
    const h2 = rh.push(20)
    const h3 = rh.push(30)

    const rh2 = new RollingHash(2)
    rh2.push(20)
    const hExpected = rh2.push(30)
    expect(h3).toBe(hExpected)
  })

  it('same bytes after reset produce same hash', () => {
    const rh = new RollingHash(3)
    rh.push(1)
    rh.push(2)
    const h1 = rh.push(3)
    rh.reset()
    rh.push(1)
    rh.push(2)
    const h2 = rh.push(3)
    expect(h1).toBe(h2)
  })
})

describe('RollingHash static methods', () => {
  it('hashString produces consistent results', () => {
    const h1 = RollingHash.hashString('hello')
    const h2 = RollingHash.hashString('hello')
    expect(h1).toBe(h2)
  })

  it('hashString different strings differ', () => {
    const h1 = RollingHash.hashString('hello')
    const h2 = RollingHash.hashString('world')
    expect(h1).not.toBe(h2)
  })

  it('hashBytes produces consistent results', () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    const h1 = RollingHash.hashBytes(bytes)
    const h2 = RollingHash.hashBytes(bytes)
    expect(h1).toBe(h2)
  })

  it('hashBytes empty array returns 0', () => {
    expect(RollingHash.hashBytes(new Uint8Array(0))).toBe(0)
  })

  it('hashString empty string returns 0', () => {
    expect(RollingHash.hashString('')).toBe(0)
  })

  it('handles single element window', () => {
    const rh = new RollingHash(1)
    const h1 = rh.push(42)
    expect(rh.isFull).toBe(true)
    const h2 = rh.push(99)
    expect(h1).not.toBe(h2)
  })

  it('currentHash is accessible before and after full', () => {
    const rh = new RollingHash(3)
    rh.push(1)
    expect(typeof rh.currentHash).toBe('number')
    rh.push(2)
    rh.push(3)
    expect(typeof rh.currentHash).toBe('number')
    expect(Number.isFinite(rh.currentHash)).toBe(true)
  })

  it('handles zero values in window', () => {
    const rh = new RollingHash(3)
    rh.push(0)
    rh.push(0)
    const h = rh.push(0)
    expect(Number.isFinite(h)).toBe(true)
  })

  it('different inputs produce different hashes', () => {
    const rh1 = new RollingHash(7)
    const rh2 = new RollingHash(7)
    rh1.push(1)
    rh2.push(2)
    expect(rh1.push(0)).not.toBe(rh2.push(0))
  })

  it('same sequence same hash', () => {
    const rh1 = new RollingHash(100)
    const rh2 = new RollingHash(100)
    rh1.push(1)
    const h1 = rh1.push(2)
    rh2.push(1)
    const h2 = rh2.push(2)
    expect(h1).toBe(h2)
  })
})
