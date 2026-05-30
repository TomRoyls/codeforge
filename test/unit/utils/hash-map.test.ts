import { describe, expect, it } from 'vitest'
import { HashMap } from '../../../src/utils/hash-map.js'

describe('HashMap', () => {
  it('creates map with default capacity', () => {
    const map = new HashMap<string, number>()
    expect(map.capacity).toBe(16)
  })

  it('creates map with custom capacity', () => {
    const map = new HashMap<string, number>(32)
    expect(map.capacity).toBe(32)
  })

  it('creates map with options object', () => {
    const map = new HashMap<string, number>({ initialCapacity: 8, loadFactor: 0.5 })
    expect(map.capacity).toBe(8)
  })

  it('sets and gets value', () => {
    const map = new HashMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
  })

  it('returns undefined for non-existent key', () => {
    const map = new HashMap<string, number>()
    expect(map.get('nonexistent')).toBe(undefined)
  })

  it('overwrites existing key', () => {
    const map = new HashMap<string, number>()
    map.set('key', 42)
    map.set('key', 100)
    expect(map.get('key')).toBe(100)
    expect(map.size).toBe(1)
  })

  it('has returns true for existing key', () => {
    const map = new HashMap<string, number>()
    map.set('key', 42)
    expect(map.has('key')).toBe(true)
  })

  it('has returns false for non-existent key', () => {
    const map = new HashMap<string, number>()
    expect(map.has('key')).toBe(false)
  })

  it('deletes existing key', () => {
    const map = new HashMap<string, number>()
    map.set('key', 42)
    expect(map.delete('key')).toBe(true)
    expect(map.has('key')).toBe(false)
    expect(map.get('key')).toBe(undefined)
  })

  it('delete returns false for non-existent key', () => {
    const map = new HashMap<string, number>()
    expect(map.delete('nonexistent')).toBe(false)
  })

  it('size returns zero for empty map', () => {
    const map = new HashMap<string, number>()
    expect(map.size).toBe(0)
  })

  it('size tracks number of entries', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    map.set('key3', 3)
    expect(map.size).toBe(3)
  })

  it('isEmpty returns true for empty map', () => {
    const map = new HashMap<string, number>()
    expect(map.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty map', () => {
    const map = new HashMap<string, number>()
    map.set('key', 42)
    expect(map.isEmpty()).toBe(false)
  })

  it('clear removes all entries', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('keys returns all keys', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    map.set('key3', 3)
    const keys = map.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain('key1')
    expect(keys).toContain('key2')
    expect(keys).toContain('key3')
  })

  it('keys returns empty array for empty map', () => {
    const map = new HashMap<string, number>()
    expect(map.keys()).toEqual([])
  })

  it('values returns all values', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    map.set('key3', 3)
    const values = map.values()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('values returns empty array for empty map', () => {
    const map = new HashMap<string, number>()
    expect(map.values()).toEqual([])
  })

  it('entries returns all key-value pairs', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    const entries = map.entries()
    expect(entries.length).toBe(2)
    expect(entries.some(([k, v]) => k === 'key1' && v === 1)).toBe(true)
    expect(entries.some(([k, v]) => k === 'key2' && v === 2)).toBe(true)
  })

  it('entries returns empty array for empty map', () => {
    const map = new HashMap<string, number>()
    expect(map.entries()).toEqual([])
  })

  it('forEach iterates over all entries', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    map.set('key3', 3)

    const results: [number, string][] = []
    map.forEach((value, key) => {
      results.push([value, key])
    })
    expect(results.length).toBe(3)
    expect(results.some(([v, k]) => v === 1 && k === 'key1')).toBe(true)
  })

  it('loadFactor calculates correctly', () => {
    const map = new HashMap<string, number>({ initialCapacity: 10 })
    map.set('key1', 1)
    map.set('key2', 2)
    expect(map.loadFactor).toBe(0.2)
  })

  it('loadFactor is zero for empty map', () => {
    const map = new HashMap<string, number>()
    expect(map.loadFactor).toBe(0)
  })

  it('handles hash collisions correctly', () => {
    const map = new HashMap<number, string>({
      hashFn: (key) => key % 5
    })
    map.set(1, 'one')
    map.set(6, 'six')
    map.set(11, 'eleven')
    expect(map.get(1)).toBe('one')
    expect(map.get(6)).toBe('six')
    expect(map.get(11)).toBe('eleven')
  })

  it('handles delete then reuse of slot', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.delete('key1')
    map.set('key1', 100)
    expect(map.get('key1')).toBe(100)
  })

  it('resizes when load factor exceeded', () => {
    const map = new HashMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
    map.set('key1', 1)
    map.set('key2', 2)
    map.set('key3', 3)
    expect(map.capacity).toBeGreaterThan(4)
  })

  it('preserves entries after resize', () => {
    const map = new HashMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
    map.set('key1', 1)
    map.set('key2', 2)
    map.set('key3', 3)
    expect(map.get('key1')).toBe(1)
    expect(map.get('key2')).toBe(2)
    expect(map.get('key3')).toBe(3)
  })

  it('handles number keys', () => {
    const map = new HashMap<number, string>()
    map.set(1, 'one')
    map.set(42, 'forty-two')
    expect(map.get(1)).toBe('one')
    expect(map.get(42)).toBe('forty-two')
  })

  it('handles NaN as key', () => {
    const map = new HashMap<number, string>()
    map.set(NaN, 'not-a-number')
    expect(map.has(NaN)).toBe(true)
    expect(map.get(NaN)).toBe('not-a-number')
  })

  it('handles custom key equality', () => {
    const map = new HashMap<{ id: number }, string>({
      keyEqual: (a, b) => a.id === b.id
    })
    map.set({ id: 1 }, 'first')
    expect(map.get({ id: 1 })).toBe('first')
  })

  it('handles many entries', () => {
    const map = new HashMap<number, number>()
    for (let i = 0; i < 100; i++) {
      map.set(i, i * 2)
    }
    expect(map.size).toBe(100)
    expect(map.get(50)).toBe(100)
  })

  it('handles single entry', () => {
    const map = new HashMap<string, number>()
    map.set('only', 1)
    expect(map.size).toBe(1)
    expect(map.get('only')).toBe(1)
    expect(map.keys()).toEqual(['only'])
    expect(map.values()).toEqual([1])
  })

  it('forEach does not affect map state', () => {
    const map = new HashMap<string, number>()
    map.set('key1', 1)
    map.set('key2', 2)
    const originalSize = map.size
    map.forEach(() => {})
    expect(map.size).toBe(originalSize)
  })
})