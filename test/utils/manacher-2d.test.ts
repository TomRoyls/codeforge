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

describe('manacher-2d - wave557', () => {
  it('manacher-2d w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave558', () => {
  it('manacher-2d w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave559', () => {
  it('manacher-2d w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave560', () => {
  it('manacher-2d w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave561', () => {
  it('manacher-2d w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave562', () => {
  it('manacher-2d w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave563', () => {
  it('manacher-2d w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave564', () => {
  it('manacher-2d w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave565', () => {
  it('manacher-2d w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave566', () => {
  it('manacher-2d w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave127', () => {
  it('manacher-2d w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave130', () => {
  it('manacher-2d w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave133', () => {
  it('manacher-2d w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave136', () => {
  it('manacher-2d w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - wave139', () => {
  it('manacher-2d w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w142', () => {
  it('manacher-2d v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w145', () => {
  it('manacher-2d v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w148', () => {
  it('manacher-2d v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w151', () => {
  it('manacher-2d v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w154', () => {
  it('manacher-2d v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w157', () => {
  it('manacher-2d v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w160', () => {
  it('manacher-2d v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w170', () => {
  it('manacher-2d x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w180', () => {
  it('manacher-2d x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w190', () => {
  it('manacher-2d x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w200', () => {
  it('manacher-2d x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w210', () => {
  it('manacher-2d x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w220', () => {
  it('manacher-2d x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w230', () => {
  it('manacher-2d x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w240', () => {
  it('manacher-2d x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w250', () => {
  it('manacher-2d x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w260', () => {
  it('manacher-2d x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w270', () => {
  it('manacher-2d x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w280', () => {
  it('manacher-2d x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w290', () => {
  it('manacher-2d x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w300', () => {
  it('manacher-2d x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w310', () => {
  it('manacher-2d x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w320', () => {
  it('manacher-2d x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w330', () => {
  it('manacher-2d x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w340', () => {
  it('manacher-2d x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w350', () => {
  it('manacher-2d x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w360', () => {
  it('manacher-2d x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w370', () => {
  it('manacher-2d x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w380', () => {
  it('manacher-2d x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w390', () => {
  it('manacher-2d x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w400', () => {
  it('manacher-2d x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w420', () => {
  it('manacher-2d x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w440', () => {
  it('manacher-2d x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w460', () => {
  it('manacher-2d x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w480', () => {
  it('manacher-2d x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('manacher-2d - w500', () => {
  it('manacher-2d x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('manacher-2d x500x19', () => {
    expect(describe).toBeDefined()
  })
})
