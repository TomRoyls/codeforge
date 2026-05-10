import { describe, it, expect } from 'vitest'
import { CountedBTreeMap } from '../../src/core/counted-btree-map/counted-btree-map.js'

describe('CountedBTreeMap', () => {
  describe('construction', () => {
    it('creates empty map with default order', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates map with custom order', () => {
      const map = new CountedBTreeMap<number, string>(4)
      expect(map.size).toBe(0)
    })

    it('throws on order less than 2', () => {
      expect(() => new CountedBTreeMap<number, string>(1)).toThrow('B-Tree order must be at least 2')
    })

    it('creates map with custom comparator', () => {
      const map = new CountedBTreeMap<string, number>(32, (a, b) => a.localeCompare(b))
      expect(map.size).toBe(0)
    })

    it('creates map with order 2 (minimum)', () => {
      const map = new CountedBTreeMap<number, string>(2)
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.size).toBe(3)
      expect(map.get(2)).toBe('b')
    })
  })

  describe('set and get', () => {
    it('sets and gets a single entry', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns undefined for missing key', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.get(999)).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.get(1)).toBe('updated')
      expect(map.size).toBe(1)
    })

    it('sets multiple entries in order', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
      expect(map.get(3)).toBe('three')
    })

    it('sets entries with reverse order comparator', () => {
      const map = new CountedBTreeMap<number, string>(32, (a, b) => b - a)
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.size).toBe(3)
    })

    it('handles string keys', () => {
      const map = new CountedBTreeMap<string, number>()
      map.set('apple', 1)
      map.set('banana', 2)
      map.set('cherry', 3)
      expect(map.get('banana')).toBe(2)
    })

    it('handles object values', () => {
      const map = new CountedBTreeMap<number, { name: string }>()
      map.set(1, { name: 'first' })
      expect(map.get(1)?.name).toBe('first')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a single entry', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get(1)).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.delete(999)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('deletes from the middle', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.size).toBe(2)
      expect(map.has(2)).toBe(false)
      expect(map.get(1)).toBe('one')
      expect(map.get(3)).toBe('three')
    })

    it('deletes first element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.size).toBe(2)
      expect(map.has(1)).toBe(false)
    })

    it('deletes last element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.size).toBe(2)
      expect(map.has(3)).toBe(false)
    })

    it('deletes all entries leaving empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      map.delete(2)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('atIndex', () => {
    it('returns element at index 0', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const result = map.atIndex(0)
      expect(result).toEqual({ key: 1, value: 'one' })
    })

    it('returns element at last index', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const result = map.atIndex(2)
      expect(result).toEqual({ key: 3, value: 'three' })
    })

    it('returns element at middle index', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const result = map.atIndex(1)
      expect(result).toEqual({ key: 2, value: 'two' })
    })

    it('returns undefined for out of bounds index', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.atIndex(1)).toBeUndefined()
      expect(map.atIndex(-1)).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.atIndex(0)).toBeUndefined()
    })

    it('maintains sorted order via atIndex', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(4, 'four')
      map.set(2, 'two')
      const arr = map.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(map.atIndex(i)).toEqual(arr[i])
      }
    })
  })

  describe('indexOf', () => {
    it('returns 0 for first element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.indexOf(1)).toBe(0)
    })

    it('returns last index for last element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.indexOf(3)).toBe(2)
    })

    it('returns correct index for middle element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.indexOf(2)).toBe(1)
    })

    it('returns -1 for missing key', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.indexOf(999)).toBe(-1)
    })

    it('returns -1 on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.indexOf(1)).toBe(-1)
    })

    it('returns correct indices after insertions in random order', () => {
      const map = new CountedBTreeMap<number, string>()
      const keys = [5, 3, 1, 4, 2]
      for (const k of keys) {
        map.set(k, `val-${k}`)
      }
      for (let i = 1; i <= 5; i++) {
        expect(map.indexOf(i)).toBe(i - 1)
      }
    })
  })

  describe('first and last', () => {
    it('returns first element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.first).toEqual({ key: 1, value: 'one' })
    })

    it('returns last element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.last).toEqual({ key: 3, value: 'three' })
    })

    it('returns undefined for first on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.first).toBeUndefined()
    })

    it('returns undefined for last on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.last).toBeUndefined()
    })

    it('returns same element for first and last on single entry', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.first).toEqual(map.last)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.size).toBe(0)
    })

    it('increments on set', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.size).toBe(2)
    })

    it('does not increment on overwrite', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('decrements on delete', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('iterates over all entries in order', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      const result: { key: number; value: string; index: number }[] = []
      map.forEach((value, key, index) => {
        result.push({ key, value, index })
      })
      expect(result).toEqual([
        { key: 1, value: 'one', index: 0 },
        { key: 2, value: 'two', index: 1 },
        { key: 3, value: 'three', index: 2 },
      ])
    })

    it('does not call callback on empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      let called = false
      map.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.toArray()).toEqual([])
    })

    it('returns entries in sorted order', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.toArray()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('returns single element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.toArray()).toEqual([{ key: 1, value: 'one' }])
    })
  })

  describe('isEmpty', () => {
    it('returns true for new map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.isEmpty()).toBe(true)
    })

    it('returns false after set', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.isEmpty()).toBe(false)
    })

    it('returns true after clearing all', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('allows reuse after clear', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
    })

    it('clear on empty map is no-op', () => {
      const map = new CountedBTreeMap<number, string>()
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('clone', () => {
    it('clones an empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones all entries', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const cloned = map.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual(map.toArray())
    })

    it('clone is independent of original', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(2, 'b')
      expect(map.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('modifying original does not affect clone', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      map.delete(1)
      expect(cloned.has(1)).toBe(true)
      expect(map.has(1)).toBe(false)
    })
  })

  describe('static from', () => {
    it('creates map from entries', () => {
      const map = CountedBTreeMap.from<number, string>([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.size).toBe(3)
      expect(map.get(2)).toBe('b')
    })

    it('creates empty map from empty entries', () => {
      const map = CountedBTreeMap.from<number, string>([])
      expect(map.size).toBe(0)
    })

    it('creates map with custom order', () => {
      const map = CountedBTreeMap.from<number, string>([[1, 'a'], [2, 'b']], 4)
      expect(map.size).toBe(2)
    })

    it('creates map with custom comparator', () => {
      const map = CountedBTreeMap.from<string, number>([['b', 2], ['a', 1]], 32, (a, b) => a.localeCompare(b))
      expect(map.toArray()[0]).toEqual({ key: 'a', value: 1 })
    })

    it('overwrites duplicate keys (last wins)', () => {
      const map = CountedBTreeMap.from<number, string>([[1, 'first'], [1, 'second']])
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('second')
    })
  })

  describe('rangeQuery', () => {
    it('returns entries in range', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.set(4, 'd')
      map.set(5, 'e')
      const result = map.rangeQuery(2, 4)
      expect(result).toEqual([
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
        { key: 4, value: 'd' },
      ])
    })

    it('returns empty for empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      expect(map.rangeQuery(1, 10)).toEqual([])
    })

    it('returns empty when start > end', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.rangeQuery(5, 1)).toEqual([])
    })

    it('returns single element range', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rangeQuery(2, 2)).toEqual([{ key: 2, value: 'b' }])
    })

    it('returns empty when no elements in range', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.rangeQuery(2, 4)).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('single element operations', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.atIndex(0)).toEqual({ key: 1, value: 'one' })
      expect(map.indexOf(1)).toBe(0)
      expect(map.first).toEqual({ key: 1, value: 'one' })
      expect(map.last).toEqual({ key: 1, value: 'one' })
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })

    it('duplicate key overwrites value', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'first')
      map.set(1, 'second')
      map.set(1, 'third')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('third')
    })

    it('negative keys work', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(-3, 'neg3')
      map.set(-1, 'neg1')
      map.set(0, 'zero')
      map.set(2, 'pos2')
      expect(map.toArray().map(e => e.key)).toEqual([-3, -1, 0, 2])
    })

    it('zero key works', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('undefined value is valid', () => {
      const map = new CountedBTreeMap<number, string | undefined>()
      map.set(1, undefined)
      expect(map.get(1)).toBeUndefined()
      expect(map.has(1)).toBe(true)
      expect(map.size).toBe(1)
    })

    it('null value is valid', () => {
      const map = new CountedBTreeMap<number, string | null>()
      map.set(1, null)
      expect(map.get(1)).toBeNull()
      expect(map.has(1)).toBe(true)
    })
  })

  describe('index boundary tests', () => {
    it('atIndex and indexOf are consistent', () => {
      const map = new CountedBTreeMap<number, string>()
      for (let i = 1; i <= 100; i++) {
        map.set(i, `val-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        const entry = map.atIndex(i)
        expect(entry).toBeDefined()
        expect(map.indexOf(entry!.key)).toBe(i)
      }
    })

    it('atIndex returns undefined at size boundary', () => {
      const map = new CountedBTreeMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, `val-${i}`)
      }
      expect(map.atIndex(10)).toBeUndefined()
      expect(map.atIndex(-1)).toBeUndefined()
    })

    it('indexOf returns -1 for non-existent key', () => {
      const map = new CountedBTreeMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i * 2, `val-${i}`)
      }
      expect(map.indexOf(1)).toBe(-1)
      expect(map.indexOf(3)).toBe(-1)
      expect(map.indexOf(5)).toBe(-1)
    })

    it('atIndex after deletions', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.atIndex(0)).toEqual({ key: 1, value: 'a' })
      expect(map.atIndex(1)).toEqual({ key: 3, value: 'c' })
      expect(map.atIndex(2)).toBeUndefined()
    })

    it('indexOf after deletions', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.indexOf(1)).toBe(0)
      expect(map.indexOf(3)).toBe(1)
      expect(map.indexOf(2)).toBe(-1)
    })
  })

  describe('large maps', () => {
    it('handles 10000 sequential inserts', () => {
      const map = new CountedBTreeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map.set(i, i * 2)
      }
      expect(map.size).toBe(10000)
      expect(map.get(5000)).toBe(10000)
    })

    it('handles 10000 random order inserts', () => {
      const map = new CountedBTreeMap<number, number>()
      const keys = Array.from({ length: 10000 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i]!, keys[j]!] = [keys[j]!, keys[i]!]
      }
      for (const k of keys) {
        map.set(k, k * 3)
      }
      expect(map.size).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(map.get(i)).toBe(i * 3)
      }
    })

    it('atIndex on large map', () => {
      const map = new CountedBTreeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map.set(i, i * 10)
      }
      expect(map.atIndex(0)).toEqual({ key: 0, value: 0 })
      expect(map.atIndex(5000)).toEqual({ key: 5000, value: 50000 })
      expect(map.atIndex(9999)).toEqual({ key: 9999, value: 99990 })
    })

    it('indexOf on large map', () => {
      const map = new CountedBTreeMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map.set(i, i)
      }
      expect(map.indexOf(0)).toBe(0)
      expect(map.indexOf(5000)).toBe(5000)
      expect(map.indexOf(9999)).toBe(9999)
    })

    it('delete from large map', () => {
      const map = new CountedBTreeMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 500; i++) {
        map.delete(i * 2)
      }
      expect(map.size).toBe(500)
      expect(map.has(0)).toBe(false)
      expect(map.has(1)).toBe(true)
    })

    it('rangeQuery on large map', () => {
      const map = new CountedBTreeMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i)
      }
      const result = map.rangeQuery(100, 199)
      expect(result.length).toBe(100)
      expect(result[0]).toEqual({ key: 100, value: 100 })
      expect(result[99]).toEqual({ key: 199, value: 199 })
    })

    it('toArray returns sorted elements on large map', () => {
      const map = new CountedBTreeMap<number, number>()
      for (let i = 0; i < 500; i++) {
        map.set(500 - i, i)
      }
      const arr = map.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!.key).toBeGreaterThan(arr[i - 1]!.key)
      }
    })
  })

  describe('stats', () => {
    it('returns stats for empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      const s = map.stats()
      expect(s.size).toBe(0)
      expect(s.height).toBe(0)
      expect(s.order).toBe(32)
      expect(s.nodeCount).toBe(0)
    })

    it('returns stats for single element', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      const s = map.stats()
      expect(s.size).toBe(1)
      expect(s.height).toBe(1)
      expect(s.nodeCount).toBe(1)
    })

    it('returns correct order', () => {
      const map = new CountedBTreeMap<number, string>(4)
      map.set(1, 'a')
      expect(map.stats().order).toBe(4)
    })

    it('height grows with tree size', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 100; i++) {
        map.set(i, `val-${i}`)
      }
      const s = map.stats()
      expect(s.size).toBe(100)
      expect(s.height).toBeGreaterThan(0)
      expect(s.nodeCount).toBeGreaterThan(0)
    })
  })

  describe('iterator', () => {
    it('iterates over all entries', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const result: { key: number; value: string }[] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('iterates empty map', () => {
      const map = new CountedBTreeMap<number, string>()
      const result: { key: number; value: string }[] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })
  })

  describe('consistency checks', () => {
    it('atIndex and indexOf round-trip after many operations', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 200; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 50; i < 150; i++) {
        map.delete(i)
      }
      for (let i = 200; i < 300; i++) {
        map.set(i, `v${i}`)
      }
      const arr = map.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(map.atIndex(i)).toEqual(arr[i])
        expect(map.indexOf(arr[i]!.key)).toBe(i)
      }
    })

    it('size matches toArray length after operations', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i * 2)
      }
      for (let i = 100; i < 150; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(map.toArray().length)
    })

    it('first and last match atIndex boundaries', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.first).toEqual(map.atIndex(0))
      expect(map.last).toEqual(map.atIndex(map.size - 1))
    })

    it('forEach matches toArray', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 30; i++) {
        map.set(i, `v${i}`)
      }
      const fromEach: { key: number; value: string }[] = []
      map.forEach((value, key) => {
        fromEach.push({ key, value })
      })
      expect(fromEach).toEqual(map.toArray())
    })

    it('rangeQuery matches filtered toArray', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      const rangeResult = map.rangeQuery(20, 50)
      const filteredResult = map.toArray().filter(e => e.key >= 20 && e.key <= 50)
      expect(rangeResult).toEqual(filteredResult)
    })

    it('clone preserves atIndex behavior', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      const cloned = map.clone()
      for (let i = 0; i < 50; i++) {
        expect(cloned.atIndex(i)).toEqual(map.atIndex(i))
      }
    })

    it('clear and rebuild', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      map.clear()
      expect(map.size).toBe(0)
      expect(map.atIndex(0)).toBeUndefined()
      for (let i = 0; i < 50; i++) {
        map.set(i * 10, `new-${i}`)
      }
      expect(map.size).toBe(50)
      expect(map.atIndex(0)?.key).toBe(0)
      expect(map.atIndex(49)?.key).toBe(490)
    })
  })

  describe('additional edge cases', () => {
    it('order 3 stress test', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 500; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(map.atIndex(i)?.key).toBe(i)
        expect(map.indexOf(i)).toBe(i)
      }
    })

    it('insert reverse order', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 100; i >= 0; i--) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(101)
      expect(map.first?.key).toBe(0)
      expect(map.last?.key).toBe(100)
      for (let i = 0; i <= 100; i++) {
        expect(map.indexOf(i)).toBe(i)
      }
    })

    it('delete all then reinsert', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      for (let i = 0; i < 50; i++) {
        map.set(i, `new-${i}`)
      }
      expect(map.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(map.get(i)).toBe(`new-${i}`)
        expect(map.indexOf(i)).toBe(i)
      }
    })

    it('alternating insert and delete', () => {
      const map = new CountedBTreeMap<number, string>(4)
      for (let i = 0; i < 20; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 10; i++) {
        map.delete(i * 2)
      }
      expect(map.size).toBe(10)
      const arr = map.toArray()
      expect(arr.length).toBe(10)
      for (let i = 0; i < arr.length; i++) {
        expect(map.atIndex(i)).toEqual(arr[i])
        expect(map.indexOf(arr[i]!.key)).toBe(i)
      }
    })

    it('from static method with duplicates', () => {
      const map = CountedBTreeMap.from([[3, 'a'], [1, 'b'], [3, 'c'], [2, 'd'], [1, 'e']])
      expect(map.size).toBe(3)
      expect(map.get(1)).toBe('e')
      expect(map.get(2)).toBe('d')
      expect(map.get(3)).toBe('c')
    })

    it('rangeQuery with exact boundaries', () => {
      const map = CountedBTreeMap.from<number, string>([[1, 'a'], [5, 'b'], [10, 'c'], [15, 'd'], [20, 'e']])
      expect(map.rangeQuery(1, 20)).toEqual(map.toArray())
      expect(map.rangeQuery(5, 15)).toEqual([
        { key: 5, value: 'b' },
        { key: 10, value: 'c' },
        { key: 15, value: 'd' },
      ])
    })

    it('stats reflects tree growth', () => {
      const map = new CountedBTreeMap<number, string>(3)
      const s1 = map.stats()
      expect(s1.height).toBe(0)
      map.set(1, 'a')
      const s2 = map.stats()
      expect(s2.height).toBe(1)
      expect(s2.nodeCount).toBe(1)
      for (let i = 2; i <= 100; i++) {
        map.set(i, `v${i}`)
      }
      const s3 = map.stats()
      expect(s3.height).toBeGreaterThan(1)
      expect(s3.nodeCount).toBeGreaterThan(1)
    })

    it('atIndex after overwrite', () => {
      const map = new CountedBTreeMap<number, string>(4)
      map.set(5, 'old5')
      map.set(3, 'old3')
      map.set(7, 'old7')
      map.set(5, 'new5')
      expect(map.atIndex(1)).toEqual({ key: 5, value: 'new5' })
      expect(map.indexOf(5)).toBe(1)
    })

    it('forEach callback receives correct indices', () => {
      const map = new CountedBTreeMap<number, string>(4)
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      const indices: number[] = []
      map.forEach((_v, _k, idx) => {
        indices.push(idx)
      })
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterator with for-of works correctly', () => {
      const map = new CountedBTreeMap<number, string>(4)
      map.set(5, 'e')
      map.set(2, 'b')
      map.set(8, 'h')
      const keys: number[] = []
      for (const entry of map) {
        keys.push(entry.key)
      }
      expect(keys).toEqual([2, 5, 8])
    })

    it('clone with custom comparator', () => {
      const map = new CountedBTreeMap<string, number>(32, (a, b) => b.localeCompare(a))
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const cloned = map.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual(map.toArray())
    })

    it('rangeQuery with single element map', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(5, 'five')
      expect(map.rangeQuery(1, 10)).toEqual([{ key: 5, value: 'five' }])
      expect(map.rangeQuery(5, 5)).toEqual([{ key: 5, value: 'five' }])
      expect(map.rangeQuery(6, 10)).toEqual([])
    })

    it('delete first element from multi-level tree', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      map.delete(0)
      expect(map.size).toBe(49)
      expect(map.first?.key).toBe(1)
      expect(map.indexOf(1)).toBe(0)
      expect(map.atIndex(0)?.key).toBe(1)
    })

    it('delete last element from multi-level tree', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      map.delete(49)
      expect(map.size).toBe(49)
      expect(map.last?.key).toBe(48)
      expect(map.indexOf(48)).toBe(48)
      expect(map.atIndex(48)?.key).toBe(48)
    })

    it('large scale atIndex indexOf round-trip', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 2000; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 2000; i++) {
        const entry = map.atIndex(i)
        expect(entry).toBeDefined()
        expect(entry!.key).toBe(i)
        expect(map.indexOf(i)).toBe(i)
      }
    })

    it('mixed operations consistency', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i * 2)
      }
      for (let i = 100; i < 150; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 30; i++) {
        map.delete(i * 3 + 1)
      }
      const arr = map.toArray()
      expect(map.size).toBe(arr.length)
      for (let i = 0; i < arr.length; i++) {
        expect(map.atIndex(i)).toEqual(arr[i])
        expect(map.indexOf(arr[i]!.key)).toBe(i)
      }
    })

    it('get on non-empty map returns undefined for missing key', () => {
      const map = new CountedBTreeMap<number, string>(4)
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.get(0)).toBeUndefined()
      expect(map.get(2)).toBeUndefined()
      expect(map.get(4)).toBeUndefined()
      expect(map.get(6)).toBeUndefined()
    })

    it('default comparator works with numbers', () => {
      const map = new CountedBTreeMap<number, string>()
      map.set(10, 'ten')
      map.set(5, 'five')
      map.set(15, 'fifteen')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.toArray().map(e => e.key)).toEqual([3, 5, 7, 10, 15])
    })

    it('forEach with early set does not affect iteration', () => {
      const map = new CountedBTreeMap<number, string>(4)
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const result: string[] = []
      map.forEach((v) => {
        result.push(v)
      })
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('stats nodeCount is positive for non-empty tree', () => {
      const map = new CountedBTreeMap<number, string>(3)
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      const s = map.stats()
      expect(s.size).toBe(50)
      expect(s.height).toBeGreaterThan(0)
      expect(s.nodeCount).toBeGreaterThan(0)
      expect(s.nodeCount).toBeGreaterThanOrEqual(s.height)
    })
  })
})
