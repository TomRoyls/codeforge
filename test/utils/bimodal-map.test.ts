import { describe, expect, it } from 'vitest'
import { BimodalMap } from '../../src/utils/bimodal-map.js'

describe('BimodalMap', () => {
  it('sets and gets values before freeze', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBe(2)
  })

  it('freeze preserves data', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    expect(bm.get('a')).toBe(1)
  })

  it('set after freeze works', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBe(2)
  })

  it('overwrites frozen value', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('a', 10)
    expect(bm.get('a')).toBe(10)
  })

  it('has checks both layers', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.has('a')).toBe(true)
    expect(bm.has('b')).toBe(true)
    expect(bm.has('c')).toBe(false)
  })

  it('delete marks as deleted', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    expect(bm.delete('a')).toBe(true)
    expect(bm.get('a')).toBeUndefined()
    expect(bm.has('a')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.delete('missing')).toBe(false)
  })

  it('keys returns all non-deleted keys', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.set('c', 3)
    const keys = [...bm.keys()].sort()
    expect(keys).toEqual(['a', 'b', 'c'])
  })

  it('entries returns all pairs', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    const entries = [...bm.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    expect(entries).toEqual([['a', 1], ['b', 2]])
  })

  it('size counts correctly', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty()).toBe(true)
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.size).toBe(2)
    expect(bm.isEmpty()).toBe(false)
  })

  it('clear resets everything', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    bm.clear()
    expect(bm.size).toBe(0)
    expect(bm.get('a')).toBeUndefined()
  })

  it('multiple freeze cycles merge data', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    bm.freeze()
    bm.set('c', 3)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBe(2)
    expect(bm.get('c')).toBe(3)
  })

  it('delete then re-add works', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.delete('a')
    bm.set('a', 10)
    expect(bm.get('a')).toBe(10)
    expect(bm.has('a')).toBe(true)
  })

  it('keys excludes deleted items', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    const keys = [...bm.keys()].sort()
    expect(keys).toEqual(['b'])
  })

  it('entries excludes deleted items', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    const entries = [...bm.entries()]
    expect(entries).toEqual([['b', 2]])
  })

  it('has returns false after delete', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    expect(bm.has('a')).toBe(false)
    expect(bm.has('b')).toBe(true)
  })

  it('size updates after freeze set', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.size).toBe(2)
  })

  it('has returns true for existing key', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    expect(bm.has('a')).toBe(true)
    expect(bm.has('b')).toBe(false)
  })

  it('delete removes key', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.delete('a')
    expect(bm.has('a')).toBe(false)
  })

  it('size reflects element count', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.size).toBe(2)
  })
})
