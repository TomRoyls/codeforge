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
})