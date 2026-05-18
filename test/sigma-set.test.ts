import { describe, it, expect } from 'vitest'
import { SigmaSet } from '../src/core/sigma-set/index.js'

// ─── Constructor ───
describe('SigmaSet constructor', () => {
  it('creates set with universe size', () => {
    const s = new SigmaSet({ universeSize: 64 })
    expect(s.universeSize).toBe(64)
    expect(s.size).toBe(0)
    expect(s.isEmpty).toBe(true)
  })

  it('creates with universeSize 0', () => {
    const s = new SigmaSet({ universeSize: 0 })
    expect(s.universeSize).toBe(0)
  })

  it('throws on negative universeSize', () => {
    expect(() => new SigmaSet({ universeSize: -1 })).toThrow(RangeError)
  })
})

// ─── Add / Delete / Has ───
describe('SigmaSet add, delete, has', () => {
  it('adds and checks membership', () => {
    const s = new SigmaSet({ universeSize: 64 })
    expect(s.add(5)).toBe(true)
    expect(s.has(5)).toBe(true)
    expect(s.has(6)).toBe(false)
    expect(s.size).toBe(1)
  })

  it('add returns false for duplicate', () => {
    const s = new SigmaSet({ universeSize: 64 })
    s.add(5)
    expect(s.add(5)).toBe(false)
    expect(s.size).toBe(1)
  })

  it('deletes element', () => {
    const s = new SigmaSet({ universeSize: 64 })
    s.add(5)
    expect(s.delete(5)).toBe(true)
    expect(s.has(5)).toBe(false)
    expect(s.size).toBe(0)
  })

  it('delete returns false for missing', () => {
    const s = new SigmaSet({ universeSize: 64 })
    expect(s.delete(5)).toBe(false)
  })

  it('throws on out of bounds add', () => {
    const s = new SigmaSet({ universeSize: 10 })
    expect(() => s.add(10)).toThrow(RangeError)
    expect(() => s.add(-1)).toThrow(RangeError)
  })

  it('has returns false for out of bounds', () => {
    const s = new SigmaSet({ universeSize: 10 })
    expect(s.has(10)).toBe(false)
    expect(s.has(-1)).toBe(false)
  })

  it('contains is alias for has', () => {
    const s = new SigmaSet({ universeSize: 64 })
    s.add(5)
    expect(s.contains(5)).toBe(true)
  })
})

// ─── Clear / Clone / Fill ───
describe('SigmaSet clear, clone, fill', () => {
  it('clear empties the set', () => {
    const s = new SigmaSet({ universeSize: 64 })
    s.add(5)
    s.clear()
    expect(s.size).toBe(0)
  })

  it('clone produces independent copy', () => {
    const s = new SigmaSet({ universeSize: 64 })
    s.add(5)
    const c = s.clone()
    c.add(10)
    expect(s.has(10)).toBe(false)
    expect(c.has(10)).toBe(true)
  })

  it('fill adds all elements', () => {
    const s = new SigmaSet({ universeSize: 10 })
    s.fill()
    expect(s.size).toBe(10)
  })

  it('static fromArray', () => {
    const s = SigmaSet.fromArray([1, 3, 5], { universeSize: 10 })
    expect(s.size).toBe(3)
    expect(s.has(1)).toBe(true)
  })
})

// ─── Min / Max / Next / Prev ───
describe('SigmaSet min, max, next, prev', () => {
  it('min and max', () => {
    const s = new SigmaSet({ universeSize: 100 })
    s.add(10)
    s.add(50)
    s.add(90)
    expect(s.min()).toBe(10)
    expect(s.max()).toBe(90)
  })

  it('min and max throw on empty', () => {
    const s = new SigmaSet({ universeSize: 10 })
    expect(() => s.min()).toThrow(RangeError)
    expect(() => s.max()).toThrow(RangeError)
  })

  it('next returns next element', () => {
    const s = new SigmaSet({ universeSize: 100 })
    s.add(10)
    s.add(20)
    expect(s.next(10)).toBe(10)
    expect(s.next(11)).toBe(20)
    expect(s.next(21)).toBe(-1)
  })

  it('prev returns previous element', () => {
    const s = new SigmaSet({ universeSize: 100 })
    s.add(10)
    s.add(20)
    expect(s.prev(20)).toBe(20)
    expect(s.prev(15)).toBe(10)
    expect(s.prev(9)).toBe(-1)
  })
})

// ─── Count / Range ───
describe('SigmaSet countRange and range', () => {
  it('countRange counts elements', () => {
    const s = new SigmaSet({ universeSize: 100 })
    s.add(10)
    s.add(20)
    s.add(30)
    expect(s.countRange(10, 30)).toBe(3)
  })

  it('range returns elements', () => {
    const s = new SigmaSet({ universeSize: 100 })
    s.add(10)
    s.add(20)
    s.add(30)
    expect(s.range(10, 20)).toEqual([10, 20])
  })

  it('throws on invalid range', () => {
    const s = new SigmaSet({ universeSize: 10 })
    expect(() => s.countRange(5, 3)).toThrow(RangeError)
  })
})

// ─── Set Operations ───
describe('SigmaSet set operations', () => {
  const make = (items: number[]) => {
    const s = new SigmaSet({ universeSize: 64 })
    for (const i of items) s.add(i)
    return s
  }

  it('union', () => {
    const a = make([1, 2, 3])
    const b = make([2, 3, 4])
    expect(a.union(b).toArray()).toEqual([1, 2, 3, 4])
  })

  it('intersection', () => {
    const a = make([1, 2, 3])
    const b = make([2, 3, 4])
    expect(a.intersection(b).toArray()).toEqual([2, 3])
  })

  it('difference', () => {
    const a = make([1, 2, 3])
    const b = make([2, 3, 4])
    expect(a.difference(b).toArray()).toEqual([1])
  })

  it('complement', () => {
    const s = make([1])
    const c = s.complement()
    expect(c.has(1)).toBe(false)
    expect(c.has(0)).toBe(true)
  })

  it('isSubsetOf', () => {
    const a = make([1, 2])
    const b = make([1, 2, 3])
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('isSupersetOf', () => {
    const a = make([1, 2, 3])
    const b = make([1, 2])
    expect(a.isSupersetOf(b)).toBe(true)
  })

  it('equals', () => {
    const a = make([1, 2])
    const b = make([1, 2])
    expect(a.equals(b)).toBe(true)
  })

  it('intersects', () => {
    const a = make([1, 2])
    const b = make([2, 3])
    expect(a.intersects(b)).toBe(true)
  })

  it('throws on mismatched universe sizes', () => {
    const a = new SigmaSet({ universeSize: 32 })
    const b = new SigmaSet({ universeSize: 64 })
    expect(() => a.union(b)).toThrow(RangeError)
  })
})

// ─── Iteration / toString / density ───
describe('SigmaSet iteration, toString, density', () => {
  it('forEach iterates', () => {
    const s = new SigmaSet({ universeSize: 10 })
    s.add(1)
    s.add(3)
    const items: number[] = []
    s.forEach((v) => items.push(v))
    expect(items).toEqual([1, 3])
  })

  it('Symbol.iterator works', () => {
    const s = new SigmaSet({ universeSize: 10 })
    s.add(1)
    s.add(2)
    expect([...s]).toEqual([1, 2])
  })

  it('toArray', () => {
    const s = new SigmaSet({ universeSize: 10 })
    s.add(3)
    s.add(1)
    expect(s.toArray()).toEqual([1, 3])
  })

  it('toString', () => {
    const s = new SigmaSet({ universeSize: 5 })
    s.add(1)
    s.add(3)
    expect(s.toString()).toBe('01010')
  })

  it('density', () => {
    const s = new SigmaSet({ universeSize: 10 })
    expect(s.density()).toBe(0)
    s.add(1)
    expect(s.density()).toBe(0.1)
  })
})
