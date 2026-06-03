import { describe, it, expect } from 'vitest'
import { SortedSet } from '../../src/utils/sorted-set.js'

describe('SortedSet', () => {
  it('should handle empty set operations', () => {
    const set = new SortedSet<number>()
    expect(set.size).toBe(0)
    expect(set.has(1)).toBe(false)
    expect(set.delete(1)).toBe(false)
    expect(set.at(0)).toBeUndefined()
    expect(set.rank(1)).toBe(-1)
    expect(set.min()).toBeUndefined()
    expect(set.max()).toBeUndefined()
    expect(set.toArray()).toEqual([])
  })

  it('should add elements and check membership', () => {
    const set = new SortedSet<number>()
    expect(set.add(5)).toBe(true)
    expect(set.add(3)).toBe(true)
    expect(set.add(7)).toBe(true)
    expect(set.has(5)).toBe(true)
    expect(set.has(3)).toBe(true)
    expect(set.has(7)).toBe(true)
    expect(set.has(1)).toBe(false)
  })

  it('should return false when adding duplicate', () => {
    const set = new SortedSet<number>()
    expect(set.add(5)).toBe(true)
    expect(set.add(5)).toBe(false)
    expect(set.size).toBe(1)
  })

  it('should delete element', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.delete(5)).toBe(true)
    expect(set.has(5)).toBe(false)
    expect(set.size).toBe(2)
  })

  it('should return false when deleting absent element', () => {
    const set = new SortedSet<number>()
    set.add(5)
    expect(set.delete(3)).toBe(false)
    expect(set.size).toBe(1)
  })

  it('should track size correctly', () => {
    const set = new SortedSet<number>()
    expect(set.size).toBe(0)
    set.add(5)
    expect(set.size).toBe(1)
    set.add(3)
    expect(set.size).toBe(2)
    set.delete(5)
    expect(set.size).toBe(1)
    set.clear()
    expect(set.size).toBe(0)
  })

  it('should return min and max elements', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    set.add(9)
    expect(set.min()).toBe(1)
    expect(set.max()).toBe(9)
  })

  it('should return element at index', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    expect(set.at(0)).toBe(1)
    expect(set.at(1)).toBe(3)
    expect(set.at(2)).toBe(5)
    expect(set.at(3)).toBe(7)
    expect(set.at(4)).toBeUndefined()
    expect(set.at(-1)).toBeUndefined()
  })

  it('should return correct rank of element', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    expect(set.rank(1)).toBe(0)
    expect(set.rank(3)).toBe(1)
    expect(set.rank(5)).toBe(2)
    expect(set.rank(7)).toBe(3)
    expect(set.rank(10)).toBe(-1)
  })

  it('should return elements in rank range', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    set.add(9)
    expect(set.range(1, 4)).toEqual([3, 5, 7])
    expect(set.range(0, 3)).toEqual([1, 3, 5])
    expect(set.range(2)).toEqual([5, 7, 9])
    expect(set.range(5)).toEqual([])
    expect(set.range(-1, 2)).toEqual([])
  })

  it('should return sorted array', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    expect(set.toArray()).toEqual([1, 3, 5, 7])
  })

  it('should iterate with forEach in order', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    const result: number[] = []
    const indices: number[] = []
    set.forEach((value, index) => {
      result.push(value)
      indices.push(index)
    })
    expect(result).toEqual([1, 3, 5, 7])
    expect(indices).toEqual([0, 1, 2, 3])
  })

  it('should work with Symbol.iterator', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    const result: number[] = []
    for (const value of set) {
      result.push(value)
    }
    expect(result).toEqual([1, 3, 5, 7])
  })

  it('should handle large set with correct ordering', () => {
    const set = new SortedSet<number>()
    const values: number[] = []
    for (let i = 0; i < 1000; i++) {
      values.push(1000 - i)
    }
    for (const v of values) {
      set.add(v)
    }
    expect(set.size).toBe(1000)
    expect(set.min()).toBe(1)
    expect(set.max()).toBe(1000)
    expect(set.at(500)).toBe(501)
    expect(set.rank(500)).toBe(499)
    expect(set.range(100, 200)).toHaveLength(100)
  })

  it('should reset with clear', () => {
    const set = new SortedSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.has(5)).toBe(false)
    expect(set.min()).toBeUndefined()
    expect(set.max()).toBeUndefined()
    expect(set.toArray()).toEqual([])
  })

  it('should work with custom comparator', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    set.add({ id: 5 })
    set.add({ id: 3 })
    set.add({ id: 7 })
    expect(set.size).toBe(3)
    expect(set.at(0)!.id).toBe(3)
    expect(set.at(2)!.id).toBe(7)
  })

  it('has returns false for missing', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    expect(set.has({ id: 5 })).toBe(false)
  })

  it('size returns correct count', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    set.add({ id: 1 })
    set.add({ id: 2 })
    expect(set.size).toBe(2)
  })

  it('has returns correct boolean', () => {
    const set = new SortedSet<{id: number}>((a, b) => a.id - b.id)
    set.add({ id: 1 })
    expect(set.has({ id: 1 })).toBe(true)
    expect(set.has({ id: 99 })).toBe(false)
  })

  it('size tracks elements', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    set.add({ id: 1 })
    set.add({ id: 2 })
    expect(set.size).toBe(2)
  })

  it('has returns false for missing item', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    set.add({ id: 1 })
    expect(set.has({ id: 99 })).toBe(false)
  })

  it('has returns true for existing element', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    set.add({ id: 5 })
    expect(set.has({ id: 5 })).toBe(true)
  })

  it('has returns false for missing element', () => {
    const set = new SortedSet<{ id: number }>((a, b) => a.id - b.id)
    set.add({ id: 5 })
    expect(set.has({ id: 99 })).toBe(false)
  })
})