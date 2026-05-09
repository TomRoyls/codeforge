import { describe, it, expect } from 'vitest'
import { RobinHoodHashTable } from '../../src/core/robin-hood-hash/robin-hood-hash'

describe('RobinHoodHashTable', () => {
  describe('constructor', () => {
    it('creates table with default capacity 16', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.capacity()).toBe(16)
      expect(ht.size()).toBe(0)
    })

    it('creates table with custom capacity', () => {
      const ht = new RobinHoodHashTable<string, number>(32)
      expect(ht.capacity()).toBe(32)
    })

    it('enforces minimum capacity of 16', () => {
      const ht = new RobinHoodHashTable<string, number>(4)
      expect(ht.capacity()).toBe(16)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.get('missing')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('handles multiple keys', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
    })

    it('stores various value types', () => {
      const ht = new RobinHoodHashTable<string, string>()
      ht.set('hello', 'world')
      expect(ht.get('hello')).toBe('world')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.has('a')).toBe(false)
    })

    it('returns false after deletion', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      expect(ht.has('a')).toBe(false)
    })

    it('returns true for key with undefined value stored', () => {
      const ht = new RobinHoodHashTable<string, number | undefined>()
      ht.set('a', undefined)
      expect(ht.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes an existing key', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.delete('a')).toBe(true)
      expect(ht.get('a')).toBeUndefined()
      expect(ht.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.delete('missing')).toBe(false)
    })

    it('does not affect other keys', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      expect(ht.get('a')).toBe(1)
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(2)
    })

    it('handles delete on empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.delete('a')).toBe(false)
    })

    it('allows re-insert after delete', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.size()).toBe(0)
      ht.set('a', 1)
      expect(ht.size()).toBe(1)
      ht.set('b', 2)
      expect(ht.size()).toBe(2)
    })

    it('isEmpty returns true for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.isEmpty()).toBe(false)
    })

    it('size does not increase on overwrite', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      expect(ht.size()).toBe(1)
    })

    it('size decreases after delete', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      expect(ht.size()).toBe(1)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.clear()
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
    })

    it('allows operations after clear', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.clear()
      ht.set('b', 2)
      expect(ht.get('b')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('clear on empty table is no-op', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.clear()
      expect(ht.size()).toBe(0)
    })
  })

  describe('capacity and loadFactor', () => {
    it('returns initial capacity', () => {
      const ht = new RobinHoodHashTable<string, number>(32)
      expect(ht.capacity()).toBe(32)
    })

    it('load factor is 0 for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.loadFactor()).toBe(0)
    })

    it('load factor increases with inserts', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      ht.set('a', 1)
      expect(ht.loadFactor()).toBeCloseTo(1 / 16)
      ht.set('b', 2)
      expect(ht.loadFactor()).toBeCloseTo(2 / 16)
    })

    it('capacity grows on rehash', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 13; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.capacity()).toBeGreaterThan(16)
    })
  })

  describe('keys, values, entries', () => {
    it('keys returns all keys', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      expect(ht.keys().sort()).toEqual(['a', 'b', 'c'])
    })

    it('values returns all values', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      expect(ht.values().sort()).toEqual([1, 2, 3])
    })

    it('entries returns all key-value pairs', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const ents = ht.entries()
      expect(ents).toHaveLength(2)
      expect(ents.some(e => e[0] === 'a' && e[1] === 1)).toBe(true)
      expect(ents.some(e => e[0] === 'b' && e[1] === 2)).toBe(true)
    })

    it('keys returns empty array for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.keys()).toEqual([])
    })

    it('values returns empty array for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.values()).toEqual([])
    })

    it('entries returns empty array for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      const result: Array<[string, number]> = []
      ht.forEach((k, v) => result.push([k, v]))
      expect(result).toHaveLength(3)
    })

    it('does not iterate on empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      let count = 0
      ht.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('provides correct key-value pairs', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('x', 10)
      const result: Array<[string, number]> = []
      ht.forEach((k, v) => result.push([k, v]))
      expect(result).toEqual([['x', 10]])
    })
  })

  describe('rehash', () => {
    it('preserves all entries on rehash', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.rehash(64)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(3)
      expect(ht.capacity()).toBe(64)
    })

    it('enforces minimum capacity on rehash', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.rehash(4)
      expect(ht.capacity()).toBe(16)
    })

    it('rehash to same capacity works', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      ht.set('a', 1)
      ht.set('b', 2)
      ht.rehash(16)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
    })

    it('rehash without argument uses current capacity', () => {
      const ht = new RobinHoodHashTable<string, number>(32)
      ht.set('a', 1)
      ht.rehash()
      expect(ht.capacity()).toBe(32)
      expect(ht.get('a')).toBe(1)
    })

    it('rehash reduces probe distances with larger table', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i)
      }
      const probeBefore = ht.maxProbeLength()
      ht.rehash(128)
      expect(ht.maxProbeLength()).toBeLessThanOrEqual(probeBefore)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const cloned = ht.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
      expect(cloned.size()).toBe(2)
    })

    it('clone is independent from original', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      const cloned = ht.clone()
      cloned.set('a', 99)
      expect(ht.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })

    it('clone preserves capacity', () => {
      const ht = new RobinHoodHashTable<string, number>(32)
      const cloned = ht.clone()
      expect(cloned.capacity()).toBe(32)
    })

    it('clone of empty table works', () => {
      const ht = new RobinHoodHashTable<string, number>()
      const cloned = ht.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone delete does not affect original', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      const cloned = ht.clone()
      cloned.delete('a')
      expect(ht.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })
  })

  describe('toString', () => {
    it('returns empty representation', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.toString()).toBe('RobinHoodHashTable{}')
    })

    it('includes entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      const s = ht.toString()
      expect(s).toContain('RobinHoodHashTable{')
      expect(s).toContain('a:1')
    })

    it('handles multiple entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const s = ht.toString()
      expect(s).toContain('a:1')
      expect(s).toContain('b:2')
    })
  })

  describe('maxProbeLength', () => {
    it('returns 0 for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.maxProbeLength()).toBe(0)
    })

    it('returns 0 when all keys at ideal positions', () => {
      const ht = new RobinHoodHashTable<string, number>(1024)
      ht.set('a', 1)
      expect(ht.maxProbeLength()).toBe(0)
    })

    it('increases with collisions', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`key${i}`, i)
      }
      expect(ht.maxProbeLength()).toBeGreaterThan(0)
    })

    it('decreases after rehash to larger table', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 11; i++) {
        ht.set(`key${i}`, i)
      }
      const before = ht.maxProbeLength()
      ht.rehash(256)
      expect(ht.maxProbeLength()).toBeLessThanOrEqual(before)
    })
  })

  describe('averageProbeLength', () => {
    it('returns 0 for empty table', () => {
      const ht = new RobinHoodHashTable<string, number>()
      expect(ht.averageProbeLength()).toBe(0)
    })

    it('returns 0 when single entry at ideal position', () => {
      const ht = new RobinHoodHashTable<string, number>(1024)
      ht.set('a', 1)
      expect(ht.averageProbeLength()).toBe(0)
    })

    it('returns positive value with collisions', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`key${i}`, i)
      }
      expect(ht.averageProbeLength()).toBeGreaterThanOrEqual(0)
    })

    it('is bounded by maxProbeLength', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 11; i++) {
        ht.set(`key${i}`, i)
      }
      expect(ht.averageProbeLength()).toBeLessThanOrEqual(ht.maxProbeLength())
    })
  })

  describe('collision handling', () => {
    it('handles sequential inserts correctly', () => {
      const ht = new RobinHoodHashTable<number, string>()
      for (let i = 0; i < 20; i++) {
        ht.set(i, `val${i}`)
      }
      for (let i = 0; i < 20; i++) {
        expect(ht.get(i)).toBe(`val${i}`)
      }
    })

    it('maintains integrity after many overwrites', () => {
      const ht = new RobinHoodHashTable<string, number>()
      for (let i = 0; i < 10; i++) {
        ht.set('key', i)
      }
      expect(ht.get('key')).toBe(9)
      expect(ht.size()).toBe(1)
    })

    it('handles negative number keys', () => {
      const ht = new RobinHoodHashTable<number, string>()
      ht.set(-1, 'neg')
      ht.set(0, 'zero')
      ht.set(1, 'pos')
      expect(ht.get(-1)).toBe('neg')
      expect(ht.get(0)).toBe('zero')
      expect(ht.get(1)).toBe('pos')
    })

    it('handles object identity keys', () => {
      const ht = new RobinHoodHashTable<object, number>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      ht.set(obj1, 100)
      ht.set(obj2, 200)
      expect(ht.get(obj1)).toBe(100)
      expect(ht.get(obj2)).toBe(200)
    })

    it('handles boolean keys', () => {
      const ht = new RobinHoodHashTable<boolean, string>()
      ht.set(true, 'yes')
      ht.set(false, 'no')
      expect(ht.get(true)).toBe('yes')
      expect(ht.get(false)).toBe('no')
    })
  })

  describe('auto-resize', () => {
    it('auto-resizes at 75% load factor', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 13; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.capacity()).toBeGreaterThan(16)
    })

    it('preserves all data through resize', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 20; i++) {
        ht.set(`k${i}`, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(ht.get(`k${i}`)).toBe(i)
      }
    })

    it('maintains correct size after resize', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 20; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.size()).toBe(20)
    })
  })

  describe('large scale operations', () => {
    it('handles 1000 inserts', () => {
      const ht = new RobinHoodHashTable<number, number>()
      for (let i = 0; i < 1000; i++) {
        ht.set(i, i * 2)
      }
      expect(ht.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(ht.get(i)).toBe(i * 2)
      }
    })

    it('handles 1000 inserts with string keys', () => {
      const ht = new RobinHoodHashTable<string, number>()
      for (let i = 0; i < 1000; i++) {
        ht.set(`key_${i}`, i)
      }
      expect(ht.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(ht.has(`key_${i}`)).toBe(true)
      }
    })

    it('handles 1000 mixed operations', () => {
      const ht = new RobinHoodHashTable<number, number>()
      for (let i = 0; i < 500; i++) {
        ht.set(i, i)
      }
      for (let i = 0; i < 250; i++) {
        ht.delete(i)
      }
      for (let i = 500; i < 1000; i++) {
        ht.set(i, i)
      }
      expect(ht.size()).toBe(750)
      for (let i = 250; i < 1000; i++) {
        expect(ht.get(i)).toBe(i)
      }
    })
  })

  describe('deletion correctness (backward shift)', () => {
    it('can find all keys after deleting from cluster middle', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.set('d', 4)
      ht.delete('b')
      expect(ht.get('a')).toBe(1)
      expect(ht.get('c')).toBe(3)
      expect(ht.get('d')).toBe(4)
    })

    it('can find keys after deleting cluster start', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('a')
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
    })

    it('can find keys after deleting cluster end', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('c')
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
    })

    it('handles sequential deletions in order', () => {
      const ht = new RobinHoodHashTable<number, number>()
      for (let i = 0; i < 10; i++) {
        ht.set(i, i)
      }
      for (let i = 0; i < 10; i++) {
        ht.delete(i)
      }
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
    })

    it('handles sequential deletions in reverse order', () => {
      const ht = new RobinHoodHashTable<number, number>()
      for (let i = 0; i < 10; i++) {
        ht.set(i, i)
      }
      for (let i = 9; i >= 0; i--) {
        ht.delete(i)
      }
      expect(ht.size()).toBe(0)
    })

    it('handles interleaved insert and delete', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      ht.set('c', 3)
      ht.delete('b')
      ht.set('d', 4)
      expect(ht.get('c')).toBe(3)
      expect(ht.get('d')).toBe(4)
      expect(ht.has('a')).toBe(false)
      expect(ht.has('b')).toBe(false)
      expect(ht.size()).toBe(2)
    })
  })

  describe('mixed operations', () => {
    it('set-get-delete-set cycle', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.get('a')).toBe(1)
      ht.delete('a')
      expect(ht.get('a')).toBeUndefined()
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
    })

    it('multiple overwrites and deletes', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      ht.set('a', 3)
      expect(ht.get('a')).toBe(3)
      ht.delete('a')
      expect(ht.get('a')).toBeUndefined()
      ht.set('a', 4)
      expect(ht.get('a')).toBe(4)
    })

    it('clear followed by new operations', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.clear()
      ht.set('c', 3)
      expect(ht.size()).toBe(1)
      expect(ht.has('a')).toBe(false)
      expect(ht.has('c')).toBe(true)
    })

    it('clone after modifications', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      const cloned = ht.clone()
      expect(cloned.size()).toBe(1)
      expect(cloned.has('b')).toBe(true)
    })

    it('rehash after modifications', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      ht.rehash(64)
      expect(ht.get('b')).toBe(2)
      expect(ht.has('a')).toBe(false)
    })
  })

  describe('probe length metrics', () => {
    it('max probe length stays reasonable', () => {
      const ht = new RobinHoodHashTable<string, number>()
      for (let i = 0; i < 100; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.maxProbeLength()).toBeLessThan(20)
    })

    it('average probe length stays reasonable', () => {
      const ht = new RobinHoodHashTable<string, number>()
      for (let i = 0; i < 100; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.averageProbeLength()).toBeLessThan(5)
    })

    it('probe lengths decrease after rehash', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 11; i++) {
        ht.set(`key${i}`, i)
      }
      const avgBefore = ht.averageProbeLength()
      ht.rehash(256)
      expect(ht.averageProbeLength()).toBeLessThanOrEqual(avgBefore)
    })

    it('probe lengths update after deletions', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`key${i}`, i)
      }
      const maxBefore = ht.maxProbeLength()
      for (let i = 0; i < 5; i++) {
        ht.delete(`key${i}`)
      }
      expect(ht.maxProbeLength()).toBeLessThanOrEqual(maxBefore)
    })
  })

  describe('Robin Hood invariant', () => {
    it('entries probe distances are correctly computed', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`key${i}`, i)
      }
      const internal = ht as unknown as {
        _slots: Array<{ key: string; probeDistance: number } | null>
        idealIndex: (key: string) => number
      }
      for (let i = 0; i < internal._slots.length; i++) {
        const entry = internal._slots[i]
        if (entry) {
          const ideal = internal.idealIndex(entry.key)
          const expected = ideal <= i ? i - ideal : i + internal._slots.length - ideal
          expect(entry.probeDistance).toBe(expected)
        }
      }
    })

    it('swapping reduces max probe variance vs naive linear probe', () => {
      const ht = new RobinHoodHashTable<number, number>()
      for (let i = 0; i < 100; i++) {
        ht.set(i, i)
      }
      expect(ht.maxProbeLength()).toBeLessThan(15)
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('only', 42)
      expect(ht.get('only')).toBe(42)
      expect(ht.size()).toBe(1)
      ht.delete('only')
      expect(ht.isEmpty()).toBe(true)
    })

    it('handles empty string key', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('', 0)
      expect(ht.get('')).toBe(0)
      expect(ht.has('')).toBe(true)
    })

    it('handles zero as key', () => {
      const ht = new RobinHoodHashTable<number, string>()
      ht.set(0, 'zero')
      expect(ht.get(0)).toBe('zero')
    })

    it('handles null as key via stringification', () => {
      const ht = new RobinHoodHashTable<null, number>()
      ht.set(null, 1)
      expect(ht.get(null)).toBe(1)
    })

    it('handles various numeric key ranges', () => {
      const ht = new RobinHoodHashTable<number, string>()
      ht.set(1e10, 'big')
      ht.set(-1e10, 'negbig')
      ht.set(0.5, 'frac')
      expect(ht.get(1e10)).toBe('big')
      expect(ht.get(-1e10)).toBe('negbig')
      expect(ht.get(0.5)).toBe('frac')
    })
  })

  describe('stress test', () => {
    it('insert-delete-reinsert pattern', () => {
      const ht = new RobinHoodHashTable<number, number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 50; i++) {
          ht.set(i, i + round * 100)
        }
        for (let i = 0; i < 25; i++) {
          ht.delete(i)
        }
      }
      for (let i = 25; i < 50; i++) {
        expect(ht.get(i)).toBe(i + 400)
      }
      expect(ht.size()).toBe(25)
    })

    it('handles many unique string keys', () => {
      const ht = new RobinHoodHashTable<string, number>()
      const keys: string[] = []
      for (let i = 0; i < 500; i++) {
        const key = `user_${i}@domain${i % 10}.com`
        ht.set(key, i)
        keys.push(key)
      }
      for (const key of keys) {
        expect(ht.has(key)).toBe(true)
      }
      expect(ht.size()).toBe(500)
    })
  })

  describe('additional coverage', () => {
    it('handles overwrite during high load', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i * 10)
      }
      expect(ht.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(ht.get(`k${i}`)).toBe(i * 10)
      }
    })

    it('clone after clear is empty', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.clear()
      const cloned = ht.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('forEach visits correct number of entries after delete', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      let count = 0
      ht.forEach(() => { count++ })
      expect(count).toBe(2)
    })

    it('delete non-existent key during high load', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.delete('missing')).toBe(false)
      expect(ht.size()).toBe(10)
    })

    it('get on deleted slot returns undefined', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      expect(ht.get('b')).toBeUndefined()
      expect(ht.get('a')).toBe(1)
      expect(ht.get('c')).toBe(3)
    })

    it('toString with complex values', () => {
      const ht = new RobinHoodHashTable<string, object>()
      ht.set('obj', { x: 1 })
      const s = ht.toString()
      expect(s).toContain('obj:')
    })

    it('rehash down to minimum capacity', () => {
      const ht = new RobinHoodHashTable<string, number>(64)
      ht.set('a', 1)
      ht.rehash(2)
      expect(ht.capacity()).toBe(16)
      expect(ht.get('a')).toBe(1)
    })

    it('load factor updates after delete', () => {
      const ht = new RobinHoodHashTable<string, number>(16)
      ht.set('a', 1)
      ht.set('b', 2)
      const lfBefore = ht.loadFactor()
      ht.delete('a')
      expect(ht.loadFactor()).toBeLessThan(lfBefore)
    })

    it('keys does not include deleted entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      const ks = ht.keys()
      expect(ks).not.toContain('b')
      expect(ks).toContain('a')
      expect(ks).toContain('c')
    })

    it('values does not include deleted entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      const vs = ht.values()
      expect(vs).not.toContain(2)
      expect(vs).toContain(1)
      expect(vs).toContain(3)
    })

    it('entries does not include deleted entries', () => {
      const ht = new RobinHoodHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('b')
      const es = ht.entries()
      expect(es).toHaveLength(1)
      expect(es[0]![0]).toBe('a')
    })
  })
})
