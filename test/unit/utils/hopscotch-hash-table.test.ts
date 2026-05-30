import { describe, expect, it } from 'vitest'
import { HopscotchHashTable } from '../../../src/utils/hopscotch-hash-table.js'

describe('HopscotchHashTable', () => {
  it('starts empty', () => {
    const ht = new HopscotchHashTable<string, number>()
    expect(ht.size).toBe(0)
    expect(ht.isEmpty()).toBe(true)
  })

  it('sets and gets a value', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const ht = new HopscotchHashTable<string, number>()
    expect(ht.get('missing')).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.has('a')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const ht = new HopscotchHashTable<string, number>()
    expect(ht.has('a')).toBe(false)
  })

  it('overwrites existing key', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('tracks size correctly', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.size).toBe(3)
  })

  it('deletes a key', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.get('a')).toBeUndefined()
    expect(ht.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const ht = new HopscotchHashTable<string, number>()
    expect(ht.delete('missing')).toBe(false)
  })

  it('clears all entries', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.clear()
    expect(ht.size).toBe(0)
    expect(ht.isEmpty()).toBe(true)
  })

  it('returns all keys', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.keys().sort()).toEqual(['a', 'b', 'c'])
  })

  it('returns all values', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.values().sort()).toEqual([1, 2])
  })

  it('returns all entries', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    const entries = ht.entries().sort((a, b) => a[0].localeCompare(b[0]))
    expect(entries).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })

  it('forEach iterates all entries', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    const result: Record<string, number> = {}
    ht.forEach((v, k) => {
      result[k] = v
    })
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('computes load factor', () => {
    const ht = new HopscotchHashTable<string, number>({ capacity: 16 })
    ht.set('a', 1)
    expect(ht.loadFactor()).toBeGreaterThan(0)
    expect(ht.loadFactor()).toBeLessThanOrEqual(1)
  })

  it('handles numeric keys', () => {
    const ht = new HopscotchHashTable<number, string>()
    ht.set(1, 'one')
    ht.set(2, 'two')
    expect(ht.get(1)).toBe('one')
    expect(ht.get(2)).toBe('two')
  })

  it('respects custom capacity', () => {
    const ht = new HopscotchHashTable<string, number>({ capacity: 32 })
    expect(ht.capacity).toBe(32)
  })

  it('resizes when load factor exceeded', () => {
    const ht = new HopscotchHashTable<string, number>({ capacity: 4 })
    const initialCapacity = ht.capacity
    for (let i = 0; i < 10; i++) {
      ht.set(`key${i}`, i)
    }
    expect(ht.capacity).toBeGreaterThanOrEqual(initialCapacity)
    expect(ht.size).toBe(10)
    for (let i = 0; i < 10; i++) {
      expect(ht.get(`key${i}`)).toBe(i)
    }
  })

  it('fromEntries creates table from pairs', () => {
    const ht = HopscotchHashTable.fromEntries([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
    expect(ht.size).toBe(3)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
    expect(ht.get('c')).toBe(3)
  })

  it('handles many operations without corruption', () => {
    const ht = new HopscotchHashTable<number, number>({ capacity: 8 })
    for (let i = 0; i < 50; i++) {
      ht.set(i, i * 10)
    }
    for (let i = 0; i < 50; i++) {
      expect(ht.get(i)).toBe(i * 10)
    }
    expect(ht.size).toBe(50)
  })

  it('delete and re-insert is handled via clear+set', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.delete('a')
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('isEmpty after all deletes', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    ht.delete('b')
    expect(ht.isEmpty()).toBe(true)
  })

  it('handles delete and re-insert', () => {
    const ht = new HopscotchHashTable<string, number>()
    ht.set('a', 1)
    ht.delete('a')
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('handles object keys by stringification', () => {
    const ht = new HopscotchHashTable<object, number>()
    const key = { x: 1 }
    ht.set(key, 42)
    expect(ht.get(key)).toBe(42)
  })

  it('capacity getter returns current capacity', () => {
    const ht = new HopscotchHashTable<string, number>({ capacity: 16 })
    expect(ht.capacity).toBe(16)
  })
})
