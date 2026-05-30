import { beforeEach, describe, expect, it } from 'vitest'

import { SparseSet } from '../../src/utils/sparse-set.js'

// ─── Constructor ─────────────────────────────────────────
describe('SparseSet - constructor', () => {
  it('creates set with valid universe size', () => {
    const s = new SparseSet(10)
    expect(s.universeSize).toBe(10)
    expect(s.size).toBe(0)
    expect(s.isEmpty).toBe(true)
  })

  it('creates set with universe size 0', () => {
    const s = new SparseSet(0)
    expect(s.universeSize).toBe(0)
    expect(s.size).toBe(0)
  })

  it('throws on negative universe size', () => {
    expect(() => new SparseSet(-1)).toThrow(RangeError)
  })

  it('throws on non-integer universe size', () => {
    expect(() => new SparseSet(3.5)).toThrow(RangeError)
  })

  it('throws on NaN universe size', () => {
    expect(() => new SparseSet(NaN)).toThrow(RangeError)
  })

  it('throws with descriptive error message', () => {
    expect(() => new SparseSet(-5)).toThrow('Universe size must be a non-negative integer, got -5')
  })
})

// ─── Add ─────────────────────────────────────────────────
describe('SparseSet - add', () => {
  it('adds a valid value', () => {
    const s = new SparseSet(10)
    expect(s.add(5)).toBe(true)
    expect(s.has(5)).toBe(true)
    expect(s.size).toBe(1)
  })

  it('adds value 0', () => {
    const s = new SparseSet(5)
    expect(s.add(0)).toBe(true)
    expect(s.has(0)).toBe(true)
  })

  it('adds maximum valid value (universeSize - 1)', () => {
    const s = new SparseSet(10)
    expect(s.add(9)).toBe(true)
    expect(s.has(9)).toBe(true)
  })

  it('returns false for duplicate add', () => {
    const s = new SparseSet(10)
    s.add(5)
    expect(s.add(5)).toBe(false)
    expect(s.size).toBe(1)
  })

  it('returns false for negative value', () => {
    const s = new SparseSet(10)
    expect(s.add(-1)).toBe(false)
  })

  it('returns false for value >= universeSize', () => {
    const s = new SparseSet(10)
    expect(s.add(10)).toBe(false)
  })

  it('returns false for non-integer value', () => {
    const s = new SparseSet(10)
    expect(s.add(3.5)).toBe(false)
  })

  it('returns false for NaN value', () => {
    const s = new SparseSet(10)
    expect(s.add(NaN)).toBe(false)
  })

  it('adds multiple values in sequence', () => {
    const s = new SparseSet(10)
    s.add(3)
    s.add(7)
    s.add(1)
    expect(s.size).toBe(3)
    expect(s.has(3)).toBe(true)
    expect(s.has(7)).toBe(true)
    expect(s.has(1)).toBe(true)
  })
})

// ─── Has ─────────────────────────────────────────────────
describe('SparseSet - has', () => {
  it('returns false for value not in set', () => {
    const s = new SparseSet(10)
    expect(s.has(5)).toBe(false)
  })

  it('returns false for out-of-range value', () => {
    const s = new SparseSet(5)
    expect(s.has(10)).toBe(false)
  })

  it('returns false for negative value', () => {
    const s = new SparseSet(10)
    expect(s.has(-1)).toBe(false)
  })

  it('returns false for non-integer value', () => {
    const s = new SparseSet(10)
    expect(s.has(2.5)).toBe(false)
  })

  it('returns true after add', () => {
    const s = new SparseSet(10)
    s.add(4)
    expect(s.has(4)).toBe(true)
  })

  it('returns false after remove', () => {
    const s = new SparseSet(10)
    s.add(4)
    s.remove(4)
    expect(s.has(4)).toBe(false)
  })
})

// ─── Remove ──────────────────────────────────────────────
describe('SparseSet - remove', () => {
  it('removes an existing value', () => {
    const s = new SparseSet(10)
    s.add(5)
    expect(s.remove(5)).toBe(true)
    expect(s.has(5)).toBe(false)
    expect(s.size).toBe(0)
  })

  it('returns false for non-existent value', () => {
    const s = new SparseSet(10)
    expect(s.remove(5)).toBe(false)
  })

  it('returns false for out-of-range value', () => {
    const s = new SparseSet(5)
    expect(s.remove(10)).toBe(false)
  })

  it('returns false for negative value', () => {
    const s = new SparseSet(10)
    expect(s.remove(-1)).toBe(false)
  })

  it('maintains correctness after removing middle element', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(2)
    s.add(3)
    s.remove(2)
    expect(s.has(1)).toBe(true)
    expect(s.has(2)).toBe(false)
    expect(s.has(3)).toBe(true)
    expect(s.size).toBe(2)
  })

  it('can add back a removed value', () => {
    const s = new SparseSet(10)
    s.add(5)
    s.remove(5)
    expect(s.add(5)).toBe(true)
    expect(s.has(5)).toBe(true)
    expect(s.size).toBe(1)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('SparseSet - clear', () => {
  it('clears all elements', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(3)
    s.add(5)
    s.clear()
    expect(s.size).toBe(0)
    expect(s.isEmpty).toBe(true)
    expect(s.has(1)).toBe(false)
    expect(s.has(3)).toBe(false)
    expect(s.has(5)).toBe(false)
  })

  it('preserves universeSize after clear', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(2)
    s.clear()
    expect(s.universeSize).toBe(10)
  })

  it('can add after clear', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.clear()
    s.add(5)
    expect(s.has(5)).toBe(true)
    expect(s.size).toBe(1)
  })
})

// ─── Size and isEmpty ────────────────────────────────────
describe('SparseSet - size and isEmpty', () => {
  it('isEmpty is true for new set', () => {
    const s = new SparseSet(10)
    expect(s.isEmpty).toBe(true)
  })

  it('isEmpty is false after add', () => {
    const s = new SparseSet(10)
    s.add(1)
    expect(s.isEmpty).toBe(false)
  })

  it('size tracks additions', () => {
    const s = new SparseSet(10)
    expect(s.size).toBe(0)
    s.add(1)
    expect(s.size).toBe(1)
    s.add(2)
    expect(s.size).toBe(2)
    s.add(3)
    expect(s.size).toBe(3)
  })

  it('size tracks removals', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(2)
    s.add(3)
    s.remove(2)
    expect(s.size).toBe(2)
  })
})

// ─── Values and iteration ────────────────────────────────
describe('SparseSet - values and iteration', () => {
  it('values returns empty array for empty set', () => {
    const s = new SparseSet(10)
    expect(s.values()).toEqual([])
  })

  it('values returns all added values', () => {
    const s = new SparseSet(10)
    s.add(3)
    s.add(1)
    s.add(5)
    const vals = s.values()
    expect(vals).toHaveLength(3)
    expect(vals).toContain(1)
    expect(vals).toContain(3)
    expect(vals).toContain(5)
  })

  it('values does not include removed values', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(2)
    s.add(3)
    s.remove(2)
    const vals = s.values()
    expect(vals).toHaveLength(2)
    expect(vals).not.toContain(2)
  })

  it('forEach iterates all values', () => {
    const s = new SparseSet(10)
    s.add(3)
    s.add(1)
    s.add(5)
    const collected: Array<{ value: number; index: number }> = []
    s.forEach((value, index) => collected.push({ value, index }))
    expect(collected).toHaveLength(3)
    expect(collected[0]!.index).toBe(0)
    expect(collected[1]!.index).toBe(1)
    expect(collected[2]!.index).toBe(2)
  })

  it('forEach does not iterate on empty set', () => {
    const s = new SparseSet(10)
    let count = 0
    s.forEach(() => count++)
    expect(count).toBe(0)
  })

  it('for-of iteration works', () => {
    const s = new SparseSet(10)
    s.add(2)
    s.add(4)
    s.add(6)
    const result: number[] = []
    for (const v of s) {
      result.push(v)
    }
    expect(result).toHaveLength(3)
    expect(result).toContain(2)
    expect(result).toContain(4)
    expect(result).toContain(6)
  })

  it('toArray returns same as values', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(3)
    s.add(5)
    expect(s.toArray()).toEqual(s.values())
  })
})

// ─── Union ───────────────────────────────────────────────
describe('SparseSet - union', () => {
  it('union of two non-overlapping sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(3)
    b.add(4)
    const result = a.union(b)
    expect(result.size).toBe(4)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
    expect(result.has(4)).toBe(true)
  })

  it('union of overlapping sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    const result = a.union(b)
    expect(result.size).toBe(3)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('union of set with empty set', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    const result = a.union(b)
    expect(result.size).toBe(2)
  })

  it('union with different universe sizes uses larger', () => {
    const a = new SparseSet(5)
    a.add(1)
    const b = new SparseSet(15)
    b.add(10)
    const result = a.union(b)
    expect(result.universeSize).toBe(15)
    expect(result.has(1)).toBe(true)
    expect(result.has(10)).toBe(true)
  })
})

// ─── Intersection ────────────────────────────────────────
describe('SparseSet - intersection', () => {
  it('intersection of overlapping sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.intersection(b)
    expect(result.size).toBe(2)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
    expect(result.has(1)).toBe(false)
  })

  it('intersection of non-overlapping sets is empty', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(3)
    b.add(4)
    const result = a.intersection(b)
    expect(result.size).toBe(0)
    expect(result.isEmpty).toBe(true)
  })

  it('intersection with empty set is empty', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    const result = a.intersection(b)
    expect(result.size).toBe(0)
  })

  it('intersection of identical sets returns same elements', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    b.add(3)
    const result = a.intersection(b)
    expect(result.size).toBe(3)
  })
})

// ─── Difference ──────────────────────────────────────────
describe('SparseSet - difference', () => {
  it('difference of overlapping sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.difference(b)
    expect(result.size).toBe(1)
    expect(result.has(1)).toBe(true)
  })

  it('difference with empty set returns original', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    const result = a.difference(b)
    expect(result.size).toBe(2)
  })

  it('difference of identical sets is empty', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    const result = a.difference(b)
    expect(result.size).toBe(0)
  })

  it('difference is not symmetric', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    expect(a.difference(b).size).toBe(1)
    expect(b.difference(a).size).toBe(1)
    expect(a.difference(b).has(1)).toBe(true)
    expect(b.difference(a).has(3)).toBe(true)
  })

  it('symmetricDifference returns items in either set but not both', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.symmetricDifference(b)
    expect(result.has(1)).toBe(true)
    expect(result.has(4)).toBe(true)
    expect(result.has(2)).toBe(false)
    expect(result.has(3)).toBe(false)
    expect(result.size).toBe(2)
  })

  it('symmetricDifference of identical sets is empty', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    expect(a.symmetricDifference(b).size).toBe(0)
  })

  it('symmetricDifference with empty set returns original', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    const result = a.symmetricDifference(b)
    expect(result.size).toBe(2)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
  })
})

// ─── Subset and superset ─────────────────────────────────
describe('SparseSet - subset and superset', () => {
  it('isSubsetOf returns true for subset', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.isSubsetOf(b)).toBe(true)
  })

  it('isSubsetOf returns false for non-subset', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(4)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.isSubsetOf(b)).toBe(false)
  })

  it('isSubsetOf returns true for equal sets', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    expect(a.isSubsetOf(b)).toBe(true)
  })

  it('isSubsetOf returns false when this is larger', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    expect(a.isSubsetOf(b)).toBe(false)
  })

  it('isSupersetOf returns true for superset', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    expect(a.isSupersetOf(b)).toBe(true)
  })

  it('isSupersetOf returns false for non-superset', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.isSupersetOf(b)).toBe(false)
  })
})

// ─── Equals ──────────────────────────────────────────────
describe('SparseSet - equals', () => {
  it('equal sets return true', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SparseSet(10)
    b.add(3)
    b.add(2)
    b.add(1)
    expect(a.equals(b)).toBe(true)
  })

  it('different sizes return false', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.equals(b)).toBe(false)
  })

  it('same size different elements return false', () => {
    const a = new SparseSet(10)
    a.add(1)
    a.add(2)
    const b = new SparseSet(10)
    b.add(3)
    b.add(4)
    expect(a.equals(b)).toBe(false)
  })

  it('empty sets are equal', () => {
    const a = new SparseSet(10)
    const b = new SparseSet(10)
    expect(a.equals(b)).toBe(true)
  })
})

// ─── Clone ───────────────────────────────────────────────
describe('SparseSet - clone', () => {
  it('clones all elements', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(3)
    s.add(5)
    const c = s.clone()
    expect(c.size).toBe(3)
    expect(c.has(1)).toBe(true)
    expect(c.has(3)).toBe(true)
    expect(c.has(5)).toBe(true)
  })

  it('clone is independent from original', () => {
    const s = new SparseSet(10)
    s.add(1)
    s.add(2)
    const c = s.clone()
    c.remove(1)
    expect(s.has(1)).toBe(true)
    expect(c.has(1)).toBe(false)
  })

  it('clone preserves universeSize', () => {
    const s = new SparseSet(20)
    s.add(5)
    const c = s.clone()
    expect(c.universeSize).toBe(20)
  })

  it('clone of empty set', () => {
    const s = new SparseSet(10)
    const c = s.clone()
    expect(c.size).toBe(0)
    expect(c.isEmpty).toBe(true)
  })
})

// ─── Large scale ─────────────────────────────────────────
describe('SparseSet - large scale', () => {
  it('handles 1000+ elements', () => {
    const s = new SparseSet(2000)
    for (let i = 0; i < 1000; i++) {
      s.add(i * 2)
    }
    expect(s.size).toBe(1000)
    expect(s.has(0)).toBe(true)
    expect(s.has(1998)).toBe(true)
    expect(s.has(1)).toBe(false)
  })

  it('handles add/remove cycles', () => {
    const s = new SparseSet(100)
    for (let i = 0; i < 50; i++) {
      s.add(i)
    }
    for (let i = 0; i < 50; i += 2) {
      s.remove(i)
    }
    expect(s.size).toBe(25)
    for (let i = 0; i < 50; i += 2) {
      expect(s.has(i)).toBe(false)
    }
    for (let i = 1; i < 50; i += 2) {
      expect(s.has(i)).toBe(true)
    }
  })
})
