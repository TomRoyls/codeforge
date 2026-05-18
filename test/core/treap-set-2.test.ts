import { describe, it, expect } from 'vitest'
import { TreapSet2 } from '../../src/core/treap-set-2/index.js'

// ─── Constructor ───

describe('TreapSet2 constructor', () => {
  it('creates an empty set with default comparator', () => {
    const set = new TreapSet2<number>()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('accepts a custom comparator', () => {
    const reverseCmp = (a: number, b: number) => b - a
    const set = new TreapSet2<number>(reverseCmp)
    set.add(1)
    set.add(2)
    set.add(3)
    expect(set.toArray()).toEqual([3, 2, 1])
  })
})

// ─── add / has ───

describe('TreapSet2 add and has', () => {
  it('adds and finds a single element', () => {
    const set = new TreapSet2<number>()
    set.add(42)
    expect(set.has(42)).toBe(true)
  })

  it('returns false for missing element', () => {
    const set = new TreapSet2<number>()
    expect(set.has(1)).toBe(false)
  })

  it('ignores duplicate additions', () => {
    const set = new TreapSet2<number>()
    set.add(5)
    set.add(5)
    set.add(5)
    expect(set.size).toBe(1)
    expect(set.has(5)).toBe(true)
  })

  it('handles many insertions', () => {
    const set = new TreapSet2<number>()
    for (let i = 0; i < 100; i++) {
      set.add(i)
    }
    expect(set.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(set.has(i)).toBe(true)
    }
  })
})

// ─── delete ───

describe('TreapSet2 delete', () => {
  it('deletes an existing element and returns true', () => {
    const set = new TreapSet2<number>()
    set.add(1)
    expect(set.delete(1)).toBe(true)
    expect(set.has(1)).toBe(false)
    expect(set.size).toBe(0)
  })

  it('returns false for missing element', () => {
    const set = new TreapSet2<number>()
    expect(set.delete(42)).toBe(false)
  })

  it('can delete all elements one by one', () => {
    const set = new TreapSet2<number>()
    for (let i = 0; i < 20; i++) {
      set.add(i)
    }
    for (let i = 0; i < 20; i++) {
      expect(set.delete(i)).toBe(true)
    }
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('maintains correct structure after deletions', () => {
    const set = new TreapSet2<number>()
    set.add(10)
    set.add(5)
    set.add(15)
    set.delete(5)
    expect(set.has(10)).toBe(true)
    expect(set.has(15)).toBe(true)
    expect(set.toArray()).toEqual([10, 15])
  })

  it('does not affect size when deleting missing element', () => {
    const set = new TreapSet2<number>()
    set.add(1)
    set.add(2)
    expect(set.delete(99)).toBe(false)
    expect(set.size).toBe(2)
  })
})

// ─── size / isEmpty ───

describe('TreapSet2 size and isEmpty', () => {
  it('tracks size correctly', () => {
    const set = new TreapSet2<number>()
    expect(set.size).toBe(0)
    set.add(1)
    expect(set.size).toBe(1)
    set.add(2)
    expect(set.size).toBe(2)
    set.add(1)
    expect(set.size).toBe(2)
  })

  it('isEmpty reflects state', () => {
    const set = new TreapSet2<number>()
    expect(set.isEmpty()).toBe(true)
    set.add(1)
    expect(set.isEmpty()).toBe(false)
    set.delete(1)
    expect(set.isEmpty()).toBe(true)
  })
})

// ─── clear ───

describe('TreapSet2 clear', () => {
  it('removes all elements', () => {
    const set = new TreapSet2<number>()
    set.add(1)
    set.add(2)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
    expect(set.has(1)).toBe(false)
  })

  it('allows reuse after clear', () => {
    const set = new TreapSet2<number>()
    set.add(1)
    set.clear()
    set.add(2)
    expect(set.size).toBe(1)
    expect(set.has(2)).toBe(true)
  })
})

// ─── min / max ───

describe('TreapSet2 min and max', () => {
  it('returns undefined on empty set', () => {
    const set = new TreapSet2<number>()
    expect(set.min()).toBeUndefined()
    expect(set.max()).toBeUndefined()
  })

  it('returns the only element for single-element set', () => {
    const set = new TreapSet2<number>()
    set.add(42)
    expect(set.min()).toBe(42)
    expect(set.max()).toBe(42)
  })

  it('returns correct min and max with multiple elements', () => {
    const set = new TreapSet2<number>()
    set.add(50)
    set.add(10)
    set.add(90)
    set.add(30)
    expect(set.min()).toBe(10)
    expect(set.max()).toBe(90)
  })

  it('works with negative elements', () => {
    const set = new TreapSet2<number>()
    set.add(-5)
    set.add(-10)
    set.add(5)
    expect(set.min()).toBe(-10)
    expect(set.max()).toBe(5)
  })
})

// ─── toArray ───

describe('TreapSet2 toArray', () => {
  it('returns empty array for empty set', () => {
    const set = new TreapSet2<number>()
    expect(set.toArray()).toEqual([])
  })

  it('returns sorted array', () => {
    const set = new TreapSet2<number>()
    set.add(30)
    set.add(10)
    set.add(20)
    expect(set.toArray()).toEqual([10, 20, 30])
  })

  it('does not include duplicates', () => {
    const set = new TreapSet2<number>()
    set.add(5)
    set.add(5)
    set.add(3)
    set.add(3)
    expect(set.toArray()).toEqual([3, 5])
  })
})

// ─── union ───

describe('TreapSet2 union', () => {
  it('returns union of two sets', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new TreapSet2<number>()
    b.add(3)
    b.add(4)
    b.add(5)
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('returns copy when other set is empty', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    a.add(2)
    const b = new TreapSet2<number>()
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2])
  })

  it('returns copy when first set is empty', () => {
    const a = new TreapSet2<number>()
    const b = new TreapSet2<number>()
    b.add(1)
    b.add(2)
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2])
  })

  it('returns empty set when both are empty', () => {
    const a = new TreapSet2<number>()
    const b = new TreapSet2<number>()
    const result = a.union(b)
    expect(result.isEmpty()).toBe(true)
  })

  it('does not modify original sets', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    const b = new TreapSet2<number>()
    b.add(2)
    a.union(b)
    expect(a.toArray()).toEqual([1])
    expect(b.toArray()).toEqual([2])
  })
})

// ─── intersection ───

describe('TreapSet2 intersection', () => {
  it('returns intersection of two sets', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new TreapSet2<number>()
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('returns empty set with no common elements', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    a.add(2)
    const b = new TreapSet2<number>()
    b.add(3)
    b.add(4)
    const result = a.intersection(b)
    expect(result.isEmpty()).toBe(true)
  })

  it('returns empty set when either is empty', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    const b = new TreapSet2<number>()
    expect(a.intersection(b).isEmpty()).toBe(true)
    expect(b.intersection(a).isEmpty()).toBe(true)
  })

  it('returns identical set when both are same', () => {
    const a = new TreapSet2<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new TreapSet2<number>()
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.intersection(b).toArray()).toEqual([1, 2, 3])
  })
})

// ─── Edge Cases ───

describe('TreapSet2 edge cases', () => {
  it('handles string elements', () => {
    const set = new TreapSet2<string>()
    set.add('banana')
    set.add('apple')
    set.add('cherry')
    expect(set.toArray()).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles negative elements', () => {
    const set = new TreapSet2<number>()
    set.add(-3)
    set.add(-1)
    set.add(0)
    set.add(2)
    expect(set.toArray()).toEqual([-3, -1, 0, 2])
  })

  it('handles single element operations', () => {
    const set = new TreapSet2<number>()
    set.add(1)
    expect(set.min()).toBe(1)
    expect(set.max()).toBe(1)
    expect(set.size).toBe(1)
    expect(set.delete(1)).toBe(true)
    expect(set.isEmpty()).toBe(true)
  })

  it('handles large number of elements', () => {
    const set = new TreapSet2<number>()
    const count = 200
    for (let i = 0; i < count; i++) {
      set.add(i)
    }
    expect(set.size).toBe(count)
    expect(set.min()).toBe(0)
    expect(set.max()).toBe(count - 1)
  })

  it('handles adding elements in reverse order', () => {
    const set = new TreapSet2<number>()
    for (let i = 10; i >= 0; i--) {
      set.add(i)
    }
    expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})
