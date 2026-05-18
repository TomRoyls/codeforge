import { describe, expect, it } from 'vitest'

import { SuffixTree } from '../src/core/suffix-tree-2/index.js'

// ─── Construction ──────────────────────────────────────
describe('SuffixTree construction', () => {
  it('creates tree from string', () => {
    const tree = new SuffixTree('banana')
    expect(tree.size).toBe(7) // banana$ = 7 chars
    expect(tree.nodeCount).toBeGreaterThan(0)
  })

  it('creates tree from empty string', () => {
    const tree = new SuffixTree('')
    expect(tree.size).toBe(1) // just $
  })

  it('throws when text contains terminator', () => {
    expect(() => new SuffixTree('abc$')).toThrow()
  })

  it('supports custom terminator', () => {
    const tree = new SuffixTree('abc', { terminator: '#' })
    expect(tree.size).toBe(4)
  })
})

// ─── Search ────────────────────────────────────────────
describe('SuffixTree search', () => {
  it('finds pattern occurrences', () => {
    const tree = new SuffixTree('banana')
    const result = tree.search('ana')
    expect(result).toContain(1)
    expect(result).toContain(3)
  })

  it('returns empty for non-existent pattern', () => {
    const tree = new SuffixTree('banana')
    expect(tree.search('xyz')).toEqual([])
  })

  it('returns empty for empty pattern', () => {
    const tree = new SuffixTree('banana')
    expect(tree.search('')).toEqual([])
  })
})

// ─── Has & IsSubstring ────────────────────────────────
describe('SuffixTree has and isSubstring', () => {
  it('has returns true for existing pattern', () => {
    const tree = new SuffixTree('banana')
    expect(tree.has('ana')).toBe(true)
    expect(tree.has('xyz')).toBe(false)
  })

  it('has returns true for empty pattern', () => {
    const tree = new SuffixTree('banana')
    expect(tree.has('')).toBe(true)
  })

  it('isSubstring is alias for has', () => {
    const tree = new SuffixTree('banana')
    expect(tree.isSubstring('ban')).toBe(true)
    expect(tree.isSubstring('xyz')).toBe(false)
  })
})

// ─── Count & FindAll ───────────────────────────────────
describe('SuffixTree count and findAll', () => {
  it('counts pattern occurrences', () => {
    const tree = new SuffixTree('banana')
    expect(tree.count('ana')).toBe(2)
    expect(tree.count('a')).toBe(3)
    expect(tree.count('xyz')).toBe(0)
  })

  it('count returns 0 for empty pattern', () => {
    const tree = new SuffixTree('banana')
    expect(tree.count('')).toBe(0)
  })

  it('findAll is alias for search', () => {
    const tree = new SuffixTree('banana')
    expect(tree.findAll('ana')).toEqual(tree.search('ana'))
  })
})

// ─── LongestRepeatedSubstring ──────────────────────────
describe('SuffixTree longestRepeatedSubstring', () => {
  it('finds longest repeated substring', () => {
    const tree = new SuffixTree('banana')
    const lrs = tree.longestRepeatedSubstring()
    expect(lrs.length).toBeGreaterThan(0)
  })

  it('returns empty for no repeats', () => {
    const tree = new SuffixTree('abcdef')
    expect(tree.longestRepeatedSubstring()).toBe('')
  })
})

// ─── LongestCommonSubstring ────────────────────────────
describe('SuffixTree longestCommonSubstring', () => {
  it('finds common substring', () => {
    const tree = new SuffixTree('abcdef')
    const lcs = tree.longestCommonSubstring('xyzabc')
    expect(lcs).toBe('abc')
  })

  it('returns empty for no common substring', () => {
    const tree = new SuffixTree('abcdef')
    expect(tree.longestCommonSubstring('xyz')).toBe('')
  })

  it('returns empty for empty other string', () => {
    const tree = new SuffixTree('abc')
    expect(tree.longestCommonSubstring('')).toBe('')
  })
})

// ─── Leaves ────────────────────────────────────────────
describe('SuffixTree leaves', () => {
  it('returns all leaf suffix indices', () => {
    const tree = new SuffixTree('abc')
    const leaves = tree.leaves
    expect(leaves.length).toBe(4) // abc$, bc$, c$, $
    leaves.sort((a, b) => a - b)
    expect(leaves).toEqual([0, 1, 2, 3])
  })
})

// ─── Serialization ─────────────────────────────────────
describe('SuffixTree serialization', () => {
  it('toObject serializes tree', () => {
    const tree = new SuffixTree('abc')
    const obj = tree.toObject()
    expect(obj.text).toBe('abc$')
    expect(obj.root).toBeDefined()
  })

  it('fromObject deserializes tree', () => {
    const tree = new SuffixTree('abc')
    const obj = tree.toObject()
    const restored = SuffixTree.fromObject(obj)
    expect(restored.has('abc')).toBe(true)
    expect(restored.has('bc')).toBe(true)
  })
})
