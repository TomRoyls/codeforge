import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooHashTable } from '../../src/core/cuckoo-hash/cuckoo-hash.js'

describe('CuckooHashTable', () => {
  describe('constructor', () => {
    it('should create table with default capacity', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.capacity()).toBe(16)
    })

    it('should create table with custom capacity', () => {
      const table = new CuckooHashTable<string, number>(32)
      expect(table.capacity()).toBe(32)
    })

    it('should enforce minimum capacity of 2', () => {
      const table = new CuckooHashTable<string, number>(1)
      expect(table.capacity()).toBe(2)
    })

    it('should start empty', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('should handle capacity of 2', () => {
      const table = new CuckooHashTable<string, number>(2)
      expect(table.capacity()).toBe(2)
    })

    it('should handle zero capacity gracefully', () => {
      const table = new CuckooHashTable<string, number>(0)
      expect(table.capacity()).toBe(2)
    })

    it('should handle negative capacity gracefully', () => {
      const table = new CuckooHashTable<string, number>(-5)
      expect(table.capacity()).toBe(2)
    })
  })

  describe('set and get', () => {
    let table: CuckooHashTable<string, number>

    beforeEach(() => {
      table = new CuckooHashTable<string, number>()
    })

    it('should insert a key-value pair', () => {
      expect(table.set('a', 1)).toBe(true)
      expect(table.get('a')).toBe(1)
    })

    it('should return true on successful insert', () => {
      expect(table.set('x', 10)).toBe(true)
    })

    it('should get undefined for missing key', () => {
      expect(table.get('missing')).toBeUndefined()
    })

    it('should insert multiple keys', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBe(3)
    })

    it('should update existing key', () => {
      table.set('a', 1)
      table.set('a', 99)
      expect(table.get('a')).toBe(99)
    })

    it('should return true when updating existing key', () => {
      table.set('a', 1)
      expect(table.set('a', 2)).toBe(true)
    })

    it('should not increase size on update', () => {
      table.set('a', 1)
      expect(table.size()).toBe(1)
      table.set('a', 2)
      expect(table.size()).toBe(1)
    })

    it('should handle numeric keys', () => {
      const t = new CuckooHashTable<number, string>()
      t.set(1, 'one')
      t.set(2, 'two')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('should handle object-like string keys', () => {
      table.set('key-1', 100)
      table.set('key-2', 200)
      expect(table.get('key-1')).toBe(100)
      expect(table.get('key-2')).toBe(200)
    })

    it('should handle null value', () => {
      const t = new CuckooHashTable<string, null>()
      t.set('a', null)
      expect(t.get('a')).toBeNull()
    })

    it('should handle undefined value', () => {
      const t = new CuckooHashTable<string, undefined>()
      t.set('a', undefined)
      expect(t.get('a')).toBeUndefined()
    })

    it('should handle boolean values', () => {
      const t = new CuckooHashTable<string, boolean>()
      t.set('t', true)
      t.set('f', false)
      expect(t.get('t')).toBe(true)
      expect(t.get('f')).toBe(false)
    })

    it('should handle object values', () => {
      const t = new CuckooHashTable<string, { x: number }>()
      t.set('a', { x: 1 })
      expect(t.get('a')?.x).toBe(1)
    })

    it('should handle array values', () => {
      const t = new CuckooHashTable<string, number[]>()
      t.set('a', [1, 2, 3])
      expect(t.get('a')).toEqual([1, 2, 3])
    })

    it('should insert keys with same hash region', () => {
      for (let i = 0; i < 10; i++) {
        table.set(`key${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        expect(table.get(`key${i}`)).toBe(i)
      }
    })
  })

  describe('has', () => {
    let table: CuckooHashTable<string, number>

    beforeEach(() => {
      table = new CuckooHashTable<string, number>()
    })

    it('should return true for existing key', () => {
      table.set('a', 1)
      expect(table.has('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(table.has('a')).toBe(false)
    })

    it('should return false after deletion', () => {
      table.set('a', 1)
      table.delete('a')
      expect(table.has('a')).toBe(false)
    })

    it('should return true for multiple existing keys', () => {
      table.set('a', 1)
      table.set('b', 2)
      expect(table.has('a')).toBe(true)
      expect(table.has('b')).toBe(true)
    })
  })

  describe('delete', () => {
    let table: CuckooHashTable<string, number>

    beforeEach(() => {
      table = new CuckooHashTable<string, number>()
    })

    it('should delete existing key', () => {
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.get('a')).toBeUndefined()
    })

    it('should return false for missing key', () => {
      expect(table.delete('missing')).toBe(false)
    })

    it('should decrease size on deletion', () => {
      table.set('a', 1)
      table.set('b', 2)
      expect(table.size()).toBe(2)
      table.delete('a')
      expect(table.size()).toBe(1)
    })

    it('should not affect other entries on deletion', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('b')
      expect(table.get('a')).toBe(1)
      expect(table.get('c')).toBe(3)
    })

    it('should handle deleting then re-inserting', () => {
      table.set('a', 1)
      table.delete('a')
      table.set('a', 2)
      expect(table.get('a')).toBe(2)
    })

    it('should delete from table1 position', () => {
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.has('a')).toBe(false)
    })

    it('should handle delete on empty table', () => {
      expect(table.delete('x')).toBe(false)
    })

    it('should handle multiple deletions', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.delete('a')).toBe(true)
      expect(table.delete('b')).toBe(true)
      expect(table.delete('c')).toBe(true)
      expect(table.size()).toBe(0)
    })

    it('should handle deleting same key twice', () => {
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.delete('a')).toBe(false)
    })
  })

  describe('size and isEmpty', () => {
    let table: CuckooHashTable<string, number>

    beforeEach(() => {
      table = new CuckooHashTable<string, number>()
    })

    it('should return 0 for empty table', () => {
      expect(table.size()).toBe(0)
    })

    it('should track size correctly', () => {
      table.set('a', 1)
      expect(table.size()).toBe(1)
      table.set('b', 2)
      expect(table.size()).toBe(2)
    })

    it('should not increase size on update', () => {
      table.set('a', 1)
      table.set('a', 2)
      expect(table.size()).toBe(1)
    })

    it('should decrease size on delete', () => {
      table.set('a', 1)
      table.delete('a')
      expect(table.size()).toBe(0)
    })

    it('isEmpty should return true when empty', () => {
      expect(table.isEmpty()).toBe(true)
    })

    it('isEmpty should return false when not empty', () => {
      table.set('a', 1)
      expect(table.isEmpty()).toBe(false)
    })

    it('isEmpty should return true after clearing all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      table.delete('b')
      expect(table.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.clear()
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('should preserve capacity after clear', () => {
      const table = new CuckooHashTable<string, number>(32)
      table.set('a', 1)
      table.clear()
      expect(table.capacity()).toBe(32)
    })

    it('should allow insertion after clear', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.get('b')).toBe(2)
      expect(table.size()).toBe(1)
    })

    it('should handle clearing empty table', () => {
      const table = new CuckooHashTable<string, number>()
      table.clear()
      expect(table.size()).toBe(0)
    })

    it('should reset maxChainLength', () => {
      const table = new CuckooHashTable<string, number>()
      for (let i = 0; i < 20; i++) {
        table.set(`k${i}`, i)
      }
      const prevMax = table.maxChainLength()
      table.clear()
      expect(table.maxChainLength()).toBe(0)
      expect(prevMax).toBeGreaterThanOrEqual(0)
    })
  })

  describe('capacity and loadFactor', () => {
    it('should return initial capacity', () => {
      const table = new CuckooHashTable<string, number>(64)
      expect(table.capacity()).toBe(64)
    })

    it('should calculate load factor correctly', () => {
      const table = new CuckooHashTable<string, number>(16)
      expect(table.loadFactor()).toBe(0)
      table.set('a', 1)
      expect(table.loadFactor()).toBeCloseTo(1 / 16)
    })

    it('should increase load factor with more inserts', () => {
      const table = new CuckooHashTable<string, number>(16)
      for (let i = 0; i < 8; i++) {
        table.set(`k${i}`, i)
      }
      expect(table.loadFactor()).toBe(0.5)
    })

    it('should decrease load factor after delete', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.loadFactor()).toBeCloseTo(1 / 16)
    })
  })

  describe('keys, values, entries', () => {
    let table: CuckooHashTable<string, number>

    beforeEach(() => {
      table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
    })

    it('should return all keys', () => {
      const k = table.keys()
      expect(k.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return all values', () => {
      const v = table.values()
      expect(v.sort()).toEqual([1, 2, 3])
    })

    it('should return all entries', () => {
      const e = table.entries()
      expect(e.length).toBe(3)
      expect(e.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should return empty arrays for empty table', () => {
      const t = new CuckooHashTable<string, number>()
      expect(t.keys()).toEqual([])
      expect(t.values()).toEqual([])
      expect(t.entries()).toEqual([])
    })

    it('should reflect deletions in keys', () => {
      table.delete('b')
      const k = table.keys()
      expect(k.sort()).toEqual(['a', 'c'])
    })

    it('should reflect updates in values', () => {
      table.set('a', 99)
      const v = table.values()
      expect(v.sort()).toEqual([2, 3, 99])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const result: Array<[string, number]> = []
      table.forEach((k, v) => result.push([k, v]))
      expect(result.length).toBe(3)
      expect(result.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should not iterate on empty table', () => {
      const table = new CuckooHashTable<string, number>()
      let count = 0
      table.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate after deletions', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      const keys: string[] = []
      table.forEach(k => keys.push(k))
      expect(keys).toEqual(['b'])
    })
  })

  describe('rehash', () => {
    it('should rehash with new capacity', () => {
      const table = new CuckooHashTable<string, number>(4)
      table.set('a', 1)
      table.set('b', 2)
      table.rehash(32)
      expect(table.capacity()).toBe(32)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })

    it('should rehash with same capacity', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.rehash()
      expect(table.get('a')).toBe(1)
    })

    it('should preserve all entries through rehash', () => {
      const table = new CuckooHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        table.set(`k${i}`, i)
      }
      table.rehash(64)
      for (let i = 0; i < 10; i++) {
        expect(table.get(`k${i}`)).toBe(i)
      }
      expect(table.size()).toBe(10)
    })

    it('should enforce minimum capacity on rehash', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.rehash(1)
      expect(table.capacity()).toBe(2)
      expect(table.get('a')).toBe(1)
    })

    it('should change seeds on rehash', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const oldMax = table.maxChainLength()
      table.rehash()
      expect(table.get('a')).toBe(1)
      expect(oldMax).toBeGreaterThanOrEqual(0)
    })
  })

  describe('clone', () => {
    it('should clone the table', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('should create independent copy', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const cloned = table.clone()
      cloned.set('a', 99)
      expect(table.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })

    it('should preserve capacity in clone', () => {
      const table = new CuckooHashTable<string, number>(64)
      table.set('a', 1)
      const cloned = table.clone()
      expect(cloned.capacity()).toBe(64)
    })

    it('should preserve size in clone', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const cloned = table.clone()
      expect(cloned.size()).toBe(3)
    })

    it('should clone empty table', () => {
      const table = new CuckooHashTable<string, number>()
      const cloned = table.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should handle deletion from clone not affecting original', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      cloned.delete('a')
      expect(table.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('should handle addition to clone not affecting original', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const cloned = table.clone()
      cloned.set('b', 2)
      expect(table.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const s = table.toString()
      expect(s).toContain('a:1')
      expect(s).toContain('CuckooHashTable')
    })

    it('should return empty representation for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.toString()).toBe('CuckooHashTable{}')
    })

    it('should show multiple entries', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('x', 10)
      table.set('y', 20)
      const s = table.toString()
      expect(s).toContain('x:10')
      expect(s).toContain('y:20')
    })
  })

  describe('maxChainLength', () => {
    it('should return 0 for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.maxChainLength()).toBe(0)
    })

    it('should track displacement chain length', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      expect(table.maxChainLength()).toBeGreaterThanOrEqual(0)
    })

    it('should update with more inserts', () => {
      const table = new CuckooHashTable<string, number>(4)
      for (let i = 0; i < 3; i++) {
        table.set(`k${i}`, i)
      }
      expect(table.maxChainLength()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('collisions and stress', () => {
    it('should handle many inserts (1000+)', () => {
      const table = new CuckooHashTable<number, number>(256)
      for (let i = 0; i < 1000; i++) {
        expect(table.set(i, i * 10)).toBe(true)
      }
      for (let i = 0; i < 1000; i++) {
        expect(table.get(i)).toBe(i * 10)
      }
      expect(table.size()).toBe(1000)
    })

    it('should handle sequential string keys', () => {
      const table = new CuckooHashTable<string, number>()
      for (let i = 0; i < 500; i++) {
        table.set(`key-${i}`, i)
      }
      for (let i = 0; i < 500; i++) {
        expect(table.get(`key-${i}`)).toBe(i)
      }
    })

    it('should handle many deletions after inserts', () => {
      const table = new CuckooHashTable<number, number>(64)
      for (let i = 0; i < 100; i++) {
        table.set(i, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(table.delete(i)).toBe(true)
      }
      expect(table.size()).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(table.get(i)).toBe(i)
      }
    })

    it('should handle interleaved insert and delete', () => {
      const table = new CuckooHashTable<string, number>()
      for (let i = 0; i < 100; i++) {
        table.set(`k${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        table.delete(`k${i}`)
      }
      for (let i = 100; i < 150; i++) {
        table.set(`k${i}`, i)
      }
      expect(table.size()).toBe(100)
      for (let i = 50; i < 150; i++) {
        expect(table.get(`k${i}`)).toBe(i)
      }
    })

    it('should survive auto-rehash on cycle detection', () => {
      const table = new CuckooHashTable<string, number>(4)
      for (let i = 0; i < 100; i++) {
        table.set(`k${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(table.get(`k${i}`)).toBe(i)
      }
    })

    it('should handle update in dense table', () => {
      const table = new CuckooHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        table.set(`k${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        table.set(`k${i}`, i * 100)
      }
      for (let i = 0; i < 10; i++) {
        expect(table.get(`k${i}`)).toBe(i * 100)
      }
      expect(table.size()).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('only', 42)
      expect(table.get('only')).toBe(42)
      expect(table.has('only')).toBe(true)
      expect(table.size()).toBe(1)
      expect(table.isEmpty()).toBe(false)
      table.delete('only')
      expect(table.get('only')).toBeUndefined()
      expect(table.has('only')).toBe(false)
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('should handle empty string key', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('', 0)
      expect(table.get('')).toBe(0)
      expect(table.has('')).toBe(true)
    })

    it('should handle single character keys', () => {
      const table = new CuckooHashTable<string, number>()
      for (let i = 0; i < 26; i++) {
        table.set(String.fromCharCode(97 + i), i)
      }
      for (let i = 0; i < 26; i++) {
        expect(table.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })

    it('should handle 0 and false as values', () => {
      const t1 = new CuckooHashTable<string, number>()
      t1.set('a', 0)
      expect(t1.get('a')).toBe(0)
      const t2 = new CuckooHashTable<string, boolean>()
      t2.set('a', false)
      expect(t2.get('a')).toBe(false)
    })

    it('should handle very large values', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', Number.MAX_SAFE_INTEGER)
      expect(table.get('a')).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle special characters in keys', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('!@#$%', 1)
      table.set('你好', 2)
      table.set('🎉', 3)
      expect(table.get('!@#$%')).toBe(1)
      expect(table.get('你好')).toBe(2)
      expect(table.get('🎉')).toBe(3)
    })

    it('should distinguish numeric string keys from number keys', () => {
      const t = new CuckooHashTable<number, string>()
      t.set(1, 'number')
      expect(t.get(1)).toBe('number')
      expect(t.get('1' as unknown as number)).toBeUndefined()
    })

    it('should handle rehash to smaller capacity', () => {
      const table = new CuckooHashTable<string, number>(64)
      table.set('a', 1)
      table.rehash(4)
      expect(table.get('a')).toBe(1)
      expect(table.capacity()).toBe(4)
    })

    it('should handle clear then re-use', () => {
      const table = new CuckooHashTable<string, number>()
      for (let i = 0; i < 50; i++) {
        table.set(`k${i}`, i)
      }
      table.clear()
      expect(table.size()).toBe(0)
      for (let i = 0; i < 50; i++) {
        table.set(`new${i}`, i * 2)
      }
      for (let i = 0; i < 50; i++) {
        expect(table.get(`new${i}`)).toBe(i * 2)
      }
    })

    it('should handle clone after many operations', () => {
      const table = new CuckooHashTable<number, number>(16)
      for (let i = 0; i < 50; i++) {
        table.set(i, i)
      }
      for (let i = 0; i < 25; i++) {
        table.delete(i)
      }
      const cloned = table.clone()
      expect(cloned.size()).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(cloned.get(i)).toBe(i)
      }
    })

    it('should handle entries after rehash', () => {
      const table = new CuckooHashTable<string, number>(4)
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.rehash(32)
      const entries = table.entries()
      expect(entries.length).toBe(3)
      const sorted = entries.sort((a, b) => a[1] - b[1])
      expect(sorted).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should handle forEach correctly after rehash', () => {
      const table = new CuckooHashTable<string, number>(4)
      table.set('x', 10)
      table.set('y', 20)
      table.rehash(32)
      const result: Array<[string, number]> = []
      table.forEach((k, v) => result.push([k, v]))
      expect(result.sort((a, b) => a[1] - b[1])).toEqual([
        ['x', 10],
        ['y', 20],
      ])
    })

    it('should maintain correctness with large number of operations', () => {
      const table = new CuckooHashTable<number, number>(64)
      const added = new Set<number>()
      for (let i = 0; i < 2000; i++) {
        const key = Math.floor(Math.random() * 500)
        if (!added.has(key)) {
          table.set(key, key)
          added.add(key)
        }
      }
      for (const key of added) {
        expect(table.has(key)).toBe(true)
        expect(table.get(key)).toBe(key)
      }
    })
  })

  describe('deletion correctness', () => {
    it('should correctly delete and verify remaining entries', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.set('d', 4)
      table.set('e', 5)
      table.delete('c')
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBeUndefined()
      expect(table.get('d')).toBe(4)
      expect(table.get('e')).toBe(5)
    })

    it('should handle delete all then re-add', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      table.delete('b')
      expect(table.size()).toBe(0)
      table.set('a', 10)
      table.set('b', 20)
      expect(table.get('a')).toBe(10)
      expect(table.get('b')).toBe(20)
      expect(table.size()).toBe(2)
    })

    it('should handle delete non-existent after previous delete', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.delete('a')
      expect(table.delete('a')).toBe(false)
    })

    it('should not corrupt table after partial deletion', () => {
      const table = new CuckooHashTable<number, number>(16)
      for (let i = 0; i < 20; i++) {
        table.set(i, i * 2)
      }
      for (let i = 0; i < 10; i++) {
        table.delete(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(table.get(i)).toBeUndefined()
      }
      for (let i = 10; i < 20; i++) {
        expect(table.get(i)).toBe(i * 2)
      }
    })
  })

  describe('update existing key', () => {
    it('should update value in place', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 2)
      expect(table.get('a')).toBe(2)
    })

    it('should not change size on update', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const sizeBefore = table.size()
      table.set('a', 2)
      expect(table.size()).toBe(sizeBefore)
    })

    it('should update entries correctly', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('a', 100)
      const entries = table.entries()
      expect(entries.length).toBe(2)
      const sorted = entries.sort((a, b) => a[1] - b[1])
      expect(sorted[0]).toEqual(['b', 2])
      expect(sorted[1]).toEqual(['a', 100])
    })

    it('should handle multiple updates to same key', () => {
      const table = new CuckooHashTable<string, number>()
      for (let i = 0; i < 10; i++) {
        table.set('a', i)
      }
      expect(table.get('a')).toBe(9)
      expect(table.size()).toBe(1)
    })

    it('should reflect updated value in forEach', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 99)
      const result: Array<[string, number]> = []
      table.forEach((k, v) => result.push([k, v]))
      expect(result).toEqual([['a', 99]])
    })

    it('should reflect updated value in values', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 50)
      expect(table.values()).toEqual([50])
    })
  })
})
