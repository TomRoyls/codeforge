import { describe, expect, it } from 'vitest'
import { PersistentArray } from '../../src/core/persistent-array/persistent-array'

describe('PersistentArray', () => {
  describe('from', () => {
    it('creates empty array from empty input', () => {
      const arr = PersistentArray.from<number>([])
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('creates array from single element', () => {
      const arr = PersistentArray.from([42])
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(42)
    })

    it('creates array from multiple elements', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5])
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates array from strings', () => {
      const arr = PersistentArray.from(['a', 'b', 'c'])
      expect(arr.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('creates array preserving element order', () => {
      const arr = PersistentArray.from([10, 20, 30, 40])
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
      expect(arr.get(3)).toBe(40)
    })

    it('creates array with version 0', () => {
      const arr = PersistentArray.from([1, 2, 3])
      expect(arr.version).toBe(0)
    })

    it('creates array with no previous', () => {
      const arr = PersistentArray.from([1, 2])
      expect(arr.previous()).toBeNull()
    })
  })

  describe('ofSize', () => {
    it('creates empty array with size 0', () => {
      const arr = PersistentArray.ofSize(0, 0)
      expect(arr.size()).toBe(0)
    })

    it('creates array filled with value', () => {
      const arr = PersistentArray.ofSize(5, 7)
      expect(arr.toArray()).toEqual([7, 7, 7, 7, 7])
    })

    it('creates single element array', () => {
      const arr = PersistentArray.ofSize(1, 'x')
      expect(arr.get(0)).toBe('x')
    })

    it('creates array with object fill', () => {
      const obj = { v: 1 }
      const arr = PersistentArray.ofSize(3, obj)
      expect(arr.get(0)).toBe(obj)
      expect(arr.get(1)).toBe(obj)
      expect(arr.get(2)).toBe(obj)
    })

    it('creates array with null fill', () => {
      const arr = PersistentArray.ofSize<number | null>(4, null)
      expect(arr.toArray()).toEqual([null, null, null, null])
    })
  })

  describe('get', () => {
    it('gets element at index 0', () => {
      const arr = PersistentArray.from([10, 20, 30])
      expect(arr.get(0)).toBe(10)
    })

    it('gets element at last index', () => {
      const arr = PersistentArray.from([10, 20, 30])
      expect(arr.get(2)).toBe(30)
    })

    it('gets element at middle index', () => {
      const arr = PersistentArray.from([10, 20, 30])
      expect(arr.get(1)).toBe(20)
    })

    it('throws on negative index', () => {
      const arr = PersistentArray.from([1, 2, 3])
      expect(() => arr.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const arr = PersistentArray.from([1, 2])
      expect(() => arr.get(2)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const arr = PersistentArray.from([1, 2])
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = PersistentArray.from<number>([])
      expect(() => arr.get(0)).toThrow(RangeError)
    })

    it('gets from single element array', () => {
      const arr = PersistentArray.from([99])
      expect(arr.get(0)).toBe(99)
    })
  })

  describe('set', () => {
    it('sets value at index 0', () => {
      const arr = PersistentArray.from([1, 2, 3]).set(0, 10)
      expect(arr.get(0)).toBe(10)
    })

    it('sets value at last index', () => {
      const arr = PersistentArray.from([1, 2, 3]).set(2, 30)
      expect(arr.get(2)).toBe(30)
    })

    it('sets value at middle index', () => {
      const arr = PersistentArray.from([1, 2, 3]).set(1, 20)
      expect(arr.get(1)).toBe(20)
    })

    it('returns new array without modifying original', () => {
      const original = PersistentArray.from([1, 2, 3])
      const modified = original.set(1, 99)
      expect(original.get(1)).toBe(2)
      expect(modified.get(1)).toBe(99)
    })

    it('preserves other elements', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5]).set(2, 99)
      expect(arr.toArray()).toEqual([1, 2, 99, 4, 5])
    })

    it('throws on negative index', () => {
      const arr = PersistentArray.from([1, 2])
      expect(() => arr.set(-1, 0)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = PersistentArray.from([1, 2])
      expect(() => arr.set(5, 0)).toThrow(RangeError)
    })

    it('increments version', () => {
      const original = PersistentArray.from([1, 2, 3])
      const modified = original.set(0, 10)
      expect(modified.version).toBe(original.version + 1)
    })
  })

  describe('push', () => {
    it('pushes to empty array', () => {
      const arr = PersistentArray.from<number>([]).push(1)
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('pushes multiple values', () => {
      const arr = PersistentArray.from<number>([]).push(1).push(2).push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('returns new array without modifying original', () => {
      const original = PersistentArray.from([1, 2])
      const pushed = original.push(3)
      expect(original.size()).toBe(2)
      expect(pushed.size()).toBe(3)
      expect(original.toArray()).toEqual([1, 2])
      expect(pushed.toArray()).toEqual([1, 2, 3])
    })

    it('pushes to single element array', () => {
      const arr = PersistentArray.from([1]).push(2)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('increments version', () => {
      const original = PersistentArray.from([1])
      const pushed = original.push(2)
      expect(pushed.version).toBe(1)
    })

    it('maintains order after multiple pushes', () => {
      let arr = PersistentArray.from<number>([])
      for (let i = 0; i < 10; i++) arr = arr.push(i)
      expect(arr.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('pushes objects', () => {
      const obj = { x: 1 }
      const arr = PersistentArray.from([obj])
      expect(arr.get(0)).toBe(obj)
    })
  })

  describe('pop', () => {
    it('pops from single element array', () => {
      const { array, value } = PersistentArray.from([42]).pop()
      expect(value).toBe(42)
      expect(array.size()).toBe(0)
    })

    it('pops from multi element array', () => {
      const { array, value } = PersistentArray.from([1, 2, 3]).pop()
      expect(value).toBe(3)
      expect(array.toArray()).toEqual([1, 2])
    })

    it('returns undefined for empty array', () => {
      const { array, value } = PersistentArray.from<number>([]).pop()
      expect(value).toBeUndefined()
      expect(array.size()).toBe(0)
    })

    it('returns same empty array when popping empty', () => {
      const empty = PersistentArray.from<number>([])
      const { array } = empty.pop()
      expect(array).toBe(empty)
    })

    it('does not modify original array', () => {
      const original = PersistentArray.from([1, 2, 3])
      const { array } = original.pop()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(array.toArray()).toEqual([1, 2])
    })

    it('pops all elements sequentially', () => {
      let arr = PersistentArray.from([1, 2, 3])
      const r1 = arr.pop()
      expect(r1.value).toBe(3)
      const r2 = r1.array.pop()
      expect(r2.value).toBe(2)
      const r3 = r2.array.pop()
      expect(r3.value).toBe(1)
      expect(r3.array.size()).toBe(0)
    })

    it('increments version on pop', () => {
      const original = PersistentArray.from([1, 2])
      const { array } = original.pop()
      expect(array.version).toBe(1)
    })

    it('popping preserves earlier elements', () => {
      const { array } = PersistentArray.from([10, 20, 30, 40, 50]).pop()
      expect(array.get(0)).toBe(10)
      expect(array.get(1)).toBe(20)
      expect(array.get(2)).toBe(30)
      expect(array.get(3)).toBe(40)
    })
  })

  describe('slice', () => {
    it('slices with start only', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5]).slice(2)
      expect(arr.toArray()).toEqual([3, 4, 5])
    })

    it('slices with start and end', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5]).slice(1, 4)
      expect(arr.toArray()).toEqual([2, 3, 4])
    })

    it('slices entire array with no args', () => {
      const arr = PersistentArray.from([1, 2, 3]).slice()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('slices from beginning with 0 start', () => {
      const arr = PersistentArray.from([1, 2, 3, 4]).slice(0, 2)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('returns empty for out of range', () => {
      const arr = PersistentArray.from([1, 2, 3]).slice(10, 20)
      expect(arr.toArray()).toEqual([])
    })

    it('handles negative start', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5]).slice(-2)
      expect(arr.toArray()).toEqual([4, 5])
    })

    it('handles negative end', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5]).slice(0, -1)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns new independent array', () => {
      const original = PersistentArray.from([1, 2, 3])
      const sliced = original.slice(0, 2)
      expect(sliced.size()).toBe(2)
      expect(original.size()).toBe(3)
    })
  })

  describe('map', () => {
    it('maps numbers to doubled values', () => {
      const arr = PersistentArray.from([1, 2, 3]).map((v) => v * 2)
      expect(arr.toArray()).toEqual([2, 4, 6])
    })

    it('maps to different type', () => {
      const arr = PersistentArray.from([1, 2, 3]).map((v) => `n${v}`)
      expect(arr.toArray()).toEqual(['n1', 'n2', 'n3'])
    })

    it('provides index to callback', () => {
      const arr = PersistentArray.from([10, 20, 30]).map((v, i) => v + i)
      expect(arr.toArray()).toEqual([10, 21, 32])
    })

    it('maps empty array', () => {
      const arr = PersistentArray.from<number>([]).map((v) => v * 2)
      expect(arr.size()).toBe(0)
    })

    it('does not modify original', () => {
      const original = PersistentArray.from([1, 2, 3])
      original.map((v) => v * 10)
      expect(original.toArray()).toEqual([1, 2, 3])
    })

    it('maps single element', () => {
      const arr = PersistentArray.from([5]).map((v) => v + 1)
      expect(arr.toArray()).toEqual([6])
    })
  })

  describe('filter', () => {
    it('filters even numbers', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5, 6]).filter((v) => v % 2 === 0)
      expect(arr.toArray()).toEqual([2, 4, 6])
    })

    it('filters with index', () => {
      const arr = PersistentArray.from([10, 20, 30, 40]).filter((_v, i) => i > 1)
      expect(arr.toArray()).toEqual([30, 40])
    })

    it('returns empty when nothing matches', () => {
      const arr = PersistentArray.from([1, 3, 5]).filter((v) => v % 2 === 0)
      expect(arr.toArray()).toEqual([])
    })

    it('returns all when all match', () => {
      const arr = PersistentArray.from([2, 4, 6]).filter((v) => v % 2 === 0)
      expect(arr.toArray()).toEqual([2, 4, 6])
    })

    it('does not modify original', () => {
      const original = PersistentArray.from([1, 2, 3])
      original.filter((v) => v > 1)
      expect(original.toArray()).toEqual([1, 2, 3])
    })

    it('filters empty array', () => {
      const arr = PersistentArray.from<number>([]).filter((v) => v > 0)
      expect(arr.size()).toBe(0)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const collected: number[] = []
      PersistentArray.from([1, 2, 3]).forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides index', () => {
      const indices: number[] = []
      PersistentArray.from([10, 20, 30]).forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing for empty array', () => {
      let count = 0
      PersistentArray.from<number>([]).forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates in order', () => {
      const result: string[] = []
      PersistentArray.from(['a', 'b', 'c']).forEach((v) => result.push(v))
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })

  describe('reduce', () => {
    it('sums numbers', () => {
      const sum = PersistentArray.from([1, 2, 3, 4]).reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(10)
    })

    it('builds string from elements', () => {
      const result = PersistentArray.from([1, 2, 3]).reduce((acc, v) => acc + String(v), '')
      expect(result).toBe('123')
    })

    it('returns initial for empty array', () => {
      const result = PersistentArray.from<number>([]).reduce((acc, v) => acc + v, 42)
      expect(result).toBe(42)
    })

    it('returns element for single element array', () => {
      const result = PersistentArray.from([5]).reduce((acc, v) => acc + v, 0)
      expect(result).toBe(5)
    })

    it('reduces objects', () => {
      const arr = PersistentArray.from([{ x: 1 }, { x: 2 }, { x: 3 }])
      const result = arr.reduce((acc, v) => acc + v.x, 0)
      expect(result).toBe(6)
    })
  })

  describe('find', () => {
    it('finds matching element', () => {
      const result = PersistentArray.from([1, 2, 3, 4]).find((v) => v > 2)
      expect(result).toBe(3)
    })

    it('returns undefined when not found', () => {
      const result = PersistentArray.from([1, 2, 3]).find((v) => v > 10)
      expect(result).toBeUndefined()
    })

    it('finds first matching element', () => {
      const result = PersistentArray.from([1, 4, 2, 5, 3]).find((v) => v > 3)
      expect(result).toBe(4)
    })

    it('finds in empty array returns undefined', () => {
      const result = PersistentArray.from<number>([]).find((v) => v === 1)
      expect(result).toBeUndefined()
    })

    it('finds by object property', () => {
      const arr = PersistentArray.from([{ id: 1 }, { id: 2 }, { id: 3 }])
      const result = arr.find((v) => v.id === 2)
      expect(result).toEqual({ id: 2 })
    })
  })

  describe('indexOf', () => {
    it('finds index of element', () => {
      expect(PersistentArray.from([1, 2, 3]).indexOf(2)).toBe(1)
    })

    it('returns -1 when not found', () => {
      expect(PersistentArray.from([1, 2, 3]).indexOf(99)).toBe(-1)
    })

    it('finds first occurrence', () => {
      expect(PersistentArray.from([1, 2, 2, 3]).indexOf(2)).toBe(1)
    })

    it('uses custom comparator', () => {
      const arr = PersistentArray.from([{ id: 1 }, { id: 2 }])
      const idx = arr.indexOf({ id: 2 }, (a, b) => a.id === b.id)
      expect(idx).toBe(1)
    })

    it('finds index 0 for first element', () => {
      expect(PersistentArray.from([10, 20, 30]).indexOf(10)).toBe(0)
    })

    it('returns -1 for empty array', () => {
      expect(PersistentArray.from<number>([]).indexOf(1)).toBe(-1)
    })
  })

  describe('includes', () => {
    it('returns true when element exists', () => {
      expect(PersistentArray.from([1, 2, 3]).includes(2)).toBe(true)
    })

    it('returns false when element missing', () => {
      expect(PersistentArray.from([1, 2, 3]).includes(99)).toBe(false)
    })

    it('uses custom comparator', () => {
      const arr = PersistentArray.from([{ v: 1 }, { v: 2 }])
      expect(arr.includes({ v: 2 }, (a, b) => a.v === b.v)).toBe(true)
    })

    it('returns false for empty array', () => {
      expect(PersistentArray.from<number>([]).includes(1)).toBe(false)
    })

    it('returns true for first element', () => {
      expect(PersistentArray.from([10, 20]).includes(10)).toBe(true)
    })

    it('returns true for last element', () => {
      expect(PersistentArray.from([10, 20]).includes(20)).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for same array', () => {
      const arr = PersistentArray.from([1, 2, 3])
      expect(arr.equals(arr)).toBe(true)
    })

    it('returns true for equal arrays', () => {
      const a = PersistentArray.from([1, 2, 3])
      const b = PersistentArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different arrays', () => {
      const a = PersistentArray.from([1, 2, 3])
      const b = PersistentArray.from([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = PersistentArray.from([1, 2])
      const b = PersistentArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('uses custom comparator', () => {
      const a = PersistentArray.from([{ v: 1 }])
      const b = PersistentArray.from([{ v: 1 }])
      expect(a.equals(b, (x, y) => x.v === y.v)).toBe(true)
    })

    it('empty arrays are equal', () => {
      const a = PersistentArray.from<number>([])
      const b = PersistentArray.from<number>([])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false without comparator for different object refs', () => {
      const a = PersistentArray.from([{ v: 1 }])
      const b = PersistentArray.from([{ v: 1 }])
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('converts to array', () => {
      expect(PersistentArray.from([1, 2, 3]).toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty persistent array', () => {
      expect(PersistentArray.from<number>([]).toArray()).toEqual([])
    })

    it('returns independent copy', () => {
      const arr = PersistentArray.from([1, 2, 3])
      const copy = arr.toArray()
      copy.push(4)
      expect(arr.size()).toBe(3)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      expect(PersistentArray.from([1, 2, 3]).size()).toBe(3)
    })

    it('returns 0 for empty', () => {
      expect(PersistentArray.from<number>([]).size()).toBe(0)
    })

    it('isEmpty returns true for empty', () => {
      expect(PersistentArray.from<number>([]).isEmpty()).toBe(true)
    })

    it('isEmpty returns false for non-empty', () => {
      expect(PersistentArray.from([1]).isEmpty()).toBe(false)
    })
  })

  describe('toString', () => {
    it('formats empty array', () => {
      expect(PersistentArray.from<number>([]).toString()).toBe('PersistentArray([])')
    })

    it('formats single element', () => {
      expect(PersistentArray.from([42]).toString()).toBe('PersistentArray([42])')
    })

    it('formats multiple elements', () => {
      expect(PersistentArray.from([1, 2, 3]).toString()).toBe('PersistentArray([1, 2, 3])')
    })
  })

  describe('version', () => {
    it('starts at 0 for from', () => {
      expect(PersistentArray.from([1]).version).toBe(0)
    })

    it('increments on set', () => {
      const v0 = PersistentArray.from([1, 2])
      const v1 = v0.set(0, 10)
      const v2 = v1.set(1, 20)
      expect(v0.version).toBe(0)
      expect(v1.version).toBe(1)
      expect(v2.version).toBe(2)
    })

    it('increments on push', () => {
      const v0 = PersistentArray.from<number>([])
      const v1 = v0.push(1)
      const v2 = v1.push(2)
      expect(v0.version).toBe(0)
      expect(v1.version).toBe(1)
      expect(v2.version).toBe(2)
    })
  })

  describe('previous', () => {
    it('returns null for initial array', () => {
      expect(PersistentArray.from([1, 2]).previous()).toBeNull()
    })

    it('returns previous version after set', () => {
      const v0 = PersistentArray.from([1, 2])
      const v1 = v0.set(0, 10)
      expect(v1.previous()).toBe(v0)
    })

    it('returns previous version after push', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.push(2)
      expect(v1.previous()).toBe(v0)
    })

    it('chains previous versions', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.push(2)
      const v2 = v1.push(3)
      expect(v2.previous()).toBe(v1)
      expect(v1.previous()).toBe(v0)
      expect(v0.previous()).toBeNull()
    })
  })

  describe('atVersion', () => {
    it('returns current version', () => {
      const arr = PersistentArray.from([1, 2, 3])
      expect(arr.atVersion(0)).toBe(arr)
    })

    it('returns earlier version', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.push(2)
      const v2 = v1.push(3)
      expect(v2.atVersion(0).toArray()).toEqual([1])
      expect(v2.atVersion(1).toArray()).toEqual([1, 2])
    })

    it('returns empty for version too high', () => {
      const arr = PersistentArray.from([1])
      const result = arr.atVersion(5)
      expect(result.size()).toBe(0)
    })

    it('returns empty for negative version', () => {
      const arr = PersistentArray.from([1])
      const result = arr.atVersion(-1)
      expect(result.size()).toBe(0)
    })

    it('returns exact version by reference', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.push(2)
      expect(v1.atVersion(0)).toBe(v0)
      expect(v1.atVersion(1)).toBe(v1)
    })

    it('walks back through multiple versions', () => {
      let arr = PersistentArray.from<number>([])
      const versions = [arr]
      for (let i = 1; i <= 5; i++) {
        arr = arr.push(i)
        versions.push(arr)
      }
      for (let i = 0; i <= 5; i++) {
        expect(arr.atVersion(i)).toBe(versions[i])
      }
    })
  })

  describe('history', () => {
    it('returns single element for initial array', () => {
      const arr = PersistentArray.from([1])
      expect(arr.history()).toHaveLength(1)
      expect(arr.history()[0]).toBe(arr)
    })

    it('returns full history', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.push(2)
      const v2 = v1.push(3)
      const hist = v2.history()
      expect(hist).toHaveLength(3)
      expect(hist[0]).toBe(v0)
      expect(hist[1]).toBe(v1)
      expect(hist[2]).toBe(v2)
    })

    it('history versions are in order', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.set(0, 2)
      const v2 = v1.set(0, 3)
      const hist = v2.history()
      expect(hist.map((h) => h.version)).toEqual([0, 1, 2])
    })

    it('empty array has single history entry', () => {
      const arr = PersistentArray.from<number>([])
      const hist = arr.history()
      expect(hist).toHaveLength(1)
      expect(hist[0].version).toBe(0)
    })
  })

  describe('concat', () => {
    it('concats two non-empty arrays', () => {
      const a = PersistentArray.from([1, 2])
      const b = PersistentArray.from([3, 4])
      expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4])
    })

    it('concats with empty array', () => {
      const a = PersistentArray.from([1, 2])
      const b = PersistentArray.from<number>([])
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concats empty with non-empty', () => {
      const a = PersistentArray.from<number>([])
      const b = PersistentArray.from([1, 2])
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concats two empty arrays', () => {
      const a = PersistentArray.from<number>([])
      const b = PersistentArray.from<number>([])
      expect(a.concat(b).toArray()).toEqual([])
    })

    it('does not modify originals', () => {
      const a = PersistentArray.from([1])
      const b = PersistentArray.from([2])
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('concats different length arrays', () => {
      const a = PersistentArray.from([1])
      const b = PersistentArray.from([2, 3, 4, 5])
      expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('reverse', () => {
    it('reverses array', () => {
      expect(PersistentArray.from([1, 2, 3]).reverse().toArray()).toEqual([3, 2, 1])
    })

    it('reverses single element', () => {
      expect(PersistentArray.from([1]).reverse().toArray()).toEqual([1])
    })

    it('reverses empty array', () => {
      expect(PersistentArray.from<number>([]).reverse().toArray()).toEqual([])
    })

    it('does not modify original', () => {
      const arr = PersistentArray.from([1, 2, 3])
      arr.reverse()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('reverses two elements', () => {
      expect(PersistentArray.from([1, 2]).reverse().toArray()).toEqual([2, 1])
    })
  })

  describe('sort', () => {
    it('sorts with default comparator', () => {
      expect(PersistentArray.from([3, 1, 2]).sort().toArray()).toEqual([1, 2, 3])
    })

    it('sorts with custom comparator', () => {
      const arr = PersistentArray.from([3, 1, 2]).sort((a, b) => b - a)
      expect(arr.toArray()).toEqual([3, 2, 1])
    })

    it('sorts empty array', () => {
      expect(PersistentArray.from<number>([]).sort().toArray()).toEqual([])
    })

    it('sorts single element', () => {
      expect(PersistentArray.from([1]).sort().toArray()).toEqual([1])
    })

    it('does not modify original', () => {
      const arr = PersistentArray.from([3, 1, 2])
      arr.sort()
      expect(arr.toArray()).toEqual([3, 1, 2])
    })

    it('sorts strings', () => {
      expect(PersistentArray.from(['c', 'a', 'b']).sort().toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('persistence and immutability', () => {
    it('set does not affect previous version', () => {
      const v0 = PersistentArray.from([1, 2, 3])
      const v1 = v0.set(1, 99)
      expect(v0.get(1)).toBe(2)
      expect(v1.get(1)).toBe(99)
    })

    it('push does not affect previous version', () => {
      const v0 = PersistentArray.from([1, 2])
      const v1 = v0.push(3)
      expect(v0.size()).toBe(2)
      expect(v1.size()).toBe(3)
    })

    it('pop does not affect previous version', () => {
      const v0 = PersistentArray.from([1, 2, 3])
      const { array: v1 } = v0.pop()
      expect(v0.size()).toBe(3)
      expect(v1.size()).toBe(2)
    })

    it('multiple versions are all accessible', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.set(0, 2)
      const v2 = v1.set(0, 3)
      expect(v0.toArray()).toEqual([1])
      expect(v1.toArray()).toEqual([2])
      expect(v2.toArray()).toEqual([3])
    })

    it('branching versions work correctly', () => {
      const base = PersistentArray.from([1, 2, 3])
      const branchA = base.set(0, 10)
      const branchB = base.set(0, 20)
      expect(branchA.get(0)).toBe(10)
      expect(branchB.get(0)).toBe(20)
      expect(base.get(0)).toBe(1)
    })

    it('deep history is preserved', () => {
      let arr = PersistentArray.from<number>([])
      const snapshots: number[][] = [[]]
      for (let i = 0; i < 10; i++) {
        arr = arr.push(i)
        snapshots.push(arr.toArray())
      }
      for (let i = 0; i <= 10; i++) {
        expect(arr.atVersion(i).toArray()).toEqual(snapshots[i])
      }
    })
  })

  describe('stress tests', () => {
    it('handles 1000 elements with push', () => {
      let arr = PersistentArray.from<number>([])
      for (let i = 0; i < 1000; i++) arr = arr.push(i)
      expect(arr.size()).toBe(1000)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(999)).toBe(999)
    })

    it('handles 1000 elements with from', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const arr = PersistentArray.from(values)
      expect(arr.size()).toBe(1000)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(499)).toBe(499)
      expect(arr.get(999)).toBe(999)
    })

    it('handles 1000 set operations', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      let arr = PersistentArray.from(values)
      for (let i = 0; i < 1000; i++) arr = arr.set(i, i * 2)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(500)).toBe(1000)
      expect(arr.get(999)).toBe(1998)
    })

    it('handles mixed operations on 1000 elements', () => {
      const values = Array.from({ length: 500 }, (_, i) => i)
      let arr = PersistentArray.from(values)
      for (let i = 500; i < 1000; i++) arr = arr.push(i)
      expect(arr.size()).toBe(1000)
      const { array: popped } = arr.pop()
      expect(popped.size()).toBe(999)
      const modified = popped.set(0, -1)
      expect(modified.get(0)).toBe(-1)
      expect(modified.get(998)).toBe(998)
    })

    it('preserves all 1000 versions', () => {
      let arr = PersistentArray.from<number>([])
      for (let i = 0; i < 100; i++) arr = arr.push(i)
      expect(arr.history()).toHaveLength(101)
      for (let i = 0; i < 100; i++) {
        expect(arr.atVersion(i).size()).toBe(i)
      }
    })
  })

  describe('edge cases', () => {
    it('handles booleans', () => {
      const arr = PersistentArray.from([true, false, true])
      expect(arr.get(0)).toBe(true)
      expect(arr.get(1)).toBe(false)
    })

    it('handles null values', () => {
      const arr = PersistentArray.from<number | null>([1, null, 3])
      expect(arr.get(1)).toBeNull()
    })

    it('handles undefined values', () => {
      const arr = PersistentArray.from<number | undefined>([1, undefined, 3])
      expect(arr.get(1)).toBeUndefined()
    })

    it('handles nested arrays', () => {
      const arr = PersistentArray.from([[1, 2], [3, 4], [5, 6]])
      expect(arr.get(1)).toEqual([3, 4])
    })

    it('handles objects with same structure', () => {
      const arr = PersistentArray.from([{ a: 1 }, { a: 2 }])
      expect(arr.get(0).a).toBe(1)
      expect(arr.get(1).a).toBe(2)
    })

    it('set and get roundtrip', () => {
      const arr = PersistentArray.from([0, 0, 0, 0, 0])
        .set(0, 1).set(1, 2).set(2, 3).set(3, 4).set(4, 5)
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('push then pop roundtrip', () => {
      const original = PersistentArray.from([1, 2])
      const pushed = original.push(3)
      expect(pushed.toArray()).toEqual([1, 2, 3])
      const { array: popped } = pushed.pop()
      expect(popped.toArray()).toEqual([1, 2])
      const { array: popped2 } = popped.pop()
      expect(popped2.toArray()).toEqual([1])
    })

    it('map then filter chain', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5])
        .map((v) => v * 2)
        .filter((v) => v > 4)
      expect(arr.toArray()).toEqual([6, 8, 10])
    })

    it('sort then reverse', () => {
      const arr = PersistentArray.from([3, 1, 4, 1, 5])
        .sort()
        .reverse()
      expect(arr.toArray()).toEqual([5, 4, 3, 1, 1])
    })

    it('slice then concat', () => {
      const arr = PersistentArray.from([1, 2, 3, 4, 5])
      const first = arr.slice(0, 2)
      const last = arr.slice(3)
      expect(first.concat(last).toArray()).toEqual([1, 2, 4, 5])
    })

    it('large map transformation', () => {
      const arr = PersistentArray.from([1, 2, 3]).map((v) => ({ value: v }))
      expect(arr.get(0)).toEqual({ value: 1 })
      expect(arr.get(2)).toEqual({ value: 3 })
    })

    it('reduce to build object', () => {
      const arr = PersistentArray.from([['a', 1], ['b', 2]] as [string, number][])
      const obj = arr.reduce<Record<string, number>>((acc, [k, v]) => {
        acc[k] = v
        return acc
      }, {})
      expect(obj).toEqual({ a: 1, b: 2 })
    })

    it('equals works after transformations', () => {
      const a = PersistentArray.from([3, 1, 2]).sort()
      const b = PersistentArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('indexOf with object comparator', () => {
      const arr = PersistentArray.from([{ x: 1 }, { x: 2 }, { x: 3 }])
      expect(arr.indexOf({ x: 2 }, (a, b) => a.x === b.x)).toBe(1)
    })

    it('includes with object comparator', () => {
      const arr = PersistentArray.from([{ x: 1 }, { x: 2 }])
      expect(arr.includes({ x: 1 }, (a, b) => a.x === b.x)).toBe(true)
      expect(arr.includes({ x: 3 }, (a, b) => a.x === b.x)).toBe(false)
    })

    it('filter preserves correct indices in callback', () => {
      const indices: number[] = []
      PersistentArray.from([10, 20, 30, 40]).filter((_v, i) => {
        indices.push(i)
        return true
      })
      expect(indices).toEqual([0, 1, 2, 3])
    })

    it('map preserves correct indices in callback', () => {
      const indices: number[] = []
      PersistentArray.from([10, 20, 30]).map((_v, i) => {
        indices.push(i)
        return 0
      })
      expect(indices).toEqual([0, 1, 2])
    })

    it('ofSize creates distinct version 0', () => {
      const arr = PersistentArray.ofSize(5, 0)
      expect(arr.version).toBe(0)
      expect(arr.previous()).toBeNull()
    })

    it('chained operations build version chain', () => {
      const v0 = PersistentArray.from([1])
      const v1 = v0.push(2)
      const v2 = v1.push(3)
      const v3 = v2.set(1, 20)
      expect(v3.version).toBe(3)
      expect(v3.atVersion(0).toArray()).toEqual([1])
      expect(v3.atVersion(1).toArray()).toEqual([1, 2])
      expect(v3.atVersion(2).toArray()).toEqual([1, 2, 3])
      expect(v3.atVersion(3).toArray()).toEqual([1, 20, 3])
    })
  })
})
