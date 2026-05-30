import { describe, it, expect } from 'vitest'
import { FlatMap } from '../../src/utils/flat-map.js'

describe('FlatMap', () => {
  it('constructor creates empty map', () => {
    const map = new FlatMap<number, string>()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('set adds key-value pair', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    expect(map.size).toBe(1)
    expect(map.get(1)).toBe('one')
  })

  it('set updates existing key', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(1, 'uno')
    expect(map.size).toBe(1)
    expect(map.get(1)).toBe('uno')
  })

  it('get returns undefined for missing key', () => {
    const map = new FlatMap<number, string>()
    expect(map.get(999)).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    expect(map.has(1)).toBe(true)
  })

  it('has returns false for missing key', () => {
    const map = new FlatMap<number, string>()
    expect(map.has(999)).toBe(false)
  })

  it('delete removes key-value pair', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    const result = map.delete(1)
    expect(result).toBe(true)
    expect(map.size).toBe(0)
    expect(map.has(1)).toBe(false)
  })

  it('delete returns false for missing key', () => {
    const map = new FlatMap<number, string>()
    const result = map.delete(999)
    expect(result).toBe(false)
  })

  it('clear removes all entries', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('forEach iterates over all entries', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    const entries: Array<{ value: string; key: number; index: number }> = []
    map.forEach((value, key, index) => {
      entries.push({ value, key, index })
    })
    expect(entries.length).toBe(3)
  })

  it('forEach passes correct index', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    const indices: number[] = []
    map.forEach((value, key, index) => {
      indices.push(index)
    })
    expect(indices).toEqual([0, 1, 2])
  })

  it('keys returns all keys', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    const keys = map.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain(1)
    expect(keys).toContain(2)
    expect(keys).toContain(3)
  })

  it('keys returns sorted keys', () => {
    const map = new FlatMap<number, string>()
    map.set(3, 'three')
    map.set(1, 'one')
    map.set(2, 'two')
    const keys = map.keys()
    expect(keys).toEqual([1, 2, 3])
  })

  it('values returns all values', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    const values = map.values()
    expect(values.length).toBe(3)
    expect(values).toContain('one')
    expect(values).toContain('two')
    expect(values).toContain('three')
  })

  it('entries returns all key-value pairs', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    const entries = map.entries()
    expect(entries.length).toBe(3)
  })

  it('entries returns sorted entries', () => {
    const map = new FlatMap<number, string>()
    map.set(3, 'three')
    map.set(1, 'one')
    map.set(2, 'two')
    const entries = map.entries()
    expect(entries).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
  })

  it('from creates map from entries', () => {
    const entries: Array<[number, string]> = [[1, 'one'], [2, 'two'], [3, 'three']]
    const map = FlatMap.from(entries)
    expect(map.size).toBe(3)
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
    expect(map.get(3)).toBe('three')
  })

  it('from with comparator uses custom comparator', () => {
    const entries: Array<[string, number]> = [['c', 3], ['a', 1], ['b', 2]]
    const map = FlatMap.from(entries, (a, b) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    const keys = map.keys()
    expect(keys).toEqual(['a', 'b', 'c'])
  })

  it('min returns smallest key', () => {
    const map = new FlatMap<number, string>()
    map.set(3, 'three')
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.min).toBe(1)
  })

  it('max returns largest key', () => {
    const map = new FlatMap<number, string>()
    map.set(3, 'three')
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.max).toBe(3)
  })

  it('min returns undefined for empty map', () => {
    const map = new FlatMap<number, string>()
    expect(map.min).toBeUndefined()
  })

  it('max returns undefined for empty map', () => {
    const map = new FlatMap<number, string>()
    expect(map.max).toBeUndefined()
  })

  it('atIndex returns entry at index', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    const entry = map.atIndex(1)
    expect(entry).toEqual([2, 'two'])
  })

  it('atIndex returns undefined for out of bounds', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    expect(map.atIndex(-1)).toBeUndefined()
    expect(map.atIndex(10)).toBeUndefined()
  })

  it('range returns entries in range', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    map.set(4, 'four')
    map.set(5, 'five')
    const range = map.range(2, 5)
    expect(range.length).toBe(3)
    expect(range[0]![0]).toBe(2)
    expect(range[1]![0]).toBe(3)
    expect(range[2]![0]).toBe(4)
  })

  it('rangeInclusive returns entries in inclusive range', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    map.set(4, 'four')
    map.set(5, 'five')
    const range = map.rangeInclusive(2, 4)
    expect(range.length).toBe(3)
    expect(range[0]![0]).toBe(2)
    expect(range[1]![0]).toBe(3)
    expect(range[2]![0]).toBe(4)
  })

  it('indexOf returns index of key', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    map.set(3, 'three')
    expect(map.indexOf(2)).toBe(1)
  })

  it('indexOf returns -1 for missing key', () => {
    const map = new FlatMap<number, string>()
    map.set(1, 'one')
    expect(map.indexOf(999)).toBe(-1)
  })

  it('handles string keys', () => {
    const map = new FlatMap<string, number>()
    map.set('apple', 1)
    map.set('banana', 2)
    map.set('cherry', 3)
    expect(map.get('banana')).toBe(2)
    expect(map.has('apple')).toBe(true)
  })

  it('handles multiple maps independently', () => {
    const map1 = new FlatMap<number, string>()
    const map2 = new FlatMap<number, string>()
    map1.set(1, 'one')
    map2.set(1, 'uno')
    expect(map1.get(1)).toBe('one')
    expect(map2.get(1)).toBe('uno')
  })
})