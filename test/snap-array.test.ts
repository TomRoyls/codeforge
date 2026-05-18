import { describe, it, expect } from 'vitest'
import { SnapArray } from '../src/core/snap-array/index.js'

// ─── Constructor ───
describe('SnapArray constructor', () => {
  it('creates empty array', () => {
    const sa = new SnapArray<number>()
    expect(sa.length).toBe(0)
    expect(sa.isEmpty).toBe(true)
  })

  it('creates from array', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.length).toBe(3)
    expect(sa.isEmpty).toBe(false)
  })

  it('static fromArray', () => {
    const sa = SnapArray.fromArray([1, 2])
    expect(sa.length).toBe(2)
  })
})

// ─── Get / Set ───
describe('SnapArray get and set', () => {
  it('gets element at index', () => {
    const sa = new SnapArray([10, 20, 30])
    expect(sa.get(0)).toBe(10)
    expect(sa.get(2)).toBe(30)
  })

  it('throws on out of bounds get', () => {
    const sa = new SnapArray([1])
    expect(() => sa.get(5)).toThrow(RangeError)
    expect(() => sa.get(-1)).toThrow(RangeError)
  })

  it('set returns new SnapArray', () => {
    const sa = new SnapArray([1, 2, 3])
    const sb = sa.set(1, 99)
    expect(sa.get(1)).toBe(2)
    expect(sb.get(1)).toBe(99)
  })
})

// ─── Push / Pop ───
describe('SnapArray push and pop', () => {
  it('push returns new array', () => {
    const sa = new SnapArray([1, 2])
    const sb = sa.push(3)
    expect(sa.length).toBe(2)
    expect(sb.length).toBe(3)
    expect(sb.get(2)).toBe(3)
  })

  it('pop returns [newArray, value]', () => {
    const sa = new SnapArray([1, 2, 3])
    const [sb, val] = sa.pop()
    expect(val).toBe(3)
    expect(sb.length).toBe(2)
    expect(sa.length).toBe(3)
  })

  it('throws pop on empty', () => {
    const sa = new SnapArray<number>()
    expect(() => sa.pop()).toThrow(RangeError)
  })
})

// ─── Insert / Remove ───
describe('SnapArray insert and remove', () => {
  it('insert returns new array with element', () => {
    const sa = new SnapArray([1, 3])
    const sb = sa.insert(1, 2)
    expect(sb.toArray()).toEqual([1, 2, 3])
  })

  it('remove returns new array without element', () => {
    const sa = new SnapArray([1, 2, 3])
    const sb = sa.remove(1)
    expect(sb.toArray()).toEqual([1, 3])
  })

  it('throws on invalid insert index', () => {
    const sa = new SnapArray([1])
    expect(() => sa.insert(-1, 0)).toThrow(RangeError)
    expect(() => sa.insert(5, 0)).toThrow(RangeError)
  })

  it('throws on invalid remove index', () => {
    const sa = new SnapArray([1])
    expect(() => sa.remove(5)).toThrow(RangeError)
  })
})

// ─── Functional Methods ───
describe('SnapArray functional methods', () => {
  it('map transforms elements', () => {
    const sa = new SnapArray([1, 2, 3])
    const sb = sa.map((v) => v * 2)
    expect(sb.toArray()).toEqual([2, 4, 6])
  })

  it('filter selects elements', () => {
    const sa = new SnapArray([1, 2, 3, 4])
    const sb = sa.filter((v) => v % 2 === 0)
    expect(sb.toArray()).toEqual([2, 4])
  })

  it('reduce accumulates', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.reduce((acc, v) => acc + v, 0)).toBe(6)
  })

  it('find returns first match', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.find((v) => v > 1)).toBe(2)
    expect(sa.find((v) => v > 10)).toBeUndefined()
  })

  it('findIndex returns index', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.findIndex((v) => v === 2)).toBe(1)
    expect(sa.findIndex((v) => v > 10)).toBe(-1)
  })

  it('every checks all', () => {
    const sa = new SnapArray([2, 4, 6])
    expect(sa.every((v) => v % 2 === 0)).toBe(true)
    expect(sa.every((v) => v > 5)).toBe(false)
  })

  it('some checks any', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.some((v) => v > 2)).toBe(true)
    expect(sa.some((v) => v > 10)).toBe(false)
  })

  it('indexOf and includes', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.indexOf(2)).toBe(1)
    expect(sa.indexOf(99)).toBe(-1)
    expect(sa.includes(2)).toBe(true)
    expect(sa.includes(99)).toBe(false)
  })
})

// ─── Slice / Concat / Reverse / Sort / Join ───
describe('SnapArray slice, concat, reverse, sort, join', () => {
  it('slice returns subarray', () => {
    const sa = new SnapArray([1, 2, 3, 4])
    expect(sa.slice(1, 3).toArray()).toEqual([2, 3])
  })

  it('concat merges arrays', () => {
    const sa = new SnapArray([1, 2])
    const sb = sa.concat(new SnapArray([3, 4]))
    expect(sb.toArray()).toEqual([1, 2, 3, 4])
  })

  it('reverse returns reversed', () => {
    const sa = new SnapArray([1, 2, 3])
    expect(sa.reverse().toArray()).toEqual([3, 2, 1])
  })

  it('sort returns sorted', () => {
    const sa = new SnapArray([3, 1, 2])
    expect(sa.sort().toArray()).toEqual([1, 2, 3])
  })

  it('join returns string', () => {
    const sa = new SnapArray(['a', 'b', 'c'])
    expect(sa.join(',')).toBe('a,b,c')
  })
})

// ─── First / Last ───
describe('SnapArray first and last', () => {
  it('first and last return elements', () => {
    const sa = new SnapArray([10, 20, 30])
    expect(sa.first()).toBe(10)
    expect(sa.last()).toBe(30)
  })

  it('throws on empty', () => {
    const sa = new SnapArray<number>()
    expect(() => sa.first()).toThrow(RangeError)
    expect(() => sa.last()).toThrow(RangeError)
  })
})

// ─── Snapshot / Restore / Clone ───
describe('SnapArray snapshot, restore, clone', () => {
  it('snapshot and restore', () => {
    const sa = new SnapArray([1, 2, 3])
    const snap = sa.snapshot()
    const sb = sa.push(4)
    const sc = new SnapArray<number>().restore(snap)
    expect(sc.toArray()).toEqual([1, 2, 3])
    expect(sb.toArray()).toEqual([1, 2, 3, 4])
  })

  it('clone produces copy', () => {
    const sa = new SnapArray([1, 2])
    const sb = sa.clone()
    expect(sb.toArray()).toEqual([1, 2])
  })

  it('toArray returns copy', () => {
    const sa = new SnapArray([1, 2])
    const arr = sa.toArray()
    expect(arr).toEqual([1, 2])
  })
})

// ─── Iteration ───
describe('SnapArray iteration', () => {
  it('forEach iterates', () => {
    const sa = new SnapArray([10, 20])
    const vals: number[] = []
    sa.forEach((v) => vals.push(v))
    expect(vals).toEqual([10, 20])
  })

  it('Symbol.iterator works', () => {
    const sa = new SnapArray([1, 2, 3])
    expect([...sa]).toEqual([1, 2, 3])
  })
})
