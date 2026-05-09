import { describe, it, expect, beforeEach } from 'vitest'
import { HopscotchHashTable } from '../../src/core/hopscotch-hash/hopscotch-hash.js'

describe('HopscotchHashTable', () => {
  describe('constructor', () => {
    it('should create table with default capacity', () => {
      const table = new HopscotchHashTable<string, number>()
      expect(table.capacity()).toBe(16)
    })

    it('should create table with custom capacity', () => {
      const table = new HopscotchHashTable<string, number>(64)
      expect(table.capacity()).toBe(64)
    })

    it('should enforce minimum capacity of 16', () => {
      const table = new HopscotchHashTable<string, number>(4)
      expect(table.capacity()).toBe(16)
    })

    it('should start empty', () => {
      const table = new HopscotchHashTable<string, number>()
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('should handle zero capacity gracefully', () => {
      const table = new HopscotchHashTable<string, number>(0)
      expect(table.capacity()).toBe(16)
    })

    it('should handle negative capacity gracefully', () => {
      const table = new HopscotchHashTable<string, number>(-10)
      expect(table.capacity()).toBe(16)
    })

    it('should handle undefined capacity', () => {
      const table = new HopscotchHashTable<string, number>(undefined)
      expect(table.capacity()).toBe(16)
    })

    it('should report zero load factor when empty', () => {
      const table = new HopscotchHashTable<string, number>()
      expect(table.loadFactor()).toBe(0)
    })
  })

  describe('set and get', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should insert a key-value pair', () => {
      table.set('a', 1)
      expect(table.get('a')).toBe(1)
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

    it('should not change size when updating', () => {
      table.set('a', 1)
      expect(table.size()).toBe(1)
      table.set('a', 2)
      expect(table.size()).toBe(1)
    })

    it('should handle number keys', () => {
      const t = new HopscotchHashTable<number, string>()
      t.set(1, 'one')
      t.set(2, 'two')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('should handle object values', () => {
      const t = new HopscotchHashTable<string, { x: number }>()
      t.set('a', { x: 1 })
      t.set('b', { x: 2 })
      expect(t.get('a')!.x).toBe(1)
      expect(t.get('b')!.x).toBe(2)
    })

    it('should handle null values', () => {
      const t = new HopscotchHashTable<string, null>()
      t.set('a', null)
      expect(t.get('a')).toBeNull()
    })

    it('should handle undefined values', () => {
      const t = new HopscotchHashTable<string, number | undefined>()
      t.set('a', undefined)
      expect(t.get('a')).toBeUndefined()
      expect(t.has('a')).toBe(true)
    })

    it('should handle boolean values', () => {
      const t = new HopscotchHashTable<string, boolean>()
      t.set('t', true)
      t.set('f', false)
      expect(t.get('t')).toBe(true)
      expect(t.get('f')).toBe(false)
    })

    it('should handle empty string keys', () => {
      table.set('', 42)
      expect(table.get('')).toBe(42)
    })

    it('should handle single character keys', () => {
      for (let i = 97; i < 123; i++) {
        table.set(String.fromCharCode(i), i)
      }
      for (let i = 97; i < 123; i++) {
        expect(table.get(String.fromCharCode(i))).toBe(i)
      }
    })

    it('should overwrite value multiple times', () => {
      table.set('a', 1)
      table.set('a', 2)
      table.set('a', 3)
      expect(table.get('a')).toBe(3)
    })

    it('should handle 20 insertions', () => {
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.size()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(table.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle insert delete reinsert cycle', () => {
      table.set('a', 1)
      expect(table.get('a')).toBe(1)
      table.delete('a')
      expect(table.get('a')).toBeUndefined()
      table.set('a', 2)
      expect(table.get('a')).toBe(2)
    })

    it('should handle large string keys', () => {
      const longKey = 'x'.repeat(1000)
      table.set(longKey, 42)
      expect(table.get(longKey)).toBe(42)
    })

    it('should handle special character keys', () => {
      table.set('key with spaces', 1)
      table.set('key\nwith\nnewlines', 2)
      table.set('key\twith\ttabs', 3)
      expect(table.get('key with spaces')).toBe(1)
      expect(table.get('key\nwith\nnewlines')).toBe(2)
      expect(table.get('key\twith\ttabs')).toBe(3)
    })

    it('should handle unicode keys', () => {
      table.set('日本語', 1)
      table.set('中文', 2)
      table.set('한국어', 3)
      table.set('🌍🌎🌏', 4)
      expect(table.get('日本語')).toBe(1)
      expect(table.get('中文')).toBe(2)
      expect(table.get('한국어')).toBe(3)
      expect(table.get('🌍🌎🌏')).toBe(4)
    })
  })

  describe('has', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should return false for missing key', () => {
      expect(table.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      table.set('a', 1)
      expect(table.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      table.set('a', 1)
      table.delete('a')
      expect(table.has('a')).toBe(false)
    })

    it('should return true for key with zero value', () => {
      table.set('a', 0)
      expect(table.has('a')).toBe(true)
    })

    it('should return true for key with null value', () => {
      const t = new HopscotchHashTable<string, null>()
      t.set('a', null)
      expect(t.has('a')).toBe(true)
    })

    it('should return true for key with false value', () => {
      const t = new HopscotchHashTable<string, boolean>()
      t.set('a', false)
      expect(t.has('a')).toBe(true)
    })

    it('should return true after value update', () => {
      table.set('a', 1)
      table.set('a', 2)
      expect(table.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should delete existing key', () => {
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.get('a')).toBeUndefined()
    })

    it('should return false for missing key', () => {
      expect(table.delete('missing')).toBe(false)
    })

    it('should decrement size on delete', () => {
      table.set('a', 1)
      table.set('b', 2)
      expect(table.size()).toBe(2)
      table.delete('a')
      expect(table.size()).toBe(1)
    })

    it('should handle delete from empty table', () => {
      expect(table.delete('a')).toBe(false)
      expect(table.size()).toBe(0)
    })

    it('should handle delete then reinsert', () => {
      table.set('a', 1)
      table.delete('a')
      table.set('a', 2)
      expect(table.get('a')).toBe(2)
      expect(table.size()).toBe(1)
    })

    it('should handle delete of all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('a')
      table.delete('b')
      table.delete('c')
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('should handle double delete of same key', () => {
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.delete('a')).toBe(false)
    })

    it('should not affect other entries on delete', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('b')
      expect(table.get('a')).toBe(1)
      expect(table.get('c')).toBe(3)
      expect(table.get('b')).toBeUndefined()
    })

    it('should handle delete after many insertions', () => {
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      table.delete('key10')
      expect(table.get('key10')).toBeUndefined()
      expect(table.size()).toBe(19)
      for (let i = 0; i < 20; i++) {
        if (i !== 10) {
          expect(table.get(`key${i}`)).toBe(i)
        }
      }
    })

    it('should handle delete after resize', () => {
      for (let i = 0; i < 15; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.delete('key5')).toBe(true)
      expect(table.get('key5')).toBeUndefined()
    })

    it('should handle delete with number keys', () => {
      const t = new HopscotchHashTable<number, string>()
      t.set(1, 'one')
      t.set(42, 'forty-two')
      t.delete(1)
      expect(t.get(1)).toBeUndefined()
      expect(t.get(42)).toBe('forty-two')
    })

    it('should handle delete of updated key', () => {
      table.set('a', 1)
      table.set('a', 2)
      expect(table.delete('a')).toBe(true)
      expect(table.get('a')).toBeUndefined()
    })
  })

  describe('size and isEmpty', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should return 0 for empty table', () => {
      expect(table.size()).toBe(0)
    })

    it('should return true for isEmpty on new table', () => {
      expect(table.isEmpty()).toBe(true)
    })

    it('should increment size on insert', () => {
      table.set('a', 1)
      expect(table.size()).toBe(1)
    })

    it('should track size across multiple inserts', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.size()).toBe(3)
    })

    it('should return false for isEmpty after insert', () => {
      table.set('a', 1)
      expect(table.isEmpty()).toBe(false)
    })

    it('should return true for isEmpty after clear', () => {
      table.set('a', 1)
      table.clear()
      expect(table.isEmpty()).toBe(true)
    })

    it('should return true for isEmpty after deleting all', () => {
      table.set('a', 1)
      table.delete('a')
      expect(table.isEmpty()).toBe(true)
    })

    it('should not change size on update', () => {
      table.set('a', 1)
      table.set('a', 2)
      expect(table.size()).toBe(1)
    })
  })

  describe('clear', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should clear all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.clear()
      expect(table.size()).toBe(0)
      expect(table.get('a')).toBeUndefined()
      expect(table.get('b')).toBeUndefined()
    })

    it('should work on empty table', () => {
      table.clear()
      expect(table.size()).toBe(0)
    })

    it('should preserve capacity', () => {
      const t = new HopscotchHashTable<string, number>(64)
      t.set('a', 1)
      t.clear()
      expect(t.capacity()).toBe(64)
    })

    it('should allow insertions after clear', () => {
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.get('b')).toBe(2)
      expect(table.size()).toBe(1)
    })

    it('should reset load factor', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.clear()
      expect(table.loadFactor()).toBe(0)
    })
  })

  describe('capacity and loadFactor', () => {
    it('should return initial capacity', () => {
      const table = new HopscotchHashTable<string, number>(32)
      expect(table.capacity()).toBe(32)
    })

    it('should return default capacity', () => {
      const table = new HopscotchHashTable<string, number>()
      expect(table.capacity()).toBe(16)
    })

    it('should compute load factor correctly', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      expect(table.loadFactor()).toBe(1 / 16)
    })

    it('should update load factor after inserts', () => {
      const table = new HopscotchHashTable<string, number>()
      for (let i = 0; i < 8; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.loadFactor()).toBe(8 / table.capacity())
    })

    it('should update load factor after deletes', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.loadFactor()).toBe(1 / table.capacity())
    })

    it('should update capacity after auto resize', () => {
      const table = new HopscotchHashTable<string, number>()
      const initialCap = table.capacity()
      for (let i = 0; i < initialCap; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.capacity()).toBeGreaterThan(initialCap)
    })

    it('should have lower load factor after resize', () => {
      const table = new HopscotchHashTable<string, number>()
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.loadFactor()).toBeLessThan(0.75)
    })
  })

  describe('keys', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should return empty array for empty table', () => {
      expect(table.keys()).toEqual([])
    })

    it('should return all keys', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const keys = table.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('should not include deleted keys', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      const keys = table.keys()
      expect(keys).toHaveLength(1)
      expect(keys).toContain('b')
    })

    it('should include updated keys', () => {
      table.set('a', 1)
      table.set('a', 2)
      expect(table.keys()).toHaveLength(1)
    })

    it('should handle single entry', () => {
      table.set('x', 42)
      expect(table.keys()).toEqual(['x'])
    })

    it('should return correct keys after clear and reinsert', () => {
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.keys()).toEqual(['b'])
    })

    it('should handle number keys', () => {
      const t = new HopscotchHashTable<number, string>()
      t.set(1, 'a')
      t.set(2, 'b')
      const keys = t.keys()
      expect(keys).toHaveLength(2)
      expect(keys).toContain(1)
      expect(keys).toContain(2)
    })

    it('should reflect current state', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('b')
      const keys = table.keys()
      expect(keys).toHaveLength(2)
      expect(keys).not.toContain('b')
    })
  })

  describe('values', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should return empty array for empty table', () => {
      expect(table.values()).toEqual([])
    })

    it('should return all values', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const values = table.values()
      expect(values).toHaveLength(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should return updated values', () => {
      table.set('a', 1)
      table.set('a', 99)
      const values = table.values()
      expect(values).toEqual([99])
    })

    it('should not include deleted values', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.values()).toEqual([2])
    })

    it('should handle duplicate values', () => {
      table.set('a', 42)
      table.set('b', 42)
      const values = table.values()
      expect(values).toHaveLength(2)
      expect(values.every(v => v === 42)).toBe(true)
    })

    it('should handle single entry', () => {
      table.set('x', 42)
      expect(table.values()).toEqual([42])
    })

    it('should handle zero value', () => {
      table.set('a', 0)
      expect(table.values()).toEqual([0])
    })

    it('should handle object values', () => {
      const t = new HopscotchHashTable<string, { id: number }>()
      t.set('a', { id: 1 })
      t.set('b', { id: 2 })
      const values = t.values()
      expect(values).toHaveLength(2)
    })
  })

  describe('entries', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should return empty array for empty table', () => {
      expect(table.entries()).toEqual([])
    })

    it('should return all entries as key-value pairs', () => {
      table.set('a', 1)
      table.set('b', 2)
      const entries = table.entries()
      expect(entries).toHaveLength(2)
      const keys = entries.map(e => e[0])
      const vals = entries.map(e => e[1])
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('should reflect updates', () => {
      table.set('a', 1)
      table.set('a', 99)
      expect(table.entries()).toEqual([['a', 99]])
    })

    it('should not include deleted entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.entries()).toEqual([['b', 2]])
    })

    it('should return entries after clear and reinsert', () => {
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.entries()).toEqual([['b', 2]])
    })

    it('should return correct number of entries after resize', () => {
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.entries()).toHaveLength(20)
    })

    it('should produce entries usable as Map input', () => {
      table.set('a', 1)
      table.set('b', 2)
      const map = new Map(table.entries())
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('forEach', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should not call callback on empty table', () => {
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each entry', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('should pass correct key and value', () => {
      table.set('x', 42)
      let receivedKey: string | undefined
      let receivedValue: number | undefined
      table.forEach((key, value) => {
        receivedKey = key
        receivedValue = value
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })

    it('should iterate all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const keys: string[] = []
      const values: number[] = []
      table.forEach((key, value) => {
        keys.push(key)
        values.push(value)
      })
      expect(keys).toHaveLength(3)
      expect(values).toHaveLength(3)
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
      expect(values.sort()).toEqual([1, 2, 3])
    })

    it('should skip deleted entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      const keys: string[] = []
      table.forEach((key) => { keys.push(key) })
      expect(keys).toEqual(['b'])
    })

    it('should handle single entry', () => {
      table.set('a', 1)
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(1)
    })

    it('should handle many entries', () => {
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(20)
    })
  })

  describe('rehash', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should rehash to specified capacity', () => {
      table.set('a', 1)
      table.rehash(64)
      expect(table.capacity()).toBe(64)
    })

    it('should preserve all entries after rehash', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.rehash(64)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBe(3)
    })

    it('should preserve size after rehash', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.rehash(64)
      expect(table.size()).toBe(2)
    })

    it('should rehash to same capacity when no arg given', () => {
      table.set('a', 1)
      table.rehash()
      expect(table.get('a')).toBe(1)
      expect(table.size()).toBe(1)
    })

    it('should enforce minimum capacity on rehash', () => {
      table.set('a', 1)
      table.rehash(4)
      expect(table.capacity()).toBe(16)
    })

    it('should allow insertions after rehash', () => {
      table.set('a', 1)
      table.rehash(64)
      table.set('b', 2)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })

    it('should handle rehash on empty table', () => {
      table.rehash(32)
      expect(table.capacity()).toBe(32)
      expect(table.size()).toBe(0)
    })

    it('should handle rehash to smaller capacity', () => {
      const t = new HopscotchHashTable<string, number>(64)
      t.set('a', 1)
      t.set('b', 2)
      t.rehash(16)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('should update load factor after rehash to larger capacity', () => {
      table.set('a', 1)
      const lfBefore = table.loadFactor()
      table.rehash(128)
      const lfAfter = table.loadFactor()
      expect(lfAfter).toBeLessThan(lfBefore)
    })

    it('should handle multiple rehashes', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.rehash(32)
      table.rehash(64)
      table.rehash(128)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('should preserve size in clone', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      expect(cloned.size()).toBe(2)
    })

    it('should preserve capacity in clone', () => {
      const table = new HopscotchHashTable<string, number>(64)
      const cloned = table.clone()
      expect(cloned.capacity()).toBe(64)
    })

    it('should be independent from original', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      const cloned = table.clone()
      cloned.set('a', 99)
      expect(table.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })

    it('should not share state with original on delete', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      cloned.delete('a')
      expect(table.get('a')).toBe(1)
      expect(cloned.get('a')).toBeUndefined()
    })

    it('should clone empty table', () => {
      const table = new HopscotchHashTable<string, number>()
      const cloned = table.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve entries after clone modification', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      cloned.clear()
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })

    it('should handle clone of table with many entries', () => {
      const table = new HopscotchHashTable<string, number>()
      for (let i = 0; i < 50; i++) {
        table.set(`key${i}`, i)
      }
      const cloned = table.clone()
      expect(cloned.size()).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(cloned.get(`key${i}`)).toBe(i)
      }
    })

    it('should preserve load factor in clone', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      expect(cloned.loadFactor()).toBe(table.loadFactor())
    })

    it('should handle clone after rehash', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.rehash(64)
      const cloned = table.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.capacity()).toBe(64)
    })
  })

  describe('toString', () => {
    it('should return empty table string', () => {
      const table = new HopscotchHashTable<string, number>()
      expect(table.toString()).toBe('HopscotchHashTable{}')
    })

    it('should format single entry', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      expect(table.toString()).toContain('a:1')
    })

    it('should format multiple entries', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const str = table.toString()
      expect(str).toContain('a:1')
      expect(str).toContain('b:2')
    })

    it('should include class name', () => {
      const table = new HopscotchHashTable<string, number>()
      expect(table.toString()).toContain('HopscotchHashTable')
    })

    it('should handle complex value types', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('x', 42)
      const str = table.toString()
      expect(str).toContain('x:42')
    })
  })

  describe('containsValue', () => {
    let table: HopscotchHashTable<string, number>

    beforeEach(() => {
      table = new HopscotchHashTable<string, number>()
    })

    it('should return false for empty table', () => {
      expect(table.containsValue(1)).toBe(false)
    })

    it('should find existing value', () => {
      table.set('a', 42)
      expect(table.containsValue(42)).toBe(true)
    })

    it('should return false for missing value', () => {
      table.set('a', 1)
      expect(table.containsValue(99)).toBe(false)
    })

    it('should find value after update', () => {
      table.set('a', 1)
      table.set('a', 99)
      expect(table.containsValue(99)).toBe(true)
      expect(table.containsValue(1)).toBe(false)
    })

    it('should not find deleted value', () => {
      table.set('a', 42)
      table.delete('a')
      expect(table.containsValue(42)).toBe(false)
    })

    it('should find zero value', () => {
      table.set('a', 0)
      expect(table.containsValue(0)).toBe(true)
    })

    it('should use custom comparator', () => {
      const t = new HopscotchHashTable<string, { id: number }>()
      t.set('a', { id: 1 })
      t.set('b', { id: 2 })
      expect(t.containsValue({ id: 1 }, (a, b) => a.id === b.id)).toBe(true)
      expect(t.containsValue({ id: 99 }, (a, b) => a.id === b.id)).toBe(false)
    })

    it('should find value among many entries', () => {
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.containsValue(10)).toBe(true)
      expect(table.containsValue(99)).toBe(false)
    })
  })

  describe('collision handling', () => {
    it('should handle inserting many keys that may collide', () => {
      const table = new HopscotchHashTable<string, number>(16)
      for (let i = 0; i < 12; i++) {
        table.set(`key_${i}`, i)
      }
      for (let i = 0; i < 12; i++) {
        expect(table.get(`key_${i}`)).toBe(i)
      }
    })

    it('should handle delete and reinsert causing collisions', () => {
      const table = new HopscotchHashTable<string, number>(16)
      for (let i = 0; i < 10; i++) {
        table.set(`key${i}`, i)
      }
      table.delete('key5')
      table.delete('key3')
      table.set('key5', 55)
      table.set('key3', 33)
      expect(table.get('key5')).toBe(55)
      expect(table.get('key3')).toBe(33)
    })

    it('should handle sequential keys', () => {
      const table = new HopscotchHashTable<number, number>(16)
      for (let i = 0; i < 15; i++) {
        table.set(i, i * 10)
      }
      for (let i = 0; i < 15; i++) {
        expect(table.get(i)).toBe(i * 10)
      }
    })

    it('should handle keys with same hash prefix', () => {
      const table = new HopscotchHashTable<string, number>()
      const keys = ['abc', 'abc1', 'abc2', 'abc3', 'abc4', 'abc5']
      keys.forEach((k, i) => table.set(k, i))
      keys.forEach((k, i) => expect(table.get(k)).toBe(i))
    })

    it('should handle dense insertion pattern', () => {
      const table = new HopscotchHashTable<string, number>(16)
      const pairs: Array<[string, number]> = []
      for (let i = 0; i < 20; i++) {
        pairs.push([`k${i}`, i])
      }
      pairs.forEach(([k, v]) => table.set(k, v))
      pairs.forEach(([k, v]) => expect(table.get(k)).toBe(v))
    })
  })

  describe('auto-resize', () => {
    it('should auto-resize when load factor threshold reached', () => {
      const table = new HopscotchHashTable<string, number>(16)
      const initialCap = table.capacity()
      for (let i = 0; i < initialCap; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.capacity()).toBeGreaterThan(initialCap)
    })

    it('should preserve all data after auto-resize', () => {
      const table = new HopscotchHashTable<string, number>(16)
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(table.get(`key${i}`)).toBe(i)
      }
    })

    it('should allow continued insertions after resize', () => {
      const table = new HopscotchHashTable<string, number>(16)
      for (let i = 0; i < 100; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(table.get(`key${i}`)).toBe(i)
      }
    })

    it('should maintain correct size after resize', () => {
      const table = new HopscotchHashTable<string, number>(16)
      for (let i = 0; i < 20; i++) {
        table.set(`key${i}`, i)
      }
      expect(table.size()).toBe(20)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 insertions', () => {
      const table = new HopscotchHashTable<number, number>()
      for (let i = 0; i < 1000; i++) {
        table.set(i, i * 2)
      }
      expect(table.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(table.get(i)).toBe(i * 2)
      }
    })

    it('should handle 1000 string insertions', () => {
      const table = new HopscotchHashTable<string, number>()
      for (let i = 0; i < 1000; i++) {
        table.set(`key_${i}`, i)
      }
      expect(table.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(table.get(`key_${i}`)).toBe(i)
      }
    })

    it('should handle 1000 mixed operations', () => {
      const table = new HopscotchHashTable<number, number>()
      for (let i = 0; i < 500; i++) {
        table.set(i, i)
      }
      for (let i = 0; i < 250; i++) {
        table.delete(i)
      }
      for (let i = 500; i < 750; i++) {
        table.set(i, i)
      }
      expect(table.size()).toBe(750 - 250)
      for (let i = 250; i < 750; i++) {
        expect(table.get(i)).toBe(i)
      }
    })

    it('should handle 1000 insert update delete cycle', () => {
      const table = new HopscotchHashTable<number, number>()
      for (let i = 0; i < 1000; i++) {
        table.set(i, i)
      }
      for (let i = 0; i < 1000; i++) {
        table.set(i, i + 1000)
      }
      for (let i = 0; i < 500; i++) {
        table.delete(i)
      }
      expect(table.size()).toBe(500)
      for (let i = 500; i < 1000; i++) {
        expect(table.get(i)).toBe(i + 1000)
      }
    })

    it('should handle 2000 insertions and verify all', () => {
      const table = new HopscotchHashTable<string, number>()
      for (let i = 0; i < 2000; i++) {
        table.set(`k${i}`, i)
      }
      expect(table.size()).toBe(2000)
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(2000)
    })
  })

  describe('edge cases', () => {
    it('should handle key that is NaN string', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('NaN', 42)
      expect(table.get('NaN')).toBe(42)
    })

    it('should handle key that is null string', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('null', 1)
      expect(table.get('null')).toBe(1)
    })

    it('should handle key that is undefined string', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('undefined', 1)
      expect(table.get('undefined')).toBe(1)
    })

    it('should handle very similar keys', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('aa', 2)
      table.set('aaa', 3)
      expect(table.get('a')).toBe(1)
      expect(table.get('aa')).toBe(2)
      expect(table.get('aaa')).toBe(3)
    })

    it('should handle keys differing only by case', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('key', 1)
      table.set('KEY', 2)
      table.set('Key', 3)
      expect(table.get('key')).toBe(1)
      expect(table.get('KEY')).toBe(2)
      expect(table.get('Key')).toBe(3)
    })

    it('should handle setting and deleting same key repeatedly', () => {
      const table = new HopscotchHashTable<string, number>()
      for (let i = 0; i < 100; i++) {
        table.set('a', i)
        if (i % 2 === 0) {
          table.delete('a')
        }
      }
      expect(table.has('a')).toBe(true)
      expect(table.get('a')).toBe(99)
    })

    it('should handle forEach with no side effects', () => {
      const table = new HopscotchHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const originalEntries = table.entries()
      table.forEach(() => {})
      expect(table.entries()).toEqual(originalEntries)
    })

    it('should handle cloning table with complex object values', () => {
      const table = new HopscotchHashTable<string, number[]>()
      table.set('a', [1, 2, 3])
      const cloned = table.clone()
      expect(cloned.get('a')).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(table.size())
    })
  })
})
