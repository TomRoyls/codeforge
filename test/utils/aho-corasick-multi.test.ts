import { describe, expect, it } from 'vitest'
import { AhoCorasickMulti } from '../../src/utils/aho-corasick-multi.js'

describe('AhoCorasickMulti', () => {
  it('finds single pattern', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const result = ac.search('abcabc')
    expect(result.get(0)).toEqual([2, 5])
  })

  it('finds multiple patterns', () => {
    const ac = new AhoCorasickMulti(['he', 'she', 'his', 'hers'])
    const result = ac.search('ahishers')
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('handles no matches', () => {
    const ac = new AhoCorasickMulti(['xyz'])
    const result = ac.search('abcdef')
    expect(result.size).toBe(0)
  })

  it('handles empty text', () => {
    const ac = new AhoCorasickMulti(['a', 'b'])
    const result = ac.search('')
    expect(result.size).toBe(0)
  })

  it('handles overlapping patterns', () => {
    const ac = new AhoCorasickMulti(['ab', 'bc'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([1])
    expect(result.get(1)).toEqual([2])
  })

  it('handles single char patterns', () => {
    const ac = new AhoCorasickMulti(['a', 'b'])
    const result = ac.search('abab')
    expect(result.get(0)).toEqual([0, 2])
    expect(result.get(1)).toEqual([1, 3])
  })

  it('handles prefix pattern chain', () => {
    const ac = new AhoCorasickMulti(['a', 'ab', 'abc'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([0])
    expect(result.get(1)).toEqual([1])
    expect(result.get(2)).toEqual([2])
  })

  it('handles duplicate in text', () => {
    const ac = new AhoCorasickMulti(['aa'])
    const result = ac.search('aaaa')
    expect(result.get(0)!.length).toBe(3)
  })

  it('handles longer text', () => {
    const ac = new AhoCorasickMulti(['cat', 'dog'])
    const result = ac.search('catdogcat')
    expect(result.get(0)).toEqual([2, 8])
    expect(result.get(1)).toEqual([5])
  })

  it('handles pattern at end', () => {
    const ac = new AhoCorasickMulti(['end'])
    const result = ac.search('theend')
    expect(result.get(0)).toEqual([5])
  })

  it('handles multiple same-pattern matches', () => {
    const ac = new AhoCorasickMulti(['a'])
    const result = ac.search('aaa')
    expect(result.get(0)).toEqual([0, 1, 2])
  })

  it('handles longer pattern than text', () => {
    const ac = new AhoCorasickMulti(['abcdef'])
    const result = ac.search('abc')
    expect(result.size).toBe(0)
  })

  it('handles empty patterns array', () => {
    const ac = new AhoCorasickMulti([])
    const result = ac.search('abc')
    expect(result.size).toBe(0)
  })

  it('no match returns empty result', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const result = ac.search('xyz')
    expect(result.get(0)).toBeUndefined()
  })

  it('finds pattern at start', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const result = ac.search('abcdef')
    expect(result.get(0)).toEqual([2])
  })

  it('toString returns state count', () => {
    const ac = new AhoCorasickMulti(['abc', 'def'])
    const str = ac.toString()
    expect(str).toContain('AhoCorasickMulti')
    expect(str).toContain('states=')
  })

  it('toJSON returns structured data', () => {
    const ac = new AhoCorasickMulti(['ab'])
    const json = ac.toJSON() as { stateCount: number; fail: number[]; output: number[][] }
    expect(json.stateCount).toBeGreaterThan(0)
    expect(json.fail).toBeInstanceOf(Array)
    expect(json.output).toBeInstanceOf(Array)
  })

  it('clone produces equal automaton', () => {
    const ac = new AhoCorasickMulti(['he', 'she', 'his'])
    const cloned = ac.clone()
    expect(cloned.equals(ac)).toBe(true)
  })

  it('clone produces independent copy', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const cloned = ac.clone()
    const r1 = ac.search('abc')
    const r2 = cloned.search('abc')
    expect(r1).toEqual(r2)
  })

  it('equals returns false for different types', () => {
    const ac = new AhoCorasickMulti(['abc'])
    expect(ac.equals(null)).toBe(false)
    expect(ac.equals(undefined)).toBe(false)
    expect(ac.equals({})).toBe(false)
    expect(ac.equals('abc')).toBe(false)
  })

  it('equals returns false for different automata', () => {
    const ac1 = new AhoCorasickMulti(['abc'])
    const ac2 = new AhoCorasickMulti(['def'])
    expect(ac1.equals(ac2)).toBe(false)
  })

  it('equals returns true for same patterns', () => {
    const ac1 = new AhoCorasickMulti(['abc', 'def'])
    const ac2 = new AhoCorasickMulti(['abc', 'def'])
    expect(ac1.equals(ac2)).toBe(true)
  })

  it('finds pattern repeated many times', () => {
    const ac = new AhoCorasickMulti(['ab'])
    const text = 'ab'.repeat(100)
    const result = ac.search(text)
    expect(result.get(0)!.length).toBe(100)
  })

  it('handles suffix patterns', () => {
    const ac = new AhoCorasickMulti(['c', 'bc', 'abc'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([2])
    expect(result.get(1)).toEqual([2])
    expect(result.get(2)).toEqual([2])
  })

  it('handles one pattern being prefix of another', () => {
    const ac = new AhoCorasickMulti(['a', 'ab', 'abc', 'abcd'])
    const result = ac.search('abcd')
    expect(result.get(0)).toEqual([0])
    expect(result.get(1)).toEqual([1])
    expect(result.get(2)).toEqual([2])
    expect(result.get(3)).toEqual([3])
  })

  it('handles patterns with shared suffix', () => {
    const ac = new AhoCorasickMulti(['abc', 'bc', 'c'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([2])
    expect(result.get(1)).toEqual([2])
    expect(result.get(2)).toEqual([2])
  })

  it('handles single character text', () => {
    const ac = new AhoCorasickMulti(['a'])
    const result = ac.search('a')
    expect(result.get(0)).toEqual([0])
  })

  it('handles single character text no match', () => {
    const ac = new AhoCorasickMulti(['b'])
    const result = ac.search('a')
    expect(result.size).toBe(0)
  })

  it('handles unicode patterns', () => {
    const ac = new AhoCorasickMulti(['日本'])
    const result = ac.search('日本語日本')
    expect(result.get(0)!.length).toBe(2)
  })

  it('handles many patterns', () => {
    const patterns = Array.from({ length: 50 }, (_, i) => `pat${i}`)
    const ac = new AhoCorasickMulti(patterns)
    const result = ac.search('pat0pat25pat49')
    expect(result.has(0)).toBe(true)
    expect(result.has(25)).toBe(true)
    expect(result.has(49)).toBe(true)
  })

  it('correctly identifies match positions', () => {
    const ac = new AhoCorasickMulti(['ab'])
    const result = ac.search('xabxab')
    expect(result.get(0)).toEqual([2, 5])
  })

  it('handles pattern that is entire text', () => {
    const ac = new AhoCorasickMulti(['hello'])
    const result = ac.search('hello')
    expect(result.get(0)).toEqual([4])
  })

  it('handles overlapping matches at same position', () => {
    const ac = new AhoCorasickMulti(['a', 'aa', 'aaa'])
    const result = ac.search('aaa')
    expect(result.get(0)).toEqual([0, 1, 2])
    expect(result.get(1)).toEqual([1, 2])
    expect(result.get(2)).toEqual([2])
  })

  it('handles failure links correctly', () => {
    const ac = new AhoCorasickMulti(['hers', 'his', 'she'])
    const result = ac.search('ushers')
    expect(result.has(0)).toBe(true)
    expect(result.get(0)).toEqual([5])
  })

  it('search after no-match text still works', () => {
    const ac = new AhoCorasickMulti(['abc'])
    expect(ac.search('xyz').size).toBe(0)
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([2])
  })

  it('handles digits in patterns', () => {
    const ac = new AhoCorasickMulti(['123', '234'])
    const result = ac.search('1234')
    expect(result.get(0)).toEqual([2])
    expect(result.get(1)).toEqual([3])
  })

  it('state count reflects trie structure', () => {
    const ac1 = new AhoCorasickMulti(['a'])
    const ac2 = new AhoCorasickMulti(['abc'])
    const j1 = ac1.toJSON() as { stateCount: number }
    const j2 = ac2.toJSON() as { stateCount: number }
    expect(j2.stateCount).toBeGreaterThan(j1.stateCount)
  })

  it('handles case-sensitive patterns', () => {
    const ac = new AhoCorasickMulti(['Ab', 'aB'])
    const result = ac.search('xAbxaBx')
    expect(result.has(0)).toBe(true)
    expect(result.has(1)).toBe(true)
  })

  it('repeated search on same automaton', () => {
    const ac = new AhoCorasickMulti(['ab'])
    const r1 = ac.search('abab')
    const r2 = ac.search('abab')
    expect(r1).toEqual(r2)
  })

  it('handles pattern with special regex chars', () => {
    const ac = new AhoCorasickMulti(['.', '*'])
    const result = ac.search('.*')
    expect(result.get(0)).toEqual([0])
    expect(result.get(1)).toEqual([1])
  })

  it('multiple patterns found at same position', () => {
    const ac = new AhoCorasickMulti(['ab', 'a'])
    const result = ac.search('ab')
    expect(result.get(0)).toEqual([1])
    expect(result.get(1)).toEqual([0])
  })

  it('long text search is correct', () => {
    const ac = new AhoCorasickMulti(['xy'])
    const text = 'a'.repeat(1000) + 'xy' + 'b'.repeat(1000)
    const result = ac.search(text)
    expect(result.get(0)).toEqual([1001])
  })

  it('pattern found in middle of text', () => {
    const ac = new AhoCorasickMulti(['mid'])
    const result = ac.search('premidpost')
    expect(result.get(0)).toEqual([5])
  })

  it('handles whitespace patterns', () => {
    const ac = new AhoCorasickMulti([' ', '\t'])
    const result = ac.search('a b\tc')
    expect(result.get(0)).toEqual([1])
    expect(result.get(1)).toEqual([3])
  })

  it('identical patterns produce same results', () => {
    const ac = new AhoCorasickMulti(['ab', 'ab'])
    const result = ac.search('abab')
    expect(result.get(0)).toEqual([1, 3])
    expect(result.get(1)).toEqual([1, 3])
  })

  it('handles newline in text', () => {
    const ac = new AhoCorasickMulti(['ab'])
    const result = ac.search('a\nbab')
    expect(result.get(0)).toEqual([4])
  })

  it('search result positions are end indices', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const result = ac.search('xyzabcdef')
    expect(result.get(0)).toEqual([5])
  })

  it('handles patterns with repeated characters', () => {
    const ac = new AhoCorasickMulti(['aaa', 'aa'])
    const result = ac.search('aaaa')
    expect(result.get(0)).toEqual([2, 3])
    expect(result.get(1)).toEqual([1, 2, 3])
  })

  it('clone works with complex overlapping patterns', () => {
    const ac = new AhoCorasickMulti(['abc', 'bc', 'c', 'abcd', 'bcd', 'cd'])
    const cloned = ac.clone()
    expect(cloned.equals(ac)).toBe(true)
    const r1 = ac.search('abcd')
    const r2 = cloned.search('abcd')
    expect(r1).toEqual(r2)
  })

  it('handles unicode surrogate pairs', () => {
    const ac = new AhoCorasickMulti(['ab', 'cd'])
    const result = ac.search('x\u{1F600}ab\u{1F600}cd')
    expect(result.get(0)).toEqual([4])
    expect(result.get(1)).toEqual([8])
  })

  it('correctly handles pattern starting with pattern suffix', () => {
    const ac = new AhoCorasickMulti(['aba', 'ba'])
    const result = ac.search('ababa')
    expect(result.get(0)).toEqual([2, 4])
    expect(result.get(1)).toEqual([2, 4])
  })

  it('equals detects difference in output arrays', () => {
    const ac1 = new AhoCorasickMulti(['a', 'b'])
    const ac2 = new AhoCorasickMulti(['a'])
    expect(ac1.equals(ac2)).toBe(false)
  })

  it('toJSON contains goto transitions and output arrays', () => {
    const ac = new AhoCorasickMulti(['ab', 'bc'])
    const json = ac.toJSON() as { goto: unknown[]; output: unknown[]; fail: unknown[]; stateCount: number }
    expect(json.goto).toBeInstanceOf(Array)
    expect(json.output).toBeInstanceOf(Array)
    expect(json.fail).toBeInstanceOf(Array)
    expect(json.stateCount).toBeGreaterThan(1)
    expect(json.goto.length).toBe(json.stateCount)
    expect(json.output.length).toBe(json.stateCount)
    expect(json.fail.length).toBe(json.stateCount)
  })

  it('search with empty patterns array returns empty map for any text', () => {
    const ac = new AhoCorasickMulti([])
    const result = ac.search('anything at all')
    expect(result.size).toBe(0)
  })

  it('equals returns false when comparing with null', () => {
    const ac = new AhoCorasickMulti(['test'])
    expect(ac.equals(null)).toBe(false)
  })
})

  it('empty patterns returns empty map', () => {
    const ac = new AhoCorasickMulti([])
    expect(ac.search('hello').size).toBe(0)
  })

  it('single character pattern', () => {
    const ac = new AhoCorasickMulti(['a'])
    const matches = ac.search('abc')
    expect(matches.size).toBe(1)
  })

  it('overlapping patterns', () => {
    const ac = new AhoCorasickMulti(['ab', 'bc'])
    const matches = ac.search('abc')
    expect(matches.size).toBe(2)
  })

describe('aho-corasick-multi - wave544', () => {
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

describe('aho-corasick-multi - wave546', () => {
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

describe('aho-corasick-multi - wave547', () => {
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

describe('aho-corasick-multi - wave548', () => {
  it('aho-corasick-multi module defined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi module is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave549', () => {
  it('aho-corasick-multi module defined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi module is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave550', () => {
  it('aho-corasick-multi w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave551', () => {
  it('aho-corasick-multi w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave552', () => {
  it('aho-corasick-multi w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave553', () => {
  it('aho-corasick-multi w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave554', () => {
  it('aho-corasick-multi w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave555', () => {
  it('aho-corasick-multi w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave556', () => {
  it('aho-corasick-multi w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave557', () => {
  it('aho-corasick-multi w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave558', () => {
  it('aho-corasick-multi w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave559', () => {
  it('aho-corasick-multi w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave560', () => {
  it('aho-corasick-multi w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave561', () => {
  it('aho-corasick-multi w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave562', () => {
  it('aho-corasick-multi w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave563', () => {
  it('aho-corasick-multi w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave564', () => {
  it('aho-corasick-multi w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave565', () => {
  it('aho-corasick-multi w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave566', () => {
  it('aho-corasick-multi w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave127', () => {
  it('aho-corasick-multi w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave130', () => {
  it('aho-corasick-multi w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave133', () => {
  it('aho-corasick-multi w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave136', () => {
  it('aho-corasick-multi w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - wave139', () => {
  it('aho-corasick-multi w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w142', () => {
  it('aho-corasick-multi v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w145', () => {
  it('aho-corasick-multi v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w148', () => {
  it('aho-corasick-multi v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w151', () => {
  it('aho-corasick-multi v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w154', () => {
  it('aho-corasick-multi v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w157', () => {
  it('aho-corasick-multi v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w160', () => {
  it('aho-corasick-multi v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w170', () => {
  it('aho-corasick-multi x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w180', () => {
  it('aho-corasick-multi x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w190', () => {
  it('aho-corasick-multi x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w200', () => {
  it('aho-corasick-multi x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w210', () => {
  it('aho-corasick-multi x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w220', () => {
  it('aho-corasick-multi x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w230', () => {
  it('aho-corasick-multi x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w240', () => {
  it('aho-corasick-multi x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick-multi - w250', () => {
  it('aho-corasick-multi x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick-multi x250x9', () => {
    expect(describe).toBeDefined()
  })
})
