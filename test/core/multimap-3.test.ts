import { describe, it, expect } from 'vitest'
import { MultiMap3 } from '../../src/core/multimap-3/index.js'

// ─── Constructor ───

describe('MultiMap3: constructor', () => {
  it('creates an empty multimap', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.size).toBe(0)
  })
})

// ─── set ───

describe('MultiMap3: set', () => {
  it('adds a single key-value pair', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    expect(mm.size).toBe(1)
    expect(mm.get('a')).toEqual([1])
  })

  it('adds multiple values to the same key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.set('a', 3)
    expect(mm.size).toBe(3)
    expect(mm.get('a')).toEqual([1, 2, 3])
  })

  it('adds values to different keys', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('b', 2)
    mm.set('c', 3)
    expect(mm.size).toBe(3)
    expect(mm.get('a')).toEqual([1])
    expect(mm.get('b')).toEqual([2])
    expect(mm.get('c')).toEqual([3])
  })

  it('allows duplicate values for the same key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('x', 5)
    mm.set('x', 5)
    expect(mm.size).toBe(2)
    expect(mm.get('x')).toEqual([5, 5])
  })

  it('handles number keys', () => {
    const mm = new MultiMap3<number, string>()
    mm.set(1, 'one')
    mm.set(2, 'two')
    mm.set(1, 'uno')
    expect(mm.size).toBe(3)
    expect(mm.get(1)).toEqual(['one', 'uno'])
  })
})

// ─── get ───

describe('MultiMap3: get', () => {
  it('returns empty array for missing key', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.get('missing')).toEqual([])
  })

  it('returns all values for a key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('k', 10)
    mm.set('k', 20)
    mm.set('k', 30)
    expect(mm.get('k')).toEqual([10, 20, 30])
  })
})

// ─── delete ───

describe('MultiMap3: delete', () => {
  it('deletes all values for a key when no value specified', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.set('a', 3)
    expect(mm.delete('a')).toBe(true)
    expect(mm.get('a')).toEqual([])
    expect(mm.size).toBe(0)
  })

  it('deletes a specific value from a key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.set('a', 3)
    expect(mm.delete('a', 2)).toBe(true)
    expect(mm.get('a')).toEqual([1, 3])
    expect(mm.size).toBe(2)
  })

  it('removes the key when last value is deleted', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    expect(mm.delete('a', 1)).toBe(true)
    expect(mm.has('a')).toBe(false)
    expect(mm.size).toBe(0)
  })

  it('returns false when key does not exist', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.delete('missing')).toBe(false)
  })

  it('returns false when value does not exist for key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    expect(mm.delete('a', 99)).toBe(false)
    expect(mm.size).toBe(1)
  })
})

// ─── has ───

describe('MultiMap3: has', () => {
  it('returns true for existing key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    expect(mm.has('a')).toBe(true)
  })

  it('returns false for missing key', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.has('a')).toBe(false)
  })

  it('returns false after all values are deleted', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.delete('a')
    expect(mm.has('a')).toBe(false)
  })
})

// ─── hasEntry ───

describe('MultiMap3: hasEntry', () => {
  it('returns true when key-value pair exists', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    expect(mm.hasEntry('a', 1)).toBe(true)
    expect(mm.hasEntry('a', 2)).toBe(true)
  })

  it('returns false when value does not exist for key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    expect(mm.hasEntry('a', 99)).toBe(false)
  })

  it('returns false when key does not exist', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.hasEntry('z', 1)).toBe(false)
  })
})

// ─── keys ───

describe('MultiMap3: keys', () => {
  it('returns empty array for empty multimap', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.keys()).toEqual([])
  })

  it('returns all keys', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('b', 2)
    mm.set('c', 3)
    const keys = mm.keys()
    expect(keys.sort()).toEqual(['a', 'b', 'c'])
  })

  it('does not duplicate keys', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.set('a', 3)
    expect(mm.keys()).toEqual(['a'])
  })
})

// ─── values ───

describe('MultiMap3: values', () => {
  it('returns empty array for empty multimap', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.values()).toEqual([])
  })

  it('returns all values across all keys', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('b', 2)
    mm.set('a', 3)
    const vals = mm.values()
    expect(vals.sort()).toEqual([1, 2, 3])
  })
})

// ─── entries ───

describe('MultiMap3: entries', () => {
  it('returns empty array for empty multimap', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.entries()).toEqual([])
  })

  it('returns key-value arrays', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    const entries = mm.entries()
    expect(entries).toHaveLength(1)
    expect(entries[0]![0]).toBe('a')
    expect(entries[0]![1]).toEqual([1, 2])
  })
})

// ─── count ───

describe('MultiMap3: count', () => {
  it('returns 0 for missing key', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.count('missing')).toBe(0)
  })

  it('returns the number of values for a key', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.set('a', 3)
    expect(mm.count('a')).toBe(3)
  })

  it('returns 1 for single value', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    expect(mm.count('a')).toBe(1)
  })
})

// ─── size ───

describe('MultiMap3: size', () => {
  it('tracks total number of key-value pairs', () => {
    const mm = new MultiMap3<string, number>()
    expect(mm.size).toBe(0)
    mm.set('a', 1)
    expect(mm.size).toBe(1)
    mm.set('a', 2)
    expect(mm.size).toBe(2)
    mm.set('b', 3)
    expect(mm.size).toBe(3)
  })

  it('decreases on delete', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.delete('a', 1)
    expect(mm.size).toBe(1)
  })
})

// ─── clear ───

describe('MultiMap3: clear', () => {
  it('removes all entries', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.set('b', 2)
    mm.clear()
    expect(mm.size).toBe(0)
    expect(mm.keys()).toEqual([])
    expect(mm.values()).toEqual([])
  })

  it('allows reuse after clear', () => {
    const mm = new MultiMap3<string, number>()
    mm.set('a', 1)
    mm.clear()
    mm.set('b', 42)
    expect(mm.size).toBe(1)
    expect(mm.get('b')).toEqual([42])
  })
})
