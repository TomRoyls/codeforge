import { describe, expect, it } from 'vitest'
import { LinearProbingHashTable } from '../../src/utils/linear-probing-hash.js'

describe('LinearProbingHashTable', () => {
  it('sets and gets values', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('returns undefined for missing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('x', 1)
    ht.set('x', 2)
    expect(ht.get('x')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('deletes keys', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.get('a')).toBeUndefined()
    expect(ht.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.delete('missing')).toBe(false)
  })

  it('has checks existence', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('key', 42)
    expect(ht.has('key')).toBe(true)
    expect(ht.has('missing')).toBe(false)
  })

  it('tracks size correctly', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.size).toBe(0)
    expect(ht.isEmpty()).toBe(true)
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size).toBe(2)
    expect(ht.isEmpty()).toBe(false)
  })

  it('keys_Array returns all keys', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.keys_Array().sort()).toEqual(['a', 'b', 'c'])
  })

  it('values_Array returns all values', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.values_Array().sort()).toEqual([1, 2])
  })

  it('handles number keys', () => {
    const ht = new LinearProbingHashTable<number, string>()
    ht.set(1, 'one')
    ht.set(2, 'two')
    expect(ht.get(1)).toBe('one')
    expect(ht.get(2)).toBe('two')
  })

  it('handles many insertions with sufficient capacity', () => {
    const ht = new LinearProbingHashTable<string, number>(64)
    for (let i = 0; i < 30; i++) {
      ht.set(`key-${i}`, i)
    }
    expect(ht.size).toBe(30)
    for (let i = 0; i < 30; i++) {
      expect(ht.get(`key-${i}`)).toBe(i)
    }
  })

  it('handles delete and re-insert', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.get('a')).toBeUndefined()
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('values_Array returns correct values after operations', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    ht.set('c', 3)
    const vals = ht.values_Array().sort()
    expect(vals).toEqual([2, 3])
  })

  it('handles zero value', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 0)
    expect(ht.get('a')).toBe(0)
    expect(ht.has('a')).toBe(true)
  })

  it('handles empty string key', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('', 42)
    expect(ht.get('')).toBe(42)
  })

  it('handles has after delete', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.has('a')).toBe(false)
  })
})
