import { describe, it, expect, beforeEach } from 'vitest'
import { SplayMap } from '../../src/core/splay-map/index.js'
import type { CompareFunction, SplayMapOptions } from '../../src/core/splay-map/index.js'

describe('SplayMap', () => {
  let map: SplayMap<number, string>

  beforeEach(() => {
    map = new SplayMap<number, string>()
  })

  describe('constructor', () => {
    it('creates empty map with no arguments', () => {
      const m = new SplayMap<number, string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })

    it('creates map with empty options', () => {
      const m = new SplayMap<number, string>({})
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })

    it('accepts custom comparator', () => {
      const reverseComp: CompareFunction<number> = (a, b) => b - a
      const m = new SplayMap<number, string>({ comparator: reverseComp })
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.keys()).toEqual([3, 2, 1])
    })

    it('uses default comparator when none provided', () => {
      const m = new SplayMap<number, string>()
      m.set(3, 'three')
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('default comparator works with strings', () => {
      const m = new SplayMap<string, number>()
      m.set('c', 3)
      m.set('a', 1)
      m.set('b', 2)
      expect(m.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('set / get', () => {
    it('sets and gets a single entry', () => {
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('sets and gets multiple entries', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
      expect(map.get(3)).toBe('three')
    })

    it('overwrites existing key value', () => {
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.get(1)).toBe('updated')
      expect(map.size).toBe(1)
    })

    it('returns undefined for non-existent key', () => {
      expect(map.get(99)).toBeUndefined()
    })

    it('returns undefined when map is empty', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('handles object values', () => {
      const objMap = new SplayMap<number, { name: string }>()
      objMap.set(1, { name: 'test' })
      expect(objMap.get(1)!.name).toBe('test')
    })

    it('handles null values', () => {
      const nullMap = new SplayMap<number, string | null>()
      nullMap.set(1, null)
      expect(nullMap.get(1)).toBeNull()
    })

    it('handles undefined values', () => {
      const undefMap = new SplayMap<number, string | undefined>()
      undefMap.set(1, undefined)
      expect(undefMap.get(1)).toBeUndefined()
      expect(undefMap.has(1)).toBe(true)
    })

    it('preserves size after overwrite', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(1, 'c')
      expect(map.size).toBe(2)
    })

    it('sets keys in reverse order', () => {
      map.set(3, 'c')
      map.set(2, 'b')
      map.set(1, 'a')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('sets keys with large gaps', () => {
      map.set(1000, 'a')
      map.set(1, 'b')
      map.set(500, 'c')
      expect(map.keys()).toEqual([1, 500, 1000])
    })
  })

  describe('insert (alias for set)', () => {
    it('insert works like set', () => {
      map.insert(1, 'one')
      expect(map.get(1)).toBe('one')
      expect(map.size).toBe(1)
    })

    it('insert overwrites existing key', () => {
      map.insert(1, 'one')
      map.insert(1, 'two')
      expect(map.get(1)).toBe('two')
      expect(map.size).toBe(1)
    })

    it('insert multiple entries', () => {
      map.insert(3, 'c')
      map.insert(1, 'a')
      map.insert(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for non-existent key', () => {
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('returns false on empty map', () => {
      expect(map.has(1)).toBe(false)
    })

    it('returns true after overwrite', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.has(1)).toBe(true)
    })

    it('returns false after deletion', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a leaf node', () => {
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get(1)).toBeUndefined()
    })

    it('deletes an internal node', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.delete(2)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.get(2)).toBeUndefined()
      expect(map.get(1)).toBe('one')
      expect(map.get(3)).toBe('three')
    })

    it('returns false for non-existent key', () => {
      expect(map.delete(99)).toBe(false)
    })

    it('returns false on empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('deletes all entries', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      for (let i = 1; i <= 10; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('deletes alternating entries', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      for (let i = 1; i <= 10; i += 2) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(5)
      for (let i = 2; i <= 10; i += 2) {
        expect(map.has(i)).toBe(true)
      }
      for (let i = 1; i <= 10; i += 2) {
        expect(map.has(i)).toBe(false)
      }
    })

    it('maintains sorted order after deletions', () => {
      for (let i = 1; i <= 20; i++) map.set(i, String(i))
      for (let i = 5; i <= 15; i++) map.delete(i)
      const keys = map.keys()
      expect(keys).toEqual([1, 2, 3, 4, 16, 17, 18, 19, 20])
    })

    it('handles delete after overwrite', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('delete root with two children', () => {
      map.set(10, 'a')
      map.set(5, 'b')
      map.set(15, 'c')
      expect(map.delete(10)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.keys()).toEqual([5, 15])
    })

    it('delete root with left child only', () => {
      map.set(10, 'a')
      map.set(5, 'b')
      expect(map.delete(10)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.get(5)).toBe('b')
    })

    it('delete root with right child only', () => {
      map.set(10, 'a')
      map.set(15, 'b')
      expect(map.delete(10)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.get(15)).toBe('b')
    })
  })

  describe('size / isEmpty', () => {
    it('size is 0 for new map', () => {
      expect(map.size).toBe(0)
    })

    it('isEmpty is true for new map', () => {
      expect(map.isEmpty).toBe(true)
    })

    it('size increments on set', () => {
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
    })

    it('size does not change on overwrite', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('size decrements on delete', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('isEmpty is false after set', () => {
      map.set(1, 'a')
      expect(map.isEmpty).toBe(false)
    })

    it('isEmpty is true after deleting all', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('clears non-empty map', () => {
      for (let i = 0; i < 10; i++) map.set(i, String(i))
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
      expect(map.get(5)).toBeUndefined()
    })

    it('allows operations after clear', () => {
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  describe('clone', () => {
    it('clones empty map', () => {
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones all entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const cloned = map.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.get(1)).toBe('a')
      expect(cloned.get(2)).toBe('b')
      expect(cloned.get(3)).toBe('c')
    })

    it('clone is independent of original', () => {
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(2, 'b')
      expect(map.size).toBe(1)
      expect(cloned.size).toBe(2)
      expect(map.has(2)).toBe(false)
    })

    it('clone preserves comparator', () => {
      const cmp: CompareFunction<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const original = new SplayMap<string, number>({ comparator: cmp })
      original.set('A', 1)
      const cloned = original.clone()
      cloned.set('a', 2)
      expect(cloned.size).toBe(1)
      expect(cloned.get('A')).toBe(2)
    })
  })

  describe('min / max', () => {
    it('returns undefined for empty map', () => {
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })

    it('returns min and max for single entry', () => {
      map.set(5, 'five')
      expect(map.min()).toEqual([5, 'five'])
      expect(map.max()).toEqual([5, 'five'])
    })

    it('returns correct min and max after multiple sets', () => {
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      map.set(1, 'one')
      map.set(10, 'ten')
      expect(map.min()).toEqual([1, 'one'])
      expect(map.max()).toEqual([10, 'ten'])
    })

    it('updates min after deleting min key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toEqual([2, 'two'])
    })

    it('updates max after deleting max key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toEqual([2, 'two'])
    })
  })

  describe('first / last', () => {
    it('first returns undefined on empty map', () => {
      expect(map.first()).toBeUndefined()
    })

    it('last returns undefined on empty map', () => {
      expect(map.last()).toBeUndefined()
    })

    it('first returns min entry', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.first()).toEqual([3, 'three'])
    })

    it('last returns max entry', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.last()).toEqual([7, 'seven'])
    })

    it('first and last same for single entry', () => {
      map.set(42, 'answer')
      expect(map.first()).toEqual([42, 'answer'])
      expect(map.last()).toEqual([42, 'answer'])
    })

    it('first returns same as min', () => {
      map.set(10, 'a')
      map.set(1, 'b')
      map.set(5, 'c')
      expect(map.first()).toEqual(map.min())
    })

    it('last returns same as max', () => {
      map.set(10, 'a')
      map.set(1, 'b')
      map.set(5, 'c')
      expect(map.last()).toEqual(map.max())
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('iterates all entries in order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result: string[] = []
      map.forEach((v, k) => {
        result.push(`${k}:${v}`)
      })
      expect(result).toEqual(['1:a', '2:b', '3:c'])
    })

    it('passes map as third argument', () => {
      map.set(1, 'a')
      let received: SplayMap<number, string> | undefined
      map.forEach((_v, _k, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('iterates correct number of times', () => {
      for (let i = 0; i < 5; i++) map.set(i, String(i))
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(5)
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const result: [number, string][] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })

    it('iterates entries in order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result: [number, string][] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('works with spread operator', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect([...map]).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })

    it('works with Array.from', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(Array.from(map)).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })
  })

  describe('keys / values / entries', () => {
    it('keys returns empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('entries returns empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('keys returns sorted keys', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries returns sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('returns snapshot not affected by later mutations', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const keys = map.keys()
      const vals = map.values()
      const ents = map.entries()
      map.set(3, 'c')
      expect(keys).toEqual([1, 2])
      expect(vals).toEqual(['a', 'b'])
      expect(ents).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })
  })

  describe('toArray / toArraySorted', () => {
    it('toArray returns empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('toArraySorted returns empty array for empty map', () => {
      expect(map.toArraySorted()).toEqual([])
    })

    it('toArray returns sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('toArraySorted returns sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArraySorted()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('toArray equals toArraySorted', () => {
      map.set(5, 'e')
      map.set(2, 'b')
      map.set(8, 'h')
      expect(map.toArray()).toEqual(map.toArraySorted())
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty map', () => {
      expect(map.lowerBound(1)).toBeUndefined()
    })

    it('returns exact key when present', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(3)).toEqual([3, 'c'])
    })

    it('returns next greater key when exact not present', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(2)).toEqual([3, 'c'])
    })

    it('returns undefined when all keys are less', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.lowerBound(10)).toBeUndefined()
    })

    it('returns smallest key for lowerBound of min', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.lowerBound(0)).toEqual([1, 'a'])
    })

    it('returns exact key when key equals max', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.lowerBound(5)).toEqual([5, 'e'])
    })

    it('works with many elements', () => {
      for (let i = 0; i < 20; i += 2) {
        map.set(i, `v${i}`)
      }
      expect(map.lowerBound(5)).toEqual([6, 'v6'])
      expect(map.lowerBound(6)).toEqual([6, 'v6'])
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty map', () => {
      expect(map.upperBound(1)).toBeUndefined()
    })

    it('returns next greater key when exact present', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.upperBound(3)).toEqual([5, 'e'])
    })

    it('returns next greater when exact not present', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.upperBound(2)).toEqual([5, 'e'])
    })

    it('returns undefined when all keys are less or equal', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.upperBound(5)).toBeUndefined()
    })

    it('returns first element when key < min', () => {
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.upperBound(1)).toEqual([5, 'e'])
    })

    it('works with many elements', () => {
      for (let i = 0; i < 20; i += 2) {
        map.set(i, `v${i}`)
      }
      expect(map.upperBound(4)).toEqual([6, 'v6'])
      expect(map.upperBound(6)).toEqual([8, 'v8'])
    })
  })

  describe('predecessor', () => {
    it('returns undefined for empty map', () => {
      expect(map.predecessor(1)).toBeUndefined()
    })

    it('returns largest key less than given key', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.predecessor(5)).toEqual([3, 'c'])
    })

    it('returns undefined when all keys are greater or equal', () => {
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.predecessor(3)).toBeUndefined()
    })

    it('returns predecessor for key not in map', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.predecessor(7)).toEqual([5, 'e'])
    })

    it('returns predecessor when key is min', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.predecessor(1)).toBeUndefined()
    })

    it('predecessor of max returns second largest', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.predecessor(5)).toEqual([3, 'c'])
    })
  })

  describe('successor', () => {
    it('returns undefined for empty map', () => {
      expect(map.successor(1)).toBeUndefined()
    })

    it('returns smallest key greater than given key', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.successor(3)).toEqual([5, 'e'])
    })

    it('returns undefined when all keys are less or equal', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.successor(5)).toBeUndefined()
    })

    it('returns successor for key not in map', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.successor(3)).toEqual([5, 'e'])
    })

    it('successor of min returns second smallest', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.successor(1)).toEqual([3, 'c'])
    })

    it('successor equals upperBound', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.successor(3)).toEqual(map.upperBound(3))
    })
  })

  describe('rank', () => {
    it('returns 0 for empty map', () => {
      expect(map.rank(1)).toBe(0)
    })

    it('returns 0 for min key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rank(1)).toBe(0)
    })

    it('returns correct rank for middle key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rank(2)).toBe(1)
    })

    it('returns correct rank for max key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rank(3)).toBe(2)
    })

    it('returns count of keys less than given key not in map', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.rank(4)).toBe(2)
    })

    it('returns 0 for key less than min', () => {
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.rank(1)).toBe(0)
    })

    it('returns size for key greater than max', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.rank(10)).toBe(2)
    })

    it('works with many elements', () => {
      for (let i = 0; i < 20; i++) map.set(i, `v${i}`)
      expect(map.rank(10)).toBe(10)
      expect(map.rank(0)).toBe(0)
      expect(map.rank(19)).toBe(19)
    })
  })

  describe('select', () => {
    it('returns undefined for empty map', () => {
      expect(map.select(0)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      map.set(1, 'a')
      expect(map.select(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      map.set(1, 'a')
      expect(map.select(1)).toBeUndefined()
    })

    it('returns first entry for select(0)', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.select(0)).toEqual([1, 'a'])
    })

    it('returns last entry for select(size-1)', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.select(2)).toEqual([3, 'c'])
    })

    it('returns correct entry for middle index', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.select(1)).toEqual([2, 'b'])
    })

    it('select and rank are inverses', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 10; i++) {
        const entry = map.select(i)
        expect(entry).toBeDefined()
        expect(map.rank(entry![0])).toBe(i)
      }
    })
  })

  describe('split', () => {
    it('splits empty map into two empty maps', () => {
      const [left, right] = map.split(5)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('splits map at given key', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      const [left, right] = map.split(5)
      expect(left.size).toBe(5)
      expect(right.size).toBe(5)
      expect(left.keys()).toEqual([1, 2, 3, 4, 5])
      expect(right.keys()).toEqual([6, 7, 8, 9, 10])
    })

    it('left contains keys <= split key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const [left] = map.split(2)
      expect(left.has(1)).toBe(true)
      expect(left.has(2)).toBe(true)
    })

    it('right contains keys > split key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const [, right] = map.split(2)
      expect(right.has(3)).toBe(true)
      expect(right.has(2)).toBe(false)
    })

    it('split at min key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const [left, right] = map.split(1)
      expect(left.size).toBe(1)
      expect(right.size).toBe(2)
    })

    it('split at max key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const [left, right] = map.split(3)
      expect(left.size).toBe(3)
      expect(right.size).toBe(0)
    })

    it('split with key not in map', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      const [left, right] = map.split(4)
      expect(left.size).toBe(2)
      expect(right.size).toBe(1)
      expect(left.keys()).toEqual([1, 3])
      expect(right.keys()).toEqual([5])
    })

    it('split preserves comparator', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new SplayMap<number, string>({ comparator: cmp })
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const [left, right] = m.split(2)
      expect(left.size).toBe(2)
      expect(right.size).toBe(1)
    })
  })

  describe('merge', () => {
    it('merges empty map into non-empty', () => {
      map.set(1, 'a')
      const other = new SplayMap<number, string>()
      map.merge(other)
      expect(map.size).toBe(1)
    })

    it('merges non-empty map into empty', () => {
      const other = new SplayMap<number, string>()
      other.set(1, 'a')
      other.set(2, 'b')
      map.merge(other)
      expect(map.size).toBe(2)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
    })

    it('merges two non-empty maps', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      const other = new SplayMap<number, string>()
      other.set(2, 'b')
      other.set(4, 'd')
      map.merge(other)
      expect(map.size).toBe(4)
      expect(map.keys()).toEqual([1, 2, 3, 4])
    })

    it('merge overwrites existing keys', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const other = new SplayMap<number, string>()
      other.set(2, 'updated')
      other.set(3, 'c')
      map.merge(other)
      expect(map.size).toBe(3)
      expect(map.get(2)).toBe('updated')
    })

    it('merge empty into empty stays empty', () => {
      const other = new SplayMap<number, string>()
      map.merge(other)
      expect(map.size).toBe(0)
    })

    it('merge does not modify source map', () => {
      map.set(1, 'a')
      const other = new SplayMap<number, string>()
      other.set(2, 'b')
      other.set(3, 'c')
      map.merge(other)
      expect(other.size).toBe(2)
      expect(other.has(1)).toBe(false)
    })
  })

  describe('rangeQuery', () => {
    it('returns empty for empty map', () => {
      expect(map.rangeQuery(1, 5)).toEqual([])
    })

    it('returns entries within range', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      const result = map.rangeQuery(3, 7)
      expect(result).toEqual([
        [3, '3'],
        [4, '4'],
        [5, '5'],
        [6, '6'],
        [7, '7'],
      ])
    })

    it('returns empty when no keys in range', () => {
      map.set(1, 'a')
      map.set(10, 'j')
      expect(map.rangeQuery(3, 7)).toEqual([])
    })

    it('returns single entry when lo equals hi and key exists', () => {
      map.set(5, 'five')
      expect(map.rangeQuery(5, 5)).toEqual([[5, 'five']])
    })

    it('returns all entries for wide range', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rangeQuery(0, 10)).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('inclusive on both ends', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.rangeQuery(1, 10)).toEqual([
        [1, 'a'],
        [5, 'e'],
        [10, 'j'],
      ])
    })

    it('returns partial range at boundaries', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      expect(map.rangeQuery(0, 3)).toEqual([
        [1, '1'],
        [2, '2'],
        [3, '3'],
      ])
      expect(map.rangeQuery(8, 15)).toEqual([
        [8, '8'],
        [9, '9'],
        [10, '10'],
      ])
    })
  })

  describe('update', () => {
    it('updates existing key and returns true', () => {
      map.set(1, 'old')
      expect(map.update(1, 'new')).toBe(true)
      expect(map.get(1)).toBe('new')
    })

    it('returns false for non-existent key', () => {
      expect(map.update(1, 'new')).toBe(false)
    })

    it('returns false on empty map', () => {
      expect(map.update(1, 'new')).toBe(false)
    })

    it('does not change size on update', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.update(1, 'updated')
      expect(map.size).toBe(2)
    })

    it('update is different from set for non-existent keys', () => {
      map.set(1, 'a')
      map.update(2, 'b')
      expect(map.size).toBe(1)
      expect(map.has(2)).toBe(false)
    })
  })

  describe('static fromArray', () => {
    it('creates map from entries', () => {
      const m = SplayMap.fromArray<number, string>([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(m.size).toBe(3)
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('creates map from empty array', () => {
      const m = SplayMap.fromArray<number, string>([])
      expect(m.size).toBe(0)
    })

    it('creates map with custom comparator', () => {
      const cmp: CompareFunction<string> = (a, b) => b.localeCompare(a)
      const m = SplayMap.fromArray<string, number>(
        [
          ['a', 1],
          ['b', 2],
        ],
        { comparator: cmp },
      )
      expect(m.keys()).toEqual(['b', 'a'])
    })

    it('handles duplicate keys', () => {
      const m = SplayMap.fromArray<number, string>([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
      ])
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('c')
    })
  })

  describe('custom comparator', () => {
    it('supports reverse ordering', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new SplayMap<number, string>({ comparator: cmp })
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.keys()).toEqual([3, 2, 1])
      expect(m.min()).toEqual([3, 'c'])
      expect(m.max()).toEqual([1, 'a'])
    })

    it('supports string keys with custom comparator', () => {
      const m = new SplayMap<string, number>({
        comparator: (a, b) => a.length - b.length || a.localeCompare(b),
      })
      m.set('aa', 1)
      m.set('b', 2)
      m.set('ccc', 3)
      m.set('dd', 4)
      expect(m.keys()).toEqual(['b', 'aa', 'dd', 'ccc'])
    })

    it('custom comparator with lowerBound', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new SplayMap<number, string>({ comparator: cmp })
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      expect(m.lowerBound(25)).toEqual([20, 'b'])
    })

    it('custom comparator with rangeQuery', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new SplayMap<number, string>({ comparator: cmp })
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      const result = m.rangeQuery(25, 10)
      expect(result).toEqual([
        [20, 'b'],
        [10, 'a'],
      ])
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      map.set(-1, 'neg')
      map.set(0, 'zero')
      map.set(1, 'pos')
      expect(map.keys()).toEqual([-1, 0, 1])
      expect(map.min()).toEqual([-1, 'neg'])
      expect(map.max()).toEqual([1, 'pos'])
    })

    it('handles floating point keys', () => {
      map.set(1.5, 'a')
      map.set(2.5, 'b')
      map.set(0.5, 'c')
      expect(map.keys()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles string keys', () => {
      const m = new SplayMap<string, number>()
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles array value types', () => {
      const m = new SplayMap<number, number[]>()
      m.set(1, [1, 2, 3])
      m.set(2, [4, 5, 6])
      expect(m.get(1)).toEqual([1, 2, 3])
    })

    it('handles boolean value types', () => {
      const m = new SplayMap<string, boolean>()
      m.set('a', true)
      m.set('b', false)
      expect(m.get('a')).toBe(true)
      expect(m.get('b')).toBe(false)
    })

    it('handles single element operations', () => {
      map.set(42, 'answer')
      expect(map.min()).toEqual([42, 'answer'])
      expect(map.max()).toEqual([42, 'answer'])
      expect(map.lowerBound(42)).toEqual([42, 'answer'])
      expect(map.upperBound(41)).toEqual([42, 'answer'])
      expect(map.predecessor(42)).toBeUndefined()
      expect(map.successor(42)).toBeUndefined()
      expect(map.rangeQuery(42, 42)).toEqual([[42, 'answer']])
      expect(map.rank(42)).toBe(0)
      expect(map.select(0)).toEqual([42, 'answer'])
    })

    it('handles set-delete-set cycle', () => {
      map.set(1, 'first')
      map.delete(1)
      map.set(1, 'second')
      expect(map.get(1)).toBe('second')
      expect(map.size).toBe(1)
    })

    it('handles sequential delete from front', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 10; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
    })

    it('handles sequential delete from back', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      for (let i = 9; i >= 0; i--) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
    })

    it('handles duplicate key set many times', () => {
      for (let i = 0; i < 100; i++) {
        map.set(1, `val-${i}`)
      }
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('val-99')
    })
  })

  describe('large inputs / stress tests', () => {
    it('maintains sorted order for sequential insertions', () => {
      for (let i = 0; i < 100; i++) map.set(i, String(i))
      const keys = map.keys()
      let sorted = true
      for (let i = 1; i < keys.length; i++) {
        if (keys[i - 1]! >= keys[i]!) {
          sorted = false
          break
        }
      }
      expect(sorted).toBe(true)
      expect(keys.length).toBe(100)
    })

    it('maintains sorted order for reverse sequential insertions', () => {
      for (let i = 99; i >= 0; i--) map.set(i, String(i))
      const keys = map.keys()
      let sorted = true
      for (let i = 1; i < keys.length; i++) {
        if (keys[i - 1]! >= keys[i]!) {
          sorted = false
          break
        }
      }
      expect(sorted).toBe(true)
      expect(keys.length).toBe(100)
    })

    it('handles random insertions', () => {
      const nums = Array.from({ length: 100 }, (_, i) => i)
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[nums[i]!, nums[j]!] = [nums[j]!, nums[i]!]
      }
      for (const n of nums) map.set(n, String(n))
      const keys = map.keys()
      let sorted = true
      for (let i = 1; i < keys.length; i++) {
        if (keys[i - 1]! >= keys[i]!) {
          sorted = false
          break
        }
      }
      expect(sorted).toBe(true)
      expect(keys.length).toBe(100)
    })

    it('handles large batch insertions and deletions', () => {
      for (let i = 0; i < 500; i++) map.set(i, String(i))
      expect(map.size).toBe(500)
      for (let i = 0; i < 500; i += 2) map.delete(i)
      expect(map.size).toBe(250)
      const keys = map.keys()
      for (const k of keys) {
        expect(k % 2).toBe(1)
      }
    })

    it('handles mixed insert and delete', () => {
      for (let i = 0; i < 50; i++) map.set(i, String(i))
      for (let i = 0; i < 25; i++) map.delete(i)
      for (let i = 50; i < 75; i++) map.set(i, String(i))
      expect(map.size).toBe(50)
      const keys = map.keys()
      let sorted = true
      for (let i = 1; i < keys.length; i++) {
        if (keys[i - 1]! >= keys[i]!) {
          sorted = false
          break
        }
      }
      expect(sorted).toBe(true)
    })

    it('maintains correctness after stress', () => {
      const reference = new Map<number, string>()
      for (let i = 0; i < 200; i++) {
        const key = Math.floor(Math.random() * 100)
        const op = Math.random()
        if (op < 0.5) {
          map.set(key, `v${key}`)
          reference.set(key, `v${key}`)
        } else if (op < 0.8 && reference.size > 0) {
          const refKeys = [...reference.keys()]
          const rk = refKeys[Math.floor(Math.random() * refKeys.length)]!
          map.delete(rk)
          reference.delete(rk)
        } else {
          map.set(key, `v${key}`)
          reference.set(key, `v${key}`)
        }
      }
      expect(map.size).toBe(reference.size)
      for (const key of reference.keys()) {
        expect(map.has(key)).toBe(true)
      }
    })
  })

  describe('type exports', () => {
    it('CompareFunction type is usable', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
    })

    it('SplayMapOptions type is usable', () => {
      const opts: SplayMapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const m = new SplayMap<number, string>(opts)
      m.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })
  })
})
