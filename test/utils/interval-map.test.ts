import { describe, it, expect } from 'vitest'
import { IntervalMap } from '../../src/utils/interval-map.js'

describe('IntervalMap', () => {
  it('set and get single interval', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    expect(im.get(0)).toBe('a')
    expect(im.get(5)).toBe('a')
    expect(im.get(9)).toBe('a')
    expect(im.get(10)).toBeUndefined()
  })

  it('set multiple non-overlapping intervals', () => {
    const im = new IntervalMap<number>()
    im.set(0, 5, 1)
    im.set(10, 15, 2)
    im.set(20, 25, 3)
    expect(im.get(2)).toBe(1)
    expect(im.get(12)).toBe(2)
    expect(im.get(22)).toBe(3)
    expect(im.get(7)).toBeUndefined()
  })

  it('set overlapping intervals (overwrite)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    im.set(5, 15, 'b')
    expect(im.get(2)).toBe('a')
    expect(im.get(7)).toBe('b')
    expect(im.get(12)).toBe('b')
    expect(im.get(0)).toBe('a')
    expect(im.get(9)).toBe('b')
  })

  it('get at various points', () => {
    const im = new IntervalMap<number>()
    im.set(0, 5, 1)
    im.set(10, 15, 2)
    expect(im.get(0)).toBe(1)
    expect(im.get(4)).toBe(1)
    expect(im.get(5)).toBeUndefined()
    expect(im.get(10)).toBe(2)
    expect(im.get(14)).toBe(2)
    expect(im.get(15)).toBeUndefined()
    expect(im.get(-1)).toBeUndefined()
  })

  it('getInterval returns overlapping ranges', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.set(20, 25, 'c')
    const result = im.getInterval(3, 22)
    expect(result).toEqual([
      { start: 3, end: 5, value: 'a' },
      { start: 10, end: 15, value: 'b' },
      { start: 20, end: 22, value: 'c' },
    ])
  })

  it('getInterval with exact match', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    const result = im.getInterval(0, 10)
    expect(result).toEqual([{ start: 0, end: 10, value: 'a' }])
  })

  it('remove interval', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.remove(0, 5)
    expect(im.get(0)).toBeUndefined()
    expect(im.get(4)).toBeUndefined()
    expect(im.get(10)).toBe('b')
    expect(im.size).toBe(1)
  })

  it('remove partial interval (split)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 20, 'a')
    im.remove(5, 15)
    expect(im.get(0)).toBe('a')
    expect(im.get(4)).toBe('a')
    expect(im.get(5)).toBeUndefined()
    expect(im.get(15)).toBe('a')
    expect(im.get(16)).toBe('a')
    expect(im.get(19)).toBe('a')
  })

  it('merge adjacent intervals with same value', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(5, 10, 'a')
    expect(im.getAllIntervals()).toEqual([{ start: 0, end: 10, value: 'a' }])
    expect(im.size).toBe(1)
  })

  it('merge adjacent intervals with same value when setting', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.set(5, 10, 'a')
    const ivs = im.getAllIntervals()
    expect(ivs.length).toBe(2)
    expect(ivs[0]!.value).toBe('a')
    expect(ivs[1]!.value).toBe('b')
  })

  it('has point', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    expect(im.has(0)).toBe(true)
    expect(im.has(4)).toBe(true)
    expect(im.has(5)).toBe(false)
    expect(im.has(-1)).toBe(false)
  })

  it('size tracking', () => {
    const im = new IntervalMap<string>()
    expect(im.size).toBe(0)
    im.set(0, 5, 'a')
    expect(im.size).toBe(1)
    im.set(10, 15, 'b')
    expect(im.size).toBe(2)
    im.set(5, 10, 'a')
    expect(im.size).toBe(2)
    im.remove(0, 5)
    expect(im.size).toBe(2)
  })

  it('clear', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.clear()
    expect(im.size).toBe(0)
    expect(im.get(0)).toBeUndefined()
    expect(im.get(10)).toBeUndefined()
  })

  it('empty map operations', () => {
    const im = new IntervalMap<string>()
    expect(im.get(0)).toBeUndefined()
    expect(im.has(0)).toBe(false)
    expect(im.getInterval(0, 10)).toEqual([])
    expect(im.getAllIntervals()).toEqual([])
    expect(im.size).toBe(0)
    im.remove(0, 10)
    expect(im.size).toBe(0)
    im.clear()
    expect(im.size).toBe(0)
  })

  it('getAllIntervals returns sorted intervals', () => {
    const im = new IntervalMap<number>()
    im.set(10, 15, 2)
    im.set(0, 5, 1)
    im.set(20, 25, 3)
    const ivs = im.getAllIntervals()
    expect(ivs.length).toBe(3)
    expect(ivs[0]!.start).toBe(0)
    expect(ivs[1]!.start).toBe(10)
    expect(ivs[2]!.start).toBe(20)
  })

  it('throws when start >= end', () => {
    const im = new IntervalMap<string>()
    expect(() => im.set(5, 5, 'a')).toThrow(RangeError)
    expect(() => im.set(10, 5, 'a')).toThrow(RangeError)
  })

  it('remove non-existent range', () => {
    const im = new IntervalMap<string>()
    im.set(10, 15, 'a')
    im.remove(0, 5)
    expect(im.size).toBe(1)
    expect(im.get(10)).toBe('a')
  })

  it('getInterval with no overlap', () => {
    const im = new IntervalMap<string>()
    im.set(10, 15, 'a')
    const result = im.getInterval(0, 5)
    expect(result).toEqual([])
  })

  it('overwrite and split interval', () => {
    const im = new IntervalMap<string>()
    im.set(0, 20, 'a')
    im.set(5, 15, 'b')
    expect(im.get(0)).toBe('a')
    expect(im.get(5)).toBe('b')
    expect(im.get(15)).toBe('a')
    expect(im.get(19)).toBe('a')
  })

  it('get returns undefined for unset range', () => {
    const im = new IntervalMap<string>()
    expect(im.get(100)).toBeUndefined()
  })

  it('set then get returns value', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'hello')
    expect(im.get(2)).toBe('hello')
  })
})