import { describe, it, expect } from 'vitest'
import { TieredVector } from '../../src/core/tiered-vector/tiered-vector.js'
import { DEFAULT_TIERED_VECTOR_OPTIONS } from '../../src/core/tiered-vector/types.js'

describe('TieredVector', () => {
  describe('constructor', () => {
    it('creates empty vector with default options', () => {
      const tv = new TieredVector<number>()
      expect(tv.size).toBe(0)
      expect(tv.isEmpty()).toBe(true)
    })

    it('accepts options object with baseSize', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.size).toBe(0)
    })

    it('accepts empty options object', () => {
      const tv = new TieredVector<number>({})
      expect(tv.size).toBe(0)
    })

    it('clamps baseSize to 2 when given 0', () => {
      const tv = new TieredVector<number>({ baseSize: 0 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.pushBack(4)
      tv.pushBack(5)
      expect(tv.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('clamps baseSize to 2 when given negative', () => {
      const tv = new TieredVector<number>({ baseSize: -5 })
      tv.pushBack(1)
      tv.pushBack(2)
      expect(tv.toArray()).toEqual([1, 2])
    })

    it('floors fractional baseSize', () => {
      const tv = new TieredVector<number>({ baseSize: 3.7 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      expect(tv.size).toBe(10)
      expect(tv.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('uses DEFAULT_TIERED_VECTOR_OPTIONS constant', () => {
      expect(DEFAULT_TIERED_VECTOR_OPTIONS.baseSize).toBe(32)
    })

    it('creates vector with default base size when no args', () => {
      const tv = new TieredVector<number>()
      for (let i = 0; i < 32; i++) tv.pushBack(i)
      expect(tv.size).toBe(32)
    })

    it('handles baseSize of 2', () => {
      const tv = new TieredVector<number>({ baseSize: 2 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.pushBack(4)
      expect(tv.toArray()).toEqual([1, 2, 3, 4])
    })

    it('handles large baseSize', () => {
      const tv = new TieredVector<number>({ baseSize: 1000 })
      tv.pushBack(1)
      tv.pushBack(2)
      expect(tv.toArray()).toEqual([1, 2])
    })
  })

  describe('pushBack', () => {
    it('pushes a single element', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(10)
      expect(tv.size).toBe(1)
      expect(tv.get(0)).toBe(10)
    })

    it('pushes multiple elements', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('triggers tier split when exceeding 2*baseSize', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 9; i++) tv.pushBack(i)
      expect(tv.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
      const stats = tv.getStatistics()
      expect(stats.rebalances).toBeGreaterThan(0)
    })

    it('maintains order across many pushes', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 50; i++) tv.pushBack(i)
      const arr = tv.toArray()
      for (let i = 0; i < 50; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles string values', () => {
      const tv = new TieredVector<string>({ baseSize: 4 })
      tv.pushBack('a')
      tv.pushBack('b')
      tv.pushBack('c')
      expect(tv.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles undefined values', () => {
      const tv = new TieredVector<number | undefined>({ baseSize: 4 })
      tv.pushBack(undefined)
      tv.pushBack(1)
      tv.pushBack(undefined)
      expect(tv.get(0)).toBeUndefined()
      expect(tv.get(1)).toBe(1)
      expect(tv.get(2)).toBeUndefined()
    })

    it('handles object values', () => {
      const tv = new TieredVector<{ x: number }>({ baseSize: 4 })
      tv.pushBack({ x: 1 })
      tv.pushBack({ x: 2 })
      expect(tv.get(0)!.x).toBe(1)
      expect(tv.get(1)!.x).toBe(2)
    })

    it('tracks inserts statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.getStatistics().inserts).toBe(3)
    })

    it('pushes 100 elements correctly', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      expect(tv.size).toBe(100)
      expect(tv.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('popBack', () => {
    it('returns undefined on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.popBack()).toBeUndefined()
    })

    it('pops single element', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(42)
      expect(tv.popBack()).toBe(42)
      expect(tv.size).toBe(0)
    })

    it('pops elements in LIFO order', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.popBack()).toBe(3)
      expect(tv.popBack()).toBe(2)
      expect(tv.popBack()).toBe(1)
    })

    it('maintains order after pops', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      tv.popBack()
      tv.popBack()
      expect(tv.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('tracks deletes statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.popBack()
      tv.popBack()
      expect(tv.getStatistics().deletes).toBe(2)
    })

    it('handles pop to empty and re-push', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.popBack()
      expect(tv.isEmpty()).toBe(true)
      tv.pushBack(2)
      expect(tv.toArray()).toEqual([2])
    })

    it('pops all elements from large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      for (let i = 19; i >= 0; i--) {
        expect(tv.popBack()).toBe(i)
      }
      expect(tv.isEmpty()).toBe(true)
    })
  })

  describe('pushFront', () => {
    it('pushes to front of empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushFront(1)
      expect(tv.toArray()).toEqual([1])
    })

    it('pushes multiple elements to front', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushFront(3)
      tv.pushFront(2)
      tv.pushFront(1)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('maintains correct order with mixed pushFront/pushBack', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(2)
      tv.pushFront(1)
      tv.pushBack(3)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('handles many pushFront operations', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 9; i >= 0; i--) tv.pushFront(i)
      expect(tv.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('tracks inserts statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushFront(1)
      tv.pushFront(2)
      expect(tv.getStatistics().inserts).toBe(2)
    })
  })

  describe('popFront', () => {
    it('returns undefined on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.popFront()).toBeUndefined()
    })

    it('pops single element', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(42)
      expect(tv.popFront()).toBe(42)
      expect(tv.size).toBe(0)
    })

    it('pops elements in FIFO order', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.popFront()).toBe(1)
      expect(tv.popFront()).toBe(2)
      expect(tv.popFront()).toBe(3)
    })

    it('maintains order after popFront', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      tv.popFront()
      tv.popFront()
      expect(tv.toArray()).toEqual([2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('tracks deletes statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.popFront()
      expect(tv.getStatistics().deletes).toBe(1)
    })

    it('handles popFront to empty and re-push', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.popFront()
      expect(tv.isEmpty()).toBe(true)
      tv.pushBack(2)
      expect(tv.toArray()).toEqual([2])
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds negative index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.get(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.get(1)).toBeUndefined()
      expect(tv.get(100)).toBeUndefined()
    })

    it('returns element at valid index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(10)
      tv.pushBack(20)
      tv.pushBack(30)
      expect(tv.get(0)).toBe(10)
      expect(tv.get(1)).toBe(20)
      expect(tv.get(2)).toBe(30)
    })

    it('returns elements across tier boundaries', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      for (let i = 0; i < 20; i++) {
        expect(tv.get(i)).toBe(i)
      }
    })

    it('tracks accesses statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.get(0)
      tv.get(0)
      tv.get(0)
      expect(tv.getStatistics().accesses).toBe(3)
    })

    it('returns undefined on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.get(0)).toBeUndefined()
    })
  })

  describe('set', () => {
    it('throws RangeError for negative index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(() => tv.set(-1, 10)).toThrow(RangeError)
    })

    it('throws RangeError for out of bounds index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(() => tv.set(1, 10)).toThrow(RangeError)
      expect(() => tv.set(100, 10)).toThrow(RangeError)
    })

    it('sets value at valid index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.set(1, 99)
      expect(tv.get(1)).toBe(99)
    })

    it('sets value across tier boundaries', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      tv.set(0, 100)
      tv.set(10, 200)
      tv.set(19, 300)
      expect(tv.get(0)).toBe(100)
      expect(tv.get(10)).toBe(200)
      expect(tv.get(19)).toBe(300)
    })

    it('tracks accesses statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.set(0, 10)
      expect(tv.getStatistics().accesses).toBe(1)
    })

    it('throws on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(() => tv.set(0, 1)).toThrow(RangeError)
    })
  })

  describe('insertAt', () => {
    it('throws RangeError for negative index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(() => tv.insertAt(-1, 10)).toThrow(RangeError)
    })

    it('throws RangeError for index > size', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(() => tv.insertAt(1, 10)).toThrow(RangeError)
    })

    it('inserts at beginning', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(2)
      tv.pushBack(3)
      tv.insertAt(0, 1)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.insertAt(2, 3)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(3)
      tv.insertAt(1, 2)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty vector at index 0', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.insertAt(0, 42)
      expect(tv.toArray()).toEqual([42])
    })

    it('tracks inserts statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.insertAt(0, 1)
      tv.insertAt(1, 2)
      expect(tv.getStatistics().inserts).toBe(2)
    })

    it('maintains order with many inserts', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 5; i++) tv.pushBack(i * 2)
      tv.insertAt(1, 1)
      tv.insertAt(3, 3)
      tv.insertAt(5, 5)
      tv.insertAt(7, 7)
      expect(tv.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('removeAt', () => {
    it('returns undefined for negative index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.removeAt(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.removeAt(1)).toBeUndefined()
      expect(tv.removeAt(100)).toBeUndefined()
    })

    it('removes from beginning', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.removeAt(0)).toBe(1)
      expect(tv.toArray()).toEqual([2, 3])
    })

    it('removes from end', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.removeAt(2)).toBe(3)
      expect(tv.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.removeAt(1)).toBe(2)
      expect(tv.toArray()).toEqual([1, 3])
    })

    it('removes last element leaving empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(42)
      expect(tv.removeAt(0)).toBe(42)
      expect(tv.isEmpty()).toBe(true)
    })

    it('tracks deletes statistic', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.removeAt(0)
      expect(tv.getStatistics().deletes).toBe(1)
    })

    it('returns undefined on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.removeAt(0)).toBeUndefined()
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.size).toBe(0)
    })

    it('size increments on push', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.size).toBe(1)
      tv.pushBack(2)
      expect(tv.size).toBe(2)
    })

    it('size decrements on pop', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.popBack()
      expect(tv.size).toBe(1)
    })

    it('isEmpty returns true when empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.isEmpty()).toBe(true)
    })

    it('isEmpty returns false when not empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after clearing all elements', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.popBack()
      tv.popBack()
      expect(tv.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.clear()
      expect(tv.size).toBe(0)
      expect(tv.isEmpty()).toBe(true)
    })

    it('clears vector with elements', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      tv.clear()
      expect(tv.size).toBe(0)
      expect(tv.isEmpty()).toBe(true)
      expect(tv.toArray()).toEqual([])
    })

    it('allows operations after clear', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.clear()
      tv.pushBack(3)
      expect(tv.toArray()).toEqual([3])
    })

    it('clears large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      tv.clear()
      expect(tv.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct array after mixed operations', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.removeAt(1)
      tv.pushBack(4)
      expect(tv.toArray()).toEqual([1, 3, 4])
    })

    it('does not return reference to internal storage', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      const arr = tv.toArray()
      arr[0] = 99
      expect(tv.get(0)).toBe(1)
    })

    it('returns all elements for large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 50; i++) tv.pushBack(i)
      const arr = tv.toArray()
      expect(arr.length).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(arr[i]).toBe(i)
      }
    })
  })

  describe('forEach', () => {
    it('does nothing on empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      const values: number[] = []
      tv.forEach((v) => values.push(v))
      expect(values).toEqual([])
    })

    it('iterates all elements in order', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      const values: number[] = []
      tv.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(10)
      tv.pushBack(20)
      tv.pushBack(30)
      const indices: number[] = []
      tv.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates across tier boundaries', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      const values: number[] = []
      tv.forEach((v) => values.push(v))
      expect(values.length).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(values[i]).toBe(i)
      }
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect([...tv]).toEqual([])
    })

    it('iterates all elements in order', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect([...tv]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      const result: number[] = []
      for (const v of tv) {
        result.push(v)
      }
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('works with Array.from', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(Array.from(tv)).toEqual([1, 2, 3])
    })

    it('works with spread in function call', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(Math.max(...tv)).toBe(3)
    })
  })

  describe('at', () => {
    it('returns undefined for out of bounds', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      expect(tv.at(-1)).toBeUndefined()
      expect(tv.at(1)).toBeUndefined()
    })

    it('returns element at valid index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(10)
      tv.pushBack(20)
      expect(tv.at(0)).toBe(10)
      expect(tv.at(1)).toBe(20)
    })

    it('behaves identically to get', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      for (let i = 0; i < 10; i++) {
        expect(tv.at(i)).toBe(tv.get(i))
      }
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.indexOf(1)).toBe(-1)
    })

    it('returns -1 when value not found', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.indexOf(99)).toBe(-1)
    })

    it('returns index of found value', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(10)
      tv.pushBack(20)
      tv.pushBack(30)
      expect(tv.indexOf(20)).toBe(1)
    })

    it('returns first occurrence', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(1)
      expect(tv.indexOf(1)).toBe(0)
    })

    it('works across tier boundaries', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      expect(tv.indexOf(0)).toBe(0)
      expect(tv.indexOf(10)).toBe(10)
      expect(tv.indexOf(19)).toBe(19)
    })

    it('uses strict equality', () => {
      const tv = new TieredVector<string>({ baseSize: 4 })
      tv.pushBack('hello')
      tv.pushBack('world')
      expect(tv.indexOf('hello')).toBe(0)
      expect(tv.indexOf('world')).toBe(1)
    })
  })

  describe('includes', () => {
    it('returns false for empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.includes(1)).toBe(false)
    })

    it('returns false when value not found', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      expect(tv.includes(3)).toBe(false)
    })

    it('returns true when value found', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.includes(2)).toBe(true)
    })

    it('works across tier boundaries', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      expect(tv.includes(0)).toBe(true)
      expect(tv.includes(19)).toBe(true)
      expect(tv.includes(20)).toBe(false)
    })
  })

  describe('slice', () => {
    it('returns empty array for empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.slice()).toEqual([])
    })

    it('returns full array with no arguments', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.slice()).toEqual([1, 2, 3])
    })

    it('slices from start index', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.slice(1)).toEqual([2, 3])
    })

    it('slices with start and end', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.pushBack(4)
      tv.pushBack(5)
      expect(tv.slice(1, 4)).toEqual([2, 3, 4])
    })

    it('handles negative start', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.slice(-2)).toEqual([2, 3])
    })

    it('handles negative end', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.pushBack(4)
      tv.pushBack(5)
      expect(tv.slice(1, -1)).toEqual([2, 3, 4])
    })

    it('returns empty when start >= end', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.slice(2, 2)).toEqual([])
      expect(tv.slice(3, 1)).toEqual([])
    })

    it('clamps start and end to bounds', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.slice(-10, 10)).toEqual([1, 2, 3])
    })

    it('slices across tier boundaries', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      expect(tv.slice(5, 15)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    })
  })

  describe('reverse', () => {
    it('reverses empty vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.reverse()
      expect(tv.toArray()).toEqual([])
    })

    it('reverses single element', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.reverse()
      expect(tv.toArray()).toEqual([1])
    })

    it('reverses two elements', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.reverse()
      expect(tv.toArray()).toEqual([2, 1])
    })

    it('reverses multiple elements', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      tv.pushBack(4)
      tv.pushBack(5)
      tv.reverse()
      expect(tv.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('reverses large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      tv.reverse()
      const arr = tv.toArray()
      for (let i = 0; i < 20; i++) {
        expect(arr[i]).toBe(19 - i)
      }
    })

    it('double reverse restores original', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      const original = tv.toArray()
      tv.reverse()
      tv.reverse()
      expect(tv.toArray()).toEqual(original)
    })

    it('maintains size after reverse', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      tv.reverse()
      expect(tv.size).toBe(10)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      const stats = tv.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.accesses).toBe(0)
      expect(stats.rebalances).toBe(0)
      expect(stats.maxTierSize).toBe(0)
    })

    it('tracks inserts', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.getStatistics().inserts).toBe(3)
    })

    it('tracks deletes', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.popBack()
      tv.removeAt(0)
      expect(tv.getStatistics().deletes).toBe(2)
    })

    it('tracks accesses via get', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.get(0)
      tv.get(0)
      expect(tv.getStatistics().accesses).toBe(2)
    })

    it('tracks accesses via set', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.set(0, 10)
      expect(tv.getStatistics().accesses).toBe(1)
    })

    it('tracks maxTierSize', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 9; i++) tv.pushBack(i)
      expect(tv.getStatistics().maxTierSize).toBeGreaterThan(0)
    })

    it('tracks rebalances on split', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 9; i++) tv.pushBack(i)
      expect(tv.getStatistics().rebalances).toBeGreaterThan(0)
    })

    it('returns a copy of statistics', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      const stats1 = tv.getStatistics()
      tv.pushBack(2)
      const stats2 = tv.getStatistics()
      expect(stats1.inserts).toBe(1)
      expect(stats2.inserts).toBe(2)
    })
  })

  describe('rebalancing', () => {
    it('splits tier when exceeding 2*baseSize', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 9; i++) tv.pushBack(i)
      expect(tv.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
      expect(tv.getStatistics().rebalances).toBeGreaterThan(0)
    })

    it('merges tiers when tier becomes too small', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 16; i++) tv.pushBack(i)
      while (tv.size > 5) tv.popBack()
      expect(tv.size).toBe(5)
      expect(tv.toArray().length).toBe(5)
    })

    it('handles tier removal when empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.popFront()
      tv.popFront()
      expect(tv.isEmpty()).toBe(true)
    })

    it('maintains correctness through many inserts and deletes', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 50; i++) tv.pushBack(i)
      for (let i = 0; i < 25; i++) tv.popFront()
      const arr = tv.toArray()
      expect(arr.length).toBe(25)
      for (let i = 0; i < 25; i++) {
        expect(arr[i]).toBe(25 + i)
      }
    })

    it('handles alternating insert and remove', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) {
        tv.pushBack(i)
      }
      for (let i = 0; i < 10; i++) {
        tv.removeAt(0)
      }
      expect(tv.size).toBe(10)
      expect(tv.toArray()[0]).toBe(10)
    })

    it('maxTierSize stays within 2*baseSize after pushes', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 200; i++) tv.pushBack(i)
      const stats = tv.getStatistics()
      expect(stats.maxTierSize).toBeLessThanOrEqual(16)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 pushBack operations', () => {
      const tv = new TieredVector<number>({ baseSize: 16 })
      for (let i = 0; i < 1000; i++) tv.pushBack(i)
      expect(tv.size).toBe(1000)
      const arr = tv.toArray()
      for (let i = 0; i < 1000; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles 1000 mixed operations', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 500; i++) tv.pushBack(i)
      for (let i = 0; i < 250; i++) tv.popBack()
      for (let i = 0; i < 250; i++) tv.pushFront(i + 500)
      expect(tv.size).toBe(500)
    })

    it('handles insertAt in the middle of large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      tv.insertAt(50, 999)
      expect(tv.get(50)).toBe(999)
      expect(tv.get(51)).toBe(50)
      expect(tv.size).toBe(101)
    })

    it('handles removeAt in the middle of large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      const removed = tv.removeAt(50)
      expect(removed).toBe(50)
      expect(tv.get(50)).toBe(51)
      expect(tv.size).toBe(99)
    })

    it('handles slice on large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      const sliced = tv.slice(20, 30)
      expect(sliced).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29])
    })

    it('handles indexOf on large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      expect(tv.indexOf(50)).toBe(50)
      expect(tv.indexOf(99)).toBe(99)
      expect(tv.indexOf(100)).toBe(-1)
    })

    it('handles forEach on large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      let sum = 0
      tv.forEach((v) => { sum += v })
      expect(sum).toBe(4950)
    })

    it('handles reverse on large vector', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      tv.reverse()
      expect(tv.get(0)).toBe(99)
      expect(tv.get(99)).toBe(0)
      expect(tv.get(50)).toBe(49)
    })

    it('handles clear and reuse', () => {
      const tv = new TieredVector<number>({ baseSize: 8 })
      for (let i = 0; i < 100; i++) tv.pushBack(i)
      tv.clear()
      expect(tv.size).toBe(0)
      for (let i = 0; i < 50; i++) tv.pushBack(i)
      expect(tv.size).toBe(50)
      expect(tv.get(49)).toBe(49)
    })

    it('handles interleaved operations', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      tv.removeAt(5)
      tv.insertAt(5, 50)
      tv.pushFront(100)
      tv.popBack()
      expect(tv.size).toBe(10)
      expect(tv.get(0)).toBe(100)
      expect(tv.get(6)).toBe(50)
    })
  })

  describe('type safety', () => {
    it('works with generic type string', () => {
      const tv = new TieredVector<string>({ baseSize: 4 })
      tv.pushBack('hello')
      tv.pushBack('world')
      expect(tv.get(0)).toBe('hello')
      expect(tv.get(1)).toBe('world')
    })

    it('works with generic type object', () => {
      const tv = new TieredVector<{ id: number }>({ baseSize: 4 })
      tv.pushBack({ id: 1 })
      tv.pushBack({ id: 2 })
      expect(tv.get(0)!.id).toBe(1)
      expect(tv.get(1)!.id).toBe(2)
    })

    it('works with nullable types', () => {
      const tv = new TieredVector<number | null>({ baseSize: 4 })
      tv.pushBack(null)
      tv.pushBack(1)
      tv.pushBack(null)
      expect(tv.get(0)).toBe(null)
      expect(tv.get(1)).toBe(1)
      expect(tv.get(2)).toBe(null)
    })

    it('works with array types', () => {
      const tv = new TieredVector<number[]>({ baseSize: 4 })
      tv.pushBack([1, 2])
      tv.pushBack([3, 4])
      expect(tv.get(0)).toEqual([1, 2])
      expect(tv.get(1)).toEqual([3, 4])
    })
  })

  describe('edge cases', () => {
    it('handles pushBack after popBack to empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.popBack()
      tv.pushBack(2)
      expect(tv.toArray()).toEqual([2])
    })

    it('handles pushFront after popFront to empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushFront(1)
      tv.popFront()
      tv.pushFront(2)
      expect(tv.toArray()).toEqual([2])
    })

    it('handles get after complex operations', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      for (let i = 0; i < 5; i++) tv.popFront()
      for (let i = 0; i < 5; i++) tv.popBack()
      expect(tv.size).toBe(10)
      expect(tv.get(0)).toBe(5)
      expect(tv.get(9)).toBe(14)
    })

    it('handles set after complex operations', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 20; i++) tv.pushBack(i)
      for (let i = 0; i < 5; i++) tv.popFront()
      tv.set(0, 999)
      expect(tv.get(0)).toBe(999)
    })

    it('handles slice with only start', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      const sliced = tv.slice(8)
      expect(sliced).toEqual([8, 9])
    })

    it('handles reverse on two elements', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.reverse()
      expect(tv.toArray()).toEqual([2, 1])
    })

    it('handles indexOf with duplicate values', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(5)
      tv.pushBack(5)
      tv.pushBack(5)
      expect(tv.indexOf(5)).toBe(0)
    })

    it('handles includes with undefined', () => {
      const tv = new TieredVector<number | undefined>({ baseSize: 4 })
      tv.pushBack(undefined)
      expect(tv.includes(undefined)).toBe(true)
    })

    it('handles insertAt(0) repeatedly', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.insertAt(0, i)
      expect(tv.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    })

    it('handles removeAt(0) repeatedly', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      const removed: number[] = []
      while (!tv.isEmpty()) removed.push(tv.removeAt(0)!)
      expect(removed).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles removeAt last index repeatedly', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      for (let i = 0; i < 10; i++) tv.pushBack(i)
      const removed: number[] = []
      while (!tv.isEmpty()) removed.push(tv.removeAt(tv.size - 1)!)
      expect(removed).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    })

    it('handles at on empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.at(0)).toBeUndefined()
    })

    it('handles indexOf on empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.indexOf(1)).toBe(-1)
    })

    it('handles includes on empty', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      expect(tv.includes(1)).toBe(false)
    })

    it('handles slice with negative indices beyond size', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      tv.pushBack(3)
      expect(tv.slice(-100)).toEqual([1, 2, 3])
    })

    it('handles slice with end beyond size', () => {
      const tv = new TieredVector<number>({ baseSize: 4 })
      tv.pushBack(1)
      tv.pushBack(2)
      expect(tv.slice(0, 100)).toEqual([1, 2])
    })
  })
})
