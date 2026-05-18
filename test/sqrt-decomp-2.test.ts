import { describe, expect, it } from 'vitest'

import { SqrtDecomp2 } from '../src/core/sqrt-decomp-2/index.js'

// ─── Construction ──────────────────────────────────────
describe('SqrtDecomp2 construction', () => {
  it('creates from array', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5])
    expect(sd.size).toBe(5)
    expect(sd.isEmpty).toBe(false)
  })

  it('creates empty structure', () => {
    const sd = new SqrtDecomp2<number>([])
    expect(sd.size).toBe(0)
    expect(sd.isEmpty).toBe(true)
  })

  it('fromArray static method', () => {
    const sd = SqrtDecomp2.fromArray([1, 2, 3])
    expect(sd.size).toBe(3)
  })

  it('custom blockSize', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5, 6], { blockSize: 2 })
    expect(sd.blockSize).toBe(2)
  })
})

// ─── Query ─────────────────────────────────────────────
describe('SqrtDecomp2 query', () => {
  it('returns sum over range', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5])
    expect(sd.query(0, 5)).toBe(15)
  })

  it('returns sum over partial range', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5])
    expect(sd.query(1, 4)).toBe(9)
  })

  it('returns identity for empty range', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(sd.query(1, 1)).toBe(0)
  })

  it('single element range', () => {
    const sd = new SqrtDecomp2([10, 20, 30])
    expect(sd.query(1, 2)).toBe(20)
  })

  it('throws for invalid range', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(() => sd.query(-1, 2)).toThrow(RangeError)
    expect(() => sd.query(3, 1)).toThrow(RangeError)
  })

  it('sum method returns total sum', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5])
    expect(sd.sum()).toBe(15)
  })
})

// ─── Update & Get ──────────────────────────────────────
describe('SqrtDecomp2 update and get', () => {
  it('updates element at index', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.get(2)).toBe(10)
  })

  it('set is alias for update', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    sd.set(0, 99)
    expect(sd.get(0)).toBe(99)
  })

  it('throws for out of bounds update', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(() => sd.update(5, 1)).toThrow(RangeError)
  })

  it('throws for out of bounds get', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(() => sd.get(5)).toThrow(RangeError)
  })
})

// ─── RangeAdd ──────────────────────────────────────────
describe('SqrtDecomp2 rangeAdd', () => {
  it('adds value to range', () => {
    const sd = new SqrtDecomp2([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 3, 10)
    expect(sd.toArray()).toEqual([11, 12, 13, 4, 5])
  })

  it('rangeAdd with full range', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    sd.rangeAdd(0, 3, 1)
    expect(sd.toArray()).toEqual([2, 3, 4])
  })

  it('throws for invalid range', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(() => sd.rangeAdd(-1, 2, 1)).toThrow(RangeError)
    expect(() => sd.rangeAdd(2, 1, 1)).toThrow(RangeError)
  })
})

// ─── ToArray & Clone ───────────────────────────────────
describe('SqrtDecomp2 toArray and clone', () => {
  it('toArray returns current state', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(sd.toArray()).toEqual([1, 2, 3])
  })

  it('clone creates independent copy', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    const cloned = sd.clone()
    sd.update(0, 99)
    expect(cloned.get(0)).toBe(1)
  })
})

// ─── Push & Pop ────────────────────────────────────────
describe('SqrtDecomp2 push and pop', () => {
  it('push adds element', () => {
    const sd = new SqrtDecomp2([1, 2])
    sd.push(3)
    expect(sd.size).toBe(3)
    expect(sd.get(2)).toBe(3)
  })

  it('pop removes last element', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect(sd.pop()).toBe(3)
    expect(sd.size).toBe(2)
  })

  it('pop throws on empty', () => {
    const sd = new SqrtDecomp2<number>([])
    expect(() => sd.pop()).toThrow(RangeError)
  })
})

// ─── First, Last, Min, Max ────────────────────────────
describe('SqrtDecomp2 first last min max', () => {
  it('first returns first element', () => {
    const sd = new SqrtDecomp2([10, 20, 30])
    expect(sd.first()).toBe(10)
  })

  it('last returns last element', () => {
    const sd = new SqrtDecomp2([10, 20, 30])
    expect(sd.last()).toBe(30)
  })

  it('min returns minimum', () => {
    const sd = new SqrtDecomp2([30, 10, 20])
    expect(sd.min()).toBe(10)
  })

  it('max returns maximum', () => {
    const sd = new SqrtDecomp2([10, 30, 20])
    expect(sd.max()).toBe(30)
  })

  it('throws on empty for first/last/min/max', () => {
    const sd = new SqrtDecomp2<number>([])
    expect(() => sd.first()).toThrow(RangeError)
    expect(() => sd.last()).toThrow(RangeError)
    expect(() => sd.min()).toThrow(RangeError)
    expect(() => sd.max()).toThrow(RangeError)
  })
})

// ─── IndexOf ───────────────────────────────────────────
describe('SqrtDecomp2 indexOf', () => {
  it('returns index of value', () => {
    const sd = new SqrtDecomp2([10, 20, 30])
    expect(sd.indexOf(20)).toBe(1)
  })

  it('returns -1 for missing value', () => {
    const sd = new SqrtDecomp2([10, 20, 30])
    expect(sd.indexOf(99)).toBe(-1)
  })
})

// ─── Iteration & ForEach ───────────────────────────────
describe('SqrtDecomp2 iteration', () => {
  it('is iterable', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    expect([...sd]).toEqual([1, 2, 3])
  })

  it('forEach iterates', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    const result: number[] = []
    sd.forEach((v) => result.push(v))
    expect(result).toEqual([1, 2, 3])
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SqrtDecomp2 clear', () => {
  it('clears the structure', () => {
    const sd = new SqrtDecomp2([1, 2, 3])
    sd.clear()
    expect(sd.size).toBe(0)
    expect(sd.isEmpty).toBe(true)
  })
})
