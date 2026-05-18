import { describe, it, expect } from 'vitest'
import { CuckooHashTable } from '../src/core/cuckoo-hash-table/cuckoo-hash-table.js'
import { DEFAULT_CUCKOO_OPTIONS } from '../src/core/cuckoo-hash-table/types.js'

// ─── Constructor ───

describe('CuckooHashTable', () => {
  it('creates with default options', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.size()).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.capacity).toBe(DEFAULT_CUCKOO_OPTIONS.capacity)
  })

  it('creates with custom capacity', () => {
    const t = new CuckooHashTable<string, number>({ capacity: 32 })
    expect(t.capacity).toBe(32)
  })

  it('creates with custom options', () => {
    const t = new CuckooHashTable<string, number>({
      capacity: 8,
      maxEvictions: 20,
      numTables: 3,
    })
    expect(t.capacity).toBe(8)
  })

  // ─── set / get ───

  it('sets and gets a value', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('key', 42)
    expect(t.get('key')).toBe(42)
  })

  it('returns undefined for missing key', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.get('missing')).toBeUndefined()
  })

  it('overwrites existing value', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('key', 1)
    t.set('key', 2)
    expect(t.get('key')).toBe(2)
    expect(t.size()).toBe(1)
  })

  it('handles multiple keys', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    t.set('c', 3)
    expect(t.get('a')).toBe(1)
    expect(t.get('b')).toBe(2)
    expect(t.get('c')).toBe(3)
    expect(t.size()).toBe(3)
  })

  it('handles number keys', () => {
    const t = new CuckooHashTable<number, string>()
    t.set(1, 'one')
    t.set(2, 'two')
    expect(t.get(1)).toBe('one')
    expect(t.get(2)).toBe('two')
  })

  // ─── has ───

  it('has returns true for existing key', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('key', 1)
    expect(t.has('key')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.has('missing')).toBe(false)
  })

  // ─── delete ───

  it('deletes existing key', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('key', 1)
    expect(t.delete('key')).toBe(true)
    expect(t.has('key')).toBe(false)
    expect(t.size()).toBe(0)
  })

  it('returns false for deleting missing key', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.delete('missing')).toBe(false)
  })

  it('delete does not affect other keys', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    t.delete('a')
    expect(t.get('b')).toBe(2)
    expect(t.size()).toBe(1)
  })

  // ─── size / isEmpty ───

  it('size tracks insertions', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.size()).toBe(0)
    t.set('a', 1)
    expect(t.size()).toBe(1)
    t.set('b', 2)
    expect(t.size()).toBe(2)
  })

  it('isEmpty toggles', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.isEmpty()).toBe(true)
    t.set('key', 1)
    expect(t.isEmpty()).toBe(false)
    t.delete('key')
    expect(t.isEmpty()).toBe(true)
  })

  // ─── clear ───

  it('clears all entries', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    t.clear()
    expect(t.size()).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.get('a')).toBeUndefined()
  })

  it('allows operations after clear', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('old', 1)
    t.clear()
    t.set('new', 2)
    expect(t.get('new')).toBe(2)
  })

  // ─── keys / values / entries ───

  it('returns all keys', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    t.set('c', 3)
    const keys = t.keys()
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
    expect(keys.length).toBe(3)
  })

  it('returns all values', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    const values = t.values()
    expect(values).toContain(1)
    expect(values).toContain(2)
  })

  it('returns all entries', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    const entries = t.entries()
    expect(entries.length).toBe(2)
    expect(entries.some(e => e.key === 'a' && e.value === 1)).toBe(true)
    expect(entries.some(e => e.key === 'b' && e.value === 2)).toBe(true)
  })

  it('keys/values/entries return empty on empty table', () => {
    const t = new CuckooHashTable<string, number>()
    expect(t.keys()).toEqual([])
    expect(t.values()).toEqual([])
    expect(t.entries()).toEqual([])
  })

  // ─── forEach ───

  it('iterates all entries', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    const result: [string, number][] = []
    t.forEach((value, key) => result.push([key, value]))
    expect(result.length).toBe(2)
  })

  it('forEach on empty does nothing', () => {
    const t = new CuckooHashTable<string, number>()
    let count = 0
    t.forEach(() => count++)
    expect(count).toBe(0)
  })

  // ─── loadFactor ───

  it('computes load factor', () => {
    const t = new CuckooHashTable<string, number>({ capacity: 16, numTables: 2 })
    expect(t.loadFactor).toBe(0)
    t.set('a', 1)
    expect(t.loadFactor).toBeCloseTo(1 / 32)
  })

  // ─── capacity ───

  it('reports capacity', () => {
    const t = new CuckooHashTable<string, number>({ capacity: 8 })
    expect(t.capacity).toBe(8)
  })

  // ─── getStatistics ───

  it('tracks insertion statistics', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    const s = t.getStatistics()
    expect(s.insertions).toBe(2)
  })

  it('tracks lookup statistics', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.get('a')
    t.get('missing')
    const s = t.getStatistics()
    expect(s.lookups).toBe(2)
  })

  it('tracks deletion statistics', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.delete('a')
    const s = t.getStatistics()
    expect(s.deletions).toBe(1)
  })

  it('returns stats copy', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    const s1 = t.getStatistics()
    t.set('b', 2)
    const s2 = t.getStatistics()
    expect(s1.insertions).toBe(1)
    expect(s2.insertions).toBe(2)
  })

  // ─── rehash ───

  it('rehash preserves all entries', () => {
    const t = new CuckooHashTable<string, number>()
    for (let i = 0; i < 10; i++) t.set(`key-${i}`, i)
    t.rehash(t.capacity * 2)
    expect(t.size()).toBe(10)
    for (let i = 0; i < 10; i++) {
      expect(t.get(`key-${i}`)).toBe(i)
    }
  })

  // ─── reserve ───

  it('reserves capacity', () => {
    const t = new CuckooHashTable<string, number>({ capacity: 4 })
    t.set('a', 1)
    t.reserve(64)
    expect(t.capacity).toBeGreaterThanOrEqual(32)
    expect(t.get('a')).toBe(1)
  })

  // ─── Symbol.iterator ───

  it('supports for-of iteration', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('a', 1)
    t.set('b', 2)
    const result: string[] = []
    for (const entry of t) {
      result.push(entry.key)
    }
    expect(result.length).toBe(2)
    expect(result).toContain('a')
    expect(result).toContain('b')
  })

  // ─── DEFAULT_CUCKOO_OPTIONS ───

  it('exports correct defaults', () => {
    expect(DEFAULT_CUCKOO_OPTIONS.capacity).toBe(16)
    expect(DEFAULT_CUCKOO_OPTIONS.maxEvictions).toBe(50)
    expect(DEFAULT_CUCKOO_OPTIONS.numTables).toBe(2)
  })

  // ─── Auto-resize under load ───

  it('auto-resizes when table fills', () => {
    const t = new CuckooHashTable<string, number>({ capacity: 4 })
    for (let i = 0; i < 20; i++) {
      t.set(`key-${i}`, i)
    }
    expect(t.size()).toBe(20)
    expect(t.capacity).toBeGreaterThan(4)
    expect(t.getStatistics().resizes).toBeGreaterThan(0)
  })

  // ─── Edge cases ───

  it('handles empty string keys', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('', 42)
    expect(t.get('')).toBe(42)
  })

  it('handles object values', () => {
    const t = new CuckooHashTable<string, object>()
    t.set('key', { a: 1 })
    expect(t.get('key')).toEqual({ a: 1 })
  })

  it('handles null values', () => {
    const t = new CuckooHashTable<string, null>()
    t.set('key', null)
    expect(t.get('key')).toBeNull()
  })

  it('handles undefined values', () => {
    const t = new CuckooHashTable<string, undefined>()
    t.set('key', undefined)
    expect(t.get('key')).toBeUndefined()
    expect(t.has('key')).toBe(true)
  })

  it('handles many insertions and deletions', () => {
    const t = new CuckooHashTable<string, number>({ capacity: 16 })
    for (let i = 0; i < 50; i++) t.set(`k${i}`, i)
    expect(t.size()).toBe(50)
    for (let i = 0; i < 25; i++) t.delete(`k${i}`)
    expect(t.size()).toBe(25)
    for (let i = 25; i < 50; i++) {
      expect(t.get(`k${i}`)).toBe(i)
    }
  })

  it('handles set-delete-reinsert cycle', () => {
    const t = new CuckooHashTable<string, number>()
    t.set('key', 1)
    t.delete('key')
    t.set('key', 2)
    expect(t.get('key')).toBe(2)
    expect(t.size()).toBe(1)
  })
})
