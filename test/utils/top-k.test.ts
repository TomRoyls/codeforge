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
