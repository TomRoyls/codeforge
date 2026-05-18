import { describe, it, expect } from 'vitest'
import { TreapMap2 } from '../src/core/treap-map-2/index.js'

// ─── Construction and Insertion ───

describe('TreapMap2: construction and insertion', () => {
  it('creates an empty map', () => {
    const m = new TreapMap2<number, string>()
    expect(m.size).toBe(0)
    expect(m.isEmpty).toBe(true)
  })

  it('sets a key-value pair', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'one')
    expect(m.get(1)).toBe('one')
    expect(m.size).toBe(1)
  })

  it('insert is alias for set', () => {
    const m = new TreapMap2<number, string>()
    m.insert(1, 'one')
    expect(m.get(1)).toBe('one')
  })

  it('updates value for existing key', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'old')
    m.set(1, 'new')
    expect(m.get(1)).toBe('new')
    expect(m.size).toBe(1)
  })

  it('handles multiple insertions', () => {
    const m = new TreapMap2<number, string>()
    m.set(5, 'five')
    m.set(3, 'three')
    m.set(7, 'seven')
    m.set(1, 'one')
    expect(m.size).toBe(4)
  })

  it('supports custom comparator', () => {
    const m = new TreapMap2<number, string>({
      comparator: (a, b) => b - a,
    })
    m.set(1, 'a')
    m.set(5, 'b')
    m.set(3, 'c')
    expect(m.keys()).toEqual([5, 3, 1])
  })

  it('fromArray creates map from entries', () => {
    const m = TreapMap2.fromArray([[3, 'c'], [1, 'a'], [2, 'b']])
    expect(m.size).toBe(3)
    expect(m.keys()).toEqual([1, 2, 3])
  })
})

// ─── Lookup Operations ───

describe('TreapMap2: lookup operations', () => {
  const m = new TreapMap2<number, string>()
  m.set(1, 'one')
  m.set(3, 'three')
  m.set(5, 'five')

  it('get returns value for existing key', () => {
    expect(m.get(1)).toBe('one')
    expect(m.get(5)).toBe('five')
  })

  it('get returns undefined for missing key', () => {
    expect(m.get(2)).toBeUndefined()
    expect(m.get(10)).toBeUndefined()
  })

  it('has returns correct boolean', () => {
    expect(m.has(1)).toBe(true)
    expect(m.has(2)).toBe(false)
  })
})

// ─── Min, Max, First, Last ───

describe('TreapMap2: min, max, first, last', () => {
  const m = new TreapMap2<number, string>()
  m.set(5, 'five')
  m.set(3, 'three')
  m.set(7, 'seven')

  it('min returns smallest entry', () => {
    expect(m.min()).toEqual([3, 'three'])
  })

  it('max returns largest entry', () => {
    expect(m.max()).toEqual([7, 'seven'])
  })

  it('first returns min', () => {
    expect(m.first()).toEqual([3, 'three'])
  })

  it('last returns max', () => {
    expect(m.last()).toEqual([7, 'seven'])
  })

  it('min/max return undefined for empty', () => {
    const empty = new TreapMap2<number, string>()
    expect(empty.min()).toBeUndefined()
    expect(empty.max()).toBeUndefined()
  })
})

// ─── Deletion ───

describe('TreapMap2: deletion', () => {
  it('deletes an existing key', () => {
    const m = new TreapMap2<number, string>()
    m.set(5, 'five')
    m.set(3, 'three')
    m.set(7, 'seven')
    expect(m.delete(5)).toBe(true)
    expect(m.has(5)).toBe(false)
    expect(m.size).toBe(2)
  })

  it('returns false for deleting missing key', () => {
    const m = new TreapMap2<number, string>()
    m.set(5, 'five')
    expect(m.delete(4)).toBe(false)
  })

  it('maintains order after deletions', () => {
    const m = new TreapMap2<number, string>()
    for (let i = 1; i <= 5; i++) m.set(i, String(i))
    m.delete(3)
    expect(m.keys()).toEqual([1, 2, 4, 5])
  })
})

// ─── Update ───

describe('TreapMap2: update', () => {
  it('update changes value for existing key', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'old')
    expect(m.update(1, 'new')).toBe(true)
    expect(m.get(1)).toBe('new')
  })

  it('update returns false for missing key', () => {
    const m = new TreapMap2<number, string>()
    expect(m.update(1, 'val')).toBe(false)
  })
})

// ─── Bounds Queries ───

describe('TreapMap2: bounds queries', () => {
  const m = new TreapMap2<number, string>()
  m.set(1, 'a')
  m.set(3, 'b')
  m.set(5, 'c')
  m.set(7, 'd')

  it('lowerBound returns first entry with key >= given', () => {
    expect(m.lowerBound(3)).toEqual([3, 'b'])
    expect(m.lowerBound(4)).toEqual([5, 'c'])
  })

  it('upperBound returns first entry with key > given', () => {
    expect(m.upperBound(3)).toEqual([5, 'c'])
    expect(m.upperBound(7)).toBeUndefined()
  })

  it('predecessor returns last entry with key < given', () => {
    expect(m.predecessor(5)).toEqual([3, 'b'])
    expect(m.predecessor(1)).toBeUndefined()
  })

  it('successor returns first entry with key > given', () => {
    expect(m.successor(5)).toEqual([7, 'd'])
    expect(m.successor(7)).toBeUndefined()
  })
})

// ─── Rank and Select ───

describe('TreapMap2: rank and select', () => {
  const m = new TreapMap2<number, string>()
  m.set(10, 'a')
  m.set(20, 'b')
  m.set(30, 'c')
  m.set(40, 'd')

  it('rank returns number of keys less than given', () => {
    expect(m.rank(10)).toBe(0)
    expect(m.rank(20)).toBe(1)
    expect(m.rank(30)).toBe(2)
  })

  it('select returns entry at given rank', () => {
    expect(m.select(0)).toEqual([10, 'a'])
    expect(m.select(3)).toEqual([40, 'd'])
  })

  it('select returns undefined for out of range', () => {
    expect(m.select(-1)).toBeUndefined()
    expect(m.select(4)).toBeUndefined()
  })
})

// ─── Iteration ───

describe('TreapMap2: iteration', () => {
  it('forEach iterates in order', () => {
    const m = new TreapMap2<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    const collected: [string, number][] = []
    m.forEach((v, k) => collected.push([v, k]))
    expect(collected).toEqual([['a', 1], ['b', 2], ['c', 3]])
  })

  it('is iterable', () => {
    const m = new TreapMap2<number, string>()
    m.set(2, 'b')
    m.set(1, 'a')
    const entries = [...m]
    expect(entries).toEqual([[1, 'a'], [2, 'b']])
  })

  it('keys returns sorted keys', () => {
    const m = new TreapMap2<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.keys()).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const m = new TreapMap2<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.values()).toEqual(['a', 'b', 'c'])
  })

  it('entries returns key-value pairs', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.entries()).toEqual([[1, 'a'], [2, 'b']])
  })

  it('toArray is alias for entries', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'a')
    expect(m.toArray()).toEqual(m.entries())
  })
})

// ─── Clone, Clear, Split, Merge ───

describe('TreapMap2: clone, clear, split, merge', () => {
  it('clone creates independent copy', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    const cloned = m.clone()
    m.set(3, 'c')
    expect(cloned.has(3)).toBe(false)
  })

  it('clear empties the map', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'a')
    m.clear()
    expect(m.isEmpty).toBe(true)
  })

  it('split divides the map', () => {
    const m = new TreapMap2<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    m.set(3, 'c')
    m.set(4, 'd')
    const [left, right] = m.split(3)
    expect(left.keys()).toEqual([1, 2])
    expect(right.keys()).toEqual([3, 4])
  })

  it('merge creates new merged map from disjoint ranges', () => {
    const m1 = new TreapMap2<number, string>()
    m1.set(1, 'a')
    m1.set(2, 'b')
    const m2 = new TreapMap2<number, string>()
    m2.set(3, 'c')
    m2.set(4, 'd')
    const merged = m1.merge(m2)
    expect(merged.size).toBe(4)
    expect(merged.keys()).toEqual([1, 2, 3, 4])
  })
})

// ─── Range Query ───

describe('TreapMap2: range query', () => {
  const m = new TreapMap2<number, string>()
  m.set(1, 'a')
  m.set(3, 'b')
  m.set(5, 'c')
  m.set(7, 'd')
  m.set(9, 'e')

  it('rangeQuery returns entries in range', () => {
    expect(m.rangeQuery(3, 7)).toEqual([[3, 'b'], [5, 'c'], [7, 'd']])
  })

  it('rangeQuery returns empty for invalid range', () => {
    expect(m.rangeQuery(7, 3)).toEqual([])
  })

  it('rangeQuery returns empty for no matches', () => {
    expect(m.rangeQuery(10, 20)).toEqual([])
  })
})
