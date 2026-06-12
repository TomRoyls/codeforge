import { describe, expect, it } from 'vitest'
import { LazySegmentTree } from '../../src/utils/lazy-segment.js'

describe('LazySegmentTree', () => {
  it('updates and queries range', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    expect(st.queryRange(0, 4)).toBe(5)
  })

  it('handles single point update', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(2, 2, 10)
    expect(st.queryRange(2, 2)).toBe(10)
  })

  it('handles partial range update', () => {
    const st = new LazySegmentTree(10)
    st.updateRange(2, 5, 3)
    expect(st.queryRange(0, 10)).toBe(12)
    expect(st.queryRange(2, 5)).toBe(12)
    expect(st.queryRange(0, 1)).toBe(0)
  })

  it('handles multiple updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 2, 1)
    st.updateRange(2, 4, 2)
    expect(st.queryRange(0, 4)).toBe(9)
  })

  it('handles overlapping updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    st.updateRange(2, 4, 1)
    expect(st.queryRange(2, 4)).toBe(6)
  })

  it('getPoint and setPoint', () => {
    const st = new LazySegmentTree(5)
    st.setPoint(3, 7)
    expect(st.getPoint(3)).toBe(7)
  })

  it('handles empty range query', () => {
    const st = new LazySegmentTree(5)
    expect(st.queryRange(0, 0)).toBe(0)
  })

  it('handles single element', () => {
    const st = new LazySegmentTree(1)
    st.updateRange(0, 0, 5)
    expect(st.queryRange(0, 0)).toBe(5)
  })

  it('out of range query returns 0', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    expect(st.queryRange(5, 6)).toBe(0)
  })

  it('handles large number of updates', () => {
    const st = new LazySegmentTree(100)
    for (let i = 0; i < 100; i++) st.updateRange(i, i, 1)
    expect(st.queryRange(0, 99)).toBe(100)
  })

  it('handles range update then point queries', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(1, 3, 5)
    expect(st.getPoint(0)).toBe(0)
    expect(st.getPoint(1)).toBe(5)
    expect(st.getPoint(2)).toBe(5)
    expect(st.getPoint(3)).toBe(5)
    expect(st.getPoint(4)).toBe(0)
  })

  it('handles many overlapping updates', () => {
    const st = new LazySegmentTree(10)
    st.updateRange(0, 9, 1)
    st.updateRange(3, 7, 2)
    st.updateRange(5, 5, 3)
    expect(st.getPoint(5)).toBe(6)
    expect(st.queryRange(0, 9)).toBe(23)
  })

  it('handles single element tree', () => {
    const st = new LazySegmentTree(1)
    st.updateRange(0, 0, 7)
    expect(st.getPoint(0)).toBe(7)
    expect(st.queryRange(0, 0)).toBe(7)
  })

  it('handles zero update', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 10)
    st.updateRange(1, 3, 0)
    expect(st.getPoint(0)).toBe(10)
    expect(st.getPoint(2)).toBe(10)
  })

  it('handles full range update then query', () => {
    const st = new LazySegmentTree(4)
    st.updateRange(0, 3, 3)
    expect(st.queryRange(0, 3)).toBe(12)
    expect(st.getPoint(1)).toBe(3)
  })

  it('handles partial range update', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(1, 3, 5)
    expect(st.getPoint(0)).toBe(0)
    expect(st.getPoint(1)).toBe(5)
    expect(st.getPoint(3)).toBe(5)
    expect(st.getPoint(4)).toBe(0)
  })

  it('handles range update full range', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 3)
    expect(st.queryRange(0, 4)).toBe(15)
  })

  it('single element update and query', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(1, 1, 7)
    expect(st.queryRange(1, 1)).toBe(7)
  })

  it('update and query full range sums', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(0, 2, 5)
    expect(st.queryRange(0, 2)).toBe(15)
  })

  it('single element update', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(1, 1, 10)
    expect(st.queryRange(1, 1)).toBe(10)
  })

  it('query on unmodified tree returns 0', () => {
    const st = new LazySegmentTree(5)
    expect(st.queryRange(0, 4)).toBe(0)
  })

  it('update and query reflects change', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 2, 10)
    expect(st.queryRange(0, 2)).toBeGreaterThanOrEqual(10)
  })

  it('single update query returns value', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(0, 0, 5)
    expect(st.queryRange(0, 0)).toBeGreaterThanOrEqual(5)
  })

  it('queryRange on unchanged returns 0', () => {
    const st = new LazySegmentTree(5)
    expect(st.queryRange(0, 4)).toBe(0)
  })

  it('toString returns correct format', () => {
    const st = new LazySegmentTree(10)
    expect(st.toString()).toBe('LazySegmentTree(10)')
  })

  it('toString returns format with different size', () => {
    const st = new LazySegmentTree(100)
    expect(st.toString()).toBe('LazySegmentTree(100)')
  })

  it('toJSON returns array of current values', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 2)
    const json = st.toJSON() as number[]
    expect(json).toEqual([2, 2, 2, 2, 2])
  })

  it('toJSON returns zeros for unmodified tree', () => {
    const st = new LazySegmentTree(3)
    const json = st.toJSON() as number[]
    expect(json).toEqual([0, 0, 0])
  })

  it('toJSON handles partial updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(1, 3, 7)
    const json = st.toJSON() as number[]
    expect(json).toEqual([0, 7, 7, 7, 0])
  })

  it('clone creates independent copy', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 3)
    const copy = st.clone()
    expect(copy).not.toBe(st)
    expect(st.equals(copy)).toBe(true)
  })

  it('clone is independent of original', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 3)
    const copy = st.clone()
    st.updateRange(0, 0, 10)
    expect(copy.queryRange(0, 0)).toBe(3)
    expect(st.queryRange(0, 0)).toBe(13)
  })

  it('equals returns true for identical trees', () => {
    const st1 = new LazySegmentTree(5)
    const st2 = new LazySegmentTree(5)
    st1.updateRange(0, 4, 2)
    st2.updateRange(0, 4, 2)
    expect(st1.equals(st2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const st1 = new LazySegmentTree(5)
    const st2 = new LazySegmentTree(10)
    expect(st1.equals(st2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const st1 = new LazySegmentTree(5)
    const st2 = new LazySegmentTree(5)
    st1.updateRange(0, 4, 2)
    st2.updateRange(0, 4, 3)
    expect(st1.equals(st2)).toBe(false)
  })

  it('equals returns false for non-LazySegmentTree objects', () => {
    const st = new LazySegmentTree(5)
    expect(st.equals(null)).toBe(false)
    expect(st.equals(undefined)).toBe(false)
    expect(st.equals({})).toBe(false)
    expect(st.equals([])).toBe(false)
  })

  it('handles negative updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 10)
    st.updateRange(1, 3, -3)
    expect(st.getPoint(0)).toBe(10)
    expect(st.getPoint(1)).toBe(7)
    expect(st.getPoint(2)).toBe(7)
    expect(st.getPoint(3)).toBe(7)
    expect(st.getPoint(4)).toBe(10)
  })

  it('handles very large updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1e10)
    expect(st.queryRange(0, 4)).toBe(5e10)
  })

  it('handles min value updates', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(0, 2, -Infinity)
    expect(st.queryRange(0, 2)).toBe(-Infinity)
  })

  it('handles max value updates', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(0, 2, Infinity)
    expect(st.queryRange(0, 2)).toBe(Infinity)
  })

  it('constructor with custom combine function', () => {
    const st = new LazySegmentTree(5, (a, b) => Math.max(a, b))
    st.updateRange(0, 2, 5)
    st.updateRange(3, 4, 7)
    expect(st.queryRange(0, 4)).toBe(15)
  })

  it('constructor with min combine function', () => {
    const st = new LazySegmentTree(5, (a, b) => Math.min(a, b))
    st.updateRange(0, 2, 5)
    st.updateRange(3, 4, 7)
    expect(st.queryRange(0, 4)).toBe(14)
  })

  it('constructor with multiply combine function', () => {
    const st = new LazySegmentTree(3, (a, b) => a + b, (v, l, n) => v + l * n, (e, n) => e + n)
    st.updateRange(0, 0, 2)
    st.updateRange(1, 1, 3)
    st.updateRange(2, 2, 4)
    expect(st.queryRange(0, 2)).toBe(9)
  })

  it('handles size 2 tree', () => {
    const st = new LazySegmentTree(2)
    st.updateRange(0, 1, 5)
    expect(st.getPoint(0)).toBe(5)
    expect(st.getPoint(1)).toBe(5)
  })

  it('handles size 1000 tree', () => {
    const st = new LazySegmentTree(1000)
    st.updateRange(0, 999, 1)
    expect(st.queryRange(0, 999)).toBe(1000)
  })

  it('handles alternating updates', () => {
    const st = new LazySegmentTree(10)
    for (let i = 0; i < 10; i++) {
      st.updateRange(i, i, i + 1)
    }
    let sum = 0
    for (let i = 0; i < 10; i++) {
      sum += st.getPoint(i)
    }
    expect(sum).toBe(55)
  })

  it('handles reverse order updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(4, 4, 1)
    st.updateRange(3, 3, 2)
    st.updateRange(2, 2, 3)
    st.updateRange(1, 1, 4)
    st.updateRange(0, 0, 5)
    expect(st.queryRange(0, 4)).toBe(15)
  })

  it('clone equals after multiple updates', () => {
    const st1 = new LazySegmentTree(10)
    st1.updateRange(0, 4, 1)
    st1.updateRange(5, 9, 2)
    st1.updateRange(2, 7, 3)
    const st2 = st1.clone()
    expect(st1.equals(st2)).toBe(true)
  })

  it('toJSON after complex updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    st.updateRange(1, 3, 2)
    st.updateRange(2, 2, 5)
    const json = st.toJSON() as number[]
    expect(json).toEqual([1, 3, 8, 3, 1])
  })

  it('query with invalid range returns 0', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    expect(st.queryRange(10, 15)).toBe(0)
  })

  it('handles very small negative values', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, -0.1)
    const result = st.queryRange(0, 4)
    expect(result).toBeCloseTo(-0.5, 5)
  })

  it('handles decimal updates', () => {
    const st = new LazySegmentTree(4)
    st.updateRange(0, 3, 2.5)
    const result = st.queryRange(0, 3)
    expect(result).toBeCloseTo(10, 5)
  })

  it('getPoint after multiple range updates', () => {
    const st = new LazySegmentTree(10)
    st.updateRange(0, 4, 3)
    st.updateRange(5, 9, 5)
    st.updateRange(2, 7, 2)
    expect(st.getPoint(1)).toBe(3)
    expect(st.getPoint(4)).toBe(5)
    expect(st.getPoint(5)).toBe(7)
    expect(st.getPoint(6)).toBe(7)
    expect(st.getPoint(8)).toBe(5)
  })

  it('queryRange returns sum', () => {
    const st = new LazySegmentTree(5)
    st.setPoint(0, 1)
    st.setPoint(1, 2)
    st.setPoint(2, 3)
    st.setPoint(3, 4)
    st.setPoint(4, 5)
    expect(st.queryRange(0, 4)).toBe(15)
  })

  it('setPoint changes value', () => {
    const st = new LazySegmentTree(3)
    st.setPoint(1, 10)
    expect(st.getPoint(1)).toBe(10)
  })

  it('updateRange adds to range', () => {
    const st = new LazySegmentTree(4)
    st.setPoint(0, 1)
    st.setPoint(1, 1)
    st.setPoint(2, 1)
    st.setPoint(3, 1)
    st.updateRange(0, 3, 5)
    expect(st.getPoint(0)).toBe(6)
  })

  it('queryRange returns identity', () => {
    const lst = new LazySegmentTree(5, (a, b) => a + b, (v, l, n) => v + l * n, (e, n) => e + n)
    expect(lst.queryRange(0, 4)).toBe(0)
  })

  it('updateRange changes value', () => {
    const lst = new LazySegmentTree(5, (a, b) => a + b, (v, l, n) => v + l * n, (e, n) => e + n)
    lst.updateRange(0, 2, 1)
    expect(lst.queryRange(0, 2)).toBe(3)
  })

  it('setPoint works', () => {
    const lst = new LazySegmentTree(5, (a, b) => a + b, (v, l, n) => v + l * n, (e, n) => e + n)
    lst.setPoint(0, 5)
    expect(lst.getPoint(0)).toBe(5)
  })
})
