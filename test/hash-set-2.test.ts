import { describe, it, expect } from 'vitest'
import { HashSet } from '../src/core/hash-set-2/index.js'
import type { HashSetOptions, HashSetStats } from '../src/core/hash-set-2/types.js'

// ─── Construction ───

describe('HashSet - Construction', () => {
  it('creates empty set', () => {
    const set = new HashSet<string>()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('accepts options', () => {
    const set = new HashSet<number>({ initialCapacity: 32, loadFactor: 0.5 })
    expect(set.isEmpty()).toBe(true)
  })

  it('from() creates set from array', () => {
    const set = HashSet.from(['a', 'b', 'c'])
    expect(set.size).toBe(3)
  })

  it('from() deduplicates', () => {
    const set = HashSet.from([1, 1, 2, 2, 3])
    expect(set.size).toBe(3)
  })
})

// ─── Add and Has ───

describe('HashSet - Add and Has', () => {
  it('adds unique elements', () => {
    const set = new HashSet<string>()
    expect(set.add('a')).toBe(true)
    expect(set.add('b')).toBe(true)
    expect(set.size).toBe(2)
  })

  it('rejects duplicates', () => {
    const set = new HashSet<string>()
    set.add('x')
    expect(set.add('x')).toBe(false)
    expect(set.size).toBe(1)
  })

  it('has returns true for existing element', () => {
    const set = new HashSet<number>()
    set.add(42)
    expect(set.has(42)).toBe(true)
  })

  it('has returns false for missing element', () => {
    const set = new HashSet<number>()
    expect(set.has(99)).toBe(false)
  })

  it('handles string values', () => {
    const set = new HashSet<string>()
    set.add('hello')
    expect(set.has('hello')).toBe(true)
    expect(set.has('world')).toBe(false)
  })

  it('handles boolean values', () => {
    const set = new HashSet<boolean>()
    set.add(true)
    set.add(false)
    expect(set.size).toBe(2)
  })
})

// ─── Delete ───

describe('HashSet - Delete', () => {
  it('deletes existing element', () => {
    const set = new HashSet<string>()
    set.add('remove')
    expect(set.delete('remove')).toBe(true)
    expect(set.size).toBe(0)
  })

  it('returns false for missing element', () => {
    const set = new HashSet<string>()
    expect(set.delete('nope')).toBe(false)
  })

  it('allows re-adding after delete', () => {
    const set = new HashSet<string>()
    set.add('x')
    set.delete('x')
    expect(set.add('x')).toBe(true)
  })
})

// ─── Clear ───

describe('HashSet - Clear', () => {
  it('removes all elements', () => {
    const set = HashSet.from([1, 2, 3])
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })
})

// ─── ToArray and Iteration ───

describe('HashSet - ToArray and Iteration', () => {
  it('toArray returns all elements', () => {
    const set = HashSet.from([1, 2, 3])
    const arr = set.toArray().sort()
    expect(arr).toEqual([1, 2, 3])
  })

  it('forEach iterates over all elements', () => {
    const set = HashSet.from(['a', 'b'])
    const collected: string[] = []
    set.forEach((v, i) => {
      collected.push(v)
      expect(i).toBeGreaterThanOrEqual(0)
    })
    expect(collected.length).toBe(2)
  })

  it('values generator yields elements', () => {
    const set = HashSet.from([1, 2, 3])
    const vals = [...set.values()].sort()
    expect(vals).toEqual([1, 2, 3])
  })

  it('iterates with for-of', () => {
    const set = HashSet.from(['x', 'y'])
    const items: string[] = []
    for (const item of set) {
      items.push(item)
    }
    expect(items.length).toBe(2)
  })
})

// ─── Set Operations ───

describe('HashSet - Set Operations', () => {
  it('union combines sets', () => {
    const a = HashSet.from(['a', 'b'])
    const b = HashSet.from(['b', 'c'])
    const result = a.union(b)
    expect(result.size).toBe(3)
    expect(result.toArray().sort()).toEqual(['a', 'b', 'c'])
  })

  it('intersection returns common elements', () => {
    const a = HashSet.from(['a', 'b', 'c'])
    const b = HashSet.from(['b', 'c', 'd'])
    const result = a.intersection(b)
    expect(result.size).toBe(2)
    expect(result.toArray().sort()).toEqual(['b', 'c'])
  })

  it('difference returns elements only in first', () => {
    const a = HashSet.from(['a', 'b', 'c'])
    const b = HashSet.from(['b'])
    const result = a.difference(b)
    expect(result.toArray().sort()).toEqual(['a', 'c'])
  })

  it('symmetricDifference returns elements in exactly one set', () => {
    const a = HashSet.from(['a', 'b'])
    const b = HashSet.from(['b', 'c'])
    const result = a.symmetricDifference(b)
    expect(result.size).toBe(2)
    expect(result.toArray().sort()).toEqual(['a', 'c'])
  })

  it('isSubsetOf checks containment', () => {
    const a = HashSet.from(['a', 'b'])
    const b = HashSet.from(['a', 'b', 'c'])
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('isSupersetOf checks containment', () => {
    const a = HashSet.from(['a', 'b', 'c'])
    const b = HashSet.from(['a', 'b'])
    expect(a.isSupersetOf(b)).toBe(true)
  })

  it('equals checks set equality', () => {
    const a = HashSet.from(['a', 'b'])
    const b = HashSet.from(['b', 'a'])
    expect(a.equals(b)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const a = HashSet.from(['a'])
    const b = HashSet.from(['a', 'b'])
    expect(a.equals(b)).toBe(false)
  })

  it('empty set is subset of everything', () => {
    const empty = new HashSet<number>()
    const other = HashSet.from([1, 2, 3])
    expect(empty.isSubsetOf(other)).toBe(true)
  })
})

// ─── Stats ───

describe('HashSet - Stats', () => {
  it('returns stats object', () => {
    const set = HashSet.from([1, 2, 3])
    const stats = set.stats()
    expect(stats.size).toBe(3)
    expect(stats.capacity).toBeGreaterThan(0)
    expect(stats.loadFactor).toBeGreaterThan(0)
    expect(stats.buckets).toBeGreaterThan(0)
    expect(typeof stats.collisions).toBe('number')
  })
})

// ─── Custom Options ───

describe('HashSet - Custom Options', () => {
  it('respects custom hash function', () => {
    const set = new HashSet<string>({
      hashFunction: () => 0,
    })
    set.add('a')
    set.add('b')
    expect(set.size).toBe(2)
  })

  it('respects custom equals function', () => {
    const set = new HashSet<{ id: number }>({
      equals: (a, b) => a.id === b.id,
      hashFunction: (v) => v.id,
    })
    set.add({ id: 1 })
    expect(set.has({ id: 1 })).toBe(true)
    expect(set.has({ id: 2 })).toBe(false)
  })

  it('handles NaN values', () => {
    const set = new HashSet<number>()
    set.add(Number.NaN)
    expect(set.has(Number.NaN)).toBe(true)
  })
})

// ─── Resize ───

describe('HashSet - Resize', () => {
  it('resizes when exceeding load factor', () => {
    const set = new HashSet<number>({ initialCapacity: 4, loadFactor: 0.75 })
    for (let i = 0; i < 10; i++) {
      set.add(i)
    }
    expect(set.size).toBe(10)
    const stats = set.stats()
    expect(stats.capacity).toBeGreaterThan(4)
  })
})
