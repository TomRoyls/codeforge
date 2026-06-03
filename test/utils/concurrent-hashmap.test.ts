import { describe, it, expect } from 'vitest'
import { ConcurrentHashMap } from '../../src/utils/concurrent-hashmap.js'

describe('ConcurrentHashMap', () => {
  it('creates empty map with default stripes', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.isEmpty).toBe(true)
    expect(map.size).toBe(0)
    expect(map.stripeCount_).toBe(16)
  })

  it('creates map with custom stripe count', () => {
    const map = new ConcurrentHashMap<string, number>({ stripes: 8 })
    expect(map.stripeCount_).toBe(8)
  })

  it('creates map with custom hash function', () => {
    const map = new ConcurrentHashMap<string, number>({
      hash: (key) => key.length
    })
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('sets and gets values', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
    expect(map.get('missing')).toBeUndefined()
  })

  it('checks if key exists', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.has('key')).toBe(true)
    expect(map.has('missing')).toBe(false)
  })

  it('deletes key and returns success', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.delete('key')).toBe(true)
    expect(map.has('key')).toBe(false)
    expect(map.delete('missing')).toBe(false)
  })

  it('clears all entries', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.isEmpty).toBe(true)
    expect(map.size).toBe(0)
  })

  it('gets or inserts default value', () => {
    const map = new ConcurrentHashMap<string, number>()
    const value = map.getOrDefault('key', 10)
    expect(value).toBe(10)
    expect(map.get('key')).toBe(10)
    const value2 = map.getOrDefault('key', 20)
    expect(value2).toBe(10)
  })

  it('computes value if absent', () => {
    const map = new ConcurrentHashMap<string, number>()
    const value1 = map.computeIfAbsent('key', (k) => k.length)
    expect(value1).toBe(3)
    const value2 = map.computeIfAbsent('key', () => 999)
    expect(value2).toBe(3)
  })

  it('computes value with remapper', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    const result = map.compute('key', (k, v) => (v ?? 0) * 2)
    expect(result).toBe(20)
    expect(map.get('key')).toBe(20)
  })

  it('deletes with remapper returning undefined', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    const result = map.compute('key', () => undefined)
    expect(result).toBeUndefined()
    expect(map.has('key')).toBe(false)
  })

  it('merges value with existing', () => {
    const map = new ConcurrentHashMap<number, number>()
    map.set(1, 10)
    const result = map.merge(1, 5, (existing, newValue) => existing + newValue)
    expect(result).toBe(15)
    expect(map.get(1)).toBe(15)
  })

  it('merges value when key absent', () => {
    const map = new ConcurrentHashMap<number, number>()
    const result = map.merge(1, 5, (existing, newValue) => existing + newValue)
    expect(result).toBe(5)
    expect(map.get(1)).toBe(5)
  })

  it('gets all keys', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const keys = map.keys()
    expect(keys).toHaveLength(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('gets all values', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const values = map.values()
    expect(values).toHaveLength(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('gets all entries', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('iterates with forEach', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const results: Array<[number, string]> = []
    map.forEach((value, key) => {
      results.push([value, key])
    })
    expect(results).toHaveLength(2)
    expect(results[0]![0]).toBe(1)
    expect(results[1]![0]).toBe(2)
  })

  it('converts to plain Map', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const plainMap = map.toMap()
    expect(plainMap.get('a')).toBe(1)
    expect(plainMap.get('b')).toBe(2)
  })

  it('gets stripe sizes', () => {
    const map = new ConcurrentHashMap<string, number>({ stripes: 4 })
    map.set('a', 1)
    map.set('b', 2)
    const sizes = map.stripeSizes
    expect(sizes).toHaveLength(4)
    const totalSize = sizes.reduce((a, b) => a + b, 0)
    expect(totalSize).toBe(2)
  })

  it('handles number keys', () => {
    const map = new ConcurrentHashMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('updates existing value', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    map.set('key', 20)
    expect(map.get('key')).toBe(20)
    expect(map.size).toBe(1)
  })

  it('delete removes entry', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    map.delete('key')
    expect(map.has('key')).toBe(false)
  })

  it('get returns undefined for missing key', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
  })
})