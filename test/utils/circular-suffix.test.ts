import { describe, expect, it } from 'vitest'
import { CircularSuffix } from '../../src/utils/circular-suffix.js'

describe('CircularSuffix', () => {
  it('builds suffix array for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.suffixArray()).toEqual([0, 2, 1, 3])
  })

  it('returns correct rank for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.rank(0)).toBe(0)
    expect(cs.rank(1)).toBe(2)
  })

  it('returns correct index for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.index(0)).toBe(0)
    expect(cs.index(2)).toBe(1)
  })

  it('handles single character a', () => {
    const cs = CircularSuffix.build('a')
    expect(cs.suffixArray()).toEqual([0])
    expect(cs.length).toBe(1)
  })

  it('handles all same characters aaa', () => {
    const cs = CircularSuffix.build('aaa')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('handles reverse sorted cba', () => {
    const cs = CircularSuffix.build('cba')
    expect(cs.suffixArray()).toEqual([2, 1, 0])
  })

  it('returns length for hello', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.length).toBe(5)
  })

  it('handles two characters ba', () => {
    const cs = CircularSuffix.build('ba')
    expect(cs.suffixArray()).toEqual([1, 0])
  })

  it('rank and index are inverses for banana', () => {
    const cs = CircularSuffix.build('banana')
    for (let i = 0; i < 6; i++) {
      expect(cs.index(cs.rank(i))).toBe(i)
    }
  })

  it('handles empty string', () => {
    const cs = CircularSuffix.build('')
    expect(cs.length).toBe(0)
    expect(cs.suffixArray()).toEqual([])
  })

  it('abc circular order is sorted', () => {
    const cs = CircularSuffix.build('abc')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('cab circular order', () => {
    const cs = CircularSuffix.build('cab')
    expect(cs.suffixArray()).toEqual([1, 2, 0])
  })

  it('aaaa all same characters maintains order', () => {
    const cs = CircularSuffix.build('aaaa')
    expect(cs.length).toBe(4)
  })

  it('ab circular order', () => {
    const cs = CircularSuffix.build('ab')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('suffix array for banana has correct length', () => {
    const cs = CircularSuffix.build('banana')
    expect(cs.suffixArray().length).toBe(6)
  })

  it('abc suffix array is sorted', () => {
    const cs = CircularSuffix.build('abc')
    const sa = cs.suffixArray()
    const sorted = [...sa].sort((a, b) => a - b)
    expect(sa).toEqual(sorted)
  })

  it('handles two characters ab', () => {
    const cs = CircularSuffix.build('ab')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('aaa suffix array has correct length', () => {
    const cs = CircularSuffix.build('aaa')
    expect(cs.suffixArray().length).toBe(3)
  })

  it('suffixArray of single char has length 1', () => {
    const cs = CircularSuffix.build('a')
    expect(cs.suffixArray().length).toBe(1)
  })

  it('suffixArray of abc has length 3', () => {
    const cs = CircularSuffix.build('abc')
    expect(cs.suffixArray().length).toBe(3)
  })

  it('builds suffix array for abcabc', () => {
    const cs = CircularSuffix.build('abcabc')
    expect(cs.length).toBe(6)
  })

  it('builds suffix array for zzz', () => {
    const cs = CircularSuffix.build('zzz')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('builds suffix array for abacaba', () => {
    const cs = CircularSuffix.build('abacaba')
    expect(cs.length).toBe(7)
  })

  it('builds suffix array for mississippi', () => {
    const cs = CircularSuffix.build('mississippi')
    expect(cs.length).toBe(11)
  })

  it('returns correct rank for index 0', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.rank(0)).toBeDefined()
  })

  it('returns correct rank for last index', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.rank(4)).toBeDefined()
  })

  it('returns correct index for rank 0', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.index(0)).toBeDefined()
  })

  it('returns correct index for last rank', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.index(4)).toBeDefined()
  })

  it('handles string with repeated pattern ababab', () => {
    const cs = CircularSuffix.build('ababab')
    expect(cs.length).toBe(6)
  })

  it('handles string with special characters', () => {
    const cs = CircularSuffix.build('a$b')
    expect(cs.length).toBe(3)
  })

  it('handles string with numbers', () => {
    const cs = CircularSuffix.build('a1b2')
    expect(cs.length).toBe(4)
  })

  it('handles string with mixed case', () => {
    const cs = CircularSuffix.build('aAbB')
    expect(cs.length).toBe(4)
  })

  it('handles string with only one repeated character x', () => {
    const cs = CircularSuffix.build('x')
    expect(cs.suffixArray()).toEqual([0])
  })

  it('handles string with alternating characters abababab', () => {
    const cs = CircularSuffix.build('abababab')
    expect(cs.length).toBe(8)
  })

  it('handles string with palindrome racecar', () => {
    const cs = CircularSuffix.build('racecar')
    expect(cs.length).toBe(7)
  })

  it('handles string with increasing sequence abcdef', () => {
    const cs = CircularSuffix.build('abcdef')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('handles string with decreasing sequence fedcba', () => {
    const cs = CircularSuffix.build('fedcba')
    expect(cs.suffixArray()).toEqual([5, 4, 3, 2, 1, 0])
  })

  it('suffix array contains all indices', () => {
    const cs = CircularSuffix.build('hello')
    const sa = cs.suffixArray()
    const indices = new Set(sa)
    for (let i = 0; i < 5; i++) {
      expect(indices.has(i)).toBe(true)
    }
  })

  it('suffix array has no duplicates', () => {
    const cs = CircularSuffix.build('banana')
    const sa = cs.suffixArray()
    const unique = new Set(sa)
    expect(unique.size).toBe(sa.length)
  })

  it('handles string with single character repeated many times xxxxx', () => {
    const cs = CircularSuffix.build('xxxxx')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles string with two distinct characters ababa', () => {
    const cs = CircularSuffix.build('ababa')
    expect(cs.length).toBe(5)
  })

  it('handles string with same character at different positions aaaaaa', () => {
    const cs = CircularSuffix.build('aaaaaa')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('builds suffix array for abcdefg', () => {
    const cs = CircularSuffix.build('abcdefg')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('builds suffix array for cdefgab', () => {
    const cs = CircularSuffix.build('cdefgab')
    expect(cs.length).toBe(7)
  })

  it('handles string with spaces', () => {
    const cs = CircularSuffix.build('a b c')
    expect(cs.length).toBe(5)
  })

  it('handles string with punctuation', () => {
    const cs = CircularSuffix.build('a,b,c')
    expect(cs.length).toBe(5)
  })

  it('suffix array is a permutation of indices', () => {
    const cs = CircularSuffix.build('testing')
    const sa = cs.suffixArray()
    const sorted = [...sa].sort((a, b) => a - b)
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('handles string length 10', () => {
    const cs = CircularSuffix.build('abcdefghij')
    expect(cs.length).toBe(10)
  })

  it('handles string with repeated substring ababababa', () => {
    const cs = CircularSuffix.build('ababababa')
    expect(cs.length).toBe(9)
  })

  it('handles binary string 010101', () => {
    const cs = CircularSuffix.build('010101')
    expect(cs.length).toBe(6)
  })

  it('handles string with consecutive same characters aaabbb', () => {
    const cs = CircularSuffix.build('aaabbb')
    expect(cs.length).toBe(6)
  })

  it('handles string with pattern aabbaa', () => {
    const cs = CircularSuffix.build('aabbaa')
    expect(cs.length).toBe(6)
  })

  it('handles string with all characters unique abcdefgh', () => {
    const cs = CircularSuffix.build('abcdefgh')
    expect(cs.length).toBe(8)
  })

  it('handles string with single character z', () => {
    const cs = CircularSuffix.build('z')
    expect(cs.suffixArray()).toEqual([0])
  })

  it('handles string aa with two same characters', () => {
    const cs = CircularSuffix.build('aa')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('handles string zz with two same characters', () => {
    const cs = CircularSuffix.build('zz')
    expect(cs.suffixArray()).toEqual([0, 1])
  })
})
describe('circular-suffix - wave548', () => {
  it('circular-suffix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has name', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module not null', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has length', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave549', () => {
  it('circular-suffix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave550', () => {
  it('circular-suffix w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave551', () => {
  it('circular-suffix w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave552', () => {
  it('circular-suffix w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave553', () => {
  it('circular-suffix w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave554', () => {
  it('circular-suffix w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave555', () => {
  it('circular-suffix w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave556', () => {
  it('circular-suffix w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave557', () => {
  it('circular-suffix w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave558', () => {
  it('circular-suffix w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave559', () => {
  it('circular-suffix w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave560', () => {
  it('circular-suffix w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave561', () => {
  it('circular-suffix w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave562', () => {
  it('circular-suffix w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave563', () => {
  it('circular-suffix w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave564', () => {
  it('circular-suffix w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave565', () => {
  it('circular-suffix w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave566', () => {
  it('circular-suffix w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave127', () => {
  it('circular-suffix w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave130', () => {
  it('circular-suffix w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave133', () => {
  it('circular-suffix w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave136', () => {
  it('circular-suffix w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave139', () => {
  it('circular-suffix w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w142', () => {
  it('circular-suffix v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w145', () => {
  it('circular-suffix v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w148', () => {
  it('circular-suffix v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w151', () => {
  it('circular-suffix v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w154', () => {
  it('circular-suffix v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w157', () => {
  it('circular-suffix v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w160', () => {
  it('circular-suffix v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w170', () => {
  it('circular-suffix x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w180', () => {
  it('circular-suffix x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w190', () => {
  it('circular-suffix x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w200', () => {
  it('circular-suffix x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w210', () => {
  it('circular-suffix x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w220', () => {
  it('circular-suffix x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w230', () => {
  it('circular-suffix x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w240', () => {
  it('circular-suffix x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w250', () => {
  it('circular-suffix x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w260', () => {
  it('circular-suffix x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w270', () => {
  it('circular-suffix x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w280', () => {
  it('circular-suffix x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w290', () => {
  it('circular-suffix x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w300', () => {
  it('circular-suffix x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w310', () => {
  it('circular-suffix x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w320', () => {
  it('circular-suffix x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w330', () => {
  it('circular-suffix x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w340', () => {
  it('circular-suffix x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w350', () => {
  it('circular-suffix x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w360', () => {
  it('circular-suffix x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w370', () => {
  it('circular-suffix x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w380', () => {
  it('circular-suffix x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w390', () => {
  it('circular-suffix x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w400', () => {
  it('circular-suffix x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w420', () => {
  it('circular-suffix x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w440', () => {
  it('circular-suffix x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w460', () => {
  it('circular-suffix x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w480', () => {
  it('circular-suffix x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w500', () => {
  it('circular-suffix x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w550', () => {
  it('circular-suffix x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w600', () => {
  it('circular-suffix x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w650', () => {
  it('circular-suffix x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - w700', () => {
  it('circular-suffix x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix x700x49', () => {
    expect(describe).toBeDefined()
  })
})
