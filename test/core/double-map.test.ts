import { describe, it, expect } from 'vitest'
import { DoubleMap } from '../../src/core/double-map/index.js'
import type { DoubleMapOptions, DoubleMapEntry } from '../../src/core/double-map/types.js'

describe('DoubleMap', () => {
  describe('constructor', () => {
    it('creates empty map with no options', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.size).toBe(0)
      expect(dm.isEmpty).toBe(true)
    })

    it('creates map with custom hash functions', () => {
      const dm = new DoubleMap<object, object, string>({
        key1Hash: (k) => JSON.stringify(k),
        key2Hash: (k) => JSON.stringify(k),
      })
      expect(dm.size).toBe(0)
    })

    it('accepts partial options (only key1Hash)', () => {
      const dm = new DoubleMap<string, number, boolean>({
        key1Hash: (k) => k.toUpperCase(),
      })
      expect(dm.isEmpty).toBe(true)
    })

    it('accepts partial options (only key2Hash)', () => {
      const dm = new DoubleMap<string, number, boolean>({
        key2Hash: (k) => String(k * 2),
      })
      expect(dm.isEmpty).toBe(true)
    })
  })

  describe('set and get', () => {
    it('sets and gets value by key1', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      expect(dm.getByKey1('a')).toBe(true)
    })

    it('sets and gets value by key2', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      expect(dm.getByKey2(1)).toBe(true)
    })

    it('returns undefined for missing key1', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.getByKey1('x')).toBeUndefined()
    })

    it('returns undefined for missing key2', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.getByKey2(99)).toBeUndefined()
    })

    it('overwrites existing entry when setting same key1', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'first')
      dm.set('a', 2, 'second')
      expect(dm.getByKey1('a')).toBe('second')
      expect(dm.getByKey2(2)).toBe('second')
      expect(dm.getByKey2(1)).toBeUndefined()
      expect(dm.size).toBe(1)
    })

    it('overwrites existing entry when setting same key2', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'first')
      dm.set('b', 1, 'second')
      expect(dm.getByKey2(1)).toBe('second')
      expect(dm.getByKey1('b')).toBe('second')
      expect(dm.getByKey1('a')).toBeUndefined()
      expect(dm.size).toBe(1)
    })

    it('handles multiple entries', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.set('c', 3, 'three')
      expect(dm.size).toBe(3)
      expect(dm.getByKey1('a')).toBe('one')
      expect(dm.getByKey1('b')).toBe('two')
      expect(dm.getByKey1('c')).toBe('three')
      expect(dm.getByKey2(1)).toBe('one')
      expect(dm.getByKey2(2)).toBe('two')
      expect(dm.getByKey2(3)).toBe('three')
    })

    it('stores complex value types', () => {
      const dm = new DoubleMap<string, string, { x: number; y: number }>()
      dm.set('p1', 'point1', { x: 10, y: 20 })
      const val = dm.getByKey1('p1')!
      expect(val.x).toBe(10)
      expect(val.y).toBe(20)
    })
  })

  describe('has', () => {
    it('hasKey1 returns true for existing key', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      expect(dm.hasKey1('a')).toBe(true)
    })

    it('hasKey1 returns false for missing key', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.hasKey1('a')).toBe(false)
    })

    it('hasKey2 returns true for existing key', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      expect(dm.hasKey2(1)).toBe(true)
    })

    it('hasKey2 returns false for missing key', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.hasKey2(1)).toBe(false)
    })

    it('hasKey1 returns false after deletion', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      dm.deleteByKey1('a')
      expect(dm.hasKey1('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deleteByKey1 removes entry from both maps', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      expect(dm.deleteByKey1('a')).toBe(true)
      expect(dm.getByKey1('a')).toBeUndefined()
      expect(dm.getByKey2(1)).toBeUndefined()
      expect(dm.size).toBe(0)
    })

    it('deleteByKey2 removes entry from both maps', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      expect(dm.deleteByKey2(1)).toBe(true)
      expect(dm.getByKey1('a')).toBeUndefined()
      expect(dm.getByKey2(1)).toBeUndefined()
      expect(dm.size).toBe(0)
    })

    it('deleteByKey1 returns false for missing key', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.deleteByKey1('x')).toBe(false)
    })

    it('deleteByKey2 returns false for missing key', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.deleteByKey2(99)).toBe(false)
    })

    it('deleteByKey1 does not affect other entries', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.deleteByKey1('a')
      expect(dm.getByKey1('b')).toBe('two')
      expect(dm.getByKey2(2)).toBe('two')
      expect(dm.size).toBe(1)
    })

    it('deleteByKey2 does not affect other entries', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.deleteByKey2(1)
      expect(dm.getByKey1('b')).toBe('two')
      expect(dm.getByKey2(2)).toBe('two')
      expect(dm.size).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty map', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.size).toBe(0)
    })

    it('isEmpty is true for empty map', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.isEmpty).toBe(true)
    })

    it('size increments on set', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      expect(dm.size).toBe(1)
      dm.set('b', 2, false)
      expect(dm.size).toBe(2)
    })

    it('isEmpty is false after set', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      expect(dm.isEmpty).toBe(false)
    })

    it('size does not increase on overwrite', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      dm.set('a', 1, false)
      expect(dm.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      dm.deleteByKey1('a')
      expect(dm.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.clear()
      expect(dm.size).toBe(0)
      expect(dm.isEmpty).toBe(true)
      expect(dm.getByKey1('a')).toBeUndefined()
      expect(dm.getByKey2(1)).toBeUndefined()
    })

    it('clear on empty map is no-op', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.clear()
      expect(dm.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const dm = new DoubleMap<string, number, boolean>()
      expect(dm.toArray()).toEqual([])
    })

    it('returns entries as array of objects', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      const arr = dm.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContainEqual({ k1: 'a', k2: 1, v: 'one' })
      expect(arr).toContainEqual({ k1: 'b', k2: 2, v: 'two' })
    })

    it('returns copies not references', () => {
      const dm = new DoubleMap<string, number, number[]>()
      dm.set('a', 1, [1, 2, 3])
      const arr = dm.toArray()
      arr[0]!.v.push(4)
      expect(dm.getByKey1('a')).toEqual([1, 2, 3, 4])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      const copy = dm.clone()
      expect(copy.size).toBe(2)
      expect(copy.getByKey1('a')).toBe('one')
      expect(copy.getByKey1('b')).toBe('two')
    })

    it('clone is independent from original', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      const copy = dm.clone()
      copy.set('c', 3, 'three')
      expect(dm.size).toBe(1)
      expect(copy.size).toBe(2)
    })

    it('clone modifications do not affect original', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      const copy = dm.clone()
      copy.deleteByKey1('a')
      expect(dm.getByKey1('a')).toBe('one')
      expect(copy.getByKey1('a')).toBeUndefined()
    })
  })

  describe('fromArray', () => {
    it('creates map from entries', () => {
      const dm = DoubleMap.fromArray([
        { k1: 'a', k2: 1, v: 'one' },
        { k1: 'b', k2: 2, v: 'two' },
      ])
      expect(dm.size).toBe(2)
      expect(dm.getByKey1('a')).toBe('one')
      expect(dm.getByKey2(2)).toBe('two')
    })

    it('creates empty map from empty array', () => {
      const dm = DoubleMap.fromArray([])
      expect(dm.size).toBe(0)
    })

    it('creates map with custom options', () => {
      const dm = DoubleMap.fromArray<string, number, string>(
        [{ k1: 'A', k2: 1, v: 'val' }],
        { key1Hash: (k) => k.toLowerCase() },
      )
      expect(dm.getByKey1('a')).toBe('val')
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      const result: string[] = []
      dm.forEach((k1, k2, v) => {
        result.push(`${k1}-${k2}-${v}`)
      })
      expect(result).toHaveLength(2)
      expect(result).toContain('a-1-one')
      expect(result).toContain('b-2-two')
    })

    it('does not call callback for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      let called = false
      dm.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable with for-of', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      const result: DoubleMapEntry<string, number, string>[] = []
      for (const entry of dm) {
        result.push(entry)
      }
      expect(result).toHaveLength(2)
    })

    it('works with spread operator', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      const arr = [...dm]
      expect(arr).toHaveLength(1)
      expect(arr[0]).toEqual({ k1: 'a', k2: 1, v: 'one' })
    })

    it('works with Array.from', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('x', 10, 'ten')
      const arr = Array.from(dm)
      expect(arr).toHaveLength(1)
      expect(arr[0]!.k1).toBe('x')
    })
  })

  describe('keys1, keys2, values', () => {
    it('keys1 returns all key1 values', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      expect(dm.keys1()).toEqual(['a', 'b'])
    })

    it('keys2 returns all key2 values', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      expect(dm.keys2()).toEqual([1, 2])
    })

    it('values returns all values', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      expect(dm.values()).toEqual(['one', 'two'])
    })

    it('keys1 returns empty array for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.keys1()).toEqual([])
    })

    it('keys2 returns empty array for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.keys2()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.values()).toEqual([])
    })
  })

  describe('update', () => {
    it('updates value for existing entry', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'old')
      expect(dm.update('a', 1, 'new')).toBe(true)
      expect(dm.getByKey1('a')).toBe('new')
    })

    it('returns false if key1 does not exist', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.update('x', 1, 'val')).toBe(false)
    })

    it('returns false if key2 does not match', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'old')
      expect(dm.update('a', 999, 'new')).toBe(false)
    })

    it('preserves key associations after update', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'old')
      dm.update('a', 1, 'new')
      expect(dm.getByKey2(1)).toBe('new')
      expect(dm.size).toBe(1)
    })
  })

  describe('reverse lookups', () => {
    it('getKey1ByValue finds matching key1', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'target')
      dm.set('b', 2, 'other')
      expect(dm.getKey1ByValue('target')).toBe('a')
    })

    it('getKey2ByValue finds matching key2', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'target')
      dm.set('b', 2, 'other')
      expect(dm.getKey2ByValue('target')).toBe(1)
    })

    it('getKey1ByValue returns undefined if not found', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.getKey1ByValue('missing')).toBeUndefined()
    })

    it('getKey2ByValue returns undefined if not found', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.getKey2ByValue('missing')).toBeUndefined()
    })

    it('finds first match when duplicates exist', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'same')
      dm.set('b', 2, 'same')
      const k1 = dm.getKey1ByValue('same')
      expect(k1 === 'a' || k1 === 'b').toBe(true)
    })
  })

  describe('getByEither', () => {
    it('finds value by key1 type', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'found')
      expect(dm.getByEither('a')).toBe('found')
    })

    it('finds value by key2 type', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'found')
      expect(dm.getByEither(1)).toBe('found')
    })

    it('returns undefined when neither key matches', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.getByEither('x')).toBeUndefined()
      expect(dm.getByEither(99)).toBeUndefined()
    })

    it('prefers key1 match', () => {
      const dm = new DoubleMap<string, string, string>()
      dm.set('a', 'b', 'val')
      expect(dm.getByEither('a')).toBe('val')
    })
  })

  describe('hasValue', () => {
    it('returns true for existing value', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'target')
      expect(dm.hasValue('target')).toBe(true)
    })

    it('returns false for missing value', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'target')
      expect(dm.hasValue('missing')).toBe(false)
    })

    it('returns false for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.hasValue('anything')).toBe(false)
    })

    it('finds object references', () => {
      const dm = new DoubleMap<string, number, object>()
      const obj = { x: 1 }
      dm.set('a', 1, obj)
      expect(dm.hasValue(obj)).toBe(true)
    })
  })

  describe('entries', () => {
    it('returns array of tuples', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      const ents = dm.entries()
      expect(ents).toHaveLength(2)
      expect(ents).toContainEqual(['a', 1, 'one'])
      expect(ents).toContainEqual(['b', 2, 'two'])
    })

    it('returns empty array for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.entries()).toEqual([])
    })
  })

  describe('count', () => {
    it('returns same as size', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      expect(dm.count()).toBe(dm.size)
      expect(dm.count()).toBe(2)
    })

    it('returns 0 for empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.count()).toBe(0)
    })
  })

  describe('equals', () => {
    it('empty maps are equal', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      expect(a.equals(b)).toBe(true)
    })

    it('identical maps are equal', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      a.set('x', 1, 'val')
      b.set('x', 1, 'val')
      expect(a.equals(b)).toBe(true)
    })

    it('maps with different sizes are not equal', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      a.set('x', 1, 'val')
      expect(a.equals(b)).toBe(false)
    })

    it('maps with different values are not equal', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      a.set('x', 1, 'val1')
      b.set('x', 1, 'val2')
      expect(a.equals(b)).toBe(false)
    })

    it('maps with different keys are not equal', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      a.set('x', 1, 'val')
      b.set('y', 2, 'val')
      expect(a.equals(b)).toBe(false)
    })

    it('uses custom value comparator', () => {
      const a = new DoubleMap<string, number, number[]>()
      const b = new DoubleMap<string, number, number[]>()
      a.set('x', 1, [1, 2, 3])
      b.set('x', 1, [1, 2, 3])
      expect(a.equals(b, (v1, v2) => JSON.stringify(v1) === JSON.stringify(v2))).toBe(true)
    })

    it('custom comparator returns false correctly', () => {
      const a = new DoubleMap<string, number, number[]>()
      const b = new DoubleMap<string, number, number[]>()
      a.set('x', 1, [1, 2, 3])
      b.set('x', 1, [4, 5, 6])
      expect(a.equals(b, (v1, v2) => JSON.stringify(v1) === JSON.stringify(v2))).toBe(false)
    })
  })

  describe('custom hash functions', () => {
    it('case-insensitive key1 hash', () => {
      const dm = new DoubleMap<string, number, string>({
        key1Hash: (k) => k.toLowerCase(),
      })
      dm.set('Hello', 1, 'val')
      expect(dm.getByKey1('hello')).toBe('val')
      expect(dm.getByKey1('HELLO')).toBe('val')
    })

    it('uses both custom hash functions', () => {
      const dm = new DoubleMap<string, string, string>({
        key1Hash: (k) => k.toLowerCase(),
        key2Hash: (k) => k.toUpperCase(),
      })
      dm.set('abc', 'def', 'val')
      expect(dm.getByKey1('ABC')).toBe('val')
      expect(dm.getByKey2('DEF')).toBe('val')
    })

    it('object key hashing with JSON.stringify', () => {
      const dm = new DoubleMap<{ id: number }, string, number>({
        key1Hash: (k) => JSON.stringify(k),
      })
      dm.set({ id: 1 }, 'a', 100)
      expect(dm.getByKey1({ id: 1 })).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('handles undefined-like string key "undefined"', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('undefined', 1, 'val')
      expect(dm.getByKey1('undefined')).toBe('val')
    })

    it('handles zero as key2', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 0, 'zero')
      expect(dm.getByKey2(0)).toBe('zero')
    })

    it('handles empty string as key1', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('', 1, 'empty')
      expect(dm.getByKey1('')).toBe('empty')
    })

    it('handles null-like values', () => {
      const dm = new DoubleMap<string, number, string | null>()
      dm.set('a', 1, null)
      expect(dm.getByKey1('a')).toBe(null)
      expect(dm.hasValue(null)).toBe(true)
    })

    it('set-delete-set cycle works', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'first')
      dm.deleteByKey1('a')
      dm.set('a', 1, 'second')
      expect(dm.getByKey1('a')).toBe('second')
      expect(dm.size).toBe(1)
    })

    it('many operations preserve consistency', () => {
      const dm = new DoubleMap<number, string, boolean>()
      for (let i = 0; i < 100; i++) {
        dm.set(i, `k${i}`, i % 2 === 0)
      }
      expect(dm.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(dm.hasKey1(i)).toBe(true)
        expect(dm.hasKey2(`k${i}`)).toBe(true)
      }
      dm.deleteByKey2('k50')
      expect(dm.size).toBe(99)
      expect(dm.hasKey1(50)).toBe(false)
      expect(dm.hasKey2('k50')).toBe(false)
    })

    it('overwrite via key1 then via key2 cleans up', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'first')
      dm.set('a', 2, 'second')
      expect(dm.getByKey2(1)).toBeUndefined()
      expect(dm.getByKey2(2)).toBe('second')
      dm.set('b', 2, 'third')
      expect(dm.getByKey1('a')).toBeUndefined()
      expect(dm.getByKey1('b')).toBe('third')
      expect(dm.size).toBe(1)
    })
  })

  describe('type consistency', () => {
    it('preserves type information through operations', () => {
      const dm = new DoubleMap<string, number, boolean>()
      dm.set('a', 1, true)
      const val = dm.getByKey1('a')
      expect(typeof val).toBe('boolean')
    })

    it('works with number keys for both types', () => {
      const dm = new DoubleMap<number, number, string>()
      dm.set(1, 100, 'val')
      expect(dm.getByKey1(1)).toBe('val')
      expect(dm.getByKey2(100)).toBe('val')
    })

    it('works with object values', () => {
      interface Person { name: string; age: number }
      const dm = new DoubleMap<string, string, Person>()
      dm.set('id1', 'ssn1', { name: 'Alice', age: 30 })
      const person = dm.getByKey1('id1')!
      expect(person.name).toBe('Alice')
      expect(person.age).toBe(30)
    })
  })

  describe('additional coverage', () => {
    it('getKey1ByValue on populated map returns correct result', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('x', 10, 'alpha')
      dm.set('y', 20, 'beta')
      dm.set('z', 30, 'gamma')
      expect(dm.getKey1ByValue('beta')).toBe('y')
    })

    it('getKey2ByValue on populated map returns correct result', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('x', 10, 'alpha')
      dm.set('y', 20, 'beta')
      expect(dm.getKey2ByValue('alpha')).toBe(10)
    })

    it('deleteByKey1 then getByKey2 returns undefined', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      dm.deleteByKey1('a')
      expect(dm.getByKey2(1)).toBeUndefined()
    })

    it('deleteByKey2 then getByKey1 returns undefined', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      dm.deleteByKey2(1)
      expect(dm.getByKey1('a')).toBeUndefined()
    })

    it('clone preserves custom hash functions', () => {
      const dm = new DoubleMap<string, number, string>({
        key1Hash: (k) => k.toLowerCase(),
      })
      dm.set('Hello', 1, 'val')
      const copy = dm.clone()
      expect(copy.getByKey1('hello')).toBe('val')
    })

    it('fromArray last entry wins on duplicates', () => {
      const dm = DoubleMap.fromArray([
        { k1: 'a', k2: 1, v: 'first' },
        { k1: 'a', k2: 2, v: 'second' },
      ])
      expect(dm.getByKey1('a')).toBe('second')
      expect(dm.getByKey2(2)).toBe('second')
      expect(dm.getByKey2(1)).toBeUndefined()
    })

    it('update returns false on empty map', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.update('a', 1, 'val')).toBe(false)
    })

    it('update does not change size', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'old')
      const sizeBefore = dm.size
      dm.update('a', 1, 'new')
      expect(dm.size).toBe(sizeBefore)
    })

    it('clear then set works', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'first')
      dm.clear()
      dm.set('b', 2, 'second')
      expect(dm.getByKey1('b')).toBe('second')
      expect(dm.size).toBe(1)
    })

    it('hasValue returns false after entry deleted', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'target')
      dm.deleteByKey1('a')
      expect(dm.hasValue('target')).toBe(false)
    })

    it('equals is reflexive', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      expect(dm.equals(dm)).toBe(true)
    })

    it('toArray after delete reflects removal', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.deleteByKey1('a')
      const arr = dm.toArray()
      expect(arr).toHaveLength(1)
      expect(arr[0]).toEqual({ k1: 'b', k2: 2, v: 'two' })
    })

    it('entries after multiple deletes', () => {
      const dm = new DoubleMap<number, string, string>()
      dm.set(1, 'a', 'one')
      dm.set(2, 'b', 'two')
      dm.set(3, 'c', 'three')
      dm.deleteByKey2('b')
      const ents = dm.entries()
      expect(ents).toHaveLength(2)
      expect(ents).toContainEqual([1, 'a', 'one'])
      expect(ents).toContainEqual([3, 'c', 'three'])
    })

    it('forEach receives correct arguments', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      let receivedK1: string | undefined
      let receivedK2: number | undefined
      let receivedV: string | undefined
      dm.forEach((k1, k2, v) => {
        receivedK1 = k1
        receivedK2 = k2
        receivedV = v
      })
      expect(receivedK1).toBe('a')
      expect(receivedK2).toBe(1)
      expect(receivedV).toBe('val')
    })

    it('iterator yields entries after modifications', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.deleteByKey1('a')
      dm.set('c', 3, 'three')
      const arr = [...dm]
      expect(arr).toHaveLength(2)
      expect(arr.find(e => e.k1 === 'b')).toBeDefined()
      expect(arr.find(e => e.k1 === 'c')).toBeDefined()
    })

    it('keys1 after delete', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.deleteByKey1('a')
      expect(dm.keys1()).toEqual(['b'])
    })

    it('keys2 after delete', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'one')
      dm.set('b', 2, 'two')
      dm.deleteByKey2(1)
      expect(dm.keys2()).toEqual([2])
    })

    it('values after update', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'old')
      dm.update('a', 1, 'new')
      expect(dm.values()).toEqual(['new'])
    })

    it('getByEither returns undefined for both missing', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      expect(dm.getByEither('z')).toBeUndefined()
      expect(dm.getByEither(999)).toBeUndefined()
    })

    it('getByEither with same-type keys prefers key1', () => {
      const dm = new DoubleMap<string, string, string>()
      dm.set('k', 'v1', 'fromK1')
      dm.set('other', 'k', 'fromK2')
      expect(dm.getByEither('k')).toBe('fromK1')
    })

    it('set with same k1 and k2 updates value', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'first')
      dm.set('a', 1, 'second')
      expect(dm.getByKey1('a')).toBe('second')
      expect(dm.getByKey2(1)).toBe('second')
      expect(dm.size).toBe(1)
    })

    it('multiple deletes on same key are safe', () => {
      const dm = new DoubleMap<string, number, string>()
      dm.set('a', 1, 'val')
      expect(dm.deleteByKey1('a')).toBe(true)
      expect(dm.deleteByKey1('a')).toBe(false)
      expect(dm.deleteByKey2(1)).toBe(false)
    })

    it('count tracks correctly through operations', () => {
      const dm = new DoubleMap<string, number, string>()
      expect(dm.count()).toBe(0)
      dm.set('a', 1, 'x')
      expect(dm.count()).toBe(1)
      dm.set('b', 2, 'y')
      expect(dm.count()).toBe(2)
      dm.deleteByKey1('a')
      expect(dm.count()).toBe(1)
      dm.clear()
      expect(dm.count()).toBe(0)
    })

    it('handles boolean keys correctly', () => {
      const dm = new DoubleMap<boolean, boolean, string>()
      dm.set(true, false, 'tf')
      dm.set(false, true, 'ft')
      expect(dm.getByKey1(true)).toBe('tf')
      expect(dm.getByKey2(true)).toBe('ft')
      expect(dm.size).toBe(2)
    })

    it('handles negative numbers as keys', () => {
      const dm = new DoubleMap<number, number, string>()
      dm.set(-1, -100, 'neg')
      expect(dm.getByKey1(-1)).toBe('neg')
      expect(dm.getByKey2(-100)).toBe('neg')
    })

    it('equals with multiple entries', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      a.set('a', 1, 'x')
      a.set('b', 2, 'y')
      b.set('a', 1, 'x')
      b.set('b', 2, 'y')
      expect(a.equals(b)).toBe(true)
    })

    it('equals fails when one entry differs', () => {
      const a = new DoubleMap<string, number, string>()
      const b = new DoubleMap<string, number, string>()
      a.set('a', 1, 'x')
      a.set('b', 2, 'y')
      b.set('a', 1, 'x')
      b.set('b', 2, 'z')
      expect(a.equals(b)).toBe(false)
    })

    it('fromArray with many entries', () => {
      const entries: DoubleMapEntry<number, string, boolean>[] = []
      for (let i = 0; i < 50; i++) {
        entries.push({ k1: i, k2: `k${i}`, v: i % 2 === 0 })
      }
      const dm = DoubleMap.fromArray(entries)
      expect(dm.size).toBe(50)
      expect(dm.getByKey1(25)).toBe(false)
      expect(dm.getByKey2('k25')).toBe(false)
    })
  })
})
