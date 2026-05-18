import { describe, expect, it } from 'vitest'
import { HashStore } from '../../../src/core/hash-util/hash-store.js'

// ─── Constructor ───

describe('HashStore', () => {
  it('creates with default algorithm', () => {
    const store = new HashStore()
    store.add('key1', 'abc123')
    const entry = store.get('key1')
    expect(entry).not.toBeNull()
    expect(entry!.algorithm).toBe('djb2')
  })

  it('creates with custom algorithm', () => {
    const store = new HashStore('fnv1a')
    store.add('key1', 'abc123')
    expect(store.get('key1')!.algorithm).toBe('fnv1a')
  })

  it('starts empty', () => {
    const store = new HashStore()
    expect(store.size()).toBe(0)
    expect(store.getAll()).toEqual([])
  })

  // ─── add ───

  describe('add', () => {
    it('stores entry with key and hash', () => {
      const store = new HashStore()
      store.add('file1.ts', 'hash123')
      const entry = store.get('file1.ts')
      expect(entry).not.toBeNull()
      expect(entry!.key).toBe('file1.ts')
      expect(entry!.hash).toBe('hash123')
    })

    it('stores metadata', () => {
      const store = new HashStore()
      store.add('f', 'h', { size: 100, lines: 20 })
      expect(store.get('f')!.metadata).toEqual({ size: 100, lines: 20 })
    })

    it('defaults to empty metadata', () => {
      const store = new HashStore()
      store.add('f', 'h')
      expect(store.get('f')!.metadata).toEqual({})
    })

    it('stores size as hash length', () => {
      const store = new HashStore()
      store.add('f', 'abcdef')
      expect(store.get('f')!.size).toBe(6)
    })

    it('overwrites existing key', () => {
      const store = new HashStore()
      store.add('f', 'old')
      store.add('f', 'new')
      expect(store.get('f')!.hash).toBe('new')
      expect(store.size()).toBe(1)
    })

    it('sets createdAt timestamp', () => {
      const store = new HashStore()
      const before = Date.now()
      store.add('f', 'h')
      const after = Date.now()
      const entry = store.get('f')!
      expect(entry.createdAt).toBeGreaterThanOrEqual(before)
      expect(entry.createdAt).toBeLessThanOrEqual(after)
    })
  })

  // ─── get ───

  describe('get', () => {
    it('returns null for missing key', () => {
      const store = new HashStore()
      expect(store.get('missing')).toBeNull()
    })
  })

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const store = new HashStore()
      store.add('f', 'h')
      expect(store.has('f')).toBe(true)
    })

    it('returns false for missing key', () => {
      const store = new HashStore()
      expect(store.has('missing')).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('removes existing entry', () => {
      const store = new HashStore()
      store.add('f', 'h')
      expect(store.remove('f')).toBe(true)
      expect(store.has('f')).toBe(false)
    })

    it('returns false for missing key', () => {
      const store = new HashStore()
      expect(store.remove('missing')).toBe(false)
    })
  })

  // ─── findByHash ───

  describe('findByHash', () => {
    it('finds entries by hash value', () => {
      const store = new HashStore()
      store.add('a', 'same-hash')
      store.add('b', 'same-hash')
      store.add('c', 'different-hash')
      const results = store.findByHash('same-hash')
      expect(results).toHaveLength(2)
    })

    it('returns empty for no match', () => {
      const store = new HashStore()
      store.add('a', 'hash1')
      expect(store.findByHash('no-match')).toEqual([])
    })
  })

  // ─── getAll ───

  describe('getAll', () => {
    it('returns all entries', () => {
      const store = new HashStore()
      store.add('a', 'h1')
      store.add('b', 'h2')
      expect(store.getAll()).toHaveLength(2)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries', () => {
      const store = new HashStore()
      store.add('a', 'h1')
      store.add('b', 'h2')
      store.clear()
      expect(store.size()).toBe(0)
    })
  })

  // ─── export/import ───

  describe('export', () => {
    it('returns key-to-hash map', () => {
      const store = new HashStore()
      store.add('a', 'hash1')
      store.add('b', 'hash2')
      const exported = store.export()
      expect(exported).toEqual({ a: 'hash1', b: 'hash2' })
    })

    it('returns empty object for empty store', () => {
      const store = new HashStore()
      expect(store.export()).toEqual({})
    })
  })

  describe('import', () => {
    it('imports entries from record', () => {
      const store = new HashStore()
      store.import({ x: 'hx', y: 'hy' })
      expect(store.size()).toBe(2)
      expect(store.get('x')!.hash).toBe('hx')
    })

    it('adds to existing entries', () => {
      const store = new HashStore()
      store.add('a', 'ha')
      store.import({ b: 'hb' })
      expect(store.size()).toBe(2)
    })
  })
})
