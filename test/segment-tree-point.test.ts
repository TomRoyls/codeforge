import { describe, it, expect } from 'vitest'
import { SegmentTreePoint } from '../src/core/segment-tree-point/index.js'

// ─── Constructor and Query ───
describe('SegmentTreePoint constructor and query', () => {
  it('builds from array', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4])
    expect(st.size).toBe(4)
    expect(st.isEmpty).toBe(false)
  })

  it('handles empty array', () => {
    const st = new SegmentTreePoint<number>([])
    expect(st.size).toBe(0)
    expect(st.isEmpty).toBe(true)
  })

  it('queries sum range', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(0, 4)).toBe(15)
    expect(st.query(1, 2)).toBe(5)
  })

  it('queryAll returns total', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(st.queryAll()).toBe(6)
  })

  it('queryAll on empty returns identity', () => {
    const st = new SegmentTreePoint<number>([])
    expect(st.queryAll()).toBe(0)
  })

  it('throws on invalid query range', () => {
    const st = new SegmentTreePoint([1, 2])
    expect(() => st.query(-1, 1)).toThrow(RangeError)
    expect(() => st.query(0, 5)).toThrow(RangeError)
    expect(() => st.query(2, 1)).toThrow(RangeError)
  })

  it('throws on query empty tree', () => {
    const st = new SegmentTreePoint<number>([])
    expect(() => st.query(0, 1)).toThrow(RangeError)
  })
})

// ─── Point Update ───
describe('SegmentTreePoint point update', () => {
  it('updates value', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 10)
    expect(st.pointQuery(1)).toBe(10)
    expect(st.query(0, 2)).toBe(14)
  })

  it('throws on invalid index', () => {
    const st = new SegmentTreePoint([1, 2])
    expect(() => st.update(-1, 5)).toThrow(RangeError)
    expect(() => st.update(5, 5)).toThrow(RangeError)
  })
})

// ─── pointQuery ───
describe('SegmentTreePoint pointQuery', () => {
  it('returns value at index', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    expect(st.pointQuery(0)).toBe(10)
    expect(st.pointQuery(2)).toBe(30)
  })

  it('throws on invalid index', () => {
    const st = new SegmentTreePoint([1, 2])
    expect(() => st.pointQuery(-1)).toThrow(RangeError)
    expect(() => st.pointQuery(5)).toThrow(RangeError)
  })
})

// ─── Clone / Clear / toArray ───
describe('SegmentTreePoint clone, clear, toArray', () => {
  it('clone produces independent copy', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    const c = st.clone()
    c.update(0, 99)
    expect(st.pointQuery(0)).toBe(1)
  })

  it('clear empties tree', () => {
    const st = new SegmentTreePoint([1, 2])
    st.clear()
    expect(st.isEmpty).toBe(true)
  })

  it('toArray returns copy', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(st.toArray()).toEqual([1, 2, 3])
  })
})

// ─── forEach ───
describe('SegmentTreePoint forEach', () => {
  it('iterates elements', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    const vals: number[] = []
    st.forEach((v) => vals.push(v))
    expect(vals).toEqual([10, 20, 30])
  })
})

// ─── Static Factories ───
describe('SegmentTreePoint static factories', () => {
  it('sum factory', () => {
    const st = SegmentTreePoint.sum([1, 2, 3])
    expect(st.query(0, 2)).toBe(6)
  })

  it('min factory', () => {
    const st = SegmentTreePoint.min([5, 1, 8, 3])
    expect(st.query(0, 3)).toBe(1)
  })

  it('max factory', () => {
    const st = SegmentTreePoint.max([5, 1, 8, 3])
    expect(st.query(0, 3)).toBe(8)
  })

  it('gcd factory', () => {
    const st = SegmentTreePoint.gcd([12, 8, 6])
    expect(st.query(0, 2)).toBe(2)
  })

  it('xor factory', () => {
    const st = SegmentTreePoint.xor([1, 2, 3])
    expect(st.query(0, 2)).toBe(0)
  })

  it('product factory', () => {
    const st = SegmentTreePoint.product([2, 3, 4])
    expect(st.query(0, 2)).toBe(24)
  })

  it('fromArray static', () => {
    const st = SegmentTreePoint.fromArray([1, 2, 3])
    expect(st.queryAll()).toBe(6)
  })
})
