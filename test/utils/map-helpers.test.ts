import { describe, it, expect } from 'vitest'
import { increment, append } from '../../src/utils/map-helpers.js'

// ─── increment ───

describe('increment', () => {
  it('increments a new key from 0 to 1', () => {
    const map = new Map<string, number>()
    increment(map, 'a')
    expect(map.get('a')).toBe(1)
  })

  it('increments an existing key', () => {
    const map = new Map<string, number>([['a', 5]])
    increment(map, 'a')
    expect(map.get('a')).toBe(6)
  })

  it('increments by a custom delta', () => {
    const map = new Map<string, number>([['a', 3]])
    increment(map, 'a', 10)
    expect(map.get('a')).toBe(13)
  })

  it('increments by a negative delta', () => {
    const map = new Map<string, number>([['a', 10]])
    increment(map, 'a', -3)
    expect(map.get('a')).toBe(7)
  })

  it('handles zero delta', () => {
    const map = new Map<string, number>([['a', 5]])
    increment(map, 'a', 0)
    expect(map.get('a')).toBe(5)
  })

  it('works with number keys', () => {
    const map = new Map<number, number>()
    increment(map, 1, 100)
    expect(map.get(1)).toBe(100)
  })

  it('works with multiple keys independently', () => {
    const map = new Map<string, number>()
    increment(map, 'a')
    increment(map, 'b')
    increment(map, 'a')
    expect(map.get('a')).toBe(2)
    expect(map.get('b')).toBe(1)
  })
})

// ─── append ───

describe('append', () => {
  it('creates a new array for a missing key', () => {
    const map = new Map<string, number>()
    append(map, 'a', 1)
    expect(map.get('a')).toEqual([1])
  })

  it('appends to an existing array', () => {
    const map = new Map<string, number>([['a', [1, 2]]])
    append(map, 'a', 3)
    expect(map.get('a')).toEqual([1, 2, 3])
  })

  it('appends multiple values to the same key', () => {
    const map = new Map<string, string>()
    append(map, 'x', 'a')
    append(map, 'x', 'b')
    append(map, 'x', 'c')
    expect(map.get('x')).toEqual(['a', 'b', 'c'])
  })

  it('works with number keys', () => {
    const map = new Map<number, string>()
    append(map, 1, 'hello')
    expect(map.get(1)).toEqual(['hello'])
  })

  it('works with object values', () => {
    const map = new Map<string, { id: number }>()
    append(map, 'items', { id: 1 })
    append(map, 'items', { id: 2 })
    expect(map.get('items')).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('handles multiple keys independently', () => {
    const map = new Map<string, number>()
    append(map, 'a', 1)
    append(map, 'b', 10)
    append(map, 'a', 2)
    expect(map.get('a')).toEqual([1, 2])
    expect(map.get('b')).toEqual([10])
  })

  it('mutates the existing array in place', () => {
    const arr: number[] = [1]
    const map = new Map<string, number[]>([['a', arr]])
    append(map, 'a', 2)
    expect(arr).toEqual([1, 2])
    expect(map.get('a')).toBe(arr)
  })

  it('append to empty map creates single-element arrays', () => {
    const map = new Map<string, number>()
    append(map, 'x', 42)
    append(map, 'y', 99)
    expect(map.get('x')).toEqual([42])
    expect(map.get('y')).toEqual([99])
    expect(map.size).toBe(2)
  })

  it('append multiple values to same key', () => {
    const map = new Map<string, number>()
    append(map, 'a', 1)
    append(map, 'a', 2)
    append(map, 'a', 3)
    expect(map.get('a')).toEqual([1, 2, 3])
  })

  it('append to empty map creates new arrays', () => {
    const map = new Map<string, string>()
    append(map, 'key', 'val')
    expect(map.get('key')).toEqual(['val'])
  })
})
