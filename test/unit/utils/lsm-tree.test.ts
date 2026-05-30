import { describe, it, expect } from 'vitest'
import { LSMTree } from '../../../src/utils/lsm-tree.js'

describe('LSMTree', () => {
  describe('construction', () => {
    it('creates with default threshold', () => {
      const lsm = new LSMTree()
      expect(lsm.memtableSize).toBe(0)
      expect(lsm.levelCount).toBe(0)
    })

    it('creates with custom threshold', () => {
      const lsm = new LSMTree<number>(5)
      expect(lsm.memtableSize).toBe(0)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves values', () => {
      const lsm = new LSMTree<string>()
      lsm.set('key', 'value')
      expect(lsm.get('key')).toBe('value')
    })

    it('returns undefined for missing key', () => {
      const lsm = new LSMTree<string>()
      expect(lsm.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const lsm = new LSMTree<number>()
      lsm.set('key', 1)
      lsm.set('key', 2)
      expect(lsm.get('key')).toBe(2)
    })

    it('finds key in flushed level', () => {
      const lsm = new LSMTree<number>(3)
      lsm.set('a', 1)
      lsm.set('b', 2)
      lsm.set('c', 3)
      expect(lsm.levelCount).toBeGreaterThan(0)
      expect(lsm.get('a')).toBe(1)
      expect(lsm.get('b')).toBe(2)
      expect(lsm.get('c')).toBe(3)
    })

    it('memtable overrides level', () => {
      const lsm = new LSMTree<number>(2)
      lsm.set('key', 1)
      lsm.set('key2', 2)
      expect(lsm.levelCount).toBeGreaterThan(0)
      lsm.set('key', 99)
      expect(lsm.get('key')).toBe(99)
    })
  })

  describe('delete', () => {
    it('deletes a key', () => {
      const lsm = new LSMTree<string>()
      lsm.set('key', 'value')
      lsm.delete('key')
      expect(lsm.get('key')).toBeUndefined()
    })

    it('has returns false after delete', () => {
      const lsm = new LSMTree<string>()
      lsm.set('key', 'value')
      lsm.delete('key')
      expect(lsm.has('key')).toBe(false)
    })

    it('delete on missing key is no-op', () => {
      const lsm = new LSMTree<string>()
      lsm.delete('missing')
      expect(lsm.get('missing')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const lsm = new LSMTree<number>()
      lsm.set('key', 42)
      expect(lsm.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const lsm = new LSMTree<number>()
      expect(lsm.has('key')).toBe(false)
    })
  })

  describe('entries', () => {
    it('returns all entries', () => {
      const lsm = new LSMTree<number>()
      lsm.set('a', 1)
      lsm.set('b', 2)
      lsm.set('c', 3)
      const entries = lsm.entries()
      expect(entries.length).toBe(3)
      expect(Object.fromEntries(entries)).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('excludes deleted entries', () => {
      const lsm = new LSMTree<number>()
      lsm.set('a', 1)
      lsm.set('b', 2)
      lsm.delete('a')
      const entries = lsm.entries()
      expect(entries.length).toBe(1)
      expect(entries[0]!).toEqual(['b', 2])
    })
  })

  describe('flush and compaction', () => {
    it('flushes when threshold reached', () => {
      const lsm = new LSMTree<number>(3)
      lsm.set('a', 1)
      lsm.set('b', 2)
      expect(lsm.levelCount).toBe(0)
      lsm.set('c', 3)
      expect(lsm.levelCount).toBeGreaterThan(0)
      expect(lsm.memtableSize).toBe(0)
    })

    it('compacts levels', () => {
      const lsm = new LSMTree<number>(2)
      for (let i = 0; i < 10; i++) {
        lsm.set(`key-${i}`, i)
      }
      expect(lsm.levelCount).toBeLessThanOrEqual(3)
    })
  })
})
