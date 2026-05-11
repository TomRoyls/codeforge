import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie2 } from '../../src/core/hash-array-mapped-trie-2/index.js'

describe('HashArrayMappedTrie2', () => {
  describe('constructor', () => {
    it('creates an empty trie with no arguments', () => {
      const t = new HashArrayMappedTrie2<string, number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates a trie from entries', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      expect(t.size()).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('handles duplicate keys in constructor entries', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['a', 2]])
      expect(t.size()).toBe(1)
      expect(t.get('a')).toBe(2)
    })

    it('handles empty array entries', () => {
      const t = new HashArrayMappedTrie2<string, number>([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('static empty', () => {
    it('creates an empty trie', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('can be used as a starting point for set', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('x', 42)
      expect(t.get('x')).toBe(42)
      expect(t.size()).toBe(1)
    })
  })

  describe('static from', () => {
    it('creates a trie from entries', () => {
      const t = HashArrayMappedTrie2.from<number, string>([[1, 'one'], [2, 'two']])
      expect(t.size()).toBe(2)
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('creates an empty trie from empty array', () => {
      const t = HashArrayMappedTrie2.from<number, string>([])
      expect(t.size()).toBe(0)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('key', 123)
      expect(t.get('key')).toBe(123)
    })

    it('returns undefined for missing key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      expect(t.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('key', 1)
        .set('key', 2)
      expect(t.get('key')).toBe(2)
      expect(t.size()).toBe(1)
    })

    it('handles multiple keys', () => {
      let t = HashArrayMappedTrie2.empty<string, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(`key${i}`, i)
      }
      expect(t.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('handles numeric keys', () => {
      const t = new HashArrayMappedTrie2<number, string>([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(t.get(1)).toBe('a')
      expect(t.get(2)).toBe('b')
      expect(t.get(3)).toBe('c')
    })

    it('handles object identity keys', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const t = HashArrayMappedTrie2.empty<object, number>()
        .set(obj1, 10)
        .set(obj2, 20)
      expect(t.get(obj1)).toBe(10)
      expect(t.get(obj2)).toBe(20)
    })

    it('handles boolean keys', () => {
      const t = new HashArrayMappedTrie2<boolean, string>([[true, 'yes'], [false, 'no']])
      expect(t.get(true)).toBe('yes')
      expect(t.get(false)).toBe('no')
    })

    it('handles null and undefined keys', () => {
      const t = new HashArrayMappedTrie2<null | undefined, string>([[null, 'null'], [undefined, 'undef']])
      expect(t.get(null)).toBe('null')
      expect(t.get(undefined)).toBe('undef')
    })

    it('handles string value of 0', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('0', 42)
      expect(t.get('0')).toBe(42)
    })

    it('handles empty string key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('', 99)
      expect(t.get('')).toBe(99)
    })

    it('set returns new trie (immutability)', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>()
      const t2 = t1.set('a', 1)
      expect(t1.get('a')).toBeUndefined()
      expect(t2.get('a')).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      expect(t.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      expect(t.has('a')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .delete('a')
      expect(t.has('a')).toBe(false)
    })

    it('returns true for overwritten key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(t.has('a')).toBe(true)
    })

    it('works with many keys', () => {
      let t = HashArrayMappedTrie2.empty<number, string>()
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
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .delete('a')
      expect(t.get('a')).toBeUndefined()
      expect(t.size()).toBe(0)
    })

    it('returns same trie when deleting non-existent key', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      const t2 = t1.delete('b')
      expect(t2).toBe(t1)
    })

    it('deletes from multi-key trie', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
        .delete('b')
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBeUndefined()
      expect(t.get('c')).toBe(3)
      expect(t.size()).toBe(2)
    })

    it('does not modify original trie (immutability)', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const t2 = t1.delete('a')
      expect(t1.get('a')).toBe(1)
      expect(t1.size()).toBe(2)
      expect(t2.get('a')).toBeUndefined()
      expect(t2.size()).toBe(1)
    })

    it('handles delete then re-add', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .delete('a')
        .set('a', 2)
      expect(t.get('a')).toBe(2)
      expect(t.size()).toBe(1)
    })

    it('handles deleting all keys', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
        .delete('a')
        .delete('b')
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('deletes many keys sequentially', () => {
      let t: HashArrayMappedTrie2<number, number> = HashArrayMappedTrie2.empty()
      for (let i = 0; i < 50; i++) {
        t = t.set(i, i * 10)
      }
      expect(t.size()).toBe(50)
      for (let i = 0; i < 50; i++) {
        t = t.delete(i)
      }
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('deletes every other key', () => {
      let t: HashArrayMappedTrie2<number, number> = HashArrayMappedTrie2.empty()
      for (let i = 0; i < 20; i++) {
        t = t.set(i, i)
      }
      for (let i = 0; i < 20; i += 2) {
        t = t.delete(i)
      }
      expect(t.size()).toBe(10)
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          expect(t.has(i)).toBe(false)
        } else {
          expect(t.has(i)).toBe(true)
        }
      }
    })
  })

  describe('size and isEmpty', () => {
    it('empty trie has size 0', () => {
      expect(HashArrayMappedTrie2.empty().size()).toBe(0)
    })

    it('isEmpty returns true for empty trie', () => {
      expect(HashArrayMappedTrie2.empty().isEmpty()).toBe(true)
    })

    it('size increases with set', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      expect(t.size()).toBe(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('size does not increase on overwrite', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
      expect(t.size()).toBe(1)
    })

    it('size decreases with delete', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
      expect(t.size()).toBe(1)
    })

    it('size tracks large number of entries', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(i, i)
      }
      expect(t.size()).toBe(1000)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie2.empty().keys()).toEqual([])
    })

    it('returns all keys', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const keys = t.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
      expect(keys.length).toBe(3)
    })

    it('returns correct keys after delete', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
        .delete('b')
      const keys = t.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('c')
      expect(keys).not.toContain('b')
    })
  })

  describe('values', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie2.empty().values()).toEqual([])
    })

    it('returns all values', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const values = t.values()
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
      expect(values.length).toBe(3)
    })

    it('returns updated values after overwrite', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('a', 99)
      const values = t.values()
      expect(values).toEqual([99])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty trie', () => {
      expect(HashArrayMappedTrie2.empty().entries()).toEqual([])
    })

    it('returns all entries', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
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
      HashArrayMappedTrie2.empty<string, number>().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each entry with value and key', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const seen: Array<[string, number]> = []
      t.forEach((v, k) => seen.push([k, v]))
      expect(seen.length).toBe(3)
      const map = new Map(seen)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('provides correct argument order (value, key)', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('x', 42)
      let receivedKey: string | undefined
      let receivedValue: number | undefined
      t.forEach((v, k) => {
        receivedKey = k
        receivedValue = v
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })
  })

  describe('Symbol.iterator', () => {
    it('yields nothing for empty trie', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      const result = [...t]
      expect(result).toEqual([])
    })

    it('yields all entries', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const result = [...t]
      expect(result.length).toBe(2)
      const map = new Map(result)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('works with for...of', () => {
      const t = new HashArrayMappedTrie2<number, string>([[1, 'one'], [2, 'two']])
      const entries: Array<[number, string]> = []
      for (const entry of t) {
        entries.push(entry)
      }
      expect(entries.length).toBe(2)
    })

    it('works with destructuring spread', () => {
      const t = new HashArrayMappedTrie2<string, number>([['x', 10]])
      const [[key, value]] = [...t]
      expect(key).toBe('x')
      expect(value).toBe(10)
    })
  })

  describe('map', () => {
    it('maps values', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const mapped = t.map(v => v * 10)
      expect(mapped.get('a')).toBe(10)
      expect(mapped.get('b')).toBe(20)
      expect(mapped.get('c')).toBe(30)
    })

    it('maps to different type', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const mapped = t.map(v => `val:${v}`)
      expect(mapped.get('a')).toBe('val:1')
      expect(mapped.get('b')).toBe('val:2')
    })

    it('provides key to map function', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1]])
      const mapped = t.map((_v, k) => k.toUpperCase())
      expect(mapped.get('a')).toBe('A')
    })

    it('returns empty trie for empty input', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      const mapped = t.map(v => v * 2)
      expect(mapped.size()).toBe(0)
    })

    it('does not modify original', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1]])
      t.map(v => v * 2)
      expect(t.get('a')).toBe(1)
    })
  })

  describe('filter', () => {
    it('filters entries by value', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3], ['d', 4]])
      const filtered = t.filter(v => v % 2 === 0)
      expect(filtered.size()).toBe(2)
      expect(filtered.has('b')).toBe(true)
      expect(filtered.has('d')).toBe(true)
      expect(filtered.has('a')).toBe(false)
    })

    it('filters entries by key', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const filtered = t.filter((_v, k) => k !== 'b')
      expect(filtered.size()).toBe(2)
      expect(filtered.has('a')).toBe(true)
      expect(filtered.has('c')).toBe(true)
      expect(filtered.has('b')).toBe(false)
    })

    it('returns empty trie when all filtered out', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const filtered = t.filter(() => false)
      expect(filtered.size()).toBe(0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('returns all entries when all pass', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const filtered = t.filter(() => true)
      expect(filtered.size()).toBe(2)
    })

    it('returns empty for empty trie', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      const filtered = t.filter(() => true)
      expect(filtered.size()).toBe(0)
    })
  })

  describe('reduce', () => {
    it('sums values', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const sum = t.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(6)
    })

    it('builds an object from entries', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const obj = t.reduce<Record<string, number>>((acc, v, k) => {
        acc[k] = v
        return acc
      }, {})
      expect(obj).toEqual({ a: 1, b: 2 })
    })

    it('returns initial value for empty trie', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      const result = t.reduce((acc, v) => acc + v, 42)
      expect(result).toBe(42)
    })

    it('counts entries', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      for (let i = 0; i < 50; i++) {
        t = t.set(i, i)
      }
      const count = t.reduce(acc => acc + 1, 0)
      expect(count).toBe(50)
    })
  })

  describe('merge', () => {
    it('merges two tries', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const t2 = new HashArrayMappedTrie2<string, number>([['c', 3], ['d', 4]])
      const merged = t1.merge(t2)
      expect(merged.size()).toBe(4)
      expect(merged.get('a')).toBe(1)
      expect(merged.get('c')).toBe(3)
    })

    it('other overwrites on conflict', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const t2 = new HashArrayMappedTrie2<string, number>([['b', 20], ['c', 3]])
      const merged = t1.merge(t2)
      expect(merged.get('b')).toBe(20)
      expect(merged.size()).toBe(3)
    })

    it('merging with empty trie returns copy', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1]])
      const t2 = HashArrayMappedTrie2.empty<string, number>()
      const merged = t1.merge(t2)
      expect(merged.size()).toBe(1)
      expect(merged.get('a')).toBe(1)
    })

    it('merging into empty trie', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>()
      const t2 = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const merged = t1.merge(t2)
      expect(merged.size()).toBe(2)
    })

    it('does not modify original tries', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1]])
      const t2 = new HashArrayMappedTrie2<string, number>([['b', 2]])
      t1.merge(t2)
      expect(t1.size()).toBe(1)
      expect(t1.has('b')).toBe(false)
      expect(t2.size()).toBe(1)
      expect(t2.has('a')).toBe(false)
    })
  })

  describe('clone', () => {
    it('clones a trie', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const c = t.clone()
      expect(c.size()).toBe(t.size())
      expect(c.get('a')).toBe(1)
      expect(c.get('b')).toBe(2)
    })

    it('clone is independent', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const c = t.clone()
      const c2 = c.delete('a')
      expect(t.size()).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(c.size()).toBe(2)
      expect(c.get('a')).toBe(1)
      expect(c2.size()).toBe(1)
    })

    it('clones empty trie', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
      const c = t.clone()
      expect(c.size()).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('persistence (immutability)', () => {
    it('set does not modify original', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      const t2 = t1.set('b', 2)
      expect(t1.size()).toBe(1)
      expect(t1.has('b')).toBe(false)
      expect(t2.size()).toBe(2)
      expect(t2.get('a')).toBe(1)
      expect(t2.get('b')).toBe(2)
    })

    it('overwrite does not modify original', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      const t2 = t1.set('a', 99)
      expect(t1.get('a')).toBe(1)
      expect(t2.get('a')).toBe(99)
    })

    it('delete does not modify original', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const t2 = t1.delete('a')
      expect(t1.get('a')).toBe(1)
      expect(t1.size()).toBe(2)
      expect(t2.get('a')).toBeUndefined()
      expect(t2.size()).toBe(1)
    })

    it('chain of modifications are independent', () => {
      const t0 = HashArrayMappedTrie2.empty<string, number>()
      const t1 = t0.set('a', 1)
      const t2 = t1.set('b', 2)
      const t3 = t2.set('c', 3)
      expect(t0.size()).toBe(0)
      expect(t1.size()).toBe(1)
      expect(t2.size()).toBe(2)
      expect(t3.size()).toBe(3)
      expect(t1.get('b')).toBeUndefined()
      expect(t2.get('c')).toBeUndefined()
    })

    it('branching modifications', () => {
      const base = new HashArrayMappedTrie2<string, number>([['x', 1], ['y', 2]])
      const branch1 = base.set('a', 10)
      const branch2 = base.set('b', 20)
      expect(base.size()).toBe(2)
      expect(branch1.size()).toBe(3)
      expect(branch2.size()).toBe(3)
      expect(branch1.has('b')).toBe(false)
      expect(branch2.has('a')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles single entry', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('only', 42)
      expect(t.size()).toBe(1)
      expect(t.get('only')).toBe(42)
      expect(t.has('only')).toBe(true)
      expect(t.keys()).toEqual(['only'])
      expect(t.values()).toEqual([42])
    })

    it('handles many entries (1000+)', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      for (let i = 0; i < 1000; i++) {
        t = t.set(i, i * 10)
      }
      expect(t.size()).toBe(1000)
      expect(t.get(0)).toBe(0)
      expect(t.get(999)).toBe(9990)
      expect(t.get(500)).toBe(5000)
    })

    it('handles large string keys', () => {
      const longKey = 'a'.repeat(10000)
      const t = HashArrayMappedTrie2.empty<string, number>().set(longKey, 1)
      expect(t.get(longKey)).toBe(1)
      expect(t.size()).toBe(1)
    })

    it('handles unicode keys', () => {
      const t = new HashArrayMappedTrie2<string, string>([
        ['日本語', 'japanese'],
        ['한국어', 'korean'],
        ['العربية', 'arabic'],
      ])
      expect(t.get('日本語')).toBe('japanese')
      expect(t.get('한국어')).toBe('korean')
      expect(t.get('العربية')).toBe('arabic')
    })

    it('handles undefined values', () => {
      const t = HashArrayMappedTrie2.empty<string, number | undefined>().set('a', undefined)
      expect(t.get('a')).toBeUndefined()
      expect(t.has('a')).toBe(true)
      expect(t.size()).toBe(1)
    })

    it('handles null values', () => {
      const t = HashArrayMappedTrie2.empty<string, number | null>().set('a', null)
      expect(t.get('a')).toBeNull()
      expect(t.has('a')).toBe(true)
    })

    it('handles zero value', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('a', 0)
      expect(t.get('a')).toBe(0)
      expect(t.has('a')).toBe(true)
    })

    it('handles false value', () => {
      const t = HashArrayMappedTrie2.empty<string, boolean>().set('a', false)
      expect(t.get('a')).toBe(false)
      expect(t.has('a')).toBe(true)
    })

    it('handles empty string value', () => {
      const t = HashArrayMappedTrie2.empty<string, string>().set('a', '')
      expect(t.get('a')).toBe('')
      expect(t.has('a')).toBe(true)
    })

    it('handles mixed key types', () => {
      const t = new HashArrayMappedTrie2<string | number, number>([
        ['a', 1],
        [42, 2],
        ['b', 3],
      ])
      expect(t.get('a')).toBe(1)
      expect(t.get(42)).toBe(2)
      expect(t.get('b')).toBe(3)
    })
  })

  describe('hash collisions', () => {
    it('handles keys that may hash the same', () => {
      const t = new HashArrayMappedTrie2<number, string>([
        [0, 'zero'],
        [32, 'thirty-two'],
      ])
      expect(t.get(0)).toBe('zero')
      expect(t.get(32)).toBe('thirty-two')
      expect(t.size()).toBe(2)
    })

    it('handles collision with delete', () => {
      const t = new HashArrayMappedTrie2<number, string>([
        [0, 'zero'],
        [32, 'thirty-two'],
      ]).delete(0)
      expect(t.get(0)).toBeUndefined()
      expect(t.get(32)).toBe('thirty-two')
      expect(t.size()).toBe(1)
    })

    it('handles many potential collisions', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(i * 32, i)
      }
      expect(t.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.get(i * 32)).toBe(i)
      }
    })
  })

  describe('stress tests', () => {
    it('set, get, delete many entries', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      const n = 500
      for (let i = 0; i < n; i++) {
        t = t.set(i, i * 2)
      }
      expect(t.size()).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(t.get(i)).toBe(i * 2)
      }
      for (let i = 0; i < n; i += 2) {
        t = t.delete(i)
      }
      expect(t.size()).toBe(n / 2)
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) {
          expect(t.has(i)).toBe(false)
        } else {
          expect(t.has(i)).toBe(true)
        }
      }
    })

    it('repeated set and delete cycle', () => {
      let t = HashArrayMappedTrie2.empty<string, number>()
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 20; i++) {
          t = t.set(`k${i}`, i)
        }
        expect(t.size()).toBe(20)
        for (let i = 0; i < 20; i++) {
          t = t.delete(`k${i}`)
        }
        expect(t.size()).toBe(0)
      }
    })

    it('large merge', () => {
      let t1 = HashArrayMappedTrie2.empty<number, number>()
      let t2 = HashArrayMappedTrie2.empty<number, number>()
      for (let i = 0; i < 200; i++) {
        t1 = t1.set(i, i)
      }
      for (let i = 200; i < 400; i++) {
        t2 = t2.set(i, i)
      }
      const merged = t1.merge(t2)
      expect(merged.size()).toBe(400)
      expect(merged.get(0)).toBe(0)
      expect(merged.get(399)).toBe(399)
    })

    it('iteration consistency', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      const entries = new Map<number, number>()
      for (let i = 0; i < 100; i++) {
        t = t.set(i, i * 10)
        entries.set(i, i * 10)
      }
      const fromEntries = t.entries()
      expect(fromEntries.length).toBe(100)
      for (const [k, v] of fromEntries) {
        expect(entries.get(k)).toBe(v)
      }
    })
  })

  describe('type safety', () => {
    it('map changes value type', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1]])
      const mapped: HashArrayMappedTrie2<string, string> = t.map(v => String(v))
      expect(mapped.get('a')).toBe('1')
    })

    it('reduce can change accumulator type', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const result: string = t.reduce((acc, v, k) => acc + `${k}:${v},`, '')
      expect(result).toContain('a:1,')
      expect(result).toContain('b:2,')
    })

    it('filter preserves types', () => {
      const t = new HashArrayMappedTrie2<number, string>([[1, 'a'], [2, 'b']])
      const filtered: HashArrayMappedTrie2<number, string> = t.filter(v => v === 'a')
      expect(filtered.size()).toBe(1)
      expect(filtered.get(1)).toBe('a')
    })
  })

  describe('complex scenarios', () => {
    it('map then filter then reduce', () => {
      const t = new HashArrayMappedTrie2<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
      ])
      const result = t
        .map(v => v * 10)
        .filter(v => v > 20)
        .reduce((acc, v) => acc + v, 0)
      expect(result).toBe(70)
    })

    it('merge two filtered tries', () => {
      const base = new HashArrayMappedTrie2<string, number>([
        ['a', 1], ['b', 2], ['c', 3], ['d', 4],
      ])
      const evens = base.filter(v => v % 2 === 0)
      const odds = base.filter(v => v % 2 !== 0)
      const merged = evens.merge(odds)
      expect(merged.size()).toBe(4)
    })

    it('clone after multiple operations', () => {
      let t = HashArrayMappedTrie2.empty<string, number>()
      for (let i = 0; i < 50; i++) {
        t = t.set(`k${i}`, i)
      }
      for (let i = 0; i < 25; i++) {
        t = t.delete(`k${i}`)
      }
      const c = t.clone()
      expect(c.size()).toBe(25)
      expect(c.get('k30')).toBe(30)
    })

    it('forEach after complex operations', () => {
      let t = HashArrayMappedTrie2.empty<number, string>()
      for (let i = 0; i < 30; i++) {
        t = t.set(i, `val${i}`)
      }
      for (let i = 10; i < 20; i++) {
        t = t.delete(i)
      }
      const keys: number[] = []
      t.forEach((_v, k) => keys.push(k))
      expect(keys.length).toBe(20)
    })

    it('iterator after map and filter', () => {
      const t = new HashArrayMappedTrie2<string, number>([
        ['a', 1], ['b', 2], ['c', 3],
      ])
      const mapped = t.map(v => v * 100)
      const filtered = mapped.filter(v => v >= 200)
      const entries = [...filtered]
      expect(entries.length).toBe(2)
    })
  })

  describe('additional coverage', () => {
    it('set returns new trie even with same value (structurally)', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      const t2 = t1.set('a', 1)
      expect(t1.get('a')).toBe(1)
      expect(t2.get('a')).toBe(1)
      expect(t1.size()).toBe(1)
      expect(t2.size()).toBe(1)
    })

    it('set with different value on same key returns correct size', () => {
      const t1 = HashArrayMappedTrie2.empty<string, number>().set('a', 1)
      const t2 = t1.set('a', 999)
      expect(t1.get('a')).toBe(1)
      expect(t2.get('a')).toBe(999)
      expect(t2.size()).toBe(1)
    })

    it('delete from single-entry trie returns empty', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('only', 1)
        .delete('only')
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.get('only')).toBeUndefined()
    })

    it('delete same key twice', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
      const t2 = t.delete('a')
      const t3 = t2.delete('a')
      expect(t3).toBe(t2)
      expect(t3.size()).toBe(1)
    })

    it('get on deleted key returns undefined', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
        .delete('a')
      expect(t.get('a')).toBeUndefined()
    })

    it('has on empty trie', () => {
      expect(HashArrayMappedTrie2.empty().has('anything')).toBe(false)
    })

    it('keys after multiple overwrites', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
        .set('a', 3)
      expect(t.keys()).toEqual(['a'])
    })

    it('values after multiple overwrites', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('a', 2)
        .set('a', 3)
      expect(t.values()).toEqual([3])
    })

    it('entries after delete and re-add', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .set('b', 2)
        .delete('a')
        .set('a', 3)
      const entries = t.entries()
      const map = new Map(entries)
      expect(map.get('a')).toBe(3)
      expect(map.get('b')).toBe(2)
    })

    it('map on single entry', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('x', 5)
      const mapped = t.map(v => v + 10)
      expect(mapped.get('x')).toBe(15)
      expect(mapped.size()).toBe(1)
    })

    it('filter on single entry that passes', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('x', 5)
      const filtered = t.filter(() => true)
      expect(filtered.size()).toBe(1)
      expect(filtered.get('x')).toBe(5)
    })

    it('filter on single entry that fails', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('x', 5)
      const filtered = t.filter(() => false)
      expect(filtered.size()).toBe(0)
    })

    it('reduce on single entry', () => {
      const t = HashArrayMappedTrie2.empty<string, number>().set('x', 10)
      const result = t.reduce((acc, v) => acc + v, 0)
      expect(result).toBe(10)
    })

    it('merge with overlapping keys - other wins', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const t2 = new HashArrayMappedTrie2<string, number>([['b', 200], ['c', 300]])
      const merged = t1.merge(t2)
      expect(merged.get('a')).toBe(1)
      expect(merged.get('b')).toBe(200)
      expect(merged.get('c')).toBe(300)
    })

    it('clone then modify original', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2]])
      const c = t.clone()
      const t2 = t.set('c', 3)
      expect(c.has('c')).toBe(false)
      expect(c.size()).toBe(2)
      expect(t2.size()).toBe(3)
    })

    it('static from with many entries', () => {
      const entries: Array<[number, string]> = []
      for (let i = 0; i < 200; i++) {
        entries.push([i, `v${i}`])
      }
      const t = HashArrayMappedTrie2.from(entries)
      expect(t.size()).toBe(200)
      expect(t.get(0)).toBe('v0')
      expect(t.get(199)).toBe('v199')
    })

    it('constructor with undefined entries param', () => {
      const t = new HashArrayMappedTrie2<string, number>(undefined)
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('float keys', () => {
      const t = new HashArrayMappedTrie2<number, string>([[1.5, 'one-half'], [2.7, 'two-seven']])
      expect(t.get(1.5)).toBe('one-half')
      expect(t.get(2.7)).toBe('two-seven')
    })

    it('negative number keys', () => {
      const t = new HashArrayMappedTrie2<number, string>([[-1, 'neg'], [-100, 'neg100']])
      expect(t.get(-1)).toBe('neg')
      expect(t.get(-100)).toBe('neg100')
    })

    it('symbol keys', () => {
      const s1 = Symbol('a')
      const s2 = Symbol('b')
      const t = HashArrayMappedTrie2.empty<symbol, number>()
        .set(s1, 1)
        .set(s2, 2)
      expect(t.get(s1)).toBe(1)
      expect(t.get(s2)).toBe(2)
    })

    it('array keys (by reference)', () => {
      const arr1 = [1, 2, 3]
      const arr2 = [4, 5, 6]
      const t = HashArrayMappedTrie2.empty<number[], string>()
        .set(arr1, 'first')
        .set(arr2, 'second')
      expect(t.get(arr1)).toBe('first')
      expect(t.get(arr2)).toBe('second')
    })

    it('forEach can collect to map', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const map = new Map<string, number>()
      t.forEach((v, k) => map.set(k, v))
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(3)
    })

    it('iterator works with Array.from', () => {
      const t = new HashArrayMappedTrie2<string, number>([['x', 10], ['y', 20]])
      const arr = Array.from(t)
      expect(arr.length).toBe(2)
    })

    it('empty trie clone isEmpty', () => {
      const e = HashArrayMappedTrie2.empty<string, number>()
      expect(e.clone().isEmpty()).toBe(true)
    })

    it('set delete set same key', () => {
      const t = HashArrayMappedTrie2.empty<string, number>()
        .set('a', 1)
        .delete('a')
        .set('a', 2)
      expect(t.get('a')).toBe(2)
      expect(t.size()).toBe(1)
    })

    it('map preserves keys', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const mapped = t.map(v => v * 2)
      const keys = mapped.keys()
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('filter then size', () => {
      const t = new HashArrayMappedTrie2<number, number>(
        Array.from({ length: 20 }, (_, i) => [i, i] as [number, number])
      )
      expect(t.filter(v => v < 10).size()).toBe(10)
      expect(t.filter(v => v >= 10).size()).toBe(10)
    })

    it('merge preserves types', () => {
      const t1 = new HashArrayMappedTrie2<string, number>([['a', 1]])
      const t2 = new HashArrayMappedTrie2<string, number>([['b', 2]])
      const merged = t1.merge(t2)
      expect(merged.get('a')).toBe(1)
      expect(merged.get('b')).toBe(2)
      expect(merged.size()).toBe(2)
    })

    it('delete from trie with many entries then verify remaining', () => {
      let t = HashArrayMappedTrie2.empty<string, number>()
      for (let i = 0; i < 33; i++) {
        t = t.set(`k${i}`, i)
      }
      t = t.delete('k16')
      expect(t.size()).toBe(32)
      expect(t.has('k16')).toBe(false)
      expect(t.has('k15')).toBe(true)
      expect(t.has('k17')).toBe(true)
    })

    it('entries match keys and values', () => {
      const t = new HashArrayMappedTrie2<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const keys = t.keys()
      const values = t.values()
      const entries = t.entries()
      expect(entries.length).toBe(keys.length)
      expect(entries.length).toBe(values.length)
    })

    it('object values', () => {
      const t = HashArrayMappedTrie2.empty<string, { name: string }>()
        .set('a', { name: 'Alice' })
        .set('b', { name: 'Bob' })
      expect(t.get('a')!.name).toBe('Alice')
      expect(t.get('b')!.name).toBe('Bob')
    })

    it('array values', () => {
      const t = HashArrayMappedTrie2.empty<string, number[]>()
        .set('a', [1, 2, 3])
        .set('b', [4, 5, 6])
      expect(t.get('a')).toEqual([1, 2, 3])
      expect(t.get('b')).toEqual([4, 5, 6])
    })

    it('set 33 entries to force deeper trie', () => {
      let t = HashArrayMappedTrie2.empty<number, number>()
      for (let i = 0; i < 33; i++) {
        t = t.set(i, i * 2)
      }
      expect(t.size()).toBe(33)
      for (let i = 0; i < 33; i++) {
        expect(t.get(i)).toBe(i * 2)
      }
    })
  })
})
