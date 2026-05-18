import { describe, it, expect } from 'vitest'
import { ScapegoatMap } from '../src/core/scapegoat-map/index.js'

// ─── Constructor and Basic Ops ───
describe('ScapegoatMap basic operations', () => {
  it('creates empty map', () => {
    const m = new ScapegoatMap<number, string>()
    expect(m.size()).toBe(0)
    expect(m.isEmpty()).toBe(true)
  })

  it('sets and gets values', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'one')
    m.set(2, 'two')
    expect(m.get(1)).toBe('one')
    expect(m.get(2)).toBe('two')
    expect(m.get(3)).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'one')
    m.set(1, 'uno')
    expect(m.get(1)).toBe('uno')
    expect(m.size()).toBe(1)
  })

  it('has checks existence', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'one')
    expect(m.has(1)).toBe(true)
    expect(m.has(2)).toBe(false)
  })
})

// ─── Delete ───
describe('ScapegoatMap delete', () => {
  it('deletes existing key', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'one')
    expect(m.delete(1)).toBe(true)
    expect(m.has(1)).toBe(false)
    expect(m.size()).toBe(0)
  })

  it('returns false for missing key', () => {
    const m = new ScapegoatMap<number, string>()
    expect(m.delete(1)).toBe(false)
  })
})

// ─── Min / Max ───
describe('ScapegoatMap min and max', () => {
  it('returns undefined for empty map', () => {
    const m = new ScapegoatMap<number, string>()
    expect(m.min()).toBeUndefined()
    expect(m.max()).toBeUndefined()
  })

  it('returns min and max keys', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(5, 'a')
    m.set(2, 'b')
    m.set(8, 'c')
    expect(m.min()).toBe(2)
    expect(m.max()).toBe(8)
  })
})

// ─── Iteration ───
describe('ScapegoatMap iteration', () => {
  it('keys returns sorted keys', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.keys()).toEqual([1, 2, 3])
  })

  it('values returns sorted values', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.values()).toEqual(['a', 'b', 'c'])
  })

  it('toArray returns sorted entries', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(2, 'b')
    m.set(1, 'a')
    expect(m.toArray()).toEqual([[1, 'a'], [2, 'b']])
  })

  it('forEach iterates in order', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(2, 'b')
    m.set(1, 'a')
    const entries: [number, string][] = []
    m.forEach((v, k) => entries.push([k, v]))
    expect(entries).toEqual([[1, 'a'], [2, 'b']])
  })

  it('Symbol.iterator works', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    expect([...m]).toEqual([[1, 'a'], [2, 'b']])
  })
})

// ─── Clone / Clear / Height ───
describe('ScapegoatMap clone, clear, height', () => {
  it('clear empties the map', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'a')
    m.clear()
    expect(m.isEmpty()).toBe(true)
  })

  it('clone produces independent copy', () => {
    const m = new ScapegoatMap<number, string>()
    m.set(1, 'a')
    const c = m.clone()
    c.set(2, 'b')
    expect(m.has(2)).toBe(false)
    expect(c.has(2)).toBe(true)
  })

  it('height returns tree height', () => {
    const m = new ScapegoatMap<number, string>()
    expect(m.height()).toBe(0)
    m.set(1, 'a')
    expect(m.height()).toBe(1)
  })

  it('alpha is accessible', () => {
    const m = new ScapegoatMap<number, string>()
    expect(m.alpha).toBeGreaterThan(0)
    expect(m.alpha).toBeLessThan(1)
  })
})

// ─── Stress Test ───
describe('ScapegoatMap stress', () => {
  it('handles many insertions', () => {
    const m = new ScapegoatMap<number, number>()
    for (let i = 0; i < 100; i++) {
      m.set(i, i * 10)
    }
    expect(m.size()).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(m.get(i)).toBe(i * 10)
    }
  })
})
