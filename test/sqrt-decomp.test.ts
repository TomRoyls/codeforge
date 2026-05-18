import { describe, expect, it } from 'vitest'

import { SqrtDecomposition } from '../src/core/sqrt-decomp/index.js'

// ─── Construction ──────────────────────────────────────
describe('SqrtDecomposition construction', () => {
  it('creates from array', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.size).toBe(5)
    expect(sd.isEmpty).toBe(false)
  })

  it('creates empty structure', () => {
    const sd = new SqrtDecomposition<number>([])
    expect(sd.size).toBe(0)
    expect(sd.isEmpty).toBe(true)
  })

  it('fromArray static method', () => {
    const sd = SqrtDecomposition.fromArray([1, 2, 3])
    expect(sd.size).toBe(3)
  })

  it('exposes blockCount and blockSize', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.blockSize).toBeGreaterThan(0)
    expect(sd.blockCount).toBeGreaterThan(0)
  })
})

// ─── RangeQuery ────────────────────────────────────────
describe('SqrtDecomposition rangeQuery', () => {
  it('returns sum over range', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(0, 4)).toBe(15)
  })

  it('returns sum over partial range', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(1, 3)).toBe(9)
  })

  it('single element range', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    expect(sd.rangeQuery(1, 1)).toBe(20)
  })

  it('throws for invalid range', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.rangeQuery(-1, 2)).toThrow(RangeError)
    expect(() => sd.rangeQuery(3, 1)).toThrow(RangeError)
  })
})

// ─── PointUpdate & Get ─────────────────────────────────
describe('SqrtDecomposition pointUpdate and get', () => {
  it('updates element at index', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.pointUpdate(2, 10)
    expect(sd.get(2)).toBe(10)
  })

  it('set is alias for pointUpdate', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    sd.set(0, 99)
    expect(sd.get(0)).toBe(99)
  })

  it('throws for out of bounds', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.pointUpdate(5, 1)).toThrow(RangeError)
    expect(() => sd.get(5)).toThrow(RangeError)
  })

  it('query reflects update', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    sd.pointUpdate(1, 10)
    expect(sd.rangeQuery(0, 2)).toBe(14)
  })
})

// ─── RangeUpdate ───────────────────────────────────────
describe('SqrtDecomposition rangeUpdate', () => {
  it('adds value to range', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeUpdate(0, 2, 10)
    expect(sd.toArray()).toEqual([11, 12, 13, 4, 5])
  })

  it('full range update', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    sd.rangeUpdate(0, 2, 1)
    expect(sd.toArray()).toEqual([2, 3, 4])
  })

  it('throws for invalid range', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.rangeUpdate(-1, 2, 1)).toThrow(RangeError)
    expect(() => sd.rangeUpdate(2, 1, 1)).toThrow(RangeError)
  })
})

// ─── ToArray & Clone ───────────────────────────────────
describe('SqrtDecomposition toArray and clone', () => {
  it('toArray returns current state', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(sd.toArray()).toEqual([1, 2, 3])
  })

  it('clone creates independent copy', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    const cloned = sd.clone()
    sd.pointUpdate(0, 99)
    expect(cloned.get(0)).toBe(1)
  })
})

// ─── Push & Pop ────────────────────────────────────────
describe('SqrtDecomposition push and pop', () => {
  it('push adds element', () => {
    const sd = new SqrtDecomposition([1, 2])
    sd.push(3)
    expect(sd.size).toBe(3)
  })

  it('pop removes last element', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(sd.pop()).toBe(3)
    expect(sd.size).toBe(2)
  })

  it('pop throws on empty', () => {
    const sd = new SqrtDecomposition<number>([])
    expect(() => sd.pop()).toThrow(RangeError)
  })
})

// ─── Rebuild ───────────────────────────────────────────
describe('SqrtDecomposition rebuild', () => {
  it('rebuild restructures blocks', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.push(6)
    sd.push(7)
    sd.rebuild()
    expect(sd.size).toBe(7)
    expect(sd.rangeQuery(0, 6)).toBe(28)
  })
})

// ─── Iteration ─────────────────────────────────────────
describe('SqrtDecomposition iteration', () => {
  it('is iterable', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect([...sd]).toEqual([1, 2, 3])
  })

  it('forEach iterates', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    const result: number[] = []
    sd.forEach((v) => result.push(v))
    expect(result).toEqual([1, 2, 3])
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SqrtDecomposition clear', () => {
  it('clears the structure', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    sd.clear()
    expect(sd.size).toBe(0)
    expect(sd.isEmpty).toBe(true)
  })
})
