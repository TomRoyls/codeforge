import { describe, it, expect } from 'vitest'
import { TreapMap2 } from '../../src/core/treap-map-2/index.js'
import type { TreapMap2Options } from '../../src/core/treap-map-2/index.js'

describe('TreapMap2', () => {
  describe('constructor', () => {
    it('creates empty map with default options', () => {
      const map = new TreapMap2<number, string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map with custom comparator', () => {
      const map = new TreapMap2<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      map.set('Hello', 1)
      expect(map.has('hello')).toBe(true)
      expect(map.get('HELLO')).toBe(1)
    })

    it('accepts options object with undefined comparator', () => {
      const map = new TreapMap2<number, string>({})
      map.set(1, 'a')
      expect(map.has(1)).toBe(true)
    })

    it('accepts no options at all', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      expect(map.size).toBe(1)
    })
  })

  describe('set and insert', () => {
    it('sets a single key-value pair', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
    })

    it('insert is alias for set', () => {
      const map = new TreapMap2<number, string>()
      map.insert(1, 'one')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
    })

    it('overwrites existing key with set', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('uno')
    })

    it('overwrites existing key with insert', () => {
      const map = new TreapMap2<number, string>()
      map.insert(1, 'one')
      map.insert(1, 'uno')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('uno')
    })

    it('sets multiple key-value pairs', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.size).toBe(3)
    })

    it('handles setting many elements', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(100)
    })

    it('handles reverse insertion order', () => {
      const map = new TreapMap2<number, string>()
      for (let i = 100; i >= 0; i--) {
        map.set(i, `val${i}`)
      }
      expect(map.size).toBe(101)
      expect(map.get(0)).toBe('val0')
      expect(map.get(100)).toBe('val100')
    })

    it('handles string keys', () => {
      const map = new TreapMap2<string, number>()
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect(map.size).toBe(3)
      expect(map.get('apple')).toBe(1)
    })

    it('handles negative keys', () => {
      const map = new TreapMap2<number, string>()
      map.set(-5, 'neg5')
      map.set(0, 'zero')
      map.set(5, 'pos5')
      expect(map.size).toBe(3)
      expect(map.get(-5)).toBe('neg5')
    })
  })

  describe('get', () => {
    it('returns undefined for missing key', () => {
      const map = new TreapMap2<number, string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns updated value after set', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.get(1)).toBe('updated')
    })

    it('returns undefined after delete', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.get(1)).toBeUndefined()
    })

    it('works with many entries', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 0; i < 50; i++) {
        map.set(i, i * 100)
      }
      for (let i = 0; i < 50; i++) {
        expect(map.get(i)).toBe(i * 100)
      }
    })
  })

  describe('has', () => {
    it('returns false for missing key', () => {
      const map = new TreapMap2<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false after delete', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('returns false for key never added', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new TreapMap2<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('deletes from multi-element map', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.delete(2)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.has(2)).toBe(false)
    })

    it('deletes root element', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.delete(5)).toBe(true)
      expect(map.size).toBe(2)
    })

    it('deletes all elements one by one', () => {
      const map = new TreapMap2<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, `val${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('handles double delete gracefully', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.delete(1)).toBe(false)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.size).toBe(0)
    })

    it('isEmpty is true for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.isEmpty).toBe(true)
    })

    it('isEmpty is false after set', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.isEmpty).toBe(false)
    })

    it('size tracks insertions correctly', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
      map.set(3, 'c')
      expect(map.size).toBe(3)
    })

    it('size does not increase on overwrite', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('size decreases on delete', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('isEmpty is true after clear', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.clear()
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty map', () => {
      const map = new TreapMap2<number, string>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('clears map with elements', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has(1)).toBe(false)
      expect(map.has(2)).toBe(false)
    })

    it('allows operations after clear', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  describe('clone', () => {
    it('clones empty map', () => {
      const map = new TreapMap2<number, string>()
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
    })

    it('clones map with elements', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.get(1)).toBe('a')
      expect(cloned.get(2)).toBe('b')
    })

    it('clone is independent', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(1, 'modified')
      expect(map.get(1)).toBe('a')
      expect(cloned.get(1)).toBe('modified')
    })

    it('clone preserves comparator', () => {
      const map = new TreapMap2<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      map.set('A', 1)
      const cloned = map.clone()
      expect(cloned.get('a')).toBe(1)
    })
  })

  describe('min and max', () => {
    it('min returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.min()).toBeUndefined()
    })

    it('max returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.max()).toBeUndefined()
    })

    it('min returns smallest entry', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.min()).toEqual([3, 'three'])
    })

    it('max returns largest entry', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.max()).toEqual([7, 'seven'])
    })

    it('min and max same for single element', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.min()).toEqual([1, 'one'])
      expect(map.max()).toEqual([1, 'one'])
    })

    it('min and max update after delete', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      map.delete(1)
      expect(map.min()).toEqual([5, 'five'])
      map.delete(10)
      expect(map.max()).toEqual([5, 'five'])
    })
  })

  describe('first and last', () => {
    it('first returns same as min', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      expect(map.first()).toEqual(map.min())
    })

    it('last returns same as max', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      expect(map.last()).toEqual(map.max())
    })

    it('first returns undefined for empty', () => {
      const map = new TreapMap2<number, string>()
      expect(map.first()).toBeUndefined()
    })

    it('last returns undefined for empty', () => {
      const map = new TreapMap2<number, string>()
      expect(map.last()).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('iterates over empty map', () => {
      const map = new TreapMap2<number, string>()
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates over all entries in order', () => {
      const map = new TreapMap2<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      const result: string[] = []
      map.forEach((v, k) => { result.push(`${k}:${v}`) })
      expect(result).toEqual(['1:one', '2:two', '3:three'])
    })

    it('provides key and value to callback', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      let receivedKey: number | undefined
      let receivedValue: string | undefined
      map.forEach((v, k) => {
        receivedKey = k
        receivedValue = v
      })
      expect(receivedKey).toBe(1)
      expect(receivedValue).toBe('one')
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty map', () => {
      const map = new TreapMap2<number, string>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('iterates in-order', () => {
      const map = new TreapMap2<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map]).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
    })

    it('works with for...of', () => {
      const map = new TreapMap2<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      const keys: number[] = []
      for (const [k] of map) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2])
    })
  })

  describe('keys, values, entries', () => {
    it('keys returns empty array for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.keys()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.values()).toEqual([])
    })

    it('entries returns empty array for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.entries()).toEqual([])
    })

    it('keys returns sorted keys', () => {
      const map = new TreapMap2<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      const map = new TreapMap2<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries returns sorted entries', () => {
      const map = new TreapMap2<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })
  })

  describe('toArray and toArraySorted', () => {
    it('toArray returns entries', () => {
      const map = new TreapMap2<number, string>()
      map.set(2, 'b')
      map.set(1, 'a')
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b']])
    })

    it('toArraySorted returns same as toArray', () => {
      const map = new TreapMap2<number, string>()
      map.set(2, 'b')
      map.set(1, 'a')
      expect(map.toArraySorted()).toEqual(map.toArray())
    })

    it('toArray returns empty for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.toArray()).toEqual([])
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.lowerBound(1)).toBeUndefined()
    })

    it('returns first element >= key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(3)).toEqual([3, 'c'])
    })

    it('returns next greater when exact not found', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(2)).toEqual([3, 'c'])
    })

    it('returns undefined when all keys are less', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.lowerBound(10)).toBeUndefined()
    })

    it('returns first element when key is min', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.lowerBound(0)).toEqual([1, 'a'])
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.upperBound(1)).toBeUndefined()
    })

    it('returns first element > key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.upperBound(3)).toEqual([5, 'e'])
    })

    it('returns undefined when all keys are <= key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.upperBound(10)).toBeUndefined()
    })

    it('returns first element > exact match', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.upperBound(1)).toEqual([2, 'b'])
    })

    it('returns next greater when exact not found', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.upperBound(2)).toEqual([5, 'e'])
    })
  })

  describe('predecessor', () => {
    it('returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.predecessor(1)).toBeUndefined()
    })

    it('returns largest entry with key < given key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.predecessor(4)).toEqual([3, 'c'])
    })

    it('returns entry for existing key as predecessor of next', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.predecessor(3)).toEqual([1, 'a'])
    })

    it('returns undefined when no smaller key exists', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      expect(map.predecessor(5)).toBeUndefined()
    })

    it('returns undefined for key less than min', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      expect(map.predecessor(1)).toBeUndefined()
    })
  })

  describe('successor', () => {
    it('returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.successor(1)).toBeUndefined()
    })

    it('returns smallest entry with key > given key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.successor(2)).toEqual([3, 'c'])
    })

    it('returns next entry for existing key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.successor(1)).toEqual([3, 'c'])
    })

    it('returns undefined when no larger key exists', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      expect(map.successor(5)).toBeUndefined()
    })

    it('returns undefined for key greater than max', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      expect(map.successor(10)).toBeUndefined()
    })
  })

  describe('rank', () => {
    it('returns 0 for key not in map and less than min', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      expect(map.rank(1)).toBe(0)
    })

    it('returns correct rank for existing key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rank(1)).toBe(0)
      expect(map.rank(2)).toBe(1)
      expect(map.rank(3)).toBe(2)
    })

    it('returns count of keys less than given key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.rank(4)).toBe(2)
    })

    it('returns 0 for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.rank(1)).toBe(0)
    })

    it('returns size for key greater than max', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.rank(100)).toBe(2)
    })

    it('returns correct rank for sequential keys', () => {
      const map = new TreapMap2<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, `val${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.rank(i)).toBe(i)
      }
    })
  })

  describe('select', () => {
    it('returns undefined for negative index', () => {
      const map = new TreapMap2<number, string>()
      expect(map.select(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      expect(map.select(1)).toBeUndefined()
    })

    it('returns k-th smallest entry', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      map.set(3, 'c')
      map.set(1, 'a')
      expect(map.select(0)).toEqual([1, 'a'])
      expect(map.select(1)).toEqual([3, 'c'])
      expect(map.select(2)).toEqual([5, 'e'])
    })

    it('returns undefined for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.select(0)).toBeUndefined()
    })

    it('returns correct entries for sequential keys', () => {
      const map = new TreapMap2<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, `val${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.select(i)).toEqual([i, `val${i}`])
      }
    })
  })

  describe('split', () => {
    it('splits empty map into two empty maps', () => {
      const map = new TreapMap2<number, string>()
      const [left, right] = map.split(5)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('splits map at given key', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      const [left, right] = map.split(4)
      expect(left.size).toBe(2)
      expect(right.size).toBe(2)
      expect(left.get(1)).toBe('a')
      expect(left.get(3)).toBe('c')
      expect(right.get(5)).toBe('e')
      expect(right.get(7)).toBe('g')
    })

    it('original map is not modified by split', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const [,] = map.split(2)
      expect(map.size).toBe(3)
    })

    it('splits with key less than all elements', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      map.set(10, 'j')
      const [left, right] = map.split(0)
      expect(left.size).toBe(0)
      expect(right.size).toBe(2)
    })

    it('splits with key greater than all elements', () => {
      const map = new TreapMap2<number, string>()
      map.set(5, 'e')
      map.set(10, 'j')
      const [left, right] = map.split(100)
      expect(left.size).toBe(2)
      expect(right.size).toBe(0)
    })

    it('splits at exact key boundary', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const [left, right] = map.split(2)
      expect(left.size).toBe(1)
      expect(right.size).toBe(2)
      expect(left.has(1)).toBe(true)
      expect(right.has(2)).toBe(true)
      expect(right.has(3)).toBe(true)
    })
  })

  describe('merge', () => {
    it('merges two empty maps', () => {
      const a = new TreapMap2<number, string>()
      const b = new TreapMap2<number, string>()
      const merged = a.merge(b)
      expect(merged.size).toBe(0)
    })

    it('merges empty with non-empty', () => {
      const a = new TreapMap2<number, string>()
      const b = new TreapMap2<number, string>()
      b.set(1, 'one')
      const merged = a.merge(b)
      expect(merged.size).toBe(1)
      expect(merged.get(1)).toBe('one')
    })

    it('merges non-empty with empty', () => {
      const a = new TreapMap2<number, string>()
      a.set(1, 'one')
      const b = new TreapMap2<number, string>()
      const merged = a.merge(b)
      expect(merged.size).toBe(1)
    })

    it('merges two non-overlapping maps', () => {
      const a = new TreapMap2<number, string>()
      a.set(1, 'a')
      a.set(2, 'b')
      const b = new TreapMap2<number, string>()
      b.set(3, 'c')
      b.set(4, 'd')
      const merged = a.merge(b)
      expect(merged.size).toBe(4)
      expect(merged.get(1)).toBe('a')
      expect(merged.get(4)).toBe('d')
    })

    it('does not modify original maps', () => {
      const a = new TreapMap2<number, string>()
      a.set(1, 'a')
      const b = new TreapMap2<number, string>()
      b.set(2, 'b')
      a.merge(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })
  })

  describe('rangeQuery', () => {
    it('returns empty for empty map', () => {
      const map = new TreapMap2<number, string>()
      expect(map.rangeQuery(1, 5)).toEqual([])
    })

    it('returns entries in range', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.set(4, 'd')
      map.set(5, 'e')
      expect(map.rangeQuery(2, 4)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
    })

    it('returns empty when lo > hi', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      expect(map.rangeQuery(5, 1)).toEqual([])
    })

    it('returns single entry for exact match', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.rangeQuery(1, 1)).toEqual([[1, 'a']])
    })

    it('returns all entries when range covers all', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rangeQuery(1, 3)).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('returns empty when no keys in range', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.rangeQuery(2, 4)).toEqual([])
    })
  })

  describe('static fromArray', () => {
    it('creates map from entries', () => {
      const map = TreapMap2.fromArray([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
      expect(map.size).toBe(3)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('creates empty map from empty array', () => {
      const map = TreapMap2.fromArray<number, string>([])
      expect(map.size).toBe(0)
    })

    it('handles duplicate keys by using last value', () => {
      const map = TreapMap2.fromArray([
        [1, 'a'],
        [1, 'b'],
      ])
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('b')
    })

    it('accepts options', () => {
      const map = TreapMap2.fromArray(
        [['Banana', 2], ['apple', 1]],
        { comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) },
      )
      expect(map.get('banana')).toBe(2)
    })
  })

  describe('update', () => {
    it('updates existing key and returns true', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.update(1, 'updated')).toBe(true)
      expect(map.get(1)).toBe('updated')
    })

    it('returns false for missing key', () => {
      const map = new TreapMap2<number, string>()
      expect(map.update(1, 'one')).toBe(false)
    })

    it('does not insert new key', () => {
      const map = new TreapMap2<number, string>()
      map.update(1, 'one')
      expect(map.size).toBe(0)
      expect(map.has(1)).toBe(false)
    })

    it('preserves size after update', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.update(1, 'updated')
      expect(map.size).toBe(2)
    })
  })

  describe('in-order traversal verification', () => {
    it('maintains sorted order after many insertions', () => {
      const map = new TreapMap2<number, number>()
      const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35]
      for (const v of values) {
        map.set(v, v)
      }
      const keys = map.keys()
      const sorted = [...values].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('maintains sorted order after deletions', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 0; i < 20; i++) {
        map.set(i, i)
      }
      map.delete(5)
      map.delete(10)
      map.delete(15)
      const keys = map.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('rank and select are inverse operations', () => {
      const map = new TreapMap2<number, string>()
      for (let i = 0; i < 20; i++) {
        map.set(i * 2, `val${i}`)
      }
      for (let i = 0; i < 20; i++) {
        const key = i * 2
        const r = map.rank(key)
        const entry = map.select(r)
        expect(entry).toEqual([key, `val${i}`])
      }
    })
  })

  describe('stress tests', () => {
    it('handles 1000 insertions', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(1000)
      expect(map.get(0)).toBe(0)
      expect(map.get(999)).toBe(9990)
    })

    it('handles 1000 deletions', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 500; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(500)
      expect(map.has(499)).toBe(false)
      expect(map.has(500)).toBe(true)
    })

    it('handles mixed operations', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 0; i < 100; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      for (let i = 100; i < 200; i++) {
        map.set(i, i)
      }
      expect(map.size).toBe(150)
    })

    it('handles reverse sorted insertion', () => {
      const map = new TreapMap2<number, number>()
      for (let i = 1000; i >= 0; i--) {
        map.set(i, i)
      }
      expect(map.size).toBe(1001)
      const keys = map.keys()
      expect(keys[0]).toBe(0)
      expect(keys[1000]).toBe(1000)
    })
  })

  describe('edge cases', () => {
    it('works with object values', () => {
      const map = new TreapMap2<number, { name: string }>()
      map.set(1, { name: 'test' })
      expect(map.get(1)).toEqual({ name: 'test' })
    })

    it('works with null values', () => {
      const map = new TreapMap2<number, string | null>()
      map.set(1, null)
      expect(map.get(1)).toBeNull()
    })

    it('works with undefined values', () => {
      const map = new TreapMap2<number, string | undefined>()
      map.set(1, undefined)
      expect(map.get(1)).toBeUndefined()
      expect(map.has(1)).toBe(true)
    })

    it('works with zero key', () => {
      const map = new TreapMap2<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('works with empty string key', () => {
      const map = new TreapMap2<string, number>()
      map.set('', 0)
      expect(map.get('')).toBe(0)
    })

    it('operations on single-element map', () => {
      const map = new TreapMap2<number, string>()
      map.set(1, 'one')
      expect(map.min()).toEqual([1, 'one'])
      expect(map.max()).toEqual([1, 'one'])
      expect(map.rank(1)).toBe(0)
      expect(map.select(0)).toEqual([1, 'one'])
      expect(map.lowerBound(1)).toEqual([1, 'one'])
      expect(map.upperBound(0)).toEqual([1, 'one'])
      expect(map.predecessor(1)).toBeUndefined()
      expect(map.successor(1)).toBeUndefined()
    })
  })

  describe('type export', () => {
    it('can use TreapMap2Options type', () => {
      const options: TreapMap2Options<number> = {
        comparator: (a, b) => a - b,
      }
      const map = new TreapMap2<number, string>(options)
      map.set(1, 'a')
      expect(map.get(1)).toBe('a')
    })
  })
})
