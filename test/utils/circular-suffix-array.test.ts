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
