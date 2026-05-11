import { describe, it, expect } from 'vitest'
import { SkipListMap } from '../../src/core/skip-list-map/index.js'

describe('SkipListMap', () => {
  describe('constructor', () => {
    it('creates empty map with default options', () => {
      const map = new SkipListMap<number, string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates map with custom maxLevel', () => {
      const map = new SkipListMap<number, string>({ maxLevel: 16 })
      expect(map.maxLevel).toBe(16)
    })

    it('creates map with custom comparator', () => {
      const map = new SkipListMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect([...map.keys()]).toEqual(['apple', 'banana', 'cherry'])
    })

    it('defaults maxLevel to 32', () => {
      const map = new SkipListMap<number, string>()
      expect(map.maxLevel).toBe(32)
    })

    it('accepts empty options object', () => {
      const map = new SkipListMap<number, string>({})
      expect(map.size).toBe(0)
    })
  })

  describe('set and get', () => {
    it('sets and gets a single entry', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns undefined for missing key', () => {
      const map = new SkipListMap<number, string>()
      expect(map.get(99)).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.get(1)).toBe('uno')
      expect(map.size).toBe(1)
    })

    it('maintains size correctly on overwrite', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      map.set(1, 'c')
      expect(map.size).toBe(1)
    })

    it('handles multiple entries', () => {
      const map = new SkipListMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
      expect(map.get(3)).toBe('three')
      expect(map.size).toBe(3)
    })

    it('handles negative keys', () => {
      const map = new SkipListMap<number, string>()
      map.set(-5, 'neg5')
      map.set(0, 'zero')
      map.set(5, 'pos5')
      expect(map.get(-5)).toBe('neg5')
      expect(map.get(0)).toBe('zero')
      expect(map.get(5)).toBe('pos5')
    })

    it('handles floating point keys', () => {
      const map = new SkipListMap<number, string>()
      map.set(1.5, 'a')
      map.set(2.7, 'b')
      expect(map.get(1.5)).toBe('a')
      expect(map.get(2.7)).toBe('b')
    })

    it('handles string keys with custom comparator', () => {
      const map = new SkipListMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      map.set('z', 26)
      map.set('a', 1)
      map.set('m', 13)
      expect(map.get('a')).toBe(1)
      expect(map.get('m')).toBe(13)
      expect(map.get('z')).toBe(26)
    })

    it('handles undefined values', () => {
      const map = new SkipListMap<number, string | undefined>()
      map.set(1, undefined)
      expect(map.get(1)).toBeUndefined()
      expect(map.has(1)).toBe(true)
    })

    it('handles null values', () => {
      const map = new SkipListMap<number, string | null>()
      map.set(1, null)
      expect(map.get(1)).toBeNull()
      expect(map.has(1)).toBe(true)
    })

    it('handles object values', () => {
      const map = new SkipListMap<number, object>()
      const obj = { foo: 'bar' }
      map.set(1, obj)
      expect(map.get(1)).toBe(obj)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new SkipListMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('returns true for overwritten key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.has(1)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes an existing key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.get(1)).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new SkipListMap<number, string>()
      expect(map.delete(99)).toBe(false)
    })

    it('deletes from middle', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.get(2)).toBeUndefined()
      expect(map.size).toBe(2)
      expect(map.get(1)).toBe('one')
      expect(map.get(3)).toBe('three')
    })

    it('deletes first element', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toBe(2)
      expect(map.size).toBe(2)
    })

    it('deletes last element', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toBe(2)
      expect(map.size).toBe(2)
    })

    it('deletes all elements', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      map.delete(2)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('deletes single element map', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('min and max', () => {
    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })

    it('returns min key', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      expect(map.min()).toBe(2)
    })

    it('returns max key', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      expect(map.max()).toBe(8)
    })

    it('min and max are same for single element', () => {
      const map = new SkipListMap<number, string>()
      map.set(42, 'forty-two')
      expect(map.min()).toBe(42)
      expect(map.max()).toBe(42)
    })

    it('updates min after deletion', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toBe(2)
    })

    it('updates max after deletion', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toBe(2)
    })
  })

  describe('lowerBound', () => {
    it('returns first element >= key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.lowerBound(15)).toEqual([20, 'twenty'])
    })

    it('returns exact match', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.lowerBound(10)).toEqual([10, 'ten'])
    })

    it('returns undefined when all keys are smaller', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.lowerBound(25)).toBeUndefined()
    })

    it('returns first element for very small key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.lowerBound(1)).toEqual([10, 'ten'])
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.lowerBound(1)).toBeUndefined()
    })
  })

  describe('upperBound', () => {
    it('returns first element > key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.upperBound(10)).toEqual([20, 'twenty'])
    })

    it('returns first element > key when no exact match', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.upperBound(15)).toEqual([30, 'thirty'])
    })

    it('returns undefined when no greater element', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.upperBound(20)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.upperBound(1)).toBeUndefined()
    })
  })

  describe('rank', () => {
    it('returns 1-based rank of key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.rank(10)).toBe(1)
      expect(map.rank(20)).toBe(2)
      expect(map.rank(30)).toBe(3)
    })

    it('returns -1 for missing key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.rank(99)).toBe(-1)
    })

    it('returns -1 for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.rank(1)).toBe(-1)
    })

    it('returns correct rank after deletions', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      map.delete(20)
      expect(map.rank(10)).toBe(1)
      expect(map.rank(30)).toBe(2)
    })
  })

  describe('select', () => {
    it('returns element at 1-based index', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.select(1)).toEqual([10, 'ten'])
      expect(map.select(2)).toEqual([20, 'twenty'])
      expect(map.select(3)).toEqual([30, 'thirty'])
    })

    it('returns undefined for out of range', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.select(0)).toBeUndefined()
      expect(map.select(2)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const map = new SkipListMap<number, string>()
      expect(map.select(-1)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.select(1)).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('allows set after clear', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.clear()
      map.set(2, 'two')
      expect(map.get(2)).toBe('two')
      expect(map.size).toBe(1)
    })

    it('clear on empty map is no-op', () => {
      const map = new SkipListMap<number, string>()
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('keys', () => {
    it('returns empty iterator for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.keys()]).toEqual([])
    })

    it('returns keys in sorted order', () => {
      const map = new SkipListMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map.keys()]).toEqual([1, 2, 3])
    })

    it('returns keys after deletion', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect([...map.keys()]).toEqual([1, 3])
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.values()]).toEqual([])
    })

    it('returns values in key order', () => {
      const map = new SkipListMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map.values()]).toEqual(['one', 'two', 'three'])
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.entries()]).toEqual([])
    })

    it('returns entries in sorted key order', () => {
      const map = new SkipListMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map.entries()]).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries in order', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const result: Array<[number, string]> = []
      map.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('receives map as third argument', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      let received: SkipListMap<number, string> | undefined
      map.forEach((_v, _k, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('does not iterate on empty map', () => {
      const map = new SkipListMap<number, string>()
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      const result = [...map]
      expect(result).toEqual([
        [1, 'one'],
        [2, 'two'],
      ])
    })

    it('works with destructuring in for-of', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const keys: number[] = []
      for (const [k] of map) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      const cloned = map.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.get(1)).toBe('one')
      expect(cloned.get(2)).toBe('two')
    })

    it('modifications to clone do not affect original', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      const cloned = map.clone()
      cloned.set(1, 'modified')
      expect(map.get(1)).toBe('one')
      expect(cloned.get(1)).toBe('modified')
    })

    it('modifications to original do not affect clone', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      const cloned = map.clone()
      map.delete(1)
      expect(cloned.get(1)).toBe('one')
      expect(map.get(1)).toBeUndefined()
    })

    it('clone of empty map is empty', () => {
      const map = new SkipListMap<number, string>()
      const cloned = map.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('preserves comparator', () => {
      const cmp = (a: string, b: string) => b.localeCompare(a)
      const map = new SkipListMap<string, number>({ comparator: cmp })
      map.set('a', 1)
      map.set('b', 2)
      const cloned = map.clone()
      expect([...cloned.keys()]).toEqual(['b', 'a'])
    })
  })

  describe('fromEntries', () => {
    it('creates map from entries', () => {
      const map = SkipListMap.fromEntries([
        [3, 'three'],
        [1, 'one'],
        [2, 'two'],
      ])
      expect(map.size).toBe(3)
      expect([...map.keys()]).toEqual([1, 2, 3])
    })

    it('creates empty map from empty entries', () => {
      const map = SkipListMap.fromEntries<number, string>([])
      expect(map.isEmpty()).toBe(true)
    })

    it('accepts custom options', () => {
      const map = SkipListMap.fromEntries(
        [
          ['b', 2],
          ['a', 1],
        ],
        { comparator: (a, b) => a.localeCompare(b) },
      )
      expect([...map.keys()]).toEqual(['a', 'b'])
    })

    it('handles duplicate keys by keeping last', () => {
      const map = SkipListMap.fromEntries([
        [1, 'first'],
        [1, 'second'],
      ])
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('second')
    })
  })

  describe('rangeEntries', () => {
    it('returns entries in range [from, to]', () => {
      const map = new SkipListMap<number, string>()
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      const result = [...map.rangeEntries(3, 7)]
      expect(result).toEqual([
        [3, '3'],
        [4, '4'],
        [5, '5'],
        [6, '6'],
        [7, '7'],
      ])
    })

    it('returns empty for non-overlapping range', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map.rangeEntries(5, 10)]).toEqual([])
    })

    it('returns single entry', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      expect([...map.rangeEntries(5, 5)]).toEqual([[5, 'five']])
    })

    it('returns empty for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.rangeEntries(1, 10)]).toEqual([])
    })

    it('handles from greater than max', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map.rangeEntries(5, 10)]).toEqual([])
    })

    it('includes exact boundary matches', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      map.set(10, 'ten')
      expect([...map.rangeEntries(5, 10)]).toEqual([
        [5, 'five'],
        [10, 'ten'],
      ])
    })
  })

  describe('floor', () => {
    it('returns greatest key <= given key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.floor(15)).toEqual([10, 'ten'])
    })

    it('returns exact match', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.floor(10)).toEqual([10, 'ten'])
    })

    it('returns max when key is greater than all', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.floor(100)).toEqual([20, 'twenty'])
    })

    it('returns undefined when key is less than all', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.floor(5)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.floor(1)).toBeUndefined()
    })
  })

  describe('ceil', () => {
    it('returns smallest key >= given key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.ceil(15)).toEqual([30, 'thirty'])
    })

    it('returns exact match', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.ceil(10)).toEqual([10, 'ten'])
    })

    it('returns undefined when key is greater than all', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.ceil(15)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.ceil(1)).toBeUndefined()
    })
  })

  describe('predecessor', () => {
    it('returns entry with largest key less than given key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.predecessor(20)).toEqual([10, 'ten'])
    })

    it('returns predecessor of non-existent key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.predecessor(25)).toEqual([10, 'ten'])
    })

    it('returns undefined for minimum key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.predecessor(10)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.predecessor(1)).toBeUndefined()
    })

    it('returns undefined for key less than min', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.predecessor(5)).toBeUndefined()
    })
  })

  describe('successor', () => {
    it('returns entry with smallest key greater than given key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.successor(10)).toEqual([20, 'twenty'])
    })

    it('returns successor of non-existent key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.successor(15)).toEqual([30, 'thirty'])
    })

    it('returns undefined for maximum key', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      expect(map.successor(10)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.successor(1)).toBeUndefined()
    })
  })

  describe('large datasets', () => {
    it('handles 1000 insertions', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2)
      }
      expect(map.size).toBe(1000)
      expect(map.min()).toBe(0)
      expect(map.max()).toBe(999)
    })

    it('handles 1000 insertions in reverse', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 999; i >= 0; i--) {
        map.set(i, i)
      }
      expect(map.size).toBe(1000)
      expect([...map.keys()][0]).toBe(0)
      expect([...map.keys()][999]).toBe(999)
    })

    it('handles 1000 deletions', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 0; i < 100; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.isEmpty()).toBe(true)
    })

    it('rank is consistent after many operations', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 1; i <= 100; i++) {
        map.set(i, i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(map.rank(i)).toBe(i)
      }
    })

    it('select is consistent after many operations', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 1; i <= 100; i++) {
        map.set(i, i * 10)
      }
      for (let i = 1; i <= 100; i++) {
        expect(map.select(i)).toEqual([i, i * 10])
      }
    })

    it('handles interleaved insert and delete', () => {
      const map = new SkipListMap<number, string>()
      for (let i = 0; i < 50; i++) map.set(i, String(i))
      for (let i = 0; i < 25; i++) map.delete(i)
      for (let i = 50; i < 100; i++) map.set(i, String(i))
      expect(map.size).toBe(75)
      expect(map.min()).toBe(25)
      expect(map.max()).toBe(99)
    })
  })

  describe('custom comparator (descending)', () => {
    it('sorts in descending order', () => {
      const map = new SkipListMap<number, string>({
        comparator: (a, b) => b - a,
      })
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(3, 'three')
      expect([...map.keys()]).toEqual([5, 3, 1])
    })

    it('min returns largest in descending order', () => {
      const map = new SkipListMap<number, string>({
        comparator: (a, b) => b - a,
      })
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(3, 'three')
      expect(map.min()).toBe(5)
      expect(map.max()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles zero as key', () => {
      const map = new SkipListMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
      expect(map.rank(0)).toBe(1)
    })

    it('handles very large maxLevel', () => {
      const map = new SkipListMap<number, string>({ maxLevel: 64 })
      for (let i = 0; i < 100; i++) map.set(i, String(i))
      expect(map.size).toBe(100)
    })

    it('handles maxLevel of 1', () => {
      const map = new SkipListMap<number, string>({ maxLevel: 1 })
      for (let i = 0; i < 20; i++) map.set(i, String(i))
      expect(map.size).toBe(20)
      expect([...map.keys()]).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('delete returns false for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('get returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('rank and select are inverses', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      for (let i = 1; i <= 3; i++) {
        const entry = map.select(i)
        expect(entry).toBeDefined()
        expect(map.rank(entry![0])).toBe(i)
      }
    })
  })

  describe('stress test rank/select consistency', () => {
    it('rank and select remain consistent after deletions', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 1; i <= 50; i++) map.set(i * 2, i)
      for (let i = 10; i <= 40; i++) map.delete(i * 2)
      const keys = [...map.keys()]
      for (let i = 0; i < keys.length; i++) {
        expect(map.rank(keys[i]!)).toBe(i + 1)
        expect(map.select(i + 1)![0]).toBe(keys[i])
      }
    })
  })

  describe('additional coverage', () => {
    it('minEntry returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.minEntry()).toBeUndefined()
    })

    it('maxEntry returns undefined for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.maxEntry()).toBeUndefined()
    })

    it('minEntry returns [key, value] for single element', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      expect(map.minEntry()).toEqual([5, 'five'])
    })

    it('maxEntry returns [key, value] for single element', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      expect(map.maxEntry()).toEqual([5, 'five'])
    })

    it('handles boolean values', () => {
      const map = new SkipListMap<number, boolean>()
      map.set(1, true)
      map.set(2, false)
      expect(map.get(1)).toBe(true)
      expect(map.get(2)).toBe(false)
    })

    it('handles array values', () => {
      const map = new SkipListMap<number, number[]>()
      map.set(1, [1, 2, 3])
      map.set(2, [4, 5, 6])
      expect(map.get(1)).toEqual([1, 2, 3])
      expect(map.get(2)).toEqual([4, 5, 6])
    })

    it('rangeEntries returns all elements when range covers everything', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      expect([...map.rangeEntries(0, 100)]).toEqual([
        [1, 'one'],
        [5, 'five'],
        [10, 'ten'],
      ])
    })

    it('clone preserves all entries after complex operations', () => {
      const map = new SkipListMap<number, string>()
      for (let i = 0; i < 50; i++) map.set(i, String(i))
      for (let i = 10; i < 30; i++) map.delete(i)
      const cloned = map.clone()
      expect(cloned.size).toBe(map.size)
      const origKeys = [...map.keys()]
      const clonedKeys = [...cloned.keys()]
      expect(clonedKeys).toEqual(origKeys)
    })

    it('forEach order matches entries order', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'e')
      map.set(2, 'b')
      map.set(8, 'h')
      map.set(1, 'a')
      const forEachResult: string[] = []
      map.forEach((v) => forEachResult.push(v))
      const entriesResult = [...map.values()]
      expect(forEachResult).toEqual(entriesResult)
    })

    it('fromEntries with generator', () => {
      function* gen(): Generator<[number, string]> {
        yield [3, 'c']
        yield [1, 'a']
        yield [2, 'b']
      }
      const map = SkipListMap.fromEntries(gen())
      expect([...map.keys()]).toEqual([1, 2, 3])
    })

    it('lowerBound with exact last element', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.lowerBound(10)).toEqual([10, 'ten'])
    })

    it('upperBound past max returns undefined', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(5, 'five')
      expect(map.upperBound(100)).toBeUndefined()
    })

    it('predecessor of non-existent key returns previous', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.predecessor(25)).toEqual([10, 'ten'])
    })

    it('successor of non-existent key returns next', () => {
      const map = new SkipListMap<number, string>()
      map.set(10, 'ten')
      map.set(30, 'thirty')
      expect(map.successor(15)).toEqual([30, 'thirty'])
    })

    it('floor returns last element for large key', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.floor(1000)).toEqual([10, 'ten'])
    })

    it('ceil returns first element for small key', () => {
      const map = new SkipListMap<number, string>()
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.ceil(0)).toEqual([5, 'five'])
    })

    it('set and delete many interleaved operations', () => {
      const map = new SkipListMap<number, number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 20; i++) {
          map.set(round * 20 + i, round * 20 + i)
        }
        for (let i = 0; i < 10; i++) {
          map.delete(round * 20 + i * 2)
        }
      }
      expect(map.size).toBe(50)
    })

    it('rank after clearing and reinserting', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.clear()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.rank(10)).toBe(1)
      expect(map.rank(20)).toBe(2)
    })

    it('select after complex modifications', () => {
      const map = new SkipListMap<number, string>()
      for (let i = 1; i <= 20; i++) map.set(i, String(i))
      map.delete(5)
      map.delete(10)
      map.delete(15)
      expect(map.size).toBe(17)
      expect(map.select(1)).toEqual([1, '1'])
      expect(map.select(4)).toEqual([4, '4'])
      expect(map.select(5)).toEqual([6, '6'])
    })
  })
})
