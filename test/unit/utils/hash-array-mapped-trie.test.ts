import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie } from '../../../src/utils/hash-array-mapped-trie.js'

describe('HashArrayMappedTrie', () => {
  describe('empty', () => {
    it('creates an empty trie', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('set and get', () => {
    it('sets and gets a single entry', () => {
      const trie = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      expect(trie.get('a')).toBe(1)
      expect(trie.size).toBe(1)
      expect(trie.isEmpty).toBe(false)
    })

    it('returns undefined for missing key', () => {
      const trie = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      expect(trie.get('b')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(trie.get('a')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('set returns same instance on no-op overwrite', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const t2 = t1.set('a', 1)
      expect(t1).toBe(t2)
    })

    it('handles multiple entries', () => {
      let trie = HashArrayMappedTrie.empty<string, number>()
      for (let i = 0; i < 100; i++) {
        trie = trie.set(`key${i}`, i)
      }
      expect(trie.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(trie.get(`key${i}`)).toBe(i)
      }
    })

    it('handles numeric keys', () => {
      let trie = HashArrayMappedTrie.empty<number, string>()
      trie = trie.set(1, 'one').set(2, 'two').set(42, 'forty-two')
      expect(trie.get(1)).toBe('one')
      expect(trie.get(2)).toBe('two')
      expect(trie.get(42)).toBe('forty-two')
    })

    it('persists previous versions', () => {
      const t0 = HashArrayMappedTrie.empty<string, number>()
      const t1 = t0.set('a', 1)
      const t2 = t1.set('b', 2)
      expect(t0.size).toBe(0)
      expect(t0.get('a')).toBeUndefined()
      expect(t1.size).toBe(1)
      expect(t1.get('a')).toBe(1)
      expect(t1.get('b')).toBeUndefined()
      expect(t2.size).toBe(2)
      expect(t2.get('a')).toBe(1)
      expect(t2.get('b')).toBe(2)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const trie = HashArrayMappedTrie.empty<string, number>().set('x', 10)
      expect(trie.has('x')).toBe(true)
    })

    it('returns false for missing key', () => {
      const trie = HashArrayMappedTrie.empty<string, number>().set('x', 10)
      expect(trie.has('y')).toBe(false)
    })

    it('returns false for empty trie', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      expect(trie.has('anything')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a key', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(trie.get('a')).toBeUndefined()
      expect(trie.get('b')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('returns same instance for missing key', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const t2 = t1.delete('z')
      expect(t1).toBe(t2)
    })

    it('delete from single-element trie yields empty', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
        .set('only', 42)
        .delete('only')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('persists previous version after delete', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
      const t2 = t1.delete('a')
      expect(t1.get('a')).toBe(1)
      expect(t1.size).toBe(2)
      expect(t2.get('a')).toBeUndefined()
      expect(t2.get('b')).toBe(2)
    })

    it('handles delete and re-insert', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .delete('a')
        .set('a', 99)
      expect(trie.get('a')).toBe(99)
      expect(trie.size).toBe(1)
    })

    it('deletes many entries', () => {
      let trie = HashArrayMappedTrie.empty<string, number>()
      for (let i = 0; i < 50; i++) trie = trie.set(`k${i}`, i)
      for (let i = 0; i < 25; i++) trie = trie.delete(`k${i}`)
      expect(trie.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(trie.get(`k${i}`)).toBe(i)
      }
      for (let i = 0; i < 25; i++) {
        expect(trie.get(`k${i}`)).toBeUndefined()
      }
    })
  })

  describe('from / of', () => {
    it('creates from entries', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2], ['c', 3]])
      expect(trie.size).toBe(3)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
      expect(trie.get('c')).toBe(3)
    })

    it('creates from of()', () => {
      const trie = HashArrayMappedTrie.of(['x', 10], ['y', 20])
      expect(trie.size).toBe(2)
      expect(trie.get('x')).toBe(10)
      expect(trie.get('y')).toBe(20)
    })

    it('handles duplicate keys in from', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['a', 2]])
      expect(trie.size).toBe(1)
      expect(trie.get('a')).toBe(2)
    })
  })

  describe('iteration', () => {
    it('forEach visits all entries', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2], ['c', 3]])
      const collected: Array<[string, number]> = []
      trie.forEach((v, k) => collected.push([k, v]))
      expect(collected.length).toBe(3)
      expect(collected.sort()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('keys() returns all keys', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      const keys = trie.keys().sort()
      expect(keys).toEqual(['a', 'b'])
    })

    it('values() returns all values', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      const vals = trie.values().sort()
      expect(vals).toEqual([1, 2])
    })

    it('entries() returns all pairs', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      const entries = trie.entries().sort()
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })

    it('is iterable via Symbol.iterator', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      const collected = [...trie]
      expect(collected.length).toBe(2)
    })
  })

  describe('toMap', () => {
    it('converts to a Map', () => {
      const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      const map = trie.toMap()
      expect(map).toBeInstanceOf(Map)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('merge', () => {
    it('merges two tries', () => {
      const t1 = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      const t2 = HashArrayMappedTrie.from([['b', 20], ['c', 30]])
      const merged = t1.merge(t2)
      expect(merged.size).toBe(3)
      expect(merged.get('a')).toBe(1)
      expect(merged.get('b')).toBe(20)
      expect(merged.get('c')).toBe(30)
    })

    it('merge with empty trie returns same values', () => {
      const t1 = HashArrayMappedTrie.from([['a', 1]])
      const empty = HashArrayMappedTrie.empty<string, number>()
      const merged = t1.merge(empty)
      expect(merged.get('a')).toBe(1)
    })
  })

  describe('collision handling', () => {
    it('handles hash collisions correctly', () => {
      let trie = HashArrayMappedTrie.empty<string, number>()
      const keys = ['ab', 'ba', 'aab', 'aba', 'baa', 'aab2']
      keys.forEach((k, i) => { trie = trie.set(k, i) })
      keys.forEach((k, i) => {
        expect(trie.get(k)).toBe(i)
      })
      expect(trie.size).toBe(keys.length)
    })

    it('survives stress test with many keys', () => {
      let trie = HashArrayMappedTrie.empty<number, number>()
      const n = 500
      for (let i = 0; i < n; i++) trie = trie.set(i, i * 10)
      expect(trie.size).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(trie.get(i)).toBe(i * 10)
      }
      for (let i = 0; i < n; i += 2) trie = trie.delete(i)
      expect(trie.size).toBe(Math.floor(n / 2))
      for (let i = 1; i < n; i += 2) {
        expect(trie.get(i)).toBe(i * 10)
      }
    })
  })

  describe('persistence', () => {
    it('modifications do not affect previous versions', () => {
      const t0 = HashArrayMappedTrie.empty<string, number>()
      const t1 = t0.set('a', 1)
      const t2 = t1.set('b', 2)
      const t3 = t2.set('a', 99)
      const t4 = t3.delete('b')

      expect(t0.size).toBe(0)
      expect(t1.size).toBe(1)
      expect(t1.get('a')).toBe(1)
      expect(t2.size).toBe(2)
      expect(t2.get('a')).toBe(1)
      expect(t2.get('b')).toBe(2)
      expect(t3.size).toBe(2)
      expect(t3.get('a')).toBe(99)
      expect(t3.get('b')).toBe(2)
      expect(t4.size).toBe(1)
      expect(t4.get('a')).toBe(99)
      expect(t4.get('b')).toBeUndefined()
    })
  })
})
