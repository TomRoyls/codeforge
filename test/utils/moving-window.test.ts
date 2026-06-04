import { describe, it, expect } from 'vitest'
import { MovingWindow } from '../../src/utils/moving-window.js'

describe('MovingWindow', () => {
  it('creates with specified maxSize', () => {
    const window = new MovingWindow<number>(5)
    expect(window.maxSize).toBe(5)
    expect(window.size).toBe(0)
  })

  it('throws on maxSize < 1', () => {
    expect(() => new MovingWindow(0)).toThrow(RangeError)
    expect(() => new MovingWindow(-1)).toThrow(RangeError)
  })

  it('pushes items up to maxSize', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    window.push(3)
    expect(window.size).toBe(3)
    expect(window.isFull).toBe(true)
  })

  it('evicts oldest item when full', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    window.push(3)
    window.push(4)
    expect(window.toArray()).toEqual([2, 3, 4])
  })

  it('maintains sliding window over many pushes', () => {
    const window = new MovingWindow<number>(3)
    for (let i = 1; i <= 10; i++) window.push(i)
    expect(window.toArray()).toEqual([8, 9, 10])
  })

  it('returns correct first and last', () => {
    const window = new MovingWindow<number>(3)
    window.push(10)
    window.push(20)
    window.push(30)
    expect(window.first()).toBe(10)
    expect(window.last()).toBe(30)
  })

  it('at returns item at index', () => {
    const window = new MovingWindow<number>(3)
    window.push(10)
    window.push(20)
    window.push(30)
    expect(window.at(0)).toBe(10)
    expect(window.at(1)).toBe(20)
    expect(window.at(2)).toBe(30)
  })

  it('at returns undefined for out of bounds', () => {
    const window = new MovingWindow<number>(3)
    window.push(10)
    expect(window.at(-1)).toBeUndefined()
    expect(window.at(5)).toBeUndefined()
  })

  it('first and last return undefined when empty', () => {
    const window = new MovingWindow<number>(3)
    expect(window.first()).toBeUndefined()
    expect(window.last()).toBeUndefined()
  })

  it('isEmpty returns true when no items', () => {
    const window = new MovingWindow<number>(3)
    expect(window.isEmpty).toBe(true)
    window.push(1)
    expect(window.isEmpty).toBe(false)
  })

  it('clear removes all items', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    window.clear()
    expect(window.isEmpty).toBe(true)
    expect(window.size).toBe(0)
  })

  describe('statistics', () => {
    it('sum computes total', () => {
      const window = new MovingWindow<number>(5)
      window.push(10)
      window.push(20)
      window.push(30)
      expect(window.sum()).toBe(60)
    })

    it('mean computes average', () => {
      const window = new MovingWindow<number>(5)
      window.push(10)
      window.push(20)
      window.push(30)
      expect(window.mean()).toBeCloseTo(20)
    })

    it('mean returns undefined when empty', () => {
      const window = new MovingWindow<number>(5)
      expect(window.mean()).toBeUndefined()
    })

    it('min returns smallest item', () => {
      const window = new MovingWindow<number>(5)
      window.push(30)
      window.push(10)
      window.push(20)
      expect(window.min()).toBe(10)
    })

    it('max returns largest item', () => {
      const window = new MovingWindow<number>(5)
      window.push(30)
      window.push(10)
      window.push(20)
      expect(window.max()).toBe(30)
    })

    it('min and max return undefined when empty', () => {
      const window = new MovingWindow<number>(5)
      expect(window.min()).toBeUndefined()
      expect(window.max()).toBeUndefined()
    })
  })

  describe('iteration', () => {
    it('forEach iterates in order', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      const result: number[] = []
      window.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })

    it('forEach after wraparound maintains order', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      window.push(4)
      const result: number[] = []
      window.forEach((item) => result.push(item))
      expect(result).toEqual([2, 3, 4])
    })

    it('reduce computes aggregate', () => {
      const window = new MovingWindow<number>(5)
      window.push(1)
      window.push(2)
      window.push(3)
      const sum = window.reduce((acc, item) => acc + item, 0)
      expect(sum).toBe(6)
    })
  })

  it('works with strings', () => {
    const window = new MovingWindow<string>(3)
    window.push('a')
    window.push('b')
    window.push('c')
    window.push('d')
    expect(window.toArray()).toEqual(['b', 'c', 'd'])
    expect(window.first()).toBe('b')
    expect(window.last()).toBe('d')
  })

  it('toArray returns independent copy', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    const arr = window.toArray()
    arr.push(999)
    expect(window.size).toBe(2)
  })

  it('toArray returns snapshot', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    const arr = window.toArray()
    expect(arr).toEqual([1, 2])
  })

  it('exceeding capacity removes oldest', () => {
    const window = new MovingWindow<number>(2)
    window.push(1)
    window.push(2)
    window.push(3)
    expect(window.toArray()).toEqual([2, 3])
  })
})
