import { describe, expect, it } from 'vitest'
import { Manacher2D } from '../../src/utils/manacher-2d.js'

describe('Manacher2D', () => {
  it('finds 1x1 palindrome', () => {
    const result = Manacher2D.longestPalindromicSubgrid([['a']])
    expect(result.len).toBe(1)
  })

  it('finds 3x3 palindrome', () => {
    const grid = [
      ['a', 'b', 'a'],
      ['b', 'x', 'b'],
      ['a', 'b', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(3)
  })

  it('finds single char palindrome in grid', () => {
    const grid = [
      ['a', 'b'],
      ['c', 'd'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles empty grid', () => {
    const result = Manacher2D.longestPalindromicSubgrid([])
    expect(result.len).toBe(0)
  })

  it('finds 1x1 in non-square grid', () => {
    const grid = [['a', 'b', 'c']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('finds palindrome in larger grid', () => {
    const grid = [
      ['x', 'x', 'x', 'x', 'x'],
      ['x', 'a', 'b', 'a', 'x'],
      ['x', 'b', 'c', 'b', 'x'],
      ['x', 'a', 'b', 'a', 'x'],
      ['x', 'x', 'x', 'x', 'x'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(3)
  })

  it('handles all same chars', () => {
    const grid = [
      ['a', 'a'],
      ['a', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles single row', () => {
    const grid = [['a', 'b', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles single column', () => {
    const grid = [['a'], ['b'], ['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('2x2 all same', () => {
    const grid = [
      ['a', 'a'],
      ['a', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('finds 5x5 palindrome', () => {
    const grid = [
      ['x', 'x', 'x', 'x', 'x'],
      ['x', 'a', 'b', 'a', 'x'],
      ['x', 'b', 'c', 'b', 'x'],
      ['x', 'a', 'b', 'a', 'x'],
      ['x', 'x', 'x', 'x', 'x'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(5)
  })

  it('handles 2x2 non-palindrome', () => {
    const grid = [
      ['a', 'b'],
      ['c', 'd'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles 1x1 grid', () => {
    const grid = [['z']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles 3x3 all same', () => {
    const grid = [
      ['a', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 2x3 grid', () => {
    const grid = [
      ['a', 'b', 'a'],
      ['a', 'b', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 1x2 grid', () => {
    const grid = [['a', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 1x1 grid', () => {
    const grid = [['x']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('2x2 uniform grid has palindrome of length at least 1', () => {
    const grid = [['a', 'a'], ['a', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('1x1 grid has palindrome of length 1', () => {
    const grid = [['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('2x2 uniform grid has palindrome', () => {
    const grid = [['a', 'a'], ['a', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('1x1 grid palindrome is 1', () => {
    const grid = [['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('2x2 same char has at least 1', () => {
    const grid = [['a', 'a'], ['a', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('1x1 grid palindrome length is 1', () => {
    const grid = [['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('all same chars in 2x2 has palindrome', () => {
    const grid = [['a', 'a'], ['a', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })
})
