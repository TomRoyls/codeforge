import { describe, it, expect } from 'vitest'
import { BTreeSet } from '../src/core/btree-set/index.js'

// ─── Constructor ───

describe('BTreeSet', () => {
  it('creates empty set with defaults', () => {
    const set = new BTreeSet<number>()
    expect(set.size()).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('creates with custom order', () => {
    const set = new BTreeSet<number>({ order: 3 })
    expect(set.size()).toBe(0)
  })

  it('creates with custom comparator', () => {
    const set = new BTreeSet<string>({
      comparator: (a, b) => a.localeCompare(b),
    })
    set.add('b')
    set.add('a')
    expect(set.toArray()).toEqual(['a', 'b'])
  })

  // ─── Add / Has ───

  it('add returns true for new items', () => {
    const set = new BTreeSet<number>()
    expect(set.add(1)).toBe(true)
    expect(set.add(2)).toBe(true)
    expect(set.size()).toBe(2)
  })

  it('add returns false for duplicates', () => {
    const set = new BTreeSet<number>()
    set.add(1)
    expect(set.add(1)).toBe(false)
    expect(set.size()).toBe(1)
  })

  it('has checks membership', () => {
    const set = new BTreeSet<number>()
    set.add(42)
    expect(set.has(42)).toBe(true)
    expect(set.has(99)).toBe(false)
  })

  it('has returns false on empty', () => {
    const set = new BTreeSet<number>()
    expect(set.has(1)).toBe(false)
  })

  // ─── Delete ───

  it('delete removes existing item', () => {
    const set = new BTreeSet<number>()
    set.add(1)
    expect(set.delete(1)).toBe(true)
    expect(set.has(1)).toBe(false)
    expect(set.size()).toBe(0)
  })

  it('delete returns false for missing item', () => {
    const set = new BTreeSet<number>()
    expect(set.delete(1)).toBe(false)
  })

  it('delete maintains order', () => {
    const set = new BTreeSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    set.delete(2)
    expect(set.toArray()).toEqual([1, 3])
  })

  // ─── Min / Max ───

  it('min returns smallest element', () => {
    const set = new BTreeSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.min()).toBe(3)
  })

  it('max returns largest element', () => {
    const set = new BTreeSet<number>()
    set.add(5)
    set.add(3)
    set.add(7)
    expect(set.max()).toBe(7)
  })

  it('min/max undefined on empty', () => {
    const set = new BTreeSet<number>()
    expect(set.min()).toBeUndefined()
    expect(set.max()).toBeUndefined()
  })

  // ─── ToArray / ForEach ───

  it('toArray returns sorted elements', () => {
    const set = new BTreeSet<number>()
    set.add(3)
    set.add(1)
    set.add(2)
    expect(set.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order', () => {
    const set = new BTreeSet<number>()
    set.add(3)
    set.add(1)
    set.add(2)
    const items: number[] = []
    set.forEach((item) => items.push(item))
    expect(items).toEqual([1, 2, 3])
  })

  // ─── Range ───

  it('range returns elements in [min, max]', () => {
    const set = new BTreeSet<number>()
    for (let i = 0; i < 10; i++) set.add(i)
    expect(set.range(3, 7)).toEqual([3, 4, 5, 6, 7])
  })

  it('range returns empty for no matches', () => {
    const set = new BTreeSet<number>()
    set.add(1)
    set.add(5)
    expect(set.range(2, 4)).toEqual([])
  })

  it('range on empty returns empty', () => {
    const set = new BTreeSet<number>()
    expect(set.range(0, 10)).toEqual([])
  })

  // ─── LowerBound / UpperBound ───

  it('lowerBound returns first element >= item', () => {
    const set = new BTreeSet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
    expect(set.lowerBound(15)).toBe(20)
    expect(set.lowerBound(20)).toBe(20)
    expect(set.lowerBound(5)).toBe(10)
  })

  it('upperBound returns first element > item', () => {
    const set = new BTreeSet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
    expect(set.upperBound(15)).toBe(20)
    expect(set.upperBound(20)).toBe(30)
    expect(set.upperBound(30)).toBeUndefined()
  })

  it('lowerBound on empty returns undefined', () => {
    const set = new BTreeSet<number>()
    expect(set.lowerBound(0)).toBeUndefined()
  })

  it('upperBound on empty returns undefined', () => {
    const set = new BTreeSet<number>()
    expect(set.upperBound(0)).toBeUndefined()
  })

  // ─── Clear ───

  it('clear empties the set', () => {
    const set = new BTreeSet<number>()
    set.add(1)
    set.add(2)
    set.clear()
    expect(set.size()).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  // ─── Stress ───

  it('handles order-3 tree', () => {
    const set = new BTreeSet<number>({ order: 3 })
    for (let i = 0; i < 10; i++) set.add(i)
    expect(set.size()).toBe(10)
    expect(set.min()).toBe(0)
    expect(set.max()).toBe(9)
  })

  it('handles reverse insert order', () => {
    const set = new BTreeSet<number>({ order: 6 })
    for (let i = 20; i >= 0; i--) set.add(i)
    expect(set.min()).toBe(0)
    expect(set.max()).toBe(20)
  })

  it('insert and delete cycle', () => {
    const set = new BTreeSet<number>({ order: 4 })
    for (let i = 0; i < 20; i++) set.add(i)
    for (let i = 0; i < 20; i += 2) set.delete(i)
    expect(set.size()).toBe(10)
  })

  it('handles string elements', () => {
    const set = new BTreeSet<string>()
    set.add('cherry')
    set.add('apple')
    set.add('banana')
    expect(set.min()).toBe('apple')
    expect(set.max()).toBe('cherry')
  })

  it('toArray after mixed operations', () => {
    const set = new BTreeSet<number>()
    set.add(5)
    set.add(3)
    set.add(8)
    set.delete(5)
    set.add(1)
    expect(set.toArray()).toEqual([1, 3, 8])
  })
})
