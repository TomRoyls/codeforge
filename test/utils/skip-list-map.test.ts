import { describe, expect, it } from 'vitest'
import { SkipListMap } from '../../src/utils/skip-list-map.js'

describe('SkipListMap', () => {
  it('sets and gets values', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'one')
    sl.set(2, 'two')
    sl.set(3, 'three')
    expect(sl.get(1)).toBe('one')
    expect(sl.get(2)).toBe('two')
    expect(sl.get(3)).toBe('three')
  })

  it('returns undefined for missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.get(99)).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'old')
    sl.set(1, 'new')
    expect(sl.get(1)).toBe('new')
    expect(sl.size).toBe(1)
  })

  it('has checks existence', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(5, 'x')
    expect(sl.has(5)).toBe(true)
    expect(sl.has(6)).toBe(false)
  })

  it('deletes keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect(sl.delete(1)).toBe(true)
    expect(sl.get(1)).toBeUndefined()
    expect(sl.size).toBe(1)
  })

  it('delete returns false for missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.delete(99)).toBe(false)
  })

  it('tracks size', () => {
    const sl = new SkipListMap<number, number>()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
    sl.set(1, 10)
    sl.set(2, 20)
    expect(sl.size).toBe(2)
    expect(sl.isEmpty()).toBe(false)
  })

  it('min returns smallest key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(5, 'a')
    sl.set(3, 'b')
    sl.set(7, 'c')
    expect(sl.min()).toBe(3)
  })

  it('min returns undefined for empty', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.min()).toBeUndefined()
  })

  it('entries returns sorted key-value pairs', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(3, 'c')
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.entries()]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('keys returns sorted keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(3, 'c')
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.keys()]).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(3, 'c')
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.values()]).toEqual(['a', 'b', 'c'])
  })

  it('handles string keys with custom comparator', () => {
    const sl = new SkipListMap<string, number>({ compare: (a, b) => a.localeCompare(b) })
    sl.set('banana', 2)
    sl.set('apple', 1)
    sl.set('cherry', 3)
    expect([...sl.keys()]).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles many insertions', () => {
    const sl = new SkipListMap<number, number>()
    for (let i = 100; i >= 1; i--) sl.set(i, i * 10)
    expect(sl.size).toBe(100)
    expect(sl.min()).toBe(1)
    expect(sl.get(50)).toBe(500)
    const keys = [...sl.keys()]
    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i + 1]!).toBeGreaterThan(keys[i]!)
    }
  })

  it('overwrite existing key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'old')
    sl.set(1, 'new')
    expect(sl.get(1)).toBe('new')
    expect(sl.size).toBe(1)
  })

  it('entries returns key-value pairs sorted', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(2, 'b')
    sl.set(1, 'a')
    sl.set(3, 'c')
    expect([...sl.entries()]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('delete then re-insert', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.delete(1)
    expect(sl.get(1)).toBeUndefined()
    sl.set(1, 'b')
    expect(sl.get(1)).toBe('b')
  })

  it('delete removes key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.delete(1)
    expect(sl.get(1)).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    expect(sl.has(1)).toBe(true)
    expect(sl.has(2)).toBe(false)
  })

  it('get returns value for set key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    expect(sl.get(1)).toBe('a')
  })

  it('has returns false for missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.has(99)).toBe(false)
  })
})
