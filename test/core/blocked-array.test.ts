import { describe, it, expect, beforeEach } from 'vitest'
import { BlockedArray } from '../../src/core/blocked-array/blocked-array.js'
import { DEFAULT_BLOCK_SIZE } from '../../src/core/blocked-array/types.js'

describe('BlockedArray', () => {
  describe('constructor', () => {
    it('should create empty array with default block size', () => {
      const arr = new BlockedArray<number>()
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.blockSize()).toBe(DEFAULT_BLOCK_SIZE)
      expect(arr.blockCount()).toBe(0)
    })

    it('should create empty array with custom block size', () => {
      const arr = new BlockedArray<number>(16)
      expect(arr.blockSize()).toBe(16)
    })

    it('should create with block size 1', () => {
      const arr = new BlockedArray<number>(1)
      expect(arr.blockSize()).toBe(1)
    })

    it('should throw on block size 0', () => {
      expect(() => new BlockedArray<number>(0)).toThrow(RangeError)
    })

    it('should throw on negative block size', () => {
      expect(() => new BlockedArray<number>(-1)).toThrow(RangeError)
    })
  })

  describe('static from', () => {
    it('should create from empty array', () => {
      const arr = BlockedArray.from<number>([])
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('should create from single element', () => {
      const arr = BlockedArray.from([42])
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(42)
    })

    it('should create from multiple elements', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      expect(arr.size()).toBe(5)
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should create with custom block size', () => {
      const arr = BlockedArray.from([1, 2, 3], 2)
      expect(arr.blockSize()).toBe(2)
      expect(arr.blockCount()).toBe(2)
    })

    it('should create with default block size when not specified', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.blockSize()).toBe(DEFAULT_BLOCK_SIZE)
    })
  })

  describe('get', () => {
    it('should get element at index 0', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.get(0)).toBe(10)
    })

    it('should get element at last index', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.get(2)).toBe(30)
    })

    it('should get element at negative index', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.get(-1)).toBe(30)
      expect(arr.get(-2)).toBe(20)
      expect(arr.get(-3)).toBe(10)
    })

    it('should throw on out of bounds positive index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(() => arr.get(3)).toThrow(RangeError)
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('should throw on out of bounds negative index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(() => arr.get(-4)).toThrow(RangeError)
    })

    it('should throw on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(() => arr.get(0)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('should set element at index 0', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.set(0, 99)
      expect(arr.get(0)).toBe(99)
    })

    it('should set element at last index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.set(2, 99)
      expect(arr.get(2)).toBe(99)
    })

    it('should set element at negative index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.set(-1, 99)
      expect(arr.get(2)).toBe(99)
    })

    it('should throw on out of bounds set', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(() => arr.set(3, 99)).toThrow(RangeError)
    })

    it('should throw on set in empty array', () => {
      const arr = new BlockedArray<number>()
      expect(() => arr.set(0, 1)).toThrow(RangeError)
    })
  })

  describe('push', () => {
    it('should push single element', () => {
      const arr = new BlockedArray<number>()
      const result = arr.push(1)
      expect(result).toBe(1)
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('should push multiple elements', () => {
      const arr = new BlockedArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.size()).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('should push across block boundaries', () => {
      const arr = new BlockedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.blockCount()).toBe(1)
      arr.push(4)
      expect(arr.blockCount()).toBe(2)
      expect(arr.get(3)).toBe(4)
    })

    it('should push many elements creating multiple blocks', () => {
      const arr = new BlockedArray<number>(4)
      for (let i = 0; i < 20; i++) {
        arr.push(i)
      }
      expect(arr.size()).toBe(20)
      expect(arr.blockCount()).toBe(5)
    })
  })

  describe('pop', () => {
    it('should return undefined on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.pop()).toBeUndefined()
    })

    it('should pop last element', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.pop()).toBe(3)
      expect(arr.size()).toBe(2)
    })

    it('should pop all elements', () => {
      const arr = BlockedArray.from([1, 2])
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
      expect(arr.pop()).toBeUndefined()
      expect(arr.size()).toBe(0)
    })

    it('should pop across block boundaries', () => {
      const arr = new BlockedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.blockCount()).toBe(2)
      expect(arr.pop()).toBe(3)
      expect(arr.blockCount()).toBe(1)
      expect(arr.pop()).toBe(2)
      expect(arr.blockCount()).toBe(1)
      expect(arr.pop()).toBe(1)
      expect(arr.blockCount()).toBe(0)
    })

    it('should shrink block count when blocks empty', () => {
      const arr = new BlockedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.blockCount()).toBe(2)
      arr.pop()
      arr.pop()
      expect(arr.blockCount()).toBe(1)
    })
  })

  describe('shift', () => {
    it('should return undefined on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.shift()).toBeUndefined()
    })

    it('should shift first element', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.shift()).toBe(1)
      expect(arr.size()).toBe(2)
      expect(arr.get(0)).toBe(2)
    })

    it('should shift all elements', () => {
      const arr = BlockedArray.from([1, 2])
      expect(arr.shift()).toBe(1)
      expect(arr.shift()).toBe(2)
      expect(arr.shift()).toBeUndefined()
      expect(arr.size()).toBe(0)
    })

    it('should shift with small block size', () => {
      const arr = new BlockedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.shift()).toBe(1)
      expect(arr.size()).toBe(3)
    })
  })

  describe('unshift', () => {
    it('should unshift to empty array', () => {
      const arr = new BlockedArray<number>()
      const result = arr.unshift(1)
      expect(result).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('should unshift to non-empty array', () => {
      const arr = BlockedArray.from([2, 3])
      arr.unshift(1)
      expect(arr.size()).toBe(3)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(3)
    })

    it('should unshift multiple times', () => {
      const arr = new BlockedArray<number>()
      arr.unshift(3)
      arr.unshift(2)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('slice', () => {
    it('should slice entire array with no args', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const sliced = arr.slice()
      expect(sliced.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(sliced).not.toBe(arr)
    })

    it('should slice from start index', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      expect(arr.slice(2).toArray()).toEqual([3, 4, 5])
    })

    it('should slice with start and end', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      expect(arr.slice(1, 4).toArray()).toEqual([2, 3, 4])
    })

    it('should slice with negative indices', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      expect(arr.slice(-3, -1).toArray()).toEqual([3, 4])
    })

    it('should return empty for invalid range', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.slice(5, 7).toArray()).toEqual([])
    })

    it('should clamp negative end to 0', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.slice(0, -5).toArray()).toEqual([])
    })

    it('should preserve block size', () => {
      const arr = new BlockedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const sliced = arr.slice(0, 2)
      expect(sliced.blockSize()).toBe(4)
    })

    it('should not modify original', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.slice(0, 2)
      expect(arr.size()).toBe(3)
    })
  })

  describe('indexOf', () => {
    it('should find existing element', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.indexOf(20)).toBe(1)
    })

    it('should return -1 for missing element', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('should find first occurrence', () => {
      const arr = BlockedArray.from([1, 2, 3, 2, 1])
      expect(arr.indexOf(2)).toBe(1)
    })

    it('should find element with comparator', () => {
      const arr = BlockedArray.from([{ id: 1 }, { id: 2 }])
      expect(arr.indexOf({ id: 2 }, (a, b) => a.id === b.id)).toBe(1)
    })

    it('should return -1 with comparator no match', () => {
      const arr = BlockedArray.from([{ id: 1 }])
      expect(arr.indexOf({ id: 99 }, (a, b) => a.id === b.id)).toBe(-1)
    })

    it('should return -1 on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.indexOf(1)).toBe(-1)
    })
  })

  describe('includes', () => {
    it('should return true for existing element', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.includes(2)).toBe(true)
    })

    it('should return false for missing element', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.includes(99)).toBe(false)
    })

    it('should work with comparator', () => {
      const arr = BlockedArray.from([{ id: 1 }])
      expect(arr.includes({ id: 1 }, (a, b) => a.id === b.id)).toBe(true)
    })

    it('should return false on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.includes(1)).toBe(false)
    })
  })

  describe('forEach', () => {
    it('should iterate all elements', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const collected: number[] = []
      arr.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      const arr = BlockedArray.from([10, 20, 30])
      const indices: number[] = []
      arr.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate empty array', () => {
      const arr = new BlockedArray<number>()
      let count = 0
      arr.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('map', () => {
    it('should map elements', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const mapped = arr.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('should map to different type', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const mapped = arr.map((v) => String(v))
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })

    it('should provide correct indices', () => {
      const arr = BlockedArray.from([10, 20, 30])
      const mapped = arr.map((_v, i) => i)
      expect(mapped.toArray()).toEqual([0, 1, 2])
    })

    it('should return empty for empty array', () => {
      const arr = new BlockedArray<number>()
      const mapped = arr.map((v) => v * 2)
      expect(mapped.isEmpty()).toBe(true)
    })

    it('should preserve block size', () => {
      const arr = new BlockedArray<number>(8)
      arr.push(1)
      const mapped = arr.map((v) => v * 2)
      expect(mapped.blockSize()).toBe(8)
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('should filter all elements', () => {
      const arr = BlockedArray.from([1, 3, 5])
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('should filter none', () => {
      const arr = BlockedArray.from([2, 4, 6])
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('should provide correct indices', () => {
      const arr = BlockedArray.from([10, 20, 30])
      const indices: number[] = []
      arr.filter((_v, i) => {
        indices.push(i)
        return true
      })
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('reduce', () => {
    it('should sum elements', () => {
      const arr = BlockedArray.from([1, 2, 3, 4])
      expect(arr.reduce((acc, v) => acc + v, 0)).toBe(10)
    })

    it('should concatenate strings', () => {
      const arr = BlockedArray.from(['a', 'b', 'c'])
      expect(arr.reduce((acc, v) => acc + v, '')).toBe('abc')
    })

    it('should return initial for empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.reduce((acc, v) => acc + v, 0)).toBe(0)
    })

    it('should work with object accumulator', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const result = arr.reduce(
        (acc, v) => ({ sum: acc.sum + v, count: acc.count + 1 }),
        { sum: 0, count: 0 },
      )
      expect(result).toEqual({ sum: 6, count: 3 })
    })
  })

  describe('find', () => {
    it('should find matching element', () => {
      const arr = BlockedArray.from([1, 2, 3, 4])
      expect(arr.find((v) => v > 2)).toBe(3)
    })

    it('should return undefined when no match', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.find((v) => v > 10)).toBeUndefined()
    })

    it('should return undefined on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.find((v) => v > 0)).toBeUndefined()
    })
  })

  describe('reverse', () => {
    it('should reverse array', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const reversed = arr.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('should not modify original', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.reverse()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('should reverse single element', () => {
      const arr = BlockedArray.from([42])
      expect(arr.reverse().toArray()).toEqual([42])
    })

    it('should reverse empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.reverse().isEmpty()).toBe(true)
    })
  })

  describe('concat', () => {
    it('should concat two arrays', () => {
      const a = BlockedArray.from([1, 2])
      const b = BlockedArray.from([3, 4])
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concat with empty', () => {
      const a = BlockedArray.from([1, 2])
      const b = new BlockedArray<number>()
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should concat empty with non-empty', () => {
      const a = new BlockedArray<number>()
      const b = BlockedArray.from([1, 2])
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should not modify originals', () => {
      const a = BlockedArray.from([1])
      const b = BlockedArray.from([2])
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('should concat two empty arrays', () => {
      const a = new BlockedArray<number>()
      const b = new BlockedArray<number>()
      expect(a.concat(b).isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should convert to plain array', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty BlockedArray', () => {
      const arr = new BlockedArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('should return a copy', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const plain = arr.toArray()
      plain[0] = 99
      expect(arr.get(0)).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('should report size 0 for new array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('should update size after push', () => {
      const arr = new BlockedArray<number>()
      arr.push(1)
      expect(arr.size()).toBe(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('should update size after pop', () => {
      const arr = BlockedArray.from([1, 2])
      arr.pop()
      expect(arr.size()).toBe(1)
    })

    it('should update size after shift', () => {
      const arr = BlockedArray.from([1, 2])
      arr.shift()
      expect(arr.size()).toBe(1)
    })
  })

  describe('blockCount', () => {
    it('should be 0 for empty array', () => {
      const arr = new BlockedArray<number>(4)
      expect(arr.blockCount()).toBe(0)
    })

    it('should be 1 after first push', () => {
      const arr = new BlockedArray<number>(4)
      arr.push(1)
      expect(arr.blockCount()).toBe(1)
    })

    it('should increase when crossing block boundary', () => {
      const arr = new BlockedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.blockCount()).toBe(1)
      arr.push(4)
      expect(arr.blockCount()).toBe(2)
    })

    it('should calculate correctly for many elements', () => {
      const arr = new BlockedArray<number>(4)
      for (let i = 0; i < 13; i++) {
        arr.push(i)
      }
      expect(arr.blockCount()).toBe(4)
    })
  })

  describe('blockSize', () => {
    it('should return default block size', () => {
      const arr = new BlockedArray<number>()
      expect(arr.blockSize()).toBe(DEFAULT_BLOCK_SIZE)
    })

    it('should return custom block size', () => {
      const arr = new BlockedArray<number>(32)
      expect(arr.blockSize()).toBe(32)
    })
  })

  describe('toString', () => {
    it('should stringify elements', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.toString()).toBe('1,2,3')
    })

    it('should return empty string for empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.toString()).toBe('')
    })

    it('should stringify strings', () => {
      const arr = BlockedArray.from(['a', 'b', 'c'])
      expect(arr.toString()).toBe('a,b,c')
    })
  })

  describe('equals', () => {
    it('should return true for equal arrays', () => {
      const a = BlockedArray.from([1, 2, 3])
      const b = BlockedArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different arrays', () => {
      const a = BlockedArray.from([1, 2, 3])
      const b = BlockedArray.from([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('should return false for different sizes', () => {
      const a = BlockedArray.from([1, 2])
      const b = BlockedArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for equal empty arrays', () => {
      const a = new BlockedArray<number>()
      const b = new BlockedArray<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('should use comparator', () => {
      const a = BlockedArray.from([{ id: 1 }])
      const b = BlockedArray.from([{ id: 1 }])
      expect(a.equals(b, (x, y) => x.id === y.id)).toBe(true)
    })

    it('should return false with comparator for different elements', () => {
      const a = BlockedArray.from([{ id: 1 }])
      const b = BlockedArray.from([{ id: 2 }])
      expect(a.equals(b, (x, y) => x.id === y.id)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone array', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned).not.toBe(arr)
    })

    it('should clone empty array', () => {
      const arr = new BlockedArray<number>()
      const cloned = arr.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should be independent from original', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const cloned = arr.clone()
      arr.set(0, 99)
      expect(cloned.get(0)).toBe(1)
    })

    it('should preserve block size', () => {
      const arr = new BlockedArray<number>(16)
      arr.push(1)
      expect(arr.clone().blockSize()).toBe(16)
    })
  })

  describe('fill', () => {
    it('should fill entire array', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('should fill from start', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, 2)
      expect(arr.toArray()).toEqual([1, 2, 0, 0, 0])
    })

    it('should fill with start and end', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, 1, 4)
      expect(arr.toArray()).toEqual([1, 0, 0, 0, 5])
    })

    it('should fill with negative indices', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, -3, -1)
      expect(arr.toArray()).toEqual([1, 2, 0, 0, 5])
    })

    it('should handle fill beyond array length', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.fill(0, 0, 10)
      expect(arr.toArray()).toEqual([0, 0, 0])
    })

    it('should not fill on empty array', () => {
      const arr = new BlockedArray<number>()
      arr.fill(0)
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('splice', () => {
    it('should remove elements from start', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(0, 2)
      expect(removed.toArray()).toEqual([1, 2])
      expect(arr.toArray()).toEqual([3, 4, 5])
    })

    it('should remove elements from middle', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(2, 2)
      expect(removed.toArray()).toEqual([3, 4])
      expect(arr.toArray()).toEqual([1, 2, 5])
    })

    it('should remove elements from end', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(3, 2)
      expect(removed.toArray()).toEqual([4, 5])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('should remove with default deleteCount', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(1)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1])
    })

    it('should insert without removing', () => {
      const arr = BlockedArray.from([1, 3, 5])
      const removed = arr.splice(1, 0, 2, 4)
      expect(removed.toArray()).toEqual([])
      expect(arr.toArray()).toEqual([1, 2, 4, 3, 5])
    })

    it('should remove and insert', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(1, 2, 10, 20, 30)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1, 10, 20, 30, 4, 5])
    })

    it('should handle negative start', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(-2, 1)
      expect(removed.toArray()).toEqual([4])
      expect(arr.toArray()).toEqual([1, 2, 3, 5])
    })

    it('should handle start beyond length', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(10, 1, 4)
      expect(removed.toArray()).toEqual([])
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle deleteCount beyond remaining', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(1, 100)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1])
    })

    it('should splice at exact block boundary', () => {
      const arr = new BlockedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.push(6)
      const removed = arr.splice(3, 1)
      expect(removed.toArray()).toEqual([4])
      expect(arr.toArray()).toEqual([1, 2, 3, 5, 6])
    })

    it('should splice all elements', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(0)
      expect(removed.toArray()).toEqual([1, 2, 3])
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('block boundary edge cases', () => {
    it('should handle reading at exact block boundary', () => {
      const arr = new BlockedArray<number>(4)
      for (let i = 0; i < 12; i++) {
        arr.push(i)
      }
      expect(arr.get(0)).toBe(0)
      expect(arr.get(3)).toBe(3)
      expect(arr.get(4)).toBe(4)
      expect(arr.get(7)).toBe(7)
      expect(arr.get(8)).toBe(8)
      expect(arr.get(11)).toBe(11)
    })

    it('should handle writing at exact block boundary', () => {
      const arr = new BlockedArray<number>(4)
      for (let i = 0; i < 8; i++) {
        arr.push(i)
      }
      arr.set(3, 99)
      arr.set(4, 88)
      expect(arr.get(3)).toBe(99)
      expect(arr.get(4)).toBe(88)
    })

    it('should handle operations across many blocks', () => {
      const arr = new BlockedArray<number>(2)
      for (let i = 0; i < 100; i++) {
        arr.push(i)
      }
      expect(arr.size()).toBe(100)
      expect(arr.blockCount()).toBe(50)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(50)).toBe(50)
      expect(arr.get(99)).toBe(99)
    })
  })

  describe('stress test - 10000+ elements', () => {
    it('should push and read 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      expect(arr.size()).toBe(10000)
      expect(arr.blockCount()).toBe(Math.ceil(10000 / 64))
      expect(arr.get(0)).toBe(0)
      expect(arr.get(5000)).toBe(5000)
      expect(arr.get(9999)).toBe(9999)
    })

    it('should iterate 10000 elements with forEach', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      let sum = 0
      arr.forEach((v) => (sum += v))
      expect(sum).toBe(49995000)
    })

    it('should map 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      const mapped = arr.map((v) => v * 2)
      expect(mapped.size()).toBe(10000)
      expect(mapped.get(0)).toBe(0)
      expect(mapped.get(9999)).toBe(19998)
    })

    it('should filter 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.size()).toBe(5000)
    })

    it('should reduce 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(1)
      }
      expect(arr.reduce((acc, v) => acc + v, 0)).toBe(10000)
    })

    it('should pop all 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      for (let i = 9999; i >= 0; i--) {
        expect(arr.pop()).toBe(i)
      }
      expect(arr.isEmpty()).toBe(true)
      expect(arr.blockCount()).toBe(0)
    })

    it('should slice 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      const sliced = arr.slice(100, 200)
      expect(sliced.size()).toBe(100)
      expect(sliced.get(0)).toBe(100)
      expect(sliced.get(99)).toBe(199)
    })

    it('should reverse 1000 elements', () => {
      const arr = new BlockedArray<number>(32)
      for (let i = 0; i < 1000; i++) {
        arr.push(i)
      }
      const reversed = arr.reverse()
      expect(reversed.get(0)).toBe(999)
      expect(reversed.get(999)).toBe(0)
    })

    it('should concat two large arrays', () => {
      const a = new BlockedArray<number>(32)
      const b = new BlockedArray<number>(32)
      for (let i = 0; i < 5000; i++) {
        a.push(i)
        b.push(i + 5000)
      }
      const result = a.concat(b)
      expect(result.size()).toBe(10000)
      expect(result.get(0)).toBe(0)
      expect(result.get(9999)).toBe(9999)
    })

    it('should fill 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      arr.fill(42)
      for (let i = 0; i < 10000; i++) {
        expect(arr.get(i)).toBe(42)
      }
    })

    it('should splice 10000 elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      const removed = arr.splice(5000, 100)
      expect(removed.size()).toBe(100)
      expect(removed.get(0)).toBe(5000)
      expect(arr.size()).toBe(9900)
    })

    it('should handle indexOf on large array', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      expect(arr.indexOf(7500)).toBe(7500)
      expect(arr.indexOf(99999)).toBe(-1)
    })

    it('should handle equals on large arrays', () => {
      const a = new BlockedArray<number>(64)
      const b = new BlockedArray<number>(64)
      for (let i = 0; i < 1000; i++) {
        a.push(i)
        b.push(i)
      }
      expect(a.equals(b)).toBe(true)
      b.set(500, 999)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('type flexibility', () => {
    it('should work with strings', () => {
      const arr = BlockedArray.from(['hello', 'world'])
      expect(arr.get(0)).toBe('hello')
      expect(arr.get(1)).toBe('world')
    })

    it('should work with objects', () => {
      const arr = BlockedArray.from([{ x: 1 }, { x: 2 }])
      expect(arr.get(0).x).toBe(1)
      expect(arr.get(1).x).toBe(2)
    })

    it('should work with null values', () => {
      const arr = BlockedArray.from([1, null, 3] as (number | null)[])
      expect(arr.get(1)).toBeNull()
    })

    it('should work with undefined values', () => {
      const arr = BlockedArray.from([1, undefined, 3] as (number | undefined)[])
      expect(arr.get(1)).toBeUndefined()
    })

    it('should work with nested arrays', () => {
      const arr = BlockedArray.from([[1, 2], [3, 4], [5, 6]])
      expect(arr.get(1)).toEqual([3, 4])
    })

    it('should work with boolean values', () => {
      const arr = BlockedArray.from([true, false, true])
      expect(arr.filter((v) => v).size()).toBe(2)
    })

    it('should work with mixed number types', () => {
      const arr = BlockedArray.from([0, -1, 3.14, Number.MAX_SAFE_INTEGER])
      expect(arr.get(2)).toBeCloseTo(3.14)
      expect(arr.get(3)).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('mixed operations sequence', () => {
    it('should handle push-pop interleaved', () => {
      const arr = new BlockedArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 2, 4])
    })

    it('should handle shift-unshift interleaved', () => {
      const arr = BlockedArray.from([2, 3, 4])
      expect(arr.shift()).toBe(2)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 3, 4])
    })

    it('should handle splice then push', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.splice(1, 2)
      arr.push(6)
      expect(arr.toArray()).toEqual([1, 4, 5, 6])
    })

    it('should handle fill then get', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, 2, 4)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(0)
      expect(arr.get(3)).toBe(0)
      expect(arr.get(4)).toBe(5)
    })

    it('should handle reverse then splice', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const rev = arr.reverse()
      const removed = rev.splice(0, 2)
      expect(removed.toArray()).toEqual([5, 4])
      expect(rev.toArray()).toEqual([3, 2, 1])
    })

    it('should handle clone then modify original', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const cloned = arr.clone()
      arr.push(4)
      arr.set(0, 99)
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(arr.toArray()).toEqual([99, 2, 3, 4])
    })

    it('should handle concat then splice', () => {
      const a = BlockedArray.from([1, 2])
      const b = BlockedArray.from([3, 4])
      const c = a.concat(b)
      const removed = c.splice(1, 2)
      expect(removed.toArray()).toEqual([2, 3])
      expect(c.toArray()).toEqual([1, 4])
    })

    it('should handle map then filter then reduce', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const result = arr
        .map((v) => v * 2)
        .filter((v) => v > 4)
        .reduce((acc, v) => acc + v, 0)
      expect(result).toBe(6 + 8 + 10)
    })
  })
})
