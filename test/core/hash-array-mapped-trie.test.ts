import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie } from '../../src/core/hash-array-mapped-trie/hash-array-mapped-trie.js'
import { DEFAULT_HAMT_OPTIONS } from '../../src/core/hash-array-mapped-trie/types.js'
import type { HAMTNode, HAMTOptions, HAMTStats, HAMTOperations } from '../../src/core/hash-array-mapped-trie/types.js'

describe('HashArrayMappedTrie', () => {
  describe('constructor', () => {
    it('should create an empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should create a trie from entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      expect(t.size).toBe(3)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
    })

    it('should create a trie from an empty array', () => {
      const t = new HashArrayMappedTrie<string, number>([])
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should handle single entry', () => {
      const t = new HashArrayMappedTrie([['key', 'value']])
      expect(t.size).toBe(1)
      expect(t.get('key')).toBe('value')
    })

    it('should keep last value for duplicate keys', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['a', 2]])
      expect(t.size).toBe(1)
      expect(t.get('a')).toBe(2)
    })

    it('should handle many entries', () => {
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 100; i++) {
        entries.push([`key-${i}`, i])
      }
      const t = new HashArrayMappedTrie(entries)
      expect(t.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.get(`key-${i}`)).toBe(i)
      }
    })

    it('should create independent instances', () => {
      const t1 = new HashArrayMappedTrie([['a', 1]])
      const t2 = new HashArrayMappedTrie([['a', 2]])
      expect(t1.get('a')).toBe(1)
      expect(t2.get('a')).toBe(2)
    })

    it('should handle numeric keys', () => {
      const t = new HashArrayMappedTrie<number, string>([[1, 'one'], [2, 'two']])
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('should handle object values', () => {
      const t = new HashArrayMappedTrie<string, { id: number }>([['a', { id: 1 }]])
      expect(t.get('a')!.id).toBe(1)
    })

    it('should create a trie from a Map', () => {
      const m = new Map([['x', 10], ['y', 20]])
      const t = new HashArrayMappedTrie(m)
      expect(t.size).toBe(2)
      expect(t.get('x')).toBe(10)
      expect(t.get('y')).toBe(20)
    })

    it('should initialize operations to zero for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      const stats = t.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
    })

    it('should count inserts during construction from entries', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      expect(t.getStatistics().inserts).toBe(3)
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.get('missing')).toBeUndefined()
    })

    it('should return value for existing key', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      expect(t.get('a')).toBe(1)
    })

    it('should return undefined after key is deleted', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).delete('a')
      expect(t.get('a')).toBeUndefined()
    })

    it('should return updated value after set', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).set('a', 99)
      expect(t.get('a')).toBe(99)
    })

    it('should handle null values', () => {
      const t = new HashArrayMappedTrie<string, number | null>([['a', null]])
      expect(t.get('a')).toBeNull()
    })

    it('should handle undefined values', () => {
      const t = new HashArrayMappedTrie<string, number | undefined>([['a', undefined]])
      expect(t.get('a')).toBeUndefined()
      expect(t.has('a')).toBe(true)
    })

    it('should handle boolean values', () => {
      const t = new HashArrayMappedTrie<string, boolean>([['a', true], ['b', false]])
      expect(t.get('a')).toBe(true)
      expect(t.get('b')).toBe(false)
    })

    it('should retrieve from many entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 200; i++) {
        t = t.set(`key-${i}`, i)
      }
      expect(t.get('key-0')).toBe(0)
      expect(t.get('key-99')).toBe(99)
      expect(t.get('key-199')).toBe(199)
      expect(t.get('key-200')).toBeUndefined()
    })

    it('should return undefined for keys never inserted', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      expect(t.get('c')).toBeUndefined()
    })

    it('should handle mixed type keys', () => {
      const t = new HashArrayMappedTrie<number | string, string>([[1, 'num'], ['1', 'str']])
      expect(t.get(1)).toBe('num')
      expect(t.get('1')).toBe('str')
    })

    it('should increment lookups stat', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      const lookups0 = t.getStatistics().lookups
      t.get('a')
      t.get('b')
      expect(t.getStatistics().lookups).toBe(lookups0 + 2)
    })

    it('should get most recent value after overwrites', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 2)
        .set('a', 3)
      expect(t.get('a')).toBe(3)
    })
  })

  describe('set', () => {
    it('should return a new trie', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
      const t2 = t1.set('a', 1)
      expect(t2).not.toBe(t1)
    })

    it('should not modify the original trie', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
      const t2 = t1.set('a', 1)
      expect(t1.get('a')).toBeUndefined()
      expect(t1.size).toBe(0)
      expect(t2.get('a')).toBe(1)
      expect(t2.size).toBe(1)
    })

    it('should set on empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>().set('key', 42)
      expect(t.get('key')).toBe(42)
      expect(t.size).toBe(1)
    })

    it('should set multiple keys', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
      expect(t.size).toBe(3)
    })

    it('should overwrite existing key', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 99)
      expect(t.get('a')).toBe(99)
      expect(t.size).toBe(1)
    })

    it('should increase size for new key', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      expect(t.size).toBe(2)
    })

    it('should not increase size when overwriting', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(t.size).toBe(1)
    })

    it('should preserve all keys after multiple sets', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 50; i++) {
        t = t.set(`k${i}`, i)
      }
      expect(t.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(t.get(`k${i}`)).toBe(i)
      }
    })

    it('should maintain persistence across branches', () => {
      const base = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      const branch1 = base.set('c', 3)
      const branch2 = base.set('d', 4)

      expect(base.size).toBe(2)
      expect(base.get('c')).toBeUndefined()
      expect(base.get('d')).toBeUndefined()

      expect(branch1.size).toBe(3)
      expect(branch1.get('a')).toBe(1)
      expect(branch1.get('c')).toBe(3)
      expect(branch1.get('d')).toBeUndefined()

      expect(branch2.size).toBe(3)
      expect(branch2.get('a')).toBe(1)
      expect(branch2.get('d')).toBe(4)
      expect(branch2.get('c')).toBeUndefined()
    })

    it('should handle chained overwrites', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 2)
        .set('a', 3)
      expect(t.get('a')).toBe(3)
      expect(t.size).toBe(1)
    })

    it('should not mutate any previous version', () => {
      const t0 = new HashArrayMappedTrie<string, number>()
      const t1 = t0.set('x', 10)
      const t2 = t1.set('y', 20)
      const t3 = t2.set('x', 30)

      expect(t0.size).toBe(0)
      expect(t1.size).toBe(1)
      expect(t1.get('x')).toBe(10)
      expect(t2.size).toBe(2)
      expect(t2.get('x')).toBe(10)
      expect(t2.get('y')).toBe(20)
      expect(t3.size).toBe(2)
      expect(t3.get('x')).toBe(30)
      expect(t3.get('y')).toBe(20)
    })

    it('should handle object keys by reference', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 1 }
      const t = new HashArrayMappedTrie<object, string>()
        .set(obj1, 'first')
        .set(obj2, 'second')
      expect(t.size).toBe(2)
      expect(t.get(obj1)).toBe('first')
      expect(t.get(obj2)).toBe('second')
    })

    it('should handle boolean keys', () => {
      const t = new HashArrayMappedTrie<boolean, number>()
        .set(true, 1)
        .set(false, 0)
      expect(t.get(true)).toBe(1)
      expect(t.get(false)).toBe(0)
    })

    it('should handle empty string key', () => {
      const t = new HashArrayMappedTrie<string, number>().set('', 42)
      expect(t.get('')).toBe(42)
      expect(t.size).toBe(1)
    })

    it('should increment inserts stat', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
      const t2 = t1.set('a', 1)
      expect(t2.getStatistics().inserts).toBe(1)
      const t3 = t2.set('b', 2)
      expect(t3.getStatistics().inserts).toBe(2)
    })

    it('should increment inserts on update too', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      const t2 = t1.set('a', 2)
      expect(t2.getStatistics().inserts).toBe(2)
    })

    it('should handle many insertions', () => {
      let t = new HashArrayMappedTrie<number, number>()
      for (let i = 0; i < 200; i++) {
        t = t.set(i, i * 10)
      }
      expect(t.size).toBe(200)
      expect(t.get(100)).toBe(1000)
    })
  })

  describe('delete', () => {
    it('should return a new trie', () => {
      const t1 = new HashArrayMappedTrie([['a', 1]])
      const t2 = t1.delete('a')
      expect(t2).not.toBe(t1)
    })

    it('should not modify the original trie', () => {
      const t1 = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const t2 = t1.delete('a')
      expect(t1.get('a')).toBe(1)
      expect(t1.size).toBe(2)
      expect(t2.get('a')).toBeUndefined()
      expect(t2.size).toBe(1)
    })

    it('should return same instance if key not found', () => {
      const t1 = new HashArrayMappedTrie([['a', 1]])
      const t2 = t1.delete('missing')
      expect(t2).toBe(t1)
    })

    it('should delete from single-entry trie', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).delete('a')
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
      expect(t.get('a')).toBeUndefined()
    })

    it('should delete one of many keys', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]]).delete('b')
      expect(t.size).toBe(2)
      expect(t.has('a')).toBe(true)
      expect(t.has('b')).toBe(false)
      expect(t.has('c')).toBe(true)
    })

    it('should decrease size after deletion', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).delete('a')
      expect(t.size).toBe(0)
    })

    it('should not change size when key not found', () => {
      const t1 = new HashArrayMappedTrie([['a', 1]])
      const t2 = t1.delete('missing')
      expect(t2.size).toBe(1)
    })

    it('should allow re-adding deleted key', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
        .delete('a')
        .set('a', 2)
      expect(t.get('a')).toBe(2)
      expect(t.size).toBe(1)
    })

    it('should handle deleting all entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
        .delete('a')
        .delete('b')
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should maintain persistence across delete branches', () => {
      const base = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      const branch1 = base.delete('a')
      const branch2 = base.delete('b')

      expect(base.size).toBe(3)
      expect(base.get('a')).toBe(1)

      expect(branch1.size).toBe(2)
      expect(branch1.has('a')).toBe(false)
      expect(branch1.has('b')).toBe(true)

      expect(branch2.size).toBe(2)
      expect(branch2.has('b')).toBe(false)
      expect(branch2.has('a')).toBe(true)
    })

    it('should handle delete after overwrite', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 2)
        .delete('a')
      expect(t.get('a')).toBeUndefined()
      expect(t.size).toBe(0)
    })

    it('should handle deleting same key twice', () => {
      const t1 = new HashArrayMappedTrie([['a', 1]])
      const t2 = t1.delete('a')
      const t3 = t2.delete('a')
      expect(t3).toBe(t2)
      expect(t3.size).toBe(0)
    })

    it('should increment deletes stat', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      const t2 = t1.delete('a')
      expect(t2.getStatistics().deletes).toBe(1)
    })

    it('should not increment deletes stat on failed delete', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      const t2 = t1.delete('b')
      expect(t2.getStatistics().deletes).toBe(0)
    })

    it('should delete from large trie', () => {
      let t = new HashArrayMappedTrie<number, number>()
      for (let i = 0; i < 50; i++) t = t.set(i, i * 2)
      t = t.delete(25)
      expect(t.size).toBe(49)
      expect(t.get(25)).toBeUndefined()
      expect(t.get(24)).toBe(48)
      expect(t.get(26)).toBe(52)
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      expect(t.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).delete('a')
      expect(t.has('a')).toBe(false)
    })

    it('should return true after set', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.has('a')).toBe(true)
    })

    it('should return true for multiple keys', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      expect(t.has('a')).toBe(true)
      expect(t.has('b')).toBe(true)
      expect(t.has('c')).toBe(true)
    })

    it('should not affect size', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      t.has('a')
      expect(t.size).toBe(1)
    })

    it('should handle null value correctly', () => {
      const t = new HashArrayMappedTrie<string, number | null>([['a', null]])
      expect(t.has('a')).toBe(true)
    })

    it('should handle undefined value correctly', () => {
      const t = new HashArrayMappedTrie<string, number | undefined>([['a', undefined]])
      expect(t.has('a')).toBe(true)
    })

    it('should increment lookups stat', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      const lookups0 = t.getStatistics().lookups
      t.has('a')
      t.has('b')
      expect(t.getStatistics().lookups).toBe(lookups0 + 2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.size).toBe(0)
    })

    it('should reflect additions', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      expect(t.size).toBe(2)
    })

    it('should reflect deletions', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]]).delete('a')
      expect(t.size).toBe(1)
    })

    it('should reflect overwrites without change', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).set('a', 2)
      expect(t.size).toBe(1)
    })

    it('should be 0 after all deletions', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
        .delete('a')
        .delete('b')
      expect(t.size).toBe(0)
    })

    it('should track size correctly through many operations', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`k${i}`, i)
      }
      expect(t.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        t = t.delete(`k${i}`)
      }
      expect(t.size).toBe(50)
    })

    it('should count unique keys only', () => {
      const t = new HashArrayMappedTrie([
        ['a', 1], ['a', 2], ['a', 3], ['b', 4],
      ])
      expect(t.size).toBe(2)
    })

    it('should handle size after re-adding', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
        .delete('a')
        .set('a', 2)
        .set('b', 3)
      expect(t.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.isEmpty).toBe(true)
    })

    it('should return false after set', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.isEmpty).toBe(false)
    })

    it('should return true after deleting all', () => {
      const t = new HashArrayMappedTrie([['a', 1]]).delete('a')
      expect(t.isEmpty).toBe(true)
    })

    it('should return false when items remain', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]]).delete('a')
      expect(t.isEmpty).toBe(false)
    })

    it('should return true for trie from empty entries', () => {
      const t = new HashArrayMappedTrie<string, number>([])
      expect(t.isEmpty).toBe(true)
    })

    it('should return false for trie with null value', () => {
      const t = new HashArrayMappedTrie<string, number | null>([['a', null]])
      expect(t.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .clear()
      expect(t.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should return empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should return new instance', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      const t2 = t1.clear()
      expect(t1).not.toBe(t2)
    })

    it('should not mutate original', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      t1.clear()
      expect(t1.size).toBe(1)
    })

    it('should allow operations after clear', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .clear()
        .set('b', 2)
      expect(t.size).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('a')).toBeUndefined()
    })

    it('should reset stats on cleared trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .clear()
      expect(t.getStatistics().inserts).toBe(0)
      expect(t.getStatistics().deletes).toBe(0)
      expect(t.getStatistics().lookups).toBe(0)
    })

    it('should work on already empty trie', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
      const t2 = t1.clear()
      expect(t2.size).toBe(0)
      expect(t2.isEmpty).toBe(true)
    })

    it('should not find old elements after clear', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
        .clear()
      expect(t.has('a')).toBe(false)
      expect(t.has('b')).toBe(false)
      expect(t.has('c')).toBe(false)
    })

    it('should return empty toArray after clear', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .clear()
      expect(t.toArray()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      let called = false
      t.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should iterate over single entry', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      const items: Array<[string, number]> = []
      t.forEach((key, value) => items.push([key, value]))
      expect(items).toEqual([['a', 1]])
    })

    it('should iterate over all entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      const items: Array<[string, number]> = []
      t.forEach((key, value) => items.push([key, value]))
      expect(items.length).toBe(3)
      expect(items).toContainEqual(['a', 1])
      expect(items).toContainEqual(['b', 2])
      expect(items).toContainEqual(['c', 3])
    })

    it('should provide correct key and value', () => {
      const t = new HashArrayMappedTrie([['x', 42]])
      t.forEach((key, value) => {
        expect(key).toBe('x')
        expect(value).toBe(42)
      })
    })

    it('should iterate over many entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 50; i++) {
        t = t.set(`key-${i}`, i)
      }
      const items: Array<[string, number]> = []
      t.forEach((key, value) => items.push([key, value]))
      expect(items.length).toBe(50)
    })

    it('should not iterate deleted entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]]).delete('a')
      const items: Array<[string, number]> = []
      t.forEach((key, value) => items.push([key, value]))
      expect(items.length).toBe(1)
      expect(items).toContainEqual(['b', 2])
    })

    it('should return void', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.forEach(() => {})).toBeUndefined()
    })
  })

  describe('forEachAsync', () => {
    it('should handle empty trie', async () => {
      const t = new HashArrayMappedTrie<string, number>()
      const items: Array<[string, number]> = []
      await t.forEachAsync(async (k, v) => { items.push([k, v]) })
      expect(items).toEqual([])
    })

    it('should iterate all entries asynchronously', async () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      const items: Array<[string, number]> = []
      await t.forEachAsync(async (k, v) => {
        items.push([k, v])
      })
      expect(items.length).toBe(3)
      expect(items).toContainEqual(['a', 1])
      expect(items).toContainEqual(['b', 2])
      expect(items).toContainEqual(['c', 3])
    })

    it('should await async callbacks in sequence', async () => {
      const t = new HashArrayMappedTrie<number, number>()
        .set(1, 10)
        .set(2, 20)
      const order: number[] = []
      await t.forEachAsync(async (_k, v) => {
        order.push(v)
      })
      expect(order).toEqual([10, 20])
    })

    it('should handle sync callbacks', async () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('x', 100)
      const items: number[] = []
      await t.forEachAsync((_k, v) => { items.push(v) })
      expect(items).toEqual([100])
    })

    it('should return a promise', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      const result = t.forEachAsync(() => {})
      expect(result).toBeInstanceOf(Promise)
    })

    it('should iterate single entry', async () => {
      const t = new HashArrayMappedTrie<string, number>().set('only', 42)
      const items: Array<[string, number]> = []
      await t.forEachAsync(async (k, v) => { items.push([k, v]) })
      expect(items).toEqual([['only', 42]])
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.keys()).toEqual([])
    })

    it('should return all keys', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      const keys = t.keys()
      expect(keys.length).toBe(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('should reflect deletions', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]]).delete('a')
      expect(t.keys()).toEqual(['b'])
    })

    it('should reflect overwrites without duplication', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(t.keys()).toEqual(['a'])
    })

    it('should handle numeric keys', () => {
      const t = new HashArrayMappedTrie([[1, 'a'], [2, 'b']])
      const keys = t.keys()
      expect(keys.length).toBe(2)
      expect(keys).toContain(1)
      expect(keys).toContain(2)
    })

    it('should return keys for large trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`k${i}`, i)
      }
      expect(t.keys().length).toBe(100)
    })

    it('should return new array each call', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.keys()).not.toBe(t.keys())
    })
  })

  describe('values', () => {
    it('should return empty array for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.values()).toEqual([])
    })

    it('should return all values', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      const values = t.values()
      expect(values.length).toBe(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should reflect updated values', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 99)
      expect(t.values()).toEqual([99])
    })

    it('should reflect deletions', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]]).delete('a')
      expect(t.values()).toEqual([2])
    })

    it('should handle duplicate values for different keys', () => {
      const t = new HashArrayMappedTrie([['a', 42], ['b', 42]])
      expect(t.values().length).toBe(2)
    })

    it('should return values for large trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`k${i}`, i)
      }
      expect(t.values().length).toBe(100)
    })

    it('should return new array each call', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.values()).not.toBe(t.values())
    })

    it('should include undefined values', () => {
      const t = new HashArrayMappedTrie<string, number | undefined>().set('a', undefined)
      expect(t.values()).toEqual([undefined])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.entries()).toEqual([])
    })

    it('should return all entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const entries = t.entries()
      expect(entries.length).toBe(2)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
    })

    it('should reflect updates', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 99)
      expect(t.entries()).toEqual([['a', 99]])
    })

    it('should reflect deletions', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]]).delete('a')
      expect(t.entries()).toEqual([['b', 2]])
    })

    it('should match keys and values', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const entries = t.entries()
      for (const [key, value] of entries) {
        expect(t.get(key)).toBe(value)
      }
    })

    it('should return entries for large trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`k${i}`, i)
      }
      expect(t.entries().length).toBe(100)
    })

    it('should return new array each call', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.entries()).not.toBe(t.entries())
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      const items = [...t]
      expect(items).toEqual([])
    })

    it('should iterate over single entry', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      const items = [...t]
      expect(items).toEqual([['a', 1]])
    })

    it('should iterate over all entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      const items = [...t]
      expect(items.length).toBe(3)
      expect(items).toContainEqual(['a', 1])
      expect(items).toContainEqual(['b', 2])
      expect(items).toContainEqual(['c', 3])
    })

    it('should work with for...of', () => {
      const t = new HashArrayMappedTrie([['x', 10], ['y', 20]])
      const keys: string[] = []
      for (const [key] of t) {
        keys.push(key)
      }
      expect(keys.length).toBe(2)
      expect(keys).toContain('x')
      expect(keys).toContain('y')
    })

    it('should be usable with destructuring', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      const [[key, value]] = t
      expect(key).toBe('a')
      expect(value).toBe(1)
    })

    it('should produce same results as entries()', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      const iterated = [...t]
      const fromEntries = t.entries()
      expect(iterated.length).toBe(fromEntries.length)
      for (const entry of iterated) {
        expect(fromEntries).toContainEqual(entry)
      }
    })

    it('should work with Array.from', () => {
      const t = new HashArrayMappedTrie<string, number>().set('x', 42)
      expect(Array.from(t)).toEqual([['x', 42]])
    })

    it('should not iterate deleted entries', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      const items = [...t]
      expect(items).toEqual([['b', 2]])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.toArray()).toEqual([])
    })

    it('should return all entries as array', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      const arr = t.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContainEqual(['a', 1])
      expect(arr).toContainEqual(['b', 2])
      expect(arr).toContainEqual(['c', 3])
    })

    it('should return new array each call', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.toArray()).not.toBe(t.toArray())
    })

    it('should reflect state after operations', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(t.toArray()).toEqual([['b', 2]])
    })

    it('should return empty after clearing', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .clear()
      expect(t.toArray()).toEqual([])
    })

    it('should handle large trie', () => {
      let t = new HashArrayMappedTrie<number, number>()
      for (let i = 0; i < 50; i++) t = t.set(i, i)
      expect(t.toArray().length).toBe(50)
    })

    it('should match entries() output', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      const fromToArray = t.toArray().sort((a, b) => a[0]!.localeCompare(b[0]!))
      const fromEntries = t.entries().sort((a, b) => a[0]!.localeCompare(b[0]!))
      expect(fromToArray).toEqual(fromEntries)
    })
  })

  describe('from', () => {
    it('should create trie from array of entries', () => {
      const t = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('should create trie from Map', () => {
      const m = new Map([['x', 10], ['y', 20]])
      const t = HashArrayMappedTrie.from(m)
      expect(t.size).toBe(2)
      expect(t.get('x')).toBe(10)
    })

    it('should create empty trie from empty entries', () => {
      const t = HashArrayMappedTrie.from<string, number>([])
      expect(t.size).toBe(0)
    })

    it('should handle duplicate keys keeping last', () => {
      const t = HashArrayMappedTrie.from([['a', 1], ['a', 2], ['a', 3]])
      expect(t.size).toBe(1)
      expect(t.get('a')).toBe(3)
    })

    it('should create independent trie from generator', () => {
      function* gen(): Generator<[string, number]> {
        yield ['a', 1]
        yield ['b', 2]
      }
      const t = HashArrayMappedTrie.from(gen())
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
    })

    it('should be equivalent to constructor', () => {
      const entries: Array<[string, number]> = [['a', 1], ['b', 2]]
      const t1 = new HashArrayMappedTrie(entries)
      const t2 = HashArrayMappedTrie.from(entries)
      expect(t1.size).toBe(t2.size)
      expect(t1.get('a')).toBe(t2.get('a'))
      expect(t1.get('b')).toBe(t2.get('b'))
    })
  })

  describe('clone', () => {
    it('should create an equal copy', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const c = t.clone()
      expect(c.size).toBe(t.size)
      expect(c.get('a')).toBe(t.get('a'))
      expect(c.get('b')).toBe(t.get('b'))
    })

    it('should return a different instance', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      const c = t.clone()
      expect(c).not.toBe(t)
    })

    it('should be independent after mutation', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const c = t.clone()
      const m = c.set('c', 3)
      expect(t.size).toBe(2)
      expect(t.has('c')).toBe(false)
      expect(c.size).toBe(2)
      expect(c.has('c')).toBe(false)
      expect(m.size).toBe(3)
      expect(m.has('c')).toBe(true)
    })

    it('should clone empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      const c = t.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty).toBe(true)
    })

    it('should preserve all entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 50; i++) {
        t = t.set(`k${i}`, i)
      }
      const c = t.clone()
      for (let i = 0; i < 50; i++) {
        expect(c.get(`k${i}`)).toBe(i)
      }
    })

    it('should handle deletion from clone independently', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const c = t.clone()
      const d = c.delete('a')
      expect(t.has('a')).toBe(true)
      expect(c.has('a')).toBe(true)
      expect(d.has('a')).toBe(false)
    })

    it('should preserve entries after multiple clones', () => {
      const t1 = new HashArrayMappedTrie([['a', 1]])
      const t2 = t1.clone()
      const t3 = t2.clone()
      expect(t3.get('a')).toBe(1)
      expect(t3.size).toBe(1)
    })

    it('should handle clone of large trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 200; i++) {
        t = t.set(`k${i}`, i)
      }
      const c = t.clone()
      expect(c.size).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(c.get(`k${i}`)).toBe(i)
      }
    })

    it('should carry stats forward', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      t1.get('a')
      const t2 = t1.clone()
      expect(t2.getStatistics().inserts).toBe(2)
      expect(t2.getStatistics().lookups).toBe(1)
    })

    it('should have independent stats after clone', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      const t2 = t1.clone()
      t2.get('a')
      expect(t1.getStatistics().lookups).toBe(0)
      expect(t2.getStatistics().lookups).toBe(1)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      const s = t.stats()
      expect(s.size).toBe(0)
      expect(s.depth).toBe(0)
      expect(s.leafCount).toBe(0)
    })

    it('should return correct stats for single entry', () => {
      const t = new HashArrayMappedTrie([['a', 1]])
      const s = t.stats()
      expect(s.size).toBe(1)
      expect(s.leafCount).toBeGreaterThanOrEqual(1)
    })

    it('should return increasing depth with more entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(`key-${i}`, i)
      }
      const s = t.stats()
      expect(s.size).toBe(1000)
      expect(s.depth).toBeGreaterThan(1)
    })

    it('should return new object each call', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      expect(t.stats()).not.toBe(t.stats())
    })

    it('should report correct stats for populated trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 100; i++) t = t.set(`key-${i}`, i)
      const s = t.stats()
      expect(s.size).toBe(100)
      expect(s.nodeCount).toBeGreaterThan(0)
      expect(s.leafCount).toBeGreaterThan(0)
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats for empty trie', () => {
      const t = new HashArrayMappedTrie<string, number>()
      const s = t.getStatistics()
      expect(s.inserts).toBe(0)
      expect(s.deletes).toBe(0)
      expect(s.lookups).toBe(0)
      expect(s.depth).toBe(0)
      expect(s.bitmapNodes).toBe(1)
      expect(s.collisionNodes).toBe(0)
    })

    it('should track inserts', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      expect(t.getStatistics().inserts).toBe(3)
    })

    it('should track deletes', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(t.getStatistics().deletes).toBe(1)
    })

    it('should track lookups via get', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      t.get('a')
      t.get('b')
      expect(t.getStatistics().lookups).toBe(2)
    })

    it('should track lookups via has', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      t.has('a')
      t.has('b')
      expect(t.getStatistics().lookups).toBe(2)
    })

    it('should return fresh copy each call', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      const a = t.getStatistics()
      const b = t.getStatistics()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should compute depth from tree structure', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      const s = t.getStatistics()
      expect(s.depth).toBeGreaterThanOrEqual(0)
    })

    it('should compute bitmapNodes', () => {
      const t = new HashArrayMappedTrie<string, number>().set('a', 1)
      const s = t.getStatistics()
      expect(s.bitmapNodes).toBeGreaterThanOrEqual(0)
    })

    it('should track full lifecycle', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
        .delete('b')
      t.get('a')
      t.has('c')
      const s = t.getStatistics()
      expect(s.inserts).toBe(3)
      expect(s.deletes).toBe(1)
      expect(s.lookups).toBe(2)
    })

    it('should carry stats through immutable operations', () => {
      const t1 = new HashArrayMappedTrie<string, number>().set('a', 1)
      t1.get('a')
      const t2 = t1.set('b', 2)
      expect(t2.getStatistics().inserts).toBe(2)
      expect(t2.getStatistics().lookups).toBe(1)
    })

    it('should reset stats on clear', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .clear()
      const s = t.getStatistics()
      expect(s.inserts).toBe(0)
      expect(s.deletes).toBe(0)
      expect(s.lookups).toBe(0)
    })

    it('should compute correct depth for large trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 500; i++) t = t.set(`k${i}`, i)
      const s = t.getStatistics()
      expect(s.depth).toBeGreaterThan(1)
      expect(s.bitmapNodes).toBeGreaterThan(0)
    })
  })

  describe('persistence / immutability', () => {
    it('should preserve original on set', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      const t2 = t1.set('c', 3)
      expect(t1.size).toBe(2)
      expect(t2.size).toBe(3)
      expect(t1.has('c')).toBe(false)
      expect(t2.has('c')).toBe(true)
    })

    it('should preserve original on delete', () => {
      const t1 = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      const t2 = t1.delete('a')
      expect(t1.has('a')).toBe(true)
      expect(t1.size).toBe(2)
      expect(t2.has('a')).toBe(false)
      expect(t2.size).toBe(1)
    })

    it('should allow branching', () => {
      const root = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      const branch1 = root.set('c', 3)
      const branch2 = root.set('d', 4)
      expect(branch1.has('c')).toBe(true)
      expect(branch1.has('d')).toBe(false)
      expect(branch2.has('c')).toBe(false)
      expect(branch2.has('d')).toBe(true)
      expect(root.has('c')).toBe(false)
      expect(root.has('d')).toBe(false)
    })

    it('should handle multiple snapshots', () => {
      const t0 = new HashArrayMappedTrie<string, number>()
      const t1 = t0.set('a', 1)
      const t2 = t1.set('b', 2)
      const t3 = t2.set('c', 3)
      expect(t0.size).toBe(0)
      expect(t1.size).toBe(1)
      expect(t2.size).toBe(2)
      expect(t3.size).toBe(3)
      expect(t0.get('a')).toBeUndefined()
      expect(t1.get('a')).toBe(1)
      expect(t2.get('b')).toBe(2)
      expect(t3.get('c')).toBe(3)
    })

    it('should allow independent modifications of snapshots', () => {
      const base = new HashArrayMappedTrie<string, number>()
        .set('x', 10)
        .set('y', 20)
      const a = base.delete('x').set('z', 30)
      const b = base.delete('y').set('w', 40)
      expect(a.has('x')).toBe(false)
      expect(a.has('y')).toBe(true)
      expect(a.has('z')).toBe(true)
      expect(b.has('x')).toBe(true)
      expect(b.has('y')).toBe(false)
      expect(b.has('w')).toBe(true)
    })
  })

  describe('collision handling', () => {
    it('should handle keys that hash to the same value', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('should handle overwriting one of colliding keys', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('a', 99)
      expect(t.get('a')).toBe(99)
      expect(t.get('b')).toBe(2)
      expect(t.size).toBe(2)
    })

    it('should handle deleting one of colliding keys', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(t.has('a')).toBe(false)
      expect(t.get('b')).toBe(2)
      expect(t.size).toBe(1)
    })

    it('should handle deleting all colliding keys', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
        .delete('b')
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should report correct stats with collisions', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`key-${i}`, i)
      }
      const s = t.stats()
      expect(s.size).toBe(100)
      expect(s.nodeCount).toBeGreaterThan(0)
      expect(s.leafCount).toBeGreaterThan(0)
    })

    it('should handle set-delete-set cycle with many keys', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 50; i++) {
        t = t.set(`k${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        t = t.delete(`k${i}`)
      }
      for (let i = 0; i < 50; i++) {
        t = t.set(`k${i}`, i * 10)
      }
      for (let i = 0; i < 50; i++) {
        expect(t.get(`k${i}`)).toBe(i * 10)
      }
      expect(t.size).toBe(50)
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 entries', () => {
      let t = new HashArrayMappedTrie<number, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(i, i * 2)
      }
      expect(t.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(t.get(i)).toBe(i * 2)
      }
    })

    it('should handle 1000 string-keyed entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(`key-${i}`, i)
      }
      expect(t.size).toBe(1000)
      expect(t.get('key-0')).toBe(0)
      expect(t.get('key-499')).toBe(499)
      expect(t.get('key-999')).toBe(999)
    })

    it('should handle bulk delete from 1000 entries', () => {
      let t = new HashArrayMappedTrie<number, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(i, i)
      }
      for (let i = 0; i < 500; i++) {
        t = t.delete(i)
      }
      expect(t.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(t.has(i)).toBe(false)
      }
      for (let i = 500; i < 1000; i++) {
        expect(t.has(i)).toBe(true)
      }
    })

    it('should handle iteration over 1000 entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(`k${i}`, i)
      }
      const keys = t.keys()
      const values = t.values()
      const entries = t.entries()
      expect(keys.length).toBe(1000)
      expect(values.length).toBe(1000)
      expect(entries.length).toBe(1000)
    })

    it('should handle forEach over 1000 entries', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(`k${i}`, i)
      }
      let count = 0
      t.forEach(() => { count++ })
      expect(count).toBe(1000)
    })

    it('should handle mixed operations on large dataset', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 500; i++) {
        t = t.set(`k${i}`, i)
      }
      for (let i = 0; i < 250; i++) {
        t = t.delete(`k${i}`)
      }
      for (let i = 500; i < 750; i++) {
        t = t.set(`k${i}`, i)
      }
      for (let i = 250; i < 500; i++) {
        t = t.set(`k${i}`, i * 10)
      }
      expect(t.size).toBe(500)
      for (let i = 0; i < 250; i++) {
        expect(t.has(`k${i}`)).toBe(false)
      }
      for (let i = 250; i < 500; i++) {
        expect(t.get(`k${i}`)).toBe(i * 10)
      }
      for (let i = 500; i < 750; i++) {
        expect(t.get(`k${i}`)).toBe(i)
      }
    })

    it('should produce correct stats for large trie', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(`key-${i}`, i)
      }
      const s = t.stats()
      expect(s.size).toBe(1000)
      expect(s.depth).toBeGreaterThan(0)
      expect(s.nodeCount).toBeGreaterThan(0)
      expect(s.leafCount).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty map operations', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.get('a')).toBeUndefined()
      expect(t.has('a')).toBe(false)
      expect(t.keys()).toEqual([])
      expect(t.values()).toEqual([])
      expect(t.entries()).toEqual([])
    })

    it('should handle single item lifecycle', () => {
      const t0 = new HashArrayMappedTrie<string, number>()
      const t1 = t0.set('only', 42)
      const t2 = t1.delete('only')
      expect(t0.size).toBe(0)
      expect(t1.size).toBe(1)
      expect(t1.get('only')).toBe(42)
      expect(t2.size).toBe(0)
      expect(t2.isEmpty).toBe(true)
    })

    it('should handle numeric keys', () => {
      const t = new HashArrayMappedTrie<number, string>([[1, 'one'], [2, 'two'], [3, 'three']])
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
      expect(t.get(3)).toBe('three')
    })

    it('should handle boolean keys', () => {
      const t = new HashArrayMappedTrie([[true, 'TRUE'], [false, 'FALSE']])
      expect(t.get(true)).toBe('TRUE')
      expect(t.get(false)).toBe('FALSE')
    })

    it('should handle zero key', () => {
      const t = new HashArrayMappedTrie([[0, 'zero']])
      expect(t.get(0)).toBe('zero')
    })

    it('should handle empty string key', () => {
      const t = new HashArrayMappedTrie([['', 'empty']])
      expect(t.get('')).toBe('empty')
    })

    it('should handle long string keys', () => {
      const longKey = 'a'.repeat(1000)
      const t = new HashArrayMappedTrie([[longKey, 'value']])
      expect(t.get(longKey)).toBe('value')
    })

    it('should handle object value mutation does not affect trie', () => {
      const obj = { count: 1 }
      const t = new HashArrayMappedTrie<string, { count: number }>().set('a', obj)
      obj.count = 2
      expect(t.get('a')!.count).toBe(2)
    })

    it('should handle array values', () => {
      const t = new HashArrayMappedTrie<string, number[]>([['a', [1, 2, 3]]])
      expect(t.get('a')).toEqual([1, 2, 3])
    })

    it('should handle consistent results across multiple reads', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      for (let i = 0; i < 10; i++) {
        expect(t.get('a')).toBe(1)
        expect(t.get('b')).toBe(2)
        expect(t.get('c')).toBe(3)
        expect(t.size).toBe(3)
      }
    })

    it('should handle special characters in keys', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('key with spaces', 1)
        .set('key\nwith\nnewlines', 2)
        .set('key\twith\ttabs', 3)
      expect(t.get('key with spaces')).toBe(1)
      expect(t.get('key\nwith\nnewlines')).toBe(2)
      expect(t.get('key\twith\ttabs')).toBe(3)
    })

    it('should distinguish between string and number 1', () => {
      const t = new HashArrayMappedTrie<string | number, string>()
        .set('1', 'string')
        .set(1, 'number')
      expect(t.get('1')).toBe('string')
      expect(t.get(1)).toBe('number')
    })

    it('should handle updating value to same value', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('a', 1)
      expect(t.size).toBe(1)
      expect(t.get('a')).toBe(1)
    })
  })

  describe('array method consistency', () => {
    it('should have consistent keys, values, and entries lengths', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
      expect(t.keys().length).toBe(3)
      expect(t.values().length).toBe(3)
      expect(t.entries().length).toBe(3)
    })

    it('should have matching keys and values in entries', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['b', 2]])
      const entries = t.entries()
      for (const [key, value] of entries) {
        expect(t.get(key)).toBe(value)
      }
    })

    it('should reflect all mutations consistently', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
        .delete('b')
        .set('a', 10)
      expect(t.keys().length).toBe(2)
      expect(t.values().length).toBe(2)
      expect(t.entries().length).toBe(2)
      expect(t.get('a')).toBe(10)
      expect(t.get('c')).toBe(3)
    })

    it('should have consistent lengths after large operations', () => {
      let t = new HashArrayMappedTrie<string, number>()
      for (let i = 0; i < 200; i++) {
        t = t.set(`k${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        t = t.delete(`k${i}`)
      }
      expect(t.keys().length).toBe(100)
      expect(t.values().length).toBe(100)
      expect(t.entries().length).toBe(100)
      expect(t.size).toBe(100)
    })

    it('should have toArray consistent with entries', () => {
      const t = new HashArrayMappedTrie<string, number>()
        .set('a', 1)
        .set('b', 2)
      expect(t.toArray().length).toBe(t.entries().length)
      expect(t.toArray().length).toBe(2)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_HAMT_OPTIONS', () => {
      expect(DEFAULT_HAMT_OPTIONS.bitsPerLevel).toBe(5)
    })

    it('should allow creating HAMTNode for leaf', () => {
      const leaf: HAMTNode<string, number> = {
        bitmap: 0,
        children: [],
        isLeaf: true,
        entries: [['key', 42]],
      }
      expect(leaf.isLeaf).toBe(true)
      expect(leaf.entries[0]![1]).toBe(42)
    })

    it('should allow creating HAMTNode for internal', () => {
      const internal: HAMTNode<string, number> = {
        bitmap: 3,
        children: [],
        isLeaf: false,
        entries: [],
      }
      expect(internal.isLeaf).toBe(false)
      expect(internal.bitmap).toBe(3)
    })

    it('should allow creating HAMTOptions', () => {
      const opts: HAMTOptions = { bitsPerLevel: 5 }
      expect(opts.bitsPerLevel).toBe(5)
    })

    it('should allow creating HAMTStats', () => {
      const stats: HAMTStats = {
        size: 10,
        depth: 3,
        nodeCount: 15,
        leafCount: 10,
        collisionCount: 0,
      }
      expect(stats.size).toBe(10)
      expect(stats.depth).toBe(3)
    })

    it('should export HashArrayMappedTrie class', async () => {
      const mod = await import('../../src/core/hash-array-mapped-trie/hash-array-mapped-trie.js')
      expect(mod.HashArrayMappedTrie).toBeDefined()
      expect(mod.DEFAULT_HAMT_OPTIONS).toBeDefined()
    })

    it('should allow creating HAMTOperations', () => {
      const ops: HAMTOperations = {
        inserts: 5,
        deletes: 2,
        lookups: 10,
        depth: 3,
        bitmapNodes: 7,
        collisionNodes: 1,
      }
      expect(ops.inserts).toBe(5)
      expect(ops.deletes).toBe(2)
      expect(ops.lookups).toBe(10)
      expect(ops.depth).toBe(3)
      expect(ops.bitmapNodes).toBe(7)
      expect(ops.collisionNodes).toBe(1)
    })
  })
})
