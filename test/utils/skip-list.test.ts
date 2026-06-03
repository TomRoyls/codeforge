import { describe, expect, it } from 'vitest'
import { SkipList } from '../../src/utils/skip-list.js'

// ─── Basics ───

describe('SkipList basics', () => {
  it('starts empty', () => {
    const sl = new SkipList<number, string>()
    expect(sl.size).toBe(0)
    expect(sl.min).toBeUndefined()
    expect(sl.max).toBeUndefined()
  })

  it('inserts and finds', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBe('a')
    expect(sl.contains(1)).toBe(true)
  })

  it('inserts multiple elements', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    expect(sl.size).toBe(3)
    expect(sl.find(3)).toBe('c')
    expect(sl.find(5)).toBe('e')
    expect(sl.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'old')
    sl.insert(1, 'new')
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBe('new')
  })

  it('returns undefined for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.find(99)).toBeUndefined()
    expect(sl.contains(99)).toBe(false)
  })
})

// ─── Min & Max ───

describe('SkipList min/max', () => {
  it('tracks min and max', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(2, 'b')
    sl.insert(8, 'h')
    sl.insert(1, 'a')
    expect(sl.min).toBe(1)
    expect(sl.max).toBe(8)
  })
})

// ─── ForEach ───

describe('SkipList forEach', () => {
  it('iterates in sorted order', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    sl.insert(1, 'a')
    const keys: number[] = []
    sl.forEach((k) => keys.push(k))
    expect(keys).toEqual([1, 3, 5, 7])
  })
})

// ─── Delete ───

describe('SkipList delete', () => {
  it('deletes an existing key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    expect(sl.delete(1)).toBe(true)
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.delete(99)).toBe(false)
  })

  it('deletes all keys', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(sl.delete(i)).toBe(true)
    }
    expect(sl.size).toBe(0)
  })

  it('maintains order after deletions', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    sl.delete(3)
    sl.delete(7)
    const keys: number[] = []
    sl.forEach((k) => keys.push(k))
    expect(keys).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Range Query ───

describe('SkipList range', () => {
  it('returns entries in range', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    const result = sl.range(3, 6)
    expect(result.map((e) => e.key)).toEqual([3, 4, 5, 6])
  })

  it('returns empty for no matches', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(10, 'j')
    expect(sl.range(5, 8)).toEqual([])
  })

  it('returns single match', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    expect(sl.range(5, 5).map((e) => e.key)).toEqual([5])
  })
})

// ─── Clear ───

describe('SkipList clear', () => {
  it('clears the list', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 5; i++) sl.insert(i, `v${i}`)
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.height).toBe(1)
  })
})

// ─── Custom Comparator ───

describe('SkipList custom comparator', () => {
  it('works with string keys', () => {
    const sl = new SkipList<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    sl.insert('banana', 2)
    sl.insert('apple', 1)
    sl.insert('cherry', 3)
    expect(sl.min).toBe('apple')
    expect(sl.max).toBe('cherry')
  })
})

// ─── Stress ───

describe('SkipList stress', () => {
  it('handles many sequential inserts', () => {
    const sl = new SkipList<number, number>()
    const n = 200
    for (let i = 0; i < n; i++) sl.insert(i, i)
    expect(sl.size).toBe(n)
    for (let i = 0; i < n; i++) {
      expect(sl.find(i)).toBe(i)
    }
  })

  it('find returns undefined for missing', () => {
    const sl = new SkipList<number>()
    expect(sl.find(999)).toBeUndefined()
  })

  it('size reflects inserted elements', () => {
    const sl = new SkipList<number>()
    sl.insert(1)
    sl.insert(2)
    sl.insert(3)
    expect(sl.size).toBe(3)
  })

  it('contains returns true for inserted', () => {
    const sl = new SkipList<number, string>()
    sl.insert(10, 'a')
    expect(sl.contains(10)).toBe(true)
    expect(sl.contains(20)).toBe(false)
  })

  it('size tracks insertions', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    expect(sl.size).toBe(2)
  })
})
