import { describe, expect, it } from 'vitest'
import { WaveletTree } from '../../src/utils/wavelet-tree.js'

// ─── Construction ───

describe('WaveletTree construction', () => {
  it('builds from string', () => {
    const wt = new WaveletTree('banana')
    expect(wt.length).toBe(6)
    expect(wt.text).toBe('banana')
  })

  it('handles empty string', () => {
    const wt = new WaveletTree('')
    expect(wt.length).toBe(0)
  })

  it('handles single character', () => {
    const wt = new WaveletTree('a')
    expect(wt.length).toBe(1)
    expect(wt.access(0)).toBe('a')
  })

  it('handles repeated character', () => {
    const wt = new WaveletTree('aaa')
    expect(wt.access(0)).toBe('a')
    expect(wt.access(1)).toBe('a')
    expect(wt.access(2)).toBe('a')
  })
})

// ─── Access ───

describe('WaveletTree access', () => {
  it('returns correct characters', () => {
    const wt = new WaveletTree('banana')
    expect(wt.access(0)).toBe('b')
    expect(wt.access(1)).toBe('a')
    expect(wt.access(2)).toBe('n')
    expect(wt.access(3)).toBe('a')
    expect(wt.access(4)).toBe('n')
    expect(wt.access(5)).toBe('a')
  })

  it('throws on out of bounds', () => {
    const wt = new WaveletTree('abc')
    expect(() => wt.access(-1)).toThrow(RangeError)
    expect(() => wt.access(3)).toThrow(RangeError)
  })

  it('handles string with all unique chars', () => {
    const wt = new WaveletTree('abcdef')
    for (let i = 0; i < 6; i++) {
      expect(wt.access(i)).toBe('abcdef'[i])
    }
  })
})

// ─── Rank ───

describe('WaveletTree rank', () => {
  it('counts occurrences up to position', () => {
    const wt = new WaveletTree('banana')
    expect(wt.rank('a', 0)).toBe(0)
    expect(wt.rank('a', 1)).toBe(1)
    expect(wt.rank('a', 3)).toBe(2)
    expect(wt.rank('a', 5)).toBe(3)
  })

  it('returns 0 for non-existent character', () => {
    const wt = new WaveletTree('banana')
    expect(wt.rank('z', 5)).toBe(0)
  })

  it('returns 0 for negative position', () => {
    const wt = new WaveletTree('banana')
    expect(wt.rank('a', -1)).toBe(0)
  })

  it('counts character correctly', () => {
    const wt = new WaveletTree('banana')
    expect(wt.rank('b', 5)).toBe(1)
    expect(wt.rank('n', 5)).toBe(2)
  })
})

// ─── Select ───

describe('WaveletTree select', () => {
  it('finds position of nth occurrence', () => {
    const wt = new WaveletTree('banana')
    const pos = wt.select('a', 0)
    expect(pos).toBeGreaterThanOrEqual(0)
    expect(wt.access(pos)).toBe('a')
  })

  it('returns -1 for non-existent character', () => {
    const wt = new WaveletTree('banana')
    expect(wt.select('z', 0)).toBe(-1)
  })

  it('returns -1 for out of range occurrence', () => {
    const wt = new WaveletTree('banana')
    expect(wt.select('a', 100)).toBe(-1)
  })

  it('returns -1 for negative occurrence', () => {
    const wt = new WaveletTree('banana')
    expect(wt.select('a', -1)).toBe(-1)
  })

  it('finds first occurrence of each character', () => {
    const wt = new WaveletTree('banana')
    const bPos = wt.select('b', 0)
    expect(bPos).toBe(0)
  })
})
