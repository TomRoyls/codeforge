import { describe, expect, it } from 'vitest'
import { TopK } from '../../../src/utils/top-k.js'

describe('TopK', () => {
  it('creates with valid k', () => {
    const tk = new TopK<number>(5)
    expect(tk.k).toBe(5)
  })

  it('throws for k < 1', () => {
    expect(() => new TopK(0)).toThrow(RangeError)
    expect(() => new TopK(-1)).toThrow(RangeError)
  })

  it('starts empty', () => {
    const tk = new TopK<string>(3)
    expect(tk.size).toBe(0)
    expect(tk.isEmpty).toBe(true)
  })

  it('adds and retrieves top values', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    tk.add('b', 3)
    tk.add('c', 8)
    expect(tk.topValues).toEqual(['c', 'a', 'b'])
  })

  it('limits to k entries', () => {
    const tk = new TopK<string>(2)
    tk.add('a', 1)
    tk.add('b', 2)
    tk.add('c', 3)
    tk.add('d', 4)
    expect(tk.top.length).toBe(2)
    expect(tk.topValues).toEqual(['d', 'c'])
  })

  it('tracks size as unique values', () => {
    const tk = new TopK<string>(5)
    tk.add('a')
    tk.add('b')
    tk.add('c')
    expect(tk.size).toBe(3)
  })

  it('increments count for same value', () => {
    const tk = new TopK<string>(5)
    tk.add('a')
    tk.add('a')
    tk.add('a')
    expect(tk.getCount('a')).toBe(3)
    expect(tk.size).toBe(1)
  })

  it('add with count parameter', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 10)
    expect(tk.getCount('a')).toBe(10)
  })

  it('add ignores count <= 0', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 0)
    tk.add('b', -1)
    expect(tk.isEmpty).toBe(true)
  })

  it('has returns true for added values', () => {
    const tk = new TopK<string>(5)
    tk.add('a')
    expect(tk.has('a')).toBe(true)
    expect(tk.has('b')).toBe(false)
  })

  it('getCount returns 0 for missing values', () => {
    const tk = new TopK<string>(5)
    expect(tk.getCount('missing')).toBe(0)
  })

  it('k=1 returns only top value', () => {
    const tk = new TopK<string>(1)
    tk.add('a', 1)
    tk.add('b', 5)
    tk.add('c', 3)
    expect(tk.topValues).toEqual(['b'])
  })

  it('clears all entries', () => {
    const tk = new TopK<string>(5)
    tk.add('a')
    tk.add('b')
    tk.clear()
    expect(tk.size).toBe(0)
    expect(tk.isEmpty).toBe(true)
  })

  it('removes a value', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 5)
    expect(tk.remove('a')).toBe(true)
    expect(tk.has('a')).toBe(false)
    expect(tk.size).toBe(0)
  })

  it('remove returns false for missing value', () => {
    const tk = new TopK<string>(5)
    expect(tk.remove('missing')).toBe(false)
  })

  it('top entries have correct structure', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 5)
    const top = tk.top
    expect(top[0]).toEqual({ value: 'a', count: 5 })
  })

  it('handles ties', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 3)
    tk.add('b', 3)
    tk.add('c', 3)
    expect(tk.top.length).toBe(3)
    for (const entry of tk.top) {
      expect(entry.count).toBe(3)
    }
  })

  it('totalCount sums all counts', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 3)
    tk.add('b', 5)
    tk.add('c', 2)
    expect(tk.totalCount).toBe(10)
  })

  it('forEach iterates top entries', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    tk.add('b', 3)
    tk.add('c', 8)
    const values: string[] = []
    tk.forEach((entry) => values.push(entry.value))
    expect(values).toEqual(['c', 'a', 'b'])
  })

  it('merges two TopK instances', () => {
    const tk1 = new TopK<string>(5)
    tk1.add('a', 3)
    tk1.add('b', 2)
    const tk2 = new TopK<string>(5)
    tk2.add('a', 4)
    tk2.add('c', 1)
    const merged = tk1.merge(tk2)
    expect(merged.getCount('a')).toBe(7)
    expect(merged.getCount('b')).toBe(2)
    expect(merged.getCount('c')).toBe(1)
  })

  it('merge uses larger k', () => {
    const tk1 = new TopK<string>(3)
    const tk2 = new TopK<string>(10)
    const merged = tk1.merge(tk2)
    expect(merged.k).toBe(10)
  })

  it('handles numeric values', () => {
    const tk = new TopK<number>(3)
    tk.add(1, 10)
    tk.add(2, 20)
    tk.add(3, 5)
    expect(tk.topValues).toEqual([2, 1, 3])
  })

  it('handles many unique values', () => {
    const tk = new TopK<number>(5)
    for (let i = 0; i < 100; i++) tk.add(i, i)
    expect(tk.topValues[0]).toBe(99)
    expect(tk.top.length).toBe(5)
  })
})
