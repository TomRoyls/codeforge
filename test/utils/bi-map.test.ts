import { describe, it, expect } from 'vitest'
import { BiMap } from '../../src/utils/bi-map.js'

describe('BiMap', () => {
  it('sets and gets a value', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.get('a')).toBe(1)
  })

  it('gets key by value', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.getKey(1)).toBe('a')
  })

  it('returns undefined for missing key', () => {
    const bm = new BiMap<string, number>()
    expect(bm.get('missing')).toBeUndefined()
  })

  it('returns undefined for missing value', () => {
    const bm = new BiMap<string, number>()
    expect(bm.getKey(99)).toBeUndefined()
  })

  it('hasKey checks forward', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.hasKey('a')).toBe(true)
    expect(bm.hasKey('b')).toBe(false)
  })

  it('hasValue checks reverse', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.hasValue(1)).toBe(true)
    expect(bm.hasValue(2)).toBe(false)
  })

  it('overwriting key updates reverse map', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('a', 2)
    expect(bm.get('a')).toBe(2)
    expect(bm.getKey(1)).toBeUndefined()
    expect(bm.getKey(2)).toBe('a')
    expect(bm.size).toBe(1)
  })

  it('overwriting value updates forward map', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 1)
    expect(bm.get('a')).toBeUndefined()
    expect(bm.get('b')).toBe(1)
    expect(bm.getKey(1)).toBe('b')
    expect(bm.size).toBe(1)
  })

  it('deleteKey removes entry', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.deleteKey('a')).toBe(true)
    expect(bm.hasKey('a')).toBe(false)
    expect(bm.hasValue(1)).toBe(false)
    expect(bm.size).toBe(0)
  })

  it('deleteKey returns false for missing', () => {
    const bm = new BiMap<string, number>()
    expect(bm.deleteKey('x')).toBe(false)
  })

  it('deleteValue removes entry', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.deleteValue(1)).toBe(true)
    expect(bm.size).toBe(0)
  })

  it('deleteValue returns false for missing', () => {
    const bm = new BiMap<string, number>()
    expect(bm.deleteValue(99)).toBe(false)
  })

  it('tracks size correctly', () => {
    const bm = new BiMap<string, number>()
    expect(bm.size).toBe(0)
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.size).toBe(2)
    bm.deleteKey('a')
    expect(bm.size).toBe(1)
  })

  it('isEmpty reflects state', () => {
    const bm = new BiMap<string, number>()
    expect(bm.isEmpty).toBe(true)
    bm.set('a', 1)
    expect(bm.isEmpty).toBe(false)
  })

  it('clear removes all entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.clear()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty).toBe(true)
  })

  it('iterates keys', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect([...bm.keys()].sort()).toEqual(['a', 'b'])
  })

  it('iterates values', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect([...bm.values()].sort()).toEqual([1, 2])
  })

  it('iterates entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const entries = [...bm.entries()]
    expect(entries.length).toBe(2)
  })

  it('clone produces independent copy', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    const copy = bm.clone()
    copy.set('b', 2)
    expect(bm.size).toBe(1)
    expect(copy.size).toBe(2)
  })

  it('forEach iterates all entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const collected: [string, number][] = []
    bm.forEach((k, v) => collected.push([k, v]))
    expect(collected.length).toBe(2)
  })

  it('clear removes all entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.clear()
    expect(bm.size).toBe(0)
  })
})
