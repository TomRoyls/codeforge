import { describe, expect, it } from 'vitest'
import { SortedSet } from '../../../src/utils/sorted-set.js'

describe('SortedSet', () => {
  it('empty set has size 0', () => {
    const set = new SortedSet()
    expect(set.size).toBe(0)
  })

  it('empty set isEmpty returns true', () => {
    const set = new SortedSet()
    expect(set.isEmpty()).toBe(true)
  })

  it('empty set min returns undefined', () => {
    const set = new SortedSet()
    expect(set.min()).toBeUndefined()
  })

  it('empty set max returns undefined', () => {
    const set = new SortedSet()
    expect(set.max()).toBeUndefined()
  })

  it('empty set toArray returns empty array', () => {
    const set = new SortedSet()
    expect(set.toArray()).toEqual([])
  })

  it('add returns true for new value', () => {
    const set = new SortedSet()
    expect(set.add(5)).toBe(true)
  })

  it('add returns false for duplicate value', () => {
    const set = new SortedSet()
    set.add(5)
    expect(set.add(5)).toBe(false)
  })

  it('delete returns true if value existed', () => {
    const set = new SortedSet()
    set.add(5)
    expect(set.delete(5)).toBe(true)
  })

  it('delete returns false if value does not exist', () => {
    const set = new SortedSet()
    expect(set.delete(5)).toBe(false)
  })

  it('contains returns true after add', () => {
    const set = new SortedSet()
    set.add(5)
    expect(set.contains(5)).toBe(true)
  })

  it('contains returns false after delete', () => {
    const set = new SortedSet()
    set.add(5)
    set.delete(5)
    expect(set.contains(5)).toBe(false)
  })

  it('size tracks number of elements', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.size).toBe(3)
  })

  it('min returns smallest element', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.min()).toBe(3)
  })

  it('max returns largest element', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.max()).toBe(7)
  })

  it('rank returns count of elements strictly less than value', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    expect(set.rank(5)).toBe(2)
  })

  it('rank returns 0 for smallest element', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.rank(3)).toBe(0)
  })

  it('rank returns size for larger than max', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.rank(10)).toBe(3)
  })

  it('select returns k-th smallest element', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    expect(set.select(0)).toBe(1)
    expect(set.select(1)).toBe(3)
    expect(set.select(2)).toBe(5)
    expect(set.select(3)).toBe(7)
  })

  it('select throws RangeError for negative index', () => {
    const set = new SortedSet()
    set.add(5)
    expect(() => set.select(-1)).toThrow(RangeError)
  })

  it('select throws RangeError for out of bounds index', () => {
    const set = new SortedSet()
    set.add(5)
    expect(() => set.select(5)).toThrow(RangeError)
  })

  it('ceiling returns smallest element >= value', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.ceiling(4)).toBe(5)
  })

  it('ceiling returns exact match if exists', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.ceiling(5)).toBe(5)
  })

  it('ceiling returns undefined for value larger than max', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.ceiling(10)).toBeUndefined()
  })

  it('floor returns largest element <= value', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.floor(4)).toBe(3)
  })

  it('floor returns exact match if exists', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.floor(5)).toBe(5)
  })

  it('floor returns undefined for value smaller than min', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.floor(1)).toBeUndefined()
  })

  it('rangeCount returns count of elements in range', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    set.add(9)
    expect(set.rangeCount(3, 7)).toBe(3)
  })

  it('rangeToArray returns sorted elements in range', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    set.add(9)
    expect(set.rangeToArray(3, 7)).toEqual([3, 5, 7])
  })

  it('toArray returns sorted elements', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    set.add(1)
    expect(set.toArray()).toEqual([1, 3, 5, 7])
  })

  it('forEach iterates in order', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    const result: number[] = []
    set.forEach((value) => result.push(value))
    expect(result).toEqual([3, 5, 7])
  })

  it('forEach passes correct index', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    const indices: number[] = []
    set.forEach((_, index) => indices.push(index))
    expect(indices).toEqual([0, 1, 2])
  })

  it('Symbol.iterator works with for-of', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    const result: number[] = []
    for (const value of set) {
      result.push(value)
    }
    expect(result).toEqual([3, 5, 7])
  })

  it('static fromArray creates set from array', () => {
    const set = SortedSet.fromArray([5, 3, 7, 1])
    expect(set.toArray()).toEqual([1, 3, 5, 7])
  })

  it('clear resets set to empty', () => {
    const set = new SortedSet()
    set.add(5)
    set.add(3)
    set.add(7)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('stress test maintains sorted order with many elements', () => {
    const set = new SortedSet()
    const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93, 3, 9, 15, 21, 28, 34, 40, 46, 53, 59, 65, 71, 78, 84, 90, 1, 4, 7, 10, 13, 16, 19, 22, 26, 30, 33, 36, 39, 42, 45, 48, 52, 55, 58, 61, 64, 67, 70, 73, 77, 80, 83, 86, 89, 92, 95, 2, 5, 8, 11, 14, 17, 20, 23, 27, 29, 32, 35, 38, 41, 44, 47, 51, 54, 57, 60, 63, 66, 69, 72, 74, 76, 79, 82, 85, 88, 91, 94]
    for (const v of values) {
      set.add(v)
    }
    const sorted = [...values].sort((a, b) => a - b)
    expect(set.toArray()).toEqual(sorted)
  })

  it('duplicate handling stores only unique values', () => {
    const set = new SortedSet()
    expect(set.add(5)).toBe(true)
    expect(set.add(3)).toBe(true)
    expect(set.add(5)).toBe(false)
    expect(set.add(7)).toBe(true)
    expect(set.add(3)).toBe(false)
    expect(set.size).toBe(3)
    expect(set.toArray()).toEqual([3, 5, 7])
  })

  it('handles negative numbers', () => {
    const set = new SortedSet()
    set.add(-5)
    set.add(3)
    set.add(-2)
    set.add(7)
    expect(set.toArray()).toEqual([-5, -2, 3, 7])
    expect(set.min()).toBe(-5)
    expect(set.max()).toBe(7)
  })

  it('handles single element', () => {
    const set = new SortedSet()
    set.add(5)
    expect(set.size).toBe(1)
    expect(set.isEmpty()).toBe(false)
    expect(set.min()).toBe(5)
    expect(set.max()).toBe(5)
    expect(set.select(0)).toBe(5)
    expect(set.contains(5)).toBe(true)
    expect(set.rank(5)).toBe(0)
    expect(set.ceiling(5)).toBe(5)
    expect(set.floor(5)).toBe(5)
  })
})