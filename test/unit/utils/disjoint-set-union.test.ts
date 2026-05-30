import { describe, expect, it } from 'vitest'
import { DisjointSetUnion } from '../../../src/utils/disjoint-set-union.js'

describe('DisjointSetUnion', () => {
  it('should create DSU with n elements', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.componentCount).toBe(5)
  })

  it('should have initial component count equal to n', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.componentCount).toBe(5)
  })

  it('should throw RangeError for negative n', () => {
    expect(() => new DisjointSetUnion(-1)).toThrow(RangeError)
  })

  it('should throw RangeError for non-integer n', () => {
    expect(() => new DisjointSetUnion(5.5)).toThrow(RangeError)
  })

  it('should throw RangeError for Infinity', () => {
    expect(() => new DisjointSetUnion(Infinity)).toThrow(RangeError)
  })

  it('should create DSU with zero elements', () => {
    const dsu = new DisjointSetUnion(0)
    expect(dsu.componentCount).toBe(0)
  })

  it('should find self as root initially', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.find(4)).toBe(4)
  })

  it('should return true when union merges two sets', () => {
    const dsu = new DisjointSetUnion(5)
    const result = dsu.union(0, 1)
    expect(result).toBe(true)
  })

  it('should return false when union same element', () => {
    const dsu = new DisjointSetUnion(5)
    const result = dsu.union(0, 0)
    expect(result).toBe(false)
  })

  it('should return false when union already connected elements', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    const result = dsu.union(0, 1)
    expect(result).toBe(false)
  })

  it('should connect two elements via union', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('should not connect different sets', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('should decrease component count after union', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(4)
  })

  it('should decrease component count after multiple unions', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(3, 4)
    expect(dsu.componentCount).toBe(2)
  })

  it('should return correct set size initially', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.setSize(0)).toBe(1)
    expect(dsu.setSize(4)).toBe(1)
  })

  it('should return correct set size after union', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    expect(dsu.setSize(0)).toBe(2)
    expect(dsu.setSize(1)).toBe(2)
  })

  it('should return correct set size after multiple unions', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.setSize(0)).toBe(3)
    expect(dsu.setSize(2)).toBe(3)
  })

  it('should throw RangeError for negative index in find', () => {
    const dsu = new DisjointSetUnion(5)
    expect(() => dsu.find(-1)).toThrow(RangeError)
  })

  it('should throw RangeError for out of bounds index in find', () => {
    const dsu = new DisjointSetUnion(5)
    expect(() => dsu.find(5)).toThrow(RangeError)
  })

  it('should throw RangeError for negative index in union', () => {
    const dsu = new DisjointSetUnion(5)
    expect(() => dsu.union(-1, 0)).toThrow(RangeError)
  })

  it('should throw RangeError for out of bounds index in union', () => {
    const dsu = new DisjointSetUnion(5)
    expect(() => dsu.union(0, 5)).toThrow(RangeError)
  })

  it('should throw RangeError for negative index in connected', () => {
    const dsu = new DisjointSetUnion(5)
    expect(() => dsu.connected(-1, 0)).toThrow(RangeError)
  })

  it('should throw RangeError for out of bounds index in connected', () => {
    const dsu = new DisjointSetUnion(5)
    expect(() => dsu.connected(0, 5)).toThrow(RangeError)
  })

  it('should handle single element DSU', () => {
    const dsu = new DisjointSetUnion(1)
    expect(dsu.componentCount).toBe(1)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.setSize(0)).toBe(1)
  })

  it('should apply path compression on repeated finds', () => {
    const dsu = new DisjointSetUnion(10)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    dsu.find(4)
    expect(dsu.find(0)).toBe(dsu.find(4))
  })

  it('should use union by rank', () => {
    const dsu = new DisjointSetUnion(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    dsu.union(6, 7)
    dsu.union(8, 9)
    const root0 = dsu.find(0)
    dsu.union(0, 2)
    dsu.union(4, 6)
    dsu.union(8, 0)
    expect(dsu.rank(8)).toBeLessThanOrEqual(3)
  })

  it('should transitive closure of union operations', () => {
    const dsu = new DisjointSetUnion(10)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    expect(dsu.connected(0, 3)).toBe(true)
    expect(dsu.connected(1, 3)).toBe(true)
  })

  it('should handle complex union operations', () => {
    const dsu = new DisjointSetUnion(10)
    dsu.union(0, 2)
    dsu.union(4, 6)
    dsu.union(1, 3)
    dsu.union(5, 7)
    dsu.union(0, 1)
    dsu.union(4, 5)
    dsu.union(0, 4)
    expect(dsu.connected(0, 7)).toBe(true)
    expect(dsu.componentCount).toBe(3)
  })

  it('should return correct rank initially', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.rank(0)).toBe(0)
    expect(dsu.rank(4)).toBe(0)
  })

  it('should increase rank on equal rank union', () => {
    const dsu = new DisjointSetUnion(5)
    const rankBefore = dsu.rank(0)
    dsu.union(0, 1)
    const rankAfter = dsu.rank(0)
    expect(rankAfter).toBeGreaterThan(rankBefore)
  })

  it('should reset to initial state', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.reset()
    expect(dsu.componentCount).toBe(5)
    expect(dsu.connected(0, 1)).toBe(false)
  })
})