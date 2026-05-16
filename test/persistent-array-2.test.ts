import { describe, it, expect } from 'vitest'
import { PersistentArray2 } from '../src/core/persistent-array-2/index.js'

describe('PersistentArray2', () => {
  it('creates empty array', () => {
    const arr = new PersistentArray2<number>()
    expect(arr.length).toBe(0)
    expect(arr.toArray()).toEqual([])
  })

  it('creates array with initial items', () => {
    const arr = new PersistentArray2([1, 2, 3])
    expect(arr.length).toBe(3)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('get returns correct value', () => {
    const arr = new PersistentArray2([1, 2, 3])
    expect(arr.get(0)).toBe(1)
    expect(arr.get(1)).toBe(2)
    expect(arr.get(2)).toBe(3)
    expect(arr.get(10)).toBeUndefined()
  })

  it('set creates new version, old unchanged', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.set(1, 99)
    expect(arr1.toArray()).toEqual([1, 2, 3])
    expect(arr2.toArray()).toEqual([1, 99, 3])
  })

  it('push creates new version, old unchanged', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.push(4)
    expect(arr1.toArray()).toEqual([1, 2, 3])
    expect(arr2.toArray()).toEqual([1, 2, 3, 4])
  })

  it('pop creates new version, old unchanged', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const [val, arr2] = arr1.pop()
    expect(val).toBe(3)
    expect(arr1.toArray()).toEqual([1, 2, 3])
    expect(arr2.toArray()).toEqual([1, 2])
  })

  it('pop on empty array', () => {
    const arr = new PersistentArray2<number>()
    const [val, arr2] = arr.pop()
    expect(val).toBeUndefined()
    expect(arr2).toBe(arr)
  })

  it('length returns correct size', () => {
    const arr = new PersistentArray2([1, 2, 3])
    expect(arr.length).toBe(3)
    const arr2 = arr.push(4)
    expect(arr2.length).toBe(4)
    expect(arr.length).toBe(3)
  })

  it('toArray returns copy', () => {
    const arr = new PersistentArray2([1, 2, 3])
    const copy = arr.toArray()
    copy[0] = 99
    expect(arr.get(0)).toBe(1)
  })

  it('map creates new version with transformed values', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.map((x) => x * 2)
    expect(arr1.toArray()).toEqual([1, 2, 3])
    expect(arr2.toArray()).toEqual([2, 4, 6])
  })

  it('filter creates new version with filtered values', () => {
    const arr1 = new PersistentArray2([1, 2, 3, 4, 5])
    const arr2 = arr1.filter((x) => x % 2 === 0)
    expect(arr1.toArray()).toEqual([1, 2, 3, 4, 5])
    expect(arr2.toArray()).toEqual([2, 4])
  })

  it('multiple versions coexist independently', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.set(0, 10)
    const arr3 = arr1.push(4)
    const arr4 = arr2.set(1, 20)

    expect(arr1.toArray()).toEqual([1, 2, 3])
    expect(arr2.toArray()).toEqual([10, 2, 3])
    expect(arr3.toArray()).toEqual([1, 2, 3, 4])
    expect(arr4.toArray()).toEqual([10, 20, 3])
  })

  it('get/set persistence with old version unchanged', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.set(0, 99)
    const arr3 = arr2.set(1, 88)

    expect(arr1.get(0)).toBe(1)
    expect(arr1.get(1)).toBe(2)
    expect(arr2.get(0)).toBe(99)
    expect(arr2.get(1)).toBe(2)
    expect(arr3.get(0)).toBe(99)
    expect(arr3.get(1)).toBe(88)
  })

  it('chained operations create new versions', () => {
    const arr1 = new PersistentArray2([1])
    const arr2 = arr1.push(2)
    const arr3 = arr2.push(3)
    const arr4 = arr3.set(1, 99)
    const arr5 = arr4.filter((x) => x !== 99)

    expect(arr1.toArray()).toEqual([1])
    expect(arr2.toArray()).toEqual([1, 2])
    expect(arr3.toArray()).toEqual([1, 2, 3])
    expect(arr4.toArray()).toEqual([1, 99, 3])
    expect(arr5.toArray()).toEqual([1, 3])
  })

  it('set beyond array length pads with undefined', () => {
    const arr1 = new PersistentArray2([1, 2])
    const arr2 = arr1.set(5, 99)
    expect(arr2.length).toBe(6)
    expect(arr2.get(0)).toBe(1)
    expect(arr2.get(5)).toBe(99)
    expect(arr2.get(3)).toBeUndefined()
  })

  it('map preserves length', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.map((x) => x + 10)
    expect(arr2.length).toBe(3)
    expect(arr2.toArray()).toEqual([11, 12, 13])
  })

  it('filter to empty array', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.filter(() => false)
    expect(arr2.length).toBe(0)
    expect(arr2.toArray()).toEqual([])
  })

  it('multiple pushes from same base', () => {
    const base = new PersistentArray2([1])
    const a = base.push(2)
    const b = base.push(3)
    expect(a.toArray()).toEqual([1, 2])
    expect(b.toArray()).toEqual([1, 3])
    expect(base.toArray()).toEqual([1])
  })

  it('handles string type', () => {
    const arr1 = new PersistentArray2(['a', 'b'])
    const arr2 = arr1.push('c')
    expect(arr2.toArray()).toEqual(['a', 'b', 'c'])
    const arr3 = arr2.set(1, 'X')
    expect(arr3.toArray()).toEqual(['a', 'X', 'c'])
  })

  it('get returns undefined for out of bounds', () => {
    const arr = new PersistentArray2([1, 2, 3])
    expect(arr.get(99)).toBeUndefined()
    expect(arr.get(-1)).toBeUndefined()
  })

  it('map transforms elements', () => {
    const arr = new PersistentArray2([1, 2, 3])
    const doubled = arr.map(x => x * 2)
    expect(doubled.toArray()).toEqual([2, 4, 6])
  })

  it('map preserves original', () => {
    const arr = new PersistentArray2([1, 2, 3])
    arr.map(x => x * 10)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('pop from empty returns undefined', () => {
    const arr = new PersistentArray2<number>()
    const [val, newArr] = arr.pop()
    expect(val).toBeUndefined()
    expect(newArr.toArray()).toEqual([])
  })

  it('set at new index extends array', () => {
    const arr = new PersistentArray2([1, 2])
    const arr2 = arr.set(3, 99)
    expect(arr2.get(3)).toBe(99)
  })

  it('should handle map with index parameter', () => {
    const arr = new PersistentArray2([10, 20, 30])
    const mapped = arr.map((x, i) => x + i)
    expect(mapped.toArray()).toEqual([10, 21, 32])
  })

  it('should handle filter with index parameter', () => {
    const arr = new PersistentArray2([10, 20, 30, 40])
    const filtered = arr.filter((x, i) => i % 2 === 0)
    expect(filtered.toArray()).toEqual([10, 30])
  })

  it('should handle multiple pops in sequence', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const [v1, arr2] = arr1.pop()
    const [v2, arr3] = arr2.pop()
    expect(v1).toBe(3)
    expect(v2).toBe(2)
    expect(arr3.toArray()).toEqual([1])
  })

  it('should handle set on same index twice', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const arr2 = arr1.set(1, 10)
    const arr3 = arr2.set(1, 20)
    expect(arr1.get(1)).toBe(2)
    expect(arr2.get(1)).toBe(10)
    expect(arr3.get(1)).toBe(20)
  })

  it('should handle push then pop returning to original', () => {
    const arr1 = new PersistentArray2([1, 2])
    const arr2 = arr1.push(3)
    const [val, arr3] = arr2.pop()
    expect(val).toBe(3)
    expect(arr3.toArray()).toEqual([1, 2])
    expect(arr1.toArray()).toEqual([1, 2])
  })

  it('should handle map producing new array', () => {
    const arr = new PersistentArray2([1, 2, 3])
    const doubled = arr.map(x => x * 2)
    expect(doubled.toArray()).toEqual([2, 4, 6])
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('should handle set returning new array', () => {
    const arr1 = new PersistentArray2([10, 20, 30])
    const arr2 = arr1.set(0, 99)
    expect(arr1.toArray()).toEqual([10, 20, 30])
    expect(arr2.toArray()).toEqual([99, 20, 30])
  })

  it('should handle get on out of bounds', () => {
    const arr = new PersistentArray2([1, 2])
    expect(arr.get(5)).toBeUndefined()
  })

  it('should handle push returning new array', () => {
    const arr1 = new PersistentArray2([1, 2])
    const arr2 = arr1.push(3)
    expect(arr1.length).toBe(2)
    expect(arr2.length).toBe(3)
    expect(arr2.toArray()).toEqual([1, 2, 3])
  })

  it('should handle pop', () => {
    const arr1 = new PersistentArray2([1, 2, 3])
    const [val, arr2] = arr1.pop()
    expect(val).toBe(3)
    expect(arr2.length).toBe(2)
  })

  it('should handle map', () => {
    const arr = new PersistentArray2([1, 2, 3])
    const mapped = arr.map(x => x * 2)
    expect(mapped.toArray()).toEqual([2, 4, 6])
  })

  it('should handle filter', () => {
    const arr = new PersistentArray2([1, 2, 3, 4, 5])
    const filtered = arr.filter(x => x > 2)
    expect(filtered.toArray()).toEqual([3, 4, 5])
  })

  it('should handle get', () => {
    const arr = new PersistentArray2([10, 20, 30])
    expect(arr.get(0)).toBe(10)
    expect(arr.get(1)).toBe(20)
    expect(arr.get(2)).toBe(30)
  })

  it('should handle push', () => {
    const arr = new PersistentArray2([10, 20])
    const arr2 = arr.push(30)
    expect(arr2.get(2)).toBe(30)
    expect(arr.get(2)).toBeUndefined()
  })

  it('should handle toArray', () => {
    const arr = new PersistentArray2([10, 20, 30])
    expect(arr.toArray()).toEqual([10, 20, 30])
  })

  it('should handle set returning new instance', () => {
    const arr = new PersistentArray2([10, 20, 30])
    const arr2 = arr.set(1, 99)
    expect(arr2.get(1)).toBe(99)
    expect(arr.get(1)).toBe(20)
  })

  it('should handle pop', () => {
    const arr = new PersistentArray2([10, 20, 30])
    const [val, arr2] = arr.pop()
    expect(val).toBe(30)
    expect(arr2.toArray()).toEqual([10, 20])
  })

  it('should handle map', () => {
    const arr = new PersistentArray2([1, 2, 3])
    const mapped = arr.map(x => x * 2)
    expect(mapped.toArray()).toEqual([2, 4, 6])
  })
  it('should handle push and pop', () => {
    const arr = new PersistentArray2<number>([1, 2])
    const arr2 = arr.push(3)
    expect(arr2.toArray()).toEqual([1, 2, 3])
    const [val, arr3] = arr2.pop()
    expect(val).toBe(3)
    expect(arr3.toArray()).toEqual([1, 2])
  })
  it('should handle get and set', () => {
    const arr = new PersistentArray2<number>([1, 2, 3])
    expect(arr.get(0)).toBe(1)
    const arr2 = arr.set(0, 99)
    expect(arr2.get(0)).toBe(99)
    expect(arr.get(0)).toBe(1)
  })
  it('should handle map', () => {
    const arr = new PersistentArray2<number>([1, 2, 3])
    const mapped = arr.map(x => x * 2)
    expect(mapped.get(0)).toBe(2)
    expect(mapped.get(1)).toBe(4)
    expect(mapped.get(2)).toBe(6)
  })
  it('should handle persistence after set', () => {
    const arr = new PersistentArray2<number>([1, 2, 3])
    const arr2 = arr.set(1, 99)
    expect(arr.get(1)).toBe(2)
    expect(arr2.get(1)).toBe(99)
  })
  it('should handle length property', () => {
    const arr = new PersistentArray2<number>([1, 2, 3, 4, 5])
    expect(arr.length).toBe(5)
  })
})
