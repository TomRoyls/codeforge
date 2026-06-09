import { describe, it, expect } from 'vitest'
import { ChunkedArray, DEFAULT_CHUNK_SIZE } from '../../src/core/chunked-array/index.js'

describe('ChunkedArray', () => {
  describe('constructor', () => {
    it('creates empty array with default chunk size', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.size).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.chunkSize).toBe(DEFAULT_CHUNK_SIZE)
      expect(arr.chunkCount).toBe(0)
    })

    it('creates array with custom chunk size', () => {
      const arr = new ChunkedArray<number>(4)
      expect(arr.chunkSize).toBe(4)
    })

    it('creates array with options object', () => {
      const arr = new ChunkedArray<number>({ chunkSize: 8 })
      expect(arr.chunkSize).toBe(8)
    })

    it('uses default when chunk size is undefined', () => {
      const arr = new ChunkedArray<number>(undefined)
      expect(arr.chunkSize).toBe(DEFAULT_CHUNK_SIZE)
    })

    it('clamps chunk size to 1', () => {
      const arr = new ChunkedArray<number>(0)
      expect(arr.chunkSize).toBe(1)
    })

    it('clamps negative chunk size to 1', () => {
      const arr = new ChunkedArray<number>(-5)
      expect(arr.chunkSize).toBe(1)
    })

    it('handles empty options object', () => {
      const arr = new ChunkedArray<number>({})
      expect(arr.chunkSize).toBe(DEFAULT_CHUNK_SIZE)
    })

    it('handles options with undefined chunkSize', () => {
      const arr = new ChunkedArray<number>({ chunkSize: undefined })
      expect(arr.chunkSize).toBe(DEFAULT_CHUNK_SIZE)
    })
  })

  describe('push', () => {
    it('pushes a value and returns new size', () => {
      const arr = new ChunkedArray<number>(4)
      expect(arr.push(1)).toBe(1)
      expect(arr.push(2)).toBe(2)
      expect(arr.size).toBe(2)
    })

    it('fills first chunk to capacity', () => {
      const arr = new ChunkedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.chunkCount).toBe(1)
      expect(arr.size).toBe(3)
    })

    it('creates new chunk when current is full', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      expect(arr.chunkCount).toBe(1)
      arr.push(3)
      expect(arr.chunkCount).toBe(2)
    })

    it('pushes many elements across chunks', () => {
      const arr = new ChunkedArray<number>(3)
      for (let i = 0; i < 10; i++) arr.push(i)
      expect(arr.size).toBe(10)
      expect(arr.chunkCount).toBe(4)
    })

    it('pushes to empty array', () => {
      const arr = new ChunkedArray<number>()
      arr.push(42)
      expect(arr.get(0)).toBe(42)
      expect(arr.chunkCount).toBe(1)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.pop()).toBeUndefined()
    })

    it('pops last element', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.size).toBe(2)
    })

    it('removes empty chunks after pop', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.chunkCount).toBe(2)
      arr.pop()
      expect(arr.chunkCount).toBe(1)
      arr.pop()
      expect(arr.chunkCount).toBe(1)
      arr.pop()
      expect(arr.chunkCount).toBe(0)
    })

    it('pops all elements to empty', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
      expect(arr.isEmpty()).toBe(true)
    })

    it('maintains order after interleaved push/pop', () => {
      const arr = new ChunkedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.pop()
      arr.push(3)
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 3, 4])
    })
  })

  describe('unshift', () => {
    it('unshifts to empty array', () => {
      const arr = new ChunkedArray<number>()
      arr.unshift(1)
      expect(arr.get(0)).toBe(1)
      expect(arr.size).toBe(1)
    })

    it('unshifts returns new size', () => {
      const arr = new ChunkedArray<number>(4)
      expect(arr.unshift(1)).toBe(1)
      expect(arr.unshift(2)).toBe(2)
    })

    it('uses first chunk when room available', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.unshift(0)
      expect(arr.chunkCount).toBe(1)
      expect(arr.toArray()).toEqual([0, 1])
    })

    it('creates new chunk when first is full', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      expect(arr.chunkCount).toBe(1)
      arr.unshift(0)
      expect(arr.chunkCount).toBe(2)
    })

    it('unshifts multiple elements', () => {
      const arr = new ChunkedArray<number>(3)
      arr.unshift(3)
      arr.unshift(2)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('shift', () => {
    it('returns undefined on empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.shift()).toBeUndefined()
    })

    it('shifts first element', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.shift()).toBe(1)
      expect(arr.size).toBe(2)
      expect(arr.get(0)).toBe(2)
    })

    it('removes empty chunks after shift', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.shift()
      arr.shift()
      expect(arr.toArray()).toEqual([3, 4])
    })

    it('shifts all elements to empty', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      expect(arr.shift()).toBe(1)
      expect(arr.shift()).toBe(2)
      expect(arr.isEmpty()).toBe(true)
    })

    it('maintains order after interleaved unshift/shift', () => {
      const arr = new ChunkedArray<number>(3)
      arr.unshift(1)
      arr.unshift(2)
      arr.shift()
      arr.unshift(3)
      expect(arr.toArray()).toEqual([3, 1])
    })
  })

  describe('get', () => {
    it('returns undefined for negative index', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(arr.get(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(arr.get(1)).toBeUndefined()
    })

    it('returns undefined for empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.get(0)).toBeUndefined()
    })

    it('gets elements from first chunk', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('gets elements across chunks', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(3)
      expect(arr.get(3)).toBe(4)
    })

    it('gets elements at chunk boundaries', () => {
      const arr = new ChunkedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.get(2)).toBe(3)
      expect(arr.get(3)).toBe(4)
    })

    it('gets from large array', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 100; i++) arr.push(i)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(50)).toBe(50)
      expect(arr.get(99)).toBe(99)
    })
  })

  describe('set', () => {
    it('throws on negative index', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(() => arr.set(-1, 10)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(() => arr.set(1, 10)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(() => arr.set(0, 1)).toThrow(RangeError)
    })

    it('sets value in first chunk', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.set(0, 100)
      expect(arr.get(0)).toBe(100)
    })

    it('sets value across chunks', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.set(2, 300)
      expect(arr.get(2)).toBe(300)
    })

    it('sets value at last element', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 10; i++) arr.push(i)
      arr.set(9, 999)
      expect(arr.get(9)).toBe(999)
    })

    it('preserves other elements on set', () => {
      const arr = new ChunkedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.set(1, 200)
      expect(arr.toArray()).toEqual([1, 200, 3])
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.insert(0, 0)
      expect(arr.toArray()).toEqual([0, 1, 2])
    })

    it('inserts at end', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.insert(2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(3)
      arr.insert(1, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('throws on negative index', () => {
      const arr = new ChunkedArray<number>()
      expect(() => arr.insert(-1, 1)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const arr = new ChunkedArray<number>()
      arr.push(1)
      expect(() => arr.insert(2, 1)).toThrow(RangeError)
    })

    it('allows insert at length', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.insert(1, 2)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('splits chunk when full on insert', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.insert(1, 99)
      expect(arr.toArray()).toEqual([1, 99, 2, 3, 4])
    })

    it('inserts into empty array at index 0', () => {
      const arr = new ChunkedArray<number>(4)
      arr.insert(0, 42)
      expect(arr.toArray()).toEqual([42])
      expect(arr.size).toBe(1)
    })
  })

  describe('delete', () => {
    it('returns undefined for negative index', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(arr.delete(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(arr.delete(1)).toBeUndefined()
    })

    it('returns undefined for empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.delete(0)).toBeUndefined()
    })

    it('deletes from beginning', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.delete(0)).toBe(1)
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('deletes from end', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.delete(2)).toBe(3)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('deletes from middle', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.delete(1)).toBe(2)
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('removes empty chunks after delete', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.delete(0)
      arr.delete(0)
      expect(arr.chunkCount).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('deletes across chunks', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.delete(1)
      expect(arr.toArray()).toEqual([1, 3, 4])
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.indexOf(1)).toBe(-1)
    })

    it('returns -1 when not found', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('finds element in first chunk', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(10)
      arr.push(20)
      expect(arr.indexOf(10)).toBe(0)
      expect(arr.indexOf(20)).toBe(1)
    })

    it('finds element across chunks', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.indexOf(3)).toBe(2)
      expect(arr.indexOf(4)).toBe(3)
    })

    it('finds first occurrence', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(1)
      expect(arr.indexOf(1)).toBe(0)
    })

    it('uses strict equality', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(arr.indexOf(1)).toBe(0)
    })

    it('finds objects by reference', () => {
      const obj = { x: 1 }
      const arr = new ChunkedArray<{ x: number }>(4)
      arr.push(obj)
      expect(arr.indexOf(obj)).toBe(0)
    })

    it('returns -1 for different object with same value', () => {
      const arr = new ChunkedArray<{ x: number }>(4)
      arr.push({ x: 1 })
      expect(arr.indexOf({ x: 1 })).toBe(-1)
    })
  })

  describe('includes', () => {
    it('returns false for empty array', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.includes(1)).toBe(false)
    })

    it('returns true when found', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.includes(1)).toBe(true)
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false when not found', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      expect(arr.includes(2)).toBe(false)
    })

    it('works across chunks', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.includes(3)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty ChunkedArray', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('returns elements in order', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns copy', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      const a = arr.toArray()
      a.push(3)
      expect(arr.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty array', () => {
      const arr = new ChunkedArray<number>()
      const items: number[] = []
      arr.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements with correct indices', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const items: { v: number; i: number }[] = []
      arr.forEach((v, i) => items.push({ v, i }))
      expect(items).toEqual([
        { v: 10, i: 0 },
        { v: 20, i: 1 },
        { v: 30, i: 2 },
      ])
    })

    it('iterates across chunks', () => {
      const arr = new ChunkedArray<number>(2)
      for (let i = 0; i < 6; i++) arr.push(i)
      const sum = arr.reduce((a, v) => a + v, 0)
      expect(sum).toBe(15)
    })
  })

  describe('map', () => {
    it('maps empty array', () => {
      const arr = new ChunkedArray<number>(4)
      const mapped = arr.map((v) => v * 2)
      expect(mapped.size).toBe(0)
    })

    it('maps values with indices', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const mapped = arr.map((v, i) => v + i)
      expect(mapped.toArray()).toEqual([1, 3, 5])
    })

    it('preserves chunk size', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      const mapped = arr.map((v) => v)
      expect(mapped.chunkSize).toBe(4)
    })

    it('maps to different type', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      const mapped = arr.map((v) => String(v))
      expect(mapped.toArray()).toEqual(['1', '2'])
    })
  })

  describe('filter', () => {
    it('filters empty array', () => {
      const arr = new ChunkedArray<number>(4)
      const filtered = arr.filter(() => true)
      expect(filtered.size).toBe(0)
    })

    it('filters elements', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('filter with index', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const filtered = arr.filter((_v, i) => i > 0)
      expect(filtered.toArray()).toEqual([20, 30])
    })

    it('returns all when all pass', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(2)
      arr.push(4)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty when none pass', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(3)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.isEmpty()).toBe(true)
    })
  })

  describe('reduce', () => {
    it('returns initial value for empty array', () => {
      const arr = new ChunkedArray<number>(4)
      expect(arr.reduce((a, v) => a + v, 0)).toBe(0)
    })

    it('sums values', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.reduce((a, v) => a + v, 0)).toBe(6)
    })

    it('reduces with index', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.reduce((a, _v, i) => a + i, 0)).toBe(3)
    })

    it('reduces to different type', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const result = arr.reduce(
        (acc, v) => ({ ...acc, [v]: true }),
        {} as Record<number, boolean>
      )
      expect(result).toEqual({ 1: true, 2: true, 3: true })
    })
  })

  describe('iterator', () => {
    it('iterates empty array', () => {
      const arr = new ChunkedArray<number>()
      const items = [...arr]
      expect(items).toEqual([])
    })

    it('iterates all elements', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect([...arr]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const items: number[] = []
      for (const v of arr) {
        items.push(v)
      }
      expect(items).toEqual([10, 20, 30])
    })
  })

  describe('clear', () => {
    it('clears empty array', () => {
      const arr = new ChunkedArray<number>()
      arr.clear()
      expect(arr.isEmpty()).toBe(true)
      expect(arr.chunkCount).toBe(0)
    })

    it('clears non-empty array', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.clear()
      expect(arr.isEmpty()).toBe(true)
      expect(arr.size).toBe(0)
      expect(arr.chunkCount).toBe(0)
    })

    it('allows operations after clear', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.clear()
      arr.push(2)
      expect(arr.toArray()).toEqual([2])
    })
  })

  describe('chunkCount', () => {
    it('returns 0 for empty', () => {
      const arr = new ChunkedArray<number>(4)
      expect(arr.chunkCount).toBe(0)
    })

    it('returns 1 for single chunk', () => {
      const arr = new ChunkedArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.chunkCount).toBe(1)
    })

    it('increases with elements', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      expect(arr.chunkCount).toBe(1)
      arr.push(2)
      expect(arr.chunkCount).toBe(1)
      arr.push(3)
      expect(arr.chunkCount).toBe(2)
      arr.push(4)
      expect(arr.chunkCount).toBe(2)
      arr.push(5)
      expect(arr.chunkCount).toBe(3)
    })
  })

  describe('chunkSize', () => {
    it('returns default chunk size', () => {
      const arr = new ChunkedArray<number>()
      expect(arr.chunkSize).toBe(DEFAULT_CHUNK_SIZE)
    })

    it('returns custom chunk size', () => {
      const arr = new ChunkedArray<number>(16)
      expect(arr.chunkSize).toBe(16)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const arr = new ChunkedArray<string>(3)
      arr.push('a')
      arr.push('b')
      arr.push('c')
      expect(arr.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('works with objects', () => {
      const arr = new ChunkedArray<{ id: number }>(2)
      arr.push({ id: 1 })
      arr.push({ id: 2 })
      expect(arr.get(0)!.id).toBe(1)
      expect(arr.get(1)!.id).toBe(2)
    })

    it('works with null values', () => {
      const arr = new ChunkedArray<number | null>(4)
      arr.push(1)
      arr.push(null)
      arr.push(3)
      expect(arr.get(1)).toBe(null)
    })

    it('works with undefined values', () => {
      const arr = new ChunkedArray<number | undefined>(4)
      arr.push(1)
      arr.push(undefined)
      arr.push(3)
      expect(arr.get(1)).toBe(undefined)
    })
  })

  describe('stress / integration', () => {
    it('handles large number of pushes', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 1000; i++) arr.push(i)
      expect(arr.size).toBe(1000)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(999)).toBe(999)
    })

    it('handles interleaved push and pop', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 100; i++) arr.push(i)
      for (let i = 0; i < 50; i++) arr.pop()
      expect(arr.size).toBe(50)
      expect(arr.get(49)).toBe(49)
    })

    it('handles interleaved unshift and shift', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 50; i++) arr.unshift(i)
      for (let i = 0; i < 25; i++) arr.shift()
      expect(arr.size).toBe(25)
    })

    it('handles mixed operations', () => {
      const arr = new ChunkedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.unshift(0)
      arr.insert(2, 99)
      arr.delete(1)
      expect(arr.toArray()).toEqual([0, 99, 2])
    })

    it('round-trip through toArray preserves data', () => {
      const arr = new ChunkedArray<number>(5)
      for (let i = 0; i < 50; i++) arr.push(i)
      const flat = arr.toArray()
      const arr2 = new ChunkedArray<number>(5)
      flat.forEach((v) => arr2.push(v))
      expect(arr2.toArray()).toEqual(flat)
    })

    it('maintains consistency after many deletes', () => {
      const arr = new ChunkedArray<number>(3)
      for (let i = 0; i < 9; i++) arr.push(i)
      arr.delete(0)
      arr.delete(0)
      arr.delete(0)
      arr.delete(0)
      expect(arr.size).toBe(5)
      expect(arr.toArray()).toEqual([4, 5, 6, 7, 8])
    })

    it('push and shift as queue', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 10; i++) arr.push(i)
      const dequeued: number[] = []
      while (!arr.isEmpty()) dequeued.push(arr.shift()!)
      expect(dequeued).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('unshift and pop as reverse queue', () => {
      const arr = new ChunkedArray<number>(4)
      for (let i = 0; i < 5; i++) arr.unshift(i)
      const result: number[] = []
      while (!arr.isEmpty()) result.push(arr.pop()!)
      expect(result).toEqual([0, 1, 2, 3, 4])
    })

    it('handles chunk size of 1', () => {
      const arr = new ChunkedArray<number>(1)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.chunkCount).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
      expect(arr.get(1)).toBe(2)
      arr.delete(1)
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('handles insert into full chunk with chunk size 2', () => {
      const arr = new ChunkedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.insert(1, 99)
      expect(arr.size).toBe(5)
      expect(arr.toArray()).toEqual([1, 99, 2, 3, 4])
    })

    it('set at exact chunk boundary', () => {
      const arr = new ChunkedArray<number>(3)
      for (let i = 0; i < 9; i++) arr.push(i)
      arr.set(3, 300)
      arr.set(6, 600)
      expect(arr.get(3)).toBe(300)
      expect(arr.get(6)).toBe(600)
    })

    it('get at exact chunk boundary', () => {
      const arr = new ChunkedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.get(3)).toBe(4)
    })

    it('DEFAULT_CHUNK_SIZE is 64', () => {
      expect(DEFAULT_CHUNK_SIZE).toBe(64)
    })
  })
})
