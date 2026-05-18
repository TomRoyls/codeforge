import { describe, it, expect } from 'vitest'
import { FingerprintSet } from '../src/core/fingerprint-set/index.js'
import type { FingerprintSetOptions } from '../src/core/fingerprint-set/index.js'

// ─── Construction ───

describe('FingerprintSet - Construction', () => {
  it('creates empty set', () => {
    const set = new FingerprintSet<string>()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })

  it('accepts options with custom hashBits', () => {
    const set = new FingerprintSet<string>({ hashBits: 8 })
    expect(set.capacity).toBe(1 << 8)
  })

  it('accepts custom serializer', () => {
    const set = new FingerprintSet<{ id: number }>({
      serialize: (v) => String(v.id),
    })
    set.add({ id: 1 })
    expect(set.size).toBe(1)
  })

  it('fromArray creates set from array', () => {
    const set = FingerprintSet.fromArray(['a', 'b', 'c'])
    expect(set.size).toBe(3)
  })

  it('fromArray deduplicates', () => {
    const set = FingerprintSet.fromArray(['a', 'a', 'b'])
    expect(set.size).toBe(2)
  })
})

// ─── Add and Has ───

describe('FingerprintSet - Add and Has', () => {
  it('adds unique elements', () => {
    const set = new FingerprintSet<string>()
    expect(set.add('x')).toBe(true)
    expect(set.add('y')).toBe(true)
    expect(set.size).toBe(2)
  })

  it('rejects duplicate elements', () => {
    const set = new FingerprintSet<string>()
    set.add('hello')
    expect(set.add('hello')).toBe(false)
    expect(set.size).toBe(1)
  })

  it('has returns true for existing elements', () => {
    const set = new FingerprintSet<number>()
    set.add(42)
    expect(set.has(42)).toBe(true)
  })

  it('has returns false for missing elements', () => {
    const set = new FingerprintSet<number>()
    expect(set.has(99)).toBe(false)
  })

  it('contains is alias for has', () => {
    const set = new FingerprintSet<string>()
    set.add('test')
    expect(set.contains('test')).toBe(true)
  })
})

// ─── Delete ───

describe('FingerprintSet - Delete', () => {
  it('deletes existing element', () => {
    const set = new FingerprintSet<string>()
    set.add('remove-me')
    expect(set.delete('remove-me')).toBe(true)
    expect(set.size).toBe(0)
  })

  it('returns false for missing element', () => {
    const set = new FingerprintSet<string>()
    expect(set.delete('nope')).toBe(false)
  })
})

// ─── Iteration ───

describe('FingerprintSet - Iteration', () => {
  it('iterates over elements', () => {
    const set = FingerprintSet.fromArray(['a', 'b', 'c'])
    const items: string[] = []
    for (const v of set) {
      items.push(v)
    }
    expect(items.length).toBe(3)
    expect(items.sort()).toEqual(['a', 'b', 'c'])
  })

  it('forEach calls callback with index', () => {
    const set = FingerprintSet.fromArray(['x', 'y'])
    const results: [string, number][] = []
    set.forEach((v, i) => results.push([v, i]))
    expect(results.length).toBe(2)
    results.forEach(([, i]) => expect(i).toBeGreaterThanOrEqual(0))
  })

  it('toArray returns all elements', () => {
    const set = FingerprintSet.fromArray([1, 2, 3])
    const arr = set.toArray()
    expect(arr.sort()).toEqual([1, 2, 3])
  })
})

// ─── Set Operations ───

describe('FingerprintSet - Set Operations', () => {
  it('union combines two sets', () => {
    const a = FingerprintSet.fromArray(['a', 'b'])
    const b = FingerprintSet.fromArray(['b', 'c'])
    const result = a.union(b)
    expect(result.size).toBe(3)
    expect(result.toArray().sort()).toEqual(['a', 'b', 'c'])
  })

  it('intersection returns common elements', () => {
    const a = FingerprintSet.fromArray(['a', 'b', 'c'])
    const b = FingerprintSet.fromArray(['b', 'c', 'd'])
    const result = a.intersection(b)
    expect(result.size).toBe(2)
    expect(result.toArray().sort()).toEqual(['b', 'c'])
  })

  it('difference returns elements only in first set', () => {
    const a = FingerprintSet.fromArray(['a', 'b', 'c'])
    const b = FingerprintSet.fromArray(['b'])
    const result = a.difference(b)
    expect(result.size).toBe(2)
    expect(result.toArray().sort()).toEqual(['a', 'c'])
  })

  it('isSubsetOf checks containment', () => {
    const a = FingerprintSet.fromArray(['a', 'b'])
    const b = FingerprintSet.fromArray(['a', 'b', 'c'])
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('isSupersetOf checks containment', () => {
    const a = FingerprintSet.fromArray(['a', 'b', 'c'])
    const b = FingerprintSet.fromArray(['a', 'b'])
    expect(a.isSupersetOf(b)).toBe(true)
  })

  it('equals checks set equality', () => {
    const a = FingerprintSet.fromArray(['a', 'b'])
    const b = FingerprintSet.fromArray(['b', 'a'])
    expect(a.equals(b)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const a = FingerprintSet.fromArray(['a'])
    const b = FingerprintSet.fromArray(['a', 'b'])
    expect(a.equals(b)).toBe(false)
  })
})

// ─── Functional Operations ───

describe('FingerprintSet - Functional Operations', () => {
  it('filter returns matching elements', () => {
    const set = FingerprintSet.fromArray([1, 2, 3, 4, 5])
    const evens = set.filter((v) => v % 2 === 0)
    expect(evens.toArray().sort()).toEqual([2, 4])
  })

  it('every returns true when all match', () => {
    const set = FingerprintSet.fromArray([2, 4, 6])
    expect(set.every((v) => v % 2 === 0)).toBe(true)
  })

  it('every returns false when some do not match', () => {
    const set = FingerprintSet.fromArray([2, 3, 6])
    expect(set.every((v) => v % 2 === 0)).toBe(false)
  })

  it('some returns true when any matches', () => {
    const set = FingerprintSet.fromArray([1, 2, 3])
    expect(set.some((v) => v > 2)).toBe(true)
  })

  it('reduce aggregates values', () => {
    const set = FingerprintSet.fromArray([1, 2, 3])
    const sum = set.reduce((acc, v) => acc + v, 0)
    expect(sum).toBe(6)
  })

  it('join concatenates serialized values', () => {
    const set = FingerprintSet.fromArray(['a', 'b', 'c'])
    const joined = set.join('-')
    expect(['a-b-c', 'a-c-b', 'b-a-c', 'b-c-a', 'c-a-b', 'c-b-a']).toContain(joined)
  })
})

// ─── Utility Methods ───

describe('FingerprintSet - Utility Methods', () => {
  it('first returns first element or undefined', () => {
    const set = FingerprintSet.fromArray(['x'])
    expect(set.first()).toBe('x')
    const empty = new FingerprintSet<string>()
    expect(empty.first()).toBeUndefined()
  })

  it('last returns last element or undefined', () => {
    const set = FingerprintSet.fromArray(['x'])
    expect(set.last()).toBe('x')
    const empty = new FingerprintSet<string>()
    expect(empty.last()).toBeUndefined()
  })

  it('clear empties the set', () => {
    const set = FingerprintSet.fromArray(['a', 'b'])
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })

  it('clone creates independent copy', () => {
    const set = FingerprintSet.fromArray(['a'])
    const cloned = set.clone()
    cloned.add('b')
    expect(set.size).toBe(1)
    expect(cloned.size).toBe(2)
  })

  it('count returns size', () => {
    const set = FingerprintSet.fromArray([1, 2, 3])
    expect(set.count()).toBe(3)
  })

  it('fingerprint returns bigint', () => {
    const set = new FingerprintSet<string>()
    const fp = set.fingerprint('test')
    expect(typeof fp).toBe('bigint')
  })

  it('hasCollision detects same fingerprint', () => {
    const set = new FingerprintSet<string>()
    expect(set.hasCollision('a', 'a')).toBe(true)
  })

  it('loadFactor returns ratio', () => {
    const set = new FingerprintSet<string>({ hashBits: 4 })
    expect(set.loadFactor()).toBe(0)
    set.add('x')
    expect(set.loadFactor()).toBeGreaterThan(0)
  })
})
