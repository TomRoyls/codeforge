import { describe, expect, it } from 'vitest'
import { SubsetSum } from '../../src/utils/subset-sum.js'

describe('SubsetSum', () => {
  it('finds existing subset sum', () => {
    expect(SubsetSum.hasSubset([3, 34, 4, 12, 5, 2], 9)).toBe(true)
  })

  it('returns false for impossible sum', () => {
    expect(SubsetSum.hasSubset([1, 2, 3], 7)).toBe(false)
  })

  it('handles target 0', () => {
    expect(SubsetSum.hasSubset([1, 2, 3], 0)).toBe(true)
  })

  it('handles empty array', () => {
    expect(SubsetSum.hasSubset([], 0)).toBe(true)
    expect(SubsetSum.hasSubset([], 1)).toBe(false)
  })

  it('findSubset returns correct subset', () => {
    const result = SubsetSum.findSubset([3, 34, 4, 12, 5, 2], 9)
    expect(result).not.toBeNull()
    expect(result!.reduce((a, b) => a + b, 0)).toBe(9)
  })

  it('findSubset returns null for impossible', () => {
    expect(SubsetSum.findSubset([1, 2, 3], 7)).toBeNull()
  })

  it('findAllSubsets finds all valid subsets', () => {
    const result = SubsetSum.findAllSubsets([1, 2, 3, 4, 5], 5)
    expect(result.length).toBeGreaterThanOrEqual(2)
    for (const subset of result) {
      expect(subset.reduce((a, b) => a + b, 0)).toBe(5)
    }
  })

  it('findAllSubsets returns empty for impossible', () => {
    expect(SubsetSum.findAllSubsets([1, 2], 10)).toEqual([])
  })

  it('countSubsets returns correct count', () => {
    expect(SubsetSum.countSubsets([1, 2, 3], 3)).toBe(2)
  })

  it('countSubsets handles target 0', () => {
    expect(SubsetSum.countSubsets([1, 2, 3], 0)).toBe(1)
  })

  it('handles single element matching target', () => {
    expect(SubsetSum.hasSubset([5], 5)).toBe(true)
    expect(SubsetSum.findSubset([5], 5)).toEqual([5])
  })

  it('handles single element not matching', () => {
    expect(SubsetSum.hasSubset([3], 5)).toBe(false)
  })

  it('findAllSubsets with duplicates in input', () => {
    const result = SubsetSum.findAllSubsets([1, 1, 2], 3)
    expect(result.length).toBe(2)
  })

  it('large target with small array', () => {
    expect(SubsetSum.hasSubset([1, 2], 100)).toBe(false)
  })

  it('findSubset returns subset with exact sum', () => {
    const result = SubsetSum.findSubset([2, 3, 7, 8, 10], 11)
    expect(result).not.toBeNull()
    expect(result!.reduce((a, b) => a + b, 0)).toBe(11)
  })

  it('countSubsets counts all ways', () => {
    expect(SubsetSum.countSubsets([1, 1, 1], 2)).toBe(3)
  })

  it('empty set sums to 0', () => {
    expect(SubsetSum.hasSubset([], 0)).toBe(true)
    expect(SubsetSum.hasSubset([], 1)).toBe(false)
  })
})
