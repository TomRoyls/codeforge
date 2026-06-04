import { describe, expect, it } from 'vitest'
import { SparseSet } from '../../src/utils/sparse-set.js'

describe('SparseSet', () => {
  it('add and has', () => {
    const ss = new SparseSet(10)
    expect(ss.add(3)).toBe(true)
    expect(ss.has(3)).toBe(true)
    expect(ss.has(4)).toBe(false)
  })

  it('duplicate add returns false', () => {
    const ss = new SparseSet(10)
    ss.add(5)
    expect(ss.add(5)).toBe(false)
  })

  it('remove element', () => {
    const ss = new SparseSet(10)
    ss.add(1)
    ss.add(2)
    ss.add(3)
    expect(ss.remove(2)).toBe(true)
    expect(ss.has(2)).toBe(false)
    expect(ss.size).toBe(2)
  })

  it('remove non-existent returns false', () => {
    const ss = new SparseSet(10)
    expect(ss.remove(5)).toBe(false)
  })

  it('values returns all elements', () => {
    const ss = new SparseSet(10)
    ss.add(3)
    ss.add(1)
    ss.add(7)
    expect(ss.values().sort()).toEqual([1, 3, 7])
  })

  it('clear removes all', () => {
    const ss = new SparseSet(10)
    ss.add(1)
    ss.add(2)
    ss.clear()
    expect(ss.size).toBe(0)
    expect(ss.has(1)).toBe(false)
  })

  it('iterates over elements', () => {
    const ss = new SparseSet(10)
    ss.add(2)
    ss.add(4)
    const result: number[] = []
    for (const v of ss) result.push(v)
    expect(result.sort()).toEqual([2, 4])
  })

  it('handles out of range has', () => {
    const ss = new SparseSet(10)
    expect(ss.has(-1)).toBe(false)
    expect(ss.has(10)).toBe(false)
  })

  it('add after remove works', () => {
    const ss = new SparseSet(10)
    ss.add(5)
    ss.remove(5)
    ss.add(5)
    expect(ss.has(5)).toBe(true)
    expect(ss.size).toBe(1)
  })

  it('size tracks correctly', () => {
    const ss = new SparseSet(100)
    expect(ss.size).toBe(0)
    ss.add(10)
    ss.add(20)
    expect(ss.size).toBe(2)
  })

  it('handles large universe', () => {
    const ss = new SparseSet(10000)
    ss.add(0)
    ss.add(9999)
    expect(ss.has(0)).toBe(true)
    expect(ss.has(9999)).toBe(true)
  })

  it('multiple add-remove cycles', () => {
    const ss = new SparseSet(10)
    ss.add(5)
    ss.remove(5)
    ss.add(5)
    ss.remove(5)
    ss.add(5)
    expect(ss.has(5)).toBe(true)
    expect(ss.size).toBe(1)
  })

  it('clear removes all', () => {
    const ss = new SparseSet(10)
    ss.add(1)
    ss.add(2)
    ss.add(3)
    ss.clear()
    expect(ss.size).toBe(0)
    expect(ss.has(1)).toBe(false)
  })

  it('empty set iterates nothing', () => {
    const ss = new SparseSet(10)
    const result: number[] = []
    for (const v of ss) result.push(v)
    expect(result).toEqual([])
  })

  it('add and has for zero', () => {
    const ss = new SparseSet(5)
    ss.add(0)
    expect(ss.has(0)).toBe(true)
    expect(ss.size).toBe(1)
  })

  it('values returns all inserted', () => {
    const ss = new SparseSet(10)
    ss.add(3)
    ss.add(7)
    ss.add(1)
    const vals = [...ss]
    expect(vals.sort()).toEqual([1, 3, 7])
  })

  it('has returns false for missing', () => {
    const ss = new SparseSet(10)
    ss.add(5)
    expect(ss.has(5)).toBe(true)
    expect(ss.has(3)).toBe(false)
  })

  it('remove clears membership', () => {
    const ss = new SparseSet(10)
    ss.add(5)
    ss.remove(5)
    expect(ss.has(5)).toBe(false)
  })

  it('clear removes all elements', () => {
    const ss = new SparseSet()
    ss.add(1)
    ss.add(2)
    ss.clear()
    expect(ss.has(1)).toBe(false)
    expect(ss.has(2)).toBe(false)
  })

  it('remove returns false for absent', () => {
    const ss = new SparseSet(10)
    expect(ss.remove(5)).toBe(false)
  })

  it('has returns false for removed value', () => {
    const ss = new SparseSet(10)
    ss.add(3)
    ss.remove(3)
    expect(ss.has(3)).toBe(false)
  })

  it('size tracks elements', () => {
    const ss = new SparseSet()
    ss.add(1)
    ss.add(2)
    expect(ss.size).toBe(2)
  })

  it('has returns false for non-member', () => {
    const ss = new SparseSet(10)
    ss.add(1)
    expect(ss.has(5)).toBe(false)
  })

  it('has returns true for added element', () => {
    const ss = new SparseSet(10)
    ss.add(3)
    expect(ss.has(3)).toBe(true)
  })
})
