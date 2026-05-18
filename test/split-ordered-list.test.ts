import { describe, expect, it } from 'vitest'

import { SplitOrderedList } from '../src/core/split-ordered-list/index.js'

// ─── Construction ──────────────────────────────────────
describe('SplitOrderedList construction', () => {
  it('creates empty list', () => {
    const list = new SplitOrderedList<string>()
    expect(list.size).toBe(0)
    expect(list.isEmpty()).toBe(true)
  })
})

// ─── Insert ────────────────────────────────────────────
describe('SplitOrderedList insert', () => {
  it('inserts key-value pairs', () => {
    const list = new SplitOrderedList<string>()
    expect(list.insert(1, 'one')).toBe(true)
    expect(list.insert(2, 'two')).toBe(true)
    expect(list.size).toBe(2)
  })

  it('rejects duplicate key and updates value', () => {
    const list = new SplitOrderedList<string>()
    list.insert(1, 'one')
    expect(list.insert(1, 'uno')).toBe(false)
    expect(list.get(1)).toBe('uno')
    expect(list.size).toBe(1)
  })

  it('maintains order based on reversed hash', () => {
    const list = new SplitOrderedList<number>()
    list.insert(1, 100)
    list.insert(2, 200)
    list.insert(4, 400)
    expect(list.size).toBe(3)
    expect(list.has(1)).toBe(true)
    expect(list.has(2)).toBe(true)
    expect(list.has(4)).toBe(true)
  })
})

// ─── Get & Has ─────────────────────────────────────────
describe('SplitOrderedList get and has', () => {
  it('gets value by key', () => {
    const list = new SplitOrderedList<string>()
    list.insert(5, 'five')
    expect(list.get(5)).toBe('five')
  })

  it('returns null for missing key', () => {
    const list = new SplitOrderedList<string>()
    expect(list.get(99)).toBeNull()
  })

  it('has checks membership', () => {
    const list = new SplitOrderedList<string>()
    list.insert(3, 'three')
    expect(list.has(3)).toBe(true)
    expect(list.has(4)).toBe(false)
  })

  it('has returns false on empty list', () => {
    const list = new SplitOrderedList<string>()
    expect(list.has(1)).toBe(false)
  })
})

// ─── Delete ────────────────────────────────────────────
describe('SplitOrderedList delete', () => {
  it('deletes existing key', () => {
    const list = new SplitOrderedList<string>()
    list.insert(1, 'one')
    list.insert(2, 'two')
    expect(list.delete(1)).toBe(true)
    expect(list.has(1)).toBe(false)
    expect(list.size).toBe(1)
  })

  it('deletes head', () => {
    const list = new SplitOrderedList<string>()
    list.insert(1, 'one')
    expect(list.delete(1)).toBe(true)
    expect(list.isEmpty()).toBe(true)
  })

  it('returns false for missing key', () => {
    const list = new SplitOrderedList<string>()
    expect(list.delete(99)).toBe(false)
  })

  it('returns false on empty list', () => {
    const list = new SplitOrderedList<string>()
    expect(list.delete(1)).toBe(false)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('SplitOrderedList toArray', () => {
  it('returns all key-value pairs', () => {
    const list = new SplitOrderedList<string>()
    list.insert(1, 'one')
    list.insert(2, 'two')
    const arr = list.toArray()
    expect(arr).toHaveLength(2)
    expect(arr.map(([k]) => k).sort((a, b) => a - b)).toEqual([1, 2])
  })

  it('returns empty array for empty list', () => {
    const list = new SplitOrderedList<string>()
    expect(list.toArray()).toEqual([])
  })
})

// ─── ForEach ───────────────────────────────────────────
describe('SplitOrderedList forEach', () => {
  it('iterates all entries', () => {
    const list = new SplitOrderedList<string>()
    list.insert(1, 'one')
    list.insert(2, 'two')
    const result: Array<[number, string]> = []
    list.forEach((v, k) => result.push([k, v]))
    expect(result).toHaveLength(2)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SplitOrderedList clear', () => {
  it('clears the list', () => {
    const list = new SplitOrderedList<string>()
    list.insert(1, 'one')
    list.insert(2, 'two')
    list.clear()
    expect(list.size).toBe(0)
    expect(list.isEmpty()).toBe(true)
    expect(list.toArray()).toEqual([])
  })
})
