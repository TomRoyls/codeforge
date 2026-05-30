import { describe, expect, it } from 'vitest'

import { SkipList } from '../../../src/utils/skip-list.js'

describe('SkipList', () => {
  it('inserts and finds a value', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    expect(list.find(1)).toBe('one')
  })

  it('returns undefined for missing key', () => {
    const list = new SkipList<number, string>()
    expect(list.find(99)).toBeUndefined()
  })

  it('updates existing key', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    list.insert(1, 'updated')
    expect(list.find(1)).toBe('updated')
    expect(list.size).toBe(1)
  })

  it('tracks size correctly', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    list.insert(2, 'b')
    list.insert(3, 'c')
    expect(list.size).toBe(3)
  })

  it('deletes a key', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    expect(list.delete(1)).toBe(true)
    expect(list.find(1)).toBeUndefined()
    expect(list.size).toBe(0)
  })

  it('returns false deleting missing key', () => {
    const list = new SkipList<number, string>()
    expect(list.delete(99)).toBe(false)
  })

  it('contains returns true for existing key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    expect(list.contains(5)).toBe(true)
  })

  it('contains returns false for missing key', () => {
    const list = new SkipList<number, string>()
    expect(list.contains(5)).toBe(false)
  })

  it('returns min key', () => {
    const list = new SkipList<number, string>()
    list.insert(10, 'ten')
    list.insert(5, 'five')
    list.insert(15, 'fifteen')
    expect(list.min).toBe(5)
  })

  it('returns undefined min for empty list', () => {
    const list = new SkipList<number, string>()
    expect(list.min).toBeUndefined()
  })

  it('returns max key', () => {
    const list = new SkipList<number, string>()
    list.insert(10, 'ten')
    list.insert(5, 'five')
    list.insert(15, 'fifteen')
    expect(list.max).toBe(15)
  })

  it('returns undefined max for empty list', () => {
    const list = new SkipList<number, string>()
    expect(list.max).toBeUndefined()
  })

  it('forEach iterates all entries in order', () => {
    const list = new SkipList<number, string>()
    list.insert(3, 'c')
    list.insert(1, 'a')
    list.insert(2, 'b')
    const entries: Array<{ key: number; value: string }> = []
    list.forEach((key, value) => entries.push({ key, value }))
    expect(entries).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
    ])
  })

  it('clears the list', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    list.insert(2, 'b')
    list.clear()
    expect(list.size).toBe(0)
    expect(list.min).toBeUndefined()
  })

  it('range returns entries between bounds', () => {
    const list = new SkipList<number, string>()
    for (let i = 1; i <= 10; i++) {
      list.insert(i, `val-${i}`)
    }
    const range = list.range(3, 7)
    expect(range).toHaveLength(5)
    expect(range[0]!.key).toBe(3)
    expect(range[4]!.key).toBe(7)
  })

  it('range returns empty for no matches', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    const range = list.range(10, 20)
    expect(range).toHaveLength(0)
  })

  it('handles string keys with custom comparator', () => {
    const list = new SkipList<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    list.insert('banana', 2)
    list.insert('apple', 1)
    list.insert('cherry', 3)
    expect(list.find('banana')).toBe(2)
    expect(list.min).toBe('apple')
    expect(list.max).toBe('cherry')
  })

  it('handles many insertions', () => {
    const list = new SkipList<number, number>()
    for (let i = 0; i < 1000; i++) {
      list.insert(i, i * 10)
    }
    expect(list.size).toBe(1000)
    expect(list.min).toBe(0)
    expect(list.max).toBe(999)
    expect(list.find(500)).toBe(5000)
  })

  it('handles deletion and reinsertion', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    list.delete(1)
    list.insert(1, 'new-one')
    expect(list.find(1)).toBe('new-one')
    expect(list.size).toBe(1)
  })

  it('height stays within maxHeight', () => {
    const list = new SkipList<number, string>({ maxHeight: 8 })
    for (let i = 0; i < 100; i++) {
      list.insert(i, `v${i}`)
    }
    expect(list.height).toBeLessThanOrEqual(8)
  })

  it('range with equal min and max returns single entry', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    list.insert(2, 'b')
    list.insert(3, 'c')
    const range = list.range(2, 2)
    expect(range).toHaveLength(1)
    expect(range[0]!.value).toBe('b')
  })

  it('handles many deletions', () => {
    const list = new SkipList<number, string>()
    for (let i = 0; i < 200; i++) {
      list.insert(i, `v${i}`)
    }
    for (let i = 0; i < 200; i++) {
      expect(list.delete(i)).toBe(true)
    }
    expect(list.size).toBe(0)
    expect(list.size === 0).toBe(true)
  })

  it('handles negative numbers', () => {
    const list = new SkipList<number, string>()
    list.insert(-5, 'neg')
    list.insert(-3, 'neg3')
    list.insert(5, 'pos')
    expect(list.min).toBe(-5)
    expect(list.max).toBe(5)
    expect(list.find(-3)).toBe('neg3')
  })

  it('returns correct isEmpty status via size', () => {
    const list = new SkipList<number, string>()
    expect(list.size === 0).toBe(true)
    list.insert(1, 'a')
    expect(list.size === 0).toBe(false)
    list.clear()
    expect(list.size === 0).toBe(true)
  })

  it('deletes min element', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    list.insert(2, 'b')
    list.insert(3, 'c')
    list.delete(1)
    expect(list.min).toBe(2)
  })

  it('deletes max element', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    list.insert(2, 'b')
    list.insert(3, 'c')
    list.delete(3)
    expect(list.max).toBe(2)
  })

  it('handles interleaved inserts and deletes', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'a')
    list.insert(2, 'b')
    list.insert(3, 'c')
    list.delete(2)
    list.insert(4, 'd')
    expect(list.size).toBe(3)
    expect(list.contains(2)).toBe(false)
    expect(list.contains(4)).toBe(true)
  })

  it('handles many random operations', () => {
    const list = new SkipList<number, number>()
    for (let i = 0; i < 100; i++) {
      list.insert(i, i * 2)
    }
    for (let i = 0; i < 50; i++) {
      list.delete(i * 2)
    }
    expect(list.size).toBe(50)
  })

  it('maintains sorted iteration after many operations', () => {
    const list = new SkipList<number, string>()
    for (let i = 99; i >= 0; i--) {
      list.insert(i, `v${i}`)
    }
    const keys: number[] = []
    list.forEach((k) => keys.push(k))
    expect(keys[0]).toBe(0)
    expect(keys[keys.length - 1]).toBe(99)
  })
})
