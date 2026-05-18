import { describe, expect, it } from 'vitest'

import { ThreadedMap } from '../src/core/threaded-map/index.js'

// ─── Construction ──────────────────────────────────────
describe('ThreadedMap construction', () => {
  it('creates empty map', () => {
    const map = new ThreadedMap<number, string>()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('creates from entries', () => {
    const map = new ThreadedMap<number, string>([
      [3, 'c'],
      [1, 'a'],
      [2, 'b'],
    ])
    expect(map.size).toBe(3)
    expect(map.get(1)).toBe('a')
  })

  it('creates with custom comparator', () => {
    const map = new ThreadedMap<string, number>(undefined, {
      comparator: (a, b) => b.localeCompare(a),
    })
    map.set('a', 1)
    map.set('b', 2)
    expect(map.keys()).toEqual(['b', 'a'])
  })

  it('fromArray creates map from entries', () => {
    const map = ThreadedMap.fromArray([
      [1, 'a'],
      [2, 'b'],
    ])
    expect(map.size).toBe(2)
  })
})

// ─── Set & Get ─────────────────────────────────────────
describe('ThreadedMap set and get', () => {
  it('sets and gets values', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'one')
    expect(map.get(1)).toBe('one')
  })

  it('overwrites existing key', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'old')
    map.set(1, 'new')
    expect(map.get(1)).toBe('new')
    expect(map.size).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new ThreadedMap<number, string>()
    expect(map.get(99)).toBeUndefined()
  })

  it('insert is alias for set', () => {
    const map = new ThreadedMap<number, string>()
    map.insert(1, 'one')
    expect(map.get(1)).toBe('one')
  })
})

// ─── Has & Delete ──────────────────────────────────────
describe('ThreadedMap has and delete', () => {
  it('has returns true for existing key', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'one')
    expect(map.has(1)).toBe(true)
    expect(map.has(2)).toBe(false)
  })

  it('delete removes key', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.delete(1)).toBe(true)
    expect(map.has(1)).toBe(false)
    expect(map.size).toBe(1)
  })

  it('delete returns false for missing key', () => {
    const map = new ThreadedMap<number, string>()
    expect(map.delete(99)).toBe(false)
  })

  it('delete handles leaf, one-child, and two-child nodes', () => {
    const map = new ThreadedMap<number, string>()
    map.set(5, 'root')
    map.set(3, 'left')
    map.set(7, 'right')
    map.set(1, 'far-left')
    map.delete(1)
    expect(map.toArray()).toEqual([
      [3, 'left'],
      [5, 'root'],
      [7, 'right'],
    ])
    map.delete(3)
    expect(map.toArray()).toEqual([
      [5, 'root'],
      [7, 'right'],
    ])
  })
})

// ─── Min & Max ─────────────────────────────────────────
describe('ThreadedMap min and max', () => {
  it('returns min entry', () => {
    const map = new ThreadedMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.min()).toEqual([1, 'a'])
  })

  it('returns max entry', () => {
    const map = new ThreadedMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    expect(map.max()).toEqual([3, 'c'])
  })

  it('returns undefined for empty map', () => {
    const map = new ThreadedMap<number, string>()
    expect(map.min()).toBeUndefined()
    expect(map.max()).toBeUndefined()
  })

  it('first and last alias min and max', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.first()).toEqual([1, 'a'])
    expect(map.last()).toEqual([2, 'b'])
  })
})

// ─── Update ────────────────────────────────────────────
describe('ThreadedMap update', () => {
  it('updates existing key value', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'old')
    expect(map.update(1, 'new')).toBe(true)
    expect(map.get(1)).toBe('new')
  })

  it('returns false for missing key', () => {
    const map = new ThreadedMap<number, string>()
    expect(map.update(99, 'x')).toBe(false)
  })
})

// ─── Navigation ────────────────────────────────────────
describe('ThreadedMap navigation', () => {
  let map: ThreadedMap<number, string>

  beforeEach(() => {
    map = new ThreadedMap<number, string>()
    map.set(10, 'ten')
    map.set(20, 'twenty')
    map.set(30, 'thirty')
  })

  it('lowerBound returns first key >= given', () => {
    expect(map.lowerBound(15)).toEqual([20, 'twenty'])
  })

  it('upperBound returns first key > given', () => {
    expect(map.upperBound(20)).toEqual([30, 'thirty'])
  })

  it('predecessor returns previous entry', () => {
    expect(map.predecessor(20)).toEqual([10, 'ten'])
  })

  it('successor returns next entry', () => {
    expect(map.successor(20)).toEqual([30, 'thirty'])
  })

  it('predecessor returns undefined for min', () => {
    expect(map.predecessor(10)).toBeUndefined()
  })

  it('successor returns undefined for max', () => {
    expect(map.successor(30)).toBeUndefined()
  })

  it('rank returns position', () => {
    expect(map.rank(20)).toBe(1)
    expect(map.rank(10)).toBe(0)
  })

  it('rank returns -1 for missing key', () => {
    expect(map.rank(99)).toBe(-1)
  })

  it('select returns entry at rank', () => {
    expect(map.select(1)).toEqual([20, 'twenty'])
  })

  it('select returns undefined for out of bounds', () => {
    expect(map.select(-1)).toBeUndefined()
    expect(map.select(99)).toBeUndefined()
  })
})

// ─── Iteration ─────────────────────────────────────────
describe('ThreadedMap iteration', () => {
  it('keys returns sorted keys', () => {
    const map = new ThreadedMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.keys()).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const map = new ThreadedMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    expect(map.values()).toEqual(['a', 'c'])
  })

  it('entries returns sorted key-value pairs', () => {
    const map = new ThreadedMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect(map.entries()).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })

  it('forEach iterates in order', () => {
    const map = new ThreadedMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    const result: string[] = []
    map.forEach((v) => result.push(v))
    expect(result).toEqual(['a', 'b'])
  })

  it('is iterable', () => {
    const map = new ThreadedMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect([...map]).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })

  it('toArray and toArraySorted return entries', () => {
    const map = new ThreadedMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect(map.toArray()).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
    expect(map.toArraySorted()).toEqual(map.toArray())
  })
})

// ─── Clone & Clear ─────────────────────────────────────
describe('ThreadedMap clone and clear', () => {
  it('clone creates independent copy', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'a')
    const cloned = map.clone()
    expect(cloned.size).toBe(1)
    map.clear()
    expect(cloned.size).toBe(1)
  })

  it('clear empties the map', () => {
    const map = new ThreadedMap<number, string>()
    map.set(1, 'a')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })
})
