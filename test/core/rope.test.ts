import { describe, it, expect } from 'vitest'
import { Rope } from '../../src/core/rope/index.js'

// ─── Constructor ───

describe('Rope constructor', () => {
  it('creates an empty rope with no arguments', () => {
    const r = new Rope()
    expect(r.length).toBe(0)
    expect(r.toString()).toBe('')
  })

  it('creates a rope from a string', () => {
    const r = new Rope('hello')
    expect(r.length).toBe(5)
    expect(r.toString()).toBe('hello')
  })

  it('creates an empty rope from empty string', () => {
    const r = new Rope('')
    expect(r.length).toBe(0)
    expect(r.toString()).toBe('')
  })

  it('creates a rope from a single character', () => {
    const r = new Rope('a')
    expect(r.length).toBe(1)
    expect(r.toString()).toBe('a')
  })
})

// ─── length getter ───

describe('Rope length', () => {
  it('returns 0 for empty rope', () => {
    expect(new Rope().length).toBe(0)
  })

  it('returns correct length after construction', () => {
    expect(new Rope('abc').length).toBe(3)
  })

  it('updates after insert', () => {
    const r = new Rope('ab')
    r.insert(1, 'xy')
    expect(r.length).toBe(4)
  })

  it('updates after delete', () => {
    const r = new Rope('abcde')
    r.delete(1, 3)
    expect(r.length).toBe(3)
  })
})

// ─── toString ───

describe('Rope toString', () => {
  it('returns empty string for empty rope', () => {
    expect(new Rope().toString()).toBe('')
  })

  it('returns the original string', () => {
    expect(new Rope('hello world').toString()).toBe('hello world')
  })

  it('reflects inserts', () => {
    const r = new Rope('hllo')
    r.insert(1, 'e')
    expect(r.toString()).toBe('hello')
  })

  it('reflects deletes', () => {
    const r = new Rope('hello')
    r.delete(1, 4)
    expect(r.toString()).toBe('ho')
  })
})

// ─── insert ───

describe('Rope insert', () => {
  it('inserts at the beginning', () => {
    const r = new Rope('world')
    r.insert(0, 'hello ')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts at the end', () => {
    const r = new Rope('hello')
    r.insert(5, ' world')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts in the middle', () => {
    const r = new Rope('hlo')
    r.insert(1, 'el')
    expect(r.toString()).toBe('hello')
  })

  it('inserts into empty rope', () => {
    const r = new Rope()
    r.insert(0, 'hello')
    expect(r.toString()).toBe('hello')
    expect(r.length).toBe(5)
  })

  it('handles negative index as 0', () => {
    const r = new Rope('world')
    r.insert(-5, 'hello ')
    expect(r.toString()).toBe('hello world')
  })

  it('handles index beyond length as append', () => {
    const r = new Rope('hello')
    r.insert(100, ' world')
    expect(r.toString()).toBe('hello world')
  })

  it('does nothing with empty string', () => {
    const r = new Rope('hello')
    r.insert(2, '')
    expect(r.toString()).toBe('hello')
    expect(r.length).toBe(5)
  })

  it('inserts single character', () => {
    const r = new Rope('abc')
    r.insert(1, 'X')
    expect(r.toString()).toBe('aXbc')
  })

  it('handles multiple sequential inserts', () => {
    const r = new Rope()
    r.insert(0, 'a')
    r.insert(1, 'b')
    r.insert(2, 'c')
    expect(r.toString()).toBe('abc')
  })
})

// ─── delete ───

describe('Rope delete', () => {
  it('deletes from the beginning', () => {
    const r = new Rope('hello')
    expect(r.delete(0, 2)).toBe('he')
    expect(r.toString()).toBe('llo')
  })

  it('deletes from the end', () => {
    const r = new Rope('hello')
    expect(r.delete(3, 5)).toBe('lo')
    expect(r.toString()).toBe('hel')
  })

  it('deletes from the middle', () => {
    const r = new Rope('hello')
    expect(r.delete(1, 4)).toBe('ell')
    expect(r.toString()).toBe('ho')
  })

  it('deletes entire content', () => {
    const r = new Rope('hello')
    r.delete(0, 5)
    expect(r.toString()).toBe('')
    expect(r.length).toBe(0)
  })

  it('returns empty string when start >= end', () => {
    const r = new Rope('hello')
    expect(r.delete(3, 3)).toBe('')
    expect(r.delete(4, 3)).toBe('')
    expect(r.toString()).toBe('hello')
  })

  it('clamps negative start to 0', () => {
    const r = new Rope('hello')
    expect(r.delete(-2, 2)).toBe('he')
    expect(r.toString()).toBe('llo')
  })

  it('clamps end beyond length', () => {
    const r = new Rope('hello')
    expect(r.delete(3, 100)).toBe('lo')
    expect(r.toString()).toBe('hel')
  })

  it('deletes single character', () => {
    const r = new Rope('abc')
    expect(r.delete(1, 2)).toBe('b')
    expect(r.toString()).toBe('ac')
  })
})

// ─── charAt ───

describe('Rope charAt', () => {
  it('returns characters by index', () => {
    const r = new Rope('hello')
    expect(r.charAt(0)).toBe('h')
    expect(r.charAt(1)).toBe('e')
    expect(r.charAt(4)).toBe('o')
  })

  it('returns empty string for negative index', () => {
    const r = new Rope('hello')
    expect(r.charAt(-1)).toBe('')
  })

  it('returns empty string for out-of-bounds index', () => {
    const r = new Rope('hello')
    expect(r.charAt(5)).toBe('')
    expect(r.charAt(100)).toBe('')
  })

  it('returns empty string for empty rope', () => {
    const r = new Rope()
    expect(r.charAt(0)).toBe('')
  })

  it('works after insert', () => {
    const r = new Rope('hlo')
    r.insert(1, 'el')
    expect(r.charAt(1)).toBe('e')
    expect(r.charAt(2)).toBe('l')
  })
})

// ─── substring ───

describe('Rope substring', () => {
  it('extracts a substring from the middle', () => {
    const r = new Rope('hello world')
    expect(r.substring(0, 5)).toBe('hello')
    expect(r.substring(6, 11)).toBe('world')
  })

  it('returns full string with 0 to length', () => {
    const r = new Rope('hello')
    expect(r.substring(0, 5)).toBe('hello')
  })

  it('returns empty when start >= end', () => {
    const r = new Rope('hello')
    expect(r.substring(3, 3)).toBe('')
    expect(r.substring(4, 3)).toBe('')
  })

  it('clamps negative start to 0', () => {
    const r = new Rope('hello')
    expect(r.substring(-5, 3)).toBe('hel')
  })

  it('clamps end beyond length', () => {
    const r = new Rope('hello')
    expect(r.substring(2, 100)).toBe('llo')
  })

  it('returns empty for empty rope', () => {
    const r = new Rope()
    expect(r.substring(0, 5)).toBe('')
  })

  it('returns single character substring', () => {
    const r = new Rope('abc')
    expect(r.substring(1, 2)).toBe('b')
  })
})

// ─── indexOf ───

describe('Rope indexOf', () => {
  it('finds substring at beginning', () => {
    const r = new Rope('hello world')
    expect(r.indexOf('hello')).toBe(0)
  })

  it('finds substring in middle', () => {
    const r = new Rope('hello world')
    expect(r.indexOf('lo w')).toBe(3)
  })

  it('finds substring at end', () => {
    const r = new Rope('hello world')
    expect(r.indexOf('world')).toBe(6)
  })

  it('returns -1 when not found', () => {
    const r = new Rope('hello')
    expect(r.indexOf('xyz')).toBe(-1)
  })

  it('respects fromIndex', () => {
    const r = new Rope('abcabc')
    expect(r.indexOf('abc', 1)).toBe(3)
  })

  it('finds single character', () => {
    const r = new Rope('hello')
    expect(r.indexOf('e')).toBe(1)
  })

  it('handles empty search string', () => {
    const r = new Rope('hello')
    expect(r.indexOf('')).toBe(0)
  })

  it('handles negative fromIndex', () => {
    const r = new Rope('hello')
    expect(r.indexOf('h', -10)).toBe(0)
  })

  it('returns -1 for empty rope searching non-empty', () => {
    const r = new Rope()
    expect(r.indexOf('a')).toBe(-1)
  })
})

// ─── concat ───

describe('Rope concat', () => {
  it('concatenates two non-empty ropes', () => {
    const a = new Rope('hello')
    const b = new Rope(' world')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello world')
    expect(c.length).toBe(11)
  })

  it('does not mutate original ropes', () => {
    const a = new Rope('hello')
    const b = new Rope(' world')
    a.concat(b)
    expect(a.toString()).toBe('hello')
    expect(b.toString()).toBe(' world')
  })

  it('concatenates empty with non-empty', () => {
    const a = new Rope()
    const b = new Rope('hello')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello')
  })

  it('concatenates non-empty with empty', () => {
    const a = new Rope('hello')
    const b = new Rope()
    const c = a.concat(b)
    expect(c.toString()).toBe('hello')
  })

  it('concatenates two empty ropes', () => {
    const a = new Rope()
    const b = new Rope()
    const c = a.concat(b)
    expect(c.toString()).toBe('')
    expect(c.length).toBe(0)
  })
})

// ─── split ───

describe('Rope split', () => {
  it('splits in the middle', () => {
    const r = new Rope('hello world')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
  })

  it('splits at the beginning', () => {
    const r = new Rope('hello')
    const [left, right] = r.split(0)
    expect(left.toString()).toBe('')
    expect(right.toString()).toBe('hello')
  })

  it('splits at the end', () => {
    const r = new Rope('hello')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe('')
  })

  it('handles negative index as 0', () => {
    const r = new Rope('hello')
    const [left, right] = r.split(-3)
    expect(left.toString()).toBe('')
    expect(right.toString()).toBe('hello')
  })

  it('handles index beyond length as end', () => {
    const r = new Rope('hello')
    const [left, right] = r.split(100)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe('')
  })

  it('reports correct lengths after split', () => {
    const r = new Rope('hello world')
    const [left, right] = r.split(5)
    expect(left.length).toBe(5)
    expect(right.length).toBe(6)
  })
})

// ─── getDepth ───

describe('Rope getDepth', () => {
  it('returns 0 for empty rope', () => {
    expect(new Rope().getDepth()).toBe(0)
  })

  it('returns 1 for single-node rope', () => {
    expect(new Rope('hello').getDepth()).toBe(1)
  })

  it('depth increases with inserts', () => {
    const r = new Rope('a')
    r.insert(0, 'b')
    expect(r.getDepth()).toBeGreaterThanOrEqual(1)
  })
})

// ─── rebalance ───

describe('Rope rebalance', () => {
  it('does nothing on empty rope', () => {
    const r = new Rope()
    r.rebalance()
    expect(r.toString()).toBe('')
  })

  it('preserves content after rebalance', () => {
    const r = new Rope('hello')
    r.insert(0, 'world ')
    r.insert(11, '!')
    r.rebalance()
    expect(r.toString()).toBe('world hello!')
  })

  it('reduces depth of unbalanced rope', () => {
    const r = new Rope()
    for (let i = 0; i < 10; i++) {
      r.insert(0, 'x')
    }
    const depthBefore = r.getDepth()
    r.rebalance()
    const depthAfter = r.getDepth()
    expect(depthAfter).toBeLessThanOrEqual(depthBefore)
    expect(r.toString()).toBe('xxxxxxxxxx')
  })
})

// ─── getTimeComplexity ───

describe('Rope getTimeComplexity', () => {
  it('returns complexity string', () => {
    const r = new Rope()
    expect(typeof r.getTimeComplexity()).toBe('string')
    expect(r.getTimeComplexity()).toContain('O(')
  })
})

// ─── Edge cases ───

describe('Rope edge cases', () => {
  it('handles long strings', () => {
    const long = 'a'.repeat(1000)
    const r = new Rope(long)
    expect(r.length).toBe(1000)
    expect(r.toString()).toBe(long)
  })

  it('handles special characters', () => {
    const r = new Rope('héllo wörld 🌍')
    expect(r.toString()).toBe('héllo wörld 🌍')
  })

  it('handles duplicate content', () => {
    const r = new Rope('aaa')
    r.insert(1, 'aa')
    expect(r.toString()).toBe('aaaaa')
  })

  it('insert-delete-insert cycle', () => {
    const r = new Rope('abc')
    r.insert(3, 'def')
    r.delete(1, 4)
    r.insert(1, 'XYZ')
    expect(r.toString()).toBe('aXYZef')
  })
})
