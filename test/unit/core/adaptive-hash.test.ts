import { describe, expect, it } from 'vitest'

import { AdaptiveHash } from '../../../src/core/adaptive-hash/adaptive-hash.js'

describe('AdaptiveHash', () => {
  it('sets and gets a value', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('key', 42)
    expect(hash.get('key')).toBe(42)
  })

  it('returns undefined for missing key', () => {
    const hash = new AdaptiveHash<string, number>()
    expect(hash.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('key', 1)
    hash.set('key', 2)
    expect(hash.get('key')).toBe(2)
  })

  it('has returns true for existing key', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('key', 1)
    expect(hash.has('key')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const hash = new AdaptiveHash<string, number>()
    expect(hash.has('key')).toBe(false)
  })

  it('deletes a key', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('key', 1)
    expect(hash.delete('key')).toBe(true)
    expect(hash.get('key')).toBeUndefined()
  })

  it('delete returns false for missing key', () => {
    const hash = new AdaptiveHash<string, number>()
    expect(hash.delete('missing')).toBe(false)
  })

  it('tracks size correctly', () => {
    const hash = new AdaptiveHash<string, number>()
    expect(hash.size).toBe(0)
    hash.set('a', 1)
    hash.set('b', 2)
    expect(hash.size).toBe(2)
    hash.delete('a')
    expect(hash.size).toBe(1)
  })

  it('isEmpty returns correct state', () => {
    const hash = new AdaptiveHash<string, number>()
    expect(hash.isEmpty).toBe(true)
    hash.set('a', 1)
    expect(hash.isEmpty).toBe(false)
  })

  it('clear removes all entries', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('a', 1)
    hash.set('b', 2)
    hash.clear()
    expect(hash.size).toBe(0)
    expect(hash.isEmpty).toBe(true)
  })

  it('keys returns all keys', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('a', 1)
    hash.set('b', 2)
    hash.set('c', 3)
    const keys = hash.keys()
    expect(keys).toHaveLength(3)
    expect(keys.sort()).toEqual(['a', 'b', 'c'])
  })

  it('values returns all values', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('a', 1)
    hash.set('b', 2)
    const vals = hash.values()
    expect(vals).toHaveLength(2)
  })

  it('entries returns all key-value pairs', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('a', 1)
    hash.set('b', 2)
    const entries = hash.entries()
    expect(entries).toHaveLength(2)
  })

  it('forEach iterates all entries', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('a', 1)
    hash.set('b', 2)
    const collected: Array<[string, number]> = []
    hash.forEach((v, k) => collected.push([k, v]))
    expect(collected).toHaveLength(2)
  })

  it('works with number keys', () => {
    const hash = new AdaptiveHash<number, string>()
    hash.set(1, 'one')
    hash.set(2, 'two')
    expect(hash.get(1)).toBe('one')
    expect(hash.get(2)).toBe('two')
  })

  it('works with many entries', () => {
    const hash = new AdaptiveHash<number, number>()
    for (let i = 0; i < 300; i++) {
      hash.set(i, i * 10)
    }
    expect(hash.size).toBe(300)
    for (let i = 0; i < 300; i++) {
      expect(hash.get(i)).toBe(i * 10)
    }
  })

  it('strategy starts as array', () => {
    const hash = new AdaptiveHash<string, number>()
    expect(hash.getCurrentStrategy()).toBe('array')
  })

  it('upgrades strategy with many entries', () => {
    const hash = new AdaptiveHash<number, number>()
    for (let i = 0; i < 300; i++) {
      hash.set(i, i)
    }
    const strategy = hash.getCurrentStrategy()
    expect(['probing', 'chained']).toContain(strategy)
  })

  it('maintains correctness after strategy upgrade', () => {
    const hash = new AdaptiveHash<number, number>()
    for (let i = 0; i < 200; i++) {
      hash.set(i, i * 5)
    }
    for (let i = 0; i < 200; i++) {
      expect(hash.get(i)).toBe(i * 5)
    }
  })

  it('handles deletion across strategies', () => {
    const hash = new AdaptiveHash<number, number>()
    for (let i = 0; i < 200; i++) {
      hash.set(i, i)
    }
    for (let i = 0; i < 100; i++) {
      expect(hash.delete(i)).toBe(true)
    }
    expect(hash.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(hash.has(i)).toBe(false)
    }
    for (let i = 100; i < 200; i++) {
      expect(hash.has(i)).toBe(true)
    }
  })

  it('getStatistics returns stats object', () => {
    const hash = new AdaptiveHash<string, number>()
    hash.set('a', 1)
    hash.get('a')
    hash.delete('a')
    const stats = hash.getStatistics()
    expect(stats.inserts).toBeGreaterThan(0)
    expect(stats.lookups).toBeGreaterThan(0)
    expect(stats.deletes).toBeGreaterThan(0)
    expect(stats.currentStrategy).toBeTruthy()
  })
})
