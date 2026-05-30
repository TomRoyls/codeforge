import { describe, expect, it } from 'vitest'

import { AdaptiveSet } from '../../../src/core/adaptive-set/adaptive-set.js'

describe('AdaptiveSet', () => {
  it('adds and checks values', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    expect(set.has(1)).toBe(true)
    expect(set.has(2)).toBe(true)
    expect(set.has(4)).toBe(false)
  })

  it('ignores duplicate adds', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(1)
    expect(set.size).toBe(1)
  })

  it('deletes values', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    expect(set.delete(1)).toBe(true)
    expect(set.has(1)).toBe(false)
    expect(set.size).toBe(1)
  })

  it('delete returns false for missing value', () => {
    const set = new AdaptiveSet<number>()
    expect(set.delete(99)).toBe(false)
  })

  it('tracks size correctly', () => {
    const set = new AdaptiveSet<number>()
    expect(set.size).toBe(0)
    set.add(1)
    expect(set.size).toBe(1)
    set.add(2)
    expect(set.size).toBe(2)
    set.delete(1)
    expect(set.size).toBe(1)
  })

  it('isEmpty returns correct state', () => {
    const set = new AdaptiveSet<number>()
    expect(set.isEmpty()).toBe(true)
    set.add(1)
    expect(set.isEmpty()).toBe(false)
  })

  it('clear removes all values', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.mode).toBe('array')
  })

  it('toArray returns all values', () => {
    const set = new AdaptiveSet<number>()
    set.add(3)
    set.add(1)
    set.add(2)
    const arr = set.toArray()
    expect(arr).toHaveLength(3)
  })

  it('values is alias for toArray', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    expect(set.values()).toEqual(set.toArray())
  })

  it('forEach iterates all values', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    const vals: number[] = []
    set.forEach((v) => vals.push(v))
    expect(vals).toHaveLength(3)
  })

  it('is iterable', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    const vals = [...set]
    expect(vals).toHaveLength(2)
  })

  it('union combines two sets', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    a.add(2)
    const b = new AdaptiveSet<number>()
    b.add(2)
    b.add(3)
    const result = a.union(b)
    expect(result.size).toBe(3)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('intersection returns common values', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new AdaptiveSet<number>()
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.intersection(b)
    expect(result.size).toBe(2)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('difference returns values only in first set', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    a.add(2)
    const b = new AdaptiveSet<number>()
    b.add(2)
    b.add(3)
    const result = a.difference(b)
    expect(result.size).toBe(1)
    expect(result.has(1)).toBe(true)
  })

  it('isSubsetOf returns true for subset', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    a.add(2)
    const b = new AdaptiveSet<number>()
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('isSupersetOf returns true for superset', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new AdaptiveSet<number>()
    b.add(1)
    b.add(2)
    expect(a.isSupersetOf(b)).toBe(true)
  })

  it('equals returns true for same sets', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    a.add(2)
    const b = new AdaptiveSet<number>()
    b.add(2)
    b.add(1)
    expect(a.equals(b)).toBe(true)
  })

  it('equals returns false for different sets', () => {
    const a = new AdaptiveSet<number>()
    a.add(1)
    const b = new AdaptiveSet<number>()
    b.add(2)
    expect(a.equals(b)).toBe(false)
  })

  it('map transforms values', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    const mapped = set.map((v) => v * 10)
    expect(mapped.has(10)).toBe(true)
    expect(mapped.has(20)).toBe(true)
    expect(mapped.has(30)).toBe(true)
  })

  it('filter returns matching values', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    set.add(4)
    const filtered = set.filter((v) => v % 2 === 0)
    expect(filtered.size).toBe(2)
    expect(filtered.has(2)).toBe(true)
    expect(filtered.has(4)).toBe(true)
  })

  it('some returns true if any matches', () => {
    const set = new AdaptiveSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    expect(set.some((v) => v > 2)).toBe(true)
    expect(set.some((v) => v > 10)).toBe(false)
  })

  it('every returns true if all match', () => {
    const set = new AdaptiveSet<number>()
    set.add(2)
    set.add(4)
    set.add(6)
    expect(set.every((v) => v % 2 === 0)).toBe(true)
    expect(set.every((v) => v > 5)).toBe(false)
  })

  it('min returns smallest value', () => {
    const set = new AdaptiveSet<number>()
    set.add(5)
    set.add(1)
    set.add(3)
    expect(set.min).toBe(1)
  })

  it('max returns largest value', () => {
    const set = new AdaptiveSet<number>()
    set.add(5)
    set.add(1)
    set.add(3)
    expect(set.max).toBe(5)
  })

  it('min/max return undefined for empty set', () => {
    const set = new AdaptiveSet<number>()
    expect(set.min).toBeUndefined()
    expect(set.max).toBeUndefined()
  })

  it('upgrades from array to sorted at threshold', () => {
    const set = new AdaptiveSet<number>({ sorted: 4 })
    for (let i = 0; i < 3; i++) set.add(i)
    expect(set.mode).toBe('array')
    set.add(10)
    expect(set.mode).toBe('sorted')
  })

  it('upgrades from sorted to hashed at threshold', () => {
    const set = new AdaptiveSet<number>({ sorted: 2, hashed: 8 })
    for (let i = 0; i < 8; i++) set.add(i)
    expect(set.mode).toBe('hashed')
  })

  it('downgrades from sorted to array when items removed', () => {
    const set = new AdaptiveSet<number>({ sorted: 4 })
    for (let i = 0; i < 5; i++) set.add(i)
    expect(set.mode).toBe('sorted')
    while (set.size > 0) set.delete(set.toArray()[0]!)
    expect(set.size).toBe(0)
  })

  it('works with string values', () => {
    const set = new AdaptiveSet<string>()
    set.add('hello')
    set.add('world')
    expect(set.has('hello')).toBe(true)
    expect(set.size).toBe(2)
  })

  it('handles many values correctly', () => {
    const set = new AdaptiveSet<number>()
    for (let i = 0; i < 500; i++) set.add(i)
    expect(set.size).toBe(500)
    expect(set.mode).toBe('hashed')
    for (let i = 0; i < 500; i++) {
      expect(set.has(i)).toBe(true)
    }
  })
})
