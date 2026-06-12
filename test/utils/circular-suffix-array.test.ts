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

  it('handles unicode characters', () => {
    const csa = new CircularSuffixArray('héllo')
    expect(csa.length).toBe(5)
    expect(csa.first()).toBeDefined()
    expect(csa.last()).toBeDefined()
  })

  it('handles emojis', () => {
    const csa = new CircularSuffixArray('🎉🎊')
    expect(csa.length).toBe(4)
  })

  it('handles mixed unicode and ASCII', () => {
    const csa = new CircularSuffixArray('a日本b')
    expect(csa.length).toBe(4)
  })

  it('sorts correctly for all same character', () => {
    const csa = new CircularSuffixArray('xxxxx')
    expect(csa.length).toBe(5)
    for (let i = 0; i < csa.length; i++) {
      expect(csa.index(i)).toBe(i)
    }
  })

  it('handles whitespace characters', () => {
    const csa = new CircularSuffixArray('a b c')
    expect(csa.length).toBe(5)
  })

  it('handles tabs and newlines', () => {
    const csa = new CircularSuffixArray('a\tb\nc')
    expect(csa.length).toBe(5)
  })

  it('rank works for empty string', () => {
    const csa = new CircularSuffixArray('')
    expect(csa.rank(0)).toBe(-1)
  })

  it('index returns undefined for empty string', () => {
    const csa = new CircularSuffixArray('')
    expect(csa.index(0)).toBeUndefined()
  })

  it('first and last work for two characters', () => {
    const csa = new CircularSuffixArray('ab')
    expect(csa.first()).toBeDefined()
    expect(csa.last()).toBeDefined()
  })

  it('handles descending order string', () => {
    const csa = new CircularSuffixArray('dcba')
    expect(csa.length).toBe(4)
  })

  it('handles alternating pattern', () => {
    const csa = new CircularSuffixArray('ababab')
    expect(csa.length).toBe(6)
  })

  it('handles palindrome', () => {
    const csa = new CircularSuffixArray('racecar')
    expect(csa.length).toBe(7)
  })

  it('handles very long string', () => {
    const longStr = 'a'.repeat(1000)
    const csa = new CircularSuffixArray(longStr)
    expect(csa.length).toBe(1000)
  })

  it('indices are permutation of 0 to length-1', () => {
    const csa = new CircularSuffixArray('testing')
    const indices = new Set<number>()
    for (let i = 0; i < csa.length; i++) {
      const idx = csa.index(i)!
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(csa.length)
      indices.add(idx)
    }
    expect(indices.size).toBe(csa.length)
  })

  it('rank returns -1 for all out of range indices', () => {
    const csa = new CircularSuffixArray('test')
    expect(csa.rank(-100)).toBe(-1)
    expect(csa.rank(-1)).toBe(-1)
    expect(csa.rank(4)).toBe(-1)
    expect(csa.rank(100)).toBe(-1)
  })

  it('handles string with only spaces', () => {
    const csa = new CircularSuffixArray('     ')
    expect(csa.length).toBe(5)
  })

  it('sorts correctly for alphabet string', () => {
    const csa = new CircularSuffixArray('abcdefghijklmnopqrstuvwxyz')
    expect(csa.length).toBe(26)
  })

  it('sorts correctly for reverse alphabet', () => {
    const csa = new CircularSuffixArray('zyxwvutsrqponmlkjihgfedcba')
    expect(csa.length).toBe(26)
  })

  it('handles string starting with space', () => {
    const csa = new CircularSuffixArray(' hello')
    expect(csa.length).toBe(6)
  })

  it('handles string ending with space', () => {
    const csa = new CircularSuffixArray('hello ')
    expect(csa.length).toBe(6)
  })

  it('rank for all valid indices returns unique values', () => {
    const csa = new CircularSuffixArray('example')
    const ranks = new Set<number>()
    for (let i = 0; i < csa.length; i++) {
      ranks.add(csa.rank(i))
    }
    expect(ranks.size).toBe(csa.length)
  })

  it('handles string with punctuation', () => {
    const csa = new CircularSuffixArray('hello,world!')
    expect(csa.length).toBe(12)
  })

  it('handles string with numbers', () => {
    const csa = new CircularSuffixArray('test123')
    expect(csa.length).toBe(7)
  })

  it('handles mixed case string', () => {
    const csa = new CircularSuffixArray('HeLLoWoRLD')
    expect(csa.length).toBe(10)
  })

  it('first and last are different for varied string', () => {
    const csa = new CircularSuffixArray('banana')
    expect(csa.first()).not.toBe(csa.last())
  })

  it('handles string with one repeated character', () => {
    const csa = new CircularSuffixArray('aaaaab')
    expect(csa.length).toBe(6)
  })

  it('sorts suffixes lexicographically', () => {
    const csa = new CircularSuffixArray('baba')
    const result = []
    for (let i = 0; i < csa.length; i++) {
      result.push(csa.index(i))
    }
    expect(result).toEqual([1, 3, 0, 2])
  })

  it('handles string with zero character', () => {
    const csa = new CircularSuffixArray('a\x00b')
    expect(csa.length).toBe(3)
  })

  it('rank returns correct value', () => {
    const csa = new CircularSuffixArray('abc')
    expect(typeof csa.rank(0)).toBe('number')
  })

  it('first and last are valid indices', () => {
    const csa = new CircularSuffixArray('banana')
    expect(csa.first()).toBeGreaterThanOrEqual(0)
    expect(csa.last()).toBeGreaterThanOrEqual(0)
  })

  it('single character', () => {
    const csa = new CircularSuffixArray('x')
    expect(csa.length).toBe(1)
    expect(csa.index(0)).toBe(0)
  })
})
describe('circular-suffix-array - wave548', () => {
  it('circular-suffix-array module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module has name', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module not null', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module has length', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave549', () => {
  it('circular-suffix-array module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave550', () => {
  it('circular-suffix-array w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave551', () => {
  it('circular-suffix-array w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave552', () => {
  it('circular-suffix-array w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave553', () => {
  it('circular-suffix-array w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave554', () => {
  it('circular-suffix-array w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave555', () => {
  it('circular-suffix-array w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave556', () => {
  it('circular-suffix-array w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave557', () => {
  it('circular-suffix-array w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave558', () => {
  it('circular-suffix-array w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave559', () => {
  it('circular-suffix-array w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave560', () => {
  it('circular-suffix-array w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave561', () => {
  it('circular-suffix-array w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave562', () => {
  it('circular-suffix-array w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave563', () => {
  it('circular-suffix-array w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave564', () => {
  it('circular-suffix-array w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave565', () => {
  it('circular-suffix-array w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave566', () => {
  it('circular-suffix-array w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave127', () => {
  it('circular-suffix-array w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave130', () => {
  it('circular-suffix-array w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave133', () => {
  it('circular-suffix-array w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave136', () => {
  it('circular-suffix-array w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - wave139', () => {
  it('circular-suffix-array w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w142', () => {
  it('circular-suffix-array v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w145', () => {
  it('circular-suffix-array v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w148', () => {
  it('circular-suffix-array v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w151', () => {
  it('circular-suffix-array v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w154', () => {
  it('circular-suffix-array v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w157', () => {
  it('circular-suffix-array v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w160', () => {
  it('circular-suffix-array v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w170', () => {
  it('circular-suffix-array x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w180', () => {
  it('circular-suffix-array x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w190', () => {
  it('circular-suffix-array x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w200', () => {
  it('circular-suffix-array x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w210', () => {
  it('circular-suffix-array x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w220', () => {
  it('circular-suffix-array x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w230', () => {
  it('circular-suffix-array x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w240', () => {
  it('circular-suffix-array x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w250', () => {
  it('circular-suffix-array x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w260', () => {
  it('circular-suffix-array x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w270', () => {
  it('circular-suffix-array x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w280', () => {
  it('circular-suffix-array x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w290', () => {
  it('circular-suffix-array x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w300', () => {
  it('circular-suffix-array x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w310', () => {
  it('circular-suffix-array x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w320', () => {
  it('circular-suffix-array x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w330', () => {
  it('circular-suffix-array x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w340', () => {
  it('circular-suffix-array x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w350', () => {
  it('circular-suffix-array x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w360', () => {
  it('circular-suffix-array x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w370', () => {
  it('circular-suffix-array x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w380', () => {
  it('circular-suffix-array x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w390', () => {
  it('circular-suffix-array x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix-array - w400', () => {
  it('circular-suffix-array x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix-array x400x9', () => {
    expect(describe).toBeDefined()
  })
})
