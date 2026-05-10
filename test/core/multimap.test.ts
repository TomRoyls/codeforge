import { describe, it, expect, beforeEach } from 'vitest'
import { Multimap } from '../../src/core/multimap/multimap.js'
import { DEFAULT_MULTIMAP_OPTIONS } from '../../src/core/multimap/types.js'
import type { MultimapOptions, MultimapStats } from '../../src/core/multimap/types.js'

describe('Multimap', () => {
  describe('construction', () => {
    it('should create empty multimap with default options', () => {
      const mm = new Multimap<string, number>()
      expect(mm.keyCount).toBe(0)
      expect(mm.valueCount).toBe(0)
      expect(mm.size).toBe(0)
      expect(mm.isEmpty()).toBe(true)
    })

    it('should create multimap with default allowDuplicates false', () => {
      const mm = new Multimap<string, number>()
      const mm2 = new Multimap<string, number>({})
      expect(DEFAULT_MULTIMAP_OPTIONS.allowDuplicates).toBe(false)
    })

    it('should create multimap with allowDuplicates true', () => {
      const mm = new Multimap<string, number>({ allowDuplicates: true })
      mm.set('a', 1)
      mm.set('a', 1)
      expect(mm.valueCount).toBe(2)
    })

    it('should create multimap with allowDuplicates false explicitly', () => {
      const mm = new Multimap<string, number>({ allowDuplicates: false })
      mm.set('a', 1)
      mm.set('a', 1)
      expect(mm.valueCount).toBe(1)
    })

    it('should handle empty options object', () => {
      const mm = new Multimap<string, number>({})
      expect(mm.isEmpty()).toBe(true)
    })

    it('should handle undefined options', () => {
      const mm = new Multimap<string, number>(undefined)
      expect(mm.isEmpty()).toBe(true)
    })
  })

  describe('set', () => {
    it('should add a single value to a key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.get('a')).toEqual([1])
    })

    it('should add multiple values to the same key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.get('a')).toEqual([1, 2, 3])
    })

    it('should add values to different keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.set('c', 3)
      expect(mm.get('a')).toEqual([1])
      expect(mm.get('b')).toEqual([2])
      expect(mm.get('c')).toEqual([3])
    })

    it('should not add duplicate values by default', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 1)
      expect(mm.get('a')).toEqual([1])
      expect(mm.valueCount).toBe(1)
    })

    it('should add duplicate values when allowDuplicates is true', () => {
      const mm = new Multimap<string, number>({ allowDuplicates: true })
      mm.set('a', 1)
      mm.set('a', 1)
      mm.set('a', 1)
      expect(mm.get('a')).toEqual([1, 1, 1])
      expect(mm.valueCount).toBe(3)
    })

    it('should increment valueCount for each unique value added', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      expect(mm.valueCount).toBe(3)
    })

    it('should increment keyCount only for new keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.keyCount).toBe(1)
      mm.set('a', 2)
      expect(mm.keyCount).toBe(1)
      mm.set('b', 1)
      expect(mm.keyCount).toBe(2)
    })

    it('should handle various value types', () => {
      const mm = new Multimap<string, unknown>()
      mm.set('a', 1)
      mm.set('b', 'hello')
      mm.set('c', true)
      mm.set('d', null)
      mm.set('e', { x: 1 })
      expect(mm.valueCount).toBe(5)
    })

    it('should handle numeric keys', () => {
      const mm = new Multimap<number, string>()
      mm.set(1, 'a')
      mm.set(2, 'b')
      mm.set(1, 'c')
      expect(mm.get(1)).toEqual(['a', 'c'])
      expect(mm.get(2)).toEqual(['b'])
    })

    it('should handle object keys via reference', () => {
      const mm = new Multimap<object, number>()
      const key1 = { id: 1 }
      const key2 = { id: 2 }
      mm.set(key1, 10)
      mm.set(key2, 20)
      mm.set(key1, 30)
      expect(mm.get(key1)).toEqual([10, 30])
      expect(mm.get(key2)).toEqual([20])
    })
  })

  describe('get', () => {
    it('should return empty array for non-existent key', () => {
      const mm = new Multimap<string, number>()
      expect(mm.get('nonexistent')).toEqual([])
    })

    it('should return copy of values array', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      const vals = mm.get('a')
      vals.push(3)
      expect(mm.get('a')).toEqual([1, 2])
    })

    it('should return all values for a key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.get('a')).toEqual([1, 2, 3])
    })

    it('should not be affected by mutations to returned array', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      const arr = mm.get('a')
      arr.length = 0
      expect(mm.get('a')).toEqual([1])
    })
  })

  describe('delete - single value', () => {
    it('should delete a specific value from a key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.delete('a', 2)).toBe(true)
      expect(mm.get('a')).toEqual([1, 3])
      expect(mm.valueCount).toBe(2)
    })

    it('should return false when deleting non-existent value from existing key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.delete('a', 99)).toBe(false)
    })

    it('should return false when deleting from non-existent key', () => {
      const mm = new Multimap<string, number>()
      expect(mm.delete('nonexistent', 1)).toBe(false)
    })

    it('should remove key when last value is deleted', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.delete('a', 1)
      expect(mm.has('a')).toBe(false)
      expect(mm.keyCount).toBe(0)
    })

    it('should handle deleting same value twice', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.delete('a', 1)).toBe(true)
      expect(mm.delete('a', 1)).toBe(false)
    })

    it('should decrement valueCount on deletion', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.valueCount).toBe(3)
      mm.delete('a', 2)
      expect(mm.valueCount).toBe(2)
    })

    it('should handle delete with duplicates allowed', () => {
      const mm = new Multimap<string, number>({ allowDuplicates: true })
      mm.set('a', 1)
      mm.set('a', 1)
      mm.set('a', 1)
      mm.delete('a', 1)
      expect(mm.get('a')).toEqual([1, 1])
      expect(mm.valueCount).toBe(2)
    })
  })

  describe('delete - all values for key', () => {
    it('should delete all values for a key when no value specified', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.delete('a')).toBe(true)
      expect(mm.get('a')).toEqual([])
      expect(mm.keyCount).toBe(0)
    })

    it('should return false when deleting all values for non-existent key', () => {
      const mm = new Multimap<string, number>()
      expect(mm.delete('nonexistent')).toBe(false)
    })

    it('should decrement valueCount by all removed values', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      expect(mm.valueCount).toBe(3)
      mm.delete('a')
      expect(mm.valueCount).toBe(1)
    })

    it('should not affect other keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.delete('a')
      expect(mm.get('b')).toEqual([2])
      expect(mm.keyCount).toBe(1)
    })

    it('should handle deleting from already-empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.delete('a')).toBe(false)
      expect(mm.valueCount).toBe(0)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.has('a')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const mm = new Multimap<string, number>()
      expect(mm.has('a')).toBe(false)
    })

    it('should return false after all values deleted', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.delete('a')
      expect(mm.has('a')).toBe(false)
    })

    it('should return true even if key has one value', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.has('a')).toBe(true)
    })
  })

  describe('hasEntry', () => {
    it('should return true for existing key-value pair', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.hasEntry('a', 1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const mm = new Multimap<string, number>()
      expect(mm.hasEntry('a', 1)).toBe(false)
    })

    it('should return false for existing key but non-existent value', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.hasEntry('a', 99)).toBe(false)
    })

    it('should find value among multiple values', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.hasEntry('a', 2)).toBe(true)
    })

    it('should return false after value is deleted', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.delete('a', 1)
      expect(mm.hasEntry('a', 1)).toBe(false)
    })
  })

  describe('keyCount', () => {
    it('should return 0 for empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.keyCount).toBe(0)
    })

    it('should count distinct keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.set('c', 3)
      expect(mm.keyCount).toBe(3)
    })

    it('should not count duplicate key additions', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.keyCount).toBe(1)
    })

    it('should decrease when key is fully deleted', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.delete('a')
      expect(mm.keyCount).toBe(1)
    })
  })

  describe('valueCount', () => {
    it('should return 0 for empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.valueCount).toBe(0)
    })

    it('should count total values across all keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      expect(mm.valueCount).toBe(3)
    })

    it('should be aliased by size', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      expect(mm.size).toBe(mm.valueCount)
    })

    it('should update after deletions', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      mm.delete('a', 2)
      expect(mm.valueCount).toBe(2)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.keys()).toEqual([])
    })

    it('should return all keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.set('c', 3)
      const keys = mm.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
      expect(keys.length).toBe(3)
    })

    it('should not duplicate keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      expect(mm.keys()).toEqual(['a'])
    })

    it('should reflect deletions', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.delete('a')
      expect(mm.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.values()).toEqual([])
    })

    it('should return all values across all keys', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      const vals = mm.values()
      expect(vals.sort()).toEqual([1, 2, 3])
    })

    it('should include duplicates when allowDuplicates is true', () => {
      const mm = new Multimap<string, number>({ allowDuplicates: true })
      mm.set('a', 1)
      mm.set('a', 1)
      expect(mm.values()).toEqual([1, 1])
    })

    it('should reflect deletions', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.delete('a', 1)
      expect(mm.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.entries()).toEqual([])
    })

    it('should return all key-value pairs', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.set('a', 3)
      const entries = mm.entries()
      expect(entries.length).toBe(3)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['a', 3])
      expect(entries).toContainEqual(['b', 2])
    })

    it('should expand multi-value keys into separate entries', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      const entries = mm.entries()
      expect(entries).toEqual([['a', 1], ['a', 2], ['a', 3]])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty multimap', () => {
      const mm = new Multimap<string, number>()
      let count = 0
      mm.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate over all key-value pairs', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      const result: Array<[string, number]> = []
      mm.forEach((k, v) => { result.push([k, v]) })
      expect(result.length).toBe(3)
      expect(result).toContainEqual(['a', 1])
      expect(result).toContainEqual(['a', 2])
      expect(result).toContainEqual(['b', 3])
    })

    it('should iterate in insertion order', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.set('a', 3)
      const result: Array<[string, number]> = []
      mm.forEach((k, v) => { result.push([k, v]) })
      expect(result).toEqual([['a', 1], ['a', 3], ['b', 2]])
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty multimap', () => {
      const mm = new Multimap<string, number>()
      expect(mm.isEmpty()).toBe(true)
    })

    it('should return false after adding a value', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.isEmpty()).toBe(false)
    })

    it('should return true after clearing all values', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.clear()
      expect(mm.isEmpty()).toBe(true)
    })

    it('should return true after deleting all entries', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.delete('a')
      expect(mm.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.set('c', 3)
      mm.clear()
      expect(mm.keyCount).toBe(0)
      expect(mm.valueCount).toBe(0)
      expect(mm.isEmpty()).toBe(true)
    })

    it('should be safe to call on empty multimap', () => {
      const mm = new Multimap<string, number>()
      mm.clear()
      expect(mm.isEmpty()).toBe(true)
    })

    it('should allow adding after clear', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.clear()
      mm.set('b', 2)
      expect(mm.get('b')).toEqual([2])
      expect(mm.valueCount).toBe(1)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      const cloned = mm.clone()
      expect(cloned.get('a')).toEqual([1, 2])
      expect(cloned.get('b')).toEqual([3])
      expect(cloned.valueCount).toBe(3)
      expect(cloned.keyCount).toBe(2)
    })

    it('should not affect original when modified', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      const cloned = mm.clone()
      cloned.set('c', 3)
      cloned.delete('a')
      expect(mm.get('a')).toEqual([1])
      expect(mm.has('c')).toBe(false)
      expect(cloned.has('c')).toBe(true)
    })

    it('should preserve options', () => {
      const mm = new Multimap<string, number>({ allowDuplicates: true })
      mm.set('a', 1)
      mm.set('a', 1)
      const cloned = mm.clone()
      cloned.set('a', 1)
      expect(cloned.get('a')).toEqual([1, 1, 1])
    })

    it('should clone empty multimap', () => {
      const mm = new Multimap<string, number>()
      const cloned = mm.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.valueCount).toBe(0)
    })
  })

  describe('from factory', () => {
    it('should create multimap from entries', () => {
      const mm = Multimap.from([['a', 1], ['a', 2], ['b', 3]])
      expect(mm.get('a')).toEqual([1, 2])
      expect(mm.get('b')).toEqual([3])
    })

    it('should create empty multimap from empty array', () => {
      const mm = Multimap.from([])
      expect(mm.isEmpty()).toBe(true)
    })

    it('should respect options', () => {
      const mm = Multimap.from([['a', 1], ['a', 1]], { allowDuplicates: true })
      expect(mm.get('a')).toEqual([1, 1])
    })

    it('should deduplicate by default', () => {
      const mm = Multimap.from([['a', 1], ['a', 1]])
      expect(mm.get('a')).toEqual([1])
    })

    it('should handle single entry', () => {
      const mm = Multimap.from([['a', 1]])
      expect(mm.get('a')).toEqual([1])
      expect(mm.keyCount).toBe(1)
    })

    it('should handle numeric keys', () => {
      const mm = Multimap.from([[1, 'a'], [2, 'b'], [1, 'c']])
      expect(mm.get(1)).toEqual(['a', 'c'])
      expect(mm.get(2)).toEqual(['b'])
    })
  })

  describe('asMap', () => {
    it('should return empty map for empty multimap', () => {
      const mm = new Multimap<string, number>()
      const m = mm.asMap()
      expect(m.size).toBe(0)
    })

    it('should return Map with arrays of values', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      const m = mm.asMap()
      expect(m.get('a')).toEqual([1, 2])
      expect(m.get('b')).toEqual([3])
      expect(m.size).toBe(2)
    })

    it('should return independent copy', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      const m = mm.asMap()
      m.get('a')!.push(99)
      expect(mm.get('a')).toEqual([1])
    })

    it('should be a Map instance', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      const m = mm.asMap()
      expect(m).toBeInstanceOf(Map)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty multimap', () => {
      const mm = new Multimap<string, number>()
      const s = mm.stats()
      expect(s.keyCount).toBe(0)
      expect(s.valueCount).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.avgValuesPerKey).toBe(0)
      expect(s.maxValuesPerKey).toBe(0)
      expect(s.minValuesPerKey).toBe(0)
    })

    it('should return correct stats for populated multimap', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      mm.set('b', 4)
      const s = mm.stats()
      expect(s.keyCount).toBe(2)
      expect(s.valueCount).toBe(4)
      expect(s.isEmpty).toBe(false)
      expect(s.avgValuesPerKey).toBe(2)
      expect(s.maxValuesPerKey).toBe(3)
      expect(s.minValuesPerKey).toBe(1)
    })

    it('should return correct stats for single key single value', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      const s = mm.stats()
      expect(s.keyCount).toBe(1)
      expect(s.valueCount).toBe(1)
      expect(s.avgValuesPerKey).toBe(1)
      expect(s.maxValuesPerKey).toBe(1)
      expect(s.minValuesPerKey).toBe(1)
    })

    it('should update stats after deletions', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('b', 3)
      mm.delete('a', 1)
      const s = mm.stats()
      expect(s.keyCount).toBe(2)
      expect(s.valueCount).toBe(2)
      expect(s.maxValuesPerKey).toBe(1)
      expect(s.minValuesPerKey).toBe(1)
    })

    it('should update stats after clear', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('b', 2)
      mm.clear()
      const s = mm.stats()
      expect(s.isEmpty).toBe(true)
      expect(s.keyCount).toBe(0)
    })
  })

  describe('edge cases - empty multimap', () => {
    it('should handle get on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.get('a')).toEqual([])
    })

    it('should handle delete on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.delete('a')).toBe(false)
      expect(mm.delete('a', 1)).toBe(false)
    })

    it('should handle has on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.has('a')).toBe(false)
    })

    it('should handle hasEntry on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.hasEntry('a', 1)).toBe(false)
    })

    it('should handle keys on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.keys()).toEqual([])
    })

    it('should handle values on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.values()).toEqual([])
    })

    it('should handle entries on empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.entries()).toEqual([])
    })

    it('should handle clone of empty', () => {
      const mm = new Multimap<string, number>()
      const c = mm.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should handle asMap of empty', () => {
      const mm = new Multimap<string, number>()
      expect(mm.asMap().size).toBe(0)
    })
  })

  describe('edge cases - single key single value', () => {
    it('should work with one key one value', () => {
      const mm = new Multimap<string, number>()
      mm.set('only', 42)
      expect(mm.keyCount).toBe(1)
      expect(mm.valueCount).toBe(1)
      expect(mm.get('only')).toEqual([42])
      expect(mm.has('only')).toBe(true)
      expect(mm.hasEntry('only', 42)).toBe(true)
      expect(mm.isEmpty()).toBe(false)
    })
  })

  describe('edge cases - single key many values', () => {
    it('should handle one key with many values', () => {
      const mm = new Multimap<string, number>()
      for (let i = 0; i < 100; i++) {
        mm.set('a', i)
      }
      expect(mm.keyCount).toBe(1)
      expect(mm.valueCount).toBe(100)
      expect(mm.get('a').length).toBe(100)
    })

    it('should handle delete from one key with many values', () => {
      const mm = new Multimap<string, number>()
      for (let i = 0; i < 10; i++) {
        mm.set('a', i)
      }
      mm.delete('a', 5)
      expect(mm.get('a').length).toBe(9)
      expect(mm.hasEntry('a', 5)).toBe(false)
    })
  })

  describe('edge cases - many keys single value', () => {
    it('should handle many keys each with one value', () => {
      const mm = new Multimap<string, number>()
      for (let i = 0; i < 50; i++) {
        mm.set(`key${i}`, i)
      }
      expect(mm.keyCount).toBe(50)
      expect(mm.valueCount).toBe(50)
    })
  })

  describe('edge cases - delete non-existent', () => {
    it('should handle delete key that never existed', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      expect(mm.delete('z')).toBe(false)
      expect(mm.delete('z', 1)).toBe(false)
      expect(mm.valueCount).toBe(1)
    })

    it('should handle delete value that does not exist for key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      expect(mm.delete('a', 999)).toBe(false)
      expect(mm.valueCount).toBe(2)
    })

    it('should handle delete on already deleted key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.delete('a')
      expect(mm.delete('a')).toBe(false)
    })
  })

  describe('large multimaps', () => {
    it('should handle 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(i % 100, i)
      }
      expect(mm.keyCount).toBe(100)
      expect(mm.valueCount).toBe(10000)
    })

    it('should handle 10000 keys with single values', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(i, i * 2)
      }
      expect(mm.keyCount).toBe(10000)
      expect(mm.valueCount).toBe(10000)
      expect(mm.get(5000)).toEqual([10000])
    })

    it('should handle forEach with 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(0, i)
      }
      let count = 0
      mm.forEach(() => { count++ })
      expect(count).toBe(10000)
    })

    it('should handle entries with 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(0, i)
      }
      expect(mm.entries().length).toBe(10000)
    })

    it('should handle clone with 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(i % 100, i)
      }
      const cloned = mm.clone()
      expect(cloned.valueCount).toBe(10000)
      expect(cloned.keyCount).toBe(100)
    })

    it('should handle asMap with 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(i % 100, i)
      }
      const m = mm.asMap()
      expect(m.size).toBe(100)
    })

    it('should handle stats with 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(i % 100, i)
      }
      const s = mm.stats()
      expect(s.keyCount).toBe(100)
      expect(s.valueCount).toBe(10000)
      expect(s.maxValuesPerKey).toBe(100)
      expect(s.minValuesPerKey).toBe(100)
    })

    it('should handle clear with 10000 entries', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(i % 100, i)
      }
      mm.clear()
      expect(mm.isEmpty()).toBe(true)
      expect(mm.valueCount).toBe(0)
    })

    it('should handle large delete of all values for key', () => {
      const mm = new Multimap<number, number>()
      for (let i = 0; i < 10000; i++) {
        mm.set(0, i)
      }
      mm.delete(0)
      expect(mm.isEmpty()).toBe(true)
      expect(mm.valueCount).toBe(0)
    })

    it('should handle large from factory', () => {
      const entries: Array<[number, number]> = []
      for (let i = 0; i < 10000; i++) {
        entries.push([i % 100, i])
      }
      const mm = Multimap.from(entries)
      expect(mm.valueCount).toBe(10000)
      expect(mm.keyCount).toBe(100)
    })
  })

  describe('additional edge cases', () => {
    it('should handle string values', () => {
      const mm = new Multimap<number, string>()
      mm.set(1, 'a')
      mm.set(1, 'b')
      mm.set(2, 'c')
      expect(mm.get(1)).toEqual(['a', 'b'])
      expect(mm.get(2)).toEqual(['c'])
    })

    it('should handle boolean values', () => {
      const mm = new Multimap<string, boolean>()
      mm.set('a', true)
      mm.set('a', false)
      expect(mm.get('a')).toEqual([true, false])
    })

    it('should handle null and undefined values', () => {
      const mm = new Multimap<string, unknown>()
      mm.set('a', null)
      mm.set('b', undefined)
      expect(mm.hasEntry('a', null)).toBe(true)
      expect(mm.hasEntry('b', undefined)).toBe(true)
    })

    it('should handle mixed type values with unknown', () => {
      const mm = new Multimap<string, unknown>()
      mm.set('a', 1)
      mm.set('a', 'two')
      mm.set('a', true)
      expect(mm.get('a')).toEqual([1, 'two', true])
    })

    it('should handle repeated set-delete cycles', () => {
      const mm = new Multimap<string, number>()
      for (let i = 0; i < 100; i++) {
        mm.set('a', i)
        mm.delete('a', i)
      }
      expect(mm.isEmpty()).toBe(true)
      expect(mm.valueCount).toBe(0)
      expect(mm.keyCount).toBe(0)
    })

    it('should handle stats with uneven key distribution', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      mm.set('a', 4)
      mm.set('a', 5)
      mm.set('b', 10)
      const s = mm.stats()
      expect(s.maxValuesPerKey).toBe(5)
      expect(s.minValuesPerKey).toBe(1)
      expect(s.avgValuesPerKey).toBe(3)
    })

    it('should handle size alias correctly after mutations', () => {
      const mm = new Multimap<string, number>()
      expect(mm.size).toBe(0)
      mm.set('a', 1)
      expect(mm.size).toBe(1)
      mm.set('a', 2)
      expect(mm.size).toBe(2)
      mm.delete('a', 1)
      expect(mm.size).toBe(1)
      mm.clear()
      expect(mm.size).toBe(0)
    })

    it('should handle delete first value from multi-value key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      mm.delete('a', 1)
      expect(mm.get('a')).toEqual([2, 3])
    })

    it('should handle delete last value from multi-value key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      mm.delete('a', 3)
      expect(mm.get('a')).toEqual([1, 2])
    })

    it('should handle delete middle value from multi-value key', () => {
      const mm = new Multimap<string, number>()
      mm.set('a', 1)
      mm.set('a', 2)
      mm.set('a', 3)
      mm.delete('a', 2)
      expect(mm.get('a')).toEqual([1, 3])
    })
  })
})
