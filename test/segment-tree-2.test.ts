import { describe, it, expect } from 'vitest'
import { SegmentTree2 } from '../src/core/segment-tree-2/index.js'

// ─── Constructor and Query ───
describe('SegmentTree2 constructor and query', () => {
  it('builds from array', () => {
    const st = new SegmentTree2([1, 2, 3, 4, 5])
    expect(st.size).toBe(5)
    expect(st.isEmpty).toBe(false)
  })

  it('handles empty array', () => {
    const st = new SegmentTree2<number>([])
    expect(st.size).toBe(0)
    expect(st.isEmpty).toBe(true)
  })

  it('queries range sum', () => {
    const st = new SegmentTree2([1, 2, 3, 4, 5])
    expect(st.query(0, 5)).toBe(15)
    expect(st.query(1, 3)).toBe(5)
    expect(st.query(0, 1)).toBe(1)
  })

  it('throws on invalid query range', () => {
    const st = new SegmentTree2([1, 2, 3])
    expect(() => st.query(-1, 2)).toThrow(RangeError)
    expect(() => st.query(0, 10)).toThrow(RangeError)
  })

  it('throws on query empty tree', () => {
    const st = new SegmentTree2<number>([])
    expect(() => st.query(0, 1)).toThrow(RangeError)
  })
})

// ─── Point Update ───
describe('SegmentTree2 point update', () => {
  it('updates single value', () => {
    const st = new SegmentTree2([1, 2, 3])
    st.update(1, 10)
    expect(st.get(1)).toBe(10)
    expect(st.query(0, 3)).toBe(14)
  })

  it('set is alias for update', () => {
    const st = new SegmentTree2([1, 2, 3])
    st.set(0, 99)
    expect(st.get(0)).toBe(99)
  })

  it('throws on invalid index', () => {
    const st = new SegmentTree2([1, 2])
    expect(() => st.update(-1, 5)).toThrow(RangeError)
    expect(() => st.update(5, 5)).toThrow(RangeError)
  })
})

// ─── Range Update ───
describe('SegmentTree2 range update', () => {
  it('updates range', () => {
    const st = new SegmentTree2([1, 2, 3, 4, 5])
    st.rangeUpdate(0, 3, 10)
    expect(st.toArray()).toEqual([11, 12, 13, 4, 5])
  })

  it('handles zero-length range update', () => {
    const st = new SegmentTree2([1, 2, 3])
    st.rangeUpdate(1, 1, 10)
    expect(st.toArray()).toEqual([1, 2, 3])
  })
})

// ─── Get / First / Last ───
describe('SegmentTree2 get, first, last', () => {
  it('get returns value at index', () => {
    const st = new SegmentTree2([10, 20, 30])
    expect(st.get(0)).toBe(10)
    expect(st.get(2)).toBe(30)
  })

  it('first and last', () => {
    const st = new SegmentTree2([10, 20, 30])
    expect(st.first()).toBe(10)
    expect(st.last()).toBe(30)
  })

  it('throws first/last on empty', () => {
    const st = new SegmentTree2<number>([])
    expect(() => st.first()).toThrow(RangeError)
    expect(() => st.last()).toThrow(RangeError)
  })
})

// ─── Min / Max / Sum ───
describe('SegmentTree2 min, max, sum', () => {
  it('min and max', () => {
    const st = new SegmentTree2([5, 1, 8, 3])
    expect(st.min()).toBe(1)
    expect(st.max()).toBe(8)
  })

  it('sum returns total', () => {
    const st = new SegmentTree2([1, 2, 3])
    expect(st.sum()).toBe(6)
  })

  it('sum on empty returns identity', () => {
    const st = new SegmentTree2<number>([])
    expect(st.sum()).toBe(0)
  })

  it('prefixSum', () => {
    const st = new SegmentTree2([1, 2, 3, 4])
    expect(st.prefixSum(2)).toBe(3)
    expect(st.prefixSum(0)).toBe(0)
  })
})

// ─── indexOf ───
describe('SegmentTree2 indexOf', () => {
  it('finds index of value', () => {
    const st = new SegmentTree2([10, 20, 30])
    expect(st.indexOf(20)).toBe(1)
    expect(st.indexOf(99)).toBe(-1)
  })

  it('indexOfRange', () => {
    const st = new SegmentTree2([10, 20, 30])
    expect(st.indexOfRange(1, 3, 30)).toBe(2)
  })
})

// ─── Clone / Clear / Build ───
describe('SegmentTree2 clone, clear, build', () => {
  it('clone produces independent copy', () => {
    const st = new SegmentTree2([1, 2, 3])
    const c = st.clone()
    c.update(0, 99)
    expect(st.get(0)).toBe(1)
  })

  it('clear empties tree', () => {
    const st = new SegmentTree2([1, 2])
    st.clear()
    expect(st.isEmpty).toBe(true)
  })

  it('build rebuilds tree', () => {
    const st = new SegmentTree2([1])
    st.build([10, 20, 30])
    expect(st.size).toBe(3)
    expect(st.sum()).toBe(60)
  })

  it('static fromArray', () => {
    const st = SegmentTree2.fromArray([1, 2, 3])
    expect(st.sum()).toBe(6)
  })
})

// ─── Iteration ───
describe('SegmentTree2 iteration', () => {
  it('forEach', () => {
    const st = new SegmentTree2([1, 2, 3])
    const vals: number[] = []
    st.forEach((v) => vals.push(v))
    expect(vals).toEqual([1, 2, 3])
  })

  it('Symbol.iterator', () => {
    const st = new SegmentTree2([1, 2])
    expect([...st]).toEqual([1, 2])
  })

  it('toArray', () => {
    const st = new SegmentTree2([1, 2, 3])
    expect(st.toArray()).toEqual([1, 2, 3])
  })
})

// ─── Custom Merge ───
describe('SegmentTree2 custom merge', () => {
  it('supports max operation', () => {
    const st = new SegmentTree2([1, 5, 3, 2], {
      merge: (a, b) => Math.max(a, b),
      identity: -Infinity,
    })
    expect(st.query(0, 4)).toBe(5)
    expect(st.query(1, 3)).toBe(5)
  })
})
