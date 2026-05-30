import { describe, expect, it } from 'vitest'
import { RangeMap } from '../../../src/utils/range-map.js'

describe('RangeMap', () => {
  it('starts empty', () => {
    const rm = new RangeMap<string>()
    expect(rm.size).toBe(0)
    expect(rm.isEmpty).toBe(true)
  })

  it('sets and gets a range', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 10, 'a')
    expect(rm.get(5)).toBe('a')
    expect(rm.get(0)).toBe('a')
    expect(rm.get(10)).toBe('a')
  })

  it('returns undefined outside range', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 10, 'a')
    expect(rm.get(4)).toBeUndefined()
    expect(rm.get(11)).toBeUndefined()
  })

  it('has returns boolean', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 10, 'a')
    expect(rm.has(5)).toBe(true)
    expect(rm.has(15)).toBe(false)
  })

  it('throws when start > end', () => {
    const rm = new RangeMap<string>()
    expect(() => rm.set(10, 5, 'a')).toThrow(RangeError)
  })

  it('allows start === end', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 5, 'point')
    expect(rm.get(5)).toBe('point')
    expect(rm.get(4)).toBeUndefined()
  })

  it('removes overlapping ranges on set', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 10, 'a')
    rm.set(5, 15, 'b')
    expect(rm.get(3)).toBeUndefined()
    expect(rm.get(7)).toBe('b')
  })

  it('remove deletes overlapping entries', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(20, 25, 'b')
    expect(rm.remove(0, 5)).toBe(1)
    expect(rm.get(3)).toBeUndefined()
    expect(rm.get(22)).toBe('b')
  })

  it('remove returns count of removed', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(6, 10, 'b')
    rm.set(11, 15, 'c')
    expect(rm.remove(0, 15)).toBe(3)
  })

  it('clears all entries', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 10, 'a')
    rm.set(20, 30, 'b')
    rm.clear()
    expect(rm.isEmpty).toBe(true)
  })

  it('tracks size', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(10, 15, 'b')
    expect(rm.size).toBe(2)
  })

  it('getAll returns all entries', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(10, 15, 'b')
    const all = rm.getAll()
    expect(all.length).toBe(2)
    expect(all[0]!.start).toBe(0)
    expect(all[1]!.start).toBe(10)
  })

  it('findOverlapping returns matching entries', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(10, 15, 'b')
    rm.set(20, 25, 'c')
    const overlap = rm.findOverlapping(3, 12)
    expect(overlap.length).toBe(2)
  })

  it('coversEntireRange checks full coverage', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(6, 10, 'b')
    expect(rm.coversEntireRange(0, 10)).toBe(true)
    expect(rm.coversEntireRange(0, 15)).toBe(false)
  })

  it('totalCovered sums range lengths', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 4, 'a')
    rm.set(10, 14, 'b')
    expect(rm.totalCovered()).toBe(10)
  })

  it('forEach iterates entries', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(10, 15, 'b')
    const starts: number[] = []
    rm.forEach((e) => starts.push(e.start))
    expect(starts).toEqual([0, 10])
  })

  it('clone creates independent copy', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    const copy = rm.clone()
    copy.set(10, 15, 'b')
    expect(rm.size).toBe(1)
    expect(copy.size).toBe(2)
  })

  it('handles multiple non-overlapping ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(20, 25, 'b')
    rm.set(40, 45, 'c')
    expect(rm.size).toBe(3)
    expect(rm.get(2)).toBe('a')
    expect(rm.get(22)).toBe('b')
    expect(rm.get(42)).toBe('c')
  })

  it('entries are sorted by start', () => {
    const rm = new RangeMap<string>()
    rm.set(20, 25, 'c')
    rm.set(0, 5, 'a')
    rm.set(10, 15, 'b')
    const all = rm.getAll()
    expect(all[0]!.start).toBe(0)
    expect(all[1]!.start).toBe(10)
    expect(all[2]!.start).toBe(20)
  })

  it('findOverlapping returns empty for non-overlapping query', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 5, 'a')
    rm.set(20, 25, 'b')
    expect(rm.findOverlapping(10, 15)).toEqual([])
  })

  it('handles negative ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(-10, -5, 'neg')
    expect(rm.get(-7)).toBe('neg')
    expect(rm.get(0)).toBeUndefined()
  })
})
