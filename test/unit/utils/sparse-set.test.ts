import { describe, expect, it } from 'vitest'
import { SparseSet } from '../../../src/utils/sparse-set.js'

describe('SparseSet', () => {
  it('creates empty set with universe size', () => {
    const set = new SparseSet(10)
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
    expect(set.universeSize).toBe(10)
  })

  it('throws error for negative universe size', () => {
    expect(() => new SparseSet(-1)).toThrow('Universe size must be a non-negative integer')
  })

  it('throws error for non-integer universe size', () => {
    expect(() => new SparseSet(5.5)).toThrow('Universe size must be a non-negative integer')
  })

  it('adds single element', () => {
    const set = new SparseSet(10)
    const result = set.add(5)
    expect(result).toBe(true)
    expect(set.size).toBe(1)
    expect(set.isEmpty).toBe(false)
    expect(set.has(5)).toBe(true)
  })

  it('returns false when adding duplicate', () => {
    const set = new SparseSet(10)
    set.add(5)
    const result = set.add(5)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('returns false when adding out of bounds value', () => {
    const set = new SparseSet(10)
    expect(set.add(-1)).toBe(false)
    expect(set.add(10)).toBe(false)
    expect(set.add(5.5)).toBe(false)
    expect(set.size).toBe(0)
  })

  it('has returns false for non-existent value', () => {
    const set = new SparseSet(10)
    expect(set.has(0)).toBe(false)
    expect(set.has(9)).toBe(false)
  })

  it('has returns false for out of bounds value', () => {
    const set = new SparseSet(10)
    expect(set.has(-1)).toBe(false)
    expect(set.has(10)).toBe(false)
    expect(set.has(5.5)).toBe(false)
  })

  it('removes existing value', () => {
    const set = new SparseSet(10)
    set.add(5)
    const result = set.remove(5)
    expect(result).toBe(true)
    expect(set.size).toBe(0)
    expect(set.has(5)).toBe(false)
  })

  it('returns false when removing non-existent value', () => {
    const set = new SparseSet(10)
    expect(set.remove(5)).toBe(false)
    expect(set.size).toBe(0)
  })

  it('clears all values', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(2)
    set.add(3)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
    expect(set.has(1)).toBe(false)
    expect(set.has(2)).toBe(false)
    expect(set.has(3)).toBe(false)
  })

  it('converts to array', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(5)
    set.add(3)
    const arr = set.toArray()
    expect(arr.length).toBe(3)
    expect(arr).toContain(1)
    expect(arr).toContain(5)
    expect(arr).toContain(3)
  })

  it('values returns all elements', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(5)
    set.add(3)
    const values = set.values()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(5)
    expect(values).toContain(3)
  })

  it('forEach iterates over all elements', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(5)
    set.add(3)
    const elements: number[] = []
    const indices: number[] = []
    set.forEach((value, index) => {
      elements.push(value)
      indices.push(index)
    })
    expect(elements.length).toBe(3)
    expect(elements).toContain(1)
    expect(elements).toContain(5)
    expect(elements).toContain(3)
    expect(indices).toEqual([0, 1, 2])
  })

  it('is iterable with for-of', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(5)
    set.add(3)
    const elements: number[] = []
    for (const value of set) {
      elements.push(value)
    }
    expect(elements.length).toBe(3)
    expect(elements).toContain(1)
    expect(elements).toContain(5)
    expect(elements).toContain(3)
  })

  it('spreads into array', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(5)
    set.add(3)
    const arr = [...set]
    expect(arr.length).toBe(3)
    expect(arr).toContain(1)
    expect(arr).toContain(5)
    expect(arr).toContain(3)
  })

  it('computes union of two sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    const result = a.union(b)
    expect(result.size).toBe(3)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('computes intersection of two sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.intersection(b)
    expect(result.size).toBe(2)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
    expect(result.has(1)).toBe(false)
    expect(result.has(4)).toBe(false)
  })

  it('computes difference of two sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    const result = a.difference(b)
    expect(result.size).toBe(1)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(false)
    expect(result.has(3)).toBe(false)
  })

  it('checks if set is subset of another', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('checks if set is superset of another', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    expect(a.isSupersetOf(b)).toBe(true)
    expect(b.isSupersetOf(a)).toBe(false)
  })

  it('checks equality of sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(2)
    b.add(1)
    const c = new SparseSet(10)
    c.add(1)
    c.add(2)
    c.add(3)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('clones set', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = a.clone()
    expect(b.size).toBe(a.size)
    expect(b.equals(a)).toBe(true)
    a.add(3)
    expect(b.size).toBe(2)
    expect(a.size).toBe(3)
  })

  it('handles large set with many elements', () => {
    const set = new SparseSet(2000)
    for (let i = 0; i < 1000; i++) {
      set.add(i * 2)
    }
    expect(set.size).toBe(1000)
    expect(set.has(500)).toBe(true)
    expect(set.has(501)).toBe(false)
  })

  it('handles single element set', () => {
    const set = new SparseSet(10)
    set.add(5)
    expect(set.size).toBe(1)
    expect(set.isEmpty).toBe(false)
    expect(set.has(5)).toBe(true)
    expect(set.has(0)).toBe(false)
  })

  it('removes last element', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(2)
    set.add(3)
    set.remove(3)
    expect(set.size).toBe(2)
    expect(set.has(3)).toBe(false)
  })

  it('removes middle element', () => {
    const set = new SparseSet(10)
    set.add(1)
    set.add(2)
    set.add(3)
    set.remove(2)
    expect(set.size).toBe(2)
    expect(set.has(2)).toBe(false)
    expect(set.has(1)).toBe(true)
    expect(set.has(3)).toBe(true)
  })

  it('handles empty set union', () => {
    const a = new SparseSet(10)
    a.add(1)
    const b = new SparseSet(10)
    const result = a.union(b)
    expect(result.size).toBe(1)
    expect(result.has(1)).toBe(true)
  })

  it('handles empty set intersection', () => {
    const a = new SparseSet(10)
    a.add(1)
    const b = new SparseSet(10)
    const result = a.intersection(b)
    expect(result.size).toBe(0)
    expect(result.isEmpty).toBe(true)
  })

  it('handles set operations with different universe sizes', () => {
    const a = new SparseSet(5)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    const result = a.union(b)
    expect(result.universeSize).toBe(10)
    expect(result.size).toBe(3)
  })

  it('maintains insertion order in iteration', () => {
    const set = new SparseSet(10)
    set.add(5)
    set.add(2)
    set.add(8)
    set.add(1)
    const values = set.values()
    expect(values[0]).toBe(5)
    expect(values[1]).toBe(2)
    expect(values[2]).toBe(8)
    expect(values[3]).toBe(1)
  })

  it('handles value 0', () => {
    const set = new SparseSet(10)
    expect(set.add(0)).toBe(true)
    expect(set.has(0)).toBe(true)
    expect(set.remove(0)).toBe(true)
    expect(set.has(0)).toBe(false)
  })

  it('handles maximum value in universe', () => {
    const set = new SparseSet(10)
    expect(set.add(9)).toBe(true)
    expect(set.has(9)).toBe(true)
    expect(set.remove(9)).toBe(true)
    expect(set.has(9)).toBe(false)
  })
})