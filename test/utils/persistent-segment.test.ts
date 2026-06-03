import { describe, expect, it } from 'vitest'
import { PersistentSegmentTree } from '../../src/utils/persistent-segment.js'

describe('PersistentSegmentTree', () => {
  it('creates with default values', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.versionCount).toBe(1)
    expect(pst.query(0, 0, 4)).toBe(0)
  })

  it('updates create new versions', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 10)
    expect(v1).toBe(1)
    expect(pst.versionCount).toBe(2)
  })

  it('old version is unchanged after update', () => {
    const pst = new PersistentSegmentTree(5)
    pst.update(0, 2, 10)
    expect(pst.query(0, 2, 2)).toBe(0)
    expect(pst.query(1, 2, 2)).toBe(10)
  })

  it('range query works', () => {
    const pst = new PersistentSegmentTree(5)
    let v = 0
    v = pst.update(v, 0, 1)
    v = pst.update(v, 1, 2)
    v = pst.update(v, 2, 3)
    expect(pst.query(v, 0, 2)).toBe(6)
    expect(pst.query(v, 0, 4)).toBe(6)
  })

  it('handles single element', () => {
    const pst = new PersistentSegmentTree(1)
    expect(pst.query(0, 0, 0)).toBe(0)
    pst.update(0, 0, 42)
    expect(pst.query(1, 0, 0)).toBe(42)
  })

  it('getPoint returns single value', () => {
    const pst = new PersistentSegmentTree(5)
    const v = pst.update(0, 3, 7)
    expect(pst.getPoint(v, 3)).toBe(7)
    expect(pst.getPoint(v, 0)).toBe(0)
  })

  it('supports multiple branches', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 0, 10)
    const v2 = pst.update(0, 0, 20)
    expect(pst.getPoint(v1, 0)).toBe(10)
    expect(pst.getPoint(v2, 0)).toBe(20)
    expect(pst.getPoint(0, 0)).toBe(0)
  })

  it('works with max combine', () => {
    const pst = new PersistentSegmentTree(5, Math.max, -Infinity)
    let v = 0
    v = pst.update(v, 1, 5)
    v = pst.update(v, 2, 3)
    v = pst.update(v, 3, 8)
    expect(pst.query(v, 0, 4)).toBe(8)
    expect(pst.query(v, 1, 2)).toBe(5)
  })

  it('handles sequential updates', () => {
    const pst = new PersistentSegmentTree(3)
    let v = 0
    v = pst.update(v, 0, 1)
    v = pst.update(v, 1, 2)
    v = pst.update(v, 2, 3)
    expect(pst.query(v, 0, 2)).toBe(6)
    expect(pst.versionCount).toBe(4)
  })

  it('out of range query returns default', () => {
    const pst = new PersistentSegmentTree(3)
    expect(pst.query(0, 5, 10)).toBe(0)
  })

  it('additive updates replace value', () => {
    const pst = new PersistentSegmentTree(4)
    let v = 0
    v = pst.update(v, 1, 5)
    v = pst.update(v, 1, 3)
    expect(pst.getPoint(v, 1)).toBe(3)
    expect(pst.query(v, 0, 3)).toBe(3)
  })

  it('preserves multiple version branches', () => {
    const pst = new PersistentSegmentTree(4)
    const v1 = pst.update(0, 0, 10)
    const v2 = pst.update(v1, 1, 20)
    const v3 = pst.update(v1, 2, 30)
    expect(pst.query(v2, 0, 1)).toBe(30)
    expect(pst.query(v3, 0, 2)).toBe(40)
    expect(pst.getPoint(v1, 0)).toBe(10)
  })

  it('single element tree', () => {
    const pst = new PersistentSegmentTree(1)
    const v1 = pst.update(0, 0, 42)
    expect(pst.getPoint(v1, 0)).toBe(42)
    expect(pst.query(v1, 0, 0)).toBe(42)
  })

  it('handles query on initial version', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.query(0, 0, 4)).toBe(0)
  })

  it('updates preserve all versions independently', () => {
    const pst = new PersistentSegmentTree(4)
    const v1 = pst.update(0, 0, 5)
    const v2 = pst.update(v1, 1, 10)
    expect(pst.getPoint(v1, 1)).toBe(0)
    expect(pst.getPoint(v2, 0)).toBe(5)
    expect(pst.getPoint(v2, 1)).toBe(10)
  })

  it('handles full range query', () => {
    const pst = new PersistentSegmentTree(4)
    const v1 = pst.update(0, 0, 1)
    const v2 = pst.update(v1, 1, 2)
    const v3 = pst.update(v2, 2, 3)
    const v4 = pst.update(v3, 3, 4)
    expect(pst.query(v4, 0, 3)).toBe(10)
  })

  it('handles point update on small tree', () => {
    const pst = new PersistentSegmentTree(4)
    expect(pst.query(0, 0, 0)).toBe(0)
    pst.update(0, 0, 5)
    expect(pst.query(1, 0, 0)).toBe(5)
  })

  it('versions are independent', () => {
    const pst = new PersistentSegmentTree(1)
    const v0 = pst.update(0, 0, 2)
    const v1 = pst.update(v0, 0, 3)
    expect(pst.query(v0, 0, 0)).toBe(2)
    expect(pst.query(v1, 0, 0)).toBe(3)
  })

  it('version count starts at 1', () => {
    const pst = new PersistentSegmentTree(8)
    expect(pst.versionCount).toBe(1)
  })

  it('initial values are zero', () => {
    const pst = new PersistentSegmentTree(4)
    expect(pst.query(0, 0, 3)).toBe(0)
  })

  it('update changes value at index', () => {
    const pst = new PersistentSegmentTree(4)
    const v = pst.update(0, 2, 10)
    expect(pst.query(v, 2, 2)).toBe(10)
  })
})
