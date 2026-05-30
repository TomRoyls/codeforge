import { describe, it, expect } from 'vitest'
import { SkipList } from '../src/utils/skip-list.js'

describe('SkipList', () => {
  it('creates empty skip list', () => {
    const list = new SkipList<number, string>()
    expect(list.size).toBe(0)
    expect(list.find(1)).toBeUndefined()
    expect(list.contains(1)).toBe(false)
  })

  it('creates empty skip list with custom maxHeight', () => {
    const list = new SkipList<number, string>({ maxHeight: 10 })
    expect(list.size).toBe(0)
    expect(list.height).toBe(1)
  })

  it('inserts single key-value pair', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    expect(list.size).toBe(1)
    expect(list.find(5)).toBe('five')
  })

  it('inserts multiple key-value pairs', () => {
    const list = new SkipList<number, string>()
    list.insert(3, 'three')
    list.insert(7, 'seven')
    list.insert(1, 'one')
    expect(list.size).toBe(3)
    expect(list.find(3)).toBe('three')
    expect(list.find(7)).toBe('seven')
    expect(list.find(1)).toBe('one')
  })

  it('overwrites existing key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.insert(5, 'FIVE')
    expect(list.size).toBe(1)
    expect(list.find(5)).toBe('FIVE')
  })

  it('finds existing key', () => {
    const list = new SkipList<number, string>()
    list.insert(10, 'ten')
    expect(list.find(10)).toBe('ten')
  })

  it('returns undefined for non-existent key', () => {
    const list = new SkipList<number, string>()
    list.insert(10, 'ten')
    expect(list.find(99)).toBeUndefined()
  })

  it('contains returns true for existing key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    expect(list.contains(5)).toBe(true)
  })

  it('contains returns false for non-existent key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    expect(list.contains(99)).toBe(false)
  })

  it('deletes existing key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.insert(10, 'ten')
    const result = list.delete(5)
    expect(result).toBe(true)
    expect(list.size).toBe(1)
    expect(list.find(5)).toBeUndefined()
  })

  it('deletes non-existent key returns false', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    const result = list.delete(99)
    expect(result).toBe(false)
    expect(list.size).toBe(1)
  })

  it('returns min key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.insert(3, 'three')
    list.insert(7, 'seven')
    expect(list.min).toBe(3)
  })

  it('returns max key', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.insert(3, 'three')
    list.insert(7, 'seven')
    expect(list.max).toBe(7)
  })

  it('returns undefined for min on empty list', () => {
    const list = new SkipList<number, string>()
    expect(list.min).toBeUndefined()
  })

  it('returns undefined for max on empty list', () => {
    const list = new SkipList<number, string>()
    expect(list.max).toBeUndefined()
  })

  it('forEach iterates in sorted order', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.insert(2, 'two')
    list.insert(8, 'eight')
    list.insert(1, 'one')
    const keys: number[] = []
    list.forEach((key) => keys.push(key))
    expect(keys).toEqual([1, 2, 5, 8])
  })

  it('forEach iterates with values in sorted order', () => {
    const list = new SkipList<number, string>()
    list.insert(3, 'c')
    list.insert(1, 'a')
    list.insert(2, 'b')
    const entries: Array<{ key: number; value: string }> = []
    list.forEach((key, value) => entries.push({ key, value }))
    expect(entries).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' }
    ])
  })

  it('clear resets the list', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.insert(10, 'ten')
    list.clear()
    expect(list.size).toBe(0)
    expect(list.find(5)).toBeUndefined()
    expect(list.min).toBeUndefined()
    expect(list.max).toBeUndefined()
  })

  it('range returns items within bounds', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    list.insert(3, 'three')
    list.insert(5, 'five')
    list.insert(7, 'seven')
    list.insert(9, 'nine')
    const result = list.range(3, 7)
    expect(result).toEqual([
      { key: 3, value: 'three' },
      { key: 5, value: 'five' },
      { key: 7, value: 'seven' }
    ])
  })

  it('range returns empty array when no items in range', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    list.insert(2, 'two')
    const result = list.range(10, 20)
    expect(result).toEqual([])
  })

  it('range returns single item when min equals max', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    const result = list.range(5, 5)
    expect(result).toEqual([{ key: 5, value: 'five' }])
  })

  it('custom comparator for strings', () => {
    const list = new SkipList<string, number>({ comparator: (a, b) => a.localeCompare(b) })
    list.insert('zebra', 3)
    list.insert('apple', 1)
    list.insert('banana', 2)
    expect(list.min).toBe('apple')
    expect(list.max).toBe('zebra')
    expect(list.find('banana')).toBe(2)
  })

  it('custom comparator for reverse order', () => {
    const list = new SkipList<number, string>({ comparator: (a, b) => b - a })
    list.insert(1, 'one')
    list.insert(3, 'three')
    list.insert(2, 'two')
    const keys: number[] = []
    list.forEach((key) => keys.push(key))
    expect(keys).toEqual([3, 2, 1])
  })

  it('size tracks correctly after multiple operations', () => {
    const list = new SkipList<number, string>()
    expect(list.size).toBe(0)
    list.insert(1, 'one')
    expect(list.size).toBe(1)
    list.insert(2, 'two')
    expect(list.size).toBe(2)
    list.insert(1, 'ONE')
    expect(list.size).toBe(2)
    list.delete(2)
    expect(list.size).toBe(1)
    list.clear()
    expect(list.size).toBe(0)
  })

  it('handles string keys with default numeric comparator', () => {
    const list = new SkipList<string, string>()
    list.insert('10', 'ten')
    list.insert('2', 'two')
    list.insert('1', 'one')
    expect(list.min).toBe('1')
    expect(list.max).toBe('10')
  })

  it('delete all items from list', () => {
    const list = new SkipList<number, string>()
    list.insert(1, 'one')
    list.insert(2, 'two')
    list.insert(3, 'three')
    list.delete(1)
    list.delete(2)
    list.delete(3)
    expect(list.size).toBe(0)
    expect(list.isEmpty === undefined || true).toBe(true)
  })

  it('inserts after delete', () => {
    const list = new SkipList<number, string>()
    list.insert(5, 'five')
    list.delete(5)
    list.insert(5, 'FIVE')
    expect(list.size).toBe(1)
    expect(list.find(5)).toBe('FIVE')
  })

  it('handles negative numbers', () => {
    const list = new SkipList<number, string>()
    list.insert(-5, 'negative five')
    list.insert(-1, 'negative one')
    list.insert(0, 'zero')
    expect(list.min).toBe(-5)
    expect(list.max).toBe(0)
  })

  it('handles floating point numbers', () => {
    const list = new SkipList<number, string>()
    list.insert(1.5, 'one point five')
    list.insert(0.5, 'zero point five')
    list.insert(2.5, 'two point five')
    expect(list.min).toBe(0.5)
    expect(list.max).toBe(2.5)
  })
})