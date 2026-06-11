import { describe, it, expect } from 'vitest'
import { CompactIntSet } from '../../src/utils/compact-int-set.js'

describe('CompactIntSet', () => {
  it('creates empty set', () => {
    const set = new CompactIntSet()
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
    expect(set.byteLength).toBe(0)
  })

  it('creates set from sorted array', () => {
    const set = new CompactIntSet([1, 5, 10])
    expect(set.size).toBe(3)
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('adds single value to empty set', () => {
    const set = new CompactIntSet()
    const result = set.add(5)
    expect(result).toBe(true)
    expect(set.has(5)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('adds multiple values', () => {
    const set = new CompactIntSet()
    set.add(3)
    set.add(7)
    set.add(10)
    expect(set.toArray()).toEqual([3, 7, 10])
    expect(set.size).toBe(3)
  })

  it('returns false when adding duplicate', () => {
    const set = new CompactIntSet()
    set.add(5)
    const result = set.add(5)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('returns false when adding negative value', () => {
    const set = new CompactIntSet()
    const result = set.add(-5)
    expect(result).toBe(false)
    expect(set.size).toBe(0)
  })

  it('has returns true for existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    expect(set.has(5)).toBe(true)
  })

  it('has returns false for non-existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    expect(set.has(10)).toBe(false)
  })

  it('has returns false for negative value', () => {
    const set = new CompactIntSet()
    set.add(5)
    expect(set.has(-1)).toBe(false)
  })

  it('has returns false for empty set', () => {
    const set = new CompactIntSet()
    expect(set.has(5)).toBe(false)
  })

  it('deletes existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    set.add(10)
    const result = set.delete(5)
    expect(result).toBe(true)
    expect(set.has(5)).toBe(false)
    expect(set.has(10)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('returns false when deleting non-existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    const result = set.delete(10)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('returns false when deleting from empty set', () => {
    const set = new CompactIntSet()
    const result = set.delete(5)
    expect(result).toBe(false)
  })

  it('returns false when deleting negative value', () => {
    const set = new CompactIntSet()
    set.add(5)
    const result = set.delete(-1)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('toArray returns sorted values', () => {
    const set = new CompactIntSet()
    set.add(10)
    set.add(5)
    set.add(15)
    expect(set.toArray()).toEqual([5, 10, 15])
  })

  it('byteLength grows with values', () => {
    const set = new CompactIntSet()
    const initialLength = set.byteLength
    set.add(100)
    const afterAdd = set.byteLength
    expect(afterAdd).toBeGreaterThan(initialLength)
  })

  it('union combines two sets', () => {
    const a = new CompactIntSet([1, 3, 5])
    const b = new CompactIntSet([3, 5, 7])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 3, 5, 7])
  })

  it('union with disjoint sets', () => {
    const a = new CompactIntSet([1, 2])
    const b = new CompactIntSet([5, 6])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 5, 6])
  })

  it('union with empty set', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet()
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('intersection finds common values', () => {
    const a = new CompactIntSet([1, 3, 5, 7])
    const b = new CompactIntSet([3, 5, 8, 10])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([3, 5])
  })

  it('intersection with disjoint sets returns empty', () => {
    const a = new CompactIntSet([1, 2])
    const b = new CompactIntSet([5, 6])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([])
  })

  it('intersection with empty set returns empty', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet()
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([])
  })

  it('handles large values', () => {
    const set = new CompactIntSet()
    set.add(1000000)
    set.add(2000000)
    expect(set.has(1000000)).toBe(true)
    expect(set.has(2000000)).toBe(true)
  })

  it('handles consecutive values', () => {
    const set = new CompactIntSet()
    for (let i = 0; i < 10; i++) {
      set.add(i)
    }
    expect(set.size).toBe(10)
    expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('adds value before existing', () => {
    const set = new CompactIntSet([5, 10])
    set.add(2)
    expect(set.toArray()).toEqual([2, 5, 10])
  })

  it('adds value between existing', () => {
    const set = new CompactIntSet([1, 10])
    set.add(5)
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('adds value after existing', () => {
    const set = new CompactIntSet([1, 5])
    set.add(10)
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('creates set from unsorted array', () => {
    const set = new CompactIntSet([10, 5, 1])
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('creates set from duplicate array', () => {
    const set = new CompactIntSet([1, 1, 5, 5])
    expect(set.size).toBe(2)
    expect(set.toArray()).toEqual([1, 5])
  })

  it('creates set from empty array', () => {
    const set = new CompactIntSet([])
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
  })

  it('delete all values results in empty set', () => {
    const set = new CompactIntSet([1, 2, 3])
    set.delete(1)
    set.delete(2)
    set.delete(3)
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
  })

  it('delete middle value preserves order', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(5)
    expect(set.toArray()).toEqual([1, 10])
  })

  it('delete first value', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(1)
    expect(set.toArray()).toEqual([5, 10])
  })

  it('delete last value', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(10)
    expect(set.toArray()).toEqual([1, 5])
  })

  it('union with identical sets', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet([1, 2, 3])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('union returns new set', () => {
    const a = new CompactIntSet([1])
    const b = new CompactIntSet([2])
    const result = a.union(b)
    expect(result).not.toBe(a)
    expect(result).not.toBe(b)
  })

  it('intersection with identical sets', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet([1, 2, 3])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('intersection returns new set', () => {
    const a = new CompactIntSet([1, 2])
    const b = new CompactIntSet([2, 3])
    const result = a.intersection(b)
    expect(result).not.toBe(a)
    expect(result).not.toBe(b)
  })

  it('handles zero value', () => {
    const set = new CompactIntSet()
    set.add(0)
    expect(set.has(0)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('handles single value operations', () => {
    const set = new CompactIntSet()
    set.add(42)
    expect(set.has(42)).toBe(true)
    set.delete(42)
    expect(set.has(42)).toBe(false)
    expect(set.size).toBe(0)
  })

  it('handles large number of values', () => {
    const set = new CompactIntSet()
    for (let i = 0; i < 100; i++) {
      set.add(i * 10)
    }
    expect(set.size).toBe(100)
    expect(set.has(0)).toBe(true)
    expect(set.has(990)).toBe(true)
    expect(set.has(500)).toBe(true)
  })

  it('byteLength increases with larger values', () => {
    const small = new CompactIntSet([1, 2, 3])
    const large = new CompactIntSet([100000, 200000, 300000])
    expect(large.byteLength).toBeGreaterThan(small.byteLength)
  })

  it('union of two empty sets is empty', () => {
    const a = new CompactIntSet()
    const b = new CompactIntSet()
    const result = a.union(b)
    expect(result.toArray()).toEqual([])
    expect(result.size).toBe(0)
  })

  it('intersection of two empty sets is empty', () => {
    const a = new CompactIntSet()
    const b = new CompactIntSet()
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([])
    expect(result.size).toBe(0)
  })

  it('union with overlapping ranges', () => {
    const a = new CompactIntSet([1, 2, 3, 4, 5])
    const b = new CompactIntSet([3, 4, 5, 6, 7])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('intersection with overlapping ranges', () => {
    const a = new CompactIntSet([1, 2, 3, 4, 5])
    const b = new CompactIntSet([3, 4, 5, 6, 7])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([3, 4, 5])
  })

  it('add after delete works correctly', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(5)
    set.add(5)
    expect(set.toArray()).toEqual([1, 5, 10])
    expect(set.size).toBe(3)
  })

  it('has returns false for zero in empty set', () => {
    const set = new CompactIntSet()
    expect(set.has(0)).toBe(false)
  })

  it('multiple adds and deletes maintain correctness', () => {
    const set = new CompactIntSet()
    set.add(1)
    set.add(2)
    set.add(3)
    set.delete(2)
    set.add(4)
    set.delete(1)
    expect(set.toArray()).toEqual([3, 4])
  })
})
