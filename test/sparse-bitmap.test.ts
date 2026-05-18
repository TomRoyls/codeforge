import { describe, expect, it } from 'vitest'

import { SparseBitmap } from '../src/core/sparse-bitmap/index.js'

// ─── Construction ──────────────────────────────────────
describe('SparseBitmap construction', () => {
  it('creates empty bitmap', () => {
    const bm = new SparseBitmap()
    expect(bm.isEmpty).toBe(true)
    expect(bm.size).toBe(0)
    expect(bm.cardinality).toBe(0)
  })
})

// ─── Set & Get ─────────────────────────────────────────
describe('SparseBitmap set and get', () => {
  it('sets and gets bits', () => {
    const bm = new SparseBitmap()
    bm.set(0)
    bm.set(5)
    bm.set(100)
    expect(bm.get(0)).toBe(true)
    expect(bm.get(5)).toBe(true)
    expect(bm.get(100)).toBe(true)
    expect(bm.get(1)).toBe(false)
    expect(bm.get(99)).toBe(false)
  })

  it('ignores negative bit positions', () => {
    const bm = new SparseBitmap()
    bm.set(-1)
    expect(bm.get(-1)).toBe(false)
  })

  it('has is alias for get', () => {
    const bm = new SparseBitmap()
    bm.set(10)
    expect(bm.has(10)).toBe(true)
    expect(bm.has(11)).toBe(false)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SparseBitmap clear', () => {
  it('clears a specific bit', () => {
    const bm = new SparseBitmap()
    bm.set(5)
    bm.set(10)
    bm.clear(5)
    expect(bm.get(5)).toBe(false)
    expect(bm.get(10)).toBe(true)
  })

  it('clears all bits', () => {
    const bm = new SparseBitmap()
    bm.set(1)
    bm.set(2)
    bm.clear()
    expect(bm.isEmpty).toBe(true)
    expect(bm.cardinality).toBe(0)
  })

  it('ignores clear of negative bit', () => {
    const bm = new SparseBitmap()
    bm.set(5)
    bm.clear(-1)
    expect(bm.get(5)).toBe(true)
  })

  it('removes empty chunk', () => {
    const bm = new SparseBitmap()
    bm.set(3)
    bm.clear(3)
    expect(bm.size).toBe(0)
  })
})

// ─── Flip ──────────────────────────────────────────────
describe('SparseBitmap flip', () => {
  it('flips bits', () => {
    const bm = new SparseBitmap()
    bm.set(5)
    bm.flip(5)
    expect(bm.get(5)).toBe(false)
    bm.flip(5)
    expect(bm.get(5)).toBe(true)
  })

  it('ignores negative flip', () => {
    const bm = new SparseBitmap()
    bm.flip(-1)
    expect(bm.cardinality).toBe(0)
  })
})

// ─── Range Operations ──────────────────────────────────
describe('SparseBitmap range operations', () => {
  it('setRange sets a range of bits', () => {
    const bm = new SparseBitmap()
    bm.setRange(3, 7)
    expect(bm.get(2)).toBe(false)
    for (let i = 3; i <= 7; i++) expect(bm.get(i)).toBe(true)
    expect(bm.get(8)).toBe(false)
    expect(bm.cardinality).toBe(5)
  })

  it('setRange ignores invalid ranges', () => {
    const bm = new SparseBitmap()
    bm.setRange(-1, 5)
    expect(bm.cardinality).toBe(0)
    bm.setRange(5, 3)
    expect(bm.cardinality).toBe(0)
  })

  it('clearRange clears a range of bits', () => {
    const bm = new SparseBitmap()
    bm.setRange(0, 10)
    bm.clearRange(3, 7)
    expect(bm.cardinality).toBe(6)
    expect(bm.get(5)).toBe(false)
  })
})

// ─── Cardinality ───────────────────────────────────────
describe('SparseBitmap cardinality', () => {
  it('counts set bits correctly', () => {
    const bm = new SparseBitmap()
    bm.set(0)
    bm.set(32)
    bm.set(64)
    expect(bm.cardinality).toBe(3)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('SparseBitmap toArray', () => {
  it('returns sorted set bit positions', () => {
    const bm = new SparseBitmap()
    bm.set(10)
    bm.set(5)
    bm.set(20)
    expect(bm.toArray()).toEqual([5, 10, 20])
  })

  it('returns empty array for empty bitmap', () => {
    const bm = new SparseBitmap()
    expect(bm.toArray()).toEqual([])
  })
})

// ─── ForEach ───────────────────────────────────────────
describe('SparseBitmap forEach', () => {
  it('iterates over all set bits', () => {
    const bm = new SparseBitmap()
    bm.set(1)
    bm.set(3)
    bm.set(5)
    const result: number[] = []
    bm.forEach((bit) => result.push(bit))
    expect(result).toEqual([1, 3, 5])
  })
})

// ─── Bitwise Operations ────────────────────────────────
describe('SparseBitmap bitwise operations', () => {
  it('and returns intersection', () => {
    const a = new SparseBitmap()
    a.set(1)
    a.set(2)
    a.set(3)
    const b = new SparseBitmap()
    b.set(2)
    b.set(3)
    b.set(4)
    const result = a.and(b)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('or returns union', () => {
    const a = new SparseBitmap()
    a.set(1)
    a.set(2)
    const b = new SparseBitmap()
    b.set(2)
    b.set(3)
    expect(a.or(b).toArray()).toEqual([1, 2, 3])
  })

  it('xor returns symmetric difference', () => {
    const a = new SparseBitmap()
    a.set(1)
    a.set(2)
    const b = new SparseBitmap()
    b.set(2)
    b.set(3)
    expect(a.xor(b).toArray()).toEqual([1, 3])
  })

  it('not inverts bits up to maxBit', () => {
    const a = new SparseBitmap()
    a.set(1)
    a.set(3)
    const result = a.not(4)
    expect(result.toArray()).toEqual([0, 2, 4])
  })
})

// ─── Clone & Equals ────────────────────────────────────
describe('SparseBitmap clone and equals', () => {
  it('clones the bitmap', () => {
    const bm = new SparseBitmap()
    bm.set(1)
    bm.set(2)
    const cloned = bm.clone()
    expect(cloned.equals(bm)).toBe(true)
    bm.clear(1)
    expect(cloned.get(1)).toBe(true)
  })

  it('equals returns false for different bitmaps', () => {
    const a = new SparseBitmap()
    a.set(1)
    const b = new SparseBitmap()
    b.set(2)
    expect(a.equals(b)).toBe(false)
  })
})

// ─── Subset & Intersects ──────────────────────────────
describe('SparseBitmap subset and intersects', () => {
  it('isSubsetOf returns true for subset', () => {
    const a = new SparseBitmap()
    a.set(1)
    a.set(2)
    const b = new SparseBitmap()
    b.set(1)
    b.set(2)
    b.set(3)
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('intersects returns true for overlapping bitmaps', () => {
    const a = new SparseBitmap()
    a.set(1)
    a.set(2)
    const b = new SparseBitmap()
    b.set(2)
    b.set(3)
    expect(a.intersects(b)).toBe(true)
  })

  it('intersects returns false for non-overlapping', () => {
    const a = new SparseBitmap()
    a.set(1)
    const b = new SparseBitmap()
    b.set(2)
    expect(a.intersects(b)).toBe(false)
  })
})
