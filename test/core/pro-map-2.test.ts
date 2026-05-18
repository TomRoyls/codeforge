import { describe, it, expect } from 'vitest'
import { ProMap2 } from '../../src/core/pro-map-2/index.js'

// ─── Constructor ───

describe('ProMap2 constructor', () => {
  it('creates empty map with no options', () => {
    const map = new ProMap2<string, number>()
    expect(map.size).toBe(0)
  })

  it('creates map with maxSize option', () => {
    const map = new ProMap2<string, number>({ maxSize: 3 })
    expect(map.size).toBe(0)
  })

  it('creates map with ttl option', () => {
    const map = new ProMap2<string, number>({ ttl: 1000 })
    expect(map.size).toBe(0)
  })

  it('creates map with both options', () => {
    const map = new ProMap2<string, number>({ maxSize: 5, ttl: 5000 })
    expect(map.size).toBe(0)
  })
})

// ─── set / get ───

describe('ProMap2 set and get', () => {
  it('sets and gets a value', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new ProMap2<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('set returns this for chaining', () => {
    const map = new ProMap2<string, number>()
    const result = map.set('a', 1)
    expect(result).toBe(map)
  })

  it('handles multiple key types', () => {
    const map = new ProMap2<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })
})

// ─── has ───

describe('ProMap2 has', () => {
  it('returns false for missing key', () => {
    const map = new ProMap2<string, number>()
    expect(map.has('a')).toBe(false)
  })

  it('returns true for existing key', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
  })

  it('returns false after delete', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.delete('a')
    expect(map.has('a')).toBe(false)
  })
})

// ─── delete ───

describe('ProMap2 delete', () => {
  it('deletes existing key and returns true', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    expect(map.delete('a')).toBe(true)
    expect(map.size).toBe(0)
  })

  it('returns false for missing key', () => {
    const map = new ProMap2<string, number>()
    expect(map.delete('missing')).toBe(false)
  })

  it('deletes correct key among multiple', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(false)
    expect(map.has('c')).toBe(true)
    expect(map.size).toBe(2)
  })
})

// ─── clear ───

describe('ProMap2 clear', () => {
  it('clears all entries', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.get('a')).toBeUndefined()
  })

  it('clear already empty map', () => {
    const map = new ProMap2<string, number>()
    map.clear()
    expect(map.size).toBe(0)
  })
})

// ─── size ───

describe('ProMap2 size', () => {
  it('tracks size correctly', () => {
    const map = new ProMap2<string, number>()
    expect(map.size).toBe(0)
    map.set('a', 1)
    expect(map.size).toBe(1)
    map.set('b', 2)
    expect(map.size).toBe(2)
    map.delete('a')
    expect(map.size).toBe(1)
  })
})

// ─── maxSize eviction ───

describe('ProMap2 maxSize eviction', () => {
  it('evicts LRU when maxSize exceeded', () => {
    const map = new ProMap2<string, number>({ maxSize: 2 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.size).toBe(2)
    expect(map.get('a')).toBeUndefined()
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('updates access time on get', () => {
    const map = new ProMap2<string, number>({ maxSize: 2 })
    map.set('a', 1)
    map.set('b', 2)
    map.get('a')
    map.set('c', 3)
    expect(map.size).toBe(2)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBeUndefined()
    expect(map.get('c')).toBe(3)
  })

  it('overwriting key does not increase size beyond max', () => {
    const map = new ProMap2<string, number>({ maxSize: 2 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('a', 10)
    expect(map.size).toBe(2)
    expect(map.get('a')).toBe(10)
  })

  it('maxSize of 1 keeps only latest', () => {
    const map = new ProMap2<string, number>({ maxSize: 1 })
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(1)
    expect(map.get('a')).toBeUndefined()
    expect(map.get('b')).toBe(2)
  })
})

// ─── TTL expiration ───

describe('ProMap2 TTL expiration', () => {
  it('entries expire after TTL', async () => {
    const map = new ProMap2<string, number>({ ttl: 50 })
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(map.get('a')).toBeUndefined()
  })

  it('has returns false after expiration', async () => {
    const map = new ProMap2<string, number>({ ttl: 50 })
    map.set('a', 1)
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(map.has('a')).toBe(false)
  })

  it('non-expiring entries persist', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })
})

// ─── keys ───

describe('ProMap2 keys', () => {
  it('returns empty array for empty map', () => {
    const map = new ProMap2<string, number>()
    expect(map.keys()).toEqual([])
  })

  it('returns all valid keys', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const keys = map.keys()
    expect(keys).toHaveLength(2)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })
})

// ─── values ───

describe('ProMap2 values', () => {
  it('returns empty array for empty map', () => {
    const map = new ProMap2<string, number>()
    expect(map.values()).toEqual([])
  })

  it('returns all values', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const values = map.values()
    expect(values).toHaveLength(2)
    expect(values).toContain(1)
    expect(values).toContain(2)
  })
})

// ─── entries ───

describe('ProMap2 entries', () => {
  it('returns empty array for empty map', () => {
    const map = new ProMap2<string, number>()
    expect(map.entries()).toEqual([])
  })

  it('returns all key-value pairs', () => {
    const map = new ProMap2<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries).toHaveLength(2)
    expect(entries.some((e) => e[0] === 'a' && e[1] === 1)).toBe(true)
    expect(entries.some((e) => e[0] === 'b' && e[1] === 2)).toBe(true)
  })
})
