import { describe, it, expect, beforeEach } from 'vitest'
import { DequeMap } from '../../src/core/deque-map/deque-map.js'
import { DEFAULT_DEQUEMAP_OPTIONS } from '../../src/core/deque-map/types.js'
import type { DequeMapEntry, DequeMapStats } from '../../src/core/deque-map/types.js'

describe('DequeMap', () => {
  let dm: DequeMap<string, number>

  beforeEach(() => {
    dm = new DequeMap<string, number>()
  })

  describe('construction', () => {
    it('should create an empty map', () => {
      const m = new DequeMap<string, number>()
      expect(m.size).toBe(0)
    })

    it('should create map without generics', () => {
      const m = new DequeMap()
      expect(m.size).toBe(0)
    })

    it('should create map with isEmpty true', () => {
      const m = new DequeMap<string, number>()
      expect(m.isEmpty).toBe(true)
    })
  })

  describe('set', () => {
    it('should store and retrieve a value', () => {
      dm.set('a', 1)
      expect(dm.get('a')).toBe(1)
    })

    it('should handle multiple keys', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.get('a')).toBe(1)
      expect(dm.get('b')).toBe(2)
      expect(dm.get('c')).toBe(3)
    })

    it('should move key to end on re-set', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('a', 10)
      expect(dm.keys()).toEqual(['b', 'c', 'a'])
    })

    it('should update value on re-set', () => {
      dm.set('a', 1)
      dm.set('a', 2)
      expect(dm.get('a')).toBe(2)
    })

    it('should not increase size on re-set', () => {
      dm.set('a', 1)
      dm.set('a', 2)
      expect(dm.size).toBe(1)
    })

    it('should handle setting same key multiple times', () => {
      dm.set('x', 1)
      dm.set('x', 2)
      dm.set('x', 3)
      expect(dm.get('x')).toBe(3)
      expect(dm.size).toBe(1)
    })

    it('should move re-set key to very end', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('d', 4)
      dm.set('b', 20)
      expect(dm.keys()).toEqual(['a', 'c', 'd', 'b'])
      expect(dm.last).toEqual({ key: 'b', value: 20 })
    })

    it('should handle re-set of single item', () => {
      dm.set('a', 1)
      dm.set('a', 2)
      expect(dm.keys()).toEqual(['a'])
      expect(dm.first).toEqual({ key: 'a', value: 2 })
      expect(dm.last).toEqual({ key: 'a', value: 2 })
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(dm.get('missing')).toBeUndefined()
    })

    it('should return stored value', () => {
      dm.set('a', 42)
      expect(dm.get('a')).toBe(42)
    })

    it('should return updated value after re-set', () => {
      dm.set('a', 1)
      dm.set('a', 2)
      expect(dm.get('a')).toBe(2)
    })

    it('should return undefined after delete', () => {
      dm.set('a', 1)
      dm.delete('a')
      expect(dm.get('a')).toBeUndefined()
    })

    it('should not affect order on get', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.get('a')
      dm.get('c')
      expect(dm.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      dm.set('a', 1)
      expect(dm.delete('a')).toBe(true)
      expect(dm.has('a')).toBe(false)
    })

    it('should return false for missing key', () => {
      expect(dm.delete('missing')).toBe(false)
    })

    it('should handle double delete', () => {
      dm.set('a', 1)
      expect(dm.delete('a')).toBe(true)
      expect(dm.delete('a')).toBe(false)
    })

    it('should remove head', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('a')
      expect(dm.keys()).toEqual(['b', 'c'])
    })

    it('should remove tail', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('c')
      expect(dm.keys()).toEqual(['a', 'b'])
    })

    it('should remove middle', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('b')
      expect(dm.keys()).toEqual(['a', 'c'])
    })

    it('should handle deleting only item', () => {
      dm.set('a', 1)
      dm.delete('a')
      expect(dm.size).toBe(0)
      expect(dm.keys()).toEqual([])
    })

    it('should handle deleting from two-item map (head)', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      expect(dm.keys()).toEqual(['b'])
    })

    it('should handle deleting from two-item map (tail)', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('b')
      expect(dm.keys()).toEqual(['a'])
    })

    it('should handle deleting nonexistent from non-empty map', () => {
      dm.set('a', 1)
      expect(dm.delete('b')).toBe(false)
      expect(dm.size).toBe(1)
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(dm.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      dm.set('a', 1)
      expect(dm.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      dm.set('a', 1)
      dm.delete('a')
      expect(dm.has('a')).toBe(false)
    })

    it('should return true after re-set', () => {
      dm.set('a', 1)
      dm.set('a', 2)
      expect(dm.has('a')).toBe(true)
    })

    it('should not affect order on has', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.has('c')
      dm.has('a')
      expect(dm.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('first', () => {
    it('should return undefined for empty map', () => {
      expect(dm.first).toBeUndefined()
    })

    it('should return first inserted item', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.first).toEqual({ key: 'a', value: 1 })
    })

    it('should update after deleting first', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      expect(dm.first).toEqual({ key: 'b', value: 2 })
    })

    it('should return single item', () => {
      dm.set('only', 42)
      expect(dm.first).toEqual({ key: 'only', value: 42 })
    })

    it('should not change on re-set of non-first key', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('b', 20)
      expect(dm.first).toEqual({ key: 'a', value: 1 })
    })

    it('should change when first key is re-set', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('a', 10)
      expect(dm.first).toEqual({ key: 'b', value: 2 })
    })
  })

  describe('last', () => {
    it('should return undefined for empty map', () => {
      expect(dm.last).toBeUndefined()
    })

    it('should return last inserted item', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.last).toEqual({ key: 'b', value: 2 })
    })

    it('should update after deleting last', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('b')
      expect(dm.last).toEqual({ key: 'a', value: 1 })
    })

    it('should return single item', () => {
      dm.set('only', 42)
      expect(dm.last).toEqual({ key: 'only', value: 42 })
    })

    it('should update on re-set', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('a', 10)
      expect(dm.last).toEqual({ key: 'a', value: 10 })
    })
  })

  describe('shift', () => {
    it('should return undefined for empty map', () => {
      expect(dm.shift()).toBeUndefined()
    })

    it('should remove and return first item', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.shift()).toEqual({ key: 'a', value: 1 })
      expect(dm.keys()).toEqual(['b', 'c'])
    })

    it('should handle shift on single item', () => {
      dm.set('only', 42)
      expect(dm.shift()).toEqual({ key: 'only', value: 42 })
      expect(dm.size).toBe(0)
      expect(dm.isEmpty).toBe(true)
    })

    it('should handle shift all items', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.shift()).toEqual({ key: 'a', value: 1 })
      expect(dm.shift()).toEqual({ key: 'b', value: 2 })
      expect(dm.shift()).toEqual({ key: 'c', value: 3 })
      expect(dm.shift()).toBeUndefined()
      expect(dm.isEmpty).toBe(true)
    })

    it('should update first after shift', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.shift()
      expect(dm.first).toEqual({ key: 'b', value: 2 })
    })

    it('should decrement size', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.shift()
      expect(dm.size).toBe(1)
    })

    it('should remove from map', () => {
      dm.set('a', 1)
      dm.shift()
      expect(dm.has('a')).toBe(false)
    })
  })

  describe('pop', () => {
    it('should return undefined for empty map', () => {
      expect(dm.pop()).toBeUndefined()
    })

    it('should remove and return last item', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.pop()).toEqual({ key: 'c', value: 3 })
      expect(dm.keys()).toEqual(['a', 'b'])
    })

    it('should handle pop on single item', () => {
      dm.set('only', 42)
      expect(dm.pop()).toEqual({ key: 'only', value: 42 })
      expect(dm.size).toBe(0)
      expect(dm.isEmpty).toBe(true)
    })

    it('should handle pop all items', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.pop()).toEqual({ key: 'c', value: 3 })
      expect(dm.pop()).toEqual({ key: 'b', value: 2 })
      expect(dm.pop()).toEqual({ key: 'a', value: 1 })
      expect(dm.pop()).toBeUndefined()
      expect(dm.isEmpty).toBe(true)
    })

    it('should update last after pop', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.pop()
      expect(dm.last).toEqual({ key: 'a', value: 1 })
    })

    it('should decrement size', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.pop()
      expect(dm.size).toBe(1)
    })

    it('should remove from map', () => {
      dm.set('a', 1)
      dm.pop()
      expect(dm.has('a')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(dm.size).toBe(0)
    })

    it('should return correct size after inserts', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.size).toBe(2)
    })

    it('should return correct size after deletes', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      expect(dm.size).toBe(1)
    })

    it('should not count re-sets as new entries', () => {
      dm.set('a', 1)
      dm.set('a', 2)
      dm.set('a', 3)
      expect(dm.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.clear()
      expect(dm.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new map', () => {
      expect(dm.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      dm.set('a', 1)
      expect(dm.isEmpty).toBe(false)
    })

    it('should return true after deleting all', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      dm.delete('b')
      expect(dm.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      dm.set('a', 1)
      dm.clear()
      expect(dm.isEmpty).toBe(true)
    })

    it('should return true after shift all', () => {
      dm.set('a', 1)
      dm.shift()
      expect(dm.isEmpty).toBe(true)
    })

    it('should return true after pop all', () => {
      dm.set('a', 1)
      dm.pop()
      expect(dm.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.clear()
      expect(dm.size).toBe(0)
    })

    it('should handle clearing empty map', () => {
      dm.clear()
      expect(dm.size).toBe(0)
    })

    it('should allow set after clear', () => {
      dm.set('a', 1)
      dm.clear()
      dm.set('b', 2)
      expect(dm.get('b')).toBe(2)
      expect(dm.size).toBe(1)
    })

    it('should reset first and last', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.clear()
      expect(dm.first).toBeUndefined()
      expect(dm.last).toBeUndefined()
    })

    it('should reset keys, values, entries', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.clear()
      expect(dm.keys()).toEqual([])
      expect(dm.values()).toEqual([])
      expect(dm.entries()).toEqual([])
    })
  })

  describe('clone', () => {
    it('should produce an equal but separate map', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      const cloned = dm.clone()
      expect(cloned.entries()).toEqual(dm.entries())
      expect(cloned.size).toBe(3)
    })

    it('should not affect original when modifying clone', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      const cloned = dm.clone()
      cloned.set('c', 3)
      expect(dm.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('should not affect clone when modifying original', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      const cloned = dm.clone()
      dm.delete('a')
      expect(cloned.has('a')).toBe(true)
      expect(dm.has('a')).toBe(false)
    })

    it('should clone an empty map', () => {
      const cloned = dm.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.entries()).toEqual([])
    })

    it('should preserve insertion order in clone', () => {
      dm.set('c', 3)
      dm.set('a', 1)
      dm.set('b', 2)
      const cloned = dm.clone()
      expect(cloned.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should clone single item map', () => {
      dm.set('only', 42)
      const cloned = dm.clone()
      expect(cloned.get('only')).toBe(42)
      expect(cloned.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(dm.toArray()).toEqual([])
    })

    it('should return entries in insertion order', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.toArray()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should return same result as entries', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.toArray()).toEqual(dm.entries())
    })

    it('should reflect state after delete', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('b')
      expect(dm.toArray()).toEqual([['a', 1], ['c', 3]])
    })

    it('should reflect re-set order', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('a', 10)
      expect(dm.toArray()).toEqual([['b', 2], ['a', 10]])
    })
  })

  describe('forEach', () => {
    it('should iterate in insertion order', () => {
      dm.set('c', 3)
      dm.set('a', 1)
      dm.set('b', 2)
      const keys: string[] = []
      dm.forEach((key) => keys.push(key))
      expect(keys).toEqual(['c', 'a', 'b'])
    })

    it('should handle empty map', () => {
      const items: Array<[string, number]> = []
      dm.forEach((key, value) => items.push([key, value]))
      expect(items).toEqual([])
    })

    it('should provide correct key and value', () => {
      dm.set('x', 42)
      dm.forEach((key, value) => {
        expect(key).toBe('x')
        expect(value).toBe(42)
      })
    })

    it('should reflect updated values', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('a', 10)
      const values: number[] = []
      dm.forEach((_key, value) => values.push(value))
      expect(values).toEqual([2, 10])
    })
  })

  describe('keys/values/entries', () => {
    it('should return empty arrays for empty map', () => {
      expect(dm.entries()).toEqual([])
      expect(dm.keys()).toEqual([])
      expect(dm.values()).toEqual([])
    })

    it('should return correct entries', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.entries()).toEqual([['a', 1], ['b', 2]])
    })

    it('should return correct keys', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.keys()).toEqual(['a', 'b'])
    })

    it('should return correct values', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.values()).toEqual([1, 2])
    })

    it('should reflect delete in entries', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('b')
      expect(dm.entries()).toEqual([['a', 1], ['c', 3]])
    })

    it('should reflect delete in keys', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('a')
      expect(dm.keys()).toEqual(['b', 'c'])
    })

    it('should reflect delete in values', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('c')
      expect(dm.values()).toEqual([1, 2])
    })

    it('should reflect re-set order', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('a', 10)
      expect(dm.keys()).toEqual(['b', 'c', 'a'])
      expect(dm.values()).toEqual([2, 3, 10])
    })
  })

  describe('from factory', () => {
    it('should create map from array of entries', () => {
      const m = DequeMap.from([['a', 1], ['b', 2], ['c', 3]] as const)
      expect(m.size).toBe(3)
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBe(2)
      expect(m.get('c')).toBe(3)
    })

    it('should create map from Map', () => {
      const input = new Map([['x', 10], ['y', 20]])
      const m = DequeMap.from(input)
      expect(m.size).toBe(2)
      expect(m.get('x')).toBe(10)
      expect(m.get('y')).toBe(20)
    })

    it('should create map from empty iterable', () => {
      const m = DequeMap.from<string, number>([])
      expect(m.size).toBe(0)
    })

    it('should preserve insertion order from iterable', () => {
      const m = DequeMap.from([['c', 3], ['a', 1], ['b', 2]] as const)
      expect(m.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should use last value for duplicate keys in iterable', () => {
      const m = DequeMap.from([['a', 1], ['a', 2]] as const)
      expect(m.get('a')).toBe(2)
      expect(m.size).toBe(1)
    })

    it('should create map from generator', () => {
      function* gen(): Generator<[string, number]> {
        yield ['a', 1]
        yield ['b', 2]
      }
      const m = DequeMap.from(gen())
      expect(m.size).toBe(2)
      expect(m.get('a')).toBe(1)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for missing key', () => {
      expect(dm.indexOf('missing')).toBe(-1)
    })

    it('should return 0 for first key', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.indexOf('a')).toBe(0)
    })

    it('should return correct index for middle key', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.indexOf('b')).toBe(1)
    })

    it('should return correct index for last key', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.indexOf('c')).toBe(2)
    })

    it('should return -1 for deleted key', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      expect(dm.indexOf('a')).toBe(-1)
    })

    it('should return 0 for single item', () => {
      dm.set('only', 42)
      expect(dm.indexOf('only')).toBe(0)
    })

    it('should return updated index after re-set moves to end', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('a', 10)
      expect(dm.indexOf('a')).toBe(2)
    })

    it('should return correct index after reinsert', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('b')
      dm.set('b', 20)
      expect(dm.indexOf('b')).toBe(2)
    })
  })

  describe('atIndex', () => {
    it('should return undefined for negative index', () => {
      dm.set('a', 1)
      expect(dm.atIndex(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds index', () => {
      dm.set('a', 1)
      expect(dm.atIndex(5)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      expect(dm.atIndex(0)).toBeUndefined()
    })

    it('should return entry at index 0', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.atIndex(0)).toEqual({ key: 'a', value: 1 })
    })

    it('should return entry at middle index', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.atIndex(1)).toEqual({ key: 'b', value: 2 })
    })

    it('should return entry at last index', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.atIndex(2)).toEqual({ key: 'c', value: 3 })
    })

    it('should reflect updated values', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('a', 10)
      expect(dm.atIndex(0)).toEqual({ key: 'b', value: 2 })
      expect(dm.atIndex(1)).toEqual({ key: 'a', value: 10 })
    })

    it('should return undefined for index equal to size', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.atIndex(2)).toBeUndefined()
    })
  })

  describe('moveToFront', () => {
    it('should return false for missing key', () => {
      expect(dm.moveToFront('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      dm.set('a', 1)
      expect(dm.moveToFront('a')).toBe(true)
    })

    it('should move middle item to front', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('b')
      expect(dm.keys()).toEqual(['b', 'a', 'c'])
    })

    it('should move last item to front', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('c')
      expect(dm.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should not change order when moving front item', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('a')
      expect(dm.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should return true but not change for single item', () => {
      dm.set('only', 42)
      expect(dm.moveToFront('only')).toBe(true)
      expect(dm.keys()).toEqual(['only'])
    })

    it('should update first correctly', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('c')
      expect(dm.first).toEqual({ key: 'c', value: 3 })
    })

    it('should update last correctly when moving last to front', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('c')
      expect(dm.last).toEqual({ key: 'b', value: 2 })
    })

    it('should preserve values when moving', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('b')
      expect(dm.get('b')).toBe(2)
      expect(dm.values()).toEqual([2, 1, 3])
    })
  })

  describe('moveToBack', () => {
    it('should return false for missing key', () => {
      expect(dm.moveToBack('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      dm.set('a', 1)
      expect(dm.moveToBack('a')).toBe(true)
    })

    it('should move middle item to back', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToBack('b')
      expect(dm.keys()).toEqual(['a', 'c', 'b'])
    })

    it('should move first item to back', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToBack('a')
      expect(dm.keys()).toEqual(['b', 'c', 'a'])
    })

    it('should not change order when moving back item', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToBack('c')
      expect(dm.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should return true but not change for single item', () => {
      dm.set('only', 42)
      expect(dm.moveToBack('only')).toBe(true)
      expect(dm.keys()).toEqual(['only'])
    })

    it('should update last correctly', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToBack('a')
      expect(dm.last).toEqual({ key: 'a', value: 1 })
    })

    it('should update first correctly when moving first to back', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToBack('a')
      expect(dm.first).toEqual({ key: 'b', value: 2 })
    })

    it('should preserve values when moving', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToBack('a')
      expect(dm.get('a')).toBe(1)
      expect(dm.values()).toEqual([2, 3, 1])
    })
  })

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      dm.set('', 0)
      expect(dm.get('')).toBe(0)
      expect(dm.has('')).toBe(true)
    })

    it('should handle zero value', () => {
      dm.set('a', 0)
      expect(dm.get('a')).toBe(0)
      expect(dm.has('a')).toBe(true)
    })

    it('should handle false value', () => {
      const m = new DequeMap<string, boolean>()
      m.set('a', false)
      expect(m.get('a')).toBe(false)
      expect(m.has('a')).toBe(true)
    })

    it('should handle null values', () => {
      const m = new DequeMap<string, number | null>()
      m.set('a', null)
      expect(m.get('a')).toBeNull()
    })

    it('should handle undefined values', () => {
      const m = new DequeMap<string, number | undefined>()
      m.set('a', undefined)
      expect(m.get('a')).toBeUndefined()
      expect(m.has('a')).toBe(true)
    })

    it('should handle delete and re-insert goes to end', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('a')
      dm.set('a', 10)
      expect(dm.keys()).toEqual(['b', 'c', 'a'])
      expect(dm.get('a')).toBe(10)
    })

    it('should handle re-set moves to end', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('b', 20)
      expect(dm.keys()).toEqual(['a', 'c', 'b'])
      expect(dm.values()).toEqual([1, 3, 20])
    })

    it('should handle operations on empty map', () => {
      expect(dm.get('a')).toBeUndefined()
      expect(dm.delete('a')).toBe(false)
      expect(dm.has('a')).toBe(false)
      expect(dm.first).toBeUndefined()
      expect(dm.last).toBeUndefined()
      expect(dm.indexOf('a')).toBe(-1)
      expect(dm.atIndex(0)).toBeUndefined()
      expect(dm.moveToFront('a')).toBe(false)
      expect(dm.moveToBack('a')).toBe(false)
      expect(dm.shift()).toBeUndefined()
      expect(dm.pop()).toBeUndefined()
    })

    it('should handle single item as both first and last', () => {
      dm.set('only', 42)
      expect(dm.first).toEqual(dm.last)
    })

    it('should handle delete all items sequentially', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('a')
      dm.delete('c')
      dm.delete('b')
      expect(dm.size).toBe(0)
      expect(dm.isEmpty).toBe(true)
    })

    it('should handle clear then rebuild', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.clear()
      dm.set('c', 3)
      dm.set('d', 4)
      expect(dm.entries()).toEqual([['c', 3], ['d', 4]])
    })

    it('should handle interleaved add and delete', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      dm.set('c', 3)
      dm.delete('b')
      dm.set('d', 4)
      expect(dm.keys()).toEqual(['c', 'd'])
    })

    it('should handle set-delete-set cycle', () => {
      dm.set('a', 1)
      dm.delete('a')
      dm.set('a', 2)
      expect(dm.get('a')).toBe(2)
      expect(dm.size).toBe(1)
    })

    it('should handle get after delete', () => {
      dm.set('a', 1)
      dm.delete('a')
      expect(dm.get('a')).toBeUndefined()
    })

    it('should handle shift then pop', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.shift()).toEqual({ key: 'a', value: 1 })
      expect(dm.pop()).toEqual({ key: 'c', value: 3 })
      expect(dm.size).toBe(1)
      expect(dm.first).toEqual(dm.last)
    })

    it('should handle pop then shift', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.pop()).toEqual({ key: 'c', value: 3 })
      expect(dm.shift()).toEqual({ key: 'a', value: 1 })
      expect(dm.size).toBe(1)
    })

    it('should handle shift-pop on two-item map', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.shift()
      dm.pop()
      expect(dm.isEmpty).toBe(true)
    })
  })

  describe('large maps', () => {
    it('should handle 10000+ items', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i * 2)
      }
      expect(m.size).toBe(10000)
      expect(m.get(0)).toBe(0)
      expect(m.get(9999)).toBe(19998)
    })

    it('should maintain order with 10000+ items', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      const keys = m.keys()
      expect(keys[0]).toBe(0)
      expect(keys[9999]).toBe(9999)
    })

    it('should handle deletion from large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      m.delete(5000)
      expect(m.size).toBe(9999)
      expect(m.has(5000)).toBe(false)
      expect(m.get(5001)).toBe(5001)
    })

    it('should handle indexOf on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      expect(m.indexOf(0)).toBe(0)
      expect(m.indexOf(5000)).toBe(5000)
      expect(m.indexOf(9999)).toBe(9999)
      expect(m.indexOf(10000)).toBe(-1)
    })

    it('should handle atIndex on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      expect(m.atIndex(0)).toEqual({ key: 0, value: 0 })
      expect(m.atIndex(5000)).toEqual({ key: 5000, value: 5000 })
      expect(m.atIndex(9999)).toEqual({ key: 9999, value: 9999 })
      expect(m.atIndex(10000)).toBeUndefined()
    })

    it('should handle clone of large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 5000; i++) {
        m.set(i, i)
      }
      const cloned = m.clone()
      expect(cloned.size).toBe(5000)
      expect(cloned.get(4999)).toBe(4999)
    })

    it('should handle moveToFront on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        m.set(i, i)
      }
      m.moveToFront(999)
      expect(m.first).toEqual({ key: 999, value: 999 })
      expect(m.keys()[1]).toBe(0)
    })

    it('should handle moveToBack on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        m.set(i, i)
      }
      m.moveToBack(0)
      expect(m.last).toEqual({ key: 0, value: 0 })
      expect(m.keys()[0]).toBe(1)
    })

    it('should handle clear on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      m.clear()
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })

    it('should handle shift on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      expect(m.shift()).toEqual({ key: 0, value: 0 })
      expect(m.size).toBe(9999)
      expect(m.first).toEqual({ key: 1, value: 1 })
    })

    it('should handle pop on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      expect(m.pop()).toEqual({ key: 9999, value: 9999 })
      expect(m.size).toBe(9999)
      expect(m.last).toEqual({ key: 9998, value: 9998 })
    })

    it('should handle re-set on large map', () => {
      const m = new DequeMap<number, number>()
      for (let i = 0; i < 5000; i++) {
        m.set(i, i)
      }
      m.set(0, 100)
      expect(m.last).toEqual({ key: 0, value: 100 })
      expect(m.indexOf(0)).toBe(4999)
    })
  })

  describe('order verification', () => {
    it('should maintain insertion order', () => {
      dm.set('c', 3)
      dm.set('a', 1)
      dm.set('b', 2)
      expect(dm.keys()).toEqual(['c', 'a', 'b'])
    })

    it('should maintain insertion order for values', () => {
      dm.set('a', 10)
      dm.set('b', 20)
      dm.set('c', 30)
      expect(dm.values()).toEqual([10, 20, 30])
    })

    it('should maintain insertion order for entries', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      expect(dm.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should reorder on re-set', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('a', 10)
      expect(dm.keys()).toEqual(['b', 'c', 'a'])
    })

    it('should preserve order after delete and reinsert', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.delete('b')
      dm.set('b', 20)
      expect(dm.keys()).toEqual(['a', 'c', 'b'])
    })

    it('should reflect updated values in iteration', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('a', 10)
      expect(dm.values()).toEqual([2, 10])
    })

    it('should handle multiple re-sets', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.set('a', 10)
      dm.set('c', 30)
      expect(dm.keys()).toEqual(['b', 'a', 'c'])
    })

    it('should handle moveToFront then moveToBack', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      dm.moveToFront('c')
      dm.moveToBack('c')
      expect(dm.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty map', () => {
      const s = dm.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('should return correct stats for populated map', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.set('c', 3)
      const s = dm.stats()
      expect(s.size).toBe(3)
      expect(s.isEmpty).toBe(false)
    })

    it('should reflect stats after delete', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.delete('a')
      const s = dm.stats()
      expect(s.size).toBe(1)
    })

    it('should reflect stats after clear', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.clear()
      const s = dm.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('should reflect stats after shift', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.shift()
      const s = dm.stats()
      expect(s.size).toBe(1)
    })

    it('should reflect stats after pop', () => {
      dm.set('a', 1)
      dm.set('b', 2)
      dm.pop()
      const s = dm.stats()
      expect(s.size).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_DEQUEMAP_OPTIONS', () => {
      expect(DEFAULT_DEQUEMAP_OPTIONS).toEqual({})
    })

    it('should create DequeMapEntry type correctly', () => {
      const entry: DequeMapEntry<string, number> = {
        key: 'test',
        value: 42,
        prev: null,
        next: null,
      }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe(42)
    })

    it('should support DequeMapEntry with complex types', () => {
      const entry: DequeMapEntry<number, string> = {
        key: 1,
        value: 'one',
        prev: null,
        next: null,
      }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })

    it('should support linked entries', () => {
      const first: DequeMapEntry<string, number> = {
        key: 'a',
        value: 1,
        prev: null,
        next: null,
      }
      const second: DequeMapEntry<string, number> = {
        key: 'b',
        value: 2,
        prev: first,
        next: null,
      }
      first.next = second
      expect(first.next?.key).toBe('b')
      expect(second.prev?.key).toBe('a')
    })

    it('should create DequeMapStats type correctly', () => {
      const s: DequeMapStats = {
        size: 5,
        isEmpty: false,
      }
      expect(s.size).toBe(5)
      expect(s.isEmpty).toBe(false)
    })
  })

  describe('generic type support', () => {
    it('should work with number keys', () => {
      const m = new DequeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should work with object values', () => {
      const m = new DequeMap<string, { id: number }>()
      m.set('a', { id: 1 })
      expect(m.get('a')?.id).toBe(1)
    })

    it('should work with boolean values', () => {
      const m = new DequeMap<string, boolean>()
      m.set('a', true)
      m.set('b', false)
      expect(m.get('a')).toBe(true)
      expect(m.get('b')).toBe(false)
    })

    it('should work with array values', () => {
      const m = new DequeMap<string, number[]>()
      m.set('a', [1, 2, 3])
      expect(m.get('a')).toEqual([1, 2, 3])
    })
  })
})
