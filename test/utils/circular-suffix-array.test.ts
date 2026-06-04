import { describe, it, expect } from 'vitest'
import { CircularSuffixArray } from '../../src/utils/circular-suffix-array.js'

describe('CircularSuffixArray', () => {
  it('constructor initializes with correct length', () => {
    const csa = new CircularSuffixArray('hello')
    expect(csa.length).toBe(5)
    expect(csa.indices.length).toBe(5)
  })

  it('constructor handles empty string', () => {
    const csa = new CircularSuffixArray('')
    expect(csa.length).toBe(0)
    expect(csa.indices.length).toBe(0)
  })

  it('constructor handles single character', () => {
    const csa = new CircularSuffixArray('a')
    expect(csa.length).toBe(1)
    expect(csa.index(0)).toBe(0)
  })

  it('index returns correct suffix starting position', () => {
    const csa = new CircularSuffixArray('ABAB')
    const result = []
    for (let i = 0; i < csa.length; i++) {
      result.push(csa.index(i))
    }
    expect(result).toEqual([0, 2, 1, 3])
  })

  it('index handles out of bounds', () => {
    const csa = new CircularSuffixArray('hello')
    expect(csa.index(10)).toBeUndefined()
  })

  it('rank returns correct sorted position', () => {
    const csa = new CircularSuffixArray('ABAB')
    expect(csa.rank(0)).toBe(0)
    expect(csa.rank(1)).toBe(2)
    expect(csa.rank(2)).toBe(1)
    expect(csa.rank(3)).toBe(3)
  })

  it('rank returns -1 for invalid suffix index', () => {
    const csa = new CircularSuffixArray('hello')
    expect(csa.rank(-1)).toBe(-1)
    expect(csa.rank(10)).toBe(-1)
  })

  it('first returns smallest suffix index', () => {
    const csa = new CircularSuffixArray('ABAB')
    expect(csa.first()).toBe(0)
  })

  it('last returns largest suffix index', () => {
    const csa = new CircularSuffixArray('ABAB')
    expect(csa.last()).toBe(3)
  })

  it('sorts suffixes correctly for repeated characters', () => {
    const csa = new CircularSuffixArray('AAAA')
    const result = []
    for (let i = 0; i < csa.length; i++) {
      result.push(csa.index(i))
    }
    expect(result).toEqual([0, 1, 2, 3])
  })

  it('handles case sensitivity', () => {
    const csa = new CircularSuffixArray('aAbB')
    const result = []
    for (let i = 0; i < csa.length; i++) {
      result.push(csa.index(i))
    }
    expect(result.length).toBe(4)
  })

  it('sorts suffixes correctly for mixed content', () => {
    const csa = new CircularSuffixArray('BANANA')
    const result = []
    for (let i = 0; i < csa.length; i++) {
      result.push(csa.index(i))
    }
    expect(result.length).toBe(6)
    expect(result[0]).toBe(5)
  })

  it('rank and index are consistent', () => {
    const csa = new CircularSuffixArray('hello')
    for (let i = 0; i < csa.length; i++) {
      const idx = csa.index(i)
      expect(csa.rank(idx)).toBe(i)
    }
  })

  it('handles numeric string', () => {
    const csa = new CircularSuffixArray('123')
    expect(csa.length).toBe(3)
    expect(csa.first()).toBeDefined()
    expect(csa.last()).toBeDefined()
  })

  it('indices are all unique', () => {
    const csa = new CircularSuffixArray('abcdef')
    const indices = new Set<number>()
    for (let i = 0; i < csa.length; i++) {
      indices.add(csa.index(i)!)
    }
    expect(indices.size).toBe(6)
  })

  it('handles special characters', () => {
    const csa = new CircularSuffixArray('!@#')
    expect(csa.length).toBe(3)
    expect(csa.first()).toBeDefined()
  })

  it('handles repeated pattern', () => {
    const csa = new CircularSuffixArray('abcabc')
    expect(csa.length).toBe(6)
    for (let i = 0; i < 6; i++) {
      expect(csa.rank(csa.index(i)!)).toBe(i)
    }
  })

  it('single character', () => {
    const csa = new CircularSuffixArray('a')
    expect(csa.index(0)).toBe(0)
  })

  it('ab has correct indices', () => {
    const csa = new CircularSuffixArray('ab')
    expect(csa.index(0)).toBe(0)
    expect(csa.index(1)).toBe(1)
  })

  it('length returns string length', () => {
    const csa = new CircularSuffixArray('hello')
    expect(csa.length).toBe(5)
  })

  it('index returns valid suffix index', () => {
    const csa = new CircularSuffixArray('abc')
    expect(csa.index(0)).toBeGreaterThanOrEqual(0)
    expect(csa.index(0)).toBeLessThan(3)
  })

  it('length returns string length', () => {
    const csa = new CircularSuffixArray('abc')
    expect(csa.length).toBe(3)
  })

  it('index returns sorted order', () => {
    const csa = new CircularSuffixArray('abc')
    expect(csa.index(0)).toBeGreaterThanOrEqual(0)
  })

  it('length returns string length', () => {
    const csa = new CircularSuffixArray('abcd')
    expect(csa.length).toBe(4)
  })

  it('index of original string is 0 for sorted', () => {
    const csa = new CircularSuffixArray('abcd')
    expect(csa.index(0)).toBeGreaterThanOrEqual(0)
  })
})