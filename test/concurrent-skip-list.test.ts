import { describe, it, expect } from 'vitest'
import { ConcurrentSkipList } from '../src/core/concurrent-skip-list/concurrent-skip-list.js'

// ─── Constructor ───

describe('ConcurrentSkipList', () => {
  it('creates with default options', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
    expect(sl.height()).toBe(0)
  })

  it('creates with custom options', () => {
    const sl = new ConcurrentSkipList<number, string>({
      maxLevel: 8,
      probability: 0.25,
    })
    expect(sl.size).toBe(0)
  })

  it('creates with custom comparator', () => {
    const sl = new ConcurrentSkipList<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    sl.insert('b', 2)
    sl.insert('a', 1)
    expect(sl.toArray()).toEqual([['a', 1], ['b', 2]])
  })

  // ─── insert ───

  it('inserts single element', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.size).toBe(1)
    expect(sl.isEmpty()).toBe(false)
  })

  it('inserts multiple elements in order', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    sl.insert(3, 'three')
    expect(sl.size).toBe(3)
    expect(sl.toArray()).toEqual([['1', 'one'], ['2', 'two'], ['3', 'three']].map(([k, v]) => [Number(k), v]))
  })

  it('inserts elements in reverse order', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(3, 'three')
    sl.insert(2, 'two')
    sl.insert(1, 'one')
    const arr = sl.toArray()
    expect(arr.map(e => e[0])).toEqual([1, 2, 3])
  })

  it('inserts elements in random order', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(5, 'five')
    sl.insert(1, 'one')
    sl.insert(3, 'three')
    sl.insert(2, 'two')
    sl.insert(4, 'four')
    const arr = sl.toArray()
    expect(arr.map(e => e[0])).toEqual([1, 2, 3, 4, 5])
  })

  it('overwrites value on duplicate key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'old')
    sl.insert(1, 'new')
    expect(sl.size).toBe(1)
    expect(sl.search(1)).toBe('new')
  })

  // ─── search ───

  it('searches for existing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    expect(sl.search(1)).toBe('one')
    expect(sl.search(2)).toBe('two')
  })

  it('returns undefined for missing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.search(99)).toBeUndefined()
  })

  it('returns undefined on empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.search(1)).toBeUndefined()
  })

  // ─── contains ───

  it('contains returns true for existing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.contains(1)).toBe(true)
  })

  it('contains returns false for missing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.contains(2)).toBe(false)
  })

  // ─── delete ───

  it('deletes existing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    expect(sl.delete(1)).toBe(true)
    expect(sl.size).toBe(1)
    expect(sl.search(1)).toBeUndefined()
  })

  it('returns false for deleting missing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.delete(99)).toBe(false)
    expect(sl.size).toBe(1)
  })

  it('returns false for deleting from empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.delete(1)).toBe(false)
  })

  it('can delete all elements', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    sl.insert(3, 'three')
    sl.delete(2)
    sl.delete(1)
    sl.delete(3)
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const sl = new ConcurrentSkipList<number, string>()
    for (let i = 1; i <= 5; i++) sl.insert(i, String(i))
    sl.delete(2)
    sl.delete(4)
    const arr = sl.toArray()
    expect(arr.map(e => e[0])).toEqual([1, 3, 5])
  })

  // ─── min / max ───

  it('returns min element', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(5, 'five')
    sl.insert(1, 'one')
    sl.insert(3, 'three')
    expect(sl.min()).toEqual([1, 'one'])
  })

  it('returns max element', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(5, 'five')
    sl.insert(1, 'one')
    sl.insert(3, 'three')
    expect(sl.max()).toEqual([5, 'five'])
  })

  it('returns undefined min/max on empty', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.min()).toBeUndefined()
    expect(sl.max()).toBeUndefined()
  })

  // ─── rangeQuery ───

  it('returns elements in range', () => {
    const sl = new ConcurrentSkipList<number, string>()
    for (let i = 1; i <= 10; i++) sl.insert(i, String(i))
    const result = sl.rangeQuery(3, 7)
    expect(result.map(e => e[0])).toEqual([3, 4, 5, 6, 7])
  })

  it('returns empty for inverted range', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.rangeQuery(5, 1)).toEqual([])
  })

  it('returns single element for exact range', () => {
    const sl = new ConcurrentSkipList<number, string>()
    for (let i = 1; i <= 5; i++) sl.insert(i, String(i))
    const result = sl.rangeQuery(3, 3)
    expect(result).toEqual([[3, '3']])
  })

  it('returns empty for gap range', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(10, 'ten')
    const result = sl.rangeQuery(3, 7)
    expect(result).toEqual([])
  })

  it('returns empty on empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.rangeQuery(1, 5)).toEqual([])
  })

  // ─── getRank ───

  it('returns rank of existing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(10, 'ten')
    sl.insert(20, 'twenty')
    sl.insert(30, 'thirty')
    expect(sl.getRank(10)).toBe(0)
    expect(sl.getRank(20)).toBe(1)
    expect(sl.getRank(30)).toBe(2)
  })

  it('returns -1 for missing key', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.getRank(99)).toBe(-1)
  })

  it('returns -1 on empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.getRank(1)).toBe(-1)
  })

  // ─── atIndex ───

  it('returns element at index', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(10, 'ten')
    sl.insert(20, 'twenty')
    sl.insert(30, 'thirty')
    expect(sl.atIndex(0)).toEqual([10, 'ten'])
    expect(sl.atIndex(1)).toEqual([20, 'twenty'])
    expect(sl.atIndex(2)).toEqual([30, 'thirty'])
  })

  it('returns undefined for out of bounds index', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    expect(sl.atIndex(-1)).toBeUndefined()
    expect(sl.atIndex(1)).toBeUndefined()
  })

  it('returns undefined on empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.atIndex(0)).toBeUndefined()
  })

  // ─── forEach ───

  it('iterates all elements in order', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(3, 'three')
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    const result: [number, string][] = []
    sl.forEach((v, k) => result.push([k, v]))
    expect(result).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
  })

  it('does nothing on empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    let count = 0
    sl.forEach(() => count++)
    expect(count).toBe(0)
  })

  // ─── toArray ───

  it('returns sorted array', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(3, 'c')
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    expect(sl.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('returns empty array for empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    expect(sl.toArray()).toEqual([])
  })

  // ─── clear ───

  it('clears all elements', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
    expect(sl.height()).toBe(0)
  })

  it('allows insert after clear', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'old')
    sl.clear()
    sl.insert(2, 'new')
    expect(sl.size).toBe(1)
    expect(sl.search(2)).toBe('new')
  })

  // ─── clone ───

  it('clones all elements', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    const cl = sl.clone()
    expect(cl.size).toBe(2)
    expect(cl.search(1)).toBe('one')
    expect(cl.search(2)).toBe('two')
  })

  it('clone is independent', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    const cl = sl.clone()
    cl.insert(2, 'two')
    expect(sl.size).toBe(1)
    expect(cl.size).toBe(2)
  })

  // ─── static from ───

  it('creates from array of entries', () => {
    const sl = ConcurrentSkipList.from<number, string>([[3, 'c'], [1, 'a'], [2, 'b']])
    expect(sl.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('creates from empty array', () => {
    const sl = ConcurrentSkipList.from<number, string>([])
    expect(sl.isEmpty()).toBe(true)
  })

  it('creates from array with options', () => {
    const sl = ConcurrentSkipList.from<number, string>([[1, 'a']], { maxLevel: 4 })
    expect(sl.size).toBe(1)
  })

  // ─── stats ───

  it('returns stats with correct size', () => {
    const sl = new ConcurrentSkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, String(i))
    const s = sl.stats()
    expect(s.size).toBe(10)
    expect(s.maxLevel).toBe(16)
    expect(s.probability).toBe(0.5)
    expect(s.height).toBeGreaterThan(0)
  })

  it('stats on empty list', () => {
    const sl = new ConcurrentSkipList<number, string>()
    const s = sl.stats()
    expect(s.size).toBe(0)
    expect(s.height).toBe(0)
    expect(s.nodeCount).toBe(0)
  })

  // ─── Edge cases ───

  it('handles string keys', () => {
    const sl = new ConcurrentSkipList<string, number>()
    sl.insert('cherry', 3)
    sl.insert('apple', 1)
    sl.insert('banana', 2)
    const arr = sl.toArray()
    expect(arr.map(e => e[0])).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles negative keys', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(-3, 'a')
    sl.insert(0, 'b')
    sl.insert(3, 'c')
    const arr = sl.toArray()
    expect(arr.map(e => e[0])).toEqual([-3, 0, 3])
  })

  it('handles large number of insertions', () => {
    const sl = new ConcurrentSkipList<number, number>()
    for (let i = 0; i < 500; i++) {
      sl.insert(i, i * 10)
    }
    expect(sl.size).toBe(500)
    expect(sl.min()![0]).toBe(0)
    expect(sl.max()![0]).toBe(499)
    expect(sl.search(250)).toBe(2500)
  })

  it('insert-delete-insert cycle', () => {
    const sl = new ConcurrentSkipList<number, string>()
    sl.insert(1, 'one')
    sl.delete(1)
    sl.insert(1, 'one-again')
    expect(sl.search(1)).toBe('one-again')
    expect(sl.size).toBe(1)
  })

  it('height decreases after deleting tall nodes', () => {
    const sl = new ConcurrentSkipList<number, string>({ maxLevel: 4, probability: 0.99 })
    for (let i = 0; i < 10; i++) sl.insert(i, String(i))
    const h = sl.height()
    for (let i = 0; i < 10; i++) sl.delete(i)
    expect(sl.height()).toBe(0)
    expect(h).toBeGreaterThan(0)
  })

  it('rank and atIndex are consistent', () => {
    const sl = new ConcurrentSkipList<number, string>()
    for (let i = 0; i < 20; i++) sl.insert(i * 2, String(i))
    for (let i = 0; i < 20; i++) {
      const key = i * 2
      const rank = sl.getRank(key)
      expect(rank).toBe(i)
      const atIdx = sl.atIndex(i)
      expect(atIdx).toEqual([key, String(i)])
    }
  })

  it('range query after deletions', () => {
    const sl = new ConcurrentSkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, String(i))
    sl.delete(3)
    sl.delete(5)
    sl.delete(7)
    const result = sl.rangeQuery(2, 8)
    expect(result.map(e => e[0])).toEqual([2, 4, 6, 8])
  })
})
