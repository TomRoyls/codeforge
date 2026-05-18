import { describe, expect, it } from 'vitest'

import { SplayMap } from '../src/core/splay-map/index.js'

// ─── Construction ──────────────────────────────────────
describe('SplayMap construction', () => {
  it('creates empty map', () => {
    const map = new SplayMap<number, string>()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('creates with custom comparator', () => {
    const map = new SplayMap<string, number>({
      comparator: (a, b) => b.localeCompare(a),
    })
    map.set('a', 1)
    map.set('b', 2)
    expect(map.keys()).toEqual(['b', 'a'])
  })

  it('fromArray creates map from entries', () => {
    const map = SplayMap.fromArray([
      [3, 'c'],
      [1, 'a'],
      [2, 'b'],
    ])
    expect(map.size).toBe(3)
    expect(map.get(1)).toBe('a')
  })
})

// ─── Set & Get ─────────────────────────────────────────
describe('SplayMap set and get', () => {
  it('sets and gets values', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'one')
    expect(map.get(1)).toBe('one')
  })

  it('overwrites existing key', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'one')
    map.set(1, 'uno')
    expect(map.get(1)).toBe('uno')
    expect(map.size).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new SplayMap<number, string>()
    expect(map.get(99)).toBeUndefined()
  })

  it('insert is alias for set', () => {
    const map = new SplayMap<number, string>()
    map.insert(1, 'one')
    expect(map.get(1)).toBe('one')
  })
})

// ─── Has & Delete ──────────────────────────────────────
describe('SplayMap has and delete', () => {
  it('has returns true for existing key', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'one')
    expect(map.has(1)).toBe(true)
    expect(map.has(2)).toBe(false)
  })

  it('delete removes key', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'one')
    expect(map.delete(1)).toBe(true)
    expect(map.has(1)).toBe(false)
    expect(map.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const map = new SplayMap<number, string>()
    expect(map.delete(99)).toBe(false)
  })
})

// ─── Min & Max ─────────────────────────────────────────
describe('SplayMap min and max', () => {
  it('returns min entry', () => {
    const map = new SplayMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.min()).toEqual([1, 'a'])
  })

  it('returns max entry', () => {
    const map = new SplayMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    expect(map.max()).toEqual([3, 'c'])
  })

  it('returns undefined for empty map', () => {
    const map = new SplayMap<number, string>()
    expect(map.min()).toBeUndefined()
    expect(map.max()).toBeUndefined()
  })

  it('first and last alias min and max', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.first()).toEqual([1, 'a'])
    expect(map.last()).toEqual([2, 'b'])
  })
})

// ─── Navigation ────────────────────────────────────────
describe('SplayMap navigation', () => {
  let map: SplayMap<number, string>

  beforeEach(() => {
    map = new SplayMap<number, string>()
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

  it('predecessor returns largest key < given', () => {
    expect(map.predecessor(20)).toEqual([10, 'ten'])
  })

  it('successor returns smallest key > given', () => {
    expect(map.successor(20)).toEqual([30, 'thirty'])
  })

  it('rank returns count of keys less than given', () => {
    expect(map.rank(20)).toBe(1)
    expect(map.rank(10)).toBe(0)
  })

  it('select returns entry at rank', () => {
    expect(map.select(1)).toEqual([20, 'twenty'])
  })

  it('select returns undefined for out of bounds', () => {
    expect(map.select(-1)).toBeUndefined()
    expect(map.select(99)).toBeUndefined()
  })
})

// ─── Range & Split ─────────────────────────────────────
describe('SplayMap range and split', () => {
  it('rangeQuery returns entries in range', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.set(4, 'd')
    map.set(5, 'e')
    expect(map.rangeQuery(2, 4)).toEqual([
      [2, 'b'],
      [3, 'c'],
      [4, 'd'],
    ])
  })

  it('split divides map at key', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    const [left, right] = map.split(2)
    expect(left.size).toBe(2)
    expect(right.size).toBe(1)
  })

  it('merge combines two maps', () => {
    const a = new SplayMap<number, string>()
    a.set(1, 'a')
    const b = new SplayMap<number, string>()
    b.set(2, 'b')
    a.merge(b)
    expect(a.size).toBe(2)
    expect(a.get(2)).toBe('b')
  })
})

// ─── Update ────────────────────────────────────────────
describe('SplayMap update', () => {
  it('updates existing key', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'old')
    expect(map.update(1, 'new')).toBe(true)
    expect(map.get(1)).toBe('new')
  })

  it('returns false for missing key', () => {
    const map = new SplayMap<number, string>()
    expect(map.update(99, 'x')).toBe(false)
  })
})

// ─── Iteration ─────────────────────────────────────────
describe('SplayMap iteration', () => {
  it('keys returns sorted keys', () => {
    const map = new SplayMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.keys()).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const map = new SplayMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    expect(map.values()).toEqual(['a', 'c'])
  })

  it('entries returns key-value pairs sorted', () => {
    const map = new SplayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect(map.entries()).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })

  it('forEach iterates in order', () => {
    const map = new SplayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    const result: string[] = []
    map.forEach((v) => result.push(v))
    expect(result).toEqual(['a', 'b'])
  })

  it('is iterable', () => {
    const map = new SplayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect([...map]).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })
})

// ─── Clone & Clear ─────────────────────────────────────
describe('SplayMap clone and clear', () => {
  it('clone creates independent copy', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'a')
    const cloned = map.clone()
    expect(cloned.size).toBe(1)
    map.clear()
    expect(cloned.size).toBe(1)
  })

  it('clear empties the map', () => {
    const map = new SplayMap<number, string>()
    map.set(1, 'a')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('toArray and toArraySorted return entries', () => {
    const map = new SplayMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    expect(map.toArray()).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
    expect(map.toArraySorted()).toEqual(map.toArray())
  })
})
