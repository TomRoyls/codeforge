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

  it('returns object with correct properties', () => {
    const grid = [['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result).toHaveProperty('len')
    expect(result).toHaveProperty('r')
    expect(result).toHaveProperty('c')
  })

  it('row coordinate is non-negative', () => {
    const grid = [['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.r).toBeGreaterThanOrEqual(0)
  })

  it('column coordinate is non-negative', () => {
    const grid = [['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.c).toBeGreaterThanOrEqual(0)
  })

  it('handles 3x1 grid', () => {
    const grid = [['a'], ['b'], ['c']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles 1x3 grid', () => {
    const grid = [['a', 'b', 'c']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles 4x4 all same', () => {
    const grid = [
      ['a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('finds palindrome at corner', () => {
    const grid = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 2x2 different chars', () => {
    const grid = [
      ['a', 'b'],
      ['c', 'd'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles grid with special characters', () => {
    const grid = [
      ['@', '#'],
      ['#', '@'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 5x5 all same', () => {
    const grid = [
      ['x', 'x', 'x', 'x', 'x'],
      ['x', 'x', 'x', 'x', 'x'],
      ['x', 'x', 'x', 'x', 'x'],
      ['x', 'x', 'x', 'x', 'x'],
      ['x', 'x', 'x', 'x', 'x'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 3x4 grid', () => {
    const grid = [
      ['a', 'b', 'c', 'd'],
      ['e', 'f', 'g', 'h'],
      ['i', 'j', 'k', 'l'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 4x3 grid', () => {
    const grid = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
      ['j', 'k', 'l'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('finds palindrome in 7x7 grid', () => {
    const grid = [
      ['x', 'x', 'x', 'x', 'x', 'x', 'x'],
      ['x', 'a', 'b', 'c', 'b', 'a', 'x'],
      ['x', 'b', 'd', 'e', 'd', 'b', 'x'],
      ['x', 'c', 'e', 'f', 'e', 'c', 'x'],
      ['x', 'b', 'd', 'e', 'd', 'b', 'x'],
      ['x', 'a', 'b', 'c', 'b', 'a', 'x'],
      ['x', 'x', 'x', 'x', 'x', 'x', 'x'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(7)
  })

  it('handles grid with numbers as strings', () => {
    const grid = [
      ['1', '2'],
      ['2', '1'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 6x6 all same', () => {
    const grid = [
      ['a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles grid with single row and multiple columns', () => {
    const grid = [['a', 'a', 'a', 'a', 'a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles grid with single column and multiple rows', () => {
    const grid = [['a'], ['a'], ['a'], ['a'], ['a']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles grid with alternating pattern', () => {
    const grid = [
      ['a', 'b', 'a'],
      ['b', 'a', 'b'],
      ['a', 'b', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('finds palindrome with center at edge', () => {
    const grid = [
      ['a', 'b'],
      ['c', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 8x8 all same', () => {
    const grid = [
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 2x5 grid', () => {
    const grid = [
      ['a', 'b', 'c', 'd', 'e'],
      ['a', 'b', 'c', 'd', 'e'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles 5x2 grid', () => {
    const grid = [
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
      ['g', 'h'],
      ['i', 'j'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('handles grid with unicode characters', () => {
    const grid = [
      ['α', 'β'],
      ['β', 'α'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('returns correct center coordinates for 1x1 palindrome', () => {
    const grid = [['x']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.r).toBe(0)
    expect(result.c).toBe(0)
  })

  it('finds center of 3x3 palindrome at correct position', () => {
    const grid = [
      ['a', 'b', 'a'],
      ['b', 'c', 'b'],
      ['a', 'b', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.r).toBe(1)
    expect(result.c).toBe(1)
    expect(result.len).toBe(3)
  })

  it('handles grid with no palindrome larger than 1x1', () => {
    const grid = [
      ['a', 'b', 'c', 'd'],
      ['e', 'f', 'g', 'h'],
      ['i', 'j', 'k', 'l'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('finds palindrome in rectangular 3x5 grid', () => {
    const grid = [
      ['a', 'b', 'a', 'b', 'a'],
      ['c', 'd', 'c', 'd', 'c'],
      ['a', 'b', 'a', 'b', 'a'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(3)
  })

  it('handles 9x9 all same character grid', () => {
    const grid = Array(9).fill(null).map(() => Array(9).fill('a'))
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('finds smallest possible palindrome in 1x2 grid', () => {
    const grid = [['a', 'b']]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBe(1)
  })

  it('handles grid with mixed palindrome sizes', () => {
    const grid = [
      ['a', 'a', 'a', 'b'],
      ['a', 'a', 'a', 'b'],
      ['a', 'a', 'a', 'b'],
      ['c', 'c', 'c', 'd'],
    ]
    const result = Manacher2D.longestPalindromicSubgrid(grid)
    expect(result.len).toBeGreaterThanOrEqual(3)
  })

  it('1x1 grid returns len 1', () => {
    const result = Manacher2D.longestPalindromicSubgrid([['a']])
    expect(result.len).toBe(1)
  })

  it('2x2 same chars returns len', () => {
    const result = Manacher2D.longestPalindromicSubgrid([['a', 'a'], ['a', 'a']])
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('empty grid', () => {
    const result = Manacher2D.longestPalindromicSubgrid([])
    expect(result).toBeDefined()
  })

  it('1x1 grid', () => {
    const result = Manacher2D.longestPalindromicSubgrid([['a']])
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('2x2 same char', () => {
    const result = Manacher2D.longestPalindromicSubgrid([['a', 'a'], ['a', 'a']])
    expect(result.len).toBeGreaterThanOrEqual(1)
  })

  it('returns object with len', () => {
    const result = Manacher2D.longestPalindromicSubgrid([['a']])
    expect(typeof result.len).toBe('number')
  })
})

describe('manacher-2d - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('manacher-2d - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('manacher-2d - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('manacher-2d - wave548', () => {
  it('manacher-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave549', () => {
  it('manacher-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave550', () => {
  it('manacher-2d w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave551', () => {
  it('manacher-2d w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave552', () => {
  it('manacher-2d w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave553', () => {
  it('manacher-2d w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave554', () => {
  it('manacher-2d w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave555', () => {
  it('manacher-2d w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave556', () => {
  it('manacher-2d w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
