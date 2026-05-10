import { describe, it, expect, beforeEach } from 'vitest'
import { OrderedMap } from '../../src/core/ordered-map/ordered-map.js'
import { DEFAULT_ORDEREDMAP_OPTIONS } from '../../src/core/ordered-map/types.js'
import type { OrderedMapEntry, OrderedMapOptions, OrderedMapStats } from '../../src/core/ordered-map/types.js'

describe('OrderedMap', () => {
  let om: OrderedMap<string, number>

  beforeEach(() => {
    om = new OrderedMap<string, number>()
  })

  describe('construction', () => {
    it('should create an empty map with default options', () => {
      const m = new OrderedMap<string, number>()
      expect(m.size()).toBe(0)
    })

    it('should accept custom initialCapacity option', () => {
      const m = new OrderedMap<string, number>({ initialCapacity: 32 })
      expect(m.size()).toBe(0)
    })

    it('should accept no options', () => {
      const m = new OrderedMap()
      expect(m.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const m = new OrderedMap<string, number>({})
      expect(m.size()).toBe(0)
    })
  })

  describe('set/get/delete/has', () => {
    it('should return undefined for missing key', () => {
      expect(om.get('missing')).toBeUndefined()
    })

    it('should store and retrieve a value', () => {
      om.set('a', 1)
      expect(om.get('a')).toBe(1)
    })

    it('should overwrite existing key value', () => {
      om.set('a', 1)
      om.set('a', 2)
      expect(om.get('a')).toBe(2)
    })

    it('should not increase size when overwriting', () => {
      om.set('a', 1)
      om.set('a', 2)
      expect(om.size()).toBe(1)
    })

    it('should handle multiple keys', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.get('a')).toBe(1)
      expect(om.get('b')).toBe(2)
      expect(om.get('c')).toBe(3)
    })

    it('should not change insertion order on update', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.set('a', 10)
      expect(om.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should handle setting same key multiple times', () => {
      om.set('x', 1)
      om.set('x', 2)
      om.set('x', 3)
      expect(om.get('x')).toBe(3)
      expect(om.size()).toBe(1)
    })

    it('should delete existing key and return true', () => {
      om.set('a', 1)
      expect(om.delete('a')).toBe(true)
      expect(om.has('a')).toBe(false)
    })

    it('should return false when deleting missing key', () => {
      expect(om.delete('missing')).toBe(false)
    })

    it('should remove item after delete', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('b')
      expect(om.keys()).toEqual(['a', 'c'])
    })

    it('should handle has for missing key', () => {
      expect(om.has('missing')).toBe(false)
    })

    it('should handle has for existing key', () => {
      om.set('a', 1)
      expect(om.has('a')).toBe(true)
    })

    it('should return false for has after delete', () => {
      om.set('a', 1)
      om.delete('a')
      expect(om.has('a')).toBe(false)
    })

    it('should return true for has after update', () => {
      om.set('a', 1)
      om.set('a', 2)
      expect(om.has('a')).toBe(true)
    })

    it('should handle double delete', () => {
      om.set('a', 1)
      expect(om.delete('a')).toBe(true)
      expect(om.delete('a')).toBe(false)
    })

    it('should handle delete head', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('a')
      expect(om.keys()).toEqual(['b', 'c'])
    })

    it('should handle delete tail', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('c')
      expect(om.keys()).toEqual(['a', 'b'])
    })

    it('should handle delete middle', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('b')
      expect(om.keys()).toEqual(['a', 'c'])
    })

    it('should handle deleting the only item', () => {
      om.set('a', 1)
      om.delete('a')
      expect(om.size()).toBe(0)
      expect(om.keys()).toEqual([])
    })

    it('should handle deleting from two-item map', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      expect(om.keys()).toEqual(['b'])
    })
  })

  describe('first/last', () => {
    it('should return undefined for empty map first', () => {
      expect(om.first()).toBeUndefined()
    })

    it('should return undefined for empty map last', () => {
      expect(om.last()).toBeUndefined()
    })

    it('should return first inserted item', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.first()).toEqual({ key: 'a', value: 1 })
    })

    it('should return last inserted item', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should update first after deleting first item', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      expect(om.first()).toEqual({ key: 'b', value: 2 })
    })

    it('should update last after deleting last item', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('b')
      expect(om.last()).toEqual({ key: 'a', value: 1 })
    })

    it('should update first value on overwrite', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('a', 10)
      expect(om.first()).toEqual({ key: 'a', value: 10 })
    })

    it('should not change last when updating first', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('a', 10)
      expect(om.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should return single item as both first and last', () => {
      om.set('only', 42)
      expect(om.first()).toEqual({ key: 'only', value: 42 })
      expect(om.last()).toEqual({ key: 'only', value: 42 })
    })
  })

  describe('iteration order', () => {
    it('should maintain insertion order for keys', () => {
      om.set('c', 3)
      om.set('a', 1)
      om.set('b', 2)
      expect(om.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should maintain insertion order for values', () => {
      om.set('a', 10)
      om.set('b', 20)
      om.set('c', 30)
      expect(om.values()).toEqual([10, 20, 30])
    })

    it('should maintain insertion order for entries', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should preserve order after delete and reinsert', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('b')
      om.set('b', 20)
      expect(om.keys()).toEqual(['a', 'c', 'b'])
    })

    it('should not reorder on get', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.get('c')
      om.get('a')
      expect(om.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should not reorder on has', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.has('c')
      om.has('a')
      expect(om.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should iterate forEach in insertion order', () => {
      om.set('c', 3)
      om.set('a', 1)
      om.set('b', 2)
      const keys: string[] = []
      om.forEach((key) => keys.push(key))
      expect(keys).toEqual(['c', 'a', 'b'])
    })

    it('should reflect updated values in iteration', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('a', 10)
      expect(om.values()).toEqual([10, 2])
    })
  })

  describe('entries/keys/values', () => {
    it('should return empty arrays for empty map', () => {
      expect(om.entries()).toEqual([])
      expect(om.keys()).toEqual([])
      expect(om.values()).toEqual([])
    })

    it('should return correct entries', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.entries()).toEqual([['a', 1], ['b', 2]])
    })

    it('should return correct keys', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.keys()).toEqual(['a', 'b'])
    })

    it('should return correct values', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.values()).toEqual([1, 2])
    })

    it('should reflect state after delete in entries', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('b')
      expect(om.entries()).toEqual([['a', 1], ['c', 3]])
    })

    it('should reflect state after delete in keys', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('a')
      expect(om.keys()).toEqual(['b', 'c'])
    })

    it('should reflect state after delete in values', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('c')
      expect(om.values()).toEqual([1, 2])
    })
  })

  describe('size/isEmpty', () => {
    it('should return 0 for empty map', () => {
      expect(om.size()).toBe(0)
    })

    it('should return true for isEmpty on new map', () => {
      expect(om.isEmpty()).toBe(true)
    })

    it('should return correct size after inserts', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.size()).toBe(2)
    })

    it('should return false for isEmpty after insert', () => {
      om.set('a', 1)
      expect(om.isEmpty()).toBe(false)
    })

    it('should return correct size after deletes', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      expect(om.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.clear()
      expect(om.size()).toBe(0)
      expect(om.isEmpty()).toBe(true)
    })

    it('should not count overwrites as new entries', () => {
      om.set('a', 1)
      om.set('a', 2)
      om.set('a', 3)
      expect(om.size()).toBe(1)
    })

    it('should return true for isEmpty after deleting all items', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      om.delete('b')
      expect(om.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.clear()
      expect(om.size()).toBe(0)
    })

    it('should handle clearing empty map', () => {
      om.clear()
      expect(om.size()).toBe(0)
    })

    it('should allow set after clear', () => {
      om.set('a', 1)
      om.clear()
      om.set('b', 2)
      expect(om.get('b')).toBe(2)
      expect(om.size()).toBe(1)
    })

    it('should reset first and last', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.clear()
      expect(om.first()).toBeUndefined()
      expect(om.last()).toBeUndefined()
    })

    it('should reset keys and values', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.clear()
      expect(om.keys()).toEqual([])
      expect(om.values()).toEqual([])
      expect(om.entries()).toEqual([])
    })
  })

  describe('clone', () => {
    it('should produce an equal but separate map', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      const cloned = om.clone()
      expect(cloned.entries()).toEqual(om.entries())
      expect(cloned.size()).toBe(3)
    })

    it('should not affect original when modifying clone', () => {
      om.set('a', 1)
      om.set('b', 2)
      const cloned = om.clone()
      cloned.set('c', 3)
      expect(om.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should not affect clone when modifying original', () => {
      om.set('a', 1)
      om.set('b', 2)
      const cloned = om.clone()
      om.delete('a')
      expect(cloned.has('a')).toBe(true)
      expect(om.has('a')).toBe(false)
    })

    it('should clone an empty map', () => {
      const cloned = om.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.entries()).toEqual([])
    })

    it('should preserve insertion order in clone', () => {
      om.set('c', 3)
      om.set('a', 1)
      om.set('b', 2)
      const cloned = om.clone()
      expect(cloned.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should clone single item map', () => {
      om.set('only', 42)
      const cloned = om.clone()
      expect(cloned.get('only')).toBe(42)
      expect(cloned.size()).toBe(1)
    })
  })

  describe('from factory', () => {
    it('should create map from array of entries', () => {
      const m = OrderedMap.from([['a', 1], ['b', 2], ['c', 3]] as const)
      expect(m.size()).toBe(3)
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBe(2)
      expect(m.get('c')).toBe(3)
    })

    it('should create map from Map', () => {
      const input = new Map([['x', 10], ['y', 20]])
      const m = OrderedMap.from(input)
      expect(m.size()).toBe(2)
      expect(m.get('x')).toBe(10)
      expect(m.get('y')).toBe(20)
    })

    it('should create map from empty iterable', () => {
      const m = OrderedMap.from<string, number>([])
      expect(m.size()).toBe(0)
    })

    it('should preserve insertion order from iterable', () => {
      const m = OrderedMap.from([['c', 3], ['a', 1], ['b', 2]] as const)
      expect(m.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should use last value for duplicate keys in iterable', () => {
      const m = OrderedMap.from([['a', 1], ['a', 2]] as const)
      expect(m.get('a')).toBe(2)
      expect(m.size()).toBe(1)
    })

    it('should create map from generator', () => {
      function* gen(): Generator<[string, number]> {
        yield ['a', 1]
        yield ['b', 2]
      }
      const m = OrderedMap.from(gen())
      expect(m.size()).toBe(2)
      expect(m.get('a')).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(om.toArray()).toEqual([])
    })

    it('should return entries in insertion order', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.toArray()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should return same result as entries', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.toArray()).toEqual(om.entries())
    })

    it('should reflect state after delete', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('b')
      expect(om.toArray()).toEqual([['a', 1], ['c', 3]])
    })
  })

  describe('indexOf', () => {
    it('should return -1 for missing key', () => {
      expect(om.indexOf('missing')).toBe(-1)
    })

    it('should return 0 for first key', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.indexOf('a')).toBe(0)
    })

    it('should return correct index for middle key', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.indexOf('b')).toBe(1)
    })

    it('should return correct index for last key', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.indexOf('c')).toBe(2)
    })

    it('should return -1 for deleted key', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      expect(om.indexOf('a')).toBe(-1)
    })

    it('should return 0 for single item', () => {
      om.set('only', 42)
      expect(om.indexOf('only')).toBe(0)
    })

    it('should return correct index after reinsert', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('b')
      om.set('b', 20)
      expect(om.indexOf('b')).toBe(2)
    })
  })

  describe('atIndex', () => {
    it('should return undefined for negative index', () => {
      om.set('a', 1)
      expect(om.atIndex(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds index', () => {
      om.set('a', 1)
      expect(om.atIndex(5)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      expect(om.atIndex(0)).toBeUndefined()
    })

    it('should return entry at index 0', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.atIndex(0)).toEqual(['a', 1])
    })

    it('should return entry at middle index', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.atIndex(1)).toEqual(['b', 2])
    })

    it('should return entry at last index', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      expect(om.atIndex(2)).toEqual(['c', 3])
    })

    it('should reflect updated values', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('a', 10)
      expect(om.atIndex(0)).toEqual(['a', 10])
    })

    it('should return undefined for index equal to size', () => {
      om.set('a', 1)
      om.set('b', 2)
      expect(om.atIndex(2)).toBeUndefined()
    })
  })

  describe('moveToFront', () => {
    it('should return false for missing key', () => {
      expect(om.moveToFront('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      om.set('a', 1)
      expect(om.moveToFront('a')).toBe(true)
    })

    it('should move middle item to front', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToFront('b')
      expect(om.keys()).toEqual(['b', 'a', 'c'])
    })

    it('should move last item to front', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToFront('c')
      expect(om.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should not change order when moving front item', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToFront('a')
      expect(om.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should return true but not change for single item', () => {
      om.set('only', 42)
      expect(om.moveToFront('only')).toBe(true)
      expect(om.keys()).toEqual(['only'])
    })

    it('should update first correctly', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToFront('c')
      expect(om.first()).toEqual({ key: 'c', value: 3 })
    })

    it('should update last correctly when moving last to front', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToFront('c')
      expect(om.last()).toEqual({ key: 'b', value: 2 })
    })

    it('should preserve values when moving', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToFront('b')
      expect(om.get('b')).toBe(2)
      expect(om.values()).toEqual([2, 1, 3])
    })
  })

  describe('moveToBack', () => {
    it('should return false for missing key', () => {
      expect(om.moveToBack('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      om.set('a', 1)
      expect(om.moveToBack('a')).toBe(true)
    })

    it('should move middle item to back', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToBack('b')
      expect(om.keys()).toEqual(['a', 'c', 'b'])
    })

    it('should move first item to back', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToBack('a')
      expect(om.keys()).toEqual(['b', 'c', 'a'])
    })

    it('should not change order when moving back item', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToBack('c')
      expect(om.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should return true but not change for single item', () => {
      om.set('only', 42)
      expect(om.moveToBack('only')).toBe(true)
      expect(om.keys()).toEqual(['only'])
    })

    it('should update last correctly', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToBack('a')
      expect(om.last()).toEqual({ key: 'a', value: 1 })
    })

    it('should update first correctly when moving first to back', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToBack('a')
      expect(om.first()).toEqual({ key: 'b', value: 2 })
    })

    it('should preserve values when moving', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.moveToBack('a')
      expect(om.get('a')).toBe(1)
      expect(om.values()).toEqual([2, 3, 1])
    })
  })

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      om.set('', 0)
      expect(om.get('')).toBe(0)
      expect(om.has('')).toBe(true)
    })

    it('should handle zero value', () => {
      om.set('a', 0)
      expect(om.get('a')).toBe(0)
      expect(om.has('a')).toBe(true)
    })

    it('should handle false value', () => {
      const m = new OrderedMap<string, boolean>()
      m.set('a', false)
      expect(m.get('a')).toBe(false)
      expect(m.has('a')).toBe(true)
    })

    it('should handle null values', () => {
      const m = new OrderedMap<string, number | null>()
      m.set('a', null)
      expect(m.get('a')).toBeNull()
    })

    it('should handle undefined values', () => {
      const m = new OrderedMap<string, number | undefined>()
      m.set('a', undefined)
      expect(m.get('a')).toBeUndefined()
      expect(m.has('a')).toBe(true)
    })

    it('should handle delete and re-insert goes to end', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('a')
      om.set('a', 10)
      expect(om.keys()).toEqual(['b', 'c', 'a'])
      expect(om.get('a')).toBe(10)
    })

    it('should handle overwrite preserves position', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.set('b', 20)
      expect(om.keys()).toEqual(['a', 'b', 'c'])
      expect(om.values()).toEqual([1, 20, 3])
    })

    it('should handle operations on empty map', () => {
      expect(om.get('a')).toBeUndefined()
      expect(om.delete('a')).toBe(false)
      expect(om.has('a')).toBe(false)
      expect(om.first()).toBeUndefined()
      expect(om.last()).toBeUndefined()
      expect(om.indexOf('a')).toBe(-1)
      expect(om.atIndex(0)).toBeUndefined()
      expect(om.moveToFront('a')).toBe(false)
      expect(om.moveToBack('a')).toBe(false)
    })

    it('should handle single item as both first and last', () => {
      om.set('only', 42)
      expect(om.first()).toEqual(om.last())
    })

    it('should handle delete all items sequentially', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      om.delete('a')
      om.delete('c')
      om.delete('b')
      expect(om.size()).toBe(0)
      expect(om.isEmpty()).toBe(true)
    })

    it('should handle deleting nonexistent key from non-empty map', () => {
      om.set('a', 1)
      expect(om.delete('b')).toBe(false)
      expect(om.size()).toBe(1)
    })

    it('should handle clear then rebuild', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.clear()
      om.set('c', 3)
      om.set('d', 4)
      expect(om.entries()).toEqual([['c', 3], ['d', 4]])
    })

    it('should handle interleaved add and delete', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      om.set('c', 3)
      om.delete('b')
      om.set('d', 4)
      expect(om.keys()).toEqual(['c', 'd'])
    })

    it('should handle forEach on empty map', () => {
      const items: Array<[string, number]> = []
      om.forEach((key, value) => items.push([key, value]))
      expect(items).toEqual([])
    })

    it('should handle forEach with correct key/value', () => {
      om.set('x', 42)
      om.forEach((key, value) => {
        expect(key).toBe('x')
        expect(value).toBe(42)
      })
    })

    it('should handle set-delete-set cycle', () => {
      om.set('a', 1)
      om.delete('a')
      om.set('a', 2)
      expect(om.get('a')).toBe(2)
      expect(om.size()).toBe(1)
    })

    it('should handle get after delete', () => {
      om.set('a', 1)
      om.delete('a')
      expect(om.get('a')).toBeUndefined()
    })
  })

  describe('large maps', () => {
    it('should handle 10000+ items', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i * 2)
      }
      expect(m.size()).toBe(10000)
      expect(m.get(0)).toBe(0)
      expect(m.get(9999)).toBe(19998)
    })

    it('should maintain order with 10000+ items', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      const keys = m.keys()
      expect(keys[0]).toBe(0)
      expect(keys[9999]).toBe(9999)
    })

    it('should handle deletion from large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      m.delete(5000)
      expect(m.size()).toBe(9999)
      expect(m.has(5000)).toBe(false)
      expect(m.get(5001)).toBe(5001)
    })

    it('should handle indexOf on large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      expect(m.indexOf(0)).toBe(0)
      expect(m.indexOf(5000)).toBe(5000)
      expect(m.indexOf(9999)).toBe(9999)
      expect(m.indexOf(10000)).toBe(-1)
    })

    it('should handle atIndex on large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      expect(m.atIndex(0)).toEqual([0, 0])
      expect(m.atIndex(5000)).toEqual([5000, 5000])
      expect(m.atIndex(9999)).toEqual([9999, 9999])
      expect(m.atIndex(10000)).toBeUndefined()
    })

    it('should handle clone of large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 5000; i++) {
        m.set(i, i)
      }
      const cloned = m.clone()
      expect(cloned.size()).toBe(5000)
      expect(cloned.get(4999)).toBe(4999)
    })

    it('should handle moveToFront on large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        m.set(i, i)
      }
      m.moveToFront(999)
      expect(m.first()).toEqual({ key: 999, value: 999 })
      expect(m.keys()?.[1]).toBe(0)
    })

    it('should handle moveToBack on large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        m.set(i, i)
      }
      m.moveToBack(0)
      expect(m.last()).toEqual({ key: 0, value: 0 })
      expect(m.keys()?.[0]).toBe(1)
    })

    it('should handle clear on large map', () => {
      const m = new OrderedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      m.clear()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty map', () => {
      const s = om.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.capacity).toBe(16)
      expect(s.loadFactor).toBe(0)
    })

    it('should return correct stats for populated map', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.set('c', 3)
      const s = om.stats()
      expect(s.size).toBe(3)
      expect(s.isEmpty).toBe(false)
      expect(s.loadFactor).toBe(3 / 16)
    })

    it('should reflect custom capacity', () => {
      const m = new OrderedMap<string, number>({ initialCapacity: 32 })
      m.set('a', 1)
      const s = m.stats()
      expect(s.capacity).toBe(32)
      expect(s.loadFactor).toBe(1 / 32)
    })

    it('should reflect stats after delete', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.delete('a')
      const s = om.stats()
      expect(s.size).toBe(1)
    })

    it('should reflect stats after clear', () => {
      om.set('a', 1)
      om.set('b', 2)
      om.clear()
      const s = om.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.loadFactor).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_ORDEREDMAP_OPTIONS', () => {
      expect(DEFAULT_ORDEREDMAP_OPTIONS.initialCapacity).toBe(16)
    })

    it('should create OrderedMapEntry type correctly', () => {
      const entry: OrderedMapEntry<string, number> = {
        key: 'test',
        value: 42,
        prev: null,
        next: null,
      }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe(42)
    })

    it('should create OrderedMapOptions type correctly', () => {
      const opts: OrderedMapOptions = { initialCapacity: 32 }
      expect(opts.initialCapacity).toBe(32)
    })

    it('should support OrderedMapEntry with complex types', () => {
      const entry: OrderedMapEntry<number, string> = {
        key: 1,
        value: 'one',
        prev: null,
        next: null,
      }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })

    it('should support linked entries', () => {
      const first: OrderedMapEntry<string, number> = {
        key: 'a',
        value: 1,
        prev: null,
        next: null,
      }
      const second: OrderedMapEntry<string, number> = {
        key: 'b',
        value: 2,
        prev: first,
        next: null,
      }
      first.next = second
      expect(first.next?.key).toBe('b')
      expect(second.prev?.key).toBe('a')
    })

    it('should create OrderedMapStats type correctly', () => {
      const s: OrderedMapStats = {
        size: 5,
        isEmpty: false,
        capacity: 16,
        loadFactor: 0.3125,
      }
      expect(s.size).toBe(5)
      expect(s.isEmpty).toBe(false)
    })
  })

  describe('generic type support', () => {
    it('should work with number keys', () => {
      const m = new OrderedMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should work with object values', () => {
      const m = new OrderedMap<string, { id: number }>()
      m.set('a', { id: 1 })
      expect(m.get('a')?.id).toBe(1)
    })

    it('should work with boolean values', () => {
      const m = new OrderedMap<string, boolean>()
      m.set('a', true)
      m.set('b', false)
      expect(m.get('a')).toBe(true)
      expect(m.get('b')).toBe(false)
    })

    it('should work with array values', () => {
      const m = new OrderedMap<string, number[]>()
      m.set('a', [1, 2, 3])
      expect(m.get('a')).toEqual([1, 2, 3])
    })
  })
})
