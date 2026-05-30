import { describe, it, expect } from 'vitest'
import { FlatMap } from '../../../src/utils/flat-map.js'

describe('FlatMap', () => {
  describe('construction', () => {
    it('creates empty map', () => {
      const map = new FlatMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates from entries', () => {
      const map = FlatMap.from([['c', 3], ['a', 1], ['b', 2]])
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })
  })

  describe('set and get', () => {
    it('sets and gets values', () => {
      const map = new FlatMap<string, number>()
      map.set('b', 2)
      map.set('a', 1)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('returns undefined for missing key', () => {
      const map = new FlatMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const map = new FlatMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('maintains sorted order', () => {
      const map = new FlatMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new FlatMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new FlatMap<string, number>()
      expect(map.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a key', () => {
      const map = new FlatMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
      expect(map.size).toBe(1)
    })

    it('returns false for missing key', () => {
      const map = new FlatMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })
  })

  describe('min / max', () => {
    it('returns min key', () => {
      const map = FlatMap.from([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.min).toBe(1)
    })

    it('returns max key', () => {
      const map = FlatMap.from([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.max).toBe(3)
    })

    it('returns undefined for empty', () => {
      const map = new FlatMap<number, string>()
      expect(map.min).toBeUndefined()
      expect(map.max).toBeUndefined()
    })
  })

  describe('atIndex', () => {
    it('returns entry at index', () => {
      const map = FlatMap.from([[10, 'a'], [20, 'b'], [30, 'c']])
      expect(map.atIndex(0)).toEqual([10, 'a'])
      expect(map.atIndex(2)).toEqual([30, 'c'])
    })

    it('returns undefined for out of bounds', () => {
      const map = FlatMap.from([[1, 'a']])
      expect(map.atIndex(-1)).toBeUndefined()
      expect(map.atIndex(1)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('returns entries in exclusive range', () => {
      const map = FlatMap.from([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']])
      expect(map.range(2, 5)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
    })

    it('returns entries in inclusive range', () => {
      const map = FlatMap.from([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']])
      expect(map.rangeInclusive(2, 4)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
    })

    it('returns empty for no matches', () => {
      const map = FlatMap.from([[1, 'a'], [5, 'e']])
      expect(map.range(2, 4)).toEqual([])
    })
  })

  describe('indexOf', () => {
    it('returns index of key', () => {
      const map = FlatMap.from([[10, 'a'], [20, 'b'], [30, 'c']])
      expect(map.indexOf(20)).toBe(1)
    })

    it('returns -1 for missing', () => {
      const map = FlatMap.from([[10, 'a']])
      expect(map.indexOf(99)).toBe(-1)
    })
  })

  describe('iteration', () => {
    it('forEach iterates in order', () => {
      const map = FlatMap.from([[3, 'c'], [1, 'a'], [2, 'b']])
      const collected: Array<[number, string]> = []
      map.forEach((v, k) => collected.push([k, v]))
      expect(collected).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('keys returns sorted keys', () => {
      const map = FlatMap.from([[3, 'c'], [1, 'a']])
      expect(map.keys()).toEqual([1, 3])
    })

    it('values returns values in key order', () => {
      const map = FlatMap.from([[3, 'c'], [1, 'a']])
      expect(map.values()).toEqual(['a', 'c'])
    })

    it('entries returns sorted pairs', () => {
      const map = FlatMap.from([[3, 'c'], [1, 'a']])
      expect(map.entries()).toEqual([[1, 'a'], [3, 'c']])
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = FlatMap.from([[1, 'a'], [2, 'b']])
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('supports reverse comparator', () => {
      const map = new FlatMap<number, string>({ comparator: (a, b) => b - a })
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(2, 'b')
      expect(map.keys()).toEqual([3, 2, 1])
      expect(map.min).toBe(3)
      expect(map.max).toBe(1)
    })
  })

  describe('many entries', () => {
    it('handles 1000 entries', () => {
      const map = new FlatMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })
  })
})
