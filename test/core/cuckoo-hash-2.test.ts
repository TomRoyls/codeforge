import { describe, it, expect } from 'vitest'
import { CuckooHash } from '../../src/core/cuckoo-hash-2/index.js'

describe('CuckooHash', () => {
  describe('constructor', () => {
    it('creates empty hash with defaults', () => {
      const h = new CuckooHash<string, number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('accepts initial capacity', () => {
      const h = new CuckooHash<string, number>({ initialCapacity: 64 })
      expect(h.size).toBe(0)
    })

    it('accepts max load factor', () => {
      const h = new CuckooHash<string, number>({ maxLoadFactor: 0.75 })
      expect(h.isEmpty()).toBe(true)
    })

    it('accepts max kicks', () => {
      const h = new CuckooHash<string, number>({ maxKicks: 100 })
      expect(h.isEmpty()).toBe(true)
    })

    it('accepts custom hash functions', () => {
      const h = new CuckooHash<number, string>({
        hash1: (key, sz) => key % sz,
        hash2: (key, sz) => (key * 31) % sz,
      })
      h.set(1, 'one')
      expect(h.get(1)).toBe('one')
    })

    it('accepts all options at once', () => {
      const h = new CuckooHash<number, string>({
        initialCapacity: 32,
        maxLoadFactor: 0.4,
        maxKicks: 200,
        hash1: (key, sz) => key % sz,
        hash2: (key, sz) => (key * 7) % sz,
      })
      expect(h.size).toBe(0)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      expect(h.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const h = new CuckooHash<string, number>()
      expect(h.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('a', 2)
      expect(h.get('a')).toBe(2)
      expect(h.size).toBe(1)
    })

    it('stores multiple keys', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      expect(h.get('a')).toBe(1)
      expect(h.get('b')).toBe(2)
      expect(h.get('c')).toBe(3)
    })

    it('stores numeric keys', () => {
      const h = new CuckooHash<number, string>()
      h.set(1, 'one')
      h.set(2, 'two')
      h.set(3, 'three')
      expect(h.get(1)).toBe('one')
      expect(h.get(2)).toBe('two')
      expect(h.get(3)).toBe('three')
    })

    it('stores object values', () => {
      const h = new CuckooHash<string, { x: number }>()
      h.set('a', { x: 1 })
      expect(h.get('a')!.x).toBe(1)
    })

    it('stores null values', () => {
      const h = new CuckooHash<string, null>()
      h.set('a', null)
      expect(h.get('a')).toBeNull()
    })

    it('stores undefined values', () => {
      const h = new CuckooHash<string, number | undefined>()
      h.set('a', undefined)
      expect(h.get('a')).toBeUndefined()
      expect(h.has('a')).toBe(true)
    })

    it('stores array values', () => {
      const h = new CuckooHash<string, number[]>()
      h.set('a', [1, 2, 3])
      expect(h.get('a')).toEqual([1, 2, 3])
    })

    it('handles 100 insertions', () => {
      const h = new CuckooHash<number, number>()
      for (let i = 0; i < 100; i++) {
        h.set(i, i * 10)
      }
      expect(h.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(h.get(i)).toBe(i * 10)
      }
    })

    it('handles 500 insertions', () => {
      const h = new CuckooHash<number, number>()
      for (let i = 0; i < 500; i++) {
        h.set(i, i * 2)
      }
      expect(h.size).toBe(500)
    })

    it('handles string keys with special chars', () => {
      const h = new CuckooHash<string, number>()
      h.set('hello world', 1)
      h.set('', 2)
      h.set('  ', 3)
      expect(h.get('hello world')).toBe(1)
      expect(h.get('')).toBe(2)
      expect(h.get('  ')).toBe(3)
    })

    it('handles boolean keys', () => {
      const h = new CuckooHash<boolean, string>()
      h.set(true, 'yes')
      h.set(false, 'no')
      expect(h.get(true)).toBe('yes')
      expect(h.get(false)).toBe('no')
    })

    it('handles overwrite on same slot', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('a', 100)
      expect(h.size).toBe(1)
      expect(h.get('a')).toBe(100)
    })

    it('handles overwrite preserves size', () => {
      const h = new CuckooHash<string, number>()
      h.set('x', 1)
      h.set('y', 2)
      h.set('x', 99)
      expect(h.size).toBe(2)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      expect(h.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const h = new CuckooHash<string, number>()
      expect(h.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.delete('a')
      expect(h.has('a')).toBe(false)
    })

    it('returns true for null value', () => {
      const h = new CuckooHash<string, null>()
      h.set('a', null)
      expect(h.has('a')).toBe(true)
    })

    it('returns true for falsy value', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 0)
      expect(h.has('a')).toBe(true)
    })

    it('returns true for empty string value', () => {
      const h = new CuckooHash<string, string>()
      h.set('a', '')
      expect(h.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      expect(h.delete('a')).toBe(true)
      expect(h.size).toBe(0)
      expect(h.has('a')).toBe(false)
    })

    it('returns false for missing key', () => {
      const h = new CuckooHash<string, number>()
      expect(h.delete('missing')).toBe(false)
    })

    it('deletes from table1', () => {
      const h = new CuckooHash<number, string>({
        hash1: (key, sz) => key % sz,
        hash2: (key, sz) => (key * 31 + 7) % sz,
      })
      h.set(0, 'zero')
      expect(h.delete(0)).toBe(true)
      expect(h.get(0)).toBeUndefined()
    })

    it('deletes multiple keys', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      h.delete('a')
      h.delete('c')
      expect(h.size).toBe(1)
      expect(h.has('b')).toBe(true)
    })

    it('deletes all keys results in empty', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.delete('a')
      h.delete('b')
      expect(h.isEmpty()).toBe(true)
    })

    it('can set after delete', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.delete('a')
      h.set('a', 2)
      expect(h.get('a')).toBe(2)
      expect(h.size).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('size starts at 0', () => {
      const h = new CuckooHash<string, number>()
      expect(h.size).toBe(0)
    })

    it('isEmpty returns true initially', () => {
      const h = new CuckooHash<string, number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('size increments on set', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      expect(h.size).toBe(1)
    })

    it('size does not increment on overwrite', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('a', 2)
      expect(h.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.delete('a')
      expect(h.size).toBe(0)
    })

    it('isEmpty returns false after insert', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      expect(h.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after deleting all', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.delete('a')
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('clear on empty does nothing', () => {
      const h = new CuckooHash<string, number>()
      h.clear()
      expect(h.size).toBe(0)
    })

    it('allows insert after clear', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.clear()
      h.set('b', 2)
      expect(h.size).toBe(1)
      expect(h.get('b')).toBe(2)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty hash', () => {
      const h = new CuckooHash<string, number>()
      expect(h.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const keys = h.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys.length).toBe(2)
    })

    it('returns correct count after delete', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.delete('a')
      expect(h.keys().length).toBe(1)
    })
  })

  describe('values', () => {
    it('returns empty array for empty hash', () => {
      const h = new CuckooHash<string, number>()
      expect(h.values()).toEqual([])
    })

    it('returns all values', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const vals = h.values()
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('returns updated value after overwrite', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('a', 99)
      expect(h.values()).toEqual([99])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty hash', () => {
      const h = new CuckooHash<string, number>()
      expect(h.entries()).toEqual([])
    })

    it('returns all entries', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const ents = h.entries()
      expect(ents.length).toBe(2)
      const keys = ents.map(e => e[0])
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('entries match keys and values', () => {
      const h = new CuckooHash<string, number>()
      h.set('x', 10)
      h.set('y', 20)
      const ents = h.entries()
      for (const [k, v] of ents) {
        expect(h.get(k)).toBe(v)
      }
    })
  })

  describe('forEach', () => {
    it('iterates all entries', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      const result: [string, number][] = []
      h.forEach((key, value, table) => {
        result.push([key, value])
        expect(table).toBe(h)
      })
      expect(result.length).toBe(3)
    })

    it('does not iterate empty hash', () => {
      const h = new CuckooHash<string, number>()
      let count = 0
      h.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns entries as array', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const arr = h.toArray()
      expect(arr.length).toBe(2)
    })

    it('returns same as entries', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      expect(h.toArray()).toEqual(h.entries())
    })
  })

  describe('loadFactor', () => {
    it('starts at 0', () => {
      const h = new CuckooHash<string, number>()
      expect(h.loadFactor).toBe(0)
    })

    it('increases with entries', () => {
      const h = new CuckooHash<string, number>({ initialCapacity: 16 })
      for (let i = 0; i < 4; i++) {
        h.set(`key${i}`, i)
      }
      expect(h.loadFactor).toBeGreaterThan(0)
    })

    it('decreases after delete', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      const lf1 = h.loadFactor
      h.delete('a')
      expect(h.loadFactor).toBeLessThan(lf1)
    })

    it('is 0 after clear', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.clear()
      expect(h.loadFactor).toBe(0)
    })
  })

  describe('resize', () => {
    it('resizes manually', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.resize(64)
      expect(h.size).toBe(2)
      expect(h.get('a')).toBe(1)
      expect(h.get('b')).toBe(2)
    })

    it('auto-resizes when load factor exceeded', () => {
      const h = new CuckooHash<number, number>({ initialCapacity: 4, maxLoadFactor: 0.25 })
      for (let i = 0; i < 10; i++) {
        h.set(i, i)
      }
      expect(h.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(h.get(i)).toBe(i)
      }
    })

    it('preserves data after resize', () => {
      const h = new CuckooHash<string, number>()
      for (let i = 0; i < 50; i++) {
        h.set(`key${i}`, i)
      }
      h.resize(256)
      for (let i = 0; i < 50; i++) {
        expect(h.get(`key${i}`)).toBe(i)
      }
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const c = h.clone()
      expect(c.size).toBe(2)
      expect(c.get('a')).toBe(1)
      expect(c.get('b')).toBe(2)
    })

    it('clone is independent', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      const c = h.clone()
      c.set('a', 99)
      expect(h.get('a')).toBe(1)
      expect(c.get('a')).toBe(99)
    })

    it('clone delete does not affect original', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      const c = h.clone()
      c.delete('a')
      expect(h.has('a')).toBe(true)
      expect(c.has('a')).toBe(false)
    })

    it('clone preserves options', () => {
      const h = new CuckooHash<string, number>({ maxLoadFactor: 0.3 })
      h.set('a', 1)
      const c = h.clone()
      c.set('b', 2)
      expect(c.get('b')).toBe(2)
    })

    it('clone empty hash', () => {
      const h = new CuckooHash<string, number>()
      const c = h.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('containsValue', () => {
    it('finds existing value', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 42)
      expect(h.containsValue(42)).toBe(true)
    })

    it('returns false for missing value', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      expect(h.containsValue(99)).toBe(false)
    })

    it('finds null value', () => {
      const h = new CuckooHash<string, null>()
      h.set('a', null)
      expect(h.containsValue(null)).toBe(true)
    })

    it('finds falsy values', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 0)
      expect(h.containsValue(0)).toBe(true)
    })

    it('returns false on empty', () => {
      const h = new CuckooHash<string, number>()
      expect(h.containsValue(1)).toBe(false)
    })

    it('finds string values', () => {
      const h = new CuckooHash<number, string>()
      h.set(1, 'hello')
      expect(h.containsValue('hello')).toBe(true)
    })

    it('returns false after delete', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 42)
      h.delete('a')
      expect(h.containsValue(42)).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over entries', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const result: [string, number][] = []
      for (const entry of h) {
        result.push(entry)
      }
      expect(result.length).toBe(2)
    })

    it('empty hash yields nothing', () => {
      const h = new CuckooHash<string, number>()
      const result: [string, number][] = []
      for (const entry of h) {
        result.push(entry)
      }
      expect(result.length).toBe(0)
    })

    it('can spread into array', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      const arr = [...h]
      expect(arr.length).toBe(2)
    })
  })

  describe('CuckooHash.from', () => {
    it('creates from array of entries', () => {
      const h = CuckooHash.from([['a', 1], ['b', 2], ['c', 3]] as const)
      expect(h.size).toBe(3)
      expect(h.get('a')).toBe(1)
      expect(h.get('b')).toBe(2)
      expect(h.get('c')).toBe(3)
    })

    it('creates from empty iterable', () => {
      const h = CuckooHash.from([])
      expect(h.size).toBe(0)
    })

    it('accepts options', () => {
      const h = CuckooHash.from([['a', 1]] as const, { initialCapacity: 64 })
      expect(h.get('a')).toBe(1)
    })

    it('creates from Map', () => {
      const m = new Map([['x', 10], ['y', 20]])
      const h = CuckooHash.from(m)
      expect(h.size).toBe(2)
      expect(h.get('x')).toBe(10)
      expect(h.get('y')).toBe(20)
    })
  })

  describe('stress tests', () => {
    it('handles many insertions and deletions', () => {
      const h = new CuckooHash<number, number>()
      for (let i = 0; i < 200; i++) {
        h.set(i, i * 3)
      }
      expect(h.size).toBe(200)
      for (let i = 0; i < 100; i++) {
        h.delete(i)
      }
      expect(h.size).toBe(100)
      for (let i = 100; i < 200; i++) {
        expect(h.get(i)).toBe(i * 3)
      }
    })

    it('handles repeated insert delete cycles', () => {
      const h = new CuckooHash<string, number>()
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 20; i++) {
          h.set(`key${i}`, i + cycle * 100)
        }
        for (let i = 0; i < 20; i++) {
          expect(h.has(`key${i}`)).toBe(true)
        }
        for (let i = 0; i < 20; i++) {
          h.delete(`key${i}`)
        }
        expect(h.size).toBe(0)
      }
    })

    it('handles sequential numeric keys', () => {
      const h = new CuckooHash<number, number>({ initialCapacity: 8 })
      for (let i = 0; i < 100; i++) {
        h.set(i, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(h.get(i)).toBe(i)
      }
    })

    it('handles string keys of various lengths', () => {
      const h = new CuckooHash<string, number>()
      const keys = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef']
      for (let i = 0; i < keys.length; i++) {
        h.set(keys[i]!, i)
      }
      for (let i = 0; i < keys.length; i++) {
        expect(h.get(keys[i]!)).toBe(i)
      }
    })

    it('handles mixed operations', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.delete('a')
      h.set('c', 3)
      h.set('b', 20)
      h.delete('c')
      h.set('d', 4)
      expect(h.size).toBe(2)
      expect(h.get('b')).toBe(20)
      expect(h.get('d')).toBe(4)
      expect(h.has('a')).toBe(false)
      expect(h.has('c')).toBe(false)
    })

    it('handles 1000 insertions', () => {
      const h = new CuckooHash<number, number>()
      for (let i = 0; i < 1000; i++) {
        h.set(i, i)
      }
      expect(h.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(h.has(i)).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('handles empty string key', () => {
      const h = new CuckooHash<string, number>()
      h.set('', 0)
      expect(h.get('')).toBe(0)
      expect(h.has('')).toBe(true)
    })

    it('handles zero key', () => {
      const h = new CuckooHash<number, string>()
      h.set(0, 'zero')
      expect(h.get(0)).toBe('zero')
    })

    it('handles negative number keys', () => {
      const h = new CuckooHash<number, number>()
      h.set(-1, 1)
      h.set(-100, 100)
      expect(h.get(-1)).toBe(1)
      expect(h.get(-100)).toBe(100)
    })

    it('handles NaN key', () => {
      const h = new CuckooHash<number, string>()
      h.set(NaN, 'nan')
      expect(h.has(NaN)).toBe(true)
    })

    it('NaN key get and delete', () => {
      const h = new CuckooHash<number, string>()
      h.set(NaN, 'nan')
      expect(h.get(NaN)).toBe('nan')
      expect(h.delete(NaN)).toBe(true)
      expect(h.has(NaN)).toBe(false)
    })

    it('handles Infinity key', () => {
      const h = new CuckooHash<number, string>()
      h.set(Infinity, 'inf')
      h.set(-Infinity, 'neg-inf')
      expect(h.get(Infinity)).toBe('inf')
      expect(h.get(-Infinity)).toBe('neg-inf')
    })

    it('handles very long string keys', () => {
      const h = new CuckooHash<string, number>()
      const longKey = 'x'.repeat(1000)
      h.set(longKey, 42)
      expect(h.get(longKey)).toBe(42)
    })

    it('handles single element', () => {
      const h = new CuckooHash<string, number>()
      h.set('only', 42)
      expect(h.size).toBe(1)
      expect(h.get('only')).toBe(42)
      expect(h.keys().length).toBe(1)
      expect(h.values().length).toBe(1)
      expect(h.entries().length).toBe(1)
    })

    it('handles key collision with different hash functions', () => {
      let callCount = 0
      const h = new CuckooHash<string, number>({
        hash1: (key, sz) => { callCount++; return 0 },
        hash2: (key, sz) => { callCount++; return 1 },
      })
      h.set('a', 1)
      h.set('b', 2)
      expect(h.size).toBe(2)
      expect(h.get('a')).toBe(1)
      expect(h.get('b')).toBe(2)
    })

    it('handles object references as values', () => {
      const h = new CuckooHash<string, number[]>()
      const arr = [1, 2, 3]
      h.set('a', arr)
      expect(h.get('a')).toBe(arr)
    })

    it('delete returns correct boolean', () => {
      const h = new CuckooHash<string, number>()
      expect(h.delete('x')).toBe(false)
      h.set('x', 1)
      expect(h.delete('x')).toBe(true)
      expect(h.delete('x')).toBe(false)
    })

    it('clear then reuse', () => {
      const h = new CuckooHash<string, number>()
      h.set('a', 1)
      h.set('b', 2)
      h.clear()
      expect(h.size).toBe(0)
      h.set('c', 3)
      expect(h.size).toBe(1)
      expect(h.get('c')).toBe(3)
      expect(h.get('a')).toBeUndefined()
    })
  })

  describe('custom hash functions', () => {
    it('works with identity hash', () => {
      const h = new CuckooHash<number, string>({
        hash1: (k, sz) => k % sz,
        hash2: (k, sz) => (k * 31 + 17) % sz,
        initialCapacity: 16,
      })
      for (let i = 0; i < 50; i++) {
        h.set(i, `v${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(h.get(i)).toBe(`v${i}`)
      }
    })

    it('works with string-specific hash', () => {
      const h = new CuckooHash<string, number>({
        hash1: (key, sz) => {
          let h = 0
          for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
          return ((h >>> 0) % sz)
        },
        hash2: (key, sz) => {
          let h = 5381
          for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) | 0
          return ((h >>> 0) % sz)
        },
      })
      h.set('hello', 1)
      h.set('world', 2)
      expect(h.get('hello')).toBe(1)
      expect(h.get('world')).toBe(2)
    })
  })
})
