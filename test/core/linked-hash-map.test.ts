import { describe, it, expect, beforeEach } from 'vitest'
import { LinkedHashMap } from '../../src/core/linked-hash-map/linked-hash-map.js'
import { DEFAULT_LINKED_HASHMAP_OPTIONS } from '../../src/core/linked-hash-map/types.js'
import type { LinkedHashMapEntry, LinkedHashMapOptions } from '../../src/core/linked-hash-map/types.js'

describe('LinkedHashMap', () => {
  let lhm: LinkedHashMap<string, number>

  beforeEach(() => {
    lhm = new LinkedHashMap<string, number>()
  })

  describe('constructor', () => {
    it('should create an empty map with default options', () => {
      const m = new LinkedHashMap<string, number>()
      expect(m.size()).toBe(0)
    })

    it('should accept custom initialCapacity option', () => {
      const m = new LinkedHashMap<string, number>({ initialCapacity: 32 })
      expect(m.size()).toBe(0)
    })

    it('should accept no options', () => {
      const m = new LinkedHashMap()
      expect(m.size()).toBe(0)
    })
  })

  describe('set and get', () => {
    it('should return undefined for missing key', () => {
      expect(lhm.get('missing')).toBeUndefined()
    })

    it('should store and retrieve a value', () => {
      lhm.set('a', 1)
      expect(lhm.get('a')).toBe(1)
    })

    it('should overwrite existing key value', () => {
      lhm.set('a', 1)
      lhm.set('a', 2)
      expect(lhm.get('a')).toBe(2)
    })

    it('should not increase size when overwriting', () => {
      lhm.set('a', 1)
      lhm.set('a', 2)
      expect(lhm.size()).toBe(1)
    })

    it('should handle multiple keys', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      expect(lhm.get('a')).toBe(1)
      expect(lhm.get('b')).toBe(2)
      expect(lhm.get('c')).toBe(3)
    })

    it('should not change insertion order on update', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.set('a', 10)
      expect(lhm.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should handle setting same key multiple times', () => {
      lhm.set('x', 1)
      lhm.set('x', 2)
      lhm.set('x', 3)
      expect(lhm.get('x')).toBe(3)
      expect(lhm.size()).toBe(1)
    })
  })

  describe('insertion order', () => {
    it('should maintain insertion order for keys', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      expect(lhm.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should maintain insertion order for values', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      expect(lhm.values()).toEqual([1, 2, 3])
    })

    it('should maintain insertion order for entries', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      expect(lhm.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should preserve order after delete and reinsert', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      lhm.set('b', 20)
      expect(lhm.keys()).toEqual(['a', 'c', 'b'])
    })

    it('should not reorder on get', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.get('c')
      lhm.get('a')
      expect(lhm.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should not reorder on has', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.has('c')
      lhm.has('a')
      expect(lhm.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(lhm.delete('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      lhm.set('a', 1)
      expect(lhm.delete('a')).toBe(true)
    })

    it('should remove item from map', () => {
      lhm.set('a', 1)
      lhm.delete('a')
      expect(lhm.has('a')).toBe(false)
      expect(lhm.size()).toBe(0)
    })

    it('should remove item from linked list', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      expect(lhm.keys()).toEqual(['a', 'c'])
    })

    it('should handle deleting the only item', () => {
      lhm.set('a', 1)
      lhm.delete('a')
      expect(lhm.size()).toBe(0)
      expect(lhm.keys()).toEqual([])
      expect(lhm.values()).toEqual([])
    })

    it('should handle deleting head', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('a')
      expect(lhm.keys()).toEqual(['b', 'c'])
      expect(lhm.first()?.key).toBe('b')
    })

    it('should handle deleting tail', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('c')
      expect(lhm.keys()).toEqual(['a', 'b'])
      expect(lhm.last()?.key).toBe('b')
    })

    it('should handle deleting middle element', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      expect(lhm.keys()).toEqual(['a', 'c'])
      expect(lhm.get('a')).toBe(1)
      expect(lhm.get('c')).toBe(3)
    })

    it('should handle deleting from two-item map', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.delete('a')
      expect(lhm.keys()).toEqual(['b'])
      expect(lhm.first()?.key).toBe('b')
      expect(lhm.last()?.key).toBe('b')
    })

    it('should handle deleting then re-adding', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.delete('a')
      lhm.set('a', 10)
      expect(lhm.keys()).toEqual(['b', 'a'])
      expect(lhm.get('a')).toBe(10)
    })

    it('should handle double delete returning false', () => {
      lhm.set('a', 1)
      expect(lhm.delete('a')).toBe(true)
      expect(lhm.delete('a')).toBe(false)
    })

    it('should keep linked list valid after deleting all items one by one', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      lhm.delete('a')
      lhm.delete('c')
      expect(lhm.size()).toBe(0)
      expect(lhm.keys()).toEqual([])
      expect(lhm.first()).toBeUndefined()
      expect(lhm.last()).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(lhm.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      lhm.set('a', 1)
      expect(lhm.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      lhm.set('a', 1)
      lhm.delete('a')
      expect(lhm.has('a')).toBe(false)
    })

    it('should return true for updated key', () => {
      lhm.set('a', 1)
      lhm.set('a', 2)
      expect(lhm.has('a')).toBe(true)
    })

    it('should handle checking multiple keys', () => {
      lhm.set('a', 1)
      lhm.set('c', 3)
      expect(lhm.has('a')).toBe(true)
      expect(lhm.has('b')).toBe(false)
      expect(lhm.has('c')).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(lhm.size()).toBe(0)
    })

    it('should return correct size after inserts', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      expect(lhm.size()).toBe(2)
    })

    it('should return correct size after deletes', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.delete('a')
      expect(lhm.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      expect(lhm.size()).toBe(0)
    })

    it('should not count overwrites as new entries', () => {
      lhm.set('a', 1)
      lhm.set('a', 2)
      lhm.set('a', 3)
      expect(lhm.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      expect(lhm.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      lhm.set('a', 1)
      expect(lhm.isEmpty()).toBe(false)
    })

    it('should return true after clearing all items', () => {
      lhm.set('a', 1)
      lhm.clear()
      expect(lhm.isEmpty()).toBe(true)
    })

    it('should return true after deleting all items', () => {
      lhm.set('a', 1)
      lhm.delete('a')
      expect(lhm.isEmpty()).toBe(true)
    })

    it('should return false with multiple items', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      expect(lhm.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.clear()
      expect(lhm.size()).toBe(0)
    })

    it('should handle clearing empty map', () => {
      lhm.clear()
      expect(lhm.size()).toBe(0)
    })

    it('should allow set after clear', () => {
      lhm.set('a', 1)
      lhm.clear()
      lhm.set('b', 2)
      expect(lhm.get('b')).toBe(2)
      expect(lhm.size()).toBe(1)
    })

    it('should reset first and last', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      expect(lhm.first()).toBeUndefined()
      expect(lhm.last()).toBeUndefined()
    })

    it('should reset keys and values', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      expect(lhm.keys()).toEqual([])
      expect(lhm.values()).toEqual([])
      expect(lhm.entries()).toEqual([])
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(lhm.keys()).toEqual([])
    })

    it('should return keys in insertion order', () => {
      lhm.set('c', 3)
      lhm.set('a', 1)
      lhm.set('b', 2)
      expect(lhm.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should reflect state after delete', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      expect(lhm.keys()).toEqual(['a', 'c'])
    })

    it('should reflect state after clear and reinsert', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      lhm.set('c', 3)
      expect(lhm.keys()).toEqual(['c'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(lhm.values()).toEqual([])
    })

    it('should return values in insertion order', () => {
      lhm.set('a', 10)
      lhm.set('b', 20)
      lhm.set('c', 30)
      expect(lhm.values()).toEqual([10, 20, 30])
    })

    it('should reflect updated values', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('a', 10)
      expect(lhm.values()).toEqual([10, 2])
    })

    it('should reflect state after delete', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('a')
      expect(lhm.values()).toEqual([2, 3])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(lhm.entries()).toEqual([])
    })

    it('should return entries in insertion order', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      expect(lhm.entries()).toEqual([['a', 1], ['b', 2]])
    })

    it('should reflect state after delete', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      expect(lhm.entries()).toEqual([['a', 1], ['c', 3]])
    })

    it('should reflect updated values', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('a', 10)
      expect(lhm.entries()).toEqual([['a', 10], ['b', 2]])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty map without calling callback', () => {
      const items: Array<[string, number]> = []
      lhm.forEach((key, value) => items.push([key, value]))
      expect(items).toEqual([])
    })

    it('should iterate over all items in insertion order', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      const items: Array<[string, number]> = []
      lhm.forEach((key, value) => items.push([key, value]))
      expect(items).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should provide correct key and value', () => {
      lhm.set('x', 42)
      lhm.forEach((key, value) => {
        expect(key).toBe('x')
        expect(value).toBe(42)
      })
    })

    it('should iterate single item', () => {
      lhm.set('a', 1)
      let count = 0
      lhm.forEach(() => count++)
      expect(count).toBe(1)
    })

    it('should iterate in insertion order not alphabetical', () => {
      lhm.set('c', 3)
      lhm.set('a', 1)
      lhm.set('b', 2)
      const keys: string[] = []
      lhm.forEach((key) => keys.push(key))
      expect(keys).toEqual(['c', 'a', 'b'])
    })
  })

  describe('first', () => {
    it('should return undefined for empty map', () => {
      expect(lhm.first()).toBeUndefined()
    })

    it('should return first inserted item', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      expect(lhm.first()).toEqual({ key: 'a', value: 1 })
    })

    it('should update after deleting first item', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.delete('a')
      expect(lhm.first()).toEqual({ key: 'b', value: 2 })
    })

    it('should not change after updating first item value', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('a', 10)
      expect(lhm.first()).toEqual({ key: 'a', value: 10 })
    })

    it('should return correct first after clear and reinsert', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      lhm.set('c', 3)
      expect(lhm.first()).toEqual({ key: 'c', value: 3 })
    })

    it('should return single item as first', () => {
      lhm.set('only', 99)
      expect(lhm.first()).toEqual({ key: 'only', value: 99 })
    })
  })

  describe('last', () => {
    it('should return undefined for empty map', () => {
      expect(lhm.last()).toBeUndefined()
    })

    it('should return last inserted item', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      expect(lhm.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should update after deleting last item', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.delete('b')
      expect(lhm.last()).toEqual({ key: 'a', value: 1 })
    })

    it('should not change after updating non-last item', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('a', 10)
      expect(lhm.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should update after inserting new item', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      expect(lhm.last()).toEqual({ key: 'c', value: 3 })
    })

    it('should return single item as last', () => {
      lhm.set('only', 99)
      expect(lhm.last()).toEqual({ key: 'only', value: 99 })
    })

    it('should update after clear and reinsert', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      lhm.set('c', 3)
      lhm.set('d', 4)
      expect(lhm.last()).toEqual({ key: 'd', value: 4 })
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_LINKED_HASHMAP_OPTIONS', () => {
      expect(DEFAULT_LINKED_HASHMAP_OPTIONS.initialCapacity).toBe(16)
    })

    it('should create LinkedHashMapEntry type correctly', () => {
      const entry: LinkedHashMapEntry<string, number> = {
        key: 'test',
        value: 42,
        prev: null,
        next: null,
      }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe(42)
    })

    it('should create LinkedHashMapOptions type correctly', () => {
      const opts: LinkedHashMapOptions = { initialCapacity: 32 }
      expect(opts.initialCapacity).toBe(32)
    })

    it('should support LinkedHashMapEntry with complex types', () => {
      const entry: LinkedHashMapEntry<number, string> = {
        key: 1,
        value: 'one',
        prev: null,
        next: null,
      }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })

    it('should support linked entries', () => {
      const first: LinkedHashMapEntry<string, number> = {
        key: 'a',
        value: 1,
        prev: null,
        next: null,
      }
      const second: LinkedHashMapEntry<string, number> = {
        key: 'b',
        value: 2,
        prev: first,
        next: null,
      }
      first.next = second
      expect(first.next?.key).toBe('b')
      expect(second.prev?.key).toBe('a')
    })
  })

  describe('generic type support', () => {
    it('should work with number keys', () => {
      const m = new LinkedHashMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should work with object values', () => {
      const m = new LinkedHashMap<string, { id: number }>()
      m.set('a', { id: 1 })
      expect(m.get('a')?.id).toBe(1)
    })

    it('should work with null values', () => {
      const m = new LinkedHashMap<string, number | null>()
      m.set('a', null)
      expect(m.get('a')).toBeNull()
    })

    it('should work with undefined values', () => {
      const m = new LinkedHashMap<string, number | undefined>()
      m.set('a', undefined)
      expect(m.get('a')).toBeUndefined()
      expect(m.has('a')).toBe(true)
    })

    it('should work with array values', () => {
      const m = new LinkedHashMap<string, number[]>()
      m.set('a', [1, 2, 3])
      expect(m.get('a')).toEqual([1, 2, 3])
    })

    it('should work with boolean values', () => {
      const m = new LinkedHashMap<string, boolean>()
      m.set('a', true)
      m.set('b', false)
      expect(m.get('a')).toBe(true)
      expect(m.get('b')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      lhm.set('', 0)
      expect(lhm.get('')).toBe(0)
      expect(lhm.has('')).toBe(true)
    })

    it('should handle zero value', () => {
      lhm.set('a', 0)
      expect(lhm.get('a')).toBe(0)
      expect(lhm.has('a')).toBe(true)
    })

    it('should handle false value and not confuse with undefined', () => {
      const m = new LinkedHashMap<string, boolean>()
      m.set('a', false)
      expect(m.get('a')).toBe(false)
      expect(m.has('a')).toBe(true)
    })

    it('should handle many items', () => {
      for (let i = 0; i < 1000; i++) {
        lhm.set(`key-${i}`, i)
      }
      expect(lhm.size()).toBe(1000)
      expect(lhm.get('key-0')).toBe(0)
      expect(lhm.get('key-999')).toBe(999)
    })

    it('should handle many items in order', () => {
      for (let i = 0; i < 100; i++) {
        lhm.set(`key-${i}`, i)
      }
      const keys = lhm.keys()
      expect(keys[0]).toBe('key-0')
      expect(keys[99]).toBe('key-99')
    })

    it('should handle set-delete-set cycle', () => {
      lhm.set('a', 1)
      lhm.delete('a')
      lhm.set('a', 2)
      expect(lhm.get('a')).toBe(2)
      expect(lhm.size()).toBe(1)
    })

    it('should handle get after delete', () => {
      lhm.set('a', 1)
      lhm.delete('a')
      expect(lhm.get('a')).toBeUndefined()
    })

    it('should handle operations on empty map', () => {
      expect(lhm.get('a')).toBeUndefined()
      expect(lhm.delete('a')).toBe(false)
      expect(lhm.has('a')).toBe(false)
      expect(lhm.first()).toBeUndefined()
      expect(lhm.last()).toBeUndefined()
    })

    it('should handle single item as both first and last', () => {
      lhm.set('only', 42)
      expect(lhm.first()).toEqual(lhm.last())
    })

    it('should handle delete all items sequentially', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('a')
      lhm.delete('c')
      lhm.delete('b')
      expect(lhm.size()).toBe(0)
      expect(lhm.isEmpty()).toBe(true)
    })

    it('should handle deleting nonexistent key from non-empty map', () => {
      lhm.set('a', 1)
      expect(lhm.delete('b')).toBe(false)
      expect(lhm.size()).toBe(1)
    })
  })

  describe('linked list integrity', () => {
    it('should maintain correct links after middle delete', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('b')
      expect(lhm.entries()).toEqual([['a', 1], ['c', 3]])
    })

    it('should maintain correct links after complex operations', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.set('d', 4)
      lhm.delete('a')
      lhm.delete('c')
      lhm.set('e', 5)
      expect(lhm.keys()).toEqual(['b', 'd', 'e'])
    })

    it('should handle interleaved add and delete', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.delete('a')
      lhm.set('c', 3)
      lhm.delete('b')
      lhm.set('d', 4)
      expect(lhm.keys()).toEqual(['c', 'd'])
    })

    it('should handle delete head then tail', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('a')
      lhm.delete('c')
      expect(lhm.keys()).toEqual(['b'])
      expect(lhm.first()).toEqual({ key: 'b', value: 2 })
      expect(lhm.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should handle delete tail then head', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.delete('c')
      lhm.delete('a')
      expect(lhm.keys()).toEqual(['b'])
      expect(lhm.first()).toEqual({ key: 'b', value: 2 })
      expect(lhm.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should handle clear then rebuild', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.clear()
      lhm.set('c', 3)
      lhm.set('d', 4)
      expect(lhm.entries()).toEqual([['c', 3], ['d', 4]])
    })

    it('should maintain order after value updates in multi-item map', () => {
      lhm.set('a', 1)
      lhm.set('b', 2)
      lhm.set('c', 3)
      lhm.set('b', 20)
      lhm.set('a', 10)
      expect(lhm.keys()).toEqual(['a', 'b', 'c'])
      expect(lhm.values()).toEqual([10, 20, 3])
    })
  })
})
