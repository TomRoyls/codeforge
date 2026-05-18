import { describe, it, expect } from 'vitest'
import { TreapMap3 } from '../../src/core/treap-map-3/index.js'

// ─── Constructor ───

describe('TreapMap3 constructor', () => {
  it('creates an empty map with default comparator', () => {
    const map = new TreapMap3<number, string>()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('accepts a custom comparator', () => {
    const reverseCmp = (a: number, b: number) => b - a
    const map = new TreapMap3<number, string>(reverseCmp)
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    expect(map.toArray()).toEqual([[3, 'c'], [2, 'b'], [1, 'a']])
  })
})

// ─── set / get ───

describe('TreapMap3 set and get', () => {
  it('stores and retrieves a single entry', () => {
    const map = new TreapMap3<string, number>()
    map.set('x', 42)
    expect(map.get('x')).toBe(42)
  })

  it('returns undefined for missing key', () => {
    const map = new TreapMap3<number, string>()
    expect(map.get(999)).toBeUndefined()
  })

  it('overwrites value for existing key', () => {
    const map = new TreapMap3<number, string>()
    map.set(1, 'old')
    map.set(1, 'new')
    expect(map.get(1)).toBe('new')
    expect(map.size).toBe(1)
  })

  it('handles many insertions', () => {
    const map = new TreapMap3<number, number>()
    for (let i = 0; i < 100; i++) {
      map.set(i, i * 10)
    }
    expect(map.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(map.get(i)).toBe(i * 10)
    }
  })
})

// ─── has ───

describe('TreapMap3 has', () => {
  it('returns true for existing key', () => {
    const map = new TreapMap3<number, string>()
    map.set(5, 'five')
    expect(map.has(5)).toBe(true)
  })

  it('returns false for missing key', () => {
    const map = new TreapMap3<number, string>()
    expect(map.has(5)).toBe(false)
  })

  it('returns false after key is deleted', () => {
    const map = new TreapMap3<number, string>()
    map.set(5, 'five')
    map.delete(5)
    expect(map.has(5)).toBe(false)
  })
})

// ─── delete ───

describe('TreapMap3 delete', () => {
  it('deletes an existing key and returns true', () => {
    const map = new TreapMap3<number, string>()
    map.set(1, 'one')
    expect(map.delete(1)).toBe(true)
    expect(map.get(1)).toBeUndefined()
    expect(map.size).toBe(0)
  })

  it('returns false for missing key', () => {
    const map = new TreapMap3<number, string>()
    expect(map.delete(42)).toBe(false)
  })

  it('can delete all entries one by one', () => {
    const map = new TreapMap3<number, number>()
    for (let i = 0; i < 20; i++) {
      map.set(i, i)
    }
    for (let i = 0; i < 20; i++) {
      expect(map.delete(i)).toBe(true)
    }
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('maintains correct structure after deletions', () => {
    const map = new TreapMap3<number, string>()
    map.set(10, 'a')
    map.set(5, 'b')
    map.set(15, 'c')
    map.delete(5)
    expect(map.has(10)).toBe(true)
    expect(map.has(15)).toBe(true)
    expect(map.toArray()).toEqual([[10, 'a'], [15, 'c']])
  })
})

// ─── size / isEmpty ───

describe('TreapMap3 size and isEmpty', () => {
  it('tracks size correctly', () => {
    const map = new TreapMap3<number, string>()
    expect(map.size).toBe(0)
    map.set(1, 'a')
    expect(map.size).toBe(1)
    map.set(2, 'b')
    expect(map.size).toBe(2)
    map.set(1, 'updated')
    expect(map.size).toBe(2)
  })

  it('isEmpty reflects state', () => {
    const map = new TreapMap3<number, string>()
    expect(map.isEmpty()).toBe(true)
    map.set(1, 'a')
    expect(map.isEmpty()).toBe(false)
    map.delete(1)
    expect(map.isEmpty()).toBe(true)
  })
})

// ─── clear ───

describe('TreapMap3 clear', () => {
  it('removes all entries', () => {
    const map = new TreapMap3<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
    expect(map.get(1)).toBeUndefined()
  })

  it('allows reuse after clear', () => {
    const map = new TreapMap3<number, string>()
    map.set(1, 'a')
    map.clear()
    map.set(2, 'b')
    expect(map.size).toBe(1)
    expect(map.get(2)).toBe('b')
  })
})

// ─── min / max ───

describe('TreapMap3 min and max', () => {
  it('returns undefined on empty map', () => {
    const map = new TreapMap3<number, string>()
    expect(map.min()).toBeUndefined()
    expect(map.max()).toBeUndefined()
  })

  it('returns the only key for single-entry map', () => {
    const map = new TreapMap3<number, string>()
    map.set(42, 'x')
    expect(map.min()).toBe(42)
    expect(map.max()).toBe(42)
  })

  it('returns correct min and max with multiple entries', () => {
    const map = new TreapMap3<number, string>()
    map.set(50, 'a')
    map.set(10, 'b')
    map.set(90, 'c')
    map.set(30, 'd')
    expect(map.min()).toBe(10)
    expect(map.max()).toBe(90)
  })

  it('works with negative keys', () => {
    const map = new TreapMap3<number, string>()
    map.set(-5, 'a')
    map.set(-10, 'b')
    map.set(5, 'c')
    expect(map.min()).toBe(-10)
    expect(map.max()).toBe(5)
  })
})

// ─── forEach ───

describe('TreapMap3 forEach', () => {
  it('does nothing on empty map', () => {
    const map = new TreapMap3<number, string>()
    const collected: [number, string][] = []
    map.forEach((k, v) => collected.push([k, v]))
    expect(collected).toEqual([])
  })

  it('iterates in sorted order', () => {
    const map = new TreapMap3<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    const collected: [number, string][] = []
    map.forEach((k, v) => collected.push([k, v]))
    expect(collected).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })
})

// ─── keys / values / toArray ───

describe('TreapMap3 keys, values, toArray', () => {
  it('keys returns sorted keys', () => {
    const map = new TreapMap3<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    expect(map.keys()).toEqual([10, 20, 30])
  })

  it('values returns values in key order', () => {
    const map = new TreapMap3<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('toArray returns sorted [key, value] pairs', () => {
    const map = new TreapMap3<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    expect(map.toArray()).toEqual([[10, 'a'], [20, 'b'], [30, 'c']])
  })

  it('returns empty arrays on empty map', () => {
    const map = new TreapMap3<number, string>()
    expect(map.keys()).toEqual([])
    expect(map.values()).toEqual([])
    expect(map.toArray()).toEqual([])
  })
})

// ─── Edge Cases ───

describe('TreapMap3 edge cases', () => {
  it('handles string keys', () => {
    const map = new TreapMap3<string, number>()
    map.set('banana', 2)
    map.set('apple', 1)
    map.set('cherry', 3)
    expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    expect(map.get('banana')).toBe(2)
  })

  it('handles duplicate insertions without size change', () => {
    const map = new TreapMap3<number, string>()
    map.set(1, 'a')
    map.set(1, 'b')
    map.set(1, 'c')
    expect(map.size).toBe(1)
    expect(map.get(1)).toBe('c')
  })

  it('handles negative keys', () => {
    const map = new TreapMap3<number, string>()
    map.set(-3, 'a')
    map.set(-1, 'b')
    map.set(0, 'c')
    map.set(2, 'd')
    expect(map.keys()).toEqual([-3, -1, 0, 2])
  })

  it('handles single element operations', () => {
    const map = new TreapMap3<number, string>()
    map.set(1, 'only')
    expect(map.min()).toBe(1)
    expect(map.max()).toBe(1)
    expect(map.size).toBe(1)
    expect(map.delete(1)).toBe(true)
    expect(map.isEmpty()).toBe(true)
  })

  it('handles object values', () => {
    const map = new TreapMap3<number, { name: string }>()
    map.set(1, { name: 'first' })
    map.set(2, { name: 'second' })
    const result = map.get(1)
    expect(result).toEqual({ name: 'first' })
  })
})
