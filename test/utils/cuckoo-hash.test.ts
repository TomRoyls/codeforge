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
})
