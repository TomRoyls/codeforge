import { describe, it, expect } from 'vitest'
import { TopK } from '../src/utils/top-k.js'

// ─── Constructor ───

describe('TopK', () => {
  it('creates instance with valid k', () => {
    const tk = new TopK<string>(3)
    expect(tk.k).toBe(3)
    expect(tk.size).toBe(0)
    expect(tk.isEmpty).toBe(true)
  })

  it('throws for k < 1', () => {
    expect(() => new TopK(0)).toThrow(RangeError)
    expect(() => new TopK(-1)).toThrow(RangeError)
  })

  // ─── Add ───

  it('add increments count for values', () => {
    const tk = new TopK<string>(3)
    tk.add('a')
    tk.add('a')
    tk.add('b')
    expect(tk.getCount('a')).toBe(2)
    expect(tk.getCount('b')).toBe(1)
    expect(tk.getCount('c')).toBe(0)
  })

  it('add with count parameter', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    expect(tk.getCount('a')).toBe(5)
  })

  it('add ignores non-positive count', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 0)
    tk.add('a', -1)
    expect(tk.getCount('a')).toBe(0)
  })

  // ─── Top ───

  it('top returns sorted entries limited to k', () => {
    const tk = new TopK<string>(2)
    tk.add('a', 1)
    tk.add('b', 5)
    tk.add('c', 3)
    const top = tk.top
    expect(top).toHaveLength(2)
    expect(top[0]).toEqual({ value: 'b', count: 5 })
    expect(top[1]).toEqual({ value: 'c', count: 3 })
  })

  it('top returns fewer than k if not enough values', () => {
    const tk = new TopK<string>(10)
    tk.add('a')
    tk.add('b', 2)
    expect(tk.top).toHaveLength(2)
  })

  it('topValues returns just the values', () => {
    const tk = new TopK<number>(2)
    tk.add(1, 10)
    tk.add(2, 20)
    tk.add(3, 5)
    expect(tk.topValues).toEqual([2, 1])
  })

  it('top on empty returns empty array', () => {
    const tk = new TopK<number>(5)
    expect(tk.top).toEqual([])
    expect(tk.topValues).toEqual([])
  })

  // ─── Has ───

  it('has checks value existence', () => {
    const tk = new TopK<string>(3)
    tk.add('a')
    expect(tk.has('a')).toBe(true)
    expect(tk.has('b')).toBe(false)
  })

  // ─── Size / totalCount ───

  it('size returns unique value count', () => {
    const tk = new TopK<string>(5)
    tk.add('a')
    tk.add('a')
    tk.add('b')
    expect(tk.size).toBe(2)
  })

  it('totalCount sums all counts', () => {
    const tk = new TopK<string>(5)
    tk.add('a', 3)
    tk.add('b', 7)
    expect(tk.totalCount).toBe(10)
  })

  it('totalCount is 0 when empty', () => {
    const tk = new TopK<string>(5)
    expect(tk.totalCount).toBe(0)
  })

  // ─── Remove ───

  it('remove deletes a value', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    expect(tk.remove('a')).toBe(true)
    expect(tk.has('a')).toBe(false)
    expect(tk.remove('a')).toBe(false)
  })

  // ─── Clear ───

  it('clear resets everything', () => {
    const tk = new TopK<string>(3)
    tk.add('a')
    tk.add('b')
    tk.clear()
    expect(tk.size).toBe(0)
    expect(tk.isEmpty).toBe(true)
    expect(tk.totalCount).toBe(0)
  })

  // ─── Merge ───

  it('merge combines two TopK instances', () => {
    const tk1 = new TopK<string>(3)
    tk1.add('a', 5)
    tk1.add('b', 2)
    const tk2 = new TopK<string>(3)
    tk2.add('a', 3)
    tk2.add('c', 10)
    const merged = tk1.merge(tk2)
    expect(merged.getCount('a')).toBe(8)
    expect(merged.getCount('b')).toBe(2)
    expect(merged.getCount('c')).toBe(10)
    expect(merged.k).toBe(3)
  })

  it('merge uses max k', () => {
    const tk1 = new TopK<string>(2)
    const tk2 = new TopK<string>(5)
    const merged = tk1.merge(tk2)
    expect(merged.k).toBe(5)
  })

  it('merge does not modify originals', () => {
    const tk1 = new TopK<string>(3)
    tk1.add('a', 5)
    const tk2 = new TopK<string>(3)
    tk2.add('a', 3)
    tk1.merge(tk2)
    expect(tk1.getCount('a')).toBe(5)
    expect(tk2.getCount('a')).toBe(3)
  })

  // ─── ForEach ───

  it('forEach iterates top k entries in order', () => {
    const tk = new TopK<string>(2)
    tk.add('a', 1)
    tk.add('b', 3)
    tk.add('c', 2)
    const entries: string[] = []
    tk.forEach((e) => entries.push(e.value))
    expect(entries).toEqual(['b', 'c'])
  })

  // ─── Edge cases ───

  it('handles k=1', () => {
    const tk = new TopK<string>(1)
    tk.add('a', 1)
    tk.add('b', 5)
    tk.add('c', 3)
    expect(tk.topValues).toEqual(['b'])
  })

  it('handles many unique values', () => {
    const tk = new TopK<number>(5)
    for (let i = 0; i < 100; i++) {
      tk.add(i, 100 - i)
    }
    expect(tk.top).toHaveLength(5)
    expect(tk.topValues).toEqual([0, 1, 2, 3, 4])
  })

  it('handles equal counts', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    tk.add('b', 5)
    tk.add('c', 5)
    expect(tk.top).toHaveLength(3)
    expect(tk.totalCount).toBe(15)
  })

  it('works with number keys', () => {
    const tk = new TopK<number>(3)
    tk.add(42, 10)
    tk.add(7, 20)
    expect(tk.topValues[0]).toBe(7)
  })

  it('works with object keys', () => {
    const tk = new TopK<{ id: number }>(3)
    const obj = { id: 1 }
    tk.add(obj, 5)
    expect(tk.has(obj)).toBe(true)
    expect(tk.getCount(obj)).toBe(5)
  })
})
