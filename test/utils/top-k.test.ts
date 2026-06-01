import { describe, it, expect } from 'vitest'
import { TopK } from '../../src/utils/top-k.js'

// ─── Constructor ──────────────────────────────────────────
describe('TopK - constructor', () => {
  it('creates with valid k', () => {
    const tk = new TopK<string>(5)
    expect(tk.k).toBe(5)
    expect(tk.isEmpty).toBe(true)
  })

  it('throws on k < 1', () => {
    expect(() => new TopK(0)).toThrow(RangeError)
  })
})

// ─── Add and Query ────────────────────────────────────────
describe('TopK - add and query', () => {
  it('returns top k items', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    tk.add('b', 10)
    tk.add('c', 3)
    tk.add('d', 7)
    expect(tk.topValues).toEqual(['b', 'd', 'a'])
  })

  it('has and getCount', () => {
    const tk = new TopK<string>(3)
    tk.add('x', 5)
    expect(tk.has('x')).toBe(true)
    expect(tk.getCount('x')).toBe(5)
    expect(tk.getCount('y')).toBe(0)
  })

  it('tracks size and totalCount', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 2)
    tk.add('b', 3)
    expect(tk.size).toBe(2)
    expect(tk.totalCount).toBe(5)
  })

  it('ignores non-positive counts', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 0)
    tk.add('a', -1)
    expect(tk.has('a')).toBe(false)
  })
})

// ─── Remove and Clear ─────────────────────────────────────
describe('TopK - remove and clear', () => {
  it('removes value', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    expect(tk.remove('a')).toBe(true)
    expect(tk.remove('a')).toBe(false)
    expect(tk.isEmpty).toBe(true)
  })

  it('clears all', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 5)
    tk.add('b', 3)
    tk.clear()
    expect(tk.size).toBe(0)
  })
})

// ─── Merge and forEach ────────────────────────────────────
describe('TopK - merge and forEach', () => {
  it('merges two TopKs', () => {
    const tk1 = new TopK<string>(3)
    tk1.add('a', 5)
    const tk2 = new TopK<string>(3)
    tk2.add('a', 3)
    tk2.add('b', 10)
    const merged = tk1.merge(tk2)
    expect(merged.getCount('a')).toBe(8)
    expect(merged.getCount('b')).toBe(10)
  })

  it('forEach iterates top entries', () => {
    const tk = new TopK<string>(2)
    tk.add('a', 5)
    tk.add('b', 10)
    const entries: string[] = []
    tk.forEach((e) => entries.push(e.value))
    expect(entries).toEqual(['b', 'a'])
  })
})

describe('TopK - edge cases', () => {
  it('top returns entries sorted by count descending', () => {
    const tk = new TopK<number>(3)
    tk.add(1, 100)
    tk.add(2, 50)
    tk.add(3, 75)
    const top = tk.top
    expect(top[0]!.count).toBe(100)
    expect(top[1]!.count).toBe(75)
    expect(top[2]!.count).toBe(50)
  })

  it('adds default count of 1', () => {
    const tk = new TopK<string>(3)
    tk.add('x')
    expect(tk.getCount('x')).toBe(1)
  })

  it('accumulates counts for same value', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 3)
    tk.add('a', 2)
    expect(tk.getCount('a')).toBe(5)
  })

  it('merge uses larger k', () => {
    const tk1 = new TopK<string>(2)
    tk1.add('a', 1)
    const tk2 = new TopK<string>(5)
    tk2.add('b', 1)
    const merged = tk1.merge(tk2)
    expect(merged.k).toBe(5)
  })

  it('works with k=1', () => {
    const tk = new TopK<string>(1)
    tk.add('a', 5)
    tk.add('b', 10)
    tk.add('c', 3)
    expect(tk.topValues).toEqual(['b'])
  })

  it('handles large stream of values', () => {
    const tk = new TopK<number>(5)
    for (let i = 0; i < 1000; i++) {
      tk.add(i % 10)
    }
    expect(tk.topValues).toHaveLength(5)
    expect(tk.totalCount).toBe(1000)
  })

  it('clear allows re-adding', () => {
    const tk = new TopK<string>(3)
    tk.add('a', 10)
    tk.clear()
    tk.add('b', 5)
    expect(tk.getCount('a')).toBe(0)
    expect(tk.getCount('b')).toBe(5)
    expect(tk.topValues).toEqual(['b'])
  })

  it('empty tracker has no top values', () => {
    const tk = new TopK<string>(3)
    expect(tk.topValues).toEqual([])
  })
})
