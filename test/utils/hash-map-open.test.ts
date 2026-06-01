import { describe, expect, it } from 'vitest'
import { HashMapOpen } from '../../src/utils/hash-map-open.js'

describe('HashMapOpen', () => {
  it('set and get a value', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(false)
  })

  it('delete removes a key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.delete('a')).toBe(true)
    expect(map.get('a')).toBeUndefined()
    expect(map.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.delete('missing')).toBe(false)
  })

  it('size tracks entries', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.size).toBe(0)
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('update existing key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('keys returns all keys', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const keys = map.keys()
    expect(keys).toHaveLength(2)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('values returns all values', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.values()).toHaveLength(2)
  })

  it('entries returns key-value pairs', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries).toHaveLength(2)
  })

  it('clear removes all entries', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.get('a')).toBeUndefined()
  })

  it('handles many insertions with resize', () => {
    const map = new HashMapOpen<number, number>(4)
    for (let i = 0; i < 100; i++) {
      map.set(i, i * 10)
    }
    expect(map.size).toBe(100)
    expect(map.get(50)).toBe(500)
  })

  it('handles tombstone reuse after delete', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.delete('a')
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('works with number keys', () => {
    const map = new HashMapOpen<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('handles empty operations', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.keys()).toEqual([])
    expect(map.values()).toEqual([])
    expect(map.entries()).toEqual([])
  })

  it('handles has after delete', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.delete('a')
    expect(map.has('a')).toBe(false)
  })
})
