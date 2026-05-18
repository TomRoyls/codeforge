import { describe, expect, it } from 'vitest'

import { SortedArrayMap } from '../src/core/sorted-array-map/index.js'

// ─── Construction ──────────────────────────────────────
describe('SortedArrayMap construction', () => {
  it('creates an empty map', () => {
    const map = new SortedArrayMap<number, string>()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('creates from entries', () => {
    const map = new SortedArrayMap<number, string>(undefined, [
      { key: 3, value: 'c' },
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
    ])
    expect(map.size).toBe(3)
    expect(map.get(1)).toBe('a')
    expect(map.get(2)).toBe('b')
    expect(map.get(3)).toBe('c')
  })

  it('supports custom comparator', () => {
    const map = new SortedArrayMap<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    map.set('banana', 2)
    map.set('apple', 1)
    expect(map.keys()).toEqual(['apple', 'banana'])
  })
})

// ─── Set & Get ─────────────────────────────────────────
describe('SortedArrayMap set and get', () => {
  it('sets and gets values', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'one')
    expect(map.get(1)).toBe('one')
  })

  it('overwrites existing key', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'one')
    map.set(1, 'uno')
    expect(map.get(1)).toBe('uno')
    expect(map.size).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new SortedArrayMap<number, string>()
    expect(map.get(99)).toBeUndefined()
  })
})

// ─── Has & Delete ──────────────────────────────────────
describe('SortedArrayMap has and delete', () => {
  it('has returns true for existing key', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'one')
    expect(map.has(1)).toBe(true)
    expect(map.has(2)).toBe(false)
  })

  it('delete removes key and returns true', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'one')
    expect(map.delete(1)).toBe(true)
    expect(map.has(1)).toBe(false)
    expect(map.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const map = new SortedArrayMap<number, string>()
    expect(map.delete(99)).toBe(false)
  })
})

// ─── Min, Max, Floor, Ceiling ──────────────────────────
describe('SortedArrayMap navigation', () => {
  let map: SortedArrayMap<number, string>

  beforeEach(() => {
    map = new SortedArrayMap<number, string>()
    map.set(10, 'ten')
    map.set(20, 'twenty')
    map.set(30, 'thirty')
  })

  it('returns min key', () => expect(map.min()).toBe(10))
  it('returns max key', () => expect(map.max()).toBe(30))
  it('floor returns largest key <= given', () => expect(map.floor(15)).toBe(10))
  it('floor returns exact match', () => expect(map.floor(20)).toBe(20))
  it('floor returns undefined when none', () => expect(map.floor(5)).toBeUndefined())
  it('ceiling returns smallest key >= given', () => expect(map.ceiling(15)).toBe(20))
  it('ceiling returns exact match', () => expect(map.ceiling(20)).toBe(20))
  it('ceiling returns undefined when none', () => expect(map.ceiling(40)).toBeUndefined())
  it('lower returns largest key < given', () => expect(map.lower(20)).toBe(10))
  it('higher returns smallest key > given', () => expect(map.higher(20)).toBe(30))
  it('higher returns undefined when none', () => expect(map.higher(30)).toBeUndefined())
})

// ─── Range ─────────────────────────────────────────────
describe('SortedArrayMap range', () => {
  it('returns entries in range', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.set(4, 'd')
    map.set(5, 'e')
    const range = map.range(2, 4)
    expect(range).toEqual([
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
      { key: 4, value: 'd' },
    ])
  })

  it('returns empty for non-overlapping range', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'a')
    expect(map.range(10, 20)).toEqual([])
  })
})

// ─── Iteration ─────────────────────────────────────────
describe('SortedArrayMap iteration', () => {
  it('keys returns sorted keys', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.keys()).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('entries returns key-value pairs', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect(map.entries()).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
    ])
  })

  it('forEach iterates in order', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    const result: string[] = []
    map.forEach((v, k) => result.push(`${k}:${v}`))
    expect(result).toEqual(['1:a', '2:b'])
  })

  it('is iterable with for-of', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    const entries = [...map]
    expect(entries).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
    ])
  })
})

// ─── IndexOf & Clear ───────────────────────────────────
describe('SortedArrayMap indexOf and clear', () => {
  it('indexOf returns correct index', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(10, 'a')
    map.set(20, 'b')
    map.set(30, 'c')
    expect(map.indexOf(20)).toBe(1)
    expect(map.indexOf(99)).toBe(-1)
  })

  it('clear empties the map', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(1, 'a')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })
})

// ─── Min/Max on Empty ─────────────────────────────────
describe('SortedArrayMap edge cases', () => {
  it('min and max return undefined on empty map', () => {
    const map = new SortedArrayMap<number, string>()
    expect(map.min()).toBeUndefined()
    expect(map.max()).toBeUndefined()
  })

  it('lower returns undefined when no smaller key exists', () => {
    const map = new SortedArrayMap<number, string>()
    map.set(5, 'a')
    expect(map.lower(5)).toBeUndefined()
  })
})
