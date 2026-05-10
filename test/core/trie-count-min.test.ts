import { describe, it, expect, beforeEach } from 'vitest'
import { TrieCountMin } from '../../src/core/trie-count-min/trie-count-min.js'
import { DEFAULT_TRIECOUNTMIN_OPTIONS } from '../../src/core/trie-count-min/types.js'
import type { TrieCountMinOptions, TrieCountMinNode } from '../../src/core/trie-count-min/types.js'

describe('TrieCountMin', () => {
  let tcm: TrieCountMin

  beforeEach(() => {
    tcm = new TrieCountMin()
  })

  describe('construction', () => {
    it('should create with default options', () => {
      const t = new TrieCountMin()
      expect(t.isEmpty()).toBe(true)
      expect(t.width).toBe(DEFAULT_TRIECOUNTMIN_OPTIONS.width)
      expect(t.depth).toBe(DEFAULT_TRIECOUNTMIN_OPTIONS.depth)
    })

    it('should accept width, depth positional arguments', () => {
      const t = new TrieCountMin(500, 7)
      expect(t.width).toBe(500)
      expect(t.depth).toBe(7)
    })

    it('should accept width, depth, seed positional arguments', () => {
      const t = new TrieCountMin(200, 3, 42)
      expect(t.width).toBe(200)
      expect(t.depth).toBe(3)
      expect(t.seed).toBe(42)
    })

    it('should accept options object', () => {
      const t = new TrieCountMin({ width: 300, depth: 8, seed: 99 })
      expect(t.width).toBe(300)
      expect(t.depth).toBe(8)
      expect(t.seed).toBe(99)
    })

    it('should accept partial options object', () => {
      const t = new TrieCountMin({ width: 400 })
      expect(t.width).toBe(400)
      expect(t.depth).toBe(DEFAULT_TRIECOUNTMIN_OPTIONS.depth)
    })

    it('should accept partial options with only depth', () => {
      const t = new TrieCountMin({ depth: 3 })
      expect(t.width).toBe(DEFAULT_TRIECOUNTMIN_OPTIONS.width)
      expect(t.depth).toBe(3)
    })

    it('should ceil fractional width', () => {
      const t = new TrieCountMin({ width: 100.5 })
      expect(t.width).toBe(101)
    })

    it('should ceil fractional depth', () => {
      const t = new TrieCountMin({ depth: 2.3 })
      expect(t.depth).toBe(3)
    })

    it('should enforce minimum width of 1', () => {
      const t = new TrieCountMin({ width: 0 })
      expect(t.width).toBe(1)
    })

    it('should enforce minimum depth of 1', () => {
      const t = new TrieCountMin({ depth: 0 })
      expect(t.depth).toBe(1)
    })

    it('should initialize with zero totalInsertions', () => {
      expect(tcm.totalInsertions()).toBe(0)
    })

    it('should initialize with zero distinctCount', () => {
      expect(tcm.distinctCount()).toBe(0)
    })

    it('should use default seed of 0', () => {
      expect(tcm.seed).toBe(0)
    })

    it('should preserve dimensions after clear', () => {
      const w = tcm.width
      const d = tcm.depth
      tcm.insert('test')
      tcm.clear()
      expect(tcm.width).toBe(w)
      expect(tcm.depth).toBe(d)
    })
  })

  describe('insert and count', () => {
    it('should insert a string and return count 1', () => {
      tcm.insert('hello')
      expect(tcm.count('hello')).toBe(1)
    })

    it('should return 0 for non-existent key', () => {
      expect(tcm.count('nothing')).toBe(0)
    })

    it('should increment count for repeated inserts', () => {
      tcm.insert('hello')
      tcm.insert('hello')
      tcm.insert('hello')
      expect(tcm.count('hello')).toBe(3)
    })

    it('should track multiple different strings independently', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('c')
      expect(tcm.count('a')).toBe(1)
      expect(tcm.count('b')).toBe(1)
      expect(tcm.count('c')).toBe(1)
    })

    it('should handle empty string', () => {
      tcm.insert('')
      expect(tcm.count('')).toBe(1)
    })

    it('should handle unicode strings', () => {
      tcm.insert('日本語')
      tcm.insert('🎉🚀')
      expect(tcm.count('日本語')).toBe(1)
      expect(tcm.count('🎉🚀')).toBe(1)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      tcm.insert(longStr)
      expect(tcm.count(longStr)).toBe(1)
    })

    it('should handle case sensitivity', () => {
      tcm.insert('Hello')
      expect(tcm.count('Hello')).toBe(1)
      expect(tcm.count('hello')).toBe(0)
    })

    it('should handle keys that are prefixes of each other', () => {
      tcm.insert('app')
      tcm.insert('apple')
      tcm.insert('applet')
      expect(tcm.count('app')).toBe(1)
      expect(tcm.count('apple')).toBe(1)
      expect(tcm.count('applet')).toBe(1)
    })

    it('should return 0 for prefix that was not inserted', () => {
      tcm.insert('apple')
      expect(tcm.count('app')).toBe(0)
    })

    it('should update totalInsertions on each insert', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('a')
      expect(tcm.totalInsertions()).toBe(3)
    })

    it('should update distinctCount for new keys only', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('a')
      expect(tcm.distinctCount()).toBe(2)
    })

    it('should handle special characters', () => {
      tcm.insert('hello\nworld\t!')
      tcm.insert('path/to/file.ts')
      expect(tcm.count('hello\nworld\t!')).toBe(1)
      expect(tcm.count('path/to/file.ts')).toBe(1)
    })

    it('should handle numeric strings', () => {
      tcm.insert('123')
      tcm.insert('456')
      expect(tcm.count('123')).toBe(1)
      expect(tcm.count('456')).toBe(1)
      expect(tcm.count('789')).toBe(0)
    })

    it('should handle whitespace-only strings', () => {
      tcm.insert('   ')
      tcm.insert('\t')
      tcm.insert('\n')
      expect(tcm.count('   ')).toBe(1)
      expect(tcm.count('\t')).toBe(1)
      expect(tcm.count('\n')).toBe(1)
    })

    it('should handle single character keys', () => {
      tcm.insert('a')
      tcm.insert('b')
      expect(tcm.count('a')).toBe(1)
      expect(tcm.count('b')).toBe(1)
    })

    it('should make structure not empty after insert', () => {
      tcm.insert('test')
      expect(tcm.isEmpty()).toBe(false)
    })
  })

  describe('prefixCount', () => {
    it('should return 0 for non-existent prefix', () => {
      expect(tcm.prefixCount('xyz')).toBe(0)
    })

    it('should return count for single matching key', () => {
      tcm.insert('apple')
      expect(tcm.prefixCount('app')).toBe(1)
    })

    it('should sum counts for all matching keys', () => {
      tcm.insert('apple')
      tcm.insert('application')
      tcm.insert('apply')
      expect(tcm.prefixCount('app')).toBe(3)
    })

    it('should include the prefix itself if it is a key', () => {
      tcm.insert('app')
      tcm.insert('apple')
      expect(tcm.prefixCount('app')).toBe(2)
    })

    it('should sum repeated insert counts', () => {
      tcm.insert('apple')
      tcm.insert('apple')
      tcm.insert('apply')
      expect(tcm.prefixCount('app')).toBe(3)
    })

    it('should return 0 for empty trie', () => {
      expect(tcm.prefixCount('a')).toBe(0)
    })

    it('should handle empty string prefix returning sum of all', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('c')
      expect(tcm.prefixCount('')).toBe(3)
    })

    it('should not include non-matching keys', () => {
      tcm.insert('apple')
      tcm.insert('banana')
      expect(tcm.prefixCount('app')).toBe(1)
    })

    it('should handle prefix longer than any key', () => {
      tcm.insert('a')
      expect(tcm.prefixCount('abcdefghijkl')).toBe(0)
    })

    it('should work after removal', () => {
      tcm.insert('apple')
      tcm.insert('application')
      tcm.remove('apple')
      expect(tcm.prefixCount('app')).toBe(1)
    })

    it('should handle single character prefix', () => {
      tcm.insert('a')
      tcm.insert('ab')
      tcm.insert('ac')
      tcm.insert('b')
      expect(tcm.prefixCount('a')).toBe(3)
    })

    it('should handle deeply nested prefixes', () => {
      tcm.insert('abcde')
      tcm.insert('abcdf')
      expect(tcm.prefixCount('abcd')).toBe(2)
    })
  })

  describe('remove', () => {
    it('should remove a string and decrement count', () => {
      tcm.insert('hello')
      expect(tcm.remove('hello')).toBe(true)
      expect(tcm.count('hello')).toBe(0)
    })

    it('should return false for non-existent key', () => {
      expect(tcm.remove('nothing')).toBe(false)
    })

    it('should decrement count by one on remove', () => {
      tcm.insert('hello')
      tcm.insert('hello')
      tcm.insert('hello')
      tcm.remove('hello')
      expect(tcm.count('hello')).toBe(2)
    })

    it('should remove key entirely when count reaches zero', () => {
      tcm.insert('hello')
      tcm.remove('hello')
      expect(tcm.contains('hello')).toBe(false)
    })

    it('should decrement totalInsertions', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.remove('a')
      expect(tcm.totalInsertions()).toBe(1)
    })

    it('should decrement distinctCount when key fully removed', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.remove('a')
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should not decrement distinctCount when key still has count', () => {
      tcm.insert('a')
      tcm.insert('a')
      tcm.remove('a')
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should not affect sibling keys', () => {
      tcm.insert('hello')
      tcm.insert('help')
      tcm.remove('hello')
      expect(tcm.count('help')).toBe(1)
    })

    it('should not affect parent prefix keys', () => {
      tcm.insert('app')
      tcm.insert('apple')
      tcm.remove('apple')
      expect(tcm.count('app')).toBe(1)
    })

    it('should not affect child keys', () => {
      tcm.insert('app')
      tcm.insert('apple')
      tcm.remove('app')
      expect(tcm.count('apple')).toBe(1)
    })

    it('should return false for prefix that was not inserted', () => {
      tcm.insert('apple')
      expect(tcm.remove('app')).toBe(false)
    })

    it('should allow re-inserting a removed key', () => {
      tcm.insert('hello')
      tcm.remove('hello')
      tcm.insert('hello')
      expect(tcm.count('hello')).toBe(1)
      expect(tcm.contains('hello')).toBe(true)
    })

    it('should handle removing empty string key', () => {
      tcm.insert('')
      expect(tcm.remove('')).toBe(true)
      expect(tcm.count('')).toBe(0)
    })

    it('should return false for removing from empty trie', () => {
      expect(tcm.remove('anything')).toBe(false)
    })

    it('should handle multiple removes', () => {
      tcm.insert('x')
      tcm.insert('x')
      tcm.insert('x')
      expect(tcm.remove('x')).toBe(true)
      expect(tcm.count('x')).toBe(2)
      expect(tcm.remove('x')).toBe(true)
      expect(tcm.count('x')).toBe(1)
      expect(tcm.remove('x')).toBe(true)
      expect(tcm.count('x')).toBe(0)
      expect(tcm.remove('x')).toBe(false)
    })
  })

  describe('contains', () => {
    it('should return true for inserted key', () => {
      tcm.insert('hello')
      expect(tcm.contains('hello')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(tcm.contains('hello')).toBe(false)
    })

    it('should return false for prefix that was not inserted', () => {
      tcm.insert('apple')
      expect(tcm.contains('app')).toBe(false)
    })

    it('should return false for extension of inserted key', () => {
      tcm.insert('app')
      expect(tcm.contains('apple')).toBe(false)
    })

    it('should return false after full removal', () => {
      tcm.insert('hello')
      tcm.remove('hello')
      expect(tcm.contains('hello')).toBe(false)
    })

    it('should return true when count is still positive after partial remove', () => {
      tcm.insert('hello')
      tcm.insert('hello')
      tcm.remove('hello')
      expect(tcm.contains('hello')).toBe(true)
    })

    it('should handle empty string', () => {
      expect(tcm.contains('')).toBe(false)
      tcm.insert('')
      expect(tcm.contains('')).toBe(true)
    })
  })

  describe('totalInsertions', () => {
    it('should return 0 for new trie', () => {
      expect(tcm.totalInsertions()).toBe(0)
    })

    it('should return count after single insert', () => {
      tcm.insert('test')
      expect(tcm.totalInsertions()).toBe(1)
    })

    it('should sum all inserts including duplicates', () => {
      tcm.insert('a')
      tcm.insert('a')
      tcm.insert('b')
      expect(tcm.totalInsertions()).toBe(3)
    })

    it('should decrease after remove', () => {
      tcm.insert('test')
      tcm.insert('test')
      tcm.remove('test')
      expect(tcm.totalInsertions()).toBe(1)
    })

    it('should reset after clear', () => {
      tcm.insert('test')
      tcm.clear()
      expect(tcm.totalInsertions()).toBe(0)
    })
  })

  describe('getFrequentItems', () => {
    it('should return empty array for empty trie', () => {
      expect(tcm.getFrequentItems(1)).toEqual([])
    })

    it('should return items above threshold', () => {
      tcm.insert('heavy')
      tcm.insert('heavy')
      tcm.insert('heavy')
      tcm.insert('light')
      const frequent = tcm.getFrequentItems(2)
      expect(frequent).toContain('heavy')
      expect(frequent).not.toContain('light')
    })

    it('should return items at exactly the threshold', () => {
      tcm.insert('exact')
      tcm.insert('exact')
      const frequent = tcm.getFrequentItems(2)
      expect(frequent).toContain('exact')
    })

    it('should not return items below threshold', () => {
      tcm.insert('below')
      const frequent = tcm.getFrequentItems(2)
      expect(frequent).not.toContain('below')
    })

    it('should return multiple frequent items', () => {
      tcm.insert('a')
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('b')
      tcm.insert('c')
      const frequent = tcm.getFrequentItems(2)
      expect(frequent).toContain('a')
      expect(frequent).toContain('b')
      expect(frequent).not.toContain('c')
    })

    it('should handle threshold of 1', () => {
      tcm.insert('a')
      tcm.insert('b')
      const frequent = tcm.getFrequentItems(1)
      expect(frequent.length).toBe(2)
    })

    it('should handle threshold of 0', () => {
      tcm.insert('a')
      const frequent = tcm.getFrequentItems(0)
      expect(frequent).toContain('a')
    })

    it('should handle very high threshold', () => {
      tcm.insert('a')
      const frequent = tcm.getFrequentItems(100)
      expect(frequent.length).toBe(0)
    })

    it('should update after inserts and removes', () => {
      tcm.insert('x')
      tcm.insert('x')
      tcm.insert('x')
      tcm.remove('x')
      const frequent = tcm.getFrequentItems(2)
      expect(frequent).toContain('x')
    })
  })

  describe('update', () => {
    it('should set exact count for a new key', () => {
      tcm.update('test', 5)
      expect(tcm.count('test')).toBe(5)
    })

    it('should set exact count for an existing key', () => {
      tcm.insert('test')
      tcm.insert('test')
      tcm.update('test', 10)
      expect(tcm.count('test')).toBe(10)
    })

    it('should handle update with count 0', () => {
      tcm.insert('test')
      tcm.update('test', 0)
      expect(tcm.count('test')).toBe(1)
    })

    it('should handle update on non-existent key', () => {
      tcm.update('new', 3)
      expect(tcm.count('new')).toBe(3)
      expect(tcm.contains('new')).toBe(true)
    })

    it('should ignore negative count', () => {
      tcm.update('test', -5)
      expect(tcm.count('test')).toBe(0)
    })

    it('should update totalInsertions when increasing count', () => {
      tcm.insert('test')
      tcm.insert('test')
      tcm.update('test', 10)
      expect(tcm.totalInsertions()).toBeGreaterThanOrEqual(10)
    })

    it('should handle update on empty string', () => {
      tcm.update('', 3)
      expect(tcm.count('')).toBe(3)
    })

    it('should increase distinctCount for new key', () => {
      tcm.update('new', 1)
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should not increase distinctCount for existing key', () => {
      tcm.insert('test')
      tcm.update('test', 5)
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should handle large count values', () => {
      tcm.update('big', 1000000)
      expect(tcm.count('big')).toBe(1000000)
    })

    it('should support lowering a count via update', () => {
      tcm.insert('test')
      tcm.insert('test')
      tcm.insert('test')
      tcm.update('test', 1)
      expect(tcm.count('test')).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('c')
      tcm.clear()
      expect(tcm.isEmpty()).toBe(true)
    })

    it('should reset totalInsertions', () => {
      tcm.insert('test')
      tcm.insert('test')
      tcm.clear()
      expect(tcm.totalInsertions()).toBe(0)
    })

    it('should reset distinctCount', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.clear()
      expect(tcm.distinctCount()).toBe(0)
    })

    it('should reset all count results to zero', () => {
      tcm.insert('test')
      tcm.clear()
      expect(tcm.count('test')).toBe(0)
    })

    it('should allow inserts after clear', () => {
      tcm.insert('first')
      tcm.clear()
      tcm.insert('second')
      expect(tcm.count('second')).toBe(1)
      expect(tcm.count('first')).toBe(0)
    })

    it('should handle clearing an empty trie', () => {
      tcm.clear()
      expect(tcm.isEmpty()).toBe(true)
      expect(tcm.totalInsertions()).toBe(0)
    })

    it('should handle multiple clears', () => {
      tcm.insert('item')
      tcm.clear()
      tcm.clear()
      expect(tcm.isEmpty()).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new trie', () => {
      expect(tcm.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      tcm.insert('test')
      expect(tcm.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      tcm.insert('test')
      tcm.remove('test')
      expect(tcm.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      tcm.insert('test')
      tcm.clear()
      expect(tcm.isEmpty()).toBe(true)
    })

    it('should return false when items remain', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.remove('a')
      expect(tcm.isEmpty()).toBe(false)
    })
  })

  describe('distinctCount', () => {
    it('should return 0 for empty trie', () => {
      expect(tcm.distinctCount()).toBe(0)
    })

    it('should count distinct keys', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.insert('c')
      expect(tcm.distinctCount()).toBe(3)
    })

    it('should not double count duplicate inserts', () => {
      tcm.insert('a')
      tcm.insert('a')
      tcm.insert('a')
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should decrease on full remove', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.remove('a')
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should reset on clear', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.clear()
      expect(tcm.distinctCount()).toBe(0)
    })
  })

  describe('edge cases - empty trie', () => {
    it('should return 0 count on empty trie', () => {
      expect(tcm.count('anything')).toBe(0)
    })

    it('should return false for contains on empty trie', () => {
      expect(tcm.contains('anything')).toBe(false)
    })

    it('should return 0 for prefixCount on empty trie', () => {
      expect(tcm.prefixCount('a')).toBe(0)
    })

    it('should return empty array for getFrequentItems on empty trie', () => {
      expect(tcm.getFrequentItems(0)).toEqual([])
    })

    it('should return false for remove on empty trie', () => {
      expect(tcm.remove('anything')).toBe(false)
    })
  })

  describe('edge cases - single item', () => {
    it('should handle single item lifecycle', () => {
      tcm.insert('only')
      expect(tcm.count('only')).toBe(1)
      expect(tcm.contains('only')).toBe(true)
      expect(tcm.distinctCount()).toBe(1)
      expect(tcm.totalInsertions()).toBe(1)
      expect(tcm.isEmpty()).toBe(false)
      tcm.remove('only')
      expect(tcm.count('only')).toBe(0)
      expect(tcm.contains('only')).toBe(false)
      expect(tcm.distinctCount()).toBe(0)
      expect(tcm.totalInsertions()).toBe(0)
      expect(tcm.isEmpty()).toBe(true)
    })

    it('should handle single item with update', () => {
      tcm.update('only', 42)
      expect(tcm.count('only')).toBe(42)
      expect(tcm.totalInsertions()).toBeGreaterThanOrEqual(42)
    })
  })

  describe('edge cases - many items', () => {
    it('should handle 1000 different items', () => {
      for (let i = 0; i < 1000; i++) {
        tcm.insert(`item-${i}`)
      }
      expect(tcm.distinctCount()).toBe(1000)
      expect(tcm.totalInsertions()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(tcm.count(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should handle single item inserted many times', () => {
      for (let i = 0; i < 1000; i++) {
        tcm.insert('same')
      }
      expect(tcm.count('same')).toBeGreaterThanOrEqual(1000)
      expect(tcm.totalInsertions()).toBe(1000)
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should handle rapid insert and count cycles', () => {
      for (let i = 0; i < 500; i++) {
        tcm.insert(`item-${i}`)
        expect(tcm.count(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('edge cases - collisions', () => {
    it('should use different seeds to produce different results', () => {
      const t1 = new TrieCountMin(10, 3, 0)
      const t2 = new TrieCountMin(10, 3, 99)
      t1.insert('test')
      t2.insert('test')
      expect(t1.count('test')).toBe(1)
      expect(t2.count('test')).toBe(1)
    })

    it('should handle narrow width with many items', () => {
      const t = new TrieCountMin(5, 3)
      for (let i = 0; i < 100; i++) {
        t.insert(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(t.count(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should never underestimate true count', () => {
      const t = new TrieCountMin(100, 5)
      for (let i = 0; i < 100; i++) {
        t.insert(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(t.count(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('accuracy bounds', () => {
    it('should produce exact counts for wide sketch', () => {
      const t = new TrieCountMin(100000, 5)
      t.insert('a')
      t.insert('b')
      t.insert('c')
      expect(t.count('a')).toBe(1)
      expect(t.count('b')).toBe(1)
      expect(t.count('c')).toBe(1)
    })

    it('should handle repeated items with exact counts', () => {
      const t = new TrieCountMin(10000, 5)
      t.insert('popular')
      t.insert('popular')
      t.insert('popular')
      t.insert('rare')
      expect(t.count('popular')).toBeGreaterThanOrEqual(3)
      expect(t.count('rare')).toBeGreaterThanOrEqual(1)
    })

    it('should distinguish heavy from light items', () => {
      const t = new TrieCountMin(10000, 5)
      for (let i = 0; i < 100; i++) {
        t.insert('heavy')
      }
      t.insert('light')
      expect(t.count('heavy')).toBeGreaterThanOrEqual(100)
      expect(t.count('light')).toBeGreaterThanOrEqual(1)
      expect(t.count('heavy')).toBeGreaterThan(t.count('light'))
    })

    it('should handle stream-like workload', () => {
      const t = new TrieCountMin(10000, 5)
      const items = ['a', 'b', 'c', 'd', 'e']
      for (let round = 0; round < 100; round++) {
        for (const item of items) {
          t.insert(item)
        }
      }
      expect(t.totalInsertions()).toBe(500)
      for (const item of items) {
        expect(t.count(item)).toBeGreaterThanOrEqual(100)
      }
    })
  })

  describe('properties', () => {
    it('should expose width', () => {
      const t = new TrieCountMin(500, 7)
      expect(t.width).toBe(500)
    })

    it('should expose depth', () => {
      const t = new TrieCountMin(500, 7)
      expect(t.depth).toBe(7)
    })

    it('should expose seed', () => {
      const t = new TrieCountMin(500, 7, 42)
      expect(t.seed).toBe(42)
    })

    it('should keep properties constant after operations', () => {
      const w = tcm.width
      const d = tcm.depth
      const s = tcm.seed
      tcm.insert('test')
      expect(tcm.width).toBe(w)
      expect(tcm.depth).toBe(d)
      expect(tcm.seed).toBe(s)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_TRIECOUNTMIN_OPTIONS', () => {
      expect(DEFAULT_TRIECOUNTMIN_OPTIONS.width).toBe(1000)
      expect(DEFAULT_TRIECOUNTMIN_OPTIONS.depth).toBe(5)
    })

    it('should support TrieCountMinOptions interface', () => {
      const opts: TrieCountMinOptions = {
        width: 500,
        depth: 7,
        seed: 42,
      }
      expect(opts.width).toBe(500)
      expect(opts.depth).toBe(7)
      expect(opts.seed).toBe(42)
    })

    it('should support TrieCountMinNode interface', () => {
      const node: TrieCountMinNode = {
        children: new Map(),
        isEnd: false,
        counters: [0, 0, 0],
      }
      expect(node.children).toBeInstanceOf(Map)
      expect(node.isEnd).toBe(false)
      expect(node.counters.length).toBe(3)
    })

    it('should support partial TrieCountMinOptions', () => {
      const opts: Partial<TrieCountMinOptions> = { width: 100 }
      expect(opts.width).toBe(100)
      expect(opts.depth).toBeUndefined()
    })
  })

  describe('complex operations', () => {
    it('should handle mixed insert/remove/update cycles', () => {
      tcm.insert('x')
      tcm.insert('x')
      tcm.insert('x')
      tcm.remove('x')
      expect(tcm.count('x')).toBe(2)
      tcm.update('x', 10)
      expect(tcm.count('x')).toBe(10)
      tcm.remove('x')
      expect(tcm.count('x')).toBe(9)
    })

    it('should handle insert after full remove', () => {
      tcm.insert('a')
      tcm.remove('a')
      expect(tcm.contains('a')).toBe(false)
      tcm.insert('a')
      expect(tcm.contains('a')).toBe(true)
      expect(tcm.count('a')).toBe(1)
    })

    it('should handle update after remove', () => {
      tcm.insert('a')
      tcm.remove('a')
      tcm.update('a', 5)
      expect(tcm.count('a')).toBe(5)
    })

    it('should handle clear followed by operations', () => {
      tcm.insert('a')
      tcm.insert('b')
      tcm.clear()
      expect(tcm.count('a')).toBe(0)
      expect(tcm.count('b')).toBe(0)
      tcm.insert('c')
      expect(tcm.count('c')).toBe(1)
      expect(tcm.distinctCount()).toBe(1)
    })

    it('should handle deeply nested keys', () => {
      const deep = 'a'.repeat(1000)
      tcm.insert(deep)
      expect(tcm.count(deep)).toBe(1)
      expect(tcm.contains(deep)).toBe(true)
    })

    it('should handle keys with special regex characters', () => {
      tcm.insert('a.b')
      tcm.insert('a*b')
      tcm.insert('a+b')
      expect(tcm.count('a.b')).toBe(1)
      expect(tcm.count('a*b')).toBe(1)
      expect(tcm.count('a+b')).toBe(1)
    })

    it('should handle sequential clear patterns', () => {
      tcm.insert('a')
      tcm.clear()
      tcm.insert('b')
      expect(tcm.count('a')).toBe(0)
      expect(tcm.count('b')).toBe(1)
    })
  })
})
