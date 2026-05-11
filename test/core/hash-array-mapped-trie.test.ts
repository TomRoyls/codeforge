import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie } from '../../src/core/hash-array-mapped-trie/index.js'

describe('HashArrayMappedTrie', () => {
  describe('constructor', () => {
    it('creates an empty trie with no arguments', () => {
      const t = new HashArrayMappedTrie<string, number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates a trie from entries', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      expect(t.size).toBe(3)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
    })

    it('creates a trie from an empty array', () => {
      const t = new HashArrayMappedTrie<string, number>([])
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('handles single entry', () => {
      const t = new HashArrayMappedTrie([['key', 'value']])
      expect(t.size).toBe(1)
      expect(t.get('key')).toBe('value')
    })

    it('keeps last value for duplicate keys', () => {
      const t = new HashArrayMappedTrie([['a', 1], ['a', 2]])
      expect(t.size).toBe(1)
      expect(t.get('a')).toBe(2)
    })

    it('handles many entries', () => {
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

    it('handles numeric keys', () => {
      const t = new HashArrayMappedTrie<number, string>([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(t.get(1)).toBe('a')
      expect(t.get(2)).toBe('b')
      expect(t.get(3)).toBe('c')
    })

    it('handles boolean keys', () => {
      const t = new HashArrayMappedTrie<boolean, string>([[true, 'yes'], [false, 'no']])
      expect(t.get(true)).toBe('yes')
      expect(t.get(false)).toBe('no')
    })

    it('handles null and undefined keys', () => {
      const t = new HashArrayMappedTrie<null | undefined, string>([[null, 'null'], [undefined, 'undef']])
      expect(t.get(null)).toBe('null')
      expect(t.get(undefined)).toBe('undef')
    })

    it('handles empty string key', () => {
      const t = new HashArrayMappedTrie<string, number>([['', 99]])
      expect(t.get('')).toBe(99)
    })
  })

  describe('static empty', () => {
    it('creates an empty trie', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('can be used as starting point for set', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('x', 42)
      expect(t.get('x')).toBe(42)
      expect(t.size).toBe(1)
    })
  })

  describe('static from', () => {
    it('creates a trie from entries', () => {
      const t = HashArrayMappedTrie.from<number, string>([[1, 'one'], [2, 'two']])
      expect(t.size).toBe(2)
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('creates an empty trie from empty array', () => {
      const t = HashArrayMappedTrie.from<number, string>([])
      expect(t.size).toBe(0)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('key', 123)
      expect(t.get('key')).toBe(123)
    })

    it('returns undefined for missing key', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      expect(t.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('key', 1)
        .set('key', 2)
      expect(t.get('key')).toBe(2)
      expect(t.size).toBe(1)
    })

    it('handles multiple keys', () => {
      let t = HashArrayMappedTrie.empty<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`key${i}`, i)
      }
      expect(t.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('handles object identity keys', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const t = HashArrayMappedTrie.empty<object, number>()
        .set(obj1, 10)
        .set(obj2, 20)
      expect(t.get(obj1)).toBe(10)
      expect(t.get(obj2)).toBe(20)
    })

    it('set returns new trie (immutability)', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>()
      const t2 = t1.set('a', 1)
      expect(t1.get('a')).toBeUndefined()
      expect(t2.get('a')).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      expect(t.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      expect(t.has('a')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .delete('a')
      expect(t.has('a')).toBe(false)
    })

    it('returns true for overwritten key', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(t.has('a')).toBe(true)
    })

    it('works with many keys', () => {
      let t = HashArrayMappedTrie.empty<number, string>()
      for (let i = 0; i < 50; i++) {
        t = t.set(i, `val${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(t.has(i)).toBe(true)
      }
      expect(t.has(50)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes an existing key', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .delete('a')
      expect(t.get('a')).toBeUndefined()
      expect(t.size).toBe(0)
    })

    it('returns same trie when deleting non-existent key', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const t2 = t1.delete('b')
      expect(t2).toBe(t1)
    })

    it('deletes from multi-key trie', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
        .delete('b')
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBeUndefined()
      expect(t.get('c')).toBe(3)
      expect(t.size).toBe(2)
    })

    it('does not modify original trie (immutability)', () => {
      const t1 = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const t2 = t1.delete('a')
      expect(t1.get('a')).toBe(1)
      expect(t1.size).toBe(2)
      expect(t2.get('a')).toBeUndefined()
      expect(t2.size).toBe(1)
    })

    it('handles delete then re-add', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .delete('a')
        .set('a', 2)
      expect(t.get('a')).toBe(2)
      expect(t.size).toBe(1)
    })

    it('handles deleting all keys', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
        .delete('a')
        .delete('b')
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('deletes many keys sequentially', () => {
      let t: HashArrayMappedTrie<number, number> = HashArrayMappedTrie.empty()
      for (let i = 0; i < 50; i++) {
        t = t.set(i, i * 10)
      }
      expect(t.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        t = t.delete(i)
      }
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('deletes every other key', () => {
      let t: HashArrayMappedTrie<number, number> = HashArrayMappedTrie.empty()
      for (let i = 0; i < 20; i++) {
        t = t.set(i, i)
      }
      for (let i = 0; i < 20; i += 2) {
        t = t.delete(i)
      }
      expect(t.size).toBe(10)
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          expect(t.has(i)).toBe(false)
        } else {
          expect(t.has(i)).toBe(true)
        }
      }
    })

    it('deleting from empty trie returns same trie', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      const t2 = t.delete('a')
      expect(t2).toBe(t)
    })
  })

  describe('size and isEmpty', () => {
    it('empty trie has size 0', () => {
      expect(HashArrayMappedTrie.empty().size).toBe(0)
    })

    it('isEmpty returns true for empty trie', () => {
      expect(HashArrayMappedTrie.empty().isEmpty()).toBe(true)
    })

    it('size increases with set', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      expect(t.size).toBe(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('size does not increase on overwrite', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(t.size).toBe(1)
    })

    it('size decreases with delete', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(t.size).toBe(1)
    })

    it('size tracks large number of entries', () => {
      let t = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(i, i)
      }
      expect(t.size).toBe(1000)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie.empty().keys()).toEqual([])
    })

    it('returns all keys', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const keys = t.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
      expect(keys.length).toBe(3)
    })

    it('returns correct keys after delete', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
        .delete('b')
      const keys = t.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('c')
      expect(keys).not.toContain('b')
    })
  })

  describe('values', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie.empty().values()).toEqual([])
    })

    it('returns all values', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const values = t.values()
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
      expect(values.length).toBe(3)
    })

    it('returns updated values after overwrite', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('a', 99)
      const values = t.values()
      expect(values).toEqual([99])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie.empty().entries()).toEqual([])
    })

    it('returns all entries', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const entries = t.entries()
      expect(entries.length).toBe(2)
      const map = new Map(entries)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty trie', () => {
      let count = 0
      HashArrayMappedTrie.empty<string, number>().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each entry with value and key', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const seen: Array<[string, number]> = []
      t.forEach((v, k) => seen.push([k, v]))
      expect(seen.length).toBe(3)
      const map = new Map(seen)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('provides correct argument order (value, key)', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('x', 42)
      let receivedKey: string | undefined
      let receivedValue: number | undefined
      t.forEach((v, k) => {
        receivedKey = k
        receivedValue = v
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })

    it('provides trie as third argument', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      let receivedTrie: HashArrayMappedTrie<string, number> | undefined
      t.forEach((_v, _k, trie) => {
        receivedTrie = trie
      })
      expect(receivedTrie).toBe(t)
    })
  })

  describe('Symbol.iterator', () => {
    it('yields nothing for empty trie', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      const result = [...t]
      expect(result).toEqual([])
    })

    it('yields all entries', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const result = [...t]
      expect(result.length).toBe(2)
      const map = new Map(result)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('works with for...of', () => {
      const t = new HashArrayMappedTrie<number, string>([[1, 'one'], [2, 'two']])
      const entries: Array<[number, string]> = []
      for (const entry of t) {
        entries.push(entry)
      }
      expect(entries.length).toBe(2)
    })

    it('works with destructuring spread', () => {
      const t = new HashArrayMappedTrie<string, number>([['x', 10]])
      const [[key, value]] = [...t]
      expect(key).toBe('x')
      expect(value).toBe(10)
    })
  })

  describe('map', () => {
    it('maps values', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const mapped = t.map(v => v * 10)
      expect(mapped.get('a')).toBe(10)
      expect(mapped.get('b')).toBe(20)
      expect(mapped.get('c')).toBe(30)
    })

    it('maps to different type', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const mapped = t.map(v => `val:${v}`)
      expect(mapped.get('a')).toBe('val:1')
      expect(mapped.get('b')).toBe('val:2')
    })

    it('provides key to map function', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1]])
      const mapped = t.map((_v, k) => k.toUpperCase())
      expect(mapped.get('a')).toBe('A')
    })

    it('returns empty trie for empty input', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      const mapped = t.map(v => v * 2)
      expect(mapped.size).toBe(0)
    })

    it('does not modify original', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1]])
      t.map(v => v * 2)
      expect(t.get('a')).toBe(1)
    })

    it('preserves size', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const mapped = t.map(v => v + 1)
      expect(mapped.size).toBe(3)
    })
  })

  describe('filter', () => {
    it('filters entries by value', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3], ['d', 4]])
      const filtered = t.filter(v => v % 2 === 0)
      expect(filtered.size).toBe(2)
      expect(filtered.has('b')).toBe(true)
      expect(filtered.has('d')).toBe(true)
      expect(filtered.has('a')).toBe(false)
    })

    it('filters entries by key', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const filtered = t.filter((_v, k) => k !== 'b')
      expect(filtered.size).toBe(2)
      expect(filtered.has('a')).toBe(true)
      expect(filtered.has('c')).toBe(true)
      expect(filtered.has('b')).toBe(false)
    })

    it('returns empty trie when all filtered out', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const filtered = t.filter(() => false)
      expect(filtered.size).toBe(0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('returns all entries when all pass', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const filtered = t.filter(() => true)
      expect(filtered.size).toBe(2)
    })

    it('returns empty for empty trie', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      const filtered = t.filter(() => true)
      expect(filtered.size).toBe(0)
    })

    it('does not modify original', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      t.filter(v => v > 1)
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
    })
  })

  describe('merge', () => {
    it('merges two tries', () => {
      const t1 = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const t2 = new HashArrayMappedTrie<string, number>([['c', 3], ['d', 4]])
      const merged = t1.merge(t2)
      expect(merged.size).toBe(4)
      expect(merged.get('a')).toBe(1)
      expect(merged.get('c')).toBe(3)
    })

    it('other overwrites on conflict', () => {
      const t1 = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const t2 = new HashArrayMappedTrie<string, number>([['b', 20], ['c', 3]])
      const merged = t1.merge(t2)
      expect(merged.get('b')).toBe(20)
      expect(merged.size).toBe(3)
    })

    it('merging with empty trie returns copy', () => {
      const t1 = new HashArrayMappedTrie<string, number>([['a', 1]])
      const t2 = HashArrayMappedTrie.empty<string, number>()
      const merged = t1.merge(t2)
      expect(merged.size).toBe(1)
      expect(merged.get('a')).toBe(1)
    })

    it('merging into empty trie', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>()
      const t2 = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const merged = t1.merge(t2)
      expect(merged.size).toBe(2)
    })

    it('does not modify original tries', () => {
      const t1 = new HashArrayMappedTrie<string, number>([['a', 1]])
      const t2 = new HashArrayMappedTrie<string, number>([['b', 2]])
      t1.merge(t2)
      expect(t1.size).toBe(1)
      expect(t1.has('b')).toBe(false)
      expect(t2.size).toBe(1)
      expect(t2.has('a')).toBe(false)
    })

    it('merges large tries', () => {
      let t1 = HashArrayMappedTrie.empty<number, number>()
      let t2 = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 50; i++) t1 = t1.set(i, i)
      for (let i = 50; i < 100; i++) t2 = t2.set(i, i)
      const merged = t1.merge(t2)
      expect(merged.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(merged.get(i)).toBe(i)
      }
    })
  })

  describe('clone', () => {
    it('clones a trie', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const c = t.clone()
      expect(c.size).toBe(t.size)
      expect(c.get('a')).toBe(1)
      expect(c.get('b')).toBe(2)
    })

    it('clone is independent', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const c = t.clone()
      const c2 = c.delete('a')
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(c.size).toBe(2)
      expect(c.get('a')).toBe(1)
      expect(c2.size).toBe(1)
    })

    it('clones empty trie', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
      const c = t.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('persistence (immutability)', () => {
    it('set does not modify original', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const t2 = t1.set('b', 2)
      expect(t1.size).toBe(1)
      expect(t1.has('b')).toBe(false)
      expect(t2.size).toBe(2)
      expect(t2.get('a')).toBe(1)
      expect(t2.get('b')).toBe(2)
    })

    it('overwrite does not modify original', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const t2 = t1.set('a', 99)
      expect(t1.get('a')).toBe(1)
      expect(t2.get('a')).toBe(99)
    })

    it('delete does not modify original', () => {
      const t1 = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const t2 = t1.delete('a')
      expect(t1.get('a')).toBe(1)
      expect(t1.size).toBe(2)
      expect(t2.get('a')).toBeUndefined()
      expect(t2.size).toBe(1)
    })

    it('chain of modifications are independent', () => {
      const t0 = HashArrayMappedTrie.empty<string, number>()
      const t1 = t0.set('a', 1)
      const t2 = t1.set('b', 2)
      const t3 = t2.set('c', 3)
      expect(t0.size).toBe(0)
      expect(t1.size).toBe(1)
      expect(t2.size).toBe(2)
      expect(t3.size).toBe(3)
      expect(t1.get('b')).toBeUndefined()
      expect(t2.get('c')).toBeUndefined()
    })

    it('branching modifications', () => {
      const base = new HashArrayMappedTrie<string, number>([['x', 1], ['y', 2]])
      const branch1 = base.set('a', 10)
      const branch2 = base.set('b', 20)
      expect(base.size).toBe(2)
      expect(branch1.size).toBe(3)
      expect(branch2.size).toBe(3)
      expect(branch1.has('b')).toBe(false)
      expect(branch2.has('a')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie.empty().toArray()).toEqual([])
    })

    it('returns all entries as array', () => {
      const t = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
      const arr = t.toArray()
      expect(arr.length).toBe(2)
      const map = new Map(arr)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('custom hash function', () => {
    it('uses custom hash function', () => {
      let callCount = 0
      const customHash = (key: unknown) => {
        callCount++
        return typeof key === 'string' ? key.length : 0
      }
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: customHash })
      const t2 = t.set('abc', 1).set('de', 2).set('fghij', 3)
      expect(t2.get('abc')).toBe(1)
      expect(t2.get('de')).toBe(2)
      expect(t2.get('fghij')).toBe(3)
      expect(callCount).toBeGreaterThan(0)
    })

    it('custom hash can create collisions', () => {
      const badHash = (_key: unknown) => 42
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: badHash })
      const t2 = t.set('a', 1).set('b', 2).set('c', 3)
      expect(t2.get('a')).toBe(1)
      expect(t2.get('b')).toBe(2)
      expect(t2.get('c')).toBe(3)
      expect(t2.size).toBe(3)
    })

    it('custom hash with static empty', () => {
      const customHash = (key: unknown) => String(key).length
      const t = HashArrayMappedTrie.empty<string, number>({ hash: customHash })
      const t2 = t.set('hello', 5).set('world', 5)
      expect(t2.size).toBe(2)
      expect(t2.get('hello')).toBe(5)
    })
  })

  describe('collision handling', () => {
    it('handles keys that hash to same value', () => {
      const badHash = () => 0
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: badHash })
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
      expect(t.size).toBe(3)
    })

    it('handles collision node delete', () => {
      const badHash = () => 0
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: badHash })
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
        .delete('b')
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBeUndefined()
      expect(t.get('c')).toBe(3)
    })

    it('handles deleting all but one from collision', () => {
      const badHash = () => 0
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: badHash })
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(t.size).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('handles updating value in collision node', () => {
      const badHash = () => 0
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: badHash })
        .set('a', 1)
        .set('b', 2)
        .set('a', 99)
      expect(t.get('a')).toBe(99)
      expect(t.get('b')).toBe(2)
      expect(t.size).toBe(2)
    })

    it('collision node with 4+ entries', () => {
      const badHash = () => 42
      let t = HashArrayMappedTrie.empty<string, number>({ hash: badHash })
      for (let i = 0; i < 10; i++) {
        t = t.set(`key${i}`, i)
      }
      expect(t.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('delete from collision reduces to leaf', () => {
      const badHash = () => 7
      const t = new HashArrayMappedTrie<string, number>(undefined, { hash: badHash })
        .set('x', 1)
        .set('y', 2)
        .set('z', 3)
        .delete('y')
        .delete('z')
      expect(t.size).toBe(1)
      expect(t.get('x')).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 insertions and lookups', () => {
      let t = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(i, i * 2)
      }
      expect(t.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(t.get(i)).toBe(i * 2)
      }
    })

    it('handles 500 insertions and 500 deletions', () => {
      let t = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 500; i++) {
        t = t.set(i, i)
      }
      expect(t.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        t = t.delete(i)
      }
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('handles intermixed set and delete', () => {
      let t = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 200; i++) {
        t = t.set(i, i)
      }
      for (let i = 0; i < 100; i++) {
        t = t.delete(i * 2)
      }
      expect(t.size).toBe(100)
      for (let i = 0; i < 200; i++) {
        if (i % 2 === 0) {
          expect(t.has(i)).toBe(false)
        } else {
          expect(t.has(i)).toBe(true)
        }
      }
    })

    it('handles overwriting many keys', () => {
      let t = HashArrayMappedTrie.empty<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set('key', i)
      }
      expect(t.size).toBe(1)
      expect(t.get('key')).toBe(99)
    })

    it('handles string keys of various lengths', () => {
      let t = HashArrayMappedTrie.empty<string, number>()
      const keys = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef']
      keys.forEach((k, i) => { t = t.set(k, i) })
      expect(t.size).toBe(6)
      keys.forEach((k, i) => {
        expect(t.get(k)).toBe(i)
      })
    })
  })

  describe('structural sharing', () => {
    it('set preserves shared subtrees', () => {
      let base = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 100; i++) {
        base = base.set(i, i)
      }
      const branch1 = base.set(1000, 1000)
      const branch2 = base.set(2000, 2000)

      for (let i = 0; i < 100; i++) {
        expect(branch1.get(i)).toBe(i)
        expect(branch2.get(i)).toBe(i)
      }
      expect(branch1.get(1000)).toBe(1000)
      expect(branch2.get(2000)).toBe(2000)
      expect(branch1.get(2000)).toBeUndefined()
      expect(branch2.get(1000)).toBeUndefined()
    })

    it('delete preserves shared subtrees', () => {
      let base = HashArrayMappedTrie.empty<number, number>()
      for (let i = 0; i < 100; i++) {
        base = base.set(i, i)
      }
      const branch1 = base.delete(50)
      const branch2 = base.delete(75)

      expect(base.get(50)).toBe(50)
      expect(base.get(75)).toBe(75)
      expect(branch1.get(50)).toBeUndefined()
      expect(branch1.get(75)).toBe(75)
      expect(branch2.get(50)).toBe(50)
      expect(branch2.get(75)).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles undefined value', () => {
      const t = HashArrayMappedTrie.empty<string, number | undefined>().set('a', undefined)
      expect(t.get('a')).toBeUndefined()
      expect(t.has('a')).toBe(true)
      expect(t.size).toBe(1)
    })

    it('handles null value', () => {
      const t = HashArrayMappedTrie.empty<string, number | null>().set('a', null)
      expect(t.get('a')).toBeNull()
      expect(t.has('a')).toBe(true)
    })

    it('handles zero value', () => {
      const t = HashArrayMappedTrie.empty<string, number>().set('a', 0)
      expect(t.get('a')).toBe(0)
      expect(t.has('a')).toBe(true)
    })

    it('handles false value', () => {
      const t = HashArrayMappedTrie.empty<string, boolean>().set('a', false)
      expect(t.get('a')).toBe(false)
      expect(t.has('a')).toBe(true)
    })

    it('handles empty string value', () => {
      const t = HashArrayMappedTrie.empty<string, string>().set('a', '')
      expect(t.get('a')).toBe('')
      expect(t.has('a')).toBe(true)
    })

    it('handles NaN key', () => {
      const t = HashArrayMappedTrie.empty<number, string>().set(NaN, 'nan')
      expect(t.get(NaN)).toBe('nan')
      expect(t.has(NaN)).toBe(true)
    })

    it('set same value returns same trie reference', () => {
      const t1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const t2 = t1.set('a', 1)
      expect(t2).toBe(t1)
    })
  })

  describe('chaining', () => {
    it('supports method chaining for set', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      expect(t.size).toBe(3)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
    })

    it('supports method chaining for delete', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
        .delete('a')
        .delete('c')
      expect(t.size).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('supports mixed set and delete chains', () => {
      const t = HashArrayMappedTrie.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
        .set('c', 3)
        .set('a', 10)
      expect(t.size).toBe(3)
      expect(t.get('a')).toBe(10)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
    })
  })
})
