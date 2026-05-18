import { beforeEach, describe, expect, it } from 'vitest'
import { SkipList } from '../src/utils/skip-list.js'

// ─── Constructor ───
describe('SkipList constructor', () => {
  it('creates list with defaults', () => {
    const sl = new SkipList<number, string>()
    expect(sl.size).toBe(0)
    expect(sl.height).toBe(1)
  })

  it('creates list with custom maxHeight', () => {
    const sl = new SkipList<number, string>({ maxHeight: 16 })
    expect(sl.size).toBe(0)
  })

  it('creates list with custom comparator', () => {
    const sl = new SkipList<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    sl.insert('banana', 2)
    sl.insert('apple', 1)
    expect(sl.min).toBe('apple')
    expect(sl.max).toBe('banana')
  })
})

// ─── Insert ───
describe('SkipList insert', () => {
  it('adds elements and increments size', () => {
    const sl = new SkipList<number, string>()
    expect(sl.size).toBe(0)
    sl.insert(3, 'three')
    expect(sl.size).toBe(1)
    sl.insert(1, 'one')
    expect(sl.size).toBe(2)
    sl.insert(2, 'two')
    expect(sl.size).toBe(3)
  })
})

// ─── Find ───
describe('SkipList find', () => {
  it('returns value for existing key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(42, 'answer')
    expect(sl.find(42)).toBe('answer')
  })

  it('returns undefined for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.find(99)).toBeUndefined()
  })
})

// ─── Contains ───
describe('SkipList contains', () => {
  it('returns true for existing key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'five')
    expect(sl.contains(5)).toBe(true)
  })

  it('returns false for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.contains(5)).toBe(false)
  })
})

// ─── Delete ───
describe('SkipList delete', () => {
  it('removes element and returns true', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'one')
    sl.insert(2, 'two')
    sl.insert(3, 'three')
    expect(sl.delete(2)).toBe(true)
    expect(sl.size).toBe(2)
    expect(sl.find(2)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.delete(99)).toBe(false)
  })
})

// ─── Min / Max ───
describe('SkipList min/max', () => {
  it('returns correct min and max', () => {
    const sl = new SkipList<number, string>()
    sl.insert(10, 'a')
    sl.insert(5, 'b')
    sl.insert(20, 'c')
    expect(sl.min).toBe(5)
    expect(sl.max).toBe(20)
  })

  it('returns undefined on empty list', () => {
    const sl = new SkipList<number, string>()
    expect(sl.min).toBeUndefined()
    expect(sl.max).toBeUndefined()
  })
})

// ─── forEach ───
describe('SkipList forEach', () => {
  it('visits all elements in sorted order', () => {
    const sl = new SkipList<number, string>()
    sl.insert(3, 'c')
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    const keys: number[] = []
    const values: string[] = []
    sl.forEach((k, v) => {
      keys.push(k)
      values.push(v)
    })
    expect(keys).toEqual([1, 2, 3])
    expect(values).toEqual(['a', 'b', 'c'])
  })
})

// ─── Range ───
describe('SkipList range', () => {
  it('returns entries within range inclusive', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(3, 'c')
    sl.insert(5, 'e')
    sl.insert(7, 'g')
    sl.insert(9, 'i')
    const result = sl.range(3, 7)
    expect(result.map((e) => e.key)).toEqual([3, 5, 7])
    expect(result.map((e) => e.value)).toEqual(['c', 'e', 'g'])
  })

  it('excludes entries outside range', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(10, 'j')
    const result = sl.range(3, 7)
    expect(result).toEqual([])
  })
})

// ─── Clear ───
describe('SkipList clear', () => {
  it('empties the list', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.height).toBe(1)
    expect(sl.min).toBeUndefined()
    expect(sl.max).toBeUndefined()
  })
})

// ─── Sorted Order ───
describe('SkipList sorted order', () => {
  it('insert 100 random numbers and verify forEach gives ascending order', () => {
    const sl = new SkipList<number, number>()
    const nums = Array.from({ length: 100 }, () => Math.floor(Math.random() * 10000))
    for (const n of nums) {
      sl.insert(n, n)
    }
    const sorted = [...new Set(nums)].sort((a, b) => a - b)
    const result: number[] = []
    sl.forEach((k) => result.push(k))
    expect(result).toEqual(sorted)
  })
})

// ─── Duplicate Key ───
describe('SkipList duplicate key', () => {
  it('updates value on duplicate insert, size stays same', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'first')
    expect(sl.size).toBe(1)
    sl.insert(1, 'second')
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBe('second')
  })
})

// ─── Custom Comparator ───
describe('SkipList custom comparator', () => {
  it('sorts string keys alphabetically', () => {
    const sl = new SkipList<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    sl.insert('cherry', 3)
    sl.insert('apple', 1)
    sl.insert('banana', 2)
    sl.insert('date', 4)
    const keys: string[] = []
    sl.forEach((k) => keys.push(k))
    expect(keys).toEqual(['apple', 'banana', 'cherry', 'date'])
    expect(sl.min).toBe('apple')
    expect(sl.max).toBe('date')
  })
})
