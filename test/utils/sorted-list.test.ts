import { describe, it, expect } from 'vitest'
import { SortedList } from '../../src/utils/sorted-list.js'

describe('SortedList', () => {
  it('inserts and maintains order', () => {
    const sl = new SortedList<number>()
    sl.insert(3)
    sl.insert(1)
    sl.insert(2)
    expect([...sl.entries()]).toEqual([1, 2, 3])
  })

  it('starts empty', () => {
    const sl = new SortedList<number>()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty).toBe(true)
  })

  it('get returns element at index', () => {
    const sl = new SortedList<number>()
    sl.insert(10)
    sl.insert(20)
    sl.insert(30)
    expect(sl.get(0)).toBe(10)
    expect(sl.get(1)).toBe(20)
    expect(sl.get(2)).toBe(30)
  })

  it('get throws on out of bounds', () => {
    const sl = new SortedList<number>()
    expect(() => sl.get(0)).toThrow(RangeError)
    expect(() => sl.get(-1)).toThrow(RangeError)
  })

  it('min and max return bounds', () => {
    const sl = new SortedList<number>()
    expect(sl.min()).toBeUndefined()
    expect(sl.max()).toBeUndefined()
    sl.insert(5)
    sl.insert(1)
    sl.insert(9)
    expect(sl.min()).toBe(1)
    expect(sl.max()).toBe(9)
  })

  it('contains checks membership', () => {
    const sl = new SortedList<number>()
    sl.insert(5)
    sl.insert(10)
    expect(sl.contains(5)).toBe(true)
    expect(sl.contains(10)).toBe(true)
    expect(sl.contains(7)).toBe(false)
  })

  it('indexOf returns correct position', () => {
    const sl = new SortedList<number>()
    sl.insert(1)
    sl.insert(3)
    sl.insert(5)
    expect(sl.indexOf(1)).toBe(0)
    expect(sl.indexOf(3)).toBe(1)
    expect(sl.indexOf(5)).toBe(2)
    expect(sl.indexOf(4)).toBe(-1)
  })

  it('removeItem removes existing element', () => {
    const sl = new SortedList<number>()
    sl.insert(1)
    sl.insert(2)
    sl.insert(3)
    expect(sl.removeItem(2)).toBe(true)
    expect([...sl.entries()]).toEqual([1, 3])
    expect(sl.size).toBe(2)
  })

  it('removeItem returns false for missing', () => {
    const sl = new SortedList<number>()
    sl.insert(1)
    expect(sl.removeItem(99)).toBe(false)
  })

  it('remove at index', () => {
    const sl = new SortedList<number>()
    sl.insert(10)
    sl.insert(20)
    sl.insert(30)
    expect(sl.remove(1)).toBe(20)
    expect([...sl.entries()]).toEqual([10, 30])
  })

  it('remove throws on out of bounds', () => {
    const sl = new SortedList<number>()
    expect(() => sl.remove(0)).toThrow(RangeError)
  })

  it('lowerBound finds insertion point', () => {
    const sl = new SortedList<number>()
    sl.insert(10)
    sl.insert(20)
    sl.insert(30)
    expect(sl.lowerBound(20)).toBe(1)
    expect(sl.lowerBound(25)).toBe(2)
    expect(sl.lowerBound(5)).toBe(0)
  })

  it('upperBound finds past-last', () => {
    const sl = new SortedList<number>()
    sl.insert(10)
    sl.insert(20)
    sl.insert(30)
    expect(sl.upperBound(20)).toBe(2)
    expect(sl.upperBound(35)).toBe(3)
  })

  it('rangeCount counts elements in range', () => {
    const sl = new SortedList<number>()
    for (let i = 0; i < 10; i++) sl.insert(i)
    expect(sl.rangeCount(3, 7)).toBe(5)
    expect(sl.rangeCount(0, 9)).toBe(10)
    expect(sl.rangeCount(5, 5)).toBe(1)
  })

  it('slice returns subarray', () => {
    const sl = new SortedList<number>()
    for (let i = 0; i < 5; i++) sl.insert(i)
    expect(sl.slice(1, 4)).toEqual([1, 2, 3])
  })

  it('clear empties the list', () => {
    const sl = new SortedList<number>()
    sl.insert(1)
    sl.insert(2)
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty).toBe(true)
  })

  it('handles custom comparator (descending)', () => {
    const sl = new SortedList<number>((a, b) => b - a)
    sl.insert(1)
    sl.insert(3)
    sl.insert(2)
    expect([...sl.entries()]).toEqual([3, 2, 1])
  })

  it('handles duplicate elements', () => {
    const sl = new SortedList<number>()
    sl.insert(5)
    sl.insert(5)
    sl.insert(5)
    expect(sl.size).toBe(3)
    expect(sl.indexOf(5)).toBe(0)
  })

  it('works with strings', () => {
    const sl = new SortedList<string>((a, b) => a.localeCompare(b))
    sl.insert('banana')
    sl.insert('apple')
    sl.insert('cherry')
    expect(sl.get(0)).toBe('apple')
    expect(sl.get(2)).toBe('cherry')
  })

  it('size tracks inserts', () => {
    const sl = new SortedList<string>()
    sl.insert('a')
    sl.insert('b')
    expect(sl.size).toBe(2)
  })
})
