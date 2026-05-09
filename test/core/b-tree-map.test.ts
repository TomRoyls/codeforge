import { describe, it, expect, beforeEach } from 'vitest'
import { BTreeMap } from '../../src/core/b-tree-map/b-tree-map.js'
import { DEFAULT_BTREEMAP_ORDER } from '../../src/core/b-tree-map/types.js'
import type { BTreeMapNode } from '../../src/core/b-tree-map/types.js'

describe('BTreeMap', () => {
  let map: BTreeMap<number, string>

  beforeEach(() => {
    map = new BTreeMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty map with default options', () => {
      const m = new BTreeMap<number, string>()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom order', () => {
      const m = new BTreeMap<number, string>(5)
      m.set(1, 'a')
      expect(m.size()).toBe(1)
    })

    it('should use default order of 3', () => {
      expect(DEFAULT_BTREEMAP_ORDER).toBe(3)
    })

    it('should throw for order less than 2', () => {
      expect(() => new BTreeMap<number, string>(1)).toThrow()
    })

    it('should accept order of 2', () => {
      const m = new BTreeMap<number, string>(2)
      m.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })

    it('should accept a custom compare function', () => {
      const reverseCompare = (a: number, b: number) => b - a
      const m = new BTreeMap<number, string>(3, reverseCompare)
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.entries().map(([k]) => k)).toEqual([3, 2, 1])
    })

    it('should accept undefined order with custom compare', () => {
      const m = new BTreeMap<number, string>(undefined, (a, b) => a - b)
      m.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })
  })

  describe('set', () => {
    it('should insert a single key-value pair', () => {
      map.set(10, 'ten')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('ten')
    })

    it('should insert multiple keys in order', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.size()).toBe(3)
    })

    it('should insert multiple keys in reverse order', () => {
      map.set(30, 'thirty')
      map.set(20, 'twenty')
      map.set(10, 'ten')
      expect(map.size()).toBe(3)
    })

    it('should update value for duplicate key', () => {
      map.set(10, 'ten')
      map.set(10, 'TEN')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('TEN')
    })

    it('should handle negative keys', () => {
      map.set(-5, 'neg5')
      map.set(-10, 'neg10')
      map.set(5, 'pos5')
      expect(map.size()).toBe(3)
      expect(map.get(-5)).toBe('neg5')
    })

    it('should handle zero key', () => {
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('should return void', () => {
      const result = map.set(1, 'one')
      expect(result).toBeUndefined()
    })

    it('should cause node splits when order exceeded', () => {
      const m = new BTreeMap<number, number>(2)
      for (let i = 0; i < 10; i++) {
        m.set(i, i * 10)
      }
      expect(m.size()).toBe(10)
    })

    it('should maintain sorted order after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        map.set(i, `val${i}`)
      }
      const entries = map.entries()
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]![0]).toBeLessThan(entries[i + 1]![0])
      }
    })

    it('should handle large number of insertions', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size()).toBe(100)
    })

    it('should handle inserting same key multiple times', () => {
      map.set(5, 'a')
      map.set(5, 'b')
      map.set(5, 'c')
      expect(map.size()).toBe(1)
      expect(map.get(5)).toBe('c')
    })
  })

  describe('get', () => {
    it('should find an existing key', () => {
      map.set(10, 'ten')
      expect(map.get(10)).toBe('ten')
    })

    it('should return undefined for non-existent key', () => {
      expect(map.get(999)).toBeUndefined()
    })

    it('should return undefined when getting from empty map', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('should find keys after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.get(25)).toBe('v25')
      expect(map.get(49)).toBe('v49')
      expect(map.get(0)).toBe('v0')
    })

    it('should find updated value after duplicate set', () => {
      map.set(5, 'old')
      map.set(5, 'new')
      expect(map.get(5)).toBe('new')
    })

    it('should find keys in map with higher order', () => {
      const m = new BTreeMap<number, string>(5)
      for (let i = 0; i < 50; i++) {
        m.set(i, `v${i}`)
      }
      expect(m.get(25)).toBe('v25')
      expect(m.get(0)).toBe('v0')
      expect(m.get(49)).toBe('v49')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      map.set(10, 'ten')
      expect(map.has(10)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(map.has(999)).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(map.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      map.set(10, 'ten')
      map.delete(10)
      expect(map.has(10)).toBe(false)
    })

    it('should return true for negative keys', () => {
      map.set(-5, 'neg5')
      expect(map.has(-5)).toBe(true)
    })

    it('should return false for key never inserted', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.has(2)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      map.set(10, 'ten')
      expect(map.delete(10)).toBe(true)
      expect(map.size()).toBe(0)
      expect(map.get(10)).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      expect(map.delete(999)).toBe(false)
    })

    it('should return false when deleting from empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('should delete from leaf node', () => {
      map.set(10, 'ten')
      map.set(5, 'five')
      expect(map.delete(5)).toBe(true)
      expect(map.size()).toBe(1)
    })

    it('should delete root when it is the only node', () => {
      map.set(10, 'ten')
      expect(map.delete(10)).toBe(true)
      expect(map.isEmpty()).toBe(true)
    })

    it('should maintain correct size after multiple deletions', () => {
      for (let i = 0; i < 10; i++) {
        map.set(i, `v${i}`)
      }
      map.delete(5)
      map.delete(3)
      map.delete(7)
      expect(map.size()).toBe(7)
    })

    it('should handle deleting and re-inserting', () => {
      map.set(10, 'ten')
      map.delete(10)
      map.set(10, 'new-ten')
      expect(map.get(10)).toBe('new-ten')
      expect(map.size()).toBe(1)
    })

    it('should handle deleting from internal node', () => {
      const m = new BTreeMap<number, string>(2)
      for (let i = 0; i < 10; i++) {
        m.set(i, `v${i}`)
      }
      expect(m.delete(5)).toBe(true)
      expect(m.get(5)).toBeUndefined()
      expect(m.size()).toBe(9)
    })

    it('should maintain sorted order after deletions', () => {
      for (let i = 0; i < 20; i++) {
        map.set(i, `v${i}`)
      }
      map.delete(5)
      map.delete(10)
      map.delete(15)
      const entries = map.entries()
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]![0]).toBeLessThan(entries[i + 1]![0])
      }
    })

    it('should handle many sequential deletions', () => {
      for (let i = 0; i < 50; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 50; i++) map.delete(i)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle deleting all keys in reverse order', () => {
      for (let i = 0; i < 20; i++) map.set(i, `v${i}`)
      for (let i = 19; i >= 0; i--) map.delete(i)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle borrowing from prev sibling during deletion', () => {
      const m = new BTreeMap<number, string>(3)
      for (let i = 0; i < 20; i++) {
        m.set(i, `v${i}`)
      }
      m.delete(0)
      expect(m.size()).toBe(19)
      expect(m.get(1)).toBe('v1')
    })

    it('should handle borrowing from next sibling during deletion', () => {
      const m = new BTreeMap<number, string>(3)
      for (let i = 0; i < 20; i++) {
        m.set(i, `v${i}`)
      }
      m.delete(19)
      expect(m.size()).toBe(19)
      expect(m.get(18)).toBe('v18')
    })
  })

  describe('min', () => {
    it('should return undefined for empty map', () => {
      expect(map.min()).toBeUndefined()
    })

    it('should return entry of single node', () => {
      map.set(10, 'ten')
      expect(map.min()).toEqual([10, 'ten'])
    })

    it('should return minimum entry after many insertions', () => {
      map.set(50, 'fifty')
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.min()).toEqual([10, 'ten'])
    })

    it('should update min after deletion', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(5, 'five')
      map.delete(5)
      expect(map.min()).toEqual([10, 'ten'])
    })

    it('should handle negative keys', () => {
      map.set(5, 'five')
      map.set(-10, 'negten')
      expect(map.min()).toEqual([-10, 'negten'])
    })
  })

  describe('max', () => {
    it('should return undefined for empty map', () => {
      expect(map.max()).toBeUndefined()
    })

    it('should return entry of single node', () => {
      map.set(10, 'ten')
      expect(map.max()).toEqual([10, 'ten'])
    })

    it('should return maximum entry after many insertions', () => {
      map.set(10, 'ten')
      map.set(50, 'fifty')
      map.set(30, 'thirty')
      expect(map.max()).toEqual([50, 'fifty'])
    })

    it('should update max after deletion', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(5, 'five')
      map.delete(20)
      expect(map.max()).toEqual([10, 'ten'])
    })

    it('should handle negative keys', () => {
      map.set(-5, 'negfive')
      map.set(-10, 'negten')
      expect(map.max()).toEqual([-5, 'negfive'])
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      map.set(10, 'ten')
      expect(map.size()).toBe(1)
      map.set(20, 'twenty')
      expect(map.size()).toBe(2)
    })

    it('should not increase on duplicate set', () => {
      map.set(10, 'ten')
      map.set(10, 'TEN')
      expect(map.size()).toBe(1)
    })

    it('should decrease after deletion', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.delete(10)
      expect(map.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      map.set(1, 'one')
      expect(map.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      map.set(1, 'one')
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })

    it('should return true after deleting all nodes', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle clearing empty map', () => {
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('should allow insertions after clear', () => {
      map.set(10, 'ten')
      map.clear()
      map.set(20, 'twenty')
      expect(map.size()).toBe(1)
      expect(map.get(20)).toBe('twenty')
    })

    it('should return void', () => {
      expect(map.clear()).toBeUndefined()
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return single key', () => {
      map.set(10, 'ten')
      expect(map.keys()).toEqual([10])
    })

    it('should return sorted keys', () => {
      map.set(30, 'thirty')
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.keys()).toEqual([10, 20, 30])
    })

    it('should return keys after deletions', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      map.delete(20)
      expect(map.keys()).toEqual([10, 30])
    })

    it('should handle many keys', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) map.set(k, `v${k}`)
      expect(map.keys()).toEqual([1, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return single value', () => {
      map.set(10, 'ten')
      expect(map.values()).toEqual(['ten'])
    })

    it('should return values in key order', () => {
      map.set(30, 'thirty')
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.values()).toEqual(['ten', 'twenty', 'thirty'])
    })

    it('should return values after deletions', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      map.delete(10)
      expect(map.values()).toEqual(['twenty', 'thirty'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return single entry', () => {
      map.set(10, 'ten')
      expect(map.entries()).toEqual([[10, 'ten']])
    })

    it('should return sorted entries', () => {
      map.set(30, 'thirty')
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.entries()).toEqual([[10, 'ten'], [20, 'twenty'], [30, 'thirty']])
    })

    it('should return entries after deletions', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      map.delete(20)
      expect(map.entries()).toEqual([[10, 'ten'], [30, 'thirty']])
    })

    it('should handle many entries', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) map.set(k, `v${k}`)
      const result = map.entries()
      expect(result.map(([k]) => k)).toEqual([1, 3, 4, 5, 6, 7, 8])
      expect(result.map(([, v]) => v)).toEqual(['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'])
    })
  })

  describe('rangeSearch', () => {
    it('should return empty array for empty map', () => {
      expect(map.rangeSearch(0, 10)).toEqual([])
    })

    it('should return matching entries', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.rangeSearch(15, 25)).toEqual([[20, 'twenty']])
    })

    it('should return all entries in range', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.rangeSearch(10, 30)).toEqual([[10, 'ten'], [20, 'twenty'], [30, 'thirty']])
    })

    it('should return empty when no keys in range', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.rangeSearch(30, 40)).toEqual([])
    })

    it('should handle single key range', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.rangeSearch(20, 20)).toEqual([[20, 'twenty']])
    })

    it('should handle inverted range', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.rangeSearch(30, 5)).toEqual([])
    })

    it('should return boundary elements', () => {
      for (let i = 0; i <= 10; i++) map.set(i, `v${i}`)
      const result = map.rangeSearch(3, 7)
      expect(result.map(([k]) => k)).toEqual([3, 4, 5, 6, 7])
    })

    it('should work with custom compare function', () => {
      const m = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      m.set('apple', 1)
      m.set('banana', 2)
      m.set('cherry', 3)
      m.set('date', 4)
      const result = m.rangeSearch('banana', 'cherry')
      expect(result.map(([k]) => k)).toEqual(['banana', 'cherry'])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty map without calling callback', () => {
      const called: [string, number][] = []
      map.forEach((v, k) => called.push([v, k]))
      expect(called).toEqual([])
    })

    it('should iterate over single entry', () => {
      map.set(10, 'ten')
      const collected: [string, number][] = []
      map.forEach((v, k) => collected.push([v, k]))
      expect(collected).toEqual([['ten', 10]])
    })

    it('should iterate in sorted order', () => {
      map.set(30, 'thirty')
      map.set(10, 'ten')
      map.set(20, 'twenty')
      const keys: number[] = []
      map.forEach((_v, k) => keys.push(k))
      expect(keys).toEqual([10, 20, 30])
    })

    it('should iterate over many entries', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(10)
    })

    it('should provide correct key-value pairs', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const pairs: [number, string][] = []
      map.forEach((v, k) => pairs.push([k, v]))
      expect(pairs).toEqual([[1, 'a'], [2, 'b']])
    })
  })

  describe('clone', () => {
    it('should clone an empty map', () => {
      const cloned = map.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a non-empty map', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      const cloned = map.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get(10)).toBe('ten')
      expect(cloned.get(20)).toBe('twenty')
    })

    it('should create an independent copy', () => {
      map.set(10, 'ten')
      const cloned = map.clone()
      cloned.set(10, 'TEN')
      expect(map.get(10)).toBe('ten')
      expect(cloned.get(10)).toBe('TEN')
    })

    it('should not affect original when deleting from clone', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      const cloned = map.clone()
      cloned.delete(10)
      expect(map.get(10)).toBe('ten')
      expect(map.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should preserve order in clone', () => {
      for (let i = 0; i < 20; i++) map.set(i, `v${i}`)
      const cloned = map.clone()
      expect(cloned.entries()).toEqual(map.entries())
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('should return entries as array', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.toArray()).toEqual([[10, 'ten'], [20, 'twenty']])
    })

    it('should return same result as entries', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      expect(map.toArray()).toEqual(map.entries())
    })
  })

  describe('fromEntries', () => {
    it('should create map from empty entries', () => {
      const m = BTreeMap.fromEntries<number, string>([])
      expect(m.size()).toBe(0)
    })

    it('should create map from entries', () => {
      const m = BTreeMap.fromEntries([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(m.size()).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.get(2)).toBe('b')
      expect(m.get(3)).toBe('c')
    })

    it('should create map with custom order', () => {
      const m = BTreeMap.fromEntries([[1, 'a'], [2, 'b']], 5)
      expect(m.size()).toBe(2)
    })

    it('should create map with custom compare', () => {
      const m = BTreeMap.fromEntries(
        [['banana', 2], ['apple', 1], ['cherry', 3]],
        3,
        (a, b) => a.localeCompare(b)
      )
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle duplicate entries by keeping last', () => {
      const m = BTreeMap.fromEntries([[1, 'a'], [1, 'b']])
      expect(m.size()).toBe(1)
      expect(m.get(1)).toBe('b')
    })

    it('should handle out-of-order entries', () => {
      const m = BTreeMap.fromEntries([[5, 'e'], [1, 'a'], [3, 'c'], [2, 'b'], [4, 'd']])
      expect(m.keys()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('update', () => {
    it('should insert new value when key does not exist', () => {
      map.update(10, (v) => v ?? 'default')
      expect(map.get(10)).toBe('default')
      expect(map.size()).toBe(1)
    })

    it('should update existing value', () => {
      map.set(10, 'ten')
      map.update(10, (v) => v!.toUpperCase())
      expect(map.get(10)).toBe('TEN')
    })

    it('should pass undefined to updater for new key', () => {
      let received: string | undefined = 'NOT_UNDEFINED'
      map.update(10, (v) => {
        received = v
        return 'new'
      })
      expect(received).toBeUndefined()
    })

    it('should pass current value to updater for existing key', () => {
      map.set(10, 'ten')
      let received: string | undefined
      map.update(10, (v) => {
        received = v
        return v!.toUpperCase()
      })
      expect(received).toBe('ten')
    })

    it('should increment counter using update', () => {
      const counter = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      counter.update('a', (v) => (v ?? 0) + 1)
      counter.update('a', (v) => (v ?? 0) + 1)
      counter.update('a', (v) => (v ?? 0) + 1)
      expect(counter.get('a')).toBe(3)
    })

    it('should handle update returning same value', () => {
      map.set(10, 'ten')
      map.update(10, (v) => v!)
      expect(map.get(10)).toBe('ten')
      expect(map.size()).toBe(1)
    })

    it('should return void', () => {
      const result = map.update(10, (v) => v ?? 'new')
      expect(result).toBeUndefined()
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty map', () => {
      const result = [...map]
      expect(result).toEqual([])
    })

    it('should iterate over single entry', () => {
      map.set(10, 'ten')
      const result = [...map]
      expect(result).toEqual([[10, 'ten']])
    })

    it('should iterate in sorted order', () => {
      map.set(30, 'thirty')
      map.set(10, 'ten')
      map.set(20, 'twenty')
      const result = [...map]
      expect(result).toEqual([[10, 'ten'], [20, 'twenty'], [30, 'thirty']])
    })

    it('should work with for...of', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const keys: number[] = []
      for (const [key, _value] of map) {
        keys.push(key)
      }
      expect(keys).toEqual([1, 2, 3])
    })

    it('should work with destructuring', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const entries = [...map]
      expect(entries.length).toBe(2)
      expect(entries[0]).toEqual([1, 'a'])
      expect(entries[1]).toEqual([2, 'b'])
    })
  })

  describe('node splitting and merging', () => {
    it('should split root when full', () => {
      const m = new BTreeMap<number, string>(2)
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.size()).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.get(2)).toBe('b')
      expect(m.get(3)).toBe('c')
    })

    it('should handle multiple splits', () => {
      const m = new BTreeMap<number, string>(2)
      for (let i = 1; i <= 7; i++) {
        m.set(i, `v${i}`)
      }
      expect(m.size()).toBe(7)
      expect(m.entries().map(([k]) => k)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle merges during deletion', () => {
      const m = new BTreeMap<number, string>(2)
      for (let i = 0; i < 10; i++) {
        m.set(i, `v${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(m.delete(i)).toBe(true)
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('should maintain invariants after many operations', () => {
      const m = new BTreeMap<number, string>(2)
      for (let i = 0; i < 50; i++) {
        m.set(i, `v${i}`)
      }
      for (let i = 10; i < 40; i++) {
        m.delete(i)
      }
      const result = m.entries()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]![0]).toBeLessThan(result[i + 1]![0])
      }
      expect(m.size()).toBe(20)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const m = new BTreeMap<number, string>()
      m.set(1, 'hello')
      m.set(2, 'world')
      expect(m.get(1)).toBe('hello')
      expect(m.get(2)).toBe('world')
    })

    it('should update string values', () => {
      const m = new BTreeMap<number, string>()
      m.set(1, 'old')
      m.set(1, 'new')
      expect(m.get(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const m = new BTreeMap<number, { name: string }>()
      m.set(1, { name: 'a' })
      m.set(2, { name: 'b' })
      expect(m.get(1)!.name).toBe('a')
      expect(m.get(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const m = new BTreeMap<number, null>()
      m.set(1, null)
      expect(m.get(1)).toBeNull()
      expect(m.has(1)).toBe(true)
    })

    it('should store undefined values', () => {
      const m = new BTreeMap<number, string | undefined>()
      m.set(1, undefined)
      expect(m.get(1)).toBeUndefined()
      expect(m.has(1)).toBe(true)
      expect(m.size()).toBe(1)
    })
  })

  describe('string keys with custom compare', () => {
    it('should work with string keys', () => {
      const m = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.get('apple')).toBe(1)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle range search with string keys', () => {
      const m = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      m.set('d', 4)
      m.set('e', 5)
      expect(m.rangeSearch('b', 'd').map(([k]) => k)).toEqual(['b', 'c', 'd'])
    })

    it('should delete string keys', () => {
      const m = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      m.set('a', 1)
      m.set('b', 2)
      expect(m.delete('a')).toBe(true)
      expect(m.has('a')).toBe(false)
      expect(m.size()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle large keys', () => {
      map.set(Number.MAX_SAFE_INTEGER, 'max')
      map.set(Number.MIN_SAFE_INTEGER, 'min')
      expect(map.get(Number.MAX_SAFE_INTEGER)).toBe('max')
      expect(map.get(Number.MIN_SAFE_INTEGER)).toBe('min')
    })

    it('should handle floating point keys', () => {
      map.set(1.5, 'one-point-five')
      map.set(2.5, 'two-point-five')
      expect(map.get(1.5)).toBe('one-point-five')
    })

    it('should handle alternating insertions and deletions', () => {
      for (let i = 0; i < 20; i++) {
        map.set(i, `v${i}`)
        if (i > 5) map.delete(i - 5)
      }
      const entries = map.entries()
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]![0]).toBeLessThan(entries[i + 1]![0])
      }
    })
  })

  describe('large map', () => {
    it('should handle 1000 insertions', () => {
      for (let i = 0; i < 1000; i++) map.set(i, `v${i}`)
      expect(map.size()).toBe(1000)
    })

    it('should handle 1000 mixed operations', () => {
      for (let i = 0; i < 500; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 250; i++) map.delete(i)
      expect(map.size()).toBe(250)
    })

    it('should find all elements in large map', () => {
      for (let i = 0; i < 500; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 500; i++) {
        expect(map.get(i)).toBe(`v${i}`)
      }
    })
  })

  describe('different orders', () => {
    it('should work with order 2', () => {
      const m = new BTreeMap<number, string>(2)
      for (let i = 0; i < 50; i++) m.set(i, `v${i}`)
      expect(m.size()).toBe(50)
      expect(m.get(25)).toBe('v25')
    })

    it('should work with order 4', () => {
      const m = new BTreeMap<number, string>(4)
      for (let i = 0; i < 50; i++) m.set(i, `v${i}`)
      expect(m.size()).toBe(50)
      expect(m.entries().map(([k]) => k)).toEqual(
        Array.from({ length: 50 }, (_, i) => i)
      )
    })

    it('should work with order 10', () => {
      const m = new BTreeMap<number, string>(10)
      for (let i = 0; i < 100; i++) m.set(i, `v${i}`)
      expect(m.size()).toBe(100)
    })

    it('should work with order 50', () => {
      const m = new BTreeMap<number, string>(50)
      for (let i = 0; i < 200; i++) m.set(i, `v${i}`)
      expect(m.size()).toBe(200)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BTREEMAP_ORDER', () => {
      expect(DEFAULT_BTREEMAP_ORDER).toBe(3)
    })

    it('should support BTreeMapNode interface', () => {
      const node: BTreeMapNode<number, string> = {
        keys: [1, 2],
        values: ['a', 'b'],
        children: [],
        isLeaf: true,
      }
      expect(node.keys.length).toBe(2)
      expect(node.values[0]).toBe('a')
    })
  })
})
