import { describe, it, expect } from 'vitest'
import { ZipTree } from '../src/core/zip-tree/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('ZipTree', () => {
  describe('constructor', () => {
    it('creates an empty tree', () => {
      const t = new ZipTree<number, string>()
      expect(t.isEmpty()).toBe(true)
      expect(t.size()).toBe(0)
    })

    it('accepts custom comparator', () => {
      const t = new ZipTree<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      t.insert('b', 2)
      t.insert('a', 1)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
    })
  })

  // ─── insert / get / has ───────────────────────────────────────────────

  describe('insert and get', () => {
    it('inserts and retrieves values', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'one')
      t.insert(2, 'two')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('returns undefined for missing key', () => {
      const t = new ZipTree<number, string>()
      expect(t.get(99)).toBeUndefined()
    })

    it('insert increases size', () => {
      const t = new ZipTree<number, number>()
      t.insert(1, 10)
      t.insert(2, 20)
      expect(t.size()).toBe(2)
    })

    it('insert several values and verify', () => {
      const t = new ZipTree<number, number>()
      t.insert(1, 10)
      t.insert(3, 30)
      t.insert(5, 50)
      expect(t.size()).toBe(3)
      expect(t.has(1)).toBe(true)
      expect(t.has(3)).toBe(true)
      expect(t.has(5)).toBe(true)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const t = new ZipTree<number, string>()
      t.insert(5, 'five')
      expect(t.has(5)).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = new ZipTree<number, string>()
      expect(t.has(5)).toBe(false)
    })

    it('returns false after all elements deleted', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'one')
      t.clear()
      expect(t.has(1)).toBe(false)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('returns a boolean indicating deletion', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'one')
      const result = t.delete(1)
      expect(typeof result).toBe('boolean')
    })

    it('returns false for missing key', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'one')
      expect(t.delete(99)).toBe(false)
      expect(t.size()).toBe(1)
    })

    it('returns false on empty tree', () => {
      const t = new ZipTree<number, string>()
      expect(t.delete(1)).toBe(false)
    })

    it('delete on non-empty tree returns boolean', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'a')
      t.insert(3, 'c')
      const result = t.delete(99)
      expect(result).toBe(false)
      expect(t.size()).toBe(2)
    })

    it('delete result type is boolean', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'a')
      expect(typeof t.delete(1)).toBe('boolean')
    })
  })

  // ─── min / max ────────────────────────────────────────────────────────

  describe('min and max', () => {
    it('returns undefined when empty', () => {
      const t = new ZipTree<number, string>()
      expect(t.min()).toBeUndefined()
      expect(t.max()).toBeUndefined()
    })

    it('returns correct min and max for single element', () => {
      const t = new ZipTree<number, string>()
      t.insert(42, 'answer')
      expect(t.min()).toBe(42)
      expect(t.max()).toBe(42)
    })

    it('returns correct min and max for multiple elements', () => {
      const t = new ZipTree<number, string>()
      t.insert(50, 'fifty')
      t.insert(10, 'ten')
      expect(t.min()).toBe(10)
      expect(t.max()).toBe(50)
    })
  })

  // ─── floor / ceiling ──────────────────────────────────────────────────

  describe('floor', () => {
    it('returns exact key if present', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      expect(t.floor(10)).toBe(10)
    })

    it('returns largest key less than target', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      t.insert(20, 'b')
      expect(t.floor(15)).toBe(10)
    })

    it('returns undefined when all keys greater', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      expect(t.floor(5)).toBeUndefined()
    })
  })

  describe('ceiling', () => {
    it('returns exact key if present', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      expect(t.ceiling(10)).toBe(10)
    })

    it('returns smallest key greater than target', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      t.insert(30, 'c')
      expect(t.ceiling(20)).toBe(30)
    })

    it('returns undefined when all keys smaller', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      expect(t.ceiling(20)).toBeUndefined()
    })
  })

  // ─── clear / toArray ──────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'a')
      t.insert(2, 'b')
      t.clear()
      expect(t.isEmpty()).toBe(true)
      expect(t.size()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns all inserted key-value pairs', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      t.insert(20, 'b')
      const arr = t.toArray()
      expect(arr.length).toBe(2)
      expect(arr).toContainEqual([10, 'a'])
      expect(arr).toContainEqual([20, 'b'])
    })

    it('returns empty array when empty', () => {
      const t = new ZipTree<number, string>()
      expect(t.toArray()).toEqual([])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const t = new ZipTree<number, string>()
      t.insert(10, 'a')
      t.insert(20, 'b')
      const pairs: [number, string][] = []
      t.forEach((v, k) => pairs.push([k, v]))
      expect(pairs.length).toBe(2)
      expect(pairs).toContainEqual([10, 'a'])
      expect(pairs).toContainEqual([20, 'b'])
    })
  })

  // ─── iterators ────────────────────────────────────────────────────────

  describe('iterators', () => {
    it('Symbol.iterator yields all key-value pairs', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'a')
      t.insert(2, 'b')
      const entries = [...t]
      expect(entries.length).toBe(2)
    })

    it('keys() yields all keys', () => {
      const t = new ZipTree<number, string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      const keys = [...t.keys()]
      expect(keys.length).toBe(2)
      expect(keys).toContain(1)
      expect(keys).toContain(3)
    })

    it('values() yields all values', () => {
      const t = new ZipTree<number, string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      const vals = [...t.values()]
      expect(vals.length).toBe(2)
      expect(vals).toContain('a')
      expect(vals).toContain('c')
    })

    it('entries() yields same as iterator', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'a')
      t.insert(2, 'b')
      const entries = [...t.entries()]
      expect(entries.length).toBe(2)
    })

    it('iterator() returns entries generator', () => {
      const t = new ZipTree<number, string>()
      t.insert(1, 'a')
      const gen = t.iterator()
      const first = gen.next()
      expect(first.value).toEqual([1, 'a'])
    })
  })
})
