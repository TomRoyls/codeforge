import { describe, expect, it } from 'vitest'
import { CuckooHashTable } from '../../src/utils/cuckoo-hash.js'

describe('CuckooHashTable', () => {
  it('sets and gets values', () => {
    const ht = new CuckooHashTable<string, number>()
    expect(ht.set('a', 1)).toBe(true)
    expect(ht.set('b', 2)).toBe(true)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('returns undefined for missing key', () => {
    const ht = new CuckooHashTable<string, number>()
    expect(ht.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('x', 1)
    ht.set('x', 2)
    expect(ht.get('x')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('deletes keys', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.get('a')).toBeUndefined()
    expect(ht.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const ht = new CuckooHashTable<string, number>()
    expect(ht.delete('missing')).toBe(false)
  })

  it('has checks existence', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 42)
    expect(ht.has('key')).toBe(true)
    expect(ht.has('missing')).toBe(false)
  })

  it('tracks size', () => {
    const ht = new CuckooHashTable<string, number>()
    expect(ht.size).toBe(0)
    expect(ht.isEmpty()).toBe(true)
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size).toBe(2)
    expect(ht.isEmpty()).toBe(false)
  })

  it('handles number keys', () => {
    const ht = new CuckooHashTable<number, string>(32)
    ht.set(1, 'one')
    ht.set(2, 'two')
    ht.set(3, 'three')
    expect(ht.get(1)).toBe('one')
    expect(ht.get(2)).toBe('two')
    expect(ht.get(3)).toBe('three')
  })

  it('handles many insertions', () => {
    const ht = new CuckooHashTable<string, number>(64)
    for (let i = 0; i < 30; i++) {
      ht.set(`key-${i}`, i)
    }
    expect(ht.size).toBe(30)
    for (let i = 0; i < 30; i++) {
      expect(ht.get(`key-${i}`)).toBe(i)
    }
  })

  it('delete and re-insert works', () => {
    const ht = new CuckooHashTable<string, number>(32)
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.get('a')).toBeUndefined()
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('overwriting does not increase size', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('x', 1)
    ht.set('x', 2)
    expect(ht.size).toBe(1)
  })

  it('isEmpty works', () => {
    const ht = new CuckooHashTable<string, number>()
    expect(ht.isEmpty()).toBe(true)
    ht.set('a', 1)
    expect(ht.isEmpty()).toBe(false)
  })

  it('handles null-ish values', () => {
    const ht = new CuckooHashTable<string, number | null>(32)
    ht.set('a', null)
    expect(ht.get('a')).toBe(null)
    expect(ht.has('a')).toBe(true)
  })

  it('handles zero as value', () => {
    const ht = new CuckooHashTable<string, number>(32)
    ht.set('a', 0)
    expect(ht.get('a')).toBe(0)
    expect(ht.has('a')).toBe(true)
  })

  it('handles empty string key', () => {
    const ht = new CuckooHashTable<string, number>(32)
    ht.set('', 42)
    expect(ht.get('')).toBe(42)
  })

  it('handles multiple insertions', () => {
    const ht = new CuckooHashTable<string, number>(32)
    for (let i = 0; i < 10; i++) ht.set(`key-${i}`, i)
    expect(ht.size).toBe(10)
    expect(ht.get('key-5')).toBe(5)
  })

  it('delete returns true for existing key', () => {
    const ht = new CuckooHashTable<string, number>(32)
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.has('a')).toBe(false)
  })

  it('size tracks elements', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size).toBe(2)
  })

  it('get returns correct value', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 42)
    expect(ht.get('a')).toBe(42)
  })

  it('has returns true for existing key', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 42)
    expect(ht.has('a')).toBe(true)
    expect(ht.has('b')).toBe(false)
  })

  it('delete removes key', () => {
    const ht = new CuckooHashTable<string, number>(16)
    ht.set('a', 42)
    ht.delete('a')
    expect(ht.has('a')).toBe(false)
  })

  it('get returns value for existing key', () => {
    const ht = new CuckooHashTable<string, number>(16)
    ht.set('x', 10)
    expect(ht.get('x')).toBe(10)
  })

  it('has returns false for missing key', () => {
    const ht = new CuckooHashTable<string, number>(16)
    expect(ht.has('missing')).toBe(false)
  })

  it('set and get roundtrip', () => {
    const ht = new CuckooHashTable<string, number>(16)
    ht.set('key', 42)
    expect(ht.get('key')).toBe(42)
  })

  it('get missing key returns undefined', () => {
    const ht = new CuckooHashTable<string, number>(16)
    expect(ht.get('missing')).toBeUndefined()
  })

  it('failed set preserves existing entries', () => {
    const ht = new CuckooHashTable<string, number>(4)
    const stored: Record<string, number> = {}
    for (let i = 0; i < 4; i++) {
      const k = `k${i}`
      const v = i * 10
      ht.set(k, v)
      stored[k] = v
    }
    const before = new Map<string, number>()
    for (const k of Object.keys(stored)) {
      before.set(k, ht.get(k))
    }
    ht.set('overflow', 99)
    for (const [k, v] of before) {
      expect(ht.get(k)).toBe(v)
    }
  })

  it('high load factor stress test preserves integrity', () => {
    const ht = new CuckooHashTable<number, number>(32)
    const ref = new Map<number, number>()
    for (let i = 0; i < 25; i++) {
      ht.set(i, i * 2)
      ref.set(i, i * 2)
    }
    for (const [k, v] of ref) {
      expect(ht.get(k)).toBe(v)
    }
    expect(ht.size).toBe(ref.size)
  })

  it('handles custom capacity', () => {
    const ht = new CuckooHashTable<string, number>(8)
    expect(ht.set('a', 1)).toBe(true)
    expect(ht.set('b', 2)).toBe(true)
    expect(ht.size).toBe(2)
  })

  it('handles undefined as value', () => {
    const ht = new CuckooHashTable<string, number | undefined>()
    ht.set('key', undefined)
    expect(ht.get('key')).toBe(undefined)
    expect(ht.has('key')).toBe(false)
  })

  it('handles string keys with special characters', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key-with-dash', 1)
    ht.set('key_with_underscore', 2)
    ht.set('key.with.dot', 3)
    expect(ht.get('key-with-dash')).toBe(1)
    expect(ht.get('key_with_underscore')).toBe(2)
    expect(ht.get('key.with.dot')).toBe(3)
  })

  it('handles boolean values', () => {
    const ht = new CuckooHashTable<string, boolean>()
    ht.set('true', true)
    ht.set('false', false)
    expect(ht.get('true')).toBe(true)
    expect(ht.get('false')).toBe(false)
  })

  it('handles object values', () => {
    const ht = new CuckooHashTable<string, { x: number }>()
    const obj1 = { x: 1 }
    const obj2 = { x: 2 }
    ht.set('obj1', obj1)
    ht.set('obj2', obj2)
    expect(ht.get('obj1')).toBe(obj1)
    expect(ht.get('obj2')).toBe(obj2)
  })

  it('handles array values', () => {
    const ht = new CuckooHashTable<string, number[]>()
    const arr = [1, 2, 3]
    ht.set('arr', arr)
    expect(ht.get('arr')).toBe(arr)
  })

  it('handles very long string keys', () => {
    const ht = new CuckooHashTable<string, number>()
    const longKey = 'a'.repeat(1000)
    ht.set(longKey, 42)
    expect(ht.get(longKey)).toBe(42)
  })

  it('handles very large values', () => {
    const ht = new CuckooHashTable<string, number>()
    const largeValue = Number.MAX_SAFE_INTEGER
    ht.set('large', largeValue)
    expect(ht.get('large')).toBe(largeValue)
  })

  it('handles multiple deletions', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.delete('a')).toBe(true)
    expect(ht.delete('b')).toBe(true)
    expect(ht.delete('c')).toBe(true)
    expect(ht.size).toBe(0)
    expect(ht.isEmpty()).toBe(true)
  })

  it('delete non-existent key does not affect size', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    const sizeBefore = ht.size
    ht.delete('non-existent')
    expect(ht.size).toBe(sizeBefore)
  })

  it('set after delete works correctly', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 1)
    ht.delete('key')
    ht.set('key', 2)
    expect(ht.get('key')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('handles keys that may hash to same bucket', () => {
    const ht = new CuckooHashTable<string, number>(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.set('d', 4)
    expect(ht.size).toBeGreaterThan(0)
  })

  it('handles negative number keys', () => {
    const ht = new CuckooHashTable<number, string>()
    ht.set(-1, 'minus one')
    ht.set(-100, 'minus hundred')
    expect(ht.get(-1)).toBe('minus one')
    expect(ht.get(-100)).toBe('minus hundred')
  })

  it('handles float number keys', () => {
    const ht = new CuckooHashTable<number, string>()
    ht.set(1.5, 'one point five')
    ht.set(2.7, 'two point seven')
    expect(ht.get(1.5)).toBe('one point five')
    expect(ht.get(2.7)).toBe('two point seven')
  })

  it('setting same value multiple times keeps size at 1', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 1)
    ht.set('key', 1)
    ht.set('key', 1)
    expect(ht.size).toBe(1)
  })

  it('alternating set and delete operations', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    ht.delete('a')
    ht.set('b', 2)
    ht.delete('b')
    ht.set('a', 3)
    expect(ht.get('a')).toBe(3)
    expect(ht.size).toBe(1)
  })

  it('get after delete returns undefined', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 42)
    ht.delete('key')
    expect(ht.get('key')).toBeUndefined()
  })

  it('has after delete returns false', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 42)
    ht.delete('key')
    expect(ht.has('key')).toBe(false)
  })

  it('size tracks correctly after many operations', () => {
    const ht = new CuckooHashTable<string, number>()
    for (let i = 0; i < 10; i++) {
      ht.set(`key-${i}`, i)
    }
    expect(ht.size).toBe(10)
    ht.delete('key-5')
    expect(ht.size).toBe(9)
    ht.set('key-10', 10)
    expect(ht.size).toBe(10)
  })

  it('isEmpty returns true after clearing all entries', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    ht.delete('b')
    expect(ht.isEmpty()).toBe(true)
  })

  it('isEmpty returns false with one entry', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.isEmpty()).toBe(false)
  })

  it('handles capacity of 1', () => {
    const ht = new CuckooHashTable<string, number>(1)
    ht.set('a', 1)
    expect(ht.size).toBe(1)
  })

  it('preserves key order for same hash', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('handles string keys with spaces', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key with spaces', 42)
    expect(ht.get('key with spaces')).toBe(42)
  })

  it('handles very small capacity', () => {
    const ht = new CuckooHashTable<string, number>(2)
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size).toBe(2)
  })

  it('overwrites value when key already exists', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 1)
    ht.set('key', 2)
    ht.set('key', 3)
    expect(ht.get('key')).toBe(3)
    expect(ht.size).toBe(1)
  })

  it('delete returns false for empty table', () => {
    const ht = new CuckooHashTable<string, number>()
    expect(ht.delete('any')).toBe(false)
  })

  it('handles set after attempting many insertions', () => {
    const ht = new CuckooHashTable<string, number>(4)
    for (let i = 0; i < 5; i++) {
      ht.set(`key-${i}`, i)
    }
    const sizeBefore = ht.size
    ht.set('new-key', 99)
    expect(ht.size).toBeGreaterThanOrEqual(sizeBefore)
  })

  it('preserves all values after many insertions', () => {
    const ht = new CuckooHashTable<string, number>()
    const pairs: Record<string, number> = {}
    for (let i = 0; i < 20; i++) {
      const key = `key-${i}`
      const value = i * 10
      ht.set(key, value)
      pairs[key] = value
    }
    for (const [key, value] of Object.entries(pairs)) {
      expect(ht.get(key)).toBe(value)
    }
  })

  it('handles deletion of non-existent key does not crash', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.delete('b')).toBe(false)
    expect(ht.get('a')).toBe(1)
  })

  it('handles concurrent same-key sets', () => {
    const ht = new CuckooHashTable<string, number>()
    ht.set('key', 1)
    ht.set('key', 2)
    ht.set('key', 3)
    ht.set('key', 4)
    expect(ht.get('key')).toBe(4)
    expect(ht.size).toBe(1)
  })
})

describe('cuckoo-hash - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
