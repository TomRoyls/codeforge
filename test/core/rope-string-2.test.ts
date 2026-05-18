import { describe, it, expect } from 'vitest'
import { RopeString2 } from '../../src/core/rope-string-2/index.js'

// ─── Constructor ───

describe('RopeString2 constructor', () => {
  it('creates an empty rope with no arguments', () => {
    const r = new RopeString2()
    expect(r.length).toBe(0)
    expect(r.toString()).toBe('')
  })

  it('creates a rope from a string', () => {
    const r = new RopeString2('hello')
    expect(r.length).toBe(5)
    expect(r.toString()).toBe('hello')
  })

  it('creates an empty rope from empty string', () => {
    const r = new RopeString2('')
    expect(r.length).toBe(0)
    expect(r.toString()).toBe('')
  })

  it('creates a rope from a single character', () => {
    const r = new RopeString2('a')
    expect(r.length).toBe(1)
    expect(r.toString()).toBe('a')
  })
})

// ─── length getter ───

describe('RopeString2 length', () => {
  it('returns 0 for empty rope', () => {
    expect(new RopeString2().length).toBe(0)
  })

  it('returns correct length after construction', () => {
    expect(new RopeString2('abcdef').length).toBe(6)
  })

  it('updates after insert', () => {
    const r = new RopeString2('ab')
    r.insert(1, 'cd')
    expect(r.length).toBe(4)
  })

  it('updates after delete', () => {
    const r = new RopeString2('abcde')
    r.delete(1, 3)
    expect(r.length).toBe(3)
  })
})

// ─── toString ───

describe('RopeString2 toString', () => {
  it('returns empty string for empty rope', () => {
    expect(new RopeString2().toString()).toBe('')
  })

  it('returns the original string', () => {
    expect(new RopeString2('hello world').toString()).toBe('hello world')
  })

  it('reflects inserts', () => {
    const r = new RopeString2('hllo')
    r.insert(1, 'e')
    expect(r.toString()).toBe('hello')
  })

  it('reflects deletes', () => {
    const r = new RopeString2('hello')
    r.delete(1, 4)
    expect(r.toString()).toBe('ho')
  })
})

// ─── insert ───

describe('RopeString2 insert', () => {
  it('inserts at the beginning', () => {
    const r = new RopeString2('world')
    r.insert(0, 'hello ')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts at the end', () => {
    const r = new RopeString2('hello')
    r.insert(5, ' world')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts in the middle', () => {
    const r = new RopeString2('hlo')
    r.insert(1, 'el')
    expect(r.toString()).toBe('hello')
  })

  it('inserts into empty rope', () => {
    const r = new RopeString2()
    r.insert(0, 'hello')
    expect(r.toString()).toBe('hello')
    expect(r.length).toBe(5)
  })

  it('does nothing with empty string', () => {
    const r = new RopeString2('hello')
    r.insert(2, '')
    expect(r.toString()).toBe('hello')
    expect(r.length).toBe(5)
  })

  it('inserts single character', () => {
    const r = new RopeString2('abc')
    r.insert(1, 'X')
    expect(r.toString()).toBe('aXbc')
  })

  it('handles multiple sequential inserts', () => {
    const r = new RopeString2()
    r.insert(0, 'a')
    r.insert(1, 'b')
    r.insert(2, 'c')
    expect(r.toString()).toBe('abc')
  })
})

// ─── delete ───

describe('RopeString2 delete', () => {
  it('deletes from the beginning', () => {
    const r = new RopeString2('hello')
    r.delete(0, 2)
    expect(r.toString()).toBe('llo')
  })

  it('deletes from the end', () => {
    const r = new RopeString2('hello')
    r.delete(3, 5)
    expect(r.toString()).toBe('hel')
  })

  it('deletes from the middle', () => {
    const r = new RopeString2('hello')
    r.delete(1, 4)
    expect(r.toString()).toBe('ho')
  })

  it('deletes entire content', () => {
    const r = new RopeString2('hello')
    r.delete(0, 5)
    expect(r.toString()).toBe('')
    expect(r.length).toBe(0)
  })

  it('does nothing when from >= to', () => {
    const r = new RopeString2('hello')
    r.delete(3, 3)
    expect(r.toString()).toBe('hello')
  })

  it('does nothing when from is negative', () => {
    const r = new RopeString2('hello')
    r.delete(-1, 2)
    expect(r.toString()).toBe('hello')
  })

  it('does nothing when to exceeds length', () => {
    const r = new RopeString2('hello')
    r.delete(0, 100)
    expect(r.toString()).toBe('hello')
  })

  it('deletes single character', () => {
    const r = new RopeString2('abc')
    r.delete(1, 2)
    expect(r.toString()).toBe('ac')
  })
})

// ─── charAt ───

describe('RopeString2 charAt', () => {
  it('returns characters by index', () => {
    const r = new RopeString2('hello')
    expect(r.charAt(0)).toBe('h')
    expect(r.charAt(1)).toBe('e')
    expect(r.charAt(4)).toBe('o')
  })

  it('throws for negative index', () => {
    const r = new RopeString2('hello')
    expect(() => r.charAt(-1)).toThrow('Index out of bounds')
  })

  it('throws for out-of-bounds index', () => {
    const r = new RopeString2('hello')
    expect(() => r.charAt(5)).toThrow('Index out of bounds')
    expect(() => r.charAt(100)).toThrow('Index out of bounds')
  })

  it('throws for empty rope', () => {
    const r = new RopeString2()
    expect(() => r.charAt(0)).toThrow('Index out of bounds')
  })

  it('works after insert', () => {
    const r = new RopeString2('hlo')
    r.insert(1, 'el')
    expect(r.charAt(1)).toBe('e')
    expect(r.charAt(2)).toBe('l')
  })
})

// ─── substring ───

describe('RopeString2 substring', () => {
  it('extracts a substring from the middle', () => {
    const r = new RopeString2('hello world')
    expect(r.substring(0, 5)).toBe('hello')
    expect(r.substring(6, 11)).toBe('world')
  })

  it('returns full string with 0 to length', () => {
    const r = new RopeString2('hello')
    expect(r.substring(0, 5)).toBe('hello')
  })

  it('returns empty when from >= to', () => {
    const r = new RopeString2('hello')
    expect(r.substring(3, 3)).toBe('')
    expect(r.substring(4, 3)).toBe('')
  })

  it('clamps negative from to 0', () => {
    const r = new RopeString2('hello')
    expect(r.substring(-5, 3)).toBe('hel')
  })

  it('clamps to beyond length', () => {
    const r = new RopeString2('hello')
    expect(r.substring(2, 100)).toBe('llo')
  })

  it('returns empty for empty rope', () => {
    const r = new RopeString2()
    expect(r.substring(0, 5)).toBe('')
  })

  it('returns single character substring', () => {
    const r = new RopeString2('abc')
    expect(r.substring(1, 2)).toBe('b')
  })
})

// ─── concat ───

describe('RopeString2 concat', () => {
  it('concatenates two non-empty ropes', () => {
    const a = new RopeString2('hello')
    const b = new RopeString2(' world')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello world')
    expect(c.length).toBe(11)
  })

  it('does not mutate original ropes', () => {
    const a = new RopeString2('hello')
    const b = new RopeString2(' world')
    a.concat(b)
    expect(a.toString()).toBe('hello')
    expect(b.toString()).toBe(' world')
  })

  it('concatenates empty with non-empty', () => {
    const a = new RopeString2()
    const b = new RopeString2('hello')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello')
  })

  it('concatenates non-empty with empty', () => {
    const a = new RopeString2('hello')
    const b = new RopeString2()
    const c = a.concat(b)
    expect(c.toString()).toBe('hello')
  })

  it('concatenates two empty ropes', () => {
    const a = new RopeString2()
    const b = new RopeString2()
    const c = a.concat(b)
    expect(c.toString()).toBe('')
    expect(c.length).toBe(0)
  })
})

// ─── split ───

describe('RopeString2 split', () => {
  it('splits in the middle', () => {
    const r = new RopeString2('hello world')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
  })

  it('splits at the beginning', () => {
    const r = new RopeString2('hello')
    const [left, right] = r.split(0)
    expect(left.toString()).toBe('')
    expect(right.toString()).toBe('hello')
  })

  it('splits at the end', () => {
    const r = new RopeString2('hello')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe('')
  })

  it('splits empty rope', () => {
    const r = new RopeString2()
    const [left, right] = r.split(0)
    expect(left.toString()).toBe('')
    expect(right.toString()).toBe('')
  })

  it('reports correct lengths after split', () => {
    const r = new RopeString2('hello world')
    const [left, right] = r.split(5)
    expect(left.length).toBe(5)
    expect(right.length).toBe(6)
  })
})

// ─── indexOf ───

describe('RopeString2 indexOf', () => {
  it('finds substring at beginning', () => {
    const r = new RopeString2('hello world')
    expect(r.indexOf('hello')).toBe(0)
  })

  it('finds substring in middle', () => {
    const r = new RopeString2('hello world')
    expect(r.indexOf('lo w')).toBe(3)
  })

  it('finds substring at end', () => {
    const r = new RopeString2('hello world')
    expect(r.indexOf('world')).toBe(6)
  })

  it('returns -1 when not found', () => {
    const r = new RopeString2('hello')
    expect(r.indexOf('xyz')).toBe(-1)
  })

  it('returns -1 for empty rope searching non-empty', () => {
    const r = new RopeString2()
    expect(r.indexOf('a')).toBe(-1)
  })

  it('returns -1 for empty search string', () => {
    const r = new RopeString2('hello')
    expect(r.indexOf('')).toBe(-1)
  })

  it('finds single character', () => {
    const r = new RopeString2('hello')
    expect(r.indexOf('e')).toBe(1)
  })
})

// ─── Edge cases ───

describe('RopeString2 edge cases', () => {
  it('handles strings longer than LEAF_SIZE (64)', () => {
    const long = 'a'.repeat(200)
    const r = new RopeString2(long)
    expect(r.length).toBe(200)
    expect(r.toString()).toBe(long)
  })

  it('handles special characters', () => {
    const r = new RopeString2('héllo wörld 🌍')
    expect(r.toString()).toBe('héllo wörld 🌍')
  })

  it('handles duplicate content', () => {
    const r = new RopeString2('aaa')
    r.insert(1, 'aa')
    expect(r.toString()).toBe('aaaaa')
  })

  it('insert-delete-insert cycle', () => {
    const r = new RopeString2('abcdef')
    r.delete(1, 4)
    expect(r.toString()).toBe('aef')
    r.insert(1, 'XYZ')
    expect(r.toString()).toBe('aXYZef')
  })

  it('handles long string charAt across leaf boundary', () => {
    const str = 'abcdefghij' + 'klmnopqrst' + 'uvwxyz'
    const r = new RopeString2(str)
    for (let i = 0; i < str.length; i++) {
      expect(r.charAt(i)).toBe(str[i])
    }
  })

  it('handles long string substring across leaves', () => {
    const str = 'a'.repeat(100) + 'b'.repeat(100)
    const r = new RopeString2(str)
    expect(r.substring(95, 105)).toBe('aaaaabbbbb')
  })

  it('split and concat roundtrip', () => {
    const r = new RopeString2('hello world')
    const [left, right] = r.split(5)
    const joined = left.concat(right)
    expect(joined.toString()).toBe('hello world')
  })
})
